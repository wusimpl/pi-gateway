---
url: "https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server"
title: "Send callbacks to developer's server - Server API - Documentation - Feishu Open Platform"
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

Event subscriptions

Callback Subscription

[Callback overview](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/callback-overview)

Step 1: Choose a subscription mode

[Receive callbacks through websocket](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address)

[Send callbacks to developer's server](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server)

[Step 2: Add callback](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/add-callback)

[Step 3: Receive callbacks](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/receive-and-handle-callbacks)

[Event Card FAQ](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/event-card-faq)

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Events and callbacks](https://open.feishu.cn/document/server-docs/event-subscription-guide/overview) [Callback Subscription](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/callback-overview) [Step 1: Choose a subscription mode](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address)

Send callbacks to developer's server

# Send callbacks to developer's server

Copy Page

Last updated on 2025-06-04

The contents of this article

[Step 1 (Optional): Configure encryption strategy](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#62785239 "Step 1 (Optional): Configure encryption strategy")

[Encrypt Key](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#e0dff53d "Encrypt Key")

[Verification Token](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#c589dfb1 "Verification Token")

[Steps to configure](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#50139061 "Steps to configure")

[Step 2: Set up subscription method](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#14672524 "Step 2: Set up subscription method")

[Responding to POST verification requests](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#58f9b6c0 "Responding to POST verification requests")

[Example code](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#535a792a "Example code")

# Send callbacks to developer's server

You can set up your own server to receive callback subscription notifications from the Feishu Open Platform via the webhook method. This requires you to provide a public access address for your server. When the callback is triggered, the Feishu Open Platform will send an HTTP POST request to this public address, containing the callback data.

## Step 1 (Optional): Configure encryption strategy

You can configure an encryption strategy according to your enterprise's data security requirements. This strategy encrypts the transmission of callback data and verifies the request source to assess risks. The encryption strategy includes two parameters: **Encrypt Key** and **Verification Token**. **Encrypt Key** is used for encrypting the callback request transmission, while **Verification Token** verifies if the request is from the Feishu Open Platform.

### Encrypt Key

This parameter is used to encrypt the transmission of callback subscription requests.

- If you configure the Encrypt Key, the Feishu Open Platform will encrypt the callback data before pushing it to your request address. This encryption enhances data security, so it is recommended to configure this parameter.
- If you do not configure the Encrypt Key, the Feishu Open Platform will push the callback data directly in plaintext.

The following is an example of an encrypted callback. When your local server receives the encrypted callback body, it needs to decrypt it. For decryption steps, refer to [Receive callbacks](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/receive-and-handle-callbacks).

```

{
    "encrypt": "FIAfJPGRmFZWkaxPQ1XrJZVbv2JwdjfLk4jx0k/U1deAqYK3AXOZ5zcHt/cC4ZNTqYwWUW/EoL+b2hW/C4zoAQQ5CeMtbxX2zHjm+E4nX/Aww+FHUL6iuIMaeL2KLxqdtbHRC50vgC2YI7xohnb3KuCNBMUzLiPeNIpVdnYaeteCmSaESb+AZpJB9PExzTpRDzCRv+T6o5vlzaE8UgIneC1sYu85BnPBEMTSuj1ZZzfdQi7ZW992Z4dmJxn9e8FL2VArNm99f5Io3c2O4AcNsQENNKtfAAxVjCqc3mg5jF0123123flX1UOF5fzJ0sApG2OEn9wfyPDRBsApn9o+fceF9hNrYBGsdtZrZYyGG387CGOtKsuj8e2E8SNp+Pn4E9oYejOTR+ZNLNi+twxaXVlJhr6l+RXYwEiMGQE9zGFBD6h2dOhKh3W84p1GEYnSRIz1+9/Hp66arjC7RCrhuW5OjCj4QFEQJiwgL123123VsL03CxxFZarzxzffryrWUG3VkRdHRHbTsC34+ScoL5MTDU1QAWdqUC1T7xT0lCvQELaIhBTXAYrznJl6PlA83oqlMxpHh0gZBB1jFbfoUr7OQbBs1xqzpYK6Yjux6diwpQB1zlZErYJUfCqK7G/zI9yK/60b4HW0123+123123="
}
```

#### Applicable scenarios

- The application verifies that the received callback push is from the Feishu Open Platform and not forged.
- The application prevents replay attacks, where the callback pushed by the Feishu Open Platform to the application is intercepted by a third party and then sent multiple times to the application. This can pose data security risks and affect the performance of the application's server.

After configuring the Encrypt Key, your local server can perform signature verification based on the Encrypt Key to ensure that the received callbacks are legitimate and sent by the Feishu Open Platform. For detailed information on signature verification, refer to [Receive callbacks](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/receive-and-handle-callbacks).

#### Encryption principle

The content of the callback request is encrypted using AES-256-CBC. The encryption principle is as follows:

1. Use SHA256 to hash the `Encrypt Key` to get the key `key`.
2. Use PKCS7Padding to pad the callback content.
3. Generate a 16-byte random number as the initial vector `iv`.
4. Use `iv` and `key` to encrypt the callback content to get `encrypted_event`.
5. The ciphertext received by the application is `base64(iv+encrypted_event)`.

### Verification Token

The Verification Token is the application's verification identifier. The developer backend will automatically generate a Verification Token for the application. When the Feishu Open Platform pushes callback data, it will include the Verification Token value, which you can use to verify if the pushed callback belongs to the current application.

### Steps to configure

1. Log in to the [Developer Console](https://open.feishu.cn/app).

2. Click on the specific application in the application list to enter the application management details page.

3. In the left navigation bar, select **Development Configuration** \> **Events & Callbacks**.

4. In the **Encryption Strategy** tab, configure the Encrypt Key or Verification Token.





![](<Base64-Image-Removed>)





   - Click the **Reset** icon to reset the parameter value.





     ![](<Base64-Image-Removed>)

   - Click the **Edit** icon to edit the parameter value.





     ![](<Base64-Image-Removed>)

## Step 2: Set up subscription method

1. Log in to the [Developer Console](https://open.feishu.cn/app).

2. Enter the specified application and select **Development Configuration** \> **Events & Callbacks** in the left navigation bar on the application details page.

3. In the **Events & Callbacks** page, click the **Callback Configuration** tab.





![](<Base64-Image-Removed>)

4. Click the edit button on the right side of **Subscription mode**.





![](<Base64-Image-Removed>)

5. Select **Send callbacks to developer's server**, configure the **Request URL**, and click **Save**.





Each application can only configure one callback request address, which must be an IPv4 public address. All subsequent callbacks subscribed by the application will send callback data to this request address when triggered.









![](<Base64-Image-Removed>)





When you fill in the address and save it, the Feishu server will send an HTTP POST request to the request address to verify its validity. The request format is JSON, containing the `challenge` parameter. The developer's server needs to receive this HTTP POST request and return a response containing the `challenge` parameter within 1 second to successfully complete the verification. For details on how to handle and respond to the HTTP POST request, refer to the **Respond to POST validation request** section below.


### Responding to POST verification requests

Depending on whether the Feishu application has configured an Encrypt Key, there are two ways to respond to POST verification requests.

#### Method 1: Application without Encrypt Key

The verification request body sent by the Feishu server is as follows:

```

{
    "challenge": "1b6aef1a-401f-406a-be41-f48911eabcef",    // The value needs to be returned as it is in the response.
    "token": "xxxxxx",    // The application's Verification Token, which you can use to determine if the request is from the specified application of Feishu's open platform.
    "type": "url_verification"    // Fixed value, indicating this is a verification request.
}
```

The parameter descriptions are as follows:

| Parameter | Type | Description |
| --- | --- | --- |
| challenge | String | The field for verification, which needs to be returned as it is in the response body.<br>Example value: 1b6aef1a-401f-406a-be41-f48911eabcef |
| token | String | Application verification identifier **Verification Token**. You can use this token to verify whether the request belongs to the current application.<br>In the **Developer Console** \> **Application Details** \> **Development Configuration** \> **Events & Callbacks** \> **Encryption Strategy** module, you can view the application's **Verification Token**. |
| type | String | Callback type. The fixed value for verification callback type is `url_verification`, indicating this request is for verifying URL legitimacy. |

When the request address receives this POST verification request, you need to extract the `challenge` value and return the response data containing the `challenge` value within 1 second. The response body example is as follows:

```

{
    "challenge": "1b6aef1a-401f-406a-be41-f48911eabcef"
}
```

#### Method 2: Application with Encrypt Key

If the application has configured an Encrypt Key, encrypted requests will be pushed. The request body is as follows:

```

{
    "encrypt": "ds3da3sj32421lkkld4xxxx" // Encrypted string.
}
```

You need to decrypt the `encrypt` string on the server that receives the request and return the extracted `challenge` value within 1 second. The decryption method can be found in [Receiving callbacks](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/receive-and-handle-callbacks).

- The decrypted data structure is as follows:


```

{
      "challenge": "1b6aef1a-401f-406a-be41-f48911eabcef",    // The value that needs to be returned as it is in the response.
      "token": "xxxxxx",    // The application's Verification Token, which you can use to determine if the request is from the specified application of Feishu's open platform.
      "type": "url_verification"    // Fixed value, indicating this is a verification request.
}
```

- The response body example is as follows:


```

{
      "challenge": "1b6aef1a-401f-406a-be41-f48911eabcef"
}
```


### Example code

Feishu Open Platform provides sample code for subscribing to **Send callbacks to developer's server** for common programming languages. You can click the links below to view sample code for the corresponding language.

| **Programming language** | **Sample code** |
| --- | --- |
| Java | [Integrate Servlet container and send callbacks to developer servers](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/java-sdk-guide/handle-callback#3548bd4b) |
| Python | [Send callbacks to developer servers](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/handle-callbacks#335ab2f1) |
| Golang | [Send callbacks to developer servers](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/golang-sdk-guide/handle-callback#335ab2f1) |
| Node.js | [Send callbacks to developer servers](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/nodejs-sdk/handling-callbacks#335ab2f1) |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fevent-subscription-guide%2Fcallback-subscription%2Fstep-1-choose-a-subscription-mode%2Fsend-callbacks-to-developers-server%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to develop an echo bot](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-an-echo-bot/introduction)

[How to develop a card interactive bot](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

Got other questions? Try asking AI Assistant

[Previous:Receive callbacks through websocket](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address) [Next:Step 2: Add callback](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/add-callback)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Step 1 (Optional): Configure encryption strategy](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#62785239 "Step 1 (Optional): Configure encryption strategy")

[Encrypt Key](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#e0dff53d "Encrypt Key")

[Verification Token](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#c589dfb1 "Verification Token")

[Steps to configure](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#50139061 "Steps to configure")

[Step 2: Set up subscription method](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#14672524 "Step 2: Set up subscription method")

[Responding to POST verification requests](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#58f9b6c0 "Responding to POST verification requests")

[Example code](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server#535a792a "Example code")

Try It

Feedback

OnCall

Collapse

Expand