import test from "node:test";
import assert from "node:assert/strict";
import { createDemoConversionClient } from "../src/conversion-client.js";

test("经理确认后创建待接收工单，专员签收并追加跟进时间线", async () => {
  const client = createDemoConversionClient();

  const ticket = await client.confirmTransfer("L-1001", { level: "A", specialistId: "specialist-1", reason: "确认高意向" });
  await client.acceptTransfer(ticket.id, "specialist-1");
  const detail = await client.recordFollowUp("L-1001", "specialist-1", { customerFeedback: "希望安排线上沟通", nextAction: "发送会议邀请" });

  assert.equal(detail.transfer.status, "ACCEPTED");
  assert.equal(detail.followUps[0].nextAction, "发送会议邀请");
  assert.equal(detail.timeline.at(-1).action, "follow_up.recorded");
});
