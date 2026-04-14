---
url: "https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot"
title: "Send message cards with custom bot - Developer Guides - Documentation - Feishu Open Platform"
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

[Develop a card interactive bot](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/develop-a-card-interactive-bot)

[Send Feishu cards with apps](https://open.feishu.cn/document/feishu-cards/quick-start/send-feishu-cards-with-app-bots)

[Send message cards with custom bot](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot)

[Streaming update card](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview)

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

[Developer Guides](https://open.feishu.cn/document/client-docs/intro) [Feishu Cards](https://open.feishu.cn/document/feishu-cards/feishu-card-overview) [Quick Start](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/develop-a-card-interactive-bot)

Send message cards with custom bot

# Send message cards with custom bot

Copy Page

Last updated on 2025-07-07

The contents of this article

[Explanation on binding apps or custom bots](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#35127616 "Explanation on binding apps or custom bots")

[Demonstration effect](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#ec987bb3 "Demonstration effect")

[Operational steps](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#59f4faa8 "Operational steps")

[Step One: Create a custom bot for the group](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#75fbd73d "Step One: Create a custom bot for the group")

[Step Two: Build and Publish a Card Template](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#cf152440 "Step Two: Build and Publish a Card Template")

[Step Three: Request the Group Custom Bot to Send a Feishu Card](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#dbaa610e "Step Three: Request the Group Custom Bot to Send a Feishu Card")

# Sending Feishu Cards with a Custom Bot

This document guides you on how to use a custom bot added to a Feishu group chat to send cards.

## Explanation on binding apps or custom bots

After adding an application or custom bot to a card template, you can use that application or custom bot to send the card template. The differences between adding an application and a custom bot are as follows:

- **Adding a specific application**: After adding an application, it can push messages to specified members via the send message API. Card templates sent by applications support interactive capabilities, allowing enterprise members to submit data to the developer's server.
- **Adding a custom bot**: After binding a custom bot, it can push card template messages to group chats via webhook. Card templates sent by custom bots only support static content, i.e., they only support link redirection and do not support submitting data to the developer's server via callback interactions.

## Demonstration effect

Following the steps in this document, you will ultimately receive a Feishu card message sent by a custom bot in a Feishu group chat.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/672c6fc3bfb7559435910e09196f21fe_IEpu0XyTLF.png?height=957&lazyload=true&maxWidth=500&width=1320)

## Operational steps

### Step One: Create a custom bot for the group

1. Log in to the Feishu client (PC).

2. Select a target group and click **Bots** in the group settings.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/8169085c4bf399f0a467c4a5995a4706_Q6nI82ZI5z.png?height=1532&lazyload=true&maxWidth=600&width=1798)

3. Click **Add Bot** and select **Custom Bot**.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/1beb0c9b05e8768e324e8723f7f35646_5mHzBwqpX6.png?height=1516&lazyload=true&maxWidth=600&width=2714)

4. Confirm the bot's avatar, name, and description, then click **Add**.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f24fcaa4e3b87bd4b9493b53c3b6d72b_CQrxY2VfiY.png?height=1148&lazyload=true&maxWidth=600&width=1664)

5. After adding, properly save the webhook URL of the bot and click **Finish**.


Further requests need to be sent to the webhook URL of the bot to send message cards. Therefore, you need to save this webhook, ensure data security, and prevent others from maliciously calling the bot.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/5eef67a22d4c6b79418b3fa6fa295093_Afwh6YstGi.png?height=1140&lazyload=true&maxWidth=600&width=1668)

### Step Two: Build and Publish a Card Template

01. Log in to [Feishu Card Building Tool](https://open.feishu.cn/cardkit?from=open_docs_send_cards_with_bot).

02. On the **My Cards** page, click **Sample Library** \> **Recent approval efficiency overview**.





    ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/7260f812bace6ecee1275321bd24ac6c_gAwKzOEdQA.png?height=826&lazyload=true&maxWidth=500&width=1204)

03. In the **Create from sample** dialog, set the **Card Name** to `CardDemo`, then click **Create**.

04. On the card template editing page, click the application icon.





    ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/04fff9e7c4b1c10239a212100920f154_5nMiveVNbI.png?height=403&lazyload=true&maxWidth=500&width=1240)

05. In the **Add Custom Bot/Application** popup, select add custom bot.





    ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3a8de4a632ef40ca2590c4faad194b81_7ukbVXuVzy.png?height=262&lazyload=true&width=586)

06. Select **Specific Custom Bot**, fill in the webhook address you obtained in Step One to grant this bot the permissions to send the card template.

07. In the building tool top menu bar, click **Save**.

08. In the top right corner, click **Send me Preview**, and you will receive the data report card sent by the developer assistant.





    ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/356f4d0772c9474ec6833f6d1b212019_P0Dz9h5pXh.png?height=110&lazyload=true&maxWidth=500&width=495)

09. After the preview is confirmed to be correct, return to the card editing page, click **Publish** in the top right corner.

10. In the **Publish Card** dialog, set the **Card Version Number**, and click **Publish**. Typically, set the version number to `1.0.0` for the first time publishing a card.

11. Obtain the card version number and card ID for use in Step Three to send the card.

    Get the card ID from the building tool's top menu bar, as shown below.





    ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/aaf163e9eb92edb8c9c04d8f92ab2c1e_KxhoLa5dQl.png?height=296&lazyload=true&maxWidth=500&width=546)





    The card version number is the version number you manually set when publishing the card. If you need to view historical versions of the card and their corresponding version numbers, you can click **Version Management** in the building tool's top menu bar to view.





    ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/4f645b8be990e9ee9ba5267818e0d123_Av5eZQWnsA.png?height=255&lazyload=true&maxWidth=500&width=1845)


### Step Three: Request the Group Custom Bot to Send a Feishu Card

Locally, send an HTTP POST request to the custom bot's webhook address using curl command. You can base this on the example code and explanations provided, modify the example values to actual values, and depending on your system environment, compress or escape the JSON code. If you are using card variables, you need to customize the variable values here.

- If your operating system is **macOS**, please open the Terminal locally, refer to the code explanation in the table below to modify the sample code, and then run it locally:


```

curl -X POST -H "Content-Type: application/json" \
  -d '{"msg_type":"interactive","card":{"type":"template","data":{"template_id":"AAqyBQVmUNxxx","template_version_name":"1.0.0"}}}' \
https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx
```






![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/1dd44d829a7c1d18cea5076ce9b01f78_HqWYg8A0nf.png?height=244&lazyload=true&maxWidth=650&width=1464)

- If your operating system is **Windows**, you can open the Command Prompt (cmd) tool locally, refer to the code explanation in the table below to modify the sample code, and then run it locally. Please pay attention to JSON escaping when using it:


```

curl -X POST -H "Content-Type: application/json" -d "{\"msg_type\":\"interactive\",\"card\":{\"type\":\"template\",\"data\":{\"template_id\":\"AAqyBQVmUNxxx\",\"template_version_name\":\"1.0.0\"}}}" "https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx"
```






![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/ac332c21bdaf8e18c98d8b170de9fd56_ysXXeQr3xd.png?height=382&lazyload=true&maxWidth=650&width=1236)

- If your operating system is **Windows**, you can also open the Windows PowerShell tool locally, refer to the code explanation in the table below to modify the sample code, and then run it locally:


```

Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"msg_type":"interactive","card":{"type":"template","data":{"template_id":"AAqyBQVmUNxxx","template_version_name":"1.0.0"}}}'
```






![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/7cf96e352b91bc746cec619936d87f10_JL37HOMQf1.png?height=539&lazyload=true&maxWidth=650&width=1208)


Explanation for the above code is as follows:

| Code | Description |
| --- | --- |
| POST | Request method, no modification needed. |
| Content-Type: application/json | Request header, no modification needed. |
| ```<br>{<br>  "msg_type": "interactive",<br>  "card": {<br>    "type": "template",<br>    "data": {<br>      "template_id": "AAqyBQVmUNxxx",<br>      "template_version_name": "1.0.0"<br>    }<br>  }<br>}<br>``` | Request body containing Feishu card ID and version information. The data structure is as shown, in actual use, you need to:<br>- Set the example values to actual values<br>  <br>- Depending on your system environment, compress or escape the JSON<br>  <br>- Customize variable values. Below is an example of variables added based on the data report card case:<br>```<br>{<br>  "type": "template",<br>  "data": {<br>    "template_id": "AAqi6xJ8rabcd",<br>    "template_version_name": "1.0.0",<br>    "template_variable": {<br>      "summary_ticket": "10",<br>      "summary_hours": "10",<br>      "summary_pending": "20%",<br>      "object_list_1": [<br>        {<br>          "name": "Wang Bing",<br>          "duration": "Less than 1 hour",<br>          "diff": "↓12%",<br>          "diff_color": "green"<br>        },<br>        {<br>          "name": "Wang Fang",<br>          "duration": "2 hours",<br>          "diff": "↑5%",<br>          "diff_color": "red"<br>        },<br>        {<br>          "name": "Zhang Min",<br>          "duration": "3 hours",<br>          "diff": "↓25%",<br>          "diff_color": "green"<br>        }<br>      ]<br>    }<br>  }<br>}<br>   <br>``` |
| ```<br>https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx<br>``` | Custom bot's Webhook address. This is an example value, and you need to replace it with the actual webhook address of your custom bot. |

Return to the group chat where the custom bot resides and check the received Feishu card. If the call fails, you can search for the returned error code and error message in the documentation to obtain troubleshooting suggestions.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/672c6fc3bfb7559435910e09196f21fe_IEpu0XyTLF.png?height=957&lazyload=true&maxWidth=500&width=1320)

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Ffeishu-cards%2Fquick-start%2Fsend-message-cards-with-custom-bot%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:Send Feishu cards with apps](https://open.feishu.cn/document/feishu-cards/quick-start/send-feishu-cards-with-app-bots) [Next:Streaming update card](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Explanation on binding apps or custom bots](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#35127616 "Explanation on binding apps or custom bots")

[Demonstration effect](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#ec987bb3 "Demonstration effect")

[Operational steps](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#59f4faa8 "Operational steps")

[Step One: Create a custom bot for the group](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#75fbd73d "Step One: Create a custom bot for the group")

[Step Two: Build and Publish a Card Template](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#cf152440 "Step Two: Build and Publish a Card Template")

[Step Three: Request the Group Custom Bot to Send a Feishu Card](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot#dbaa610e "Step Three: Request the Group Custom Bot to Send a Feishu Card")

Try It

Feedback

OnCall

Collapse

Expand