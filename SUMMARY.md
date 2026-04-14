# 会话摘要：构建飞书 → Pi 轻量桥接服务

## 目标

用户希望**在飞书中使用 pi agent**，实现随时随地不依赖本地终端也能和 pi 交流（类似 OpenClaw 24 小时运行的 agent 模式）。

---

## 背景

- **pi**（`@mariozechner/pi-coding-agent`）是一个终端 AI 编码助手，支持交互模式、SDK 嵌入、RPC 模式
- **OpenClaw** 是一个 24 小时运行的 personal AI assistant，通过 Gateway 控制面接入各种渠道（WhatsApp/Telegram/Slack/Discord/飞书等），内部使用 pi 的 RPC 模式运行 agent
- OpenClaw 有两个飞书插件：
  - 社区版 `@openclaw/feishu`（内置捆绑，代码在 `C:\Users\Administrator\code\openclaw\extensions\feishu\`）
  - **飞书官方版 `@larksuite/openclaw-lark`**（npm 最新 `2026.4.7`，由字节跳动维护，功能更全）
- 用户选择**方案 B：自建轻量桥接服务**，不依赖 OpenClaw 中间层

---

## 技术架构

```
飞书用户 ──WebSocket──▶ 飞书SDK(@larksuiteoapi/node-sdk) ──▶ 桥接服务 ──▶ Pi SDK ──▶ LLM
```

---

## 技术栈

| 组件 | 包名 | 用途 |
|------|------|------|
| Pi Agent SDK | `@mariozechner/pi-coding-agent` | `createAgentSession()` 嵌入 pi，直接用 pi 全部能力（扩展/技能/提示词模板/`~/.pi/agent/` 配置） |
| 飞书 SDK | `@larksuiteoapi/node-sdk` `^1.60.0` | WebSocket 长连接接收飞书消息 + 发送回复 |
| Schema | `@sinclair/typebox` `0.34.48` | 参数校验（与 pi 和 openclaw 生态一致） |
| 校验 | `zod` `^4.3.6` | 飞书官方插件也用了 |
| 图片 | `image-size` `^2.0.2` | 飞书官方插件用于处理图片消息 |

---

## Pi SDK 核心用法

```typescript
import {
  createAgentSession,
  SessionManager,
  AuthStorage,
  ModelRegistry,
} from "@mariozechner/pi-coding-agent";

const authStorage = AuthStorage.create();
const modelRegistry = ModelRegistry.create(authStorage);

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
  authStorage,
  modelRegistry,
});

// 订阅流式输出
session.subscribe((event) => {
  if (event.type === "message_update" && event.assistantMessageEvent.type === "text_delta") {
    // 增量文本
  }
  if (event.type === "agent_end") {
    // 完成
  }
  // tool_execution_start / tool_execution_update / tool_execution_end — 工具调用
  // message_start / message_end — 消息生命周期
});

await session.prompt("用户消息");
await session.steer("转向消息");   // 流式中的转向
await session.followUp("跟进消息"); // 流式后的跟进
```

**关键特性：**
- `SessionManager.inMemory()` — 不持久化；`SessionManager.create(cwd)` — 持久化到文件
- 支持自定义 `cwd`、`tools`、`ResourceLoader`、`SettingsManager`
- 工具可通过 `createCodingTools(cwd)` / `createReadOnlyTools(cwd)` 按 cwd 创建
- 扩展通过 `DefaultResourceLoader` 自动发现 `~/.pi/agent/extensions/`

---

## 飞书 SDK 核心用法

```typescript
import * as lark from "@larksuiteoapi/node-sdk";

const client = new lark.Client({ appId: "cli_xxx", appSecret: "xxx" });

// WebSocket 长连接（无需公网 URL）
const wsClient = new lark.WSClient({
  appId: "cli_xxx",
  appSecret: "xxx",
  eventDispatcher: new lark.EventDispatcher({}).register({
    "im.message.receive_v1": async (data) => {
      // 处理收到的消息
    },
  }),
});
wsClient.start();

// 发送消息
await client.im.message.create({
  params: { receive_id_type: "open_id" },
  data: { receive_id: "ou_xxx", msg_type: "text", content: JSON.stringify({ text: "回复" }) },
});
```

---

## 需要自建的关键模块（参考 OpenClaw feishu 插件实现）

| 模块 | 参考文件 | 说明 |
|------|----------|------|
| 流式卡片渲染 | `extensions/feishu/src/streaming-card.ts` | 飞书交互式卡片流式更新 |
| 消息发送与分块 | `extensions/feishu/src/send.ts` + `outbound.ts` | 长文本分块（默认 2000 字符） |
| 媒体处理 | `extensions/feishu/src/media.ts` | 图片/文件/音频上传下载 |
| 消息格式解析 | `extensions/feishu/src/post.ts` | 富文本（post）解析 |
| 会话管理 | `extensions/feishu/src/session-route.ts` | 私信共享主会话、群组隔离 |
| 配对安全 | `extensions/feishu/src/pairing.ts` | 未知用户配对码验证 |
| 配置 Schema | `extensions/feishu/src/config-schema.ts` | 飞书渠道配置定义 |
| 打字指示器 | `extensions/feishu/src/typing.ts` | "正在输入"状态 |
| 卡片交互 | `extensions/feishu/src/card-interaction.ts` | 卡片按钮等交互处理 |

---

## 飞书应用配置要点

1. 在 [飞书开放平台](https://open.feishu.cn/app) 创建企业自建应用
2. 获取 App ID（`cli_xxx`）和 App Secret
3. 配置权限（`im:message.p2p_msg:readonly`、`im:message:send_as_bot`、`im:resource` 等）
4. 启用机器人能力
5. 事件订阅选 **WebSocket 长连接**，添加 `im.message.receive_v1` 事件
6. 发布应用并获管理员批准
7. Lark 国际版需设置 `domain: "lark"`

---

## 已有环境

- Windows 服务器，Node.js `v22.13.1`
- pi 已安装：`@mariozechner/pi-coding-agent`
- openclaw 已安装（全局），代码仓库在 `C:\Users\Administrator\code\openclaw`
- pi 配置目录：`~/.pi/agent/`（含扩展、技能、提示词模板等）
- API Key 通过环境变量 `ANTHROPIC_API_KEY` 配置

---

## 需要讨论的下一步

1. **项目结构**：放在哪里、用什么构建工具（tsx/tsdown/esbuild）
2. **消息桥接核心逻辑**：飞书消息 → pi prompt → pi 流式输出 → 飞书卡片流式更新
3. **流式卡片实现**：飞书交互式卡片如何在生成过程中实时更新
4. **会话管理**：是否持久化、多用户支持、群组隔离
5. **部署方式**：PM2/systemd 守护进程
6. **安全**：配对码 / allowlist 访问控制

---

## 参考文档路径

| 资料 | 路径 |
|------|------|
| Pi README | `C:\Users\Administrator\AppData\Roaming\npm\node_modules\@mariozechner\pi-coding-agent\README.md` |
| Pi SDK 文档 | `...\docs\sdk.md` |
| Pi RPC 文档 | `...\docs\rpc.md` |
| Pi 扩展文档 | `...\docs\extensions.md` |
| Pi Skills 文档 | `...\docs\skills.md` |
| Pi 提示词模板 | `...\docs\prompt-templates.md` |
| Pi TUI 文档 | `...\docs\tui.md` |
| Pi SDK 示例 | `...\examples\sdk\` |
| Pi 扩展示例 | `...\examples\extensions\` |
| OpenClaw 仓库 | `C:\Users\Administrator\code\openclaw\` |
| OpenClaw 飞书插件 | `C:\Users\Administrator\code\openclaw\extensions\feishu\` |
| OpenClaw 飞书文档(中文) | `C:\Users\Administrator\code\openclaw\docs\zh-CN\channels\feishu.md` |
| OpenClaw 飞书文档(英文) | `C:\Users\Administrator\code\openclaw\docs\channels\feishu.md` |
