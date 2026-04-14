---
url: "https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert"
title: "Convert Markdown/HTML content into blocks - Server API - Documentation - Feishu Open Platform"
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

[Document overview](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/docx-overview)

[Document FAQs](https://open.feishu.cn/document/docs/docs/faq)

Data Structure

Document

Block

[Create blocks](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create)

[Create nested blocks](https://open.feishu.cn/document/docs/docs/document-block/create-2)

[Update a block](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/patch)

[Obtain the block content](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/get)

[Batch update blocks](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_update)

[Obtain all the child blocks](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/get-2)

[Delete blocks](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_delete)

[Convert Markdown/HTML content into blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert)

[Document version changes](https://open.feishu.cn/document/server-docs/docs/docs/upgraded-docs-openapi-access-guide)

Sheets

Base

Board

Permission

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Docs](https://open.feishu.cn/document/server-docs/docs/docs-overview) [Document](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/docx-overview) [Block](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create)

Convert Markdown/HTML content into blocks

# Convert Markdown/HTML content into blocks

Copy Page

Last updated on 2025-08-28

The contents of this article

[Request](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#7dbabeae "Request")

[Request header](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#20964697 "Request header")

[Query parameters](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#456b7083 "Query parameters")

[Request body](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#422ed976 "Request body")

[Request body example](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#0797b7de "Response body")

[Response body example](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#30f4b514 "Response body example")

[Error code](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#4b37c186 "Error code")

# Convert Markdown/HTML to document blocks

Convert Markdown/HTML formatted content into document blocks to facilitate the insertion of Markdown/HTML formatted content into a document. Currently, the supported block types for conversion include text, heading(1 - 9), bullet, ordered, code, quote, todo, image, table and table\_cell.

[Try it](https://open.feishu.cn/api-explorer?from=op_doc&project=docx&version=v1&resource=document&apiName=convert)

**To insert content in Markdown/HTML format into a document, the following operations need to be performed in sequence:**

1. Call the [Create a document](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/create) API to create a document of type docx (this step is not required if the target document already exists).
2. Call the current API to convert the content in Markdown/HTML format into document blocks.
3. Call the [Create nested blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) API to batch insert the blocks returned in step two into the target document.

**The following matters should be noted during the above-mentioned interface invocation process:**

- After converting the Markdown/HTML format content with tables into document blocks, before calling the [Create nested blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) API to batch insert blocks into the document, the `merge_info` field in the Table blocks needs to be removed first. Since `merge_info` is currently a read-only attribute, passing in this field will cause an error.

- Convert the Markdown/HTML format content containing images into document blocks, and call the [Create nested blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) API to insert the Image block into the document. After that, the [Upload Media](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all) API needs to be called, and the material is uploaded with Image BlockID as the `parent_node`. Then call the [Update a block](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/patch) or [Batch update blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/batch_update) API, specify the `replace_image` operation, and set the material ID to the corresponding Image Block.

- When the number of converted blocks is too large, the [Create nested blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) API needs to be called in batches. A single call to the [Create nested blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) API can insert up to 1000 blocks at most.


## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/docx/v1/documents/blocks/convert |
| HTTP Method | POST |
| Supported app types | Custom apps<br>Store apps |
| Required scopes | 文本内容转换为云文档块 |
| Required field scopes | The response body of the API contains the following sensitive fields, and they will be returned only after corresponding scopes are added. If you do not need the fields, it is not recommended that you request the scopes.<br>Obtain user ID |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | tenant\_access\_token<br>or<br>user\_access\_token<br>**Value format**: "Bearer `access_token`"<br>**Example value**: "Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[How to choose and get access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use) |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| user\_id\_type | string | No | User ID categories<br>**Example value**: "open\_id"<br>**Optional values are**:<br>- `open_id`：Identifies a user to an app. The same user has different Open IDs in different apps. [How to get Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>  <br>- `union_id`：Identifies a user to a tenant that acts as a developer. A user has the same Union ID in apps developed by the same developer, and has different Union IDs in apps developed by different developers. A developer can use Union ID to link the same user's identities in multiple apps. [How to get Union ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>  <br>- `user_id`：Identifies a user to a tenant. The same user has different User IDs in different tenants. In one single tenant, a user has the same User ID in all apps （including store apps）. User ID is usually used to communicate user data between different apps. [How to get User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>  <br>**Default value**: `open_id`<br>**When the value is `user_id`, the following field scopes are required**:<br>Obtain user ID |

### Request body

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| content\_type | string | Yes | Content type<br>**Example value**: "markdown"<br>**Optional values are**:<br>- `markdown`：Markdown format<br>  <br>- `html`：HTML format |
| content | string | Yes | Content<br>**Example value**: "Text \*\*Bold\*\* \*Italic\* ~~Strikethrough~~ \`inline code\` Hyperlink: \[Feishu Open Platform\](https://open.feishu.cn)\\n\\n!\[image\](https://sf3-scmcdn-cn.feishucdn.com/obj/feishu-static/lark/open/website/share-logo.png)\\n\\n# Heading1\\n\\n\`\`\`\\n hello word\\n\`\`\`\\n\\n> quote\\n\\n1. ordered1\\n2. ordered2\\n\\n- bullet1\\n- bullet2\\n\\n\|Location\|Features\|Cuisine\|\\n\|----\|----\|----\|\\n\|Seafood Street\|Seafood Market\|Fresh Seafood, Lobsters, Crabs, scallops\|"<br>**Data validation rules**:<br>- Length range: `1` ～ `10485760` characters |

### Request body example

1

2

3

4

{

"content\_type": "markdown",

"content": "Text \*\*Bold\*\* \*Italic\* ~~Strikethrough~~ \`inline code\` Hyperlink: \[Feishu Open Platform\](https://open.feishu.cn)\\n\\n!\[image\](https://sf3-scmcdn-cn.feishucdn.com/obj/feishu-static/lark/open/website/share-logo.png)\\n\\n# Heading1\\n\\n\`\`\`\\n  hello word\\n\`\`\`\\n\\n> quote\\n\\n1. ordered1\\n2. ordered2\\n\\n- bullet1\\n- bullet2\\n\\n\|Location\|Features\|Cuisine\|\\n\|----\|----\|----\|\\n\|Seafood Street\|Seafood Market\|Fresh Seafood, Lobsters, Crabs, scallops\|"

}

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

17

18

19

20

{

"code": 0,

"msg": "success",

"data": {

"first\_level\_block\_ids": \[\
\
"6f70483b-def6-4459-96ff-509b1de9f2ca",\
\
"4a0cc20d-1dbd-47af-9ca8-f71027b26468",\
\
"8da57e4f-d73e-44b4-9389-f45ed740f97f",\
\
"13b42d6c-8480-465f-91da-3b5c864c7af9",\
\
"bdb98e5b-dd35-4691-9c69-9a831182fd16",\
\
"0e8f483a-8c5a-4e96-b3d1-8f05731f8a66",\
\
"6b06836c-07a1-48b8-8859-466f6a11afc7",\
\
"a7c82c2c-22e9-42f6-b823-9fc86c230e5e",\
\
"14805dfc-2b6d-48c9-8317-7f8f5d603178",\
\
"e4faf5af-264b-408e-a480-22d19b4b13cf"\
\
        \],

"blocks": \[\
\
            {\
\
"block\_id": "row19f995d8-60b9-4945-b1dc-26bd448387c7cold95431db-2529-41b1-bae9-76f10070e6cc",\
\
"revision\_id": 0,\
\
### Error code\
\
| HTTP status code | Error code | Description | Troubleshooting suggestions |\
| --- | --- | --- | --- |\
| 500 | 1771001 | server internal error | Server internal error. Please retry the operation. If the issue continues, consult [Technical Support](https://applink.feishu.cn/TLJpeNdW) for assistance. |\
| 400 | 1770033 | content size exceed limit | Confirm whether plain text content size exceeds limit |\
\
[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FukTMukTMukTM%2FuUDN04SN0QjL1QDN%2Fdocument-docx%2Fdocx-v1%2Fdocument%2Fconvert%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction\
\
Related questions\
\
[How to read detailed content of a spreadsheet block in a document?](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq?lang=en-US#e70b767e)\
\
[How to add permissions for apps](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)\
\
[How to get the token（id） of docs resources?](https://open.feishu.cn/document/server-docs/docs/faq?lang=en-US#e4a9bfa1)\
\
[How to share the document created by the application (tenant\_access\_token) with personal access?](https://open.feishu.cn/document/server-docs/docs/permission/faq?lang=en-US#507872a1)\
\
[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)\
\
Got other questions? Try asking AI Assistant\
\
[Previous:Delete blocks](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_delete) [Next:Document version changes](https://open.feishu.cn/document/server-docs/docs/docs/upgraded-docs-openapi-access-guide)\
\
Please log in first before exploring any API.\
\
Log In\
\
RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)\
\
The contents of this article\
\
[Request](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#7dbabeae "Request")\
\
[Request header](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#20964697 "Request header")\
\
[Query parameters](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#456b7083 "Query parameters")\
\
[Request body](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#422ed976 "Request body")\
\
[Request body example](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#82f133c0 "Request body example")\
\
[Response](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#aa567d02 "Response")\
\
[Response body](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#0797b7de "Response body")\
\
[Response body example](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#30f4b514 "Response body example")\
\
[Error code](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert#4b37c186 "Error code")\
\
Try It\
\
Feedback\
\
OnCall\
\
Collapse\
\
Expand