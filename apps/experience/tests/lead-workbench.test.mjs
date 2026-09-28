import test from "node:test";
import assert from "node:assert/strict";
import { confirmLead } from "../src/lead-workbench.js";

test("confirmLead 将待确认线索标记为已分配并保留其他线索", () => {
  const leads = [
    { id: "tg-1001", status: "待确认", assignee: null },
    { id: "tg-1002", status: "待确认", assignee: null },
  ];

  const next = confirmLead(leads, "tg-1001", "王专员");

  assert.deepEqual(next, [
    { id: "tg-1001", status: "已分配跟进", assignee: "王专员" },
    { id: "tg-1002", status: "待确认", assignee: null },
  ]);
  assert.equal(leads[0].status, "待确认");
});
