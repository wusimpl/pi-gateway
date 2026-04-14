---
url: "https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN"
title: "上传文件 - 服务端 API - 开发文档 - 飞书开放平台"
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
- [开发指南](https://open.feishu.cn/document/home/intro)
- [开发教程](https://open.feishu.cn/document/home/course)
- [服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide)
- [客户端 API](https://open.feishu.cn/document/uYjL24iN/uMTMuMTMuMTM/)
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

[消息概述](https://open.feishu.cn/document/server-docs/im-v1/introduction)

[消息常见问题](https://open.feishu.cn/document/server-docs/im-v1/faq)

消息管理

批量消息

图片信息

文件信息

[上传文件](https://open.feishu.cn/document/server-docs/im-v1/file/create)

[下载文件](https://open.feishu.cn/document/server-docs/im-v1/file/get)

消息加急

表情回复

Pin

消息卡片

URL 预览

群组

飞书卡片

消息流

企业自定义群标签

云文档

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/introduction) [文件信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create)

上传文件

# 上传文件

复制页面

最后更新于 2024-08-21

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#7bb6c149 "前提条件")

[使用限制](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#cac79090 "使用限制")

[请求](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#requestHeader "请求头")

[请求体](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#requestBody "请求体")

[请求示例](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#errorCode "错误码")

# 上传文件

调用该接口将本地文件上传至开放平台，支持上传音频、视频、文档等文件类型。上传后接口会返回文件的 Key，使用该 Key 值可以调用其他 OpenAPI。例如，调用 [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) 接口，发送文件。

尝试一下

## 前提条件

应用需要开启 [机器人能力](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-enable-bot-ability)。

## 使用限制

文件大小不得超过 30 MB，且不允许上传空文件。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/im/v1/files |
| HTTP Method | POST |
| 接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 <br>开启任一权限即可 | 获取与上传图片或文件资源 <br>上传文件V2<br>历史版本 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token)。<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234" |
| Content-Type | string | 是 | **固定值**："multipart/form-data; boundary=---7MA4YWxkTrZu0gW" |

### 请求体

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| file\_type | string | 是 | 待上传的文件类型<br>**示例值**："mp4"<br>**可选值有**：<br>- `opus`：OPUS 音频文件。其他格式的音频文件，请转为 OPUS 格式后上传。可使用 ffmpeg 转换格式：`ffmpeg -i SourceFile.mp3 -acodec libopus -ac 1 -ar 16000 TargetFile.opus`<br>- `mp4`：MP4 格式视频文件<br>- `pdf`：PDF 格式文件<br>- `doc`：DOC 格式文件<br>- `xls`：XLS 格式文件<br>展开 |
| file\_name | string | 是 | 带后缀的文件名<br>**示例值**："测试视频.mp4" |
| duration | int | 否 | 文件的时长（视频、音频），单位：毫秒。不传值时无法显示文件的具体时长。<br>**示例值**：3000 |
| file | file | 是 | 文件内容，具体的传值方式可参考请求体示例。<br>**注意**：文件大小不得超过 30 MB，且不允许上传空文件。<br>**示例值**：二进制文件 |

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

curl--location--request POST 'https://open.feishu.cn/open-apis/im/v1/files' \

以下示例代码中需要自行替换文件路径和鉴权Token

**cURL示例**

```

curl --location --request POST 'https://open.feishu.cn/open-apis/im/v1/files' \
--header 'Authorization: Bearer t-39eec8560faa3dded7971873eb649fd40e70e0f1' \
--form 'file_type="mp4"' \
--form 'file_name="测试视频.mp4"' \
--form 'duration="3000"' \
--form 'file=@"/path/测试视频.mp4"'
```

**HTTP示例**

```

POST /open-apis/im/v1/files HTTP/1.1
Host: open.feishu.cn
Authorization: Bearer t-ddf4732fda4aa8a8b1639ee42e8477001d8d5f7c
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Length: 471

----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file_type"

mp4
----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file"; filename="测试视频.mp4"
Content-Type: <Content-Type header here>

(data)
----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="duration"

3000
----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="file_name"

测试视频.mp4
----WebKitFormBoundary7MA4YWxkTrZu0gW
```

**Python请求示例**

```

import requests
from requests_toolbelt import MultipartEncoder
# 请注意使用时替换文件path和Authorization
def upload():
  url = "https://open.feishu.cn/open-apis/im/v1/files"
  form = {'file_type': 'stream',
          'file_name': 'text.txt',
          'file':  ('text.txt', open('path/text.txt', 'rb'), 'text/plain')} # 需要替换具体的path  具体的格式参考  https://www.w3school.com.cn/media/media_mimeref.asp
  multi_form = MultipartEncoder(form)
  headers = {
    'Authorization': 'Bearer xxx', ## 获取tenant_access_token, 需要替换为实际的token
  }
  headers['Content-Type'] = multi_form.content_type
  response = requests.request("POST", url, headers=headers, data=multi_form)
  print(response.headers['X-Tt-Logid']) # for debug or oncall
  print(response.content) # Print Response
# Press the green button in the gutter to run the script.

if __name__ == '__main__':
    upload()
```

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

"file\_key": "file\_456a92d6-c6ea-4de4-ac3f-7afcf44ac78g"

    }

}

### 错误码

| HTTP状态码 | 错误码 | 描述 | 排查建议 |
| --- | --- | --- | --- |
| 400 | 232096 | Meta writing has stopped, please try again later. | 应用信息被停写，请稍后重试。 |
| 400 | 234001 | Invalid request param. | 请求参数无效，请根据接口文档描述检查请求参数是否正确。 |
| 401 | 234002 | Unauthorized. | 接口鉴权失败，请咨询 [技术支持](https://applink.feishu.cn/TLJpeNdW)。 |
| 400 | 234006 | The file size exceed the max value. | 资源大小超出限制。<br>- 文件限制：不超过 30 MB<br>- 图片限制：不超过 10 MB |
| 400 | 234007 | App does not enable bot feature. | 应用没有启用机器人能力。启用方式参见 [如何启用机器人能力](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-enable-bot-ability)。 |
| 400 | 234010 | File's size can't be 0. | 请勿上传大小为 0 的文件。 |
| 400 | 234041 | Tenant master key has been deleted, please contact the tenant administrator. | 租户加密密钥被删除，请联系租户管理员。 |
| 400 | 234042 | Hybrid deployment tenant storage error, such as full storage space, please contact tenant administrator. | 请求出现混部租户存储错误，如存储空间已满等，请联系租户管理员或 [技术支持](https://applink.feishu.cn/TLJpeNdW)。 |

更多错误码信息，参见 [通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fim-v1%2Ffile%2Fcreate%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[可以通过接口给外部联系人发送消息吗？](https://open.feishu.cn/document/server-docs/im-v1/faq#3bc3de2f)

[是否支持通过 OpenAPI 创建机器人？](https://open.feishu.cn/document/server-docs/im-v1/faq#732e7c89)

[应用机器人与自定义机器人区别](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#da1a309d)

[在调用发送消息接口时，提示请求中的消息内容有问题，我应该如何排查解决问题？](https://open.feishu.cn/document/server-docs/im-v1/faq#59b9af42)

[机器人如何接收并响应用户发来的消息？](https://open.feishu.cn/document/server-docs/im-v1/faq#2f86f42b)

遇到其他问题？问问 开放平台智能助手

[上一篇：下载图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/get) [下一篇：下载文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/get)

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

file\_type

\*

file\_name

\*

示例值："测试视频.mp4"

duration

示例值："3000"

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

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=create&project=im&resource=file&version=v1)

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#7bb6c149 "前提条件")

[使用限制](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#cac79090 "使用限制")

[请求](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#requestHeader "请求头")

[请求体](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#requestBody "请求体")

[请求示例](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/im-v1/file/create?lang=zh-CN#errorCode "错误码")

尝试一下

意见反馈

技术支持

收起

展开