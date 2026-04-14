---
url: "https://open.feishu.cn/document/client-docs/h5/development-guide/step-3"
title: "Step 3 (Optional): Config the app login-free process - Developer Guides - Documentation - Feishu Open Platform"
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

Step 3 (Optional): Config the app login-free process

# Step 3 (Optional): Config the app login-free process

Copy Page

Last updated on 2024-02-02

The contents of this article

[Free login process](https://open.feishu.cn/document/client-docs/h5/development-guide/step-3#e5c5b711 "Free login process")

# Step 3 (Optional): Config the app login-free process

After the custom app is created on the open platform, the corresponding web project can be developed locally. If you want the application to be accessed in the Feishu client, you can obtain the information of the logged-in user of the client to realize the non-login access to the application, you can configure the non-login process for the application. This article mainly introduces the workflow of applying Banban, and common problems related to implementing the [requestAccess](https://open.feishu.cn/document/uYjL24iN/uUzMuUzMuUzM/requestaccess) interface of Banyan.

**Sample code**

Regarding how to implement application free login in web projects, the open platform provides corresponding web app development tutorials. The development tutorial contains complete web app sample codes. You can view the code introduction and experience the development process, so as to help you understand and use the application free login capability. For details, see [Web App Free Login](https://open.feishu.cn/document/home/quickly-create-a-login-free-web-app/introduction-to-sample-code).

**Call OpenAPI as user**

If you need to obtain the user's user\_access\_token to call OpenAPI, which means executing/accessing resources as the user, then an additional incremental authorization link is involved. See [WebApp incremental authorization access guide](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/development-guide/webapp-incremental-authorization-access-guide)

## Free login process

If the user has already logged in to the Feishu client, they can directly access the web app in the client without having to log in again. During the actual development of the application, you can obtain the information of the logged-in user through the following flow chart.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3003cbb2dfdaf2a3e16bab530fda4c2e_uxkXcGj1XV.jpg?height=1276&lazyload=true&maxWidth=750&width=2294)

Flow Description:

- The App ID and App Secret in the above figure are the only input information required for the entire process.

App ID and App Secret parameters are located in [Developer Console](https://open.feishu.cn/app) on the details page of the app **Credentials & Basic Info**.

- In the figure above, the data exchange between the Feishu client and the access server and the authentication center is completed through HTTP requests.

Step numbers involving data exchange: 1~2, 4~5, 8~9, 10~11.

- In the above figure, the data exchange between the front end of the access side and the Feishu client (step number: 3~6) is completed through JSAPI calls.

- The data exchange between the front-end of the access party and the server of the access party in the above figure (step number: 7, 12) is completed within the framework of your web app.


[requestAccess](https://open.feishu.cn/document/uYjL24iN/uUzMuUzMuUzM/requestaccess) compatible sample code:

```

if (window.tt.requestAccess) {
  window.tt.requestAccess({
    // Web application App ID
    appID: "cli_xxx",
    scopeList: [],
    success: (res) => {
      //Return pre-authorization code after user authorization
      const { code } = res;
    },
    fail: (error) => {
      // It is necessary to additionally determine whether it is a failure caused by the client not supporting requestAccess based on errno.
      const { errno, errString } = error;
      if (errno === 103) {
        // The client version is too low and does not support requestAccess. You need to call requestAuthCode instead.
        callRequestAuthCode();
      } else {
        //User refuses authorization or authorization fails
      }
    },
  });
} else { // The JSSDK version is too low and does not support requestAccess. You need to call requestAuthCode instead.
  callRequestAuthCode();
}

function callRequestAuthCode() {
  window.tt.requestAuthCode({
    // Web application App ID
    appId: "cli_xxx",
    success: (res) => {
      // Return the pre-authorization code after the user does not need to log in
      const { code } = res;
    },
    fail: (error) => {
      // If the login fails, the corresponding errno and errString will be returned.
      const { errno, errString } = error;
    },
  });
}
```

The web app **front-end** needs the cooperation of the **server** to realize the free login process. It is recommended that you reasonably arrange for front-end and server-side developers to participate together.

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fclient-docs%2Fh5%2Fdevelopment-guide%2Fstep-3%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[Error codes for authenticate and calling JSAPI](https://open.feishu.cn/document/client-docs/h5/development-guide/step-2:-call-jsapi(optional)?lang=en-US#0a2408b1)

[How to resolve the authorization page 20029 error](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-resolve-the-authorization-page-20029-error?lang=en-US)

[How to solve the error 4401 when accessing the web app?](https://open.feishu.cn/document/faq/others?lang=en-US#4eef1b07)

[Configure redirect URLs](https://open.feishu.cn/document/uYjL24iN/uYjN3QjL2YzN04iN2cDN?lang=en-US)

[Errno](https://open.feishu.cn/document/client-docs/gadget/-web-app-api/errno?lang=en-US)

Got other questions? Try asking AI Assistant

[Previous:Step 2 (Optional): Authenticate and call JSAPI](https://open.feishu.cn/document/client-docs/h5/development-guide/step-2:-call-jsapi(optional)) [Next:Step 4: Publish and use the application](https://open.feishu.cn/document/client-docs/h5/development-guide/step-4)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Free login process](https://open.feishu.cn/document/client-docs/h5/development-guide/step-3#e5c5b711 "Free login process")

Try It

Feedback

OnCall

Collapse

Expand