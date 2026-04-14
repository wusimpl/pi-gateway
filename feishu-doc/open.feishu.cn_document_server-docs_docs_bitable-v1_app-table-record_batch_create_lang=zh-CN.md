---
url: "https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN"
title: "新增多条记录 - 服务端 API - 开发文档 - 飞书开放平台"
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

多维表格

[多维表格概述](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview)

[多维表格常见问题](https://open.feishu.cn/document/docs/bitable-v1/faq)

[数据结构概述](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-structure)

多维表格

数据表

视图

记录

[多维表格记录数据结构](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/bitable-record-data-structure-overview)

[记录筛选参数填写说明](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide)

[多维表格中添加子记录](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/add-a-sub-record-in-a-base-table)

[新增记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/create)

[更新记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/update)

[查询记录](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search)

[删除记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/delete)

[新增多条记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create)

[更新多条记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_update)

[批量获取记录](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/batch_get)

[删除多条记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_delete)

字段

字段编组

仪表盘

表单

高级权限

自动化流程

工作流

事件

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [多维表格](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview) [记录](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/bitable-record-data-structure-overview)

新增多条记录

# 新增多条记录

复制页面

最后更新于 2025-07-21

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#7bb6c149 "前提条件")

[注意事项](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#355ec8c0 "注意事项")

[请求](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#requestHeader "请求头")

[路径参数](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#queryParams "查询参数")

[请求体](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#requestBody "请求体")

[请求示例](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#errorCode "错误码")

# 新增多条记录

在多维表格数据表中新增多条记录，单次调用最多新增 1,000 条记录。

尝试一下

## 前提条件

调用此接口前，请确保当前调用身份（tenant\_access\_token 或 user\_access\_token）已有多维表格的编辑等文档权限，否则接口将返回 HTTP 403 或 400 状态码。了解更多，参考 [如何为应用或用户开通文档权限](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#16c6475a)。

## 注意事项

从其它数据源同步的数据表，不支持对记录进行增加、删除、和修改操作。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/bitable/v1/apps/:app\_token/tables/:table\_id/records/batch\_create |
| HTTP Method | POST |
| 接口频率限制 | [50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 <br>开启任一权限即可 | 新增记录<br>查看、评论、编辑和管理多维表格 |
| 字段权限要求 | 该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户基本信息<br>获取用户 user ID<br>仅自建应用<br>以应用身份访问通讯录<br>历史版本<br>读取通讯录<br>历史版本<br>以应用身份读取通讯录<br>历史版本 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | 应用调用 API 时，需要通过访问凭证（access\_token）进行身份鉴权，不同类型的访问凭证可获取的数据范围不同，参考 [选择并获取访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) 。<br>**值格式**："Bearer `access_token`"<br>**可选值如下**：<br>tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token) 。示例值："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>以登录用户身份调用 API，可读写的数据范围由用户可读写的数据范围决定。参考 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)。示例值："Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 路径参数

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| app\_token | string | 多维表格 App 的唯一标识。不同形态的多维表格，其 app\_token 的获取方式不同：<br>- 如果多维表格的 URL 以 **feishu.cn/base** 开头，该多维表格的 app\_token 是下图高亮部分：![app_token.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6916f8cfac4045ba6585b90e3afdfb0a_GxbfkJHZBa.png?height=766&lazyload=true&width=3004)<br>  <br>- 如果多维表格的 URL 以 **feishu.cn/wiki** 开头，你需调用知识库相关 [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node) 接口获取多维表格的 app\_token。当 obj\_type 的值为 bitable 时，obj\_token 字段的值才是多维表格的 app\_token。<br>  <br>了解更多，参考 [多维表格 app\_token 获取方式](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview#-752212c)。<br>**示例值**："appbcbWCzen6D8dezhoCH2RpMAh" |
| table\_id | string | 多维表格数据表的唯一标识。获取方式：<br>- 你可通过多维表格 URL 获取 `table_id`，下图高亮部分即为当前数据表的 `table_id`<br>  <br>- 也可通过 [列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list) 接口获取 `table_id`<br>  <br>  <br>  <br>  <br>  <br>  ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/18741fe2a0d3cafafaf9949b263bb57d_yD1wkOrSju.png?height=746&lazyload=true&maxWidth=700&width=2976)<br>  <br>**示例值**："tblsRc9GRRXKqhvW" |

### 查询参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| user\_id\_type | string | 否 | 用户 ID 类型<br>**示例值**："open\_id"<br>**可选值有**：<br>- `open_id`：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。 [了解更多：如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- `union_id`：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。 [了解更多：如何获取 Union ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- `user_id`：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。 [了解更多：如何获取 User ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID<br>仅自建应用 |
| client\_token | string | 否 | 格式为标准的 uuidv4，操作的唯一标识，用于幂等的进行更新操作。此值为空表示将发起一次新的请求，此值非空表示幂等的进行更新操作。<br>**示例值**："fe599b60-450f-46ff-b2ef-9f6675625b97" |
| ignore\_consistency\_check | boolean | 否 | 是否忽略一致性读写检查，默认为 false，即在进行读写操作时，系统将确保读取到的数据和写入的数据是一致的。可选值：<br>- true：忽略读写一致性检查，提高性能，但可能会导致某些节点的数据不同步，出现暂时不一致<br>- false：开启读写一致性检查，确保数据在读写过程中一致<br>**示例值**：true |

### 请求体

| 名称<br>展开子列表 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| records | app.table.record\[\] | 是 | 要新增的记录列表 |

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

curl-i-X POST 'https://open.feishu.cn/open-apis/bitable/v1/apps/appbcbWCzen6D8dezhoCH2RpMAh/tables/tblsRc9GRRXKqhvW/records/batch\_create?client\_token=fe599b60-450f-46ff-b2ef-9f6675625b97&

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

13

14

15

16

17

18

19

20

{

"code": 0,

"data": {

"records": \[\
\
      {\
\
"fields": {\
\
"任务名称": "维护客户关系",\
\
"创建日期": 1674206443000,\
\
"截止日期": 1674206443000\
\
        },\
\
"id": "recusyQbB0fVL5",\
\
"record\_id": "recusyQbB0fVL5"\
\
      },\
\
      {\
\
"fields": {\
\
"任务名称": "跟进与谈判",\
\
"创建日期": 1674206443000,\
\
"截止日期": 1674206443000\
\
        },\
\
"id": "recusyQbB0CJjX",\
\
### 错误码\
\
| HTTP状态码 | 错误码 | 描述 | 排查建议 |\
| --- | --- | --- | --- |\
| 200 | 1254000 | WrongRequestJson | 请求体错误 |\
| 200 | 1254001 | WrongRequestBody | 请求体错误 |\
| 200 | 1254002 | Fail | 导致报 1254002 错误码的场景较多，请参考以下建议排查：<br>- 如果单次操作的内容变更较大，请尝试在单次操作中减少数据量<br>- 如果你并发调用了接口，请尝试控制请求间隔，稍后重试<br>- 如果在知识库（wiki）中创建多维表格，请检查你是否使用了知识库 [创建知识空间节点](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/create) 接口创建多维表格。在此场景下不能使用 [创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create) 接口<br>- 请检查接口参数是否有误。例如，在分页查询多维表格时，传递了无效的 page\_token，或传递了错误的数据表的 table\_id<br>- 如果该报错偶尔发生，可能是服务器超时或不稳定，请重试解决 |\
| 200 | 1254003 | WrongBaseToken | app\_token 错误。app\_token 是多维表格 App 的唯一标识。不同形态的多维表格，其 `app_token` 的获取方式不同：<br>- 如果多维表格的 URL 以 **feishu.cn/base** 开头，该多维表格的 `app_token` 是下图高亮部分：![app_token.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6916f8cfac4045ba6585b90e3afdfb0a_GxbfkJHZBa.png?height=766&lazyload=true&width=3004)<br>  <br>- 如果多维表格的 URL 以 **feishu.cn/wiki** 开头，你需调用知识库相关 [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node) 接口获取多维表格的 app\_token。当 `obj_type` 的值为 `bitable` 时，`obj_token` 字段的值才是多维表格的 `app_token`。<br>  <br>了解更多，参考 [多维表格 app\_token 获取方式](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview#-752212c)。 |\
| 200 | 1254004 | WrongTableId | table\_id 错误。table\_id 是多维表格数据表的唯一标识。获取方式：<br>- 你可通过多维表格 URL 获取 `table_id`，下图高亮部分即为当前数据表的 `table_id`<br>  <br>- 也可通过 [列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list) 接口获取 `table_id`<br>  <br>  <br>  <br>  <br>  <br>  ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/18741fe2a0d3cafafaf9949b263bb57d_yD1wkOrSju.png?height=746&lazyload=true&maxWidth=700&width=2976) |\
| 200 | 1254005 | WrongViewId | view\_id 错误。view\_id 是多维表格中视图的唯一标识。获取方式：<br>- 在多维表格的 URL 地址栏中，`view_id` 是下图中高亮部分：![view_id.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/140668632c97e0095832219001d17c54_DJMgVH9x2S.png?height=748&lazyload=true&width=2998)<br>- 通过 [列出视图](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/list) 接口获取。暂时无法获取到嵌入到云文档中的多维表格的 `view_id`。<br>**注意**：当 `filter` 参数 或 `sort` 参数不为空时，请求视为对数据表中的全部数据做条件过滤，指定的 `view_id` 会被忽略。 |\
| 200 | 1254006 | WrongRecordId | record\_id 错误。record\_id 是数据表中一条记录的唯一标识。通过 [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 接口获取 |\
| 200 | 1254007 | EmptyValue | 空值 |\
| 200 | 1254008 | EmptyView | 空视图 |\
| 200 | 1254009 | WrongFieldId | field\_id 错误。field\_id 是数据表中一个字段的唯一标识。通过 [列出字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list) 接口获取 |\
| 200 | 1254010 | ReqConvError | 请求错误 |\
| 400 | 1254015 | Field types do not match. | 字段类型不匹配，请检查传入的记录内容是否符合对应字段类型的格式要求 |\
| 403 | 1254027 | UploadAttachNotAllowed | 附件未挂载, 禁止上传 |\
| 200 | 1254030 | TooLargeResponse | 响应体过大 |\
| 400 | 1254036 | Base is copying, please try again later. | 复制多维表格为异步操作，该错误码表示当前多维表格仍在复制中，在复制期间无法操作当前多维表格。需要等待复制完成后再操作 |\
| 400 | 1254037 | Invalid client token, make sure that it complies with the specification. | 幂等键格式错误，需要传入 uuidv4 格式 |\
| 200 | 1254040 | BaseTokenNotFound | app\_token 不存在。不同形态的多维表格，其 `app_token` 的获取方式不同：<br>- 如果多维表格的 URL 以 **feishu.cn/base** 开头，该多维表格的 `app_token` 是下图高亮部分：![app_token.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6916f8cfac4045ba6585b90e3afdfb0a_GxbfkJHZBa.png?height=766&lazyload=true&width=3004)<br>  <br>- 如果多维表格的 URL 以 **feishu.cn/wiki** 开头，你需调用知识库相关 [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node) 接口获取多维表格的 app\_token。当 `obj_type` 的值为 `bitable` 时，`obj_token` 字段的值才是多维表格的 `app_token`。<br>  <br>了解更多，参考 [多维表格 app\_token 获取方式](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview#-752212c)。 |\
| 200 | 1254041 | TableIdNotFound | table\_id 不存在。获取方式：<br>- 你可通过多维表格 URL 获取 `table_id`，下图高亮部分即为当前数据表的 `table_id`<br>  <br>- 也可通过 [列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list) 接口获取 `table_id`<br>  <br>  <br>  <br>  <br>  <br>  ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/18741fe2a0d3cafafaf9949b263bb57d_yD1wkOrSju.png?height=746&lazyload=true&maxWidth=700&width=2976) |\
| 200 | 1254042 | ViewIdNotFound | view\_id 不存在。获取方式：<br>- 在多维表格的 URL 地址栏中，`view_id` 是下图中高亮部分：![view_id.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/140668632c97e0095832219001d17c54_DJMgVH9x2S.png?height=748&lazyload=true&width=2998)<br>- 通过 [列出视图](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-view/list) 接口获取。暂时无法获取到嵌入到云文档中的多维表格的 `view_id`。<br>**注意**：当 `filter` 参数 或 `sort` 参数不为空时，请求视为对数据表中的全部数据做条件过滤，指定的 `view_id` 会被忽略。 |\
| 200 | 1254043 | RecordIdNotFound | record\_id 不存在。record\_id 是数据表中一条记录的唯一标识。请通过 [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 接口获取 |\
| 200 | 1254044 | FieldIdNotFound | field\_id 不存在。field\_id 是数据表中一个字段的唯一标识。通过 [列出字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list) 接口获取 |\
| 200 | 1254045 | FieldNameNotFound | 字段名称不存在。请检查：<br>- 接口中字段名称和多维表格中的字段名称是否完全匹配。如果难以排查，建议你调用 [列出字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list) 接口获取字段名称，因为根据表格页面的 UI 名称可能会忽略空格、换行或特殊符号等差异。<br>- 表格是否开启了高级权限但调用身份缺少对应字段的权限。你需要为调用身份授予高级权限：<br>  - 对用户授予高级权限，你需要在多维表格页面右上方 **分享** 入口为当前用户添加可管理权限。![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/df3911b4f747d75914f35a46962d667d_dAsfLjv3QC.png?height=546&lazyload=true&maxWidth=550)<br>    <br>  - 对应用授予高级权限，你需通过多维表格页面右上方 **「...」** -\> **「...更多」** -> **「添加文档应用」** 入口为应用添加可管理权限。<br>    <br>    ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/22c027f63c540592d3ca8f41d48bb107_CSas7OYJBR.png?height=1994&maxWidth=550&width=3278)<br>    <br>    ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9f3353931fafeea16a39f0eb887db175_0tjzC9P3zU.png?maxWidth=550)**注意**：在 **添加文档应用** 前，你需确保目标应用至少开通了一个多维表格的 [API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/scope-list)。否则你将无法在文档应用窗口搜索到目标应用。<br>    <br>  - 你也可以在 **多维表格高级权限设置** 中添加用户或一个包含应用的群组, 给予这个群自定义的读写等权限。 |\
| 200 | 1254060 | TextFieldConvFail | 多行文本字段错误 |\
| 200 | 1254061 | NumberFieldConvFail | 数字字段错误 |\
| 200 | 1254062 | SingleSelectFieldConvFail | 单选字段错误 |\
| 200 | 1254063 | MultiSelectFieldConvFail | 多选字段错误 |\
| 200 | 1254064 | DatetimeFieldConvFail | 日期字段错误 |\
| 200 | 1254065 | CheckboxFieldConvFail | 复选框字段错误 |\
| 200 | 1254066 | UserFieldConvFail | 人员字段有误。原因可能是：<br>- `user_id_type` 参数指定的 ID 类型与传入的 ID 类型不匹配<br>- 传入了不识别的类型或结构，目前只支持填写 `id` 参数，且需要传入数组<br>- 跨应用传入了 `open_id`。如果跨应用传入 ID，建议使用 `user_id`。不同应用获取的 `open_id` 不能交叉使用<br>- 若想对人员字段传空，可传 null |\
| 200 | 1254067 | LinkFieldConvFail | 关联字段错误 |\
| 200 | 1254068 | URLFieldConvFail | 超链接字段错误 |\
| 200 | 1254069 | AttachFieldConvFail | 附件字段错误 |\
| 200 | 1254072 | Failed to convert phone field, please make sure it is correct. | 电话字段错误 |\
| 400 | 1254074 | DuplexLinkFieldConvFail | 参数无效，需要使用字符串数组 |\
| 200 | 1254100 | TableExceedLimit | 数据表或仪表盘数量超限。每个多维表格中，数据表加仪表盘的数量最多为 100 个 |\
| 200 | 1254101 | ViewExceedLimit | 视图数量超限, 限制200个 |\
| 200 | 1254102 | FileExceedLimit | 超限 |\
| 200 | 1254103 | RecordExceedLimit | 记录数量超限, 限制20,000条 |\
| 200 | 1254104 | RecordAddOnceExceedLimit | 单次添加记录数量超限, 单次调用最多更新 1,000 条记录 |\
| 200 | 1254105 | ColumnExceedLimit | 字段数量超限 |\
| 200 | 1254106 | AttachExceedLimit | 附件过多 |\
| 200 | 1254130 | TooLargeCell | 格子内容过大 |\
| 200 | 1254290 | TooManyRequest | 请求过快，稍后重试 |\
| 200 | 1254291 | Write conflict | 在同一个数据表中，并发调用了读写接口或请求过快，出现冲突。请参考以下建议解决：<br>- 确保没有并发调用多维表格读写相关接口<br>- 若操作量较大，建议在接口与接口之间增加 0.5 或 1 秒的延迟，也可在报错中增加重试逻辑，确保业务的稳定性<br>- 对于写接口，可以将接口中的查询参数 `ignore_consistency_check` 设置为 true，表示在读写操作时，暂时忽略一致性检查，以提高性能 |\
| 200 | 1254301 | OperationTypeError | 多维表格未开启高级权限或不支持开启高级权限 |\
| 200 | 1254303 | AttachPermNotAllow | 没有写入附件至多维表格的权限。要在多维表格中写入附件，你需先调用 [上传素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all) 接口，将附件上传到当前多维表格中，再新增记录 |\
| 200 | 1255001 | InternalError | 内部错误，请联系 [技术支持](https://applink.feishu.cn/TLJpeNdW) |\
| 200 | 1255002 | RpcError | 内部错误，请联系 [技术支持](https://applink.feishu.cn/TLJpeNdW) |\
| 200 | 1255003 | MarshalError | 序列化错误，请联系 [技术支持](https://applink.feishu.cn/TLJpeNdW) |\
| 200 | 1255004 | UmMarshalError | 反序列化错误 |\
| 200 | 1255005 | ConvError | 内部错误，请联系 [技术支持](https://applink.feishu.cn/TLJpeNdW) |\
| 400 | 1255006 | Client token conflict, please generate a new client token and try again. | 幂等键冲突，需要重新随机生成一个幂等键 |\
| 504 | 1255040 | 请求超时 | 进行重试 |\
| 400 | 1254607 | Data not ready, please try again later | 该报错一般是由于前置操作未执行完成，或本次操作数据太大，服务器计算超时导致。遇到该错误码时，建议等待一段时间后重试。通常有以下几种原因：<br>- **编辑操作频繁**：开发者对多维表格的编辑操作非常频繁。可能会导致由于等待前置操作处理完成耗时过长而超时的情况。多维表格底层对数据表的处理基于版本维度的串行方式，不支持并发。因此，并发请求时容易出现此类错误，不建议开发者对单个数据表进行并发请求。<br>  <br>- **批量操作负载重**：开发者在多维表格中进行批量新增、删除等操作时，如果数据表的数据量非常大，可能会导致单次请求耗时过长，最终导致请求超时。建议开发者适当降低批量请求的 page\_size 以减少请求耗时。<br>  <br>- **资源分配与计算开销**：资源分配是基于单文档维度的，如果读接口涉及公式计算、排序等计算逻辑，会占用较多资源。例如，并发读取一个文档下的多个数据表也可能导致该文档阻塞。 |\
| 403 | 1254302 | Permission denied. | 调用身份缺少多维表格的高级权限。你需给予调用身份数据表的 **可管理** 权限或多维表格的 **可管理** 等权限，再重新调用。具体步骤如下所示：<br>- 对用户授予高级权限，你可在 **多维表格高级权限设置** 中添加用户，为用户开通足够权限；或在多维表格页面右上方 **分享** 入口为当前用户添加可管理权限。详情参考飞书帮助中心文档 [使用多维表格高级权限](https://www.feishu.cn/hc/zh-CN/articles/588604550568-%E4%BD%BF%E7%94%A8%E5%A4%9A%E7%BB%B4%E8%A1%A8%E6%A0%BC%E9%AB%98%E7%BA%A7%E6%9D%83%E9%99%90)。<br>  <br>  ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/df3911b4f747d75914f35a46962d667d_dAsfLjv3QC.png?height=546&lazyload=true&maxWidth=550)<br>  <br>- 对应用授予高级权限，你需通过多维表格页面右上方 **「...」** -\> **「...更多」** -> **「添加文档应用」** 入口为应用添加可管理权限。<br>  <br>  <br>  <br>  <br>  <br>  ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/22c027f63c540592d3ca8f41d48bb107_CSas7OYJBR.png?height=1994&lazyload=true&maxWidth=550&width=3278)<br>  <br>  <br>  <br>  <br>  <br>  <br>  <br>  <br>  <br>  ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9f3353931fafeea16a39f0eb887db175_0tjzC9P3zU.png?height=728&lazyload=true&maxWidth=550&width=890)<br>  <br>  <br>  <br>  <br>  <br>  **注意**：在 **添加文档应用** 前，你需确保目标应用至少开通了一个多维表格的 [API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/scope-list)。否则你将无法在文档应用窗口搜索到目标应用。<br>  <br>- 你也可以在 **多维表格高级权限设置** 中添加用户或一个包含应用的群组，给予这个群自定义的读写等权限。 |\
| 403 | 1254304 | Permission denied. | 权限不足。请检查多维表格是否开启了高级权限，如果开启高级权限，调用身份需要有多维表格的可管理权限 |\
| 403 | 1254306 | The tenant or base owner is subject to base plan limits. | 联系租户管理员申请权益 |\
| 403 | 1254608 | Same API requests are submitted repeatedly. | 基于同一个多维表格版本重复提交了更新请求（传入了相同的 client\_token），常见于并发或时间间隔极短的请求，例如并发将一个视图的信息更新为相同的内容。建议稍后重试 |\
\
[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fbitable-v1%2Fapp-table-record%2Fbatch_create%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错\
\
相关问题\
\
[如何为应用开通多维表格权限？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app?lang=zh-CN#223459af)\
\
[如何在多维表格中新增带有附件的记录？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=zh-CN#-9713c8d)\
\
[多维表格中的筛选参数 filter 怎么填写？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/record-filter-guide)\
\
[如何下载多维表格记录中的附件？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=zh-CN#0780e12f)\
\
[如何筛选人员字段？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=zh-CN#b91b2c7)\
\
遇到其他问题？问问 开放平台智能助手\
\
[上一篇：删除记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/delete) [下一篇：更新多条记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_update)\
\
请先登录后再进行调试\
\
登录\
\
API 调试台\
\
示例代码\
\
更多\
\
请求头\
\
Authorization\
\
\*\
\
切换为user\_access\_token\
\
Bearer\
\
tenant\_access\_token\
\
获取 Token\
\
路径参数\
\
app\_token\
\
\*\
\
示例值："bascng7vrxcxpig7geggXiCtbdY"\
\
table\_id\
\
\*\
\
示例值："tblsRc9GRRXKqhvW"\
\
查询参数\
\
user\_id\_type\
\
client\_token\
\
示例值："fe599b60-450f-46ff-b2ef-9f6675625b97"\
\
ignore\_consistency\_check\
\
示例值："true"\
\
请求体\
\
只看必填参数\
\
恢复示例值\
\
格式化 JSON\
\
JSON\
\
更多\
\
1\
\
调试结果\
\
![](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/31dafaca1b39955beda5239fff26f1eb.svg)\
\
点击“开始调试”查看结果\
\
已将 API 调试台的参数填入下方的示例代码中\
\
cURL\
\
Go SDK\
\
Python SDK\
\
Java SDK\
\
Node SDK\
\
更多\
\
1\
\
开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=batch_create&project=bitable&resource=app.table.record&version=v1)\
\
本文内容\
\
[前提条件](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#7bb6c149 "前提条件")\
\
[注意事项](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#355ec8c0 "注意事项")\
\
[请求](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#request "请求")\
\
[请求头](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#requestHeader "请求头")\
\
[路径参数](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#pathParams "路径参数")\
\
[查询参数](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#queryParams "查询参数")\
\
[请求体](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#requestBody "请求体")\
\
[请求示例](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#requestExample "请求示例")\
\
[响应](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#response "响应")\
\
[响应体](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#responseBody "响应体")\
\
[响应体示例](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#responseBodyExample "响应体示例")\
\
[错误码](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create?lang=zh-CN#errorCode "错误码")\
\
尝试一下\
\
意见反馈\
\
技术支持\
\
收起\
\
展开