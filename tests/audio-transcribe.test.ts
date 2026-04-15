import { beforeEach, describe, expect, it, vi } from "vitest";

const execFileMock = vi.hoisted(() => vi.fn());

vi.mock("node:child_process", () => ({
  execFile: execFileMock,
}));

describe("transcribeAudioFile", () => {
  beforeEach(() => {
    execFileMock.mockReset();
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
});
