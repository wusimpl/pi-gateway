---
url: "https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/overview?lang=zh-CN"
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

[简介](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/overview)

[准备工作](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/preparation)

[步骤一：创建并配置应用](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/step-1-create-and-configure-an-application)

[步骤二：搭建消息卡片](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/step-2-build-a-message-card)

[步骤三：创建自定义审批实例](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/step-3-create-a-custom-approval-instance)

[步骤四：下载并配置项目](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/step-4-download-and-configure-the-project)

[步骤五：启动项目和服务](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/step-5-start-the-project-and-service)

[步骤六：配置事件订阅](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/step-6-configure-event-subscription)

[步骤七：体验效果](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/step-7-experience-the-effect)

机器人自动拉群报警

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

[开发教程](https://open.feishu.cn/document/course) [人员与考勤管理](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/overview)

简介

# 简介

复制页面

最后更新于 2025-01-08

本文内容

[实现效果](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/overview?lang=zh-CN#6b060ed7 "实现效果")

[操作流程](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/overview?lang=zh-CN#1d983b0c "操作流程")

[使用到的 OpenAPI 列表](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/overview?lang=zh-CN#-8176993 "使用到的 OpenAPI 列表")

# 简介

本文介绍如何开发一个基于飞书开放平台提供的 [node-sdk](https://github.com/larksuite/node-sdk) 实现的人员及考勤管理网页系统，通过该教程，您可以了解如何实现以下功能：

- 开发一个 [网页应用](https://open.feishu.cn/document/uYjL24iN/uITO4IjLykDOy4iM5gjM)
- 通过 [事件订阅](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM) 实现消息自动推送
- 通过 [应用免登](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/development-guide/step-3) 实现自动获取用户信息
- 通过调用 [通讯录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/resources) OpenAPI 实现部门及人员管理
- 通过互动 [飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-overview) 实现一键审批
- 通过 [审批](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval-overview) 一键同步日历并添加日程
- 通过 [多维表格](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview) 实现考勤数据自动录入和一键导出

本教程融合了以下子教程的实现逻辑，覆盖了完整的全链路场景，你可以根据实际需求学习以下分场景的教程内容，快速上手飞书应用的开发:

- [基于审批实现自动考勤管理](https://open.feishu.cn/document/home/automatic-attendance-management-based-on-approval/introduction)
- [基于网页应用实现人员部门管理](https://open.feishu.cn/document/home/quick-access-to-base/department-personnel-management-based-on-web-app/overview)
- [开发一个卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)
- [快速接入多维表格](https://open.feishu.cn/document/home/quick-access-to-base/preparation)
- [快速接入通讯录](https://open.feishu.cn/document/home/quick-access-to-contact-api/introduction)

## 实现效果

进入全屏退出全屏

播放暂停00:0000:00

- 2x
- 1.5x
- 1x
- 0.75x
- 0.5x

1x

小窗播放

重播

## 操作流程

本文涉及的操作流程如下图所示：

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f620e48b943b96d58e764cfe492076cd_b53FyOmBKe.png?height=208&lazyload=true&maxWidth=750&width=1023)

## 使用到的 OpenAPI 列表

本文需要调用以下 OpenAPI 实现所需能力。

|  | **[方法 (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | 权限要求（满足任一） |  | **[访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)（选择其一）** |
| --- | --- | --- | --- | --- |
| [列出记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/list)<br>`GET` /open-apis/bitable/v1/apps/:app\_token/tables/:table\_id/records | 查看、评论和导出多维表格<br>查看、评论、编辑和管理多维表格 | tenant\_access\_token<br>user\_access\_token |
| [创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)<br>`POST` /open-apis/bitable/v1/apps | 查看、评论、编辑和管理多维表格 | tenant\_access\_token<br>user\_access\_token |
| [新增记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create)<br>`POST` /open-apis/bitable/v1/apps/:app\_token/tables/:table\_id/records | 查看、评论、编辑和管理多维表格 | tenant\_access\_token<br>user\_access\_token |
| [新增数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)<br>`POST` /open-apis/bitable/v1/apps/:app\_token/tables | 查看、评论、编辑和管理多维表格 | tenant\_access\_token<br>user\_access\_token |
| [创建部门](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/create)<br>`POST` open-apis/contact/v3/departments | 获取通讯录部门组织架构信息<br>以应用身份读取通讯录<br>获取部门基础信息<br>获取用户 user ID<br>仅自建应用 | tenant\_access\_token<br>user\_access\_token |
| [获取子部门列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/children)<br>`GET` open-apis/contact/v3/departments/:department\_id/children | 获取通讯录部门组织架构信息<br>以应用身份读取通讯录<br>获取部门基础信息<br>获取用户 user ID<br>仅自建应用 | tenant\_access\_token<br>user\_access\_token |
| [获取单个部门信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/get)<br>`GET` open-apis/contact/v3/departments/:department\_id | 获取通讯录部门组织架构信息<br>以应用身份读取通讯录<br>获取部门基础信息<br>获取用户 user ID<br>仅自建应用 | tenant\_access\_token<br>user\_access\_token |
| [创建审批实例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/instance/create)<br>`POST` /open-apis/approval/v4/instances | 查看、创建、更新、删除审批应用相关信息<br>查看、创建、更新、删除原生审批实例相关信息 | tenant\_access\_token |
| [查询主日历信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar/primary)<br>`POST` open-apis/calendar/v4/calendars/primary | 获取日历、日程及忙闲信息 | tenant\_access\_token<br>user\_access\_token |
| [创建日程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/create)<br>`POST` open-apis/calendar/v4/calendars/:calendar\_id/events | 更新日历及日程信息 | tenant\_access\_token<br>user\_access\_token |
| [写入审批结果](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/attendance-v1/user_approval/create)<br>`POST` open-apis/attendance/v1/user\_approvals | 写入打卡数据<br>仅自建应用 | tenant\_access\_token |
| [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)<br>`POST` open-apis/im/v1/messages | 以应用的身份发消息<br>获取与发送单聊、群组消息<br>发送消息V2<br>历史版本 | tenant\_access\_token |
| [延时更新消息卡片](https://open.feishu.cn/document/ukTMukTMukTM/uMDO1YjLzgTN24yM4UjN)<br>`POST` open-apis/interactive/v1/card/update | 无 | tenant\_access\_token |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fquick-start-of-personnel-and-attendance-management-system%2Foverview%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：示例代码说明](https://open.feishu.cn/document/home/department-personnel-management-based-on-web-app/sample-code-description) [下一篇：准备工作](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/preparation)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[实现效果](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/overview?lang=zh-CN#6b060ed7 "实现效果")

[操作流程](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/overview?lang=zh-CN#1d983b0c "操作流程")

[使用到的 OpenAPI 列表](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/overview?lang=zh-CN#-8176993 "使用到的 OpenAPI 列表")

尝试一下

意见反馈

技术支持

收起

展开