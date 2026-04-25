import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

const execFileMock = vi.hoisted(() => vi.fn());
const fetchMock = vi.hoisted(() => vi.fn());

vi.mock("node:child_process", () => ({
  execFile: execFileMock,
}));

describe("transcribeAudioFile", () => {
  beforeEach(() => {
    execFileMock.mockReset();
    fetchMock.mockReset();
    vi.useRealTimers();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("provider=whisper 时应调用外部脚本", async () => {
    execFileMock.mockImplementation((command, args, options, callback) => {
      callback(null, { stdout: " whisper result ", stderr: "" });
    });

    const { transcribeAudioFile } = await import("../src/feishu/inbound/transform.js");
    const transcript = await transcribeAudioFile("/tmp/audio.ogg", {
      audioTranscribeProvider: "whisper",
      audioTranscribeScript: "/tmp/transcribe.sh",
      audioLanguage: "zh",
      audioTranscribeSenseVoicePython: "/tmp/.venv-sensevoice/bin/python",
      audioTranscribeSenseVoiceModel: "iic/SenseVoiceSmall",
      audioTranscribeSenseVoiceDevice: "cpu",
      audioTranscribeDoubaoApiKey: "",
    });

    expect(transcript).toBe("whisper result");
    expect(execFileMock).toHaveBeenCalledWith(
      "bash",
      ["/tmp/transcribe.sh", "/tmp/audio.ogg", "zh"],
      expect.objectContaining({ encoding: "utf8" }),
      expect.any(Function),
    );
  });

  it("provider=sensevoice 时应调用内置 SenseVoice 脚本", async () => {
    execFileMock.mockImplementation((command, args, options, callback) => {
      callback(null, { stdout: " sensevoice result ", stderr: "" });
    });

    const { transcribeAudioFile } = await import("../src/feishu/inbound/transform.js");
    const transcript = await transcribeAudioFile("/tmp/audio.ogg", {
      audioTranscribeProvider: "sensevoice",
      audioTranscribeScript: "/tmp/transcribe.sh",
      audioLanguage: "auto",
      audioTranscribeSenseVoicePython: "/tmp/.venv-sensevoice/bin/python",
      audioTranscribeSenseVoiceModel: "iic/SenseVoiceSmall",
      audioTranscribeSenseVoiceDevice: "cpu",
      audioTranscribeDoubaoApiKey: "",
    });

    expect(transcript).toBe("sensevoice result");
    expect(execFileMock).toHaveBeenCalledWith(
      "/tmp/.venv-sensevoice/bin/python",
      expect.arrayContaining([
        "--audio",
        "/tmp/audio.ogg",
        "--language",
        "auto",
        "--model",
        "iic/SenseVoiceSmall",
        "--device",
        "cpu",
      ]),
      expect.objectContaining({ encoding: "utf8" }),
      expect.any(Function),
    );
    const args = execFileMock.mock.calls[0]?.[1];
    expect(String(args[0]).replace(/\\/g, "/")).toMatch(/scripts\/sensevoice_transcribe\.py$/);
  });

  it("provider=doubao 时应调用录音文件2.0标准版 submit/query 接口", async () => {
    const workdir = await mkdtemp(join(tmpdir(), "pi-gateway-doubao-"));
    const audioPath = join(workdir, "audio.ogg");
    await writeFile(audioPath, Buffer.from("fake-audio"));

    fetchMock
      .mockResolvedValueOnce(
        new Response("", {
          status: 200,
          headers: {
            "X-Api-Status-Code": "20000000",
            "X-Api-Message": "OK",
            "X-Tt-Logid": "submit-logid",
          },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            result: {
              text: "豆包转写结果",
            },
          }),
          {
            status: 200,
            headers: {
              "X-Api-Status-Code": "20000000",
              "X-Api-Message": "OK",
              "X-Tt-Logid": "query-logid",
            },
          },
        ),
      );

    const { transcribeAudioFile } = await import("../src/feishu/inbound/transform.js");
    const transcript = await transcribeAudioFile(audioPath, {
      audioTranscribeProvider: "doubao",
      audioTranscribeScript: "/tmp/transcribe.sh",
      audioLanguage: "zh",
      audioTranscribeSenseVoicePython: "/tmp/.venv-sensevoice/bin/python",
      audioTranscribeSenseVoiceModel: "iic/SenseVoiceSmall",
      audioTranscribeSenseVoiceDevice: "cpu",
      audioTranscribeDoubaoApiKey: "doubao-api-key",
    });

    expect(transcript).toBe("豆包转写结果");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const [submitUrl, submitInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(submitUrl).toBe("https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit");
    expect(submitInit.method).toBe("POST");
    expect(submitInit.headers).toEqual(
      expect.objectContaining({
        "Content-Type": "application/json",
        "X-Api-Key": "doubao-api-key",
        "X-Api-Resource-Id": "volc.seedasr.auc",
        "X-Api-Sequence": "-1",
      }),
    );

    const submitBody = JSON.parse(String(submitInit.body));
    expect(submitBody).toEqual(
      expect.objectContaining({
        user: { uid: "pi-gateway" },
        request: { model_name: "bigmodel", enable_ddc: false, show_utterances: true },
      }),
    );
    expect(submitBody.audio.data).toBe(Buffer.from("fake-audio").toString("base64"));
    expect(submitBody.audio.format).toBe("ogg");
    expect(submitBody.audio.codec).toBe("opus");
    expect(submitBody.audio.language).toBe("zh");

    const [queryUrl, queryInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(queryUrl).toBe("https://openspeech.bytedance.com/api/v3/auc/bigmodel/query");
    expect(queryInit.method).toBe("POST");
    expect(queryInit.headers).toEqual(
      expect.objectContaining({
        "Content-Type": "application/json",
        "X-Api-Key": "doubao-api-key",
        "X-Api-Resource-Id": "volc.seedasr.auc",
      }),
    );
    expect(queryInit.headers).not.toEqual(expect.objectContaining({ "X-Api-Sequence": "-1" }));
  });

  it("provider=doubao 时应在请求前拦截不支持的 m4a 格式", async () => {
    const workdir = await mkdtemp(join(tmpdir(), "pi-gateway-doubao-m4a-"));
    const audioPath = join(workdir, "audio.m4a");
    await writeFile(audioPath, Buffer.from("fake-audio"));

    const { transcribeAudioFile } = await import("../src/feishu/inbound/transform.js");

    await expect(
      transcribeAudioFile(
        audioPath,
        {
          audioTranscribeProvider: "doubao",
          audioTranscribeScript: "/tmp/transcribe.sh",
          audioLanguage: "zh",
          audioTranscribeSenseVoicePython: "/tmp/.venv-sensevoice/bin/python",
          audioTranscribeSenseVoiceModel: "iic/SenseVoiceSmall",
          audioTranscribeSenseVoiceDevice: "cpu",
          audioTranscribeDoubaoApiKey: "doubao-api-key",
        },
        "audio/mp4",
      ),
    ).rejects.toThrow("豆包语音暂不支持当前音频格式");

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
