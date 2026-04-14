---
url: "https://open.feishu.cn/document/server-docs/task-v1/task/list"
title: "Get task list - Server API - Documentation - Feishu Open Platform"
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

[Function introduction](https://open.feishu.cn/document/server-docs/task-v1/task/overview)

[Create a task](https://open.feishu.cn/document/server-docs/task-v1/task/create)

[Delete a task](https://open.feishu.cn/document/server-docs/task-v1/task/delete)

[Update a task](https://open.feishu.cn/document/server-docs/task-v1/task/patch)

[Complete a task](https://open.feishu.cn/document/server-docs/task-v1/task/complete)

[Cancel completing a task](https://open.feishu.cn/document/server-docs/task-v1/task/uncomplete)

[Obtain task details](https://open.feishu.cn/document/server-docs/task-v1/task/get)

[Get task list](https://open.feishu.cn/document/server-docs/task-v1/task/list)

Events

Remind

Comment

Follower

Collaborator

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Deprecated Version (Not Recommended)](https://open.feishu.cn/document/server-docs/task-v1/overview) [Tasks](https://open.feishu.cn/document/server-docs/task-v1/overview) [Task management](https://open.feishu.cn/document/server-docs/task-v1/task/overview)

Get task list

# Get task list

Copy Page

Last updated on 2024-04-15

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/task-v1/task/list#request "Request")

[Request header](https://open.feishu.cn/document/server-docs/task-v1/task/list#requestHeader "Request header")

[Query parameters](https://open.feishu.cn/document/server-docs/task-v1/task/list#queryParams "Query parameters")

[Request example](https://open.feishu.cn/document/server-docs/task-v1/task/list#requestExample "Request example")

[Response](https://open.feishu.cn/document/server-docs/task-v1/task/list#response "Response")

[Response body](https://open.feishu.cn/document/server-docs/task-v1/task/list#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/task-v1/task/list#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/task-v1/task/list#errorCode "Error code")

# Get task list

The interface obtains all tasks related to the user by parsing the user\_access\_token in the header. And supports filtering tasks by task creation time and task completion status.

Try It

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/task/v1/tasks |
| HTTP Method | GET |
| Rate Limit | [1000 per minute & 50 per second](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| Supported app types | Custom apps<br>Store apps |
| Required scopes | View Task details |
| Required field scopes | The response body of the API contains the following sensitive fields, and they will be returned only after corresponding scopes are added. If you do not need the fields, it is not recommended that you request the scopes.<br>Obtain user ID<br>Only custom apps |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | When calling an API, the app needs to authenticate its identity through an access token. The data obtained with different types of access tokens may vary. Refer to [Choose and obtain access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM).<br>**Value format**: "Bearer `access_token`"<br>**Supported options are**:<br>tenant\_access\_token<br>Call the API on behalf of the app. The range of readable and writable data is determined by the app's own [data access range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions). Refer to [Get custom app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) or [Get store app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token). Example value: "Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>Call the API on behalf of the logged-in user. The range of readable and writable data is determined by the user's data access range. Refer to [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token). Example value: "Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Query parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| page\_size | int | No | **Example value**: 10<br>**Data validation rules**:<br>- Maximum value: `100` |
| page\_token | string | No | Page identifier. It is not filled in the first request, indicating traversal from the beginning; when there will be more groups, the new page\_token will be returned at the same time, and the next traversal can use the page\_token to get more groups<br>**Example value**: "MTYzMTg3ODUxNQ ==" |
| start\_create\_time | string | No | The start time of the query. If left blank, the default start time is the creation time of the first task.<br>**Example value**: "1652323331" |
| end\_create\_time | string | No | The end time of the query. If left blank, the default end time is the creation time of the last task.<br>**Example value**: "1652323335" |
| task\_completed | boolean | No | Used to filter task completion status when querying. True indicates that only completed tasks are returned, and false indicates that only uncompleted tasks are returned. When left blank, it means tasks of both status shall be returned<br>**Example value**: false |
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

curl-i-XGET'https://open.feishu.cn/open-apis/task/v1/tasks?end\_create\_time=1652323335&page\_size=10&page\_token=MTYzMTg3ODUxNQ+%3D%3D&start\_create\_time=1652323331&task\_completed=false&user\_id\_type=open\_id' \

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

"data": {

"has\_more": true,

"items": \[\
\
            {\
\
"can\_edit": true,\
\
"collaborators": \[\
\
                    {\
\
"id": "ou\_842f5b9b4b8faa60570e9008acc9af1f"\
\
                    }\
\
                \],\
\
"complete\_time": "1637119864",\
\
"create\_time": "1637045612",\
\
"creator\_id": "ou\_5df8b925054285f7166bf8b6ff03341f",\
\
"custom": "",\
\
"description": "Eat more fruits, exercise more, live a healthy life, and work happily.",\
\
"due": {\
\
"time": "1637137860",\
\
"timezone": "Asia/Shanghai"\
\
### Error code\
\
| HTTP status code | Error code | Description | Troubleshooting suggestions |\
| --- | --- | --- | --- |\
| 403 | 1470403 | The identity token is incorrect. It should be either user\_access\_token or tenant\_access\_token. | The identity token is incorrect. It should be either user\_access\_token or tenant\_access\_token. |\
| 500 | 1470605 | Failed to get task list | Generally caused by internal system errors, you can contact maintenance classmates for processing |\
| 400 | 1470421 | page\_size exceed 100 | The page size exceeds the maximum value of page\_size, needs to reduced value of page size |\
| 400 | 1470422 | failed to parse page\_token | Failed to parse the page token. you need to check whether the page token is legal |\
\
[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Ftask-v1%2Ftask%2Flist%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction\
\
Related questions\
\
[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)\
\
[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)\
\
[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)\
\
[How to obtain Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)\
\
[How to request the required scopes for the application](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)\
\
Got other questions? Try asking AI Assistant\
\
[Previous:Obtain task details](https://open.feishu.cn/document/server-docs/task-v1/task/get) [Next:Task information changes(Tenant dimension)](https://open.feishu.cn/document/server-docs/task-v1/task/events/update_tenant)\
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
Query Parameters\
\
page\_size\
\
page\_token\
\
start\_create\_time\
\
Example value:"0"\
\
end\_create\_time\
\
Example value:"0"\
\
task\_completed\
\
Example value:"true"\
\
user\_id\_type\
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
RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&apiName=list&project=task&resource=task&version=v1)\
\
The contents of this article\
\
[Request](https://open.feishu.cn/document/server-docs/task-v1/task/list#request "Request")\
\
[Request header](https://open.feishu.cn/document/server-docs/task-v1/task/list#requestHeader "Request header")\
\
[Query parameters](https://open.feishu.cn/document/server-docs/task-v1/task/list#queryParams "Query parameters")\
\
[Request example](https://open.feishu.cn/document/server-docs/task-v1/task/list#requestExample "Request example")\
\
[Response](https://open.feishu.cn/document/server-docs/task-v1/task/list#response "Response")\
\
[Response body](https://open.feishu.cn/document/server-docs/task-v1/task/list#responseBody "Response body")\
\
[Response body example](https://open.feishu.cn/document/server-docs/task-v1/task/list#responseBodyExample "Response body example")\
\
[Error code](https://open.feishu.cn/document/server-docs/task-v1/task/list#errorCode "Error code")\
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