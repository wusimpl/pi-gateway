---
url: "https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create"
title: "Create blocks - Server API - Documentation - Feishu Open Platform"
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

Create blocks

# Create blocks

Copy Page

Last updated on 2025-07-17

The contents of this article

[Prerequisites](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#347504e0 "Prerequisites")

[Request](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#7dbabeae "Request")

[Request header](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#20964697 "Request header")

[Path parameters](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#24d86572 "Path parameters")

[Query parameters](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#456b7083 "Query parameters")

[Request body](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#422ed976 "Request body")

[Request example](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#a1263ee8 "Request example")

[Request body example](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#0797b7de "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#30f4b514 "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#4b37c186 "Error code")

# Create blocks

Creates a batch of child blocks for a given block and inserts them at a specific location. The return value of this API is the rich text content of the newly created child blocks. To learn about the parent-child relationship between blocks, see [Document overview-Basic concept](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview).

[Try it](https://open.feishu.cn/api-explorer?from=op_doc&project=docx&version=v1&resource=document.block.children&apiName=create)

**Application frequency limit:** The maximum frequency of a single application call is 3 times per second, beyond which the HTTP status code 400 and error code 99991400 will be returned.

**Document frequency limit**: The maximum number of concurrent edits per second for a single document is 3, beyond which the HTTP status code 429 will be returned. The edit operations include:

- Create blocks
- Create nested blocks
- Delete blocks
- Update a block
- Batch update blocks

When a request is frequency-limited, the application needs to handle the frequency-limited status code and use an exponential fallback algorithm or some other frequency-control strategy to reduce the rate of calls to the API.

If you need to efficiently create a batch of child blocks with hierarchical structure or create tables with content, it is recommended to use the [Create Nested Blocks](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) API.

## Prerequisites

Before calling this API, please ensure that the current identity (tenant\_access\_token or user\_access\_token) already has the necessary permissions to read, edit, or perform other actions on cloud documents. Otherwise, the API will return an HTTP 403 or 400 status code. For more information, refer to [How to Grant Document Permissions to Applications or Users](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a).

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/docx/v1/documents/:document\_id/blocks/:block\_id/children |
| HTTP Method | POST |
| Supported app types | Custom apps<br>Store apps |
| Required scopes<br> <br>Enable any scope from the list | Create and edit upgraded Docs<br>Edit upgraded Docs |
| Required field scopes | The response body of the API contains the following sensitive fields, and they will be returned only after corresponding scopes are added. If you do not need the fields, it is not recommended that you request the scopes.<br>Obtain user ID |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | tenant\_access\_token<br>or<br>user\_access\_token<br>**Value format**: "Bearer `access_token`"<br>**Example value**: "Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[How to choose and get access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use) |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| document\_id | string | The unique identification of the document. Click [here](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview) to learn how to get `document_id`<br>**Example value**: "doxcnePuYufKa49ISjhD8Iabcef" |
| block\_id | string | The `block_id` of the parent block. To create child blocks for the document, you can fill in its `document_id` here. You can use the [Obtain all blocks of a document](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list) to get the `block_id`. To learn about the parent-child relationship between blocks, see [Document overview-Basic concept](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview)<br>**Example value**: "doxcnO6UW6wAw2qIcYf4hZabcef" |

### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| document\_revision\_id | int | No | The document version to be queried. -1 indicates the latest version of the document. Once the document is created, the `document_revision_id` is 1. Make sure you have editing permission for the document. You can use the [Obtain the basic information of a document](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/get) interface to get the latest revision ID<br>**Example value**: -1<br>**Default value**: `-1`<br>**Data validation rules**:<br>- Minimum value: `-1` |
| client\_token | string | No | The unique identifier of the operation, corresponding to the `client_token` returned by the API. It is used for idempotent update operations. When this value is null, a new request will be initiated; when this value is not null, idempotent updates will be performed<br>**Example value**: "Fe599b60-450f-46ff-b2ef-9f6675625b97" |
| user\_id\_type | string | No | User ID categories<br>**Example value**: "open\_id"<br>**Optional values are**:<br>- `open_id`：Identifies a user to an app. The same user has different Open IDs in different apps. [How to get Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>  <br>- `union_id`：Identifies a user to a tenant that acts as a developer. A user has the same Union ID in apps developed by the same developer, and has different Union IDs in apps developed by different developers. A developer can use Union ID to link the same user's identities in multiple apps. [How to get Union ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>  <br>- `user_id`：Identifies a user to a tenant. The same user has different User IDs in different tenants. In one single tenant, a user has the same User ID in all apps （including store apps）. User ID is usually used to communicate user data between different apps. [How to get User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>  <br>**Default value**: `open_id`<br>**When the value is `user_id`, the following field scopes are required**:<br>Obtain user ID |

### Request body

| Parameter<br>Show sublists | Type | Required | Description |
| --- | --- | --- | --- |
| children | block\[\] | No | The child block list. To learn about the parent-child relationship between blocks, see [Document overview-Basic concept](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview). In a single request, you can create a maximum of 5 Sheet blocks.<br>**Data validation rules**:<br>- Length range: `1` ～ `50` |
| index | int | No | Specifies the placement of the newly created child blocks in the parent block. The starting value of the index is 0, indicating the first position in the child block list; The maximum value of the index is the number of child blocks of the parent block, representing the last position in the child block list. For example, if a parent block has 5 child blocks, their indexes are 0, 1, 2, 3, and 4, respectively. If you want to place a newly created block in the first position of the parent block, the index value should be 0; If you want to place the newly created block in the last position, the index value should be -1<br>**Example value**: 0<br>**Default value**: `-1` |

### Request example

```

curl --location --request POST 'https://open.feishu.cn/open-apis/docx/v1/documents/doxcnAJ9VRRJqVMYZ1MyKnavXWe/blocks/doxcnAJ9VRRJqVMYZ1MyKnabcef/children?document_revision_id=120' \
--header 'Authorization: Bearer u-xxx' \
--header 'Content-Type: application/json' \
--data-raw '{
    "index": 0,
    "children": [\
        {\
            "block_type": 2,\
            "text": {\
                "elements": [\
                    {\
                        "text_run": {\
                            "content": "多人实时协同，插入一切元素。不仅是在线文档，更是",\
                            "text_element_style": {\
                                "background_color": 14,\
                                "text_color": 5\
                            }\
                        }\
                    },\
                    {\
                        "text_run": {\
                            "content": "强大的创作和互动工具",\
                            "text_element_style": {\
                                "background_color": 14,\
                                "bold": true,\
                                "text_color": 5\
                            }\
                        }\
                    }\
                ],\
                "style": {}\
            }\
        }\
    ]
}'
# You need to replace 'u-xxx' in 'Authorization: Bearer u-xxx' with the real access token
```

### Request body example

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

"index": 0,

"children": \[\
\
        {\
\
"block\_type": 2,\
\
"text": {\
\
"elements": \[\
\
                    {\
\
"text\_run": {\
\
"content": "Collaborate with multiple people in real time and insert all elements. Not only online documents",\
\
"text\_element\_style": {\
\
"background\_color": 14,\
\
"text\_color": 5\
\
                            }\
\
                        }\
\
                    },\
\
                    {\
\
"text\_run": {\
\
"content": "More powerful creation and interaction tools",\
\
"text\_element\_style": {\
\
## Response\
\
### Response body\
\
| Parameter<br>Show sublists | Type | Description |\
| --- | --- | --- |\
| code | int | Error codes, fail if not zero |\
| msg | string | Error descriptions |\
| data | - | - |\
\
### Response body example\
\
1\
\
2\
\
3\
\
4\
\
5\
\
6\
\
7\
\
8\
\
9\
\
10\
\
11\
\
12\
\
13\
\
14\
\
15\
\
16\
\
17\
\
18\
\
19\
\
20\
\
{\
\
"code": 0,\
\
"data": {\
\
"children": \[\
\
            {\
\
"block\_id": "doxcnXgNGAtaAraIRVeCfmbx4Eo",\
\
"block\_type": 2,\
\
"parent\_id": "doxcnAJ9VRRJqVMYZ1MyKnayXWe",\
\
"text": {\
\
"elements": \[\
\
                        {\
\
"text\_run": {\
\
"content": "Collaborate with multiple people in real time and insert all elements. Not only online documents",\
\
"text\_element\_style": {\
\
"background\_color": 14,\
\
"text\_color": 5\
\
                                }\
\
                            }\
\
                        },\
\
                        {\
\
### Error code\
\
| HTTP status code | Error code | Description | Troubleshooting suggestions |\
| --- | --- | --- | --- |\
| 400 | 1770001 | invalid param | Confirm whether the passed parameters are valid |\
| 404 | 1770002 | not found | **For Document APIs**:<br>The `document_id` of the document does not exist. Please verify that the document has not been deleted or that the `document_id` is correct. Refer to [Document overview](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview) for information on how to get the `document_id` of a document.<br>**For Group Announcement APIs**:<br>The `chat_id` of the group announcement does not exist. Please verify that the group has not been disbanded or if the `chat_id` is correctly inputted. |\
| 400 | 1770003 | resource deleted | Confirm whether the resource has been deleted |\
| 400 | 1770004 | too many blocks in document | Confirm whether the number of document blocks exceeds the limit |\
| 400 | 1770005 | too deep level in document | Confirm whether the level of document blocks exceeds the limit |\
| 400 | 1770006 | schema mismatch | Confirm whether the document structure is valid |\
| 400 | 1770007 | too many children in block | Confirm whether the number of children for a specified block exceeds the limit |\
| 400 | 1770008 | too big file size | Confirm whether the uploaded file size exceeds the limit |\
| 400 | 1770010 | too many table column | Confirm whether the number of table columns exceeds the limit |\
| 400 | 1770011 | too many table cell | Confirm whether the number of table cells exceeds the limit |\
| 400 | 1770012 | too many grid column | Confirm whether the number of grid columns exceeds the limit |\
| 400 | 1770013 | relation mismatch | Images, files, and other resources are incorrectly associated. Please make sure that you have uploaded the related image or file material to the corresponding document block at the same time when you create the image or file block. Please refer to the documentation [FAQ 3 and 4](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#1908ddf0) for details |\
| 400 | 1770014 | parent children relation mismatch | Confirm whether the parent-child relationships of blocks are correct |\
| 400 | 1770015 | single edit with multi document | Confirm whether the block belongs to the specified document |\
| 400 | 1770019 | repeated blockID in document | Confirm whether there are duplicate Block IDs in the document |\
| 400 | 1770020 | operation denied on copying document | Confirm whether the document is currently being copied |\
| 400 | 1770021 | too old document | Confirm if the specified document version is too old. The difference between the specified `revision_id` and the latest `revision_id` of the document cannot exceed 1000 |\
| 400 | 1770022 | invalid page token | Confirm if the page\_token in the query parameters is valid |\
| 400 | 1770024 | invalid operation | Confirm whether the operation is valid<br>- Except for text\_run, other text\_element are not allowed to set link attribute<br>- Undefined element is not allowed to be set in text\_element<br>- The number of columns of the grid column is between 2 and 10, and it is not allowed to reduce or increase the number of columns beyond the agreed range<br>- When the table has only one row or one column, it is not allowed to operate the table by requesting to reduce the number of rows and columns of the table |\
| 400 | 1770025 | operation and block not match | Confirm whether the corresponding operation of the specified block is valid |\
| 400 | 1770026 | row operation over range | Confirm if the row operation index is out of bounds |\
| 400 | 1770027 | column operation over range | Confirm if the column operation index is out of bounds |\
| 400 | 1770028 | block not support create children | Confirm if adding children to the specified block is valid |\
| 400 | 1770029 | block not support to create | Confirm whether the specified block supports creation |\
| 400 | 1770030 | invalid parent children relation | Confirm whether the parent-child relationship for the specified operation is valid |\
| 400 | 1770031 | block not support to delete children | Confirm if the specified block supports deleting children |\
| 400 | 1770033 | content size exceed limit | Confirm whether plain text content size exceeds limit |\
| 400 | 1770034 | operation count exceed limited | Too many cells are involved in the current request. Please split into multiple requests |\
| 400 | 1770035 | Resource count exceeds limit | The number of resources in the current request exceeds the limit, please split it into multiple requests. The upper limit of various resources is: 200 ChatCard, 200 File, 200 MentionDoc, 200 MentionUser, 20 Image, 20 ISV, 5 Sheet and 5 Bitable. |\
| 403 | 1770032 | forbidden | **For Document APIs**:<br>- Confirm whether the current access identity has permission to read or edit documents. Please refer to the following methods to resolve this:<br>  <br>  <br>  - If you are using a `tenant_access_token`, it means the current application does not have permission to read or edit documents. You need to add document permissions for the application through the cloud document webpage by navigating to the top right corner **"..."** -\> **"... More"** -\> **"Add applications"**.<br>    <br>    **Note**: Before adding a document application, you need to ensure that the target application has at least one cloud document [API permission](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/scope-list) enabled. Otherwise, you will not be able to search for the target application in the document application window.<br>    <br>    ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/bb60f97ebb402475f2af1d3131d4914f_sLOzoqYRXX.png?height=1992&maxWidth=550&width=3278)<br>    <br>  - If you are using a `user_access_token`, it means the current user does not have permission to read or edit documents. You need to add document permissions for the current user through the **Share** entry in the top right corner of the cloud document webpage.<br>    <br>    ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/caceea2ac91c170555194d7a8dc2a317_GfTRc9xLAt.png?height=1992&maxWidth=550&width=3278)<br>    <br>For more details on the specific steps or other methods to add permissions, refer to [Cloud Document FAQ 3](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a).<br>- Confirm whether the current access identity has permission to read MentionDoc, i.e., @document.<br>  <br>- Confirm whether the user in MentionUser, i.e., @user, is currently employed and is a contact of the current access identity.<br>  <br>- Confirm whether the current access identity has permission to view and share group cards.<br>  <br>- Confirm whether the current access identity has permission to access specific Wiki subdirectories.<br>  <br>- Confirm whether the current access identity has permission to view document blocks such as OKR, ISV, Add-Ons, etc.<br>  <br>**For Group Announcement APIs**:<br>The current operator does not have permission to edit group announcemen. Solution:<br>- Solution 1: Call the [Specify group administrator](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-managers/add_managers) interface to set the current operator as a group administrator, and then try again.<br>- Solution 2: In **Feishu Client > Group > Settings > Group Settings**, set **Who can edit group info** to **Everyone in this group**, and then try again.<br>When working with APIs for creating and updating group announcement, ensure the following:<br>- Confirm whether the current access identity has permission to read MentionDoc, i.e., @document.<br>- Confirm whether the user in MentionUser, i.e., @user, is currently employed and is a contact of the current access identity.<br>- Confirm whether the current access identity has permission to view and share group cards.<br>- Confirm whether the current access identity has permission to access specific Wiki subdirectories.<br>- Confirm whether the current access identity has permission to view document blocks such as OKR, ISV, Add-Ons, etc. |\
| 500 | 1771001 | server internal error | Server internal error. Please retry the operation. If the issue continues, consult [Technical Support](https://applink.feishu.cn/TLJpeNdW) for assistance. |\
| 500 | 1771006 | mount folder failed | Failed to mount the document to the cloud space folder. Please check if a `wiki_token` was mistakenly passed and try again. If the issue persists, please contact [Technical Support](https://applink.feishu.cn/TLJpeNdW). |\
| 500 | 1771002 | gateway server internal error | Gateway service internal error. Please retry the operation. If the issue continues, consult [Technical Support](https://applink.feishu.cn/TLJpeNdW) for assistance. |\
| 500 | 1771003 | gateway marshal error | Gateway service parsing error. Please retry the operation. If the issue continues, consult [Technical Support](https://applink.feishu.cn/TLJpeNdW) for assistance. |\
| 500 | 1771004 | gateway unmarshal error | Gateway service unmarshalling error. Please retry the operation. If the issue continues, consult [Technical Support](https://applink.feishu.cn/TLJpeNdW) for assistance. |\
| 503 | 1771005 | system under maintenance | System service is under maintenance. If the issue continues, consult [Technical Support](https://applink.feishu.cn/TLJpeNdW) for assistance. |\
| 400 | 1770038 | resource not found | The inserted resource was not found or the resource did not have permission to insert, please check that the resource identifier is correct. |\
\
[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fdocs%2Fdocx-v1%2Fdocument-block%2Fcreate%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction\
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
[Previous:Obtain all blocks of a document](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document/list) [Next:Create nested blocks](https://open.feishu.cn/document/docs/docs/document-block/create-2)\
\
Please log in first before exploring any API.\
\
Log In\
\
RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)\
\
The contents of this article\
\
[Prerequisites](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#347504e0 "Prerequisites")\
\
[Request](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#7dbabeae "Request")\
\
[Request header](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#20964697 "Request header")\
\
[Path parameters](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#24d86572 "Path parameters")\
\
[Query parameters](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#456b7083 "Query parameters")\
\
[Request body](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#422ed976 "Request body")\
\
[Request example](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#a1263ee8 "Request example")\
\
[Request body example](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#82f133c0 "Request body example")\
\
[Response](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#aa567d02 "Response")\
\
[Response body](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#0797b7de "Response body")\
\
[Response body example](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#30f4b514 "Response body example")\
\
[Error code](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create#4b37c186 "Error code")\
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