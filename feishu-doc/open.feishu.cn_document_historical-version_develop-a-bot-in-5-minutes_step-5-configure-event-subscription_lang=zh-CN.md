---
url: "https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/step-5-configure-event-subscription?lang=zh-CN"
title: "步骤三：配置事件订阅 - 开发教程 - 开发文档 - 飞书开放平台"
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

快速开发机器人

[概览](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/create-an-app)

[准备工作](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/coding)

[步骤一：创建并配置应用](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/step-1-create-app-and-enable-robot-capabilities)

[步骤二：下载并配置示例代码](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/step-3-configure-application-credentials)

[步骤三：配置事件订阅](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/step-5-configure-event-subscription)

[步骤四：体验机器人](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/step-9-experience-the-robot)

[示例代码介绍](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/configuration)

[相关文档](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/release)

配置会话互动机器人

快速了解消息卡片

快速开发互动卡片

发送互动审批卡片

云文档周报管理

知识库周报待办每日提醒

[开发教程](https://open.feishu.cn/document/course) [历史版本（不推荐）](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/create-an-app) [快速开发机器人](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/create-an-app)

步骤三：配置事件订阅

# 步骤三：配置事件订阅

复制页面

最后更新于 2024-07-23

# 步骤三：配置事件订阅

机器人接收的消息会以回调事件请求的形式，通过 POST 请求送达到服务端处理。本地服务启动后，回调事件无法请求到内网，需配置公网请求 URL。

本教程为了方便实现，使用了反向代理工具（ [ngrok](https://ngrok.com/download)）完成内网穿透，暴露本地服务的公网访问入口。 **该工具仅适用于开发测试阶段，不可用于生产环境，使用前请确认是否符合所在公司网络安全政策。**

1. 注册并安装 [ngrok](https://ngrok.com/download)，按照官方指引完成安装。

2. 在个人的 [dashboard 页面](https://dashboard.ngrok.com/get-started/your-authtoken) 中，获取 Authtoken。
![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3a6d48a86bbd55342a81f80e43561204_DQ45y4wKim.png?lazyload=true&width=2480&height=624)
3. 运行以下命令获得公网 URL。


```

ngrok authtoken "token" // token需替换为实际值
ngrok http 3000
```


成功运行结果如下图：
![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/8defec8701727380a1818b152681e206_iWbpgbJZ5E.png?lazyload=true&width=2490&height=882)
4. 返回开发者后台应用详情页，在页面左侧进入 **事件与回调** 页面。

5. 在 **事件配置** 页签，点击 **配置订阅方式** 右侧编辑图标。

6. 选择 **将事件发送至开发者服务器**，并在 **请求地址** 输入框内填写 ngrok 工具生成的公网域名。

保存请求网址 URL 及发送消息给机器人，都会请求到后端服务， **请求期间需保证服务为启动状态**。

![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a288ef290db9c206158c94e363fdb227_w3sXxvIkSp.png?height=934&lazyload=true&maxWidth=600&width=1714)

7. 点击 **保存**。

如遇报错可参见 [常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/event-subscriptions/faq)。

8. 在 **已添加事件** 区域，点击 **添加事件**，搜索并添加 **接收消息** 事件。

![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f4451caa3777341cea08a8d14e0838bd_0rlV7GpTxJ.png?height=778&lazyload=true&maxWidth=600&width=2206)


[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fhistorical-version%2Fdevelop-a-bot-in-5-minutes%2Fstep-5-configure-event-subscription%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：步骤二：下载并配置示例代码](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/step-3-configure-application-credentials) [下一篇：步骤四：体验机器人](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/step-9-experience-the-robot)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

尝试一下

意见反馈

技术支持

收起

展开