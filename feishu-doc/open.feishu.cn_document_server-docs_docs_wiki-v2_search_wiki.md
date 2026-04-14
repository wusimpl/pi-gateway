---
url: "https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki"
title: "Search Wiki - Server API - Documentation - Feishu Open Platform"
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

[Wiki overview](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview)

[Wiki API FAQs](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa)

Wiki space

Space member

Space settings

node

Docs

[Search Wiki](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki)

Document

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Docs](https://open.feishu.cn/document/server-docs/docs/docs-overview) [Wiki](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview)

Search Wiki

# Search Wiki

Copy Page

Last updated on 2025-12-22

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#7dbabeae "Request")

[Request body](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#422ed976 "Request body")

[Request body example](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#0797b7de "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#30f4b514 "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#4b37c186 "Error code")

# Search Wiki

Users query Wikis by keywords, and can only find wikis that they can see

**Tips：** If the wiki exists but the user cannot search, it does not necessarily mean that there is a problem with the search. It may be that the user does not have the permission to view the wiki

## Request

| Basic |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/wiki/v1/nodes/search |
| HTTP Method | POST |
| HTTP Content-Type | application/json; charset=utf-8 |
| Credentials Requirements | user\_access\_token |
| Permission requirements | View all Wiki |

### Request body

| Name | Type | Description |
| --- | --- | --- |
| query | string | Search keyword \[\*required\] |
| space\_id | string | The space\_id to which the document belongs, empty search all \[optional\] |
| node\_id | string | Search for this node and all its child nodes if it is not empty, search all wikis if it is empty. Use node\_id filtering must set space\_id \[optional\] |
| page\_token | string | Pagination token on the next page, do not need to fill in the home page, get the next page data according to the returned token \[optional\] |
| page\_size | int | The maximum value of the number returned on this page 0 <page\_size <= 50 Default 20 \[optional\] |

### Request body example

```

{
    "query": "search keyword",
    "space_id": "xxxxxxx",
    "node_id": "xxxx",
    "page_token": "xxxxx",
    "page_size": 20
}
```

## Response

### Response body

| Name | Type | Description |
| --- | --- | --- |
| code | int | Error code, non-zero indicates failure. |
| msg | string | Error description. |
| data | - | - |
| ∟items | list | Array of wiki information. |
| ∟node\_id | string | Token of the wiki node. |
| ∟space\_id | string | ID of the knowledge space the wiki belongs to. |
| ∟obj\_type | int | Type of the wiki, refer to the document type table. |
| ∟obj\_token | string | Token of the actual document for the node. To retrieve or edit the node content, this token must be used to call the corresponding API. |
| ∟parent\_id | string | Not yet effective, always returns an empty value. |
| ∟sort\_id | int | Index of the document in the knowledge base, starting from 1. |
| ∟title | string | Title of the wiki. |
| ∟url | string | URL for accessing the wiki. |
| ∟icon | string | URL of the icon corresponding to the wiki. |
| ∟page\_token | string | Returns the token for the next page if has\_more is true. |
| ∟has\_more | bool | Indicates whether there are more pages of data. |

#### obj\_type table

| obj\_type | Description |
| --- | --- |
| 1 | Doc |
| 2 | Sheet |
| 3 | Bitable |
| 4 | Mindnote |
| 5 | File |
| 6 | Slide |
| 7 | Wiki |
| 8 | Docx |
| 9 | Folder |
| 10 | Catalog |

### Response body example

```

{
  "code": 0,
  "data": {
    "has_more": false,
    "items": [\
      {\
        "node_id": "BAgPwq6lIi5Nykk0E5fcJeabcef",\
        "obj_token": "AcnMdexrlokOShxe40Fc0Oabcef",\
        "obj_type": 8,\
        "parent_id": "",\
        "sort_id": 1,\
        "space_id": "7307457194084925443",\
        "title": "Welcome to Wiki",\
        "url": "https://sample.feishu.cn/wiki/BAgPwq6lIi5Nykk0E5fcJeabcef"\
      }\
    ]
  },
  "msg": "success"
}
```

## Error code

| HTTP Status Code | Error Code | Description | Troubleshooting Suggestions |
| --- | --- | --- | --- |
| 200 | 10001 | invalid param | Parameter error, refer to the document to check the input parameter |
| 200 | 10002 | network anomaly, please try again | The back-end service is abnormal or the network is abnormal, you can request again |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fwiki-v2%2Fsearch_wiki%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to add an app as a Wiki Space administrator (member)?](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=en-US#515250c8)

[How to add permissions for apps](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[How to get the token（id） of docs resources?](https://open.feishu.cn/document/server-docs/docs/faq?lang=en-US#e4a9bfa1)

[How to share the document created by the application (tenant\_access\_token) with personal access?](https://open.feishu.cn/document/server-docs/docs/permission/faq?lang=en-US#507872a1)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

Got other questions? Try asking AI Assistant

[Previous:Retrieve the result of Wiki task](https://open.feishu.cn/document/server-docs/docs/wiki-v2/task/get) [Next:Document overview](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/docx-overview)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Request](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#7dbabeae "Request")

[Request body](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#422ed976 "Request body")

[Request body example](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#0797b7de "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#30f4b514 "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki#4b37c186 "Error code")

Try It

Feedback

OnCall

Collapse

Expand