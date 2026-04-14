---
url: "https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development?lang=zh-CN"
title: "开发前准备 - 服务端 API - 开发文档 - 飞书开放平台"
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

[服务端 SDK 概述](https://open.feishu.cn/document/server-docs/server-side-sdk)

Java SDK 指南

Golang SDK 指南

Python SDK 指南

[开发前准备](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development)

[调用服务端 API](https://open.feishu.cn/document/server-side-sdk/python--sdk/invoke-server-api)

[处理事件](https://open.feishu.cn/document/server-side-sdk/python--sdk/handle-events)

[处理回调](https://open.feishu.cn/document/server-side-sdk/python--sdk/handle-callbacks)

[场景示例](https://open.feishu.cn/document/server-side-sdk/python--sdk/scenario-example)

NodeJS SDK 指南

[常见问题](https://open.feishu.cn/document/server-side-sdk/faq)

认证及授权

通讯录

组织架构

消息

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [服务端 SDK](https://open.feishu.cn/document/server-docs/server-side-sdk) [Python SDK 指南](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development)

开发前准备

# 开发前准备

复制页面

最后更新于 2025-02-25

本文内容

[创建应用](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development?lang=zh-CN#6c58033c "创建应用")

[准备开发环境](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development?lang=zh-CN#a987e3f "准备开发环境")

[安装 Python SDK](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development?lang=zh-CN#b935c88f "安装 Python SDK")

[后续操作](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development?lang=zh-CN#9392341b "后续操作")

# 开发前准备

使用 Python SDK 调用服务端 API、处理事件和回调前，请确保你已创建了一个应用、安装 Python 环境以及服务端 Python SDK。

对于新手开发者，建议你直接上手体验 [开发自动回复机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-an-echo-bot/introduction) 或 [开发卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction) 教程，在教程示例代码中了解如何调用 API、处理事件和回调。

## 创建应用

在使用服务端 SDK 之前，你需要确保已在 [开发者后台](https://open.feishu.cn/app) 创建了一个企业自建应用或商店应用。详情参考 [创建企业自建应用](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process#a0a7f6b0) 或 [创建商店应用](https://open.feishu.cn/document/uMzNwEjLzcDMx4yM3ATM/ucjN2YjL3YjN24yN2YjN/step1-create-a-store-application)。了解选择哪种应用，参考 [应用类型](https://open.feishu.cn/document/home/app-types-introduction/overview#c3c7ad51)。

## 准备开发环境

开放平台 Python SDK 支持 Python 3.7 及以上，下载地址参见 [Download Python](https://www.python.org/downloads/)。

## 安装 Python SDK

运行以下命令，安装 Python SDK。

```

pip install lark-oapi -U
```

## 后续操作

- [调用服务端 API](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api)：介绍如何通过 SDK，自行构建 API Client、构造 API 请求、最终成功调用服务端 API。
- [处理事件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/handle-events)：介绍如何通过 SDK 封装的长连接方式处理事件、如何自建 HTTP 服务器处理事件。
- [处理回调](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/handle-callbacks)：介绍如何通过 SDK 封装的长连接方式处理回调、如何自建 HTTP 服务器处理回调。
- [场景示例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/scenario-example)：提供基于 SDK 实现的部分场景示例。

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-side-sdk%2Fpython--sdk%2Fpreparations-before-development%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[如何选择不同类型的 access token？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[如何准确选择 SDK 内 API 对应的方法？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api#5954789)

[如何获取自己的 Open ID？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[如何为应用申请所需权限？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

遇到其他问题？问问 开放平台智能助手

[上一篇：场景示例](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo) [下一篇：调用服务端 API](https://open.feishu.cn/document/server-side-sdk/python--sdk/invoke-server-api)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[创建应用](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development?lang=zh-CN#6c58033c "创建应用")

[准备开发环境](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development?lang=zh-CN#a987e3f "准备开发环境")

[安装 Python SDK](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development?lang=zh-CN#b935c88f "安装 Python SDK")

[后续操作](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development?lang=zh-CN#9392341b "后续操作")

尝试一下

意见反馈

技术支持

收起

展开