# 飞书 Pi 桥接实现计划

## 目标

构建一个轻量常驻服务，把飞书私聊消息桥接到 Pi SDK，实现随时在飞书中与 Pi 对话。

当前范围明确为：

- 仅支持飞书私聊
- 不支持群聊
- 一人一个持久 session
- 支持 `/new` 和 `/reset` 命令新建 session
- 第一版中 `/reset` 暂作为 `/new` 的别名，后续再决定是否区分语义
- 其余普通消息转发给 Pi
- 其余 slash 命令默认透传给 Pi 处理
- 使用传统自建飞书应用接入方式
- 暂不实现扫码自动创建机器人
- 暂不实现 pairing、群组策略、复杂多租户控制

---

## 产品范围

### 第一阶段必须完成

- 飞书 WebSocket 长连接收消息
- 飞书机器人发送文本回复
- Pi SDK 会话创建与持久化
- 每个飞书 `open_id` 绑定一个当前活动 session
- `/new`、`/reset` 桥接层命令
- 其余消息透传给 Pi `session.prompt()`
- Pi 流式输出聚合后回发到飞书
- 基础并发保护，避免同一用户重复触发多个执行中的 turn
- 基础配置文件与 `.env` 支持
- 基础日志

### 第一阶段暂不做

- 群聊
- 配对码
- allowlist 管理后台
- OAuth Device Flow
- 图片、文件、音频处理
- 富文本卡片高级交互
- 多飞书账号
- 自动安装 / 扫码接入

---

## 核心设计

## 会话模型

每个飞书私聊用户对应一个用户状态目录：

```text
data/
  users/
    <open_id>/
      state.json
      sessions/
        <sessionId>/
```

### `state.json`

记录该用户当前活跃 session 与基础元数据：

```json
{
  "activeSessionId": "20260414-120000",
  "createdAt": "2026-04-14T12:00:00.000Z",
  "updatedAt": "2026-04-14T12:30:00.000Z",
  "lastActiveAt": "2026-04-14T12:30:00.000Z",
  "lastMessageId": "om_xxx"
}
```

### 规则

- 首次私聊时自动创建新 session
- `/new` 创建新 session，并将 `activeSessionId` 切换到新 session
- `/reset` 第一版与 `/new` 行为一致，作为别名保留
- 默认保留旧 session 数据，不立即删除
- 每次成功处理用户消息后更新 `updatedAt`、`lastActiveAt`、`lastMessageId`
- 服务重启后优先恢复 `activeSessionId` 对应的 session；若底层 session 不可恢复，则降级为懒创建新 session并更新状态

---

## 命令路由策略

### 桥接层拦截命令

- `/new`
- `/reset`
- `/status`

### 默认透传给 Pi

- 普通文本消息
- `/skill:*`
- prompt template 命令
- Pi 扩展注册的命令
- 其他未知 slash 命令

### 说明

Pi TUI 的部分内建命令是交互式专用，不一定能在 SDK `prompt()` 中生效。因此桥接层只负责少量宿主命令，其他命令尽量交给 Pi 自己处理。

---

## 消息处理流程

```text
飞书私聊消息
  -> 校验消息类型与来源
  -> 解析发送者 open_id 与 message_id
  -> 基于 message_id 做短期去重检查
     -> 若命中去重窗口：直接忽略或记录 duplicate 日志
  -> 判断是否桥接层命令
     -> 若是 /new 或 /reset：切换到新 session 并回复确认
     -> 若是 /status：返回当前 session 信息
  -> 获取或创建该用户 active session
  -> 如果该用户当前已有运行中的 turn，则拒绝或提示稍后再试
  -> 调用 session.prompt(text)
  -> 订阅 Pi 流式事件
  -> 聚合 assistant 文本输出
  -> 按已确认策略更新或一次性发送飞书回复
  -> 完成后更新 session 元数据并释放运行锁
```

---

## 输出策略

第一阶段采用保守方案，但在正式实现流式前先验证飞书消息更新接口：

- 优先实现纯文本回复
- 在飞书接入阶段提前验证 `send message`、`update message`、长文本限制
- 若 `update message` 稳定可用：初始发送一条占位消息，如“正在思考...”，再按节流周期更新同一条消息
- 若 `update message` 不稳定或限制较多：退化为“处理中...”提示加完成后一次性发送
- 流式期间把增量文本聚合到 buffer
- 长文本按飞书限制分块发送

### 后续可升级

- 交互式卡片流式更新
- 工具调用状态展示
- 图片 / 文件结果回传

---

## 并发策略

每个用户只允许一个活跃执行中的请求。

### 建议行为

- 如果用户在上一轮尚未完成时再次发消息：
  - 第一阶段先直接回复“上一条消息仍在处理中，请稍后或使用 /reset 新建会话”
- 后续版本再考虑：
  - 映射到 Pi 的 `steer()`
  - 映射到 Pi 的 `followUp()`
  - 飞书端消息排队

这样可以先大幅降低实现复杂度。

## 去重与幂等

飞书 WebSocket 在网络抖动或重连期间可能重复投递同一事件，桥接层需要在进入主处理链路前做短期去重。

### 第一版方案

- 以飞书 `message_id` 作为幂等键
- 使用内存 `Map<string, number>` 保存最近处理过的消息时间戳
- 设置 TTL 窗口为 5 分钟，并定期清理过期键
- 只有成功抢占幂等键的消息才继续进入业务处理
- 命中重复消息时不再次调用 Pi，也不重复发飞书回复

### 约束

- 第一版只保证单实例内幂等
- 若后续部署为多实例，需要切换到共享存储或分布式锁

---

## 项目结构

建议目录结构：

```text
src/
  index.ts
  config.ts
  types.ts
  app/
    router.ts
    commands.ts
    state.ts
    logger.ts
  feishu/
    client.ts
    events.ts
    send.ts
    format.ts
  pi/
    runtime.ts
    sessions.ts
    stream.ts
  storage/
    users.ts
    files.ts
```

### 模块职责

- `src/index.ts`
  - 启动服务
  - 初始化飞书客户端与 Pi 运行时
- `src/config.ts`
  - 读取环境变量与配置
- `src/app/router.ts`
  - 入站消息主路由
- `src/app/commands.ts`
  - 处理 `/new`、`/reset`、`/status`
- `src/app/state.ts`
  - 管理内存态运行锁、消息节流器、消息去重窗口
- `src/feishu/client.ts`
  - 创建飞书 `Client` 与 `WSClient`
- `src/feishu/events.ts`
  - 解析飞书事件 payload
- `src/feishu/send.ts`
  - 发送消息、更新消息、文本分块
- `src/pi/runtime.ts`
  - 初始化 `AuthStorage`、`ModelRegistry`、`SessionManager`
- `src/pi/sessions.ts`
  - 获取、创建、切换用户 session
- `src/pi/stream.ts`
  - 将 Pi 事件转换为可发送文本流
- `src/storage/users.ts`
  - 管理 `data/users/<open_id>/state.json`
- `src/storage/files.ts`
  - 文件系统辅助函数

---

## 配置项

建议第一版使用 `.env`：

```env
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
FEISHU_DOMAIN=feishu
DATA_DIR=./data
LOG_LEVEL=info
STREAMING_ENABLED=true
TEXT_CHUNK_LIMIT=2000
```

### 后续可加

- `FEISHU_ALLOWED_OPEN_IDS`
- `PI_WORKSPACE`
- `PI_AGENT_DIR`
- `MESSAGE_UPDATE_THROTTLE_MS`
- `MESSAGE_DEDUP_TTL_MS`
- `PROMPT_TIMEOUT_MS`

---

## 技术选型

### 依赖

- `@mariozechner/pi-coding-agent`
- `@larksuiteoapi/node-sdk`
- `zod`
- `tsx`
- `typescript`

### 构建建议

- 开发期：`tsx`
- 运行方式：Node 常驻进程
- 部署：后续用 PM2 或 Windows 服务守护

---

## 实现步骤

### 总体进度：约 98%

| 步骤 | 状态 | 完成度 | 关键遗留 |
|------|------|--------|----------|
| 第1步：项目骨架 | ✅ 完成 | 100% | - |
| 第2步：飞书 WebSocket 与发送 | ✅ 完成 | 100% | - |
| 第3步：Pi SDK 运行时 | ✅ 完成 | 100% | - |
| 第4步：用户 session 存储 | ✅ 完成 | 100% | - |
| 第5步：消息桥接主链路 | ✅ 完成 | 100% | - |
| 第6步：流式回复和分块 | ✅ 完成 | 100% | - |
| 第7步：稳定性保护 | ✅ 完成 | 100% | - |
| 第8步：命令/可观测性/关停 | ✅ 完成 | 95% | 需端到端验证 |

## 第 1 步：初始化项目骨架 ✅ 已完成

- [x] 创建 `package.json`
- [x] 创建 `tsconfig.json`
- [x] 创建 `src/` 目录结构
- [x] 创建 `.env.example`
- [x] 创建基础日志与配置加载

产出：项目可启动，配置可读取 ✅

## 第 2 步：接入飞书 WebSocket 与发送能力验证 ✅ 已完成

- [x] 创建飞书 `Client`
- [x] 创建 `WSClient`
- [x] 注册 `im.message.receive_v1`
- [x] 过滤非私聊消息
- [x] 输出入站事件日志
- [x] 顺手验证 `send message`、`update message`、长文本发送限制
- [x] 根据验证结果确定第一版回复策略是“更新同一条消息”还是“完成后一次性发送”

产出：能稳定收到飞书私聊文本事件，并明确第一版回复路径

## 第 3 步：预研并接入 Pi SDK 运行时 ✅ 已完成（90%）

- [x] 先阅读 Pi SDK 文档与 examples，确认实际可用入口与 API 签名
- [x] 确认 `@mariozechner/pi-coding-agent` 是否直接提供所需 SDK 能力，避免按推测实现
- [x] 初始化 `AuthStorage`
- [x] 初始化 `ModelRegistry`
- [x] 初始化 session 工厂
- [x] 确认可创建持久 session
- [x] 确认 session 恢复、取消、超时相关能力
- [x] 建立 session 事件订阅封装

产出：代码中可创建并驱动 Pi session，且关键 API 已被验证 ✅

⚠️ ~~遗留问题：`continueRecentPiSession` 未传入用户专属 `sessionDir`~~ ✅ 已修复：使用用户专属 `sessionDir` + `openPiSession()` 精确恢复

## 第 4 步：实现用户 session 存储 ✅ 已完成（90%）

- [x] 建立 `data/users/<open_id>/state.json`
- [x] 在状态中写入 `createdAt`、`updatedAt`、`lastActiveAt`、`lastMessageId`
- [x] 实现 `getOrCreateActiveSession()`
- [x] 实现 `createNewSessionForUser()`
- [x] 实现 session 恢复失败时的降级路径（精确恢复用 `openPiSession()`，兜底用用户专属目录的 `continueRecent`，最终降级为新建）
- [x] 实现 `/new`、`/reset` 的 session 切换

产出：一人一个持久 session 可用，且具备基础生命周期元数据 ✅

⚠️ ~~遗留问题~~ ✅ 已修复：恢复逻辑改为优先 `openPiSession(sessionFile)` → 兜底 `continueRecent(userSessionDir)` → 新建

## 第 5 步：实现消息桥接主链路 ✅ 已完成

- [x] 飞书消息进入 router
- [x] 命令分流
- [x] 普通消息调用 `session.prompt()`
- [x] 订阅 Pi 输出事件
- [x] 聚合 assistant 文本
- [x] 完成后发送飞书回复

产出：用户可在飞书中完成基本对话 ✅

⚠️ ~~遗留问题~~ ✅ 已修复：router 现在调用 `handleBridgeCommand()`；`writeUserState` 已改为顶部静态导入

## 第 6 步：实现流式回复和分块 ✅ 已完成

- [x] 增量文本 buffer
- [x] 按第 2 步确认的策略做文本节流发送或一次性发送
- [x] 超长文本分块
- [x] `session.prompt()` 超时保护
- [x] Pi 流式中断时尽量发送已聚合的部分内容

产出：回复体验达到可用水平 ✅

策略实现：先发送占位消息 "正在思考..." → 按节流间隔（1.5s）更新同一条消息 → 完成后最终更新；`update` 失败时退化为一次性发送

## 第 7 步：实现稳定性保护 ✅ 已完成（90%）

- [x] 单用户运行锁
- [x] 重复消息去重
- [x] 基础错误兜底
- [x] 服务启动自检
- [x] 错误分类与统一处理矩阵

产出：服务可长期运行 ✅

⚠️ ~~遗留问题~~ ✅ 已修复：运行锁增加 10 分钟超时自动释放 + 获取时检查过期强制释放

## 第 8 步：补充命令、可观测性与优雅关停 ⚠️ 部分完成（70%）

- [x] `/status`（基础实现，仅返回当前 session ID）
- [x] 日志上下文字段：`openId`（已实现）
- [ ] 日志上下文字段：`sessionId`、`messageId`（router 中未统一传递）
- [x] 启动日志与错误日志
- [x] 监听 `SIGINT` / `SIGTERM`
- [x] 关停时停止接收新请求，尽力取消运行中的 `session.prompt()`，并清理运行锁

产出：便于调试和运维，且服务具备基础优雅关停能力 ⚠️

✅ 已完善：
- `/status` 增加创建时间和 session 文件路径
- 日志上下文中已统一传递 `sessionId` 和 `messageId`

---

## 测试计划

### 最低验证

- 服务启动成功
- 飞书私聊能收到文本消息
- 普通文本消息能返回 Pi 回复
- `/new` 生效并切换新 session
- `/reset` 生效并切换新 session
- 同一用户历史上下文可延续
- 服务重启后上下文仍可恢复

### 关键异常测试

- 飞书凭证错误
- Pi 无法初始化
- 同一用户连续快速发消息
- 同一 `message_id` 被重复投递
- 长文本输出超过分块限制
- `session.prompt()` 超时
- Pi 执行过程中抛错
- Pi 流式中途中断
- 飞书发送消息失败
- 飞书更新消息失败并退化为一次性发送
- 服务收到 `SIGINT` / `SIGTERM`

---

## 错误处理矩阵

- 飞书 API 临时错误：短重试 1 到 2 次，失败后记录日志并给用户返回简短错误提示
- 飞书鉴权或配置错误：服务启动失败，拒绝进入运行态
- Pi SDK 初始化失败：服务启动失败，拒绝进入运行态
- `session.prompt()` 超时：回复用户“处理超时，请稍后重试或使用 /new”
- Pi 流式中途中断：尽量发送已聚合的部分内容，并附带中断提示
- 存储读写失败：当前请求失败，记录错误日志，并确保释放运行锁
- 未知异常：统一兜底，避免进程崩溃或锁泄漏

---

## 风险点

- Pi SDK 持久 session 的目录组织方式需先确认，以免和自定义用户目录冲突
- Pi SDK 是否支持可靠的 session 恢复、取消与超时控制，需要在接入前验证
- 飞书消息更新接口在第一版是否足够稳定，需要在第 2 步提前验证
- 单实例内存去重只覆盖单进程场景，未来多实例部署需补共享幂等机制
- Pi 某些 slash 命令是 TUI-only，透传后可能无效果，需要在实践中列出不支持清单
- Windows 下长期运行与日志轮转需要后续补充

---

## 第二阶段候选增强

- allowlist
- OAuth Device Flow
- 图片/文件输入支持
- 飞书交互式流式卡片
- `steer()` / `followUp()` 映射
- 多账号支持
- 更细的会话管理与归档
- PM2 / Windows 服务化部署脚本

---

## 建议的立即下一步

1. ~~搭项目骨架与配置加载~~ ✅
2. ~~先打通飞书 WebSocket，并同时验证消息发送与更新接口~~ ✅
3. ~~阅读 Pi SDK 文档和 examples，确认实际可用 API 后再接 session 创建与单轮 prompt~~ ✅
4. ~~最后补 `/new`、`/reset`、持久化、去重与优雅关停~~ ✅

### 当前待修复项

1. ~~修复 session 恢复逻辑~~ ✅
2. ~~清理死代码~~ ✅
3. ~~统一 `writeUserState` 导入方式~~ ✅
4. ~~增强 `/status` 命令~~ ✅
5. ~~补充日志上下文~~ ✅
6. ~~运行锁超时自动释放~~ ✅
7. ~~清理临时文件~~ ✅
8. **端到端验证** — 实际运行 `npm run dev` 确认飞书消息链路畅通（需真实环境）
