import { describe, expect, it } from "vitest";
import { readFeishuQuotedMessage } from "../src/feishu/inbound/message.js";

describe("readFeishuQuotedMessage", () => {
  it("应把父文本消息转成适合 prompt 的纯文本", async () => {
    const result = await readFeishuQuotedMessage("om_parent_1", {
      im: {
        message: {
          get: async () => ({
            data: {
              items: [
                {
                  message_id: "om_parent_1",
                  msg_type: "text",
                  body: {
                    content: "{\"text\":\"@_user_1 继续这个话题\"}",
                  },
                  mentions: [
                    {
                      key: "@_user_1",
                      name: "Tom",
                    },
                  ],
                },
              ],
            },
          }),
        },
      },
    });

    expect(result).toEqual({
      messageId: "om_parent_1",
      messageType: "text",
      text: "@Tom 继续这个话题",
    });
  });

  it("富文本父消息应尽量压平成可读文本", async () => {
    const result = await readFeishuQuotedMessage("om_parent_post", {
      im: {
        message: {
          get: async () => ({
            data: {
              items: [
                {
                  message_id: "om_parent_post",
                  msg_type: "post",
                  body: {
                    content: JSON.stringify({
                      title: "标题",
                      content: [
                        [
                          { tag: "text", text: "第一行：" },
                          { tag: "a", text: "链接", href: "https://example.com" },
                        ],
                        [
                          { tag: "img", image_key: "img_xxx" },
                        ],
                      ],
                    }),
                  },
                },
              ],
            },
          }),
        },
      },
    });

    expect(result).toEqual({
      messageId: "om_parent_post",
      messageType: "post",
      text: "标题\n第一行：链接 (https://example.com)\n【图片】",
    });
  });
});
