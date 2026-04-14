---
url: "https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN"
title: "列出数据表 - 服务端 API - 开发文档 - 飞书开放平台"
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

[新增一个数据表](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/create)

[新增多个数据表](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/batch_create)

[更新数据表](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/patch)

[列出数据表](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list)

[删除一个数据表](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/delete)

[删除多个数据表](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/batch_delete)

视图

记录

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [多维表格](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview) [数据表](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/create)

列出数据表

# 列出数据表

复制页面

最后更新于 2025-07-21

本文内容

[请求](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#requestHeader "请求头")

[路径参数](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#queryParams "查询参数")

[请求示例](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#errorCode "错误码")

# 列出数据表

列出多维表格中的所有数据表，包括其 ID、版本号和名称。

尝试一下

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/bitable/v1/apps/:app\_token/tables |
| HTTP Method | GET |
| 接口频率限制 | [20 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 <br>开启任一权限即可 | 获取数据表信息<br>查看、评论、编辑和管理多维表格<br>查看、评论和导出多维表格 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | 应用调用 API 时，需要通过访问凭证（access\_token）进行身份鉴权，不同类型的访问凭证可获取的数据范围不同，参考 [选择并获取访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) 。<br>**值格式**："Bearer `access_token`"<br>**可选值如下**：<br>tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token) 。示例值："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>以登录用户身份调用 API，可读写的数据范围由用户可读写的数据范围决定。参考 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)。示例值："Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 路径参数

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| app\_token | string | 多维表格 App 的唯一标识。不同形态的多维表格，其 `app_token` 的获取方式不同：<br>- 如果多维表格的 URL 以 **feishu.cn/base** 开头，该多维表格的 `app_token` 是下图高亮部分：![app_token.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6916f8cfac4045ba6585b90e3afdfb0a_GxbfkJHZBa.png?height=766&lazyload=true&width=3004)<br>  <br>- 如果多维表格的 URL 以 **feishu.cn/wiki** 开头，你需调用知识库相关 [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node) 接口获取多维表格的 app\_token。当 `obj_type` 的值为 `bitable` 时，`obj_token` 字段的值才是多维表格的 `app_token`。<br>  <br>了解更多，参考 [多维表格 app\_token 获取方式](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview#-752212c)。<br>**示例值**："appbcbWCzen6D8dezhoCH2RpMAh" |

### 查询参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| page\_token | string | 否 | 分页标记，第一次请求不填，表示从头开始遍历；分页查询结果还有更多项时会同时返回新的 page\_token，下次遍历可采用该 page\_token 获取查询结果<br>**示例值**："tblsRc9GRRXKqhvW" |
| page\_size | int | 否 | 分页大小<br>**示例值**：10<br>**默认值**：`20`<br>**数据校验规则**：<br>- 最大值：`100` |

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

curl-i-XGET'https://open.feishu.cn/open-apis/bitable/v1/apps/appbcbWCzen6D8dezhoCH2RpMAh/tables?page\_size=10&page\_token=tblsRc9GRRXKqhvW' \

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

{

"code": 0,

"msg": "success",

"data": {

"has\_more": false,

"page\_token": "tblKz5D60T4JlfcT",

"total": 1,

"items": \[\
\
            {\
\
"table\_id": "tblKz5D60T4JlfcT",\
\
"revision": 1,\
\
"name": "数据表1"\
\
            }\
\
        \]

    }

}

### 错误码

| HTTP状态码 | 错误码 | 描述 | 排查建议 |
| --- | --- | --- | --- |
| 200 | 1254000 | WrongRequestJson | 请求体错误 |
| 200 | 1254001 | WrongRequestBody | 请求体错误 |
| 200 | 1254002 | Fail | 内部错误，有疑问可咨询客服 |
| 200 | 1254003 | WrongBaseToken | app\_token 错误 |
| 200 | 1254004 | WrongTableId | table\_id 错误 |
| 200 | 1254005 | WrongViewId | view\_id 错误 |
| 200 | 1254006 | WrongRecordId | 检查 record\_id |
| 200 | 1254007 | EmptyValue | 空值 |
| 200 | 1254008 | EmptyView | 空视图 |
| 200 | 1254009 | WrongFieldId | 字段 id 错误 |
| 200 | 1254010 | ReqConvError | 请求错误 |
| 400 | 1254011 | Page size must greater than 0. | 确认page\_size参数的值符合要求。 |
| 200 | 1254030 | TooLargeResponse | 响应体过大 |
| 400 | 1254036 | Base is copying, please try again later. | 多维表格副本复制中，稍后重试 |
| 200 | 1254040 | BaseTokenNotFound | app\_token 不存在 |
| 200 | 1254041 | TableIdNotFound | table\_id 不存在 |
| 200 | 1254042 | ViewIdNotFound | view\_id 不存在 |
| 200 | 1254043 | RecordIdNotFound | record\_id 不存在 |
| 200 | 1254044 | FieldIdNotFound | field\_id 不存在 |
| 200 | 1254060 | TextFieldConvFail | 多行文本字段错误 |
| 200 | 1254061 | NumberFieldConvFail | 数字字段错误 |
| 200 | 1254062 | SingleSelectFieldConvFail | 单选字段错误 |
| 200 | 1254063 | MultiSelectFieldConvFail | 多选字段错误 |
| 200 | 1254064 | DatetimeFieldConvFail | 日期字段错误 |
| 200 | 1254065 | CheckboxFieldConvFail | 复选框字段错误 |
| 200 | 1254066 | UserFieldConvFail | 人员字段有误。原因可能是：<br>- `user_id_type` 参数指定的 ID 类型与传入的 ID 类型不匹配<br>- 传入了不识别的类型或结构，目前只支持填写 `id` 参数，且需要传入数组<br>- 跨应用传入了 `open_id`。如果跨应用传入 ID，建议使用 `user_id`。不同应用获取的 `open_id` 不能交叉使用 |
| 200 | 1254067 | LinkFieldConvFail | 关联字段错误 |
| 200 | 1254100 | TableExceedLimit | 数据表或仪表盘数量超限。每个多维表格中，数据表加仪表盘的数量最多为 100 个 |
| 200 | 1254101 | ViewExceedLimit | 视图数量超限, 限制200个 |
| 200 | 1254102 | FileExceedLimit | 超限 |
| 200 | 1254103 | RecordExceedLimit | 记录数量超限, 限制20,000条 |
| 200 | 1254104 | RecordAddOnceExceedLimit | 单次添加记录数量超限, 限制500条 |
| 200 | 1254130 | TooLargeCell | 格子内容过大 |
| 200 | 1254290 | TooManyRequest | 请求过快，稍后重试 |
| 200 | 1254291 | Write conflict | 同一个数据表(table) 不支持并发调用写接口，请检查是否存在并发调用写接口。写接口包括：新增、修改、删除记录；新增、修改、删除字段；修改表单；修改视图等。 |
| 200 | 1254301 | OperationTypeError | 多维表格未开启高级权限或不支持开启高级权限 |
| 403 | 1254302 | The role has no permissions. | 无访问权限, 常由表格开启了高级权限造成, 如果是用应用请求的话，目前有两种方法对应用赋予高级权限，第一种方法为在表格中添加应用为协作者并将应用设置为管理员，第二种方法为在一个用户群中将应用添加为机器人， 并在高级权限的角色中添加该用户群，从而赋予对应的权限。 |
| 200 | 1255001 | InternalError | 内部错误，有疑问可咨询客服 |
| 200 | 1255002 | RpcError | 内部错误，有疑问可咨询客服 |
| 200 | 1255003 | MarshalError | 序列化错误，有疑问可咨询客服 |
| 200 | 1255004 | UmMarshalError | 反序列化错误 |
| 200 | 1255005 | ConvError | 内部错误，有疑问可咨询客服处 |
| 504 | 1255040 | Request timed out, please try again later. | 请求超时，请进行重试 |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fbitable-v1%2Fapp-table%2Flist%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何为应用开通多维表格权限？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app?lang=zh-CN#223459af)

[如何在多维表格中新增带有附件的记录？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=zh-CN#-9713c8d)

[多维表格中的筛选参数 filter 怎么填写？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/record-filter-guide)

[如何下载多维表格记录中的附件？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=zh-CN#0780e12f)

[如何筛选人员字段？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=zh-CN#b91b2c7)

遇到其他问题？问问 开放平台智能助手

[上一篇：更新数据表](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/patch) [下一篇：删除一个数据表](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/delete)

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

app\_token

\*

查询参数

page\_size

page\_token

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

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=list&project=bitable&resource=app.table&version=v1)

本文内容

[请求](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#requestHeader "请求头")

[路径参数](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#queryParams "查询参数")

[请求示例](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table/list?lang=zh-CN#errorCode "错误码")

尝试一下

意见反馈

技术支持

收起

展开