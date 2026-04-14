---
url: "https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all"
title: "Upload media - Server API - Documentation - Feishu Open Platform"
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

Media

[Introduction](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction)

Upload media

[Upload media](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all)

[Upload media in blocks-Pre­uploading](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/multipart-upload-media/upload_prepare)

[Upload a media in blocks-Uploading](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/multipart-upload-media/upload_part)

[Upload media in blocks-Completing](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/multipart-upload-media/upload_finish)

[Download Media](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download)

[Get Temporary Download URL of Media](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url)

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Docs](https://open.feishu.cn/document/server-docs/docs/docs-overview) [Space](https://open.feishu.cn/document/server-docs/docs/drive-v1/introduction) [Media](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction) [Upload media](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all)

Upload media

# Upload media

Copy Page

Last updated on 2025-02-25

The contents of this article

[Limitations](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#6b577ff6 "Limitations")

[Request](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#request "Request")

[Request header](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#requestHeader "Request header")

[Request body](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#requestBody "Request body")

[cURL example](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#570acbd5 "cURL example")

[Python example](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#f751e571 "Python example")

[Request example](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#requestExample "Request example")

[Response](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#response "Response")

[Response body](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#errorCode "Error code")

# Upload Media

Uploads a media file such as file, picture, and video to the specified cloud document. The media file will not be displayed in the user's Space, but only in the corresponding cloud document.

Try It

## Limitations

- The media file size must not exceed 20 MB. To upload files larger than 20 MB, you need to use the shard upload media-related interfaces. For details, refer to [Media overview](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction).
- This interface supports a maximum call frequency of 5 QPS, 10,000 calls per day.

## Request

| Facts |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/drive/v1/medias/upload\_all |
| HTTP Method | POST |
| Rate Limit | [Special Rate Limit](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| Supported app types | Custom apps<br>Store apps |
| Required scopes <br>Enable any scope from the list | View, comment, edit and manage Base<br>View, comment, edit, and manage Docs<br>Upload image and file to document<br>View, comment, edit, and manage all files in My Space<br>View, comment, edit, and manage Sheets |

### Request header

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| Authorization | string | Yes | When calling an API, the app needs to authenticate its identity through an access token. The data obtained with different types of access tokens may vary. Refer to [Choose and obtain access tokens](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM).<br>**Value format**: "Bearer `access_token`"<br>**Supported options are**:<br>tenant\_access\_token<br>Call the API on behalf of the app. The range of readable and writable data is determined by the app's own [data access range](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions). Refer to [Get custom app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) or [Get store app's tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token). Example value: "Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>Call the API on behalf of the logged-in user. The range of readable and writable data is determined by the user's data access range. Refer to [Get user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token). Example value: "Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | Yes | **Fixed value**: "multipart/form-data; boundary=---7MA4YWxkTrZu0gW" |

### Request body

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| file\_name | string | Yes | File name.<br>**Example value**: "demo.jpeg"<br>**Data validation rules**:<br>- Maximum length: `250` characters |
| parent\_type | string | Yes | Upload point type, that is, to upload a certain type of media to the specified type of Docs. For example, if you insert a picture into the Upgraded Docs, then `parent_type` needs to be filled in as `docx_image` , and then if you upload an attachment to the Upgraded Docs, then `parent_type` needs to be filled in as `docx_file`.<br>**Example value**: "doc\_image"<br>**Optional values are**:<br>- `doc_image`：Image of a document.<br>- `docx_image`：Upgraded docs image.<br>- `sheet_image`：Image of a sheet.<br>- `doc_file`：Doc file.<br>- `docx_file`：Upgraded docs file.<br>Expand |
| parent\_node | string | Yes | The `parent_node` is used to specify the specific document or location to which the media will be uploaded. Click [here](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction) for an explanation of each `parent_type` and its corresponding `parent_node`. |
| size | int | Yes | The file size in bytes.<br>**Example value**: 1024<br>**Data validation rules**:<br>- Maximum value: `20971520` |
| checksum | string | No | Adler-32 checksum of the file. This field is optional.<br>**Example value**: "3248270248" |
| extra | string | No | The upload points in the following scenarios need to pass the token of the cloud document where the material is located through this parameter. The format of the extra parameter is `"{\"drive_route_token\":\"token of the cloud document where the material is located\"}"`. For details, refer to [Material Overview](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction).<br>**Example value**: "{"drive\_route\_token":"doxcnXgNGAtaAraIRVeCfmabcef"}" |
| file | file | Yes | Binary content of the file.<br>**Example value**: file binary |

### cURL example

```

curl --location --request POST 'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all' \
--header 'Authorization: Bearer t-43b270c035ddffdcf79c9eb548d06318ca4abcef' \
--form 'file_name="demo.jpeg"' \
--form 'parent_type="doc_image"' \
--form 'parent_node="doccnFivLCfJfblZjGZtxgabcef"' \
--form 'size="1024"' \
--form 'file=@"/Path/demo.jpeg"'
--form 'extra="{\"drive_route_token\":\"doxcnXgNGAtaAraIRVeCfmabcef\"}"'
```

### Python example

```

import os
import requests
from requests_toolbelt import MultipartEncoder

def upload_media():
    file_path = "path/demo.jpeg"
    file_size = os.path.getsize(file_path)
    url = "https://open.feishu.cn/open-apis/drive/v1/medias/upload_all"
    form = {'file_name': 'demo.jpeg',
            'parent_type': 'doc_image',
            'parent_node': 'doccnFivLCfJfblZjGZtxgabcef',
            'size': str(file_size),
            'file': (open(file_path, 'rb'))}
    multi_form = MultipartEncoder(form)
    headers = {
        'Authorization': 'Bearer t-e13d5ec1954e82e458f3ce04491c54ea8c9abcef',  ## replace with real tenant_access_token
    }
    headers['Content-Type'] = multi_form.content_type
    response = requests.request("POST", url, headers=headers, data=multi_form)

if __name__ == '__main__':
    upload_media()
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

curl--location--request POST 'https://open.feishu.cn/open-apis/drive/v1/medias/upload\_all' \

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
| 200 | 1061001 | internal error. | Internal service error, such as timeout or failure in processing error codes. |
| 400 | 1061002 | params error. | Check whether the request parameters are correct. |
| 404 | 1061003 | not found. | Check whether the resource exists. |
| 403 | 1061004 | forbidden. | Confirm whether the current access identity has permission to read or edit files or folders. Please refer to the following methods to resolve this:<br>- When uploading materials, please ensure that the current caller has edit permissions for the target cloud document.<br>- When uploading files, please ensure that the current caller has edit permissions for the folder.<br>- When performing operations such as adding, deleting, or modifying files or folders, please ensure that the caller has sufficient document permissions:<br>  - For the "create file" interface, the caller needs edit permissions for the target folder.<br>  - For the "copy file" interface, the caller needs read or edit permissions for the file and edit permissions for the target folder.<br>  - For the "move file" interface, the caller must have the following permissions:<br>    - Manage permission for the document or folder being moved.<br>    - Edit permission for current location of the document or folder.<br>    - Edit permission for the new location.<br>  - For the "delete file" interface, the caller must have one of the following two permissions:<br>    - The app or user is the owner of the file and has edit permissions for the parent folder where the file is located.<br>    - The app or user is not the owner of the file, but the owner of the parent folder where the file is located or has full access to the parent folder.<br>For information on how to grant permissions, refer to [How to Grant Permissions for Cloud Document Resources to an App](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app). |
| 401 | 1061005 | auth failed. | Assume the correct user or app mode to access the API. |
| 200 | 1061006 | internal time out. | Internal service timeout. Please try again later. |
| 404 | 1061007 | file has been delete. | Check whether the node has been deleted. |
| 400 | 1061008 | invalid file name. | Check whether the file name has reached the maximum length or is empty. |
| 400 | 1061021 | upload id expire. | The upload transaction has expired. Please upload again. |
| 400 | 1061041 | parent node has been deleted. | Check whether the upload point has been deleted. |
| 400 | 1061042 | parent node out of limit. | The number of media to upload to the current upload node has reached the limit. Please change the upload point. |
| 400 | 1061043 | file size beyond limit. | Check whether the length of the file is within the limit. For more information, see [File size limits in Drive](https://www.feishu.cn/hc/zh-CN/articles/360049067549). |
| 400 | 1061044 | parent node not exist. | `parent_node` does not exist. Please verify if the upload point token is incorrect:<br>- For the file upload interface, refer to [Folder Token Retrieval Method](https://open.feishu.cn/document/ukTMukTMukTM/ugTNzUjL4UzM14CO1MTN/folder-overview#-717d325) to ensure the correct folder token is provided.<br>- For the media upload interface, refer to [Upload Point Types and Upload Point Token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction#cc82be3c) to verify if the `parent_node` is correctly filled out. |
| 200 | 1061045 | can retry. | Internal error. Please try again later. |
| 400 | 1061109 | file name cqc not passed. | Make sure that the file to upload and the file name meet compliance. |
| 400 | 1061113 | file cqc not passed. | Make sure that the file to upload and the file name meet compliance. |
| 400 | 1061101 | file quota exceeded. | The tenant has reached the maximum capacity. Make sure that the tenant has sufficient capacity and then upload again. |
| 202 | 1062004 | cover generating. | Generating thumbnails. Please try again later. |
| 202 | 1062005 | file type not support cover. | The system cannot generate thumbnails for this type of file. |
| 202 | 1062006 | cover no exist. | Generating thumbnails. Please try again later. |
| 400 | 1062007 | upload user not match. | Make sure that the current request is sent by the same user or app as the upload task. |
| 400 | 1062008 | checksum param Invalid. | Make sure that the checksum of the file or file block is correct. |
| 400 | 1062009 | the actual size is inconsistent with the parameter declaration size. | The size of the file to transfer is inconsistent with that specified in the parameter. |
| 400 | 1062010 | block missing, please upload all blocks. | Some file blocks are missing. Make sure that all file blocks are uploaded. |
| 400 | 1062011 | block num out of bounds. | The number of file blocks to upload has reached the limit. Make sure that the file blocks belong to the specified file. |
| 400 | 1061547 | attachment parent-child relation number exceed. | The media to upload to Docs has reached the limit. |
| 400 | 1061061 | user quota exceeded. | You have reached your maximum personal capacity. Make sure that you have sufficient capacity and then upload again. |
| 403 | 1061073 | no scope auth. | You have no access to the API. |
| 400 | 1062012 | file copying. | Copying the file. |
| 400 | 1062013 | file damaged. | Failed to copy the file. |
| 403 | 1062014 | dedupe no support. | Instant transfer is not allowed. |
| 400 | 1062051 | client connect close. | Disconnected from the client. |
| 400 | 1062505 | parent node out of size. | The single tree in My Space has reached the maximum size of 400,000. |
| 400 | 1062506 | parent node out of depth. | My Space supports up to 15 levels of directories. |
| 400 | 1062507 | parent node out of sibling num. | The number of nodes mounted to the directory in My Space has reached the limit of **1,500** nodes per level. |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fdrive-v1%2Fmedia%2Fupload_all%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to add permissions for apps](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[How to get the token（id） of docs resources?](https://open.feishu.cn/document/server-docs/docs/faq?lang=en-US#e4a9bfa1)

[How to share the document created by the application (tenant\_access\_token) with personal access?](https://open.feishu.cn/document/server-docs/docs/permission/faq?lang=en-US#507872a1)

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

Got other questions? Try asking AI Assistant

[Previous:Introduction](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction) [Next:Upload media in blocks-Pre­uploading](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/multipart-upload-media/upload_prepare)

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

extra

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

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&apiName=upload_all&project=drive&resource=media&version=v1)

The contents of this article

[Limitations](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#6b577ff6 "Limitations")

[Request](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#request "Request")

[Request header](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#requestHeader "Request header")

[Request body](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#requestBody "Request body")

[cURL example](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#570acbd5 "cURL example")

[Python example](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#f751e571 "Python example")

[Request example](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#requestExample "Request example")

[Response](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#response "Response")

[Response body](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#responseBody "Response body")

[Response body example](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#responseBodyExample "Response body example")

[Error code](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all#errorCode "Error code")

Try It

Feedback

OnCall

Collapse

Expand