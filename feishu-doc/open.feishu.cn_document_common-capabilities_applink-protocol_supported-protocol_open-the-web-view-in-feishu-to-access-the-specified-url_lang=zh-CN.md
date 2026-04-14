---
url: "https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN"
title: "端内web-view访问指定URL - 开发指南 - 开发文档 - 飞书开放平台"
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

平台简介

开发流程

设计应用

开发机器人

开发网页应用

开发小程序（不推荐）

开发云文档小组件

开发多维表格插件

开发工作台小组件

开发链接预览

飞书卡片

网页组件

原生集成

应用登录与用户授权

AppLink 协议

AppLink介绍

已支持的协议

[打开原生集成应用](https://open.feishu.cn/document/applink-protocol/supported-protocol/open-a-native-app)

[打开飞书](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-lark)

[打开扫一扫](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-scan-function)

[打开工作台](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-a-workplace)

[打开小程序](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-a-gadget)

[打开网页应用](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-an-h5-app)

[端内web-view访问指定URL](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url)

[打开聊天页面](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-a-chat-page)

打开日历

[打开飞书审批](https://open.feishu.cn/document/applink-protocol/supported-protocol/open-an-approval-page)

打开任务

[打开云文档](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-docs)

[打开机器人会话](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-a-bot)

[打开SSO登录页](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-sso-login-page)

开发者工具

常见问题

管理规范

平台公告

历史版本（不推荐）

[开发指南](https://open.feishu.cn/document/client-docs/intro) [AppLink 协议](https://open.feishu.cn/document/common-capabilities/applink-protocol/applink-introduction/applink-structure) [已支持的协议](https://open.feishu.cn/document/applink-protocol/supported-protocol/open-a-native-app)

端内web-view访问指定URL

# 端内web-view访问指定URL

复制页面

最后更新于 2025-01-12

本文内容

[使用场景](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#2f5c85b5 "使用场景")

[协议](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#e4dba550 "协议")

[参数](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#c4d4482f "参数")

[工具推荐：Applink 链接生成和诊断工具](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#5671aa0f "工具推荐：Applink 链接生成和诊断工具")

[使用示例](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#7d956a09 "使用示例")

# 打开端内web-view访问指定URL

从飞书 3.41.0 版本开始支持。

## 使用场景

用户在端内点击这类applink，不必跳转外部浏览器，可以直接在聊天的侧边栏、或飞书的独立窗口中打开指定的网页。可以配置这类applink在消息卡片的“查看详情”跳转上，使用户连贯地消费消息中的详情内容。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/761f68be5274fea59bf8145489633c88_Z6KZ6NyGCh.png?height=962&lazyload=true&maxWidth=600&width=1649)

## 协议

`https://applink.feishu.cn/client/web_url/open`

## 参数

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| **url** | 是 | 客户端内打开的目标页面链接，需要encodeURIComponent处理，若链接包含特殊字符，则先将特殊字符进行百分号编码，再进行Encode处理。V4.2.0+版本支持lark协议 |
| **mode** | 是 | PC端打开的容器模式，枚举值包括：<br>`sidebar-semi` 在侧边栏打开；<br>`window` 在独立窗口打开； <br>`appCenter` 在飞书导航栏的标签页打开。V7.5+版本支持，低于此版本无法打开网页 |
| **height** | 否 | PC端自定义独立窗口高度（仅当`mode`为`window`时生效），飞书5.12版本开始支持<br>**最小值**：480<br>**最大值**：屏幕的高度<br>**默认值**：飞书窗口的高度 |
| **width** | 否 | PC端自定义独立窗口宽度（仅当`mode`为`sidebar-semi`或`window`时生效），飞书5.12版本开始支持<br>**最小值**：640<br>**最大值**：屏幕的宽度<br>**默认值**：飞书窗口的宽度 |
| **min\_width** | 否 | 最小宽度（仅当`mode`为`sidebar-semi`或`window`时生效），飞书7.9版本开始支持<br>**最小值**：350<br>**最大值**：飞书窗口的宽度<br>**默认值**：350 |
| **max\_width** | 否 | 最大宽度（仅当`mode`为`sidebar-semi`或`window`时生效），飞书7.9版本开始支持<br>**最小值**：350<br>**最大值**：飞书窗口的宽度<br>**默认值**：350 |

## 工具推荐： [Applink 链接生成和诊断工具](https://webview.feishu.cn/applinktool?enter_from=weburl)

## 使用示例

#### 1\. 在PC端侧边栏打开网页：

[https://applink.feishu.cn/client/web\_url/open?mode=sidebar-semi&url=https%3a%2f%2fwww.feishu.cn%2f](https://applink.feishu.cn/client/web_url/open?mode=sidebar-semi&url=https%3a%2f%2fwww.feishu.cn%2f)

#### 2\. 在PC端独立窗口中打开网页：

[https://applink.feishu.cn/client/web\_url/open?mode=window&url=https%3a%2f%2fwww.feishu.cn%2f](https://applink.feishu.cn/client/web_url/open?mode=window&url=https%3a%2f%2fwww.feishu.cn%2f)

#### 3\. 在PC端独立窗口中打开网页，并指定窗口尺寸大小（最小值640\*480，最大值为屏幕宽高）：

[https://applink.feishu.cn/client/web\_url/open?url=https%3a%2f%2fwww.feishu.cn%2f&mode=window&height=700&width=1200](https://applink.feishu.cn/client/web_url/open?url=https%3a%2f%2fwww.feishu.cn%2f&mode=window&height=700&width=1200)

#### 4\. 在PC端侧边栏打开网页，网页链接中携带Query和Fragment：

目标URL为： [https://open.feishu.cn?key1=value1&key2=中文#position2345](https://open.feishu.cn/?key1=value1&key2=%E4%B8%AD%E6%96%87#position2345)

##### 4.1 对URL 里的参数部分进行编码

encodeURIComponent("中文") '%E4%B8%AD%E6%96%87'

第一步得到的URL为

[https://open.feishu.cn?key1=value1&key2=%E4%B8%AD%E6%96%87#position2345](https://open.feishu.cn/?key1=value1&key2=%E4%B8%AD%E6%96%87#position2345)

##### 4.2 URL 作为参数放置到Applink 的query 里，URL 进行编码，

encodeURIComponent("https://open.feishu.cn?key1=value1&key2=%E4%B8%AD%E6%96%87#position2345")

编码结果为 **https%3A%2F%2Fopen.feishu.cn%3Fkey1%3Dvalue1%26key2%3D%25E4%25B8%25AD%25E6%2596%2587%23position2345**

##### 4.3 将编码后的URL 作为参数组装完整的Applink URL

[https://applink.feishu.cn/client/web\_url/open?url=https%3A%2F%2Fopen.feishu.cn%3Fkey1%3Dvalue1%26key2%3D%25E4%25B8%25AD%25E6%2596%2587%23position2345&mode=sidebar-semi](https://applink.feishu.cn/client/web_url/open?url=https%3A%2F%2Fopen.feishu.cn%3Fkey1%3Dvalue1%26key2%3D%25E4%25B8%25AD%25E6%2596%2587%23position2345&mode=sidebar-semi)

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fcommon-capabilities%2Fapplink-protocol%2Fsupported-protocol%2Fopen-the-web-view-in-feishu-to-access-the-specified-url%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：打开网页应用](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-an-h5-app) [下一篇：打开聊天页面](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-a-chat-page)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[使用场景](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#2f5c85b5 "使用场景")

[协议](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#e4dba550 "协议")

[参数](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#c4d4482f "参数")

[工具推荐：Applink 链接生成和诊断工具](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#5671aa0f "工具推荐：Applink 链接生成和诊断工具")

[使用示例](https://open.feishu.cn/document/common-capabilities/applink-protocol/supported-protocol/open-the-web-view-in-feishu-to-access-the-specified-url?lang=zh-CN#7d956a09 "使用示例")

尝试一下

意见反馈

技术支持

收起

展开