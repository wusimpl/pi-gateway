---
url: "https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid"
title: "How to obtain Open ID - Developer Guides - Documentation - Feishu Open Platform"
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

[Root Certificate Related](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/root-certificate-related)

Trouble Shooting

[How to choose different types of tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to obtain Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[How to obtain Union ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-union-id)

[How to obtain User ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-user-id)

[How to obtain App ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-app-id)

[How to enable Bot Ability](https://open.feishu.cn/document/faq/trouble-shooting/how-to-enable-bot-ability)

[How to request the required scope for the application](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

[How to add permissions to App](https://open.feishu.cn/document/faq/trouble-shooting/how-to-add-permissions-to-app)

[How to get the tokens for various Docs type?](https://open.feishu.cn/document/faq/trouble-shooting/how-to-get-docs-tokens)

[How to resolve error 230001](https://open.feishu.cn/document/faq/trouble-shooting/how-to-resolve-error-230001)

[How to resolve error 99991679](https://open.feishu.cn/document/faq/trouble-shooting/how-to-resolve-error-99991679)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to fix 200732 or 200737 error](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-fix-200732-or-200737-error)

[How to get troubleshooting problem information](https://open.feishu.cn/document/faq/trouble-shooting/how-to-get-internal-user-id)

[How to resolve the authorization page 20029 error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-resolve-the-authorization-page-20029-error)

[How to add internal employees and external clients to group chat with one click](https://open.feishu.cn/document/faq/trouble-shooting/add-internal-employees-and-external-clients-to-group)

Client-side generic questions

Server-side generic questions

[Bot](https://open.feishu.cn/document/faq/bot)

[Other](https://open.feishu.cn/document/faq/others)

[Gadget](https://open.feishu.cn/document/faq/gadget)

[Devtools](https://open.feishu.cn/document/faq/devtools)

[Application management](https://open.feishu.cn/document/faq/application-management)

[Questions related to ISV](https://open.feishu.cn/document/faq/questions-related-to-isv)

Management Practice

Platform Notices

Deprecated Guides

[Developer Guides](https://open.feishu.cn/document/client-docs/intro) [FAQ](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/root-certificate-related) [Trouble Shooting](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

How to obtain Open ID

# How to obtain Open ID

Copy Page

Last updated on 2025-01-21

The contents of this article

[Method 1: Get through the API Explorer](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid#4c58243c "Method 1: Get through the API Explorer")

[Method 2: Call OpenAPI to get](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid#148e503f "Method 2: Call OpenAPI to get")

# How to obtain Open ID

Open ID is a user's unique identifier within an app. The same user will have different open\_ids across different apps. Each open\_id starts with the prefix `ou_`, such as `ou_c99c5f35d542efc7ee492afe11af19ef`. For more details, refer to [User identity overview](https://open.feishu.cn/document/home/user-identity-introduction/introduction).

## Method 1: Get through the API Explorer

The API Explorer provides the ability to obtain user IDs with one click. You can quickly obtain the IDs of specified users in the enterprise through visual operations.

The privatized environment does not support the API Explorer.

1. Log in to the [API Explorer](https://open.feishu.cn/api-explorer).

2. Find any interface with a query parameter of user\_id\_type or member\_id\_type.

For example, you can search and use the **[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)** interface in the API list on the left.

3. Go to the **Query Parameters** tab, set **user\_id\_type** to **open\_id**, and then click **Copy open\_id**.





![](<Base64-Image-Removed>)

4. Select the specified user in the organizational structure and click **Copy Member ID** to obtain the user's open\_id.





![](<Base64-Image-Removed>)


## Method 2: Call OpenAPI to get

Call the [Obtain user ID via email or mobile number](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id) interface to get the user's open\_id through the user's email or mobile phone number. The calling method is as follows:

1. The application needs to apply for the [Obtain user ID via email or mobile number (`contact:user.id:readonly`)](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-fix-the-99991672-error) permission.

2. When making a request, the query parameter **user\_id\_type** needs to be set to **open\_id**, and the request parameter is passed in the email address ( **emails**) or mobile phone number ( **mobiles**) of the specified user.

For other parameters, please refer to the detailed description of the API documentation and fill them in. I will not repeat them here.

3. Send a request and get the user's open\_id in the return result.

The value of the parameter **user\_id** returned by this interface matches the value of the query parameter **user\_id\_type**. For example, if the value of **user\_id\_type** is **open\_id**, the actual value of the parameter **user\_id** returned is the open\_id prefixed with the `ou_` character.


[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Ffaq%2Ftrouble-shooting%2Fhow-to-obtain-openid%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:How to choose different types of tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use) [Next:How to obtain Union ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-union-id)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Method 1: Get through the API Explorer](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid#4c58243c "Method 1: Get through the API Explorer")

[Method 2: Call OpenAPI to get](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid#148e503f "Method 2: Call OpenAPI to get")

Try It

Feedback

OnCall

Collapse

Expand