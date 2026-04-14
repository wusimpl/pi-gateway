---
url: "https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal"
title: "Get custom app app_access_token - Server API - Documentation - Feishu Open Platform"
---

[![lark](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/903e9787438e93aec1e412c4b284ca31.svg)](https://open.feishu.cn/?lang=en-US)

- [Customer Stories](https://open.feishu.cn/solutions?lang=en-US)

- [App Directory](https://app.feishu.cn/?lang=en-US)

- [Documentation](https://open.feishu.cn/document)

- [AI Assistant\\
\\
AI for developers](https://open.feishu.cn/app/ai/playground?from=nav&lang=en-US)


Enter keywords, questions, Log IDs, or error codes

- [Developer Console](https://open.feishu.cn/app?lang=en-US)


Login

- [Home](https://open.feishu.cn/document/home/index)
- [Developer Guides](https://open.feishu.cn/document/client-docs/intro)
- [Developer Tutorials](https://open.feishu.cn/document/course)
- [Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide)
- [Client API](https://open.feishu.cn/document/client-docs/h5/)
- [Lark CLI](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu)
- [Feishu Plugin for OpenClaw](https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh)

API Explorer [CardKit](https://open.feishu.cn/cardkit?from=open_docs_header) What's New

Search content

[AI assistant code generation guide](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide)

API Call Guide

Events and callbacks

Server-side SDK

Authenticate and Authorize

Login state management

Get Access Tokens

[Get custom app tenant\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal)

[Get custom app app\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal)

[Get authorization code](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code)

[Get user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/get-user-access-token)

[Refresh user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/refresh-user-access-token)

[Refresh user\_access\_token (Bytedance only)](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/bytedance-only)

[Retrieve app\_ticket](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_ticket_resend)

[Store applications get app\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token)

[Store applications get tenant\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token)

[Get JSAPI Authorization Ticket](https://open.feishu.cn/document/authentication-management/access-token/authorization)

Event

Contacts

Organization

Messaging

Group Chat

Feishu Card

Feed

Organization Custom Group Label

Docs

Calendar

Video Conferencing

Minutes

Attendance

Approval

Bot

Help Desk

Tasks

Email

App Information

Company Information

Verification Information

Personal Settings

Search

AI

Spark

Feishu aPaaS

aily

Admin

Moments

Feishu CoreHR - (Standard version)

Feishu People（Enterprise Edition）

Payroll

Hire

OKR

Identity Authentication

Smart Access Control

Performance

Lingo

security\_and\_compliance

Trust Party

Workplace

Feishu Master Data Management

Report

eLearning

Deprecated Version (Not Recommended)

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Authenticate and Authorize](https://open.feishu.cn/document/server-docs/authentication-management/login-state-management/usum) [Get Access Tokens](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal)

Get custom app app\_access\_token

# Get custom app app\_access\_token

Copy Page

Last updated on 2024-06-26

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#7dbabeae "Request")

[Request header](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#20964697 "Request header")

[Request body](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#422ed976 "Request body")

[Request body example](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#0797b7de "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#30f4b514 "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#4b37c186 "Error code")

# Custom apps get app\_access\_token

Custom apps can obtain `app_access_token` through this interface.

**Note:** The maximum validity period of `app_access_token` is 2 hours.

- If this interface is called when the validity period is less than 30 minutes, a new `app_access_token` will be returned, and there will be two valid `app_access_token` at the same time.
- If this interface is called when the validity period is greater than or equal to 30 minutes, the original `app_access_token` will be returned.

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/auth/v3/app\_access\_token/internal |
| HTTP Method | POST |
| Supported app types | Only custom apps |
| Required scopes | None |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Request body

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| app\_id | string | Yes | The unique identifier of the application is obtained after the application is created. For a detailed introduction to `app_id`, please refer to the introduction of [General parameters](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/terminology).<br>**Example value:** "cli\_slkdjalasdkjasd" |
| app\_secret | string | Yes | Application key, obtained after creating the application. For a detailed introduction to app\_secret, please refer to the introduction of [General parameters](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/terminology).<br>**Example value:** "dskLLdkasdjlasdKK" |

### Request body example

```

{
    "app_id": "cli_slkdjalasdkjasd",
    "app_secret": "dskLLdkasdjlasdKK"
}
```

## Response

### Response body

| Parameter | Type | Description |
| --- | --- | --- |
| code | int | Error code, non-0 indicates failure. |
| msg | string | Error description. |
| app\_access\_token | string | The access token. |
| expire | int | The expiration time of app\_access\_token, in seconds. |
| tenant\_access\_token | string | Tenant access credentials. For different access credentials, see [Access credentials introduction](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM). |

### Response body example

```

{
    "app_access_token": "t-g1044ghJRUIJJ5ZPPZMOHKWZISL33E4QSS3abcef",
    "code": 0,
    "expire": 7200,
    "msg": "ok",
    "tenant_access_token": "t-g1044ghJRUIJJ5ZPPZMOHKWZISL33E4QSS3abcef"
}
```

### Error code

For a detailed description, see [Common error codes](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN).

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fauthentication-management%2Faccess-token%2Fapp_access_token_internal%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

[How to obtain Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[How to request the required scopes for the application](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

Got other questions? Try asking AI Assistant

[Previous:Get custom app tenant\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal) [Next:Get authorization code](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#7dbabeae "Request")

[Request header](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#20964697 "Request header")

[Request body](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#422ed976 "Request body")

[Request body example](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#0797b7de "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#30f4b514 "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal#4b37c186 "Error code")

Try It

Feedback

OnCall

Collapse

Expand