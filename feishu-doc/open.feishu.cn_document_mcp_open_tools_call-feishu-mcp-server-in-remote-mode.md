---
url: "https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode"
title: "Call Feishu MCP Server in Remote Mode (Deprecated) - Lark CLI - Documentation - Feishu Open Platform"
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

Deprecated MCP docs

[Call Feishu MCP Server in Remote Mode (Deprecated)](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode)

[Lark CLI](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu) [Deprecated MCP docs](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode)

Call Feishu MCP Server in Remote Mode (Deprecated)

# Call Feishu MCP Server in Remote Mode (Deprecated)

Copy Page

Last updated on 2026-01-13

The contents of this article

[Configure the MCP server](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#041d4aa1 "Configure the MCP server")

[One-click installation to Trae/Cursor](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#93abccc4 "One-click installation to Trae/Cursor")

[Use MCP](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#8a999e90 "Use MCP")

[FAQ](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#c12d6bc5 "FAQ")

[What causes the API tool Not to be found when use MCP in Trae?](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#35053f68 "What causes the API tool Not to be found when use MCP in Trae?")

[How to rename or delete a configured MCP Server?](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#2d53a17f "How to rename or delete a configured MCP Server?")

[After configuring tools, how to modify? Is it necessary to regenerate the server URL after modification?](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#33c91572 "After configuring tools, how to modify? Is it necessary to regenerate the server URL after modification?")

[What causes abnormal MCP Tools status display in Cursor?](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#716f6fac "What causes abnormal MCP Tools status display in Cursor?")

# Call remote Feishu MCP server

This feature is no longer maintained. Please use the [New Remote MCP Service (Beta)](https://open.feishu.cn/document/mcp_open_tools/end-user-call-remote-mcp-server) instead.

The Feishu Open Platform provides a remote MCP Server configuration feature that supports the Streamable HTTP transmission protocol. This allows users in cloud scenarios to securely and efficiently integrate and utilize rich Feishu open capabilities with AI agents such as Cursor, Trae, Claude, n8n, etc., through one-click integration.

## Configure the MCP server

Create a remote MCP service on the Feishu MCP Configuration Platform and customize tools (i.e., Feishu Open Platform server-side APIs) to flexibly build the MCP tools your business requires.

These tools are all invoked using the current logged-in user identity (user\_access\_token). Related notes:

- During configuration, the system guides you through a one-click authorization process for the logged-in user; only after user authorization can the MCP Server invoke tools on behalf of the user.
- The user\_access\_token has an expiration time; the remote MCP Server configuration supports automatic refreshing before expiration.
- For details about user\_access\_token, see [Getting user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/get-user-access-token) and [Refreshing user\_access\_token](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/authentication-management/access-token/refresh-user-access-token).

1. Log in to the [Feishu MCP Configuration Platform](https://open.feishu.cn/page/mcp).





The remote MCP Server configuration feature is currently in beta. If you are unable to access the configuration platform, please contact Technical Support in the lower right corner of the documentation page (select **Expand > OnCall**).

2. On the left side of the page, click **New MCP Service**.

3. On the service creation page, complete the following configurations:

1. In the **MCP tool settings** area, confirm the current user identity.

      Subsequent management of Feishu business resources via MCP is done using the currently displayed user identity. If incorrect, log out and log in with the correct user.





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f2eee4fee3f71c3ae506b3e991fa4d18_W61WZX0ojD.png?height=680&lazyload=true&maxWidth=600&width=1666)

2. In the **Add tool** card, click **Add**.

3. In the **Add tools** dialog, choose the required tool.

      The platform offers **Ready-Made Toolkits** for selection. If no Ready-Made Toolkits is found there, you can flexibly select from the **Tailored Tools** list. For example, if your business needs MCP to manage Feishu multidimensional tables, select the multidimensional table tool.





      Expand the tool list and click **Learn More** on the right of any tool to see detailed introductions.









      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b734d0f0e41804b584ec795857894d1c_UQmlyZIVIB.png?height=1438&lazyload=true&maxWidth=600&width=1652)

4. Click **Add**, and in the popped-up **Get user authorization** dialog, confirm the authorized user login information and permissions granted to the Feishu MCP app, then click **Authorize**.





      ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/95f55194075a070f2992a817f45eedbe_0MZMtgMFip.png?height=1062&lazyload=true&maxWidth=400&width=992)
4. After successful addition, in the **How to use MCP server** area, select the **Transmission mode**, and view the **Server URL and JSON**.





   - The included links represent calling Feishu tools as the current logged-in user, acting as personal keys; do not disclose them.
   - Links have expiration times and will automatically become invalid after expiration. To extend validity, click **Reauthorize** below the URL/JSON.
   - If you worry the link has been leaked, click **Reset Link** below the URL/JSON to invalidate the original and generate a new link.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/20237368cb8f1075be86c9441f004184_YQ7pa9u9kw.png?height=780&lazyload=true&maxWidth=600&width=1698)

   - **Transmission mode**: Keep the default Streamable HTTP. Streamable HTTP is an HTTP-based chunked streaming protocol that supports progressive transmission of any data format (e.g., files, logs).

   - **Server URL and JSON**: Configure these links into your AI agents so they can remotely connect to the Feishu MCP service.

     Trae/Cursor supports one-click installation; instructions are in the next section. Other AI agents can set the URL or JSON in their corresponding MCP configuration interface to connect the Feishu MCP service.

## One-click installation to Trae/Cursor

After configuring Feishu MCP services, the service page bottom provides quick entry points to add to Trae and Cursor for fast installation.

This requires having [Trae](https://www.trae.cn/) or [Cursor](https://cursor.com/) installed locally.

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/eb877c39e85a17e25b3917c34f21cbf9_OcnNyiLPWb.png?height=978&lazyload=true&maxWidth=600&width=1744)

For example, using Trae:

1. Click **Trae** and follow the instructions to open the Trae client.

2. In Trae's MCP manual configuration dialog, click **Confirm**.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/8f3f7943d8952a62bcd103f2a82c6ce7_p2NkDWPP28.png?height=1260&lazyload=true&maxWidth=400&width=968)

3. Click the **MCP** path.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/45ffd2c75ae726a972564cc3028218b3_hqmQU37S3S.png?height=304&lazyload=true&maxWidth=400&width=970)





View the configured Feishu MCP Server.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/2d6a2eba71688c2b00b2d019007ed188_1j70kmD56s.png?height=368&lazyload=true&maxWidth=400&width=978)


## Use MCP

Take Trae as an example to use the Feishu MCP service within an AI agent.

- **Example Scenario 1**: Recognize PRD saved in Feishu Cloud Docs and generate code

For example, as shown below, prepare a login page PRD for the AI agent to parse.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f1d58cdf71778d032d5ea54cedc47851_i6hkM4oGaf.png?height=1412&lazyload=true&maxWidth=600&width=2316)





1. Open **Trae** on the right side of the Trae tool.





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/870b4ba6e7f5c82ba8a61e9b47e9ef20_B2AJg83I5W.png?height=1048&lazyload=true&maxWidth=400&width=934)

2. Click **Agent** at the bottom left of the input box, and select the agent with the Feishu MCP tool (default is **Builder with MCP**).





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/0efc331c114c4411cc57fb5e6fe48fad_REcmLb7H8d.png?height=588&lazyload=true&maxWidth=400&width=1210)

3. At the bottom right of the input box, choose any DeepSeek model (different models may yield different results).





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/57c950e436def7ac81114eee2884f8f7_ktheJJUK6S.png?height=374&lazyload=true&maxWidth=400&width=860)

4. Enter the scenario prompt in the input box and click the send button at the bottom right of the input box.





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/e8885d68750282d6154345cd93687acd_1zZgC0qqVT.png?height=234&lazyload=true&maxWidth=400&width=940)

5. Wait for the AI to finish running and apply the sample code.





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/2bb72ac1f66eedad0ee137c84ca14971_GkiFswCqtO.png?height=788&lazyload=true&maxWidth=400&width=974)





     Meanwhile, preview the effect of the sample code using the AI returned preview mode.





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a58346d7059273eba9abcd44d5f0c459_Jja9TLqu9p.png?height=896&lazyload=true&maxWidth=400&width=876)
- **Example Scenario 2**: Agent fetching data and recording it in Feishu Multi-Dimensional Sheets

For example, as below, prepare an AI study log cloud document for the AI agent to parse.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/05b69902724ac87094b747c3173e6a76_vFifZatlul.png?height=1382&lazyload=true&maxWidth=600&width=2286)





1. Open **Trae** on the right side of the Trae tool.





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/870b4ba6e7f5c82ba8a61e9b47e9ef20_B2AJg83I5W.png?height=1048&lazyload=true&maxWidth=400&width=934)

2. Click **Agent** at the bottom left of the input box, and select the agent with the Feishu MCP tool (default is **Builder with MCP**).





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/0efc331c114c4411cc57fb5e6fe48fad_REcmLb7H8d.png?height=588&lazyload=true&maxWidth=400&width=1210)

3. At the bottom right of the input box, choose any DeepSeek model (different models may yield different results).





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/57c950e436def7ac81114eee2884f8f7_ktheJJUK6S.png?height=374&lazyload=true&maxWidth=400&width=860)

4. Enter the scenario prompt in the input box and click the send button at the bottom right of the input box.





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3f14567f80a72ce4bf2eb21dea12e58e_UcwgK16XR3.png?height=238&lazyload=true&maxWidth=400&width=962)





     Visit the Multi-Dimensional Sheet link to check the sample data.





     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a42720974c9748c01170be499b509637_6pWkIkiqSg.png?height=730&lazyload=true&maxWidth=600&width=1800)

## FAQ

### What causes the API tool Not to be found when use MCP in Trae?

- **Cause**: The Trae MCP call context space is limited; exceeding a certain token count results in truncation, causing the AI to fail to find the tool during calls without any notification.

- **Solution**: Select fewer than 10 tools when configuring the MCP service..


### How to rename or delete a configured MCP Server?

1. Log in to the [Feishu MCP Configuration Platform](https://open.feishu.cn/page/mcp).

2. In the left **Created MCP Services** list, select the service you want to operate on.

3. In the title area, click **···**, and choose **Rename** or **Delete** the current service.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/fd83e9b4fc13edd37ca5b00259cb44a3_WkrvCXlM9x.png?height=328&lazyload=true&maxWidth=600&width=1870)


### After configuring tools, how to modify? Is it necessary to regenerate the server URL after modification?

1. Log in to the [Feishu MCP Configuration Platform](https://open.feishu.cn/page/mcp).

2. In the left **Created MCP Services** list, select the service you want to operate on.

3. In the **MCP Tool Configuration** area, inside the **Add Tool** card, click **Edit**, modify the selected tool, and save.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/640ad57e56ae75758f7cb1dafc36c732_yWqlzUThCV.png?height=342&lazyload=true&maxWidth=600&width=1688)

4. After modification, refresh or restart the MCP service in the AI tool.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/c38600b79f783f347ede8bb552ae9c2a_tYadnlElWJ.png?height=446&lazyload=true&maxWidth=400&width=988)


### What causes abnormal MCP Tools status display in Cursor?

- Symptom: As shown below, after one-click installing MCP service to Cursor, the tool status indicator light shows red.





![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3397df6743790466a8b717a3b7a20dfc_lysxCknWDX.png?height=222&lazyload=true&maxWidth=600&width=1346)

- Cause: Due to tool impact, the status indicator may show red; generally, it does not affect the use of MCP tools.

- Solution: You can ignore the status and directly send requests in AI Chat. Judge whether the Feishu MCP tool can be called normally based on AI response. If it works, there is no problem. If it cannot be called, reconfigure the remote MCP service and reinstall it to Cursor, then try again.


[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fmcp_open_tools%2Fcall-feishu-mcp-server-in-remote-mode%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:Install and use dev doc search MCP](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/install-and-use-document-search-mcp)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Configure the MCP server](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#041d4aa1 "Configure the MCP server")

[One-click installation to Trae/Cursor](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#93abccc4 "One-click installation to Trae/Cursor")

[Use MCP](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#8a999e90 "Use MCP")

[FAQ](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#c12d6bc5 "FAQ")

[What causes the API tool Not to be found when use MCP in Trae?](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#35053f68 "What causes the API tool Not to be found when use MCP in Trae?")

[How to rename or delete a configured MCP Server?](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#2d53a17f "How to rename or delete a configured MCP Server?")

[After configuring tools, how to modify? Is it necessary to regenerate the server URL after modification?](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#33c91572 "After configuring tools, how to modify? Is it necessary to regenerate the server URL after modification?")

[What causes abnormal MCP Tools status display in Cursor?](https://open.feishu.cn/document/mcp_open_tools/call-feishu-mcp-server-in-remote-mode#716f6fac "What causes abnormal MCP Tools status display in Cursor?")

Try It

Feedback

OnCall

Collapse

Expand