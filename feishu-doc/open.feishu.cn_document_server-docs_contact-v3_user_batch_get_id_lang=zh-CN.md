---
url: "https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN"
title: "通过手机号或邮箱获取用户 ID - 服务端 API - 开发文档 - 飞书开放平台"
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

[通讯录概述](https://open.feishu.cn/document/server-docs/contact-v3/resources)

[通讯录常见问题](https://open.feishu.cn/document/server-docs/contact-v3/faqs)

权限范围

用户

[用户资源介绍](https://open.feishu.cn/document/server-docs/contact-v3/user/field-overview)

[国家/地区 Code 参照表](https://open.feishu.cn/document/server-docs/contact-v3/user/country-code-description)

[创建用户](https://open.feishu.cn/document/server-docs/contact-v3/user/create)

[修改用户部分信息](https://open.feishu.cn/document/server-docs/contact-v3/user/patch)

[更新用户 ID](https://open.feishu.cn/document/contact-v3/user/update_user_id)

[获取单个用户信息](https://open.feishu.cn/document/server-docs/contact-v3/user/get)

[通过 ID 获取用户姓名](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/basic_batch)

[批量获取用户信息](https://open.feishu.cn/document/contact-v3/user/batch)

[获取部门直属用户列表](https://open.feishu.cn/document/server-docs/contact-v3/user/find_by_department)

[通过手机号或邮箱获取用户 ID](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id)

[搜索用户](https://open.feishu.cn/document/server-docs/contact-v3/user/search-users)

[删除用户](https://open.feishu.cn/document/server-docs/contact-v3/user/delete)

[恢复已删除用户](https://open.feishu.cn/document/server-docs/contact-v3/user/resurrect)

事件

用户组

自定义用户字段

人员类型

部门

单位

用户组成员

角色

角色成员

职级

序列

职务

工作城市

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [通讯录](https://open.feishu.cn/document/server-docs/contact-v3/resources) [用户](https://open.feishu.cn/document/server-docs/contact-v3/user/field-overview)

通过手机号或邮箱获取用户 ID

# 通过手机号或邮箱获取用户 ID

复制页面

最后更新于 2026-04-07

本文内容

[注意事项](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#355ec8c0 "注意事项")

[请求](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#request "请求")

[请求头](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#requestHeader "请求头")

[查询参数](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#queryParams "查询参数")

[请求体](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#requestBody "请求体")

[请求示例](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#requestExample "请求示例")

[响应](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#response "响应")

[响应体](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#responseBody "响应体")

[响应体示例](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#responseBodyExample "响应体示例")

[错误码](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#c98c3220 "错误码")

# 通过手机号或邮箱获取用户 ID

调用该接口通过手机号或邮箱获取一个或多个用户的 ID （包括 user\_id、open\_id、union\_id）与状态信息。

尝试一下

## 注意事项

请求后不返回用户 ID 的可能原因：

- 请求头 Authorization 传入的 tenant\_access\_token 有误。例如，tenant\_access\_token 对应的应用与实际所需应用不一致。
- 输入的手机号或者邮箱不存在。
- 应用未开通 **获取用户 user ID** API 权限。
- 应用无权限查看用户信息。你需要在应用详情页为应用配置数据权限，具体说明参见 [配置应用数据权限](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions)。
- 使用企业邮箱查询将无法返回用户 ID，必须使用用户的邮箱地址。
- 所查询的用户已离职，如果请求参数 include\_resigned 取值为 false，则不会返回离职用户 ID。

## 请求

| 基本 |  |
| --- | --- |
| HTTP URL | https://open.feishu.cn/open-apis/contact/v3/users/batch\_get\_id |
| HTTP Method | POST |
| 接口频率限制 | [1000 次/分钟、50 次/秒](https://open.feishu.cn/document/ukTMukTMukTM/uUzN04SN3QjL1cDN) |
| 支持的应用类型 | 自建应用<br>商店应用 |
| 权限要求 | 通过手机号或邮箱获取用户 ID |
| 字段权限要求 | 该接口返回体中存在下列敏感字段，仅当开启对应的权限后才会返回；如果无需获取这些字段，则不建议申请<br>获取用户受雇信息<br>获取用户 user ID<br>仅自建应用<br>以应用身份访问通讯录<br>历史版本<br>读取通讯录<br>历史版本<br>以应用身份读取通讯录<br>历史版本 |

### 请求头

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| Authorization | string | 是 | tenant\_access\_token<br>以应用身份调用 API，可读写的数据范围由应用自身的 [数据权限范围](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/configure-app-data-permissions) 决定。参考 [自建应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token_internal) 或 [商店应用获取 tenant\_access\_token](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/auth-v3/auth/tenant_access_token)。<br>**值格式**："Bearer `access_token`"<br>**示例值**："Bearer t-g1044qeGEDXTB6NDJOGV4JQCYDGHRBARFTGT1234" |
| Content-Type | string | 是 | **固定值**："application/json; charset=utf-8" |

### 查询参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| user\_id\_type | string | 否 | 用户 ID 类型<br>**示例值**："user\_id"<br>**可选值有**：<br>- `open_id`：标识一个用户在某个应用中的身份。同一个用户在不同应用中的 Open ID 不同。 [了解更多：如何获取 Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid)<br>- `union_id`：标识一个用户在某个应用开发商下的身份。同一用户在同一开发商下的应用中的 Union ID 是相同的，在不同开发商下的应用中的 Union ID 是不同的。通过 Union ID，应用开发商可以把同个用户在多个应用中的身份关联起来。 [了解更多：如何获取 Union ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-union-id)<br>- `user_id`：标识一个用户在某个租户内的身份。同一个用户在租户 A 和租户 B 内的 User ID 是不同的。在同一个租户内，一个用户的 User ID 在所有应用（包括商店应用）中都保持一致。User ID 主要用于在不同的应用间打通用户数据。 [了解更多：如何获取 User ID？](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-user-id)<br>**默认值**：`open_id`<br>**当值为 `user_id`，字段权限要求**：<br>获取用户 user ID<br>仅自建应用 |

### 请求体

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| emails | string\[\] | 否 | 要查询的用户邮箱，最多可传入 50 条。<br>**注意**：<br>- 不支持企业邮箱。<br>- emails 与 mobiles 两个参数相互独立，即每个用户邮箱会返回对应的用户信息，每个手机号也会返回对应的用户信息。<br>- 本接口返回的用户 ID 数量为 emails 数量与 mobiles 数量之和。<br>**默认值**：空<br>**示例值**：\["zhangsan@z.com"\]<br>**数据校验规则**：<br>- 最大长度：`50` |
| mobiles | string\[\] | 否 | 要查询的用户手机号，最多可传入 50 条。<br>**注意**：<br>- 非中国大陆地区的手机号需要添加以 “+” 开头的国家或地区代码。<br>- emails 与 mobiles 两个参数相互独立，即每个用户邮箱会返回对应的用户信息，每个手机号也会返回对应的用户信息。<br>- 本接口返回的用户 ID 数量为 emails 数量与 mobiles 数量之和。<br>**默认值**：空<br>**示例值**：\["13011111111"\]<br>**数据校验规则**：<br>- 最大长度：`50` |
| include\_resigned | boolean | 否 | 查询结果是否包含离职员工的用户信息。<br>**可选值有**：<br>- true：包含<br>- false：不包含<br>**示例值**：true<br>**默认值**：`false` |

### 请求示例

以下为固定的代码示例。如需根据实际场景调整请求参数，可打开 API 调试台 输入参数后生成相应的示例代码 操作指引

cURL

Go SDK

Python SDK

Java SDK

Node SDK

Php - Guzzle

C# - Restsharp

更多

1

curl-i-X POST 'https://open.feishu.cn/open-apis/contact/v3/users/batch\_get\_id?user\_id\_type=user\_id' \

**Go 请求示例**

```

import (
	"context"

	"github.com/larksuite/oapi-sdk-go/v3"
	"github.com/larksuite/oapi-sdk-go/v3/service/contact/v3"
)

func main() {
	// 创建 Client
	client := lark.NewClient("appID", "appSecret")

	// 创建请求对象
	req := larkcontact.NewBatchGetIdUserReqBuilder().
		UserIdType(`open_id`).
		Body(larkcontact.NewBatchGetIdUserReqBodyBuilder().
			Emails([]string{`zhangsan@z.com`, `lisi@a.com`}).
			Mobiles([]string{`13812345678`, `13812345679`}).
			Build()).
		Build()

	// 发起请求
	resp, err := client.Contact.User.BatchGetId(context.Background(), req)
}
```

**Java 请求示例**

```

import com.lark.oapi.Client;
import com.lark.oapi.core.request.RequestOptions;
import com.lark.oapi.service.contact.v3.model.BatchGetIdUserReq;
import com.lark.oapi.service.contact.v3.model.BatchGetIdUserReqBody;
import com.lark.oapi.service.contact.v3.model.BatchGetIdUserResp;

public class Main {

    public static void main(String arg[]) throws Exception {
        // 构建client
        Client client = Client.newBuilder("appId", "appSecret").build();

        // 创建请求对象
        BatchGetIdUserReq req = BatchGetIdUserReq.newBuilder()
                .userIdType("open_id")
                .batchGetIdUserReqBody(BatchGetIdUserReqBody.newBuilder()
                        .emails(new String[]{"zhangsan@z.com", "lisi@a.com"})
                        .mobiles(new String[]{"13812345678", "13812345679"})
                        .build())
                .build();

        // 发起请求
        BatchGetIdUserResp resp = client.contact().user().batchGetId(req, RequestOptions.newBuilder().build());
    }
}
```

## 响应

### 响应体

| 名称<br>展开子列表 | 类型 | 描述 |
| --- | --- | --- |
| code | int | 错误码，非 0 表示失败 |
| msg | string | 错误描述 |
| data | - | - |

### 响应体示例

1

2

3

4

5

6

7

8

9

10

11

12

13

14

15

16

17

18

19

20

{

"code": 0,

"msg": "success",

"data": {

"user\_list": \[{\
\
"user\_id": "ou\_979112345678741d29069abcdef01234",\
\
"email": "zhanxxxxx@a.com",\
\
"status": {\
\
"is\_frozen": false,\
\
"is\_resigned": false,\
\
"is\_activated": true,\
\
"is\_exited": false,\
\
"is\_unjoin": false\
\
        }\
\
      }, {\
\
"user\_id": "ou\_919112245678741d29069abcdef02345",\
\
"email": "lisixxxx@a.com",\
\
"status": {\
\
"is\_frozen": false,\
\
"is\_resigned": false,\
\
## 错误码\
\
更多错误码信息，参见 [通用错误码](https://open.feishu.cn/document/ukTMukTMukTM/ugjM14COyUjL4ITN)。\
\
[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fcontact-v3%2Fuser%2Fbatch_get_id%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错\
\
相关问题\
\
[为什么调用通过手机号或邮箱获取用户 ID 接口不返回用户 ID？](https://open.feishu.cn/document/server-docs/contact-v3/faqs#428d940c)\
\
[user\_id 是否可以更新？](https://open.feishu.cn/document/server-docs/contact-v3/faqs#d19724bd)\
\
[被删除的用户的 user\_id 会被后续新增的用户占用吗？](https://open.feishu.cn/document/server-docs/contact-v3/faqs#52c05ad2)\
\
[如何使用创建用户接口中的 enterprise\_email 字段？](https://open.feishu.cn/document/server-docs/contact-v3/faqs#111cfa5a)\
\
[新增用户接口返回 email and mobile account conflict 是什么原因？](https://open.feishu.cn/document/server-docs/contact-v3/faqs#9a5c9ca2)\
\
遇到其他问题？问问 开放平台智能助手\
\
[上一篇：获取部门直属用户列表](https://open.feishu.cn/document/server-docs/contact-v3/user/find_by_department) [下一篇：搜索用户](https://open.feishu.cn/document/server-docs/contact-v3/user/search-users)\
\
请先登录后再进行调试\
\
登录\
\
API 调试台\
\
示例代码\
\
更多\
\
请求头\
\
Authorization\
\
\*\
\
Bearer\
\
tenant\_access\_token\
\
获取 Token\
\
查询参数\
\
user\_id\_type\
\
open\_id\
\
请求体\
\
只看必填参数\
\
恢复示例值\
\
格式化 JSON\
\
JSON\
\
更多\
\
1\
\
调试结果\
\
![](https://lf-package-cn.feishucdn.com/obj/feishu-static/lark/open/doc/frontend/images/31dafaca1b39955beda5239fff26f1eb.svg)\
\
点击“开始调试”查看结果\
\
已将 API 调试台的参数填入下方的示例代码中\
\
cURL\
\
Go SDK\
\
Python SDK\
\
Java SDK\
\
Node SDK\
\
更多\
\
1\
\
开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&apiName=batch_get_id&project=contact&resource=user&version=v3)\
\
本文内容\
\
[注意事项](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#355ec8c0 "注意事项")\
\
[请求](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#request "请求")\
\
[请求头](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#requestHeader "请求头")\
\
[查询参数](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#queryParams "查询参数")\
\
[请求体](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#requestBody "请求体")\
\
[请求示例](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#requestExample "请求示例")\
\
[响应](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#response "响应")\
\
[响应体](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#responseBody "响应体")\
\
[响应体示例](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#responseBodyExample "响应体示例")\
\
[错误码](https://open.feishu.cn/document/server-docs/contact-v3/user/batch_get_id?lang=zh-CN#c98c3220 "错误码")\
\
尝试一下\
\
意见反馈\
\
技术支持\
\
收起\
\
展开