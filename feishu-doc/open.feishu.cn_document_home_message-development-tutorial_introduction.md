---
url: "https://open.feishu.cn/document/home/message-development-tutorial/introduction"
title: "Introduction - Developer Tutorials - Documentation - Feishu Open Platform"
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

[Developer Tutorials Gallery](https://open.feishu.cn/document/course)

[Call a server API (Send message)](https://open.feishu.cn/document/introduction)

[Call a server API (Create Base app)](https://open.feishu.cn/document/introduction-2)

Develop an echo bot

Develop a card interactive bot

Embed a web app into Feishu Workplace

Develop H5 (Node.js)

Quickly Develop H5 (Python)

Quickly Integrate to Contacts

Quickly Integrate to Base

Auto Attendance Management

Manage Depts and Staff

Manage Staff and Attendance

Bot Auto Sends Group Alarm

[Introduction](https://open.feishu.cn/document/home/message-development-tutorial/introduction)

[Preparation](https://open.feishu.cn/document/home/message-development-tutorial/determine-the-api-and-event-to-call)

[Step 1: Create and configure an app](https://open.feishu.cn/document/home/message-development-tutorial/turn-on-app-permissions)

[Step 2: Download and configure sample code](https://open.feishu.cn/document/home/message-development-tutorial/robot-creates-group-chat)

[Step 3: Create a group chat and send alerts](https://open.feishu.cn/document/home/message-development-tutorial/the-robot-sends-an-alarm-notification)

[Step 4: Listen for message card callback](https://open.feishu.cn/document/home/message-development-tutorial/monitor-and-interact-with-messages-in-the-group)

[Step 5: Listen to group messages](https://open.feishu.cn/document/home/message-development-tutorial/modify-the-group-name-after-solving-the-problem)

[Step 6: Retrieve group chat history for review](https://open.feishu.cn/document/home/message-development-tutorial/obtain-chat-history-of-messages-for-review)

No-login for H5

QR Code Login

Replace Links after Doc Migration

Track Sales Statistics with Spreadsheets

Manage Agile Project with Base

Sync Corp. Org Structure with Feishu

Send Messages to Specified Dept. Members

Auto Send Welcome Messages

Quickly Develop Third-party Approval

Quickly Build Calendar Events

Auto-fetch Calendar Events

Deprecated Tutorials

[Developer Tutorials](https://open.feishu.cn/document/course) [Bot Auto Sends Group Alarm](https://open.feishu.cn/document/home/message-development-tutorial/introduction)

Introduction

# Introduction

Copy Page

Last updated on 2024-10-13

The contents of this article

[Operation flow](https://open.feishu.cn/document/home/message-development-tutorial/introduction#56d490f2 "Operation flow")

[Effect](https://open.feishu.cn/document/home/message-development-tutorial/introduction#6ebc2674 "Effect")

[List of APIs and events used](https://open.feishu.cn/document/home/message-development-tutorial/introduction#7f60b658 "List of APIs and events used")

[Group chat APIs](https://open.feishu.cn/document/home/message-development-tutorial/introduction#6d2fd12d "Group chat APIs")

[Messaging APIs](https://open.feishu.cn/document/home/message-development-tutorial/introduction#535c3734 "Messaging APIs")

[Messaging events](https://open.feishu.cn/document/home/message-development-tutorial/introduction#-23aaccc "Messaging events")

# Introduction

When a business experiences an online failure, responsible members must be notified quickly to resolve it.

Feishu bots can automate this process by:

- Creating a Feishu project group
- Adding responsible members
- Sending failure alerts

This enables:

- Real-time group communication and updates
- Post-incident retrospectives using group history
- Marking the issue resolved by renaming the group

This tutorial covers creating a Feishu bot to implement the above.

## Operation flow

![](<Base64-Image-Removed>)

## Effect

1. Bot automatically pulls groups.





![](<Base64-Image-Removed>)

2. Bot automatically pushes the alarm notification.





![](<Base64-Image-Removed>)

3. Bot automatically modifies the group name after the problem is solved.





![](<Base64-Image-Removed>)


## List of APIs and events used

In the scenario where the bot automatically pulls group alarm notifications, you need to call the API for messaging and group chat, including:

### Group chat APIs

|  | **[Method (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | Scope requirements (meet any one) |  | **[Access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** |
| --- | --- | --- | --- | --- |
| [Create group](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create)<br>`POST` /open-apis/im/v1/chats<br>> Create the group chat and set group icon, group name, and description. | Create group<br>Obtain and update group information | tenant\_access\_token |
| [Obtain group information](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/get)<br>`GET` /open-apis/im/v1/chats/:chat\_id<br>> Obtains basic information such as group name, description, profile photo, and owner ID. | View group information<br>Obtain group information<br>Obtain and update group information | tenant\_access\_token |
| [Update group information](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/update)<br>`PUT` /open-apis/im/v1/chats/:chat\_id<br>> Update the group icon, group name, group description, group configuration, and group owner transfer. | Update group information<br>Obtain and update group information | tenant\_access\_token |

### Messaging APIs

|  | **[Method (API)](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)** | Scope requirements (meet any one) |  | **[Access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM)** |
| --- | --- | --- | --- | --- |
| [Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)<br>`POST` /open-apis/im/v1/messages<br>> Send messages to specified users or sessions, support text, rich text, cards, group business cards, personal business cards, pictures, videos, audio, files, emoji. | Send messages as an app<br>Read and send messages in private and group chats<br>Send messages V2<br>Scope of older version | tenant\_access\_token |
| [Upload image](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create)<br>`POST` /open-apis/im/v1/images<br>> Upload image interface, you can upload images in JPEG, PNG, and WEBP formats. | Read and upload images or other files<br>Upload files V2<br>Scope of older version | tenant\_access\_token |
| [Get session history messages](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list)<br>`GET` /open-apis/im/v1/messages<br>> Obtain historical messages of conversations (including individual chats and groups). | Read messages in private and group chats<br>Read and send messages in private and group chats<br>Read chat history for private and group chats<br>Scope of older version<br>Only custom apps | tenant\_access\_token |

### Messaging events

|  | **[Event](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)** | Trigger | Scope requirements (meet any one) | Event type |
| --- | --- | --- | --- | --- |
| [Receive message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive) | This event is triggered when the bot receives a message sent by a user. | Obtain group messages mentioning the bot<br>Read all messages in associated group chat (sensitive scope)<br>Obtain private messages sent to the bot<br>Read private messages sent to the bot (legacy version)<br>Scope of older version<br>Read group chat messages mentioning the bot (legacy version)<br>Scope of older version<br>Obtain all messages in the associated group chats<br>Scope of older version<br>Only custom apps | im.message.receive\_v1 |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fhome%2Fmessage-development-tutorial%2Fintroduction%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:Step 7: Experience the effect](https://open.feishu.cn/document/quick-start-of-personnel-and-attendance-management-system/step-7-experience-the-effect) [Next:Preparation](https://open.feishu.cn/document/home/message-development-tutorial/determine-the-api-and-event-to-call)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Operation flow](https://open.feishu.cn/document/home/message-development-tutorial/introduction#56d490f2 "Operation flow")

[Effect](https://open.feishu.cn/document/home/message-development-tutorial/introduction#6ebc2674 "Effect")

[List of APIs and events used](https://open.feishu.cn/document/home/message-development-tutorial/introduction#7f60b658 "List of APIs and events used")

[Group chat APIs](https://open.feishu.cn/document/home/message-development-tutorial/introduction#6d2fd12d "Group chat APIs")

[Messaging APIs](https://open.feishu.cn/document/home/message-development-tutorial/introduction#535c3734 "Messaging APIs")

[Messaging events](https://open.feishu.cn/document/home/message-development-tutorial/introduction#-23aaccc "Messaging events")

Try It

Feedback

OnCall

Collapse

Expand