# pi-gateway

将飞书私聊消息桥接到 Pi Agent 的轻量常驻服务。在飞书中直接与 Pi 对话，无需本地终端。

## 工作原理

```
飞书用户 --> 飞书 WebSocket --> pi-gateway --> Pi SDK --> LLM
```

pi-gateway 通过飞书 WebSocket 长连接接收私聊消息，转发给 Pi Agent 处理，并将回复发送回飞书对话中。

## 功能

- 飞书私聊文本消息桥接到 Pi Agent
- 可选流式回复：基于飞书流式卡片，在同一条消息里直接流式展示正文
- 长文本自动分块发送
- 每用户独立会话，服务重启后自动恢复
- 消息去重与并发保护，避免重复处理；处理中状态通过消息 reaction 提示
- 命令支持：`/new`、`/reset`、`/status`、`/context`、`/skills`、`/model`、`/models`、`/stop`
- 优雅关停

## 前置条件

- Node.js >= 18
- 飞书企业自建应用（需配置机器人能力与 WebSocket 长连接）
- Pi Agent 已安装（`@mariozechner/pi-coding-agent`）
- 至少一个 LLM API Key（如 `ANTHROPIC_API_KEY`）

## 飞书应用配置

1. 在 [飞书开放平台](https://open.feishu.cn/app) 创建企业自建应用
2. 获取 App ID 和 App Secret
3. 启用机器人能力
4. 配置权限：`im:message.p2p_msg:readonly`、`im:message:send_as_bot`、`im:resource`、`cardkit:card:write`
5. 事件订阅选择 **WebSocket 长连接**，添加 `im.message.receive_v1` 事件
6. 发布应用并获管理员批准

Lark 国际版需设置 `FEISHU_DOMAIN=larksuite`。

## 安装

```bash
git clone <repo-url> pi-gateway
cd pi-gateway
npm install
```

## 配置

复制 `.env.example` 为 `.env` 并填写：

```bash
cp .env.example .env
```

配置项说明：

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `FEISHU_APP_ID` | 是 | - | 飞书应用 App ID |
| `FEISHU_APP_SECRET` | 是 | - | 飞书应用 App Secret |
| `FEISHU_DOMAIN` | 否 | `feishu` | 飞书域名：`feishu`（国内）或 `larksuite`（海外） |
| `DATA_DIR` | 否 | `./data` | 数据存储目录 |
| `PI_WORKSPACE_ROOT` | 否 | `~/code/pi-workspace` | 每用户独立工作目录根路径，支持 `~` |
| `PI_DISABLE_GLOBAL_AGENTS` | 否 | `false` | 设为 `true` 后，不再加载全局 `~/.pi/agent/AGENTS.md` 和 `~/.pi/agent/CLAUDE.md`，只保留项目目录链上的规则文件 |
| `LOG_LEVEL` | 否 | `info` | 日志级别：`debug`/`info`/`warn`/`error` |
| `STREAMING_ENABLED` | 否 | `false` | 是否启用飞书流式卡片回复；默认关闭，打开后只建议给 7.20+ 客户端使用 |
| `TEXT_CHUNK_LIMIT` | 否 | `2000` | 单条消息文本上限（字符数） |
| `FEISHU_PROCESSING_REACTION_TYPE` | 否 | `SMILE` | 处理中提示的飞书表情 `emoji_type`；留空则不启用，填错也会自动禁用 |

同时确保环境变量中已配置 Pi 所需的 API Key（如 `ANTHROPIC_API_KEY`）。

如果启用了 `STREAMING_ENABLED=true`，飞书应用还必须开通 `cardkit:card:write`，否则会自动回退为最终一次性发送。飞书 2.0 卡片在旧客户端上展示不完整，所以这一项默认关闭，只有确认用户客户端版本足够新时再打开。

`FEISHU_PROCESSING_REACTION_TYPE` 大小写敏感。服务启动时会按飞书官方列表校验；如果你填了不合法的值，比如 `EYES`，服务会打出警告日志，并自动关闭 reaction，不会再去重试。

按 2026-04-14 拉取的飞书官方文档，当前支持的 `emoji_type` 全量如下，后续如果飞书有变更，以官方文档为准：

<details>
<summary>展开查看全部合法值</summary>

```text
OK
THUMBSUP
THANKS
MUSCLE
FINGERHEART
APPLAUSE
FISTBUMP
JIAYI
DONE
SMILE
BLUSH
LAUGH
SMIRK
LOL
FACEPALM
LOVE
WINK
PROUD
WITTY
SMART
SCOWL
THINKING
SOB
CRY
ERROR
NOSEPICK
HAUGHTY
SLAP
SPITBLOOD
TOASTED
GLANCE
DULL
INNOCENTSMILE
JOYFUL
WOW
TRICK
YEAH
ENOUGH
TEARS
EMBARRASSED
KISS
SMOOCH
DROOL
OBSESSED
MONEY
TEASE
SHOWOFF
COMFORT
CLAP
PRAISE
STRIVE
XBLUSH
SILENT
WAVE
WHAT
FROWN
SHY
DIZZY
LOOKDOWN
CHUCKLE
WAIL
CRAZY
WHIMPER
HUG
BLUBBER
WRONGED
HUSKY
SHHH
SMUG
ANGRY
HAMMER
SHOCKED
TERROR
PETRIFIED
SKULL
SWEAT
SPEECHLESS
SLEEP
DROWSY
YAWN
SICK
PUKE
BETRAYED
HEADSET
EatingFood
MeMeMe
Sigh
Typing
Lemon
Get
LGTM
OnIt
OneSecond
VRHeadset
YouAreTheBest
SALUTE
SHAKE
HIGHFIVE
UPPERLEFT
ThumbsDown
SLIGHT
TONGUE
EYESCLOSED
RoarForYou
CALF
BEAR
BULL
RAINBOWPUKE
ROSE
HEART
PARTY
LIPS
BEER
CAKE
GIFT
CUCUMBER
Drumstick
Pepper
CANDIEDHAWS
BubbleTea
Coffee
Yes
No
OKR
CheckMark
CrossMark
MinusOne
Hundred
AWESOMEN
Pin
Alarm
Loudspeaker
Trophy
Fire
BOMB
Music
XmasTree
Snowman
XmasHat
FIREWORKS
2022
REDPACKET
FORTUNE
LUCK
FIRECRACKER
StickyRiceBalls
HEARTBROKEN
POOP
StatusFlashOfInspiration
18X
CLEAVER
Soccer
Basketball
GeneralDoNotDisturb
Status_PrivateMessage
GeneralInMeetingBusy
StatusReading
StatusInFlight
GeneralBusinessTrip
GeneralWorkFromHome
StatusEnjoyLife
GeneralTravellingCar
StatusBus
GeneralSun
GeneralMoonRest
MoonRabbit
Mooncake
JubilantRabbit
TV
Movie
Pumpkin
BeamingFace
Delighted
ColdSweat
FullMoonFace
Partying
GoGoGo
ThanksFace
SaluteFace
Shrug
ClownFace
HappyDragon
```

官方文档：
https://open.feishu.cn/document/server-docs/im-v1/message-reaction/emojis-introduce?lang=zh-CN
</details>

## 启动

```bash
npm run dev
```

服务启动后会自动进行自检：

1. 加载并校验配置
2. 初始化 Pi 运行时并验证可用模型
3. 初始化飞书客户端
4. 建立飞书 WebSocket 长连接

全部通过后即可在飞书中私聊机器人开始对话。

## 使用

在飞书中私聊机器人：

- 直接发送文本消息即可与 Pi 对话
- `/new` -- 创建新会话
- `/reset` -- 重置会话（当前与 `/new` 行为一致）
- `/status` -- 查看当前会话状态
- `/context` -- 查看当前会话实际加载到的 `AGENTS.md`
- `/skills` -- 查看当前会话实际加载到的 skills
- `/model` -- 查看当前模型
- `/model <序号>` -- 按 `/models` 里的序号切模型
- `/model <provider/model>` -- 切换到指定模型
- `/models` -- 查看当前环境真的能用的模型，并显示可切换序号
- `/models <provider>` -- 只看某个 provider 下面真的能用的模型
- `/stop` -- 停掉当前正在跑的回复

除上面这些桥接层命令外，其他斜杠命令会透传给 Pi 处理。

## 项目结构

```
src/
  index.ts           # 启动入口与关停
  config.ts          # 环境变量配置校验
  types.ts           # 类型定义
  app/
    router.ts        # 入站消息主路由
    commands.ts      # 桥接层命令处理
    state.ts         # 运行锁与消息去重
    logger.ts        # 日志
    errors.ts        # 错误分类与超时
  feishu/
    client.ts        # 飞书 Client 与 WebSocket 连接
    events.ts        # 飞书事件解析与过滤
    send.ts          # 消息发送、更新与分块
    format.ts        # 回复格式化
  pi/
    runtime.ts       # Pi AuthStorage/ModelRegistry 初始化
    sessions.ts      # 用户会话创建、恢复与管理
    stream.ts        # Pi 流式输出到飞书消息的桥接
  storage/
    users.ts         # 用户状态持久化
    files.ts         # 文件系统辅助
```

## 数据目录

用户数据存储在 `DATA_DIR` 下：

```
data/
  users/
    <open_id>/
      state.json       # 用户状态（活跃会话ID、元数据）
      sessions/        # Pi 会话文件
```

## 测试

```bash
npm test
```

## 部署

建议使用 PM2 守护进程：

```bash
npm install -g pm2
pm2 start "npm run dev" --name pi-gateway
```

## 限制

- 仅支持私聊，不支持群聊
- 仅支持文本消息，不支持图片/文件/音频
- 单实例部署，消息去重仅覆盖单进程
- 同一用户同一时间只能处理一条消息

## License

Private
