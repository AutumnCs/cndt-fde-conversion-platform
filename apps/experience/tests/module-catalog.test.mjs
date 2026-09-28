import test from "node:test";
import assert from "node:assert/strict";
import { getModuleCatalog } from "../src/module-catalog.js";

test("外部系统和受控业务模块在体验版中必须标为待接入或规划中", () => {
  const modules = getModuleCatalog();

  assert.ok(modules.some((item) => item.id === "oa" && item.status === "待接入"));
  assert.ok(modules.some((item) => item.id === "hardware" && item.status === "规划中"));
  assert.ok(modules.every((item) => item.status !== "已连接"));
});
