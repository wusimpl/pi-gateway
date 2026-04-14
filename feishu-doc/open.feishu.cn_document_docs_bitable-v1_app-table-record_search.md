---
url: "https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search"
title: "Search records - Server API - Documentation - Feishu Open Platform"
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

[Base overview](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview)

[Base FAQs](https://open.feishu.cn/document/docs/bitable-v1/faq)

[Base data structure overview](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-structure)

App

Table

View

Record

[Base record data structure](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/bitable-record-data-structure-overview)

[Record filter guide](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide)

[Add a sub-record in a Base table](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/add-a-sub-record-in-a-base-table)

[Create a record](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/create)

[Update a record](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/update)

[Search records](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search)

[Delete a record](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/delete)

[Create records](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create)

[Update records](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_update)

[Batch get records](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/batch_get)

[Delete records](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_delete)

Field

Field Group

Dashboards

Form

Advanced Permission

Automation

Workflow

Events

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Docs](https://open.feishu.cn/document/server-docs/docs/docs-overview) [Base](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview) [Record](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/bitable-record-data-structure-overview)

Search records

# Search records

Copy Page

Last updated on 2025-05-07

The contents of this article

[Request](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#request "Request")

[Request header](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#requestHeader "Request header")

[Path parameters](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#pathParams "Path parameters")

[Query parameters](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#queryParams "Query parameters")

[Request body](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#requestBody "Request body")

[Request example](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#requestExample "Request example")

[Response](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#response "Response")

[Response body](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#errorCode "Error code")

# Search records

This api is used to query existing records in the table. A maximum of 500 rows of records can be queried at a time, and paging is supported.

Try It

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/bitable/v1/apps/:app\_token/tables/:table\_id/records/search |
| HTTP Method | POST |
| Rate Limit | [20 per second](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| Supported app types | Custom apps<br>Store apps |
| Required scopes <br>Enable any scope from the list | Search records by conditions<br>View, comment, edit and manage Base<br>View, comment, and export Base |
| Required field scopes | The response body of the API contains the following sensitive fields, and they will be returned only after corresponding scopes are added. If you do not need the fields, it is not recommended that you request the scopes.<br>Obtain user's basic information<br>Obtain user ID<br>Only custom apps<br>Access Contacts as an app<br>Scope of older version<br>Read contacts<br>Scope of older version<br>Read Contacts as an app<br>Scope of older version |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | When calling an API, the app needs to authenticate its identity through an access token. The data obtained with different types of access tokens may vary. Refer to [Choose and obtain access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM).<br>**Value format**: "Bearer `access_token`"<br>**Supported options are**:<br>tenant\_access\_token<br>Call the API on behalf of the app. The range of readable and writable data is determined by the app's own [data access range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions). Refer to [Get custom app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) or [Get store app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token). Example value: "Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>Call the API on behalf of the logged-in user. The range of readable and writable data is determined by the user's data access range. Refer to [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token). Example value: "Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| app\_token | string | The unique identifier of the Bitable App. Different forms of Bitable have different ways of obtaining app\_token:<br>- If a Bitable URL begins with \\*\\* feishu.cn/base \*\*, the Bitable app\_token is highlighted in the image below:<br>  <br>  <br>  <br>  <br>  <br>  ![](<Base64-Image-Removed>)<br>  <br>- If Bitable's URL starts with \\*\\* feishu.cn/wiki \*\*, you need to call the Knowledge Base related [Get Wiki Workspace Node Information](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node) interface to get Bitable's app\_token. When the value of obj\_type is bitable, the value of the obj\_token field is the app\_token of Bitable.<br>  <br>For more information, see [How to get app\_token](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview#-752212c).<br>**Example value**: "NQRxbRkBMa6OnZsjtERcxhNWnNh"<br>**Data validation rules**:<br>- Length range: `0` characters ～ `100` characters |
| table\_id | string | Bitable data table unique identifier. How to get:<br>- You can get the table\_id through the Bitable URL. The highlighted part of the image below is the table\_id of the current data table.<br>  <br>- table\_id can also be obtained through the [list data table](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list) interface<br>  <br>  <br>  <br>  <br>  <br>  ![](<Base64-Image-Removed>)<br>  <br>**Example value**: "tbl0xe5g8PP3U3cS"<br>**Data validation rules**:<br>- Length range: `0` characters ～ `50` characters |

### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| user\_id\_type | string | No | User ID categories<br>**Example value**: "open\_id"<br>**Optional values are**:<br>- `open_id`：Identifies a user to an app. The same user has different Open IDs in different apps. [How to get Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- `union_id`：Identifies a user to a tenant that acts as a developer. A user has the same Union ID in apps developed by the same developer, and has different Union IDs in apps developed by different developers. A developer can use Union ID to link the same user's identities in multiple apps. [How to get Union ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- `user_id`：Identifies a user to a tenant. The same user has different User IDs in different tenants. In one single tenant, a user has the same User ID in all apps （including store apps）. User ID is usually used to communicate user data between different apps. [How to get User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**Default value**: `open_id`<br>**When the value is `user_id`, the following field scopes are required**:<br>Obtain user ID<br>Only custom apps |
| page\_token | string | No | Page identifier. It is not filled in the first request, indicating traversal from the beginning; when there will be more groups, the new page\_token will be returned at the same time, and the next traversal can use the page\_token to get more groups<br>**Example value**: "eVQrYzJBNDNONlk4VFZBZVlSdzlKdFJ4bVVHVExENDNKVHoxaVdiVnViQT0=" |
| page\_size | int | No | Page size. The maximum value is 500<br>**Example value**: 10<br>**Default value**: `20` |

### Request body

| Parameter<br>Show sublists | Type | Required | Description |
| --- | --- | --- | --- |
| view\_id | string | No | Base view unique device identifier [view\_id description](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/bitable/notification#8121eebe)<br>**Example value**: "vewp7nmiS4"<br>**Data validation rules**:<br>- Length range: `0` characters ～ `50` characters |
| field\_names | string\[\] | No | field\_names<br>**Example value**: \["fieldName1"\]<br>**Data validation rules**:<br>- Length range: `0` ～ `200` |
| sort | sort\[\] | No | Data validation rules<br>**Data validation rules**:<br>- Length range: `0` ～ `100` |
| filter | filter\_info | No | Refer to the [Record Filter Parameter Filling Guide](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/record-filter-guide) to learn how to fill in the filter. |
| automatic\_fields | boolean | No | Whether to automatically calculate and return the four types of fields: creation time (`created_time`), modification time (`last_modified_time`), creator (`created_by`), and modifier (`last_modified_by`). The default is false, indicating they will not be returned.<br>**Example value**: false |

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

curl-i-X POST 'https://open.feishu.cn/open-apis/bitable/v1/apps/NQRxbRkBMa6OnZsjtERcxhNWnNh/tables/tbl0xe5g8PP3U3cS/records/search?page\_size=10&

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

"code":0,

"data":{

"has\_more":false,

"items":\[\
\
            {\
\
"created\_by":{\
\
"avatar\_url":"https://internal-api-lark-file.feishu.cn/static-resource/v1/06d568cb-f464-4c2e-bd03-76512c545c5j~?image\_size=72x72&amp;cut\_type=default-face&amp;quality=&amp;format=jpeg&amp;sticker\_format=.webp",\
\
"email":"",\
\
"en\_name":"测试1",\
\
"id":"ou\_92945f86a98bba075174776959c90eda",\
\
"name":"测试1"\
\
                },\
\
"created\_time":1691049973000,\
\
"fields":{\
\
"人员":\[\
\
                        {\
\
"avatar\_url":"https://internal-api-lark-file.feishu.cn/static-resource/v1/b2-7619-4b8a-b27b-c72d90b06a2j~?image\_size=72x72&amp;cut\_type=default-face&amp;quality=&amp;format=jpeg&amp;sticker\_format=.webp",\
\
"email":"zhangsan.leben@bytedance.com",\
\
"en\_name":"ZhangSan",\
\
### Error code\
\
| HTTP status code | Error code | Description | Troubleshooting suggestions |\
| --- | --- | --- | --- |\
| 200 | 1254000 | WrongRequestJson | Request error |\
| 200 | 1254001 | WrongRequestBody | Request body error |\
| 200 | 1254002 | Fail | Internal error, have any questions can be consulting service |\
| 200 | 1254003 | WrongBaseToken | AppToken error |\
| 200 | 1254004 | WrongTableId | Table id wrong |\
| 200 | 1254005 | WrongViewId | View id wrong |\
| 200 | 1254006 | WrongRecordId | Record id wrong |\
| 200 | 1254007 | EmptyValue | Empty value |\
| 200 | 1254008 | EmptyView | Empty view |\
| 200 | 1254009 | WrongFieldId | Wrong fieldId |\
| 200 | 1254010 | ReqConvError | Request error |\
| 400 | 1254011 | Page size must greater than 0. | invalid page\_size |\
| 200 | 1254016 | InvalidSort | invalid sort |\
| 200 | 1254018 | InvalidFilter | The filter parameter is incorrect. Please refer to [Record filter development guide](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/record-filter-guide) for information on how to fill in the filter parameter. |\
| 200 | 1254024 | InvalidFieldNames | InvalidFieldNames |\
| 200 | 1254030 | TooLargeResponse | TooLargeResponse |\
| 400 | 1254036 | Base is copying, please try again later. | Base copy replicating, try again later |\
| 200 | 1254040 | BaseTokenNotFound | AppToken not found |\
| 200 | 1254041 | TableIdNotFound | Table not found |\
| 200 | 1254042 | ViewIdNotFound | View not found |\
| 200 | 1254043 | RecordIdNotFound | RecordIdNotFound |\
| 200 | 1254044 | FieldIdNotFound | FieldIdNotFound |\
| 200 | 1254045 | FieldNameNotFound | Field name does not exist |\
| 200 | 1254060 | TextFieldConvFail | TextFieldConvFail |\
| 200 | 1254061 | NumberFieldConvFail | NumberFieldConvFail |\
| 200 | 1254062 | SingleSelectFieldConvFail | SingleSelectFieldConvFail |\
| 200 | 1254063 | MultiSelectFieldConvFail | MultiSelectFieldConvFail |\
| 200 | 1254064 | DatetimeFieldConvFail | DatetimeFieldConvFail |\
| 200 | 1254065 | CheckboxFieldConvFail | CheckboxFieldConvFail |\
| 200 | 1254066 | UserFieldConvFail | The value corresponding to the personnel field type is incorrect. The possible reasons are:<br>- The ID type specified by the user\_id\_type parameter does not match the type of the provided ID.<br>- An unrecognized type or structure was provided. Currently, only `id` is supported, and it must be passed as an array.<br>- An `open_id` was passed across applications. If you are passing an ID across applications, it is recommended to use `user_id`. The `open_id` obtained from different applications cannot be used interchangeably. |\
| 200 | 1254067 | LinkFieldConvFail | LinkFieldConvFail |\
| 200 | 1254068 | URLFieldConvFail | URLFieldConvFail |\
| 200 | 1254069 | AttachFieldConvFail | AttachFieldConvFail |\
| 200 | 1254072 | Failed to convert phone field, please make sure it is correct. | invalid phone format |\
| 200 | 1254100 | TableExceedLimit | TableExceedLimit, limited to 300 |\
| 200 | 1254101 | ViewExceedLimit | ViewExceedLimit, limited to 200 |\
| 200 | 1254102 | FileExceedLimit | FileExceedLimit |\
| 200 | 1254103 | RecordExceedLimit | RecordExceedLimit, limited to 20,000 |\
| 200 | 1254104 | RecordAddOnceExceedLimit | RecordAddOnceExceedLimit, limited to 500 |\
| 200 | 1254107 | FilterLengthExceedLimit | FilterLengthExceedLimit, limited to 2,000 characters |\
| 200 | 1254108 | SortLengthExceedLimit | SortLengthExceedLimit, limited to 1,000 characters |\
| 200 | 1254109 | FormulaTableSizeExceedLimit | FormulaTableSizeExceedLimit |\
| 200 | 1254130 | TooLargeCell | TooLargeCell |\
| 200 | 1254290 | TooManyRequest | Request too fast, try again later |\
| 200 | 1254291 | Write conflict | The same data table does not support concurrent calls to the write interface, please check whether there is a concurrent call to the write interface. The writing interface includes: adding, modifying, and deleting records; adding, modifying, and deleting fields; modifying forms; modifying views, etc. |\
| 200 | 1254301 | OperationTypeError | Base does not have advanced permissions enabled or does not support enabling advanced permissions |\
| 200 | 1254302 | Permission denied. | No access rights, usually caused by the table opening of advanced permissions, please add a group containing applications in the advanced permissions settings and give this group read and write permissions |\
| 200 | 1254303 | AttachPermNotAllow | No attach permission |\
| 200 | 1255001 | InternalError | Internal error, have any questions can be consulting service |\
| 200 | 1255002 | RpcError | Internal error, have any questions can be consulting service |\
| 200 | 1255003 | MarshalError | Serialization failed, have any questions can be consulting service |\
| 200 | 1255004 | UmMarshalError | Deserialization failed, have any questions can be consulting service |\
| 200 | 1255005 | ConvError | Internal error, have any questions can be consulting service |\
| 504 | 1255040 | Request timed out, please try again later | Try again |\
| 400 | 1254607 | Data not ready, please try again later | There are usually two situations when this error occurs: 1. The last submitted modification has not been processed; 2. The data is too large and the server calculation times out;This error code can be appropriately retried. |\
\
[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fdocs%2Fbitable-v1%2Fapp-table-record%2Fsearch%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction\
\
Related questions\
\
[How to enable Base app permissions for the application?](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app?lang=en-US#a8ec8683)\
\
[How to add records with attachments in a Base table?](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=en-US#95c868cd)\
\
[How to fill in the filter parameters in a Base table?](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/record-filter-guide)\
\
[How to download files from records in a Base table?](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=en-US#54b7dd11)\
\
[How to filter personnel fields when calling the query record interface?](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=en-US#5c2dbb30)\
\
Got other questions? Try asking AI Assistant\
\
[Previous:Update a record](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/update) [Next:Delete a record](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/delete)\
\
Please log in first before exploring any API.\
\
Log In\
\
API Explorer\
\
Sample Code\
\
More\
\
Request Header\
\
Authorization\
\
\*\
\
Change to user\_access\_token\
\
Bearer\
\
tenant\_access\_token\
\
Get Token\
\
Path Parameters\
\
app\_token\
\
\*\
\
Example value:"NQRxbRkBMa6OnZsjtERcxhNWnNh"\
\
table\_id\
\
\*\
\
Example value:"tbl0xe5g8PP3U3cS"\
\
Query Parameters\
\
user\_id\_type\
\
page\_token\
\
page\_size\
\
Request Body\
\
Required parameters only\
\
Restore example values\
\
Format JSON\
\
JSON\
\
More\
\
1\
\
Results\
\
![](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/31dafaca1b39955beda5239fff26f1eb.svg)\
\
Click "RUN" to view results\
\
Sample code below has been updated with parameters entered in the API Explorer.\
\
cURL\
\
Go SDK\
\
Python SDK\
\
Java SDK\
\
Node SDK\
\
More\
\
1\
\
RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&apiName=search&project=bitable&resource=app.table.record&version=v1)\
\
The contents of this article\
\
[Request](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#request "Request")\
\
[Request header](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#requestHeader "Request header")\
\
[Path parameters](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#pathParams "Path parameters")\
\
[Query parameters](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#queryParams "Query parameters")\
\
[Request body](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#requestBody "Request body")\
\
[Request example](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#requestExample "Request example")\
\
[Response](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#response "Response")\
\
[Response body](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#responseBody "Response body")\
\
[Response body example](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#responseBodyExample "Response body example")\
\
[Error code](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search#errorCode "Error code")\
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