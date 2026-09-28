# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

## CNDT 体验版决策（2026-09-28）

- 采用“招商经理工作台”作为默认首页；视频传媒矩阵与 AI/合规是同级切换页。
- 使用模拟、匿名化线索数据；不接入 Telegram、外部发布或真实客户数据。
- 保持 CNDT 紫色视觉，AI 智能体配置借鉴 Kimi 演示页的角色与版本化组织，不复制其界面。
- 体验版的核心演示操作是确认线索、切换页面、筛选内容状态和查看 AI 审批队列。

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
