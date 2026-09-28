export function getModuleCatalog() {
  return [
    { id: "salon", name: "沙龙运营", description: "策划、邀约、现场与三工作日复盘", status: "规划中" },
    { id: "customer-db", name: "客户库与工单", description: "客户档案、移交、跟进记录与归属", status: "待接入" },
    { id: "oa", name: "OA 与审批", description: "方案审批、会议与跨部门回写", status: "待接入" },
    { id: "deal", name: "协议与成交登记", description: "受控登记、资料留痕与后续交付节点", status: "规划中" },
    { id: "risk", name: "风控与审计", description: "黑名单、风险关键词、版本与会话留痕", status: "规划中" },
    { id: "knowledge", name: "多语种知识库", description: "FAQ、物料切片与人工复核后的标准答案", status: "规划中" },
    { id: "hardware", name: "产品知识助手", description: "硬件与生态资料的受控检索，不承诺金融或硬件能力", status: "规划中" },
    { id: "agent", name: "二期岗位 Agent", description: "区块链、硬件、合规等角色模板，需单独立项和授权", status: "规划中" },
  ];
}
