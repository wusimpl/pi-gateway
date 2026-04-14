---
url: "https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN"
title: "Upload a file - Server API - Documentation - Feishu Open Platform"
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

[Docs overview](https://open.feishu.cn/document/server-docs/docs/docs-overview)

[Docs FAQs](https://open.feishu.cn/document/server-docs/docs/faq)

Space

[Cloud space overview](https://open.feishu.cn/document/server-docs/docs/drive-v1/introduction)

[Cloud space FAQs](https://open.feishu.cn/document/server-docs/docs/drive-v1/faq)

Folder

File

[File overview](https://open.feishu.cn/document/docs/drive-v1/file/file-overview)

[Obtain Metadata](https://open.feishu.cn/document/server-docs/docs/drive-v1/file/batch_query)

[Obtain file's statistics](https://open.feishu.cn/document/server-docs/docs/drive-v1/file/get)

[Obtain document view records](https://open.feishu.cn/document/server-docs/docs/drive-v1/file-view_record/list)

[Create cloud document](https://open.feishu.cn/document/docs/drive-v1/file/create-cloud-document)

[Copy File](https://open.feishu.cn/document/server-docs/docs/drive-v1/file/copy)

[Move a file or folder](https://open.feishu.cn/document/server-docs/docs/drive-v1/file/move)

[Delete file or folder](https://open.feishu.cn/document/server-docs/docs/drive-v1/file/delete)

[Create file shortcut](https://open.feishu.cn/document/server-docs/docs/drive-v1/file/create_shortcut)

[Search document](https://open.feishu.cn/document/server-docs/docs/drive-v1/search/document-search)

Upload files

[File upload overview](https://open.feishu.cn/document/server-docs/docs/drive-v1/upload/multipart-upload-file-/introduction)

[Upload a file](https://open.feishu.cn/document/server-docs/docs/drive-v1/upload/upload_all)

Multipart Upload

[Download a file](https://open.feishu.cn/document/server-docs/docs/drive-v1/download/download)

Import files

Export docs

Media

Document Version

Like

Event

Wiki

Document

Sheets

Base

Board

Permission

Comment

Docs Assistant

Common

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Docs](https://open.feishu.cn/document/server-docs/docs/docs-overview) [Space](https://open.feishu.cn/document/server-docs/docs/drive-v1/introduction) [File](https://open.feishu.cn/document/docs/drive-v1/file/file-overview) [Upload files](https://open.feishu.cn/document/server-docs/docs/drive-v1/upload/multipart-upload-file-/introduction)

Upload a file

# Upload a file

Copy Page

Last updated on 2024-10-23

The contents of this article

[Limits](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#64687b1b "Limits")

[Request](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#request "Request")

[Request header](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#requestHeader "Request header")

[Request body](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#requestBody "Request body")

[cURL example](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#570acbd5 "cURL example")

[Python example](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#f751e571 "Python example")

[Request example](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#requestExample "Request example")

[Response](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#response "Response")

[Response body](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#errorCode "Error code")

# Upload a file

Uploads a small file to user's Space.

Try It

## Limits

- Please do not use this interface to upload files larger than 20MB. If you have this requirement, you can try to use the [multipart upload interface](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/multipart-upload-file-/introduction).

- This API does not support concurrent calls, and the call frequency limit is 5 QPS, 10,000 times/day. Otherwise, error code 1061045 will be returned, which can be resolved by retrying later.


## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/drive/v1/files/upload\_all |
| HTTP Method | POST |
| Rate Limit | [Special Rate Limit](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| Supported app types | Custom apps<br>Store apps |
| Required scopes <br>Enable any scope from the list | View, comment, edit, and manage all files in My Space<br>Upload and download files to My Space<br>Upload file |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | When calling an API, the app needs to authenticate its identity through an access token. The data obtained with different types of access tokens may vary. Refer to [Choose and obtain access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM).<br>**Value format**: "Bearer `access_token`"<br>**Supported options are**:<br>tenant\_access\_token<br>Call the API on behalf of the app. The range of readable and writable data is determined by the app's own [data access range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions). Refer to [Get custom app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) or [Get store app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token). Example value: "Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>Call the API on behalf of the logged-in user. The range of readable and writable data is determined by the user's data access range. Refer to [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token). Example value: "Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | Yes | **Fixed value**: "multipart/form-data; boundary=---7MA4YWxkTrZu0gW" |

For more information on the permissions, see [FAQs](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN).

### Request body

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| file\_name | string | Yes | File name.<br>**Example value**: "demo.pdf"<br>**Data validation rules**:<br>- Maximum length: `250` characters |
| parent\_type | string | Yes | Type of the upload point. Fixed as `explorer`.<br>**Example value**: "explorer"<br>**Optional values are**:<br>- `explorer`：My Space. |
| parent\_node | string | Yes | Token of the folder.For more information about how to obtain the token, see [Folder overview](https://open.feishu.cn/document/ukTMukTMukTM/ugTNzUjL4UzM14CO1MTN/folder-overview).<br>**Example value**: "fldbcO1UuPz8VwnpPx5a92abcef" |
| size | int | Yes | The file size in bytes.<br>**Example value**: 1024<br>**Data validation rules**:<br>- Maximum value: `20971520` |
| checksum | string | No | Adler-32 checksum of the file. This field is optional.<br>**Example value**: "3248270248" |
| file | file | Yes | Binary content of the file.<br>**Example value**: file binary |

### cURL example

```

curl --location --request POST 'https://open.feishu.cn/open-apis/drive/v1/files/upload_all' \
--header 'Authorization: Bearer t-e13d5ec1954e82e458f3ce04491c54ea8c9abcef' \
--header 'Content-Type: multipart/form-data' \
--form 'file_name="demo.pdf"' \
--form 'parent_type="explorer"' \
--form 'parent_node="fldbcO1UuPz8VwnpPx5a92abcef"' \
--form 'size="1024"' \
--form 'file=@"/path/demo.pdf"'
```

### Python example

```

import os
import requests
from requests_toolbelt import MultipartEncoder

def upload_file():
    file_path = "/path/demo.pdf"
    file_size = os.path.getsize(file_path)
    url = "https://open.feishu.cn/open-apis/drive/v1/files/upload_all"
    form = {'file_name': 'demo.pdf',
            'parent_type': 'explorer',
            'parent_node': 'fldbcO1UuPz8VwnpPx5a92abcef',
            'size': str(file_size),
            'file': (open(file_path, 'rb'))}
    multi_form = MultipartEncoder(form)
    headers = {
        'Authorization': 'Bearer t-e13d5ec1954e82e458f3ce04491c54ea8c9abcef',  ## replace with real tenant_access_token
    }
    headers['Content-Type'] = multi_form.content_type
    response = requests.request("POST", url, headers=headers, data=multi_form)

if __name__ == '__main__':
    upload_file()
```

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

curl--location--request POST 'https://open.feishu.cn/open-apis/drive/v1/files/upload\_all' \

## Response

### Response body

| Parameter<br>Show sublists | Type | Description |
| --- | --- | --- |
| code | int | Error codes, fail if not zero |
| msg | string | Error descriptions |
| data | - | - |

### Response body example

1

2

3

4

5

6

7

{

"code": 0,

"msg": "success",

"data": {

"file\_token": "boxcnrHpsg1QDqXAAAyachabcef"

    }

}

### Error code

| HTTP status code | Error code | Description | Troubleshooting suggestions |
| --- | --- | --- | --- |
| 200 | 1061001 | internal error. | Internal service error, such as timeout or failure in processing error codes.<br>Common error problems:<br>1. Upload files api does not support uploading files directly to Wiki. Please upload files to a folder first and then move them to Wiki. |
| 400 | 1061002 | params error. | Check whether the request parameters are correct. |
| 404 | 1061003 | not found. | Check whether the resource exists. |
| 403 | 1061004 | forbidden. | Confirm whether the current access identity has permission to read or edit files or folders. Please refer to the following methods to resolve this:<br>- When uploading materials, please ensure that the current caller has edit permissions for the target cloud document.<br>- When uploading files, please ensure that the current caller has edit permissions for the folder.<br>- When performing operations such as adding, deleting, or modifying files or folders, please ensure that the caller has sufficient document permissions:<br>  - For the "create file" interface, the caller needs edit permissions for the target folder.<br>  - For the "copy file" interface, the caller needs read or edit permissions for the file and edit permissions for the target folder.<br>  - For the "move file" interface, the caller must have the following permissions:<br>    - Manage permission for the document or folder being moved.<br>    - Edit permission for current location of the document or folder.<br>    - Edit permission for the new location.<br>  - For the "delete file" interface, the caller must have one of the following two permissions:<br>    - The app or user is the owner of the file and has edit permissions for the parent folder where the file is located.<br>    - The app or user is not the owner of the file, but the owner of the parent folder where the file is located or has full access to the parent folder.<br>For information on how to grant permissions, refer to [How to Grant Permissions for Cloud Document Resources to an App](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app). |
| 400 | 1061021 | upload id expire. | The upload transaction has expired. Please upload again. |
| 500 | 1061022 | file version conflict. | File version number conflicts. |
| 400 | 1061041 | parent node has been deleted. | Check whether the upload point has been deleted. |
| 400 | 1061042 | parent node out of limit. | The number of materials to upload to the current upload node has reached the limit. Please change the upload point. |
| 400 | 1061043 | file size beyond limit. | Check whether the length of the file is within the limit. For more information, see [File size limits in Drive](https://www.feishu.cn/hc/zh-CN/articles/360049067549). |
| 400 | 1061044 | parent node not exist. | `parent_node` does not exist. Please verify if the upload point token is correct:<br>- For the file upload interface, refer to [Folder Token Retrieval Method](https://open.feishu.cn/document/ukTMukTMukTM/ugTNzUjL4UzM14CO1MTN/folder-overview#-717d325) to ensure the correct folder token is provided.<br>- For the media upload interface, refer to [Upload Point Types and Upload Point Token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction#cc82be3c) to verify if the `parent_node` is correctly filled out. |
| 200 | 1061045 | can retry. | Internal error. Please try again later. |
| 400 | 1061109 | file name cqc not passed. | Make sure that the file to upload and the file name meet compliance. |
| 400 | 1061101 | file quota exceeded. | The tenant has reached the maximum capacity. Make sure that the tenant has sufficient capacity and then upload again. |
| 403 | 1061500 | mount node point kill. | The mount point does not exist. |
| 400 | 1062007 | upload user not match. | Make sure that the current request is sent by the same user or app as the upload task. |
| 400 | 1062008 | checksum param Invalid. | Make sure that the checksum of the file or file block is correct. |
| 400 | 1062009 | the actual size is inconsistent with the parameter declaration size. | The size of the file to transfer is inconsistent with that specified in the parameter. |
| 400 | 1062010 | block missing, please upload all blocks. | Some file blocks are missing. Make sure that all file blocks are uploaded. |
| 400 | 1062011 | block num out of bounds. | The number of file blocks to upload has reached the limit. Make sure that the file blocks belong to the specified file. |
| 400 | 1061061 | user quota exceeded. | You have reached your maximum personal capacity. Make sure that you have sufficient capacity and then upload again. |
| 403 | 1061073 | no scope auth. | You have no access to the API. |
| 200 | 1064230 | locked\_for\_data\_migration | Data migrating, temporarily unable to upload. |
| 400 | 1062505 | parent node out of size. | The single tree in My Space has reached the maximum size of 400,000. |
| 400 | 1062506 | parent node out of depth. | My Space supports up to 15 levels of directories. |
| 400 | 1062507 | parent node out of sibling num. | The number of nodes mounted to the directory in My Space has reached the limit of **1,500** nodes per level. |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FukTMukTMukTM%2FuUjM5YjL1ITO24SNykjN%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to add permissions for apps](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[How to get the token（id） of docs resources?](https://open.feishu.cn/document/server-docs/docs/faq?lang=en-US#e4a9bfa1)

[How to share the document created by the application (tenant\_access\_token) with personal access?](https://open.feishu.cn/document/server-docs/docs/permission/faq?lang=en-US#507872a1)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

Got other questions? Try asking AI Assistant

[Previous:File upload overview](https://open.feishu.cn/document/server-docs/docs/drive-v1/upload/multipart-upload-file-/introduction) [Next:Upload a file in blocks-Pre­uploading](https://open.feishu.cn/document/server-docs/docs/drive-v1/upload/multipart-upload-file-/upload_prepare)

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

Request Body

file\_name

\*

parent\_type

\*

parent\_node

\*

size

\*

checksum

file

\*

File's binary content

Upload

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

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&apiName=upload_all&project=drive&resource=file&version=v1)

The contents of this article

[Limits](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#64687b1b "Limits")

[Request](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#request "Request")

[Request header](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#requestHeader "Request header")

[Request body](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#requestBody "Request body")

[cURL example](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#570acbd5 "cURL example")

[Python example](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#f751e571 "Python example")

[Request example](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#requestExample "Request example")

[Response](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#response "Response")

[Response body](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/ukTMukTMukTM/uUjM5YjL1ITO24SNykjN#errorCode "Error code")

Try It

Feedback

OnCall

Collapse

Expand