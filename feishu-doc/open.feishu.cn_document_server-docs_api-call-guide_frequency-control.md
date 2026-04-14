---
url: "https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control"
title: "Rate limits - Server API - Documentation - Feishu Open Platform"
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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [API Call Guide](https://open.feishu.cn/document/server-docs/api-call-guide/calling-process/overview)

Rate limits

# Rate limits

Copy Page

Last updated on 2024-10-10

The contents of this article

[Response for limitations](https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control#2943b184 "Response for limitations")

[Handling limitation scenarios](https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control#a59f46d9 "Handling limitation scenarios")

[Frequency control strategy levels](https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control#8f4854d0 "Frequency control strategy levels")

[How to improve API frequency control for apps and organizations](https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control#42a74447 "How to improve API frequency control for apps and organizations")

# Rate limits

Feishu Open Platform has set different levels of frequency control strategies for different OpenAPIs to ensure system stability and provide developers with optimal performance and a premium development experience. The specific limitations for different frequency control levels are listed in this article, along with instructions on how to handle frequency control limitations when calling OpenAPI.

## Response for limitations

When the limit threshold is exceeded, Feishu will respond with an HTTP status code 429, which restricts further operations from the client for a specific duration. The suggested waiting time will be provided in the response header of the failed request.

In case of limitations, the HTTP response will resemble the following examples.

```

HTTP/1.1 429 Too Many Requests
Content-Type: application/json
x-ogw-ratelimit-limit: 100 //Window period limit, unit: second
x-ogw-ratelimit-reset: 52 //Recovery period for limit, unit: second

{
    "code": 99991400,
    "msg": "request trigger frequency limit"
}
```

For some older versions of OpenAPIs, you may receive a slightly different HTTP response (HTTP status code 400). An example is shown below:

```

HTTP/1.1 400 Bad Request
Content-Type: application/json
x-ogw-ratelimit-limit: 100 //Window period limit, unit: second
x-ogw-ratelimit-reset: 52 //Recovery period for limit, unit: second

{
    "code": 99991400,
    "msg": "request trigger frequency limit"
}
```

## Handling limitation scenarios

When handling errors, you can use the HTTP 429 error code (Some older versions of OpenAPI have HTTP 400 error code) to identify the occurrence of rate limiting. The response header of the failed request includes `x-ogw-ratelimit-reset`, which can be used to delay the subsequent request and effectively lift the rate limit.

Follow these steps to handle rate limiting:

1. Wait for the specified number of seconds indicated in `x-ogw-ratelimit-reset`.
2. Retry the request.
3. If the request fails again with an HTTP 429 error code, the rate limit is still in effect. Continue to delay and retry the request using the recommended x-ogw-ratelimit-reset value until the request succeeds.

## Frequency control strategy levels

In general, frequency control strategy levels are applied on a per-API, per-application, and per-tenant basis. Different operations on the same resource may have varying frequency control levels depending on the scenario. For instance, write interfaces may have a slightly lower frequency control level compared to read interfaces, ensuring the system's overall reliability.

- Custom apps have different frequency control levels depending on the package provided by the associated organization. Store apps, being independent of the hosting organization, follow their own frequency control policies.
- The frequency control of the customized robot is different from the normal application, which is 100 times/minute and 5 times/second for single tenant single bot. **It is recommended to avoid sending messages at whole time and half time such as 10:00, 17:30, etc.** Otherwise, there may be 11232 flow limiting error due to system pressure, resulting in failure of message sending.
- Most OpenAPIs are categorized under standard frequency control strategy levels. However, certain OpenAPIs are more complex and fall outside the scope of standard frequency control strategies. In such cases, please contact technical support to obtain specific frequency control strategies.
- Exceeding the maximum request rate (QPS or QPM) of different time periods (e.g., 1000 times/minute & 50 times/second) will trigger rate limiting.
- The specific limitation values for each frequency control strategy level are subject to change. Any updates will be communicated through the Feishu Open Platform changelog.

| Level | Description | Custom app limit（Basic Edition） | Custom app limit (Business Edition) | Store app limit |
| --- | --- | --- | --- | --- |
| 1 | The current API has a limit of 10 times per application and tenant per minute | 10 times/min | 10 times/min | 10 times/min |
| 2 | The current API has a limit of 20 times per application and tenant per minute | 20 times/min | 20 times/min | 20 times/min |
| 3 | The current API has a limit of 100 times per application and tenant per minute | 100 times/min | 100 times/min | 100 times/min |
| 4 | The current API has a limit of 1000 times per minute and 50 times per second per application and tenant | 1000 times/min & 50 times/sec | 1000 times/min & 50 times/sec | 1000 times/min & 50 times/sec |
| 5 | The current API has a limit of 1 time per second per application and tenant | 1 time/sec | 1 time/sec | 1 time/sec |
| 6 | The current API has a limit of 5 times per second per application and tenant | 5 times/sec | 5 times/sec | 5 times/sec |
| 7 | The current API has a limit of 10 times per second per application and tenant | 10 times/sec | 10 times/sec | 10 times/sec |
| 8 | The current API has a limit of 20 times per second per application and tenant | 20 times/sec | 20 times/sec | 20 times/sec |
| 9 | The current API has a limit of 50 times per second per application and tenant | 50 times/sec | 50 times/sec | 50 times/sec |
| 10 | The current API has a limit of 50 times per second per application and tenant | 50 times/sec | 100 times/sec | 50 times/sec |
| 11 | The current API has a limit of 100 times per second per application and tenant | 100 times/sec | 100 times/sec | 100 times/sec |
| 21 | The current API has a limit of 3 times per second per application and tenant | 3 times/sec | 3 times/sec | 3 times/sec |
| Special Frequency Control | Non-standard frequency control. Please click on "Technical Support" in the bottom right corner to learn about specific configurations. |  |  |  |

## How to improve API frequency control for apps and organizations

At present, Feishu Open Platform does not provide a self-adjustment feature for API interface frequency control. However, if you require a temporary increase in frequency control for scenarios such as data migration or large-scale activities, you can contact your designated CSM (customer success manager) to submit a request.

The frequency control feature is currently not available for [Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/introduction), [Group](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/group/overview), [Base](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview) businesses.

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fapi-call-guide%2Ffrequency-control%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[Custom app development process](https://open.feishu.cn/document/home/introduction-to-custom-app-development/self-built-application-development-process)

[How to call a server API?](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/how-to-call-a-server-side-api/introduction)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

Got other questions? Try asking AI Assistant

[Previous:Scope list](https://open.feishu.cn/document/server-docs/application-scope/scope-list) [Next:General parameters](https://open.feishu.cn/document/server-docs/api-call-guide/terminology)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Response for limitations](https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control#2943b184 "Response for limitations")

[Handling limitation scenarios](https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control#a59f46d9 "Handling limitation scenarios")

[Frequency control strategy levels](https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control#8f4854d0 "Frequency control strategy levels")

[How to improve API frequency control for apps and organizations](https://open.feishu.cn/document/server-docs/api-call-guide/frequency-control#42a74447 "How to improve API frequency control for apps and organizations")

Try It

Feedback

OnCall

Collapse

Expand