---
url: "https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN"
title: "使用自定义机器人发送飞书卡片 - 开发指南 - 开发文档 - 飞书开放平台"
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

使用自定义机器人发送飞书卡片

# 使用自定义机器人发送飞书卡片

复制页面

最后更新于 2025-07-07

本文内容

[使用场景](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#2f5c85b5 "使用场景")

[使用限制](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#cac79090 "使用限制")

[注意事项](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#355ec8c0 "注意事项")

[机器人说明](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#8cd2538d "机器人说明")

[操作步骤](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#461aa643 "操作步骤")

[步骤一：创建群自定义机器人](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#65ada4a4 "步骤一：创建群自定义机器人")

[步骤二：创建卡片](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#bad5a929 "步骤二：创建卡片")

[步骤三：发送卡片](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#201cd3cb "步骤三：发送卡片")

# 使用自定义机器人发送飞书卡片

通过本文档，你可以快速体验如何使用飞书群聊中添加的自定义机器人发送卡片。

## 使用场景

使用自定义机器人发送卡片通常适用于以下场景：

- 仅需向 **单个指定群组** 中发送静态内容，无需用户通过卡片继续交互

- 需要向单个群组定期发送含有变量数据的静态内容。希望只创建一张卡片，每次发送卡片时可以传入不同数据，实现卡片复用





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3ffff0ff9190762d0c930876f0678b0e_ZseLxHZFOy.png?height=2284&lazyload=true&maxWidth=500&width=5056)


## 使用限制

要使用自定义机器人发送卡片，需满足以下条件：

- 卡片中未添加 [请求回调交互事件](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/add-interactive-events#c9d07bde)
- 卡片仅用于一次性通知或推广场景，无需再次更新
- 卡片仅向单个指定群组发送

## 注意事项

在飞书卡片中如果需要 @ 某一用户，则需要注意：自定义机器人仅支持通过 [Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid) 或 [User ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id) 实现 @ 用户，暂不支持`email`、`union_id`等其他方式。

## 机器人说明

自定义机器人与应用机器人的区别如下所示：

| 对比项 | 应用机器人 | 自定义机器人 |
| --- | --- | --- |
| 开发方式 | 需在 [开发者后台](https://open.feishu.cn/app) 创建应用并开启机器人能力。 | 直接在飞书群聊中通过群设置添加，无需开发。 |
| 能力范围 | 支持调用 OpenAPI（如发送消息、管理群组）、订阅事件，可跨群或单聊。 | 仅支持通过 Webhook 单向推送消息到指定群聊，无法交互或获取用户数据。 |
| 权限要求 | 需申请 API 权限，部分权限需经企业管理员审核。 | 无需权限，但功能受限。 |
| 适用场景 | 复杂业务集成（如连接ERP系统）。 | 简单的群通知（如天气提醒）。 |
| 图示 | ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/66a031dbaa99c4dd8be83eb1de75e7de_NsdQVAtw66.png?height=835&lazyload=true&maxWidth=300&width=1250) | ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/2987eac5e6b6b6dfb2aed625a267e2da_hgVU2S78mp.png?height=1106&lazyload=true&maxWidth=300&width=1652) |

## 操作步骤

本小节介绍如何使用自定义机器人发送一张绑定了变量的卡片。了解自定义机器人，参考 [自定义机器人使用指南](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)。

### 步骤一：创建群自定义机器人

1. 登录飞书客户端。

2. 创建一个名为“`测试自定机器人发送消息`”的群聊。

3. 打开群聊的 **设置** 界面。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/0730021fecf05130d8190e5ecc597f50_tOOCs0sfXZ.png?height=490&lazyload=true&maxWidth=500&width=1836)

4. 点击 **群机器人**。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/e8e4178a098e4a365d219a83155494db_8PWiBurueP.png?height=876&lazyload=true&maxWidth=500&width=1832)

5. 点击 **添加机器人**，并在弹出的对话框中，选择 **自定义机器人**。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/784620e0b9973045c7f5bda7c74b2311_InDXNEcmhP.png?height=1158&lazyload=true&maxWidth=500&width=2274)

6. 在配置页面，保持默认设置，点击 **添加**。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9688ce619bb87793b5a4e8c4ff0acdb7_3doMAlxkK8.png?height=1124&lazyload=true&maxWidth=500&width=1666)

7. 点击 **webhook 地址** 右侧的 **复制**，保存 webhook，并点击 **完成**。


**请妥善保存好此 webhook 地址**，不要公布在 Gitlab、博客等可公开查阅的网站上，避免地址泄露后被恶意调用发送垃圾消息。你也可以增加 **安全设置**，以保证信息安全。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/d4d5d357e806f489272508dfa3075377_C9j6eJPCrU.png?height=1124&lazyload=true&maxWidth=500&width=1656)

### 步骤二：创建卡片

你可通过搭建工具快速搭建一张卡片，也可通过卡片 JSON 代码构建卡片。推荐使用搭建工具搭建卡片，可实现卡片搭建可视化，并支持添加卡片变量，实现卡片多次复用。

#### **（推荐）方式一：使用搭建工具创建并发布卡片**

本步骤介绍如何通过搭建工具搭建并发布一张卡片。

#### **创建卡片**

1. 登录 [飞书卡片搭建工具](https://open.feishu.cn/cardkit?from=open_docs)。

2. 在 **我的卡片** 页面，点击 **参考案例库**。

3. 在 **参考案例库** 对话框，找到并使用 **个人生日祝福** 案例。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/eba26ba62aea958ef1cd603717a8c57c_cyW58rRjrV.png?height=812&lazyload=true&maxWidth=500&width=1284)

4. 输入卡片名称，然后点击 **创建**。

你将进入卡片的编辑页面。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/500bae14801ef42a6fcc544fcb45a360_MhsdLTHuHr.png?height=800&lazyload=true&maxWidth=500&width=1920)


#### **（可选）为卡片绑定变量**

本小节介绍如何通过绑定变量的方式，将案例库中的固定姓名修改为通过发送卡片时传入 Open ID、实现@指定用户的效果。

1. 在卡片编辑页面，选中卡片中的富文本组件，在右侧文本内容框中，删除文本 `周翊`，然后添加 @ 指定人语法 `<at id=open_id></at>`。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/da5ba8ded6eb44a707f970c70227385f_cZkFBR2LZk.png?height=683&lazyload=true&maxWidth=500&width=1602)

2. 在文本内容框中，删除 `<at id=open_id></at>` 中的文本 `open_id`，并输入英文 `{` 符号，然后点击 **新建变量**。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/d7a471ba0161943c26e5f3b4cb9a8e77_hpMz9RYWHz.png?height=191&lazyload=true&width=347)

3. 在 **添加变量** 对话框中，参考下图，将 **变量名称** 设为 `open_id`， **模拟数据** 填写为卡片创建者的 Open ID。快速获取 Open ID，参考 [如何获取不同的用户 ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id)。然后点击 **提交**。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/91a573c62747e36791dbce02776eb254_kASLZryaax.png?height=649&lazyload=true&maxWidth=400&width=725)





你将在画布中看到人员名称已变更为使用了@人语法的文本。这说明你已成功为卡片绑定了变量，你可在发送卡片时为变量传入数据，实现卡片复用。

你可在页面右上角点击 **向我发送预览**，预览在飞书客户端内由开发者小助手发送的卡片。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/14bb8994e8bdcd40571c5a57a459fd43_ncNH44kmeK.png?height=679&lazyload=true&maxWidth=500&width=1583)


#### **为卡片绑定自定义机器人**

卡片搭建完成后，你需为卡片绑定你在步骤一中创建的群自定义机器人，使得该机器人拥有发送该卡片的权限。以下为操作步骤。

1. 在卡片模板的编辑页面，点击应用图标。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/04fff9e7c4b1c10239a212100920f154_GT67vilSDa.png?height=403&lazyload=true&maxWidth=500&width=1240)

2. 在 **添加自定义机器人/应用** 弹窗中，选择添加自定义机器人。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/cdc03d1e72fb450a4411ccbf407b42e8_pRzRS0yQRE.png?height=285&lazyload=true&maxWidth=500&width=751)

3. 选择 **指定自定义机器人**，填写你在步骤一获取的自定义机器人的 webhook 地址，使该机器人拥有发送该卡片的权限。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9c698457c675c83580aec452cea1bab0_ZINMVIqncw.png?height=284&lazyload=true&maxWidth=500&width=592)


#### **发布卡片**

1. 在搭建工具顶部菜单栏，点击 **保存**。然后点击 **发布**。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/bb83ffd65b6409caf28be6a414f2b995_Wmg6f9GGRz.png?height=459&lazyload=true&maxWidth=500&width=1920)

2. 在 **发布卡片** 对话框，点击 **发布**。首次发布卡片时，一般版本默认为 `1.0.0`。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/7693908e0aab6872f99b079fb274390f_k4la2UL3xu.png?height=444&lazyload=true&maxWidth=300&width=499)


#### **获取卡片模板 ID 和版本号**

基于搭建工具创建的卡片，也称为卡片模板。你需获取卡片模板 ID 和版本号用于在步骤三中发送卡片。

- 卡片模板 ID 在搭建工具的顶部菜单栏中获取，如下图所示。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/d8b71355ebdab2c6848d5b38af2b423e_P0nBXQMYI2.png?height=360&lazyload=true&maxWidth=500&width=1611)

- 卡片模板版本号为你发布卡片时设置的版本号。如果需要查看历史版本号，可在搭建工具的顶部菜单栏中点击 **版本管理** 进行查看。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b3e96c8ca7c5c029bdbce6c0ca1ba413_IR0ZCAj7uz.png?height=384&lazyload=true&maxWidth=500&width=1459)


#### **方式二：基于卡片 JSON 构建卡片**

飞书卡片支持在发送卡片时，直接传入卡片 JSON 源代码。你可在飞书卡片搭建工具中搭建好卡片、并确保发送预览成功后，复制卡片源代码。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b9d86d57c25f51570909a23ebc43026a_h4kayeS9dl.gif?height=872&lazyload=true&maxWidth=500&width=1914)

你也可自行构建卡片 JSON，在发送卡片时，传入卡片 JSON 源代码。本教程中的卡片 JSON 示例如下所示。你可参考 [卡片 JSON 2.0 结构](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure) 了解卡片 JSON。

发送卡片时传入卡片 JSON 源代码的方式不支持添加卡片变量。

```

{
    "schema": "2.0",
    "config": {
        "update_multi": true,
        "style": {
            "text_size": {
                "normal_v2": {
                    "default": "normal",
                    "pc": "normal",
                    "mobile": "heading"
                }
            }
        }
    },
    "body": {
        "direction": "vertical",
        "padding": "12px 12px 12px 12px",
        "elements": [\
            {\
                "tag": "markdown",\
                "content": "西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。",\
                "text_align": "left",\
                "text_size": "normal_v2",\
                "margin": "0px 0px 0px 0px"\
            },\
            {\
                "tag": "button",\
                "text": {\
                    "tag": "plain_text",\
                    "content": "🌞更多景点介绍"\
                },\
                "type": "default",\
                "width": "default",\
                "size": "medium",\
                "behaviors": [\
                    {\
                        "type": "open_url",\
                        "default_url": "https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821",\
                        "pc_url": "",\
                        "ios_url": "",\
                        "android_url": ""\
                    }\
                ],\
                "margin": "0px 0px 0px 0px"\
            }\
        ]
    },
    "header": {
        "title": {
            "tag": "plain_text",
            "content": "今日旅游推荐"
        },
        "subtitle": {
            "tag": "plain_text",
            "content": ""
        },
        "template": "blue",
        "padding": "12px 12px 12px 12px"
    }
}
```

### 步骤三：发送卡片

基于不同的卡片搭建方式，你需参考不同场景说明发送卡片。本步骤以在本地环境中使用 curl 命令为示例，分别介绍如何发送基于搭建工具搭建的卡片和由卡片 JSON 代码构建的卡片。

#### **场景一：发送基于搭建工具搭建的卡片**

如果你使用搭建工具创建了卡片，你可在本地环境中，通过 curl 指令，向自定义机器人的 webhook 地址发送 HTTP POST 请求。以下为 HTTP POST 请求的代码示例与说明。

- 如果你的操作系统是 **macOS 系统**，请在本地打开终端（Terminal），参考下表代码说明修改示例代码，然后在本地运行：


```

curl -X POST -H "Content-Type: application/json" \
  -d '{"msg_type":"interactive","card":{"type":"template","data":{"template_id":"AAqyBQVmUNxxx","template_version_name":"1.0.0","template_variable":{"open_id":"ou_d506829e8b6a17607e56bcd6b1aabcef"} }}}' \
https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx
```






![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/1dd44d829a7c1d18cea5076ce9b01f78_wxnDZNqfwQ.png?height=244&lazyload=true&maxWidth=650&maxWidth=500&width=1464)

- 如果你的操作系统是 **Windows 系统**，你可在本地打开命令提示符（cmd）工具，参考下表代码说明修改示例代码，然后在本地运行。使用时请注意 JSON 转义：


```

curl -X POST -H "Content-Type: application/json" -d "{\"msg_type\":\"interactive\",\"card\":{\"type\":\"template\",\"data\":{\"template_id\":\"AAqi6xJ8rabcd\",\"template_version_name\":\"1.0.0\",\"template_variable\":{\"open_id\":\"ou_d506829e8b6a17607e56bcd6b1aabcef\"}}}}" "https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx"
```






![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/da33feabb37f88a5ad9e00be6b9f8b34_GY7I3yBm84.png?height=268&lazyload=true&maxWidth=650&maxWidth=500&width=1705)

- 如果你的操作系统是 **Windows 系统**，你也可以在本地打开 Windows PowerShell 工具，参考下表代码说明修改示例代码，然后在本地运行：


```

Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/bot/v2/hook/a257f9ab-5666-4424-901b-c953xxxxxxxx" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"msg_type":"interactive","card":{"type":"template","data":{"template_id":"AAq4t4vOabcef","template_version_name":"1.0.0","template_variable":{"open_id":"ou_d506829e8b6a17607e56bcd6b1aabcef"}} }}'
```






![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/4e0a3b9aa803ac7bad3d1946a3da14ca_kUD6qPkCwK.png?height=442&lazyload=true&maxWidth=650&maxWidth=500&width=1730)


| 代码 | 说明 |
| --- | --- |
| POST | 请求方式，无需修改。 |
| Content-Type: application/json | 请求头，无需修改。 |
| `https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx` | 自定义机器人的 Webhook 地址。此处为示例值，你需要替换为自定义机器人真实的 webhook 地址。 |
| ```<br>{<br>  "msg_type": "interactive",<br>  "card": {<br>    "type": "template",<br>    "data": {<br>      "template_id": "AAqi6xJ8rabcd",<br>      "template_version_name": "1.0.0",<br>      "template_variable": {<br>        "open_id": "ou_d506829e8b6a17607e56bcd6b1aabcef"<br>      }<br>    }<br>  }<br>}<br>``` | 请求体，此处为示例值。具体说明参考下表。在实际使用时，你需：<br>- 将示例值设置为实际值<br>- 根据系统环境，进行 JSON 压缩或转义<br>- 自定义变量的值 |

上方请求体中参数的具体说明如下表：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| msg\_type | 是 | 消息类型。在卡片场景下，消息类型为 `interactive`。 |
| card | 是 | 消息内容。此处传入卡片相关内容。 |
| └ type | 否 | 卡片类型。要发送由搭建工具搭建的卡片（也称卡片模板），固定取值为 `template`。 |
| └ data | 否 | 卡片模板的数据，要发送由搭建工具搭建的卡片，此处需传入卡片模板 ID、卡片版本号等。 |
| └└ template\_id | 是 | 搭建工具中创建的卡片（也称卡片模板）的 ID，如 `AAqigYkzabcef`。可在搭建工具中通过复制卡片模板 ID 获取。<br>![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/8bf97ff2bceed633b28f5ce2d2ec0270_A9kv4I1t3s.png?height=329&lazyload=true&maxWidth=500&width=1574) |
| └└ template\_version\_name | 否 | 搭建工具中创建的卡片的版本号，如 `1.0.0`。卡片发布后，将生成版本号。可在搭建工具 **版本管理** 处获取。<br>![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b3e96c8ca7c5c029bdbce6c0ca1ba413_IR0ZCAj7uz.png?height=384&lazyload=true&maxWidth=500&width=1459)<br>**注意**：若不填此字段，将默认使用该卡片的最新版本。 |
| └└ template\_variable | 否 | 若卡片绑定了变量，你需在该字段中传入实际变量数据的值，对应搭建工具中 **模拟数据** 的值。在本教程步骤二中，变量类型为 **文本**，变量名称为 `open_id`，模拟数据为 `ou_d506829e8b6a17607e56bcd6b1aabcef`，因此此处对 `open_id` 变量赋值应为：<br>```<br>{<br>    "open_id": "ou_d506829e8b6a17607e56bcd6b1aabcef"<br>}<br>``` |

若调用成功，机器人将在其所在群聊发送卡片。若调用失败，你可在文档中搜索返回的错误码和错误信息获取排查建议。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/4d62d68f2a7cafaf8be9dd8ef0b058f6_E0vB5MLukq.png?height=943&lazyload=true&maxWidth=500&width=947)

#### **场景二：发送由卡片 JSON 代码构建的卡片**

如果你的卡片没有配置变量，你也可以选择直接发送卡片 JSON 代码。你可在本地环境中，通过 curl 指令，向自定义机器人的 webhook 地址发送 HTTP POST 请求。以下为 HTTP POST 请求的代码示例与说明。

- 如果你的操作系统是 **macOS 系统**，请在本地打开终端（Terminal），参考下表代码说明修改示例代码，然后在本地运行：


```

curl -X POST -H "Content-Type: application/json" \
  -d '{"msg_type":"interactive","card":{"schema":"2.0","config":{"update_multi":true,"style":{"text_size":{"normal_v2":{"default":"normal","pc":"normal","mobile":"heading"}}}},"body":{"direction":"vertical","padding":"12px 12px 12px 12px","elements":[{"tag":"markdown","content":"西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。","text_align":"left","text_size":"normal_v2","margin":"0px 0px 0px 0px"},{"tag":"button","text":{"tag":"plain_text","content":"🌞更多景点介绍"},"type":"default","width":"default","size":"medium","behaviors":[{"type":"open_url","default_url":"https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821","pc_url":"","ios_url":"","android_url":""}],"margin":"0px 0px 0px 0px"}]},"header":{"title":{"tag":"plain_text","content":"今日旅游推荐"},"subtitle":{"tag":"plain_text","content":""},"template":"blue","padding":"12px 12px 12px 12px"}}}' \
https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx
```

- 如果你的操作系统是 **Windows 系统**，你可以在本地打开命令提示符（cmd）工具，参考下表代码说明修改示例代码，然后在本地运行。使用时请注意 JSON 转义：


```

curl -X POST -H "Content-Type: application/json" -d "{\"msg_type\":\"interactive\",\"card\":{\"schema\":\"2.0\",\"config\":{\"update_multi\":true,\"style\":{\"text_size\":{\"normal_v2\":{\"default\":\"normal\",\"pc\":\"normal\",\"mobile\":\"heading\"}}}},\"body\":{\"direction\":\"vertical\",\"padding\":\"12px 12px 12px 12px\",\"elements\":[{\"tag\":\"markdown\",\"content\":\"西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。\",\"text_align\":\"left\",\"text_size\":\"normal_v2\",\"margin\":\"0px 0px 0px 0px\"},{\"tag\":\"button\",\"text\":{\"tag\":\"plain_text\",\"content\":\"🌞更多景点介绍\"},\"type\":\"default\",\"width\":\"default\",\"size\":\"medium\",\"behaviors\":[{\"type\":\"open_url\",\"default_url\":\"https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821\",\"pc_url\":\"\",\"ios_url\":\"\",\"android_url\":\"\"}],\"margin\":\"0px 0px 0px 0px\"}]},\"header\":{\"title\":{\"tag\":\"plain_text\",\"content\":\"今日旅游推荐\"},\"subtitle\":{\"tag\":\"plain_text\",\"content\":\"\"},\"template\":\"blue\",\"padding\":\"12px 12px 12px 12px\"}}}" "https://open.feishu.cn/open-apis/bot/v2/hook/a257f9ab-5666-4424-901b-c9538199f4ac"
```






![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/cd683e63eb13179aac684a1777ed5ab0_2fVxRKcZEe.png?height=393&lazyload=true&maxWidth=500&width=1730)

- 如果你的操作系统是 **Windows 系统**，你也可以在本地打开 Windows PowerShell 工具，参考下表代码说明修改示例代码，然后在本地运行：


```

Invoke-RestMethod -Uri "https://open.feishu.cn/open-apis/bot/v2/hook/a257f9ab-5666-4424-901b-c9538199f4ac" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"msg_type":"interactive","card":{"schema":"2.0","config":{"update_multi":true,"style":{"text_size":{"normal_v2":{"default":"normal","pc":"normal","mobile":"heading"}}}},"body":{"direction":"vertical","padding":"12px 12px 12px 12px","elements":[{"tag":"markdown","content":"西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。","text_align":"left","text_size":"normal_v2","margin":"0px 0px 0px 0px"},{"tag":"button","text":{"tag":"plain_text","content":"🌞更多景点介绍"},"type":"default","width":"default","size":"medium","behaviors":[{"type":"open_url","default_url":"https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821","pc_url":"","ios_url":"","android_url":""}],"margin":"0px 0px 0px 0px"}]},"header":{"title":{"tag":"plain_text","content":"今日旅游推荐"},"subtitle":{"tag":"plain_text","content":""},"template":"blue","padding":"12px 12px 12px 12px"}}}'
```






![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/fb6898533af6646fe797ea92f53d6059_toz7aGR18C.png?height=600&lazyload=true&maxWidth=500&width=1713)


| 代码 | 说明 |
| --- | --- |
| POST | 请求方式，无需修改。 |
| Content-Type: application/json | 请求头，无需修改。 |
| `https://open.feishu.cn/open-apis/bot/v2/hook/f99fed8d-9b01-4dfe-ab56-xxxx` | 自定义机器人的 Webhook 地址。此处为示例值，你需要替换为自定义机器人真实的 webhook 地址。 |
| ```<br>{<br>  "msg_type": "interactive",<br>  "card": {<br>    "schema": "2.0",<br>    "config": {<br>      "update_multi": true,<br>      "style": {<br>        "text_size": {<br>          "normal_v2": {<br>            "default": "normal",<br>            "pc": "normal",<br>            "mobile": "heading"<br>          }<br>        }<br>      }<br>    },<br>    "body": {<br>      "direction": "vertical",<br>      "padding": "12px 12px 12px 12px",<br>      "elements": [<br>        {<br>          "tag": "markdown",<br>          "content": "西湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米。",<br>          "text_align": "left",<br>          "text_size": "normal_v2",<br>          "margin": "0px 0px 0px 0px"<br>        },<br>        {<br>          "tag": "button",<br>          "text": {<br>            "tag": "plain_text",<br>            "content": "🌞更多景点介绍"<br>          },<br>          "type": "default",<br>          "width": "default",<br>          "size": "medium",<br>          "behaviors": [<br>            {<br>              "type": "open_url",<br>              "default_url": "https://baike.baidu.com/item/西湖/4668821",<br>              "pc_url": "",<br>              "ios_url": "",<br>              "android_url": ""<br>            }<br>          ],<br>          "margin": "0px 0px 0px 0px"<br>        }<br>      ]<br>    },<br>    "header": {<br>      "title": {<br>        "tag": "plain_text",<br>        "content": "今日旅游推荐"<br>      },<br>      "subtitle": {<br>        "tag": "plain_text",<br>        "content": ""<br>      },<br>      "template": "blue",<br>      "padding": "12px 12px 12px 12px"<br>    }<br>  }<br>}<br>``` | 请求体。参数说明如下：<br>- `msg_type`：发送消息的类型。在卡片场景下，消息类型为 interactive。<br>  <br>- `card`：消息内容。对于使用卡片 JSON 构建的卡片，此处直接传入卡片 JSON 代码。 |

若调用成功，机器人将在其所在群聊发送卡片。若调用失败，你可在文档中搜索返回的错误码和错误信息获取排查建议。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/7e7fc48bd2f3607e79ffab810f227c51_vIIToTHRsP.png?height=946&lazyload=true&maxWidth=500&width=947)

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Ffeishu-cards%2Fquick-start%2Fsend-message-cards-with-custom-bot%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：使用指定应用发送飞书卡片](https://open.feishu.cn/document/feishu-cards/quick-start/send-feishu-cards-with-app-bots) [下一篇：流式更新卡片](https://open.feishu.cn/document/cardkit-v1/streaming-updates-openapi-overview)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[使用场景](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#2f5c85b5 "使用场景")

[使用限制](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#cac79090 "使用限制")

[注意事项](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#355ec8c0 "注意事项")

[机器人说明](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#8cd2538d "机器人说明")

[操作步骤](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#461aa643 "操作步骤")

[步骤一：创建群自定义机器人](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#65ada4a4 "步骤一：创建群自定义机器人")

[步骤二：创建卡片](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#bad5a929 "步骤二：创建卡片")

[步骤三：发送卡片](https://open.feishu.cn/document/feishu-cards/quick-start/send-message-cards-with-custom-bot?lang=zh-CN#201cd3cb "步骤三：发送卡片")

尝试一下

意见反馈

技术支持

收起

展开