# 开源参考与复用原则

本项目采用“核心招商领域模型自研，通用能力择优复用”的策略。引用开源项目不等于直接复制整个产品；采用任何代码或依赖前必须单独核验版本、许可证、维护状态和安全公告。

## 候选参考

| 项目 | 可借鉴内容 | 当前建议 |
| --- | --- | --- |
| [Telegraf](https://github.com/telegraf/telegraf) | TypeScript Telegram Bot 接入、更新处理和会话适配。 | 作为 Telegram 连接器候选。 |
| [Chatwoot](https://github.com/chatwoot/chatwoot) | 会话、联系人、分配、标签、团队、Webhook 和客服工作台的数据模型。 | 参考领域模型与交互，不作为一期核心底座。 |
| [Langfuse](https://github.com/langfuse/langfuse) | AI 调用追踪、提示词版本、评测与会话观测。 | 候选自托管 AI 可观测性组件；先进行脱敏与数据流评审。 |
| [Dify](https://github.com/langgenius/dify) | 知识库/RAG 处理与可视化工作流。 | 用于研究和内容实验；知识库审批、线索规则和审计仍由本系统掌握。 |

正式 FDE 材料建议 Shopify 独立站与 Tidio、Gorgias、Zendesk 等客服产品作为原流程工具。当前项目并未确认采用其中任一产品；Telegram 直连 MVP 会保留后续汇聚客服中台的接口，而不把第三方产品写成既定依赖。

## 不可妥协的设计原则

1. 客户、线索、分配、成交和审计记录必须由本系统保存为业务事实源。
2. AI 不能绕过内容合规审核、经理确认或人工接管机制。
3. 所有第三方连接器都通过统一的渠道接口接入，避免业务逻辑绑定 Telegram。
4. 生产凭证、客户原始对话和敏感资料不提交 Git，不发送给未获批准的外部服务。
