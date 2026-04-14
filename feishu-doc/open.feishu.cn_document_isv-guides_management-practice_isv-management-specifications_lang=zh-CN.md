---
url: "https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN"
title: "《飞书独立软件服务商运营管理规范》 - 开发指南 - 开发文档 - 飞书开放平台"
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

管理规范

[《飞书开放平台独立软件服务商安全管理运营规范》](https://open.feishu.cn/document/management-practice/app-service-provider-security-management-specifications)

[《飞书独立软件服务商运营管理规范》](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications)

[稳定性与安全规范](https://open.feishu.cn/document/isv-guides/management-practice/stability-and-security-requirements)

平台公告

历史版本（不推荐）

[开发指南](https://open.feishu.cn/document/client-docs/intro) [管理规范](https://open.feishu.cn/document/management-practice/app-service-provider-security-management-specifications)

《飞书独立软件服务商运营管理规范》

# 《飞书独立软件服务商运营管理规范》

复制页面

最后更新于 2024-07-30

本文内容

[一、概述](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#32772788 "一、概述")

[二、定义](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#31f99a1f "二、定义")

[三、应用目录运营规范](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#-a8af908 "三、应用目录运营规范")

[1\. 基础信息](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#4091f53c "1. 基础信息")

[2\. 服务支持](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#b500eb0f "2. 服务支持")

[3\. 免费与收费模式](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#a00273ed "3. 免费与收费模式")

[4\. 应用目录运营推广](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#18cda97a "4. 应用目录运营推广")

[四、应用目录运营推广](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#8938dd76 "四、应用目录运营推广")

[1\. 服务商自运营](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#bca9e4d5 "1. 服务商自运营")

[2\. 参与官方活动](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#6920c47 "2. 参与官方活动")

[五、费用收取与结算](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#8e828ced "五、费用收取与结算")

[六、违规内容及处理办法](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#6562df71 "六、违规内容及处理办法")

[七、违规及合作处理流程](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#235daca4 "七、违规及合作处理流程")

[违规处理流程：](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#158bc654 "违规处理流程：")

[应用下架/下线流程：](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#6f16c04b "应用下架/下线流程：")

[服务商清退流程：](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#160d96d4 "服务商清退流程：")

[应用重新上架/上线流程：](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#8ab815e4 "应用重新上架/上线流程：")

[八、遵守当地法律监管](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#118b9559 "八、遵守当地法律监管")

# 《飞书独立软件服务商运营管理规范》

更新日期： 2022年8月31日

生效日期： 2022年8月31日

根据相关业务发展和需求，飞书保留提前 7 天以公告通知方式修改本管理规范的权利

## 一、概述

- 为维护飞书平台绿色网络环境、更好地保障用户合法权益及良好的用户体验，飞书依据《 [飞书用户服务条款](https://www.feishu.cn/terms)》《 [飞书隐私政策](https://www.feishu.cn/privacy)》、《 [稳定性和安全规范](https://open.feishu.cn/document/uMzNwEjLzcDMx4yM3ATM/uETMxEjLxETMx4SMxETM)》、《飞书合作伙伴框架协议》、《 [飞书独立软件服务商协议](https://open.feishu.cn/document/no_class/become-an-isv/feishu-independent-software-developer-agreement)》等相关规定，制定《飞书独立软件服务商运营管理规范》（以下简称“本规范”），本规范作为前述协议文件的补充，对于本规范中未涉及的内容，以前述协议文件约定为准

- 本规范适用于飞书独立软件服务商（以下统称“服务商”）

- 服务商在日常经营、管理中应诚实守信、遵纪守法，积极提升自身品质和信誉，给客户带来更好的体验，共同将飞书建设成为公开透明、公正文明、秩序良好的服务平台


## 二、定义

- **飞书应用目录：** 飞书旗下的 [一站式企业服务平台](https://app.feishu.cn/)，为企业提供项目管理、市场营销、办公管理、财务管理、人力资源管理等服务

- **服务商：** 指通过飞书应用目录发布并在线销售服务产品的企业

- **用户：** 使用飞书任意产品功能或服务的注册用户

- **应用：** 服务商在飞书开放平台注册并生产的软件或服务

- **应用下架：** 应用下架后，在飞书应用目录不可被搜索到，未安装的用户不可见，已经在使用的用户依然可以继续使用

- **应用下线：** 应用下线后，在飞书应用目录不可被搜索到，所有用户都无法使用

- **服务商清退：** 将服务商名下所有应用下线，停止其所有应用的API调用（如有），并将服务商身份永久冻结（服务商登录及操作后台权限被收回），届时应用将无法在飞书应用目录列表展现且无法成功订购，已订购该应用且仍在有效期内的用户将无法继续使用应用

- **限制营销权益：** 限制应用参加官方活动或使用营销工具，限制范围包括但不限于飞书官网、飞书开放平台、飞书应用目录、飞书管理后台、飞书推送消息等


## 三、应用目录运营规范

### 1\. 基础信息

- 服务商须完成飞书企业认证
- 服务详情页须如实描述，内容详尽清晰，不得包含虚假描述、夸大描述的信息
- 服务功能的描述须规范，与企业经营和提供的服务相关，且服务功能、界面设计及帮助体系须完善，用户使用体验畅通。不得出现与飞书、飞书应用目录及本服务无关的信息
- 同款应用商品不可重复发布

### 2\. 服务支持

- 工作日客服一周在线至少 5 天，每天 9:00-17:00 在线
- 收到用户来自服务台的咨询/需求/反馈时，服务商须在30分钟内回应
- 技术类原因导致用户无法正常使用应用单一或全部功能，须在收到反馈后 24 小时内解决
- 至少安排两名对接人对接飞书业务，工作日收到飞书工作人员反馈后，须在1小时内回应

### 3\. 免费与收费模式

- 为降低用户获取和使用应用的门槛，鼓励服务商通过设置应用的免费周期或免费版本让更多用户了解和体验应用

- 鼓励服务商通过设置不同的收费模式，为不同阶段与需求的用户提供差异化的功能和服务；接入飞书支付通道的付费应用，获得的排名权重更高

- 在用户申请发票后，及时提供合规的发票


### 4\. 应用目录运营推广

- 确保服务功能的稳定，及时响应用户的服务请求，保证服务器的稳定性，保证服务功能的安全性，确保服务能正常访问

- 不断迭代升级应用或服务，帮助用户拥有更好的使用体验、深入满足不同用户的使用需求


## 四、应用目录运营推广

### 1\. 服务商自运营

包括但不限于通过对用户进行客户关系维护、使用指导帮助、新功能推介等方式，促进用户深度使用应用，形成良性循环

### 2\. 参与官方活动

- 平台鼓励服务商在做好运营规范的基础上，通过参与官方活动的方式获取更多流量，让更多用户了解应用并产生购买和使用行为

- 报名参与官方活动的渠道为：“ [【ISV合作】飞书生态信息同步群](https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=0c3m1b58-6df2-4204-8334-6a7893da0d24)”（点击可入群）

- 官方活动资源位包括但不限于飞书应用目录、飞书管理后台、向用户推送的消息、开放平台官网，飞书官网等

- 入选官方活动的影响因素：

  - 是新品（仅针对新应用的资源位）

  - 功能上有重大更新

  - 线上成交金额（接入飞书支付通道的GMV）

  - 转化率（用户访问应用后的使用和购买比例）

  - 应用活跃用户数（统计周期内，使用过该应用的用户总数）

  - 用户留存率（某一统计时段内的活跃用户中经过一段时间后仍使用该应用的用户比例）

  - 优秀客户服务案例

  - 运营配合度（一定周期内参加运营活动后，活动效果达成情况及配合程度）

  - 客服响应率

  - 客户投诉率（一定周期内，使用该应用的用户发起投诉的比率）

## 五、费用收取与结算

开放平台收款账户余额、开放平台服务费及保证金等相关费用的收取结算，细则详见服务商运营后台的《飞书独立软件服务商相关费用收取结算细则》

## 六、违规内容及处理办法

- 对于违反《飞书合作伙伴管理制度》及本规范的应用，平台有权独立判断并处理，视情节采取调整飞书应用目录排名、禁止参与活动、下架应用、扣除保证金及服务商清退等处理措施；若服务商未及时整改，平台有权延长处罚时间或升级处罚措施
- 若服务商存在除以下违规内容外的导致用户投诉或损害平台声誉的其他违规行为，平台将视情节严重情况依照《飞书合作伙伴管理制度》进行处理
- 具体违规内容及处理办法如下所示。如某项违规行为涉嫌违反多份管理规范，保证金将依据最高金额的进行扣除
- 以下规则循环周期为一年，违规行为及处理在每年十二月三十一日二十四时后清零，重新开始生效，平台享有对规则进行解释的权利

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/77b2c90b14d19b33e048660a1bf06aa2_BhigVUvhmb.png?height=1054&lazyload=true&width=1034)

## 七、违规及合作处理流程

### **违规处理流程：**

1. 平台发现服务商的违规行为后，通过飞书消息、邮件等形式，将违规内容、处罚决定、生效日期等内容通知服务商：
   - 若服务商有异议，但未在48小时内申诉，默认为服务商认可平台处罚措施
   - 若服务商有异议，且在48小时内申诉，平台判定有效，则取消相关处罚措施
   - 若服务商有异议，且在48小时内申诉，平台判定无效，则采取相关处罚措施
   - 若服务商无异议，平台会直接采取相关处罚措施
2. 服务商确认后，平台会以飞书消息、邮件的形式正式将处罚决定通知到服务商
3. 平台进行相关违规处理

### **应用下架/下线流程：**

- **服务商因自身业务调整，主动下架：**

1. 通过飞书消息、邮件的形式，发送下架通知及原因给到飞书商务
2. 平台评审通过后，会以飞书消息、邮件形式回复
3. 平台在约定时间下架应用。新用户不可搜、不可用，服务商需按约定服务好老用户继续使用
4. 平台继续保管保证金，用于保证客户服务质量
- **服务商因自身业务调整，主动下线，关停业务**

1. 至少提前90天书面告知平台，打印 [ISV下线申请函模板](https://feishu.feishu.cn/docx/NAqRd08RuobT0SxT44rcYd3tnQf) ，盖章、扫描，发邮件给对接的商务经理。平台评审后，以飞书消息、邮件形式回复处理结果
2. 平台会先下架该应用，新用户无法搜索下载使用
3. 平台同意下线后，服务商至少提前90天向所有存量用户发下线通知，引导用户导出数据。需支持可以导出到飞书文档、飞书表格、或多维表格
4. 如有收费，需要处理退款、历史账单、及其他的客户需求
5. 服务商在这段时间，需提供服务解决用户对于数据导出等技术问题、交易退款等商务问题的咨询。确保所有客户完成授权解除、完成所有的退款后才可以停止服务。
6. 平台在确认上述情况都已完成后，退还保证金，完成下线
- **服务商因违规行为被处罚或下架：**

1. 平台发现服务商的违规行为后，通过飞书消息、邮件等形式，将违规内容、处罚决定、生效日期等内容通知服务商（服务商异议申诉方式同上）
2. 服务商确认后，平台会以飞书消息、邮件的形式正式将处罚决定通知到服务商
3. 平台进行相关违规或下架处理。下架后新用户不可搜、不可用，服务商需按约定服务好老用户继续使用
4. 平台继续保管保证金，用于保证客户服务质量
- **服务商因违规行为被下线：**

1. 平台发现服务商的违规行为后，通过飞书消息、邮件的形式，将违规内容、处罚决定、生效日期等内容通知服务商（服务商异议申诉方式同上）
2. 服务商确认后，平台会以飞书消息、邮件的形式正式将处罚决定通知到服务商
3. 服务商至少提前90天向所有存量用户发下线通知，引导用户导出数据。需支持可以导出到飞书文档、飞书表格、或多维表格；
4. 如有收费，需要处理退款、历史账单、及其他的客户需求
5. 服务商在这段时间，需提供服务解决用户对于数据导出等技术问题、交易退款等商务问题的咨询。确保所有客户完成授权解除、完成所有的退款后才可以停止服务
6. 平台在确认上述情况都已完成后，退还保证金，完成下线

### 服务商清退流程：

- 如主动结束合作关系，服务商需提前90天发邮件给商务经理，告知下架原因及处理方案，平台评审通过后，以邮件、飞书消息形式回复；如因违规行为被平台清退，平台会通过邮件、飞书消息直接通知服务商（服务商申诉方式及时效参考上述条款描述）
- 如未完成下线动作，参考上文进行导出数据、退款等事宜处理；如已完成下线，平台在确认所有客户服务问题已解决、保证金退还的情况下，正式发送终止合作函，关停ISV账号及权限，结束合作关系

### 应用重新上架/上线流程：

应用下架/下线后，服务商需分析原因，并总结针对性的优化方案。当服务商全部违规行为已被纠正、相关客诉处理妥当且处理期满后，可向平台重新申请上架/上线，是否上架视平台评审结果，评审标准参考上架标准。重新上架后，保证金复用以前缴纳部分

## 八、 **遵守当地法律监管**

- 服务商在使用平台服务的过程中应当遵守当地相关的法律法规，并尊重当地的道德和风俗习惯。如果服务商的行为违反了当地法律法规或道德风俗，服务商应当为此独立承担责任

- 服务商应避免因使用本服务而使飞书卷入政治和公共事件，否则飞书有权暂停或终止服务


[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fisv-guides%2Fmanagement-practice%2Fisv-management-specifications%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：《飞书开放平台独立软件服务商安全管理运营规范》](https://open.feishu.cn/document/management-practice/app-service-provider-security-management-specifications) [下一篇：稳定性与安全规范](https://open.feishu.cn/document/isv-guides/management-practice/stability-and-security-requirements)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[一、概述](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#32772788 "一、概述")

[二、定义](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#31f99a1f "二、定义")

[三、应用目录运营规范](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#-a8af908 "三、应用目录运营规范")

[1\. 基础信息](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#4091f53c "1. 基础信息")

[2\. 服务支持](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#b500eb0f "2. 服务支持")

[3\. 免费与收费模式](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#a00273ed "3. 免费与收费模式")

[4\. 应用目录运营推广](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#18cda97a "4. 应用目录运营推广")

[四、应用目录运营推广](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#8938dd76 "四、应用目录运营推广")

[1\. 服务商自运营](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#bca9e4d5 "1. 服务商自运营")

[2\. 参与官方活动](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#6920c47 "2. 参与官方活动")

[五、费用收取与结算](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#8e828ced "五、费用收取与结算")

[六、违规内容及处理办法](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#6562df71 "六、违规内容及处理办法")

[七、违规及合作处理流程](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#235daca4 "七、违规及合作处理流程")

[违规处理流程：](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#158bc654 "违规处理流程：")

[应用下架/下线流程：](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#6f16c04b "应用下架/下线流程：")

[服务商清退流程：](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#160d96d4 "服务商清退流程：")

[应用重新上架/上线流程：](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#8ab815e4 "应用重新上架/上线流程：")

[八、遵守当地法律监管](https://open.feishu.cn/document/isv-guides/management-practice/isv-management-specifications?lang=zh-CN#118b9559 "八、遵守当地法律监管")

尝试一下

意见反馈

技术支持

收起

展开