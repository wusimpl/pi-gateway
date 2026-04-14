---
url: "https://open.feishu.cn/document/server-docs/application-scope/introduction"
title: "Apply for API permissions - Server API - Documentation - Feishu Open Platform"
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

Calling Process

[Process overview](https://open.feishu.cn/document/server-docs/api-call-guide/calling-process/overview)

[Obtain access tokens](https://open.feishu.cn/document/server-docs/api-call-guide/calling-process/get-access-token)

[Apply for API permissions](https://open.feishu.cn/document/server-docs/application-scope/introduction)

[Configure app data permissions](https://open.feishu.cn/document/api-call-guide/calling-process/configure-app-data-permissions)

[Set IP allowlist](https://open.feishu.cn/document/server-docs/api-call-guide/calling-process/set-ip-allowlist)

[Calling APIs](https://open.feishu.cn/document/server-docs/api-call-guide/calling-process/get-)

[API list](https://open.feishu.cn/document/server-docs/api-call-guide/server-api-list)

[Scope list](https://open.feishu.cn/document/server-docs/application-scope/scope-list)

[Rate limits](https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control)

[General parameters](https://open.feishu.cn/document/server-docs/api-call-guide/terminology)

[Common error codes](https://open.feishu.cn/document/server-docs/api-call-guide/generic-error-code)

Events and callbacks

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [API Call Guide](https://open.feishu.cn/document/server-docs/api-call-guide/calling-process/overview) [Calling Process](https://open.feishu.cn/document/server-docs/api-call-guide/calling-process/overview)

Apply for API permissions

# Apply for API permissions

Copy Page

Last updated on 2025-05-20

The contents of this article

[What are API scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#3041d06a "What are API scopes")

[Scope types](https://open.feishu.cn/document/server-docs/application-scope/introduction#1510c3de "Scope types")

[Scope levels](https://open.feishu.cn/document/server-docs/application-scope/introduction#d10def1e "Scope levels")

[Custom apps](https://open.feishu.cn/document/server-docs/application-scope/introduction#a3944d02 "Custom apps")

[Store apps](https://open.feishu.cn/document/server-docs/application-scope/introduction#41c1e142 "Store apps")

[Scope application principles](https://open.feishu.cn/document/server-docs/application-scope/introduction#1c4f6c9a "Scope application principles")

[Determine the required permissions](https://open.feishu.cn/document/server-docs/application-scope/introduction#322bb7ca "Determine the required permissions")

[Apply for API scopes for custom apps](https://open.feishu.cn/document/server-docs/application-scope/introduction#77afcec7 "Apply for API scopes for custom apps")

[Step 1: Apply for scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#f2c398c2 "Step 1: Apply for scopes")

[Step 2: Test and debug APIs with approval required permissions](https://open.feishu.cn/document/server-docs/application-scope/introduction#52633246 "Step 2: Test and debug APIs with approval required permissions")

[Step 3: Release the app](https://open.feishu.cn/document/server-docs/application-scope/introduction#33292f83 "Step 3: Release the app")

[Apply for API permission for store apps](https://open.feishu.cn/document/server-docs/application-scope/introduction#4b1f0dab "Apply for API permission for store apps")

[Step 1: Apply for permissions](https://open.feishu.cn/document/server-docs/application-scope/introduction#25dcb095 "Step 1: Apply for permissions")

[Step 2: Test and debug APIs with approval required permissions](https://open.feishu.cn/document/server-docs/application-scope/introduction#52633246-1 "Step 2: Test and debug APIs with approval required permissions")

[Step 3: Release the app](https://open.feishu.cn/document/server-docs/application-scope/introduction#33292f83-1 "Step 3: Release the app")

[Batch Import and Export API Scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#87c9686 "Batch Import and Export API Scopes")

[Batch import scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#1cb84b8d "Batch import scopes")

[Batch export scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#3703a4a8 "Batch export scopes")

# Apply for API permissions

Through this article, you can learn what API permissions are and how to apply for them.

## What are API scopes

During app development, you may need to call server APIs of the open platform services, or listen to subscribed events, which may involve reading or writing the app data of enterprises(tenants) and users. For security reasons, you need to apply for the corresponding permission scopes for your app. The permissions will take effect only after the app review is approved, and subsequently the app can invoke [server APIs](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/server-api-list) or listen to subscribed [event list](https://open.feishu.cn/document/ukTMukTMukTM/uYDNxYjL2QTM24iN0EjN/event-list). Simply put, the API permission scopes of the app determine which server-side open capabilities the app can use.

API scopes are granted on a per-app basis, and each app's API scopes are independent. If multiple apps need to call the same API, each app needs to add the corresponding API scope.

For a detailed list of all scopes supported by the open platform, see [API scope list](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/scope-list).

## Scope types

To enhance the security of API calls, the open platform has designed an access\_token mechanism. When calling an API to obtain application resources, it is necessary to authenticate the caller's identity through the access\_token, that is, to inform Feishu who is currently accessing what tenant's data, and in what capacity. For how to choose and obtain different types of access tokens, see [obtain access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM).

When calling an API, the permission sensitivity levels of calling with user identity (user\_access\_token) and app identity (tenant\_access\_token) are different, involving different levels of risk, so the corresponding review requirements are also different. Developers need to distinguish between user identity and app identity when applying for permissions.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/fd8cf5ed988300437ff8d2874eaa0837_gZNfBV9Dts.png?height=706&lazyload=true&maxWidth=600&width=1264)

To better support the principle of minimal permissions, the open platform divides API permissions into the following two types based on the different identity subjects to which the permissions belong:

| Permission type | Description | Scenario example |
| --- | --- | --- |
| Tenant token scopes | When calling APIs or subscribing to events with a [tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM#5aa2e490), application identity permission is required. | Suppose there is an application called "My bot", this application:<br>- When calling the [Create bitable](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create) API with a tenant\_access\_token, the owner of the bitable is "My bot".<br>- When [subscribing to cloud document change events](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/subscribe), if subscribed with a tenant\_access\_token, it can only subscribe to document changes for which "My bot" is the owner or administrator, and cannot perceive changes in other documents. |
| User token scopes | When calling APIs or subscribing to events with a [user\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM#5aa2e490), user identity permission is required. | Suppose there is an application called "My bot", this application:<br>- When calling the [Create bitable](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create) API with a user\_access\_token, and the token represents the user "Li Jian", the owner of the bitable is "Li Jian".<br>- When [subscribing to cloud document change events](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/subscribe), if subscribed with a user\_access\_token, and the token represents the user "Li Jian", it can only subscribe to document changes for which "Li Jian" is the owner or administrator, and cannot perceive changes in other documents. |

## Scope levels

There are different permission levels for different app types: store apps and custom apps. You can refer to the table below.

### Custom apps

| Approval required | Description | Review rules |
| --- | --- | --- |
| Automatic approval permissions | Tenant administrators can configure automatic approval permissions based on the actual data governance requirements of the tenant to reduce the review burden. For specific configuration methods, see [How do administrators set up custom app review rules](https://www.feishu.cn/hc/en-us/articles/374230668270-Self-built-app-review-rules). | No review is required, and it takes effect immediately after applying. |
| Review-required permissions | For permissions involving sensitive data, include them in the review-required permission list. | After applying, you need to create a version and submit it for review. The app administrator will review and approve it before it takes effect. |

### Store apps

| Permission level | Description | Review rules |
| --- | --- | --- |
| Non-senstive permissions | Data access is of low sensitivity. | For store apps, all permission operations need to go through the following review processes:<br>- App launch review: Reviewed by the Feishu open platform.<br>- Tenant installation review: Reviewed by the tenant administrator when updating the version. |
| Advanced permissions | Data access is of high sensitivity. Apps with no significant reason will not pass the review when applying for advanced permissions. | For store apps, all permission operations need to go through the following review processes:<br>- App launch review: Reviewed by the Feishu open platform.<br>- Tenant installation review: Reviewed by the tenant administrator when updating the version. |

### Scope application principles

The application for permissions should follow the principle of minimum privilege. Applying for permissions with a large scope may pose a threat to enterprise data security control. Avoid applying for a large number of interface permissions directly without sufficient reasons. Therefore, in the Feishu open system, permissions are strictly controlled through a review process.

- **Custom apps**: The permissions applied for by the app developer need to be reviewed by the tenant administrator. The tenant administrator can configure review rules and modes as needed. For more information, see [Custom app review guide](https://www.feishu.cn/hc/en-us/articles/374230668270).





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/84d0d014053876d0f56b95ae7b7c991f_pBVeGdaGsH.png?height=1436&lazyload=true&maxWidth=600&width=2882)

- **Store apps**: If you need to apply for permissions, you need to pass two review processes when [publishing apps](https://open.feishu.cn/document/uMzNwEjLzcDMx4yM3ATM/uYjMyUjL2IjM14iNyITN) on the Feishu Open Platform and [installing apps by tenants](https://www.feishu.cn/hc/zh-CN/articles/360049067744).

As shown in the figure below, when a store app is installed for the first time or updated, it will receive an authorization prompt. Tenant administrators can set management rules as needed, refer to [Review application acquisition and use application](https://www.feishu.cn/hc/zh-CN/articles/360025024813).


### Determine the required permissions

When developing an app, you can obtain the corresponding permission information based on the API or event development documents.

Taking the [Get user information](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/get) interface as an example, in the corresponding API document, you can obtain information about the permission requirements and field permission requirements of the interface.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3ee8fc8aa93f79ffd325092cb554a4d1_BftXX6DNRk.png?height=1276&lazyload=true&maxWidth=600&width=2876)

Among them:

- **Required scopes**: Represents the permission requirements of the entire interface, and there is an “OR” relationship between such permissions. That is, the application can call the interface after applying for any one of the permissions.

- **Required field scopes**: Displays the permission requirements for accessing field data in the response body.

For example, as shown in the figure below, if a self-built application wants to obtain the value of the `user_id` field in the response body, it must enable the **Obtain user ID** permission.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/415e06b85285796254389710c8b93049_Su0ztXHuDZ.png?height=576&lazyload=true&maxWidth=600&width=1756)


## Apply for API scopes for custom apps

### Step 1: Apply for scopes

1. Log in to the [Developer Console](https://open.feishu.cn/app), and enter the target custom app.

2. Enter **Development Configuration** \> **Permissions & Scopes** page, and click **Add permission scopes** button.

3. On the **API Scopes** tab, select the scopes required to call the API, and click **Add scopes**.


- Pay attention to apply for different scope types under different tabs.

- If you need to call related APIs using application identity credentials (tenant\_access\_token), you also need to configure the accessible data scope for the application. See [Configure App Data Permissions](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions).

- When calling with a user identity (user\_access\_token), the accessible data scope is consistent with the user's own readable and writable data scope. Separate data permission configuration is not required.


### Step 2: Test and debug APIs with approval required permissions

In the app testing and debugging phase, you can debug APIs that require review without waiting for review. You can do this by using the following methods.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a156c3142bc0ed368a8b6f71499cf730_n4HwlqL5U8.png?height=342&lazyload=true&maxWidth=600&width=1600)

#### Method 1: Test APIs using user\_access\_token

When applying for API permissions in bulk, if a permission supports calling APIs using the app developer's user\_access\_token without review, you can click **Confirm** to use the user\_access\_token to debug APIs without the need to publish the app.

Take [List roles](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-role/list) interface as an example. Before calling this API, you need to apply for **View, comment, edit and manage Bitable** or **View, comment, and export Bitable** permissions on the app’s **API Scopes** page.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/d05249918ef3f3b71d170bd1236d96b2_vVLYRho4oa.png?height=1536&lazyload=true&maxWidth=600&width=1784)

After applying, you don't need to publish the app and wait for the approval. Instead, you can directly use the user\_access\_token of the app developer to debug the API.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/26f1567a7a844d137c9566e80f058ce8_KfYcQtKDj8.png?height=784&lazyload=true&maxWidth=600&width=2254)

#### Method 2: Test APIs using test company function

Some APIs do not support authorization using user\_access\_token, and a small number of sensitive permissions in APIs that support user\_access\_token authorization cannot be debugged without review. You can find prompts when applying for such permissions (as shown in the figure below).

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/19a782ec46ba342fd78a8a83fcf05f38_JwutDJb4G0.png?height=488&lazyload=true&maxWidth=600&width=2204)

In this case, you can configure a test company for the app, switch to the test version . For specific operations, see [Test companies and users](https://open.feishu.cn/document/home/introduction-to-custom-app-development/testing-enterprise-and-personnel-functions). After switching, go to the **Development Configuration** \> **Permissions & Scopes** page, and apply for the specified permissions on the **API Scopes** tab. The permissions applied for are all automatically approved and take effect immediately after clicking **Confirm**.

If you apply for permissions related to **Contacts** or **Feishu HR (Enterprise)** APIs and need to call the corresponding APIs using the app identity (tenant\_access\_token), you also need to configure the corresponding data permissions for the app. For details, see [Configure data permissions](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions).

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/78a7f933b24d4dd1ebcfb52202d87624_Hdoh5RKvoy.png?height=706&lazyload=true&maxWidth=600&width=1794)

### Step 3: Release the app

1. After ensuring that the permissions applied for during the test phase meet business expectations, go to the **App Versions** \> **Version Management & Release** page, and click **Create a version**.

In the scenario of debugging APIs using a test company, the permissions enabled will not take effect in the official version of the app.Therefore, after completing the test integration, you need to switch to the release version of the app and reopen the same API scopes for the release app version. You can use the **batch import and export functionality** to migrate permission data between apps.

2. On the **Version Details** page, configure the following fields, and click **Save**.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/947492f5af79473afbdd7bf9861ef9e4_omBaVyjAXX.png?height=1298&lazyload=true&maxWidth=600&width=2198)





   - **App version**: Customize the app version number, for example: 1.0.0.

   - **Update notes**: Customize the update details of the current version.

   - **Features** and **Scope changes**: Check and confirm whether the added capabilities and permissions meet expectations.

   - **Availability**: The availability scope of the app. Click **Edit** to adjust the availability scope. For more information , see [Configure availability](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability).

   - **Reason for request**: It is used to help reviewers learn more about the app version.
3. In the pop-up dialog box, click **Submit for release**.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/58bcda0547f9755fed516b397825cad2_0oGr3Jaaqg.png?height=748&lazyload=true&maxWidth=600&width=2226)

4. Wait for the enterprise administrator to review the application.

All API permissions will take effect only after the app has passed the review.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b4c80cd8b6293a24da3eb03f8044468f_pUWSaDxNk3.png?height=562&lazyload=true&maxWidth=600&width=2316)


## Apply for API permission for store apps

### Step 1: Apply for permissions

1. Go to the specified store app in the [Developer Console](https://open.feishu.cn/app).

2. Go to **Development Configuration** \> **Permissions & Scopes** in the left navigation pane.

3. Apply for permissions in the **Manage scopes** area.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/34b97a2b34049c3826b3410551927460_9XyouCMpkW.png?height=866&lazyload=true&maxWidth=600&width=2874)

4. After the selection is complete, click **Add in bulk** in the upper right corner of the **Manage scopes** area.

5. In the **Reminder** dialog box, after confirming that the requested permission list is correct, click **Confirm**.


### Step 2: Test and debug APIs with approval required permissions

During the test and debugging phase of the app, you can generate and test the version through the test enterprise and personnel function of the store app. The permissions activated based on the test version can take effect without waiting for approval, so as to perform API debugging.

1. In the left navigation bar, select **Development Configuration** \> **Test Companies and Users**, and create a test enterprise.

For details, see [6\. Test store application](https://open.feishu.cn/document/uMzNwEjLzcDMx4yM3ATM/uUjMyUjL1IjM14SNyITN).

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/18d4e3eeb8078d90006e220a1f2faebf_ROX00scZ59.png?height=872&lazyload=true&maxWidth=600&width=2880)

2. In the left navigation bar, select **App Release** \> **Version Management & Release**, and then click **Create a version**.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/757dfeb3c4ce27ead08e11f91fbe25b3_Dr2TdQzSXr.png?height=786&lazyload=true&maxWidth=600&width=2880)

3. Configure the version number and version description in turn, and confirm the integrity of the permissions to be activated, and finally click **Save** at the bottom of the page.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/4a1430438cf5dec7b390e2aa5aac9fe9_hlmSPRaHxN.png?height=1152&lazyload=true&maxWidth=600&width=2422)

4. On the version details page, click **Set as test version**, and complete the setting of the test version in the pop-up dialog box.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b26851478479f37d01d7713ad96a2845_4Co17mjffj.png?height=910&lazyload=true&maxWidth=600&width=2300)





After the configuration is complete, the version status will change to **Testing**. At this time, the app has been installed in the corresponding test company, and the APIs can be called in the test company without review.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/7281550ef8ecc67ce136854c84b1648f_YVduMRP1AG.png?height=352&lazyload=true&maxWidth=600&width=2284)


### Step 3: Release the app

After ensuring that the permissions applied for during the test phase meet business expectations, go to the **App Release** \> **Version Management & Release** page to publish the app.

The official release of the store app is divided into targeted listing, full listing, and non-public listing. You need to choose the appropriate release option based on your actual business situation. For details, see [7\. Publish store apps](https://open.feishu.cn/document/uMzNwEjLzcDMx4yM3ATM/uYjMyUjL2IjM14iNyITN).

## Batch Import and Export API Scopes

To make it easier to migrate permission data across different apps, the open platform offers the ability to bulk import and export API permissions. You can use the **Batch import/export scopes** function on the **Permissions & Scopes** page in the [Developer Console](https://open.feishu.cn/app).

Batch import and export permissions support both custom apps and store apps.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/5be8c909f115c837e52a38d8bf2fdaef_4ZfpTXe9Yo.png?height=1052&lazyload=true&maxWidth=600&width=2270)

## Batch import scopes

The scopes imported will serve as the newly applied scopes for the current app, and will not affect any already applied or activated scopes.

You can enter the required scopes following the example format below, or you can restore the default values or format the input content into JSON with one click.

When entering scopes, the system will verify in real time whether the scope exists. If it does not exist or the app is not within the availability range of this scope, you will receive an error prompt: This scope does not exist or this app has no permission to apply, please re-enter.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/7a95bfbe8eaeb2469ef475e283f2fdc6_LyNrqmHbmI.png?height=1136&lazyload=true&maxWidth=600&width=1586)

After confirming that the import scope list is correct, click **Add**.

- Please check the permission scopes under different token types. The system will display the list of imported scopes separately according to the tenant and user token type. If the imported scopes do not involve a certain token type, the tab of that type will not be displayed.
- The system will automatically filter out the applied scopes to avoid duplicate applications.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/12c0f3559de656d9dca0dce58484df57_HppHF6yUpm.png?height=754&lazyload=true&maxWidth=600&width=1590)

After the application is activated, the system automatically redirects to the **Permissions & Scopes** page:

- If the imported scope belongs to the custom app's exemption review permission, or the imported app is a test version app, then the permission status becomes activated.
- If the imported scope is associated with data ranges, you need to [configure a data range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) for that scope.
- If the imported scope needs to be reviewed, that is, the scope status is **Waiting for version release**. After confirming that the scopes are configured correctly, you need to [submit a version release](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN#563a5dbd) application, which will only take effect after being approved by the enterprise administrator.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/2ce1dca503b56fbf02e11008b498fcd4_fN1XaIZzGl.png?height=374&lazyload=true&maxWidth=600&width=1162)

## Batch export scopes

In the **export** tab of permissions, you can copy all the permissions that the current application has applied for (including **to be published, under review, and opened** status) with one click for subsequent import of permission data to other applications.In the permission export tab, you can copy all applied permissions of the current app (including **awaiting release**, **under review**, and **already added** statuses) with one click, for subsequent import of scope data to other apps.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a14d97f1bfe2f4d11e8b12625b46ba89_90eMYLVxgn.png?height=1408&lazyload=true&maxWidth=500&width=1592)

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fapplication-scope%2Fintroduction%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[Custom app development process](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process)

[How to call a server API?](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/how-to-call-a-server-side-api/introduction)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

Got other questions? Try asking AI Assistant

[Previous:Obtain access tokens](https://open.feishu.cn/document/server-docs/api-call-guide/calling-process/get-access-token) [Next:Configure app data permissions](https://open.feishu.cn/document/api-call-guide/calling-process/configure-app-data-permissions)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[What are API scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#3041d06a "What are API scopes")

[Scope types](https://open.feishu.cn/document/server-docs/application-scope/introduction#1510c3de "Scope types")

[Scope levels](https://open.feishu.cn/document/server-docs/application-scope/introduction#d10def1e "Scope levels")

[Custom apps](https://open.feishu.cn/document/server-docs/application-scope/introduction#a3944d02 "Custom apps")

[Store apps](https://open.feishu.cn/document/server-docs/application-scope/introduction#41c1e142 "Store apps")

[Scope application principles](https://open.feishu.cn/document/server-docs/application-scope/introduction#1c4f6c9a "Scope application principles")

[Determine the required permissions](https://open.feishu.cn/document/server-docs/application-scope/introduction#322bb7ca "Determine the required permissions")

[Apply for API scopes for custom apps](https://open.feishu.cn/document/server-docs/application-scope/introduction#77afcec7 "Apply for API scopes for custom apps")

[Step 1: Apply for scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#f2c398c2 "Step 1: Apply for scopes")

[Step 2: Test and debug APIs with approval required permissions](https://open.feishu.cn/document/server-docs/application-scope/introduction#52633246 "Step 2: Test and debug APIs with approval required permissions")

[Step 3: Release the app](https://open.feishu.cn/document/server-docs/application-scope/introduction#33292f83 "Step 3: Release the app")

[Apply for API permission for store apps](https://open.feishu.cn/document/server-docs/application-scope/introduction#4b1f0dab "Apply for API permission for store apps")

[Step 1: Apply for permissions](https://open.feishu.cn/document/server-docs/application-scope/introduction#25dcb095 "Step 1: Apply for permissions")

[Step 2: Test and debug APIs with approval required permissions](https://open.feishu.cn/document/server-docs/application-scope/introduction#52633246-1 "Step 2: Test and debug APIs with approval required permissions")

[Step 3: Release the app](https://open.feishu.cn/document/server-docs/application-scope/introduction#33292f83-1 "Step 3: Release the app")

[Batch Import and Export API Scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#87c9686 "Batch Import and Export API Scopes")

[Batch import scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#1cb84b8d "Batch import scopes")

[Batch export scopes](https://open.feishu.cn/document/server-docs/application-scope/introduction#3703a4a8 "Batch export scopes")

Try It

Feedback

OnCall

Collapse

Expand