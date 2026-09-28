export function confirmLead(leads, leadId, assignee) {
  return leads.map((lead) =>
    lead.id === leadId
      ? { ...lead, status: "已分配跟进", assignee }
      : lead,
  );
}

export function findLead(leads, leadId) {
  return leads.find((lead) => lead.id === leadId) ?? null;
}
