---
url: "https://open.feishu.cn/document/faq/server-side-generic-questions/app-permission"
title: "App permission - Developer Guides - Documentation - Feishu Open Platform"
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

Client-side generic questions

Server-side generic questions

[Questions on error codes](https://open.feishu.cn/document/faq/server-side-generic-questions/questions-on-error-codes)

[Authorization credential](https://open.feishu.cn/document/faq/server-side-generic-questions/authorization-credential)

[App permission](https://open.feishu.cn/document/faq/server-side-generic-questions/app-permission)

[Event subscriptions](https://open.feishu.cn/document/faq/server-side-generic-questions/event-subscriptions)

[Questions on open capabilities](https://open.feishu.cn/document/faq/server-side-generic-questions/questions-on-open-capabilities)

[Bot](https://open.feishu.cn/document/faq/bot)

[Other](https://open.feishu.cn/document/faq/others)

[Gadget](https://open.feishu.cn/document/faq/gadget)

[Devtools](https://open.feishu.cn/document/faq/devtools)

[Application management](https://open.feishu.cn/document/faq/application-management)

[Questions related to ISV](https://open.feishu.cn/document/faq/questions-related-to-isv)

Management Practice

Platform Notices

Deprecated Guides

[Developer Guides](https://open.feishu.cn/document/client-docs/intro) [FAQ](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/root-certificate-related) [Server-side generic questions](https://open.feishu.cn/document/faq/server-side-generic-questions/questions-on-error-codes)

App permission

# App permission

Copy Page

Last updated on 2024-07-30

# App permission

**1\. Where can I configure the app permissions?**

Answer: App permissions can be configured on the **Permissions & Scopes** page in the **Developer Console**.

**2\. Why didn't the permissions take effect after I updated them?**

Answer: Please confirm that the app is published and the new version is released, and that the corresponding app version within the company is the latest. Only when these two conditions are met at the same time, will the new permissions take effect.

**3\. I configured the Contacts related permissions for the app, but I still can't get the individual information?**

Answer: You don't have access to all departments and users if you have the Contacts related permissions. It also depends on the **Contacts permission scope** set in the Admin. The app can only obtain data within the **Contacts permission scope**.If you need to obtain the root department data, please set the **Contacts permission scope** to " _All employees_". For details, see below:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/e14ebbc6e83fa11fa4ff4367c17d3d68_eL80uO5641.png?height=1162&lazyload=true&width=1982)

**4\. I already have the permissions required to call the API, why can't I get the values of all returned parameters? For example, I already have the permission " _Obtain user's basic information_" required by the [Batch obtain user's information](https://open.feishu.cn/document/ukTMukTMukTM/uIzNz4iM3MjLyczM) API, but I still can't obtain user's mobile numbers and other information.**

Answer: Separate permission is required to obtain some sensitive information (such as user's mobile number, email, etc.). For details, please refer to [App permissions](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN).

**5\. What does "Automatically sync Contacts scope" mean?**

Answer: "Automatically sync contacts scope" means that when the app availability scope is changed the Contacts scope that the app can access will be updated accordingly. In addition, the permission scope of the Contacts doesn't include the root departments of the company.

**6\. The permission for "Obtaining user ID via email or mobile number" is enabled, but why can't I obtain the user\_id?**

Answer: Most of the cases here are because the "Obtain user's User ID" permission is not enabled. This permission is required as user\_id is sensitive information of a company. [Check how to obtain permission>>](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)

**7\. When calling the "Obtain group member list"/"Obtain group information" API, the "Read group messages" permission has been enabled. Why does it still return " _No permission_"?**

Answer: Please confirm that the user calling the group information is a group member, or the bot calling the group information is in the group, then related information can be obtained.

**8\. I'm the developer of a gadget. When previewing the gadget which has been configured to the console, why does it prompt me that the app is unavailable?**

Answer: The developer and the availability are configured separately. A gadget isn't necessarily available to its developers, and additional configuration is required.

**9\. What is the difference between the available scope and data permissions of an application?**

Answer:

- The available scope of an application is used to define which groups (organizations, user groups, individuals) can use the application. For example, if only member A is in the available scope of an application, then the application can only be used by member A. For more information, please refer to [Configure the available scope of an application](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability).
- The data permissions of an application are used to define the scope of business resource data that the application can access. For example, if only department A is in the scope of the address book permission (one of the data permissions) of an application, then when the application is used to query department information, only department A's information can be obtained. For more information, please refer to [Configure application data permissions](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions).

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Ffaq%2Fserver-side-generic-questions%2Fapp-permission%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:Authorization credential](https://open.feishu.cn/document/faq/server-side-generic-questions/authorization-credential) [Next:Event subscriptions](https://open.feishu.cn/document/faq/server-side-generic-questions/event-subscriptions)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

Try It

Feedback

OnCall

Collapse

Expand