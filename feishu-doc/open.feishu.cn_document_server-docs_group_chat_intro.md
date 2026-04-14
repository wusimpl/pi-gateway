---
url: "https://open.feishu.cn/document/server-docs/group/chat/intro"
title: "Resource introduction - Server API - Documentation - Feishu Open Platform"
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

[Group overview](https://open.feishu.cn/document/server-docs/group/overview)

[Group FAQ](https://open.feishu.cn/document/group/faq)

Group management

[Resource introduction](https://open.feishu.cn/document/server-docs/group/chat/intro)

[Chat ID description](https://open.feishu.cn/document/server-docs/group/chat/chat-id-description)

[Create a group](https://open.feishu.cn/document/server-docs/group/chat/create)

[Delete a group](https://open.feishu.cn/document/server-docs/group/chat/delete)

[Update group information](https://open.feishu.cn/document/server-docs/group/chat/update-2)

[Updates group speech scopes](https://open.feishu.cn/document/server-docs/group/chat/update)

[Obtain group information](https://open.feishu.cn/document/server-docs/group/chat/get-2)

[Update group pinning](https://open.feishu.cn/document/server-docs/group/chat/put_top_notice)

[Revoke group pinning](https://open.feishu.cn/document/server-docs/group/chat/delete_top_notice)

[Obtain groups where the user or bot is a member](https://open.feishu.cn/document/server-docs/group/chat/list)

[Search for groups visible to a user or bot](https://open.feishu.cn/document/server-docs/group/chat/search)

[Obtains the group member speech scopes](https://open.feishu.cn/document/server-docs/group/chat/get)

[Get group share link](https://open.feishu.cn/document/server-docs/group/chat/link)

Events

Group member

Upgraded Group announcement

Group announcement

Chat tab

Chat menu

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Group Chat](https://open.feishu.cn/document/server-docs/group/overview) [Group management](https://open.feishu.cn/document/server-docs/group/chat/intro)

Resource introduction

# Resource introduction

Copy Page

Last updated on 2024-10-29

The contents of this article

[Basic concepts](https://open.feishu.cn/document/server-docs/group/chat/intro#255b5fca "Basic concepts")

[Field description](https://open.feishu.cn/document/server-docs/group/chat/intro#20053189 "Field description")

[Data example](https://open.feishu.cn/document/server-docs/group/chat/intro#73b153c7 "Data example")

# Group management overview

The Group OpenAPI provides group management capabilities, including creating groups, disbanding groups, updating group information, obtaining group information, managing group pinning, and obtaining group sharing links.

## Basic concepts

| Concept | Description |
| --- | --- |
| Group mode | - group: ordinary conversation group. Calling [create group](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create) can only create groups of this mode. The message modes in this type of group are divided into two categories: conversation messages (chat) and topic messages (thread).<br>  <br>  ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/d9ee10acc8ebb096ccf3547a9dd27212_lrtf0Ca7wV.png?height=1616&lazyload=true&maxWidth=350&width=1820)<br>  <br>- topic: topic group. It cannot be created through OpenAPI and can only be created manually in the Feishu client. For details, see [Using topic groups](https://www.feishu.cn/hc/zh-CN/articles/360049067735).<br>  <br>  ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b9b8d25a35f28d16bf0bedbc63cc457c_cpfelDU9io.png?height=1572&lazyload=true&maxWidth=350&width=1794)<br>  <br>- p2p: single chat. It cannot be created through OpenAPI. When [sending a message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create), if the message recipient is a user (user\_id/open\_id/union\_id), the chat\_id will be returned. When using this chat\_id to [get group information](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/get), the returned group mode parameter (chat\_mode) value is single chat (p2p). |
| Group type | - Private group: Only members invited to the group can view the group. You cannot search and join the group directly within the company. It is suitable for internal communication within the team.<br>- Public group: Members within the company can directly search and join the group. It is suitable for open communication scenarios such as business promotion and event invitation within the company. |
| Group permissions | When creating or updating a group, you can set group permissions, including visibility of notification messages for members to join or leave the group, whether approval is required for users to join the group, who can invite members to join the group, who can share the group, who can @ everyone, who can send expedited messages, who can edit group information, whether to hide the number of group members, etc. |

## Field description

The following fields are not available for all types of groups, and some groups may be missing some fields. For details, refer to the specific API documentation.

| Parameter | Type | Description |
| --- | --- | --- |
| chat\_id | string | The group ID is the unique identifier of the group chat. The system will automatically generate the ID when creating a group chat. The format starts with `oc_`. How to obtain the ID:<br>- [Create a group](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create), and get the chat\_id of the group from the returned result.<br>- Call the [Get the list of groups that the user or robot is in](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/list) interface to query the chat\_id of the group that the user or robot is in.<br>- Call [Search the list of groups visible to users or robots](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/search) to search for the chat\_id of the group that the user or robot is in, or the group that is open to the user or robot.<br>- When calling the [send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) interface to send a message to a single chat (i.e. send a message to a certain user), the interface will return the chat\_id. Use the chat\_id to [get group information](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/get). The group mode is single chat (i.e. the return value of `chat_mode` is `p2p`). |
| avatar | string | URL of group profile photo |
| name | string | Group name |
| description | string | Group description |
| i18n\_names | i18n\_names | Internationalized group name |
| ∟zh\_cn | string | Chinese name |
| ∟en\_us | string | English name |
| ∟ja\_jp | string | Japanese name |
| owner\_id | string | The user ID of the group owner. The ID type corresponds to the value of owner\_id\_type. For descriptions of different IDs, see [User-related ID concepts](https://open.feishu.cn/document/home/user-identity-introduction/introduction).<br>**Note**: This field is not returned if the group owner is a robot. |
| owner\_id\_type | string | The user ID type of the group owner. User ID types are divided into `open_id`, `user_id`, and `union_id`. For descriptions of different IDs, see [User-related ID concepts](https://open.feishu.cn/document/home/user-identity-introduction/introduction).<br>**Note**: This field is not returned if the group owner is a robot. |
| add\_member\_permission | string | Who can invite users or robots to join the group<br>**Optional values**:<br>- `all_members`: All members. When this value is used, the group sharing permission (share\_card\_permission) value must be `allowed`.<br>- `only_owner`: Only group owners and administrators. When this value is used, the group sharing permission (share\_card\_permission) value must be `not_allowed`. |
| share\_card\_permission | string | Who can share the group<br>**Optional values**:<br>- `allowed`: All members. When this value is used, the permission to invite users or robots to join the group (add\_member\_permission) must be `all_members`.<br>- `not_allowed`: Only group owners and administrators. When this value is used, the permission to invite users or robots to join the group (add\_member\_permission) must be `only_owner`. |
| at\_all\_permission | string | Who can at everyone<br>**Optional values**:<br>- `only_owner`: only group owners and administrators<br>- `all_members`: all members |
| edit\_permission | string | Who can edit group information<br>**Optional values**:<br>- `only_owner`: only group owners and administrators<br>- `all_members`: all members |
| chat\_mode | string | Group mode<br>**Optional values**:<br>- `group`: group<br>- `topic`: topic group<br>- `p2p`: single chat<br>**Note**: When [creating a group](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create), this parameter as a request parameter only supports the value `group`. |
| group\_message\_type | string | Group message format<br>**Optional values**:<br>- `chat`: conversation message<br>- `thread`: topic message |
| chat\_mode | string | Group mode<br>**Optional values are**:<br>- `group`: A group<br>- `topic`: A topic group<br>- `p2p`: A private chat |
| chat\_type | string | Group type<br>**Optional values are**:<br>- `private`: A private group<br>- `public`: A public group |
| chat\_tag | string | Group tag. If there are multiple group tags, return the first one in the following order.<br>**Optional values are**:<br>- `inner`: An inner group<br>- `tenant`: A company group<br>- `department`: A department group<br>- `edu`: An education group<br>- `meeting`: A meeting group<br>- `customer_service`: A customer service group |
| external | boolean | Whether it is an external group |
| tenant\_key | string | A tenant's unique ID in Feishu. It can be used to obtain tenant\_access\_token, and can also be used as a tenant's unique ID in an app. |
| join\_message\_visibility | string | Visibility of member joining group notification message<br>**Optional values are**:<br>- `only_owner`: Visible to only the group owner and administrators<br>- `all_members`: Visible to all members<br>- `not_anyone`: Invisible to anyone |
| leave\_message\_visibility | string | Visibility of member leaving group notification message<br>**Optional values are**:<br>- `only_owner`: Visible to only the group owner and administrators<br>- `all_members`: Visible to all members<br>- `not_anyone`: Invisible to anyone |
| membership\_approval | string | Group joining approval<br>**Optional values are**:<br>- `no_approval_required`: Approval is not required.<br>- `approval_required`: Approval is required. |
| moderation\_permission | string | Speech scopes<br>**Optional values are**:<br>- `only_owner`: Only the group owner and admins<br>- `all_members`: All members<br>- `moderator_list`: Specified group members |

## Data example

```

{
  "chat_id": "oc_a0553eda9014c201e6969b478895c230",
  "avatar": "https://p3-lark-file.byteimg.com/img/lark-avatar-staging/default-avatar_44ae0ca3-e140-494b-956f-78091e348435~100x100.jpg",
  "name": "test group name",
  "description": "test group description",
  "i18n_names": {
    "zh_cn": "group chat",
    "en_us": "group chat",
    "ja_jp": "グループチャット"
  },
  "owner_id": "4d7a3c6g",
  "owner_id_type": "user_id",
  "add_member_permission": "all members",
  "share_card_permission": "allowed",
  "at_all_permission": "all members",
  "edit_permission": "all members",
  "group_message_type": "chat",
  "chat_mode": "group",
  "chat_type": "private",
  "chat_tag": "inner",
  "external": false,
  "tenant_key": "736588c9260f175e",
  "join_message_visibility": "all_members",
  "leave_message_visibility": "all_members",
  "membership_approval": "no_approval_required",
  "moderation_permission": "all_members"
}
```

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fgroup%2Fchat%2Fintro%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to add internal employees and external clients to group chat with one click](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/add-internal-employees-and-external-clients-to-group)

[How to get the group ID?](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/group/faq?lang=en-US#-cff0208)

[How to obtain a single chat ID?](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/group/faq?lang=en-US#91c8ec45)

[What is the difference between a topic group and a topic format group?](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/group/faq?lang=en-US#6bdf2fbe)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

Got other questions? Try asking AI Assistant

[Previous:Group FAQ](https://open.feishu.cn/document/group/faq) [Next:Chat ID description](https://open.feishu.cn/document/server-docs/group/chat/chat-id-description)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Basic concepts](https://open.feishu.cn/document/server-docs/group/chat/intro#255b5fca "Basic concepts")

[Field description](https://open.feishu.cn/document/server-docs/group/chat/intro#20053189 "Field description")

[Data example](https://open.feishu.cn/document/server-docs/group/chat/intro#73b153c7 "Data example")

Try It

Feedback

OnCall

Collapse

Expand