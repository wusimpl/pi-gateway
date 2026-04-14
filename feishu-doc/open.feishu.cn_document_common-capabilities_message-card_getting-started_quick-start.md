---
url: "https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start"
title: "Send message cards with app bots - Developer Guides - Documentation - Feishu Open Platform"
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

Web Components

Native integration

SSO&End User Consent

AppLink Protocol

Developer Tools

FAQ

Management Practice

Platform Notices

Deprecated Guides

Message Card

[Introduction of Message cards](https://open.feishu.cn/document/common-capabilities/message-card/introduction-of-message-cards)

Quick Start

[Send message cards with custom bot](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/send-message-cards-with-a-custom-bot)

[Send message cards with app bots](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start)

[Overview of message card builder](https://open.feishu.cn/document/common-capabilities/message-card/message-card-builder)

[Create message card](https://open.feishu.cn/document/deprecated-guide/message-card/create-message-card)

Build card content

Configuring card callbacks

[Preview and publish cards](https://open.feishu.cn/document/deprecated-guide/message-card/preview-and-save-cards)

Send message card

Component

[Message card design specifications](https://open.feishu.cn/document/tools-and-resources/design-specification/message-card-design-specifications)

Message Card Example

Web App

Gadgets

App Login

[Developer Guides](https://open.feishu.cn/document/client-docs/intro) [Deprecated Guides](https://open.feishu.cn/document/common-capabilities/message-card/introduction-of-message-cards) [Message Card](https://open.feishu.cn/document/common-capabilities/message-card/introduction-of-message-cards) [Quick Start](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/send-message-cards-with-a-custom-bot)

Send message cards with app bots

# Send message cards with app bots

Copy Page

Last updated on 2024-08-20

The contents of this article

[Example effect](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#770b912a "Example effect")

[Procedure](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#42b6d092 "Procedure")

[Step 1: Create a message card](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#793ceb08 "Step 1: Create a message card")

[Step 2: Create and configure a custom app](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#d06035ff "Step 2: Create and configure a custom app")

[Step 3: Add app bot to feishu group](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#81eb81ff "Step 3: Add app bot to feishu group")

[Step 4: Send message card by calling API in the API Explorer](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#1ffd3078 "Step 4: Send message card by calling API in the API Explorer")

# Send message cards with app bots

Feishu message cards allow you to send and receive messages in a structured (JSON data structure) format through bots or apps. This means you can use message cards to send activity notifications, business approvals, monitoring alerts, schedules, and other information. This article will explain how to send message card notifications using app bots.

This document refers to legacy message cards and is no longer maintained. To view the corresponding updated documentation, refer to [Send Feishu cards with app bots](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/send-feishu-cards-with-app-bots).

## Example effect

By following the instructions in this article, you can achieve the effect shown in the following image, which is to send an example message card using an app bot.

![](<Base64-Image-Removed>)

## Procedure

### Step 1: Create a message card

1. Open the [Message Card Builder](https://open.feishu.cn/tool/cardbuilder) page.

2. On the Card Builder page, click on the left-hand side **Best Practices** and select a card template, then click **Use**.

In this article, we select the **Multi-language message card** template.





![](<Base64-Image-Removed>)

3. (Optional) Edit the card content.


You can modify the card content by clicking on it in the **Preview in English** area. For information on constructing card content, refer to the [Card Design Specification](https://open.feishu.cn/document/ukTMukTMukTM/ugDOwYjL4gDM24CO4AjN) and [Card Structure Introduction](https://open.feishu.cn/document/ukTMukTMukTM/uEjNwUjLxYDM14SM2ATN).

In this example, we will not make any changes to the **Multi-language message card** card. We will use the template directly for demonstration purposes.

![](<Base64-Image-Removed>)

4. Click **Save and Publish** in the upper right corner of the page, then click **Publish** in the dialog box.





![](<Base64-Image-Removed>)

5. Click on **My Cards** on the left side of the page, find the saved card template, and click on it.

6. In the **Edit card** area, switch to the JSON data structure and copy the corresponding JSON data for the card.


You need to save the JSON data of the card locally. When sending a message to the app bot, you will need to pass the JSON data of the card.

![](<Base64-Image-Removed>)

### Step 2: Create and configure a custom app

1. Log in to the [Developer Console](https://open.feishu.cn/app).

2. On the **Custom Apps** tab, click **Create Custom App**.

3. Set the app name, description, and icon, then click **Create**.

For example, create a custom app named `App Demo`.





![](<Base64-Image-Removed>)

4. Go to the app details page, navigate to **Test Companies and Users** in the left navigation pane, and click **Create Test Company** in the upper right corner of the page.


To meet the frequent configuration changes during development and testing stages, Feishu Open Platform provides the [Test Companies and Users functionality](https://open.feishu.cn/document/home/introduction-to-custom-app-development/testing-enterprise-and-personnel-functions). During the development stage, it is recommended to use the test version of the app. The changes in permissions and configurations in this version will take effect directly without the need for administrator review, and client testing will be performed in the test tenant. After all development testing is completed, switch and manually synchronize to the official version of the app; only one review submission is required, which greatly speeds up development efficiency and reduces disruption to administrators.

5. Fill in the **Test Company Name**, **Phone number**, and **Verification code** in the **Create Test Company** dialog box, then click **Confirm Creation**.





![](<Base64-Image-Removed>)

6. After creating the test company, click **Install this app** in the **Actions** column.





![](<Base64-Image-Removed>)

7. After the test company is associated with the app, switch the company app to the test version at the top of the page.





![](<Base64-Image-Removed>)

8. Go to **Features** \> **Add features to your app** in the left navigation pane, find the **Bot** card, and click **Add**.





![](<Base64-Image-Removed>)

9. Go to **Development Configuration** \> **Permissions & Scopes** in the left navigation pane, and add the following permissions under **API Scopes**.


   - Obtain and update group information
   - Read and send messages in private and group chats

You can directly paste the following permission keys into the permission search box and click **Add in bulk**.

```

im:chat,im:message
```

![](<Base64-Image-Removed>)

### Step 3: Add app bot to feishu group

After creating a custom app with bot capabilities, you need to add the app bot to the corresponding Feishu group to send message cards through the bot.

1. Log in to Feishu client using a test user account (PC version).

For the test version app, only the **creator** and **test users** in the test company have access rights to the app. Therefore, you need to log in to Feishu client using a user account from the test company.

2. In the specified group, open **Settings** and click **Bots**.





![](<Base64-Image-Removed>)

3. Click **Add Bot**, then search for the bot by the app name.

In this example, the app name is `App Demo`.





![](<Base64-Image-Removed>)

4. Click on the `App Demo` bot card and click **Add**.





![](<Base64-Image-Removed>)


### Step 4: Send message card by calling API in the API Explorer

- The [API Explorer](https://open.feishu.cn/document/tools-and-resources/api-explorer-guide) tool provided by Feishu Open Platform is used to efficiently test platform API functions.
- For the test version app, only the **creator** and **test users** in the test company have access rights to the app. Therefore, you need to log in to the API Explorer using a user account from the test company.

1. Log in to the [API Explorer](https://open.feishu.cn/api-explorer) using a test user account.

2. Click **Switch App** in the upper left corner of the page and switch to `App Demo`, then click **Confirm**.





![](<Base64-Image-Removed>)

3. Call the [Obtain groups with the user or bot](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/list) API.

Complete the following settings and click **RUN**.

   - Request Header: Get the **tenant\_access\_token** from the **View authorization tokens** area on the left side of the page and set **Authorization** to **tenant\_access\_token**.





     ![](<Base64-Image-Removed>)

   - Query Parameters: Keep the default settings.
4. After a successful call, obtain the group ID (`chat_id`) from the response result.


- You can match the desired group ID with the `name` field (i.e., group name).
- Save the `chat_id` for use in the next step.

![](<Base64-Image-Removed>)

5. Call the [Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) API to send the message card to the app bot.

Complete the following settings and click **RUN**.


   - Request Header: Get the **tenant\_access\_token** from the **View authorization tokens** area on the left side of the page and set **Authorization** to **tenant\_access\_token**.

   - Query Parameters: Select **chat\_id** in the **receive\_id\_type** field.

   - Request Body: Click **Restore example values** in the upper right corner of the editor, then configure the following fields.


     - **receive\_id**: Insert the `chat_id` saved in the previous step.
     - **msg\_type**: Set to `interactive` to indicate that it's a message card.
     - **content**: Use the saved JSON data of the message card. Compress and escape the JSON data, then paste it into this field.
     - **uuid**: Not required for testing scenarios.

The example configuration is as follows:

```

{
  "receive_id": "oc_55af8f473edfbeb522266d6dc8903233",
  "msg_type": "interactive",
  "content": "{\"config\":{\"wide_screen_mode\":true},\"header\":{\"template\":\"blue\",\"title\":{\"i18n\":{\"en_us\":\"@ Developers: Introducing our new API Explorer\",\"ja_jp\":\"@ Developers: Introducing our new API Explorer\",\"zh_cn\":\"@飞书开发者 快来体验全新 API 调试台\"},\"tag\":\"plain_text\"}},\"i18n_elements\":{\"en_us\":[{\"tag\":\"div\",\"text\":{\"content\":\"Enjoy our updates to API Explorer to help you test, debug and use Feishu Open APIs more easily.\\n🌟 **Automatically obtain authentication credentials**: Bind your app to obtain the required token with one click, no additional request needed\\n🌟 **Built-in scope application**: The scopes required for API are clearly stated, apply easily within the tool\\n🌟**Sample code to help development**: We provide multi-language sample codes, copy and quickly reuse it into your codes\",\"tag\":\"lark_md\"}},{\"alt\":{\"content\":\"\",\"tag\":\"plain_text\"},\"img_key\":\"img_v2_03a6e55a-011a-444a-9f68-abbc009ec04g\",\"tag\":\"img\"},{\"actions\":[{\"tag\":\"button\",\"text\":{\"content\":\"Try Now\",\"tag\":\"plain_text\"},\"multi_url\":{\"url\":\"https://open.feishu.cn/api-explorer?from=810bot\",\"android_url\":\"lark://msgcard/unsupported_action\",\"ios_url\":\"lark://msgcard/unsupported_action\",\"pc_url\":\"https://open.feishu.cn/api-explorer?from=810bot\"},\"type\":\"primary\"},{\"tag\":\"button\",\"text\":{\"content\":\"Guides\",\"tag\":\"plain_text\"},\"multi_url\":{\"url\":\"https://open.feishu.cn/document/tools-and-resources/api-explorer-guide?lang=en-US\",\"android_url\":\"https://open.feishu.cn/document/tools-and-resources/api-explorer-guide?lang=en-US\",\"ios_url\":\"https://open.feishu.cn/document/tools-and-resources/api-explorer-guide?lang=en-US\",\"pc_url\":\"https://open.feishu.cn/document/tools-and-resources/api-explorer-guide?lang=en-US\"},\"type\":\"primary\"}],\"tag\":\"action\"}],\"zh_cn\":[{\"tag\":\"div\",\"text\":{\"content\":\"你还在为没有趁手的接口调试工具而烦恼吗？飞书 API 调试台全新上线，为你带来一站式的接口调试体验：\\n🌟 **自动获取鉴权凭证**：绑定你的应用一键获取 token，每次调试无需再额外发起请求获取\\n🌟 **内置应用权限申请**：调通接口所需权限一目了然，无需跳转后台，调试台内快捷申请\\n🌟 **示例代码助力开发**：提供多语言示例代码，点击复制即可快速复用至业务代码中\",\"tag\":\"lark_md\"}},{\"alt\":{\"content\":\"\",\"tag\":\"plain_text\"},\"img_key\":\"img_v2_bd87def3-f505-424d-a571-3f592a3b1b5g\",\"tag\":\"img\"},{\"tag\":\"hr\"},{\"actions\":[{\"tag\":\"button\",\"text\":{\"content\":\"开始调试\",\"tag\":\"plain_text\"},\"multi_url\":{\"url\":\"https://open.feishu.cn/api-explorer?from=810bot\",\"android_url\":\"lark://msgcard/unsupported_action\",\"ios_url\":\"lark://msgcard/unsupported_action\",\"pc_url\":\"https://open.feishu.cn/api-explorer?from=810bot\"},\"type\":\"primary\"},{\"tag\":\"button\",\"text\":{\"content\":\"使用手册\",\"tag\":\"plain_text\"},\"multi_url\":{\"url\":\"https://open.feishu.cn/document/tools-and-resources/api-explorer-guide\",\"android_url\":\"https://open.feishu.cn/document/tools-and-resources/api-explorer-guide\",\"ios_url\":\"https://open.feishu.cn/document/tools-and-resources/api-explorer-guide\",\"pc_url\":\"https://open.feishu.cn/document/tools-and-resources/api-explorer-guide\"},\"type\":\"primary\"}],\"tag\":\"action\"}]}}"
}
```

The example of a successful call is shown below:

![](<Base64-Image-Removed>)

6. Return to the Feishu client and view the message card content in the specified group.





![](<Base64-Image-Removed>)


[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fcommon-capabilities%2Fmessage-card%2Fgetting-started%2Fquick-start%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:Send message cards with custom bot](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/send-message-cards-with-a-custom-bot) [Next:Overview of message card builder](https://open.feishu.cn/document/common-capabilities/message-card/message-card-builder)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Example effect](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#770b912a "Example effect")

[Procedure](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#42b6d092 "Procedure")

[Step 1: Create a message card](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#793ceb08 "Step 1: Create a message card")

[Step 2: Create and configure a custom app](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#d06035ff "Step 2: Create and configure a custom app")

[Step 3: Add app bot to feishu group](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#81eb81ff "Step 3: Add app bot to feishu group")

[Step 4: Send message card by calling API in the API Explorer](https://open.feishu.cn/document/common-capabilities/message-card/getting-started/quick-start#1ffd3078 "Step 4: Send message card by calling API in the API Explorer")

Try It

Feedback

OnCall

Collapse

Expand