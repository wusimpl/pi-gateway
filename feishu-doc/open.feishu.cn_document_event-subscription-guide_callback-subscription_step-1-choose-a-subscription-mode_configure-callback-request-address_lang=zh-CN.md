---
url: "https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN"
title: "使用长连接接收回调 - 服务端 API - 开发文档 - 飞书开放平台"
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

事件订阅

回调订阅

[回调概述](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/callback-overview)

步骤一：选择订阅方式

[使用长连接接收回调](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address)

[将回调发送至开发者服务器](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server)

[步骤二：添加回调](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/add-callback)

[步骤三：接收回调](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/receive-and-handle-callbacks)

[常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/event-card-faq)

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [事件与回调](https://open.feishu.cn/document/server-docs/event-subscription-guide/overview) [回调订阅](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/callback-overview) [步骤一：选择订阅方式](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address)

使用长连接接收回调

# 使用长连接接收回调

复制页面

最后更新于 2026-03-12

本文内容

[功能优势](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#650600ec "功能优势")

[使用限制](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#cac79090 "使用限制")

[注意事项](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#355ec8c0 "注意事项")

[上手体验](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#cc621abd "上手体验")

[步骤一：集成 SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#62c8b8c8 "步骤一：集成 SDK")

[Go SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#50cecc37 "Go SDK")

[Python SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#dd8a58b "Python SDK")

[Java SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#4eb16caf "Java SDK")

[Node SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#68ad5309 "Node SDK")

[步骤二：设置订阅方式](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#1cb906a1 "步骤二：设置订阅方式")

# 使用长连接接收回调

长连接是 [飞书 SDK](https://open.feishu.cn/document/ukTMukTMukTM/uETO1YjLxkTN24SM5UjN) 内提供的能力，你可以在本地服务器集成飞书 SDK， 与开放平台建立一条 WebSocket 全双工通道（你的服务器需要能够访问公网）。后续当应用订阅的回调发生时，开放平台会通过该通道向你的服务器发送回调消息。

## 功能优势

相较于传统的 Webhook 模式，长连接模式大大降低了接入成本，将原先 1 周左右的开发周期降低到 5 分钟。具体优势如下：

- **开发调用方便快捷**

只需保证运行环境具备访问公网的能力即可，无需提供公网 IP 或域名、无需使用内网穿透工具，通过长连接模式在本地开发环境中即可接收回调消息，后续在线上部署本地服务后也可以直接生效。

- **加密传输，无需额外处理加密解密逻辑**

长连接方式内置了通信通信加密和鉴权的逻辑，回调数据网络上传输时为加密传输，对于开发者而言无需额外解密、验签逻辑，也无需部署防火墙和配置白名单。


配置回调订阅方式用于接收开放平台向应用推送的回调消息。当应用订阅的回调（例如，飞书卡片交互、链接预览）发生时，开放平台会按照指定方式进行回调。

## 使用限制

- 长连接模式仅支持企业自建应用。
- [消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure) 回调不支持 **使用长连接接收回调** 订阅方式，只能选择 [将回调发送至开发者服务器](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server) 订阅方式。
- 每个应用最多建立 50 个连接（在配置长连接时，每初始化一个 client 就是一个连接）。

## 注意事项

- 长连接模式下接收到消息后，需要在 3 秒内处理完成。

- 长连接模式的消息推送为 **集群模式**，不支持广播，即如果同一应用部署了多个客户端（client），那么只有其中随机一个客户端会收到消息。


## 上手体验

开放平台提供了一键开发卡片交互机器人的场景体验教程，你可以前往体验基于 [卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication) 回调所搭建的机器人应用，详情参见：

- [三分钟快速开发卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)
- [卡片交互机器人示例代码解释](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/explanation-of-example-code)

## 步骤一：集成 SDK

以下示例代码中以 [卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)、 [拉取链接预览数据](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/development-link-preview/pull-link-preview-data-callback-structure) 回调为例。

### Go SDK

#### 安装

```

go get -u github.com/larksuite/oapi-sdk-go/v3@latest
```

#### 示例代码

```

package main

import (
    "context"
    "fmt"
    larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
    "github.com/larksuite/oapi-sdk-go/v3/event/dispatcher"
    "github.com/larksuite/oapi-sdk-go/v3/event/dispatcher/callback"
    larkws "github.com/larksuite/oapi-sdk-go/v3/ws"
)
func main() {
    // 注册回调
    eventHandler := dispatcher.NewEventDispatcher("", "").
       // 监听「卡片回传交互 card.action.trigger」
       OnP2CardActionTrigger(func(ctx context.Context, event *callback.CardActionTriggerEvent) (*callback.CardActionTriggerResponse, error) {
          fmt.Printf("[ OnP2CardActionTrigger access ], data: %s\n", larkcore.Prettify(event))
          return nil, nil
       }).
       // 监听「拉取链接预览数据 url.preview.get」
       OnP2CardURLPreviewGet(func(ctx context.Context, event *callback.URLPreviewGetEvent) (*callback.URLPreviewGetResponse, error) {
          fmt.Printf("[ OnP2URLPreviewAction access ], data: %s\n", larkcore.Prettify(event))
          return nil, nil
       })
    // 创建Client
    cli := larkws.NewClient("YOUR_APP_ID", "YOUR_APP_SECRET",
       larkws.WithEventHandler(eventHandler),
       larkws.WithLogLevel(larkcore.LogLevelDebug),
    )
    // 建立长连接
    err := cli.Start(context.Background())
    if err != nil {
       panic(err)
    }
}
```

步骤说明：

1. 通过 dispatcher.NewEventDispatcher() 初始化回调处理器（eventHandler）， **注意两个参数必须填空字符串**。

2. 通过 eventHandler 的 OnXXXX() 方法监听不同的回调类型，上述示例中分别监听了 **卡片回传交互 card.action.trigger** 和 **拉取链接预览数据 url.preview.get** 两个回调。

3. 通过 larkws.NewClient() 初始化长连接客户端，必填参数为应用的 APP\_ID 和 APP\_SECRET，可在 [开发者后台](https://open.feishu.cn/app) 的应用详情页内，进入 **基础信息 \> 凭证与基础信息** 页面，获取应用的 APP\_ID 和 APP\_SECRET。

4. 可选参数传入 eventHandler，同时可设置日志级别。

5. 通过 cli.Start() 启动客户端，如连接成功，控制台会打印 `connected to wss://xxxxx`，主线程将阻塞，直到进程结束。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/ee46554b73c969db98c96c31a4d85d13_ez0VWNNi3V.png?height=188&lazyload=true&maxWidth=600&width=2796)


### Python SDK

#### 安装

```

pip install lark-oapi==1.4.0
```

#### 示例代码

```

import lark_oapi as lark
from lark_oapi.event.callback.model.p2_card_action_trigger import P2CardActionTrigger, P2CardActionTriggerResponse
from lark_oapi.event.callback.model.p2_url_preview_get import P2URLPreviewGet, P2URLPreviewGetResponse

# 监听「卡片回传交互 card.action.trigger」
def do_card_action_trigger(data: P2CardActionTrigger) -> P2CardActionTriggerResponse:
    print(lark.JSON.marshal(data))
    resp = {
        "toast": {
            "type": "info",
            "content": "卡片回传成功 from python sdk"
        }
    }
    return P2CardActionTriggerResponse(resp)

# 监听「拉取链接预览数据 url.preview.get」
def do_url_preview_get(data: P2URLPreviewGet) -> P2URLPreviewGetResponse:
    print(lark.JSON.marshal(data))
    resp = {
        "inline": {
            "title": "链接预览测试",
        }
    }
    return P2URLPreviewGetResponse(resp)
event_handler = lark.EventDispatcherHandler.builder("", "") \
    .register_p2_card_action_trigger(do_card_action_trigger) \
    .register_p2_url_preview_get(do_url_preview_get) \
    .build()
def main():
    cli = lark.ws.Client(lark.APP_ID, lark.APP_SECRET,
                         event_handler=event_handler, log_level=lark.LogLevel.DEBUG)
    cli.start()
if __name__ == "__main__":
    main()
```

步骤说明：

1. 通过 lark.EventDispatcherHandler.builder() 初始化回调处理器（event\_handler）， **两个参数必须填空字符串**。

2. 通过 event\_handler 的 register\_xxxx() 方法监听不同的回调类型，上述示例中监听了 **卡片回传交互 card.action.trigger** 和 **拉取链接预览数据 url.preview.get** 两个回调。

3. 通过 register\_p2\_card\_action\_trigger 注册卡片回调的处理函数。

4. 通过 register\_p2\_url\_preview\_get 注册链接预览的回调的处理函数。

5. 通过 lark.ws.Client() 初始化长连接客户端，必填参数为应用的 APP\_ID 和 APP\_SECRET，可在 [开发者后台](https://open.feishu.cn/app) 获取应用的 APP\_ID 和 APP\_SECRET。

6. 可选参数传入 event\_handler，同时可设置日志级别。

7. 通过 cli.start() 启动客户端，如连接成功，控制台会打印 `connected to wss://xxxxx`，主线程将阻塞，直到进程结束。


```
    ![](//sf3-cn.feishucdn.com/obj/open-platform-opendoc/ac590caeb5cc3fe42ca3855696f42c6e_4ZrUub9NAL.png?height=264&amp;lazyload=true&amp;maxWidth=600&amp;width=2488)
```


### Java SDK

#### 安装 SDK

```

<dependencies>
  ...
  <dependency>
    <groupId>com.larksuite.oapi</groupId>
    <artifactId>oapi-sdk</artifactId>
    <version>2.4.0</version>
  </dependency>
  ...
</dependencies>
```

#### 示例代码

```

package com.lark.oapi.sample.ws;

import com.lark.oapi.core.request.EventReq;
import com.lark.oapi.core.utils.Jsons;
import com.lark.oapi.event.CustomEventHandler;
import com.lark.oapi.event.EventDispatcher;
import com.lark.oapi.event.cardcallback.P2CardActionTriggerHandler;
import com.lark.oapi.event.cardcallback.P2URLPreviewGetHandler;
import com.lark.oapi.event.cardcallback.model.*;
import com.lark.oapi.service.im.ImService;
import com.lark.oapi.service.im.v1.model.P2MessageReceiveV1;
import com.lark.oapi.ws.Client;
import java.nio.charset.StandardCharsets;

public class Sample {
    private static final EventDispatcher EVENT_HANDLER = EventDispatcher.newBuilder("", "")  // 长连接不需要这两个参数，请保持空字符串
            // 监听「卡片回传交互 card.action.trigger」
            .onP2CardActionTrigger(new P2CardActionTriggerHandler() {
                @Override
                public P2CardActionTriggerResponse handle(P2CardActionTrigger event) throws Exception {
                    System.out.printf("[ P2CardActionTrigger access ], data: %s\n", Jsons.DEFAULT.toJson(event.getEvent()));
                    P2CardActionTriggerResponse resp = new P2CardActionTriggerResponse();
                    CallBackToast toast = new CallBackToast();
                    toast.setType("info");
                    toast.setContent("卡片交互成功 from Java SDk");
                    resp.setToast(toast);
                    return resp;
                }
            })
            // 监听「拉取链接预览数据 url.preview.get」
            .onP2URLPreviewGet(new P2URLPreviewGetHandler() {
                @Override
                public P2URLPreviewGetResponse handle(P2URLPreviewGet event) throws Exception {
                    System.out.printf("[ P2URLPreviewGet access ], data: %s\n", Jsons.DEFAULT.toJson(event.getEvent()));
                    P2URLPreviewGetResponse resp = new P2URLPreviewGetResponse();
                    URLPreviewGetInline inline = new URLPreviewGetInline();
                    inline.setTitle("链接预览测试fromJavaSDK");
                    resp.setInline(inline);
                    return resp;
                }
            })
            .build();
    public static void main(String[] args) {
        Client client = new Client.Builder("", "")
                .eventHandler(EVENT_HANDLER)
                .build();
        client.start();
    }
}
```

步骤说明：

1. 通过 EventDispatcher. _newBuilder_() 初始化回调处理器（ _EVENT\_HANDLER_），注意 **两个参数必须填空字符串**。

2. 通过 _EVENT\_HANDLER_ 的 onXXXX() 方法监听不同的回调类型，上述示例中分别监听了 **卡片回传交互 card.action.trigger** 和 **拉取链接预览数据 url.preview.get** 两个回调。

3. 通过 new Client.Builder() 初始化长连接客户端，必填参数为应用的 APP\_ID 和 APP\_SECRET，可在 [开发者后台](https://open.feishu.cn/app) 获取。

4. 可选参数传入 **EVENT\_HANDLER**。

5. 日志级别在自己项目的日志框架（log4j2、logback等）配置中修改。

6. 通过 cli.start() 启动客户端，如连接成功，控制台会打印 "connected to wss://xxxxx"，主线程将阻塞，直到进程结束。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6b7d8d5d9dac1d5276cd9ccf1b8a03ec_4SyTpW3UBX.png?height=176&lazyload=true&maxWidth=600&width=2992)


### Node SDK

#### 安装

```

npm install @larksuiteoapi/node-sdk@1.36.0
```

#### 示例代码

```

import * as Lark from "@larksuiteoapi/node-sdk";
const wsClient = new Lark.WSClient({
  appId: "YOUR_APP_ID",
  appSecret: "YOUR_APP_SECRET",
});
const eventDispatcher = new Lark.EventDispatcher({}).register({
  "card.action.trigger": async (data) => {
    console.log(data);
    return {
      toast: {
        type: "success",
        content: "卡片交互成功",
        i18n: {
          zh_cn: "卡片交互成功",
          en_us: "card action success",
        },
      },
    };
  },
});
wsClient.start({ eventDispatcher });
```

步骤说明：

1. 通过 new Lark.WSClient() 初始化长连接客户端，必填参数为应用的 APP\_ID 和 APP\_SECRET，可在 [开发者后台](https://open.feishu.cn/app) 的应用详情页内，进入 **基础信息 \> 凭证与基础信息** 页面，获取应用的 APP\_ID 和 APP\_SECRET。

2. 通过 new Lark.EventDispatcher 初始化回调处理器（eventDispatcher）。

3. 通过 eventDispatcher 的 register 方法监听不同的回调类型，上述示例中监听了 **卡片回传交互 card.action.trigger** 回调。

4. 通过 wsClient.start 启动客户端，如连接成功，控制台会打印 `[info]: [ "[ws]", "ws client ready" ]`，主线程将阻塞，直到进程结束。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a94ad9fd204d20ebadd0df1091cc47cf_3ZL3KlUTlh.png?height=228&lazyload=true&maxWidth=600&width=4130)


## 步骤二：设置订阅方式

1. 登录 [开发者后台](https://open.feishu.cn/app)，进入指定的企业自建应用详情页。

目前长连接模式不支持商店应用。

2. 进入 **事件与回调 \> 回调配置** 页面。

3. 编辑订阅方式，选择 **使用长连接接收事件**，并点击 **保存**。


```
    :::warning
    此时本地基于 SDK 建立的长连接程序必须处于已连接并运行中状态，才能成功保存。
```


:::





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/2ad08ea644e14e55ced832cf75430036_5f0zG0ZKrs.png?height=434&lazyload=true&maxWidth=600&width=942)


[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fevent-subscription-guide%2Fcallback-subscription%2Fstep-1-choose-a-subscription-mode%2Fconfigure-callback-request-address%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何开发一个自动回复机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-an-echo-bot/introduction)

[如何开发一个卡片交互机器人](https://open.feishu.cn/document/uAjLw4CM/uMzNwEjLzcDMx4yM3ATM/develop-a-card-interactive-bot/introduction)

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[如何选择不同类型的 access token？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[如何准确选择 SDK 内 API 对应的方法？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api#5954789)

遇到其他问题？问问 开放平台智能助手

[上一篇：回调概述](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/callback-overview) [下一篇：将回调发送至开发者服务器](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/send-callbacks-to-developers-server)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[功能优势](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#650600ec "功能优势")

[使用限制](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#cac79090 "使用限制")

[注意事项](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#355ec8c0 "注意事项")

[上手体验](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#cc621abd "上手体验")

[步骤一：集成 SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#62c8b8c8 "步骤一：集成 SDK")

[Go SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#50cecc37 "Go SDK")

[Python SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#dd8a58b "Python SDK")

[Java SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#4eb16caf "Java SDK")

[Node SDK](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#68ad5309 "Node SDK")

[步骤二：设置订阅方式](https://open.feishu.cn/document/event-subscription-guide/callback-subscription/step-1-choose-a-subscription-mode/configure-callback-request-address?lang=zh-CN#1cb906a1 "步骤二：设置订阅方式")

尝试一下

意见反馈

技术支持

收起

展开