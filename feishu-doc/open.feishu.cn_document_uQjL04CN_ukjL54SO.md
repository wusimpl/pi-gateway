---
url: "https://open.feishu.cn/document/uQjL04CN/ukjL54SO"
title: "Develop a gadget - Documentation - Feishu Open Platform"
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

# Develop a gadget

Copy Page

Last updated on 2021-05-31

The contents of this article

[Create the first enterprise self-built application](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#e4c59f14 "Create the first enterprise self-built application")

[1\. Create an App](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#b052309a "1. Create an App")

[2\. Get the App ID](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#736a4ce6 "2. Get the App ID")

[Create gadget project](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#fbddc4de "Create gadget project")

[1\. Create from template](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#263d2e34 "1. Create from template")

[2\. Edit App ID in configuration](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#1f994442 "2. Edit App ID in configuration")

[Debugging and preview in simulator](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#79e21ea3 "Debugging and preview in simulator")

[1\. Preview a gadget](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#-d5d0b25 "1. Preview a gadget")

[2\. Coding and debug](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#accbdd59 "2. Coding and debug")

[Preview on device](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#2a53aab6 "Preview on device")

[Upload and publish app](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#61266ba1 "Upload and publish app")

[1\. Upload](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#580a9a37 "1. Upload")

[2\. Update gadget version](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#1a2f00ca "2. Update gadget version")

[3\. Publish](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#44924171 "3. Publish")

# Develop a gadget

Through this article, you will learn to develop and publish a Feishu gadget. Estimated time: 10 minutes.

Please refer to [User Manual](https://open.feishu.cn/document/uYjL24iN/ucDOzYjL3gzM24yN4MjN#3da20bb3) to complete the tool installation before development.

## Create the first enterprise self-built application

### 1\. Create an App

Enter [Feishu Open Platform—Developer Console](https://open.feishu.cn/app/) to create an application named hello-world.

> View details [Create a custom app](https://open.feishu.cn/document/uQjL04CN/ukzM04SOzQjL5MDN)。

### 2\. Get the App ID

1. After the creation is successful, you can see that the **hello-world** application is added to the enterprise self-built application directory, click to enter the application details page.

![6ebb8d4f31434327e735498ca3fdd336.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/d7f4bc8490ef4bc1ff9176cfa72af7bf_6ws2wBTUsM.png)

2. On the **App Details** page, click **Credentials and Basic Information** in the left menu bar, check the App ID under **App Credentials** on the right (App ID is the unique identifier of the application), click to go directly Copy the App ID of the application.

   - Note: Be sure to save the App ID of the application, as you will use it in the next steps.

## Create gadget project

### 1\. Create from template

Execute the following commands in the terminal, and a small program project named my-hello-world based on the hello-world template will be created in the current directory.

```

opdev new my-hello-world --template=hello-world
```

### 2\. Edit App ID in configuration

1. Use the IDE to open the gadget project that was successfully created in the previous step (here VSCode is taken as an example), you can see that the [basic directory structure](https://open.feishu.cn/document/uYjL24iN/ukjMukjMukjM) of the small program is generated under the my-hello-world directory。

![9486bd652b1384f50e52c3f4e93dbe6d.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/0a83f052c0059a9e8d34b64bd14fca8a_KZEd42S9AO.png)

2. Copy App ID ans paste it in the file named project.config.json for the field appid, show as following：

![0d9b3f665903c436446526417e550600.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/acf76bf6f6504f7ea6c92608f36c2269_ICb9W6aHJ1.png)

## Debugging and preview in simulator

### 1\. Preview a gadget

> Note: The development tool depends on [Chrome browser](https://www.google.cn/intl/zh-CN/chrome/), please make sure your computer has been installed.

Execute the following commands in the terminal, the left and right Chrome browser windows will open (emulator on the left, debugger on the right), you can use these two windows to debug and preview the applet.

```

 opdev devtools ./my-hello-world
```

![image.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/869fba76661b5263dfa4053654f8eb93_dhnGuKNHjr.png)

### 2\. Coding and debug

1. Go back to the code editor, open /pages/index/index.ttml, modify the content, change **Welcome to Gadget** to **hello world** and save it.

![图片名称](https://sf3-cn.feishucdn.com/obj/website-img/a9698ca28ff09d5bed9329e59a6a106f_0q4RpuJrXI.png)

2. After saving successfully, check the simulator again. You can see that the text displayed on the page has also been modified to **hello world**, then congratulations, you have learned the local preview and debugging of the gadget.

![图片名称](https://sf3-cn.feishucdn.com/obj/website-img/39afe8ee81ee8f7eac573ae428ed5331_9XJiZA7OfK.png)

## Preview on device

Since the local preview is based on the Chrome browser, it cannot be exactly the same as the effect after the gadget is released. You can use the **Device Preview** function to view the actual effect of the gadget in Feishu App.

1. Executing the following command in the terminal will generate a QR code.

```

opdev preview ./my-hello-world -p Mobile
```

2. Open the mobile phone Feishu, click **+** in the upper right corner, click **Scan QR Code** to scan the QR code generated in the previous step.

![IMG_4784912CC94A-1.jpeg](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/4afc1541853d276b453edcd92a804960_JnUk8W2xto.jpeg)3\. Enter the gadget debugging mode: display the text **hello world**.

![图片名称](https://sf3-cn.feishucdn.com/obj/website-img/90ce378b24506bb1b6afb64aa6643fb5_juCfWQcUqC.png)

## Upload and publish app

After uploading and publishing, other people in the enterprise can also use your gadget.

### 1\. Upload

1. Enter the command line and execute the following command, -p Mobile parameter means uploading the mobile terminal applet version, -v 1.7.0 parameter means the version to be uploaded is 1.7.0.

2. After the execution is complete, **Please enter description(Optional)** will be displayed. You can enter the version description information after this prompt (here we fill in it as empty), and press Enter to start uploading. After successful upload, it will prompt **Upload mobile succeed**.


```

opdev upload ./my-hello-world -p Mobile -v 1.7.0
```

![图片名称](https://sf3-cn.feishucdn.com/obj/website-img/0b481798904ce52dc95ac3b0e9aa6674_4SiXle4yPG.png)

3. Click on the link **Open platform** to enter the open platform application details page.

### 2\. Update gadget version

Immediately after the previous step, under the Open Platform **Application Details Page> Application Features> Mini Programs**, turn on the **Enable Mini Programs** switch, select the latest version of the Mini Program, and click the Save button to confirm that the save is successful.

![597489a0e2e28cd4dfe22b2cf03a7f68.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/14b3f48b1079eb65175f34aa736a81a7_cw9dogYD9A.png)

### 3\. Publish

Before publishing an application, make sure that the application icon has been uploaded.

1. On the application details page, click **Version management & release** on the left to enter the version management and release page, and click the **Create Version** button to enter the create version details page. For the specific process of the release version, please refer to: [Create a custom app](https://open.feishu.cn/document/uQjL04CN/ukzM04SOzQjL5MDN#%E5%9C%A8%E4%BC%81%E4%B8%9A%E5%86%85%E5%8F%91%E5%B8%83%E4%B8%8A%E7%BA%BF)

2. On the Create Version page, fill in the following information:


- App version： **1.0.0 for example**
- Minimum compatible mobile Feishu versio： **the minimal client version**
- Update Note： **your note for update**
- Availability status： **yourself or other people**

After filling in, click the **Save** button at the bottom.

![1 (2).png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/3edb1fccf41cd0eb434ee8639835b0e6_AqOL2P0PcS.png)3\. After saving successfully, click the **Submit for release** button in the upper right corner.

![b2c54e7def979990a7f97daadf2fdcd4.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a905d051afa0d4332ba9bb84731811e2_HfinsAXoM1.png)

As you can see, version has been released.

![625593863d41689d2fba6f113a56e47a.png](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/36a6a12819250b8a2918597d5db75d06_TIekDfgaCB.png)

4. Open the Feishu mobile terminal and enter the workplace. Under **All Applications**, you can see the successfully released application **my-hello-world** in the previous step, click to open it, if you see **my-hello-world** , then congratulations, you have successfully started the development of Feishu gadget.

![IMG_C1469772AE5E-1.jpeg](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/9109edcb6c4990976ce6563f6722c0b5_lSV3UH4Bzy.jpeg)

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2FuQjL04CN%2FukjL54SO%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Create the first enterprise self-built application](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#e4c59f14 "Create the first enterprise self-built application")

[1\. Create an App](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#b052309a "1. Create an App")

[2\. Get the App ID](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#736a4ce6 "2. Get the App ID")

[Create gadget project](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#fbddc4de "Create gadget project")

[1\. Create from template](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#263d2e34 "1. Create from template")

[2\. Edit App ID in configuration](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#1f994442 "2. Edit App ID in configuration")

[Debugging and preview in simulator](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#79e21ea3 "Debugging and preview in simulator")

[1\. Preview a gadget](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#-d5d0b25 "1. Preview a gadget")

[2\. Coding and debug](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#accbdd59 "2. Coding and debug")

[Preview on device](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#2a53aab6 "Preview on device")

[Upload and publish app](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#61266ba1 "Upload and publish app")

[1\. Upload](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#580a9a37 "1. Upload")

[2\. Update gadget version](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#1a2f00ca "2. Update gadget version")

[3\. Publish](https://open.feishu.cn/document/uQjL04CN/ukjL54SO#44924171 "3. Publish")

Try It

Feedback

OnCall

Collapse

Expand