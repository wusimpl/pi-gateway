---
url: "https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN"
title: "创建电子表格 - 服务端 API - 开发文档 - 飞书开放平台"
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

知识库

文档

电子表格

[电子表格概述](https://open.feishu.cn/document/server-docs/docs/sheets-v3/overview)

[电子表格常见问题](https://open.feishu.cn/document/server-docs/docs/sheets-v3/sheets-faq)

表格

[创建电子表格](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create)

[修改电子表格属性](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/patch)

[获取电子表格信息](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/get)

工作表

行列

单元格

数据

筛选

筛选视图

保护范围

数据校验

条件格式

浮动图片

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [电子表格](https://open.feishu.cn/document/server-docs/docs/sheets-v3/overview) [表格](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create)

创建电子表格

# 创建电子表格

复制页面

最后更新于 2025-05-07

本文内容

[请求](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#requestHeader "请求头")

[请求体](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#requestBody "请求体")

[请求示例](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#requestExample "请求示例")

[cURL 请求示例](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#88503b9f "cURL 请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#errorCode "错误码")

# 创建电子表格

在云空间指定目录下创建电子表格。可自定义表格标题。不支持带内容创建表格。

尝试一下

要基于模板创建电子表格，可先获取模板电子表格的 `spreadsheet_token` 作为文件 token，再调用 [复制文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/copy) 接口创建电子表格。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/sheets/v3/spreadsheets |
| HTTP Method | POST |
| 接口频率限制 | [20 次/分钟](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 <br>开启任一权限即可 | 查看、评论、编辑和管理云空间中所有文件<br>查看、评论、编辑和管理电子表格<br>创建电子表格 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | 应用调用 API 时，需要通过访问凭证（access\_token）进行身份鉴权，不同类型的访问凭证可获取的数据范围不同，参考 [选择并获取访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) 。<br>**值格式**："Bearer `access_token`"<br>**可选值如下**：<br>tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token) 。示例值："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>以登录用户身份调用 API，可读写的数据范围由用户可读写的数据范围决定。参考 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)。示例值："Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 请求体

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| title | string | 否 | 表格标题<br>**示例值**："Sales sheet"<br>**数据校验规则**：<br>- 长度范围：`0` 字符 ～ `255` 字符 |
| folder\_token | string | 否 | 文件夹 token。你可通过以下两种方式获取文件夹的 token：<br>- 文件夹的 URL：https://sample.feishu.cn/drive/folder/fldbcO1UuPz8VwnpPx5a92abcef<br>- 调用开放平台接口获取：<br>  - 调用 [获取我的空间（root folder）元数据](https://open.feishu.cn/document/ukTMukTMukTM/ugTNzUjL4UzM14CO1MTN/get-root-folder-meta) 接口获取根目录（即根文件夹）的 token。<br>  - 继续调用 [获取文件夹中的文件清单](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file/list) 接口，获取根目录下文件夹的 token。<br>**提示**：要在知识库中创建电子表格，你需调用 [创建知识空间节点](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/create) 接口，并选择表格（sheet）类型。<br>**示例值**："fldbcO1UuPz8VwnpPx5a92abcef" |

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

curl-i-X POST 'https://open.feishu.cn/open-apis/sheets/v3/spreadsheets' \

### cURL 请求示例

```

curl --location --request POST 'https://open.feishu.cn/open-apis/sheets/v3/spreadsheets' \
--header 'Authorization: Bearer u-3iqkd6KWzRLzNdXfeuCMEb' \
--header 'Content-Type: application/json' \
--data-raw '{
    "title":"sales sheet",
    "folder_token":"fldbcO1UuPz8VwnpPx5a92abcef"
}'
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

8

9

10

11

12

{

"code": 0,

"msg": "success",

"data": {

"spreadsheet": {

"title": "Sales sheet",

"folder\_token": "fldbcO1UuPz8VwnpPx5a92abcef",

"url": "https://example.feishu.cn/sheets/Iow7sNNEphp3WbtnbCscPqabcef",

"spreadsheet\_token": "Iow7sNNEphp3WbtnbCscPqabcef"

        }

    }

}

### 错误码

| HTTP状态码 | 错误码 | 描述 | 排查建议 |
| --- | --- | --- | --- |
| 500 | 1315203 | Server Error | 服务内部错误， [详询客服](https://applink.feishu.cn/client/helpdesk/open?id=6626260912531570952) |
| 400 | 1310204 | Wrong Request Body | 检查请求体参数, 参考响应体中的错误提示 |
| 400 | 1310213 | Permission Fail | 当前调用身份没有电子表格的阅读（获取相关接口）或编辑（创建、更新等相关接口）权限。请参考以下方式解决：<br>- 如果你使用的是 `tenant_access_token`，意味着当前应用没有电子表格的阅读或编辑权限。你需通过电子表格网页页面右上方 **「...」** -\> **「...更多」** -> **「添加文档应用」** 入口为应用添加权限。<br>  <br>  **说明**：在 **添加文档应用** 前，你需确保目标应用至少开通了一个云文档 [API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/scope-list)。否则你将无法在文档应用窗口搜索到目标应用。<br>  <br>  ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/22c027f63c540592d3ca8f41d48bb107_CSas7OYJBR.png?height=1994&maxWidth=550&width=3278)<br>  <br>- 如果你使用的是 `user_access_token`，意味着当前用户没有电子表格的阅读或编辑权限。你需通过电子表格网页页面右上方 **分享** 入口为当前用户添加权限。<br>  <br>  ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3e052d3bac56f9441296ae22e2969d63_a2DEYrJup8.png?height=278&maxWidth=550&width=1383)<br>  <br>了解具体操作步骤或其它添加权限方式，参考 [云文档常见问题 3](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)。 |
| 400 | 1310235 | Retry Later | 稍后重试 |
| 500 | 1315201 | Server Error | 服务内部错误， [详询客服](https://applink.feishu.cn/client/helpdesk/open?id=6626260912531570952) |
| 400 | 1310226 | Excess Limit | 超出限制，参考响应体中的错误提示 |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fsheets-v3%2Fspreadsheet%2Fcreate%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何获取并下载电子表格中的图片？](https://open.feishu.cn/document/server-docs/docs/sheets-v3/sheets-faq?lang=zh-CN#e04d4445)

[如何为应用开通云文档相关资源的权限?](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[如何获取云文档资源相关 token？](https://open.feishu.cn/document/server-docs/docs/faq#08bb5df6)

[应用身份创建的文档，如何给用户授权？](https://open.feishu.cn/document/server-docs/docs/permission/faq#1f89d567)

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

遇到其他问题？问问 开放平台智能助手

[上一篇：电子表格常见问题](https://open.feishu.cn/document/server-docs/docs/sheets-v3/sheets-faq) [下一篇：修改电子表格属性](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/patch)

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

只看必填参数

恢复示例值

格式化 JSON

JSON

更多

1

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

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=create&project=sheets&resource=spreadsheet&version=v3)

本文内容

[请求](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#requestHeader "请求头")

[请求体](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#requestBody "请求体")

[请求示例](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#requestExample "请求示例")

[cURL 请求示例](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#88503b9f "cURL 请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/sheets-v3/spreadsheet/create?lang=zh-CN#errorCode "错误码")

尝试一下

意见反馈

技术支持

收起

展开