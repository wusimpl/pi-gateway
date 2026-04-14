---
url: "https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN"
title: "接收消息 - 服务端 API - 开发文档 - 飞书开放平台"
---

[![lark](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/899fa60e60151c73aaea2e25871102dc.svg)](https://open.feishu.cn/?lang=zh-CN)

- [客户案例](https://open.feishu.cn/solutions?lang=zh-CN)

- [应用中心](https://app.feishu.cn/?lang=zh-CN)

- [开发文档](https://open.feishu.cn/document)

- [智能助手\\
\\
AI 开发](https://open.feishu.cn/app/ai/playground?from=nav&lang=zh-CN)


你可以输入文档关键词、开发问题、Log ID、错误码

- [开发者后台](https://open.feishu.cn/app?lang=zh-CN)


登录

- [文档首页](https://open.feishu.cn/document/home/index)
- [开发指南](https://open.feishu.cn/document/client-docs/intro)
- [开发教程](https://open.feishu.cn/document/course)
- [服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide)
- [客户端 API](https://open.feishu.cn/document/client-docs/h5/)
- [飞书 CLI](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu)
- [OpenClaw 飞书官方插件](https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh)

API 调试台 [卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_header) 平台动态

搜索目录

[智能助手：从自然语言到可执行代码](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide)

API 调用指南

事件与回调

服务端 SDK

认证及授权

通讯录

组织架构

消息

[消息概述](https://open.feishu.cn/document/server-docs/im-v1/introduction)

[消息常见问题](https://open.feishu.cn/document/server-docs/im-v1/faq)

消息管理

[消息管理概述](https://open.feishu.cn/document/server-docs/im-v1/message/intro)

[话题概述](https://open.feishu.cn/document/im-v1/message/thread-introduction)

消息内容（content ）结构介绍

[发送消息](https://open.feishu.cn/document/server-docs/im-v1/message/create)

[回复消息](https://open.feishu.cn/document/server-docs/im-v1/message/reply)

[编辑消息](https://open.feishu.cn/document/server-docs/im-v1/message/update)

[转发消息](https://open.feishu.cn/document/server-docs/im-v1/message/forward)

[合并转发消息](https://open.feishu.cn/document/server-docs/im-v1/message/merge_forward)

[转发话题](https://open.feishu.cn/document/im-v1/message/forward-2)

[撤回消息](https://open.feishu.cn/document/server-docs/im-v1/message/delete)

[添加跟随气泡](https://open.feishu.cn/document/im-v1/message/push_follow_up)

[消息发送者查询消息已读状态](https://open.feishu.cn/document/server-docs/im-v1/message/read_users)

[获取会话历史消息](https://open.feishu.cn/document/server-docs/im-v1/message/list)

[获取消息中的资源文件](https://open.feishu.cn/document/server-docs/im-v1/message/get-2)

[获取指定消息的内容](https://open.feishu.cn/document/server-docs/im-v1/message/get)

事件

[接收消息](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive)

[消息已读](https://open.feishu.cn/document/server-docs/im-v1/message/events/message_read)

[撤回消息](https://open.feishu.cn/document/server-docs/im-v1/message/events/recalled)

批量消息

图片信息

文件信息

消息加急

表情回复

Pin

消息卡片

URL 预览

群组

飞书卡片

消息流

企业自定义群标签

云文档

日历

视频会议

妙记

考勤打卡

审批

机器人

服务台

任务

邮箱

应用信息

企业信息

认证信息

个人设置

搜索

AI 能力

飞书妙搭

飞书 aPaaS

飞书 Aily

管理后台

公司圈

飞书人事（标准版）

飞书人事（企业版）

Payroll

招聘

OKR

实名认证

智能门禁

绩效

飞书词典

安全合规

关联组织

工作台

飞书主数据

汇报

eLearning

历史版本（不推荐）

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [消息](https://open.feishu.cn/document/server-docs/im-v1/introduction) [消息管理](https://open.feishu.cn/document/server-docs/im-v1/message/intro) [事件](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive)

接收消息

# 接收消息

复制页面

最后更新于 2024-10-13

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#7bb6c149 "前提条件")

[注意事项](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#355ec8c0 "注意事项")

[事件](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#5e957574 "事件")

[事件体](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#bea8b65 "事件体")

[事件体示例](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#52f59572 "事件体示例")

[事件订阅示例代码](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#19737fa6 "事件订阅示例代码")

# 接收消息

机器人接收到用户发送的消息后触发此事件。

## 前提条件

- 应用需要开启 [机器人能力](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-enable-bot-ability)
- 你需要在应用中配置事件订阅，订阅 消息与群组 分类下的 接收消息v2.0 事件才可接收推送。了解事件订阅可参见 [事件订阅概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)

## 注意事项

- 系统会根据应用具备的权限，判断可推送的信息：

  - 当具备获取用户发给机器人的单聊消息（ im:message.p2p\_msg） 或者 读取用户发给机器人的单聊消息（im:message.p2p\_msg:readonly） 权限，可接收与机器人单聊会话中用户发送的所有消息
  - 当具备获取群组中所有消息（im:message.group\_msg） 权限时，可接收与机器人所在群聊会话中用户发送的所有消息（不包含机器人发送的消息）
  - 当具备获取用户在群组中@机器人的消息（im:message.group\_at\_msg） 或者 接收群聊中@机器人消息事件（im:message.group\_at\_msg:readonly） 权限时，可接收机器人所在群聊中用户 @ 机器人的消息
  - 当具备 获取客户端用户代理信息（im:user\_agent:read） 权限时，可获取`user_agent` 用户代理信息
- 特殊情况下可能会收到重复的推送，如有幂等需求请使用 message\_id去重，不要依赖event\_id


## 事件

| 基本 |  |
| --- | --- |
| 事件类型 | im.message.receive\_v1 |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求<br> <br>开启任一权限即可 | 读取用户发给机器人的单聊消息<br>接收群聊中@机器人消息事件<br>获取群组中所有消息（敏感权限）<br>获取用户在群组中@机器人的消息（历史版本）<br>历史版本<br>获取群聊中所有的用户聊天消息<br>历史版本<br>仅自建应用<br>获取用户发给机器人的单聊消息（历史版本）<br>历史版本 |
| 字段权限要求 | 该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户 user ID<br>仅自建应用 |
| 推送方式 | [Webhook](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM) |

### 事件体

| 名称<br>展开子列表 | 类型 | 描述 |
| --- | --- | --- |
| schema | string | 事件模式 |
| header | event\_header | 事件头 |
| event | - | - |

### 事件体示例

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

{

"schema": "2.0",

"header": {

"event\_id": "5e3702a84e847582be8db7fb73283c02",

"event\_type": "im.message.receive\_v1",

"create\_time": "1608725989000",

"token": "rvaYgkND1GOiu5MM0E1rncYC6PLtF7JV",

"app\_id": "cli\_9f5343c580712544",

"tenant\_key": "2ca1d211f64f6438"

    },

"event": {

"sender": {

"sender\_id": {

"union\_id": "on\_8ed6aa67826108097d9ee143816345",

"user\_id": "e33ggbyz",

"open\_id": "ou\_84aad35d084aa403a838cf73ee18467"

            },

"sender\_type": "user",

"tenant\_key": "736588c9260f175e"

        },

### 事件订阅示例代码

事件订阅流程可参考： [事件订阅概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)，新手入门可参考： [教程](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-an-echo-bot/introduction)

订阅方式

使用长连接接收事件将事件推送至开发者服务器

Go SDK

Python SDK

Java SDK

Node SDK

更多

1

package main

Go SDK

Python SDK

Java SDK

Node SDK

更多

1

package main

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fim-v1%2Fmessage%2Fevents%2Freceive%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[发消息的大小有限制吗？](https://open.feishu.cn/document/server-docs/im-v1/faq#57a95eb4)

[已经推送出去的消息，能进行更改吗？](https://open.feishu.cn/document/server-docs/im-v1/faq#20c91506)

[可以通过接口给外部联系人发送消息吗？](https://open.feishu.cn/document/server-docs/im-v1/faq#3bc3de2f)

[如何设置消息中的链接打开方式（飞书导航打开、浏览器打开）？](https://open.feishu.cn/document/server-docs/im-v1/faq#ac2af3e8)

[获取消息中的资源文件接口，可以获取别人发送的消息中的资源文件吗?](https://open.feishu.cn/document/server-docs/im-v1/faq#c7f20ac)

遇到其他问题？问问 开放平台智能助手

[上一篇：获取指定消息的内容](https://open.feishu.cn/document/server-docs/im-v1/message/get) [下一篇：消息已读](https://open.feishu.cn/document/server-docs/im-v1/message/events/message_read)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#7bb6c149 "前提条件")

[注意事项](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#355ec8c0 "注意事项")

[事件](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#5e957574 "事件")

[事件体](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#bea8b65 "事件体")

[事件体示例](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#52f59572 "事件体示例")

[事件订阅示例代码](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive?lang=zh-CN#19737fa6 "事件订阅示例代码")

尝试一下

意见反馈

技术支持

收起

展开