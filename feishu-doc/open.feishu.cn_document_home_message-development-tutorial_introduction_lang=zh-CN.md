---
url: "https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN"
title: "简介 - 开发教程 - 开发文档 - 飞书开放平台"
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

[开发教程总览](https://open.feishu.cn/document/course)

[快速调用服务端 API（发送消息）](https://open.feishu.cn/document/introduction)

[快速调用服务端 API（创建一个多维表格）](https://open.feishu.cn/document/introduction-2)

开发一个自动回复机器人

开发一个卡片交互机器人

将已有网页应用嵌入飞书工作台

快速开发网页应用（Node.js）

快速开发网页应用（Python）

快速接入通讯录

快速接入多维表格

自动考勤管理

部门人员管理

人员与考勤管理

机器人自动拉群报警

[简介](https://open.feishu.cn/document/home/message-development-tutorial/introduction)

[准备工作](https://open.feishu.cn/document/home/message-development-tutorial/determine-the-api-and-event-to-call)

[步骤一：创建并配置应用](https://open.feishu.cn/document/home/message-development-tutorial/turn-on-app-permissions)

[步骤二：下载并配置示例代码](https://open.feishu.cn/document/home/message-development-tutorial/robot-creates-group-chat)

[步骤三：创建群聊并发送告警](https://open.feishu.cn/document/home/message-development-tutorial/the-robot-sends-an-alarm-notification)

[步骤四：监听消息卡片回调](https://open.feishu.cn/document/home/message-development-tutorial/monitor-and-interact-with-messages-in-the-group)

[步骤五：监听群消息](https://open.feishu.cn/document/home/message-development-tutorial/modify-the-group-name-after-solving-the-problem)

[步骤六：获取群历史消息进行复盘](https://open.feishu.cn/document/home/message-development-tutorial/obtain-chat-history-of-messages-for-review)

网页应用免登（SSO）

二维码扫码登录

文档迁移后替换链接

电子表格统计销售额

多维表格管理敏捷项目

同步企业组织架构至飞书

向指定部门群发消息

自动发送入群欢迎消息

快速开发三方审批

快速构建日历日程

自动获取日历日程

历史版本（不推荐）

[开发教程](https://open.feishu.cn/document/course) [机器人自动拉群报警](https://open.feishu.cn/document/home/message-development-tutorial/introduction)

简介

# 简介

复制页面

最后更新于 2024-10-13

本文内容

[操作流程](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#1d983b0c "操作流程")

[实现效果](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#6b060ed7 "实现效果")

[使用到的 API 与事件列表](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#c2b3afd2 "使用到的 API 与事件列表")

[群组 API](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#a13757c5 "群组 API")

[消息 API](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#449ebd58 "消息 API")

[消息事件](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#278e32a3 "消息事件")

# 简介

当业务出现线上故障时，需尽快通知相关的成员解决问题。基于飞书开放能力，可以通过飞书机器人实现自动创建飞书项目群，并自动拉入相关的负责人，进而实现以下场景功能：

- 通过项目群推送报警通知，提示故障内容。

- 在群内跟进处理并及时同步进展，事后也可以通过群组沟通记录及时进行复盘。

- 当问题解决时，机器人可将群名自动修改为 `已解决`。


本教程将帮助你了解如何从零开始创建飞书机器人，并实现上述功能。

## 操作流程

![](<Base64-Image-Removed>)

## 实现效果

1. 机器人自动拉群。





![](<Base64-Image-Removed>)

2. 机器人自动推送报警通知。





![](<Base64-Image-Removed>)

3. 问题解决后自动修改群名。





![](<Base64-Image-Removed>)


## 使用到的 API 与事件列表

在机器人自动拉群报警通知的场景中，你需要调用消息与群组业务域的 API，包括：

### 群组 API

|  | **[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 |  | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** |
| --- | --- | --- | --- | --- |
| [创建群](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create)<br>`POST` /open-apis/im/v1/chats<br>> 创建群并设置群头像、群名、群描述等。 | 创建群<br>获取与更新群组信息 | tenant\_access\_token |
| [获取群信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/get)<br>`GET` /open-apis/im/v1/chats/:chat\_id<br>> 获取群名称、群描述、群头像、群主 ID 等群基本信息。 | 查看群信息<br>获取群组信息<br>获取与更新群组信息 | tenant\_access\_token |
| [更新群信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/update)<br>`PUT` /open-apis/im/v1/chats/:chat\_id<br>> 更新群头像、群名称、群描述、群配置、转让群主等。 | 更新群信息<br>获取与更新群组信息 | tenant\_access\_token |

### 消息 API

|  | **[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求 |  | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** |
| --- | --- | --- | --- | --- |
| [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)<br>`POST` /open-apis/im/v1/messages<br>> 给指定用户或者会话发送消息，支持文本、富文本、卡片、群名片、个人名片、图片、视频、音频、文件、表情包。 | 以应用的身份发消息<br>获取与发送单聊、群组消息<br>发送消息V2<br>历史版本 | tenant\_access\_token |
| [上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)<br>`POST` /open-apis/im/v1/images<br>> 上传图片接口，可以上传 JPEG、PNG、WEBP 格式图片。 | 获取与上传图片或文件资源 <br>上传文件V2<br>历史版本 | tenant\_access\_token |
| [获取会话历史消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list)<br>`GET` /open-apis/im/v1/messages<br>> 获取会话（包括单聊、群组）的历史消息。 | 获取单聊、群组消息<br>获取与发送单聊、群组消息<br>获取单聊、群组的历史消息<br>历史版本<br>仅自建应用 | tenant\_access\_token |

### 消息事件

|  | **[事件 (Event)](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)** | 触发时机 | 权限要求（满足任一） | 事件类型 |
| --- | --- | --- | --- | --- |
| [接收消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive) | 机器人接收到用户发送的消息后触发此事件。 | 接收群聊中@机器人消息事件<br>获取群组中所有消息（敏感权限）<br>读取用户发给机器人的单聊消息<br>获取用户发给机器人的单聊消息（历史版本）<br>历史版本<br>获取用户在群组中@机器人的消息（历史版本）<br>历史版本<br>获取群聊中所有的用户聊天消息<br>历史版本<br>仅自建应用 | im.message.receive\_v1 |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fhome%2Fmessage-development-tutorial%2Fintroduction%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：步骤七：体验效果](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/step-7-experience-the-effect) [下一篇：准备工作](https://open.feishu.cn/document/home/message-development-tutorial/determine-the-api-and-event-to-call)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[操作流程](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#1d983b0c "操作流程")

[实现效果](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#6b060ed7 "实现效果")

[使用到的 API 与事件列表](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#c2b3afd2 "使用到的 API 与事件列表")

[群组 API](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#a13757c5 "群组 API")

[消息 API](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#449ebd58 "消息 API")

[消息事件](https://open.feishu.cn/document/home/message-development-tutorial/introduction?lang=zh-CN#278e32a3 "消息事件")

尝试一下

意见反馈

技术支持

收起

展开