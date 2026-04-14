---
url: "https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN"
title: "获取授权码 - 服务端 API - 开发文档 - 飞书开放平台"
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

获取授权码

# 获取授权码

复制页面

最后更新于 2026-03-19

本文内容

[注意事项](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#355ec8c0 "注意事项")

[请求](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#2cf9141c "请求")

[查询参数](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#bc6d1214 "查询参数")

[请求示例](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#5549b31b "请求示例")

[响应](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#1dcf621c "响应")

[成功响应](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#3ddb9fe9 "成功响应")

[失败响应](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#25a63462 "失败响应")

[常见问题](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#e2f7069c "常见问题")

[用户授权应用时报错 20027](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#baf91e02 "用户授权应用时报错 20027")

[如何获取包含目标权限的 user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#ac07d9e3 "如何获取包含目标权限的 user_access_token")

[redirect\_uri 中带 # 时的说明](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#15391e22 "redirect_uri 中带 # 时的说明")

# 获取授权码

本接口用于发起用户授权，应用在用户同意授权后将获得授权码 `code`。请注意授权码的有效期为 5 分钟，且只能被使用一次。

## 注意事项

- 本接口实际为授权页面，适用于网页应用的授权场景。在需要用户授权时，应用应将用户重定向至本授权页面。当用户在授权页面点击授权后（在飞书客户端内打开网页应用时可免确认直接跳转），浏览器将跳转至 `redirect_uri` 所指定的地址，并携带 `code` 查询参数（即授权码）。

- 开发者可通过授权码获取 `user_access_token`，以调用 OpenAPI（例如 [获取用户信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/user_info/get)）。有关获取 `user_access_token` 的详细步骤，可参考 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)。

- 通过本接口配合 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token) 以及 [获取用户信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/user_info/get)，应用可实现飞书授权登录。

- 完整的用户授权链路实现，可参考 [浏览器应用接入指南](https://open.feishu.cn/document/common-capabilities/sso/web-application-end-user-consent/guide)。

- 在打开授权页面时，需要通过拼接 `scope` 查询参数声明应用所需的用户授权权限。例如，获取通讯录基本信息的权限对应的 `scope` 键为 `contact:contact.base:readonly`。

- 用户授予应用的权限是累积的，最新生成的 `user_access_token` 将包含用户历史上已授予的所有权限。

- 当应用使用 `user_access_token` 调用某个 OpenAPI 时，必须确保该 `user_access_token` 具备 [目标 OpenAPI 所需的权限](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)，否则调用将失败。


## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://accounts.feishu.cn/open-apis/authen/v1/authorize |
| HTTP Method | GET |
| 接口频率限制 | 1000 次/分钟、50 次/秒 |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 | 无 |

### 查询参数

> 为了确保 URL 构造 & 编码正确，建议使用相关的 URL 标准库来完成 URL 的解析和构建，避免手动拼接。

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| client\_id | string | 是 | 应用的 App ID，可以在开发者后台的 **凭证与基础信息** 页面查看 App ID。有关 App ID 的详细介绍，请参考 [通用参数](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/terminology)。<br>**示例值：**`cli_a5d611352af9d00b` |
| response\_type | string | 是 | 应用通知授权服务器所需的授权类型，对于授权码流程，固定值`code`<br>**示例值：**`code` |
| redirect\_uri | string | 是 | 应用重定向地址，在用户授权成功后会跳转至该地址，同时会携带 `code` 以及 `state` 参数（如有传递 `state` 参数）。<br>请注意：<br>1. 该地址需经过 URL 编码；<br>   <br>2. 调用本接口前，你需要在开发者后台应用的 **安全设置** 页面，将用于接受 OAuth 回调的 HTTP GET 请求接口地址配置为应用的重定向 URL。重定向 URL 支持配置多个，只有在重定向 URL 列表中的 URL 才会通过开放平台的安全校验。详情请参考 [配置重定向域名](https://open.feishu.cn/document/uYjL24iN/uYjN3QjL2YzN04iN2cDN)。<br>   <br>**示例值：**`https://example.com/api/oauth/callback` |
| scope | string | 否 | 用户需要增量授予应用的权限。<br>**格式要求：**`scope` 参数为空格分隔，区分大小写的字符串。<br>**注意**：<br>- 开发者需要根据业务场景，在 [开发者后台](https://open.larkoffice.com/app) 的 **权限管理** 模块中完成调用 OpenAPI 所需的 `scope` 申请后，自主拼接 `scope` 参数。如果没有在应用后台为应用申请相应权限，则实际使用应用时用户会遇到 20027 报错。<br>  <br>- 应用最多一次可以请求用户授予 50 个 `scope`。详情参考 [API 权限列表](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/scope-list)。<br>  <br>- 如果后续需要获取 `refresh_token`，此处需要添加 `offline_access` 权限。详情参考 [刷新 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token)）：<br>  <br>  <br>  <br>  <br>  <br>  离线访问已授权数据<br>  <br>**示例值：**`contact:contact bitable:app:readonly` |
| state | string | 否 | 用来维护请求和回调之间状态的附加字符串，在授权完成回调时会原样回传此参数。应用可以根据此字符串来判断上下文关系，同时该参数也可以用以防止 CSRF 攻击，请务必校验 `state` 参数前后是否一致。<br>**示例值：**`RANDOMSTRING` |
| code\_challenge | string | 否 | 用于通过 PKCE（Proof Key for Code Exchange）流程增强授权码的安全性。<br>**示例值：**`E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM`<br>有关 PKCE 的详细信息，请参阅 [RFC-7636 - Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636)。 |
| code\_challenge\_method | string | 否 | 生成 `code_challenge` 的方法。<br>**可选值**：<br>1. **`S256`**（推荐）：<br>   <br>   使用 SHA-256 哈希算法计算 `code_verifier` 的哈希值，并将结果进行 Base64URL 编码，生成 `code_challenge`。<br>2. **`plain`**（默认值）：<br>   <br>   直接将 `code_verifier` 作为 `code_challenge`，无需进行额外处理。<br>以上 `code_verifier` 是指在发起授权前，本地生成的随机字符串。 |
| prompt | string | 否 | 用于指定授权过程中需要的用户交互类型。<br>**可选值**：<br>- **`consent`**：当 `prompt=consent` 时，用户侧显式可见授权页并完成确认。<br>**示例值：**`consent` |

### 请求示例

> 注意仅为示例请求 URL，请根据前文描述将其中的查询参数替换为真实的值

```

https://accounts.feishu.cn/open-apis/authen/v1/authorize?client_id=cli_a5d611352af9d00b&response_type=code&redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Foauth%2Fcallback&scope=bitable:app:readonly%20contact:contact&prompt=consent&state=RANDOMSTRING
```

## 响应

### 成功响应

当用户同意授权后，浏览器将重定向至发起授权时给定的的 `redirect_uri` 地址，同时携带 `code` 和 `state` 参数。

| 名称 | 描述 |
| --- | --- |
| code | 授权码，用于获取 `user_access_token`。<br>**字符集：** \[A-Z\] / \[a-z\] / \[0-9\] / "-" / "\_"<br>**长度：** 请开发者至少预留 64 位字符<br>**示例值：**`2Wd5g337vo5BZXUz-3W5KECsWUmIzJ_FJ1eFD59fD1AJIibIZljTu3OLK-HP_UI1` |
| state | 打开授权页时传入的 `state` 参数的原值，如未传入此处不会返回。 |

示例：

```

https://example.com/api/oauth/callback?code=2Wd5g337vo5BZXUz-3W5KECsWUmIzJ_FJ1eFD59fD1AJIibIZljTu3OLK-HP_UI1&state=RANDOMSTRING
```

### 失败响应

当用户拒绝授权时，浏览器将重定向至发起授权时给定的 `redirect_uri` 地址，同时携带 `error` 和 `state` 查询参数。 当前 `error` 参数的固定值为 `access_denied`，请妥善处理拒绝授权时的情况。

| 名称 | 描述 |
| --- | --- |
| error | 错误信息，当前固定为 `access_denied` |
| state | 打开授权页时传入的 `state` 参数的原值，如未传入此处不会返回 |

示例：

```

https://example.com/api/oauth/callback?error=access_denied&state=RANDOMSTRING
```

## 常见问题

### 用户授权应用时报错 20027

**问题现象**：用户在授权应用时报错 20027

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/8de8a8e0ce3fbe84ddabcbad2e929b5c_cUP75TqvF9.png?height=331&lazyload=true&maxWidth=600&width=792)

**问题原因**：打开授权页时拼接的 scope 参数中包含当前应用未开通的权限。

**解决方案**：

1. 确认需要用户授权的权限范围。
2. 前往 [开发者后台](https://open.feishu.cn/app)，在对应应用的 **开发配置** \> **权限管理** \> **API 权限** 功能页开通相应的权限。具体操作参考 [申请 API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)。
3. 调用当前接口，自主拼接已在应用内开通的权限。

### 如何获取包含目标权限的 user\_access\_token

在调用 OpenAPI 时，如果 `user_access_token` 缺少所需权限，将会返回以下错误：

```

{
  "code": 99991679,
  "error": {
    "log_id": "202407260711088FB107A76E0100002087",
    "permission_violations": [\
      {\
        "subject": "task:task:read",\
        "type": "action_privilege_required"\
      },\
      {\
        "subject": "task:task:write",\
        "type": "action_privilege_required"\
      }\
    ]
  },
  "msg": "Unauthorized. You do not have permission to perform the requested operation on the resource. Please request user re-authorization and try again. required one of these privileges: [task:task:read, task:task:write]"
}
```

为避免因 `user_access_token` 权限不足导致 OpenAPI 调用失败，开发者可通过 `scope` 查询参数请求用户授予相应权限，具体有以下两种方式：

1. 一次性拼接所有需要用户授权的 `scope`，在无新增权限需求的情况下，无需重复授权。需注意单次拼接的 `scope` 数量上限为 50 个。
2. 或者，根据 OpenAPI 调用返回的错误码及 `permission_violations` 字段，识别当前操作所需的额外权限。随后可重新生成授权链接，提示用户补充授权，并使用新生成的 `user_access_token` 继续调用 OpenAPI。

建议开发者遵循最小权限原则，仅要求用户授予必要的权限。

### redirect\_uri 中带 \# 时的说明

标准 [RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax](https://datatracker.ietf.org/doc/html/rfc3986#section-3) 中约定，URI 中 `#` 后面的内容称为 fragment，位置处于 URI 最后。如果业务授权请求参数 `redirect_uri` 拼接了 `#`，授权完成后的重定向会将 `#` 和 fragment 内容拼接到 URI 最后。业务在解析获取 `code` 时需要特别注意。

`redirect_uri` 示例：

```

https://example.com/api/oauth/callback/#/login
```

请求示例：

```

GET https://accounts.feishu.cn/open-apis/authen/v1/authorize?client_id=cli_a5d611352af9d00b&redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Foauth%2Fcallback%2F%23%2Flogin%0A&scope=bitable:app:readonly%20contact:contact&state=RANDOMSTRING
```

回调后浏览器地址栏中的值示例：

```

https://example.com/api/oauth/callback?code=2Wd5g337vo5BZXUz-3W5KECsWUmIzJ_FJ1eFD59fD1AJIibIZljTu3OLK-HP_UI1&state=RANDOMSTRING#/login
```

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fauthentication-management%2Faccess-token%2Fobtain-oauth-code%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[如何选择不同类型的 access token？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[如何准确选择 SDK 内 API 对应的方法？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api#5954789)

[如何获取自己的 Open ID？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[如何为应用申请所需权限？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

遇到其他问题？问问 开放平台智能助手

[上一篇：自建应用获取 app\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal) [下一篇：获取 user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/get-user-access-token)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[注意事项](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#355ec8c0 "注意事项")

[请求](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#2cf9141c "请求")

[查询参数](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#bc6d1214 "查询参数")

[请求示例](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#5549b31b "请求示例")

[响应](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#1dcf621c "响应")

[成功响应](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#3ddb9fe9 "成功响应")

[失败响应](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#25a63462 "失败响应")

[常见问题](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#e2f7069c "常见问题")

[用户授权应用时报错 20027](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#baf91e02 "用户授权应用时报错 20027")

[如何获取包含目标权限的 user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#ac07d9e3 "如何获取包含目标权限的 user_access_token")

[redirect\_uri 中带 # 时的说明](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code?lang=zh-CN#15391e22 "redirect_uri 中带 # 时的说明")

尝试一下

意见反馈

技术支持

收起

展开