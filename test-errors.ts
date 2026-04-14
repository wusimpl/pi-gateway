// 测试：错误处理 + 超时保护
import { chunkText } from "./src/feishu/send.js";
import { BridgeError, getUserMessage, withTimeout, retryOnTempError } from "./src/app/errors.js";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) { console.log(`  [ok] ${name}`); passed++; }
  else { console.log(`  [fail] ${name}`); failed++; }
}

console.log("\n错误处理测试");

// 1. BridgeError 分类
console.log("\n1. BridgeError 分类");
const err1 = new BridgeError("test", "pi_prompt_timeout", true);
assert(err1.category === "pi_prompt_timeout", "category 正确");
assert(err1.retryable === true, "retryable 正确");
assert(err1.message === "test", "message 正确");

// 2. getUserMessage 映射
console.log("\n2. 用户提示映射");
assert(getUserMessage(err1).includes("超时"), "超时错误 -> 超时提示");
const err2 = new BridgeError("test", "feishu_auth");
assert(getUserMessage(err2).includes("认证"), "认证错误 -> 认证提示");
assert(getUserMessage(new Error("x")).includes("未知"), "普通 Error -> 未知提示");

// 3. withTimeout 正常完成
console.log("\n3. withTimeout");
const fastResult = await withTimeout(Promise.resolve("ok"), 1000);
assert(fastResult === "ok", "正常完成返回结果");

// 4. withTimeout 超时
let timeoutHit = false;
try {
  await withTimeout(new Promise(() => {}), 100, "测试超时");
} catch (err: any) {
  timeoutHit = err instanceof BridgeError && err.category === "pi_prompt_timeout";
}
assert(timeoutHit === true, "超时触发 BridgeError");

// 5. retryOnTempError 成功
console.log("\n5. retryOnTempError");
let callCount = 0;
const retryResult = await retryOnTempError(async () => {
  callCount++;
  if (callCount < 2) throw new Error("temp");
  return "success";
}, 2, 10);
assert(retryResult === "success", "重试后成功");
assert(callCount === 2, "调用了 2 次");

// 6. retryOnTempError 全部失败
let retryFailCount = 0;
try {
  await retryOnTempError(async () => {
    retryFailCount++;
    throw new Error("always fail");
  }, 2, 10);
} catch {
  // 预期
}
assert(retryFailCount === 3, "全部失败: 调用 3 次（1 + 2 重试）");

// 7. chunkText 长文本分块
console.log("\n6. chunkText");
const chunks = chunkText("a".repeat(4500), 2000);
assert(chunks.length === 3, "4500 字符按 2000 分为 3 段");
assert(chunks.every((chunk) => chunk.length <= 2000), "每段都不超过限制");
assert(chunks.join("") === "a".repeat(4500), "分块后可无损拼接");

console.log(`\n结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed > 0 ? 1 : 0);
