import { describe, expect, it, vi } from "vitest";
import { computeNextRunAtMs, parseScheduleInput } from "../src/cron/schedule.js";

describe("cron schedule", () => {
  it("相对时间会解析成一次性任务", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-16T12:00:00.000+08:00"));

    const parsed = parseScheduleInput("20m", "Asia/Shanghai");

    expect(parsed).toEqual({
      schedule: {
        kind: "at",
        atMs: Date.parse("2026-04-16T12:20:00.000+08:00"),
      },
      deleteAfterRun: true,
    });

    vi.useRealTimers();
  });

  it("cron 表达式会保留时区并默认不删", () => {
    const parsed = parseScheduleInput("0 9 * * *", "Asia/Shanghai");

    expect(parsed).toEqual({
      schedule: {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      deleteAfterRun: false,
    });
  });

  it("能算出 cron 的下次执行时间", () => {
    const nextRunAtMs = computeNextRunAtMs(
      {
        kind: "cron",
        expr: "0 9 * * *",
        tz: "Asia/Shanghai",
      },
      Date.parse("2026-04-16T08:00:00.000+08:00"),
    );

    expect(nextRunAtMs).toBe(Date.parse("2026-04-16T09:00:00.000+08:00"));
  });

  it("非法 cron 会直接报错", () => {
    expect(() => parseScheduleInput("not-a-cron", "Asia/Shanghai")).toThrow();
  });
});

