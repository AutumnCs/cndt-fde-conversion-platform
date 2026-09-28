import { describe, expect, it } from 'vitest'

import { AuditService, type AuditEventStore, type RecordedAuditEvent } from '../src/common/audit/audit.service.js'
import { ConversionService, type ConversionRepository } from '../src/conversion/conversion.service.js'

const manager = { id: 'manager-1', role: 'MANAGER' as const }
const specialist = { id: 'specialist-1', role: 'SPECIALIST' as const }
const anotherSpecialist = { id: 'specialist-2', role: 'SPECIALIST' as const }

type RepositoryState = { lead: { id: string; level: 'A' | 'B' | 'C' | 'RISK' | 'INVALID'; reviewReason: string | null; reviewedById: string | null; specialistId: string | null }; ticket: { id: string; leadId: string; managerId: string; specialistId: string; status: 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'CANCELLED'; acceptedAt: Date | null } | null; followUps: Array<{ id: string; leadId: string; authorId: string; customerFeedback: string; nextAction: string }> }

function createRepository(): ConversionRepository & { state: RepositoryState } {
  const state: RepositoryState = {
    lead: { id: 'lead-1', level: 'C', reviewReason: null, reviewedById: null, specialistId: null },
    ticket: null as { id: string; leadId: string; managerId: string; specialistId: string; status: 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'CANCELLED'; acceptedAt: Date | null } | null,
    followUps: [] as Array<{ id: string; leadId: string; authorId: string; customerFeedback: string; nextAction: string }>,
  }
  return {
    state,
    findLead: async (id) => id === state.lead.id ? state.lead : null,
    confirmLead: async (input) => { state.lead = { ...state.lead, level: input.level, reviewReason: input.reason, reviewedById: input.managerId, specialistId: input.specialistId }; return state.lead },
    createTicket: async (input) => { state.ticket = { id: 'ticket-1', ...input, status: 'PENDING_ACCEPTANCE', acceptedAt: null }; return state.ticket },
    findTicket: async (id) => id === state.ticket?.id ? state.ticket : null,
    acceptTicket: async (id) => { if (!state.ticket || state.ticket.id !== id) throw new Error('ticket_not_found'); state.ticket = { ...state.ticket, status: 'ACCEPTED', acceptedAt: new Date() }; return state.ticket },
    createFollowUp: async (input) => { const record = { id: `follow-${state.followUps.length + 1}`, ...input }; state.followUps.push(record); return record },
  }
}

function createAudit() {
  const events: RecordedAuditEvent[] = []
  const store: AuditEventStore = { append: async (event) => { events.push(event); return event } }
  return { events, audit: new AuditService(store) }
}

describe('ConversionService', () => {
  it('rejects confirmation from a specialist', async () => {
    const service = new ConversionService(createRepository(), createAudit().audit)
    await expect(service.confirmAndTransfer(specialist, 'lead-1', 'A', specialist.id, '确认高意向')).rejects.toThrow('forbidden')
  })

  it('confirms a lead, creates a pending ticket, and writes one audit event', async () => {
    const repository = createRepository()
    const { audit, events } = createAudit()
    const service = new ConversionService(repository, audit)

    const ticket = await service.confirmAndTransfer(manager, 'lead-1', 'A', specialist.id, '确认高意向')

    expect(ticket.status).toBe('PENDING_ACCEPTANCE')
    expect(repository.state.lead).toMatchObject({ level: 'A', reviewedById: manager.id, specialistId: specialist.id })
    expect(events).toMatchObject([{ action: 'lead.confirmed_and_transferred', targetId: 'lead-1' }])
  })

  it('only assigned specialist accepts and records a follow-up', async () => {
    const repository = createRepository()
    const { audit, events } = createAudit()
    const service = new ConversionService(repository, audit)
    await service.confirmAndTransfer(manager, 'lead-1', 'A', specialist.id, '确认高意向')

    await expect(service.acceptTransfer(anotherSpecialist, 'ticket-1')).rejects.toThrow('forbidden')
    await service.acceptTransfer(specialist, 'ticket-1')
    const followUp = await service.recordFollowUp(specialist, 'lead-1', { customerFeedback: '希望进一步了解', nextAction: '安排线上沟通' })

    expect(followUp.nextAction).toBe('安排线上沟通')
    expect(events.map((event) => event.action)).toEqual(['lead.confirmed_and_transferred', 'transfer.accepted', 'follow_up.recorded'])
  })
})
