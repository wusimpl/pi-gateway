---
url: "https://open.feishu.cn/document/client-docs/bot-v3/bot-overview"
title: "Bot overview - Developer Guides - Documentation - Feishu Open Platform"
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

Platform Introduction

Develop Process

Develop Bots

[Bot overview](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview)

[Quick start](https://open.feishu.cn/document/develop-robots/quick-start)

[Custom bot usage guide](https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot)

[How to Use Bot in Feishu](https://open.feishu.cn/document/client-docs/bot-v3/how-to-use-bot-in-feishu)

[Bot customized menu](https://open.feishu.cn/document/client-docs/bot-v3/bot-customized-menu)

[Bot supports external groups and external users to chat](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group)

Develop Web Apps

Develop Gadgets (Not Recommended)

Develop Docs Add-ons

Develop Base Extensions

Develop Workplace Blocks

Development link preview

Feishu Cards

Web Components

Native integration

SSO&End User Consent

AppLink Protocol

Developer Tools

FAQ

Management Practice

Platform Notices

Deprecated Guides

[Developer Guides](https://open.feishu.cn/document/client-docs/intro) [Develop Bots](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview)

Bot overview

# Bot overview

Copy Page

Last updated on 2025-03-30

The contents of this article

[What is a Bot](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#0593def9 "What is a Bot")

[Application scenarios](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#6b907e7a "Application scenarios")

[Features](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#93b8c816 "Features")

[Types of bots](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#846740ff "Types of bots")

[Capability comparison](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#1e4f69a4 "Capability comparison")

[Basic concepts](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#255b5fca "Basic concepts")

[User guide](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#358d7c62 "User guide")

[Bot API and Events](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#28628448 "Bot API and Events")

[FAQs](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#2d7f6d58 "FAQs")

# Bot overview

A Bot is one of the capabilities of the Feishu Open Platform, enabling message interactions with users through Feishu conversations. This article introduces the functions, features, types, and development tutorials of bots to help you understand their capabilities.

## What is a Bot

A bot is an application that can interact with users based on conversations and is a common channel for delivering information to users. Feishu bots can integrate with Feishu Calendar, Approval, Docs, and other applications, as well as mainstream third-party business systems and custom enterprise systems. By sending messages to users, bots enable one-stop aggregation of various application notifications in Feishu, such as monitoring alerts, to-do reminders, company activity notifications, daily data reports, inventory warnings, etc. Additionally, bots can perform automated operations like creating and managing groups, assisting enterprise members in efficiently handling business demands.

FullscreenExit fullscreen

PlayPause00:0000:00

- 2x
- 1.5x
- 1x
- 0.75x
- 0.5x

1x

Pop-out

Replay

## Application scenarios

Bots in Feishu can integrate various application notifications in a one-stop manner, providing enterprises with flexible message notification methods, supporting automated group management, and listening to and responding to user messages.

| Scenario illustration | Scenario introduction |
| --- | --- |
| **Chat Scenario**<br>![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/40ebda93809beb9ac839d273069a6a3c_fRujAxVlTP.png?height=1856&lazyload=true&maxWidth=280&width=2560) | Bots used in conjunction with [Message Open Capabilities](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/introduction) can automate message pushing and interact with users.<br>- **Push Messages**<br>  <br>  Business information, event notifications, data displays, and other messages can be pushed by bots to designated conversations.<br>  <br>- **Receive and Reply to Messages**<br>  <br>  By integrating [Event Subscription](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive) capabilities, bots can receive conversation messages in real time and respond to user messages promptly.<br>  <br>- **Diverse Message Format Display**<br>  <br>  Using capabilities such as [Feishu Cards](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-overview) and [Link Previews](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/development-link-preview/link-preview-development-guide), bot messages can include various formats such as text, images, links, and buttons. |
| **Group Management Scenario**<br>![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/ade6c35069aaf40c462287f05a46d204_Y5HV7D9ukF.png?height=1856&lazyload=true&maxWidth=280&width=2560) | Bots used in conjunction with [Group Open Capabilities](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/group/overview) can automate group management.<br>- **Automatically Create Groups and Add Members**<br>  <br>  Associate bots with other business platforms to automatically create group chats. For example, when creating a work requirement, the bot can automatically initiate a group chat and invite relevant responsible persons to join.<br>  <br>- **Manage and Maintain Various Group Configurations**<br>  <br>  The bot can manage group announcements, conversation tabs, group menus, etc. |
| **AI Scenario**<br>![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6f6c5d89a65b09ccc7b67c1d8d358851_1XgNC4eQAK.png?height=1856&lazyload=true&maxWidth=280&width=2560)<br>![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/cf16acdc70ab13829611020f4868c528_IMXRYbX8VL.png?height=1856&lazyload=true&maxWidth=280&width=2560) | When using Feishu bots to host AI Bots (such as [publishing Coze Bot on Feishu](https://www.coze.cn/open/docs/guides/publish_to_feishu)), you can customize AI Bot interactions with the capabilities provided by the open platform. For example:<br>- Subscribe to the [User Entering Chat with Bot](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-access_event/events/bot_p2p_chat_entered) event so the bot can promptly detect a user entering a conversation and automatically send an introduction.<br>- Configure [Streaming Messages](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/content), [Follow-up Bubbles](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/push_follow_up), [Floating Menus](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/bot-v3/bot-customized-menu), and other capabilities for diverse information display. |

Getting started, please refer to [Quick start](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/develop-robots/quick-start).

## Features

- **Embedded experience**

Bots can handle content delivery, monitoring, and response within Feishu conversation messages. With bot capabilities, you can integrate enterprise systems into Feishu, providing a one-stop system experience within Feishu. For example, with bots, you can automatically push messages, engage in simple information interactions with users, and manage groups automatically.

- **Low development cost**

Only server-side development is needed to create a bot that presents and interacts well. Once developed, it can be easily used by other members within the enterprise.

- **Supports various message types**

Bots can send text, images, files, videos, etc., and also send interactive card messages with friendly presentation styles, ensuring that the pushed content effectively reaches users.

- **Rich server-side capabilities**

Bots can leverage rich server-side capabilities to achieve various workflow automations. For example, using a bot to collect feedback in topic groups and sync it to a multi-dimensional table, efficiently collecting scattered information in Feishu groups.

- **Interaction with external users**

Enterprises that are certified by Feishu can use self-built applications to enable bot and external sharing capabilities, allowing bot applications to interact with users outside the enterprise.


## Types of bots

There are two types of robots in Feishu: **application robots** and **custom robots**. They differ in terms of usage, which you can learn about in this section to understand their capabilities and differences.

| Comparison item | Application bot | Custom bot |
| --- | --- | --- |
| **Usage Scenarios** | Application robots can be used in conjunction with enterprise business systems. For example, integrating with enterprise data monitoring dashboards, creating fault handling groups when alarms occur, and bringing relevant personnel into the group. The alarm notifications are then pushed to the group as cards. Members can quickly respond to these notifications via interactive buttons on the cards. For a detailed tutorial, refer to [Robot Auto Group Alarm](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-development-tutorial/introduction).<br>![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/dc5f3890a1cece2d98e7e1d6823ceeef_7ZWCLvuEmp.png?height=1100&lazyload=true&width=1640)<br>Although application robots require version approval, they can call a rich set of open APIs on Feishu, subject to the authorization of the application administrator, enabling more interactive scenarios. Hence, if you want to integrate external systems into Feishu for interaction and group management, we recommend using **application robots**. | Custom robots only support one-way message push to groups and do not support message interaction with users. They are generally used for scenarios where fixed content is temporarily pushed to groups.<br>![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/eb79f1a107794e68edda3e34d6631b8b_wKqAxQehtL.png?height=246&lazyload=true&width=1040)<br>Custom robots are simple to configure but are limited in usage scenarios, mainly fulfilling basic group message pushing needs. Thus, if you only need to push fixed messages temporarily in a group chat, we recommend using the simpler **custom robots**. |
| **Development Method** | Create an application in the [Developer Console](https://open.feishu.cn/app) and enable robot capabilities. This type of application is called an application robot. When changes in the application configuration occur (e.g., enabling robot capabilities, applying for API permissions, subscribing to events or callbacks), the application needs to be published and approved by the enterprise administrator for the changes to take effect.<br>![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/23ba5b730483e104938c9dcf3f5872c6_ZUil0zjSpL.png?height=980&lazyload=true&width=2272) | Add a custom robot in the **Group Settings** of a Feishu group.<br>![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/394a7a0f614ad9c08e56cdc153473f7f_DiWT24SN6h.png?height=1252&lazyload=true&width=2288) |
| **Usage Method** | Support calling Feishu Open Platform's server API using the application identity to use or obtain enterprise and user resources. For example:<br>- Call the [Send Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) API to send messages to specified conversations.<br>- Call the [Get Conversation History](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list) API to obtain chat records.<br>- Subscribe to the [Receive Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive) event to receive messages sent by users and call the [Reply Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/reply) API to reply to users, thereby achieving interaction between the robot and the user. | Use the webhook URL to push messages unidirectionally in the current group chat.<br>![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/4956b943379d9eba57badfe6ce3f591f_SwLIZULflM.png?height=1120&lazyload=true&width=1646) |
| **Usage Limitations** | - Can initiate one-on-one chats with users within the [Scope of Application](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability).<br>- Support creating groups or being added to specified groups, sending messages in groups, and managing groups.<br>- Support external groups and one-on-one chats with external users. For details, see [Robots Support for External Groups and One-on-One Chats with External Users](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/develop-robots/add-bot-to-external-group). | - Can only be used in groups they have been added to, not supporting one-on-one chats or cross-group usage.<br>- Can only push messages unidirectionally in groups and cannot obtain detailed information about users or enterprises.<br>- Only support the [configuration to open link interaction](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions#3867b9c6) for Feishu card interaction modules. |

### Capability comparison

Application bots require approval from enterprise administrators and, after applying for API permissions, can call Feishu's rich open interfaces (server-side API) to flexibly achieve session interaction capabilities. Custom bots are simple to configure without review but have limited usage scenarios, mainly suitable for basic group message pushing needs. The detailed capability comparison is as follows:

| Capability | Application bot | Custom bot |
| --- | --- | --- |
| Add to external groups | ✅ | ✅ |
| Push messages to groups | ✅ | ✅ |
| [Configure open link interactions](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions#3867b9c6) | ✅ | ✅ |
| [Configure card interactions](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/configuring-card-interactions#5746ae32) | ✅ | ❌ |
| [Respond to messages @ bot users](https://open.feishu.cn/document/home/interactive-session-based-robot/introduction) | ✅ | ❌ |
| [Send direct messages to users](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) | ✅ | ❌ |
| [Create, manage, and retrieve group information](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create) | ✅ | ❌ |
| [Access address book, manage cloud documents, and other various open capabilities](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM) | ✅ | ❌ |

## Basic concepts

When using bots, you might encounter the following concepts, provided here for your reference.

| Concept | Description |
| --- | --- |
| Application Capability | Application capability includes bots, web applications, widgets, etc. Bot application refers to an application that enables bot capabilities. For further information about application capabilities, refer to [Introduction to application capabilities](https://open.feishu.cn/document/home/app-types-introduction/overview). |
| Webhook | A Webhook is a method for augmenting or altering the behavior of a webpage through custom callbacks. In Feishu group chats, a custom bot Webhook is a URL that receives HTTP requests, used to push messages to the group by sending requests to this URL. |
| Server-side API | The open platform provides a variety of server-side open interfaces for managing or viewing enterprise and user resource data. Bot applications can use these server-side interfaces to flexibly achieve various functions, such as sending messages to users, creating groups, etc. For a list of server-side open interfaces, refer to the API list. |
| Message Types | When sending messages with bots, the message content includes various types, such as text messages, rich text messages, image messages, group business cards, card messages, etc. Different types of bots support different ranges of message types. For specifics, refer to:<br>- [Message Content Structure for Bot Applications](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/im-v1/message/create_json)<br>  <br>- [Message Content Structure for Custom Bots](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN#5a997364). |
| Bot Menu | The bot menu is a capability of bot applications. By configuring a custom menu for the bot, you can fix the common entry points of the application in the bot's chat input box. Users can quickly operate through the interactive buttons on the bot menu. For more information, refer to [Bot Menu Usage Guide](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/bot-v3/bot-customized-menu).<br>![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/eabc962ca3a301f9472bc894b977bb80_ooGK0gj4X3.png?height=1244&lazyload=true&maxWidth=300&width=1234) |

## User guide

- **App bots**: [Bot user guide](https://open.feishu.cn/document/ukTMukTMukTM/uATM04CMxQjLwEDN), [Bot menu user guide](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/bot-v3/bot-customized-menu)

- **Custom bots**: [Custom bot user guide](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)


## Bot API and Events

| **Open Capabilities** | **Documentation** | **Description** |
| --- | --- | --- |
| API | [Get bot information](https://open.feishu.cn/document/ukTMukTMukTM/uAjMxEjLwITMx4CMyETM) | Get basic information about the bot application, including app status, app name, open\_id, etc. |
| API | [Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) | The bot can use this API to send messages to a specified conversation. |
| Event | [Receive message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive) | After subscribing to this event, the bot will receive different user messages based on the enabled permissions. By subscribing to this event and using message APIs (such as [Reply message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/reply)), the bot can automatically receive and respond to user messages. |
| Events | [Bot custom menu events](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/application-v6/bot/events/menu) | Events triggered when users click the custom menu in a one-on-one chat with the bot in the Feishu client. |

## FAQs

For frequently asked questions related to bots, see [Bot FAQ](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/guide/faq#5995f6a6).

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fclient-docs%2Fbot-v3%2Fbot-overview%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[Is it supported to create robots through OpenAPI?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#3e6770f6)

[Can the same custom robot be used in different groups?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#668f9d7c)

[Why can't I search my robot in Feishu? Can't I search it when adding a robot in a group chat?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#e2501916)

[How to add internal employees and external clients to group chat with one click](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/add-internal-employees-and-external-clients-to-group)

[When the robot sends a message, how do I implement @ everyone and @ a specific person?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#6d54ce65)

Got other questions? Try asking AI Assistant

[Previous:Development Quality](https://open.feishu.cn/document/develop-process/operations-analysis/development-quality) [Next:Quick start](https://open.feishu.cn/document/develop-robots/quick-start)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[What is a Bot](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#0593def9 "What is a Bot")

[Application scenarios](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#6b907e7a "Application scenarios")

[Features](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#93b8c816 "Features")

[Types of bots](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#846740ff "Types of bots")

[Capability comparison](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#1e4f69a4 "Capability comparison")

[Basic concepts](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#255b5fca "Basic concepts")

[User guide](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#358d7c62 "User guide")

[Bot API and Events](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#28628448 "Bot API and Events")

[FAQs](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#2d7f6d58 "FAQs")

Try It

Feedback

OnCall

Collapse

Expand