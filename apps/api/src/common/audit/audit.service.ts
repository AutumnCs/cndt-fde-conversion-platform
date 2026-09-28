export type AuditValue = string | number | boolean | null | AuditValue[] | { [key: string]: AuditValue }

export type AuditSnapshot = { [key: string]: AuditValue }

export type AuditInput = {
  actorId: string
  action: string
  targetType: string
  targetId: string
  before: AuditSnapshot | null
  after: AuditSnapshot | null
}

export type RecordedAuditEvent = AuditInput & {
  id: string
  occurredAt: Date
}

export interface AuditEventStore {
  append(event: RecordedAuditEvent): Promise<RecordedAuditEvent>
}

export class AuditService {
  constructor(private readonly store: AuditEventStore) {}

  record(input: AuditInput): Promise<RecordedAuditEvent> {
    return this.store.append({
      ...input,
      id: crypto.randomUUID(),
      occurredAt: new Date(),
    })
  }
}
