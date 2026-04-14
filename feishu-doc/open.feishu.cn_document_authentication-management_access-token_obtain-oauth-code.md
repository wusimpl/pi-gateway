---
url: "https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code"
title: "Get authorization code - Server API - Documentation - Feishu Open Platform"
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

Login state management

Get Access Tokens

[Get custom app tenant\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal)

[Get custom app app\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal)

[Get authorization code](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code)

[Get user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/get-user-access-token)

[Refresh user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/refresh-user-access-token)

[Refresh user\_access\_token (Bytedance only)](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/bytedance-only)

[Retrieve app\_ticket](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_ticket_resend)

[Store applications get app\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token)

[Store applications get tenant\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token)

[Get JSAPI Authorization Ticket](https://open.feishu.cn/document/authentication-management/access-token/authorization)

Event

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Authenticate and Authorize](https://open.feishu.cn/document/server-docs/authentication-management/login-state-management/usum) [Get Access Tokens](https://open.feishu.cn/document/server-docs/authentication-management/access-token/tenant_access_token_internal)

Get authorization code

# Get authorization code

Copy Page

Last updated on 2026-03-19

The contents of this article

[Notes](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#0ff01b6a "Notes")

[Request](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#7dbabeae "Request")

[Query Parameters](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#04f61163 "Query Parameters")

[Request Example](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#-889488 "Request Example")

[Response](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#aa567d02 "Response")

[Successful Response](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#3e0cbb4a "Successful Response")

[Failure Response](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#46550650 "Failure Response")

[Frequently Asked Questions](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#fe640317 "Frequently Asked Questions")

[Error 20027 During User Authorization](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#b2ee7e1 "Error 20027 During User Authorization")

[How to Obtain a user\_access\_token with Desired Permissions](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#bfbdce2a "How to Obtain a user_access_token with Desired Permissions")

[Description of redirect\_uri with #](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#5d267924 "Description of redirect_uri with #")

# Get authorization code

This API is used to initiate user authorization. After the user consents to the authorization, the application will receive an authorization code, referred to as `code`. Please note that the authorization code is valid for 5 minutes and can only be used once.

## Notes

- This interface is actually an authorization page, suitable for the authorization scenario of web applications. When user authorization is required, the application should redirect the user to this authorization page. After the user clicks authorize on the authorization page (when the web application is opened in the Feishu client, it can directly jump without confirmation), the browser will redirect to the address specified by `redirect_uri` and carry the `code` query parameter (i.e., authorization code).
- Developers can use the authorization code to obtain a `user_access_token` to call the OpenAPI (e.g. [Get User Information](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/user_info/get)). For detailed steps on obtaining a `user_access_token`, refer to [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token).
- By using this endpoint along with [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token) and [Get user information](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/user_info/get), the application can implement Feishu OAuth login.
- For a complete implementation of the user authorization workflow, refer to the [Web App End User Athorization Guide](https://open.feishu.cn/document/common-capabilities/sso/web-application-end-user-consent/guide).
- Note that when opening the authorization page, you need to declare the user authorization scopes required by the application by appending the `scope` query parameter. For example, the scope key for obtaining basic contact information is `contact:contact.base:readonly`.
- The permissions granted by the user to the application accumulate over time, and the most recently generated `user_access_token` will include all the permissions the user has granted in the past.
- When using the `user_access_token` to call a specific OpenAPI, ensure that this `user_access_token` possesses the [required permissions for the target OpenAPI](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN); otherwise, the call will fail.

## Request

| Basic |  |
| --- | --- |
| HTTP URL | https://accounts.feishu.cn/open-apis/authen/v1/authorize |
| HTTP Method | GET |
| API Rate Limit | 1000 times/minute, 50 times/second |
| Supported Application Types | Custom apps<br>Store apps |
| Permission Requirements | None |

### Query Parameters

> To ensure the correct construction and encoding of URLs, it is recommended to use relevant URL standard libraries for URL parsing and building, rather than manual concatenation.

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| client\_id | string | Yes | The App ID of the application, which can be found on the **Credentials and Basic Information** page in the developer console. For a detailed introduction to the App ID, please refer to [General Parameters](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/terminology).<br>**Example Value:**`cli_a5d611352af9d00b` |
| response\_type | string | Yes | The client informs the authorization server of the desired grant type. The value must be "code" for requesting an authorization code.<br>**示例值：**`code` |
| redirect\_uri | string | Yes | The application redirect address, to which the user will be redirected upon successful authorization. The address will include the `code` and, if provided, the `state` parameter.<br>Please note:<br>1. This address must be URL encoded;<br>   <br>2. Before calling this API, you need to configure the HTTP GET request API address that accepts OAuth callbacks as the application's redirect URL on the **Security Settings** page in the developer console. Multiple redirect URLs can be configured, and only those listed will pass the security verification of the open platform. For details, refer to [Configure redirect URL](https://open.feishu.cn/document/uYjL24iN/uYjN3QjL2YzN04iN2cDN).<br>   <br>**Example Value:**`https://example.com/api/oauth/callback` |
| scope | string | No | An incremental grant of permissions needed by the application.<br>**Format Requirement:** The `scope` parameter is a space-separated, case-sensitive string.<br>**Note**:<br>- Developers need to apply for the necessary `scope` for calling the Open API in the [Developer Console](https://open.larkoffice.com/app) based on the business scenario and manually concatenate the `scope` parameter. If the corresponding permissions are not applied for in the console, the user will encounter a 20027 error when using the application.<br>  <br>- Up to 50 `scope` permissions can be requested from the user at once. For details, see [API permission list](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/scope-list).<br>  <br>- If you need to obtain a `refresh_token` later, you must add the `offline_access` scope here (see [Refresh user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token) for details):<br>  <br>  <br>  <br>  <br>  <br>  Access authorized data offline<br>  <br>**Example Value:**`contact:contact bitable:app:readonly` |
| state | string | No | An additional string to maintain the state between request and callback. It will be returned as is in the callback upon completion of authorization. The application can use this string to determine context relations and prevent CSRF attacks. Ensure that the `state` parameter is consistent before and after.<br>**Example Value:**`RANDOMSTRING` |
| code\_challenge | string | No | Used to enhance the security of the authorization code through the PKCE (Proof Key for Code Exchange) flow.<br>**Example Value:**`E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM`<br>For detailed information on PKCE, please refer to [RFC-7636 - Proof Key for Code Exchange by OAuth Public Clients](https://datatracker.ietf.org/doc/html/rfc7636). |
| code\_challenge\_method | string | No | The method used to generate the `code_challenge`.<br>**Optional Values**:<br>1. **`S256`** (Recommended):<br>   <br>   The SHA-256 hash algorithm is used to calculate the hash of the `code_verifier`, and the result is Base64URL encoded to generate the `code_challenge`.<br>2. **`plain`** (Default Value):<br>   <br>   Directly use `code_verifier` as `code_challenge` without additional processing.<br>The above `code_verifier` refers to the randomly generated string created locally before initiating the authorization. |
| prompt | string | No | Indicates the type of user interaction that is required.<br>**Optional Values**:<br>- **`consent`**: `prompt=consent` triggers the OAuth authorization page, asking the user to grant permissions to the app.<br>**Example Value:**`consent` |

### Request Example

> Note: This is only a sample request URL. Please replace the query parameters with actual values as described earlier.

```

https://accounts.feishu.cn/open-apis/authen/v1/authorize?client_id=cli_a5d611352af9d00b&response_type=code&redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Foauth%2Fcallback&scope=bitable:app:readonly%20contact:contact&prompt=consent&state=RANDOMSTRING
```

## Response

### Successful Response

Once the user consents to authorization, the browser will redirect to the specified `redirect_uri` address provided at the initiation of the authorization, accompanied by the `code` and `state` parameters.

| Name | Description |
| --- | --- |
| code | Authorization code, used to obtain the user\_access\_token.<br>**Character Set:** \[A-Z\] / \[a-z\] / \[0-9\] / "-" / "\_"<br>**Length:** Developers should reserve at least 64 characters<br>**Example Value:**`2Wd5g337vo5BZXUz-3W5KECsWUmIzJ_FJ1eFD59fD1AJIibIZljTu3OLK-HP_UI1` |
| state | The original value of the `state` parameter passed in when opening the authorization page. If not provided, it will not return here. |

Example:

```

https://example.com/api/oauth/callback?code=2Wd5g337vo5BZXUz-3W5KECsWUmIzJ_FJ1eFD59fD1AJIibIZljTu3OLK-HP_UI1&state=RANDOMSTRING
```

### Failure Response

When a user denies authorization, the browser will redirect to the `redirect_uri` given during the initial authorization request, along with the `error` and `state` query parameters. The current fixed value for the `error` parameter is `access_denied`. Be sure to handle scenarios where authorization is denied appropriately.

| Name | Description |
| --- | --- |
| error | Error message, currently fixed as `access_denied` |
| state | The original value of the `state` parameter passed during the opening of the authorization page. If not provided initially, it will not be returned here. |

Example:

```

https://example.com/api/oauth/callback?error=access_denied&state=RANDOMSTRING
```

## Frequently Asked Questions

### Error 20027 During User Authorization

**Issue:** Users encounter error 20027 when authorizing an application.

**Cause:** The issue arises when the concatenated scope parameter on the authorization page includes permissions that the current application has not applied.

**Solution:**

1. Confirm scopes that the user needs to authorize.
2. Go to the [Developer Console](https://open.feishu.cn/app), and apply the corresponding permissions on the **Development Configuration** \> **Permission Management** \> **API Permissions** page for the relevant application. For detailed steps, refer to [Request API Permissions](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN).
3. Call the API with scopes that the application has applied.

### How to Obtain a user\_access\_token with Desired Permissions

When calling an API, if the `user_access_token` lacks the required permissions, the following error will be returned:

```

{
  "code": 99991679,
  "error": {
    "log_id": "202407260711088FB107A76E0100002087",
    "permission_violations": [\
      {\
        "subject": "task:task:read",\
        "type": "action_privilege_required"\
      },\
      {\
        "subject": "task:task:write",\
        "type": "action_privilege_required"\
      }\
    ]
  },
  "msg": "Unauthorized. You do not have permission to perform the requested operation on the resource. Please request user re-authorization and try again. required one of these privileges: [task:task:read, task:task:write]"
}
```

To prevent API call failures due to insufficient `user_access_token` permissions, developers can request users to grant the necessary permissions using the `scope` query parameter. There are two methods to achieve this:

1. Concatenate all the necessary `scope` values for user authorization at once, eliminating the need for repeated authorization if no new permissions are required. Note that there is a limit of 50 `scope` values per concatenation.
2. Alternatively, based on the error code returned by the API call and the `permission_violations` field, identify the additional permissions required for the current operation. Then, regenerate the authorization link to prompt the user for supplementary authorization, and use the newly generated `user_access_token` to continue calling the API.

Developers are advised to follow the principle of least privilege, requesting only the necessary permissions from users.

### Description of redirect\_uri with \#

According to the standard [RFC 3986 - Uniform Resource Identifier (URI): Generic Syntax](https://datatracker.ietf.org/doc/html/rfc3986#section-3), the content following a `#` in a URI is referred to as the fragment, which is positioned at the end of the URI. If the business authorization request parameter `redirect_uri` is concatenated with a `#`, the redirection after authorization will append the `#` and its fragment content to the end of the URI. Special attention is required when parsing to retrieve the `code`.

Example of `redirect_uri`:

```

https://example.com/api/oauth/callback/#/login
```

Request example:

```

GET https://accounts.feishu.cn/open-apis/authen/v1/authorize?client_id=cli_a5d611352af9d00b&redirect_uri=https%3A%2F%2Fexample.com%2Fapi%2Foauth%2Fcallback%2F%23%2Flogin%0A&scope=bitable:app:readonly%20contact:contact&state=RANDOMSTRING
```

Example of the values in the browser address bar after the callback:

```

https://example.com/api/oauth/callback?code=2Wd5g337vo5BZXUz-3W5KECsWUmIzJ_FJ1eFD59fD1AJIibIZljTu3OLK-HP_UI1&state=RANDOMSTRING#/login
```

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fauthentication-management%2Faccess-token%2Fobtain-oauth-code%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

[How to obtain Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[How to request the required scopes for the application](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

Got other questions? Try asking AI Assistant

[Previous:Get custom app app\_access\_token](https://open.feishu.cn/document/server-docs/authentication-management/access-token/app_access_token_internal) [Next:Get user\_access\_token](https://open.feishu.cn/document/authentication-management/access-token/get-user-access-token)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Notes](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#0ff01b6a "Notes")

[Request](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#7dbabeae "Request")

[Query Parameters](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#04f61163 "Query Parameters")

[Request Example](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#-889488 "Request Example")

[Response](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#aa567d02 "Response")

[Successful Response](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#3e0cbb4a "Successful Response")

[Failure Response](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#46550650 "Failure Response")

[Frequently Asked Questions](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#fe640317 "Frequently Asked Questions")

[Error 20027 During User Authorization](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#b2ee7e1 "Error 20027 During User Authorization")

[How to Obtain a user\_access\_token with Desired Permissions](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#bfbdce2a "How to Obtain a user_access_token with Desired Permissions")

[Description of redirect\_uri with #](https://open.feishu.cn/document/authentication-management/access-token/obtain-oauth-code#5d267924 "Description of redirect_uri with #")

Try It

Feedback

OnCall

Collapse

Expand