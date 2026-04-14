---
url: "https://open.feishu.cn/document/historic-version/authen/create-4"
title: "Refresh user_access_token - Server API - Documentation - Feishu Open Platform"
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

Tasks

authen

[Get user\_access\_token](https://open.feishu.cn/document/historic-version/authen/create-3)

[Refresh user\_access\_token](https://open.feishu.cn/document/historic-version/authen/create-4)

[Get user\_access\_token (Bytedance only)](https://open.feishu.cn/document/historic-version/authen/get-user_access_token-bytedance)

[Refresh user\_access\_token (Bytedance only)](https://open.feishu.cn/document/historic-version/authen/refresh-user_access_token-bytedance)

[Obtain code](https://open.feishu.cn/document/server-docs/authentication-management/login-state-management/obtain-code)

[Obtain user\_access\_token (v1)](https://open.feishu.cn/document/server-docs/authentication-management/access-token/create-2)

[Obtain user\_access\_token(Mini Program)](https://open.feishu.cn/document/client-docs/gadget/-web-app-api/open-ability/login/code2session)

[Refresh user\_access\_token (v1)](https://open.feishu.cn/document/server-docs/authentication-management/access-token/create)

[Obtain user\_access\_token (v1, ByteDance only)](https://open.feishu.cn/document/historic-version/authen/obtain-user_access_token-bytedance)

[Refresh user\_access\_token (v1, ByteDance only)](https://open.feishu.cn/document/historic-version/authen/refresh-user_access_token-bytedance-2)

Lingo

App Information

Approval

Contact

Docs

Hire

Feishu People

Rooms

[Convert ID](https://open.feishu.cn/document/historic-version/id_convert)

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Deprecated Version (Not Recommended)](https://open.feishu.cn/document/server-docs/task-v1/overview) [authen](https://open.feishu.cn/document/historic-version/authen/create-3)

Refresh user\_access\_token

# Refresh user\_access\_token

Copy Page

Last updated on 2025-06-26

The contents of this article

[Request](https://open.feishu.cn/document/historic-version/authen/create-4#request "Request")

[Request header](https://open.feishu.cn/document/historic-version/authen/create-4#requestHeader "Request header")

[Request body](https://open.feishu.cn/document/historic-version/authen/create-4#requestBody "Request body")

[Request example](https://open.feishu.cn/document/historic-version/authen/create-4#requestExample "Request example")

[Response](https://open.feishu.cn/document/historic-version/authen/create-4#response "Response")

[Response body](https://open.feishu.cn/document/historic-version/authen/create-4#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/historic-version/authen/create-4#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/historic-version/authen/create-4#errorCode "Error code")

# Refresh user\_access\_token

This API is now deprecated. Its use is not recommended. Please use the latest version: [Refresh user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token).

The maximum valid period of user\_access\_token is about 2 hours. When the user\_access\_token expires, you can call this interface to get a new user\_access\_token.

Try It

After calling this interface to refresh user\_access\_token, please update your locally saved user\_access\_token and the refresh\_token parameter value used to refresh the token. Do not continue to use the old value to refresh repeatedly, otherwise the interface call may fail due to token expiration.

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/authen/v1/oidc/refresh\_access\_token |
| HTTP Method | POST |
| Rate Limit | [1000 per minute & 50 per second](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| Supported app types | Custom apps<br>Store apps |
| Required scopes | None |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | app\_access\_token<br>The short-term token for app identity. The Open Platform identifies the caller's app identity based on app\_access\_token. Refer to [Get custom app's app\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/app_access_token_internal) or [Get store app's app\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/app_access_token).<br>**Value format**: "Bearer `access_token`"<br>**Example value**: "Bearer a-32bd8551db2f081cbfd26293f27516390b9f1234" |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

### Request body

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| grant\_type | string | Yes | Authorization type, **fixed value**:<br>**Example value**: "refresh\_token" |
| refresh\_token | string | Yes | Refresh and fetch the user\_access\_token interface returns refresh\_token, **For each request, please pay attention to using the latest acquired refresh\_token**<br>**Example value**: "ur-h4\_5nUXdJ4O8rqfGe.YJCwM13Gjc557xUG20hkk00f7K" |

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

curl-i-X POST 'https://open.feishu.cn/open-apis/authen/v1/oidc/refresh\_access\_token' \

## Response

### Response body

| Parameter<br>Show sublists | Type | Description |
| --- | --- | --- |
| code | int | Error codes, fail if not zero |
| msg | string | Error descriptions |
| data | token\_info | - |

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

{

"code": 0,

"msg": "success",

"data": {

"access\_token": "u-5Dak9ZAxJ9tFUn8MaTD\_BFM51FNdg5xzO0y010000HWb",

"refresh\_token": "ur-6EyFQZyplb9URrOx5NtT\_HM53zrJg59HXwy040400G.e",

"token\_type": "Bearer",

"expires\_in": 7199,

"refresh\_expires\_in": 2591999,

"scope": "auth:user.id:read bitable:app"

    }

}

### Error code

| HTTP status code | Error code | Description | Troubleshooting suggestions |
| --- | --- | --- | --- |
| 200 | 20001 | Invalid request. Please check request param | Please check the request parameters |
| 200 | 20002 | The app\_id or app\_secret passed is incorrect. Please check the value | Check app\_id and key are correct |
| 200 | 20007 | Failed to generate a user access token. Please try again | Please check if the parameter is valid and try again |
| 200 | 20008 | User not exist | User does not exist, change to a valid account |
| 200 | 20013 | The tenant access token passed is invalid. Please check the value | Check if the tenant\_access\_token is valid |
| 200 | 20014 | The app access token passed is invalid. Please check the value | Check if the app\_access\_token is valid |
| 200 | 20021 | User resigned | User leaves, please use a valid account |
| 200 | 20022 | User frozen | User frozen, please use a valid account |
| 200 | 20023 | User not registered | User is not registered, please use a valid account |
| 200 | 20024 | App id in user\_access\_token or refresh\_token diff with app id in app\_access\_token or tenant\_access\_token. Please keep the app id consistent | Please check whether the app that generates two tokens is the same |
| 200 | 20026 | The refresh token passed is invalid. Please check the value | Invalid refresh\_token, please check if it has expired or has been consumed |
| 200 | 20028 | Invalid app id | Invalid app\_id, please check parameters |
| 200 | 20029 | Invalid redirect uri | redirect\_uri is invalid. Troubleshooting:<br>1. Make sure the value of Authorization is correct. For example, you actually developed app A, but used the app\_access\_token of app B when calling the API.<br>   <br>2. Make sure that the callback address redirect\_uri parameter set when [obtaining the login authorization code](https://open.feishu.cn/document/common-capabilities/sso/api/obtain-oauth-code) has been configured in the Developer Console > Application Details > Security Settings > Redirect URL.<br>   <br>For detailed solutions to this error, see [How to resolve the authorization page 20029 error](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-resolve-the-authorization-page-20029-error). |
| 200 | 20036 | The grant\_type passed is not supported | Invalid grant\_type, please match the interface requirements |
| 200 | 20037 | The refresh token passed has expired. Please generate a new one | Expired refresh\_token, please pass valid parameters |
| 200 | 20038 | The refresh token passed is invalid. Please check the value | The refresh\_token cannot be found.<br>When you use the refresh\_token to refresh the user\_access\_token, you need to save the new refresh\_token in the returned result for the next refresh.<br>If the old refresh\_token is reused or the refresh\_token has expired during the next refresh, this error will be reported. The refresh\_token is valid for about 30 days, and the specific time can be obtained through the refresh\_expires\_in parameter returned by the interface.<br>You can call [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/authen-v1/oidc-access_token/create) to re-obtain the user\_access\_token and refresh\_token. |
| 200 | 20042 | App disabled | App is unavailable, please check app status |
| 200 | 20046 | Brand inconsistency | The application brand and the domain name brand are inconsistent. Please ensure that the feishu application is used under the feishu domain name, and lark is similar. |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fhistoric-version%2Fauthen%2Fcreate-4%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

[How to obtain Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[How to request the required scopes for the application](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

Got other questions? Try asking AI Assistant

[Previous:Get user\_access\_token](https://open.feishu.cn/document/historic-version/authen/create-3) [Next:Get user\_access\_token (Bytedance only)](https://open.feishu.cn/document/historic-version/authen/get-user_access_token-bytedance)

Please log in first before exploring any API.

Log In

API Explorer

Sample Code

More

Request Header

Authorization

\*

Bearer

app\_access\_token

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

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&apiName=create&project=authen&resource=oidc.refresh_access_token&version=v1)

The contents of this article

[Request](https://open.feishu.cn/document/historic-version/authen/create-4#request "Request")

[Request header](https://open.feishu.cn/document/historic-version/authen/create-4#requestHeader "Request header")

[Request body](https://open.feishu.cn/document/historic-version/authen/create-4#requestBody "Request body")

[Request example](https://open.feishu.cn/document/historic-version/authen/create-4#requestExample "Request example")

[Response](https://open.feishu.cn/document/historic-version/authen/create-4#response "Response")

[Response body](https://open.feishu.cn/document/historic-version/authen/create-4#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/historic-version/authen/create-4#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/historic-version/authen/create-4#errorCode "Error code")

Try It

Feedback

OnCall

Collapse

Expand