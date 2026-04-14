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
                      zh_cn: {
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
                      },
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

  it("卡片父消息应只提取正文，不混入布局元数据", async () => {
    const result = await readFeishuQuotedMessage("om_parent_card", {
      im: {
        message: {
          get: async () => ({
            data: {
              items: [
                {
                  message_id: "om_parent_card",
                  msg_type: "interactive",
                  body: {
                    content: JSON.stringify({
                      schema: "2.0",
                      body: {
                        direction: "vertical",
                        padding: "12px 12px 12px 12px",
                        elements: [
                          {
                            tag: "markdown",
                            content: "**Title**\n- item1\n```ts\nconsole.log('ok')\n```",
                            text_align: "left",
                          },
                          {
                            tag: "table",
                            page_size: 1,
                            row_height: "middle",
                            header_style: {
                              bold: true,
                              text_align: "left",
                              background_style: "grey",
                            },
                            columns: [
                              {
                                name: "col_0",
                                display_name: "Provider",
                                data_type: "text",
                                text_align: "left",
                              },
                              {
                                name: "col_1",
                                display_name: "模型",
                                data_type: "text",
                                text_align: "left",
                              },
                            ],
                            rows: [
                              {
                                col_0: "rightcode",
                                col_1: "GPT-5.4",
                              },
                            ],
                          },
                        ],
                      },
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
      messageId: "om_parent_card",
      messageType: "interactive",
      text: "**Title**\n- item1\n```ts\nconsole.log('ok')\n```\nProvider | 模型\nrightcode | GPT-5.4",
    });
    expect(result?.text).not.toContain("vertical");
    expect(result?.text).not.toContain("12px 12px 12px 12px");
    expect(result?.text).not.toContain("grey");
    expect(result?.text).not.toContain("left");
  });
});
