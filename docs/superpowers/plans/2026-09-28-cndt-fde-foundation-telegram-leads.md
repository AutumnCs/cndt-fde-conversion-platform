# CNDT FDE Foundation and Telegram Lead Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first internally usable CNDT FDE slice: Telegram inbound messages become auditable consumer leads that a manager can review and assign to a specialist.

**Architecture:** Create a TypeScript modular monolith with a REST API, a Telegram webhook adapter, and an internal web console. PostgreSQL owns transactional business state and the audit ledger; Redis only handles rate limits and short-lived background jobs. The first vertical slice contains no AI, media processing, payment, hardware, blockchain, or external publishing integration.

**Tech Stack:** Node.js 22 LTS, TypeScript, NestJS with Fastify, PostgreSQL 16 with Prisma, Redis 7, BullMQ, Next.js, React, Vitest, Playwright, Docker Compose, Telegram Bot API with Telegraf.

## Global Constraints

- Keep the repository as a pnpm workspace; Node.js 22 LTS is the only supported runtime.
- PostgreSQL is the source of truth for Customer, Conversation, Message, Lead, Assignment and AuditEvent; no third-party service owns these records.
- Persist every Telegram update before dispatching it and enforce a unique `telegram_update_id`.
- Treat Telegram user ID as the initial identity; do not collect or merge external contact data without user consent.
- Roles are `COMPLIANCE`, `MANAGER`, `SPECIALIST`, `ADVISOR`, `ADMIN`; P1 ships only internal users.
- A manager, not automation, makes the final lead level and assignment decision.
- Never initiate a Telegram private chat with an unknown user, auto-add a user to a group, store Bot tokens in Git, or implement bulk messaging.
- All security-sensitive state changes write immutable AuditEvent rows with actor, action, target, before data, after data and timestamp.
- Write tests before production code for every task; use a dedicated test PostgreSQL database and Redis namespace.

## File Structure

```text
pnpm-workspace.yaml
package.json
docker-compose.yml
.env.example
apps/
  api/
    src/main.ts
    src/app.module.ts
    src/common/auth/
    src/common/audit/
    src/common/database/
    src/common/queue/
    src/identity/
    src/conversations/
    src/leads/
    src/telegram/
    test/
  web/
    app/login/page.tsx
    app/leads/page.tsx
    app/leads/[leadId]/page.tsx
    lib/api-client.ts
packages/
  contracts/src/index.ts
  config/src/env.ts
prisma/schema.prisma
prisma/migrations/
docs/runbooks/telegram-pilot.md
```

### Task 1: Bootstrap the workspace and runtime boundaries

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `.env.example`, `docker-compose.yml`
- Create: `packages/config/src/env.ts`, `packages/contracts/src/index.ts`
- Create: `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/test/env.spec.ts`

**Interfaces:**
- Produces `loadEnv(): AppEnv`, which returns validated `DATABASE_URL`, `REDIS_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `INTERNAL_JWT_SECRET` and `OBJECT_STORAGE_ENDPOINT`.
- Produces `LeadLevel = 'A' | 'B' | 'C' | 'RISK' | 'INVALID'` and `UserRole` union for all later tasks.

- [ ] **Step 1: Write the failing environment test**

```ts
it('rejects a missing Telegram webhook secret', () => {
  expect(() => loadEnv({ ...validEnv, TELEGRAM_WEBHOOK_SECRET: undefined }))
    .toThrow('TELEGRAM_WEBHOOK_SECRET is required')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @cndt/api test env.spec.ts`

Expected: FAIL because `loadEnv` does not exist.

- [ ] **Step 3: Implement the minimum workspace and environment loader**

```ts
export function loadEnv(input: NodeJS.ProcessEnv): AppEnv {
  for (const key of requiredKeys) if (!input[key]) throw new Error(`${key} is required`)
  return { databaseUrl: input.DATABASE_URL!, redisUrl: input.REDIS_URL!, telegramBotToken: input.TELEGRAM_BOT_TOKEN!, telegramWebhookSecret: input.TELEGRAM_WEBHOOK_SECRET!, internalJwtSecret: input.INTERNAL_JWT_SECRET!, objectStorageEndpoint: input.OBJECT_STORAGE_ENDPOINT! }
}
```

- [ ] **Step 4: Run the workspace checks**

Run: `pnpm install --frozen-lockfile=false && pnpm --filter @cndt/api test env.spec.ts && pnpm lint`

Expected: PASS with a validated local `.env` template and no secrets committed.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml docker-compose.yml .env.example packages apps/api
git commit -m "chore: bootstrap cndt fde workspace"
```

### Task 2: Create the transactional domain schema and audit ledger

**Files:**
- Create: `prisma/schema.prisma`, `prisma/migrations/202609280001_foundation/migration.sql`
- Create: `apps/api/src/common/database/prisma.service.ts`
- Create: `apps/api/src/common/audit/audit.service.ts`, `apps/api/test/audit.service.spec.ts`

**Interfaces:**
- Consumes `LeadLevel` and `UserRole` from `@cndt/contracts`.
- Produces `AuditService.record(input: AuditInput): Promise<void>`.
- Produces Prisma models `InternalUser`, `Customer`, `ExternalIdentity`, `Conversation`, `Message`, `Lead`, `LeadAssignment`, `AuditEvent`, and `ProcessedTelegramUpdate`.

- [ ] **Step 1: Write the failing audit persistence test**

```ts
it('stores actor, before and after snapshots for a lead change', async () => {
  await audit.record({ actorId: manager.id, action: 'lead.level_changed', targetType: 'Lead', targetId: lead.id, before: { level: 'C' }, after: { level: 'A' } })
  await expect(prisma.auditEvent.findFirstOrThrow()).resolves.toMatchObject({ action: 'lead.level_changed', targetId: lead.id })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @cndt/api test audit.service.spec.ts`

Expected: FAIL because the schema and `AuditService` do not exist.

- [ ] **Step 3: Implement the schema and append-only audit service**

```ts
async record(input: AuditInput): Promise<void> {
  await this.prisma.auditEvent.create({ data: { ...input, before: input.before, after: input.after } })
}
```

Add a database trigger or restricted database role that denies `UPDATE` and `DELETE` against `AuditEvent` to the application user.

- [ ] **Step 4: Run migration and tests**

Run: `pnpm prisma migrate deploy && pnpm --filter @cndt/api test audit.service.spec.ts`

Expected: PASS; attempts to edit an AuditEvent fail at the database boundary.

- [ ] **Step 5: Commit**

```bash
git add prisma apps/api/src/common apps/api/test/audit.service.spec.ts
git commit -m "feat: add FDE domain schema and audit ledger"
```

### Task 3: Add internal authentication and role checks

**Files:**
- Create: `apps/api/src/common/auth/auth.module.ts`, `jwt-auth.guard.ts`, `roles.guard.ts`, `roles.decorator.ts`
- Create: `apps/api/src/internal-users/internal-users.controller.ts`
- Create: `apps/api/test/roles.guard.spec.ts`
- Create: `apps/web/app/login/page.tsx`, `apps/web/lib/api-client.ts`

**Interfaces:**
- Consumes `InternalUser.role`.
- Produces `@Roles(...roles: UserRole[])` and `RequestActor { id: string; role: UserRole }`.
- Produces `POST /auth/login` for internal pilot accounts and `GET /internal-users/me`.

- [ ] **Step 1: Write the failing role test**

```ts
it('rejects a specialist calling a manager-only assignment endpoint', async () => {
  await request(app).post(`/leads/${lead.id}/assign`).set(authFor('SPECIALIST')).send({ specialistId: anotherSpecialist.id }).expect(403)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @cndt/api test roles.guard.spec.ts`

Expected: FAIL because the endpoint and guards do not exist.

- [ ] **Step 3: Implement internal authentication and role guards**

```ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles)

canActivate(context: ExecutionContext): boolean {
  const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [context.getHandler(), context.getClass()]) ?? []
  return roles.includes(context.switchToHttp().getRequest<Request & { actor: RequestActor }>().actor.role)
}
```

- [ ] **Step 4: Run API and browser checks**

Run: `pnpm --filter @cndt/api test roles.guard.spec.ts && pnpm --filter @cndt/web test`

Expected: PASS; Manager and Admin can access manager actions, while Specialist, Advisor and Compliance users cannot.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/common/auth apps/api/src/internal-users apps/api/test/roles.guard.spec.ts apps/web
git commit -m "feat: add internal roles and access controls"
```

### Task 4: Implement idempotent Telegram inbound ingestion

**Files:**
- Create: `apps/api/src/telegram/telegram.module.ts`, `telegram.controller.ts`, `telegram.service.ts`, `telegram-update.mapper.ts`
- Create: `apps/api/test/telegram-webhook.spec.ts`
- Create: `docs/runbooks/telegram-pilot.md`

**Interfaces:**
- Consumes `POST /channels/telegram/webhook` with header `x-telegram-bot-api-secret-token`.
- Produces `TelegramService.ingest(update: TelegramUpdate): Promise<{ duplicate: boolean; conversationId?: string }>`.
- Produces a `ProcessedTelegramUpdate` row before mapping messages to conversations.

- [ ] **Step 1: Write the failing webhook test**

```ts
it('accepts a valid update once and ignores a retry with the same update_id', async () => {
  await postTelegramUpdate(sampleUpdate).expect(202)
  await postTelegramUpdate(sampleUpdate).expect(202)
  await expect(prisma.message.count()).resolves.toBe(1)
  await expect(prisma.processedTelegramUpdate.count()).resolves.toBe(1)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm --filter @cndt/api test telegram-webhook.spec.ts`

Expected: FAIL because the webhook route does not exist.

- [ ] **Step 3: Implement secret validation, update deduplication and message persistence**

```ts
if (secret !== this.env.telegramWebhookSecret) throw new UnauthorizedException()
const inserted = await this.prisma.processedTelegramUpdate.createMany({ data: { telegramUpdateId: update.update_id }, skipDuplicates: true })
if (inserted.count === 0) return { duplicate: true }
return this.mapAndPersistMessage(update)
```

Reject unsupported update types with a 202 response and an audit event; never send a reply in this task.

- [ ] **Step 4: Run webhook and migration tests**

Run: `pnpm --filter @cndt/api test telegram-webhook.spec.ts && pnpm --filter @cndt/api test`

Expected: PASS; bad secrets return 401, retried updates produce one message, and unsupported events do not crash the webhook.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/telegram apps/api/test/telegram-webhook.spec.ts docs/runbooks/telegram-pilot.md
git commit -m "feat: ingest Telegram updates idempotently"
```

### Task 5: Build customer, conversation and lead creation

**Files:**
- Create: `apps/api/src/identity/identity.service.ts`, `apps/api/src/conversations/conversations.service.ts`
- Create: `apps/api/src/leads/leads.service.ts`, `leads.controller.ts`, `lead.dto.ts`
- Create: `apps/api/test/lead-creation.spec.ts`

**Interfaces:**
- Consumes persisted Telegram messages.
- Produces `LeadsService.createFromConversation(conversationId: string): Promise<Lead>`.
- Produces `GET /leads`, `GET /leads/:leadId`, `POST /leads/:leadId/notes`.

- [ ] **Step 1: Write the failing identity and lead tests**

```ts
it('reuses a customer and conversation for later messages from the same Telegram user', async () => {
  await ingest(updateFrom(8877, 'hello'))
  await ingest(updateFrom(8877, 'tell me more'))
  await expect(prisma.customer.count()).resolves.toBe(1)
  await expect(prisma.conversation.count()).resolves.toBe(1)
})

it('creates one unassigned C lead for a new consumer conversation', async () => {
  const lead = await leads.createFromConversation(conversation.id)
  expect(lead).toMatchObject({ level: 'C', assignment: null })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @cndt/api test lead-creation.spec.ts`

Expected: FAIL because identity and lead services do not exist.

- [ ] **Step 3: Implement Telegram identity resolution and conservative lead creation**

```ts
const identity = await prisma.externalIdentity.upsert({ where: { provider_providerUserId: { provider: 'TELEGRAM', providerUserId } }, create: { provider: 'TELEGRAM', providerUserId, customer: { create: {} } }, update: {} })
return prisma.lead.upsert({ where: { conversationId }, create: { conversationId, customerId: identity.customerId, level: 'C' }, update: {} })
```

Record `lead.created` and `lead.note_added` audit events. Do not infer a customer’s country, budget, or purchase intent in P1.

- [ ] **Step 4: Run the focused tests**

Run: `pnpm --filter @cndt/api test lead-creation.spec.ts`

Expected: PASS; customer identity is stable and new leads start as unassigned C.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/identity apps/api/src/conversations apps/api/src/leads apps/api/test/lead-creation.spec.ts
git commit -m "feat: create consumer leads from Telegram conversations"
```

### Task 6: Implement manager review, assignment and specialist workflow

**Files:**
- Modify: `apps/api/src/leads/leads.service.ts`, `leads.controller.ts`
- Create: `apps/api/src/leads/lead-assignment.service.ts`, `lead-assignment.dto.ts`
- Create: `apps/api/test/lead-assignment.spec.ts`
- Create: `apps/web/app/leads/page.tsx`, `apps/web/app/leads/[leadId]/page.tsx`

**Interfaces:**
- Consumes `PATCH /leads/:leadId/review { level: LeadLevel; reason: string }` from MANAGER or ADMIN.
- Consumes `POST /leads/:leadId/assign { specialistId: string }` from MANAGER or ADMIN.
- Produces `LeadAssignment` and `GET /leads?assignee=me`.

- [ ] **Step 1: Write the failing review and assignment tests**

```ts
it('lets a manager move a C lead to A and records the reason', async () => {
  await reviewAsManager(lead.id, { level: 'A', reason: 'Asked where to buy and requested a call' }).expect(200)
  await expect(prisma.auditEvent.findFirstOrThrow({ where: { action: 'lead.level_changed' } })).resolves.toMatchObject({ actorId: manager.id })
})

it('shows an assigned lead to its specialist but hides it from another specialist', async () => {
  await assignAsManager(lead.id, specialist.id).expect(201)
  await listAs(specialist).expect(200).expect(bodyContaining(lead.id))
  await listAs(otherSpecialist).expect(200).expect(bodyNotContaining(lead.id))
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @cndt/api test lead-assignment.spec.ts`

Expected: FAIL because review and assignment routes do not exist.

- [ ] **Step 3: Implement review, assignment and visibility rules**

```ts
await prisma.$transaction(async tx => {
  const before = await tx.lead.findUniqueOrThrow({ where: { id: leadId } })
  const after = await tx.lead.update({ where: { id: leadId }, data: { level, reviewReason: reason, reviewedById: actor.id } })
  await audit.recordInTransaction(tx, { actorId: actor.id, action: 'lead.level_changed', targetType: 'Lead', targetId: leadId, before: { level: before.level }, after: { level: after.level, reason } })
})
```

The web pages must show source, the persisted conversation messages in chronological order, current lead level, review reason, assignment state, internal notes and audit timeline. They must not show records outside the actor’s permission scope.

- [ ] **Step 4: Run API and Playwright tests**

Run: `pnpm --filter @cndt/api test lead-assignment.spec.ts && pnpm --filter @cndt/web test:e2e`

Expected: PASS; manager workflow succeeds, specialist isolation holds, and all state changes have audit events.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/leads apps/api/test/lead-assignment.spec.ts apps/web/app/leads
git commit -m "feat: add manager review and specialist assignment"
```

### Task 7: Add operational safeguards and pilot acceptance tests

**Files:**
- Create: `apps/api/src/common/queue/queue.module.ts`, `rate-limit.service.ts`
- Create: `apps/api/test/pilot-acceptance.spec.ts`
- Modify: `docs/runbooks/telegram-pilot.md`
- Create: `docs/runbooks/backup-and-restore.md`

**Interfaces:**
- Produces `RateLimitService.consume(key: string, limit: number, windowSeconds: number): Promise<boolean>`.
- Produces an acceptance suite covering webhook retries, group/DM identity handling, role boundaries, audit events and unauthorised webhook requests.

- [ ] **Step 1: Write the failing rate-limit and acceptance tests**

```ts
it('rejects the sixth webhook request from the same test key within one second', async () => {
  await Promise.all([...Array(5)].map(() => limiter.consume('telegram:test', 5, 1)))
  await expect(limiter.consume('telegram:test', 5, 1)).resolves.toBe(false)
})

it('completes the pilot path from a Telegram message to manager assignment with audit records', async () => {
  const lead = await createLeadThroughWebhook(sampleUpdate)
  await reviewAsManager(lead.id, { level: 'A', reason: 'Requested purchase consultation' })
  await assignAsManager(lead.id, specialist.id)
  await expect(auditFor(lead.id)).resolves.toHaveLength(3)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter @cndt/api test pilot-acceptance.spec.ts`

Expected: FAIL because the limiter and complete acceptance path do not exist.

- [ ] **Step 3: Implement Redis rate limiting and the pilot runbooks**

```ts
async consume(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const count = await this.redis.incr(`rate:${key}`)
  if (count === 1) await this.redis.expire(`rate:${key}`, windowSeconds)
  return count <= limit
}
```

The Telegram pilot runbook must contain webhook secret setup, test group administrator/Privacy Mode verification, rollback by disabling the webhook, internal account provisioning, backup location, and a restore drill.

- [ ] **Step 4: Run full checks and the restore drill**

Run: `pnpm test && pnpm lint && pnpm build && docker compose up -d && pnpm --filter @cndt/api test pilot-acceptance.spec.ts`

Expected: PASS; the full P1 path is reproducible against a fresh local stack.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/common/queue apps/api/test/pilot-acceptance.spec.ts docs/runbooks
git commit -m "test: verify Telegram pilot safeguards"
```

## Plan self-review

- Spec coverage: P1 covers Telegram ingestion, internal roles, customer/conversation/lead records, manager confirmation, specialist assignment, audit, baseline rate limiting and operational runbooks. AI, knowledge, video media and external content channels are intentionally assigned to P2-P5 in the delivery roadmap.
- Type consistency: all tasks use `LeadLevel`, `UserRole`, `AuditService.record`, `LeadAssignment`, and `ProcessedTelegramUpdate` as defined in Tasks 1-2.
- Scope: no hardware, payment, chain service, external marketing automation, user-initiated outbound messaging, or data scraping occurs in P1.
