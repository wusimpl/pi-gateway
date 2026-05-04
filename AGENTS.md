## 测试
每次完成/ 修改一个功能后，需要编写测试并全部通过，测试尽量使用真实环境（例如涉及到api key使用真实的，而不是假数据，可以向
用户要api key，又比如涉及到某些环境区别，必须用和用户实际使用软件时基本相同的环境去测试）
不要写 UI 文案断言测试，这毫无意义。测试只盯行为、状态、数据结构和关键调用，不要因为界面文案改了几个字就红。

## 开发
禁止使用worktree
改飞书卡片前先对照官方字段，尤其 `table.columns` 不能自造属性如 `text_align`，否则会被飞书 400 拒掉。
AI agent 编排要两手抓：一手抓 prompt engineering，一手抓 harness。遇到 agent 行为偏差时，先判断是否应通过对应工具的 description、promptGuidelines 或 skill 指令修正；不要低估提示词对 agent 的约束力。harness 负责硬性兜底、错误暴露和安全边界，但不要把具体场景规则硬塞进通用工具，尤其不要为了 cron、飞书卡片、文档等特定场景污染通用 extension tool。

## Pi Skills
涉及 Pi 的 skill、技能目录、`/skills`、`SKILL.md` 或“有没有配套 skill”这类问题时，默认先检查 `~/.pi/agent/skills`，不要只看项目目录。项目内和全局目录都可能有 skills；如果没有特别说明，优先认为 `~/.pi/agent/skills` 是有效技能来源之一。
