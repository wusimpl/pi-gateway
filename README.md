# Pi Gateway

Pi Gateway 是一个把 **Pi Code Agent** 接到 **飞书** 的网关服务。

它运行在本机或服务器上，通过飞书开放平台长连接接收私聊/群聊消息，把消息整理成 Pi 会话输入，再把模型回复、工具结果、文档链接、文件、图片、定时任务结果发送回飞书。

一句话：**不用离开飞书，就能使用本机 Pi 的会话、工具、skills、文件处理和自动化能力。**

---

## 当前能力概览

### 飞书消息入口

支持接收并处理：

- 私聊文本消息
- 群聊文本消息
- 飞书富文本 post 消息
- 图片消息
- 富文本内嵌图片
- 语音消息
- 文件消息
- 引用/回复消息

图片、语音和文件会被下载到当前 workspace 的 `.feishu-inbox/<messageId>/` 下，再交给 Pi 处理。

### Pi 会话能力

- 每个私聊用户独立上下文
- 每个群聊独立上下文
- 会话可新建、重置、恢复和查看历史
- 会话状态持久化到 `DATA_DIR`
- 每个用户/群聊有独立 workspace
- 支持项目级 `AGENTS.md` 自动创建和加载
- 可注入网关专属规则文件 `PI_GATEWAY_AGENTS_FILE`
- 可按会话配置模型、推理强度、启用工具、工具调用展示方式
- 支持运行中追加 steering/follow-up 消息
- 支持 `/stop` 中止当前任务

### 飞书输出能力

- 普通文本回复
- 长文本自动分段
- Markdown 渲染为飞书可读消息
- 流式卡片更新
- 处理中/排队中 reaction
- 工具调用过程展示
- 飞书文档预览卡片
- 本地文件发送
- 本地图片直接发送为飞书图片
- 自动识别本地生成图片 URL 并转发为飞书图片

### 内置扩展工具

Pi Gateway 会在 Pi runtime 中注册一组飞书相关 extension tools：

| 工具 | 用途 |
| --- | --- |
| `ask_user_choice` | 在当前飞书会话发送单选按钮卡片，并等待用户点击 |
| `feishu_doc_create` | 创建飞书新版文档 docx |
| `feishu_doc_read` | 读取飞书新版文档 docx；也支持 wiki 链接解析后读取 |
| `feishu_doc_append` | 向飞书 docx 末尾追加内容 |
| `feishu_doc_replace` | 整篇替换飞书 docx 正文 |
| `feishu_doc_delete_blocks` | 删除飞书 docx 根级块区间 |
| `feishu_doc_delete_document` | 删除整篇飞书 docx，必须有用户明确确认 |
| `feishu_folder_create` | 创建飞书云空间文件夹 |
| `feishu_image_send` | 把 workspace 内本地图片发回当前飞书会话 |
| `feishu_file_send` | 把 workspace 内本地非图片文件发回当前飞书会话 |
| `feishu_message_send` | 向当前飞书会话发送文本，可结构化 @ 群成员 |
| `cron_task` | 创建、查看、更新、暂停、恢复、删除、立即执行定时任务 |
| `grok_search` | 通过配置好的 Grok 搜索模型联网搜索和事实核验（默认关闭） |
| `web_search` | 通过 SearXNG 元搜索引擎搜索网页，返回标题、URL 和摘要（默认开启，免费）|
| `tts_synthesize` | 使用阿里云百炼 CosyVoice 生成语音文件 |
| `tts_clone_voice` | 使用公网参考音频创建声音复刻音色 |
| `tts_query_voice` | 查询声音复刻音色状态 |

其中：

- `cron_task` 由 `CRON_ENABLED` 控制，默认开启。
- `web_search` 由 `WEB_SEARCH_ENABLED` 控制，默认开启，基于 SearXNG 免费元搜索引擎，无需 API Key。
- `grok_search` 由 `GROK_SEARCH_ENABLED` 控制，默认关闭，需要配置 `GROK_SEARCH_API_KEY` 才能调用。
- TTS 工具由 `ALIYUN_TTS_ENABLED` 控制，默认关闭。
- 所有文件/图片发送工具都限制在当前 workspace 内，不能越界发送任意路径。

---

## 架构

```text
飞书用户/群聊
   ↓
飞书开放平台 WebSocket 长连接
   ↓
Pi Gateway
   ├─ 飞书事件解析与路由
   ├─ 私聊/群聊访问控制
   ├─ 消息归一化：text/post/image/audio/file
   ├─ 媒体下载、语音转写
   ├─ 会话状态与 workspace 管理
   ├─ Pi Code Agent runtime
   ├─ 飞书文档/文件/消息/定时任务 extension tools
   ├─ Cron 定时任务 runner
   └─ 本机后台管理页面
   ↓
Pi 模型、工具、skills、文件系统
```

关键入口：

- `src/index.ts`：服务启动入口，装配飞书连接、Pi runtime、cron、后台管理和消息路由。
- `src/app/router.ts`：飞书消息路由、命令识别、队列和运行中消息处理。
- `src/app/prompt-service.ts`：准备 prompt、处理媒体、模型路由、调用 Pi session。
- `src/pi/runtime.ts`：创建 Pi runtime，注册 extensions，处理 AGENTS/skills 加载策略。
- `src/pi/stream.ts`：聚合 Pi 流式事件并发送飞书回复。
- `src/cron/*`：定时任务解析、存储、调度和运行。
- `src/admin/*`：本机管理后台。
- `src/feishu/*`：飞书 API、消息发送、文档、资源下载、卡片交互。

---

## 环境要求

- Node.js 22 或以上（当前开发环境验证版本：`v22.21.1`）
- npm
- 一个飞书自建应用
- 已配置可用模型的 Pi Code Agent 环境
- 可选：语音转写脚本、SenseVoice 或豆包 ASR
- 可选：Grok 搜索 API
- 可选：阿里云百炼 DashScope API Key

启动时会检查 Pi 模型注册表里的可用模型；如果没有任何可用模型，服务会直接退出。

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

至少需要填写：

```env
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
```

再确认本机 Pi Code Agent 已经配置好至少一个可用模型。

### 3. 启动

```bash
npm run start
```

`npm run start` 会先执行 TypeScript 编译，再运行 `dist/index.js`。

开发时也可以使用：

```bash
npm run dev
```

当前 `dev` 和 `start` 都是 `tsc && node dist/index.js`。

### 4. 验证

给飞书机器人私聊发送一条文本消息。如果配置正确，服务日志会出现收到消息、Pi prompt 开始和回复发送相关日志。

---

## 飞书应用配置要点

Pi Gateway 使用飞书开放平台 Node SDK，通过 WebSocket 长连接接收事件。

飞书应用侧通常需要：

1. 创建自建应用并启用机器人能力。
2. 获取 `App ID` 和 `App Secret`，填入 `.env`。
3. 开通长连接事件订阅。
4. 订阅消息接收事件 `im.message.receive_v1`。
5. 如果使用卡片选择工具，需要支持卡片交互事件。
6. 按需申请以下能力相关权限：
   - 接收和发送消息
   - 读取消息资源、下载图片/文件/语音
   - 上传图片、上传文件
   - 创建/读取/编辑/删除 docx 文档
   - 创建文件夹、转移文档所有权
   - 查询机器人信息、群信息、用户信息

实际权限名称以飞书开放平台后台为准；不同功能不需要一次性全部开通。

---

## 配置说明

配置集中在 `src/config.ts`，`.env.example` 提供常用项示例。

### 飞书基础配置

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `FEISHU_APP_ID` | 必填 | 飞书自建应用 App ID |
| `FEISHU_APP_SECRET` | 必填 | 飞书自建应用 App Secret |
| `FEISHU_DOMAIN` | `feishu` | `feishu` 国内飞书；`larksuite` 海外 Lark |
| `FEISHU_BOT_OPEN_ID` | 自动获取 | 机器人 open_id；通常不需要手填 |

### 私聊与群聊访问控制

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `FEISHU_P2P_CHAT_POLICY` | `whitelist` | 私聊策略：`all` 或 `whitelist` |
| `FEISHU_P2P_CHAT_ALLOWLIST` | 空 | 私聊白名单 open_id，逗号分隔 |
| `FEISHU_GROUP_CHAT_POLICY` | `disabled` | 群聊策略：`disabled`、`allowlist`、`open` |
| `FEISHU_GROUP_CHAT_ALLOWLIST` | 空 | 允许响应的群 chat_id，逗号分隔 |
| `FEISHU_GROUP_MESSAGE_MODE` | `mention` | 群消息触发方式：`mention`、`all`、`keyword` |
| `FEISHU_GROUP_MESSAGE_KEYWORDS` | 空 | keyword 模式关键词，空白分隔 |
| `FEISHU_GROUP_UNMATCHED_MESSAGE_POLICY` | `ignore` | 未触发群消息处理：`ignore` 或 `capture` |

说明：

- 私聊默认只允许白名单用户；内置 super admin 不受白名单限制。
- 群聊默认关闭。
- `allowlist + capture` 时，群里未 @/未命中关键词的消息可以暂存，下一次真正触发时作为背景上下文附加给 Pi。
- 内置 super admin 永远允许私聊，不受私聊白名单影响。

### 数据与 workspace

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DATA_DIR` | `./data` | 网关状态、用户会话索引、cron、设置等数据目录 |
| `PI_WORKSPACE_ROOT` | `~/code/pi-workspace` | 每个私聊/群聊独立 workspace 的根目录 |
| `PI_DISABLE_GLOBAL_AGENTS` | `false` | 是否禁用全局 AGENTS/CLAUDE 规则文件 |
| `PI_GATEWAY_AGENTS_FILE` | `~/.pi/feishu-gateway/AGENTS.md` | 仅网关注入的全局规则文件 |

workspace 规则：

- 私聊 workspace：`<PI_WORKSPACE_ROOT>/<userId 或 openId>/`
- 群聊 workspace：`<PI_WORKSPACE_ROOT>/conversations/<chatId>/`
- 首次创建 workspace 时会自动生成一个基础 `AGENTS.md`。
- 飞书下载的文件放在当前 workspace 的 `.feishu-inbox/<messageId>/` 下。

### 回复与运行时

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `LOG_LEVEL` | `info` | `debug`、`info`、`warn`、`error` |
| `STREAMING_ENABLED` | `false` | 默认是否启用飞书流式卡片回复 |
| `TEXT_CHUNK_LIMIT` | `2000` | 飞书单条文本分段上限 |
| `FEISHU_PROCESSING_REACTION_TYPE` | 空 | 处理中 reaction emoji_type；非法会自动禁用 |
| `FEISHU_STEERING_REACTION_TYPE` | `OnIt` | 运行中追加消息时的 reaction emoji_type |

### 图片与语音处理

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `FEISHU_AUDIO_TRANSCRIBE_PROVIDER` | `whisper` | 语音转写：`whisper`、`sensevoice`、`doubao` |
| `FEISHU_AUDIO_TRANSCRIBE_SCRIPT` | `~/.openclaw/skills/audio-transcribe/transcribe.sh` | whisper 外部转写脚本 |
| `FEISHU_AUDIO_TRANSCRIBE_LANGUAGE` | 空 | 语音识别语言；常用 `zh` |
| `FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_PYTHON` | `python3` | SenseVoice Python 可执行文件 |
| `FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_MODEL` | `iic/SenseVoiceSmall` | SenseVoice 模型名或本地路径 |
| `FEISHU_AUDIO_TRANSCRIBE_SENSEVOICE_DEVICE` | `cpu` | SenseVoice 设备 |
| `FEISHU_AUDIO_TRANSCRIBE_DOUBAO_API_KEY` | 空 | 豆包录音文件极速版 API Key |

图片处理逻辑：

- 当前模型支持图片输入时，图片以 base64 image content 直接传给 Pi。
- 当前模型不支持图片输入时，直接提示用户切换到支持视觉能力的模型。

语音处理逻辑：

- `whisper`：调用外部 shell 脚本。
- `sensevoice`：调用仓库内 `scripts/sensevoice_transcribe.py`。
- `doubao`：调用火山引擎豆包 ASR 接口，仅支持 WAV、MP3、OGG/OPUS 等已适配格式。

### 定时任务

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `CRON_ENABLED` | `true` | 是否启用定时任务服务和 `cron_task` 工具 |
| `CRON_DEFAULT_TZ` | `Asia/Shanghai` | cron 表达式默认时区 |
| `CRON_JOB_TIMEOUT_MS` | `1800000` | 单个定时任务执行超时，默认 30 分钟 |

cron 数据保存在：

```text
DATA_DIR/cron/jobs.json
```

### Web 搜索

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `WEB_SEARCH_ENABLED` | `true` | 是否注册 `web_search` 工具 |
| `WEB_SEARCH_BASE_URL` | `https://sx.hkun.top` | SearXNG 实例地址 |

### Grok 搜索

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `GROK_SEARCH_ENABLED` | `false` | 是否注册 `grok_search` 工具 |
| `GROK_SEARCH_API_KEY` | 空 | 搜索模型 API Key |
| `GROK_SEARCH_BASE_URL` | `https://jiuuij.de5.net` | OpenAI-compatible base URL |
| `GROK_SEARCH_MODEL` | `grok-4.20-multi-agent-console` | 搜索模型名 |

### 阿里云百炼 TTS

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `ALIYUN_TTS_ENABLED` | `false` | 是否注册 TTS 工具 |
| `DASHSCOPE_API_KEY` | 空 | 阿里云百炼 API Key |
| `ALIYUN_TTS_BASE_URL` | `https://dashscope.aliyuncs.com/api/v1` | DashScope API 地址 |
| `ALIYUN_TTS_MODEL` | `cosyvoice-v3-flash` | 默认 TTS 模型 |
| `ALIYUN_TTS_VOICE` | `longlaoyi_v3` | 默认音色 |
| `ALIYUN_TTS_FORMAT` | `mp3` | 输出格式：`mp3`、`wav`、`pcm`、`opus` |
| `ALIYUN_TTS_SAMPLE_RATE` | `24000` | 采样率 |

启用后，`tts_synthesize` 默认会输出到当前 workspace 的 `tts/` 目录。若用户要求发回飞书，模型会继续调用 `feishu_file_send`。

### 本机管理后台

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `ADMIN_ENABLED` | `false` | 是否启用后台 |
| `ADMIN_HOST` | `127.0.0.1` | 后台监听地址 |
| `ADMIN_PORT` | `8787` | 后台端口 |
| `ADMIN_PASSWORD` | 空 | 后台登录密码；启用后台时至少 12 位 |
| `ADMIN_SESSION_TTL_MS` | `86400000` | 后台登录态有效期 |

后台默认关闭。需要使用时，先设置 `ADMIN_ENABLED=true` 和至少 12 位的 `ADMIN_PASSWORD`。启用后的默认地址是：

```text
http://127.0.0.1:8787/admin/
```

后台只建议绑定本机地址。

---

## 飞书命令

所有网关命令都以 `/` 开头。发送 `/commands` 可以查看当前会话中你有权限使用的命令。

### 会话

| 命令 | 说明 |
| --- | --- |
| `/new` | 新建会话 |
| `/reset` | 重置当前会话 |
| `/status` | 查看当前会话状态 |
| `/context` | 查看已加载的 AGENTS/上下文文件 |
| `/sessions` | 查看历史会话 |
| `/sessions -n <页码>` | 翻页查看历史会话 |
| `/resume <序号或会话ID前缀>` | 恢复历史会话 |

### 模型与推理

| 命令 | 说明 |
| --- | --- |
| `/model` | 查看模型配置和可用模型 |
| `/model <provider>` | 按 provider 筛选可用模型 |
| `/model <序号或provider/model>` | 设置 heavy 主模型 |
| `/model router <序号或provider/model>` | 设置路由分类模型 |
| `/model light <序号或provider/model>` | 设置轻量模型 |
| `/model heavy <序号或provider/model>` | 设置重型模型 |
| `/route` | 查看模型路由状态 |
| `/route on` | 开启模型路由，要求 router/light/heavy 都已配置 |
| `/route off` | 关闭模型路由 |
| `/settings think off|minimal|low|medium|high|xhigh` | 设置推理强度 |

模型路由逻辑：

- 未配置 heavy 模型时不路由。
- 路由关闭时使用 heavy 模型。
- 有图片的任务直接使用 heavy 模型。
- 路由开启后，router 模型只负责判断任务难度；simple/medium 走 light，hard 走 heavy。
- 路由失败时自动回退 heavy。

### 回复与工具展示

| 命令 | 说明 |
| --- | --- |
| `/settings` | 查看当前设置 |
| `/settings stream on|off` | 设置当前目标是否流式回复 |
| `/toolcalls` | 查看工具调用展示方式 |
| `/toolcalls off` | 关闭工具调用展示 |
| `/toolcalls name` | 只展示工具名 |
| `/toolcalls focus` | 聚焦展示工具进度 |
| `/toolcalls full` | 展示较完整工具调用详情 |
| `/tools` | 查看当前 session 可用工具和启用状态 |
| `/tools on <tool...>` | 启用工具 |
| `/tools off <tool...>` | 禁用工具 |
| `/tools set <tool...>` | 只保留指定工具 |
| `/tools reset` | 恢复默认工具集合 |
| `/skill-folder` | 查看私有技能目录开关 |
| `/skill-folder on|off` | 控制新会话是否加载 `~/.agents/skills` |

### 运行控制

| 命令 | 说明 |
| --- | --- |
| `/stop` | 停止当前正在执行的任务 |
| `/next <内容>` | 把补充内容排到当前任务后处理 |
| `/restart` | 重启网关；仅 super admin 私聊可用 |

`/next` 适合长任务正在跑时补充要求。普通运行中消息也会尽量作为 steering 消息写入当前 Pi session。

### 语音与 reaction

| 命令 | 说明 |
| --- | --- |
| `/stt provider whisper|sensevoice|doubao` | 切换语音转写方式；仅 super admin 私聊可用 |
| `/stream on|off` | 设置全局默认流式回复；仅 super admin 私聊可用 |
| `/reaction on|off` | 开关处理中 reaction；仅 super admin 私聊可用 |

### 私聊访问控制

| 命令 | 说明 |
| --- | --- |
| `/p2p` | 查看私聊策略 |
| `/p2p policy all|whitelist` | 切换私聊策略 |
| `/p2p allowlist show` | 查看私聊白名单 |
| `/p2p allowlist add <open_id...>` | 加入私聊白名单 |
| `/p2p allowlist remove <open_id...>` | 移出私聊白名单 |

`/p2p` 只允许 super admin 私聊使用。修改会持久化保存到 `DATA_DIR/settings/`。

### 群聊设置

群里可用：

| 命令 | 说明 |
| --- | --- |
| `/group` | 查看当前群聊设置 |
| `/group policy disabled|allowlist|open` | 设置当前群聊开关 |
| `/group mode mention|all|keyword` | 设置当前群聊触发方式 |
| `/group keywords show` | 查看关键词 |
| `/group keywords set <关键词...>` | 设置关键词 |
| `/group keywords clear` | 清空关键词 |
| `/group unmatched capture|ignore` | 设置未触发消息暂存策略 |
| `/group unmatched show` | 查看暂存状态 |
| `/group unmatched clear` | 清空暂存消息 |

私聊里 super admin 可用：

| 命令 | 说明 |
| --- | --- |
| `/group allowlist show` | 查看全局群白名单 |
| `/group allowlist add <chat_id...>` | 添加群白名单 |
| `/group allowlist remove <chat_id...>` | 移除群白名单 |

### 定时任务

| 命令 | 说明 |
| --- | --- |
| `/cron` | 查看帮助 |
| `/cron list` | 查看当前目标的定时任务 |
| `/cron run <jobId>` | 立即安排执行一次 |
| `/cron pause <jobId>` | 暂停任务 |
| `/cron resume <jobId>` | 恢复任务 |
| `/cron stop <jobId>` | 停止正在运行的那一次 |
| `/cron remove <jobId>` | 删除任务 |

新增一次性任务：

```text
/cron add
name: 20分钟后提醒
at: 20m
prompt:
提醒我开会。
```

新增周期任务：

```text
/cron add
name: 每日早报
cron: 0 9 * * *
tz: Asia/Shanghai
prompt:
总结今天的待办和需要优先处理的事。
```

说明：

- `at` 支持相对时间或 ISO 时间。
- `cron` 支持 cron 表达式。
- 一次性任务成功执行后默认删除。
- 定时任务按当前私聊/群聊作用域隔离。
- 当前会话忙时，手动 run 会被延后到当前回复结束后执行。

### Skills 统计

| 命令 | 说明 |
| --- | --- |
| `/skills` | 查看当前 session 可用 skills |
| `/skillstat` | 查看 skill 使用统计；仅 super admin 私聊可用 |

skill 使用统计通过监听模型读取 `SKILL.md` 的 `read` 工具调用实现。

---

## 权限模型

### 私聊

- 能否进入私聊由 `FEISHU_P2P_CHAT_POLICY` 和白名单决定。
- 普通私聊用户可以使用会话、模型、设置、工具、cron 等常用命令。
- 读取、查找、修改本机文件或执行本机命令的工具，只允许 super admin 在私聊中启用。
- `/p2p`、`/restart`、`/stt`、`/stream`、`/reaction`、`/skillstat` 只允许 super admin 私聊使用。

### 群聊

- 群聊默认关闭。
- 群聊消息是否进入网关由群策略、白名单、触发方式和关键词共同决定。
- 群里任何成员可以使用部分只读/运行控制命令，例如 `/commands`、`/status`、`/context`、`/skills`、`/stop`、`/next`。
- 修改模型、工具、设置、cron、群设置等命令需要群主或 super admin。
- 群聊中不能启用会直接操作机器人所在电脑的文件或命令工具。
- 群白名单管理只允许 super admin 在私聊中操作。

---

## 本机管理后台

本机管理后台默认关闭。设置 `ADMIN_ENABLED=true` 并配置至少 12 位密码后，可通过以下地址访问：

```text
http://127.0.0.1:8787/admin/
```

后台功能：

- 选择当前执行目标：历史私聊、历史群聊、群白名单、定时任务里出现过的目标
- 查看当前会话状态、历史会话和已加载上下文
- 查看和切换模型、配置 router/light/heavy、开关模型路由
- 开关流式回复、语音识别方式、reaction、工具调用展示、技能目录
- 查看、运行、暂停、恢复、停止、删除定时任务
- 管理当前群聊策略、触发模式、关键词、未触发消息暂存
- 查看和开关工具
- 停止当前任务、发送 `/next`、触发 `/restart`
- 查看 skills 和 skill 使用统计
- 可选择是否把后台执行命令的结果同步发送到飞书

后台本质上是 `/命令` 的本机 UI 快捷入口，不是公网管理系统。

---

## 飞书文档能力

文档工具只写新版 docx，不写旧版 doc，也不直接写 wiki 节点。

支持：

- 创建 docx
- 读取 docx
- 通过 wiki 链接解析到 docx 后读取
- 追加正文
- 替换整篇正文
- 删除根级块区间
- 删除整篇文档
- 创建文件夹
- 新建文档后自动转移所有权给 super admin，同时保留应用编辑权限

正文支持 Markdown 或 HTML。若内容中包含真实图片语法：

```markdown
![alt](https://example.com/image.png)
```

或：

```html
<img src="https://example.com/image.png">
```

服务会优先尝试将图片上传并嵌入飞书文档。若权限、链接、下载或格式异常，会退回保留图片链接。

删除整篇文档有双重保护：

1. 工具参数必须 `confirm=true`。
2. 最近一条用户消息必须明确表达确认删除整篇文档。

---

## 文件、图片和生成图

### 接收文件

用户发送飞书文件时，网关会下载文件并在 prompt 里告诉 Pi 本地路径。之后模型可以用 Pi 的文件工具读取或处理该文件。

### 发送文件

模型生成最终文件后，应使用：

- `feishu_image_send` 发送图片
- `feishu_file_send` 发送 PDF、CSV、TXT、ZIP、XLSX、PPTX 等非图片文件

两者都只能发送当前 workspace 内文件，避免越权读取服务器任意路径。

### 自动转发生成图

如果模型回复里包含本机 CPA 图片接口生成的 URL，例如：

```text
http://localhost:<port>/v1/generated-images/<id>.png
```

网关会尝试下载该图片并直接作为飞书图片发送；发送成功后会从文本回复中移除原始本地 URL。

---

## 数据目录

默认数据目录是 `./data`，不会提交到 git。

常见结构：

```text
data/
  users/                 # 私聊用户状态
  conversations/         # 群聊/会话目标状态
  cron/jobs.json         # 定时任务
  settings/              # p2p、group 等运行时设置
  quoted-messages/       # 引用消息缓存
  restart/               # 重启提示状态
```

workspace 默认在 `~/code/pi-workspace`，也不会提交到本仓库。

---

## 开发

### 常用脚本

```bash
npm run build
npm test
npm run start
```

| 脚本 | 说明 |
| --- | --- |
| `npm run build` | TypeScript 编译到 `dist/` |
| `npm test` | 运行 Vitest 测试 |
| `npm run start` | 编译后启动服务 |
| `npm run dev` | 当前同 `start` |

### 测试

测试位于 `tests/`，覆盖配置、飞书事件、路由、命令、cron、后台、文档、文件、TTS、Grok 搜索等模块。

运行：

```bash
npm test
```

### 代码组织

```text
src/
  admin/       # 本机后台
  app/         # 网关应用层：路由、命令、状态、prompt service
  cron/        # 定时任务
  feishu/      # 飞书 API、消息、文档、卡片、资源
  pi/          # Pi runtime、sessions、extensions、模型路由
  storage/     # 本地 JSON 状态存储
```

### 维护注意事项

- 修改飞书卡片前先核对飞书官方字段，避免构造不存在的字段导致 400。
- 修改命令能力时，同时检查：
  - `src/app/commands.ts`
  - `src/app/command-service/catalog.ts`
  - `src/app/command-permissions.ts`
  - 对应 command handler 和测试
- 新增 extension tool 时，要写清 `description`、`promptSnippet`、`promptGuidelines`，因为这些会直接影响 agent 是否正确调用工具。
- 修改 cron 行为时，要同时考虑私聊/群聊 scope 隔离。
- 修改媒体处理时，要确认 text/post/image/audio/file 和引用消息路径都不回退。
- 不要把生产 `data/`、workspace、`.env`、日志、虚拟环境提交进仓库。

---

## 安全边界

Pi Gateway 默认具备较强本地自动化能力，因此需要注意：

- `.env` 不得提交。
- 后台默认关闭；启用时密码至少 12 位，并保持绑定 `127.0.0.1`。
- 群聊功能默认关闭，开启前确认群成员范围。
- 文件发送工具限制在 workspace 内。
- 删除飞书整篇文档必须有用户明确确认。
- 群聊未触发消息暂存仅作为背景上下文，不应自动执行其中的请求。
- `/restart` 等高风险命令只允许 super admin 私聊执行。

---

## 常见问题

### 启动后提示没有可用模型

Pi Gateway 启动时会调用 Pi 模型注册表自检。请先配置 Pi Code Agent 的模型和鉴权，确保本机 Pi 能正常发起一次模型请求。

### 私聊没有反应

检查：

- 飞书应用凭证是否正确
- 长连接是否成功建立
- 是否订阅了消息事件
- 私聊策略是否为 `whitelist` 且用户不在白名单
- 日志里是否出现权限或事件解析失败

### 群聊没有反应

检查：

- `FEISHU_GROUP_CHAT_POLICY` 是否仍是 `disabled`
- allowlist 模式下群 chat_id 是否已加入白名单
- 当前触发方式是 `mention`、`all` 还是 `keyword`
- keyword 模式下是否设置了关键词
- `FEISHU_BOT_OPEN_ID` 是否能自动获取或手动配置正确

### 图片无法处理

当前模型不支持图片输入时，网关会提示切换到支持视觉能力的模型后重试。

### 语音转写失败

按当前 provider 检查：

- `whisper`：外部脚本路径和执行权限
- `sensevoice`：Python 环境、依赖、模型路径、设备
- `doubao`：API Key、音频格式、网络和接口返回 logid

### 飞书文档图片没有嵌入

常见原因：

- 图片链接不是直链
- 链接需要登录
- 下载返回的不是图片
- 飞书应用缺少上传图片权限
- 图片过大或格式异常

失败时工具会尽量保留原始图片链接。

---

## 项目定位

Pi Gateway 不是一个通用 SaaS 后台，而是一个面向个人/小团队的飞书入口层：

- 飞书负责交互入口
- Pi 负责 agent runtime、模型、工具和 skills
- 本地 workspace 负责文件上下文和产物
- 网关负责连接、隔离、权限、媒体转换、飞书能力和定时任务

保持它简单、清晰、可控，是维护这个项目的核心原则。
