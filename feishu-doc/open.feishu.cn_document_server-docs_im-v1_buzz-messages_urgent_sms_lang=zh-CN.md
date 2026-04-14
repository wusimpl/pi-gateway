---
url: "https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN"
title: "发送短信加急 - 服务端 API - 开发文档 - 飞书开放平台"
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

[消息概述](https://open.feishu.cn/document/server-docs/im-v1/introduction)

[消息常见问题](https://open.feishu.cn/document/server-docs/im-v1/faq)

消息管理

批量消息

图片信息

文件信息

消息加急

[加急概述](https://open.feishu.cn/document/im-v1/buzz-messages/buzz-overview)

[发送应用内加急](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_app)

[发送短信加急](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms)

[发送电话加急](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_phone)

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [消息](https://open.feishu.cn/document/server-docs/im-v1/introduction) [消息加急](https://open.feishu.cn/document/im-v1/buzz-messages/buzz-overview)

发送短信加急

# 发送短信加急

复制页面

最后更新于 2024-09-25

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#7bb6c149 "前提条件")

[使用限制](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#cac79090 "使用限制")

[请求](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#requestHeader "请求头")

[路径参数](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#queryParams "查询参数")

[请求体](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#requestBody "请求体")

[请求示例](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#errorCode "错误码")

# 发送短信加急

调用该接口把指定消息加急给目标用户，加急将通过飞书客户端和短信进行通知。了解加急可参见 [加急功能](https://www.feishu.cn/hc/zh-CN/articles/360024757913)。

尝试一下

**注意**：短信加急将消耗企业的加急额度（可通过 [管理后台](https://admin.feishu.cn/) \> **费用中心** \> **权益数据** \> **短信/电话加急** 查看当前额度），请慎重调用。

## 前提条件

- 应用需要开启 [机器人能力](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-enable-bot-ability) 。
- 确保机器人在被加急消息所属会话中。如果是群组，还需要确保群管理中设置了 **所有群成员可以加急**，或者设置了 **仅群主或管理员可以加急** 且机器人是管理员。

## 使用限制

- 只能加急当前机器人自己发送的消息。
- 加急用户的未读加急总数不能超过 200 条。
- 不支持加急 [批量发送的消息](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM)。
- 加急 [折叠会话](https://www.feishu.cn/hc/zh-CN/articles/360025267393) 内的消息时，仅会在应用内推送提醒通知。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/im/v1/messages/:message\_id/urgent\_sms |
| HTTP Method | PATCH |
| 接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 <br>开启任一权限即可 | 发送短信加急消息<br>发送短信加急消息（历史版本） |
| 字段权限要求 | 该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户 user ID<br>仅自建应用 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token)。<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234" |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 路径参数

| 名称 | 类型 | 描述 |
| --- | --- | --- |
| message\_id | string | 待加急的消息 ID。ID 获取方式：<br>- 调用 [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) 接口后，从响应结果的 `message_id` 参数获取。<br>- 监听 [接收消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive) 事件，当触发该事件后可以从事件体内获取消息的 `message_id`。<br>- 调用 [获取会话历史消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list) 接口，从响应结果的 `message_id` 参数获取。<br>**注意**：不支持加急 [批量发送的消息](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM)（对应的消息ID 格式为 `bm_xxx`）。<br>**示例值**："om\_dc13264520392913993dd051dba21dcf" |

### 查询参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| user\_id\_type | string | 是 | 用户 ID 类型<br>**示例值**："open\_id"<br>**可选值有**：<br>- `open_id`：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。 [了解更多：如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- `union_id`：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。 [了解更多：如何获取 Union ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- `user_id`：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。 [了解更多：如何获取 User ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID<br>仅自建应用 |

### 请求体

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| user\_id\_list | string\[\] | 是 | 加急的目标用户 ID 列表。ID 类型与查询参数 user\_id\_type 取值一致，推荐使用 open\_id。<br>**注意**：需要确保目标用户在加急消息所属的会话内。如果 ID 列表中有用户不在消息所属的会话内，则接口会将这些无效的 ID 返回（响应参数 invalid\_user\_id\_list），只加急有效的用户 ID。如果 ID 列表内的所有 ID 均无效，则会返回 `230001` 错误码。<br>**数据校验规则**：列表长度不能大于 200。<br>**示例值**：\["ou\_6yf8af6bgb9100449565764t3382b168"\] |

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

curl-i-X PATCH 'https://open.feishu.cn/open-apis/im/v1/messages/om\_dc13264520392913993dd051dba21dcf/urgent\_sms?user\_id\_type=open\_id' \

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

{

"code": 0,

"msg": "success",

"data": {

"invalid\_user\_id\_list": \[\
\
"ou\_6yf8af6bgb9100449565764t3382b168"\
\
        \]

    }

}

### 错误码

| HTTP状态码 | 错误码 | 描述 | 排查建议 |
| --- | --- | --- | --- |
| 400 | 230001 | Your request contains an invalid request parameter. | 参数错误，请根据接口返回的错误信息并参考接口文档检查输入参数是否正确。 |
| 400 | 230002 | The bot can not be outside the group. | 机器人不在对应群组中。你需要将应用机器人添加到接收消息的群组中。如何添加机器人参考 [机器人使用指南](https://open.feishu.cn/document/ukTMukTMukTM/uATM04CMxQjLwEDN)。 |
| 400 | 230006 | Bot ability is not activated. | 应用未启用机器人能力。启用方式参见 [如何启用机器人能力](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-enable-bot-ability)。 |
| 400 | 230012 | Bot is NOT the sender of the message. | 机器人不是消息的发送者，无法加急该消息。应用机器人只能操作自己发送的消息。 |
| 400 | 230013 | Bot has NO availability to this user. | 目标用户（以用户的 user\_id/open\_id/union\_id/email 指定的消息接收者）或单聊用户（以群聊的 chat\_id 指定的消息接收者，但 chat\_id 对应的群聊类型为单聊 `p2p`）不在应用机器人的可用范围内，或者是在应用的禁用范围内。<br>**注意**：如果目标用户已离职，也会报错 230013。<br>解决方案：<br>1. 登录 [开发者后台](https://open.feishu.cn/app)，找到并进入指定应用详情页。<br>2. 在左侧导航栏进入 **应用发布** \> **版本管理与发布** 页面，点击 **创建版本**。<br>3. 在 **版本详情** 页面，找到 **可用范围** 区域，点击 **编辑**。<br>4. 在弹出的对话框内，配置应用的可用范围，将用户添加至可用范围内。<br>5. 在页面底部点击 **保存**，并发布应用使配置生效。<br>6. （可选）如果以上配置完成后仍报错，则需要联系企业管理员登录 [管理后台](https://feishu.cn/admin)，在 **工作台** \> **应用管理** 中进入指定应用详情页，在 **应用可用范围** 内查看该用户是否被设置为了 **禁用成员**。<br>具体操作参见 [配置应用可用范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability)。 |
| 400 | 230023 | The user has too many unread urgent messages. | 用户未读的加急消息过多。加急用户的未读加急总数不能超过 200 条，需要用户处理一部分被加急的消息，在不超过 200 条未读加急消息时，才可以继续加急。处理方式：<br>- 用户在客户端的会话内阅读加急消息（必须在会话内阅读消息，点掉终端弹出的加急提醒弹框不会视为已读加急消息）。<br>- 如果某一群聊内存在大量加急消息，在确保不需要一条条阅读的情况下，可以通过群聊的 **设置** \> **清空聊天记录** 功能清理群聊内的加急消息。 |
| 400 | 230024 | Reach the upper limit of urgent message. | 加急额度超限，请联系企业管理员。相关说明参见 [加急功能](https://www.feishu.cn/hc/zh-CN/articles/360024757913)。 |
| 400 | 230027 | Lack of necessary permissions. | 暂不支持在外部群中进行本操作。 |
| 400 | 230052 | Can not urgent this message. | 无权加急或被鉴别为风险操作。请排查群聊内是否已开启 **仅群主和管理员可加急**，或联系企业管理员。 |
| 400 | 230098 | The message is fold, not support urgent. | 被聚合的消息不支持加急。 |
| 400 | 230110 | Action unavailable as the message has been deleted. | 消息已删除，不支持当前操作。 |
| 400 | 232009 | Your request specifies a chat which has already been dissolved. | 相关群组已被解散，无法进行当前操作。 |

其他未列出的错误码请参见 [服务端通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fim-v1%2Fbuzz-messages%2Furgent_sms%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[可以通过接口给外部联系人发送消息吗？](https://open.feishu.cn/document/server-docs/im-v1/faq#3bc3de2f)

[是否支持通过 OpenAPI 创建机器人？](https://open.feishu.cn/document/server-docs/im-v1/faq#732e7c89)

[应用机器人与自定义机器人区别](https://open.feishu.cn/document/client-docs/bot-v3/bot-overview#da1a309d)

[在调用发送消息接口时，提示请求中的消息内容有问题，我应该如何排查解决问题？](https://open.feishu.cn/document/server-docs/im-v1/faq#59b9af42)

[机器人如何接收并响应用户发来的消息？](https://open.feishu.cn/document/server-docs/im-v1/faq#2f86f42b)

遇到其他问题？问问 开放平台智能助手

[上一篇：发送应用内加急](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_app) [下一篇：发送电话加急](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_phone)

请先登录后再进行调试

登录

API 调试台

示例代码

更多

请求头

Authorization

\*

Bearer

tenant\_access\_token

获取 Token

路径参数

message\_id

\*

示例值："om\_dc13264520392913993dd051dba21dcf"

查询参数

user\_id\_type

\*

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

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=urgent_sms&project=im&resource=message&version=v1)

本文内容

[前提条件](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#7bb6c149 "前提条件")

[使用限制](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#cac79090 "使用限制")

[请求](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#requestHeader "请求头")

[路径参数](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#pathParams "路径参数")

[查询参数](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#queryParams "查询参数")

[请求体](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#requestBody "请求体")

[请求示例](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/im-v1/buzz-messages/urgent_sms?lang=zh-CN#errorCode "错误码")

尝试一下

意见反馈

技术支持

收起

展开