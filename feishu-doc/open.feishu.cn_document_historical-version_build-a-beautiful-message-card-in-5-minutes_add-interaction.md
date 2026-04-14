---
url: "https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/add-interaction"
title: "Step 3: Configure card callback - Developer Tutorials - Documentation - Feishu Open Platform"
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

Develop a Bot App

Interactive Chat Bot

Quickly Learn Message Cards

[Introduction](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/what-is-a-message-card)

[Preparation](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/preparation)

[Step 1: Create a message card](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/build-static-cards)

[Step 2: Create and config the app](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/create-app)

[Step 3: Configure card callback](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/add-interaction)

[Step 4: Send message card](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/send-message-card)

[Step 5: Respond to user actions](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/feedback-on-user-behavior)

Develop Interactive Cards

Send Interactive Approval Cards

Manage Weekly Report with Docs

Daily Reminders for Wiki​ Weekly Report To-Dos

[Developer Tutorials](https://open.feishu.cn/document/course) [Deprecated Tutorials](https://open.feishu.cn/document/historical-version/develop-a-bot-in-5-minutes/create-an-app) [Quickly Learn Message Cards](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/what-is-a-message-card)

Step 3: Configure card callback

# Step 3: Configure card callback

Copy Page

Last updated on 2024-12-02

The contents of this article

[Procedure](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/add-interaction#42b6d092 "Procedure")

# Step 3: Configure card callback

When the user operates on the message card, if you need to respond to the user's operation, then you also need to configure the message card callback. After the user completes the card operation, Feishu Open Platform will send the card information to the card callback address in an HTTP POST request. This article describes how to configure message card callbacks.

## Procedure

1. Log in to the [Developer Console](https://open.feishu.cn/app), and go to the app details page.

2. Enter the application details page and click **Events & Callbacks** in the left navigation bar.

3. In the **Subscription mode** area of the **Callback Configuration** tab, fill in the developer server address used to receive card callbacks.

![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6a8fb2a07de44c70daa62291261e51c8_FyQOwMPUtc.png?height=1022&lazyload=true&maxWidth=550&width=1792)

4. Click **Save**.

When clicked, the open platform will send an HTTP POST request in the `application/json` format to the request address you configured to verify the legitimacy of the address you configured.

An example request is as follows:


```

{
        "challenge": "1b6aef1a-401f-406a-be41-f48911e00be7",
        "type": "url_verification",
        "token": "qjSwzC****4T1uhJ"
}
```


Parameter description is as follows:




| **Parameters** | **Type** | **Example values** | **Description** |
| --- | --- | --- | --- |
| challenge | String | 1b6aef1a-401f-\*\*\* | The value you need to return unchanged in the response. |
| type | String | url\_verification | Event type. <br> The fixed value in the current request is `url_verification`, which means that the current request is to verify the validity of the URL. |
| token | String | qjSwzC\*\*\*\*4T1uhJ | Application verification identification. You can use this Token to verify whether the pushed event belongs to the current application. <br> You can view and reset this value on the [Developer Backstage](https://open.feishu.cn/app) \> **Event Subscription** page. |



You need to return the `challenge` value (JSON format) to Feishu Open Platform as it is within 3 seconds, otherwise the request address verification will fail.

The return example is as follows:


```

{
       "challenge": "1b6aef1a-401f-406a-be41-f48911e00be7"
}
```

5. In the **Callback subscriptions** area, click **Add callback**.

6. Search and add the **Message card callback communication (legacy)** callback.





![](<Base64-Image-Removed>)


[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fhistorical-version%2Fbuild-a-beautiful-message-card-in-5-minutes%2Fadd-interaction%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:Step 2: Create and config the app](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/create-app) [Next:Step 4: Send message card](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/send-message-card)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Procedure](https://open.feishu.cn/document/historical-version/build-a-beautiful-message-card-in-5-minutes/add-interaction#42b6d092 "Procedure")

Try It

Feedback

OnCall

Collapse

Expand