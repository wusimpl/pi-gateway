---
url: "https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN"
title: "如何获取用户的 User ID - 开发指南 - 开发文档 - 飞书开放平台"
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

开发者工具

常见问题

[根证书相关](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/root-certificate-related)

问题排查

[如何选择使用不同类型的 Token](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[如何获取用户的 Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[如何获取用户的 Union ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-union-id)

[如何获取用户的 User ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id)

[如何获取应用的 App ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-app-id)

[如何启用机器人能力](https://open.feishu.cn/document/faq/trouble-shooting/how-to-enable-bot-ability)

[如何为应用申请所需权限](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

[如何为应用开通云文档相关资源的权限](https://open.feishu.cn/document/faq/trouble-shooting/how-to-add-permissions-to-app)

[如何获取各类云文档资源的 token](https://open.feishu.cn/document/faq/trouble-shooting/how-to-get-docs-tokens)

[如何解决 230001 错误](https://open.feishu.cn/document/faq/trouble-shooting/how-to-resolve-error-230001)

[如何解决 99991679 错误](https://open.feishu.cn/document/faq/trouble-shooting/how-to-resolve-error-99991679)

[如何解决 tenant token invalid (99991663) 错误](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[如何解决 200732 或 200737 错误](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-fix-200732-or-200737-error)

[如何获取排查问题信息](https://open.feishu.cn/document/faq/trouble-shooting/how-to-get-internal-user-id)

[如何解决授权免登页面 20029 错误](https://open.feishu.cn/document/faq/trouble-shooting/how-to-resolve-the-authorization-page-20029-error)

[如何将企业内部人员与外部客户一键拉入群聊](https://open.feishu.cn/document/faq/trouble-shooting/add-internal-employees-and-external-clients-to-group)

客户端通用问题

服务端通用问题

[机器人相关](https://open.feishu.cn/document/faq/bot)

[其他开发问题](https://open.feishu.cn/document/faq/others)

[小程序](https://open.feishu.cn/document/faq/gadget)

[开发者工具](https://open.feishu.cn/document/faq/devtools)

[应用管理](https://open.feishu.cn/document/faq/application-management)

[ISV 相关](https://open.feishu.cn/document/faq/questions-related-to-isv)

管理规范

平台公告

历史版本（不推荐）

[开发指南](https://open.feishu.cn/document/client-docs/intro) [常见问题](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/root-certificate-related) [问题排查](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

如何获取用户的 User ID

# 如何获取用户的 User ID

复制页面

最后更新于 2025-01-21

本文内容

[方式一：通过 API 调试台获取](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#529e21a9 "方式一：通过 API 调试台获取")

[方式二：调用 OpenAPI 获取](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#fb20eeed "方式二：调用 OpenAPI 获取")

[前提条件](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#7bb6c149 "前提条件")

[1\. 打开 API 调试台，并找到「通过手机号或邮箱获取用户 ID」API](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#cc562049 "1. 打开 API 调试台，并找到「通过手机号或邮箱获取用户 ID」API")

[2\. 获取鉴权凭证，并设置参数](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#9cdab0cd "2. 获取鉴权凭证，并设置参数")

[3\. 调试，并获得 User ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#-d60e68 "3. 调试，并获得 User ID")

# 如何获取自己的 User ID？

User ID 是用户在租户内的身份。 同一个飞书用户在租户 A 和租户 B 内的 user\_id 是不同的。详情参考 [用户身份概述](https://open.feishu.cn/document/home/user-identity-introduction/introduction)。

本文介绍用户 User ID 的获取方式。

## 方式一：通过 API 调试台获取

API 调试台提供一键获取用户 ID 的能力，你可以通过可视化操作快速获取企业内指定用户的 ID。

私有化环境不支持 API 调试台。

1. 登录 [API 调试台](https://open.feishu.cn/api-explorer)，找到 [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) 接口。

2. 在 **权限配置** 页签下，找到 **获取用户 user ID** 权限并开通。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/8b45f1013e79acfd835087aa898d78df_d8UAv8cNSc.png?height=785&lazyload=true&maxWidth=500&width=737)

3. 在 **API 调试台** 页签的 **查询参数** 处，将 **receive\_id\_type** 设置为 **user\_id**，然后点击 **快速复制 user\_id**。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/074c04102f2c86d343aa6b5bdb684b2e_dMlOcj9nZ0.png?height=704&lazyload=true&maxWidth=500&width=730)

4. 在弹窗中，搜索或选择指定用户，并点击 **复制成员 ID**，获取用户的 user\_id。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6854e0a78406e34562bbf3126e31ca01_Ig9VIXY0pc.png?height=641&lazyload=true&maxWidth=500&width=805)


## 方式二：调用 OpenAPI 获取

### 前提条件

- 已开通 [「通过手机号或邮箱获取用户 ID」权限（`contact:user.id:readonly`）](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-fix-the-99991672-error)
- 已开通 [「获取用户 User ID」权限（`contact:user.employee_id:readonly`）](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-fix-the-99991672-error)

### 1\. 打开 API 调试台，并找到「通过手机号或邮箱获取用户 ID」API

私有化环境不支持 API 调试台。

打开飞书开放平台 [API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&project=contact&version=v3&resource=user&apiName=batch_get_id)，并在左侧 API 目录中找到「通讯录」下的「通过手机号或邮箱获取用户 ID」，点击该 API 切换当前调试 API 为「通过手机号或邮箱获取用户 ID」。

> 可以在API 列表顶部的搜索框输入「通过手机号或邮箱获取用户 ID」来快速定位。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/2c34087b72f9cd7c0b53ae7d085369e3_awl5jJ2kOI.png?height=1512&lazyload=true&width=3050)

### 2\. 获取鉴权凭证，并设置参数

1. 点击 API 调试台左侧「查看鉴权凭证」中 tenant\_access\_token 中的「点击获取」（如果之前已经获取过，则可以点击刷新按钮刷新鉴权凭证。

2. 点击右侧参数列表，将查询参数 Tab 中的 _user\_id\_type_ 参数设置为 _user\_id_。

3. 切换至请求体 Tab，将请求体中的 ID 删除，并修改 _mobiles_ 参数，设为你自己的手机号。


![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/758e6ef6a5ca831b9ea1e4da52a14da9_kwwCnRZucF.png?height=1564&lazyload=true&width=3056)

### 3\. 调试，并获得 User ID

点击右侧「开始调试」，调用接口。调用成功后，在下方响应体中即可拿到你自己的 User ID。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/cf9348b02173ed6cef65eccb7143229e_G6aStmd7H5.png?height=1578&lazyload=true&width=3030)

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Ffaq%2Ftrouble-shooting%2Fhow-to-obtain-user-id%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：如何获取用户的 Union ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-union-id) [下一篇：如何获取应用的 App ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-app-id)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[方式一：通过 API 调试台获取](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#529e21a9 "方式一：通过 API 调试台获取")

[方式二：调用 OpenAPI 获取](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#fb20eeed "方式二：调用 OpenAPI 获取")

[前提条件](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#7bb6c149 "前提条件")

[1\. 打开 API 调试台，并找到「通过手机号或邮箱获取用户 ID」API](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#cc562049 "1. 打开 API 调试台，并找到「通过手机号或邮箱获取用户 ID」API")

[2\. 获取鉴权凭证，并设置参数](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#9cdab0cd "2. 获取鉴权凭证，并设置参数")

[3\. 调试，并获得 User ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id?lang=zh-CN#-d60e68 "3. 调试，并获得 User ID")

尝试一下

意见反馈

技术支持

收起

展开