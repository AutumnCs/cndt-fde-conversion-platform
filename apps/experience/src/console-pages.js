export function getConsolePages() {
  return [
    { id: "dashboard", label: "数据看板", group: "全链路总览" },
    { id: "broadcast", label: "宣发中心", group: "获客前端 · AI 宣发官" },
    { id: "inbox", label: "AI 客服工作台", group: "接待筛选 · AI 客服官" },
    { id: "leads", label: "线索池", group: "接待筛选 · AI 客服官" },
    { id: "transfers", label: "工单移交", group: "成交后端 · 人工承接" },
    { id: "deals", label: "跟进与成交", group: "成交后端 · 人工承接" },
    { id: "salons", label: "沙龙运营", group: "成交后端 · 人工承接" },
    { id: "knowledge", label: "知识库与 FAQ", group: "工程化与合规" },
    { id: "risk", label: "风控与审计", group: "工程化与合规" },
    { id: "agents", label: "AI 员工配置", group: "工程化与合规" },
  ];
}
