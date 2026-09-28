const demoLead = {
  id: "L-1001",
  customerName: "东南亚零售客户",
  level: "B",
  risk: "低风险",
  source: "Telegram · 东南亚市场趋势解读",
  summary: "客户希望了解本地化服务与合作方式。",
  specialistId: null,
  transfer: null,
  followUps: [],
  timeline: [{ action: "lead.received", at: "2026-09-28 11:26", detail: "客户主动发起已授权沟通" }],
};

export function createDemoConversionClient() {
  const lead = structuredClone(demoLead);

  const detail = () => structuredClone(lead);

  return {
    async getLead(leadId) {
      if (leadId !== lead.id) throw new Error("lead_not_found");
      return detail();
    },

    async confirmTransfer(leadId, input) {
      if (leadId !== lead.id) throw new Error("lead_not_found");
      if (lead.transfer) throw new Error("transfer_already_exists");
      lead.level = input.level;
      lead.specialistId = input.specialistId;
      lead.transfer = { id: "T-1001", status: "PENDING_ACCEPTANCE", specialistId: input.specialistId };
      lead.timeline.push({ action: "lead.confirmed_and_transferred", at: "2026-09-28 11:42", detail: input.reason });
      return structuredClone(lead.transfer);
    },

    async acceptTransfer(ticketId, specialistId) {
      if (!lead.transfer || lead.transfer.id !== ticketId) throw new Error("ticket_not_found");
      if (lead.transfer.specialistId !== specialistId) throw new Error("forbidden");
      lead.transfer.status = "ACCEPTED";
      lead.timeline.push({ action: "transfer.accepted", at: "2026-09-28 11:48", detail: "专员确认接收工单" });
      return detail();
    },

    async recordFollowUp(leadId, specialistId, input) {
      if (leadId !== lead.id) throw new Error("lead_not_found");
      if (!lead.transfer || lead.transfer.status !== "ACCEPTED" || lead.specialistId !== specialistId) throw new Error("forbidden");
      lead.followUps.unshift({ id: `F-${lead.followUps.length + 1}`, ...input, specialistId, at: "2026-09-28 12:05" });
      lead.timeline.push({ action: "follow_up.recorded", at: "2026-09-28 12:05", detail: input.nextAction });
      return detail();
    },
  };
}
