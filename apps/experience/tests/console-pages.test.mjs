import test from "node:test";
import assert from "node:assert/strict";
import { getConsolePages } from "../src/console-pages.js";

test("FDE Console 提供截图中全部一级工作区，并将客户详情保留为二级页面", () => {
  const pages = getConsolePages();
  const ids = pages.map((page) => page.id);

  assert.deepEqual(ids, ["dashboard", "broadcast", "inbox", "leads", "transfers", "deals", "salons", "knowledge", "risk", "agents"]);
  assert.equal(pages.some((page) => page.id === "customer"), false);
});
