---
url: "https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN"
title: "查询技能列表 - 服务端 API - 开发文档 - 飞书开放平台"
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

会话

消息

运行

技能

[调用技能](https://open.feishu.cn/document/aily-v1/app-skill/start)

[获取技能信息](https://open.feishu.cn/document/aily-v1/app-skill/get)

[查询技能列表](https://open.feishu.cn/document/aily-v1/app-skill/list)

知识问答

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [飞书 Aily](https://open.feishu.cn/document/aily-v1/aily_session/create) [技能](https://open.feishu.cn/document/aily-v1/app-skill/start)

查询技能列表

# 查询技能列表

复制页面

最后更新于 2025-07-10

本文内容

[请求](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#requestHeader "请求头")

[路径参数](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#queryParams "查询参数")

[请求示例](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#errorCode "错误码")

# 查询技能列表

该 API 用于查询某个 Aily 应用的技能列表

> 包括内置的数据分析与问答技能、以及未在对话开启的技能。
>
> 尝试一下

更多信息及示例代码，可参考 [Aily 技能 OpenAPI 接口说明](https://bytedance.larkoffice.com/wiki/ZkKnwxogliNj3ik9ppEc0cFUnAd)。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/aily/v1/apps/:app\_id/skills |
| HTTP Method | GET |
| 接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 仅自建应用 |
| 权限要求 | 获取技能信息<br>仅自建应用 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | 应用调用 API 时，需要通过访问凭证（access\_token）进行身份鉴权，不同类型的访问凭证可获取的数据范围不同，参考 [选择并获取访问凭证](https://open.feishu.cn/document/ukTMukTMukTM/uMTNz4yM1MjLzUzM) 。<br>**值格式**："Bearer `access_token`"<br>**可选值如下**：<br>tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token) 。示例值："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234"<br>user\_access\_token<br>以登录用户身份调用 API，可读写的数据范围由用户可读写的数据范围决定。参考 [获取 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token)。示例值："Bearer u-cjz1eKCEx289x1TXEiQJqAh5171B4gDHPq00l0GE1234" |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 路径参数

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| app\_id | string | Aily 应用 ID（`spring_xxx__c`），可以在 Aily 应用开发页面的浏览器地址里获取<br>**示例值**："spring\_e7004f87f1\_\_c"<br>**数据校验规则**：<br>- 长度范围：`0` 字符 ～ `64` 字符 |

### 查询参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| page\_size | int | 否 | 本次请求获取的消息记录条数，默认 20<br>**示例值**：10 |
| page\_token | string | 否 | 分页标记，第一次请求不填，表示从头开始遍历；分页查询结果还有更多项时会同时返回新的 page\_token，下次遍历可采用该 page\_token 获取查询结果<br>**示例值**："eVQrYzJBNDNONlk4VFZBZVlSdzlKdFJ4bVVHVExENDNKVHoxaVdiVnViQT0=" |

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

curl-i-XGET'https://open.feishu.cn/open-apis/aily/v1/apps/spring\_e7004f87f1\_\_c/skills?page\_size=10&page\_token=eVQrYzJBNDNONlk4VFZBZVlSdzlKdFJ4bVVHVExENDNKVHoxaVdiVnViQT0%3D' \

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

"has\_more": false,

"page\_token": "skill\_cb6685a0ef33",

"skills": \[\
\
      {\
\
"description": "工作流技能",\
\
"id": "skill\_8c71459001b2",\
\
"input\_schema": "\[{\\"name\\":\\"userInput\\",\\"type\\":\\"String\\",\\"required\\":true,\\"defaultValue\\":\\"你好\\",\\"description\\":\\"\\"},{\\"name\\":\\"chatHistory\\",\\"type\\":\\"List\\",\\"required\\":true,\\"defaultValue\\":null,\\"description\\":\\"\\"},{\\"name\\":\\"userMessage\\",\\"type\\":\\"\_\_SpringUserMessage\\",\\"required\\":false,\\"defaultValue\\":null,\\"description\\":\\"\\"}\]",\
\
"label": "工作流技能",\
\
"output\_schema": "\[{\\"name\\":\\"message\_status\\",\\"type\\":\\"Boolean\",\\"required\\":false,\\"defaultValue\\":null,\\"description\\":\\"\\"},{\\"name\\":\\"input\_message\\",\\"type\":\\"String\\",\\"required\\":false,\\"defaultValue\\":null,\\"description\\":\\"\\"}\]",\
\
"samples": \[\]\
\
      },\
\
      {\
\
"description": "理解用户提出的问题，对当前助手已经配置的数据资产进行知识搜索、数据分析、文档阅读，总结并返回答案。",\
\
"id": "skill\_cb6685a0ef33",\
\
"input\_schema": "",\
\
"label": "数据分析和问答",\
\
"output\_schema": "",\
\
### 错误码\
\
| HTTP状态码 | 错误码 | 描述 | 排查建议 |\
| --- | --- | --- | --- |\
| 400 | 2700001 | param is invalid | 参数错误 |\
\
[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Faily-v1%2Fapp-skill%2Flist%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错\
\
相关问题\
\
[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)\
\
[如何选择不同类型的 access token？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)\
\
[如何准确选择 SDK 内 API 对应的方法？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api#5954789)\
\
[如何获取自己的 Open ID？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)\
\
[如何为应用申请所需权限？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)\
\
遇到其他问题？问问 开放平台智能助手\
\
[上一篇：获取技能信息](https://open.feishu.cn/document/aily-v1/app-skill/get) [下一篇：执行数据知识问答](https://open.feishu.cn/document/aily-v1/data-knowledge/ask)\
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
app\_id\
\
\*\
\
示例值："spring\_xxx\_\_c"\
\
查询参数\
\
page\_size\
\
page\_token\
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
开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=list&project=aily&resource=app.skill&version=v1)\
\
本文内容\
\
[请求](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#request "请求")\
\
[请求头](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#requestHeader "请求头")\
\
[路径参数](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#pathParams "路径参数")\
\
[查询参数](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#queryParams "查询参数")\
\
[请求示例](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#requestExample "请求示例")\
\
[响应](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#response "响应")\
\
[响应体](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#responseBody "响应体")\
\
[响应体示例](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#responseBodyExample "响应体示例")\
\
[错误码](https://open.feishu.cn/document/aily-v1/app-skill/list?lang=zh-CN#errorCode "错误码")\
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