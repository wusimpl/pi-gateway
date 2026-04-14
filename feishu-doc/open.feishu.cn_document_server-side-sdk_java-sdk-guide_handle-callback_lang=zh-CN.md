---
url: "https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN"
title: "处理回调 - 服务端 API - 开发文档 - 飞书开放平台"
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

[服务端 SDK 概述](https://open.feishu.cn/document/server-docs/server-side-sdk)

Java SDK 指南

[开发前准备](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/preparations)

[调用服务端 API](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api)

[处理事件](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-events)

[处理回调](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback)

[场景示例](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/scenario-example)

Golang SDK 指南

Python SDK 指南

NodeJS SDK 指南

[常见问题](https://open.feishu.cn/document/server-side-sdk/faq)

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [服务端 SDK](https://open.feishu.cn/document/server-docs/server-side-sdk) [Java SDK 指南](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/preparations)

处理回调

# 处理回调

复制页面

最后更新于 2024-12-13

本文内容

[注意事项](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#355ec8c0 "注意事项")

[（推荐）方式一：使用长连接接收回调](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#333f0c11 "（推荐）方式一：使用长连接接收回调")

[使用限制](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#cac79090 "使用限制")

[注意事项](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#355ec8c0-1 "注意事项")

[长连接代码](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#-4c22721 "长连接代码")

[方式二：集成 Servlet 容器，将回调发送至开发者服务器](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#3548bd4b "方式二：集成 Servlet 容器，将回调发送至开发者服务器")

[步骤一：安装集成包](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#cc00b2bb "步骤一：安装集成包")

[步骤二：通过代码集成 Servlet 容器](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#133ff3e7 "步骤二：通过代码集成 Servlet 容器")

[（可选）返回卡片消息](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#32d93e99 "（可选）返回卡片消息")

# 处理回调

通过回调订阅功能，应用可以及时接收并处理飞书中特定的交互行为（例如，飞书卡片交互、链接预览等），并根据交互结果做对应的业务处理，详情参见 [回调概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/callback-overview)。在应用内订阅回调时，还需要在本地服务端建立与应用的连接，以便接收回调数据。服务端 SDK 封装了长连接方式，可以快速建立数据通道处理回调；你也可以选择自建 HTTP 服务器处理回调。两种方式介绍如下：

| 订阅方式 | 介绍 |
| --- | --- |
| 使用长连接接收回调 | 该方式是飞书 SDK 内提供的能力，你可以通过集成飞书 SDK 与开放平台建立一条 WebSocket 全双工通道（你的服务器需要能够访问公网）。后续当应用订阅的回调发生时，开放平台会通过该通道向你的服务器发送消息。相较于传统的 Webhook 模式，长连接模式大大降低了接入成本，将原先 1 周左右的开发周期降低到 5 分钟。具体优势如下：测试阶段无需使用内网穿透工具，通过长连接模式在本地开发环境中即可接收回调。SDK 内封装了鉴权逻辑，只在建连时进行鉴权，后续回调推送均为明文数据，无需再处理解密和验签逻辑。只需保证运行环境具备访问公网能力即可，无需提供公网 IP 或域名。无需部署防火墙和配置白名单。 |
| 将回调发送至开发者服务器 | 传统的 Webhook 模式，该方式需要你提供用于接收回调消息的服务器公网地址。后续当应用订阅的回调发生时，开放平台会向服务器的公网地址发送 HTTP POST 请求，请求内包含回调数据。 |

## 注意事项

开放平台 SDK 仅支持对象类型的卡片回传参数，不支持字符串类型。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6d6c7cde74877dabc032336ceb1bd85d_2NxBTdYy7C.png?height=755&lazyload=true&maxWidth=600&width=1542)

```

{
  "behaviors": [\
    { // 声明交互类型是卡片回传交互。\
      "type": "callback",\
      "value": {\
        // 回传交互数据。开放平台 SDK 仅支持对象类型的卡片回传参数。\
        "key": "value"\
      }\
    }\
  ]
}
```

## （推荐）方式一：使用长连接接收回调

如果回调订阅方式需要选择 **使用长连接接收回调**，则需要先使用 SDK 建立与应用的连接。本章节提供建立长连接的示例代码与代码解析，通过 SDK 建立长连接之后，你才能在应用的回调订阅方式中保存 **使用长连接接收回调** 方式。关于应用内配置回调订阅方式的介绍，参考 [配置回调订阅方式](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/event-subscription-guide/callback-subscription/configure-callback-request-address)。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/42e4555010cf4b41c536ad736229c742_VUwp0u83AC.png?height=490&lazyload=true&maxWidth=642&width=1234)

### 使用限制

- 长连接模式仅支持企业自建应用。
- [消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure) 回调不支持 **使用长连接接收回调** 订阅方式，只能选择 **将回调发送至开发者服务器** 订阅方式。
- 每个应用最多建立 50 个连接（在配置长连接时，每初始化一个 client 就是一个连接）。

### 注意事项

- 与 **将回调发送至开发者服务器** 方式的要求相同，长连接模式下接收到消息后，需要在 3 秒内处理完成。
- 长连接模式的消息推送为 **集群模式**，不支持广播，即如果同一应用部署了多个客户端（client），那么只有其中随机一个客户端会收到消息。

### 长连接代码

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

代码实现说明：

1. 通过 EventDispatcher. _newBuilder_() 初始化回调处理器（ _EVENT\_HANDLER_），注意 **两个参数必须填空字符串**。

2. 通过 _EVENT\_HANDLER_ 的 onXXXX() 方法监听不同的回调类型，上述示例中分别监听了 [卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication) 和 [拉取链接预览数据](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/development-link-preview/pull-link-preview-data-callback-structure) 两个回调。

3. 通过 new Client.Builder() 初始化长连接客户端，必填参数为应用的 APP\_ID 和 APP\_SECRET，可在 [开发者后台](https://open.feishu.cn/app) 获取。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f7f89950be7e57c2760a8b5b1f5e17c9_hQm8MzUvHZ.png?height=524&lazyload=true&maxWidth=642&width=3594)

4. 可选参数传入 **EVENT\_HANDLER**。

5. 日志级别在自己项目的日志框架（log4j2、logback等）配置中修改。

6. 通过 cli.start() 启动客户端，如连接成功，控制台会打印 "connected to wss://xxxxx"，主线程将阻塞，直到进程结束。





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/90d8aab594e3fa8ca22bf4b291723efd_T9Cd6dlGsr.png?height=176&lazyload=true&maxWidth=642&width=2992)


## 方式二：集成 Servlet 容器，将回调发送至开发者服务器

如果回调订阅方式选择 **将回调发送至开发者服务器**，则需要设置回调请求网址，并订阅回调。例如，你配置了可交互的卡片后，当用户在卡片内进行交互后，飞书服务器会向请求网址回调包含 JSON 数据的 HTTP POST 请求。因此，你需要启动一个 HTTP 服务器接收回调数据。

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/66f744c0fb61d3a1c113eef090e8d366_FOstX2Vv2r.png?height=630&lazyload=true&maxWidth=642&width=1509)

该章节将介绍如何集成基于 Servlet 技术栈实现的 SpringBoot Web 框架。

### 步骤一：安装集成包

要实现 SDK 集成已有的 SpringBoot 框架，你需要在项目 pom.xml 文件中引入集成包。相应的 maven 坐标如下：

```

<dependency>
  <artifactId>oapi-sdk-servlet-ext</artifactId>
  <groupId>com.larksuite.oapi</groupId>
  <version>1.0.0-rc3</version>
  <exclusions>
    <exclusion>
      <artifactId>oapi-sdk</artifactId>
      <groupId>com.larksuite.oapi</groupId>
    </exclusion>
  </exclusions>
</dependency>
```

### 步骤二：通过代码集成 Servlet 容器

以下为集成示例：

1. 注入 ServletAdapter 实例到 IOC 容器。


```

import com.lark.oapi.sdk.servlet.ext.ServletAdapter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AppStartup {

     public static void main(String[] args) {
       SpringApplication.run(AppStartup.class, args);
     }

     // 注入扩展实例到 IOC 容器
     @Bean
     public ServletAdapter getServletAdapter() {
       return new ServletAdapter();
     }
}
```

2. 编写 Controller 注册卡片处理器。


- 要基于新版卡片回传交互处理，你需订阅新版 [卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)，然后使用以下代码处理卡片行为：





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/0a0011c41318dc68672bc26b7ac0c924_dmvWOlM0m8.png?height=280&lazyload=true&maxWidth=594&width=1372)


```

import com.lark.oapi.core.utils.Jsons;
import com.lark.oapi.event.EventDispatcher;
import com.lark.oapi.event.cardcallback.P2CardActionTriggerHandler;
import com.lark.oapi.event.cardcallback.P2URLPreviewGetHandler;
import com.lark.oapi.event.cardcallback.model.*;
import com.lark.oapi.sdk.servlet.ext.ServletAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
public class EventController {

    //1. 注册消息处理器
    private final EventDispatcher EVENT_DISPATCHER = EventDispatcher.newBuilder("", "")
            .onP2CardActionTrigger(new P2CardActionTriggerHandler() {
                // 监听「卡片回传交互 card.action.trigger」
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

    //2. 注入 ServletAdapter 实例
    @Autowired
    private ServletAdapter servletAdapter;

    //3. 创建路由处理器
    @RequestMapping("/webhook/event")
    public void event(HttpServletRequest request, HttpServletResponse response)
            throws Throwable {
        //3.1 回调扩展包提供的事件回调处理器
        servletAdapter.handleEvent(request, response, EVENT_DISPATCHER);
    }
}
```

- 要基于旧版卡片回传交互处理，你需订阅旧版 [消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)，然后使用以下代码处理卡片行为：





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/eccf7387b4feb939ba52878cb04d2882_masSC8AR3s.png?height=263&lazyload=true&maxWidth=694&width=1446)






```

import com.lark.oapi.card.CardActionHandler;
import com.lark.oapi.card.model.CardAction;
import com.lark.oapi.core.utils.Jsons;
import com.lark.oapi.sdk.servlet.ext.ServletAdapter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CardActionController {

    //1. 注册卡片处理器
    private final CardActionHandler CARD_ACTION_HANDLER = CardActionHandler.newBuilder("v", "e",
        new CardActionHandler.ICardHandler() {
          @Override
          public Object handle(CardAction cardAction) {
            System.out.println(Jsons.DEFAULT.toJson(cardAction));
            System.out.println(cardAction.getRequestId());
            return null;
          }
        }).build();

    // 2. 注入 ServletAdapter 示例
    @Autowired
    private ServletAdapter servletAdapter;

    //3. 注册服务路由
    @RequestMapping("/webhook/card")
    public void card(HttpServletRequest request, HttpServletResponse response)
        throws Throwable {
      //3.1 回调扩展包卡片行为处理回调
      servletAdapter.handleCardAction(request, response, CARD_ACTION_HANDLER);
    }
}
```


如上代码中，如果不需要处理器内返回业务结果至飞书服务端，则直接在处理器内返回 null 即可。如需了解其他卡片回调示例，可参见 [GitHub 代码仓库](https://github.com/larksuite/oapi-sdk-java/blob/v2_main/sample/src/main/java/com/lark/oapi/sample/event/CardActionController.java)。

## （可选）返回卡片消息

如果你需要在卡片处理器内同步返回用于更新消息卡片的消息体，则可以使用以下方式进行处理。

- 要基于新版卡片回传交互处理，你需订阅新版 [卡片回传交互](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-callback-communication)，然后使用以下代码处理卡片行为：





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/0a0011c41318dc68672bc26b7ac0c924_dmvWOlM0m8.png?height=280&lazyload=true&maxWidth=594&width=1372)


```

import com.lark.oapi.core.utils.Jsons;
import com.lark.oapi.event.EventDispatcher;
import com.lark.oapi.event.cardcallback.P2CardActionTriggerHandler;
import com.lark.oapi.event.cardcallback.P2URLPreviewGetHandler;
import com.lark.oapi.event.cardcallback.model.*;
import com.lark.oapi.sdk.servlet.ext.ServletAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class EventController {

    //1. 注册消息处理器
    private final EventDispatcher EVENT_DISPATCHER = EventDispatcher.newBuilder("", "")
            .onP2CardActionTrigger(new P2CardActionTriggerHandler() {
                // 监听「卡片回传交互 card.action.trigger」
                @Override
                public P2CardActionTriggerResponse handle(P2CardActionTrigger event) throws Exception {
                    System.out.printf("[ P2CardActionTrigger access ], data: %s\n", Jsons.DEFAULT.toJson(event.getEvent()));
                    P2CardActionTriggerResponse resp = new P2CardActionTriggerResponse();
                    CallBackToast toast = new CallBackToast();
                    toast.setType("info");
                    toast.setContent("卡片交互成功 from Java SDk");
                    CallBackCard card = new CallBackCard();
                    Map<String, Object> cardData = new HashMap<>();

                    // Config map
                    Map<String, Object> configMap = new HashMap<>();
                    configMap.put("enable_forward", true);

                    // Text map inside elements
                    Map<String, String> textMap = new HashMap<>();
                    textMap.put("content", "This is the plain text");
                    textMap.put("tag", "plain_text");

                    // Element map
                    Map<String, Object> elementMap = new HashMap<>();
                    elementMap.put("tag", "div");
                    elementMap.put("text", textMap);

                    // Elements list
                    List<Map<String, Object>> elementsList = new ArrayList<>();
                    elementsList.add(elementMap);

                    // Title map inside header
                    Map<String, String> titleMap = new HashMap<>();
                    titleMap.put("content", "This is the title");
                    titleMap.put("tag", "plain_text");

                    // Header map
                    Map<String, Object> headerMap = new HashMap<>();
                    headerMap.put("template", "blue");
                    headerMap.put("title", titleMap);

                    // Putting everything into the main map
                    cardData.put("config", configMap);
                    cardData.put("elements", elementsList);
                    cardData.put("header", headerMap);

                    card.setType("raw");
                    card.setData(cardData); // 这里的data必须是一个对象，不是序列化后的字符串
                    resp.setToast(toast);
                    resp.setCard(card);
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

    //2. 注入 ServletAdapter 实例
    @Autowired
    private ServletAdapter servletAdapter;

    //3. 创建路由处理器
    @RequestMapping("/webhook/event")
    public void event(HttpServletRequest request, HttpServletResponse response)
            throws Throwable {
        //3.1 回调扩展包提供的事件回调处理器
        servletAdapter.handleEvent(request, response, EVENT_DISPATCHER);
    }
}
```

- 要基于旧版卡片回传交互处理，你需订阅旧版 [消息卡片回传交互（旧）](https://open.feishu.cn/document/ukTMukTMukTM/uYzM3QjL2MzN04iNzcDN/configuring-card-callbacks/card-callback-structure)，然后使用以下代码处理卡片行为：





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/eccf7387b4feb939ba52878cb04d2882_masSC8AR3s.png?height=263&lazyload=true&maxWidth=694&width=1446)


```

import com.lark.oapi.card.CardActionHandler;
import com.lark.oapi.card.model.CardAction;
import com.lark.oapi.card.model.MessageCard;
import com.lark.oapi.card.model.MessageCardElement;
import com.lark.oapi.core.utils.Jsons;
import com.lark.oapi.sdk.servlet.ext.ServletAdapter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
public class CardActionController {
  //1. 注册卡片处理器
  private final CardActionHandler CARD_ACTION_HANDLER = CardActionHandler.newBuilder("v", "e",
      new CardActionHandler.ICardHandler() {
        @Override
        public Object handle(CardAction cardAction) {
          // 1.1 处理卡片行为
          System.out.println(Jsons.DEFAULT.toJson(cardAction));
          System.out.println(cardAction.getRequestId());
          // 1.2 构建响应卡片内容
          MessageCard card = MessageCard.newBuilder()
              .cardLink(cardURL)
              .config(config)
              .header(header)
              .elements(new MessageCardElement[]{div, note, image, cardAction, hr})
              .build();
          return card;
        }
      }).build();
  // 2. 注入 ServletAdapter 示例
  @Autowired
  private ServletAdapter servletAdapter;
  //3. 注册服务路由
  @RequestMapping("/webhook/card")
  public void card(HttpServletRequest request, HttpServletResponse response)
      throws Throwable {
    //3.1 回调扩展包卡片行为处理回调
    servletAdapter.handleCardAction(request, response, CARD_ACTION_HANDLER);
  }
}
```

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-side-sdk%2Fjava-sdk-guide%2Fhandle-callback%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[如何选择不同类型的 access token？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[如何准确选择 SDK 内 API 对应的方法？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api#5954789)

[如何获取自己的 Open ID？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[如何为应用申请所需权限？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

遇到其他问题？问问 开放平台智能助手

[上一篇：处理事件](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-events) [下一篇：场景示例](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/scenario-example)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[注意事项](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#355ec8c0 "注意事项")

[（推荐）方式一：使用长连接接收回调](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#333f0c11 "（推荐）方式一：使用长连接接收回调")

[使用限制](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#cac79090 "使用限制")

[注意事项](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#355ec8c0-1 "注意事项")

[长连接代码](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#-4c22721 "长连接代码")

[方式二：集成 Servlet 容器，将回调发送至开发者服务器](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#3548bd4b "方式二：集成 Servlet 容器，将回调发送至开发者服务器")

[步骤一：安装集成包](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#cc00b2bb "步骤一：安装集成包")

[步骤二：通过代码集成 Servlet 容器](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#133ff3e7 "步骤二：通过代码集成 Servlet 容器")

[（可选）返回卡片消息](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback?lang=zh-CN#32d93e99 "（可选）返回卡片消息")

尝试一下

意见反馈

技术支持

收起

展开