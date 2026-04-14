---
url: "https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN"
title: "高级配置 - 飞书 CLI - 开发文档 - 飞书开放平台"
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

[飞书 CLI：给 Agent 一双操作飞书的手](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu)

MCP 用户指南

[MCP 概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_introduction)

[个人调用远程 MCP 服务（内测中）](https://open.feishu.cn/document/mcp_open_tools/end-user-call-remote-mcp-server)

[开发者调用远程 MCP 服务](https://open.feishu.cn/document/mcp_open_tools/developers-call-remote-mcp-server)

[远程 MCP 支持的工具列表](https://open.feishu.cn/document/mcp_open_tools/supported-tools)

开发者本地接入 OpenAPI MCP（不推荐）

[本地 OpenAPI MCP 概述](https://open.feishu.cn/document/mcp_open_tools/mcp-overview)

[本地调用 OpenAPI MCP](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_installation)

Agent 开发

[高级配置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration)

[常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/use_cases)

开发者本地接入开发文档检索 MCP

历史版本（不推荐）

[飞书 CLI](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu) [MCP 用户指南](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_introduction) [开发者本地接入 OpenAPI MCP（不推荐）](https://open.feishu.cn/document/mcp_open_tools/mcp-overview)

高级配置

# 高级配置

复制页面

最后更新于 2025-10-14

本文内容

[前提条件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#7bb6c149 "前提条件")

[命令参数](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#3af1c0c6 "命令参数")

[lark-mcp login](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#518625df "lark-mcp login")

[lark-mcp logout](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#72eb53a2 "lark-mcp logout")

[lark-mcp mcp](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#601bad50 "lark-mcp mcp")

[参数使用示例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#cfb0bcf9 "参数使用示例")

[预设工具集](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#7f0f2ab1 "预设工具集")

# 高级配置

MCP 工具支持丰富的命令参数，你可以灵活配置合适的 MCP 启动命令，各参数详细使用说明可参见下文 **参数使用示例**。

## 前提条件

已安装 lark-mcp 工具。安装方式如下：

1. 在本地终端命令行执行以下命令，安装 lark-mcp。


```

npm install @larksuiteoapi/lark-mcp -g
```






如果终端回显 `It is likely you do not have the permissions to access this file as the current user`，则需以管理员身份执行：`sudo npm install @larksuiteoapi/lark-mcp -g`。

2. 执行 lark-mcp -V 确认 MCP 版本。

若版本低于 0.4.0，建议卸载 lark-mcp 后重装：

1. 卸载 lark-mcp：`npm uninstall @larksuiteoapi/lark-mcp -g`
2. 重装 lark-mcp：`npm install @larksuiteoapi/lark-mcp -g`
3. 再次执行 `lark-mcp -V`，确认版本信息。
3. （可选）全局安装 OpenAPI MCP。

MCP 工具的安装方式分为全局安装、NPX 安装，选择任一方式安装即可使用工具。你可以根据实际需求，选择适配的方式进行安装。


   - 全局安装：安装在全局路径（/usr/local/lib），命令持久化，系统级别命令均可用。适用于经常需要使用命令行工具的场景。
   - NPX 安装：在 [安装并使用 OpenAPI MCP](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_installation) 文档中，介绍了通过 NPX 方式安装 OpenAPI MCP 的操作步骤，这种方式特点是可以快速安装上手使用，但因安装在系统临时缓存，导致命令不能持久化，运行即用即删。适用于快速试用或一次性使用的场景。

在本地安装 lark-mcp 后，你便可以持久使用 MCP 工具（支持的命令参数参考下文 **命令参数**），以 [Trae](https://www.trae.com.cn/) 为例，全局安装步骤说明如下：

1. 完成准备工作。

      详情参见 [安装并使用 OpenAPI MCP](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_installation#1cd67c23)。

2. 打开 Trae 工具。

3. 打开工具内的终端。





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/1d0a3518aba4e7b80d701d8d5f72bcab_t6gJTl2ep1.png?height=1280&lazyload=true&maxWidth=600&width=1768)

4. 执行以下命令，以用户身份登录 OpenAPI MCP。


      ```

      lark-mcp login -a <your_app_id> -s <your_app_secret>
      ```


      其中 <your\_app\_id> 为飞书应用的 App ID、<your\_app\_secret> 为飞书应用的 App Secret，你可登录飞书开发者后台，在已创建的自建应用详情页的 凭证与基础信息 页面，获取 App ID 和 App Secret。





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/645c7814f5c98789f70cbd121b4f82e7_A56ZQ6Y7RL.png?height=376&lazyload=true&maxWidth=600&width=2614)

5. 终端会回显用户授权的 URL，需在 60 秒内访问该 URL 并完成授权。





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/adcf99e95eb5123530695448dd590b4c_RlwPILaXO1.png?height=262&lazyload=true&maxWidth=600&width=1650)





      授权页面如下图所示，确保用户身份符合预期，并单击 授权，使 MCP 工具获取到用户访问凭证（user\_access\_token）。





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/4270d66bd57fc8f95a99550968ddc6ee_f4koI2F1Oq.png?height=1106&lazyload=true&maxWidth=400&width=1220)





      成功授权后，终端将回显 `success`。

6. 在工具右上角，按照 **AI 侧栏 > AI 功能管理 > MCP > 添加 > 手动添加** 的路径，打开 MCP JSON 配置对话框。





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/0093718bbd032a46fda7a62e269108b0_ol4ZZMKVOt.png?height=1104&lazyload=true&maxWidth=600&width=1878)

7. 将默认内容替换为以下 JSON，并单击 **确认**。


      ```

      {
        "mcpServers": {
          "lark-mcp": {
            "command": "lark-mcp",
            "args": [\
              "mcp",\
              "-a",\
              "<your_app_id>",\
              "-s",\
              "<your_app_secret>"\
              "--oauth"\
            ]
          }
        }
      }
      ```


      其中 <your\_app\_id> 为飞书应用的 App ID、<your\_app\_secret> 为飞书应用的 App Secret，你可登录飞书开发者后台，在已创建的自建应用详情页的 凭证与基础信息 页面，获取 App ID 和 App Secret。

8. 配置完成后，在 MCP 界面，查看 MCP Server 状态。

      Trae 中，工具名称（lark-mcp）右侧的对号（✅）图标表示配置成功。





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/02e70e32298bfda2d99453c15d8733cf_1eI5qGxE89.png?height=542&lazyload=true&maxWidth=400&width=722)

## 命令参数

### lark-mcp login

`lark-mcp login` 用于以用户身份登录并获取用户身份凭证（user\_access\_token），支持的命令参数说明如下表所示。

| 参数 | 简写 | 描述 | 示例 |
| --- | --- | --- | --- |
| `--app-id` | `-a` | 飞书应用的 App ID。 | `-a cli_xxxx` |
| `--app-secret` | `-s` | 飞书应用的 App Secret。 | `-s xxxx` |
| `--domain` | `-d` | 飞书开放平台 API 域名，默认为飞书域名。 | `-d https://open.larksuite.com` |
| `--host` | 无 | 监听主机，默认为 localhost。 | `--host 0.0.0.0` |
| `--port` | `-p` | 监听端口，默认为 3000。 | `-p 3000` |
| `--scope` | 无 | 用于指定用户身份凭证（user\_access\_token）的 API 权限。<br>- 手动指定的权限必须在应用已申请的 API 权限范围内。为应用申请权限的方式参考 [申请 API 权限](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN)。<br>- 如果需要实现自动刷新 user\_access\_token，则手动指定权限时，必须带上 `offline_access` 权限。详细介绍参考 [刷新 user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token)。<br>- 不使用 `--scope` 命令参数指定 API 权限时，默认授予用户应用所有已申请的 API 权限。 | `-- scope offline_access doc:document` |

### lark-mcp logout

`lark-mcp logout` 用于登出用户，清除用户身份凭证（user\_access\_token），支持的命令参数说明如下表所示。

| 参数 | 简写 | 描述 | 示例 |
| --- | --- | --- | --- |
| `--app-id` | `-a` | 飞书应用的 App ID。<br>- 如果不指定该参数，则会清除所有应用的 user\_access\_token。<br>- 如果指定该参数，则只会清除指定应用的 user\_access\_token。 | `-a cli_xxxx` |

### lark-mcp mcp

`lark-mcp mcp` 支持的命令参数说明如下表所示。

| 参数 | 简写 | 描述 | 示例 |
| --- | --- | --- | --- |
| `--app-id` | `-a` | 飞书应用的 App ID。 | `-a cli_xxxx` |
| `--app-secret` | `-s` | 飞书应用的 App Secret。 | `-s xxxx` |
| `--domain` | `-d` | 飞书开放平台 API 域名，默认为飞书域名。 | `-d https://open.larksuite.com` |
| `--tools` | `-t` | 需要启用的 MCP 工具列表，需参考 [tools](https://github.com/larksuite/lark-openapi-mcp/blob/main/docs/reference/tool-presets/tools-zh.md) 传入工具对应的 **MCP 工具名称**。<br>- 支持传入预设工具集。例如传入消息预设工具集（preset.im.default），则会批量启用消息 API。具体使用说明，参见下文 **预设工具集** 章节。<br>- 支持传入多个（包括单个 API 工具与预设工具集名称），用逗号分隔。<br>- 全量覆盖，运行该参数后，仅 `-t` 内包含的 API 工具可用。 | `-t im.v1.message.create,im.v1.chat.create` |
| `--tool-name-case` | `-c` | MCP 工具注册名称的命名格式，可选值为：<br>- snake（默认值）<br>- camel<br>- dot<br>- kebab | `-c camel` |
| `--language` | `-l` | 工具语言。可选值为：<br>- zh：中文<br>- en（默认值）：英文 | `-l zh` |
| `--token-mode` | 无 | 指定工具启动后调用 API 时所用的 Token 类型。可选值为：<br>- auto（默认值）：由大模型推理自动选择。<br>- tenant\_access\_token：使用应用访问令牌，会过滤掉不支持 tenant\_access\_token 的 API 工具。<br>- user\_access\_token：使用用户访问令牌，会过滤掉不支持 user\_access\_token 的 API 工具。 | `--token-mode auto` |
| `--user-access-token` | `-u` | 用户访问令牌（user\_access\_token），用于以用户身份调用 API。 | `-u u-xxxx` |
| `--mode` | `-m` | 传输模式，可选值为：<br>- stdio（默认值）<br>- sse<br>- streamable | `-m sse` |
| `--oauth` | 无 | SSE/Streamable 传输模式下可配置的参数，实现用户身份的自动登录鉴权。 | `lark-mcp mcp -m sse -a <your_app_id> -s <your_app_secret> --oauth` |
| `--host` | 无 | 监听主机，默认为 localhost。 | `--host 0.0.0.0` |
| `--port` | `-p` | 监听端口，默认为 3000。 | `-p 3000` |
| `--version` | `-V` | 显示版本号。 | `-V` |
| `--help` | `-h` | 显示帮助信息。 | `-h` |

## 参数使用示例

参数需配置在 AI 工具的 MCP 配置文件内，例如 Cursor 工具的 MCP 配置文件为 mcp.json，示例用法如下表所示。

| 用法 | 示例 |
| --- | --- |
| 基本用法（使用应用身份） | 通过 `-a`、`-s` 配置应用的 App ID、App Secret。<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>"<br>      ]<br>    }<br>  }<br>}<br>``` |
| 指定工具启动后调用 API 时所用的 Token 类型。 | 通过 `--token-mode` 指定 Token 类型。可指定的值有：<br>- auto（默认值）：由大模型推理自动选择。<br>- tenant\_access\_token：使用应用访问令牌，会过滤掉不支持 tenant\_access\_token 的 API 工具。<br>- user\_access\_token：使用用户访问令牌，会过滤掉不支持 user\_access\_token 的 API 工具。<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "--token-mode",<br>        "tenant_access_token"<br>      ]<br>    }<br>  }<br>}<br>``` |
| 使用用户访问令牌（user\_access\_token） | 如果需要以特定用户身份调用API，可以通过 `-u` 指定用户访问令牌（user\_access\_token）来实现。<br>user\_access\_token 获取方式参见 [常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/use_cases) 中的 **如何快速获取应用对应的用户访问凭证（user\_access\_token）**。<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-u",<br>        "<your_user_access_token>"<br>      ]<br>    }<br>  }<br>}<br>``` |
| 设置 MCP 工具语言为中文 | 通过 `-l` 指定工具语言。<br>设置语言为中文（zh）可能会消耗更多的 token，如果在与大模型集成时遇到 token 限制问题，可以考虑使用默认的英文（en）。<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-l",<br>        "zh"<br>      ]<br>    }<br>  }<br>}<br>``` |
| 设置 MCP 工具名称格式为驼峰式 | 通过 `-c` 设置工具名称格式。<br>通过设置工具名称格式，可以改变工具在 MCP 中注册的调用名称格式。例如，`im.v1.message.create` 在不同格式下的表现形式：<br>- snake 格式（默认）：`im_v1_message_create`<br>- camel 格式：`imV1MessageCreate`<br>- kebab 格式：`im-v1-message-create`<br>- dot 格式：`im.v1.message.create`<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-c",<br>        "camel"<br>      ]<br>    }<br>  }<br>} <br>``` |
| 指定自定义域名 | 如果你使用的是 Lark 国际版或自定义域名，可以通过`-d`参数指定，`<URL>` 需要替换为具体的域名：<br>- Lark 国际版域名为：https://open.larksuite.com<br>- 自定义域名示例：https://open.your-ka-domain.com<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-d",<br>        "<URL>"<br>      ]<br>    }<br>  }<br>}<br>``` |
| 设置传输模式 | MCP 工具支持两种传输模式：<br>1. **stdio模式（默认/推荐）**：`-m` 取值 `stdio`，该模式适用于与 AI 工具集成，通过标准输入输出流进行通信。<br>   <br>   <br>   ```<br>   <br>   {<br>     "mcpServers": {<br>       "lark-mcp": {<br>        "command": "npx",<br>         "args": [<br>           "-y",<br>           "@larksuiteoapi/lark-mcp",<br>           "mcp",<br>           "-a",<br>           "<your_app_id>",<br>           "-s",<br>           "<your_app_secret>",<br>           "-m",<br>           "stdio"<br>         ]<br>       }<br>     }<br>   }<br>   ```<br>   <br>2. **SSE 模式**：`-m` 取值 sse，提供基于 Server-Sent Events 的 HTTP 接口，适用于 Web 应用或需要网络接口的场景。<br>   <br>   启动后，SSE 端点将可在 `http://<host>:<port>/sse` 访问。<br>   <br>   1. 在 MCP 配置文件中，增加 sse URL，并保存文件。<br>      <br>      如下图示例 URL：`http://localhost:3000/sse`<br>      <br>      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/eefd1a8670c1f866be4935b5bee31679_7Ye30vyv3B.png?height=822&lazyload=true&maxWidth=300&width=1316)<br>      <br>   2. 在终端命令行执行以下命令。<br>      <br>      <br>      ```<br>      <br>      lark-mcp mcp -a cli_xxxxxxx -s dfl4xxxx -m sse<br>      ``` |
| 启用特定的 API 工具 | 默认情况下，MCP 服务启用常用 API，如需启用其他工具或仅启用特定 API，可以通过 `-t` 参数指定<br>- 需参考 [tools](https://github.com/larksuite/lark-openapi-mcp/blob/main/docs/reference/tool-presets/tools-zh.md) 传入工具对应的 **MCP** **工具名称**。<br>  <br>- 支持传入预设工具集。例如传入消息预设工具集（preset.im.default），则会批量启用消息 API。具体使用说明，参见下文 **预设工具集** 章节。<br>  <br>- 支持传入多个（包括单个 API 工具与预设工具集名称），用逗号分隔。<br>  <br>该方式为全量覆盖，会将 **MCP 工具默认启用的 OpenAPI** 给覆盖掉，只启用 `-t` 内包含的 API 工具。<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-t",<br>        "im.v1.message.create,im.v1.message.list,im.v1.chat.create"<br>      ]<br>    }<br>  }<br>} <br>``` |
| 使用环境变量代替命令行参数 | ```<br># 设置环境变量<br>export APP_ID=<your_app_id><br>export APP_SECRET=<your_app_secret><br># 启动服务（无需指定 -a 和 -s 参数）<br>lark-mcp mcp <br>``` |

## 预设工具集

| 工具集名称 | 包含的 API 工具 |
| --- | --- |
| preset.default | OpenAPI MCP 默认启用的工具集，包含：<br>- im.v1.chat.create： [创建群](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create)<br>- im.v1.chat.list： [获取用户或机器人所在的群列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/list)<br>- im.v1.chatMembers.get： [获取群成员列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-members/get)<br>- im.v1.message.create： [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)<br>- im.v1.message.list： [获取会话历史消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list)<br>- bitable.v1.app.create： [创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)<br>- bitable.v1.appTable.create： [新增一个数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)<br>- bitable.v1.appTable.list： [列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)<br>- bitable.v1.appTableField.list： [列出字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list)<br>- bitable.v1.appTableRecord.search： [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)<br>- bitable.v1.appTableRecord.create： [新增记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create)<br>- bitable.v1.appTableRecord.update： [更新记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/update)<br>- docx.v1.document.rawContent： [获取文档纯文本内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/raw_content)<br>- docx.builtin.import：导入文档，包括上传素材/文件、创建导入任务、查询导入任务结果三步骤，详情参见 [导入文件概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide#461aa643)<br>- docx.builtin.search： [搜索云文档](https://open.feishu.cn/document/ukTMukTMukTM/ugDM4UjL4ADO14COwgTN)<br>- drive.v1.permissionMember.create： [增加协作者权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/create)<br>- wiki.v2.space.getNode： [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)<br>- wiki.v1.node.search： [搜索 Wiki](https://open.feishu.cn/document/ukTMukTMukTM/uEzN0YjLxcDN24SM3QjN/search_wiki)<br>- contact.v3.user.batchGetId： [通过手机号或邮箱获取用户 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id) |
| preset.light | 精简的 API 工具集，包含：<br>- im.v1.chat.search： [搜索对用户或机器人可见的群列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/search)<br>- im.v1.message.create： [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)<br>- im.v1.message.list： [获取会话历史消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list)<br>- bitable.v1.appTableRecord.search： [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)<br>- bitable.v1.appTableRecord.batchCreate： [新增多条记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/batch_create)<br>- docx.v1.document.rawContent： [获取文档纯文本内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/raw_content)<br>- docx.builtin.import：导入文档，包括上传素材/文件、创建导入任务、查询导入任务结果三步骤，详情参见 [导入文件概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide#461aa643)<br>- docx.builtin.search： [搜索云文档](https://open.feishu.cn/document/ukTMukTMukTM/ugDM4UjL4ADO14COwgTN)<br>- wiki.v2.space.getNode： [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)<br>- contact.v3.user.batchGetId： [通过手机号或邮箱获取用户 ID](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id) |
| preset.im.default | 消息与群组 API 工具集，包含：<br>- im.v1.chat.create： [创建群](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create)<br>- im.v1.chat.list： [获取用户或机器人所在的群列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/list)<br>- im.v1.chatMembers.get： [获取群成员列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-members/get)<br>- im.v1.chatMembers.create： [将用户或机器人拉入群聊](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-members/create)<br>- im.v1.message.create： [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)<br>- im.v1.message.list： [获取会话历史消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list) |
| preset.base.default | 多维表格的 API 工具集，包含：<br>- bitable.v1.app.create： [创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)<br>- bitable.v1.appTable.create： [新增一个数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)<br>- bitable.v1.appTable.list： [列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)<br>- bitable.v1.appTableField.list： [列出字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list)<br>- bitable.v1.appTableRecord.search： [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)<br>- bitable.v1.appTableRecord.create： [新增记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create)<br>- bitable.v1.appTableRecord.update： [更新记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/update) |
| preset.base.batch | 多维表格批量处理 API 工具集，包含：<br>- bitable.v1.app.create： [创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)<br>- bitable.v1.appTable.create： [新增一个数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)<br>- bitable.v1.appTable.list： [列出数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)<br>- bitable.v1.appTableField.list： [列出字段](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list)<br>- bitable.v1.appTableRecord.search： [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)<br>- bitable.v1.appTableRecord.batchCreate： [新增多条记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/batch_create)<br>- bitable.v1.appTableRecord.batchUpdate： [更新多条记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/batch_update) |
| preset.doc.default | 云文档 API 工具集，包含：<br>- docx.v1.document.rawContent： [获取文档纯文本内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/raw_content)<br>- docx.builtin.import：导入文档，包括上传素材/文件、创建导入任务、查询导入任务结果三步骤，详情参见 [导入文件概述](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide#461aa643)<br>- docx.builtin.search： [搜索云文档](https://open.feishu.cn/document/ukTMukTMukTM/ugDM4UjL4ADO14COwgTN)<br>- drive.v1.permissionMember.create： [增加协作者权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/create)<br>- wiki.v2.space.getNode： [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)<br>- wiki.v1.node.search： [搜索 Wiki](https://open.feishu.cn/document/ukTMukTMukTM/uEzN0YjLxcDN24SM3QjN/search_wiki) |
| preset.task.default | 任务 API 工具集，包含：<br>- task.v2.task.create： [创建任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/create)<br>- task.v2.task.patch： [更新任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/patch)<br>- task.v2.task.addMembers： [添加任务成员](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/add_members)<br>- task.v2.task.addReminders： [添加任务提醒](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/add_reminders) |
| preset.calendar.default | 日历 API 工具集，包含：<br>- calendar.v4.calendarEvent.create： [创建日程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/create)<br>- calendar.v4.calendarEvent.patch： [更新日程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/patch)<br>- calendar.v4.calendarEvent.get： [获取日程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/get)<br>- calendar.v4.freebusy.list： [查询主日历日程忙闲信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/freebusy/list)<br>- calendar.v4.calendar.primary： [查询主日历信息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar/primary) |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FukTMukTMukTM%2Fmcp_integration%2Fadvanced-configuration%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：基于 OpenAPI MCP 快速开发 Agent](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/quick-start-guides/quick-integration-with-openapi-mcp) [下一篇：常见问题](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/use_cases)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[前提条件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#7bb6c149 "前提条件")

[命令参数](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#3af1c0c6 "命令参数")

[lark-mcp login](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#518625df "lark-mcp login")

[lark-mcp logout](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#72eb53a2 "lark-mcp logout")

[lark-mcp mcp](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#601bad50 "lark-mcp mcp")

[参数使用示例](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#cfb0bcf9 "参数使用示例")

[预设工具集](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration?lang=zh-CN#7f0f2ab1 "预设工具集")

尝试一下

意见反馈

技术支持

收起

展开