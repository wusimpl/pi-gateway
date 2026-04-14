#!/usr/bin/env python3
"""Transcribe audio with SenseVoice and print only the final transcript."""

from __future__ import annotations

import argparse
import contextlib
import io
import sys


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Transcribe audio with SenseVoice")
    parser.add_argument("--audio", required=True, help="Path to the input audio file")
    parser.add_argument("--language", default="zh", help="Language hint, e.g. zh/en/auto")
    parser.add_argument("--model", default="iic/SenseVoiceSmall", help="SenseVoice model id or local path")
    parser.add_argument("--device", default="cpu", help="Inference device, e.g. cpu/cuda:0/mps")
    return parser.parse_args()


def run_transcription(audio_path: str, language: str, model_ref: str, device: str) -> str:
    import warnings

    warnings.filterwarnings("ignore")

    captured = io.StringIO()
    with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
        from funasr import AutoModel
        from funasr.utils.postprocess_utils import rich_transcription_postprocess

        model = AutoModel(
            model=model_ref,
            device=device,
            disable_update=True,
        )
        result = model.generate(
            input=audio_path,
            cache={},
            language=language,
            use_itn=True,
        )
        transcript = rich_transcription_postprocess(result[0]["text"]).strip()

    if not transcript:
        details = captured.getvalue().strip()
        if details:
            raise RuntimeError(f"SenseVoice returned empty transcript.\n{details}")
        raise RuntimeError("SenseVoice returned empty transcript.")

    return transcript


def main() -> int:
    args = parse_args()
    try:
        transcript = run_transcription(args.audio, args.language, args.model, args.device)
    except Exception as exc:  # noqa: BLE001
        print(f"SenseVoice transcription failed: {exc}", file=sys.stderr)
        return 1

    print(transcript)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
