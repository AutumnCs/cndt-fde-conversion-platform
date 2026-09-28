import { afterAll, describe, expect, it } from 'vitest'

import { AuditService } from '../src/common/audit/audit.service.js'
import { PrismaAuditEventStore } from '../src/common/audit/prisma-audit-event.store.js'
import { PrismaClient } from '../src/generated/prisma/client.js'

const prisma = new PrismaClient()

afterAll(async () => {
  await prisma.$disconnect()
})

describe('PrismaAuditEventStore', () => {
  it('persists an event and the database rejects a later mutation', async () => {
    const manager = await prisma.internalUser.create({
      data: {
        email: `manager-${crypto.randomUUID()}@test.invalid`,
        displayName: 'Test Manager',
        role: 'MANAGER',
      },
    })
    const service = new AuditService(new PrismaAuditEventStore(prisma))

    const event = await service.record({
      actorId: manager.id,
      action: 'lead.level_changed',
      targetType: 'Lead',
      targetId: 'lead-1',
      before: { level: 'C' },
      after: { level: 'A' },
    })

    await expect(prisma.auditEvent.findUniqueOrThrow({ where: { id: event.id } }))
      .resolves.toMatchObject({ action: 'lead.level_changed', before: { level: 'C' }, after: { level: 'A' } })
    await expect(prisma.auditEvent.update({ where: { id: event.id }, data: { action: 'changed' } }))
      .rejects.toThrow('AuditEvent rows are append-only')
  })
})
