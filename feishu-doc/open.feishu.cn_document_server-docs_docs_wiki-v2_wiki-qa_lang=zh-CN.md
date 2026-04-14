---
url: "https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN"
title: "知识库常见问题 - 服务端 API - 开发文档 - 飞书开放平台"
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

[知识库概述](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview)

[知识库常见问题](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa)

知识空间

空间成员

空间设置

节点

云文档

[搜索 Wiki](https://open.feishu.cn/document/server-docs/docs/wiki-v2/search_wiki)

文档

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [知识库](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview)

知识库常见问题

# 知识库常见问题

复制页面

最后更新于 2024-10-23

本文内容

[1\. 如何调用接口获取知识库文档内容 / 如何调用接口操作知识库文档？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#1d6072c2 "1. 如何调用接口获取知识库文档内容 / 如何调用接口操作知识库文档？")

[2\. 如何给应用授权访问知识库文档资源？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#a40ad4ca "2. 如何给应用授权访问知识库文档资源？")

[3\. 如何将应用添加为知识库管理员（成员）？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#b5da330b "3. 如何将应用添加为知识库管理员（成员）？")

[4\. 如何迁移云空间中的文档到知识库？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#751813a5 "4. 如何迁移云空间中的文档到知识库？")

[5\. 如何将本地文件导入到知识库？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#3ff8eeaa "5. 如何将本地文件导入到知识库？")

[6\. 如何导出知识库中文档？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#6e47a356 "6. 如何导出知识库中文档？")

[7\. 如何查看谁是当前知识库的管理员？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#8158d0c3 "7. 如何查看谁是当前知识库的管理员？")

# 知识库常见问题

## 1\. 如何调用接口获取知识库文档内容 / 如何调用接口操作知识库文档？

|     |
| --- |
| 要获取知识库中云文档的内容/调用接口操作知识库文档，你需先通过知识库相关接口获取该云文档资源的实际 token，再调用云文档资源相关获取接口。具体步骤如下所示：<br>1. 在 URL 地址栏，获取知识库中云文档挂载的节点标识 `node_token`。如下图，该文档挂载的节点 token 为 `EpMmw5WZQi7tYRk73gBc7Dabcef`。<br>   <br>   <br>   <br>   <br>   <br>   你也可通过 [获取知识空间列表](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/list) 获取知识空间的标识 `space_id`，再通过 [获取知识空间子节点列表](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/list) 获取云文档挂载的节点 `node_token`。<br>   <br>   <br>   <br>   <br>   <br>   ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9a4195d235cb581c5a644278c872a73e_kDDonAPndG.png?height=935&lazyload=true&maxWidth=500&width=1573)<br>   <br>2. 通过 [获取知识空间节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node) 接口，获取该节点下挂载的云资源的 **obj\_token**。此时，该 **obj\_token** 即为云文档资源的实际 token。<br>   <br>3. 根据云文档类型，使用 [文档](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview)、 [电子表格](https://open.feishu.cn/document/ukTMukTMukTM/uATMzUjLwEzM14CMxMTN/overview)、 [多维表格](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview) 等接口获取内容：<br>   <br>   1. 如果该云文档类型为文档，你可调用 [获取文档纯文本内容](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document/raw_content) 或 [获取文档所有块](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-v1/document-block/list) 获取文档内容<br>   2. 如果该云文档类型为电子表格，你可调用 [读取多个范围](https://open.feishu.cn/document/ukTMukTMukTM/ukTMzUjL5EzM14SOxMTN) 等接口获取电子表格中的数据<br>   3. 如果该云文档类型为多维表格，你可调用 [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 等接口获取多维表格中的记录数据<br>**说明**：<br>知识库中的云文档的特殊之处在于，云文档 URL 地址中的 token 为知识库的节点标识（node\_token），而不是实际云文档资源的唯一标识。例如，在 URL `https://sample.feishu.cn/wiki/EpMmw5WZQi7tYRk73gBc7Dabcef` 中，`EpMmw5WZQi7tYRk73gBc7Dabcef` 为知识库的节点 token，而不是 [文档](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/document-docx/docx-overview) 的唯一标识 `document_id`。 |

## 2\. 如何给应用授权访问知识库文档资源？

|     |
| --- |
| 知识库 API 中，除了 [创建知识库](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/create) 和 [搜索Wiki](https://open.feishu.cn/document/ukTMukTMukTM/uEzN0YjLxcDN24SM3QjN/search_wiki) 以外，都支持使用 **tenant\_access\_token** 进行调用。<br>应用在访问知识库之前需要获得知识库管理员的授权，或者某个节点的访问权限。要为应用授权整个知识库的访问权限，参考以下步骤：<br>- 方式一：添加群为知识库管理员或成员<br>  <br>  1. 访问 [开发者后台](https://open.feishu.cn/app)，选择目标应用。<br>     <br>  2. 在应用管理页面，点击 **添加应用能力**，找到机器人卡片，点击 **+添加**。<br>     <br>     ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/ca6dc6a875f0de5ab6dd5f37dd1c6c16_nQvJbqJSSb.png?height=1376&lazyload=true&maxWidth=728&width=2686)<br>     <br>  3. 发布当前应用版本，并确保发布版本的 [可用范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability) 包含文件夹资源的所有者。<br>     <br>  4. 在飞书客户端，创建一个新的群组，将应用添加为群机器人。<br>     <br>     <br>     <br>     <br>     <br>     **注意**<br>     <br>     此处要添加应用作为机器人，而不是添加“自定义机器人”。<br>     <br>     <br>     <br>     <br>     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/48b23c2c58b0a7ca6ee2beea898e175d_gdHAdFigva.gif?lazyload=true&maxWidth=728&height=1162)<br>5. 知识库管理员前往「 **知识库设置**」-\> 「 **成员设置**」，在此选择添加的角色：管理员、可编辑的成员或可阅读的成员。<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f2d8f0e7168dc1a7d9e4e7264ff2af51_XFAHwdOfD3.png?height=878&lazyload=true&maxWidth=728&width=1920)<br>   <br>6. 搜索包含机器人的群聊，添加该群为管理员或成员。<br>   <br>   ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/dae728569130e1ca3438e931769e92a2_0S52GbbvjE.png?height=838&lazyload=true&maxWidth=528&width=1135)<br>   <br>- 方式二：通过 API 接口将应用添加为知识库管理员或成员<br>  <br>  1. 获得知识库管理员身份凭证（user\_access\_token）。<br>  2. 获取应用 **open\_id**（参考 [云文档常见问题](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN) **问题 10 如何获取应用 open\_id？**）。<br>  3. 调用 [添加为知识空间成员](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-member/create) 接口，通过管理员身份（user\_access\_token）将应用 **open\_id** 添加为知识空间成员。通过 `member_role` 参数控制角色类型。<br>要为应用授权知识库中部分内容的访问权限，你可将应用添加为知识库中目标节点云文档的协作者，应用将拥有该节点下所有云文档的协作权限。具体步骤如下所示：<br>- 方式一：直接添加应用为节点云文档的协作者<br>  <br>  该方式要求操作者为云文档所有者、拥有文档 **管理** 权限的协作者或知识库管理员。操作者可通过云文档网页页面右上方「 **...**」->「 **...更多**」-\> 「 **添加文档应用**」入口添加。<br>  <br>  ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/22c027f63c540592d3ca8f41d48bb107_CSas7OYJBR.png?height=1994&lazyload=true&maxWidth=583&width=3278)<br>  <br>- 方式二：添加包含应用的群组为节点云文档的协作者<br>  <br>  1. 访问 [开发者后台](https://open.feishu.cn/app)，选择目标应用。<br>     <br>  2. 在应用管理页面，点击 **添加应用能力**，找到机器人卡片，点击 **+添加**。<br>     <br>  3. 发布当前应用版本，并确保发布版本的 [可用范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability) 包含知识库资源的所有者。<br>     <br>  4. 在飞书客户端，创建一个新的群组，将应用添加为群机器人。<br>     <br>     <br>     <br>     <br>     <br>     **注意**<br>     <br>     此处要添加应用作为机器人，而不是添加“自定义机器人”。<br>     <br>     <br>     <br>     <br>     ![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/48b23c2c58b0a7ca6ee2beea898e175d_gdHAdFigva.gif?lazyload=true&maxWidth=728&height=1162)<br>- 在目标节点，将该节点分享给刚刚新建的群组，并设置权限。<br>  <br>  ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/6a32d4b28f31b942e92b7f8dd9bed33c_eCrlCr1vtb.png?height=875&lazyload=true&maxWidth=728&width=1903)<br>  <br>- 方式三：通过用户身份凭证 (user\_access\_token) 调用 [增加协作者权限](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/create) 通过应用的 open\_id（参考 [云文档常见问题](https://open.feishu.cn/document/ukTMukTMukTM/uczNzUjL3czM14yN3MTN) 问题 10 “如何获取应用 open\_id ”） 给应用授予文档的访问权限。<br>  <br>- 方式四：通过用户身份凭证(user\_access\_token) 调用 [更新云文档权限设置](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-public/patch)，将权限设置为“组织内获得链接的人可编辑”。<br>  <br>- 方式五：通过用户身份凭证(user\_access\_token) 调用 [转移所有者](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/permission-member/transfer_owner) 将云文档的所有权转移给应用。 |

## 3\. 如何将应用添加为知识库管理员（成员）？

|     |
| --- |
| 添加应用为知识库管理员（成员）当前有两种方式：<br>- 通过添加群为知识库管理员（成员）方式（ **较容易**）<br>  1. 在飞书客户端中创建一个群聊，并将应用添加至群聊中。<br>     <br>  2. 知识库管理员前往「 **知识库设置**」-\> 「 **成员设置**」->「 **添加管理员**」中。<br>     <br>     ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/f2d8f0e7168dc1a7d9e4e7264ff2af51_XFAHwdOfD3.png?height=878&lazyload=true&maxWidth=483&width=1920)<br>     <br>  3. 搜索包含机器人的群聊，添加该群为管理员。<br>     <br>     ![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/dae728569130e1ca3438e931769e92a2_0S52GbbvjE.png?height=838&lazyload=true&maxWidth=483&width=1135)<br>- 通过 API 接口方式( **较繁琐**)<br>  <br>  <br>  - 参考本页 **问题2 中将应用添加知识空间成员的方式** |

## 4\. 如何迁移云空间中的文档到知识库？

|     |
| --- |
| 1. 确定当前使用访问凭证是 **user\_access\_token** 还是 **tenant\_access\_token**。<br>2. 确认当前身份是否是迁移文档的所有者。<br>3. 确认当前身份是否拥有知识库迁移目的地节点的权限。参考本页 **问题2**。<br>4. 调用 [添加已有云文档至知识库](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space-node/move_docs_to_wiki) 接口进行迁移。<br>   - 此接口为异步接口。若移动已完成（或节点已在Wiki中），则直接返回结果（Wiki token）。<br>   - 若尚未完成，则返回task id。请使用 [获取任务结果](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/task/get) 接口进行查询。 |

## 5\. 如何将本地文件导入到知识库？

|     |
| --- |
| 1. 先将本地文件通过 [导入流程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/import_task/import-user-guide) 导入到云空间。<br>2. 再通过本页 **问题4 如何迁移云空间中的文档到知识库** 将导入后的文档迁移到知识库中。 |

## 6\. 如何导出知识库中文档？

|     |
| --- |
| 1. 通过调用 [获取节点信息](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/wiki-v2/space/get_node) 接口，可以从返回值中获取到 `obj_type` 和 `obj_token`。<br>2. 再通过 [导出流程](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/export_task/export-user-guide) 将`obj_token`对应的文档下载到本地。 |

## 7\. 如何查看谁是当前知识库的管理员？

|     |
| --- |
| 你可前往飞书帮助中心 [知识库管理员常见问题](https://www.feishu.cn/hc/zh-CN/articles/573667449126-%E7%9F%A5%E8%AF%86%E5%BA%93%E7%AE%A1%E7%90%86%E5%91%98%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98#tabs0%7Clineguid-Mqjr1) 了解。 |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fdocs%2Fwiki-v2%2Fwiki-qa%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何给应用开通知识库文档权限？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa#a40ad4ca)

[如何为应用开通云文档相关资源的权限?](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app)

[如何获取云文档资源相关 token？](https://open.feishu.cn/document/server-docs/docs/faq#08bb5df6)

[应用身份创建的文档，如何给用户授权？](https://open.feishu.cn/document/server-docs/docs/permission/faq#1f89d567)

[如何解决 tenant token invalid (99991663) 错误？](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

遇到其他问题？问问 开放平台智能助手

[上一篇：知识库概述](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-overview) [下一篇：获取知识空间列表](https://open.feishu.cn/document/server-docs/docs/wiki-v2/space/list)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[1\. 如何调用接口获取知识库文档内容 / 如何调用接口操作知识库文档？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#1d6072c2 "1. 如何调用接口获取知识库文档内容 / 如何调用接口操作知识库文档？")

[2\. 如何给应用授权访问知识库文档资源？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#a40ad4ca "2. 如何给应用授权访问知识库文档资源？")

[3\. 如何将应用添加为知识库管理员（成员）？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#b5da330b "3. 如何将应用添加为知识库管理员（成员）？")

[4\. 如何迁移云空间中的文档到知识库？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#751813a5 "4. 如何迁移云空间中的文档到知识库？")

[5\. 如何将本地文件导入到知识库？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#3ff8eeaa "5. 如何将本地文件导入到知识库？")

[6\. 如何导出知识库中文档？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#6e47a356 "6. 如何导出知识库中文档？")

[7\. 如何查看谁是当前知识库的管理员？](https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa?lang=zh-CN#8158d0c3 "7. 如何查看谁是当前知识库的管理员？")

尝试一下

意见反馈

技术支持

收起

展开