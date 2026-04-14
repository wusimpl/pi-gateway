---
url: "https://open.feishu.cn/document/server-docs/im-v1/message/reply"
title: "Reply message - Server API - Documentation - Feishu Open Platform"
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

[Message overview](https://open.feishu.cn/document/server-docs/im-v1/introduction)

[Message FAQ](https://open.feishu.cn/document/server-docs/im-v1/faq)

Message management

[Message management overview](https://open.feishu.cn/document/server-docs/im-v1/message/intro)

[Topic overview](https://open.feishu.cn/document/im-v1/message/thread-introduction)

Message content introduction

[Send message](https://open.feishu.cn/document/server-docs/im-v1/message/create)

[Reply message](https://open.feishu.cn/document/server-docs/im-v1/message/reply)

[Edit message](https://open.feishu.cn/document/server-docs/im-v1/message/update)

[Forward a message](https://open.feishu.cn/document/server-docs/im-v1/message/forward)

[Merge forward messages](https://open.feishu.cn/document/server-docs/im-v1/message/merge_forward)

[Forward a thread](https://open.feishu.cn/document/im-v1/message/forward-2)

[Recall message](https://open.feishu.cn/document/server-docs/im-v1/message/delete)

[Push follow-up](https://open.feishu.cn/document/im-v1/message/push_follow_up)

[Query the read status of a message as the sender](https://open.feishu.cn/document/server-docs/im-v1/message/read_users)

[Get chat history](https://open.feishu.cn/document/server-docs/im-v1/message/list)

[Obtain resource files in messages](https://open.feishu.cn/document/server-docs/im-v1/message/get-2)

[Obtain the content of the specified message](https://open.feishu.cn/document/server-docs/im-v1/message/get)

Events

Batch message

Images message

File message

Buzz message

Message reaction

Pin

Message card

URL preview

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Messaging](https://open.feishu.cn/document/server-docs/im-v1/introduction) [Message management](https://open.feishu.cn/document/server-docs/im-v1/message/intro)

Reply message

# Reply message

Copy Page

Last updated on 2026-04-10

The contents of this article

[Prerequisites](https://open.feishu.cn/document/server-docs/im-v1/message/reply#347504e0 "Prerequisites")

[Limitation of Use](https://open.feishu.cn/document/server-docs/im-v1/message/reply#100c2cab "Limitation of Use")

[Request](https://open.feishu.cn/document/server-docs/im-v1/message/reply#request "Request")

[Request header](https://open.feishu.cn/document/server-docs/im-v1/message/reply#requestHeader "Request header")

[Path parameters](https://open.feishu.cn/document/server-docs/im-v1/message/reply#pathParams "Path parameters")

[Request body](https://open.feishu.cn/document/server-docs/im-v1/message/reply#requestBody "Request body")

[Request example](https://open.feishu.cn/document/server-docs/im-v1/message/reply#requestExample "Request example")

[Response](https://open.feishu.cn/document/server-docs/im-v1/message/reply#response "Response")

[Response body](https://open.feishu.cn/document/server-docs/im-v1/message/reply#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/im-v1/message/reply#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/im-v1/message/reply#errorCode "Error code")

[230099 Sub-error code](https://open.feishu.cn/document/server-docs/im-v1/message/reply#e437da66 "230099 Sub-error code")

# Reply a message

Call this interface to reply to a specified message. The reply content supports multiple types such as text, rich text, card, group business card, personal business card, picture, video, file, etc.

Try It

## Prerequisites

- The application needs to enable [bot capability](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-enable-bot-ability).
- When replying to user messages (i.e. single chat messages), the user needs to be within the robot's [availability range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability).
- When replying to group messages, the robot needs to be in the group and have the right to speak.

## Limitation of Use

To avoid frequent message sending causing disturbance to users, the frequency limit for sending messages to the same user is 5 QPS, and the frequency limit for sending messages to the same group is 5 QPS shared by robots in the group.

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/im/v1/messages/:message\_id/reply |
| HTTP Method | POST |
| Rate Limit | [1000 per minute & 50 per second](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| Supported app types | Custom apps<br>Store apps |
| Required scopes <br>Enable any scope from the list | Read and send direct messages and group chat messages<br>Send messages as an app<br>Send messages V2<br>Scope of older version<br>1. To send messages as an **application** <br>   - you need to apply for one of the following three permissions: **Read and send direct messages and group chat messages** (im:message) **Send messages as an app** (im:message:send\_as\_bot) **Send messages V2 \[historical version\]** (im:message:send)<br>2. To send a message as a **user** <br>   - you need to apply for the following two permissions at the same time: **Read and send direct messages and group chat messages** (im:message), **Send message as user** (im:message.send\_as\_user) |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | When calling an API, the app needs to authenticate its identity through an access token. The data obtained with different types of access tokens may vary. Refer to [Choose and obtain access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM).<br>**Value format**: "Bearer `access_token`"<br>**Supported options are**:<br>tenant\_access\_token<br>Call the API on behalf of the app. The range of readable and writable data is determined by the app's own [data access range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions). Refer to [Get custom app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) or [Get store app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token). Example value: "Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>Call the API on behalf of the logged-in user. The range of readable and writable data is determined by the user's data access range. Refer to [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token). Example value: "Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Path parameters

| Parameter | Type | Description |
| --- | --- | --- |
| message\_id | string | The ID of the message to be replied. How to get the ID:<br>- After calling the [Send Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) interface, get it from the `message_id` parameter of the response result.<br>- Listen to the [Receive Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive) event. When the event is triggered, you can get the `message_id` of the message from the event body.<br>- Call the [Get Session History Messages](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list) interface and get it from the `message_id` parameter of the response result.<br>**Example value**: "om\_dc13264520392913993dd051dba21dcf" |

### Request body

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| content | string | Yes | Message content, a string serialized from a JSON structure. The value of this parameter corresponds to `msg_type`. For example, if the value of `msg_type` is `text`, this parameter needs to pass in text type content.<br>**Note:**<br>- JSON strings need to be escaped. For example, the line break `\n` is escaped as `\\n`.<br>- The maximum size of a text message request body cannot exceed 150 KB.<br>- The maximum size of a card message or rich text message request body cannot exceed 30 KB.<br>- If a card template (template\_id) is used to send a message, the actual size also includes the card data size corresponding to the template.<br>- If the message contains style tags, the actual message body length will be greater than the request body length you entered.<br>- For images, you need to [upload the image](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create) first, and then use the image's Key to send a message.<br>- Audio, video, and files need to be uploaded first, and then the file's key is used to send a message.<br>For different types of message content formats and usage restrictions, see [Sending Message Content](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/im-v1/message/create_json).<br>**Example value**: "`{\"text\":\"test content\"}`" |
| msg\_type | string | Yes | Message type.<br>**Optional values**:<br>- text<br>- post<br>- image<br>- file<br>- audio<br>- media<br>- sticker<br>- interactive<br>- share\_chat<br>- share\_user<br>For detailed information on different message types, see [Send message content](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/im-v1/message/create_json).<br>**Example value**: "text" |
| reply\_in\_thread | boolean | No | Whether to reply in thread form. If the value is true, the reply will be in thread form.<br>**Note**: If the message to be replied is already in thread form, the reply will be in thread form by default.<br>**Example value**: false<br>**Default value**: `false` |
| uuid | string | No | A custom unique string sequence used to request deduplication when replying to messages. If left blank, deduplication will not be performed. For requests with the same uuid, at most one message can be successfully replied to within 1 hour.<br>**Note**: You can customize the parameter value by referring to the example value. If this parameter is passed in when the reply content is different, you need to change the value of this parameter in each request.<br>**Example value**: "a0d69e20-1dd1-458b-k525-dfeca4015204"<br>**Data validation rules**:<br>- Maximum length: `50` characters |

### Request example

Below is a standard code example. To customize the request parameters based on your specific use case, go to the API Explorer, input the parameters, and you can copy the corresponding API code. Developer Guide

cURL

Go SDK

Python SDK

Java SDK

Node SDK

Php - Guzzle

C# - Restsharp

More

1

curl-i-X POST 'https://open.feishu.cn/open-apis/im/v1/messages/om\_dc13264520392913993dd051dba21dcf/reply' \

**Request Example**

```

curl --location --request POST 'https://open.feishu.cn/open-apis/im/v1/messages/om_xxxxxx/reply' \
--header 'Authorization: Bearer t-xxxxxx' \
--header 'Content-Type: application/json; charset=utf-8' \
--data-raw '{
    "content": "{\"text\":\"test content\"}",
    "msg_type": "text",
    "uuid": "a0d69e20-1dd1-458b-k525-dfeca4015204"
}'
```

## Response

### Response body

| Parameter<br>Show sublists | Type | Description |
| --- | --- | --- |
| code | int | Error codes, fail if not zero |
| msg | string | Error descriptions |
| data | message | - |

### Response body example

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

{

"code": 0,

"msg": "success",

"data": {

"message\_id": "om\_dc13264520392913993dd051dba21dcf",

"root\_id": "om\_40eb06e7b84dc71c03e009ad3c754195",

"parent\_id": "om\_d4be107c616aed9c1da8ed8068570a9f",

"thread\_id": "omt\_d4be107c616a",

"msg\_type": "interactive",

"create\_time": "1615380573411",

"update\_time": "1615380573411",

"deleted": false,

"updated": false,

"chat\_id": "oc\_5ad11d72b830411d72b836c20",

"sender": {

"id": "cli\_9f427eec54ae901b",

"id\_type": "app\_id",

"sender\_type": "app",

"tenant\_key": "736588c9260f175e"

        },

### Error code

| HTTP status code | Error code | Description | Troubleshooting suggestions |
| --- | --- | --- | --- |
| 400 | 230001 | Your request contains an invalid request parameter. | Parameter error: Check whether the input parameters are filled in correctly based on the error information actually returned by the interface and the interface documentation. |
| 400 | 230002 | The bot can not be outside the group. | The robot is not in the corresponding group. You need to add the application robot to the group that receives the message. For how to add a robot, refer to the [Robot User Guide](https://open.feishu.cn/document/ukTMukTMukTM/uATM04CMxQjLwEDN). |
| 400 | 230006 | Bot ability is not activated. | The application does not have bot capability enabled. For more information, see [How to enable bot capability](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-enable-bot-ability). |
| 400 | 230011 | The message is recalled. | The operation is not supported because the message has been recalled. |
| 400 | 230013 | Bot has NO availability to this user. | The target user (the message recipient specified by the user's user\_id/open\_id/union\_id/email) or the single chat user (the message recipient specified by the chat\_id of the group chat, but the group chat type corresponding to the chat\_id is single chat `p2p`) is not within the available range of the app bot, or is within the disabled range of the app.<br>**Notice**: If the target user has left the company, error 230013 will also be reported.<br>Solution:<br>1. Log in to [Developer Console](https://open.feishu.cn/app), find and enter the specified app details page.<br>2. In the left navigation bar, go to **App Versions** \> **Version Management & Release** page, and click **Create a version**.<br>3. On the **Version Details** page, find the **Availability** area and click **Edit**.<br>4. In the dialog box that pops up, configure the available range of the app and add the user to the available range.<br>5. Click **Save** at the bottom of the page and publish the app to make the configuration effective.<br>6. (Optional) If an error message still appears after completing the above configuration, you need to contact the enterprise administrator to log in to the [Admin](https://feishu.cn/admin), enter the specified app details page in **Workplace** \> **App Management**, and check whether the user is set as a **Blocked members** in **App availability**.<br>For specific operations, see [Configure app availability](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability). |
| 400 | 230015 | P2P chat can NOT be shared. | Private chat messages can't be shared. |
| 400 | 230017 | Bot is NOT the owner of the resource. | The bot isn’t the resource owner. |
| 400 | 230018 | These operations are NOT allowed at current group settings. | The current operation is prohibited by the group settings, for example, the group chat is set to only allow specific members to speak in this group. Please check the group settings or contact the group administrator to modify the group settings. |
| 400 | 230019 | The topic does NOT exist. | The current topic doesn't exist. |
| 400 | 230020 | This operation triggers the frequency limit. | The current action triggers the frequency limit. Please reduce the request frequency. |
| 400 | 230022 | The content of the message contains sensitive information. | The message contains sensitive information. Please check the message content. |
| 400 | 230025 | The length of the message content reaches its limit. | The message body length exceeds the limit. The maximum size of a text message cannot exceed 150 KB, and the maximum size of a card and rich text message cannot exceed 30 KB. Note:<br>- If a card template (template\_id) is used to send a message, the actual size also includes the card data size corresponding to the template.<br>- If the message contains a large number of style tags, the actual message body length will be greater than the incoming request body length. |
| 400 | 230027 | Lack of necessary permissions. | You are not authorized to perform this operation. Possible reasons are:<br>1. Lack of corresponding permissions, please troubleshoot according to the error message.<br>2. User authorization information was not checked.<br>3. If the bot needs to operate in external groups, you must first enable external sharing capabilities for it. For more details, refer to [Bot support for external groups and chats with external users](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/develop-robots/add-bot-to-external-group). |
| 400 | 230028 | The messages do NOT pass the audit. | The message DLP review failed. This error may be triggered when the message content contains plaintext phone numbers, plaintext email, etc. Please check the message content according to the error information returned by the interface. |
| 400 | 230035 | Send Message Permission deny. | Do not have permission to send messages. Please check whether the group has been muted, blocked by this user, or is controlled by the communication permission of the tenant dimension. |
| 400 | 230038 | Cross tenant p2p chat operate forbid. | Cross tenant P2P chat is not allowed to send messages through this interface. |
| 400 | 230049 | The message is being sent. | The message is being sent, please try again later. |
| 400 | 230050 | The message is invisible to the operator. | This operation cannot be performed on invisible messages. |
| 400 | 230054 | This operation is not supported for this message type. | This message type does not support this operation. For details, see [Add unsupported message type verification to the message and group APIs](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/breaking-change/unsupported-message-type-verification). |
| 400 | 230055 | The type of file upload does not match the type of message being sent. | The type selected when uploading the file does not match the type of the message being sent. For example, if you select MP4 as the file format when uploading the file, the message type needs to be video (media) when sending the message. |
| 400 | 230071 | The group to which the message belongs does not support reply in thread. | The group to which the message belongs does not support reply in thread. |
| 400 | 230072 | Aggregated messages do not support reply in thread. | Aggregated messages do not support reply in thread. |
| 400 | 230075 | Sending encrypted messages is not supported. | Sending messages to Secret Chat and Secret Shield Chat is not supported. |
| 400 | 230099 | Failed to create card content. | Failed to create the card content. Please refer to the specific error message returned by the current API. For card related errors, refer to the troubleshooting suggestion for [specific sub error code](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/reply#-f367d31) in the API document. |
| 400 | 230111 | Action unavailable as the message will self-destruct soon. | Replying to scheduled deleted messages is not supported. |
| 400 | 232009 | Your request specifies a chat which has already been dissolved. | The relevant group has been dissolved and the current operation cannot be performed. |

### 230099 Sub-error code

| Error code | Description | Troubleshooting suggestions |
| --- | --- | --- |
| 100290 | Failed to create card content, ext=ErrCode: 100290; ErrMsg: There is an invalid user resource(at/person) in your card; ErrorValue: %v | There is an invalid person ID in the card. Please check whether the user ID value used in the at person, person and other components in the card is correct, refer to [How to get different user IDs](https://open.feishu.cn/document/home/user-identity-introduction/open-id).<br>1. Open the [API Explorer](https://open.feishu.cn/api-explorer/cli_a278b89588fb100d?apiName=batch_get_id&from=op_doc_tab&project=contact&resource=user&version=v3), find " **Obtain user ID via email or mobile number**" under " **Contacts**" in the API directory on the left, and click the API to switch the current debugging API to "Obtain user ID via email or mobile number".<br>   <br>2. Click **Click to get token** in tenant\_access\_token in **View authentication tokens** on the left side of the API debugger.<br>   <br>3. Click the parameter list on the right and set the **user\_id\_type** parameter in **Query parameters** to the ID type you want to obtain.<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/c327a4f8f15354cfca63d70ab9aa683e_wQkdrowLpr.png?height=278&maxWidth=450&width=1383)<br>   <br>4. Switch to the **Request body** Tab, delete the sample ID in the request body, and change it to the mobile phone number or Email you want to query.<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9019f90bbfd6dc1f89b59592aa73a81f_mG5bEnwYyE.png?height=278&maxWidth=450&width=1383)<br>   <br>5. Click **Run** on the right. After the call is successful, you can get the queried User ID in the **Response body** below. The type of user ID returned in the response body is determined by the **user\_id\_type** parameter set in the query parameters.<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/2f81cf3b05bda6d4525289002e3c275f_vVnZOlTauC.png?height=278&maxWidth=450&width=1383) |
| 200380 | Failed to create card content, ext=ErrCode: 200380; ErrMsg: template does not exist, please confirm whether this template has been released; ErrorValue: templateID: %v | Card not found. Please make sure that the current template card has been saved and published, refer to [Preview and publish cards](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/preview-and-publish-cards#4c818412).<br>1. In the upper right corner of the target card editing page of the [Feishu Card Building Tool](https://open.feishu.cn/cardkit?from=open_docs_preview_and_publish), click **Save**, and then click **Publish**.<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/c01d7dd66fc1ec6dc67f3d5ffdbff8b7_mQfwFodPNm.png?height=278&maxWidth=450&width=1383)<br>   <br>2. In the **Publish card** dialog box, set the **Version number** and click **Publish**. The version number is generally set to `1.0.0` for the first release.<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/d734750f801e63b7b85c297d8dc4d9b3_jyV7unXcTE.png?height=278&maxWidth=350&width=1383)<br>   <br>3. After publishing the card, you can refer to [Send a card built by the builder](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card) to call the API to send the card.<br>   <br>   <br>   <br>   <br>   <br>   After the card is published, the API calls related to the online card will take effect immediately. You need to confirm whether this release will cause incompatible changes to the server code logic. To avoid this situation, when requesting to send a card, you can set the `template_version_name` parameter to a fixed card version number to avoid affecting the online business logic immediately after publishing the card on the tool. |
| 200381 | Failed to create card content, ext=ErrCode: 200381; ErrMsg: template is not visible to app, please confirm whether the app is allowed to use this template; ErrorValue: %v, templateID: %v | No card usage permission. Please check whether the current application or custom robot that sends the card has the permission to use the card. Refer to [Manage card template permissions](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/manage-card-template#4530c6a7).<br>1. On the card template editing page, click the application icon.<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/e9a5b4c5ca914b883c44edd4e5805b0a_zGGoWtNuBa.png?height=278&maxWidth=450&width=1383)<br>   <br>2. In the **Add custom bot or app** pop-up window, add an application or custom robot to enable the application or custom robot to have the permission to call the card template.<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a543c7220a2f15a95aa1d45d02981167_ptXuyEcgbD.png?height=278&maxWidth=450&width=1383) |
| 200621 | Failed to create card content, ext=ErrCode: 200621; ErrMsg: parse card json err, please check whether the card json is correct; ErrorValue: %v | The card JSON format is incorrect. Please refer to [Card JSON code structure](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure) to check the card content. |
| 200732 | Failed to create card content, ext=ErrCode: 200732; ErrMsg: the actual type of the variable is inconsistent with the specified type in the template. Please check the type of the variable; ErrorValue: %v, specifiedType: %v, actualType: %v | The card variable type is wrong. Please check whether the data type of the variable used when sending the template card is consistent with the variable data type specified when constructing the template. |
| 200550 | Failed to create card content, ext=ErrCode: 200550; ErrPath: ROOT -> elements -> %v; ErrMsg: chart spec is invalid; ErrorValue: %v | The chart component in the card is incorrectly configured. Please check whether the chart\_spec attribute in the chart component is configured correctly, refer to the [chart](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/chart#39ee4e65) component.<br>```<br>{<br>  "code": 230099,<br>  "msg": "Failed to create card content, ext=ErrCode: 200550; ErrPath: ROOT -> elements -> [2](tag: chart); ErrMsg: chart spec is invalid; ErrorValue: - (root): Must validate at least one schema (anyOf)\n- axes: Invalid type. Expected: array, given: null\n; ",<br>  "error": {<br>    "log_id": "202409131613579778D691D6E05516DE2D",<br>    "troubleshooter": "Troubleshooting suggestions： https://open.feishu.cn/search?from=openapi&log_id=202409131613579778D691D6E05516DE2D&code=230099&method_id=6921911482032898068"<br>  }<br>}<br>```<br>ErrPath Example description: ROOT -> elements -> \[2\](tag: chart)<br>![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/681343346e74ffe259928e72915fb0df_cG2saHQakQ.jpeg?height=278&maxWidth=450&width=1383) |
| 200861 | Failed to create card content, ext=ErrCode: 200861; ErrPath: ROOT -> body -> elements -> %v; ErrMsg: cards of schema V2 no longer support this capability; ErrorValue: unsupported tag %v | Check whether the card uses components that are supported by schema 1 but no longer supported by schema 2. Refer to the [deprecated component description document](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes#47cd6626). |
| 200570 | Failed to create card content, ext=ErrCode: 200570; ErrMsg: card contains invalid image keys; ErrorValue: image key %v | The image resource in the card is invalid. Please check whether the correct img\_key is used in the card. You can call the [upload image](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create) interface or upload the image in the build tool to obtain the image key. |
| 200914 | table rows is invalid | The table rows are invalid. Possible causes and troubleshooting solutions:<br>- The rows part of the table is not a valid JSON. Please check whether the card JSON is correct. For an example of the table JSON structure, refer to [Table JSON Structure](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/table#51c332ce).<br>- The cell data type is parsed incorrectly. For example, the cell type of a column is rich text, but the data in the column and row fails to be parsed as rich text. In this scenario, you can locate the problematic cell based on the returned cell row and column index (counting starts from 0), and then refer to the **data\_type field description** in the [table](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/table) to check whether the configuration is incorrect. |
| 200915 | table rows name is invalid | The table row name is not declared in the column. In the [Table Component](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/table) parameters of the card, the `rows` field needs to define each row's data content in the form of `"name": VALUE`, where `name` is the `name` in the `column` (a custom column label). You need to check the value of the `column` field to ensure that the `name` has been correctly passed. |

For other server-side error codes, refer to [Server-side error codes](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN).

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fim-v1%2Fmessage%2Freply%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[Is there a limit on the size of the message?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#a8e56502)

[Can the message that has been pushed be changed?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#-e9039a1)

[Can I send messages to external contacts through the interface?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#9618afc5)

[How to set the link opening method in the message (open in Feishu navigation bar, open in browser)?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#8497ccd2)

[Interface for obtaining resource files in messages. Can I obtain resource files in messages sent by others?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#07976d93)

Got other questions? Try asking AI Assistant

[Previous:Send message](https://open.feishu.cn/document/server-docs/im-v1/message/create) [Next:Edit message](https://open.feishu.cn/document/server-docs/im-v1/message/update)

Please log in first before exploring any API.

Log In

API Explorer

Sample Code

More

Request Header

Authorization

\*

Change to user\_access\_token

Bearer

tenant\_access\_token

Get Token

Path Parameters

message\_id

\*

Example value:"om\_dc13264520392913993dd051dba21dcf"

Request Body

Required parameters only

Restore example values

Format JSON

JSON

More

1

Results

![](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/31dafaca1b39955beda5239fff26f1eb.svg)

Click "RUN" to view results

Sample code below has been updated with parameters entered in the API Explorer.

cURL

Go SDK

Python SDK

Java SDK

Node SDK

More

1

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&apiName=reply&project=im&resource=message&version=v1)

The contents of this article

[Prerequisites](https://open.feishu.cn/document/server-docs/im-v1/message/reply#347504e0 "Prerequisites")

[Limitation of Use](https://open.feishu.cn/document/server-docs/im-v1/message/reply#100c2cab "Limitation of Use")

[Request](https://open.feishu.cn/document/server-docs/im-v1/message/reply#request "Request")

[Request header](https://open.feishu.cn/document/server-docs/im-v1/message/reply#requestHeader "Request header")

[Path parameters](https://open.feishu.cn/document/server-docs/im-v1/message/reply#pathParams "Path parameters")

[Request body](https://open.feishu.cn/document/server-docs/im-v1/message/reply#requestBody "Request body")

[Request example](https://open.feishu.cn/document/server-docs/im-v1/message/reply#requestExample "Request example")

[Response](https://open.feishu.cn/document/server-docs/im-v1/message/reply#response "Response")

[Response body](https://open.feishu.cn/document/server-docs/im-v1/message/reply#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/im-v1/message/reply#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/im-v1/message/reply#errorCode "Error code")

[230099 Sub-error code](https://open.feishu.cn/document/server-docs/im-v1/message/reply#e437da66 "230099 Sub-error code")

Try It

Feedback

OnCall

Collapse

Expand