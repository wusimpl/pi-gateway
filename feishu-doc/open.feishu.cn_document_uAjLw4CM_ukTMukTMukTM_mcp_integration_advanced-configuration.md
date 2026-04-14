---
url: "https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration"
title: "Advanced configuration - Lark CLI - Documentation - Feishu Open Platform"
---

[![lark](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/903e9787438e93aec1e412c4b284ca31.svg)](https://open.feishu.cn/?lang=en-US)

- [Customer Stories](https://open.feishu.cn/solutions?lang=en-US)

- [App Directory](https://app.feishu.cn/?lang=en-US)

- [Documentation](https://open.feishu.cn/document)

- [AI Assistant\\
\\
AI for developers](https://open.feishu.cn/app/ai/playground?from=nav&lang=en-US)


Enter keywords, questions, Log IDs, or error codes

- [Developer Console](https://open.feishu.cn/app?lang=en-US)


Login

- [Home](https://open.feishu.cn/document/home/index)
- [Developer Guides](https://open.feishu.cn/document/client-docs/intro)
- [Developer Tutorials](https://open.feishu.cn/document/course)
- [Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide)
- [Client API](https://open.feishu.cn/document/client-docs/h5/)
- [Lark CLI](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu)
- [Feishu Plugin for OpenClaw](https://bytedance.larkoffice.com/docx/MFK7dDFLFoVlOGxWCv5cTXKmnMh)

API Explorer [CardKit](https://open.feishu.cn/cardkit?from=open_docs_header) What's New

Search content

[Lark CLI: Put your AI to work in Lark](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu)

MCP User Guide

[MCP overview](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_introduction)

[End user call remote MCP server (in Beta)](https://open.feishu.cn/document/mcp_open_tools/end-user-call-remote-mcp-server)

[Developers call remote MCP server](https://open.feishu.cn/document/mcp_open_tools/developers-call-remote-mcp-server)

[Remote MCP supported tools](https://open.feishu.cn/document/mcp_open_tools/supported-tools)

Local OpenAPI MCP Integration (Not Recommended)

[Local OpenAPI MCP overview](https://open.feishu.cn/document/mcp_open_tools/mcp-overview)

[Locally install and use OpenAPI MCP](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_installation)

Agent Development Demo

[Advanced configuration](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration)

[FAQs](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/use_cases)

Local Dev Doc Search MCP Integration

Deprecated MCP docs

[Lark CLI](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu) [MCP User Guide](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_introduction) [Local OpenAPI MCP Integration (Not Recommended)](https://open.feishu.cn/document/mcp_open_tools/mcp-overview)

Advanced configuration

# Advanced configuration

Copy Page

Last updated on 2025-10-14

The contents of this article

[Prerequisites](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#347504e0 "Prerequisites")

[Command parameter](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#589b638f "Command parameter")

[lark-mcp login](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#518625df "lark-mcp login")

[lark-mcp logout](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#72eb53a2 "lark-mcp logout")

[lark-mcp mcp](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#601bad50 "lark-mcp mcp")

[Parameter usage examples](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#7d94d746 "Parameter usage examples")

[Preset tool sets](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#613c137b "Preset tool sets")

# Advanced configuration

The MCP tool supports a wide range of command parameters, allowing flexible configuration for suitable MCP startup commands. Detailed usage instructions for each parameter are provided below in **Parameter usage examples**.

## Prerequisites

The lark-mcp tool must be installed. Installation steps are as follows:

1. Run the following command in your local terminal to install lark-mcp.


```

npm install @larksuiteoapi/lark-mcp -g
```






If the terminal returns the message `It is likely you do not have the permissions to access this file as the current user`, you need to run the command as an administrator:`sudo npm install @larksuiteoapi/lark-mcp -g`.

2. Run `lark-mcp -V` to check the MCP version.

If the version is lower than 0.4.0, it is recommended to uninstall and reinstall lark-mcp:

1. Uninstall lark-mcp: `npm uninstall @larksuiteoapi/lark-mcp -g`
2. Reinstall lark-mcp: `npm install @larksuiteoapi/lark-mcp -g`
3. Run `lark-mcp -V` again to verify the version information.
3. (Optional) Globally install OpenAPI MCP.

There are two installation methods for the MCP tool: global installation and NPX installation. You can use either method to use the tool. Choose the installation method that suits your actual needs.


   - Global installation: installs to a global path (/usr/local/lib), commands are persistent, and system-level commands are available. Suitable for scenarios where command line tools are used frequently.
   - NPX installation: described in the [Install and use OpenAPI MCP](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_installation) document. This method allows quick installation and use, but the command is not persistent as it is installed in the system's temporary cache, deleted after execution. Suitable for quick trials or one-time usage.

After installing lark-mcp locally, you can use the MCP tool persistently (supported command parameters are referred to in the **Command Parameters** section below). Taking [Trae](https://www.trae.com.cn/) as an example, the global installation steps are explained as follows:

1. Complete the preparatory work.

      For details, see [Install and use OpenAPI MCP](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_installation#1cd67c23).

2. Open the Trae tool.

3. Open the terminal inside the tool.





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b49cb2d6a1aa9c6725c18bc08ff6bfb1_H5suYXtVTs.png?height=1286&lazyload=true&maxWidth=600&width=1448)

4. Execute the following command to log in to OpenAPI MCP as a user.


      ```

      lark-mcp login -a <your_app_id> -s <your_app_secret>
      ```


      Here, `<your_app_id>` is the App ID of your Feishu application, and `<your_app_secret>` is the App Secret. You can log in to the [Feishu Developer Console](https://open.larkoffice.com/app) and obtain the **App ID** and **App Secret** on the **Credentials & Basic Info** page of your created self-built application.





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9ce447200c78518e61679906c902a4d8_FNOtpnSOqg.png?height=356&lazyload=true&maxWidth=600&width=2532)

5. The terminal will display a user authorization URL. You need to access this URL and complete authorization within 60 seconds.





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/adcf99e95eb5123530695448dd590b4c_RlwPILaXO1.png?height=262&lazyload=true&maxWidth=600&width=1650)





      The authorization page looks as shown below. Ensure that the user identity is as expected, and click **Authorize** to allow the MCP tool to obtain the user access token.





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a8b98c48a69c371e2da9ffcaf995868d_Zx8lRSM8vs.png?height=1176&lazyload=true&maxWidth=400&width=1242)





      After successful authorization, the terminal will display `success`.

6. At the top right corner of the tool, navigate through **Toggle AI Side Bar > AI Management > MCP > Add > Add Manually** to open the MCP JSON configuration dialog.





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/801a38cfed9feaff2381d9129dc72d7d_1973tdmKq0.gif?height=1104&lazyload=true&maxWidth=600&width=1878)

7. Replace the default content with the JSON below and click **Confirm**.


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
              "<your_app_secret>",\
              "--oauth"\
            ]
          }
        }
      }
      ```


      Here, `<your_app_id>` is the App ID of your Feishu application, and `<your_app_secret>` is the App Secret. You can log in to the [Feishu Developer Console](https://open.larkoffice.com/app) and obtain the **App ID** and **App Secret** on the **Credentials & Basic Info** page of your created self-built application.





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9ce447200c78518e61679906c902a4d8_FNOtpnSOqg.png?height=356&lazyload=true&maxWidth=600&width=2532)

8. After configuration, check the MCP Server status on the MCP interface.

      In Trae, a checkmark (✅) icon to the right of the tool name (lark-mcp) indicates successful configuration.





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9634a647761d5c3dba2e8bf1678e58e6_5KuHvI5xUU.png?height=420&lazyload=true&maxWidth=400&width=800)

## Command parameter

### lark-mcp login

`lark-mcp login` is used to log in as a user and obtain the user identity credential (user\_access\_token). The supported command parameters are described in the table below.

| Parameter | Abbreviation | Description | Example |
| --- | --- | --- | --- |
| `--app-id` | `-a` | App ID of the Feishu application. | `-a cli_xxxx` |
| `--app-secret` | `-s` | App Secret of the Feishu application. | `-s xxxx` |
| `--domain` | `-d` | The API domain for Feishu Open Platform, default is the Feishu domain. | `-d https://open.larksuite.com` |
| `--host` | None | Listening host, defaults to localhost. | `--host 0.0.0.0` |
| `--port` | `-p` | Listening port, defaults to 3000. | `-p 3000` |
| `--scope` | None | Used to specify the API permissions for the user identity credential (user\_access\_token).<br>- Manually specified permissions must fall within the API permission scope that the application has applied for. For how to apply for application permissions, refer to [Apply for API Permissions](https://open.feishu.cn/document/ukTMukTMukTM/uQjN3QjL0YzN04CN2cDN).<br>- To enable automatic refreshing of user\_access\_token, the manually specified permissions must include the `offline_access` permission. For details, see [Refresh user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token).<br>- If the `--scope` parameter is not specified, the user is granted all API permissions the application has applied for by default. | `--scope offline_access doc:document` |

### lark-mcp logout

`lark-mcp logout` is used to log out a user and clear the user identity credential (user\_access\_token). The supported command parameters are described in the table below.

| Parameter | Abbreviation | Description | Example |
| --- | --- | --- | --- |
| `--app-id` | `-a` | App ID of the Feishu application.<br>- If this parameter is not specified, user\_access\_tokens of all applications will be cleared.<br>- If specified, only the user\_access\_token of the specified application will be cleared. | `-a cli_xxxx` |

### lark-mcp mcp

The supported command parameters of `lark-mcp mcp` are described in the table below.

| Parameter | Abbreviation | Description | Example |
| --- | --- | --- | --- |
| `--app-id` | `-a` | App ID of the Feishu application. | `-a cli_xxxx` |
| `--app-secret` | `-s` | App Secret of the Feishu application. | `-s xxxx` |
| `--domain` | `-d` | API domain of the Feishu Open Platform, default is the Feishu domain. | `-d https://open.larksuite.com` |
| `--tools` | `-t` | List of MCP tools that need to be enabled. Refer to [tools](https://github.com/larksuite/lark-openapi-mcp/blob/main/docs/reference/tool-presets/tools-en.md) and pass the corresponding **MCP tool names**.<br>- Support passing in preset toolsets. For example, if you pass in the preset toolset for messages and groups (preset.im.default), the specified range of message and group APIs will be enabled. For details on usage, see the below **Preset tool sets** section.<br>- Supports passing in multiple items (including individual API tools and preset toolset names), separated by commas.<br>- Fully covered, after running this parameter, only the API tools included in `-t` are available. | `-t im.v1.message.create,im.v1.chat.create` |
| `--tool-name-case` | `-c` | Format of the MCP tool registration name. Optional values are:<br>- snake (default)<br>- camel<br>- dot<br>- kebab | `-c camel` |
| `--language` | `-l` | Tool language. Optional values are:<br>- zh: Chinese<br>- en (default): English | `-l zh` |
| `--token-mode` | None | Specifies the Token type used when calling the API after the tool is started. The optional values are:<br>- auto (default value): Automatically selected by the large model inference.<br>- tenant\_access\_token: Uses the application access token, and will filter out API tools that do not support tenant\_access\_token.<br>- user\_access\_token: Uses the user access token, and will filter out API tools that do not support user\_access\_token. | `--token-mode auto` |
| `--user-access-token` | `-u` | User access token (user\_access\_token) for calling the API as a user. | `-u u-xxxx` |
| `--mode` | `-m` | Transmission mode. Optional values are:<br>- stdio (default)<br>- sse<br>- streamable | `-m sse` |
| `--oauth` | None | Configurable parameter for SSE/Streamable transmission mode, enabling automatic user identity login and authentication. | `lark-mcp mcp -m sse -a <your_app_id> -s <your_app_secret> --oauth` |
| `--host` | None | Listening host, default is localhost. | `--host 0.0.0.0` |
| `--port` | `-p` | Listening port, default is 3000. | `-p 3000` |
| `--version` | `-V` | Display version number. | `-V` |
| `--help` | `-h` | Display help information. | `-h` |

## Parameter usage examples

Parameters need to be configured in the MCP configuration file of the AI tool. For example, the MCP configuration file for the Cursor tool is mcp.json. The usage examples are shown in the table below.

| Usage | Example |
| --- | --- |
| Basic usage (using application identity) | Configure the App ID and App Secret of the application using `-a` and `-s`.<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>"<br>      ]<br>    }<br>  }<br>}<br>``` |
| Specifies the Token type used when calling the API after the tool is started. | Specify the Token type through `--token-mode`. The permissible values are:<br>- auto (default value): Automatically selected by the large model inference.<br>- tenant\_access\_token: Uses the application access token, and will filter out API tools that do not support tenant\_access\_token.<br>- user\_access\_token: Uses the user access token, and will filter out API tools that do not support user\_access\_token.<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "--token-mode",<br>        "tenant_access_token"<br>      ]<br>    }<br>  }<br>}<br>``` |
| Using user access token (user\_access\_token) | If you need to call the API as a specific user, you can specify the user access token (user\_access\_token) using `-u`.<br>Refer to [FAQ](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/use_cases) for how to quickly obtain the user access token (user\_access\_token) corresponding to the application.<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-u",<br>        "<your_user_access_token>"<br>      ]<br>    }<br>  }<br>}<br>``` |
| Setting MCP tool language to Chinese | Specify the tool language using `-l`.<br>Setting the language to Chinese (zh) may consume more tokens. If you encounter token limit issues when integrating with the large model, consider using the default English (en).<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-l",<br>        "zh"<br>      ]<br>    }<br>  }<br>}<br>``` |
| Setting MCP tool name format to camel case | Set the tool name format using `-c`.<br>By setting the tool name format, the registered call name format of the tool in MCP can be changed. For example, the performance of `im.v1.message.create` in different formats:<br>- Snake case (default): `im_v1_message_create`<br>- Camel case: `imV1MessageCreate`<br>- Kebab case: `im-v1-message-create`<br>- Dot case: `im.v1.message.create`<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-c",<br>        "camel"<br>      ]<br>    }<br>  }<br>} <br>``` |
| Specifying a custom domain | If you are using the international version of Lark or a custom domain, you can specify it using the `-d` parameter. Replace `<URL>` with the specific domain:<br>- The domain for the international version of Lark is: https://open.larksuite.com<br>- Example of a custom domain: https://open.your-ka-domain.com<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-d",<br>        "<URL>"<br>      ]<br>    }<br>  }<br>}<br>``` |
| Setting the transmission mode | MCP tools support two transmission modes:<br>1. **stdio mode (default/recommended)**: `-m` value is `stdio`. This mode is suitable for integration with AI tools and communicates through standard input and output streams.<br>   <br>   <br>   ```<br>   <br>   {<br>     "mcpServers": {<br>       "lark-mcp": {<br>        "command": "npx",<br>         "args": [<br>           "-y",<br>           "@larksuiteoapi/lark-mcp",<br>           "mcp",<br>           "-a",<br>           "<your_app_id>",<br>           "-s",<br>           "<your_app_secret>",<br>           "-m",<br>           "stdio"<br>         ]<br>       }<br>     }<br>   }<br>   ```<br>   <br>2. **SSE mode**: `-m` value is sse, providing an HTTP interface based on Server-Sent Events, suitable for web applications or scenarios requiring network interfaces.<br>   <br>   After starting, the SSE endpoint can be accessed at `http://<host>:<port>/sse`.<br>   <br>   1. Add the sse URL to the MCP configuration file and save the file.<br>      <br>      As shown in the example URL below: `http://localhost:3000/sse`<br>      <br>      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/eefd1a8670c1f866be4935b5bee31679_7Ye30vyv3B.png?height=822&lazyload=true&maxWidth=300&width=1316)<br>      <br>   2. Execute the following command in the terminal command line.<br>      <br>      <br>      ```<br>      <br>      lark-mcp mcp -a cli_xxxxxxx -s dfl4xxxx -m sse<br>      ``` |
| Enable specific API tools | By default, the MCP service enables common APIs. To enable other tools or only specific APIs, you can specify them using the `-t` parameter.<br>- Refer to [tools](https://github.com/larksuite/lark-openapi-mcp/blob/main/docs/reference/tool-presets/tools-en.md) and pass the corresponding **MCP tool names**.<br>- Supports passing in multiple items (including individual API tools and preset toolset names), separated by commas.<br>- Support passing in preset toolsets. For example, if you pass in the preset toolset for messages and groups (preset.im.default), the specified range of message and group APIs will be enabled. For details on usage, see the below **Preset tool sets** section.<br>This method is a full override, and only the API tools included in `-t` will be enabled.<br>```<br>{<br>  "mcpServers": {<br>    "lark-mcp": {<br>     "command": "npx",<br>      "args": [<br>        "-y",<br>        "@larksuiteoapi/lark-mcp",<br>        "mcp",<br>        "-a",<br>        "<your_app_id>",<br>        "-s",<br>        "<your_app_secret>",<br>        "-t",<br>        "im.v1.message.create,im.v1.message.list,im.v1.chat.create"<br>      ]<br>    }<br>  }<br>} <br>``` |
| Using environment variables instead of command-line parameters | ```<br># Set environment variables<br>export APP_ID=<your_app_id><br>export APP_SECRET=<your_app_secret><br># Start the service (no need to specify -a and -s parameters)<br>lark-mcp mcp <br>``` |

## Preset tool sets

| Toolset Name | Included APIs |
| --- | --- |
| preset.default | The default toolset enabled by OpenAPI MCP, includes:<br>- im.v1.chat.create: [Create Chat Group](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create)<br>- im.v1.chat.list: [Get User or Bot Chat Groups](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/list)<br>- im.v1.chatMembers.get: [Get Chat Members](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-members/get)<br>- im.v1.message.create: [Send Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)<br>- im.v1.message.list: [Get Chat History](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list)<br>- bitable.v1.app.create: [Create Bitable](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)<br>- bitable.v1.appTable.create: [Create Table](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)<br>- bitable.v1.appTable.list: [List Tables](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)<br>- bitable.v1.appTableField.list: [List Fields](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list)<br>- bitable.v1.appTableRecord.search: [Search Records](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)<br>- bitable.v1.appTableRecord.create: [Create Record](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create)<br>- bitable.v1.appTableRecord.update: [Update Record](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/update)<br>- docx.v1.document.rawContent: [Get Document Raw Content](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/raw_content)<br>- docx.builtin.import: Import documents, including three steps: uploading material/files, creating import tasks, and querying the results of import tasks. For details, see [File Import Overview](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide#461aa643)<br>- docx.builtin.search: [Search Cloud Documents](https://open.feishu.cn/document/ukTMukTMukTM/ugDM4UjL4ADO14COwgTN)<br>- drive.v1.permissionMember.create: [Add Collaboration Permission](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/create)<br>- wiki.v2.space.getNode: [Get Knowledge Space Node](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)<br>- wiki.v1.node.search: [Search Wiki](https://open.feishu.cn/document/ukTMukTMukTM/uEzN0YjLxcDN24SM3QjN/search_wiki)<br>- contact.v3.user.batchGetId: [Get User ID by Phone or Email](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id) |
| preset.light | Concise set of API tools, including:<br>- im.v1.chat.search: [Search the list of groups visible to the user or bot](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/search)<br>- im.v1.message.create: [Send a message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)<br>- im.v1.message.list: [Get conversation history messages](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list)<br>- bitable.v1.appTableRecord.search: [Search records](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)<br>- bitable.v1.appTableRecord.batchCreate: [Create multiple records](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/batch_create)<br>- docx.v1.document.rawContent: [Get the plain text content of the document](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/raw_content)<br>- docx.builtin.import: Import documents, including three steps: uploading material/files, creating import tasks, and querying the results of import tasks. For details, see [File Import Overview](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide#461aa643)<br>- docx.builtin.search: [Search cloud documents](https://open.feishu.cn/document/ukTMukTMukTM/ugDM4UjL4ADO14COwgTN)<br>- wiki.v2.space.getNode: [Get knowledge space node information](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)<br>- contact.v3.user.batchGetId: [Obtain user ID via mobile phone number or email](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/batch_get_id) |
| preset.im.default | Message and Chat Group API toolset, includes:<br>- im.v1.chat.create: [Create Chat Group](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/create)<br>- im.v1.chat.list: [Get User or Bot Chat Groups](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat/list)<br>- im.v1.chatMembers.get: [Get Chat Members](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-members/get)<br>- im.v1.chatMembers.create: [Add Members to Chat](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-members/create)<br>- im.v1.message.create: [Send Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)<br>- im.v1.message.list: [Get Chat History](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list) |
| preset.base.default | Bitable API toolset, includes:<br>- bitable.v1.app.create: [Create Bitable](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)<br>- bitable.v1.appTable.create: [Create Table](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)<br>- bitable.v1.appTable.list: [List Tables](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)<br>- bitable.v1.appTableField.list: [List Fields](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list)<br>- bitable.v1.appTableRecord.search: [Search Records](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)<br>- bitable.v1.appTableRecord.create: [Create Record](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/create)<br>- bitable.v1.appTableRecord.update: [Update Record](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/update) |
| preset.base.batch | Bitable Batch Processing API toolset, includes:<br>- bitable.v1.app.create: [Create Bitable](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create)<br>- bitable.v1.appTable.create: [Create Table](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)<br>- bitable.v1.appTable.list: [List Tables](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/list)<br>- bitable.v1.appTableField.list: [List Fields](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-field/list)<br>- bitable.v1.appTableRecord.search: [Search Records](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search)<br>- bitable.v1.appTableRecord.batchCreate: [Batch Create Records](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/batch_create)<br>- bitable.v1.appTableRecord.batchUpdate： [Update records](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/batch_update) |
| preset.doc.default | Cloud Document API toolset, includes:<br>- docx.v1.document.rawContent: [Get Document Raw Content](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/raw_content)<br>- docx.builtin.import: Import documents, including three steps: uploading material/files, creating import tasks, and querying the results of import tasks. For details, see [File Import Overview](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide#461aa643)<br>- docx.builtin.search: [Search Cloud Documents](https://open.feishu.cn/document/ukTMukTMukTM/ugDM4UjL4ADO14COwgTN)<br>- drive.v1.permissionMember.create: [Add Collaboration Permission](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/create)<br>- wiki.v2.space.getNode: [Get Knowledge Space Node](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node)<br>- wiki.v1.node.search: [Search Wiki](https://open.feishu.cn/document/ukTMukTMukTM/uEzN0YjLxcDN24SM3QjN/search_wiki) |
| preset.task.default | Task API toolset, includes:<br>- task.v2.task.create: [Create Task](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/create)<br>- task.v2.task.patch: [Update Task](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/patch)<br>- task.v2.task.addMembers: [Add Task Members](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/add_members)<br>- task.v2.task.addReminders: [Add Task Reminders](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/task/add_reminders) |
| preset.calendar.default | Calendar API toolset, includes:<br>- calendar.v4.calendarEvent.create: [Create Calendar Event](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/create)<br>- calendar.v4.calendarEvent.patch: [Update Calendar Event](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/patch)<br>- calendar.v4.calendarEvent.get: [Get Calendar Event](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar-event/get)<br>- calendar.v4.freebusy.list: [List Free/Busy](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/freebusy/list)<br>- calendar.v4.calendar.primary: [Get Primary Calendar](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/calendar-v4/calendar/primary) |

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuAjLw4CM%2FukTMukTMukTM%2Fmcp_integration%2Fadvanced-configuration%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:Develop agent based on OpenAPI MCP](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/quick-start-guides/quick-integration-with-openapi-mcp) [Next:FAQs](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/use_cases)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Prerequisites](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#347504e0 "Prerequisites")

[Command parameter](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#589b638f "Command parameter")

[lark-mcp login](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#518625df "lark-mcp login")

[lark-mcp logout](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#72eb53a2 "lark-mcp logout")

[lark-mcp mcp](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#601bad50 "lark-mcp mcp")

[Parameter usage examples](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#7d94d746 "Parameter usage examples")

[Preset tool sets](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/advanced-configuration#613c137b "Preset tool sets")

Try It

Feedback

OnCall

Collapse

Expand