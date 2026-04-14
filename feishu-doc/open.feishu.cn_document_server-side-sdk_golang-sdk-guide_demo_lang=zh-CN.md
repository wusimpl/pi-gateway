---
url: "https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN"
title: "场景示例 - 服务端 API - 开发文档 - 飞书开放平台"
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

Golang SDK 指南

[开发前准备](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/preparations)

[调用服务端 API](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/calling-server-side-apis)

[处理事件](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/handle-events)

[处理回调](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/handle-callback)

[场景示例](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo)

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

[服务端 API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [服务端 SDK](https://open.feishu.cn/document/server-docs/server-side-sdk) [Golang SDK 指南](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/preparations)

场景示例

# 场景示例

复制页面

最后更新于 2024-12-01

本文内容

[发送文件消息](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#8cee5e83 "发送文件消息")

[发送图片消息](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#7a2bff81 "发送图片消息")

[获取部门下所有用户列表](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#8eadedf0 "获取部门下所有用户列表")

[创建多维表格同时添加数据表](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#2c4e99dd "创建多维表格同时添加数据表")

[复制粘贴某个范围的单元格数据](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#4ddc19f5 "复制粘贴某个范围的单元格数据")

[下载指定范围单元格的所有素材列表](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#565565a1 "下载指定范围单元格的所有素材列表")

# 场景示例

飞书开放平台基于 SDK，封装了常用的 API 组合调用及业务场景示例供你参考。在 [oapi-sdk-go-demo](https://github.com/larksuite/oapi-sdk-go-demo) 中包含了以下多种场景示例代码。

## [发送文件消息](https://github.com/larksuite/oapi-sdk-go-demo/blob/main/composite_api/im/send_file.go)

发送文件消息，使用到两个OpenAPI： [上传文件](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create) 和 [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)。

```

package im

import (
        "context"
        "encoding/json"
        "fmt"
        "io"

        "github.com/larksuite/oapi-sdk-go/v3"
        larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
        "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
)

type SendFileRequest struct {
        FileType      string
        FileName      string
        File          io.Reader
        Duration      int
        ReceiveIdType string
        ReceiveId     string
        Uuid          string
}

type SendFileResponse struct {
        *larkcore.CodeError
        CreateFileResponse    *larkim.CreateFileRespData
        CreateMessageResponse *larkim.CreateMessageRespData
}

// SendFile 发送文件消息
func SendFile(client *lark.Client, request *SendFileRequest) (*SendFileResponse, error) {
        // 上传文件
        createFileReq := larkim.NewCreateFileReqBuilder().
                Body(larkim.NewCreateFileReqBodyBuilder().
                        FileType(request.FileType).
                        FileName(request.FileName).
                        Duration(request.Duration).
                        File(request.File).
                        Build()).
                Build()
        createFileResp, err := client.Im.File.Create(context.Background(), createFileReq)
        if err != nil {
                return nil, err
        }
        if !createFileResp.Success() {
                fmt.Printf("client.Im.File.Create failed, code: %d, msg: %s, log_id: %s\n",
                        createFileResp.Code, createFileResp.Msg, createFileResp.RequestId())
                return nil, createFileResp.CodeError
        }

        // 发送消息
        bs, err := json.Marshal(createFileResp.Data)
        if err != nil {
                return nil, err
        }
        createMessageReq := larkim.NewCreateMessageReqBuilder().
                ReceiveIdType(request.ReceiveIdType).
                Body(larkim.NewCreateMessageReqBodyBuilder().
                        ReceiveId(request.ReceiveId).
                        MsgType("file").
                        Content(string(bs)).
                        Uuid(request.Uuid).
                        Build()).
                Build()

        createMessageResp, err := client.Im.Message.Create(context.Background(), createMessageReq)
        if err != nil {
                return nil, err
        }
        if !createMessageResp.Success() {
                fmt.Printf("client.Im.Message.Create failed, code: %d, msg: %s, log_id: %s\n",
                        createMessageResp.Code, createMessageResp.Msg, createMessageResp.RequestId())
                return nil, createMessageResp.CodeError
        }

        // 返回结果
        return &SendFileResponse{
                CodeError: &larkcore.CodeError{
                        Code: 0,
                        Msg:  "success",
                },
                CreateFileResponse:    createFileResp.Data,
                CreateMessageResponse: createMessageResp.Data,
        }, nil
}
```

## [发送图片消息](https://github.com/larksuite/oapi-sdk-go-demo/blob/main/composite_api/im/send_image.go)

发送图片消息，使用到两个OpenAPI： [上传图片](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create) 和 [发送消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create)。

```

package im

import (
        "context"
        "encoding/json"
        "fmt"
        "io"

        "github.com/larksuite/oapi-sdk-go/v3"
        larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
        "github.com/larksuite/oapi-sdk-go/v3/service/im/v1"
)

type SendImageRequest struct {
        Image         io.Reader
        ReceiveIdType string
        ReceiveId     string
        Uuid          string
}

type SendImageResponse struct {
        *larkcore.CodeError
        CreateImageResponse   *larkim.CreateImageRespData
        CreateMessageResponse *larkim.CreateMessageRespData
}

// SendImage 发送图片消息
func SendImage(client *lark.Client, request *SendImageRequest) (*SendImageResponse, error) {
        // 上传图片
        createImageReq := larkim.NewCreateImageReqBuilder().
                Body(larkim.NewCreateImageReqBodyBuilder().
                        ImageType("message").
                        Image(request.Image).
                        Build()).
                Build()
        createImageResp, err := client.Im.Image.Create(context.Background(), createImageReq)
        if err != nil {
                return nil, err
        }
        if !createImageResp.Success() {
                fmt.Printf("client.Im.Image.Create failed, code: %d, msg: %s, log_id: %s\n",
                        createImageResp.Code, createImageResp.Msg, createImageResp.RequestId())
                return nil, createImageResp.CodeError
        }

        // 发送消息
        bs, err := json.Marshal(createImageResp.Data)
        if err != nil {
                return nil, err
        }
        createMessageReq := larkim.NewCreateMessageReqBuilder().
                ReceiveIdType(request.ReceiveIdType).
                Body(larkim.NewCreateMessageReqBodyBuilder().
                        ReceiveId(request.ReceiveId).
                        MsgType("image").
                        Content(string(bs)).
                        Uuid(request.Uuid).
                        Build()).
                Build()

        createMessageResp, err := client.Im.Message.Create(context.Background(), createMessageReq)
        if err != nil {
                return nil, err
        }
        if !createMessageResp.Success() {
                fmt.Printf("client.Im.Message.Create failed, code: %d, msg: %s, log_id: %s\n",
                        createMessageResp.Code, createMessageResp.Msg, createMessageResp.RequestId())
                return nil, createMessageResp.CodeError
        }

        // 返回结果
        return &SendImageResponse{
                CodeError: &larkcore.CodeError{
                        Code: 0,
                        Msg:  "success",
                },
                CreateImageResponse:   createImageResp.Data,
                CreateMessageResponse: createMessageResp.Data,
        }, nil
}
```

## [获取部门下所有用户列表](https://github.com/larksuite/oapi-sdk-go-demo/blob/main/composite_api/contact/list_user_by_department.go)

获取部门下所有用户列表，使用到两个OpenAPI： [获取子部门列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/department/children) 和 [获取部门直属用户列表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/contact-v3/user/find_by_department)。

```

package contact

import (
        "context"
        "fmt"

        lark "github.com/larksuite/oapi-sdk-go/v3"
        larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
        larkcontact "github.com/larksuite/oapi-sdk-go/v3/service/contact/v3"
)

type ListUserByDepartmentRequest struct {
        DepartmentId string
}

type ListUserByDepartmentResponse struct {
        *larkcore.CodeError
        ChildrenDepartmentResponse   *larkcontact.ChildrenDepartmentRespData
        FindByDepartmentUserResponse []*larkcontact.User
}

// ListUserByDepartment 获取部门下所有用户列表
func ListUserByDepartment(client *lark.Client, request *ListUserByDepartmentRequest) (*ListUserByDepartmentResponse, error) {
        // 获取子部门列表
        childrenDepartmentReq := larkcontact.NewChildrenDepartmentReqBuilder().
                DepartmentIdType("open_department_id").
                DepartmentId(request.DepartmentId).
                Build()

        childrenDepartmentResp, err := client.Contact.Department.Children(context.Background(), childrenDepartmentReq)

        if err != nil {
                return nil, err
        }
        if !childrenDepartmentResp.Success() {
                fmt.Printf("client.Contact.Department.Children failed, code: %d, msg: %s, log_id: %s\n",
                        childrenDepartmentResp.Code, childrenDepartmentResp.Msg, childrenDepartmentResp.RequestId())
                return nil, childrenDepartmentResp.CodeError
        }

        // 获取部门直属用户列表
        users := make([]*larkcontact.User, 0)
        openDepartmentIds := []string{request.DepartmentId}
        for _, item := range childrenDepartmentResp.Data.Items {
                openDepartmentIds = append(openDepartmentIds, *item.OpenDepartmentId)
        }

        for _, id := range openDepartmentIds {
                findByDepartmentUserReq := larkcontact.NewFindByDepartmentUserReqBuilder().
                        DepartmentId(id).
                        Build()

                findByDepartmentUserResp, err := client.Contact.User.FindByDepartment(context.Background(), findByDepartmentUserReq)

                if err != nil {
                        return nil, err
                }
                if !findByDepartmentUserResp.Success() {
                        fmt.Printf("client.Contact.User.FindByDepartment failed, code: %d, msg: %s, log_id: %s\n",
                                findByDepartmentUserResp.Code, findByDepartmentUserResp.Msg, findByDepartmentUserResp.RequestId())
                        return nil, findByDepartmentUserResp.CodeError
                }

                users = append(users, findByDepartmentUserResp.Data.Items...)
        }

        // 返回结果
        return &ListUserByDepartmentResponse{
                CodeError: &larkcore.CodeError{
                        Code: 0,
                        Msg:  "success",
                },
                ChildrenDepartmentResponse:   childrenDepartmentResp.Data,
                FindByDepartmentUserResponse: users,
        }, nil
}
```

## [创建多维表格同时添加数据表](https://github.com/larksuite/oapi-sdk-go-demo/blob/main/composite_api/base/create_app_and_tables.go)

创建多维表格同时添加数据表，使用到两个 OpenAPI： [创建多维表格](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app/create) 和 [新增一个数据表](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/bitable-v1/app-table/create)：

```

package base

import (
        "context"
        "fmt"

        lark "github.com/larksuite/oapi-sdk-go/v3"
        larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
        larkbitable "github.com/larksuite/oapi-sdk-go/v3/service/bitable/v1"
)

type CreateAppAndTablesRequest struct {
        Name        string
        FolderToken string
        Tables      []*larkbitable.ReqTable
}

type CreateAppAndTablesResponse struct {
        *larkcore.CodeError
        CreateAppResponse       *larkbitable.CreateAppRespData
        CreateAppTablesResponse []*larkbitable.CreateAppTableRespData
}

// CreateAppAndTables 创建多维表格同时添加数据表
func CreateAppAndTables(client *lark.Client, request *CreateAppAndTablesRequest) (*CreateAppAndTablesResponse, error) {
        // 创建多维表格
        createAppReq := larkbitable.NewCreateAppReqBuilder().
                ReqApp(larkbitable.NewReqAppBuilder().
                        Name(request.Name).
                        FolderToken(request.FolderToken).
                        Build()).
                Build()

        createAppResp, err := client.Bitable.App.Create(context.Background(), createAppReq)
        if err != nil {
                return nil, err
        }
        if !createAppResp.Success() {
                fmt.Printf("client.Bitable.App.Create failed, code: %d, msg: %s, log_id: %s\n",
                        createAppResp.Code, createAppResp.Msg, createAppResp.RequestId())
                return nil, createAppResp.CodeError
        }

        // 添加数据表
        tables := make([]*larkbitable.CreateAppTableRespData, 0)
        for _, table := range request.Tables {
                req := larkbitable.NewCreateAppTableReqBuilder().
                        AppToken(*createAppResp.Data.App.AppToken).
                        Body(larkbitable.NewCreateAppTableReqBodyBuilder().
                                Table(table).
                                Build()).
                        Build()

                createAppTableResp, err := client.Bitable.AppTable.Create(context.Background(), req)
                if err != nil {
                        return nil, err
                }
                if !createAppTableResp.Success() {
                        fmt.Printf("client.Bitable.AppTable.Create failed, code: %d, msg: %s, log_id: %s\n",
                                createAppTableResp.Code, createAppTableResp.Msg, createAppTableResp.RequestId())
                        return nil, createAppTableResp.CodeError
                }

                tables = append(tables, createAppTableResp.Data)
        }

        // 返回结果
        return &CreateAppAndTablesResponse{
                CodeError: &larkcore.CodeError{
                        Code: 0,
                        Msg:  "success",
                },
                CreateAppResponse:       createAppResp.Data,
                CreateAppTablesResponse: tables,
        }, nil
}
```

## [复制粘贴某个范围的单元格数据](https://github.com/larksuite/oapi-sdk-go-demo/blob/main/composite_api/sheets/copy_and_paste_by_range.go)

复制粘贴某个范围的单元格数据，使用到两个OpenAPI： [读取单个范围](https://open.feishu.cn/document/ukTMukTMukTM/ugTMzUjL4EzM14COxMTN) 和 [向单个范围写入数据](https://open.feishu.cn/document/ukTMukTMukTM/uAjMzUjLwIzM14CMyMTN)。

```

package sheets

import (
        "context"
        "encoding/json"
        "fmt"
        "net/http"

        lark "github.com/larksuite/oapi-sdk-go/v3"
        larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
)

type CopyAndPasteByRangeRequest struct {
        SpreadsheetToken string
        SrcRange         string
        DstRange         string
}

type CopyAndPasteRangeResponse struct {
        *larkcore.CodeError
        ReadResponse  *SpreadsheetRespData
        WriteResponse *SpreadsheetRespData
}

// CopyAndPasteRange 复制粘贴某个范围的单元格数据
func CopyAndPasteRange(client *lark.Client, request *CopyAndPasteByRangeRequest) (*CopyAndPasteRangeResponse, error) {
        // 读取单个范围
        readResp, err := client.Do(context.Background(), &larkcore.ApiReq{
                HttpMethod:                http.MethodGet,
                ApiPath:                   fmt.Sprintf("/open-apis/sheets/v2/spreadsheets/%s/values/%s", request.SpreadsheetToken, request.SrcRange),
                SupportedAccessTokenTypes: []larkcore.AccessTokenType{larkcore.AccessTokenTypeTenant},
        })
        if err != nil {
                return nil, err
        }

        readSpreadsheetResp := &SpreadsheetResp{}
        err = json.Unmarshal(readResp.RawBody, readSpreadsheetResp)
        if err != nil {
                return nil, err
        }
        readSpreadsheetResp.ApiResp = readResp
        if readSpreadsheetResp.Code != 0 {
                fmt.Printf("read spreadsheet failed, code: %d, msg: %s, log_id: %s\n",
                        readSpreadsheetResp.Code, readSpreadsheetResp.Msg, readSpreadsheetResp.RequestId())
                return nil, readSpreadsheetResp.CodeError
        }

        // 向单个范围写入数据
        valueRange := map[string]interface{}{}
        valueRange["range"] = request.DstRange
        valueRange["values"] = readSpreadsheetResp.Data.ValueRange.Values
        body := map[string]interface{}{}
        body["valueRange"] = valueRange

        writeResp, err := client.Do(context.Background(), &larkcore.ApiReq{
                HttpMethod:                http.MethodPut,
                ApiPath:                   fmt.Sprintf("/open-apis/sheets/v2/spreadsheets/%s/values", request.SpreadsheetToken),
                Body:                      body,
                SupportedAccessTokenTypes: []larkcore.AccessTokenType{larkcore.AccessTokenTypeTenant},
        })
        if err != nil {
                return nil, err
        }

        writeSpreadsheetResp := &SpreadsheetResp{}
        err = json.Unmarshal(writeResp.RawBody, writeSpreadsheetResp)
        if err != nil {
                return nil, err
        }
        writeSpreadsheetResp.ApiResp = writeResp
        if writeSpreadsheetResp.Code != 0 {
                fmt.Printf("write spreadsheet failed, code: %d, msg: %s, log_id: %s\n",
                        writeSpreadsheetResp.Code, writeSpreadsheetResp.Msg, writeSpreadsheetResp.RequestId())
                return nil, writeSpreadsheetResp.CodeError
        }

        // 返回结果
        return &CopyAndPasteRangeResponse{
                CodeError: &larkcore.CodeError{
                        Code: 0,
                        Msg:  "success",
                },
                ReadResponse:  readSpreadsheetResp.Data,
                WriteResponse: writeSpreadsheetResp.Data,
        }, nil
}
```

## [下载指定范围单元格的所有素材列表](https://github.com/larksuite/oapi-sdk-go-demo/blob/main/composite_api/sheets/download_media_by_range.go)

下载指定范围单元格的所有素材列表，使用到两个OpenAPI： [读取单个范围](https://open.feishu.cn/document/ukTMukTMukTM/ugTMzUjL4EzM14COxMTN) 和 [下载素材](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/drive-v1/media/download)：

```

package sheets

import (
        "context"
        "encoding/json"
        "fmt"
        "net/http"
        "reflect"

        lark "github.com/larksuite/oapi-sdk-go/v3"
        larkcore "github.com/larksuite/oapi-sdk-go/v3/core"
        larkdrive "github.com/larksuite/oapi-sdk-go/v3/service/drive/v1"
)

type DownloadMediaByRangeRequest struct {
        SpreadsheetToken string
        Range            string
}

type DownloadMediaByRangeResponse struct {
        *larkcore.CodeError
        ReadResponse          *SpreadsheetRespData
        DownloadMediaResponse []*larkdrive.DownloadMediaResp
}

func DownloadMediaByRange(client *lark.Client, request *DownloadMediaByRangeRequest) (*DownloadMediaByRangeResponse, error) {
        // 读取单个范围
        readResp, err := client.Do(context.Background(), &larkcore.ApiReq{
                HttpMethod:                http.MethodGet,
                ApiPath:                   fmt.Sprintf("/open-apis/sheets/v2/spreadsheets/%s/values/%s", request.SpreadsheetToken, request.Range),
                SupportedAccessTokenTypes: []larkcore.AccessTokenType{larkcore.AccessTokenTypeTenant},
        })
        if err != nil {
                return nil, err
        }

        readSpreadsheetResp := &SpreadsheetResp{}
        err = json.Unmarshal(readResp.RawBody, readSpreadsheetResp)
        if err != nil {
                return nil, err
        }
        readSpreadsheetResp.ApiResp = readResp
        if readSpreadsheetResp.Code != 0 {
                fmt.Printf("read spreadsheet failed, code: %d, msg: %s, log_id: %s\n",
                        readSpreadsheetResp.Code, readSpreadsheetResp.Msg, readSpreadsheetResp.RequestId())
                return nil, readSpreadsheetResp.CodeError
        }

        // 下载文件
        files := make([]*larkdrive.DownloadMediaResp, 0)
        values := readSpreadsheetResp.Data.ValueRange.Values
        tokens := parseFileToken(values, make(map[string]bool))
        for _, token := range tokens {
                downloadMediaReq := larkdrive.NewDownloadMediaReqBuilder().
                        FileToken(token).
                        Build()

                downloadMediaResp, err := client.Drive.Media.Download(context.Background(), downloadMediaReq)
                if err != nil {
                        return nil, err
                }
                if !downloadMediaResp.Success() {
                        fmt.Printf("client.Drive.Media.Download failed, code: %d, msg: %s, log_id: %s\n",
                                downloadMediaResp.Code, downloadMediaResp.Msg, downloadMediaResp.RequestId())
                        return nil, downloadMediaResp.CodeError
                }

                files = append(files, downloadMediaResp)
        }

        // 返回结果
        return &DownloadMediaByRangeResponse{
                CodeError: &larkcore.CodeError{
                        Code: 0,
                        Msg:  "success",
                },
                ReadResponse:          readSpreadsheetResp.Data,
                DownloadMediaResponse: files,
        }, nil
}

func parseFileToken(values []interface{}, tokens map[string]bool) []string {
        if len(values) == 0 {
                res := make([]string, 0, len(tokens))
                for k := range tokens {
                        res = append(res, k)
                }
                return res
        }
        for _, i := range values {
                kind := reflect.TypeOf(i).Kind()
                if kind == reflect.Slice {
                        parseFileToken(i.([]interface{}), tokens)
                } else if kind == reflect.Map {
                        m := i.(map[string]interface{})
                        if val, ok := m["fileToken"]; ok {
                                tokens[val.(string)] = true
                        }
                }
        }

        res := make([]string, 0, len(tokens))
        for k := range tokens {
                res = append(res, k)
        }
        return res
}
```

[智能解释](https://open.feishu.cn/app/ai/playground?query=%E5%9F%BA%E4%BA%8E%E8%BF%99%E7%AF%87%E6%96%87%E6%A1%A3%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-side-sdk%2Fgolang-sdk-guide%2Fdemo%EF%BC%8C%E8%A7%A3%E9%87%8A%E4%B8%80%E4%B8%8B%20%E2%80%9C%E2%80%9D%20%E6%98%AF%E4%BB%80%E4%B9%88%E6%84%8F%E6%80%9D&from=doc_text_select) 文档纠错

遇到问题需要帮助？问问 开放平台智能助手

[上一篇：处理回调](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/handle-callback) [下一篇：开发前准备](https://open.feishu.cn/document/server-side-sdk/python--sdk/preparations-before-development)

请先登录后再进行调试

登录

开始调试 [前往 API 调试台](https://open.feishu.cn/api-explorer?from=op_doc&)

本文内容

[发送文件消息](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#8cee5e83 "发送文件消息")

[发送图片消息](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#7a2bff81 "发送图片消息")

[获取部门下所有用户列表](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#8eadedf0 "获取部门下所有用户列表")

[创建多维表格同时添加数据表](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#2c4e99dd "创建多维表格同时添加数据表")

[复制粘贴某个范围的单元格数据](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#4ddc19f5 "复制粘贴某个范围的单元格数据")

[下载指定范围单元格的所有素材列表](https://open.feishu.cn/document/server-side-sdk/golang-sdk-guide/demo?lang=zh-CN#565565a1 "下载指定范围单元格的所有素材列表")

尝试一下

意见反馈

技术支持

收起

展开