---
url: "https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN"
title: "自建应用获取 tenant_access_token - 服务端 API - 开发文档 - 飞书开放平台"
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

登录态管理

获取访问凭证

[自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal)

[自建应用获取 app\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal)

[获取授权码](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code)

[获取 user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/get-user-access-token)

[刷新 user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/refresh-user-access-token)

[刷新 user\_access\_token（仅字节）](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/bytedance-only)

[重新获取 app\_ticket](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_ticket_resend)

[商店应用获取 app\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token)

[商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token)

[获取 JSAPI 临时授权凭证](https://open.feishu.cn/document/authentication-management/access-token/authorization)

事件

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [认证及授权](https://open.feishu.cn/document/server-docs/authentication-management/login-state-management/usum) [获取访问凭证](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal)

自建应用获取 tenant\_access\_token

# 自建应用获取 tenant\_access\_token

复制页面

最后更新于 2025-03-26

本文内容

[注意事项](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#355ec8c0 "注意事项")

[请求](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#2cf9141c "请求")

[请求头](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#f47475f8 "请求头")

[请求体](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#1b8abd5d "请求体")

[请求体示例](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#365d3b16 "请求体示例")

[响应](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#1dcf621c "响应")

[响应体](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#362449eb "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#9dab04c2 "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#c98c3220 "错误码")

# 自建应用获取 tenant\_access\_token

自建应用通过此接口获取 `tenant_access_token`。

## 注意事项

`tenant_access_token` 的最大有效期是 2 小时。

- 剩余有效期小于 30 分钟时，调用本接口会返回一个新的 `tenant_access_token`，这会同时存在两个有效的 `tenant_access_token`。
- 剩余有效期大于等于 30 分钟时，调用本接口会返回原有的 `tenant_access_token`。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/auth/v3/tenant\_access\_token/internal |
| HTTP Method | POST |
| 支持的应用类型 | 仅自建应用 |
| 权限要求 | 无 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 请求体

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| app\_id | string | 是 | 应用唯一标识，创建应用后获得。有关`app_id` 的详细介绍。请参考 [通用参数](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/terminology) 介绍<br>**示例值：** "cli\_slkdjalasdkjasd" |
| app\_secret | string | 是 | 应用秘钥，创建应用后获得。有关 `app_secret` 的详细介绍，请参考 [通用参数](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/terminology) 介绍<br>**示例值：** "dskLLdkasdjlasdKK" |

### 请求体示例

```

{
    "app_id": "cli_slkdjalasdkjasd",
    "app_secret": "dskLLdkasdjlasdKK"
}
```

## 响应

### 响应体

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| code | int | 错误码，非 0 取值表示失败 |
| msg | string | 错误描述 |
| tenant\_access\_token | string | 租户访问凭证 |
| expire | int | `tenant_access_token` 的过期时间，单位为秒 |

### 响应体示例

```

{
    "code": 0,
    "msg": "ok",
    "tenant_access_token": "t-caecc734c2e3328a62489fe0648c4b98779515d3",
    "expire": 7200
}
```

### 错误码

有关错误码的详细介绍，请参考 [通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN) 介绍。

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fauthentication-management%2Faccess-token%2Ftenant_access_token_internal%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[如何选择不同类型的 access token？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[如何准确选择 SDK 内 API 对应的方法？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api#5954789)

[如何获取自己的 Open ID？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[如何为应用申请所需权限？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

遇到其他问题？问问 开放平台智能助手

[上一篇：退出登录](https://open.feishu.cn/document/authentication-management/login-state-management/logout) [下一篇：自建应用获取 app\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[注意事项](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#355ec8c0 "注意事项")

[请求](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#2cf9141c "请求")

[请求头](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#f47475f8 "请求头")

[请求体](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#1b8abd5d "请求体")

[请求体示例](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#365d3b16 "请求体示例")

[响应](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#1dcf621c "响应")

[响应体](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#362449eb "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#9dab04c2 "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal?lang=zh-CN#c98c3220 "错误码")

尝试一下

意见反馈

技术支持

收起

展开