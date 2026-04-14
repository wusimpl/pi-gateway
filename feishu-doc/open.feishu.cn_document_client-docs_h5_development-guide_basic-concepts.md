---
url: "https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts"
title: "Overview - Developer Guides - Documentation - Feishu Open Platform"
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

[Web app overview](https://open.feishu.cn/document/client-docs/h5/introduction)

[Quick start](https://open.feishu.cn/document/develop-web-apps/quick-start)

Development Guide

[Overview](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts)

[Step 1: Create and config custom app](https://open.feishu.cn/document/client-docs/h5/development-guide/step1)

[Step 2 (Optional): Authenticate and call JSAPI](https://open.feishu.cn/document/client-docs/h5/development-guide/step-2:-call-jsapi(optional))

[Step 3 (Optional): Config the app login-free process](https://open.feishu.cn/document/client-docs/h5/development-guide/step-3)

[Step 4: Publish and use the application](https://open.feishu.cn/document/client-docs/h5/development-guide/step-4)

Open Ability

[Configure redirect URLs](https://open.feishu.cn/document/develop-web-apps/configure-redirect-urls)

[How to efficiently config the mobile homepage](https://open.feishu.cn/document/best-practices/how-to-configure-the-mobile-end-homepage)

[Development guide for using the Application Badge](https://open.feishu.cn/document/develop-web-apps/development-guide-for-using-the-application-badge)

Application Entry

FAQ

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

[Developer Guides](https://open.feishu.cn/document/client-docs/intro) [Develop Web Apps](https://open.feishu.cn/document/client-docs/h5/introduction) [Development Guide](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts)

Overview

# Overview

Copy Page

Last updated on 2024-11-14

The contents of this article

[Basic concept](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#14dca73f "Basic concept")

[Role description](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#44b9689f "Role description")

[Access party](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#-b86d6bd "Access party")

[Feishu](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#c47a2cb "Feishu")

[Operation navigation](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#-35239c8 "Operation navigation")

# Overview

In the web app development guide, the whole process of developing web app through the Feishu open platform will be introduced. Before formal development, it is recommended that you first understand application-related concepts and the operation process of the guide through this article.

## Basic concept

When developing web app, the basic concepts that may be involved are shown in the table below.

| Attribute | Type |
| --- | --- |
| Authentication | When you call [Open Platform Client API (JSAPI)](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/), Feishu needs to verify the JSAPI range that the web app has permission to access for data security. The process is called authentication. |
| Free login | Free login means that after a Feishu user enters the web app in the client, the web app can automatically obtain the current user identity and log in to the system without entering the Feishu user name and password. |
| JSSDK | The Feishu client JSSDK is a web development toolkit provided by Feishu to client web developers (access parties), and it can only be used in the Feishu client. |
| access\_token | access\_token is the access credential of the Feishu open platform with authorization, which represents the authorization obtained by the application from the platform, tenants (referring to companies or teams), and users. To call the Feishu server API, the web app needs to obtain the corresponding access token (access token) from the Feishu open platform. The open platform provides three different types of access credentials, namely app\_access\_token for application authorization, tenant\_access\_token for tenant authorization, and user\_access\_token for user authorization, which are used to verify the identity of the caller and ensure that the caller has the required permissions to perform operations. More instructions on credentials can be found at [Getting Access Credentials](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM). |
| jsapi\_ticket | `jsapi_ticket` represents the temporary credentials for web app to call Feishu JSAPI, and is important data for authentication verification.Authentication method: Compared with the signature generated by the server of the access party based on data such as `jsapi_ticket`, and the signature generated by the certification center based on data such as `jsapi_ticket`, if the two signatures are equal, the authentication is successful. |
| SignatureThe | signature is a piece of ciphertext used for JSSDK authority verification. In order to prevent data leakage, parameters such as `jsapi_ticket` and webpage URL will be spliced into a string `verifyStr`, and `verifyStr` will be encrypted with the sha1 data encryption algorithm, and the obtained ciphertext is the signature `signature`. |
| URL | The standard format of URL: `[transfer protocol Schema]://[domain name Domain]:[port number Port]/[path Path][file name]?[query query]#[fragment ID]`, Among them, `port number`, `[query]`, `[fragment ID]` are all optional items. As shown below:<br>![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/cf578eeb2aa68e259d740437c6d7b338_iE95BWPCTk.png?height=98&lazyload=true&width=836)<br>- `https` is the HTTPS secure transport protocol.<br>- `www.example.com` is the domain name, which indicates which web server is being requested, or the IP address can be used directly.<br>- `:443` is the port, usually ignored if the web server uses the standard port for the HTTP protocol (80 for HTTP, 443 for HTTPS) to grant access to its resources, otherwise it is mandatory.<br>- `/path/to/myfile.html` is the path to the resource on the web server.<br>- `?key1=value1&key2=value2` is an extra parameter provided to the web server.<br>- `#SomewhereInTheDocument` scrolls to this anchor position when opening the page. |

## Role description

A description of the roles involved in the process of developing a web app.

### Access party

That is, the developer of the web app, the following terminals or platforms are involved in the development process:

- Access side front end: It needs to access the part of the Feishu web app that is responsible for interacting with users, and is usually written in a language supported by the browser (such as JavaScript and HTML).
- Access server: It needs to access the part of the Feishu web app that is responsible for storing data resources, processing business logic, and responding to front-end requests.
- Developer background: For users who want to develop custom app for their own companies, or put applications on the shelves in the Feishu application directory, the Feishu open platform provides [Application creation and configuration background](https://open.feishu.cn/app/).

### Feishu

- Feishu Client: The client that hosts the web app on the Feishu side. It can support your web app to call mobile phone system functions and Feishu client functions (such as scanning, cloud documents, etc.), and supports performance optimization, so that your web app experience can be close to the native experience.
- Authentication Center: The Feishu side is responsible for authenticating the identity and permissions of web application servers.

## Operation navigation

The steps provided in this guide are as follows:

- [Step 1: Create and configure a custom app](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/development-guide/step1)
- [Step 2 (optional): Authenticate and call JSAPI](https://open.feishu.cn/document/uYjL24iN/uEzM4YjLxMDO24SMzgjN)
- [Step 3 (optional): Configure the application free login process](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/development-guide/step-3)
- [Step 4: Release and use of the application](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/development-guide/step-4)

Among them, steps 1 and 4 are necessary steps for developing web app. In the actual development process, you need to develop the front-end and back-end codes of the web app by yourself according to the actual business situation. This guide provides the following sample scenarios for your reference:

- If your web app front-end needs to call [H5 JSAPI](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/) to realize business functions, please refer to [Step 2 (optional): Authenticate and call JSAPI](https://open.feishu.cn/document/uYjL24iN/uEzM4YjLxMDO24SMzgjN) for configuration and development.
- If your web app needs to obtain the information of the logged-in user of the client, or identify the user's identity (obtain the user's unique identifier), and then realize the application exemption, please refer to [Step 3 (optional): Configure application exemption Process](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/development-guide/step-3).

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fclient-docs%2Fh5%2Fdevelopment-guide%2Fbasic-concepts%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[Error codes for authenticate and calling JSAPI](https://open.feishu.cn/document/client-docs/h5/development-guide/step-2:-call-jsapi(optional)?lang=en-US#0a2408b1)

[How to resolve the authorization page 20029 error](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-resolve-the-authorization-page-20029-error?lang=en-US)

[How to solve the error 4401 when accessing the web app?](https://open.feishu.cn/document/faq/others?lang=en-US#4eef1b07)

[Configure redirect URLs](https://open.feishu.cn/document/uYjL24iN/uYjN3QjL2YzN04iN2cDN?lang=en-US)

[Errno](https://open.feishu.cn/document/client-docs/gadget/-web-app-api/errno?lang=en-US)

Got other questions? Try asking AI Assistant

[Previous:Quick start](https://open.feishu.cn/document/develop-web-apps/quick-start) [Next:Step 1: Create and config custom app](https://open.feishu.cn/document/client-docs/h5/development-guide/step1)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Basic concept](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#14dca73f "Basic concept")

[Role description](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#44b9689f "Role description")

[Access party](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#-b86d6bd "Access party")

[Feishu](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#c47a2cb "Feishu")

[Operation navigation](https://open.feishu.cn/document/client-docs/h5/development-guide/basic-concepts#-35239c8 "Operation navigation")

Try It

Feedback

OnCall

Collapse

Expand