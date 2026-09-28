import { afterAll, describe, expect, it } from 'vitest'

import { PrismaClient } from '../src/generated/prisma/client.js'

const prisma = new PrismaClient()

afterAll(async () => {
  await prisma.$disconnect()
})

describe('conversion domain models', () => {
  it('persists a pending transfer ticket and a follow-up next action', async () => {
    const manager = await prisma.internalUser.create({
      data: { email: `manager-${crypto.randomUUID()}@test.invalid`, displayName: '经理', role: 'MANAGER' },
    })
    const specialist = await prisma.internalUser.create({
      data: { email: `specialist-${crypto.randomUUID()}@test.invalid`, displayName: '专员', role: 'SPECIALIST' },
    })
    const customer = await prisma.customer.create({ data: {} })
    const conversation = await prisma.conversation.create({
      data: { channel: 'telegram', externalChatId: crypto.randomUUID(), customerId: customer.id },
    })
    const lead = await prisma.lead.create({ data: { customerId: customer.id, conversationId: conversation.id } })

    const ticket = await prisma.transferTicket.create({
      data: { leadId: lead.id, managerId: manager.id, specialistId: specialist.id },
    })
    const followUp = await prisma.followUpRecord.create({
      data: { leadId: lead.id, authorId: specialist.id, customerFeedback: '需要进一步了解服务范围', nextAction: '安排线上沟通' },
    })

    expect(ticket.status).toBe('PENDING_ACCEPTANCE')
    expect(followUp.nextAction).toBe('安排线上沟通')
  })
})
