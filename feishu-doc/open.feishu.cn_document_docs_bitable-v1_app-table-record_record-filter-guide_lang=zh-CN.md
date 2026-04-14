---
url: "https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide?lang=zh-CN"
title: "记录筛选参数填写说明 - 服务端 API - 开发文档 - 飞书开放平台"
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

文档

电子表格

多维表格

[多维表格概述](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview)

[多维表格常见问题](https://open.feishu.cn/document/docs/bitable-v1/faq)

[数据结构概述](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-structure)

多维表格

数据表

视图

记录

[多维表格记录数据结构](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/bitable-record-data-structure-overview)

[记录筛选参数填写说明](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide)

[多维表格中添加子记录](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/add-a-sub-record-in-a-base-table)

[新增记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/create)

[更新记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/update)

[查询记录](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/search)

[删除记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/delete)

[新增多条记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_create)

[更新多条记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_update)

[批量获取记录](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/batch_get)

[删除多条记录](https://open.feishu.cn/document/server-docs/docs/bitable-v1/app-table-record/batch_delete)

字段

字段编组

仪表盘

表单

高级权限

自动化流程

工作流

事件

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [云文档](https://open.feishu.cn/document/server-docs/docs/docs-overview) [多维表格](https://open.feishu.cn/document/server-docs/docs/bitable-v1/bitable-overview) [记录](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/bitable-record-data-structure-overview)

记录筛选参数填写说明

# 记录筛选参数填写说明

复制页面

最后更新于 2025-11-19

本文内容

[筛选参数结构说明](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide?lang=zh-CN#39ad0fb2 "筛选参数结构说明")

[filter 使用示例](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide?lang=zh-CN#6079ff07 "filter 使用示例")

[字段目标值（value）填写说明](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide?lang=zh-CN#3e0fd644 "字段目标值（value）填写说明")

[日期字段填写说明](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide?lang=zh-CN#29d9dc89 "日期字段填写说明")

# 记录筛选参数填写说明

在多维表格部分接口中，可以通过请求参数 `filter` 等设置筛选条件，筛选出你需要的记录。本文档介绍如何填写筛选参数。

## 筛选参数结构说明

筛选参数的描述和结构如下所示。

| 参数名称 | 数据类型 | 描述 |
| --- | --- | --- |
| filter | filter\_info | 包含条件筛选信息的对象。 |
| └ conjunction | string | 表示条件之间的逻辑连接词，可以是 "and" 或 "or"。 |
| └ conditions | condition\[\] | 筛选条件集合。 |
| └ └ field\_name | string | 条件字段的名称。 |
| └ └ operator | string | 条件运算符。其可选值有：<br>- is：等于<br>- isNot：不等于（不支持日期字段）<br>- contains：包含（不支持日期字段）<br>- doesNotContain：不包含（不支持日期字段）<br>- isEmpty：为空<br>- isNotEmpty：不为空<br>- isGreater：大于<br>- isGreaterEqual：大于等于（不支持日期字段）<br>- isLess：小于<br>- isLessEqual：小于等于（不支持日期字段）<br>- like：LIKE 运算符。暂未支持<br>- in：IN 运算符。暂未支持 |
| └ └ value | string\[\] | 条件的值，可以是单个值或多个值的数组。不同字段类型和不同的 operator 可填的值不同。详情参考下文字段目标值（value）填写说明。 |

`filter` 的数据结构如下所示：

```

{
  "filter": {
    "conjunction": "and",
    "conditions": [\
      {\
        "field_name": "字段1",\
        "operator": "is",\
        "value": [\
          "文本内容"\
        ]\
      }\
    ]
  }
}
```

## filter 使用示例

如下为一个员工销售额表。本小节根据该表格提供使用 `filter` 参数示例。

| 员工名称 | 职位 | 销售额 |
| --- | --- | --- |
| 张小一 | 初级销售员 | 10000.0 |
| 张小二 | 初级销售员 | 15000.0 |
| 张小三 | 初级销售员 | 20000.0 |
| 张小四 | 高级销售员 | 30000.0 |
| 张小五 | 高级销售员 | 50000.0 |
| 张小六 | 销售经理 | 100000.0 |

- 要筛选出职位为"初级销售员"， **且** 销售额大于 10000 的记录，filter 参数示例如下所示：


```

{
    "filter": {
      "conjunction": "and",
      "conditions": [\
        {\
          "field_name": "职位",\
          "operator": "is",\
          "value": [\
            "初级销售员"\
          ]\
        },\
        {\
          "field_name": "销售额",\
          "operator": "isGreater",\
          "value": [\
            "10000.0"\
          ]\
        }\
      ]
    }
}
```

- 要筛选职位为"高级销售员"，或者销售额大于 20000 的记录，filter 参数示例如下所示：


```

{
    "filter": {
      "conjunction": "or",
      "conditions": [\
        {\
          "field_name": "职位",\
          "operator": "is",\
          "value": [\
            "高级销售员"\
          ]\
        },\
        {\
          "field_name": "销售额",\
          "operator": "isGreater",\
          "value": [\
            "20000.0"\
          ]\
        }\
      ]
    }
}
```

- 要筛选出职位为"初级销售员" **或**“高级销售员”， **且** 销售额为 10000 **或** 20000 的记录，filter 参数示例如下所示：


如下示例，目前仅支持使用一层 children 参数，不支持再次嵌套使用。

```

{
  "filter": {
    "conjunction": "and",
    "children": [\
      {\
        "conjunction": "or",\
        "conditions": [\
          {\
            "field_name": "职位",\
            "operator": "is",\
            "value": [\
              "高级销售员"\
            ]\
          },\
          {\
            "field_name": "职位",\
            "operator": "is",\
            "value": [\
              "初级销售员"\
            ]\
          }\
        ]\
      },\
      {\
        "conjunction": "or",\
        "conditions": [\
          {\
            "field_name": "销售额",\
            "operator": "is",\
            "value": [\
              "10000.0"\
            ]\
          },\
          {\
            "field_name": "销售额",\
            "operator": "is",\
            "value": [\
              "20000.0"\
            ]\
          }\
        ]\
      }\
    ]
  }
}
```

## 字段目标值（value）填写说明

多维表格支持以下类型的字段作为筛选条件。目前暂不支持公式或查找引用的字段类型作为筛选条件。

当 value 填空值 \[\] 时，请确保按照 `"value":[]` 格式传入 value，否则将报缺失 value 值的错误。

| 字段类型 | 目标值示例 | 描述 | 限制 |
| --- | --- | --- | --- |
| 多行文本 | `["文本内容"]` | 填写对应的文本内容 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]` |
| 条码 | `["条码内容"]` | 填写对应的条码内容 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]` |
| 数字 | `["23.4"]` | 填写对应数字的字符串形式 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]` |
| 货币 | `["23.4"]` | 填写对应数字的字符串形式 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]` |
| 进度 | `["0.34"]` | 填写对应数字的字符串形式 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]` |
| 评分 | `["1"]` | 填写对应数字的字符串形式 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]` |
| 单选 | `["a","b"]` | 列表中填写选项内容 | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素 |
| 多选 | `["a","b"]` | 包含多个选项名字符串的数组 | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素 |
| 日期 | `["ExactDate","1702449755000"]` | Unix 时间戳，单位是毫秒 | 列表中可能存在多个元素，具体参考下文 **日期字段填写说明** |
| 复选框 | `["true"]` 或 `["false"]` | 元素填写对应的布尔内容 | 列表只能有一个元素，operator 仅支持 `is` |
| 人员 | `["ou_9a971ded01b4ca66f4798549878abcef"]` | 填写对应的用户 ID。用户 ID 类型需与 [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 中 `user_id_type`参数指定的类型一致，默认类型为 open\_id | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素 |
| 电话号码 | `["131xxxx6666"]` | 填写对应的电话号码 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]` |
| 超链接 | `["链接显示名称"]` | 填写对应的超链接名称 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]` |
| 附件 | `[]` | 仅支持`isEmpty`或`isNotEmpty` | 需填空值 `[]` |
| 单向关联 | `["recnVYsuqV"]` | 填写对应的记录 ID | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素 |
| 双向关联 | `["recnVYsuqV"]` | 填写对应的记录 ID | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素 |
| 地理位置 | `["天安门广场，北京市东城区东长安街"]` | 填写对应的地址 | 列表只能有一个元素或零个元素，operator为`isEmpty`或`isNotEmpty`填空值\[\] |
| 群组 | `["oc_cd07f55f14d6f4a4f1b51504e7e97f48"]` | 填写对应的群组 ID | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素 |
| 创建时间 | `["ExactDate","1702449755000"]` | Unix 时间戳，单位是毫秒 | 列表中可能存在多个元素，具体参考下文 **日期字段填写说明** |
| 最后更新时间 | `["ExactDate","1702449755000"]` | Unix 时间戳，单位是毫秒 | 列表中可能存在多个元素，具体参考下文 **日期字段填写说明** |
| 创建人 | `["ou_9a971ded01b4ca66f4798549878abcef"]` | 填写对应的用户 ID。用户 ID 类型需与 [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 中 `user_id_type`参数指定的类型一致，默认类型为 open\_id | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素 |
| 修改人 | `["ou_9a971ded01b4ca66f4798549878abcef"]` | 填写对应的用户 ID。用户 ID 类型需与 [查询记录](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/search) 中 `user_id_type`参数指定的类型一致，默认类型为 open\_id | 列表中可能存在多个元素：<br>- operator 为 `is` 或`isNot` 需填写一个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]`<br>- 其他 operator 可填写多个元素 |
| 自动编号 | `["1"]` | 填写对应的自动编号值 | - 列表只能有一个元素或零个元素<br>- operator为`isEmpty`或`isNotEmpty`时，需填空值 `[]` |

## 日期字段填写说明

日期筛选时，operator 仅支持 `is`、`isEmpty`、`isNotEmpty`、`isGreater`、`isLess` 五个值。

当 operator 为 `isEmpty`或`isNotEmpty` 时，value 需填空值 `"value":[]`。

当 operator 为 `is`、`isGreater` 或 `isLess` 时，参考下表填写日期字段。

| value 元素可选值 | 描述 | value 目标值示例 | 注意事项 |
| --- | --- | --- | --- |
| `ExactDate` | 具体日期 | `["ExactDate","1702449755000"]` | - 需要填写 2 个元素。第二个元素需要填写具体日期的时间戳。<br>  <br>- 第二个元素虽然是时间戳，但是实际筛选时，会被转为文档时区当天的零点。 |
| `Today` | 今天 | `["Today"]` | 需要填写 1 个元素 |
| `Tomorrow` | 明天 | `["Tomorrow"]` | 需要填写 1 个元素 |
| `Yesterday` | 昨天 | `["Yesterday"]` | 需要填写 1 个元素 |
| `CurrentWeek` | 本周 | `["CurrentWeek"]` | - 需要填写 1 个元素<br>- operator 仅支持 `is` |
| `LastWeek` | 上周 | `["LastWeek"]` | - 需要填写 1 个元素<br>- operator 仅支持 `is` |
| `CurrentMonth` | 本月 | `["CurrentMonth"]` | - 需要填写 1 个元素<br>- operator 仅支持 `is` |
| `LastMonth` | 上个月 | `["LastMonth"]` | - 需要填写 1 个元素<br>- operator 仅支持 `is` |
| `TheLastWeek` | 过去七天内 | `["TheLastWeek"]` | - 需要填写 1 个元素<br>- operator 仅支持 `is` |
| `TheNextWeek` | 未来七天内 | `["TheNextWeek"]` | - 需要填写 1 个元素<br>- operator 仅支持 `is` |
| `TheLastMonth` | 过去三十天内 | `["TheLastMonth"]` | - 需要填写 1 个元素<br>- operator 仅支持 `is` |
| `TheNextMonth` | 未来三十天内 | `["TheNextMonth"]` | - 需要填写 1 个元素<br>- operator 仅支持 `is` |

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fdocs%2Fbitable-v1%2Fapp-table-record%2Frecord-filter-guide%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

相关问题

[如何为应用开通多维表格权限？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-add-permissions-to-app?lang=zh-CN#223459af)

[如何在多维表格中新增带有附件的记录？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=zh-CN#-9713c8d)

[多维表格中的筛选参数 filter 怎么填写？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table-record/record-filter-guide)

[如何下载多维表格记录中的附件？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=zh-CN#0780e12f)

[如何筛选人员字段？](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/faq?lang=zh-CN#b91b2c7)

遇到其他问题？问问 开放平台智能助手

[上一篇：多维表格记录数据结构](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/bitable-record-data-structure-overview) [下一篇：多维表格中添加子记录](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/add-a-sub-record-in-a-base-table)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[筛选参数结构说明](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide?lang=zh-CN#39ad0fb2 "筛选参数结构说明")

[filter 使用示例](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide?lang=zh-CN#6079ff07 "filter 使用示例")

[字段目标值（value）填写说明](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide?lang=zh-CN#3e0fd644 "字段目标值（value）填写说明")

[日期字段填写说明](https://open.feishu.cn/document/docs/bitable-v1/app-table-record/record-filter-guide?lang=zh-CN#29d9dc89 "日期字段填写说明")

尝试一下

意见反馈

技术支持

收起

展开