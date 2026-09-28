export function confirmLead(leads, leadId, assignee) {
  return leads.map((lead) =>
    lead.id === leadId
      ? { ...lead, status: "已分配跟进", assignee }
      : lead,
  );
}
