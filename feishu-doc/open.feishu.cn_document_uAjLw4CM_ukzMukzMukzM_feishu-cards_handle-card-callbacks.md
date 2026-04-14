---
url: "https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks"
title: "Handle card callbacks - Developer Guides - Documentation - Feishu Open Platform"
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

Develop Web Apps

Develop Gadgets (Not Recommended)

Develop Docs Add-ons

Develop Base Extensions

Develop Workplace Blocks

Development link preview

Feishu Cards

[Feishu Card overview](https://open.feishu.cn/document/feishu-cards/feishu-card-overview)

Quick Start

Build card with Cardkit

Build card with JSON

[Send Feishu card](https://open.feishu.cn/document/feishu-cards/send-feishu-card)

[Handle card callbacks](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)

[Update Feishu card](https://open.feishu.cn/document/feishu-cards/update-feishu-card)

[Feishu Card FAQs](https://open.feishu.cn/document/common-capabilities/message-card/message-card)

Resources

Web Components

Native integration

SSO&End User Consent

AppLink Protocol

Developer Tools

FAQ

Management Practice

Platform Notices

Deprecated Guides

[Developer Guides](https://open.feishu.cn/document/client-docs/intro) [Feishu Cards](https://open.feishu.cn/document/feishu-cards/feishu-card-overview)

Handle card callbacks

# Handle card callbacks

Copy Page

Last updated on 2025-06-25

The contents of this article

[Prerequisite](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#cf5a8c2d "Prerequisite")

[Steps](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#d46b8bd4 "Steps")

[Step 1: Set up the callback subscription method](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#38d087eb "Step 1: Set up the callback subscription method")

[Step 2: Subscribe to card callbacks in the Developer console](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#6741c1d5 "Step 2: Subscribe to card callbacks in the Developer console")

[Step Two: receive and handle callbacks on local server](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#3629e6f8 "Step Two: receive and handle callbacks on local server")

[Error code description](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#c28cac90 "Error code description")

[FAQs](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#2d7f6d58 "FAQs")

[If callback requests fail or immediate update operations time out, the client will prompt an operation failure or network timeout, how to handle if the card does not refresh?](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#b881f1aa "If callback requests fail or immediate update operations time out, the client will prompt an operation failure or network timeout, how to handle if the card does not refresh?")

[If the timing of updating the card is not triggered by the interactive components of the message card (for example, the approval operation is completed in the enterprise's own approval system, not in the message card, and the card is only used to synchronize the approval results), how should it be handled?](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#1048aeb9 "If the timing of updating the card is not triggered by the interactive components of the message card (for example, the approval operation is completed in the enterprise's own approval system, not in the message card, and the card is only used to synchronize the approval results), how should it be handled?")

[Is callback subscription and configuration supported at the card level?](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#166c4009 "Is callback subscription and configuration supported at the card level?")

# Handling card callbacks

After adding interactive components to the card, you need to accept and respond to card callbacks on your local server. Depending on the scenario, you can achieve effects such as immediately updating the card, delaying the card update, or not updating the card. This document explains how to subscribe to, accept, and handle callbacks.

## Prerequisite

Interactive components have been added to the card. If an interactive container has been added to the card, you need to add a [Request Callback Interaction Event](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/add-interactive-events) for that container.

## Steps

This section details the specific steps for subscribing to, receiving, and processing card callbacks.

### Step 1: Set up the callback subscription method

In the [Developer console](https://open.feishu.cn/app), choose either **Receive callbacks using a long connection** or **Send callbacks to the developer's server** based on your requirements.

If you have already integrated the Feishu SDK and are developing a Custom App, it is recommended to use the more secure and efficient long connection subscription method.

- **Receive callbacks using a long connection** is a capability provided within the Feishu SDK. By integrating the Feishu SDK, you can establish a WebSocket full-duplex channel with the open platform (your server needs to be able to access the public internet). Subsequently, when a subscribed callback occurs, the open platform will send messages to your server through this channel. For details, refer to [Receive callbacks using a long connection](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/configure-callback-request-address).

- **Send callbacks to the developer's server** is the traditional Webhook mode. This method requires you to provide a public internet address for receiving callback messages. Subsequently, when a subscribed callback occurs, the open platform will send an HTTP POST request to the server's public address, containing the callback data. For details, refer to [Send callbacks to the developer's server](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server).


### Step 2: Subscribe to card callbacks in the Developer console

Refer to [Add callbacks](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/add-callback) to add the card interaction callback. It is recommended to add the new version of the [Card interaction callback](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication) (`card.action.trigger`).

After adding the card callback, when a user interacts with the components within the card, the application that sent the card message will send an HTTP POST request to the configured callback request address. The request body contains the **Card Interaction Callback** data. The specific details are as follows:

| **Callback Addition Method** | **Request Method for Applying Callbacks** |
| --- | --- |
| Add only **new version** card callback interaction (`card.action.trigger`) | 1 request containing the [new version callback structure](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication) |
| Add only **old version** card callback interaction (`card.action.trigger_v1`) | 1 request containing the [old version callback structure](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure) |
| Simultaneously add **new version and old version** card callback interactions | 2 requests, each containing [new version](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication) and [old version](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure) callback structures. At this point, responding to any of the callbacks is considered a successful response, and it is recommended that you delete redundant request methods |
| Configure the message card request address for historical versions on the robot page, and simultaneously add **new version** card callback interaction (`card.action.trigger`) | 2 requests, each containing [new version](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication) and [old version](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure) callback structures. At this point, responding to any of the callbacks is considered a successful response, and it is recommended that you delete redundant request methods |
| Configure the message card request address for historical versions on the robot page), and simultaneously add **old version** card callback interaction | 1 request containing the [old version callback structure](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure) |
| Configure the message card request address for historical versions on the robot page, and simultaneously add **new version and old version** card callback interactions | 2 requests, each containing [new version](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication) and [old version](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure) callback structures. At this point, responding to any of the callbacks is considered a successful response, and it is recommended that you delete redundant request methods |

### Step Two: receive and handle callbacks on local server

After your server receives the **Card Callback Interaction** request, it needs to respond with an HTTP 200 status code within 3 seconds (failure to respond promptly will display an error on the user's client), and proceed with further business processing. When responding to the callback request, you can choose different response methods depending on different business scenarios. Descriptions and configurations of different response methods are as follows.

You can refer to [Receive and Handle Callbacks](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/receive-and-handle-callbacks) for callback security verification and decryption, and then respond to the callback.

#### Notes

- The callback interaction for a sent card is valid for 30 days. After this period, the sent card no longer supports callback interactions to the developer's server. If the user clicks on the card after this period, a message will be displayed: **This card was sent over 30 days ago and cannot be interacted with**.

- The update validity period for a sent card is 14 days. If the user interacts with the card between the 14th and 30th days after it was sent, and the callback action is to update the card, the update action will not take effect.

- The business server must not use redirect status codes (`HTTP 3xx`) to respond to callback requests for cards; otherwise, an interaction request error will occur on the user side.


#### **Method one: Immediate card update**

After receiving the callback request from the card, the server needs to respond with an `HTTP 200` status code within 3 seconds, and the response body's `data` string should include the updated card content. The response body structure for the new version of card callback interaction (`card.action.trigger`) is as follows, for details refer to [Card Callback Interaction](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication).

You can also refer to [Old Message Card Callback Interaction](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure) to understand the old version of card callback interaction response body structure.

```

{
  "toast": { // Toast structure, used to echo the status information of the operation.
    "type": "info", // Toast type. Values: info (only tips, no status icon), success (success tips), error (failure tips), warning (warning tips).
    "content": "Card interaction successful", // Tip content.
    "i18n": {
      "zh_cn": "卡片交互成功",
      "en_us": "Card interaction successful"
    }
  },
  "card": { // Template type card configuration. Choose one of two types.
    "type": "template", // Card type. Available options: template (card template), raw (card JSON).
    "data": {
      "template_id": "xxxxxxxxxxxx", // Card ID, a required parameter. Can be copied from the card ID in the building tool.
      "template_version_name": "1.0.0", // Card version, optional. Can specify a fixed version number for the card request, to avoid immediately affecting online business logic when publishing cards in the tool. Default is empty, i.e., the latest version of the card.
      "template_variable": {
        "key1": "value1", // If variables are set within the card template, you can assign values here for the variable name (key).
        "key2": "value2"
      }
    }
  },
  "card": { // Raw type card configuration. Choose one of two types.
    "type": "raw", // Card type. Available options: template (card template), raw (card JSON).
    "data": { // Raw type card JSON code.
      "config": {
        "enable_forward": true
      },
      "elements": [\
        {\
          "tag": "div",\
          "text": {\
            "content": "This is the plain text",\
            "tag": "plain_text"\
          }\
        }\
      ],
      "header": {
        "template": "blue",
        "title": {
          "content": "This is the title",
          "tag": "plain_text"
        }
      }
    }
  }
}
```

#### **Method two: delayed card update**

If the current business scenario does not require an immediate update of the card content, you should follow these steps to delay the update of the card:

1. After receiving the callback request from the card, the server should respond within 3 seconds with an `HTTP 200` status code.
2. In the response, set the HTTP body to `"{}"` or return a custom Toast structure.

```

{
     "toast": {
       "type": "success",
       "content": "Success!",
       "i18n": {
         "zh_cn": "成功了！",
         "en_us": "Success!",
         "ja_jp": "成功した！"
       }
     }
}
```

3. Under the link preview card scenario, invoke the [Trigger link preview](https://bytedance.larkoffice.com/docx/FGw0dUwZNoXzuTxACNucmoajnR6) interface to trigger the client to re-fetch the card content; in the message card scenario, use the [Delayed Update Message Card](https://open.feishu.cn/document/ukTMukTMukTM/uMDO1YjLzgTN24yM4UjN) interface to update the card.

- This step must be performed after responding to the callback request. Performing it in parallel or prematurely can lead to update failures.
- In the message card scenario, the delayed update `token` has a validity period of 30 minutes. After the validity period, the `token` becomes invalid, and the card cannot be updated for this user interaction; moreover, the same `token` can support updating the card up to two times.

#### **Method three: no card update**

If the current business scenario does not require updating the card content, you can respond to the request with an `HTTP 200` status code, returning no value. This means only collecting the user's click actions without returning a response to the user operation. The process is as follows:

1. The server should respond to the card's callback request within 3 seconds with an `HTTP 200` status code.
2. Since there is no need to update the card content, set the HTTP body to "{}".

## Error code description

When performing card interactions in the Feishu client, if an interaction error occurs, the corresponding error codes will be returned as shown in the figure below. For error code descriptions and solutions, refer to [Card callback interaction - Error codes](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication#c98c3220).

## FAQs

### If callback requests fail or immediate update operations time out, the client will prompt an operation failure or network timeout, how to handle if the card does not refresh?

You can refer to the following troubleshooting solutions to solve this problem:

- Whether the message card request URL is configured.
- Whether the card click event was responded to within 3 seconds with an `HTTP 200` status code.

### If the timing of updating the card is not triggered by the interactive components of the message card (for example, the approval operation is completed in the enterprise's own approval system, not in the message card, and the card is only used to synchronize the approval results), how should it be handled?

You can call the [Update Messages Sent by the Application](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/patch) interface to request an update to the card.

### Is callback subscription and configuration supported at the card level?

No. Cards need to accept and process callbacks through the application. Setting the callback request address at the card level is not supported.

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FukzMukzMukzM%2Ffeishu-cards%2Fhandle-card-callbacks%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:Send Feishu card](https://open.feishu.cn/document/feishu-cards/send-feishu-card) [Next:Update Feishu card](https://open.feishu.cn/document/feishu-cards/update-feishu-card)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Prerequisite](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#cf5a8c2d "Prerequisite")

[Steps](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#d46b8bd4 "Steps")

[Step 1: Set up the callback subscription method](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#38d087eb "Step 1: Set up the callback subscription method")

[Step 2: Subscribe to card callbacks in the Developer console](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#6741c1d5 "Step 2: Subscribe to card callbacks in the Developer console")

[Step Two: receive and handle callbacks on local server](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#3629e6f8 "Step Two: receive and handle callbacks on local server")

[Error code description](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#c28cac90 "Error code description")

[FAQs](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#2d7f6d58 "FAQs")

[If callback requests fail or immediate update operations time out, the client will prompt an operation failure or network timeout, how to handle if the card does not refresh?](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#b881f1aa "If callback requests fail or immediate update operations time out, the client will prompt an operation failure or network timeout, how to handle if the card does not refresh?")

[If the timing of updating the card is not triggered by the interactive components of the message card (for example, the approval operation is completed in the enterprise's own approval system, not in the message card, and the card is only used to synchronize the approval results), how should it be handled?](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#1048aeb9 "If the timing of updating the card is not triggered by the interactive components of the message card (for example, the approval operation is completed in the enterprise's own approval system, not in the message card, and the card is only used to synchronize the approval results), how should it be handled?")

[Is callback subscription and configuration supported at the card level?](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks#166c4009 "Is callback subscription and configuration supported at the card level?")

Try It

Feedback

OnCall

Collapse

Expand