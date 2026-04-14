---
url: "https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list"
title: "Obtain a collaborator list - Server API - Documentation - Feishu Open Platform"
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

Tasks

[Task overview](https://open.feishu.cn/document/server-docs/task-v1/overview)

[Markdown module](https://open.feishu.cn/document/server-docs/task-v1/markdown-module)

[Supplementary directions of task fields](https://open.feishu.cn/document/server-docs/task-v1/supplementary-directions-of-task-fields)

Task management

Remind

Comment

Follower

Collaborator

[Function introduction](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/overview)

[Add collaborators](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/create)

[Delete a collaborator](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/delete)

[Batch delete collaborator](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/batch_delete_collaborator)

[Obtain a collaborator list](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list)

authen

Lingo

App Information

Approval

Contact

Docs

Hire

Feishu People

Rooms

[Convert ID](https://open.feishu.cn/document/historic-version/id_convert)

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Deprecated Version (Not Recommended)](https://open.feishu.cn/document/server-docs/task-v1/overview) [Tasks](https://open.feishu.cn/document/server-docs/task-v1/overview) [Collaborator](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/overview)

Obtain a collaborator list

# Obtain a collaborator list

Copy Page

Last updated on 2024-04-15

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#request "Request")

[Request header](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#requestHeader "Request header")

[Path parameters](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#pathParams "Path parameters")

[Query parameters](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#queryParams "Query parameters")

[Request example](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#requestExample "Request example")

[Response](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#response "Response")

[Response body](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#errorCode "Error code")

# Obtain a collaborator list

This API is used to obtain a task list. The result can be displayed by pages. A maximum of 50 entries are supported.

Try It

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/task/v1/tasks/:task\_id/collaborators |
| HTTP Method | GET |
| Rate Limit | [1000 per minute & 50 per second](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| Supported app types | Custom apps<br>Store apps |
| Required scopes <br>Enable any scope from the list | View, create, update, and delete Task (legacy version)<br>View Task details |
| Required field scopes | The response body of the API contains the following sensitive fields, and they will be returned only after corresponding scopes are added. If you do not need the fields, it is not recommended that you request the scopes.<br>Obtain user ID<br>Only custom apps |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | When calling an API, the app needs to authenticate its identity through an access token. The data obtained with different types of access tokens may vary. Refer to [Choose and obtain access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM).<br>**Value format**: "Bearer `access_token`"<br>**Supported options are**:<br>tenant\_access\_token<br>Call the API on behalf of the app. The range of readable and writable data is determined by the app's own [data access range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions). Refer to [Get custom app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) or [Get store app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token). Example value: "Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>Call the API on behalf of the logged-in user. The range of readable and writable data is determined by the user's data access range. Refer to [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token). Example value: "Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| task\_id | string | Task ID<br>**Example value**: "0d38e26e-190a-49e9-93a2-35067763ed1f" |

### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| page\_size | int | No | **Example value**: 50<br>**Default value**: `50`<br>**Data validation rules**:<br>- Value range: `0` ～ `50` |
| page\_token | string | No | Page identifier. It is not filled in the first request, indicating traversal from the beginning; when there will be more groups, the new page\_token will be returned at the same time, and the next traversal can use the page\_token to get more groups<br>**Example value**: ""The value of the page\_token returned last time"" |
| user\_id\_type | string | No | User ID categories<br>**Example value**: "open\_id"<br>**Optional values are**:<br>- `open_id`：Identifies a user to an app. The same user has different Open IDs in different apps. [How to get Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- `union_id`：Identifies a user to a tenant that acts as a developer. A user has the same Union ID in apps developed by the same developer, and has different Union IDs in apps developed by different developers. A developer can use Union ID to link the same user's identities in multiple apps. [How to get Union ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- `user_id`：Identifies a user to a tenant. The same user has different User IDs in different tenants. In one single tenant, a user has the same User ID in all apps （including store apps）. User ID is usually used to communicate user data between different apps. [How to get User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**Default value**: `open_id`<br>**When the value is `user_id`, the following field scopes are required**:<br>Obtain user ID<br>Only custom apps |

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

curl-i-XGET'https://open.feishu.cn/open-apis/task/v1/tasks/0d38e26e-190a-49e9-93a2-35067763ed1f/collaborators?page\_size=50&page\_token=%22The+value+of+the+page\_token+returned+last+time%22&user\_id\_type=open\_id' \

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

9

10

{"code":0,

"msg":"success",

"data":{"items":\[{\
\
"id": "ou\_99e1a581b36ecc4862cbfbce473f1234",\
\
"id\_list": \[\
\
"ou\_550cc75233d8b7b9fcbdad65f34433f4"\
\
    \]\
\
}\],

"page\_token":""The value of the page\_token returned last time"",

"has\_more":false}}

### Error code

| HTTP status code | Error code | Description | Troubleshooting suggestions |
| --- | --- | --- | --- |
| 403 | 1470403 | The identity token is incorrect. It should be either user\_access\_token or tenant\_access\_token. | The identity token is incorrect. It should be either user\_access\_token or tenant\_access\_token. |
| 400 | 1470602 | Invalid task id. | Check whether the task ID is valid. |
| 400 | 1470432 | No permission to get the task. | You don't have permission to get the task. You need to check whether the object currently initiating the request has permission |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Ftask-v1%2Ftask-collaborator%2Flist%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

[How to obtain Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[How to request the required scopes for the application](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

Got other questions? Try asking AI Assistant

[Previous:Batch delete collaborator](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/batch_delete_collaborator) [Next:Get user\_access\_token](https://open.feishu.cn/document/historic-version/authen/create-3)

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

task\_id

\*

Example value:"0d38e26e-190a-49e9-93a2-35067763ed1f"

Query Parameters

page\_size

Example value:"50"

page\_token

user\_id\_type

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

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&apiName=list&project=task&resource=task.collaborator&version=v1)

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#request "Request")

[Request header](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#requestHeader "Request header")

[Path parameters](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#pathParams "Path parameters")

[Query parameters](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#queryParams "Query parameters")

[Request example](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#requestExample "Request example")

[Response](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#response "Response")

[Response body](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/task-v1/task-collaborator/list#errorCode "Error code")

Try It

Feedback

OnCall

Collapse

Expand