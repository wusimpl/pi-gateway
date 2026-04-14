import { describe, expect, it } from "vitest";
import { renderAssistantMessage } from "../src/feishu/render.js";

describe("renderAssistantMessage", () => {
  it("纯文本应保持为 text 消息", () => {
    const messages = renderAssistantMessage("hello world", 2000);

    expect(messages).toEqual([
      {
        msgType: "text",
        content: { text: "hello world" },
      },
    ]);
  });

  it("Markdown 标题、列表和代码块应渲染为卡片 markdown 组件", () => {
    const markdown = "# Title\n\n- item1\n- item2\n\n```ts\nconsole.log('ok');\n```";
    const messages = renderAssistantMessage(markdown, 2000);

    expect(messages).toHaveLength(1);
    expect(messages[0].msgType).toBe("interactive");

    const elements = ((messages[0].content.body as any).elements ?? []) as any[];
    expect(elements).toHaveLength(1);
    expect(elements[0].tag).toBe("markdown");
    expect(elements[0].content).toContain("**Title**");
    expect(elements[0].content).toContain("- item1");
    expect(elements[0].content).toContain("```ts");
  });

  it("Markdown 表格应渲染为卡片 table 组件", () => {
    const markdown = "模型列表\n\n| Provider | 模型 |\n| --- | --- |\n| rightcode | GPT-5.4 |\n| local | MiniMax M2.5 |\n";
    const messages = renderAssistantMessage(markdown, 2000);

    expect(messages).toHaveLength(1);
    expect(messages[0].msgType).toBe("interactive");

    const elements = ((messages[0].content.body as any).elements ?? []) as any[];
    expect(elements).toHaveLength(2);
    expect(elements[0]).toMatchObject({
      tag: "markdown",
      content: "模型列表",
    });
    expect(elements[1]).toMatchObject({
      tag: "table",
      columns: [
        { name: "col_0", display_name: "Provider", data_type: "text" },
        { name: "col_1", display_name: "模型", data_type: "text" },
      ],
      rows: [
        { col_0: "rightcode", col_1: "GPT-5.4" },
        { col_0: "local", col_1: "MiniMax M2.5" },
      ],
    });
  });

  it("Markdown 内容后面追加尾巴后仍应保持卡片渲染", () => {
    const markdown = "# Title\n\n- item1\n\n4.1%/200k";
    const messages = renderAssistantMessage(markdown, 2000);

    expect(messages).toHaveLength(1);
    expect(messages[0].msgType).toBe("interactive");

    const elements = ((messages[0].content.body as any).elements ?? []) as any[];
    expect(elements).toHaveLength(1);
    expect(elements[0].tag).toBe("markdown");
    expect(elements[0].content).toContain("4.1%/200k");
  });

  it("超长纯文本应继续按 text 分块", () => {
    const messages = renderAssistantMessage("a".repeat(4005), 2000);

    expect(messages).toHaveLength(3);
    expect(messages.every((message) => message.msgType === "text")).toBe(true);
    expect(messages.map((message) => (message.content.text as string).length)).toEqual([2000, 2000, 5]);
  });
});
