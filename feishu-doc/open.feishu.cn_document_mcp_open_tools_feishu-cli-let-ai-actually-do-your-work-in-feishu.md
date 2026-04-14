---
url: "https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu"
title: "Lark CLI: Put your AI to work in Lark - Lark CLI - Documentation - Feishu Open Platform"
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

[Lark CLI](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu)

Lark CLI: Put your AI to work in Lark

# Lark CLI: Put your AI to work in Lark

Copy Page

Last updated on 2026-04-03

The contents of this article

[Open source on GitHub](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#96e30ed2 "Open source on GitHub")

[🚀 Quick start](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#41046837 "🚀 Quick start")

[1\. One-click installation & configuration](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#b14745c3 "1. One-click installation & configuration")

[2\. (Optional) Complete user authorization](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#7d03413d "2. (Optional) Complete user authorization")

[🎉 3\. Start your first task](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#72129947 "🎉 3. Start your first task")

[🎬 Use cases](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#4cd362b7 "🎬 Use cases")

[Scenario 1: Post-meeting to-dos in one click](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#2a81a313 "Scenario 1: Post-meeting to-dos in one click")

[Scenario 2: Human-AI co-creation and doc review](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#86039f52 "Scenario 2: Human-AI co-creation and doc review")

[Scenario 3: Smart cross-timezone scheduling](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#26a9a6e1 "Scenario 3: Smart cross-timezone scheduling")

[Scenario 4: Meeting data analysis](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#800a974 "Scenario 4: Meeting data analysis")

[Scenario 5: Smart email triage and processing](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#3dbb6a41 "Scenario 5: Smart email triage and processing")

[Lark CLI capability map](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#0b245a95 "Lark CLI capability map")

[Common auth & config commands](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#cf1f8b50 "Common auth & config commands")

[FAQ](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#c12d6bc5 "FAQ")

[Community support group](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#f1202c2 "Community support group")

[⛲️ Make a wish](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#c268644e "⛲️ Make a wish")

# Lark CLI: Put your AI to work in Lark

Your AI agent may be great at reasoning, but without access to your tools, it cannot take action in Lark. It cannot check calendars, read messages, create docs, or follow through on tasks.

Lark CLI connects your AI to Lark so it can complete work across Docs, Base, Calendar, Mail, and more. With user authorization, it can also access personal data such as your messages, schedule, and documents. You stay in control by reviewing actions before they are taken.

## Open source on GitHub

Lark CLI is now open-source for all users. Whether you want to empower your existing agent to operate Lark or build entirely new automated workflows around Lark, equip your AI with the power to act today:

👉 **Get the Code**: **[GitHub Open Source Repository](https://github.com/larksuite/cli)**

## 🚀 Quick start

### 1\. One-click installation & configuration

Copy and paste the following prompt directly into your AI tool (e.g., TRAE, Claude Code, Codex, Cursor) to let it handle the installation for you:

```

Help me install lark-cli using the following command:
npm install -g @larksuite/cli

Then install the related skills:
npx skills add https://github.com/larksuite/cli -y -g

Finally, initialize the app configuration:
lark-cli config init --new
```

- After configuration, **restart your AI tool** to ensure all skills are fully loaded.
- When configuring the app, a new app will be created by default, or you can choose an existing one.

### 2\. (Optional) Complete user authorization

Lark CLI supports two working modes. Choose based on your needs:

- **Act as you**: AI can access your personal calendar, messages, and docs, and perform actions on your behalf. This requires a one-time user authorization—run the command below, open the link, and confirm in Lark. (If you skip this for now, AI will automatically prompt for authorization later when it needs to access your personal data.)


```

lark-cli auth login
```






![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/8b83bdd5293944c856d0bac0bac2e424_7xm13KK1iy.png?height=1298&lazyload=true&maxWidth=450&width=3180)

- **Use without personal authorization**: AI can still perform actions like sending messages and creating docs, but it cannot access your personal data (e.g., your schedule, private messages, inbox).


### 🎉 3\. Start your first task

Open your AI agent tool (e.g., TRAE, Claude Code, Codex, Cursor) and enter your request in the chat:

```

Help me create a Lark Doc introducing the capabilities of Lark CLI, and based on what you know about me, suggest which features I should start using first.
```

## 🎬 Use cases

### Scenario 1: Post-meeting to-dos in one click

You casually mention in a meeting, "I'll send you that doc later," and forget about it right after. **Now, the agent directly identifies this to-do from Lark Minutes, sends the doc, and schedules the follow-up. You just need to confirm, and it handles the rest.**

Mention you'll send a file? The agent sends it. Need to schedule a follow-up? The agent checks calendars and drafts the invite for your review.

**Advanced usage: voice triggers**: You can set a trigger word (e.g., "Lobster Lobster"). During a meeting, just say, "Lobster Lobster, help me organize this proposal into a doc and send it to the boss." After the meeting, the agent automatically identifies your command from the Minutes transcript, extracts it as a top-priority to-do, and executes it. You don't need to remember what you said; the agent remembers for you.

| User Prompt | AI Output |
| --- | --- |
| Read this Lark Minutes, extract the to-dos from it, and handle them directly for me. Show me your plan before executing. | ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3bf2c48fab53314efc1d7787793ce86e_Ft81VqHpKh.png?height=1750&lazyload=true&maxWidth=300&width=2034)<br>![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/580aaadccc3e3149a9afebc59dabe941_7XRe1TFVpM.png?height=586&lazyload=true&maxWidth=400&width=1850)<br>![img_v3_0210d_8bd02f49-6a97-4188-a39d-79a6e440cbeg.jpg](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/ed20acd114d5e53103e0fe135915902d_O10PD1Kh5B.jpg?height=666&lazyload=true&maxWidth=400&width=1576) |

### Scenario 2: Human-AI co-creation and doc review

Drafting a proposal often turns into a lot of back-and-forth with AI, copying, pasting, and formatting, which is highly inefficient. Now, you have a few new workflows:

- **AI drafts, you review**: AI creates the first draft directly in a Lark doc. You leave revision suggestions via comments in the doc. AI reads the comments, updates the text, and iterates continuously—all without leaving Lark.




| User Input | AI Output |
| --- | --- |
| Prompt: Based on my department, Lark messages, Lark docs, and schedule, help me create a Lark doc writing a "User Manual" for myself. | AI creates the doc:<br>![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9b47c12e9c61294264b94d1e53903382_lLymdeun6d.png?height=1606&lazyload=true&width=2482) |
| Prompt: {{doclink}} Modify the doc based on my comments. After modifying, use inline comments to highlight the changes.<br> User leaves a comment:![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/c4367ce26eafc9d5847a355fe2f70dee_LJvGfvRIK8.png?height=1656&lazyload=true&maxWidth=310&width=2882) | AI modifies the doc and highlights changes:<br>![img_v3_0210d_aecb62c4-659f-4cdc-9399-2561dbb7be0g.jpg](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/edf19c3cb738b4d62ac5bf1f9be2af36_F81VkVjPNj.jpg?height=1846&lazyload=true&maxWidth=320&width=2940) |

- **You draft, AI reviews**: After you write the first draft, have the AI read the entire doc and use comments to point out logical flaws, missing data, or unclear phrasing, and discusses them with you in the comment section. It's like having a senior colleague online 24/7 to help you review.




| User Prompt | AI Reviews Doc |
| --- | --- |
| {{Doc Link}} Read this doc and see if it's clear and concise enough as an instruction manual for external users. Do not edit the doc directly; just use inline comments on areas you think can be improved and write your suggestions in the comments. | ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/54c9c7322e90035b8ad96d5280cd78af_LiP2R3Qtmi.png?height=1692&lazyload=true&maxWidth=300&width=2876) |

- **Markdown to Lark doc conversion**: Wrote something in markdown within your AI tool and want to share it with colleagues? Just say, "Create a Lark doc from this markdown." The agent automatically converts the format, preserving highlights, tables, code blocks, and columns. It works in reverse, too.




| User Prompt | AI Output |
| --- | --- |
| Create a Lark doc from this markdown content and make the formatting look good. | ![img_v3_0210d_e8dd0bd8-9507-4839-bf3c-008bd36e9e2g.jpg](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f151d400d43a19488a19011ad8a72f05_akPPDPL52W.jpg?height=520&lazyload=true&maxWidth=300&width=1372)<br>![img_v3_0210d_c7bf2892-06fd-442e-b5fc-07609f24bf2g.jpg](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a36bdf791ea0b4bf383a5642ec1b57e2_70NCljmJUX.jpg?height=1756&lazyload=true&maxWidth=320&width=2882) |


### Scenario 3: Smart cross-timezone scheduling

Scheduling a group meeting usually means manually checking calendars for common free time, resulting in 20 minutes of back-and-forth messaging. If the team is across different time zones, calculating time differences manually is a headache. Now, just tell the AI, "Help me schedule a meeting with the people in this group for next week." The AI automatically pulls group members, checks everyone's calendar availability, considers all time zones, and recommends a few options where "everyone is within reasonable working hours." You pick one, and the meeting is set.

| User Prompt | AI Automatically Schedules |
| --- | --- |
| Help me check the calendars of everyone in the xxx group, and find a suitable time next week for a one-hour discussion. | ![img_v3_0210d_110be0e9-3c98-4c97-9ed3-a481546541bg.jpg](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9f34adcb10e52c67702b7ac6efbf5dcf_q3YqMuvM0s.jpg?height=1846&lazyload=true&maxWidth=320&width=2940) |

### Scenario 4: Meeting data analysis

You know you're in meetings all day, but you don't know exactly where the time goes. With a single prompt, the agent pulls your calendar data from the past two weeks, automatically tags each meeting (1:1 / Product Sync / Team Meeting / Personal), writes it into a Base, and generates a dashboard. Pie charts show proportions, bar charts show trends—one glance tells you which meetings to cut.

Taking it a step further: the agent can batch-analyze your minutes, assign an productivity score to each meeting, and tell you which meetings yielded no decisions or which topics are being discussed repeatedly, directly helping to reduce the team's burden.

| User Prompt | AI Automatically Analyzes |
| --- | --- |
| Pull my calendar for the past two weeks, categorize and tag each event, write it into a Base, and create a dashboard. I want to see where my time went. | ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/5100e8c5ef7a8313706dad4be80a4135_24X6O9KUG2.png?height=1010&lazyload=true&maxWidth=330&width=2888) |
| Analyze all my meeting minutes from the past month, give each meeting an output score, and tell me which meetings you recommend cutting. | ![img_v3_0210d_7ee7c81d-2581-45d4-9ec0-57e7f8c3ad1g.jpg](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/1434d0995bdb07e3f99a92476beebf76_Jl0WshrpAw.jpg?height=952&lazyload=true&maxWidth=350&width=1428)<br>![img_v3_0210d_27aca780-e433-4ec4-8434-d86b4021272g.jpg](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f5128e414dbbb4588b1f443feb2f81d8_faJ9TV6z50.jpg?height=1778&lazyload=true&maxWidth=350&width=2876) |

### Scenario 5: Smart email triage and processing

Receiving dozens of emails daily—a mix of notifications, approvals, and client emails—makes manual sorting time-consuming and tedious.

**With Lark CLI**: AI periodically scans unread emails, categorizes them by priority, pushes summaries of important emails to group chats, automatically archives low-priority ones, and can even draft replies for each email.

Lark CLI's Mail capabilities have been significantly enhanced, completing the full CRUD suite, allowing Lark Mail to seamlessly integrate into AI workflows.

| User Prompt | AI Automatically Processes |
| --- | --- |
| Check all my unread emails, send summaries of the important ones to the Aurora project group, and write a draft reply for each email. | ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a043548a3b0d17ecfcf22e49dd725a0f_SNtXtPzhId.png?height=678&lazyload=true&maxWidth=320&width=2084)<br>![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a28e7c03c722ddf9dcefa9f1e72eb4ee_g6p7QkMKYp.png?height=1264&lazyload=true&maxWidth=300&width=2694) |

## Lark CLI capability map

Lark CLI covers core business domains, providing AI with the following capabilities:

| **Domain** | **What It Can Do** |
| --- | --- |
| Messaging & Group Chat | Search messages and group chats, send messages, reply to threads |
| Docs | Create docs, read content, update text, comment and collaborate |
| Drive | Upload/download files, manage permissions, handle comments |
| Sheets | Create sheets, read/write cells, batch update |
| Base | Manage tables, fields, records, views, dashboards, and automations |
| Calendar | Check schedules, book meetings, check free/busy status, recommend times |
| Meetings | Search meetings, get summaries and transcripts, link calendar docs |
| Email | Search, read, draft, send, reply, and archive emails |
| Tasks | Create tasks, update status, manage tasklists and subtasks |
| Wiki | Query spaces, manage nodes and document hierarchies |
| Contacts | Query users, search colleagues, view departments |
| Search | Search group chats, messages, docs, etc. |

## Common auth & config commands

Run `lark-cli help` to view the command overview.

| Objective | Command |
| --- | --- |
| Initialize app config | `lark-cli config init` |
| Login (User Identity) | `lark-cli auth login` |
| Check current login status | `lark-cli auth status` |
| Check current permissions | `lark-cli auth check` |
| Request permissions for a specific domain | `lark-cli auth login --domain <domain>` |
| Logout | `lark-cli auth logout` |

## FAQ

- **Can enterprise administrators control permissions?**

The CLI simply automates app creation. App management still adheres to your enterprise's existing security and access controls.

- **"Command not found" error after installation?**

Ensure the directory where the CLI is installed is added to your system's PATH. For npm installations, run `npm root -g` to check the global directory.

- **Authorization failed with "Authorization code expired"?**

The OAuth authorization code is only valid for a few minutes. If it times out, simply re-run `auth login`.

- **"Insufficient permissions" when calling an API?**

**Grant the missing permissions based on the error message:**`auth login --scope "<missing_scope>"`. The CLI will specify which permissions are missing and provide a link to request them. For calls using tenant access token, you must also enable the required permissions in the Lark Developer Console.

- **How do I use it in automated tasks or AI workflows?**

Complete the configuration and authorization locally once, then integrate the CLI into your scripts or AI agent platforms for reuse.

- **What is the relationship between the CLI and the official Lark OpenClaw plugin?**

Lark's official plugins on platforms like OpenClaw are built on top of this CLI. If you are already using the Lark plugin, you don't need to install the CLI separately—just use it directly. The plugin's capabilities will soon be fully aligned with the CLI.

- **Does it support Lark?**

Yes. Run `config init` and configure it with an app from Lark to use it.

- **How do I get help?**

Run `lark-cli help` for a command overview, `lark-cli <command> --help` for specific usage, and use the `schema` command to quickly query API details.


## Community support group

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/53597986199c809caeda5f8c1ca386db_WrnZGQvhZC.png?height=526&lazyload=true&maxWidth=160&width=526)

## ⛲️ Make a wish

Want the CLI to support a new feature? Let us know! You can submit your own requests or +1 someone else's wish. We review and reply regularly, and highly-voted requests will be prioritized. Every vote you cast influences our iteration plan 💗

- 👉 [Click here to fill out the form and make a wish](https://bytedance.larkoffice.com/share/base/form/shrcnFYECazRm9hPygXwLkEhmKf?prefill_%E6%A8%A1%E5%9D%97=CLI)
- Enter the [Voting Base](https://bytedance.larkoffice.com/base/Ebxvb6usfakMENs2GHIcL5Ern2f?table=tbl3HAHYqRF0ZSM6&view=vewUF0arsE), and click **I want to +1** to vote for the wishes you resonate with.

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fmcp_open_tools%2Ffeishu-cli-let-ai-actually-do-your-work-in-feishu%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:requestAuthCode](https://open.feishu.cn/document/client-docs/gadget/-web-app-api/open-ability/login/20220308) [Next:MCP overview](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_introduction)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Open source on GitHub](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#96e30ed2 "Open source on GitHub")

[🚀 Quick start](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#41046837 "🚀 Quick start")

[1\. One-click installation & configuration](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#b14745c3 "1. One-click installation & configuration")

[2\. (Optional) Complete user authorization](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#7d03413d "2. (Optional) Complete user authorization")

[🎉 3\. Start your first task](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#72129947 "🎉 3. Start your first task")

[🎬 Use cases](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#4cd362b7 "🎬 Use cases")

[Scenario 1: Post-meeting to-dos in one click](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#2a81a313 "Scenario 1: Post-meeting to-dos in one click")

[Scenario 2: Human-AI co-creation and doc review](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#86039f52 "Scenario 2: Human-AI co-creation and doc review")

[Scenario 3: Smart cross-timezone scheduling](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#26a9a6e1 "Scenario 3: Smart cross-timezone scheduling")

[Scenario 4: Meeting data analysis](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#800a974 "Scenario 4: Meeting data analysis")

[Scenario 5: Smart email triage and processing](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#3dbb6a41 "Scenario 5: Smart email triage and processing")

[Lark CLI capability map](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#0b245a95 "Lark CLI capability map")

[Common auth & config commands](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#cf1f8b50 "Common auth & config commands")

[FAQ](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#c12d6bc5 "FAQ")

[Community support group](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#f1202c2 "Community support group")

[⛲️ Make a wish](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu#c268644e "⛲️ Make a wish")

Try It

Feedback

OnCall

Collapse

Expand