---
url: "https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN"
title: "素材概述 - 服务端 API - 开发文档 - 飞书开放平台"
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

素材概述

# 素材概述

复制页面

最后更新于 2025-06-08

本文内容

[基础概念](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#94249c8e "基础概念")

[素材 token 获取方式](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#811fac47 "素材 token 获取方式")

[上传素材说明](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#277d5023 "上传素材说明")

[上传点类型和上传点 token](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#cc82be3c "上传点类型和上传点 token")

[接口说明](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#f77f9f7b "接口说明")

[extra 参数说明](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#3b8635d3 "extra 参数说明")

[上传素材至云文档](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#1942b24f "上传素材至云文档")

[上传素材至云空间](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#76bb3baf "上传素材至云空间")

[下载多维表格中的素材](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#1b93b2ea "下载多维表格中的素材")

[方法列表](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#791c8e74 "方法列表")

# 素材概述

本文档介绍云空间中素材相关能力的基础概念、相关接口和 extra 参数说明等。

## 基础概念

素材指在文档、电子表格、多维表格等中用到的资源素材，如文档中的图片、视频或文件等。每个素材都有唯一的 token 作为标识。

## 素材 token 获取方式

飞书开放平台支持在在线文档、电子表格、多维表格中上传和下载素材。在不同的云文档中，素材 token 的获取方式不同。具体方式如下所示：

| 素材所在文档类型 | 素材 token 获取方式 |
| --- | --- |
| 在线文档 | 通过 [获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list) 接口获取指定文件块（File Block）或图片块（Image Block）等，其中的 token 参数即为素材 token。 |
| 电子表格 | 通过 [读取多个范围](https://open.feishu.cn/document/ukTMukTMukTM/ukTMzUjL5EzM14SOxMTN) 接口获取指定附件的 `fileToken` 参数，即为素材的 token。 |
| 多维表格 | 通过 [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 接口获取指定附件的 `file_token`参数，即为素材的 token。 |

## 上传素材说明

上传素材指将本地环境的各类文件上传至云文档中。飞书开放平台支持在在线文档、电子表格、多维表格中上传素材。

上传素材相关接口不支持并发调用，且调用频率上限为 5 QPS，10000 次/天。否则会返回 1061045 错误码，可通过稍后重试解决。

### 上传点类型和上传点 token

要将指定素材上传到指定云文档中，你需先确定上传点的类型（`parent_type`）和上传点的 token（`parent_node`），再调用上传接口。下表列出不同上传场景对应的上传点类型和上传点 token 说明。

要在知识库文档中上传图片或文件，你需先调用 [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node) 获取当前知识库文档的实际 token，再根据下列上传场景，确定上传点 token 的值。

| 上传场景 | 上传点类型（parent\_type） | 上传点 token （parent\_node） | token 示例值 |
| --- | --- | --- | --- |
| 在新版文档中上传图片 | docx\_image | 传入新版文档块的唯一标识 `block_id`，表示将图片素材上传到新版文档的指定 [图片块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/data-structure/block#a6f35866) 中。了解在文档中插入图片的完整步骤，参考 [文档常见问题-如何插入图片](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#1908ddf0)。 | doxcnXgNGAtaAraIRVeCfmabcef |
| 在新版文档中上传文件 | docx\_file | 传入新版文档块的唯一标识 `block_id`，表示将文件素材上传到新版文档的指定 [文件块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/data-structure/block#2b183663) 中。了解在文档中插入文件的完整步骤，参考 [文档常见问题-如何插入文件/附件](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#891c2784)。 | doxcnXgNGAtaAraIRVeCfmabcef |
| 在电子表格中上传图片 | sheet\_image | 传入电子表格的唯一标识 `spreadsheet_token`，表示将图片素材上传到指定电子表格中， [点击了解如何获取云文档 token](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#08bb5df6)。图片完成上传后，你可继续使用 [写入图片](https://open.feishu.cn/document/ukTMukTMukTM/uUDNxYjL1QTM24SN0EjN) 等接口将图片写入电子表格具体位置。 | MRLOWBf6J47ZUjmwYRsN8uabcef |
| 在电子表格中上传文件 | sheet\_file | 传入电子表格的唯一标识 `spreadsheet_token`，表示将文件素材上传到指定电子表格中， [点击了解如何获取云文档 token](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#08bb5df6)。 | MRLOWBf6J47ZUjmwYRsN8uabcef |
| 在多维表格中上传图片 | bitable\_image | 传入多维表格的唯一标识 `app_token`，表示将图片素材上传到指定多维表格中， [点击了解如何获取云文档 token](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#08bb5df6)。 了解在多维表格中插入图片的完整步骤，参考 [多维表格常见问题-如何在多维表格中上传附件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq)。 | Pc9OpwAV4nLdU7lTy71t6Kabcef |
| 在多维表格中上传文件 | bitable\_file | 传入多维表格的唯一标识 `app_token`，表示将文件素材上传到指定多维表格中， [点击了解如何获取云文档 token](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#08bb5df6)。了解在多维表格中插入附件的完整步骤，参考 [多维表格常见问题-如何在多维表格中上传附件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq)。 | Pc9OpwAV4nLdU7lTy71t6Kabcef |
| 上传素材至云空间 | ccm\_import\_open | 无需填写，该场景用于导入文件，详情参考 [导入文件概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide)。 | / |
| 在旧版文档中上传图片（旧版文档已下线，已不推荐使用） | doc\_image | 传入旧版文档的唯一标识 `doc_token`，表示将图片素材上传到指定旧版文档中， [点击了解如何获取云文档 token](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#08bb5df6)。 | 2olt0Ts4Mds7j7iqzdwrqEabcef |
| 在旧版文档中上传文件（旧版文档已下线，已不推荐使用） | doc\_file | 传入旧版文档的唯一标识 `doc_token`，表示将文件素材上传到指定旧版文档中， [点击了解如何获取云文档 token](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN#08bb5df6)。 | 2olt0Ts4Mds7j7iqzdwrqEabcef |

### 接口说明

飞书开放平台提供了多个上传素材接口。你需根据上传素材的大小，选择合适的方式：

- 若当前网络连接稳定且素材大小不超过 20 MB，直接调用 [上传素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all)；
- 若当前网络连接不稳定，或素材大小超过 20 MB，你需依次调用以下分片上传素材接口，对素材定长分片上传，减少单次带宽使用，提高上传成功率。该上传方式支持开发者依据分片上传进度展示整体素材的上传进度，且支持一天内恢复上传。
1. [分片上传素材-预上传](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_prepare)

     发送初始化请求，以获取上传事务 ID 和分片策略，为上传素材分片做准备。平台固定以 4MB 的大小对素材进行分片。

2. [分片上传素材-上传分片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_part)

     根据预上传接口返回的上传事务 ID 和分片策略上传对应的素材分片。

3. [分片上传素材-完成上传](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_finish)

     调用上传分片接口将分片全部上传完毕后，你可调用本接口触发完成上传。

## extra 参数说明

对于以下上传与下载素材场景，你需要填写 extra 参数。

- extra 参数类型为字符串，对象类型需要转成字符串作为入参。如果是直接通过 URL 进行访问，需要对字符串进行 URL 编码，将其放置在 URL 查询中。
- API 调试台页面填写的 extra 参数无需编码转义。

### 上传素材至云文档

在以下上传场景中，需通过 extra 参数传入素材所在云文档的 token。extra 参数的格式为 `"{\"drive_route_token\":\"素材所在云文档的 token\"}"`。以下示例值未转义，实际使用中请注意转义。

| 上传场景 | extra 参数值示例（未转义） | 云文档 token 获取方式 |
| --- | --- | --- |
| 在文档中上传图片 | {"drive\_route\_token":"doxcnXgNGAtaAraIRVeCfmabcef"} | 参考 [文档概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview) 获取 token，即文档的 `document_id`。 |
| 在文档中上传文件 | {"drive\_route\_token":"doxcnXgNGAtaAraIRVeCfmabcef"} | 参考 [文档概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview) 获取 token，即文档的 `document_id`。 |
| 在电子表格中上传图片 | {"drive\_route\_token":"MRLOWBf6J47ZUjmwYRsN8uabcef"} | 参考 [电子表格概述](https://open.feishu.cn/document/ukTMukTMukTM/uATMzUjLwEzM14CMxMTN/overview) 获取 token，即电子表格的 `spreadsheetToken`。 |
| 在电子表格中上传文件 | {"drive\_route\_token":"MRLOWBf6J47ZUjmwYRsN8uabcef"} | 参考 [电子表格概述](https://open.feishu.cn/document/ukTMukTMukTM/uATMzUjLwEzM14CMxMTN/overview) 获取 token，即电子表格的 `spreadsheetToken`。 |
| 在多维表格中上传图片 | {"drive\_route\_token":"Pc9OpwAV4nLdU7lTy71t6Kabcef"} | 参考 [多维表格概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview) 获取多维表格的 token。 |
| 在多维表格中上传文件 | {"drive\_route\_token":"Pc9OpwAV4nLdU7lTy71t6Kabcef"} | 参考 [多维表格概述](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview) 获取多维表格的 token。 |

### 上传素材至云空间

上传素材至云空间的场景通常与导入文件场景关联，详情参考 [导入文件概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide)。在该场景下，上传点类型（`parent_type`）为 `ccm_import_open`，上传点 token（`parent_node`）无需填写。`extra` 参数需要填入 json 序列化后的字符串。填写示例如下所示。

- 将本地文件扩展名为 txt 的文件导入为新版文档：


```

"{ "obj_type": "docx","file_extension": "txt"}"
```

- 将本地文件扩展名为 xlsx 的文件导入为电子表格：


```

"{ "obj_type": "sheet","file_extension": "xlsx"}"
```

- 将本地文件扩展名为 md 的文件导入为新版文档：


```

"{ "obj_type": "docx","file_extension": "md"}"
```

- 将本地文件扩展名为 markdown 的文件导入为新版文档：


```

"{ "obj_type": "docx","file_extension": "markdown"}"
```


### 下载多维表格中的素材

对于设置了高级权限的多维表格，在调用 [下载素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download) 或者 [获取素材临时下载链接](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/batch_get_tmp_download_url) 接口时，需要添加 extra 参数作为 URL 查询参数鉴权。若不添加 extra 参数将返回 HTTP 400 状态码。你可通过以下方式获取 extra 参数：

1. 调用 [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 接口，响应中将包含附件的下载链接，示例如下所示：

```

{
  "code": 0,
  "data": {
    "has_more": false,
    "items": [\
      {\
        "fields": {\
          "附件": [\
            {\
              "file_token": "RSkabsaphoy6yVxK0mGcggabcef",\
              "name": "74d2c703524489dbabcef.png",\
              "size": 87123,\
              "tmp_url": "https://open.feishu.cn/open-apis/drive/v1/medias/batch_get_tmp_download_url?file_tokens=RSkabsaphoy6yVxK0mGcggabcef&extra={"bitablePerm":{"tableId":"tblz8ExGaVhuiSD1","rev":32}}",  // 素材临时下载链接对应的 URL 值，需要对此字符串进行 URL 编码\
              "type": "image/png",\
              "url": "https://open.feishu.cn/open-apis/drive/v1/medias/RSkabsaphoy6yVxK0mGcggabcef/download?extra={"bitablePerm":{"tableId":"tblz8ExGaVhuiSD1","rev":32}}"   // 下载素材对应的 URL 值，需要对此字符串进行 URL 编码\
            }\
          ]\
        },\
        "record_id": "recbMzD0zT"\
      }\
    ],
    "total": 1
  },
  "msg": "success"
}
```

构建 extra 参数的步骤和示例如下所示：

1. 获取素材所在 table 的 `tableId`，构建 Extra 对象；
2. 根据附件所在的字段、记录 ID 和文件 token，填写 attachments 参数。其中 attachments 的第一个 key 为字段 ID，第二个 key 为记录 ID，value 为文件 token 数组；

attachments 为必填参数。不填可能导致时延过长，接口调用失败。

3. 序列化 Extra 对象成字符串；
4. 对此字符串进行 URL 编码，将其放置在 URL 查询中。

```

{"bitablePerm":{"tableId":"tblO6OeNZxfabcef","attachments":{"fld32zZi5I":{"rec0BuOHq":["boxbcsQNT0JsmrztOnX530abcef"]}}}}
// 转义后
https://open.feishu.cn/open-apis/drive/v1/medias/boxbcsQNT0JsmrztOnX530abcef/download?extra=%7B%22bitablePerm%22%3A%7B%22tableId%22%3A%22tblO6OeNZxfabcef%22%2C%22attachments%22%3A%7B%22fld32zZi5I%22%3A%7B%22rec0BuOHq%22%3A%5B%22boxbcsQNT0JsmrztOnX530abcef%22%5D%7D%7D%7D%7D
```

## 方法列表

以下为素材的方法列表。其中，“商店”代表应用商店应用；“自建”代表企业自建应用，了解更多应用相关信息，参考 [应用类型简介](https://open.feishu.cn/document/home/app-types-introduction/overview)。了解调用服务端 API 的流程，参考 [流程概述](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)。

| **方法 (API)** | **权限要求（满足任一）** | **访问凭证（选择其一）** | **商店** | **自建** |
| --- | --- | --- | --- | --- |
| [上传素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_all) POST /open-apis/drive/v1/medias/upload\_all | 查看、评论、编辑和管理多维表格<br>查看、评论、编辑和管理文档<br>上传图片和附件到云文档中<br>查看、评论、编辑和管理云空间中所有文件<br>查看、评论、编辑和管理电子表格 | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [下载素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download) GET /open-apis/drive/v1/medias/:file\_token/download | 查看、评论、编辑和管理多维表格<br>查看、评论和导出电子表格<br>查看、评论、编辑和管理文档<br>查看、评论和导出文档<br>下载云文档中的图片和附件<br>查看、评论、编辑和管理云空间中所有文件<br>查看、评论和下载云空间中所有文件<br>查看、评论、编辑和管理电子表格<br>查看、评论和导出电子表格 | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [获取素材临时下载链接](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/batch_get_tmp_download_url) GET /open-apis/drive/v1/medias/batch\_get\_tmp\_download\_url | 查看、评论、编辑和管理多维表格<br>查看、评论和导出电子表格<br>查看、评论、编辑和管理文档<br>查看、评论和导出文档<br>下载云文档中的图片和附件<br>查看、评论、编辑和管理云空间中所有文件<br>查看、评论和下载云空间中所有文件<br>查看、评论、编辑和管理电子表格<br>查看、评论和导出电子表格 | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [分片上传素材-预上传](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_prepare) POST /open-apis/drive/v1/medias/upload\_prepare | 查看、评论、编辑和管理多维表格<br>查看、评论、编辑和管理文档<br>上传图片和附件到云文档中<br>查看、评论、编辑和管理云空间中所有文件<br>查看、评论、编辑和管理电子表格 | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [分片上传素材-上传分片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_part) POST /open-apis/drive/v1/medias/upload\_part | 查看、评论、编辑和管理多维表格<br>查看、评论、编辑和管理文档<br>上传图片和附件到云文档中<br>查看、评论、编辑和管理云空间中所有文件<br>查看、评论、编辑和管理电子表格 | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |
| [分片上传素材-完成上传](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/upload_finish) POST /open-apis/drive/v1/medias/upload\_finish | 查看、评论、编辑和管理多维表格<br>查看、评论、编辑和管理文档<br>上传图片和附件到云文档中<br>查看、评论、编辑和管理云空间中所有文件<br>查看、评论、编辑和管理电子表格 | tenant\_access\_token<br>user\_access\_token | **✓** | **✓** |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fdrive-v1%2Fmedia%2Fintroduction%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何为应用开通云文档相关资源的权限?](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[如何获取云文档资源相关 token？](https://open.feishu.cn/document/server-docs/docs/faq#08bb5df6)

[应用身份创建的文档，如何给用户授权？](https://open.feishu.cn/document/server-docs/docs/permission/faq#1f89d567)

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[如何选择不同类型的 access token？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

遇到其他问题？问问 开放平台智能助手

[上一篇：下载导出文件](https://open.feishu.cn/document/server-docs/docs/drive-v1/export_task/download) [下一篇：上传素材](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[基础概念](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#94249c8e "基础概念")

[素材 token 获取方式](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#811fac47 "素材 token 获取方式")

[上传素材说明](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#277d5023 "上传素材说明")

[上传点类型和上传点 token](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#cc82be3c "上传点类型和上传点 token")

[接口说明](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#f77f9f7b "接口说明")

[extra 参数说明](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#3b8635d3 "extra 参数说明")

[上传素材至云文档](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#1942b24f "上传素材至云文档")

[上传素材至云空间](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#76bb3baf "上传素材至云空间")

[下载多维表格中的素材](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#1b93b2ea "下载多维表格中的素材")

[方法列表](https://open.feishu.cn/document/server-docs/docs/drive-v1/media/introduction?lang=zh-CN#791c8e74 "方法列表")

尝试一下

意见反馈

技术支持

收起

展开