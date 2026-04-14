---
url: "https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN"
title: "Add Permissions - Documentation - Feishu Open Platform"
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

# Add Permissions

Copy Page

Last updated on 2021-07-19

The contents of this article

[Request](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#7dbabeae "Request")

[Request header](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#20964697 "Request header")

[Request body](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#422ed976 "Request body")

[Request body example](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#0797b7de "Response body")

[Response body example](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#30f4b514 "Response body example")

[Error code](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#4b37c186 "Error code")

# Add permissions

This API is used for granting permission to a user or a chat group to view or edit a Feishu document using a file token.

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/drive/permission/member/create |
| HTTP Method | POST |
| Required scopes<br> <br>Enable any scope from the list | [View, comment, edit, and manage all files in My Space](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)<br>[Upload and download files to My Space](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)<br>[View, comment, edit, and manage Docs](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)<br>[View, comment, edit, and manage Sheets](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN) |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | user\_access\_token<br> or <br>tenant\_access\_token<br>**Value Format**: "Bearer `access_token`"<br>**Example Value**: "Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[Learn more about obtaining and using access\_token.](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) |
| Content-Type | string | Yes | **Fixed value**: "application/json; charset=utf-8" |

Before using

tenant\_access\_token

, make sure that the app is the collaborators or owner of the document, otherwise an PermissionError will be reported. There are currently several ways to prevent error:

1. Use
    tenant\_access\_token
    to create a document, at which time the owner of the document is the app

2. If you were using
    user\_access\_token
    to create a document, you need to use
    user\_access\_token
    call current interface, and add the app as a collaborator.


### Request body

| Parameter | Type | Mandatory | Description |
| --- | --- | --- | --- |
| token | string | Yes | The file token, see page 4 of the Integration Overview for how to obtain it |
| type | string | Yes | Document type, values include: "doc" 、"sheet" 、 "bitable" or "file" |
| members |  | yes | User to be granted permission |
| ∟member\_type | string | Yes | User ID type, values include: <br>1) "email": user email address used for registering Feishu<br>2) "openid": user's Open ID<br>3) "openchat": chat Open ID if the permission is to be granted to a chat group<br>4) "userid": user ID |
| ∟member\_id | string | Yes | Specify the value for the chosen member type; e.g. specify user email if member\_type = "email" |
| ∟perm | string | Yes | Permission to be granted, values include: <br>1) "view”<br>2) "edit" |
| notify\_lark | string | Yes | Whether sending message to collaborator, values includes <br>1) true: the permission update notification will be sent to the collaborator<br>2) false: the permission update notification will not be sent to the collaborator |

### Request body example

```

{
	"token": "doccnBKgoMyY5OMbUG6FioTXuBe",
	"type": "doc",
	"members": [\
		{\
			"member_type": "openid",\
			"member_id": "ou_65b0affcc6c342a50e4c66f700137b64",\
			"perm": "view"\
		}\
	]
}
```

## Response

### Response body

| Parameter | Description |
| --- | --- |
| is\_all\_success | If the request was fully successful; |
| fail\_members | Information of users to whom the permission couldn’t be added |
| ∟member\_type | User type, values include: <br>1) "email": user email address used for registering Feishu<br>2) "openid": user's Open ID<br>3) "userid": user ID |
| ∟member\_id | The value of the user type returned |
| ∟perm | The permission given |

### Response body example

```

{
    "code": 0,
    "data": {
        "is_all_success": true,
        "fail_members": [\
            {\
                "member_type": "openid",\
                "member_id": "ou_65b0affcc6c342a50e4c66f700137b64",\
                "perm": "view"\
            }\
        ]
    },
    "msg": "Success"
}
```

### Error code

For details, please refer to: [Service-side error codes](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FukTMukTMukTM%2FuMzNzUjLzczM14yM3MTN%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Request](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#7dbabeae "Request")

[Request header](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#20964697 "Request header")

[Request body](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#422ed976 "Request body")

[Request body example](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#82f133c0 "Request body example")

[Response](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#aa567d02 "Response")

[Response body](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#0797b7de "Response body")

[Response body example](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#30f4b514 "Response body example")

[Error code](https://open.feishu.cn/document/ukTMukTMukTM/uMzNzUjLzczM14yM3MTN#4b37c186 "Error code")

Try It

Feedback

OnCall

Collapse

Expand