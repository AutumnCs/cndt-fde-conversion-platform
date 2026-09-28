# 转化闭环 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建可审计的“线索确认 → 工单移交 → 专员签收 → 跟进记录”内部闭环。

**Architecture:** PostgreSQL/Prisma 是唯一事实来源；API 负责授权、状态转换和审计追加；Console 只展示已授权数据。客户 360 是线索池二级页面。

**Tech Stack:** TypeScript、Prisma/PostgreSQL、Vitest、React/Vite、Node test runner。

## Global Constraints

- Telegram 仅承接用户主动发起的会话；本计划不配置真实 Token。
- MANAGER/ADMIN 才能确认等级并创建工单；SPECIALIST 仅能签收自己的工单、记录自己的跟进。
- 等级确认、移交、签收、跟进均追加 AuditEvent；审计事件不可更新或删除。
- 不实现自动派单、自动签约、支付、金融承诺、批量账号或非自愿外联。

---

### Task 1: 增加工单与跟进领域模型

**Files:** `prisma/schema.prisma`、新迁移、`apps/api/test/` Prisma 集成测试。

- [ ] 写失败测试：创建 `TransferTicket` 后状态为 `PENDING_ACCEPTANCE`；创建 `FollowUpRecord` 后保留 `nextAction`。
- [ ] 运行 `pnpm --filter @cndt/api test`，确认模型缺失导致失败。
- [ ] 新增 `TransferStatus` 枚举、`TransferTicket`（每条线索唯一）和 `FollowUpRecord`，并关联 `Lead`、`InternalUser`。
- [ ] 生成 Prisma Client、应用本地迁移并重跑集成测试。
- [ ] 提交：`feat: add transfer and follow-up domain models`。

### Task 2: 状态转换服务与授权

**Files:** 新建 `apps/api/src/conversion/conversion.service.ts`、repository、Vitest 测试；修改 `lead-access-policy.ts`。

- [ ] 写失败测试：专员调用 `confirmAndTransfer` 抛出 `forbidden`；非负责人无法 `acceptTransfer`；专员只能写已分配线索的跟进。
- [ ] 实现 `confirmAndTransfer(actor, leadId, level, specialistId, reason)`、`acceptTransfer(actor, ticketId)`、`recordFollowUp(actor, leadId, input)`。
- [ ] 每个成功转换调用 `AuditService.record`，动作名分别为 `lead.confirmed_and_transferred`、`transfer.accepted`、`follow_up.recorded`。
- [ ] 运行服务层全量测试并提交：`feat: add audited conversion workflow service`。

### Task 3: 内部 API 与演示种子

**Files:** 新建 `conversion.routes.ts`、`demo-seed.ts`、路由测试；修改 API 启动配置。

- [ ] 提供 `GET /internal/leads`、`GET /internal/leads/:id`、`POST /internal/leads/:id/confirm-transfer`、`POST /internal/transfers/:id/accept`、`POST /internal/leads/:id/follow-ups`。
- [ ] 写失败测试：无内部 actor 的写请求返回 401；角色错误返回 403。
- [ ] 使用本地 manager/specialist 种子验证确认、签收、写跟进成功并可读取审计事件。
- [ ] 提交：`feat: expose internal conversion workflow api`。

### Task 4: Console 闭环与客户 360

**Files:** 拆分 `apps/experience/src/App.jsx`；新建 `conversion-client.js`、`customer-detail.jsx` 与测试；修改样式。

- [ ] 写失败测试：client 将确认操作发送到 `/internal/leads/:id/confirm-transfer`，并保留 manager actor。
- [ ] 先实现内存演示 adapter，再保留切换真实 API 的接口；不把真实客户数据写入浏览器存储。
- [ ] 在线索池增加“查看客户”“确认并移交”；经理确认后生成待接收工单。
- [ ] 客户 360 显示来源归因、会话摘要、意向/风险、工单、跟进时间线与审计摘要。
- [ ] 专员签收后将工单变为已接收；提交跟进后追加时间线。
- [ ] 提交：`feat: add conversion closure console experience`。

### Task 5: 内部试用与验证

**Files:** `docs/05-internal-trial-checklist.md`、`docs/02-progress-governance.md`、`apps/experience/design-qa.md`。

- [ ] 运行 API 全量测试、Console 测试、生产构建和 Sites 打包测试。
- [ ] 编写经理确认、专员签收、跟进记录、审计查看及失败权限路径的试用清单。
- [ ] 用浏览器检查关键交互和桌面布局，更新视觉验收记录。
- [ ] 提交：`docs: add conversion closure trial checklist`。

## 自检

- Task 1–2 覆盖模型、授权和审计；Task 3 覆盖 API；Task 4 覆盖用户流程；Task 5 覆盖试用和验证。
- 正式登录、Telegram Token、外部系统授权、支付与硬件业务均不在本计划范围内。
