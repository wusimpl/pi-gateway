# 飞书群聊与消息路由抽象实施计划

## 背景

当前 pi-gateway 以飞书私聊为核心：入站事件只接受私聊消息，运行状态、会话、命令、回复投递大多以用户 open_id 作为主键。这对单用户私聊很直接，但支持群聊、话题、mention 唤醒、按会话投递定时任务时，会遇到几个结构性限制：

1. **路由目标过窄**：用户身份和回复目标混在一起，无法自然表达群聊、话题、线程。
2. **会话边界不清**：私聊、群聊、话题都应该有独立 session，不能全绑定到用户。
3. **权限策略缺位**：群聊里不是所有成员都应该能执行 owner 级命令或高风险工具。
4. **后续扩展困难**：如果先直接在现有 open_id 逻辑上硬加群聊，后面做 thread、cron 投递、多账号会反复返工。

因此，P0 群聊能力和 P1 路由抽象应一起设计；实现时先落地最小路由抽象，再做群聊。

## 目标

### P0：飞书群聊支持

- 支持接收飞书群聊消息。
- 默认仅在机器人被 @ 或命中 mention pattern 时响应。
- 群聊拥有独立 session，不污染私聊上下文。
- 支持群组 open / allowlist / disabled 三种策略。
- 群聊中回复回原群，而不是私聊发送者。
- 群聊命令默认收敛，高风险命令需要 owner 权限。

### P1：消息路由抽象

- 引入统一的会话目标模型，拆开“发送者身份”和“会话/回复目标”。
- 为私聊、群聊、未来话题/线程预留统一接口。
- 让 messenger、session、runtime state、cron 投递逐步改为基于会话目标路由。
- 保持现有私聊行为兼容，不破坏已有用户数据和历史 session。

## 非目标

本阶段不做以下功能：

- 飞书多账号。
- 飞书 webhook 模式。
- 完整 ACP 绑定。
- Docker sandbox。
- Web 控制台。
- 群聊中的复杂多人长期记忆。
- 跨群/跨私聊主动广播。
- 全量迁移旧数据目录。

## 核心设计

### 1. 统一会话目标

新增一个概念层：Conversation Target。

它需要表达三类信息：

- 当前消息来自哪个聊天场景：私聊、群聊、未来的话题/线程。
- 这轮 agent 应该归属哪个 session。
- 回复应该投递到哪里。

设计原则：

- “发送者”只表示谁发了消息。
- “会话目标”表示这条消息属于哪个对话空间。
- 私聊中，发送者和回复目标通常是同一个人。
- 群聊中，发送者是某个成员，但回复目标是群。
- 未来话题/thread 中，回复目标应进一步细化到具体 thread。

### 2. 稳定 Conversation Key

每个会话目标都需要一个稳定 key，用于：

- 运行锁。
- 消息队列。
- session 存储。
- `/stop` 定位。
- `/sessions` 和 `/resume` 的作用域。
- 未来 cron 投递回当前会话。

建议 key 规则：

- 私聊：以用户 open_id 标识。
- 群聊：以群 chat_id 标识。
- 话题/thread：以群 chat_id + thread_id 标识。

兼容策略：

- 私聊继续兼容现有 open_id 数据目录。
- 新增群聊数据目录，不迁移旧私聊数据。
- 对外命令体验保持不变。

### 3. 入站消息结构调整

当前入站消息主要携带用户 identity。后续应同时携带：

- 发送者身份。
- 会话目标。
- 原始飞书消息 ID。
- chat_id。
- thread_id / parent_id / root_id。
- 消息类型和内容。

短期可以保留旧字段作为兼容 alias，新逻辑优先使用新结构。

### 4. 目标感知的发送接口

现有发送逻辑偏向“发给某个 open_id”。需要新增一层目标感知接口：

- 发文本到当前会话目标。
- 发渲染后的长文本到当前会话目标。
- 发文件到当前会话目标。
- 给原消息添加 reaction。

落地策略：

- P0 先保证文本回复和渲染回复支持群聊。
- 文件发送、选择卡片、飞书文档工具先保持私聊优先。
- 后续再逐步扩展工具在群聊中的可用范围。

### 5. 运行状态和队列按会话目标隔离

运行锁和消息队列应从“按用户隔离”改为“按会话目标隔离”。

收益：

- 同一个人在私聊和群聊可以互不阻塞。
- 不同群之间互不阻塞。
- `/stop` 只停止当前会话目标，不影响用户其他会话。
- 群聊中的长任务不会卡住用户私聊。

消息去重仍然可以继续按飞书 message_id 全局处理。

### 6. SessionService 支持会话目标

SessionService 应新增以会话目标为入口的能力：

- 获取或创建当前目标的 active session。
- 为当前目标创建新 session。
- 列出当前目标的历史 session。
- 恢复当前目标的历史 session。

落地策略：

- 私聊继续复用现有用户目录。
- 群聊新增 conversation 级目录。
- `/sessions` 默认只展示当前会话目标的历史，不跨目标混杂。

## 群聊策略

### 配置项

建议新增以下配置：

| 配置 | 默认值 | 说明 |
| --- | --- | --- |
| 群聊策略 | disabled | disabled / allowlist / open |
| 群 allowlist | 空 | allowlist 模式下允许响应的 chat_id |
| 默认需要 mention | true | 群聊中默认必须 @ 机器人 |
| mention patterns | 空 | 额外文本触发词 |
| owner open_id 列表 | 空 | 允许执行管理命令的用户 |

默认应关闭群聊，避免升级后机器人突然在群里发言。

### 入站过滤流程

群消息处理建议按以下顺序：

1. 解析飞书事件。
2. 判断是私聊还是群聊。
3. 私聊保持当前行为。
4. 群聊先检查群聊策略。
5. 如果是 allowlist，检查 chat_id 是否允许。
6. 判断是否 @ 机器人或命中 mention pattern。
7. 未触发则静默忽略。
8. 触发后生成会话目标，进入统一 router。

### mention 判断

优先级：

1. 飞书消息富文本中的 at 节点明确提到机器人。
2. 消息文本命中配置的 mention pattern。
3. 部分安全命令可允许不 mention，但高风险命令仍需 owner。

如果短期拿不到机器人 open_id，可以先用 mention pattern 做 MVP，后续再补精确 at 判断。

### 群聊 Prompt 注入

群聊消息进入模型前应注入最小上下文：

- 当前是飞书群聊。
- 群 chat_id。
- 发送者 open_id / user_id。
- 当前消息是否由 mention 触发。
- 模型应回复当前群，而不是私聊用户。

P0 不建议做群聊历史旁路缓存，避免扩大复杂度。先依赖当前 session 历史即可。

## 群聊命令权限

建议将命令分为三类。

### 所有人可用

- `/status`
- 未来的 `/help`

### 当前会话可用，但需要 mention 或 owner

- `/new`
- `/reset`
- `/model`
- `/models`
- `/sessions`
- `/resume`
- `/settings`
- `/tools`
- `/stop`
- `/next`

### owner-only

- `/restart`
- `/reaction`
- 全局 `/stream`
- `/stt`
- `/skillstat reset`
- 未来 pairing / allowlist 管理命令

建议新增统一权限判断函数，由 router 在执行桥接层命令前调用。

## 实施步骤

### Step 1：新增会话目标概念，不改行为

- 增加 Conversation Target 和 Conversation Key 概念。
- 私聊消息也生成会话目标。
- router 内部仍只接受私聊。
- 补基础测试。

验收：现有私聊行为完全不变。

### Step 2：运行状态和队列改用 Conversation Key

- 用户级队列改成会话目标级队列。
- lock、stop、abort handler 改成会话目标级。
- 私聊场景保持兼容。

验收：同一私聊连续消息仍串行；`/stop` 正常。

### Step 3：新增目标感知 Messenger

- 新增目标感知发送 wrapper。
- 私聊内部继续调用现有发送逻辑。
- 群聊发送逻辑预留 chat_id 通道。
- 命令回复和模型回复逐步迁移到 wrapper。

验收：私聊回复路径不变。

### Step 4：SessionService 支持会话目标

- 新增 target-aware session 入口。
- 私聊走旧路径。
- 群聊走新 conversation 路径。
- `/sessions`、`/resume` 按当前目标隔离。

验收：私聊历史 session 不丢；群聊可创建独立 session。

### Step 5：开启群聊入站

- 入站过滤支持 group。
- 新增群聊策略配置。
- 实现 mention 判断。
- 群聊 prompt 注入发送者和群上下文。
- 群聊文本回复发回原群。

验收：默认 disabled 时群消息忽略；open + require mention 时未 @ 忽略，@ 后回复群。

### Step 6：群聊命令权限

- 增加 owner 配置。
- 群聊中拦截 owner-only 命令。
- 安全命令允许执行。
- 对被拒绝命令给出简短提示。

验收：普通群成员不能 `/restart`；owner 可以。

### Step 7：文档和测试补齐

- 更新 README：群聊配置、默认行为、权限限制。
- 增加 router、event、command 权限测试。
- 做飞书真实群聊 smoke test。

## 测试计划

### 单元测试

- 会话目标 key 生成。
- 私聊 event normalize。
- 群聊 event normalize。
- 群聊策略：disabled / open / allowlist。
- mention 判断：at 节点、pattern、未触发。
- 命令权限：owner / 普通成员。
- queue key 隔离：私聊和群聊不互相阻塞。

### 手动测试

1. 私聊发送文本、图片、音频、文件。
2. 私聊 `/status`、`/stop`、`/sessions`。
3. 群聊未 @：机器人不回复。
4. 群聊 @：机器人回复群。
5. 两个群分别 @：session 独立。
6. 群聊 `/new` 不影响私聊。
7. 普通群成员 `/restart` 被拒绝。
8. owner 群成员 `/restart` 可执行。

## 风险与缓解

| 风险 | 缓解 |
| --- | --- |
| 路由抽象改动面过大 | 先新增 wrapper 和 alias，不一次性删除旧接口 |
| 破坏旧私聊 session | 私聊继续走旧数据目录 |
| 群聊误触发刷屏 | 默认 disabled，且默认 require mention |
| 群聊权限过大 | owner-only 命令先做白名单拦截 |
| 发送接口改动影响工具 | P0 只迁移文本回复，工具仍先限制私聊 |
| 话题/thread 提前复杂化 | 类型预留，但本阶段不开放 thread |

## 推荐提交拆分

1. 增加会话目标模型。
2. 队列和运行锁按会话目标隔离。
3. 增加目标感知的飞书发送层。
4. SessionService 支持会话目标。
5. 支持飞书群聊和 mention gating。
6. 增加群聊命令权限。
7. 更新 README 和测试。

## 最小可交付版本

最小版本只需要做到：

- 群聊默认关闭。
- 开启后，仅 @ 机器人时响应。
- 群聊 session 独立。
- 回复发回原群。
- owner-only 命令在群聊中受限。
- 私聊功能完全不回退。

这个版本就足以覆盖 P0，并为后续 thread、cron 投递、多账号打好 P1 基础。
