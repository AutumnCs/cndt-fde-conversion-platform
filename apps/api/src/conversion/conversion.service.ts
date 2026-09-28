import type { LeadLevel } from '@cndt/contracts'

import { type RequestActor, canAssignLead } from '../common/auth/lead-access-policy.js'
import { type AuditService } from '../common/audit/audit.service.js'

export type ConversionLead = {
  id: string
  level: LeadLevel
  reviewReason: string | null
  reviewedById: string | null
  specialistId: string | null
}

export type TransferTicket = {
  id: string
  leadId: string
  managerId: string
  specialistId: string
  status: 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'CANCELLED'
  acceptedAt: Date | null
}

export type FollowUpInput = {
  customerFeedback: string
  nextAction: string
}

export type FollowUpRecord = FollowUpInput & {
  id: string
  leadId: string
  authorId: string
}

export interface ConversionRepository {
  findLead(leadId: string): Promise<ConversionLead | null>
  confirmLead(input: { leadId: string; level: LeadLevel; reason: string; managerId: string; specialistId: string }): Promise<ConversionLead>
  createTicket(input: { leadId: string; managerId: string; specialistId: string }): Promise<TransferTicket>
  findTicket(ticketId: string): Promise<TransferTicket | null>
  acceptTicket(ticketId: string): Promise<TransferTicket>
  createFollowUp(input: FollowUpInput & { leadId: string; authorId: string }): Promise<FollowUpRecord>
}

export class ConversionService {
  constructor(
    private readonly repository: ConversionRepository,
    private readonly audit: AuditService,
  ) {}

  async confirmAndTransfer(
    actor: RequestActor,
    leadId: string,
    level: LeadLevel,
    specialistId: string,
    reason: string,
  ): Promise<TransferTicket> {
    if (!canAssignLead(actor)) throw new Error('forbidden')
    const lead = await this.repository.findLead(leadId)
    if (!lead) throw new Error('lead_not_found')

    const confirmed = await this.repository.confirmLead({ leadId, level, reason, managerId: actor.id, specialistId })
    const ticket = await this.repository.createTicket({ leadId, managerId: actor.id, specialistId })
    await this.audit.record({
      actorId: actor.id,
      action: 'lead.confirmed_and_transferred',
      targetType: 'Lead',
      targetId: leadId,
      before: { level: lead.level, reviewReason: lead.reviewReason },
      after: { level: confirmed.level, reviewReason: reason, specialistId },
    })
    return ticket
  }

  async acceptTransfer(actor: RequestActor, ticketId: string): Promise<TransferTicket> {
    const ticket = await this.repository.findTicket(ticketId)
    if (!ticket) throw new Error('ticket_not_found')
    if (actor.role !== 'SPECIALIST' || ticket.specialistId !== actor.id) throw new Error('forbidden')
    if (ticket.status !== 'PENDING_ACCEPTANCE') throw new Error('invalid_transfer_status')

    const accepted = await this.repository.acceptTicket(ticketId)
    await this.audit.record({
      actorId: actor.id,
      action: 'transfer.accepted',
      targetType: 'TransferTicket',
      targetId: ticketId,
      before: { status: ticket.status },
      after: { status: accepted.status },
    })
    return accepted
  }

  async recordFollowUp(actor: RequestActor, leadId: string, input: FollowUpInput): Promise<FollowUpRecord> {
    const lead = await this.repository.findLead(leadId)
    if (!lead) throw new Error('lead_not_found')
    if (actor.role !== 'SPECIALIST' || lead.specialistId !== actor.id) throw new Error('forbidden')

    const record = await this.repository.createFollowUp({ ...input, leadId, authorId: actor.id })
    await this.audit.record({
      actorId: actor.id,
      action: 'follow_up.recorded',
      targetType: 'Lead',
      targetId: leadId,
      before: null,
      after: { customerFeedback: record.customerFeedback, nextAction: record.nextAction },
    })
    return record
  }
}
