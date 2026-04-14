---
url: "https://open.feishu.cn/document/faq/bot?lang=zh-CN"
title: "机器人相关 - 开发指南 - 开发文档 - 飞书开放平台"
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

网页组件

原生集成

应用登录与用户授权

AppLink 协议

开发者工具

常见问题

[根证书相关](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/root-certificate-related)

问题排查

客户端通用问题

服务端通用问题

[机器人相关](https://open.feishu.cn/document/faq/bot)

[其他开发问题](https://open.feishu.cn/document/faq/others)

[小程序](https://open.feishu.cn/document/faq/gadget)

[开发者工具](https://open.feishu.cn/document/faq/devtools)

[应用管理](https://open.feishu.cn/document/faq/application-management)

[ISV 相关](https://open.feishu.cn/document/faq/questions-related-to-isv)

管理规范

平台公告

历史版本（不推荐）

[开发指南](https://open.feishu.cn/document/client-docs/intro) [常见问题](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/root-certificate-related)

机器人相关

# 机器人相关

复制页面

最后更新于 2025-04-29

本文内容

[机器人聊天窗口没有出现对话框 （输入框）](https://open.feishu.cn/document/faq/bot?lang=zh-CN#3c526909 "机器人聊天窗口没有出现对话框 （输入框）")

[怎么实现机器人@人（@所有人、@指定人）](https://open.feishu.cn/document/faq/bot?lang=zh-CN#acc98e1b "怎么实现机器人@人（@所有人、@指定人）")

[配置使用 webhook 的自定义机器人时，参数 text 是否有长度要求？](https://open.feishu.cn/document/faq/bot?lang=zh-CN#11dddeb1 "配置使用 webhook 的自定义机器人时，参数 text 是否有长度要求？")

[为群组添加机器人时，没有找到我在开发者后台创建的应用？](https://open.feishu.cn/document/faq/bot?lang=zh-CN#5ad4d645 "为群组添加机器人时，没有找到我在开发者后台创建的应用？")

[是否支持通过 OpenAPI 创建机器人？](https://open.feishu.cn/document/faq/bot?lang=zh-CN#732e7c89 "是否支持通过 OpenAPI 创建机器人？")

[使用机器人发送的消息出现中文乱码是什么原因？](https://open.feishu.cn/document/faq/bot?lang=zh-CN#8dbaf1ce "使用机器人发送的消息出现中文乱码是什么原因？")

# 机器人应用相关问题

## 机器人聊天窗口没有出现对话框 （输入框）

应用机器人必须订阅 [接收消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive) 事件，使机器人具备接收用户消息的能力后，才会在聊天窗口出现对话框 （输入框）。解决方案：

1. 登录 [飞书开发者后台](https://open.feishu.cn/app)。

2. 进入应用机器人详情页。

3. 在 **权限管理** 功能页，确保已经以应用身份开通了 **读取用户发给机器人的单聊消息**（im:message.p2p\_msg:readonly）权限。

了解 API 权限，参见 [申请 API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/1428d09110d60e1e084f5ad2d8f75d1c_RKjsKqlTil.png?height=448&lazyload=true&maxWidth=600&width=2942)

4. 在 **事件与回调** \> **事件配置** 功能页，确保已经以应用身份订阅 [接收消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive) 事件。

了解事件订阅，参见 [事件概述](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/5592c656b270a67b5bda4e03f7d081a3_2BRTHHWiHo.png?height=1170&lazyload=true&maxWidth=600&width=2942)

5. 在 **版本管理与发布** 功能页，确保应用已发布，使以上配置均生效。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/8430cbc12407bf7e7eb5fac4cb892067_FbGTzIyMEG.png?height=1036&lazyload=true&maxWidth=600&width=2942)


## 怎么实现机器人@人（@所有人、@指定人）

**答**：在机器人发送的普通文本消息（text）、富文本消息（post）、消息卡片（interactive）中，可以使用 `at` 标签实现@单个用户效果。要 @ 多个人，重复使用 `at` 标签即可。

具体请求示意如下：

**(1) 在 [普通文本消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) 中@人、@所有人:**

`at`标签示意

```

// at 指定用户
<at user_id="ou_xxx">Name</at> //取值必须使用ou_xxxxx格式的 open_id 来at指定人
// at 所有人
<at user_id="all">所有人</at>
```

请求体中的`content` 示意：

```

{
	"content": " {\"text\":\"<at user_id=\\\"ou_xxxxxxxx\\\">Tom</at> text content\"}"
}
```

**(2) 在 [富文本消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/im-v1/message/create_json#45e0953e) 中@人、@所有人:**

`at`标签示意

```

// at 指定用户
{
	"tag": "at",
	"user_id": "ou_xxxxxxx",//取值必须使用ou_xxxxx格式的 open_id 来at指定人
	"user_name": "tom"
}

// at 所有人
{
	"tag": "at",
	"user_id": "all",//取值使用"all"来at所有人
	"user_name": "所有人"
}
```

请求体中的`content` 示意：

```

{
  "zh_cn": {
    "title": "我是一个标题",
    "content": [\
      [\
        {\
          "tag": "text",\
          "text": "第一行 :"\
        },\
        {\
          "tag": "at",\
          "user_id": "ou_xxxxxx",//取值必须使用ou_xxxxx格式的 open_id 来at指定人\
          "user_name": "tom"\
        }\
      ],\
      [\
        {\
          "tag": "text",\
          "text": "第二行:"\
        },\
        {\
          "tag": "at",\
          "user_id": "all",\
          "user_name": "所有人"//取值使用"all"来at所有人\
        }\
      ]\
    ]
  }
}
```

**(3) 在 [飞书卡片](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-overview) 中@人、@所有人:**

可以使用飞书卡片 [富文本（Markdown）](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/rich-text) 内容中的 `at` 人标签，标签示意：

```

// at 指定用户
	<at id="ou_xxx"></at> //使用open_id at指定人
	<at id="b6xxxxg8"></at> //使用user_id at指定人
	<at email="test@email.com"></at> //使用邮箱地址 at指定人
// at 所有人
	<at id=all></at>
```

请求体中的`content` 示意：

```

{
  "config": {
    "wide_screen_mode": true
  },
  "header": {
    "title": {
      "tag": "plain_text",
      "content": "这是卡片标题内容"
    },
    "template": "blue"
  },
  "elements": [\
    {\
      "tag": "div",\
      "text": {\
        "content": "at所有人<at id=all></at> \nat指定人<at id=ou_xxxxxx></at>",\
        "tag": "lark_md"\
      }\
    }\
  ]
}
```

**注意：**

- 对于 [自定义机器人](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN)，由于不具有通讯录信息的访问权限，只支持使用 `open_id` @指定人，或 @所有人。不支持使用 `user_id`、`email` @指定人。 [自建应用与商店应用](https://open.feishu.cn/document/home/app-types-introduction/self-built-apps-and-store-apps) 则没有此限制。你可以 [参考此教程](https://open.feishu.cn/document/home/user-identity-introduction/open-id)，以任意应用身份请求获取用户的`open_id`。
- 如果群主开启了`“仅群主和群管理员可@所有人”`配置，且机器人不是群主或管理员，则无法@所有人。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/aab2116c9e76e96c2b341022e039858f_ZbDJWADgDH.png?height=768&lazyload=true&maxWidth=400&width=694)

## 配置使用 webhook 的自定义机器人时，参数 text 是否有长度要求？

**答**：建议 JSON 的长度不超过 30k，序列化后的 pb 不超过 100k，图片最好小于 10MB。

## 为群组添加机器人时，没有找到我在开发者后台创建的应用？

**答**：你需为你的应用添加机器人能力。添加机器人能力后，该应用才支持被添加到群组。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/94c093e5dc256550b020cdeb5734eed3_nd0DpClvyw.png?height=656&lazyload=true&maxWidth=600&width=1535)

## 是否支持通过 OpenAPI 创建机器人？

**答**：不支持。

- 如需创建应用机器人，需要前往 [开发者后台](https://open.feishu.cn/app)，在指定应用配置页面添加机器人能力。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/94c093e5dc256550b020cdeb5734eed3_nd0DpClvyw.png?height=656&lazyload=true&maxWidth=600&width=1535)

- 如需创建自定义机器人，需要在飞书客户端的指定群聊内添加。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f3514a8cc60642b58490852a997b8f2f_G5y04GxDAp.png?height=1570&lazyload=true&maxWidth=600&width=2424)


## 使用机器人发送的消息出现中文乱码是什么原因？

**答**：该问题通常是因为字符编码不正确导致的。你可以：

- 请求发送消息时，在请求头中声明 utf-8 字符集。例如，调用 [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) 接口时，需要在请求头内设置 `Content-Type` 参数为 `application/json; charset=utf-8`。

- 检查你本地设备的语言环境，需要为中文环境。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/c2e150ff67ff45be4e745837096d1106_lNXibx8ZQV.png?height=496&lazyload=true&maxWidth=350&width=874)


[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Ffaq%2Fbot%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：开放能力相关](https://open.feishu.cn/document/faq/server-side-generic-questions/questions-on-open-capabilities) [下一篇：其他开发问题](https://open.feishu.cn/document/faq/others)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[机器人聊天窗口没有出现对话框 （输入框）](https://open.feishu.cn/document/faq/bot?lang=zh-CN#3c526909 "机器人聊天窗口没有出现对话框 （输入框）")

[怎么实现机器人@人（@所有人、@指定人）](https://open.feishu.cn/document/faq/bot?lang=zh-CN#acc98e1b "怎么实现机器人@人（@所有人、@指定人）")

[配置使用 webhook 的自定义机器人时，参数 text 是否有长度要求？](https://open.feishu.cn/document/faq/bot?lang=zh-CN#11dddeb1 "配置使用 webhook 的自定义机器人时，参数 text 是否有长度要求？")

[为群组添加机器人时，没有找到我在开发者后台创建的应用？](https://open.feishu.cn/document/faq/bot?lang=zh-CN#5ad4d645 "为群组添加机器人时，没有找到我在开发者后台创建的应用？")

[是否支持通过 OpenAPI 创建机器人？](https://open.feishu.cn/document/faq/bot?lang=zh-CN#732e7c89 "是否支持通过 OpenAPI 创建机器人？")

[使用机器人发送的消息出现中文乱码是什么原因？](https://open.feishu.cn/document/faq/bot?lang=zh-CN#8dbaf1ce "使用机器人发送的消息出现中文乱码是什么原因？")

尝试一下

意见反馈

技术支持

收起

展开