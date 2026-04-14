---
url: "https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN"
title: "获取素材临时下载链接 - 服务端 API - 开发文档 - 飞书开放平台"
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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/docs-overview) [云空间](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/files/guide/introduction) [素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction)

获取素材临时下载链接

# 获取素材临时下载链接

复制页面

最后更新于 2025-02-20

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#7bb6c149 "前提条件")

[注意事项](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#355ec8c0 "注意事项")

[请求](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#requestHeader "请求头")

[查询参数](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#queryParams "查询参数")

[请求示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#errorCode "错误码")

# 获取素材临时下载链接

该接口用于获取云文档中素材的临时下载链接。链接的有效期为 24 小时，过期失效。

尝试一下

## 前提条件

调用此接口之前，你需确保应用已拥有素材的下载权限。否则接口将返回 403 的 HTTP 状态码。参考 [云空间常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/faq) 第 3 点了解如何分享素材的下载权限给应用。更多云文档接口权限问题，参考 [云文档常见问题](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN)。

## 注意事项

本接口仅支持下载云文档而非云空间中的资源文件。如要下载云空间中的资源文件，需调用 [下载文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/download) 接口。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/drive/v1/medias/batch\_get\_tmp\_download\_url |
| HTTP Method | GET |
| 接口频率限制 | [特殊频控](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 <br>开启任一权限即可 | 查看、评论、编辑和管理多维表格<br>查看、评论和导出多维表格<br>查看、评论、编辑和管理文档<br>查看、评论和导出文档<br>下载云文档中的图片和附件<br>查看、评论、编辑和管理云空间中所有文件<br>查看、评论和下载云空间中所有文件<br>查看、评论、编辑和管理电子表格<br>查看、评论和导出电子表格 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | 应用调用 API 时，需要通过访问凭证（access\_token）进行身份鉴权，不同类型的访问凭证可获取的数据范围不同，参考 [选择并获取访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) 。<br>**值格式**："Bearer `access_token`"<br>**可选值如下**：<br>tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token) 。示例值："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>以登录用户身份调用 API，可读写的数据范围由用户可读写的数据范围决定。参考 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)。示例值："Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

更多云文档接口权限问题，参考 [常见问题](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN)。

### 查询参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| file\_tokens | string\[\] | 是 | 素材文件的 token。获取方式如下所示：<br>- 新版文档：通过 [获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list) 接口获取指定文件块（File Block）或图片块（Image Block）的 token，即为素材 token。<br>- 电子表格：通过 [读取多个范围](https://open.feishu.cn/document/ukTMukTMukTM/ukTMzUjL5EzM14SOxMTN) 接口获取指定附件的`fileToken`，即为素材的 token。<br>- 多维表格：通过 [列出记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/list) 接口获取指定附件的 `file_token`，即为素材的 token。<br>如需一次获取多个素材的下载链接，可多次传递本参数及素材的 token 值，格式如下：<br>`https://{url}?file_tokens={token1}&file_tokens={token2}`<br>其中：<br>- `file_tokens` 是参数名，可以多次传递<br>- `token1` 和 `token2` 为素材的实际 token 值<br>- 一次最多可传递 5 个素材的 token，但在 API 调试台仅支持传一个 token<br>**示例值**：\["boxcnrHpsg1QDqXAAAyachabcef"\] |
| extra | string | 否 | 拓展信息，如拥有高级权限的多维表格在下载素材时，需要添加额外的扩展信息作为 URL 查询参数鉴权。详情参考 [extra 参数说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction)。未正确填写该参数的接口将返回 403 的 HTTP 状态码。<br>**示例值**："请参考 [extra 参数说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction)" |

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

curl-i-XGET'https://open.feishu.cn/open-apis/drive/v1/medias/batch\_get\_tmp\_download\_url?extra=%E8%AF%B7%E5%8F%82%E8%80%83+%5Bextra

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

8

9

10

11

12

{

"code": 0,

"msg": "success",

"data": {

"tmp\_download\_urls": \[\
\
            {\
\
"file\_token": "boxcnrHpsg1QDqXAAAyachabcef",\
\
"tmp\_download\_url": "https://internal-api-drive-stream.feishu.cn/space/api/box/stream/download/authcode/?code=ZDA3MzNiNmUwMjE2MGUzZmQ1OGZlOWYzMWQ4YmI0ZjdfMDYzOWNlZjgyMmI1MmY5NTUxZmM0MjJlYWIyMGVjOWZfSUQ6Njk3NjgzMTY0Mjc5OTI5MjQyMl8xNjI0NDMxMDY3OjE2MjQ1MTc0NjdfVjM"\
\
            }\
\
        \]

    }

}

### 错误码

| HTTP状态码 | 错误码 | 描述 | 排查建议 |
| --- | --- | --- | --- |
| 400 | 1061002 | params error. | 请检查请求参数是否正确。 |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fdrive-v1%2Fmedia%2Fbatch_get_tmp_download_url%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何为应用开通云文档相关资源的权限?](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[如何获取云文档资源相关 token？](https://open.feishu.cn/document/server-docs/docs/faq#08bb5df6)

[应用身份创建的文档，如何给用户授权？](https://open.feishu.cn/document/server-docs/docs/permission/faq#1f89d567)

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[如何选择不同类型的 access token？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

遇到其他问题？问问 开放平台智能助手

[上一篇：下载素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download) [下一篇：文档版本概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-version/overview)

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

查询参数

file\_tokens

\*

extra

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

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=batch_get_tmp_download_url&project=drive&resource=media&version=v1)

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#7bb6c149 "前提条件")

[注意事项](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#355ec8c0 "注意事项")

[请求](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#requestHeader "请求头")

[查询参数](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#queryParams "查询参数")

[请求示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url?lang=zh-CN#errorCode "错误码")

尝试一下

意见反馈

技术支持

收起

展开