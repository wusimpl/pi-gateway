---
url: "https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview"
title: "Wiki overview - Server API - Documentation - Feishu Open Platform"
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

Wiki overview

# Wiki overview

Copy Page

Last updated on 2025-08-19

The contents of this article

[Resource: Workspace](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#69fcab7c "Resource: Workspace")

[Field description](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#20053189 "Field description")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28 "Method list")

[Resource: Member](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#18df1705 "Resource: Member")

[Field description](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#20053189-1 "Field description")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28-1 "Method list")

[Resource: Setting](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#6a8506b3 "Resource: Setting")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28-2 "Method list")

[Resource: Node](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#72307cb9 "Resource: Node")

[Field description](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#20053189-2 "Field description")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28-3 "Method list")

[Resource: Task](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#1c7e88b2 "Resource: Task")

[Field description](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#20053189-3 "Field description")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28-4 "Method list")

[Note on permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#4ba43329 "Note on permission")

[Node View Permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#4d948d67 "Node View Permission")

[Container Edit Permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#19b4c355 "Container Edit Permission")

[Single-page Edit Permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#3e4ea21c "Single-page Edit Permission")

[Wiki Member default permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#408157fd "Wiki Member default permission")

[How App/Bot can acquire permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#-96726c7 "How App/Bot can acquire permission")

# Wiki Overview

Lark Wiki is an organization-oriented knowledge management system. Through structured precipitation of high-value information, a complete knowledge system is formed. In addition, a clear content classification and a hierarchical page tree can easily improve the efficiency of knowledge transfer and dissemination, and better achieve organizations and individuals.

| Resources | Resource definition |
| --- | --- |
| **Workspace** | A container for managing files and other folders. |
| **node** | Nodes in the workspce support multiple file types such as documents and tables. |

You can automatically manage your workspace through the Wiki API.

Before calling Wiki API, please make sure your app has required permission.

- `wiki:wiki`: Can view or edit Wiki
- `wiki:wiki.readonly`: Can read Wiki content only

See more details: [应用权限](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)

## Resource: Workspace

Workspace is the basic unit of workspace. It is a different type of knowledge system built by enterprises according to their needs. It is composed of multiple document pages with hierarchies and affiliations. Each workspace has a unique space\_id.

**The space\_id of a workspace can be obtained by any of the following methods:**

- Call [get workspace list](https://bytedance.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/list), get from the return value;

- If you are a workspace administrator, you can go to the workspace settings page and copy the number part of the address bar (see the figure below):


![](<Base64-Image-Removed>)

## Field description

| Name | Type | Description |
| --- | --- | --- |
| space\_id | string | The unique identifier of a workspace. <br>**Sample value**: "7034502641455497244"<br>**Field permission requirements (choose one)**:<br>View, edit and manage wiki<br>View wiki |
| name | string | The name of a workspace. |
| description | string | The description of a workspace. |
| space\_type | string | Represents the Wiki space type<br>**Optional values are**:<br>- `team`：Team space<br>- `person`：Personal space (old version, offline)<br>- `my_library`：My document library |

### Method list

> "Store" represents [store apps](https://open.feishu.cn/document/home/app-types-introduction/overview); "Custom" represents [Custom apps](https://open.feishu.cn/document/home/app-types-introduction/overview)

|  | **[Method (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | Permission requirements (satisfy any one) |  | **[Access Credentials](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) (choose one)** | Store | Custom |
| --- | --- | --- | --- | --- | --- | --- |
| [Create Knowledge Space](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/create)<br>`POST` /open-apis/wiki/v2/spaces | View, edit and manage wiki | user\_access\_token | **✓** | **✓** |
| [Get Knowledge Space List](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/list)<br>`GET` /open-apis/wiki/v2/spaces | View, edit and manage wiki<br>View wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [Get Knowledge Space Information](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get)<br>`GET` open-apis/wiki/v2/spaces/:space\_id | View, edit and manage wiki<br>View wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |

## Resource: Member

## Field description

| Name | Type | Description |
| --- | --- | --- |
| task\_id | string | The identifier of a space member, which can be represented by multiple types, e.g., open\_id, email. <br>**Sample value**: "ou\_51427140ab9f450411135757bcbf932f"<br>**Field permission requirements (choose one)**:<br>View, edit and manage wiki<br>View wiki |

### Method list

> "Store" represents [store apps](https://open.feishu.cn/document/home/app-types-introduction/overview); "Custom" represents [Custom apps](https://open.feishu.cn/document/home/app-types-introduction/overview)

|  | **[Method (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | Permission requirements (satisfy any one) |  | **[Access Credentials](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) (choose one)** | Store | Custom |
| --- | --- | --- | --- | --- | --- | --- |
| [Delete Space Member](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-member/delete)<br>`DELETE` /open-apis/wiki/v2/spaces/:space\_id/members/:member\_id | View, edit and manage wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [Add Space Member](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-member/create)<br>`POST` /open-apis/wiki/v2/spaces/:space\_id/members | View, edit and manage wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |

## Resource: Setting

### Method list

> "Store" represents [store apps](https://open.feishu.cn/document/home/app-types-introduction/overview); "Custom" represents [Custom apps](https://open.feishu.cn/document/home/app-types-introduction/overview)

|  | **[Method (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | Permission requirements (satisfy any one) |  | **[Access Credentials](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) (choose one)** | Store | Custom |
| --- | --- | --- | --- | --- | --- | --- |
| [Update Space Setting](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-setting/update)<br>`PUT` /open-apis/wiki/v2/spaces/:space\_id/setting | View, edit and manage wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |

## Resource: Node

File is a collective term for various types of files, which generally refers to all files in the cloud space. Each file has a unique token as identification.

## Field description

| Name | Type | Description |
| --- | --- | --- |
| node\_token | string | The unique identifier of a node. <br>**Sample value**: "wikcnpJLIzbAptN4cMQrQoewaLc"<br>**Field permission requirements (choose one)**:<br>View, edit and manage wiki |
| obj\_token | string | The token of the real document of the node. If you want to get or edit the content of the node, you need to use this token to call the corresponding interface. |
| obj\_type | string | The node type may be one of doc, sheet, bitable, file, and folder. |

### Method list

> "Store" represents [store apps](https://open.feishu.cn/document/home/app-types-introduction/overview); "Custom" represents [Custom apps](https://open.feishu.cn/document/home/app-types-introduction/overview)

|  | **[Method (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | Permission requirements (satisfy any one) |  | **[Access Credentials](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) (choose one)** | Store | Custom |
| --- | --- | --- | --- | --- | --- | --- |
| [Create Node](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/create)<br>`POST` /open-apis/wiki/v2/spaces/:space\_id/nodes | View, edit and manage wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [Get a list of child nodes](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/list)<br>`GET` /open-apis/wiki/v2/spaces/:space\_id/nodes | View, edit and manage wiki<br>View wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [Get node information](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)<br>`GET` /open-apis/wiki/v2/spaces/get\_node | View, edit and manage wiki<br>View wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [Add existing cloud document to workspace](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/move_docs_to_wiki)<br>`POST` /open-apis/wiki/v2/spaces/:space\_id/nodes/move\_docs\_to\_wiki | View, edit and manage wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [Move node within Wiki](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/move)<br>`POST` /open-apis/wiki/v2/spaces/:space\_id/nodes/:node\_token/move | View, edit and manage wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |

## Resource: Task

## Field description

| Name | Type | Description |
| --- | --- | --- |
| task\_id | string | The unique identifier of a task. <br>**Sample value**: "7078885194417045524-8316a3d38e2ef0e7c69149d3db4590ec031d9cbc"<br>**Field permission requirements (choose one)**:<br>View, edit and manage wiki<br>View wiki |

### Method list

> "Store" represents [store apps](https://open.feishu.cn/document/home/app-types-introduction/overview); "Custom" represents [Custom apps](https://open.feishu.cn/document/home/app-types-introduction/overview)

|  | **[Method (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | Permission requirements (satisfy any one) |  | **[Access Credentials](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) (choose one)** | Store | Custom |
| --- | --- | --- | --- | --- | --- | --- |
| [Acquire Task Result](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/task/get)<br>`GET` /open-apis/wiki/v2/tasks/:task\_id | View, edit and manage wiki<br>View wiki | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |

## Note on permission

Wiki has a flexible permission system. Common permission actions are described below. For API permission requirements, please visit API's document, section **Wiki Permission Requirement**.

### Node View Permission

Allow to view the node/document.

Automatically acquired with Edit Permission.

### Container Edit Permission

Allow to edit the document. Allow to create/delete child nodes.

Wiki space admins have all nodes' container edit permission, and can't be removed.

### Single-page Edit Permission

Allow to edit the document. But not allow to create/delete child nodes.

### Wiki Member default permission

Wiki Members' default permission is Node View Permission. Can be modified in Wiki Setting Page.

### How App/Bot can acquire permission

There are two ways：Added as Wiki member(admin) OR added as document collaborator。

1. [Added as Wiki member(admin)](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/wiki-qa#b5da330b)。
2. [Added as document collaborator](https://open.feishu.cn/document/ukTMukTMukTM/uIzNzUjLyczM14iM3MTN/faq#40c028dd)。

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fwiki-v2%2Fwiki-overview%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to add an app as a Wiki Space administrator (member)?](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=en-US#515250c8)

[How to add permissions for apps](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[How to get the token（id） of docs resources?](https://open.feishu.cn/document/server-docs/docs/faq?lang=en-US#e4a9bfa1)

[How to share the document created by the application (tenant\_access\_token) with personal access?](https://open.feishu.cn/document/server-docs/docs/permission/faq?lang=en-US#507872a1)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

Got other questions? Try asking AI Assistant

[Previous:Comment event](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/notice/events/comment_add) [Next:Wiki API FAQs](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Resource: Workspace](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#69fcab7c "Resource: Workspace")

[Field description](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#20053189 "Field description")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28 "Method list")

[Resource: Member](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#18df1705 "Resource: Member")

[Field description](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#20053189-1 "Field description")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28-1 "Method list")

[Resource: Setting](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#6a8506b3 "Resource: Setting")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28-2 "Method list")

[Resource: Node](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#72307cb9 "Resource: Node")

[Field description](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#20053189-2 "Field description")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28-3 "Method list")

[Resource: Task](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#1c7e88b2 "Resource: Task")

[Field description](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#20053189-3 "Field description")

[Method list](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#c60e4a28-4 "Method list")

[Note on permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#4ba43329 "Note on permission")

[Node View Permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#4d948d67 "Node View Permission")

[Container Edit Permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#19b4c355 "Container Edit Permission")

[Single-page Edit Permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#3e4ea21c "Single-page Edit Permission")

[Wiki Member default permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#408157fd "Wiki Member default permission")

[How App/Bot can acquire permission](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview#-96726c7 "How App/Bot can acquire permission")

Try It

Feedback

OnCall

Collapse

Expand