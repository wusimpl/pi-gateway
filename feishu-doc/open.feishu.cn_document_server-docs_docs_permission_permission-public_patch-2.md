---
url: "https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2"
title: "UpdatePermissionPublic - Server API - Documentation - Feishu Open Platform"
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

[Docs overview](https://open.feishu.cn/document/server-docs/docs/docs-overview)

[Docs FAQs](https://open.feishu.cn/document/server-docs/docs/faq)

Space

Wiki

Document

Sheets

Base

Board

Permission

[Permission overview](https://open.feishu.cn/document/server-docs/docs/permission/overview)

[FAQ](https://open.feishu.cn/document/server-docs/docs/permission/faq)

Member

Setting

[UpdatePermissionPublic](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2)

[GetPermissionPublic](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/get-2)

password

Comment

Docs Assistant

Common

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Docs](https://open.feishu.cn/document/server-docs/docs/docs-overview) [Permission](https://open.feishu.cn/document/server-docs/docs/permission/overview) [Setting](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2)

UpdatePermissionPublic

# UpdatePermissionPublic

Copy Page

Last updated on 2025-07-03

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#request "Request")

[Request header](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#requestHeader "Request header")

[Path parameters](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#pathParams "Path parameters")

[Query parameters](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#queryParams "Query parameters")

[Request body](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#requestBody "Request body")

[Request example](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#requestExample "Request example")

[Response](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#response "Response")

[Response body](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#errorCode "Error code")

# Update common settings of a document

This API is used to update the common settings of a document based on a filetoken.

Try It

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/drive/v2/permissions/:token/public |
| HTTP Method | PATCH |
| Rate Limit | [100 per minute](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| Supported app types | Custom apps<br>Store apps |
| Required scopes <br>Enable any scope from the list | View, edit, and manage Wiki<br>View, comment, edit, and manage Docs<br>Modify permission settings of document<br>Create and edit upgraded Docs<br>View, comment, edit, and manage all files in My Space<br>Upload and download files to My Space<br>View, comment, edit, and manage Sheets<br>View, comment, edit, and manage Base (In Suite)<br>Scope of older version<br>Only custom apps |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | When calling an API, the app needs to authenticate its identity through an access token. The data obtained with different types of access tokens may vary. Refer to [Choose and obtain access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM).<br>**Value format**: "Bearer `access_token`"<br>**Supported options are**:<br>tenant\_access\_token<br>Call the API on behalf of the app. The range of readable and writable data is determined by the app's own [data access range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions). Refer to [Get custom app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) or [Get store app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token). Example value: "Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>Call the API on behalf of the logged-in user. The range of readable and writable data is determined by the user's data access range. Refer to [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token). Example value: "Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| token | string | Token of the file. For more information about how to obtain the token, see [How to get the token of docs resources](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#036e0b0f).<br>**Example value**: "doccnBKgoMyY5OMbUG6FioTXuBe" |

### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| type | string | Yes | File type, which needs to match the token of the file<br>**Example value**: "doc"<br>**Optional values are**:<br>- `doc`：Doc<br>- `sheet`：Sheet<br>- `file`：File in My Space<br>- `wiki`：Wiki node<br>- `bitable`：Bitable<br>Expand |

### Request body

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| external\_access\_entity | string | No | Allow content to be shared outside the organization<br>**Example value**: "open"<br>**Optional values are**:<br>- `open`：open<br>- `closed`：close<br>- `allow_share_partner_tenant`：Allow sharing with affiliated organizations(This value can only be set if the tenant's background setting allows only associated organizations to share) |
| security\_entity | string | No | Who can create copies, print, download<br>**Example value**: "anyone\_can\_view"<br>**Optional values are**:<br>- `anyone_can_view`：Users with viewing permissions<br>- `anyone_can_edit`：Users with editable permissions<br>- `only_full_access`：Users with manageable permissions (including me) |
| comment\_entity | string | No | Who can comment<br>**Example value**: "anyone\_can\_view"<br>**Optional values are**:<br>- `anyone_can_view`：Users with viewing permissions<br>- `anyone_can_edit`：Users with editable permissions |
| share\_entity | string | No | Who can add and manage collaborators - organizational dimension<br>**Example value**: "anyone"<br>**Optional values are**:<br>- `anyone`：All users who can read or edit this document<br>- `same_tenant`：All users in your organization who can read or edit this document |
| manage\_collaborator\_entity | string | No | Who can add and manage collaborators - collaborator dimension<br>**Example value**: "collaborator\_can\_view"<br>**Optional values are**:<br>- `collaborator_can_view`：Collaborators with viewing permissions<br>- `collaborator_can_edit`：Collaborators with editable permissions<br>- `collaborator_full_access`：Collaborators with manageable permissions (including me) |
| link\_share\_entity | string | No | Link sharing settings<br>**Example value**: "tenant\_readable"<br>**Optional values are**:<br>- `tenant_readable`：People in the organization who get the link can read it<br>- `tenant_editable`：People in the organization who get the link can edit<br>- `partner_tenant_readable`：People from affiliated organizations can read(This value can only be set if the tenant's background setting allows only associated organizations to share)<br>- `partner_tenant_editable`：People from affiliated organizations can edit(This value can only be set if the tenant's background setting allows only associated organizations to share)<br>- `anyone_readable`：Anyone with a link on the Internet can read it (only external\_access\_entity = "open")<br>Expand |
| copy\_entity | string | No | Who can copy the content<br>**Example value**: "anyone\_can\_view"<br>**Optional values are**:<br>- `anyone_can_view`：Users with viewing permissions<br>- `anyone_can_edit`：Users with editable permissions<br>- `only_full_access`：Collaborators with manageable permissions (including me) |

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

curl-i-X PATCH 'https://open.feishu.cn/open-apis/drive/v2/permissions/doccnBKgoMyY5OMbUG6FioTXuBe/public?type=doc' \

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

11

12

13

14

15

16

{

"code": 0,

"msg": "success",

"data": {

"permission\_public": {

"external\_access\_entity": "open",

"security\_entity": "anyone\_can\_view",

"comment\_entity": "anyone\_can\_view",

"share\_entity": "anyone",

"manage\_collaborator\_entity": "collaborator\_can\_view",

"link\_share\_entity": "tenant\_readable",

"copy\_entity": "anyone\_can\_view",

"lock\_switch": false

        }

    }

}

### Error code

| HTTP status code | Error code | Description | Troubleshooting suggestions |
| --- | --- | --- | --- |
| 400 | 1063001 | Invalid parameter | The parameter is abnormal, which may be due to the following reasons:<br>- The parameter types do not match, for example, the token and type of the document do not match.<br>- Abnormal parameter filling, such as token or type filling, which does not meet the requirements of the document. |
| 403 | 1063002 | Permission denied | Unauthorized operation may be due to the following reasons:<br>- There is no permission to call the identity, such as: the user corresponding to the calling identity is not in the collaborator of the cloud document, and there is no permission to operate.<br>- Visibility restrictions, such as: inviting group collaborators who are not in the group, inviting department collaborators who are not in the department. |
| 400 | 1063003 | Invalid operation | Illegal operation, which may be due to the following reasons:<br>- The number of collaborators has reached the upper limit.<br>- Modify cloud document permission settings but cannot be modified due to enterprise control. |
| 403 | 1063004 | User has no share permission | The user does not have sharing permissions, please confirm whether the calling identity has sharing permissions for the document. |
| 404 | 1063005 | Resource is deleted | The resource has been deleted, please confirm that the cloud document still exists. |
| 500 | 1066001 | Internal Error | Internal service error, such as timeout or failure in processing error codes. |
| 500 | 1066002 | Concurrency error, please retry | Internal service error. Please try again. |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fpermission%2Fpermission-public%2Fpatch-2%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to add permissions for apps](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[How to get the token（id） of docs resources?](https://open.feishu.cn/document/server-docs/docs/faq?lang=en-US#e4a9bfa1)

[How to share the document created by the application (tenant\_access\_token) with personal access?](https://open.feishu.cn/document/server-docs/docs/permission/faq?lang=en-US#507872a1)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

Got other questions? Try asking AI Assistant

[Previous:Check whether the current user has a specific permission](https://open.feishu.cn/document/server-docs/docs/permission/permission-member/auth) [Next:GetPermissionPublic](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/get-2)

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

token

\*

Example value:"doccnBKgoMyY5OMbUG6FioTXuBe"

Query Parameters

type

\*

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

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&apiName=patch&project=drive&resource=permission.public&version=v2)

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#request "Request")

[Request header](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#requestHeader "Request header")

[Path parameters](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#pathParams "Path parameters")

[Query parameters](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#queryParams "Query parameters")

[Request body](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#requestBody "Request body")

[Request example](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#requestExample "Request example")

[Response](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#response "Response")

[Response body](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/docs/permission/permission-public/patch-2#errorCode "Error code")

Try It

Feedback

OnCall

Collapse

Expand