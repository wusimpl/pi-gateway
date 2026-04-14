---
url: "https://open.feishu.cn/document/feishu-cards/card-json-v2-structure"
title: "Card JSON 2.0 structure - Developer Guides - Documentation - Feishu Open Platform"
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

Platform Introduction

Develop Process

Develop Bots

Develop Web Apps

Develop Gadgets (Not Recommended)

Develop Docs Add-ons

Develop Base Extensions

Develop Workplace Blocks

Development link preview

Feishu Cards

[Feishu Card overview](https://open.feishu.cn/document/feishu-cards/feishu-card-overview)

Quick Start

Build card with Cardkit

Build card with JSON

[Card JSON v2.0 breaking changes & release notes](https://open.feishu.cn/document/feishu-cards/card-json-v2-breaking-changes-release-notes)

[Card JSON 2.0 structure](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure)

Card JSON 2.0 version components

[Card JSON 1.0 structure](https://open.feishu.cn/document/feishu-cards/card-json-structure)

Card JSON 1.0 version components

[Configuring card interactions](https://open.feishu.cn/document/feishu-cards/configuring-card-interactions)

[Configure multi-language content](https://open.feishu.cn/document/feishu-cards/configure-multi-language-content)

[Send Feishu card](https://open.feishu.cn/document/feishu-cards/send-feishu-card)

[Handle card callbacks](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/handle-card-callbacks)

[Update Feishu card](https://open.feishu.cn/document/feishu-cards/update-feishu-card)

[Feishu Card FAQs](https://open.feishu.cn/document/common-capabilities/message-card/message-card)

Resources

Web Components

Native integration

SSO&End User Consent

AppLink Protocol

Developer Tools

FAQ

Management Practice

Platform Notices

Deprecated Guides

[Developer Guides](https://open.feishu.cn/document/client-docs/intro) [Feishu Cards](https://open.feishu.cn/document/feishu-cards/feishu-card-overview) [Build card with JSON](https://open.feishu.cn/document/feishu-cards/card-json-v2-breaking-changes-release-notes)

Card JSON 2.0 structure

# Card JSON 2.0 structure

Copy Page

Last updated on 2025-06-23

The contents of this article

[Concept description](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#2e485c83 "Concept description")

[Restrictions](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#00f090e6 "Restrictions")

[JSON structure](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#3282a63a "JSON structure")

[Field descriptions](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#622dac8e "Field descriptions")

[Global properties](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#55c987a9 "Global properties")

[Card global behavior settings config](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#2ffef7a1 "Card global behavior settings config")

[Card Global Jump Link card\_link](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#20731a77 "Card Global Jump Link card_link")

[Card Title header](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#7017d75e "Card Title header")

[Card Body body](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#77d5c1c1 "Card Body body")

# Card JSON 2.0 Structure

This document introduces the overall structure and attribute descriptions of Card JSON 2.0. There are many incompatible differences and new attributes between the structure of JSON 2.0 and JSON 1.0. For more details, refer to [Card JSON 2.0 Incompatible Changes & Updates](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes).

## Concept description

- Card JSON 2.0 refers to the version in which the `schema` attribute is declared as `"2.0"` in the card JSON data. Compared to version 1.0, version 2.0 has many incompatible differences and new attributes. For details, refer to [Card JSON 2.0 version update notes](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes).

- In the visual building tool, you can obtain the source code of the card JSON version 2.0 by building the [new version of the card](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/feishu-card-cardkit/cardkit-upgraded-version-card-release-notes).


## Restrictions

- The Card JSON 2.0 structure does not support building and generating through the [Feishu Card Builder Tool](https://open.feishu.cn/cardkit?from=json_v2_structure). It only supports implementation through Card JSON code.

- The Card JSON 2.0 structure supports up to 200 elements (e.g., text elements where `tag` is `plain_text`) or components for a card.

- Card Schema 2.0 structure is supported from Feishu client version 7.20 onwards. When a card using Schema v2.0 structure is sent to clients with versions lower than 7.20, the card title will display correctly, but the content will show fallback upgrade prompts.


## JSON structure

The following is the overall structure of Card JSON 2.0.

```

{
    "schema": "2.0", // The version of the card JSON structure. The default is 1.0. To use the JSON 2.0 structure, you must explicitly declare 2.0.
    "config": {
        "streaming_mode": true, // Whether the card is in streaming update mode, the default value is false.
        "streaming_config": {}, // Streaming update configuration. For details, refer to the following.
        "summary": {  // Card summary information. This parameter can be used to customize the display text in the client chat bar message preview.
            "content": "Custom content", // Custom summary information. If the streaming update mode is enabled, this parameter will default to "Generating." You can also customize it.
            "i18n_content": { // Multi-language configuration of summary information. Learn about all supported languages. Refer to the multi-language configuration document for cards.
                "zh_cn": "",
                "en_us": "",
                "ja_jp": ""
            }
        },
        "locales": [ // New attribute in JSON 2.0. Used to specify effective languages. If locales are configured, only the languages in locales will be effective.\
            "en_us",\
            "ja_jp"\
        ],
        "enable_forward": true, // Whether to support forwarding the card. The default value is true.
        "update_multi": true, // Whether it is a shared card. The default value is true. JSON 2.0 currently only supports setting it to true, which means that updating the card's content is visible to all recipients of the card.
        "width_mode": "fill", // Card width mode. Supports "compact" (compact width 400px) mode or "fill" (fills the width of the chat window) mode. The default width is 600px if not filled.
        "use_custom_translation": false, // Whether to use custom translation data. The default value is false. When true, after the user clicks on message translation, the corresponding target language of i18n is used as the translation result. If i18n is not available, the current content request translation is used, not custom translation data.
        "enable_forward_interaction": false, // Whether the forwarded card still supports interaction. The default value is false.
        "style": { // Add custom font size and color. Can be applied to component JSON data to set font size and color attributes.
            "text_size": { // Add custom font size for both mobile and desktop, and a fallback font size. Used to set font size attributes in component JSON. Supports adding multiple custom font size objects.
                "cus-0": {
                    "default": "medium", // The font size attribute that takes effect on older Feishu clients that cannot differentiate font size configurations. Optional.
                    "pc": "medium", // Font size for desktop.
                    "mobile": "large" // Font size for mobile.
                }
            },
            "color": { // Add RGBA syntax for both light and dark themes of the Feishu client. Used to set color attributes in component JSON. Supports adding multiple custom color objects.
                "cus-0": {
                    "light_mode": "rgba(5,157,178,0.52)", // Custom color syntax for light theme
                    "dark_mode": "rgba(78,23,108,0.49)" // Custom color syntax for dark theme
                }
            }
        }
    },
    "card_link": {
        // Specify the overall jump link of the card.
        "url": "https://www.baidu.com", // Default link address. This configuration takes effect when the specified endpoint address is not configured.
        "android_url": "https://developer.android.com/",
        "ios_url": "https://developer.apple.com/",
        "pc_url": "https://www.windows.com"
    },
    "header": {
        "title": {
            // Main title of the card. Required. To configure the title in multiple languages, refer to the multi-language configuration document for cards.
            "tag": "plain_text", // Text type tag. Optional values: plain_text and lark_md.
            "content": "Example title" // Title content.
        },
        "subtitle": {
            // Subtitle of the card. Optional.
            "tag": "plain_text", // Text type tag. Optional values: plain_text and lark_md.
            "content": "Example text" // Title content.
        },
        "text_tag_list": [\
            // Suffix tags for the title, up to 3 tags can be set, more than that will not be displayed. Optional.\
            {\
                "tag": "text_tag",\
                "element_id": "custom_id", // Unique identifier of the operation element. Used to specify the element when calling component-related interfaces. Customizable by the developer.\
                "text": {\
                    // Tag content\
                    "tag": "plain_text",\
                    "content": "Tag 1"\
                },\
                "color": "neutral" // Tag color\
            }\
        ],
        "i18n_text_tag_list": {
            //  Multi-language suffix tags for the title. Up to 3 tags can be set for each language environment, more than that will not be displayed. Optional. If both the original field and the internationalization field are configured, the multi-language configuration takes precedence.
            "zh_cn": [],
            "en_us": [],
            "ja_jp": [],
            "zh_hk": [],
            "zh_tw": []
        },
        "template": "blue", // Title theme style color. Supports "blue"|"wathet"|"turquoise"|"green"|"yellow"|"orange"|"red"|"carmine"|"violet"|"purple"|"indigo"|"grey"|"default". The default value is default.
        "icon": { // Prefix icon.
            "tag": "standard_icon", // Icon type.
            "token": "chat-forbidden_outlined", // Token of the icon. Only effective when the tag is standard_icon.
            "color": "orange", // Icon color. Only effective when the tag is standard_icon.
            "img_key": "img_v2_38811724" // Key of the image. Only effective when the tag is custom_icon.
        },
        "padding": "12px 8px 12px 8px" // Padding of the title component. New attribute in JSON 2.0. The default value is "12px", supports the range [0,99]px.
    },
    "body": { // Card body.
        // New layout attribute in JSON 2.0, used to control the arrangement of child elements:
        "direction": "vertical", // Arrangement direction of components within the body or container. Optional values: "vertical" (vertical arrangement), "horizontal" (horizontal arrangement). The default is "vertical".
        "padding": "12px 8px 12px 8px", // Padding of the body or container components, supports the range [0,99]px.
        "horizontal_spacing": "3px", // Horizontal spacing of components within the body or container, optional values: "small"(4px), "medium"(8px), "large"(12px), "extra_large"(16px) or [0,99]px.
        "horizontal_align": "left", // Horizontal alignment of components within the body or container, optional values: "left", "center", "right". The default value is "left".
        "vertical_spacing": "4px", // Vertical spacing of components within the body or container, optional values: "small"(4px), "medium"(8px), "large"(12px), "extra_large"(16px) or [0,99]px.
        "vertical_align": "center", // Vertical alignment of components within the body or container, optional values: "top", "center", "bottom". The default value is "top".
        "elements": [ // JSON data of each component is passed here, and the components are arranged vertically in a streaming manner according to the array order.\
            {\
                "tag": "xxx", // Tag of the component.\
                "margin": "4px", // Margin of the component, the default value is "0", supports the range [-99,99]px. New attribute in JSON 2.0.\
                "element_id": "custom_id" // Unique identifier of the operation component. New attribute in JSON 2.0. Used to specify the component when calling streaming update-related interfaces. Globally unique within the same card. Only letters, numbers, and underscores are allowed, must start with a letter, and must not exceed 20 characters.\
            }\
        ]
    }
}
```

## Field descriptions

This section provides detailed descriptions of each field in the card structure.

## Global properties

Global properties of the card include the following fields.

```

{
    "schema": "2.0",
    "config": {},
    "card_link": {},
    "header": {},
    "body": {
        "elements": []
    }
}
```

The description is as follows.

If none of these fields are provided, the card JSON will be "{}". The Feishu Open Platform supports sending a blank card with the card JSON as "{}".

| Field | Required | Description |
| --- | --- | --- |
| schema | No | Version declaration of the card structure. The default is version 1.0. Optional values:<br>- 1.0: Card v1.0 structure. For details, refer to [Card JSON 1.0 Structure](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-structure).<br>  <br>- 2.0: Card v2.0 structure. Supports more fields and capabilities, such as card streaming update capabilities, more syntax for rich text components (markdown), etc. For details, refer to [Card JSON 2.0 Incompatible Changes & Updates](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-breaking-changes-release-notes). |
| config | No | Config is used to configure the global behavior of the card, including streaming update mode, whether forwarding is allowed, whether it is a shared card, etc. |
| card\_link | No | The card\_link field is used to specify the overall jump link of the card. You can configure a default link, or you can configure different jump links for the PC, Android, and iOS ends respectively. |
| header | No | Title component-related configuration. For details, refer to the [Title](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/title) component. |
| body | No | The card body, containing an array named elements, is used to place various components. |

### Card global behavior settings `config`

The `config` field is used to configure the global behaviors of the card, including whether the card can be forwarded and whether it is a shared card.

```

{
    "config": {
        "streaming_mode": true, // Whether the card is in streaming update mode, default is false.
        "summary": {  // Card summary information. This parameter can be used to customize the display text in the client chat bar message preview.
            "content": "Custom content", // Custom summary information. If the streaming update mode is enabled, this parameter will default to "Generating." You can also customize it.
            "i18n_content": { // Multilingual configuration of summary information. Learn about all supported languages. Refer to local internationalization.
                "zh_cn": "",
                "en_us": "",
                "ja_jp": ""
            }
        },
        "enable_forward": true, // Whether to support forwarding the card. The default value is true.
        "update_multi": true, // Whether it is a shared card. When true, the updated card content is visible to everyone who received this card. The default value is true.
        "width_mode": "fill", // Card width mode. Supports "compact" (compact width 400px) mode or "fill" (fills the chat window width) mode. The default width is 600px if not filled.
        "use_custom_translation": false, // Whether to use custom translation data. The default value is false. When true, after the user clicks on message translation, the i18n corresponding target language is used as the translation result. If i18n is not available, the current content request translation is used instead of custom translation data.
        "enable_forward_interaction": false, // Whether the forwarded card still supports return interaction. The default value is false.
        "style": { // Add custom font sizes and colors. Can be applied in component JSON data to set font size and color attributes.
            "text_size": { // Add custom font sizes for mobile and desktop separately, while adding fallback font sizes. Used to set font size attributes in component JSON. Supports adding multiple custom font size objects.
                "cus-0": {
                    "default": "medium", // Font size attribute effective on older Feishu clients that cannot differentiate font size. Optional.
                    "pc": "medium", // Font size on desktop.
                    "mobile": "large" // Font size on mobile.
                }
            },
            "color": { // Add RGBA syntax for light and dark themes of the Feishu client separately. Used to set color attributes in component JSON. Supports adding multiple custom color objects.
                "cus-0": {
                    "light_mode": "rgba(5,157,178,0.52)", // Custom color syntax in light theme.
                    "dark_mode": "rgba(78,23,108,0.49)" // Custom color syntax in dark theme.
                }
            }
        }
    }
}
```

The fields under config are described in the following table.

| Field Name<br>Show sublists | Required | Type | Default Value | Description |
| --- | --- | --- | --- | --- |
| streaming\_mode | No | Boolean | false | Whether the card is in streaming update mode. Refer to [Streaming updates overview](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/streaming-updates-openapi-overview) for details. |
| summary | No | Object | / | Card summary information. This parameter can be used to customize the display text in the client chat bar message preview. |
| enable\_forward | No | Boolean | true | Whether to allow card forwarding. Values:<br>- true: Allow<br>- false: Do not allow |
| update\_multi | No | Boolean | true | Whether it's a shared card. Values:<br>- true: Shared card, updates to the card are visible to all recipients of this card.<br>- false: Non-shared card, only the operating user can see updates to the card content. |
| width\_mode | No | String | default | Card width mode. Values:<br>- default: Default width. The maximum width on PC and iPad is 600px.<br>- compact: Compact width 400px<br>- fill: Adaptive screen width<br>**Note**: The `width_mode` property is currently not supported in the Card Construction Tool. |
| use\_custom\_translation | No | Boolean | false | Whether to use custom translation data. Values:<br>- true: After the user clicks on message translation, use the target language corresponding to i18n as the translation result. If i18n is not available, use machine translation from Feishu.<br>- false: Do not use custom translation data, directly request machine translation from Feishu. |
| enable\_forward\_interaction | No | Boolean | false | Whether forwarded cards still support interactive feedback. |
| style | No | Object | Empty | Add custom font size and color. Can be applied to JSON data of components to set font size and color properties. |

### Card Global Jump Link card\_link

The card\_link field is used to specify the overall click-through link for the card. You can configure a default link or separate links for PC, Android, and iOS platforms.

```

"card_link": {
    // Specifies the link for the card as a whole.
    "url": "https://www.baidu.com", // Default link address. This configuration takes effect when the specified end address is not configured.
    "android_url": "https://developer.android.com/",
    "ios_url": "https://developer.apple.com/",
    "pc_url": "https://www.windows.com"
  }
```

The descriptions of the fields under card\_link are shown in the table below.

**Note**

- Either `url` or platform-specific links (`android_url`, `ios_url`, `pc_url`) must be filled. If `url` is not filled, then `android_url`, `ios_url`, `pc_url` must be completely filled. If both `url` and platform-specific links (`android_url`, `ios_url`, `pc_url`) are filled, `url` takes effect.
- If you need to disable redirection for a specific platform, you can configure the corresponding parameter value as `lark://msgcard/unsupported_action`.

| Field Name | Required | Type | Description |
| --- | --- | --- | --- |
| url | No | String | Default link address. |
| pc\_url | No | String | Link address for PC platform. |
| ios\_url | No | String | Link address for iOS platform. |
| android\_url | No | String | Link address for Android platform. |

### Card Title header

The header field is used to configure the title of the card. For details on the header field, refer to [Title](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/content-components/title)

```

  "header": {}
```

### Card Body `body`

In the `body` field of the card, you need to add card components as the content of the card, and the components will be vertically arranged in a streaming manner according to the array order. For details on card components, refer to [component JSON v2.0 overview](https://open.feishu.cn/document/uAjLw4CM/ukzMukzMukzM/feishu-cards/card-json-v2-components/component-json-v2-overview).

In the card JSON 2.0 structure, all components have a new `element_id` attribute, which serves as a unique identifier for interacting with components.

```

{
    "body": { // Card body.
        "elements": [ // Pass JSON data for each component here, components will be vertically streamed in array order.\
            {\
                "tag": "xxx", // Tag of the component.\
                "element_id": "custom_id" // Unique identifier for interacting with components. Must be globally unique within the same card. Only letters, numbers, and underscores are allowed. Must start with a letter and not exceed 20 characters.\
            }\
        ]
    }
}
```

[Explain](https://open.feishu.cn/app/ai/playground?query=Based%20on%20the%20doc%20at%20https%3A%2F%2Fopen.feishu.cn%2Fdocument%2Ffeishu-cards%2Fcard-json-v2-structure%2C%20explain%20what%20%22%22%20means&from=doc_text_select) Document Error Correction

Need help? Try asking AI Assistant

[Previous:Card JSON v2.0 breaking changes & release notes](https://open.feishu.cn/document/feishu-cards/card-json-v2-breaking-changes-release-notes) [Next:component JSON v2.0 overview](https://open.feishu.cn/document/feishu-cards/card-json-v2-components/component-json-v2-overview)

Please log in first before exploring any API.

Log In

RUN [Go to API Explorer](https://open.feishu.cn/api-explorer?from=op_doc&)

The contents of this article

[Concept description](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#2e485c83 "Concept description")

[Restrictions](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#00f090e6 "Restrictions")

[JSON structure](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#3282a63a "JSON structure")

[Field descriptions](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#622dac8e "Field descriptions")

[Global properties](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#55c987a9 "Global properties")

[Card global behavior settings config](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#2ffef7a1 "Card global behavior settings config")

[Card Global Jump Link card\_link](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#20731a77 "Card Global Jump Link card_link")

[Card Title header](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#7017d75e "Card Title header")

[Card Body body](https://open.feishu.cn/document/feishu-cards/card-json-v2-structure#77d5c1c1 "Card Body body")

Try It

Feedback

OnCall

Collapse

Expand