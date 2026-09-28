import { Prisma, type PrismaClient } from '../../generated/prisma/client.js'

import type { AuditEventStore, RecordedAuditEvent } from './audit.service.js'

export class PrismaAuditEventStore implements AuditEventStore {
  constructor(private readonly prisma: Pick<PrismaClient, 'auditEvent'>) {}

  async append(event: RecordedAuditEvent): Promise<RecordedAuditEvent> {
    await this.prisma.auditEvent.create({
      data: {
        id: event.id,
        actorId: event.actorId,
        action: event.action,
        targetType: event.targetType,
        targetId: event.targetId,
        before: event.before === null ? Prisma.JsonNull : event.before as Prisma.InputJsonValue,
        after: event.after === null ? Prisma.JsonNull : event.after as Prisma.InputJsonValue,
        occurredAt: event.occurredAt,
      },
    })

    return event
  }
}
