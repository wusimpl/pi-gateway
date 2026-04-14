---
url: "https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app"
title: "Update the Availability of an App - Server API - Documentation - Feishu Open Platform"
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

authen

Lingo

App Information

Admin

[Obtain the Apps Installed by an Organization](https://open.feishu.cn/document/server-docs/application-v6/admin/obtain-the-apps-installed-by-an-organization)

[Update the Availability of an App](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app)

Approval

Contact

Docs

Hire

Feishu People

Rooms

[Convert ID](https://open.feishu.cn/document/historic-version/id_convert)

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Deprecated Version (Not Recommended)](https://open.feishu.cn/document/server-docs/task-v1/overview) [App Information](https://open.feishu.cn/document/server-docs/application-v6/admin/obtain-the-apps-installed-by-an-organization) [Admin](https://open.feishu.cn/document/server-docs/application-v6/admin/obtain-the-apps-installed-by-an-organization)

Update the Availability of an App

# Update the Availability of an App

Copy Page

Last updated on 2023-04-27

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#7dbabeae "Request")

[Request header](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#20964697 "Request header")

[Request body](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#422ed976 "Request body")

[Request body example](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#0797b7de "Response body")

[Response example](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#135923cc "Response example")

[Error code](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#4b37c186 "Error code")

# Update app availability

Update the visibility of the current Custom App or installed Store App in the enterprise, including available and disabled people. The update takes effect immediately online.

When adding a user or department through the api, it is necessary to judge in advance whether the corresponding user or department is already in the black list. If it is already in the black list, even if the user or department is added to the white list, the user or department cannot see the application, that is to say the disabled list has priority over the available list.

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/application/v3/app/update\_visibility |
| HTTP Method | POST |
| Supported app types | Only custom apps |
| Required scopes | Manage app visibility<br>Only custom apps |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | tenant\_access\_token<br>**Value format**: "Bearer `access_token`"<br>**Example value**: "Bearer t-7f1bcd13fc57d46bac21793a18e560"<br>[Learn more about how to obtain and use access\_token](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Request body

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| app\_id | string | Yes | App ID |
| del\_users | - | No | List of users to be deleted. The number of deleted users cannot exceed 500 and only users within the app availability can be deleted. **The deletion of users must be performed after the addition of users**. |
| ∟open\_id | string | No | Either open\_id or user\_id is required. The user\_id takes priority over open\_id if both are specified. |
| ∟user\_id | string | No |  |
| add\_users | - | No | List of users to be added. The number of added users cannot exceed 500. **The deletion of users must be performed after the addition of users**. |
| ∟open\_id | string | No | Either open\_id or user\_id is required. The user\_id takes priority over open\_id if both are specified. |
| ∟user\_id | string | No |  |
| is\_visiable\_to\_all | int | No | Whether the app is visible to all. 0: No; 1: Yes; not specified: Maintain current status |
| add\_departments | string\[\] | No | List of departments to be added. The number of added departments cannot exceed 500. **The deletion of departments must be performed after the addition of departments**. |
| del\_departments | string\[\] | No | List of departments to be deleted. The number of deleted departments cannot exceed 500. **The deletion of departments must be performed after the addition of departments**. |

### Request body example

```

{
    "app_id" : "cli_9db45f86b7799104",
    "add_users": [\
        {\
            "open_id": "ou_d317f090b7258ad0372aa53963cda70d",\
            "user_id":"79affdge"\
         }\
    ],
    "del_users": [\
    ],
    "is_visiable_to_all" : 0,
    "add_departments": [\
        "od-4b4a6907ad726ea07b27b0d2882b7c65",\
        "od-2a0c3396b2cbd9a0befb104eccd1209f"\
    ],
    "del_departments": [\
    ]
}
```

## Response

### Response body

| Parameter | Description |
| --- | --- |
| code | Return code. A value other than 0 indicates failure. |
| msg | Return code description |
| data | Returned business information |

### Response example

```

{
    "code": 0,
    "msg": "success",
    "data": {}
}
```

### Error code

| HTTP status code | Error code | Description | Troubleshooting suggestions |
| --- | --- | --- | --- |
| 200 | 50003 | invalid app\_id | Check whether the app\_id is correct and whether the app is installed for the company. |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fapplication-v6%2Fadmin%2Fupdate-the-availability-of-an-app%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

[How to obtain Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[How to request the required scopes for the application](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

Got other questions? Try asking AI Assistant

[Previous:Obtain the Apps Installed by an Organization](https://open.feishu.cn/document/server-docs/application-v6/admin/obtain-the-apps-installed-by-an-organization) [Next:Subscribe to an Approvals Event](https://open.feishu.cn/document/server-docs/historic-version/approval/v2/feishu-native-approval/subscribe-to-an-approvals-event-)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#7dbabeae "Request")

[Request header](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#20964697 "Request header")

[Request body](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#422ed976 "Request body")

[Request body example](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#0797b7de "Response body")

[Response example](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#135923cc "Response example")

[Error code](https://open.feishu.cn/document/server-docs/application-v6/admin/update-the-availability-of-an-app#4b37c186 "Error code")

Try It

Feedback

OnCall

Collapse

Expand