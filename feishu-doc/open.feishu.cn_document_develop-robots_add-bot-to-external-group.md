---
url: "https://open.feishu.cn/document/develop-robots/add-bot-to-external-group"
title: "Bot supports external groups and external users to chat - Developer Guides - Documentation - Feishu Open Platform"
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

Bot supports external groups and external users to chat

# Bot supports external groups and external users to chat

Copy Page

Last updated on 2025-03-14

The contents of this article

[Function introduction](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#73bb7819 "Function introduction")

[Configure external sharing capabilities for the app](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#82791357 "Configure external sharing capabilities for the app")

[Usage restrictions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#ce3946c1 "Usage restrictions")

[Precautions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#d258cc64 "Precautions")

[Operation steps](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#19e987d9 "Operation steps")

[OpenAPI call restrictions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#ac13a6c8 "OpenAPI call restrictions")

[Message and Group API permission restrictions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#69599f98 "Message and Group API permission restrictions")

[External groups or external users use bots](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#3113dadd "External groups or external users use bots")

[Usage restrictions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#ce3946c1-1 "Usage restrictions")

[Add bots to external groups](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#417ab36 "Add bots to external groups")

[The bot can chat with external users or invite external users to a group chat](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#78f8c8a0 "The bot can chat with external users or invite external users to a group chat")

[FAQ](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#c12d6bc5 "FAQ")

[How to obtain the open\_id of an external user?](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#8015dd3f "How to obtain the open_id of an external user?")

[Does external user single chat support Feishu Personal Edition?](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#230a1150 "Does external user single chat support Feishu Personal Edition?")

# Bot supports external groups and external users to chat

If you want to add the app bot to an external group, or have a one-on-one chat with users of external tenants, you can enable external sharing for the bot. The external sharing capability currently only supports enterprise-built apps.

An enterprise must complete the Organization legal representative verification or the Verified letter of authorization (Team verification is not supported) in order to use the application's external sharing capabilities. For more information on Feishu certification, see [Introduction to Feishu Verification](https://www.feishu.cn/hc/zh-CN/articles/360034114413).

## Function introduction

When conducting business communication, enterprises may face cross-tenant communication scenarios. For example, communication between members of upstream and downstream enterprises, communication between enterprises and external customers, etc. In these scenarios, enterprises can develop a bot that allows external sharing and use the bot's capabilities to efficiently complete communication and collaboration. Bots that enable external sharing support the following functions:

- Add to external groups to realize functions such as adding people to the group, pushing messages, and responding to group member messages.





![](<Base64-Image-Removed>)

- Chat with external users. Use automated processes to meet users' needs for product function feedback, business progress notifications, etc.





![](<Base64-Image-Removed>)


## Configure external sharing capabilities for the app

You need to enable external sharing capabilities for the app before you can add the bot to an external group or chat with external users. This section only introduces how to configure external sharing capabilities for the app. If you need to know other app development processes, please refer to [Enterprise custom app development process](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process).

### Usage restrictions

- Only enterprise custom app can enable external sharing. Store apps do not support it.

- Bots with external sharing capabilities have restrictions when calling OpenAPI. For details, please refer to the **OpenAPI call restrictions** section of this article.

- If the custom app has enabled the associated organization app sharing function, external sharing cannot be enabled.

The associated organization app sharing function is used to establish an association relationship between two enterprises and share a custom app. It is generally used in cross-enterprise business collaboration scenarios between two enterprises. This function is in the internal testing stage and will be gradually opened for use. If you do not see the function entrance, please wait patiently for the function to be opened.


### Precautions

- During development, it is recommended to enable only the necessary API permissions for the bot based on the principle of minimizing permissions, and avoid using the bot to send sensitive data within the enterprise to the outside in the future.
- After the app enables external sharing, the enterprise administrator can choose to turn off the external sharing function of the app in the app management function of the management background. For more information, see [Administrators view and configure installed apps](https://www.feishu.cn/hc/zh-CN/articles/157207073325).

### Operation steps

1. In the [Developer Console](https://open.feishu.cn/app), enter the app that needs to enable external sharing.

2. In the left navigation bar of the app, select **App Versions** \> **Version Management & Release**.





![](<Base64-Image-Removed>)

3. In the upper right corner of the **Version Management & Release** page, click **Create a version**.

4. In the **Version Details** page, select **External sharing**.





![](<Base64-Image-Removed>)

5. Review and publish the app.

After ensuring that other app configurations are completed, click **Save** at the bottom of the **Version Details** page, and then click **Publish**. Wait for the enterprise administrator to complete the app review, and the app will be released online.


## OpenAPI call restrictions

For bots with external sharing capabilities enabled, the following restrictions apply to calling OpenAPI under external users or external groups.

| Scenario | Restriction |
| --- | --- |
| **Calling API with user\_access\_token** | External shared bots cannot obtain external user identities (i.e., external user user\_access\_token), so they cannot call APIs as external users. |
| **Calling APIs with tenant\_access\_token** | - For APIs involving external groups or external user chats (i.e. [message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/introduction) and [group](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/group/overview) APIs), the system supports most API permissions. For details, refer to the **Message and Group API permission restrictions** section below.<br>- If the API does not need to pass in an external user ID, it can be called normally. For example, [Create document](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/create). Other APIs cannot be called if they require an external user ID. |

### Message and Group API permission restrictions

#### Precautions

- For external groups [created](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create) by apps (sharing bots externally), bots are not allowed to be group owners, and natural people must be designated as group owners.
- Before a bot can chat with external users one-on-one or invite external users to an external group, the user must confirm that the user is added to the bot's [availability scope](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability). For specific operations, see the section **Chatting with external users one-on-one or inviting external users to group chat** below. After confirmation, the bot can obtain the external user's open\_id, but cannot query the external user's contacts information through the ID.
- The historical version API for messages and groups does not support external groups and external users. Please do not use the historical version API.

#### Supported API permissions

To ensure enterprise data security, externally shared bots only support the use of some API permissions in messages and groups, as shown in the following table.

| **Permission key** | **Permission name** | **Remark** |
| --- | --- | --- |
| im:message.group\_at\_msg:readonly | Obtain group messages mentioning the bot | - |
| im:message:send\_as\_bot | Send messages as an app | - |
| im:message.p2p\_msg:readonly | Obtain private messages sent to the bot | - |
| im:chat.group\_info:readonly | Read group information | This permission has been removed. Apps that have already obtained this permission are not affected. For details, see [Message and group scope such as "Update the information of groups created by the app", "Read group information" will be sunset](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/platform-updates-/message-and-group-scope-removed) |
| im:message:update | Update message | - |
| im:chat | Obtain and update group information | - |
| im:chat:readonly | Obtain group information | - |
| im:message.group\_at\_msg | Read group chat messages mentioning the bot | This permission has been removed. Apps that have already obtained this permission are not affected. For details, see [Message and group scope such as "Update the information of groups created by the app", "Read group information" will be sunset](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/platform-updates-/message-and-group-scope-removed) |
| im:message.p2p\_msg | Read private messages sent to the bot | This permission has been removed. Apps that have already obtained this permission are not affected. For details, see [Message and group scope such as "Update the information of groups created by the app", "Read group information" will be sunset](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/platform-updates-/message-and-group-scope-removed) |
| im:message | Read and send messages in private and group chats | - |
| im:resource | Read and upload images or other files | - |
| im:url\_preview.update | Update URL preview | - |
| im:chat.access\_event.bot\_p2p\_chat:read | Subscribe to events related to accessing bot chat | - |
| im:message:send\_sys\_msg | Send specified template system message | - |
| im:chat:moderation:write\_only | Manage group posting permissions | - |
| im:chat.members:bot\_access | Subscribe to events of bot joining and leaving group | - |
| im:chat.widgets:read | View group widgets | - |
| im:chat:update | Update group information | - |
| im:chat.tabs:read | View tabs in group | - |
| im:chat.top\_notice:write\_only | Manage group pin | - |
| im:chat.tabs:write\_only | Manage tabs in group | - |
| im:chat.moderation:read | View group posting permissions | - |
| im:chat:create | Create group | - |
| im:chat:read | View group information | - |
| im:message:send\_multi\_users | Send batch messages to multiple users | - |
| im:message:send\_multi\_depts | Send batch messages to members from one or more departments | - |
| im:message:recall | Recall message | - |
| im:message:readonly | Read messages in private and group chats | - |
| im:chat.members:write\_only | Add and remove group member | - |
| im:message.group\_msg | Read all messages in associated group chat (sensitive scope) | - |
| im:chat.menu\_tree:read | View group menu | - |
| im:chat.widgets:write\_only | Manage group widgets | - |
| im:chat.menu\_tree:write\_only | Manage group menu | - |
| im:message.pins:read | View pinned message | - |
| im:message.reactions:write\_only | Send and delete message reaction | - |
| im:chat.members:read | View group members | - |
| im:message.reactions:read | View message reaction | - |
| im:message.pins:write\_only | Pin and unpin message | - |
| im:chat.announcement:read | View group announcement | - |
| im:chat.announcement:write\_only | Update group announcement | - |

#### Unsupported API permissions

For API permissions of messages and groups that are not supported by external sharing bots, please refer to the table below.

| **Permission key** | **Permission name** | **Remark** |
| --- | --- | --- |
| im:message.groups | Update the information of groups created by the app | This permission has been removed. For details, see [Message and group scope such as "Update the information of groups created by the app", "Read group information" will be sunset](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/platform-updates-/message-and-group-scope-removed) |
| im:message.urgent | Send Buzz in app | - |
| im:chat:operate\_as\_owner | Update the information of groups created by app | - |
| im:user\_agent:read | View user agent information of client | - |
| im:chat:delete | Disband group | - |
| im:message.urgent:sms | Send Buzz by SMS message | - |
| im:message.urgent:phone | Send Buzz by phone call | - |
| im:chat.managers:write\_only | Add and remove group admin | - |
| im:message.send\_as\_user | Send message as user | Permissions in beta |
| im:chat.labels | Search and set group labels | Permissions in beta |
| im:special\_focus | Obtain information about important contacts | Permissions in beta |
| im:usage\_data | Access usage efficiency data of Messenger in a tenant | Permissions in beta |

## External groups or external users use bots

App bots that have been developed and have the ability to share externally can be added to external groups in the Feishu client for use, or can have one-on-one chats with external users.

### Usage restrictions

If the enterprise administrator has disabled the user's external communication permissions, users in the enterprise cannot join external groups or have one-on-one chats with external bots. For more information about external communication permissions, refer to [Administrators set member external communication permissions](https://www.feishu.cn/hc/zh-CN/articles/308867175966).

### Add bots to external groups

When adding bots to the external group chat of the Feishu client, group-defined bots and bots with external sharing enabled are supported.

- If a user needs to add an externally shared bot to an external group, the user must be within the [app availability](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability) and the user must be in the enterprise to which the app belongs, not a cross-tenant user.
- The operation of adding an externally shared bot to an external group is supported in Feishu client V7.19 and above.

![](<Base64-Image-Removed>)

### The bot can chat with external users or invite external users to a group chat

This operation is supported in Feishu client V7.22 and above.

When initiating a one-on-one chat for the first time, you need to complete the confirmation according to the pop-up prompt of the client. After confirmation, you can have a one-on-one chat with the bot, and it will also be added to the bot's [available scope](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability).

![](<Base64-Image-Removed>)

Different confirmation methods in different scenarios:

| Scene | Description |
| --- | --- |
| Users click on the bot in the external group to start a one-on-one chat | After clicking the bot, click **Chat** in the pop-up window to initiate a one-on-one chat with the bot. During the initiation, you can view the developer information of the bot. You can also click **View** in the **Permissions** area to get the bot's permissions information.<br>![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b8d45e813d3eaa980c469c04c61ee388_s9E61F3b9R.png?height=854&lazyload=true&maxWidth=240&width=624) |
| Users share bots with other users | 1. Open the bot through the shared bot business card, Applink, or QR code.<br>   <br>   **Sharing method**:<br>   <br>   - Click the robot avatar in the Feishu client, and click the **Share** button in the upper right corner of the card to share the robot with others.<br>     <br>     ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/fee9663c88b65967fd358615bd9ff456_ztOnTXjxGH.png?height=710&lazyload=true&maxWidth=350&width=858)<br>     <br>   - Build and share the robot's Applink. For specific operations, see [Open robot session](https://open.feishu.cn/document/uAjLw4CM/uYjL24iN/applink-protocol/supported-protocol/open-a-bot).<br>2. Click **Request Access** in the pop-up window.<br>   <br>   ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f95ed23f880fc086fa455e71ce037179_ly17iaSJr0.png?height=326&lazyload=true&maxWidth=350&width=806)<br>   <br>3. Check the basic information, permissions, and precautions of the app. After confirming that they are correct, click **Launch** to enter the single chat page with the bot.<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/7966ce48a3e5c0fa46aa21ebf96ea49b_Y8hsTdO4oH.png?height=918&lazyload=true&maxWidth=350&width=1180) |

When an external user actively chats with the bot and completes the confirmation, the user has been added to the bot's [available scope](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability). At this time, the bot will support the following operations:

- Externally shared bots actively send messages to external users. For example, call the [send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) interface to push messages to users.
- Externally shared bots [pull users into external group chats](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-members/create). (This operation is supported in Feishu client V7.22 and above)

## FAQ

### How to obtain the open\_id of an external user?

When an external user actively chats with an externally shared bot, an event on the open platform will be triggered. The specific instructions are as follows:

1. When an external user actively chats with an externally shared bot for the first time, he needs to complete the confirmation in the client pop-up window. After confirmation, he will directly enter the single chat session page with the bot, and the [user and bot session is created for the first time](https://open.feishu.cn/document/ukTMukTMukTM/uYDNxYjL2QTM24iN0EjN/bot-events) event will be triggered.
2. Later, when an external user actively chats with an externally shared bot, the [user enters the session with the bot](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-access_event/events/bot_p2p_chat_entered) event will be triggered.

Therefore, as a developer of an externally shared bot, you need to subscribe to the **user and bot session is created for the first time** or **user enters the session with the bot** event for the bot, and then let the external user actively chat with the bot, so that you can receive the event and obtain the user's open\_id.

### Does external user single chat support Feishu Personal Edition?

Yes.

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fdevelop-robots%2Fadd-bot-to-external-group%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[Is it supported to create robots through OpenAPI?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#3e6770f6)

[Can the same custom robot be used in different groups?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#668f9d7c)

[Why can't I search my robot in Feishu? Can't I search it when adding a robot in a group chat?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#e2501916)

[How to add internal employees and external clients to group chat with one click](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/add-internal-employees-and-external-clients-to-group)

[When the robot sends a message, how do I implement @ everyone and @ a specific person?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#6d54ce65)

Got other questions? Try asking AI Assistant

[Previous:Bot customized menu](https://open.feishu.cn/document/client-docs/bot-v3/bot-customized-menu) [Next:Web app overview](https://open.feishu.cn/document/client-docs/h5/introduction)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Function introduction](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#73bb7819 "Function introduction")

[Configure external sharing capabilities for the app](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#82791357 "Configure external sharing capabilities for the app")

[Usage restrictions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#ce3946c1 "Usage restrictions")

[Precautions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#d258cc64 "Precautions")

[Operation steps](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#19e987d9 "Operation steps")

[OpenAPI call restrictions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#ac13a6c8 "OpenAPI call restrictions")

[Message and Group API permission restrictions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#69599f98 "Message and Group API permission restrictions")

[External groups or external users use bots](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#3113dadd "External groups or external users use bots")

[Usage restrictions](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#ce3946c1-1 "Usage restrictions")

[Add bots to external groups](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#417ab36 "Add bots to external groups")

[The bot can chat with external users or invite external users to a group chat](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#78f8c8a0 "The bot can chat with external users or invite external users to a group chat")

[FAQ](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#c12d6bc5 "FAQ")

[How to obtain the open\_id of an external user?](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#8015dd3f "How to obtain the open_id of an external user?")

[Does external user single chat support Feishu Personal Edition?](https://open.feishu.cn/document/develop-robots/add-bot-to-external-group#230a1150 "Does external user single chat support Feishu Personal Edition?")

Try It

Feedback

OnCall

Collapse

Expand