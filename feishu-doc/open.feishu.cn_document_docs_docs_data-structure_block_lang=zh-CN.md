---
url: "https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN"
title: "块的数据结构 - 服务端 API - 开发文档 - 飞书开放平台"
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

[文档的数据结构](https://open.feishu.cn/document/docs/docs/data-structure/document)

[块的数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block)

[表情（Emoji）的枚举值](https://open.feishu.cn/document/docs/docs/data-structure/emoji)

文档

块

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [文档](https://open.feishu.cn/document/server-docs/docs/docs/docx-v1/docx-overview) [数据结构](https://open.feishu.cn/document/docs/docs/data-structure/document)

块的数据结构

# 块的数据结构

复制页面

最后更新于 2025-07-17

本文内容

[块的类型](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#4b726bec "块的类型")

[数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#8b7f3e74 "数据结构")

[内容实体的数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#3e4c8b83 "内容实体的数据结构")

[AddOns](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#fafac076 "AddOns")

[Agenda](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#-6293ecb "Agenda")

[AgendaItem](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#8a42066a "AgendaItem")

[AgendaItemTitle](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f65dfd80 "AgendaItemTitle")

[AgendaTitleElement](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#-35ffd45 "AgendaTitleElement")

[AgendaItemContent](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#83558277 "AgendaItemContent")

[AITemplate](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f1055be3 "AITemplate")

[Bitable](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#bb22fcd8 "Bitable")

[Board](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#3e70ec35 "Board")

[Callout](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#10591ec3 "Callout")

[ChatCard](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#a107e5d "ChatCard")

[Diagram](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#6a09da6 "Diagram")

[Divider](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#4b4dbec6 "Divider")

[File](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#2b183663 "File")

[Grid](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#d04c994f "Grid")

[GridColumn](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#3134f01b "GridColumn")

[Iframe](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#1613ffc1 "Iframe")

[Image](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#a6f35866 "Image")

[ISV](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#371c3007 "ISV")

[JiraIssue](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#c23d1374 "JiraIssue")

[LinkPreview](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#7680e63 "LinkPreview")

[Mindnote](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f3b61121 "Mindnote")

[OKR](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#440e6cc7 "OKR")

[OkrObjective](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f4d0659e "OkrObjective")

[OkrKeyResult](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#0aff39d7 "OkrKeyResult")

[Progress](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#e5c95e9a "Progress")

[ProgressRate](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#-da6f57c "ProgressRate")

[QuoteContainer](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#b48ef162 "QuoteContainer")

[ReferenceSynced](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#25780138 "ReferenceSynced")

[Sheet](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#53fe05b8 "Sheet")

[SourceSynced](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#91c40b0e "SourceSynced")

[SubPageList](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#c40af412 "SubPageList")

[Table](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#28f31481 "Table")

[TableCell](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#eca5d2c3 "TableCell")

[Task](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#8910c274 "Task")

[Text](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#c1ebd2a2 "Text")

[TextStyle](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#1c6877f3 "TextStyle")

[TextElement](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#68268d96 "TextElement")

[TextElementStyle](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#669a5f7b "TextElementStyle")

[TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256 "TextElementData")

[View](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#a1b455e8 "View")

[WikiCatalog](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#5df904ec "WikiCatalog")

[Undefined](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#673858e3 "Undefined")

[枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#06994f37 "枚举")

[Align](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#05e7d57e "Align")

[BlockType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#e8ce4e8e "BlockType")

[BitableViewType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#4a02516f "BitableViewType")

[CalloutBackgroundColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#28d02e32 "CalloutBackgroundColor")

[CalloutBorderColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#fb1f28b8 "CalloutBorderColor")

[CodeLanguage](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#45accc42 "CodeLanguage")

[DiagramType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#55ea480a "DiagramType")

[Emoji](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#33ebcdd "Emoji")

[FontBackgroundColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#45c9c07b "FontBackgroundColor")

[FontColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#be1b12a7 "FontColor")

[IframeComponentType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f7b07e0c "IframeComponentType")

[LinkPreviewURLType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#224f293c "LinkPreviewURLType")

[MentionObjType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#90567af6 "MentionObjType")

[OkrPeriodDisplayStatus](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f13b8192 "OkrPeriodDisplayStatus")

[OkrProgressRateMode](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#514a319f "OkrProgressRateMode")

[OkrProgressStatus](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#0f7206fa "OkrProgressStatus")

[OkrProgressStatusType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#3df1e69a "OkrProgressStatusType")

[TextBackgroundColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#80293bd9 "TextBackgroundColor")

[TextElementType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#eda756c6 "TextElementType")

[TextIndentationLevel](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#19b9b4bf "TextIndentationLevel")

[ViewType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#2296d870 "ViewType")

# 块的数据结构

在一篇文档中，有多个不同类型的段落，这些段落被定义为块（Block）。块是文档中的最小构建单元，是内容的结构化组成元素，有着明确的含义。块有多种形态，可以是一段文字、一张电子表格、一张图片或一个多维表格等。每个块都有唯一的 `block_id` 作为标识。了解更多块的基本概念，参考 [文档概述-基本概念](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview)。

## 块的类型

文档现已支持 50 多种 Block 类型。你可参考本文档下文 **枚举** 小节的 **BlockType** 一节了解具体的 Block 类型。

## 数据结构

块的基础元数据结构如下所示：

```

{
    "block_id": string,                   // 块的唯一标识。创建块时会自动生成
    "block_type": enum(BlockType),       // 块的枚举值，表示块的类型
    "parent_id": string,                 // 块的父块 ID。除了根节点 Page 块外，其余块均有父块
    "children": [](string),              // 块的子块 ID 列表
    "comment_ids": [](string),           // 文档的评论 ID 列表。查询评论内容参考「获取回复」接口
    // 以下为支持的 Block 类型及其对应的内容实体（即 BlockData），如 Text、Image、Table 等。
    // 每种类型的 Block 都有一个对应的 BlockData，并且需与 BlockType 相对应。
    "page": object(Text)                // 页面（根） Block
    "text": object(Text),               // 文本 Block
    "heading1": object(Text),           // 一级标题 Block
    "heading2": object(Text),           // 二级标题 Block
    "heading3": object(Text),           // 三级标题 Block
    "heading4": object(Text),           // 四级标题 Block
    "heading5": object(Text),           // 五级标题 Block
    "heading6": object(Text),           // 六级标题 Block
    "heading7": object(Text),           // 七级标题 Block
    "heading8": object(Text),           // 八级标题 Block
    "heading9": object(Text),           // 九级标题 Block
    "bullet": object(Text),             // 无序列表 Block
    "ordered": object(Text),            // 有序列表 Block
    "code": object(Text),               // 代码块 Block
    "quote": object(Text),              // 引用 Block
    "todo": object(Text),               // 待办事项 Block
    "bitable": object(Bitable),         // 多维表格 Block
    "callout": object(Callout),         // 高亮块 Block
    "chat_card": object(ChatCard),      // 会话卡片 Block
    "diagram": object(Diagram),         // 流程图 & UML 图 Block
    "divider": object(Divider),         // 分割线 Block
    "file": object(File),               // 文件 Block
    "grid": object(Grid),               // 分栏 Block
    "grid_column": object(GridColumn),  // 分栏列 Block
    "iframe": object(Iframe),           // 内嵌 Block
    "image": object(Image),             // 图片 Block
    "isv": object(ISV),                 // 开放平台小组件 Block
    "mindnote": object(Mindnote),       // 思维笔记 Block
    "sheet": object(Sheet),             // 电子表格 Block
    "table": object(Table),             // 表格 Block
    "table_cell": object(TableCell),    // 表格单元格 Block
    "view": object(View),               // 视图 Block
    "undefined": object(Undefined),     // 未定义 Block
    "quote_container": object(QuoteContainer),       // 引用容器 Block
    "task": object(Task),               // 任务 Block
    "okr": object(OKR),                 // OKR Block
    "okr_objective": object(OkrObjective),            // OKR 目标 Block
    "okr_key_result": object(OkrKeyResult),           // OKR 关键结果 Block
    "okr_progress": object(OkrProgress),              // OKR 进展 Block
    "add_ons": object(AddOns),                        // 文档小组件 Block
    "jira_issue": object(JiraIssue),                  // Jira 问题 Block
    "wiki_catalog": object(WikiCatalog),              // Wiki 子页面列表 Block（旧版）
    "board": object(Board),                           // 画板 Block
    "agenda": object(Agenda),                         // 议程 Block
    "agenda_item": object(AgendaItem),                // 议程项 Block
    "agenda_item_title": object(AgendaItemTitle),     // 议程项标题 Block
    "agenda_item_content": object(AgendaItemContent), // 议程项内容 Block
    "link_preview": object(LinkPreview),              // 链接预览 Block
    "source_synced": object(SourceSynced),            // 源同步块
    "reference_synced": object(ReferenceSynced),      // 引用同步块
    "sub_page_list": object(SubPageList),             // Wiki 子页面列表 Block（新版）
    "ai_template": object(AITemplate)                 // AI 模板 Block
}
```

## 内容实体的数据结构

每种类型的块有且只有一个内容实体（BlockData）。其中：

- 部分块的内容实体都为 `Text`，如标题 Block `heading1` \- `headning9`、有序列表 Block `ordered`、代码 Block `code` 等；
- 部分内容实体可容纳其它内容实体，例如：分栏列块（grid\_column）的内容实体 `GridColumn` 可以容纳图片块（image）的内容实体 `Image`。

以下为所有内容实体的数据结构和参数描述。

### AddOns

文档小组件块的内容实体。

```

{
    "component_id": string,
    "component_type_id": string,
    "record": string
}
```

| 名称 | 数据类型 | 属性 | 示例值 | 描述 |
| --- | --- | --- | --- | --- |
| component\_id | string | optional | / | AddOns 文档小组件 ID。该字段为空。 |
| component\_type\_id | string | optional | blk\_6358a421bca0001c1ceabcef | 文档小组件类型 ID，用于区分不同类型的小组件，比如问答互动类。 |
| record | string | optional | {"color": "#FF8800","duration": 86359.465,"isNotify": true,"settingData": {"date": "2023-12-26","time": "20:07"},"startTime": 1703506061535,"timingType": 1} | 文档小组件内容数据，JSON 字符串。 |

### Agenda

议程块的内容实体，为空结构体。议程块的子块中包含多个议程项块。

```

{}
```

### AgendaItem

议程项块的内容实体，为空结构体。议程项块的子块中包含一个议程项标题块和一个议程项内容块。

```

{}
```

### AgendaItemTitle

议程项标题块。

```

{
    "align": enum(Align),
    "elements": [](AgendaTitleElement)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| align | enum(Align) | optional | - | 对齐方式。详情参考 [Align 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#-35ffd45)。 |
| elements | array(AgendaTitleElement) | required | - | 文本元素。详见 [AgendaTitleElement 的数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#68268d96)。 |

### AgendaTitleElement

议程项标题块的文本元素内容实体，支持多种类型。

```

{
    "text_run": object(TextRun),
    "mention_user": object(MentionUser),
    "mention_doc": object(MentionDoc),
    "reminder": object(Reminder),
    "file": object(InlineFile),
    "inline_block": object(InlineBlock),
    "equation": object(Equation),
    "undefined_element": object(UndefinedElement),
}
```

| 名称 | 数据类型 | 属性 | 描述 |
| --- | --- | --- | --- |
| text\_run | object(TextRun) | optional | 文字。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 TextRun 的数据结构。 |
| mention\_user | object(MentionUser) | optional | @用户。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 MentionUser 的数据结构。 |
| mention\_doc | object(MentionDoc) | optional | @文档。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 MentionDoc 的数据结构。 |
| reminder | object(Reminder) | optional | 日期提醒。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 Reminder 的数据结构。 |
| file | object(InlineFile) | optional | 内联文件。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 InlineFile 的数据结构。 |
| inline\_block | object(InlineBlock) | optional | 内联文件块的内容实体。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 InlineBlock 的数据结构。 |
| equation | object(Equation) | optional | 公式。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 Equation 的数据结构。 |
| undefined\_element | object(UndefinedElement) | optional | 未支持的 TextElementData 内容实体。为空结构体。 |

### AgendaItemContent

议程项内容块，为空结构体。

```

{}
```

### AITemplate

AI 模板 Block, 该 Block 目前只读，不支持创建。

```

{}
```

### Bitable

多维表格块的内容实体。目前支持通过指定 `view_type` 创建空 Bitable。

```

{
    "token": string,
    "view_type": enum(BitableViewType)
}
```

| 名称 | 数据类型 | 属性 | 示例值 | 描述 |
| --- | --- | --- | --- | --- |
| token | string | required | JMeVbqbrtaoJijsExcXcN9abcef\_tblBRJhqKXUABCEF | 多维表格在文档中的 Token，只读属性。 格式为 BitableToken\_TableID，其中，BitableToken 是一篇多维表格唯一标识，TableID 是一张数据表的唯一标识，使用时请注意拆分。 |
| view\_type | enum(BitableViewType) | required | 1 | 视图类型。详情参考 [BitableViewType 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#4a02516f)。 |

### Board

画板块的内容实体。

```

{
  "token": string,
  "align": enum(Align),
  "width": int,
  "height": int
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| token | string | optional | - | 画板的 token，只读属性，插入画板块后自动生成 |
| align | enum(Align) | optional | - | 对齐方式。详情参考 [Align 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#05e7d57e)。 |
| width | int | optional | - | 宽度，单位像素；不填时自动适应文档宽度；值超出文档最大宽度时，页面渲染为文档最大宽度 |
| height | int | optional | - | 高度，单位像素；不填时自动根据画板内容计算；值超出屏幕两倍高度时，页面渲染为屏幕两倍高度 |

### Callout

高亮块块的内容实体。

```

{
    "background_color": enum(BackgroundColor),
    "border_color": enum(BorderColor),
    "text_color": enum(FontColor),
    "emoji_id": string
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| background\_color | enum(BackgroundColor) | optional | / | 背景色。默认为透明色。详情参考 [CalloutBackgroundColor 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#28d02e32)。 |
| border\_color | enum(BorderColor) | optional | / | 边框色。默认为透明色。详情参考 [CalloutBorderColor 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#fb1f28b8)。 |
| text\_color | enum(FontColor) | optional | / | 字体色。默认为黑色。详情参考 [FontColor 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#be1b12a7)。 |
| emoji\_id | enum(string) | optional | gift | 表情的唯一标识。详情参考 [Emoji 枚举](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/emoji)。 |

### ChatCard

会话卡片块的内容实体。

```

{
    "chat_id": string,
    "align": enum(Align)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| chat\_id | string | required | - | 群聊天会话的 OpenID，以 ‘oc\_’ 开头，表示专为开放能力接口定义的群组 ID。对于写操作，如果用户不在该群则返回无权限错误。 |
| align | enum(Align) | optional | - | 对齐方式。详情参考 [Align 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#05e7d57e)。 |

### Diagram

流程图 & UML 图块的内容实体。

```

{
    "diagram_type": enum(DiagramType)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| diagram\_type | enum(DiagramType) | optional | - | 绘图类型。详情参考 [DiagramType 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#55ea480a)。 |

### Divider

分割线 Block 的内容实体，为空结构体。

```

{}
```

### File

文件块的内容实体。文件块不能独立存在，须与视图块一同出现。文件视图是通过视图块的 `view_type` 实现的，包括卡片视图和预览视图。在创建文件块时，系统会自动生成默认的视图块的内容实体。了解如何插入文件，参考 [常见问题-如何插入文件](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#891c2784)。

```

{
    "token": string,
    "name": string,
    "view_type": int
}
```

| 名称 | 数据类型 | 属性 | 示例值 | 描述 |
| --- | --- | --- | --- | --- |
| token | string | optional | M32ObeW83ouh8mxFiHycqVabcef | 文件的 Token，只读属性。 |
| name | string | optional | VID\_20231224\_163819.mp4 | 文件名称，只读属性。 |
| view\_type | int | optional | 1 | 视图类型，int 类型：<br> \- 1：卡片视图（默认）<br> \- 2：预览视图 |

### Grid

分栏块的内容实体。

```

{
    "column_size": int
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| column\_size | int | required | - | 分栏列数量，取值范围为 \[2,5\]。 |

### GridColumn

分栏列块的内容实体。

```

{
    "width_ratio": int
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| width\_ratio | int | optional | - | 当前分栏列占整个分栏的比例，取值范围为 \[1,99\]。 |

### Iframe

内嵌块的内容实体。

```

{
    "component": {
      "type": enum(IframeComponentType),
      "url": string
    }
}
```

| 名称 | 数据类型 | 属性 | 示例值 | 描述 |
| --- | --- | --- | --- | --- |
| component | object(IframeComponent) | required | 无 | Iframe 组件。 |
| component.type | enum(IframeComponentType) | required | 12 | Iframe 组件类型。详情参考 [IframeComponentType 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f7b07e0c)。 |
| component.url | string | required | http://https%3A%2F%2Fwenjuan.feishu.cn)%2Fm%3Ft%3DsVOKVVz7rwpi-abcd | 目标网页 URL，读写均需要进行 URL 编码。 |

### Image

图片块的内容实体。了解如何插入图片块，参考 [常见问题-如何插入图片](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#1908ddf0)。

```

{
    "token": string,
    "width": int,
    "height": int,
    "caption": {
        "content": string
    }
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| token | string | optional | - | 图片 Token，只读属性。 |
| width | int | optional | 100 | 图片宽度，单位为像素。 |
| height | int | optional | 100 | 图片高度，单位为像素。 |
| align | int | optional | 2 | 对齐方式。详情参考 [Align 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#05e7d57e)。 |
| caption | object | optional | - | 图片描述 |
| caption.content | string | optional | - | 图片描述的纯文本内容 |

### ISV

旧版开放平台小组件块的内容实体。要查看新版开放平台小组件块的内容实体，参考 [AddOns](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#fafac076)。

```

{
    "component_id": string,
    "component_type_id": string
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| component\_id | string | optional | - | ISV 文档小组件 ID。 |
| component\_type\_id | string | optional | - | 文档小组件类型 ID，用于区分不同类型的小组件，比如信息收集类。 |

### JiraIssue

Jira 问题块的内容实体。

```

{
    "id": string,
    "key": string
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| id | string | optional | - | Jira 问题的 ID。 |
| key | string | optional | - | Jira 问题的 Key。 |

### LinkPreview

链接预览块的内容实体。

当前仅支持使用消息链接创建链接预览块，仅消息链接的创建者可插入消息链接。

```

{
    "url": string,
    "url_type": enum(LinkPreviewURLType)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| url | string | required | - | 链接，只写属性，查询时不返回 |
| url\_type | enum(LinkPreviewURLType) | required | - | 链接类型，详见： [LinkPreviewURLType 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#224f293c) |

### Mindnote

思维笔记块的内容实体。

目前只支持获取思维笔记块的占位信息，不支持创建及编辑。

```

{
    "token": string
}
```

| 名称 | 数据类型 | 示例值 | 描述 |
| --- | --- | --- | --- |
| token | string | bmnbcJ7X9yUiNbuG8Dfkgqabcef | 思维笔记的 Token。 |

### OKR

OKR 块的内容实体，仅可在使用 `user_access_token` 时创建。

**创建**

```

{
    "okr_id": string,
    "objectives": [](Objective)
}
 // Objective
{
    "objective_id": string,
    "kr_ids": [](string)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| okr\_id | string | required | - | OKR ID，获取 OKR ID，参考 [获取用户的 OKR 列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/okr-v1/user-okr/list)。 |
| objectives | array(Objective) | optional | - | OKR Block 中的 Objective ID 和 Key Result ID。 此值为空时插入 OKR 下所有的目标和关键结果。 |
| objectives.objective\_id | string | required | - | OKR 中目标的 ID。 |
| objectives.kr\_ids | array(string) | optional | - | 关键结果的 ID 列表。 此值为空时插入当前目标下的所有关键结果。 |

**获取**

```

{
    "okr_id": string,
    "period_display_status": enum(OkrPeriodDisplayStatus),
    "period_name_zh": string,
    "period_name_en": string,
    "user_id": string,
    "visible_setting": {
        "progress_fill_area_visible": boolean,
        "progress_status_visible": boolean,
        "score_visible": boolean
    }
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| okr\_id | string | optional | - | OKR ID。 |
| period\_display\_status | enum(OkrPeriodDisplayStatus) | optional | - | 周期的状态。 |
| period\_name\_zh | string | optional | - | 周期名 \- 中文。 |
| period\_name\_en | string | optional | - | 周期名 \- 英文。 |
| user\_id | string | optional | - | OKR 所属的用户 ID。 |
| visible\_setting | object(VisibleSetting) | optional | - | 可见性设置。 |
| visible\_setting.progress\_fill\_area\_visible | boolean | optional | TRUE | 进展编辑区域是否可见。 |
| visible\_setting.progress\_status\_visible | boolean | optional | TRUE | 进展状态是否可见。 |
| visible\_setting.score\_visible | boolean | optional | TRUE | 分数是否可见。 |

### OkrObjective

OKR 目标块的内容实体。

```

{
    "objective_id": string,
    "confidential": boolean,
    "position": int,
    "score": int,
    "visible": int,
    "weight": float,
    "progress_rate": object(ProgressRate),
    "content": object(Text)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| objective\_id | string | optional | - | OKR 目标 ID。 |
| confidential | boolean | optional | - | 是否在 OKR 平台设置了私密权限。 |
| position | int | optional | - | Objective 的位置编号，对应 Block 中 O1、O2 的 1、2。 |
| score | int | optional | - | 打分信息。 |
| visible | boolean | optional | TRUE | OKR Block 中是否展示该目标。 |
| weight | float | optional | - | 目标的权重。 |
| progress\_rate | object(ProgressRate) | optional | - | 进展信息。 |
| content | object(Text) | optional | - | 目标的文本内容。 |

### OkrKeyResult

OKR Key Result（关键结果）块的内容实体。

```

{
    "kr_id": string,
    "confidential": boolean,
    "position": int,
    "score": int,
    "visible": int,
    "weight": float,
    "progress_rate": object(ProgressRate),
    "content": object(Text)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| kr\_id | string | optional | - | OKR 关键结果 ID。 |
| confidential | boolean | optional | - | 是否在 OKR 平台设置了私密权限。 |
| position | int | optional | - | Key Result 的位置编号，对应 Block 中 KR1、KR2 的 1、2。 |
| score | int | optional | - | 打分信息。 |
| visible | boolean | optional | TRUE | OKR 块中是否展示该关键结果。 |
| weight | float | optional | - | 关键结果的权重。 |
| progress\_rate | object(ProgressRate) | optional | - | 进展信息。 |
| content | object(Text) | optional | - | 关键结果的文本内容。 |

### Progress

OKR 进展块的内容实体，为空结构体。

```

{}
```

### ProgressRate

OKR 进展信息块的内容实体。

```

{
    "mode": enum(OkrProgressRateMode),
    "current": float,
    "percent": float,
    "progress_status": enum(OkrProgressStatus),
    "status_type": enum(OkrProgressStatusType),
    "start": float,
    "target": float
}
```

| 名称 | 数据类型 | 属性 | 描述 |
| --- | --- | --- | --- |
| mode | enum(OkrProgressRateMode) | optional | 状态模式，分 simple 和 advanced 两种。详情参考 [OkrProgressRateMode 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#514a319f)。 |
| status\_type | enum(OkrProgressStatusType) | optional | 进展状态计算类型。详情参考 [OkrProgressStatusType 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#3df1e69a)。 |
| progress\_status | enum(OkrProgressStatus) | optional | 进展状态。详情参考 [OkrProgressStatus 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#0f7206fa)。 |
| percent | float | optional | 当前进度百分比，simple 模式下使用。 |
| start | float | optional | 进度起始值，advanced 模式使用。 |
| current | float | optional | 当前进度, advanced 模式使用。 |
| target | float | optional | 进度目标值，advanced 模式使用。 |

### QuoteContainer

引用容器块的内容实体，为空结构体。

```

{}
```

### ReferenceSynced

引用同步块。通过复制粘贴得到的同步块称为引用同步块，该 Block 目前只读，不支持创建。获取引用同步块内容详见： [如何获取引用同步块的内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#19b71234)

```

{
  "source_block_id": string,
  "source_document_id": string
}
```

| 名称 | 数据类型 | 属性 | 描述 |
| --- | --- | --- | --- |
| source\_block\_id | string | optional | 源同步块的 Block ID |
| source\_document\_id | string | optional | 源文档的文档 ID |

### Sheet

电子表格块的内容实体。目前只支持指定 `row_size` 和 `column_size` 创建空 Sheet。

```

{
    "token": string,
    "row_size": int,
    "column_size": int
}
```

| 名称 | 数据类型 | 属性 | 示例值 | 描述 |
| --- | --- | --- | --- | --- |
| token | string | optional | HP8psReUphghsYtr3VVcnqabcef\_6ZSnoL | 电子表格的文档 Token，只读属性。 格式为 SpreadsheetToken\_SheetID。其中，SpreadsheetToken是一篇电子表格的唯一标识，SheetID 是一张工作表的唯一标识，使用时请注意拆分。 |
| row\_size | int | optional | 2 | 电子表格行数量。创建空电子表格时使用，最大值 9。 |
| column\_size | int | optional | 2 | 电子表格列数量。创建空电子表格时使用，最大值 9。 |

### SourceSynced

源同步块的内容实体。文档中直接创建的同步块称为源同步块，该 Block 目前只读，不支持创建。

```

{
	"elements": [](TextElement),
	"align": enum(Align)
}
```

| 名称 | 数据类型 | 属性 | 描述 |
| --- | --- | --- | --- |
| elements | array(TextElement) | optional | 同步块独立页标题，由文本元素组成。详见 [TextElement 的数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#68268d96)。 |
| align | enum(Align) | optional | 对齐方式。详情参考 [Align 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#05e7d57e)。 |

### SubPageList

Wiki 新版子目录块的内容实体。

```

{
  "wiki_token": string
}
```

| 名称 | 数据类型 | 属性 | 描述 |
| --- | --- | --- | --- |
| wiki\_token | string | optional | 知识库节点 token，仅支持知识库文档创建子页面列表，且需传入当前页面的 wiki token |

### Table

表格块的内容实体。支持指定 `property` 创建空表格。

```

{
    "cells":  [](string),
    "property": {
        "row_size": int,
        "column_size": int,
        "column_width":[](int),
        "header_row": boolean,
        "header_column": boolean,
        "merge_info": [](TableMergeInfo)
    }
}
 // TableMergeInfo 单元格合并信息
{
    "row_span": int,
    "col_span": int
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| cells | array(string) | optional | - | 单元格块 ID 数组。创建表格时将由系统自动生成。 |
| property | object(TableProperty) | required | - | 表格属性。 |
| property.row\_size | int | required | - | 行数。 |
| property.column\_size | int | required | - | 列数。 |
| property.column\_width | array(int) | optional | - | 列宽，单位为像素。 |
| property.header\_row | boolean | optional | FALSE | 是否设置首行为标题行。 |
| property.header\_column | boolean | optional | FALSE | 是否设置首列为标题列。 |
| property.merge\_info | object(TableMergeInfo) | optional | - | 单元格合并信息。在创建表格时，此属性只读，将由系统进行生成。如果需要对单元格进行合并操作，可以通过更新块的子请求 merge\_table\_cells 来实现。 |
| property.merge\_info.row\_span | int | optional | - | 从当前单元格的行索引起，被合并的连续行数。如在 2 行 3 列的合并单元格中，左上角的单元格的 `row_span` 为 2，表示从该单元格的行索引起，被连续合并了两行。在创建表格时，此属性只读。 |
| property.merge\_info.col\_span | int | optional | - | 从当前单元格的列索引起，被合并的连续列数。如在 2 行 3 列的合并单元格中，左上角的单元格的 `col_span` 为 3，表示从该单元格的列索引起，被连续合并了三列。在创建表格时，此属性只读。 |

### TableCell

单元格块的内容实体，为空结构体。了解如何在单元格块中填充内容，参考 [文档常见问题-如何插入带内容的表格](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#125f6a42)。

```

{}
```

### Task

任务块的内容实体。注意你只能获取任务块的任务 ID，无法创建或编辑任务块。如需获取任务详情，调用 [获取任务详情](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/get) 接口。

```

{
    "task_id": string
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| task\_id | string | required | - | 任务 ID。 |

### Text

页面、文本、一到九级标题、无序列表、有序列表、代码块、待办事项块的内容实体。支持多种样式和元素。可容纳 TextStyle 和 TextElement。

```

{
    "style": object(TextStyle),
    "elements": [](TextElement)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| style | object(TextStyle) | optional | - | 文本样式。详见 [TextStyle 的数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#1c6877f3)。 |
| elements | array(TextElement) | required | - | 文本元素。详见 [TextElement 的数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#68268d96)。 |

### TextStyle

文本样式内容实体。

```

{
    "align": enum(Align),
    "done": boolean,
    "folded": boolean,
    "language": enum(CodeLanguage),
    "wrap": boolean,
    "background_color": enum(TextBackgroundColor),
    "indentation_level": enum(TextIndentationLevel),
    "sequence": string
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| align | enum(Align) | optional | 1 | 对齐方式。详情参考 [Align 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#05e7d57e)。 |
| done | boolean | optional | FALSE | Todo 的完成状态。 |
| folded | boolean | optional | FALSE | 文本的折叠状态。 |
| language | enum(CodeLanguage) | optional | - | 代码块语言。详情参考 [CodeLanguage 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#45accc42)。 |
| wrap | boolean | optional | FALSE | 代码块是否自动换行。 |
| background\_color | enum(TextBackgroundColor) | optional | - | 块的背景色。详情参考 [TextBackgroundColor 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#80293bd9) |
| indentation\_level | enum(TextIndentationLevel) | optional | - | 首行缩进级别, 仅在文本块中返回。详情参考 [TextIndentationLevel 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#19b9b4bf) |
| sequence | string | optional | - | 用来确定有序列表编号，为具体数字或 'auto'<br> \- 开始新列表时，编号从 1 开始，sequence='1'<br> \- 手动修改为非连续编号时，编号为设定的数字，如 sequence='3'<br> \- 使用继续编号时，编号自动连续，sequence='auto'<br> \- 部分历史数据和通过 OpenAPI 创建的有序列表不返回此字段 |

### TextElement

文本元素内容实体，支持多种类型。

```

{
    "text_run": object(TextRun),
    "mention_user": object(MentionUser),
    "mention_doc": object(MentionDoc),
    "reminder": object(Reminder),
    "file": object(InlineFile),
    "inline_block": object(InlineBlock),
    "equation": object(Equation),
    "undefined_element": object(UndefinedElement),
}
```

| 名称 | 数据类型 | 属性 | 描述 |
| --- | --- | --- | --- |
| text\_run | object(TextRun) | optional | 文字。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 TextRun 的数据结构。 |
| mention\_user | object(MentionUser) | optional | @用户。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 MentionUser 的数据结构。 |
| mention\_doc | object(MentionDoc) | optional | @文档。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 MentionDoc 的数据结构。 |
| reminder | object(Reminder) | optional | 日期提醒。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 Reminder 的数据结构。 |
| file | object(InlineFile) | optional | 内联文件。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 InlineFile 的数据结构。 |
| inline\_block | object(InlineBlock) | optional | 内联文件块的内容实体。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 InlineBlock 的数据结构。 |
| equation | object(Equation) | optional | 公式。详见 [TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256) 一节中 Equation 的数据结构。 |
| undefined\_element | object(UndefinedElement) | optional | 未支持的 TextElementData 内容实体。为空结构体。 |

### TextElementStyle

文本局部样式内容实体。

```

{
    "bold": boolean,
    "italic": boolean,
    "strikethrough": boolean,
    "underline": boolean,
    "inline_code": boolean,
    "text_color": enum(FontColor),
    "background_color": enum(BackgroundColor),
    "link": {
		"url": string
    },
    "comment_ids": [](string)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| bold | boolean | optional | FALSE | 加粗 |
| italic | boolean | optional | FALSE | 斜体 |
| strikethrough | boolean | optional | FALSE | 删除线 |
| underline | boolean | optional | FALSE | 下划线 |
| inline\_code | boolean | optional | FALSE | 内联代码 |
| text\_color | enum(FontColor) | optional | - | 字体色。详情参考 [FontColor 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#be1b12a7)。 |
| background\_color | enum(FontBackgroundColor) | optional | - | 字体背景色。详情参考 [FontBackgroundColor 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#45c9c07b)。 |
| link | object(Link) | optional | - | 超链接 |
| link.url | string | required | - | 超链接指向的 URL（需要 url\_encode）<br>**示例值**："https%3A%2F%2Fopen.feishu.cn%2F" |
| comment\_ids | array(string) | optional | - | 评论 ID 列表。在创建块时，不支持传入评论 ID；在更新文本块的 Element 时，允许将对应版本已存在的评论 ID 移动到同一个块内的任意 Element 中，但不支持传入新的评论 ID。如需查询评论内容请参考 [获取回复](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/file-comment-reply/list) 接口。 |

### TextElementData

本小节介绍文本元素（TextElement）的内容实体。

#### TextRun

文字的内容实体。

```

{
    "content": string,
    "text_element_style": object(TextElementStyle)
}
```

| 名称 | 数据类型 | 属性 | 描述 |
| --- | --- | --- | --- |
| content | string | required | 文本 |
| text\_element\_style | object(TextElementStyle) | optional | 文本局部样式。详情参考 [TextElementStyle 数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#669a5f7b)。 |

#### MentionUser

提及用户（@用户）内容实体。

```

{
    "user_id": string,
    "text_element_style": object(TextElementStyle)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| user\_id | string | required | - | 用户 OpenID。参考 [如何获取自己的 User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id) 获取 user\_id。 |
| text\_element\_style | object(TextElementStyle) | optional | - | 文本局部样式。详情参考 [TextElementStyle 数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#669a5f7b)。 |

#### MentionDoc

提及文档（@文档）块的内容实体。

```

{
    "token": string,
    "obj_type": enum(MentionObjType),
    "url": string,
    "text_element_style": object(TextElementStyle)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| token | string | required | - | 云文档 token |
| obj\_type | enum(MentionObjType) | required | - | 云文档类型。详情参考 [MentionObjType 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#90567af6)。 |
| url | string | required | - | 云文档链接。读写均需要进行 URL 编码。 |
| text\_element\_style | object(TextElementStyle) | optional | - | 文本局部样式。详情参考 [TextElementStyle 数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#669a5f7b)。 |

#### Reminder

日期提醒内容实体。

```

{
    "create_user_id": string,
    "is_notify": boolean,
    "is_whole_day": boolean,
    "expire_time": int,
    "notify_time": int,
    "text_element_style": object(TextElementStyle)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| create\_user\_id | string | required | - | 创建者用户 ID。 |
| is\_notify | boolean | optional | FALSE | 是否通知。 |
| is\_whole\_day | boolean | optional | FALSE | 是日期还是整点小时。 |
| expire\_time | int | required | - | 事件发生的时间（毫秒级时间戳）。 |
| notify\_time | int | required | - | 触发通知的时间（毫秒级时间戳）。 |
| text\_element\_style | object(TextElementStyle) | optional | - | 文本局部样式。详情参考 [TextElementStyle 数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#669a5f7b)。 |

#### InlineFile（仅输出）

内联文件内容实体。

```

{
    "file_token": string,
    "source_block_id": string,
    "text_element_style": object(TextElementStyle)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| file\_token | string | optional | - | 文件的 Token。 |
| source\_block\_id | string | optional | - | 当前文档中该文件所处的块的 ID。 |
| text\_element\_style | object(TextElementStyle) | optional | - | 文本局部样式。详情参考 [TextElementStyle 数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#669a5f7b)。 |

#### InlineBlock (仅输出)

内联块的内容实体。

```

{
        "block_id": string,
        "text_element_style": object(TextElementStyle)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| block\_id | string | optional | - | 文本块中内联文件块的 Block ID。 |
| text\_element\_style | object(TextElementStyle) | optional | - | 文本局部样式。详情参考 [TextElementStyle 数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#669a5f7b)。 |

#### Equation

公式内容实体。

```

{
    "content": string,
    "text_element_style": object(TextElementStyle)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| content | string | required | - | 符合 KaTeX 语法的公式内容。语法规则参考 [KaTex 官方说明](https://katex.org/docs/supported.html)。 |
| text\_element\_style | object(TextElementStyle) | optional | - | 文本局部样式。详情参考 [TextElementStyle 数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#669a5f7b)。 |

#### UndefinedElement（仅输出）

未支持的 TextElementData 内容实体，为空结构体。

```

{}
```

### View

视图块的内容实体。

```

{
    "view_type": enum(ViewType)
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| view\_type | enum(ViewType) | optional | - | 视图类型。详情参考 [ViewType 枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#2296d870)。 |

### WikiCatalog

Wiki 子目录块的内容实体。

```

{
  "wiki_token": string
}
```

| 名称 | 数据类型 | 属性 | 默认值 | 描述 |
| --- | --- | --- | --- | --- |
| wiki\_token | string | optional | - | 知识库 token ，默认为当前文档所属知识库节点 token。了解如何获取知识库节点 token，参考 [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)。 |

### Undefined

其它暂未支持的内容实体。只支持获取其 ID。这些内容实体不支持创建和更新，但支持删除。

## 枚举

### Align

块的排版方式。

| 枚举值 | 描述 |
| --- | --- |
| 1 | 居左排版 |
| 2 | 居中排版 |
| 3 | 居右排版 |

### BlockType

| 枚举值 | JSON 类型关键字 | 描述 |
| --- | --- | --- |
| 1 | page | 页面 Block |
| 2 | text | 文本 Block |
| 3 | heading1 | 标题 1 Block |
| 4 | heading2 | 标题 2 Block |
| 5 | heading3 | 标题 3 Block |
| 6 | heading4 | 标题 4 Block |
| 7 | heading5 | 标题 5 Block |
| 8 | heading6 | 标题 6 Block |
| 9 | heading7 | 标题 7 Block |
| 10 | heading8 | 标题 8 Block |
| 11 | heading9 | 标题 9 Block |
| 12 | bullet | 无序列表 Block |
| 13 | ordered | 有序列表 Block |
| 14 | code | 代码块 Block |
| 15 | quote | 引用 Block |
| 17 | todo | 待办事项 Block |
| 18 | bitable | 多维表格 Block |
| 19 | callout | 高亮块 Block |
| 20 | chat\_card | 会话卡片 Block |
| 21 | diagram | 流程图 & UML Block |
| 22 | divider | 分割线 Block |
| 23 | file | 文件 Block |
| 24 | grid | 分栏 Block |
| 25 | grid\_column | 分栏列 Block |
| 26 | iframe | 内嵌 Block Block |
| 27 | image | 图片 Block |
| 28 | isv | 开放平台小组件 Block |
| 29 | mindnote | 思维笔记 Block |
| 30 | sheet | 电子表格 Block |
| 31 | table | 表格 Block |
| 32 | table\_cell | 表格单元格 Block |
| 33 | view | 视图 Block |
| 34 | quote\_container | 引用容器 Block |
| 35 | task | 任务 Block |
| 36 | okr | OKR Block |
| 37 | okr\_objective | OKR Objective Block |
| 38 | okr\_key\_result | OKR Key Result Block |
| 39 | okr\_progress | OKR Progress Block |
| 40 | add\_ons | 新版文档小组件 Block |
| 41 | jira\_issue | Jira 问题 Block |
| 42 | wiki\_catalog | Wiki 子页面列表 Block（旧版） |
| 43 | board | 画板 Block |
| 44 | agenda | 议程 Block |
| 45 | agenda\_item | 议程项 Block |
| 46 | agenda\_item\_title | 议程项标题 Block |
| 47 | agenda\_item\_content | 议程项内容 Block |
| 48 | link\_preview | 链接预览 Block |
| 49 | source\_synced | 源同步块 |
| 50 | reference\_synced | 引用同步块 |
| 51 | sub\_page\_list | Wiki 子页面列表 Block（新版） |
| 52 | ai\_template | AI 模板 Block |
| 999 | undefined | 未支持 Block |

### BitableViewType

Bitable Block 的视图类型。

| 枚举值 | 描述 |
| --- | --- |
| 1 | 数据表 |
| 2 | 看板 |

### CalloutBackgroundColor

高亮块的背景色。

| 枚举值 | 描述 |
| --- | --- |
| 1 | 浅红色 |
| 2 | 浅橙色 |
| 3 | 浅黄色 |
| 4 | 浅绿色 |
| 5 | 浅蓝色 |
| 6 | 浅紫色 |
| 7 | 中灰色 |
| 8 | 中红色 |
| 9 | 中橙色 |
| 10 | 中黄色 |
| 11 | 中绿色 |
| 12 | 中蓝色 |
| 13 | 中紫色 |
| 14 | 灰色 |
| 15 | 浅灰色 |

### CalloutBorderColor

高亮块的边框色（色系与高亮块背景色色系一致）。

| 枚举值 | 描述 |
| --- | --- |
| 1 | 红色 |
| 2 | 橙色 |
| 3 | 黄色 |
| 4 | 绿色 |
| 5 | 蓝色 |
| 6 | 紫色 |
| 7 | 灰色 |

### CodeLanguage

代码块语言。

| 枚举值 | 描述 |
| --- | --- |
| 1 | PlainText |
| 2 | ABAP |
| 3 | Ada |
| 4 | Apache |
| 5 | Apex |
| 6 | Assembly |
| 7 | Bash |
| 8 | CSharp |
| 9 | C++ |
| 10 | C |
| 11 | COBOL |
| 12 | CSS |
| 13 | CoffeeScript |
| 14 | D |
| 15 | Dart |
| 16 | Delphi |
| 17 | Django |
| 18 | Dockerfile |
| 19 | Erlang |
| 20 | Fortran |
| 21 | FoxPro |
| 22 | Go |
| 23 | Groovy |
| 24 | HTML |
| 25 | HTMLBars |
| 26 | HTTP |
| 27 | Haskell |
| 28 | JSON |
| 29 | Java |
| 30 | JavaScript |
| 31 | Julia |
| 32 | Kotlin |
| 33 | LateX |
| 34 | Lisp |
| 35 | Logo |
| 36 | Lua |
| 37 | MATLAB |
| 38 | Makefile |
| 39 | Markdown |
| 40 | Nginx |
| 41 | Objective |
| 42 | OpenEdgeABL |
| 43 | PHP |
| 44 | Perl |
| 45 | PostScript |
| 46 | PowerShell |
| 47 | Prolog |
| 48 | ProtoBuf |
| 49 | Python |
| 50 | R |
| 51 | RPG |
| 52 | Ruby |
| 53 | Rust |
| 54 | SAS |
| 55 | SCSS |
| 56 | SQL |
| 57 | Scala |
| 58 | Scheme |
| 59 | Scratch |
| 60 | Shell |
| 61 | Swift |
| 62 | Thrift |
| 63 | TypeScript |
| 64 | VBScript |
| 65 | Visual |
| 66 | XML |
| 67 | YAML |
| 68 | CMake |
| 69 | Diff |
| 70 | Gherkin |
| 71 | GraphQL |
| 72 | OpenGL Shading Language |
| 73 | Properties |
| 74 | Solidity |
| 75 | TOML |

### DiagramType

绘图类型。

| 枚举值 | 描述 |
| --- | --- |
| 1 | 流程图 |
| 2 | UML 图 |

### Emoji

高亮块（Callout）Block 支持的表情。详情参考 [表情（Emoji）的枚举值](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/emoji)。

### FontBackgroundColor

字体的背景色（分为深色系和浅色系）。

| 枚举值 | 描述 |
| --- | --- |
| 1 | 浅红色 |
| 2 | 浅橙色 |
| 3 | 浅黄色 |
| 4 | 浅绿色 |
| 5 | 浅蓝色 |
| 6 | 浅紫色 |
| 7 | 中灰色 |
| 8 | 红色 |
| 9 | 橙色 |
| 10 | 黄色 |
| 11 | 绿色 |
| 12 | 蓝色 |
| 13 | 紫色 |
| 14 | 灰色 |
| 15 | 浅灰色 |

### FontColor

字体色。

| 枚举值 | 描述 |
| --- | --- |
| 1 | 红色 |
| 2 | 橙色 |
| 3 | 黄色 |
| 4 | 绿色 |
| 5 | 蓝色 |
| 6 | 紫色 |
| 7 | 灰色 |

### IframeComponentType

内嵌 Block 支持的类型。

| 枚举值 | 描述 |
| --- | --- |
| 1 | 哔哩哔哩 |
| 2 | 西瓜视频 |
| 3 | 优酷 |
| 4 | Airtable |
| 5 | 百度地图 |
| 6 | 高德地图 |
| 7 | Undefined |
| 8 | Figma |
| 9 | 墨刀 |
| 10 | Canva |
| 11 | CodePen |
| 12 | 飞书问卷 |
| 13 | 金数据 |
| 14 | Undefined |
| 15 | Undefined |

### LinkPreviewURLType

链接预览 Block 支持的链接类型。

| 枚举值 | 描述 |
| --- | --- |
| MessageLink | IM 消息链接 |
| Undefined | 未定义的链接类型（该枚举为只读属性） |

### MentionObjType

Mention 云文档类型。

| 枚举值 | 描述 |
| --- | --- |
| 1 | Doc |
| 3 | Sheet |
| 8 | Bitable |
| 11 | MindNote |
| 12 | File |
| 15 | Slide |
| 16 | Wiki |
| 22 | Docx |

### OkrPeriodDisplayStatus

OKR 周期的状态。

| 枚举值 | 描述 |
| --- | --- |
| default | 默认 |
| normal | 正常 |
| invalid | 失效 |
| hidden | 隐藏 |

### OkrProgressRateMode

OKR 进展状态模式。

| 枚举值 | 描述 |
| --- | --- |
| simple | 简单模式 |
| advanced | 高级模式 |

### OkrProgressStatus

OKR 进展状态。

| 枚举值 | 描述 |
| --- | --- |
| unset | 未设置 |
| normal | 正常 |
| risk | 有风险 |
| extended | 已延期 |

### OkrProgressStatusType

OKR 进展所展示的状态计算类型。

| 枚举值 | 描述 |
| --- | --- |
| default | 以风险最高的 Key Result 状态展示 |
| custom | 自定义 |

### TextBackgroundColor

文本块的块级别背景色

| 枚举值 | 描述 |
| --- | --- |
| LightGrayBackground | 浅灰色 |
| LightRedBackground | 浅红色 |
| LightOrangeBackground | 浅橙色 |
| LightYellowBackground | 浅黄色 |
| LightGreenBackground | 浅绿色 |
| LightBlueBackground | 浅蓝色 |
| LightPurpleBackground | 浅紫色 |
| PaleGrayBackground | 中灰色 |
| DarkGrayBackground | 灰色 |
| DarkRedBackground | 中红色 |
| DarkOrangeBackground | 中橙色 |
| DarkYellowBackground | 中黄色 |
| DarkGreenBackground | 中绿色 |
| DarkBlueBackground | 中蓝色 |
| DarkPurpleBackground | 中紫色 |

### TextElementType

| 枚举值 | 描述 |
| --- | --- |
| text\_run | 文字 |
| mention\_user | @用户 |
| mention\_doc | @文档 |
| file | @文件 |
| reminder | 日期提醒 |
| undefined | 未支持元素 |
| equation | 公式 |

### TextIndentationLevel

文本块首行缩进级别

| 枚举值 | 描述 |
| --- | --- |
| NoIndent | 无缩进 |
| OneLevelIndent | 一级缩进 |

### ViewType

View Block 的视图类型。

| 枚举值 | 描述 |
| --- | --- |
| 1 | 卡片视图，独占一行的一种视图，在 Card 上可有一些简单交互 |
| 2 | 预览视图，在当前页面直接预览插入的 Block 内容，而不需要打开新的页面 |
| 3 | 内联视图 |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fdocs%2Fdocs%2Fdata-structure%2Fblock%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何读取文档中电子表格块的详细内容？](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/faq#79f1c19b)

[如何为应用开通云文档相关资源的权限?](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[如何获取云文档资源相关 token？](https://open.feishu.cn/document/server-docs/docs/faq#08bb5df6)

[应用身份创建的文档，如何给用户授权？](https://open.feishu.cn/document/server-docs/docs/permission/faq#1f89d567)

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

遇到其他问题？问问 开放平台智能助手

[上一篇：文档的数据结构](https://open.feishu.cn/document/docs/docs/data-structure/document) [下一篇：表情（Emoji）的枚举值](https://open.feishu.cn/document/docs/docs/data-structure/emoji)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[块的类型](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#4b726bec "块的类型")

[数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#8b7f3e74 "数据结构")

[内容实体的数据结构](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#3e4c8b83 "内容实体的数据结构")

[AddOns](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#fafac076 "AddOns")

[Agenda](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#-6293ecb "Agenda")

[AgendaItem](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#8a42066a "AgendaItem")

[AgendaItemTitle](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f65dfd80 "AgendaItemTitle")

[AgendaTitleElement](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#-35ffd45 "AgendaTitleElement")

[AgendaItemContent](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#83558277 "AgendaItemContent")

[AITemplate](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f1055be3 "AITemplate")

[Bitable](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#bb22fcd8 "Bitable")

[Board](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#3e70ec35 "Board")

[Callout](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#10591ec3 "Callout")

[ChatCard](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#a107e5d "ChatCard")

[Diagram](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#6a09da6 "Diagram")

[Divider](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#4b4dbec6 "Divider")

[File](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#2b183663 "File")

[Grid](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#d04c994f "Grid")

[GridColumn](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#3134f01b "GridColumn")

[Iframe](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#1613ffc1 "Iframe")

[Image](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#a6f35866 "Image")

[ISV](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#371c3007 "ISV")

[JiraIssue](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#c23d1374 "JiraIssue")

[LinkPreview](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#7680e63 "LinkPreview")

[Mindnote](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f3b61121 "Mindnote")

[OKR](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#440e6cc7 "OKR")

[OkrObjective](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f4d0659e "OkrObjective")

[OkrKeyResult](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#0aff39d7 "OkrKeyResult")

[Progress](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#e5c95e9a "Progress")

[ProgressRate](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#-da6f57c "ProgressRate")

[QuoteContainer](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#b48ef162 "QuoteContainer")

[ReferenceSynced](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#25780138 "ReferenceSynced")

[Sheet](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#53fe05b8 "Sheet")

[SourceSynced](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#91c40b0e "SourceSynced")

[SubPageList](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#c40af412 "SubPageList")

[Table](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#28f31481 "Table")

[TableCell](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#eca5d2c3 "TableCell")

[Task](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#8910c274 "Task")

[Text](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#c1ebd2a2 "Text")

[TextStyle](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#1c6877f3 "TextStyle")

[TextElement](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#68268d96 "TextElement")

[TextElementStyle](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#669a5f7b "TextElementStyle")

[TextElementData](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#23769256 "TextElementData")

[View](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#a1b455e8 "View")

[WikiCatalog](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#5df904ec "WikiCatalog")

[Undefined](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#673858e3 "Undefined")

[枚举](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#06994f37 "枚举")

[Align](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#05e7d57e "Align")

[BlockType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#e8ce4e8e "BlockType")

[BitableViewType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#4a02516f "BitableViewType")

[CalloutBackgroundColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#28d02e32 "CalloutBackgroundColor")

[CalloutBorderColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#fb1f28b8 "CalloutBorderColor")

[CodeLanguage](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#45accc42 "CodeLanguage")

[DiagramType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#55ea480a "DiagramType")

[Emoji](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#33ebcdd "Emoji")

[FontBackgroundColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#45c9c07b "FontBackgroundColor")

[FontColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#be1b12a7 "FontColor")

[IframeComponentType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f7b07e0c "IframeComponentType")

[LinkPreviewURLType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#224f293c "LinkPreviewURLType")

[MentionObjType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#90567af6 "MentionObjType")

[OkrPeriodDisplayStatus](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#f13b8192 "OkrPeriodDisplayStatus")

[OkrProgressRateMode](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#514a319f "OkrProgressRateMode")

[OkrProgressStatus](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#0f7206fa "OkrProgressStatus")

[OkrProgressStatusType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#3df1e69a "OkrProgressStatusType")

[TextBackgroundColor](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#80293bd9 "TextBackgroundColor")

[TextElementType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#eda756c6 "TextElementType")

[TextIndentationLevel](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#19b9b4bf "TextIndentationLevel")

[ViewType](https://open.feishu.cn/document/docs/docs/data-structure/block?lang=zh-CN#2296d870 "ViewType")

尝试一下

意见反馈

技术支持

收起

展开