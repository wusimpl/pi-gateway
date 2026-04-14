---
url: "https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN"
title: "下载素材 - 服务端 API - 开发文档 - 飞书开放平台"
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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [云空间](https://open.feishu.cn/document/server-docs/docs/drive-v1/introduction) [素材](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction)

下载素材

# 下载素材

复制页面

最后更新于 2025-01-03

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#7bb6c149 "前提条件")

[注意事项](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#355ec8c0 "注意事项")

[使用限制](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#cac79090 "使用限制")

[请求](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#requestHeader "请求头")

[部分下载](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#eeaf2681 "部分下载")

[路径参数](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#queryParams "查询参数")

[请求示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#5549b31b "请求示例")

[请求示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#response "响应")

[响应头](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#1d3a2c90 "响应头")

[状态码](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#-921a125 "状态码")

[后续操作](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#9392341b "后续操作")

# 下载素材

下载各类云文档中的素材，例如电子表格中的图片。该接口支持通过在请求头添加`Range` 参数分片下载素材。

尝试一下

## 前提条件

调用此接口之前，你需确保应用已拥有素材的下载权限。否则接口将返回 403 的 HTTP 状态码。参考 [云空间常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/faq) 第 3 点了解如何分享素材的下载权限给应用。更多云文档接口权限问题，参考 [云文档常见问题](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN)。

## 注意事项

本接口仅支持下载云文档而非云空间中的资源文件。如要下载云空间中的资源文件，需调用 [下载文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/download) 接口。

## 使用限制

该接口调用频率上限为 5 QPS，10000 次/天。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/drive/v1/medias/:file\_token/download |
| HTTP Method | GET |
| 接口频率限制 | [特殊频控](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 <br>开启任一权限即可 | 查看、评论、编辑和管理多维表格<br>查看、评论和导出多维表格<br>查看、评论、编辑和管理文档<br>查看、评论和导出文档<br>下载云文档中的图片和附件<br>查看、评论、编辑和管理云空间中所有文件<br>查看、评论和下载云空间中所有文件<br>查看、评论、编辑和管理电子表格<br>查看、评论和导出电子表格 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | 应用调用 API 时，需要通过访问凭证（access\_token）进行身份鉴权，不同类型的访问凭证可获取的数据范围不同，参考 [选择并获取访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) 。<br>**值格式**："Bearer `access_token`"<br>**可选值如下**：<br>tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token) 。示例值："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>以登录用户身份调用 API，可读写的数据范围由用户可读写的数据范围决定。参考 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)。示例值："Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 部分下载

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Range | string | 否 | 在 HTTP 请求头中，通过指定 `Range` 来下载素材的部分内容，单位是字节（byte）。该参数的格式为 `Range: bytes=start-end`，示例值为 `Range: bytes=0-1024`，表示下载第 0 个字节到第 1024 个字节之间的数据。 |

### 路径参数

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| file\_token | string | 素材文件的 token。获取方式如下所示：<br>- 新版文档：通过 [获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list) 接口获取指定文件块（File Block）或图片块（Image Block）的 token，即为素材的 token。<br>- 电子表格：通过 [读取多个范围](https://open.feishu.cn/document/ukTMukTMukTM/ukTMzUjL5EzM14SOxMTN) 接口获取指定附件的`fileToken` 参数，即为素材的 token。<br>- 多维表格：通过 [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 接口获取指定附件的 `file_token`，即为素材的 token。<br>**示例值**："boxcnrHpsg1QDqXAAAyachabcef" |

### 查询参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| extra | string | 否 | 拥有高级权限的多维表格在下载素材时，需要添加额外的扩展信息作为 URL 查询参数鉴权。详情参考 [素材概述-extra 参数说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction)。<br>**示例值**："无" |

### 请求示例

以下代码展示如何使用 `cURL` 命令下载素材。并将素材命名为 local\_file。

```

# 将 Token 为 file_token 的素材下载到本地，并命名为 local_file，注意 file_token、local_file 和 authorization 要替换为真实值
curl -i -X GET 'https://open.feishu.cn/open-apis/drive/v1/medias/{file_token}/download' -o "{local_file}" \
-H 'Authorization: {authorization}'
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

## 响应

### 响应头

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| content-type | string | 素材文件的`MIME` |
| content-disposition | string | 文件名 |

HTTP状态码为 200 时，表示成功

返回文件二进制流

## 状态码

| HTTP 状态码 | 描述 |
| --- | --- |
| 200 | 素材成功下载。返回文件二进制流。 |
| 206 | 下载部分内容成功。接口将返回指定 Range 的部分文件的二进制流。 |
| 400 | 对于开启了高级权限的多维表格，你需确保已正确添加额外的扩展信息作为 URL 查询参数鉴权。详情参考 [素材概述-extra 参数说明](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/introduction)。 |
| 403 | 没有下载素材的权限。要下载云文档中的素材，你需确保调用身份拥有文档资源权限。详情参考 [云文档常见问题 3](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a) 开通权限。如果多维表格开启了高级权限，你需确保调用身份拥有可管理权限。 |
| 404 | 素材 token 不存在或素材被删除。请检查 token 是否有误以及素材是否存在。 |
| 500 | 服务端内部异常。请重试或联系 [技术支持](https://applink.feishu.cn/TLJpeNdW)。 |

## 后续操作

接口调用成功后，你可以通过访问你在下载时指定的本地下载目录，对已下载的素材进行下一步操作。

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fdrive-v1%2Fmedia%2Fdownload%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：分片上传素材-完成上传](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/multipart-upload-media/upload_finish) [下一篇：获取素材临时下载链接](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/batch_get_tmp_download_url)

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

路径参数

file\_token

\*

查询参数

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

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=download&project=drive&resource=media&version=v1)

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#7bb6c149 "前提条件")

[注意事项](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#355ec8c0 "注意事项")

[使用限制](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#cac79090 "使用限制")

[请求](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#requestHeader "请求头")

[部分下载](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#eeaf2681 "部分下载")

[路径参数](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#queryParams "查询参数")

[请求示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#5549b31b "请求示例")

[请求示例](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#response "响应")

[响应头](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#1d3a2c90 "响应头")

[状态码](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#-921a125 "状态码")

[后续操作](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/download?lang=zh-CN#9392341b "后续操作")

尝试一下

意见反馈

技术支持

收起

展开