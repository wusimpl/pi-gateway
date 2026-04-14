---
url: "https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN"
title: "Markdown/HTML 内容转换为文档块 - 服务端 API - 开发文档 - 飞书开放平台"
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

[文档概述](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/docx-overview)

[文档常见问题](https://open.feishu.cn/document/docs/docs/faq)

数据结构

文档

块

[创建块](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create)

[创建嵌套块](https://open.feishu.cn/document/docs/docs/document-block/create-2)

[更新块的内容](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/patch)

[获取块的内容](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/get)

[批量更新块的内容](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_update)

[获取所有子块](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/get-2)

[删除块](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_delete)

[Markdown/HTML 内容转换为文档块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert)

[新旧版本说明](https://open.feishu.cn/document/server-docs/docs/docs/upgraded-docs-openapi-access-guide)

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [文档](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/docx-overview) [块](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/create)

Markdown/HTML 内容转换为文档块

# Markdown/HTML 内容转换为文档块

复制页面

最后更新于 2025-08-28

本文内容

[请求](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#2cf9141c "请求")

[请求头](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#f47475f8 "请求头")

[查询参数](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#bc6d1214 "查询参数")

[请求体](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#1b8abd5d "请求体")

[请求体示例](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#365d3b16 "请求体示例")

[响应](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#1dcf621c "响应")

[响应体](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#362449eb "响应体")

[响应体示例](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#9dab04c2 "响应体示例")

[错误码](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#c98c3220 "错误码")

# Markdown/HTML 内容转换为文档块

将 Markdown/HTML 格式的内容转换为文档块，以便于将 Markdown/HTML 格式的内容插入到文档中。目前支持转换为的块类型包含文本、一到九级标题、无序列表、有序列表、代码块、引用、待办事项、图片、表格、表格单元格。

[尝试一下](https://open.feishu.cn/api-explorer?from=op_doc&project=docx&version=v1&resource=document&apiName=convert)

**若要将 Markdown/HTML 格式的内容插入到文档，需依次执行以下操作：**

1. 调用 [创建文档](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/create) 接口创建一篇类型为 docx 的文档（若目标文档已存在，则无需此步骤）。
2. 调用当前接口将 Markdown/HTML 格式的内容转换为文档块。
3. 调用 [创建嵌套块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) 接口将步骤二中返回的块批量插入到目标文档中。

**在上述接口调用过程中需注意以下事项：**

- 将带表格的 Markdown/HTML 格式的内容转换为文档块后，在调用 [创建嵌套块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) 接口批量插入块到文档前，需先去除表格（Table）块中的 `merge_info` 字段。由于当前 `merge_info` 为只读属性，传入该字段会引发报错。

- 将包含图片的 Markdown/HTML 格式的内容转换为文档块，并调用 [创建嵌套块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) 接口将图片（Image）块插入到文档后，需调用 [上传图片素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all) 接口，以 Image BlockID 作为 `parent_node` 上传素材，接着调用 [更新块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/patch) 或 [批量更新块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/batch_update) 接口，指定 `replace_image` 操作，将图片素材 ID 设置到对应的 Image Block。

- 当转换后的块数量过多时，需分批调用 [创建嵌套块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) 接口，单次调用 [创建嵌套块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block-descendant/create) 接口最多可插入 1000 个块。


## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/docx/v1/documents/blocks/convert |
| HTTP Method | POST |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 | 文本内容转换为云文档块 |
| 字段权限要求 | 该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户 user ID |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | tenant\_access\_token<br>或<br>user\_access\_token<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer u-7f1bcd13fc57d46bac21793a18e560"<br>[了解更多：如何选择与获取 access token](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-choose-which-type-of-token-to-use) |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 查询参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| user\_id\_type | string | 否 | 用户 ID 类型<br>**示例值**："open\_id"<br>**可选值有**：<br>- `open_id`：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。 [了解更多：如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>  <br>- `union_id`：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。 [了解更多：如何获取 Union ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>  <br>- `user_id`：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。 [了解更多：如何获取 User ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>  <br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID |

### 请求体

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| content\_type | string | 是 | 内容类型<br>**示例值**："markdown"<br>**可选值有**：<br>- `markdown`：Markdown 格式<br>  <br>- `html`：HTML 格式 |
| content | string | 是 | 文本内容<br>**示例值**："Text \*\*Bold\*\* \*Italic\* ~~Strikethrough~~ \`inline code\` Hyperlink: \[Feishu Open Platform\](https://open.feishu.cn)\\n\\n!\[image\](https://sf3-scmcdn-cn.feishucdn.com/obj/feishu-static/lark/open/website/share-logo.png)\\n\\n# Heading1\\n\\n\`\`\`\\n hello word\\n\`\`\`\\n\\n> quote\\n\\n1. ordered1\\n2. ordered2\\n\\n- bullet1\\n- bullet2\\n\\n\|Location\|Features\|Cuisine\|\\n\|----\|----\|----\|\\n\|Seafood Street\|Seafood Market\|Fresh Seafood, Lobsters, Crabs, scallops\|"<br>**数据校验规则**：<br>- 长度范围：`1` ～ `10485760` 字符 |

### 请求体示例

1

2

3

4

{

"content\_type": "markdown",

"content": "Text \*\*Bold\*\* \*Italic\* ~~Strikethrough~~ \`inline code\` Hyperlink: \[Feishu Open Platform\](https://open.feishu.cn)\\n\\n!\[image\](https://sf3-scmcdn-cn.feishucdn.com/obj/feishu-static/lark/open/website/share-logo.png)\\n\\n# Heading1\\n\\n\`\`\`\\n  hello word\\n\`\`\`\\n\\n> quote\\n\\n1. ordered1\\n2. ordered2\\n\\n- bullet1\\n- bullet2\\n\\n\|Location\|Features\|Cuisine\|\\n\|----\|----\|----\|\\n\|Seafood Street\|Seafood Market\|Fresh Seafood, Lobsters, Crabs, scallops\|"

}

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

"msg": "success",

"data": {

"first\_level\_block\_ids": \[\
\
"6f70483b-def6-4459-96ff-509b1de9f2ca",\
\
"4a0cc20d-1dbd-47af-9ca8-f71027b26468",\
\
"8da57e4f-d73e-44b4-9389-f45ed740f97f",\
\
"13b42d6c-8480-465f-91da-3b5c864c7af9",\
\
"bdb98e5b-dd35-4691-9c69-9a831182fd16",\
\
"0e8f483a-8c5a-4e96-b3d1-8f05731f8a66",\
\
"6b06836c-07a1-48b8-8859-466f6a11afc7",\
\
"a7c82c2c-22e9-42f6-b823-9fc86c230e5e",\
\
"14805dfc-2b6d-48c9-8317-7f8f5d603178",\
\
"e4faf5af-264b-408e-a480-22d19b4b13cf"\
\
        \],

"blocks": \[\
\
            {\
\
"block\_id": "row19f995d8-60b9-4945-b1dc-26bd448387c7cold95431db-2529-41b1-bae9-76f10070e6cc",\
\
"revision\_id": 0,\
\
### 错误码\
\
| HTTP状态码 | 错误码 | 描述 | 排查建议 |\
| --- | --- | --- | --- |\
| 500 | 1771001 | server internal error | 服务器内部错误。请重试，若仍无法解决请咨询 [技术支持](https://applink.feishu.cn/TLJpeNdW)。 |\
| 400 | 1770033 | content size exceed limit | 纯文本内容大小超过 10485760 字符限制，请减少内容后重试。 |\
\
[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FukTMukTMukTM%2FuUDN04SN0QjL1QDN%2Fdocument-docx%2Fdocx-v1%2Fdocument%2Fconvert%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错\
\
相关问题\
\
[如何读取文档中电子表格块的详细内容？](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#79f1c19b)\
\
[如何为应用开通云文档相关资源的权限?](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)\
\
[如何获取云文档资源相关 token？](https://open.feishu.cn/document/server-docs/docs/faq#08bb5df6)\
\
[应用身份创建的文档，如何给用户授权？](https://open.feishu.cn/document/server-docs/docs/permission/faq#1f89d567)\
\
[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)\
\
遇到其他问题？问问 开放平台智能助手\
\
[上一篇：删除块](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/document-block/batch_delete) [下一篇：新旧版本说明](https://open.feishu.cn/document/server-docs/docs/docs/upgraded-docs-openapi-access-guide)\
\
请先登录后再进行调试\
\
登录\
\
开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)\
\
本文内容\
\
[请求](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#2cf9141c "请求")\
\
[请求头](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#f47475f8 "请求头")\
\
[查询参数](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#bc6d1214 "查询参数")\
\
[请求体](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#1b8abd5d "请求体")\
\
[请求体示例](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#365d3b16 "请求体示例")\
\
[响应](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#1dcf621c "响应")\
\
[响应体](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#362449eb "响应体")\
\
[响应体示例](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#9dab04c2 "响应体示例")\
\
[错误码](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/convert?lang=zh-CN#c98c3220 "错误码")\
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