---
url: "https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN"
title: "获取知识空间信息 - 服务端 API - 开发文档 - 飞书开放平台"
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

[知识库概述](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview)

[知识库常见问题](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa)

知识空间

[获取知识空间列表](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/list)

[获取知识空间信息](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get)

[创建知识空间](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/create)

空间成员

空间设置

节点

云文档

[搜索 Wiki](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki)

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [知识库](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview) [知识空间](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/list)

获取知识空间信息

# 获取知识空间信息

复制页面

最后更新于 2025-07-21

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#7bb6c149 "前提条件")

[请求](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#requestHeader "请求头")

[路径参数](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#queryParams "查询参数")

[请求示例](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#errorCode "错误码")

# 获取知识空间信息

此接口用于根据知识空间 ID 查询知识空间的信息，包括空间的类型、可见性、分享状态等。

尝试一下

## 前提条件

调用此接口前，请确保应用或用户为知识空间的成员或管理员。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/wiki/v2/spaces/:space\_id |
| HTTP Method | GET |
| 接口频率限制 | [100 次/分钟](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 <br>开启任一权限即可 | 查看知识空间信息<br>查看、编辑和管理知识库<br>查看知识库 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | 应用调用 API 时，需要通过访问凭证（access\_token）进行身份鉴权，不同类型的访问凭证可获取的数据范围不同，参考 [选择并获取访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) 。<br>**值格式**："Bearer `access_token`"<br>**可选值如下**：<br>tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token) 。示例值："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>以登录用户身份调用 API，可读写的数据范围由用户可读写的数据范围决定。参考 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)。示例值："Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 路径参数

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| space\_id | string | 知识空间 ID。可通过以下两种方式获取。了解更多，参考 [知识库概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-overview)。<br>- 调用 [获取知识空间列表](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/list) 获取<br>- 如果你是知识库管理员，可以进入知识库设置页面，复制地址栏的数字部分：https://sample.feishu.cn/wiki/settings/6870403571079249922<br>**示例值**："6870403571079249922" |

### 查询参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| lang | string | 否 | 当查询 **我的文档库** 时，指定返回的文档库名称展示语言。<br>**示例值**："zh"<br>**可选值有**：<br>- `zh`：简体中文<br>- `id`：印尼语<br>- `de`：德语<br>- `en`：英语<br>- `es`：西班牙语<br>展开<br>**默认值**：`en` |

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

curl-i-XGET'https://open.feishu.cn/open-apis/wiki/v2/spaces/6870403571079249922?lang=zh' \

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

{

"code": 0,

"msg": "success",

"data": {

"space": {

"name": "知识空间",

"description": "知识空间描述",

"space\_id": "1565676577122621"

        }

    }

}

### 错误码

| HTTP状态码 | 错误码 | 描述 | 排查建议 |
| --- | --- | --- | --- |
| 400 | 131001 | rpc fail | 服务报错（下游 RPC 调用失败），请稍后重试，或者拿响应体的header头里的x-tt-logid咨询 [oncall](https://applink.feishu.cn/client/helpdesk/open?id=6626260912531570952) 定位。 |
| 400 | 131002 | param err | 通常为传参有误，例如数据类型不匹配。请查看响应体 msg 字段中的具体接口报错信息，报错不明确时请咨询 [oncall](https://applink.feishu.cn/client/helpdesk/open?id=6626260912531570952)。 |
| 400 | 131004 | invalid user | 非法用户（如未登陆或用户 ID 校验失败）。请咨询 [oncall](https://applink.feishu.cn/client/helpdesk/open?id=6626260912531570952)。 |
| 400 | 131005 | not found | 未找到相关数据，例如id不存在。相关报错信息参考：<br>- member not found：用户不是知识空间成员（管理员），无法删除。<br>- identity not found: userid不存在，无法添加/删除成员。<br>- space not found：知识空间不存在<br>- node not found：节点不存在<br>- document not found：文档不存在<br>报错不明确时请咨询 [oncall](https://applink.feishu.cn/client/helpdesk/open?id=6626260912531570952)。 |
| 400 | 131006 | permission denied | 权限拒绝，相关报错信息参考：<br>- wiki space permission denied：知识库权限鉴权不通过，需要成为知识空间管理员（成员）。<br>- node permission denied：文档节点权限鉴权不通过，读操作需要具备节点阅读权限，写操作（创建、移动等）则需要具备节点容器编辑权限。<br>- no source parent node permission：需要具备原父节点的容器编辑权限。<br>- no destination parent node permission：需要具备目标父节点的容器编辑权限，若移动到知识空间下，则需要成为知识空间管理员（成员）。<br>**注意**：应用访问或操作文档时，除了申请 API 权限，还需授权具体文档资源的阅读、编辑或管理权限。<br>请参考以下步骤操作：<br>1. **当遇到资源权限不足的情况**：参阅 [如何给应用授权访问知识库文档资源](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/wiki-qa#a40ad4ca)。<br>2. **也可直接将应用添加为知识库管理员（成员）**：参阅 [如何将应用添加为知识库管理员（成员）](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/wiki-qa#b5da330b)。<br>3. **若无法解决或报错信息不明确时**：请咨询 [技术支持](https://applink.feishu.cn/client/helpdesk/open?id=6626260912531570952)。 |
| 400 | 131007 | internal err | 服务内部错误，请勿重试，拿返回值的header头里的x-tt-logid咨询 [oncall](https://applink.feishu.cn/client/helpdesk/open?id=6626260912531570952) 定位。 |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fwiki-v2%2Fspace%2Fget%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何给应用开通知识库文档权限？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa#a40ad4ca)

[如何为应用开通云文档相关资源的权限?](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[如何获取云文档资源相关 token？](https://open.feishu.cn/document/server-docs/docs/faq#08bb5df6)

[应用身份创建的文档，如何给用户授权？](https://open.feishu.cn/document/server-docs/docs/permission/faq#1f89d567)

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

遇到其他问题？问问 开放平台智能助手

[上一篇：获取知识空间列表](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/list) [下一篇：创建知识空间](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/create)

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

space\_id

\*

示例值："6870403571079249922"

查询参数

lang

en

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

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=get&project=wiki&resource=space&version=v2)

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#7bb6c149 "前提条件")

[请求](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#requestHeader "请求头")

[路径参数](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#queryParams "查询参数")

[请求示例](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/get?lang=zh-CN#errorCode "错误码")

尝试一下

意见反馈

技术支持

收起

展开