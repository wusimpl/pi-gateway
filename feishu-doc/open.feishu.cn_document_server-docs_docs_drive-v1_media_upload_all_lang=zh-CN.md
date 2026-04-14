---
url: "https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN"
title: "上传素材 - 服务端 API - 开发文档 - 飞书开放平台"
---

[![lark](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/899fa60e60151c73aaea2e25871102dc.svg)](https://open.feishu.cn/?lang=zh-CN)

- [客户案例](https://open.feishu.cn/solutions?lang=zh-CN)

- [应用中心](https://app.feishu.cn/?lang=zh-CN)

- [开发文档](https://open.feishu.cn/document)

- [智能助手\\
\\
AI 开发](https://open.feishu.cn/app/ai/playground?from=nav&lang=zh-CN)


你可以输入文档关键词、开发问题、Log ID、错误码

- [开发者后台](https://open.feishu.cn/app?lang=zh-CN)


登录

- [文档首页](https://open.feishu.cn/document/home/index)
- [开发指南](https://open.feishu.cn/document/client-docs/intro)
- [开发教程](https://open.feishu.cn/document/course)
- [服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide)
- [客户端 API](https://open.feishu.cn/document/client-docs/h5/)
- [飞书 CLI](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu)
- [OpenClaw 飞书官方插件](https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh)

API 调试台 [卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs_header) 平台动态

搜索目录

[智能助手：从自然语言到可执行代码](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide)

API 调用指南

事件与回调

服务端 SDK

认证及授权

通讯录

组织架构

消息

群组

飞书卡片

消息流

企业自定义群标签

云文档

[云文档概述](https://open.feishu.cn/document/server-docs/docs/docs-overview)

[云文档常见问题](https://open.feishu.cn/document/server-docs/docs/faq)

云空间

[云空间概述](https://open.feishu.cn/document/server-docs/docs/drive-v1/introduction)

[云空间常见问题](https://open.feishu.cn/document/server-docs/docs/drive-v1/faq)

文件夹

文件

素材

[素材概述](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction)

上传素材

[上传素材](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all)

[分片上传素材-预上传](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/multipart-upload-media/upload_prepare)

[分片上传素材-上传分片](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/multipart-upload-media/upload_part)

[分片上传素材-完成上传](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/multipart-upload-media/upload_finish)

[下载素材](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download)

[获取素材临时下载链接](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url)

文档版本

点赞

事件

知识库

文档

电子表格

多维表格

画板

权限

评论

云文档助手

通用

日历

视频会议

妙记

考勤打卡

审批

机器人

服务台

任务

邮箱

应用信息

企业信息

认证信息

个人设置

搜索

AI 能力

飞书妙搭

飞书 aPaaS

飞书 Aily

管理后台

公司圈

飞书人事（标准版）

飞书人事（企业版）

Payroll

招聘

OKR

实名认证

智能门禁

绩效

飞书词典

安全合规

关联组织

工作台

飞书主数据

汇报

eLearning

历史版本（不推荐）

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [云空间](https://open.feishu.cn/document/server-docs/docs/drive-v1/introduction) [素材](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction) [上传素材](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all)

上传素材

# 上传素材

复制页面

最后更新于 2025-02-25

本文内容

[使用限制](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#cac79090 "使用限制")

[请求](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#requestHeader "请求头")

[请求体](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#requestBody "请求体")

[cURL示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#5c7be338 "cURL示例")

[Python示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#b1dc2b34 "Python示例")

[请求示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#errorCode "错误码")

# 上传素材

将文件、图片、视频等素材上传到指定云文档中。素材将显示在对应云文档中，在云空间中不会显示。

尝试一下

## 使用限制

- 素材大小不得超过 20 MB。要上传大于 20 MB 的文件，你需使用分片上传素材相关接口。详情参考 [素材概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction)。
- 该接口调用频率上限为 5 QPS，10000 次/天。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/drive/v1/medias/upload\_all |
| HTTP Method | POST |
| 接口频率限制 | [特殊频控](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 <br>开启任一权限即可 | 查看、评论、编辑和管理多维表格<br>查看、评论、编辑和管理文档<br>上传图片和附件到云文档中<br>查看、评论、编辑和管理云空间中所有文件<br>查看、评论、编辑和管理电子表格 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | 应用调用 API 时，需要通过访问凭证（access\_token）进行身份鉴权，不同类型的访问凭证可获取的数据范围不同，参考 [选择并获取访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) 。<br>**值格式**："Bearer `access_token`"<br>**可选值如下**：<br>tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token) 。示例值："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>以登录用户身份调用 API，可读写的数据范围由用户可读写的数据范围决定。参考 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)。示例值："Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | 是 | **固定值**："multipart/form-data; boundary=---7MA4YWxkTrZu0gW" |

### 请求体

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| file\_name | string | 是 | 要上传的素材的名称<br>**示例值**："demo.jpeg"<br>**数据校验规则**：<br>- 最大长度：`250` 字符 |
| parent\_type | string | 是 | 上传点的类型。你可根据上传的素材类型与云文档类型确定上传点类型。例如，要将一张图片插入到新版文档（文件类型为 `docx`）中，需指定上传点为 `docx_image`；要将一个附件上传到新版文档中，需指定上传点为 `docx_file`。<br>**示例值**："docx\_image"<br>**可选值有**：<br>- `doc_image`：旧版文档图片<br>- `docx_image`：新版文档图片<br>- `sheet_image`：电子表格图片<br>- `doc_file`：旧版文档文件<br>- `docx_file`：新版文档文件<br>展开 |
| parent\_node | string | 是 | 上传点的 token，即要上传的云文档的 token，用于指定素材将要上传到的云文档或位置。参考 [素材概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction) 了解上传点类型与上传点 token 的对应关系 |
| size | int | 是 | 文件的大小，单位为字节<br>**示例值**：1024<br>**数据校验规则**：<br>- 最大值：`20971520` |
| checksum | string | 否 | 文件的 Adler-32 校验和<br>**示例值**："3248270248" |
| extra | string | 否 | 以下场景的上传点需通过该参数传入素材所在云文档的 token。extra 参数的格式为`"{\"drive_route_token\":\"素材所在云文档的 token\"}"`。详情参考 [素材概述-extra 参数说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction#3b8635d3)。<br>**示例值**："{"drive\_route\_token":"doxcnXgNGAtaAraIRVeCfmabcef"}" |
| file | file | 是 | 文件的二进制内容<br>**示例值**：file binary |

### cURL示例

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

### Python示例

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
        'Authorization': 'Bearer t-e13d5ec1954e82e458f3ce04491c54ea8c9abcef',  ## 获取tenant_access_token, 需要替换为实际的token
    }
    headers['Content-Type'] = multi_form.content_type
    response = requests.request("POST", url, headers=headers, data=multi_form)

if __name__ == '__main__':
    upload_media()
```

### 请求示例

以下为固定的代码示例。如需根据实际场景调整请求参数，可打开 API 调试台 输入参数后生成相应的示例代码 操作指引

cURL

Go SDK

Python SDK

Java SDK

Node SDK

Php - Guzzle

C# - Restsharp

更多

1

curl--location--request POST 'https://open.feishu.cn/open-apis/drive/v1/medias/upload\_all' \

## 响应

### 响应体

| 名称<br>展开子列表 | 类型 | 描述 |
| --- | --- | --- |
| code | int | 错误码，非 0 表示失败 |
| msg | string | 错误描述 |
| data | - | - |

### 响应体示例

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

### 错误码

| HTTP状态码 | 错误码 | 描述 | 排查建议 |
| --- | --- | --- | --- |
| 200 | 1061001 | internal error. | 服务内部错误，包括超时，错误码没处理。 |
| 400 | 1061002 | params error. | 请检查请求参数是否正确。 |
| 404 | 1061003 | not found. | 请确认对应资源是否存在。 |
| 403 | 1061004 | forbidden. | 当前调用身份没有文件或文件夹的阅读或编辑等权限。请参考以下方式解决：<br>- 若上传素材，请确保当前调用身份具有目标云文档的编辑权限<br>- 若上传文件，请确保当前调用身份具有文件夹的编辑权限<br>- 若对文件或文件夹进行增删改等操作，请确保调用身份具有足够文档权限：<br>  - 对于新建文件接口，调用身份需要有目标文件夹的编辑权限<br>  - 对于复制文件接口，调用身份需要有文件的阅读或编辑权限、并且具有目标文件夹的编辑权限<br>  - 对于移动文件接口，调用身份需要有被移动文件的可管理权限、被移动文件所在位置的编辑权限、目标位置的编辑权限<br>  - 对于删除文件接口，调用身份需要具有以下两种权限之一：<br>    - 该应用或用户是文件所有者并且具有该文件所在父文件夹的编辑权限<br>    - 该应用或用户并非文件所有者，但是该文件所在父文件夹的所有者或者拥有该父文件夹的所有权限（full access）<br>了解开通权限步骤，参考 [如何为应用开通云文档相关资源的权限](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)。 |
| 401 | 1061005 | auth failed. | 请使用正确身份访问该接口。 |
| 200 | 1061006 | internal time out. | 服务内部超时，可稍后再试。 |
| 404 | 1061007 | file has been delete. | 请确认对应节点未被删除。 |
| 400 | 1061008 | invalid file name. | 请检查文件名，当前文件名过长或者为空。 |
| 400 | 1061021 | upload id expire. | 上传事务过期，请重头开始上传。 |
| 400 | 1061041 | parent node has been deleted. | 请确认上传点未被删除。 |
| 400 | 1061042 | parent node out of limit. | 在当前上传点上传过多素材，请更换上传点。 |
| 400 | 1061043 | file size beyond limit. | 请检查文件长度以避免超出限制。 [具体限制请参考](https://www.feishu.cn/hc/zh-CN/articles/360049067549) |
| 400 | 1061044 | parent node not exist. | `parent_node` 不存在。请确认上传点 token 是否有误：<br>- 对于上传文件接口，请参考 [文件夹 token 获取方式](https://open.feishu.cn/document/ukTMukTMukTM/ugTNzUjL4UzM14CO1MTN/folder-overview#-717d325) 确认是否填写了正确的文件夹 token<br>- 对于上传素材接口，请参考 [上传点类型和上传点 token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction#cc82be3c) 确认 `parent_node` 是否填写正确 |
| 200 | 1061045 | can retry. | 内部可重试错误，请稍后重试。 |
| 400 | 1061109 | file name cqc not passed. | 请确保上传的文件和文件名合规。 |
| 400 | 1061113 | file cqc not passed. | 请确保上传的文件和文件名合规。 |
| 400 | 1061101 | file quota exceeded. | 租户容量超限，请确保租户有足够容量进行上传。 |
| 202 | 1062004 | cover generating. | 缩略图正在生成中，请稍后再试。 |
| 202 | 1062005 | file type not support cover. | 此文件类型不支持生成缩略图。 |
| 202 | 1062006 | cover no exist. | 缩略图正在生成中，请稍后再试。 |
| 400 | 1062007 | upload user not match. | 请确保当前请求身份和上传任务的身份为同一个。 |
| 400 | 1062008 | checksum param Invalid. | 请确保文件/文件块的checksum正确。 |
| 400 | 1062009 | the actual size is inconsistent with the parameter declaration size. | 实际传输的文件大小和参数说明的大小不符合一致。 |
| 400 | 1062010 | block missing, please upload all blocks. | 部分文件分片缺失，请确保所有文件分片上传完成。 |
| 400 | 1062011 | block num out of bounds. | 上传过多文件分片，请确保上传的为对应文件。 |
| 400 | 1061547 | attachment parent-child relation number exceed. | 特指上传到文档的素材超出限制。 |
| 400 | 1061061 | user quota exceeded. | 个人容量超限，请确保个人有足够容量进行上传。 |
| 403 | 1061073 | no scope auth. | 没有申请接口权限。 |
| 400 | 1062012 | file copying. | 文件正在拷贝中。 |
| 400 | 1062013 | file damaged. | 文件拷贝失败。 |
| 403 | 1062014 | dedupe no support. | 不允许秒传。 |
| 400 | 1062051 | client connect close. | 客户端断开连接。 |
| 400 | 1062505 | parent node out of size. | 云空间中所有层级的节点总和超限。上限为 40 万个，请检查节点数量。了解更多，参考 [云空间概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/files/guide/introduction)。 |
| 400 | 1062506 | parent node out of depth. | 云空间目录深度超限制（15限制）。 |
| 400 | 1062507 | parent node out of sibling num. | 云空间中根目录或文件夹的单层节点超限。上限为 1500 个，你可通过将文件新建到不同文件夹中解决。 |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fdrive-v1%2Fmedia%2Fupload_all%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何为应用开通云文档相关资源的权限?](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[如何获取云文档资源相关 token？](https://open.feishu.cn/document/server-docs/docs/faq#08bb5df6)

[应用身份创建的文档，如何给用户授权？](https://open.feishu.cn/document/server-docs/docs/permission/faq#1f89d567)

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[如何选择不同类型的 access token？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

遇到其他问题？问问 开放平台智能助手

[上一篇：素材概述](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction) [下一篇：分片上传素材-预上传](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/multipart-upload-media/upload_prepare)

请先登录后再进行调试

登录

API 调试台

示例代码

更多

请求头

Authorization

\*

切换为user\_access\_token

Bearer

tenant\_access\_token

获取 Token

请求体

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

文件二进制内容

上传文件

调试结果

![](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/31dafaca1b39955beda5239fff26f1eb.svg)

点击“开始调试”查看结果

已将 API 调试台的参数填入下方的示例代码中

cURL

Go SDK

Python SDK

Java SDK

Node SDK

更多

1

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=upload_all&project=drive&resource=media&version=v1)

本文内容

[使用限制](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#cac79090 "使用限制")

[请求](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#requestHeader "请求头")

[请求体](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#requestBody "请求体")

[cURL示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#5c7be338 "cURL示例")

[Python示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#b1dc2b34 "Python示例")

[请求示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all?lang=zh-CN#errorCode "错误码")

尝试一下

意见反馈

技术支持

收起

展开