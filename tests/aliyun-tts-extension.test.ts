import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createAliyunTtsExtension } from "../src/pi/extensions/aliyun-tts.js";

const tmpDirs: string[] = [];

async function createTempWorkspace() {
  const dir = await mkdtemp(join(tmpdir(), "pi-gateway-tts-"));
  tmpDirs.push(dir);
  return dir;
}

function collectTools(fetchMock: typeof fetch, overrides?: Record<string, unknown>) {
  const tools: any[] = [];
  createAliyunTtsExtension({
    apiKey: "dashscope-key",
    baseUrl: "https://dashscope.test/api/v1",
    model: "cosyvoice-v3-flash",
    voice: "longanyang",
    format: "mp3",
    sampleRate: 24000,
    fetch: fetchMock,
    ...overrides,
  })({
    registerTool(tool) {
      tools.push(tool);
    },
  } as any);

  return tools;
}

function createToolContext(cwd: string) {
  return {
    cwd,
    sessionManager: {
      getBranch: () => [],
    },
  };
}

describe("aliyun tts extension", () => {
  afterEach(async () => {
    await Promise.all(tmpDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("会注册语音合成、声音复刻和音色查询工具", () => {
    const tools = collectTools(vi.fn() as any);

    expect(tools.map((tool) => tool.name)).toEqual([
      "tts_synthesize",
      "tts_clone_voice",
      "tts_query_voice",
    ]);
  });

  it("语音合成会调用阿里云并把音频下载到 workspace", async () => {
    const audioBytes = Buffer.from("audio-bytes");
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/services/audio/tts/SpeechSynthesizer")) {
        return new Response(JSON.stringify({
          request_id: "req_1",
          output: {
            audio: {
              url: "https://audio.test/result.mp3",
              id: "audio_1",
              expires_at: 1780000000,
            },
          },
        }), { status: 200 });
      }

      expect(url).toBe("https://audio.test/result.mp3");
      expect(init?.signal).toBeUndefined();
      return new Response(audioBytes, { status: 200 });
    }) as any;
    const tools = collectTools(fetchMock);
    const synthesizeTool = tools.find((tool) => tool.name === "tts_synthesize");
    const cwd = await createTempWorkspace();

    const result = await synthesizeTool.execute(
      "call-1",
      {
        text: "你好",
        output_name: "hello.mp3",
        voice: "voice_1",
        language: "zh",
        rate: 1.1,
      },
      undefined,
      undefined,
      createToolContext(cwd),
    );

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://dashscope.test/api/v1/services/audio/tts/SpeechSynthesizer");
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toEqual({
      model: "cosyvoice-v3-flash",
      input: {
        text: "你好",
        voice: "voice_1",
        format: "mp3",
        sample_rate: 24000,
        rate: 1.1,
        language_hints: ["zh"],
      },
    });
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer dashscope-key",
      "Content-Type": "application/json",
    });
    expect(await readFile(join(cwd, "tts/hello.mp3"))).toEqual(audioBytes);
    expect(result.details).toMatchObject({
      path: join(cwd, "tts/hello.mp3"),
      request_id: "req_1",
      audio_id: "audio_1",
      size_bytes: audioBytes.length,
    });
  });

  it("语音合成默认使用固定音色和偏慢语速", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/services/audio/tts/SpeechSynthesizer")) {
        return new Response(JSON.stringify({
          request_id: "req_default",
          output: {
            audio: {
              data: Buffer.from("audio-bytes").toString("base64"),
            },
          },
        }), { status: 200 });
      }
      throw new Error(`unexpected url: ${url}`);
    }) as any;
    const tools = collectTools(fetchMock, { voice: undefined });
    const synthesizeTool = tools.find((tool) => tool.name === "tts_synthesize");
    const cwd = await createTempWorkspace();

    await synthesizeTool.execute(
      "call-1",
      {
        text: "你好",
        output_name: "default.mp3",
      },
      undefined,
      undefined,
      createToolContext(cwd),
    );

    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toEqual({
      model: "cosyvoice-v3-flash",
      input: {
        text: "你好",
        voice: "longlaoyi_v3",
        format: "mp3",
        sample_rate: 24000,
        rate: 0.85,
      },
    });
  });

  it("声音复刻会用公网音频 URL 创建 voice_id", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      request_id: "req_clone",
      output: {
        voice_id: "cosyvoice-v3-flash-buffett-abc123",
        target_model: "cosyvoice-v3-flash",
      },
    }), { status: 200 })) as any;
    const tools = collectTools(fetchMock);
    const cloneTool = tools.find((tool) => tool.name === "tts_clone_voice");

    const result = await cloneTool.execute(
      "call-1",
      {
        audio_url: "https://example.com/buffett.wav",
        prefix: "buffett",
        language: "en",
        max_prompt_audio_length: 25,
        enable_preprocess: true,
      },
      undefined,
      undefined,
      createToolContext("/tmp/workspace"),
    );

    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toEqual({
      model: "voice-enrollment",
      input: {
        action: "create_voice",
        target_model: "cosyvoice-v3-flash",
        prefix: "buffett",
        url: "https://example.com/buffett.wav",
        language_hints: ["en"],
        max_prompt_audio_length: 25,
        enable_preprocess: true,
      },
    });
    expect(result.details.voice_id).toBe("cosyvoice-v3-flash-buffett-abc123");
  });

  it("可以查询 voice_id 状态", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      request_id: "req_query",
      output: {
        status: "OK",
        target_model: "cosyvoice-v3-flash",
        resource_link: "https://example.com/buffett.wav",
      },
    }), { status: 200 })) as any;
    const tools = collectTools(fetchMock);
    const queryTool = tools.find((tool) => tool.name === "tts_query_voice");

    const result = await queryTool.execute(
      "call-1",
      { voice_id: "voice_1" },
      undefined,
      undefined,
      createToolContext("/tmp/workspace"),
    );

    expect(JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string)).toEqual({
      model: "voice-enrollment",
      input: {
        action: "query_voice",
        voice_id: "voice_1",
      },
    });
    expect(result.details).toMatchObject({
      voice_id: "voice_1",
      status: "OK",
    });
  });

  it("缺少 API Key 时会直接报错", async () => {
    const tools = collectTools(vi.fn() as any, { apiKey: "" });
    const synthesizeTool = tools.find((tool) => tool.name === "tts_synthesize");

    await expect(
      synthesizeTool.execute(
        "call-1",
        { text: "你好" },
        undefined,
        undefined,
        createToolContext("/tmp/workspace"),
      ),
    ).rejects.toThrow("DASHSCOPE_API_KEY");
  });

  it("输出路径不能越出 workspace", async () => {
    const tools = collectTools(vi.fn() as any);
    const synthesizeTool = tools.find((tool) => tool.name === "tts_synthesize");

    await expect(
      synthesizeTool.execute(
        "call-1",
        { text: "你好", output_dir: "../outside" },
        undefined,
        undefined,
        createToolContext("/tmp/workspace"),
      ),
    ).rejects.toThrow("路径必须在当前 workspace 里");
  });
});
