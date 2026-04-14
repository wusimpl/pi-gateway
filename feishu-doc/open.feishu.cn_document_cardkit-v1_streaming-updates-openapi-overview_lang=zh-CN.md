---
url: "https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN"
title: "流式更新卡片 - 开发指南 - 开发文档 - 飞书开放平台"
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

平台简介

开发流程

设计应用

开发机器人

开发网页应用

开发小程序（不推荐）

开发云文档小组件

开发多维表格插件

开发工作台小组件

开发链接预览

飞书卡片

[飞书卡片概述](https://open.feishu.cn/document/feishu-cards/feishu-card-overview)

快速入门

[开发一个卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/develop-a-card-interactive-bot)

[使用指定应用发送飞书卡片](https://open.feishu.cn/document/feishu-cards/quick-start/send-feishu-cards-with-app-bots)

[使用自定义机器人发送飞书卡片](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot)

[流式更新卡片](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview)

搭建工具搭建卡片

卡片 JSON 构建卡片

[发送卡片](https://open.feishu.cn/document/feishu-cards/send-feishu-card)

[处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)

[更新卡片](https://open.feishu.cn/document/feishu-cards/update-feishu-card)

[常见问题](https://open.feishu.cn/document/common-capabilities/message-card/message-card)

资源

网页组件

原生集成

应用登录与用户授权

AppLink 协议

开发者工具

常见问题

管理规范

平台公告

历史版本（不推荐）

[开发指南](https://open.feishu.cn/document/client-docs/intro) [飞书卡片](https://open.feishu.cn/document/feishu-cards/feishu-card-overview) [快速入门](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/quick-start/develop-a-card-interactive-bot)

流式更新卡片

# 流式更新卡片

复制页面

最后更新于 2025-06-27

本文内容

[效果展示](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#50549ede "效果展示")

[应用场景](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#-360ca66 "应用场景")

[能力特性](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#a5df9795 "能力特性")

[注意事项](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#355ec8c0 "注意事项")

[前提条件](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#7bb6c149 "前提条件")

[操作步骤](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#461aa643 "操作步骤")

[步骤一：开启流式更新模式](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#-9c98aa9 "步骤一：开启流式更新模式")

[步骤二：流式更新文本](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#90f1d897 "步骤二：流式更新文本")

[步骤三：持续更新卡片](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#554a3303 "步骤三：持续更新卡片")

[步骤四：基于交互回调，更新卡片](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#209e9824 "步骤四：基于交互回调，更新卡片")

[常见问题](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#e2f7069c "常见问题")

[Q: 流式卡片为什么在飞书客户端聊天栏消息预览中一直展示为\[生成中...\]或者一个固定摘要文本，而不是实际卡片内容？](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#d6ddf492 "Q: 流式卡片为什么在飞书客户端聊天栏消息预览中一直展示为[生成中...]或者一个固定摘要文本，而不是实际卡片内容？")

[Q: 流式卡片生成的卡片无法转发，如何解决？](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#99fa2e89 "Q: 流式卡片生成的卡片无法转发，如何解决？")

[Q: 流式卡片是否支持以交互更新的方式更新卡片？](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#1283f351 "Q: 流式卡片是否支持以交互更新的方式更新卡片？")

# 流式更新卡片

飞书卡片的流式更新能力是指飞书卡片的内容以实时或准实时的方式连续不断地更新，实现卡片逐步渲染的效果。本文档介绍如何上手卡片的流式更新能力。

## 效果展示

[开放平台智能助手](https://app.feishu.cn/app/cli_a608a6e07cf95013?visit_from=search) 应用使用了卡片的流式更新能力，实际效果如下所示：

![](<Base64-Image-Removed>)

## 应用场景

在 AI 机器人场景下，你可利用卡片的流式更新能力为终端用户带来更流畅、更实时的交互体验。具体场景如下所示：

- **场景一**：将 AI 大模型返回的文本内容以“打字机效果”输出至飞书卡片中
- **场景二**：文本流式输出完毕后，通过卡片和组件级的 OpenAPI 操作卡片，如在文本组件下方追加下拉选项组件，提供对 AI 回答的评价入口，用户完成反馈后更新组件等

## 能力特性

你可调用 [卡片级和组件级接口](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/feishu-card-resource-overview#791c8e74)，对内容进行持续、多次修改，核心能力特性为：

- **文本组件打字机效果输出**：在流式更新模式下，持续向卡片中的普通文本元素（tag 为 plain\_text）或富文本组件（tag 为 markdown）传入全量文本内容推送内容，平台会自动计算增量部分，并以打字机效果逐字渲染。
- **组件级局部更新**：无论是否开启流式更新模式，你均可对卡片内的组件进行精细化操作，包括增加、删除、更新组件内容或属性等，如更新图表、修改按钮图标。

## 注意事项

- 对于单个卡片实体，使用卡片和组件级 OpenAPI 操作卡片的频率上限为 10 次/秒。

- 卡片流式更新模式开启期间，在用户交互卡片时，当服务端收到卡片的回调请求后，将无法立即更新卡片。

- 要使用飞书卡片的流式更新能力和相关接口，你需要基于 [卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure) 构造卡片。

- 卡片 JSON 2.0 结构支持飞书客户端 7.20 及之后版本。当使用 JSON 2.0 结构的卡片发送至低于 7.20 版本的客户端时，卡片标题可正常显示，但内容将展示兜底的升级提示文案。





![](<Base64-Image-Removed>)


## 前提条件

- 你已在 [飞书开发者后台](https://open.feishu.cn/app) 创建了一个应用，并为应用添加了机器人能力、开通了以下权限。详情参考 [创建并配置应用](https://open.feishu.cn/document/home/develop-a-bot-in-5-minutes/step-1-create-app-and-enable-robot-capabilities)。
  - 以应用的身份发消息（im:message:send\_as\_bot）
  - 获取与发送单聊、群组消息（im:message）
  - 创建与更新卡片（cardkit:card:write）
- 你已基于 [卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure) 构建了卡片 JSON。

## 操作步骤

本小节介绍如何通过调用卡片 OpenAPI，实现卡片的流式更新，包括文本的流式更新与局部的组件更新。

### 步骤一：开启流式更新模式

若还没有创建卡片实体，你可在创建卡片实体时开启流式更新。若已有卡片实体，你可直接调用 [更新卡片配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/settings) 开启流式更新模式。详情参考下文。

#### **方式一：创建卡片时，直接开启流式更新模式**

1. 在卡片 JSON 中，将 `streaming_mode` 字段设置为 `true`。同时，你可使用 `streaming_config` 指定流式更新的频率、步长和更新策略。字段说明与 JSON 示例如下所示。

| 字段名称<br>展开子列表 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| streaming\_mode | boolean | 否 | 卡片是否处于流式更新模式。在流式更新模式下，开发者可调用卡片和组件接口对卡片持续进行全量更新、局部更新、文本流式更新，且不会触发接口的频率限制（QPS）。 |
| streaming\_config | object | 否 | [流式更新文本](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/content) 时的参数配置。<br>**注意**：<br>- 在飞书 7.20 - 7.22 版本，流式更新功能使用默认的更新频率、步长和更新策略进行流式上屏。不支持指定参数。在飞书 7.23 及以上版本，流式更新功能支持指定参数，自定义频率、步长和策略。<br>- 默认参数可能根据客户端类型、版本、机型等因素存在差异。如果需要精确控制流式更新行为，建议手动指定流式参数。<br>- 为保证流式效果的一致性，卡片流式更新模式开启期间，建议前置指定流式更新参数，并保持整个流式更新过程中参数不变。 |

```

{
    "schema": "2.0",
    "header": {
        "title": {
            "content": "卡片标题",
            "tag": "plain_text"
        }
    },
    "config": {
        "streaming_mode": true, // 卡片是否处于流式更新模式，默认值为 false。
        "summary": {
            "content": "" // 卡片摘要，可通过该参数自定义客户端聊天栏消息预览中的展示文案。为卡片开启流式更新模式后，该摘要将默认为 “[生成中...]”。
        },
        "streaming_config": {
            // 流式更新频率，单位：ms
            "print_frequency_ms": {
                "default": 70,
                "android": 70,
                "ios": 70,
                "pc": 70
            },
            // 流式更新步长，单位：字符数
            "print_step": {
                "default": 1,
                "android": 1,
                "ios": 1,
                "pc": 1
            },
            // 流式更新策略，枚举值，可取：fast/delay
            "print_strategy": "fast"
        }
    },
    "body": {
        "elements": [\
            {\
                "tag": "markdown",\
                "content": "卡片内容",\
                "element_id": "markdown_1" // 操作组件的唯一标识。用于后续增加、删除组件等操作。该属性需在卡片全局唯一。\
            }\
        ]
    }
}
```

2. 调用 [创建卡片实体](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/create) 接口，在 `data` 字段中传入上一步的卡片 JSON 代码（需去除注释并压缩转义为字符串），以获取卡片实体的 ID，用于发送流式卡片。

创建卡片实体请求体示例如下所示，你可直接点击接口文档链接前往 API 调试台调试：


```

{
     "type": "card_json",
     "data": "{\"schema\":\"2.0\",\"header\":{\"title\":{\"content\":\"卡片标题\",\"tag\":\"plain_text\"}},\"config\":{\"streaming_mode\":true,\"summary\":{\"content\":\"\"},\"streaming_config\":{\"print_frequency_ms\":{\"default\":70,\"android\":70,\"ios\":70,\"pc\":70},\"print_step\":{\"default\":1,\"android\":1,\"ios\":1,\"pc\":1},\"print_strategy\":\"fast\"}},\"body\":{\"elements\":[{\"tag\":\"markdown\",\"content\":\"卡片内容\",\"element_id\":\"markdown_1\"}]}}"
}
```

3. 调用 [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) 接口，在请求体的 `content` 字段中传入卡片实体 ID，以发送卡片实体。


**注意**

- 卡片实体仅支持发送一次。
- 发送卡片实体的应用必须是该卡片实体的创建应用。

发送卡片实体时，发送消息接口请求体示例如下所示：

```

{
    "receive_id": "ou_449b53ad6aee526f7ed311b216aabcef",
    "msg_type": "interactive",
    "content": "{\"type\":\"card\",\"data\":{\"card_id\":\"7371713483664506900\"}}"
}
```

其中 `content` 字段中的结构如下所示：

```

{
    "type": "card",   // 固定取值 card
    "data": {
        "card_id": "7371713483664506900"  // 此处传入卡片实体 ID
    }
}
```

若接口调用成功，指定用户将收到发送的卡片，且飞书客户端聊天栏消息预览将展示为“\[生成中...\]”，表示卡片已开启流式更新模式。

![](<Base64-Image-Removed>)

#### **方式二：更新现有卡片实体配置，打开流式更新模式**

若你已有卡片实体，且卡片实体的在 14 天的有效期内，你可调用 [更新卡片配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/settings) 接口，在 `settings` 字段中传入卡片流式配置字段 `streaming_mode` 和 `streaming_config`。字段说明如下所示。

| 字段名称<br>展开子列表 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| streaming\_mode | boolean | 否 | 卡片是否处于流式更新模式。在流式更新模式下，开发者可调用卡片和组件接口对卡片持续进行全量更新、局部更新、文本流式更新，且不会触发接口的频率限制（QPS）。 |
| streaming\_config | object | 否 | 流式更新参数配置。<br>**注意**：<br>- 在飞书 7.20 - 7.22 版本，流式更新功能使用默认的更新频率、步长和更新策略进行流式上屏。不支持指定参数。在飞书 7.23 及以上版本，流式更新功能支持指定参数，自定义频率、步长和策略。<br>- 默认参数可能根据客户端类型、版本、机型等因素存在差异。如果需要精确控制流式更新行为，建议手动指定流式参数。<br>- 为保证流式效果的一致性，卡片流式更新模式开启期间，建议前置指定流式更新参数，并保持整个流式更新过程中参数不变。 |

示例配置如下所示：

```

{
  "config": {
    "streaming_mode": true,
    "streaming_config": {
      "print_frequency_ms": {
        "default": 70,
        "android": 70,
        "ios": 70,
        "pc": 70
      },
      "print_step": {
        "default": 1,
        "android": 1,
        "ios": 1,
        "pc": 1
      },
      "print_strategy": "fast"
    }
  }
}
```

将上方 JSON 示例压缩、转义为字符串，传入 `settings` 字段中，整体请求体示例如下所示：

```

{
  "settings": "{\"config\":{\"streaming_mode\":true,\"streaming_config\":{\"print_frequency_ms\":{\"default\":70,\"android\":70,\"ios\":70,\"pc\":70},\"print_step\":{\"default\":1,\"android\":1,\"ios\":1,\"pc\":1},\"print_strategy\":\"fast\"}}}",
  "uuid": "a0d69e20-1dd1-458b-k525-dfeca4015204",
  "sequence": 1
}
```

### 步骤二：流式更新文本

在卡片的流式更新模式下，调用 [流式更新文本](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/content) 接口，对卡片中的普通文本元素（tag 为 plain\_text）或富文本组件传入全量文本内容。若旧文本为传入的新文本的前缀子串，新增文本将在旧文本末尾继续以打字机效果输出；若新旧文本前缀不同，全量文本将直接上屏输出，无打字机效果。

![](<Base64-Image-Removed>)

在流式更新文本时，你可通过 `print_strategy` 参数控制两次流式更新文本时，第一次未上屏文本的上屏策略。假设某个富文本组件的内容是 **ABCDE**，当前 **ABC** 已上屏同时组件发生了更新，新文本是 **ABCDEFGH**。此时不同流式更新策略（print\_strategy）将产生不同的上屏效果：

- 快速上屏（fast，默认）： **ABCDE** 中没有上屏的 **DE** 会立刻上屏，组件直接展示 **ABCDE**；然后再按打字机效果上屏后续文本 **FGH**
- 延迟上屏（delay）： **ABCDE** 中没有上屏的 **DE** 会按打字机效果依次上屏；然后再按打字机效果上屏后续文本 **FGH**

| 快速上屏（fast，默认） | 延迟上屏（delay） |
| --- | --- |
| 调用 [流式更新文本](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/content) 接口后，若历史文本尚未流式上屏完毕，未上屏的部分将立即全部上屏，然后立即开始本次内容上屏：<br>进入全屏退出全屏<br>播放暂停00:0000:00<br>- 2x<br>- 1.5x<br>- 1x<br>- 0.75x<br>- 0.5x<br>1x<br>小窗播放<br>重播 | 调用 [流式更新文本](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/content) 接口后，若历史文本尚未流式输出完毕，历史文本中未上屏部分将会继续按打字机效果输出直到全部输出完毕，再开始本次内容上屏：<br>进入全屏退出全屏<br>播放暂停00:0000:00<br>- 2x<br>- 1.5x<br>- 1x<br>- 0.75x<br>- 0.5x<br>1x<br>小窗播放<br>重播 |

### 步骤三：持续更新卡片

当文本流式输出完毕后，若你需要在卡片中更新部分内容，如在文本组件下方追加下拉选项组件，提供对 AI 回答的评价入口，用户完成反馈后更新组件等操作，你可调用 [卡片和组件接口](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/feishu-card-resource-overview#791c8e74)，继续持续多次更新卡片，包括全量更新卡片、对卡片中组件进行增、删、改、修改卡片配置等操作。

无论是否开启流式更新模式，除 [流式更新文本](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/content) 外，你均可调用 [卡片和组件接口](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/feishu-card-resource-overview#791c8e74) 对卡片内的组件进行精细化操作。

如下图示例，调用 [新增组件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card-element/create) 接口，你可在富文本组件后插入一个按钮组件。

![](<Base64-Image-Removed>)

### 步骤四：基于交互回调，更新卡片

在卡片流式更新模式下，如果用户操作交互类组件并触发了 [卡片回传交互回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)，你需先关闭流式更新模式，再处理卡片回调。

1. 在卡片文本流式更新结束后，调用 [更新卡片配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/settings) 接口，将 `streaming_mode` 字段值设置为 `false`，以终止卡片的流式更新模式。

请求体示例如下所示：


```

{
     "settings": "{\"config\":{\"streaming_mode\":false}}",
     "uuid": "a0d69e20-1dd1-458b-k525-dfeca4015204",
     "sequence": 1
}
```

2. 参考 [处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)，正常处理回调请求。更新卡片时，你可继续调用卡片和组件级接口，局部更新卡片。





流式更新模式将在距上次开启 10 分钟后自动关闭，建议你自行手动关闭。


## 常见问题

### Q: 流式卡片为什么在飞书客户端聊天栏消息预览中一直展示为\[生成中...\]或者一个固定摘要文本，而不是实际卡片内容？

![](<Base64-Image-Removed>)

- **如果消息预览中展示为 \[生成中...\]**：

“\[生成中...\]”是卡片在流式模式过程中的默认摘要。这意味着卡片开启了流式更新模式。你需参考以下步骤关闭卡片的流式更新模式：

  - 如果你基于搭建工具生成的卡片模板（template）的 ID 发送了卡片，你需在搭建工具中，点击右上角的设置按钮，关闭卡片的流式更新模式。





    ![](<Base64-Image-Removed>)









    ![](<Base64-Image-Removed>)

  - 如果你基于卡片 JSON 发送了卡片，你需调用 [更新卡片配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/settings) API 将 `streaming_mode` 字段值设置为 `false`，终止卡片的流式更新模式。
- **如果消息预览中展示为你自定义的摘要文本**：

关闭流式更新模式并不会改变开发者自定义的摘要文本。你可以自行调用 [更新卡片配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/settings) 接口，通过修改 `summary.content` 的值，修改此摘要内容。


### Q: 流式卡片生成的卡片无法转发，如何解决？

开启了流式更新模式的卡片无法被转发。你需调用 [更新卡片配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/settings) 接口将 `streaming_mode` 字段值设置为 `false` 关闭流式更新模式。

### Q: 流式卡片是否支持以交互更新的方式更新卡片？

在开启了流式更新模式下，卡片不支持以响应 [卡片回传交互回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication) 的方式，直接更新卡片。你需先关闭流式更新模式，再处理卡片回调。具体步骤如下所示：

1. 在卡片文本流式更新结束后，调用 [更新卡片配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/settings) 接口，将 `streaming_mode` 字段值设置为 `false`，以终止卡片的流式更新模式。
2. 参考 [处理卡片回调](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)，正常处理回调请求。更新卡片时，你可继续调用卡片和组件级接口，局部更新卡片。

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fcardkit-v1%2Fstreaming-updates-openapi-overview%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：使用自定义机器人发送飞书卡片](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot) [下一篇：飞书卡片搭建工具概述](https://open.feishu.cn/document/feishu-cards/feishu-card-cardkit/feishu-cardkit-overview)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[效果展示](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#50549ede "效果展示")

[应用场景](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#-360ca66 "应用场景")

[能力特性](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#a5df9795 "能力特性")

[注意事项](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#355ec8c0 "注意事项")

[前提条件](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#7bb6c149 "前提条件")

[操作步骤](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#461aa643 "操作步骤")

[步骤一：开启流式更新模式](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#-9c98aa9 "步骤一：开启流式更新模式")

[步骤二：流式更新文本](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#90f1d897 "步骤二：流式更新文本")

[步骤三：持续更新卡片](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#554a3303 "步骤三：持续更新卡片")

[步骤四：基于交互回调，更新卡片](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#209e9824 "步骤四：基于交互回调，更新卡片")

[常见问题](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#e2f7069c "常见问题")

[Q: 流式卡片为什么在飞书客户端聊天栏消息预览中一直展示为\[生成中...\]或者一个固定摘要文本，而不是实际卡片内容？](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#d6ddf492 "Q: 流式卡片为什么在飞书客户端聊天栏消息预览中一直展示为[生成中...]或者一个固定摘要文本，而不是实际卡片内容？")

[Q: 流式卡片生成的卡片无法转发，如何解决？](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#99fa2e89 "Q: 流式卡片生成的卡片无法转发，如何解决？")

[Q: 流式卡片是否支持以交互更新的方式更新卡片？](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview?lang=zh-CN#1283f351 "Q: 流式卡片是否支持以交互更新的方式更新卡片？")

尝试一下

意见反馈

技术支持

收起

展开