import { describe, expect, it } from 'vitest'

import { AuditService, type AuditEventStore } from '../src/common/audit/audit.service.js'

describe('AuditService', () => {
  it('stores actor, before and after snapshots for a lead change', async () => {
    const stored: unknown[] = []
    const store: AuditEventStore = {
      append: async (event) => {
        stored.push(event)
        return event
      },
    }
    const service = new AuditService(store)

    const event = await service.record({
      actorId: 'manager-1',
      action: 'lead.level_changed',
      targetType: 'Lead',
      targetId: 'lead-1',
      before: { level: 'C' },
      after: { level: 'A' },
    })

    expect(event).toMatchObject({
      action: 'lead.level_changed',
      targetId: 'lead-1',
    })
    expect(stored).toEqual([event])
  })
})
