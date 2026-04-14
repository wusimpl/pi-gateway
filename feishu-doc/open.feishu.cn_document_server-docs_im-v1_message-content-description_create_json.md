---
url: "https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json"
title: "Send message content structure - Server API - Documentation - Feishu Open Platform"
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

Authenticate and Authorize

Contacts

Organization

Messaging

[Message overview](https://open.feishu.cn/document/server-docs/im-v1/introduction)

[Message FAQ](https://open.feishu.cn/document/server-docs/im-v1/faq)

Message management

[Message management overview](https://open.feishu.cn/document/server-docs/im-v1/message/intro)

[Topic overview](https://open.feishu.cn/document/im-v1/message/thread-introduction)

Message content introduction

[Send message content structure](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json)

[Receive message content structure](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/message_content)

[Send message](https://open.feishu.cn/document/server-docs/im-v1/message/create)

[Reply message](https://open.feishu.cn/document/server-docs/im-v1/message/reply)

[Edit message](https://open.feishu.cn/document/server-docs/im-v1/message/update)

[Forward a message](https://open.feishu.cn/document/server-docs/im-v1/message/forward)

[Merge forward messages](https://open.feishu.cn/document/server-docs/im-v1/message/merge_forward)

[Forward a thread](https://open.feishu.cn/document/im-v1/message/forward-2)

[Recall message](https://open.feishu.cn/document/server-docs/im-v1/message/delete)

[Push follow-up](https://open.feishu.cn/document/im-v1/message/push_follow_up)

[Query the read status of a message as the sender](https://open.feishu.cn/document/server-docs/im-v1/message/read_users)

[Get chat history](https://open.feishu.cn/document/server-docs/im-v1/message/list)

[Obtain resource files in messages](https://open.feishu.cn/document/server-docs/im-v1/message/get-2)

[Obtain the content of the specified message](https://open.feishu.cn/document/server-docs/im-v1/message/get)

Events

Batch message

Images message

File message

Buzz message

Message reaction

Pin

Message card

URL preview

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

[Server API](https://open.feishu.cn/document/ukTMukTMukTM/ukDNz4SO0MjL5QzM/AI-assistant-code-generation-guide) [Messaging](https://open.feishu.cn/document/server-docs/im-v1/introduction) [Message management](https://open.feishu.cn/document/server-docs/im-v1/message/intro) [Message content introduction](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json)

Send message content structure

# Send message content structure

Copy Page

Last updated on 2025-06-12

The contents of this article

[Precautions](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#d258cc64 "Precautions")

[Introduction to message content](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#6e8c1c4c "Introduction to message content")

[JSON structure of message content of various types](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#6095d81e "JSON structure of message content of various types")

[Text](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#c1ebd2a2 "Text")

[Rich text post](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#2e3b9e4c "Rich text post")

[Image](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#a6f35866 "Image")

[Interactive](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#d243c3f5 "Interactive")

[Share\_chat](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#ad7ef095 "Share_chat")

[Share\_user](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#29fa29b2 "Share_user")

[Audio](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#7768ebc7 "Audio")

[Media](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#2ef0355d "Media")

[File](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#2b183663 "File")

[Sticker](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#-814f044 "Sticker")

[System message system](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#c406e2c8 "System message system")

# Send message content structure

This article describes how to construct the message content (`content`) corresponding to each message type (`msg_type`) in the [Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create), [Reply message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/reply), and [Edit message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/update) interfaces.

## Precautions

Before reading this article, please be sure to understand the following notes:

- All the parameter values in the sample code provided in this article, such as `receive_id` (message recipient ID), `user_id` (user's user\_id), `image_key` (image identifier key obtained after uploading an image), `file_key` (file identifier key obtained after uploading a file), etc., are sample data. You need to replace them with real available data during actual development.
- The content construction examples provided in this article are only applicable to the [Send Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create), [Reply Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/reply), and [Edit Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/update) interfaces, and are not applicable to the [Batch Send Message](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM) interface and the interfaces of various historical versions of messages.
- This article is not applicable to custom robots. For the use of custom robots, please refer to the [Custom Robot Usage Guide](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN).

## Introduction to message content

In the **Send message**, **Reply message**, and **Edit message** interfaces, you need to pass in the message content (`content`). Different message types correspond to different `content`. Taking a text message as an example, the request body example is as follows:

```

{
	"receive_id": "ou_7d8a6e6df7621556ce0d21922b676706ccs",
	"content": "{\"text\":\" test content\"}",
	"msg_type": "text"
}
```

**Note**: The `content` field is of string type, and the JSON structure needs to be escaped before passing the value. When calling the interface, you can first construct a structure, and then use JSON serialization to convert it to a string type, or escape it through a third-party JSON conversion tool.

## JSON structure of message content of various types

Message types include text, rich text, card, business card, audio, video, and file. This chapter will introduce how to construct the content corresponding to each type of message.

### Text

**Content example**

```

{
	"text": "test content"
}
```

**Parameter description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| text | string | Yes | Text content.<br>**Example value**: test content |

**[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) request body example**

```

{
	"receive_id": "ou_7d8a6e6df7621556ce0d21922b67670xxxx",
	"content": "{\"text\":\"test content\"}",
	"msg_type": "text"
}
```

#### Support line breaks

If you need to break lines in the text, you can use the `\n` line break character. The request body example is as follows (note that the content needs to be escaped):

```

{
	"receive_id": "oc_xxx",
	"content": "{\"text\":\"firstline \\n secondline \"}",
	"msg_type": "text"
}
```

#### Support @ user, @ everyone

```

// @ single user
<at user_id="ou_xxxxxxx">User name (optional)</at>
// @ everyone
<at user_id="all"></at>
```

- When @ing a single user, the `user_id` field must be filled with the user's open\_id, union\_id or user\_id to @ the specified person. Please ensure that the ID is a valid value. For how to obtain the ID, refer to [How to obtain User ID, Open ID and Union ID?](https://open.feishu.cn/document/home/user-identity-introduction/open-id).
- When @ing everyone, `user_id` takes the value of `all`, and it should be noted that the group must have the @ing everyone function enabled.
- The syntax here is different from the syntax of @ specifying people in card messages ( [Message Card Markdown](https://open.feishu.cn/document/ukTMukTMukTM/uADOwUjLwgDM14CM4ATN#abc9b025), [Feishu Card Markdown](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-components/content-components/rich-text)), so please pay attention to the difference.

Text message @ Usage example:

```

{
	"receive_id": "oc_xxx",
	"content": "{\"text\":\"<at user_id=\\\"ou_xxxxxxx\\\">Tom</at> text content\"}",
	"msg_type": "text"
}
```

The effect after the message is sent is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/e54c6aa89c252033a90f7d90b5d63f2e_AJycmDi2Tf.png?height=410&lazyload=true&maxWidth=400&width=564)

#### Support some style tags

Support four styles: bold, italic, underline, and strikethrough (can be nested):

- **Bold**: `<b>Text Example</b>`
- _Italic_: `<i>Text Example</i>`
- Underline: `<u>Text Example</u>`
- ~~Strikethrough~~: `<s>Text Example</s>`

**Note**:

- Please ensure that the first and last tags correspond and are nested correctly. If the first and last tags are missing or the nesting level is incorrect, the message will be sent with the original content.
- Tag information will greatly increase the size of the message body, please use it as appropriate.
- This capability does not currently support the [Custom Robot](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN) and [Batch Send Messages](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM) interfaces.

Style tag usage example:

```

{
	"receive_id": "oc_xxx",
	"content": "{\"text\":\"<b>bold content<i>, bold and italic content</i></b>\"}",
	"msg_type": "text"
}
```

The effect after the message is sent is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/11f5004aaaaf02ee90b625311df6d824_JV9jdvPcsy.png?height=126&lazyload=true&maxWidth=400&width=896)

#### Support hyperlinks

The format of the hyperlink is `[text](link)`, such as `[Feishu Open Platform](https://open.feishu.cn)` .

**Note**:

- `[text]` does not support multi-layer nesting of `[]`. In addition, if the text contains other `[` or `]` characters, please make sure that the symbols before and after match, otherwise it may cause abnormal hyperlink recognition.
- Please make sure that the link is legal, otherwise the message will be sent with the original content.
- This capability does not currently support the [Custom Robot](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN) and [Batch Send Messages](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM) interfaces.

Example of using hyperlink:

```

{
"receive_id": "oc_xxx",
"content": "{\"text\":\"[Feishu Open Platform](https://open.feishu.cn)\"}",
"msg_type": "text"
}
```

The effect after sending the message is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/b2e2f8e6a7f2169ca88ec2434e2c255f_TNCcXir3DK.png?height=218&lazyload=true&maxWidth=400&width=936)

### Rich text post

In a rich text message, you can add text, pictures, videos, @, hyperlinks and other elements. The following JSON format content is an example of rich text, where:

- A rich text can be divided into multiple paragraphs (composed of multiple `[]`), each paragraph can be composed of multiple elements, and each element is composed of a tag and a corresponding description.
- The picture and video elements must be an independent paragraph.
- The `style` field does not currently support the [Custom Robot](https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN) and [Batch Send Messages](https://open.feishu.cn/document/ukTMukTMukTM/ucDO1EjL3gTNx4yN4UTM) interfaces.
- When actually sending a message, you need to compress the JSON format content into one line and escape it.
- If you want to refer to this JSON example to construct rich text message content, you need to replace the example values ​​such as user\_id, image\_key, file\_key with real values.

````

{
	"zh_cn": {
		"title": "Title",
		"content": [\
			[\
				{\
					"tag": "text",\
					"text": "The first line:",\
					"style": ["bold", "underline"]\
				},\
				{\
					"tag": "a",\
					"href": "https://open.feishu.cn",\
					"text": "Open Platform",\
					"style": ["bold", "italic"]\
				},\
				{\
					"tag": "at",\
					"user_id": "ou_1avnmsbv3k45jnk34j5",\
					"style": ["lineThrough"]\
				}\
			],\
			[{\
				"tag": "img",\
				"image_key": "img_7ea74629-9191-4176-998c-2e603c9c5e8g"\
			}],\
			[\
				{\
					"tag": "text",\
					"text": "The second line:",\
					"style": ["bold", "underline"]\
				},\
				{\
					"tag": "text",\
					"text": "Text test"\
				}\
			],\
			[{\
				"tag": "img",\
				"image_key": "img_7ea74629-9191-4176-998c-2e603c9c5e8g"\
			}],\
			[{\
				"tag": "media",\
				"file_key": "file_v2_0dcdd7d9-fib0-4432-a519-41d25aca542j",\
				"image_key": "img_7ea74629-9191-4176-998c-2e603c9c5e8g"\
			}],\
          	[{\
				"tag": "emotion",\
				"emoji_type": "SMILE"\
			}],\
			[{\
				"tag": "hr"\
			}],\
			[{\
				"tag": "code_block",\
				"language": "GO",\
				"text": "func main() int64 {\n    return 0\n}"\
			}],\
			[{\
				"tag": "md",\
				"text": "**mention user:**<at user_id=\"ou_xxxxxx\">Tom</at>\n**href:**[Open Platform](https://open.feishu.cn)\n**code block:**\n```GO\nfunc main() int64 {\n    return 0\n}\n```\n**text styles:** **bold**, *italic*, ***bold and italic***, ~underline~,~~lineThrough~~\n> quote content\n\n1. item1\n    1. item1.1\n    2. item2.2\n2. item2\n --- \n- item1\n    - item1.1\n    - item2.2\n- item2"\
			}],\
		]
	},
	"en_us": {
		...
	}
}
````

**Parameter Description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| zh\_cn, en\_us | object | Yes | Multi-language configuration field. If you do not need to configure multiple languages, you can configure only one language.<br>- `zh_cn` is the Chinese content of the rich text<br>- `en_us` is the English content of the rich text<br>**Note**: This field has no default value, at least one language must be set.<br>**Example value**: zh\_cn |
| ∟ title | string | No | The title of the rich text message.<br>**Default value**: empty<br>**Example value**: title |
| ∟ content | string | Yes | Rich text message content. Consists of multiple paragraphs (paragraphs are separated by `[]`), each paragraph is a node list, supported node tag types and corresponding parameter descriptions, see the **Tags and Parameters Supported by Rich Text** section below.<br>**Note**: As shown in **Example value**, each type is set by the tag parameter. For example, text is set to `"tag": "text"`.<br>**Example value**: \[\[{"tag": "text","text": "text content"}\]\] |

#### **Tags and parameter descriptions supported by rich text**

- **text: text tag**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| text | string | Yes | Text content.<br>**Example value**: test content |
| un\_escape | boolean | No | Whether to unescape decoding. The default value is false. If not used, no value is required.<br>**Example value**: false |
| style | \[\]string | No | Text content style, supported styles are:<br>- bold<br>- underline<br>- lineThrough<br>- italic<br>**Note**:<br>- The default value is empty, indicating no style.<br>- If the value passed in is not an optional value above, it will be ignored.<br>**Example value**: \["bold", "underline"\] |

- **a: Hyperlink tag**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| text | string | Yes | The text content of the hyperlink.<br>**Example value**: hyperlink |
| href | string | Yes | Hyperlink address.<br>**Note**: Please ensure the legitimacy of the link address, otherwise the message will fail to send.<br>**Example value**: https://open.feishu.cn |
| style | \[\]string | No | Hyperlink text content style, supported styles are:<br>- bold<br>- underline<br>- lineThrough<br>- italic<br>**Note**:<br>- The default value is empty, indicating no style.<br>- If the value passed in is not an optional value above, it will be ignored.<br>**Example value**: \["bold", "italic"\] |

- **at: @label**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| user\_id | string | Yes | User ID, used to specify the user to be @ed. The value passed in can be the user's user\_id, open\_id, union\_id. For how to obtain various IDs, see [How to obtain User ID, Open ID, and Union ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id).<br>**Note**:<br>- When @ing a single user, this field must pass in the actual user's real ID.<br>- If you need to @ everyone, this parameter needs to pass in `all`. |
| style | \[\]string | No | at Text content style, supported styles are:<br>- bold<br>- underline<br>- lineThrough<br>- italic<br>**Note**:<br>- The default value is empty, indicating no style.<br>- If the value passed in is not one of the above optional values, it will be ignored.<br>**Example value**: \["lineThrough"\] |

- **img: Image tag**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| image\_key | string | Yes | Image Key. You can get the image key (image\_key) through the [upload image](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create) interface.<br>**Example value**: d640eeea-4d2f-4cb3-88d8-c964fab53987 |

- **media: video tag**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| file\_key | string | Yes | The video file's Key. After uploading a video (mp4 format) through the [Upload File](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create) interface, you can get the video file Key (file\_key).<br>**Example value**: file\_v2\_0dcdd7d9-fib0-4432-a519-41d25aca542j |
| image\_key | string | No | Key of the video cover image. The image key (image\_key) can be obtained through the [Upload image](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create) interface.<br>**Default value**: empty, indicating no video cover.<br>**Example value**: img\_7ea74629-9191-4176-998c-2e603c9c5e8g |

- **emotion: expression tag**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| emoji\_type | string | Yes | Emoji text type. For optional values, see [Emoji text description](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message-reaction/emojis-introduce).<br>**Example value**: SMILE |

- **code\_block: Code block tag**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| language | string | No | Language type of the code block. Optional values ​​include PYTHON, C, CPP, GO, JAVA, KOTLIN, SWIFT, PHP, RUBY, RUST, JAVASCRIPT, TYPESCRIPT, BASH, SHELL, SQL, JSON, XML, YAML, HTML, THRIFT, etc.<br>**Note**:<br>- Values are not case sensitive.<br>- If no value is passed, the default is text type.<br>**Example value**: GO |
| text | string | Yes | Code block content.<br>**Example value**: func main() int64 {\\n return 0\\n} |

- **hr: separator tag**

Rich text supports `tag` value as `hr`, which indicates a separator. There are no other parameters in this tag.

- **md: Markdown tag**

**Note**:

- `md` tag will occupy one or more paragraphs and cannot be on the same line with other tags.
- `md` tag only supports sending. When [getting message content](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/get), this tag will no longer be included and will be converted to other matching tags according to the content in `md`.
- When obtaining message content, quotes, ordered lists, and unordered lists are simplified to text tags (text) for output.

The `text` parameter is used to set Markdown content in the `md` tag.

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| text | string | Yes | Markdown content. See the table below for supported content.<br>**Example value**: 1\. item1\\n2. item2 |

The syntax supported in the `text` parameter is shown in the following table.

| Syntax | Example | Description |
| --- | --- | --- |
| @ User | `<at user_id="ou_xxxxx">User</at>` | Supports @ single user or everyone.<br>- When @ single user, the real ID of the actual user needs to be passed in user\_id. The passed value can be the user's user\_id, open\_id, union\_id. For information on how to obtain various IDs, see [How to obtain User ID, Open ID, and Union ID](https://open.feishu.cn/document/home/user-identity-introduction/open-id).<br>- If you need to @ everyone, you need to set the value of user\_id to `all`. |
| Hyperlink | `[Feishu Open Platform](https://open.feishu.cn)` | In Markdown syntax, `[]` is used to set the text content of the hyperlink, and `()` is used to set the address of the hyperlink.<br>**Note**: Please ensure the legitimacy of the link address, otherwise only the text content will be sent. |
| Ordered list | `1. item1\n2. item2` | Markdown configuration instructions:<br>- There should be a space between each numbered `.` character and the subsequent content.<br>- Each column is on a separate line. As shown in the example, you can use the `\n` line break character to wrap the line.<br>- Supports nesting multiple levels.<br>- Each level is indented 4 spaces, and the numbering starts from `1.`.<br>- Can be mixed with unordered lists. |
| Unordered list | `- item1\n- item2` | Markdown configuration instructions:<br>- There should be a space between the `-` character and the subsequent content of each column.<br>- Each column is a separate line. As shown in the example, you can use the `\n` line break character to break the line.<br>- Supports nesting multiple levels.<br>- Each level is indented 4 spaces.<br>- Can be mixed with ordered lists, and ordered lists start numbering with `1.` |
| Code block | \`\`\`GO\\nfunc main(){\\n return\\n}\\n\`\`\` | The code block content needs to be wrapped with \`\`\` symbols at the beginning and end, and the code language type is followed by the header \`\`\`. Supported language types include PYTHON, C, CPP, GO, JAVA, KOTLIN, SWIFT, PHP, RUBY, RUST, JAVASCRIPT, TYPESCRIPT, BASH, SHELL, SQL, JSON, XML, YAML, HTML, THRIFT, etc. (case insensitive). |
| Quote | `> demo` | Quote content. There should be a space between the `>` character and the subsequent content. |
| Separator | `\n --- \n` | As shown in the example, there should be a `\n` line break before and after. |
| Bold | `**Bold Text**` | Configuration Instructions:<br>- There must be no space between the `**` character and the bold text.<br>- Bold can be used with italics. For example, `***Bold+Italics***`.<br>- Bold text does not support parsing other components. For example, text that is a hyperlink will not be parsed. |
| Italics | `*Italics Text*` | Configuration Instructions:<br>- There must be no space between the `*` character and the bold text.<br>- Italics can be used with bold. For example, `***bold+italic***`.<br>- Italic text does not support parsing other components. For example, if the text is a hyperlink, it will not be parsed. |
| Underline | `~Underline text~` | Configuration instructions:<br>- There must be no space between the `~` character and the underlined text.<br>- Underlined text does not support parsing other components. For example, if the text is a hyperlink, it will not be parsed.<br>- It does not support being used with bold, italic, and strikethrough. |
| Strikethrough | `~~Strikethrough~~` | Configuration instructions:<br>- There should be no space between the `~~` character and the underlined text.<br>- Strikethrough text does not support parsing other components. For example, text that is a hyperlink will not be parsed.<br>- It does not support being used with bold, italic, or underline. |

[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) request body example:

```

{
	"receive_id": "oc_820faa21d7ed275b53d1727a0feaa917",
	"content": "{\"zh_cn\":{\"title\":\"I am a title\",\"content\":[[{\"tag\":\"text\",\"text\":\"First line :\"},{\"tag\":\"a\",\"href\":\"http://www.feishu.cn\",\"text\":\"hyperlink\"},{\"tag\":\"at\",\"user_id\":\"ou_1avnmsbv3k45jnk34j5\",\"user_name\":\"tom\"}],[{\"tag\":\ "img\",\"image_key\":\"img_7ea746 29-9191-4176-998c-2e603c9c5e8g\"}],[{\"tag\":\"text\",\"text\":\"The second line:\"},{\"tag\":\"text\",\"text\":\"Text test\"}],[{\"tag\":\"img\",\"image_key\":\"img_7ea74629-9191-4176-998c-2e603c9c5e8g\"}]]}}",
	"msg_type": "post"
}
```

The effect after sending:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/bb46a277180f7d5afaa05f68cee52c16_kmpB0f8WDR.png?height=1038&lazyload=true&maxWidth=600&width=1286)

### Image

**Content example**

```

{
	"image_key": "img_7ea74629-9191-4176-998c-2e603c9c5e8g"
}
```

**Parameter description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| image\_key | string | Yes | Image Key, you can get the image Key (image\_key) through the [upload image](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create) interface.<br>**Example value**: img\_7ea74629-9191-4176-998c-2e603c9c5e8g |

**[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) Request body example**

```

{
	"receive_id": "oc_xxx",
	"content": "{\"image_key\": \"img_v2_xxx\"}",
	"msg_type": "image"
}
```

The effect after the message is sent is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/a8db03920c6434899e9e8dca6e9ab47d_HazoJPFumr.png?height=250&lazyload=true&maxWidth=300&width=628)

### Interactive

Feishu cards are a type of message that can flexibly construct graphic content. You can create visually appealing and interactive card content using the [Visual Construction Tool](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/feishu-cardkit-overview) or by defining the [Card JSON](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-structure).

If you are using the legacy version of the Send Message Card (`/open-apis/message/v4/send/`) API, the `content` parameter in the request body needs to be replaced with `card`. If you are using the [Send Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) API, the content parameter in the message request body has been unified to `content`.

**[Send Message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) Request Body Example**

The following provides multiple ways to send cards. For detailed instructions, refer to [Sending Cards](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/send-feishu-card).

- **Method 1: Using Card Entity ID to Send**

Sending a card via the card entity ID is suitable for scenarios where partial updates to the card or streaming updates are needed. For details, refer to the [Streaming Updates OpenAPI Guide](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview).





The card entity ID is the unique identifier of the card entity, which can be obtained by calling the [Create Card Entity](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/cardkit-v1/card/create) API.





The example request body is as follows:


```

{
      "receive_id": "ou_449b53ad6aee526f7ed311b216aabcef",
      "msg_type": "interactive",
      "content": "{\"type\":\"card\",\"data\":{\"card_id\":\"7371713483664506900\"}}"
}
```

- **Method 2: Using Card Template `template_id` to Send**

After building the card using the [Card Construction Tool](https://open.feishu.cn/cardkit?from=open_docs_tool_overview), send the card using the card's `template_id`.





The method of sending a card using the template `template_id` supports the use of card variables to dynamically control the card content.





The example request body is as follows:


```

{
    "receive_id": "ou_449b53ad6aee526f7ed311b216aabcef",
    "msg_type": "interactive",
    "content": "{\"type\":\"template\",\"data\":{\"template_id\":\"xxxxxxxxxxxx\",\"template_version_name\":\"1.0.0\",\"template_variable\":{\"key1\":\"value1\",\"key2\":\"value2\"}}}"
}
```


The `content` parameter includes the following configurations:




| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| type | string | No | The type of the card. To send a card built using the construction tool (also known as a card template), the fixed value is `template`. |
| data | object | No | The data of the card template. To send a card built using the construction tool, you need to pass the card template ID, card version number, etc. here. |
| └ template\_id | string | Yes | The ID of the card (also known as the card template) created in the construction tool, such as `AAqigYkzabcef`. You can obtain it by copying the card template ID in the construction tool. |
| └ template\_version\_name | string | No | The version number of the card created in the construction platform, such as `1.0.0`. After the card is published, the version number will be generated. You can obtain it in the **Version Management** section of the construction tool.<br>**Note**: If this field is not filled, the latest version of the card will be used by default. |
| └ template\_variable | object | No | If the card is bound to variables, you need to pass the actual variable values in this field.<br>**Example**: If the variable name is defined as `open_id` in the construction tool, you need to pass a value for the `open_id` variable here:<br>```<br>{<br>    "open_id": "ou_d506829e8b6a17607e56bcd6b1aabcef"<br>}<br>``` |


- **Method 3: Using Card JSON to Send**

After building the card using the [Card Construction Tool](https://open.feishu.cn/cardkit?from=open_docs_tool_overview), copy the card source code to obtain the card JSON. Then compress and escape the card source code before passing it into the `content` parameter to send the card.





The method of sending a card using JSON does not support passing card variables.





The example request body is as follows:


```

{
    "receive_id": "ou_449b53ad6aee526f7ed311b216aabcef",
    "msg_type": "interactive",
    "content": "{\"schema\":\"2.0\",\"config\":{\"update_multi\":true,\"style\":{\"text_size\":{\"normal_v2\":{\"default\":\"normal\",\"pc\":\"normal\",\"mobile\":\"heading\"}}}},\"body\":{\"direction\":\"vertical\",\"padding\":\"12px 12px 12px 12px\",\"elements\":[{\"tag\":\"markdown\",\"content\":\"West Lake, located at No. 1 Longjing Road, Xihu District, Hangzhou City, Zhejiang Province, China, covers a water area of 21.22 square kilometersand a lake surface area of 6.38 square kilometers.\",\"text_align\":\"left\",\"text_size\":\"normal_v2\",\"margin\":\"0px 0px 0px 0px\"},{\"tag\":\"button\",\"text\":{\"tag\":\"plain_text\",\"content\":\"🌞 More Attractions\"},\"type\":\"default\",\"width\":\"default\",\"size\":\"medium\",\"behaviors\":[{\"type\":\"open_url\",\"default_url\":\"https://baike.baidu.com/item/%E8%A5%BF%E6%B9%96/4668821\",\"pc_url\":\"\",\"ios_url\":\"\",\"android_url\":\"\"}],\"margin\":\"0px 0px 0px 0px\"}]},\"header\":{\"title\":{\"tag\":\"plain_text\",\"content\":\"Today's Travel Recommendation\"},\"subtitle\":{\"tag\":\"plain_text\",\"content\":\"\"},\"template\":\"blue\",\"padding\":\"12px 12px 12px 12px\"}}"
}
```


### Share\_chat

**Content example**

```

{
"chat_id": "oc_0dd200d32fda15216d2c2ef1ddb32f76"
}
```

**Parameter description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| chat\_id | string | yes | Group ID. For how to obtain it, see [Group ID Description](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/chat-id-description).<br>**Example value**: oc\_0dd200d32fda15216d2c2ef1ddb32f76 |

**[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) Request body example**

```

{
	"receive_id": "oc_xxx",
	"content": "{\"chat_id\":\"oc_xxx\"}",
	"msg_type": "share_chat"
}
```

The robot must be in the group where the group business card is located to successfully send the group business card.

The effect after the message is sent is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/fceb387db588096dc315d4f63b81a76c_gWtvPRUNkb.png?height=1012&lazyload=true&maxWidth=400&width=2238)

### Share\_user

**Content example**

```

{
	"user_id": "ou_0dd200d32fda15216d2c2ef1ddb32f76"
}
```

- `user_id` only supports setting the user's open\_id, and the user needs to be within the robot's availability. For details, see [Configure application availability](https://open.feishu.cn/document/home/introduction-to-scope-and-authorization/availability).
- Sharing the robot's business card is not supported yet.

**Parameter Description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| user\_id | string | Yes | User's open\_id, for how to obtain it, refer to [How to obtain Open ID](https://open.feishu.cn/document/uAjLw4CM/ugTN1YjL4UTN24CO1UjN/trouble-shooting/how-to-obtain-openid).<br>**Example value**: ou\_0dd200d32fda15216d2c2ef1ddb32f76 |

**[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) Request body example**

```

{
"receive_id": "oc_820faa21d7ed275b53d1727a0feaa917",
"content": "{\"user_id\":\"ou_xxx\"}",
"msg_type": "share_user"
}
```

The effect after the message is sent is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/d64989eaca9fa14e508456dda8761711_PFmrkXqJZ6.png?height=266&lazyload=true&maxWidth=500&width=968)

### Audio

**Content example**

```

{
	"file_key": "75235e0c-4f92-430a-a99b-8446610223cg"
}
```

**Parameter description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| file\_key | string | Yes | The key of the voice file can be obtained through the [Upload file](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create) interface.<br>**Example value**: 75235e0c-4f92-430a-a99b-8446610223cg |

**[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) Request body example**

```

{
	"receive_id": "oc_xxx",
	"content": "{\"file_key\":\"file_v2_xxx\"}",
	"msg_type": "audio"
}
```

The effect after the message is sent is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/35b8e3ab3c86e4c36756564ecf2d32c4_hcwZsC3Sdo.png?height=228&lazyload=true&maxWidth=300&width=592)

### Media

**Content example**

```

{
	"file_key": "75235e0c-4f92-430a-a99b-8446610223cg",
	"image_key": "img_xxxxxx"
}
```

**Parameter description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| file\_key | string | Yes | Video file Key, obtain the Key (file\_key) of the video file through the [upload file](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create) interface.<br>**Example value**: 75235e0c-4f92-430a-a99b-8446610223cg |
| image\_key | string | No | Video cover image, optional configuration, no cover if not configured. The value is the image's key. The image's key (image\_key) is obtained through the [Upload image](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/image/create) interface. |

**[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) request body example**

```

{
	"receive_id": "oc_xxx",
	"content": "{\"file_key\":\"file_v2_xxx\",\"image_key\":\"img_v2_xxx\"}",
	"msg_type": "media"
}
```

The effect after the message is sent is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/2e9199825f13a97cf0746792bebc4c2f_2KysKba7r4.png?height=808&lazyload=true&maxWidth=350&width=672)

### File

**Content example**

```

{
	"file_key": "75235e0c-4f92-430a-a99b-8446610223cg"
}
```

**Parameter description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| file\_key | string | Yes | The key of the file is obtained through the [upload file](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/file/create) interface.<br>**Example value**: 75235e0c-4f92-430a-a99b-8446610223cg |

**[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) Request body example**

```

{
	"receive_id": "oc_820faa21d7ed275b53d1727a0feaa917",
	"content": "{\"file_key\":\"file_v2_xxx\"}",
	"msg_type": "file"
}
```

The effect after the message is sent is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/7bd82e789e4385de6175928164aaa399_JtSebSp7Ej.png?height=240&lazyload=true&maxWidth=400&width=918)

### Sticker

**Content example**

```

{
	"file_key": "75235e0c-4f92-430a-a99b-8446610223cg"
}
```

**Parameter description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| file\_key | string | Yes | Sticker file key, currently only supports sending stickers received by the bot. You can obtain the file\_key of the emoji package through the API [receive message event](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive).<br>**Example value**: 75235e0c-4f92-430a-a99b-8446610223cg |

**Message request body example**

```

{
	"receive_id": "oc_xxx",
	"content": "{\"file_key\":\"file_v2_xxx\"}",
	"msg_type": "sticker"
}
```

The effect after the message is sent is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/5617a52223f44877799f2de8c4639ed9_BBrI1lCAff.png?height=610&lazyload=true&maxWidth=300&width=632)

### System message system

**Note:**

- Only support using `tenant_access_token` to call the [send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) interface. To send a system message for a specific template, in addition to the required permissions for the interface, you also need to have the Send a specific template system message (im:message:send\_sys\_msg) permission.
- The Feishu client version needs to be V7.20 or above to display the dividing line system message normally. If it is lower than this version, only the text content will be displayed.

**Content example**

```

{
    "type": "divider",
    "params": {
        "divider_text": {
            "text": "New Session",
            "i18n_text": {
                "zh_CN": "新会话",
                "en_US": "New Session"
            }
        }

    },
    "options": {
        "need_rollup": true
    }
}
```

**Parameter Description**

| Name | Type | Required | Description |
| --- | --- | --- | --- |
| type | string | Yes | System message type. Only the value `divider` is supported, indicating a dividing line. **Currently, this type is only supported in single chats (p2p) between robots and users.**<br>**Example value**: divider |
| params | object | is | System message parameters. |
| ∟ divider\_text | object | No | The content of the divider system message. This parameter is required when `type` is `divider`.<br>**Example value**: "divider\_text": { "text": "New Topic", "i18n\_text": { "zh\_CN": "New Session", "en\_US": "New Session" } } |
| ∟∟ text | string | 是 | Default text.<br>**Note**:<br>- This parameter is required and cannot be empty.<br>  <br>- The text length cannot exceed 20 characters or 10 Chinese characters.<br>  <br>**Example value**: New session |
| ∟∟ i18n\_text | map | No | Internationalized text, in a multi-language environment, this value is used first. The format is `{key:value}`. The supported language fields are:<br>- en\_US (English)<br>- zh\_CN (Simplified Chinese)<br>- zh\_HK (Traditional Chinese - Hong Kong)<br>- zh\_TW (Traditional Chinese - Taiwan)<br>- ja\_JP (Japanese)<br>- id\_ID (Indonesian)<br>- vi\_VN (Vietnamese)<br>- th\_TH (Thai)<br>- pt\_BR (Portuguese)<br>- es\_ES (Spanish)<br>- ko\_KR (Korean)<br>- de\_DE (German)<br>- fr\_FR (French)<br>- it\_IT (Italian)<br>- ru\_RU (Russian)<br>- ms\_MY (Malay)<br>**Note**:<br>- The language type is case sensitive. Please keep it exactly the same as the above enumeration value when passing the value.<br>- The text under each language (if any) cannot be empty.<br>- The text length cannot exceed 20 characters or 10 Chinese characters.<br>**Example value**: { "zh\_CN": "新对话", "en\_US": "New Session" } |
| options | map | No | Optional configuration item, the format is `{key:value}`, `key` is the enumeration value, `value` is the value of the enumeration value. Supported enumeration values ​​are:<br>- need\_rollup: whether to scroll and clear the screen, boolean type parameter, the default value is false, indicating that it is not needed.<br>**Example value**: { "need\_rollup": true } |

**[Send message](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create) Request body example**

```

{
        "receive_id": "oc_xxx",
        "content": "{\"type\":\"divider\",\"params\":{\"divider_text\":{\"text\":\"New Session\",\"i18n_text\":{\"zh_CN\":\"New Session\",\"en_US\":\"New Session\"}}},\"options\":{\"need_rollup\":true}}",
        "msg_type": "system"
}
```

The effect example is as follows:

![](https://sf3-cn.feishucdn.com/obj/open-platform-opendoc/fe632c5e2adc2d89dfc948da148093b8_MMXgXBrHnQ.png?height=222&lazyload=true&maxWidth=600&width=1814)

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Fserver-docs%2Fim-v1%2Fmessage-content-description%2Fcreate_json%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Related questions

[Is there a limit on the size of the message?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#a8e56502)

[Can the message that has been pushed be changed?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#-e9039a1)

[Can I send messages to external contacts through the interface?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#9618afc5)

[How to set the link opening method in the message (open in Feishu navigation bar, open in browser)?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#8497ccd2)

[Interface for obtaining resource files in messages. Can I obtain resource files in messages sent by others?](https://open.feishu.cn/document/server-docs/im-v1/faq?lang=en-US#07976d93)

Got other questions? Try asking AI Assistant

[Previous:Topic overview](https://open.feishu.cn/document/im-v1/message/thread-introduction) [Next:Receive message content structure](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/message_content)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Precautions](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#d258cc64 "Precautions")

[Introduction to message content](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#6e8c1c4c "Introduction to message content")

[JSON structure of message content of various types](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#6095d81e "JSON structure of message content of various types")

[Text](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#c1ebd2a2 "Text")

[Rich text post](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#2e3b9e4c "Rich text post")

[Image](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#a6f35866 "Image")

[Interactive](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#d243c3f5 "Interactive")

[Share\_chat](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#ad7ef095 "Share_chat")

[Share\_user](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#29fa29b2 "Share_user")

[Audio](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#7768ebc7 "Audio")

[Media](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#2ef0355d "Media")

[File](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#2b183663 "File")

[Sticker](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#-814f044 "Sticker")

[System message system](https://open.feishu.cn/document/server-docs/im-v1/message-content-description/create_json#c406e2c8 "System message system")

Try It

Feedback

OnCall

Collapse

Expand