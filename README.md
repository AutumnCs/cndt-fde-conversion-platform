# CNDT FDE 招商中台

这是一个面向内部招商团队的 AI 招商运营系统。项目以 Telegram 为首个正式接入渠道，通过 AI 接待、线索分级、经理确认分配和人工跟进，建立从获客到成交的可审计闭环。

## 当前阶段

需求发现与 MVP 设计中；尚未开始代码实现或接入任何正式账号。

## 项目事实源

- [项目上下文](docs/00-project-context.md)：已确认的业务背景、角色与边界。
- [MVP 边界](docs/01-mvp-boundary.md)：一期包含与排除的功能。
- [进度治理](docs/02-progress-governance.md)：里程碑、验收和变更控制。
- [正式材料对齐说明](docs/03-source-documents-alignment.md)：原始 FDE 方案、项目裁剪与待确认差异。
- [待决问题](docs/OPEN_QUESTIONS.md)：尚未确认、会影响设计的事项。
- [关键决策](docs/decisions/)：已确认的设计选择。
- [开源参考](docs/research/open-source-reference.md)：复用原则与候选项目。
- [CNDT Agent 页面参考](docs/research/kimi-fde-agents-reference.md)：现有中台的 AI 员工配置与项目映射。
- [原始资料](assets/source-materials/)：用户提供的架构图与 SOP 截图。

## 工作约定

- 文档优先于聊天记忆；任何确认的范围、决策和变更都更新到本仓库。
- 不在仓库、聊天记录或截图中保存 Bot Token、密码、私钥或生产凭证。
- 所有外部渠道均先接入测试环境，经过验收后再切换正式账号。
- AI 只能依据已审核知识库答复；高意向客户由经理确认后才分配给专员。
