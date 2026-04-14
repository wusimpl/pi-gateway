---
url: "https://open.feishu.cn/document/aily-v1/app-skill/start"
title: "Start Skill - Server API - Documentation - Feishu Open Platform"
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

session

message

run

skill

[Start Skill](https://open.feishu.cn/document/aily-v1/app-skill/start)

[Get Skill](https://open.feishu.cn/document/aily-v1/app-skill/get)

[List Skill](https://open.feishu.cn/document/aily-v1/app-skill/list)

Data Knowledge

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [aily](https://open.feishu.cn/document/aily-v1/aily_session/create) [skill](https://open.feishu.cn/document/aily-v1/app-skill/start)

Start Skill

# Start Skill

Copy Page

Last updated on 2025-07-10

The contents of this article

[Request](https://open.feishu.cn/document/aily-v1/app-skill/start#request "Request")

[Request header](https://open.feishu.cn/document/aily-v1/app-skill/start#requestHeader "Request header")

[Path parameters](https://open.feishu.cn/document/aily-v1/app-skill/start#pathParams "Path parameters")

[Request body](https://open.feishu.cn/document/aily-v1/app-skill/start#requestBody "Request body")

[Request example](https://open.feishu.cn/document/aily-v1/app-skill/start#requestExample "Request example")

[Response](https://open.feishu.cn/document/aily-v1/app-skill/start#response "Response")

[Response body](https://open.feishu.cn/document/aily-v1/app-skill/start#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/aily-v1/app-skill/start#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/aily-v1/app-skill/start#errorCode "Error code")

# Start Skill

The API is used to invoke a specific skill of an Aily application, supports specifying skill imported parameters; and returns the result of skill execution synchronously.

Try It

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/aily/v1/apps/:app\_id/skills/:skill\_id/start |
| HTTP Method | POST |
| Rate Limit | [100 per minute](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| Supported app types | Only custom apps |
| Required scopes | Execute skill<br>Only custom apps |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | When calling an API, the app needs to authenticate its identity through an access token. The data obtained with different types of access tokens may vary. Refer to [Choose and obtain access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM).<br>**Value format**: "Bearer `access_token`"<br>**Supported options are**:<br>tenant\_access\_token<br>Call the API on behalf of the app. The range of readable and writable data is determined by the app's own [data access range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions). Refer to [Get custom app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) or [Get store app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token). Example value: "Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>Call the API on behalf of the logged-in user. The range of readable and writable data is determined by the user's data access range. Refer to [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token). Example value: "Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| app\_id | string | The Aily application ID (spring\_xxx\_\_c) can be obtained from the browser address of the Aily application development page<br>**Example value**: "spring\_xxx\_\_c"<br>**Data validation rules**:<br>- Length range: `0` characters ～ `64` characters |
| skill\_id | string | Skill ID; can be obtained from the browser address bar on the Skill Edit page (skill\_xxx)<br>**Example value**: "skill\_6cc6166178ca"<br>**Data validation rules**:<br>- Length range: `0` characters ～ `32` characters |

### Request body

| Parameter<br>Show sublists | Type | Required | Description |
| --- | --- | --- | --- |
| global\_variable | skill\_global\_variable | No | Global Variables for Skills |
| input | string | No | Custom variables for skills<br>**Example value**: "{"custom\_s":"text","custom\_i":12,"custom\_b":true,"custom\_f":1.2}"<br>**Data validation rules**:<br>- Length range: `0` characters ～ `40960` characters |

### Request example

Below is a standard code example. To customize the request parameters based on your specific use case, go to the API Explorer, input the parameters, and you can copy the corresponding API code. Developer Guide

cURL

Go SDK

Python SDK

Java SDK

Node SDK

Php - Guzzle

C# - Restsharp

More

1

curl-i-X POST 'https://open.feishu.cn/open-apis/aily/v1/apps/spring\_xxx\_\_c/skills/skill\_6cc6166178ca/start' \

## Response

### Response body

| Parameter<br>Show sublists | Type | Description |
| --- | --- | --- |
| code | int | Error codes, fail if not zero |
| msg | string | Error descriptions |
| data | - | - |

### Response body example

1

2

3

4

5

6

7

8

{

"Code": 0,

"Data": {

"Output ": "{\\" message\_status\\": true,\\ "input\_message \":\\"\\"}",

"Status": "success"

},

"Msg": ""

}

### Error code

| HTTP status code | Error code | Description | Troubleshooting suggestions |
| --- | --- | --- | --- |
| 400 | 2700001 | param is invalid | param is invalid |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Faily-v1%2Fapp-skill%2Fstart%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

[How to obtain Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[How to request the required scopes for the application](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

Got other questions? Try asking AI Assistant

[Previous:Cancel run](https://open.feishu.cn/document/aily-v1/aily_session-run/cancel) [Next:Get Skill](https://open.feishu.cn/document/aily-v1/app-skill/get)

Please log in first before exploring any API.

Log In

API Explorer

Sample Code

More

Request Header

Authorization

\*

Change to user\_access\_token

Bearer

tenant\_access\_token

Get Token

Path Parameters

app\_id

\*

Example value:"spring\_xxx\_\_c"

skill\_id

\*

Example value:"skill\_6cc6166178ca"

Request Body

Required parameters only

Restore example values

Format JSON

JSON

More

1

Results

![](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/31dafaca1b39955beda5239fff26f1eb.svg)

Click "RUN" to view results

Sample code below has been updated with parameters entered in the API Explorer.

cURL

Go SDK

Python SDK

Java SDK

Node SDK

More

1

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&apiName=start&project=aily&resource=app.skill&version=v1)

The contents of this article

[Request](https://open.feishu.cn/document/aily-v1/app-skill/start#request "Request")

[Request header](https://open.feishu.cn/document/aily-v1/app-skill/start#requestHeader "Request header")

[Path parameters](https://open.feishu.cn/document/aily-v1/app-skill/start#pathParams "Path parameters")

[Request body](https://open.feishu.cn/document/aily-v1/app-skill/start#requestBody "Request body")

[Request example](https://open.feishu.cn/document/aily-v1/app-skill/start#requestExample "Request example")

[Response](https://open.feishu.cn/document/aily-v1/app-skill/start#response "Response")

[Response body](https://open.feishu.cn/document/aily-v1/app-skill/start#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/aily-v1/app-skill/start#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/aily-v1/app-skill/start#errorCode "Error code")

Try It

Feedback

OnCall

Collapse

Expand