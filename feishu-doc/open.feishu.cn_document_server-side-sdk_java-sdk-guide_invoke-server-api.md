---
url: "https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api"
title: "Calling Server-side APIs - Server API - Documentation - Feishu Open Platform"
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

[AI assistant code generation guide](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide)

API Call Guide

Events and callbacks

Server-side SDK

[Server SDK](https://open.feishu.cn/document/server-docs/server-side-sdk)

Java SDK guide

[Preparations before development](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/preparations)

[Calling Server-side APIs](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api)

[Handle events](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-events)

[Handle callbacks](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-callback)

[Scenario examples](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/scenario-example)

Golang SDK guide

Python SDK guide

NodeJS SDK guide

[SDK FAQs](https://open.feishu.cn/document/server-side-sdk/faq)

Authenticate and Authorize

Contacts

Organization

Messaging

Group Chat

Feishu Card

Feed

Organization Custom Group Label

Docs

Calendar

Video Conferencing

Minutes

Attendance

Approval

Bot

Help Desk

Tasks

Email

App Information

Company Information

Verification Information

Personal Settings

Search

AI

Spark

Feishu aPaaS

aily

Admin

Moments

Feishu CoreHR - (Standard version)

Feishu People（Enterprise Edition）

Payroll

Hire

OKR

Identity Authentication

Smart Access Control

Performance

Lingo

security\_and\_compliance

Trust Party

Workplace

Feishu Master Data Management

Report

eLearning

Deprecated Version (Not Recommended)

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Server-side SDK](https://open.feishu.cn/document/server-docs/server-side-sdk) [Java SDK guide](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/preparations)

Calling Server-side APIs

# Calling Server-side APIs

Copy Page

Last updated on 2026-01-29

The contents of this article

[Step 1: Build the API Client](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#3c03f05c "Step 1: Build the API Client")

[Step 2: Construct the API Request](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#1cacf44e "Step 2: Construct the API Request")

[(Optional) Step 3: Set Request Options](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#ccc5000e "(Optional) Step 3: Set Request Options")

[Step 4: Run the Code](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#2de4e8da "Step 4: Run the Code")

[FAQs](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#2d7f6d58 "FAQs")

[How to call historical version APIs?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#6456e70c "How to call historical version APIs?")

[How to quickly obtain sample code for an API?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#84298d4b "How to quickly obtain sample code for an API?")

[How to accurately select an API?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#5b7e96d1 "How to accurately select an API?")

[How to pass parameters for HTTP GET requests that require a body in open interfaces?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#32434fcd "How to pass parameters for HTTP GET requests that require a body in open interfaces?")

[How to resolve ClientTimeoutException due to API timeout?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#60a882b4 "How to resolve ClientTimeoutException due to API timeout?")

[Why does the program continue running for some time before automatically stopping after the client successfully sends a request and receives a response?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#9cc893bd "Why does the program continue running for some time before automatically stopping after the client successfully sends a request and receives a response?")

[MessageCardElement lacks an implementation class for tag = table.](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#984fbfeb "MessageCardElement lacks an implementation class for tag = table.")

[com.lark.oapi.core.exception.IllegalAccessTokenTypeException: null error](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#3f965788 "com.lark.oapi.core.exception.IllegalAccessTokenTypeException: null error")

[After starting a long connection locally, there is no "connected to wss://xxxxx" message printed, and there are no other errors.](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#c5b3b2e4 "After starting a long connection locally, there is no \"connected to wss://xxxxx\" message printed, and there are no other errors.")

[The sample code for uploading approval files reports an error, or I don't know how to construct the request.](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#7f8b474c "The sample code for uploading approval files reports an error, or I don't know how to construct the request.")

[ERROR com.lark.oapi.ws.Listener \[Listener.java:83\] - java.io.EOFException error](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#e298f33c "ERROR com.lark.oapi.ws.Listener [Listener.java:83] - java.io.EOFException error")

[Batch API request timeout, client time out, SocketTimeoutException: timeout, java.io.IOException: Canceled：](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#d024ecab "Batch API request timeout, client time out, SocketTimeoutException: timeout, java.io.IOException: Canceled：")

[Running the Java sample code for the Download Media API reports an error: java.lang.IllegalArgumentException: The result returned by the server is illegal](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#5c397b00 "Running the Java sample code for the Download Media API reports an error: java.lang.IllegalArgumentException: The result returned by the server is illegal")

# Calling Server-side APIs

This document outlines how to use the Java SDK to build an API Client, construct API requests, and successfully call server-side APIs. You can also visit the [API Explorer](https://open.feishu.cn/api-explorer?from=op_doc) to directly retrieve example code related to specific server-side APIs and refer to this document for a complete guide on the API calling process.

## Step 1: Build the API Client

Before calling the Feishu Open Platform API using the SDK, you need to create an API Client in your code. This API Client supports basic configurations such as specifying the application information, log levels, HTTP request timeouts, and more. Below are the supported configuration options and their meanings.

```

Client client = Client.newBuilder("appId", "appSecret") // Default configuration for self-built applications
    .marketplaceApp() // Set application type to store app
    .openBaseUrl(BaseUrlEnum.FeiShu) // Set domain, default is Feishu
    .helpDeskCredential("helpDeskId", "helpDeskSecret") // Required for helpdesk applications
    .requestTimeout(3, TimeUnit.SECONDS) // Set HTTP client timeout, default is no timeout
    .logReqAtDebug(true) // Enable logging of HTTP request and response headers, bodies, etc. in debug mode
    .build();
```

| Configuration Option | Configuration Method | Required? | Description |
| --- | --- | --- | --- |
| app\_id and app\_secret | `Client.newBuilder("appId", "appSecret")` | Yes | Application credentials (App ID and App Secret). You can obtain them in the [Developer Console](https://open.feishu.cn/app) \> Application Details > **Credentials & Basic Information**. |
| appType | `client.marketplaceApp()` | No | Set the app type to "store app". Required if you are an ISV developer. For more information on developing store apps, see the [ISV (Store App) Development Guide - oapi-sdk-java](https://bytedance.feishu.cn/docx/G4lndQqsgoenFhxcPlIc0Klinte). |
| logReqAtDebug | `client.logReqAtDebug(boolean logReqAtDebug)` | No | Set whether to enable logging of HTTP request parameters and responses. When enabled, HTTP request and response headers, bodies, etc., will be logged in debug mode, which is useful for troubleshooting. |
| BaseUrl | `client.openBaseUrl(BaseUrlEnum baseUrl)` | No | Set the Feishu domain (default is Feishu). Available domains are as follows:<br>```<br>public enum BaseUrlEnum {<br>  FeiShu("https://open.feishu.cn"),<br>  LarkSuite("https://open.larksuite.com"),<br>  ;<br>}<br>``` |
| tokenCache | `client.tokenCache(ICache cache)` | No | Set the token cache, which is used to store tokens and app tickets. The default implementation uses memory caching. For store app developers, if you need SDK to cache app tickets, you need to implement this interface to provide distributed caching. |
| disableTokenCache | `client.disableTokenCache()` | No | Set whether to enable automatic retrieval and caching of TenantAccessToken. If this option is configured, automatic retrieval and caching of TenantAccessToken is disabled; otherwise, it is enabled by default. |
| helpDeskId, helpDeskToken | `client.helpDeskCredential(String helpDeskId, String helpDeskToken)` | No | The ID and token of the helpdesk. These are only required when calling APIs related to the helpdesk. You can obtain them from the [Helpdesk Admin Console](https://feishu.cn/helpdesk/admin) **Settings** \> **API Credentials**. |
| requestTimeout | `client.requestTimeout(long timeout, TimeUnit timeUnit)` | No | Set the timeout for the SDK's internal HTTP client. Default is 0, which means no timeout. |
| httpTransport | `client.httpTransport(IHttpTransport httpTransport)` | No | Set the transport layer implementation to replace the default implementation provided by the SDK. You can implement the `IHttpTransport` interface to set a custom transport layer. For example:<br>```<br>public interface IHttpTransport {<br>  RawResponse execute(RawRequest request) throws Exception;<br>}<br>``` |

Example Configuration:

- For self-built apps, create the API Client using the following code:

```

Client client = Client.newBuilder("appId", "appSecret").build();  // Default configuration for self-built apps
```

- For store apps, specify the AppType as a store app using `marketplaceApp()` when creating the API Client. The code is as follows:

```

Client client = Client.newBuilder("appId", "appSecret")
    .marketplaceApp() // Set app type as store app
    .build();
```

## Step 2: Construct the API Request

Once you have created an API Client in your project, you can start calling the [Feishu Open Platform APIs](https://open.feishu.cn/document/ukTMukTMukTM/uYTM5UjL2ETO14iNxkTN/server-api-list). The SDK uses the format **client.** **service domain.** **version.** **resource** **.method name** to locate the specific API method. Below is an example, where you can use the [API Explorer](https://open.feishu.cn/api-explorer?from=op_doc) to retrieve sample code for the specified API.

For example, you can use the `client.docx().document().create` method to create a document.

This example requires you to have permission for \[Create and Edit New Documents\] or \[Create New Documents\] in the Developer Console; otherwise, the API will return error code 99991672.

```

import com.lark.oapi.Client;
import com.lark.oapi.core.utils.Jsons;
import com.lark.oapi.service.docx.v1.model.CreateDocumentReq;
import com.lark.oapi.service.docx.v1.model.CreateDocumentReqBody;
import com.lark.oapi.service.docx.v1.model.CreateDocumentResp;

public class DocxSample {

  public static void main(String arg[]) throws Exception {
    // Build the client
    Client client = Client.newBuilder("appId", "appSecret").build();
    // Make the request
    CreateDocumentResp resp = client.docx().document()
        .create(CreateDocumentReq.newBuilder()
            .createDocumentReqBody(CreateDocumentReqBody.newBuilder()
                .title("title")  // Document title
                .folderToken("")  // Folder token; an empty value creates the document in the root directory
                .build())
            .build()
        );
    // Handle server-side errors
    if (!resp.success()) {

      System.out.println("Error: " + resp.getCode() + " - " + resp.getMsg());
      return;
    }
    // Handle success
    System.out.println(Jsons.DEFAULT.toJson(resp.getData()));
  }
}
```

For more API call examples, please refer to the [Im Java example](https://github.com/larksuite/oapi-sdk-java/blob/v2_main/sample/src/main/java/com/lark/oapi/sample/api/ImSample.java) in the GitHub code repository.

## (Optional) Step 3: Set Request Options

Each time you make an API call, you can configure request-level parameters such as passing a userAccessToken (user access token), custom headers, etc. Below is a table showing all the request-level options that can be configured:

| Configuration Option | Configuration Method | Description |
| --- | --- | --- |
| headers | `requestOptions.headers(Map<String, List<String>> headers)` | Set custom request headers. These headers will be passed through to the Feishu Open Platform server when making the request. |
| userAccessToken | `requestOptions.userAccessToken(String userAccessToken)` | Set the user token when you need to make API calls on behalf of a user. You must set this option. |
| tenantAccessToken | `requestOptions.tenantAccessToken(String tenantAccessToken)` | Set the enterprise or organization token. If you manage your own enterprise or organization token (i.e., when EnableTokenCache is set to false while creating the client), you need to pass the enterprise or organization token using this option. |
| tenantKey | `requestOptions.tenantKey(String tenantKey)` | Set the enterprise or organization key. This option must be set when developing a store application. |
| requestId | `requestOptions.requestId(String requestId)` | Set the request ID, which serves as the unique identifier for the request. This ID will be passed through to the Feishu Open Platform server. |

An example code for setting custom request headers is shown below:

```

import com.lark.oapi.Client;
import com.lark.oapi.core.request.RequestOptions;
import com.lark.oapi.core.utils.Jsons;
import com.lark.oapi.core.utils.Lists;
import com.lark.oapi.service.docx.v1.model.CreateDocumentReq;
import com.lark.oapi.service.docx.v1.model.CreateDocumentReqBody;
import com.lark.oapi.service.docx.v1.model.CreateDocumentResp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
public class DocxSample {
  public static void main(String arg[]) throws Exception {
    // Create API Client. You need to input your actual App ID and App Secret here
    Client client = Client.newBuilder("appId", "appSecret").build();
    // Set custom request headers
    Map<String, List<String>> headers = new HashMap<>();
    headers.put("key1", Lists.newArrayList("value1"));
    headers.put("key2", Lists.newArrayList("value2"));
    // Make the request
    CreateDocumentResp resp = client.docx().document()
        .create(CreateDocumentReq.newBuilder()
                .createDocumentReqBody(CreateDocumentReqBody.newBuilder()
                    .title("title")   // Document title
                    .folderToken("")  // Folder token, an empty string means create the document in the root directory
                    .build())
                .build()
            , RequestOptions.newBuilder()
                .userAccessToken("u-2GxFH7ysh8E9lj9UJp8XAG0k0gh1h5KzM800khEw2G6e") // Pass user token
                .headers(headers) // Pass custom headers
                .build());
    // Handle server errors
    if (!resp.success()) {
      System.out.println(String.format("code:%s,msg:%s,reqId:%s"
          , resp.getCode(), resp.getMsg(), resp.getRequestId()));
      return;
    }
    // Business data handling
    System.out.println(Jsons.DEFAULT.toJson(resp.getData()));
  }
}
```

## Step 4: Run the Code

Once the previous steps are completed, you can run the code to call the create document API. If the request is successful, it will return the following data. If it fails, it will return an error code, error message, and Log ID, and you can refer to the development documentation to find solutions.

```

{
  Document: {
    DocumentId: "IPI4dqnbfoPxL3xhAEhcjXabcef",
    RevisionId: 1,
    Title: "title"
  }
}
```

## FAQs

### How to call historical version APIs?

Some historical version open interfaces exist in the server-side API, and since they lack metadata information, you cannot use the SDK's prepackaged methods to quickly call them. In this case, you can use the native API call mode provided by the SDK. For example, for the [Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) interface, an example call is shown below:

```

package com.lark.oapi.sample.rawapi;
import com.lark.oapi.Client;
import com.lark.oapi.core.enums.AppType;
import com.lark.oapi.core.response.RawResponse;
import com.lark.oapi.core.token.AccessTokenType;
import com.lark.oapi.core.utils.Jsons;
import java.util.HashMap;
import java.util.Map;
/**
 * Native HTTP call method
 */
public class RawApiCall {
  public static void main(String arg[]) throws Exception {
    // Build client
    Client client = Client.newBuilder("appId", "appSecret").build();
    // Build HTTP body
    Map<String, Object> body = new HashMap<>();
    body.put("receive_id", "ou_c245b0a7dff2725cfa2fb104f8b48b9d");
    body.put("content", MessageText.newBuilder()
        .atUser("ou_155184d1e73cbfb8973e5a9e698e74f2", "Tom")
        .text("test content")
        .build());
    body.put("msg_type", MsgTypeEnum.MSG_TYPE_TEXT);
    // Make the request
    RawResponse resp = client.post(
        "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=open_id"
        , body
        , AccessTokenType.Tenant);
    // Handle results
    System.out.println(resp.getStatusCode());
    System.out.println(Jsons.DEFAULT.toJson(resp.getHeaders()));
    System.out.println(new String(resp.getBody()));
    System.out.println(resp.getRequestID());
  }
}
```

For more API call examples, refer to the [RawApiCall Java example](https://github.com/larksuite/oapi-sdk-java/blob/v2_main/sample/src/main/java/com/lark/oapi/sample/rawapi/RawApiCall.java) in the GitHub code repository.

### How to quickly obtain sample code for an API?

The Feishu Open Platform provides the [API Debugging Platform](https://open.feishu.cn/api-explorer), where you can quickly debug server-side APIs, obtain resource IDs, and generate sample code in multiple languages, saving development time. For example, after successfully testing the [Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) API in the debugging platform, you can view the Java SDK's corresponding sample code on the **Example Code** page.

### How to accurately select an API?

When using the API Client to call an API, it's recommended to use the [API Debugging Platform](https://open.feishu.cn/api-explorer/) to obtain the corresponding method. You can either concatenate the method from the address bar parameters or refer directly to the provided example code. For example, to get a user ID by phone number or email, you can follow the steps shown in the diagram.

![](<Base64-Image-Removed>)

### How to pass parameters for HTTP GET requests that require a body in open interfaces?

Since the default client implementation (OkHttp3Client) does not support this, you need to switch to ApacheHttpClient. Refer to the following code:

```

Client.newBuilder(appId, appSecret)
      .httpTransport(
          ApacheHttpClientTransport.newBuilder().httpclient(HttpClients.createDefault()).build()
      )
```

### How to resolve ClientTimeoutException due to API timeout?

This error occurs because the API Client was not configured with a timeout. You need to configure the timeout when building the Client. Refer to the following code:

```

@Test
void init() {
    Client client = Client.newBuilder("appId", "appSecret")
        .httpTransport(new OkHttpTransport(
            new OkHttpClient().newBuilder()
                .readTimeout(3, TimeUnit.MINUTES)  // Set read timeout, unit must be minutes
                .callTimeout(3, TimeUnit.MINUTES)  // Set call timeout, unit must be minutes
                .build()
        ))
        .tokenCache(LocalCache.getInstance())      // Default implementation with local cache that expires over time; you can implement your own ICache interface, such as Redis cache
        .logReqAtDebug(true)                       // In debug mode, HTTP request and response headers, body, etc. will be printed
        .build();
}
```

### Why does the program continue running for some time before automatically stopping after the client successfully sends a request and receives a response?

When using OkHttp as the HTTP client library, OkHttp maintains a connection pool to reuse already established HTTP connections for performance improvement. The connections in the pool have a 5-minute TTL (Time To Live). The process may not immediately terminate, but will remain active until all connections' TTL expires or are manually closed.

If you want the process to terminate immediately, you can disable OkHttp's connection reuse by setting the `Connection: close` header. However, this will degrade network performance, so please use this with caution.

![](<Base64-Image-Removed>)

### MessageCardElement lacks an implementation class for tag = table.

**Answer:**

In the Java SDK, the `MessageCardElement` class is no longer maintained. It is recommended to use the **Feishu Card Builder** to design cards, export the **JSON template**, and build the card content directly using a JSON string or a Map structure.

### com.lark.oapi.core.exception.IllegalAccessTokenTypeException: null error

**Answer:**

First, verify whether the API only supports `UserAccessToken`. If it does, further check whether this token has been passed in when calling the API; if it was not passed, add it and try again.

### After starting a long connection locally, there is no "connected to wss://xxxxx" message printed, and there are no other errors.

**Answer:**

Check the `logback.xml` configuration file and confirm whether logging for the `oapi` package has been disabled.

### The sample code for uploading approval files reports an error, or I don't know how to construct the request.

**Reference documentation**: [Upload approval files](https://open.larkoffice.com/document/server-docs/approval-v4/file/upload-files)

**Correct sample code**:

```

FormData formData = new FormData();
formData.addField("name", file.getName());
formData.addField("type", "attachment");
FormDataFile formDataFile = new FormDataFile();
formDataFile.setFieldName("content");
formDataFile.setFile(file);
formData.addFile("content", formDataFile);
```

### ERROR com.lark.oapi.ws.Listener \[Listener.java:83\] - java.io.EOFException error

**Answer**：

This error is usually caused by a network connection interruption or the server actively closing the connection. The SDK has an automatic reconnection mechanism built in. If it happens occasionally, it can be ignored; if it occurs frequently, check the stability of the server network.

### Batch API request timeout, client time out, SocketTimeoutException: timeout, java.io.IOException: Canceled：

- **Batch API timeout example**:

![](<Base64-Image-Removed>)

- **Client time out example**：

```

com.lark.oapi.core.exception.ClientTimeoutException: client time out
at com.lark.oapi.core.Transport.send(Transport.java:189)
at com.lark.oapi.service.contact.v3.resource.User.batchGetId(User.java:162)
```

- **SocketTimeoutException: timeout example**:

![](<Base64-Image-Removed>)

**Cause:**

In OkHttp, when `CallTimeout` is **not set manually, there is theoretically no timeout limit**. However, in practice, the connect, read, and write phases each have default timeouts (all 10s). Timeouts for server API calls usually occur during the `readtimeout` (read) phase. You can adjust the timeout configuration for each phase as follows:

```

import com.lark.oapi.Client;
import com.lark.oapi.core.cache.LocalCache;
import com.lark.oapi.core.httpclient.OkHttpTransport;
import com.lark.oapi.okhttp.OkHttpClient;
import java.net.Proxy;
import java.util.concurrent.TimeUnit;

@Test
void init() {
    Client client = Client.newBuilder("appId", "appSecret")
        .httpTransport(
            new OkHttpTransport(
                new OkHttpClient().newBuilder()
                    .readTimeout(3, TimeUnit.MINUTES) // Timeout while waiting for the server to return response data
                    .callTimeout(3, TimeUnit.MINUTES) // Full lifecycle timeout from request start until the response is fully received
                    .build()
        ))
        .tokenCache(LocalCache.getInstance())     // Default implementation: local cache with expiration; you can implement ICache yourself, e.g. Redis cache
        .logReqAtDebug(true)                      // In debug mode, prints HTTP request/response headers, body, etc.
        .build();
}
```

### Running the Java sample code for the Download Media API reports an error: java.lang.IllegalArgumentException: The result returned by the server is illegal

**Reference documentation**: [Download media](https://open.larkoffice.com/document/server-docs/docs/drive-v1/media/download)

**Sample code:**

```

public static void main(String arg[]) throws Exception {
    Client client = Client.newBuilder("xxx", "xxx").build();

    DownloadMediaReq req = DownloadMediaReq.newBuilder()
            .fileToken("xxx")
            .extra("%7B%22bitablePerm%22%3A%7B%22tableId%22%3A%22tblQ7MgglSH9q3NE%22%2C%22rev%22%3A5%7D%7D")
            .build();

    DownloadMediaResp resp = client.drive().v1().media().download(req);

    if(!resp.success()) {
        System.out.println(String.format("code:%s,msg:%s,reqId:%s, resp:%s",
                resp.getCode(), resp.getMsg(), resp.getRequestId(), Jsons.createGSON(true, false).toJson(JsonParser.parseString(new String(resp.getRawResponse().getBody(), StandardCharsets.UTF_8)))));
        return;
    }

    // Business data processing
    resp.writeFile("c:/filepath/filename");
}
```

**Cause:**

The `extra` parameter provided by the user is already encoded, but the Java SDK will automatically encode the `extra` field value once internally, causing the parameter to be encoded twice and ultimately leading to an invalid parameter error.

**Solution:**

When passing the `extra` parameter, use the original parameter value before encoding. The sample usage is as follows:

```

DownloadMediaReq req = DownloadMediaReq.newBuilder()
        .fileToken("xxxx")
        .extra("{\"bitablePerm\":{\"tableId\":\"xxxx\",\"rev\":5}}")
        .build();
```

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-side-sdk%2Fjava-sdk-guide%2Finvoke-server-api%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[How to resolve tenant token invalid (999991663) error](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-99991663-error)

[How to choose different types of access tokens](https://open.feishu.cn/document/faq/trouble-shooting/how-to-choose-which-type-of-token-to-use)

[How to select the method corresponding to the Open API in SDK](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/server-side-sdk/python--sdk/invoke-server-api?lang=en-US#83c8eef5)

[How to obtain Open ID](https://open.feishu.cn/document/faq/trouble-shooting/how-to-obtain-openid)

[How to request the required scopes for the application](https://open.feishu.cn/document/faq/trouble-shooting/how-to-fix-the-99991672-error)

Got other questions? Try asking AI Assistant

[Previous:Preparations before development](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/preparations) [Next:Handle events](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/handle-events)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Step 1: Build the API Client](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#3c03f05c "Step 1: Build the API Client")

[Step 2: Construct the API Request](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#1cacf44e "Step 2: Construct the API Request")

[(Optional) Step 3: Set Request Options](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#ccc5000e "(Optional) Step 3: Set Request Options")

[Step 4: Run the Code](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#2de4e8da "Step 4: Run the Code")

[FAQs](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#2d7f6d58 "FAQs")

[How to call historical version APIs?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#6456e70c "How to call historical version APIs?")

[How to quickly obtain sample code for an API?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#84298d4b "How to quickly obtain sample code for an API?")

[How to accurately select an API?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#5b7e96d1 "How to accurately select an API?")

[How to pass parameters for HTTP GET requests that require a body in open interfaces?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#32434fcd "How to pass parameters for HTTP GET requests that require a body in open interfaces?")

[How to resolve ClientTimeoutException due to API timeout?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#60a882b4 "How to resolve ClientTimeoutException due to API timeout?")

[Why does the program continue running for some time before automatically stopping after the client successfully sends a request and receives a response?](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#9cc893bd "Why does the program continue running for some time before automatically stopping after the client successfully sends a request and receives a response?")

[MessageCardElement lacks an implementation class for tag = table.](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#984fbfeb "MessageCardElement lacks an implementation class for tag = table.")

[com.lark.oapi.core.exception.IllegalAccessTokenTypeException: null error](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#3f965788 "com.lark.oapi.core.exception.IllegalAccessTokenTypeException: null error")

[After starting a long connection locally, there is no "connected to wss://xxxxx" message printed, and there are no other errors.](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#c5b3b2e4 "After starting a long connection locally, there is no \"connected to wss://xxxxx\" message printed, and there are no other errors.")

[The sample code for uploading approval files reports an error, or I don't know how to construct the request.](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#7f8b474c "The sample code for uploading approval files reports an error, or I don't know how to construct the request.")

[ERROR com.lark.oapi.ws.Listener \[Listener.java:83\] - java.io.EOFException error](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#e298f33c "ERROR com.lark.oapi.ws.Listener [Listener.java:83] - java.io.EOFException error")

[Batch API request timeout, client time out, SocketTimeoutException: timeout, java.io.IOException: Canceled：](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#d024ecab "Batch API request timeout, client time out, SocketTimeoutException: timeout, java.io.IOException: Canceled：")

[Running the Java sample code for the Download Media API reports an error: java.lang.IllegalArgumentException: The result returned by the server is illegal](https://open.feishu.cn/document/server-side-sdk/java-sdk-guide/invoke-server-api#5c397b00 "Running the Java sample code for the Download Media API reports an error: java.lang.IllegalArgumentException: The result returned by the server is illegal")

Try It

Feedback

OnCall

Collapse

Expand