#!/usr/bin/env python3
import os
import time
import json
import logging


def _fail_import(name: str, exc: Exception) -> None:
    print(f"[lyra-hotword] Missing dependency: {name}: {exc}")
    print("[lyra-hotword] Install: pip install openwakeword sounddevice numpy requests webrtcvad")
    raise SystemExit(1)


try:
    import numpy as np
except Exception as exc:
    _fail_import("numpy", exc)

try:
    import sounddevice as sd
except Exception as exc:
    _fail_import("sounddevice", exc)

try:
    import requests
except Exception as exc:
    _fail_import("requests", exc)

try:
    from openwakeword.model import Model
except Exception as exc:
    _fail_import("openwakeword", exc)


def _env(name: str, default: str) -> str:
    value = os.environ.get(name)
    return value if value is not None and value != "" else default


def _env_float(name: str, default: float) -> float:
    try:
        return float(os.environ.get(name, default))
    except Exception:
        return default


def _env_int(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, default))
    except Exception:
        return default


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(message)s")

    hotword_name = _env("LYRA_HOTWORD_NAME", "lyra").strip() or "lyra"
    hotword_model = _env("LYRA_HOTWORD_MODEL", "").strip()
    trigger_url = _env("LYRA_HOTWORD_TRIGGER_URL", "http://127.0.0.1:11447/hotword_trigger").strip()
    threshold = _env_float("LYRA_HOTWORD_THRESHOLD", 0.6)
    cooldown_sec = _env_float("LYRA_HOTWORD_COOLDOWN_SEC", 2.0)
    sample_rate = _env_int("LYRA_HOTWORD_SAMPLE_RATE", 16000)
    block_ms = _env_int("LYRA_HOTWORD_BLOCK_MS", 500)
    device = _env("LYRA_HOTWORD_DEVICE", "").strip()
    use_vad = _env_bool("LYRA_HOTWORD_VAD", True)
    vad_mode = _env_int("LYRA_HOTWORD_VAD_MODE", 2)
    vad_frame_ms = _env_int("LYRA_HOTWORD_VAD_FRAME_MS", 30)
    vad_min_frames = _env_int("LYRA_HOTWORD_VAD_MIN_FRAMES", 2)
    vad_hangover_ms = _env_int("LYRA_HOTWORD_VAD_HANGOVER_MS", 250)

    if device:
        sd.default.device = device

    if vad_frame_ms not in (10, 20, 30):
        vad_frame_ms = 30

    vad = None
    if use_vad:
        try:
            import webrtcvad
        except Exception as exc:
            logging.warning("VAD disabled (missing webrtcvad): %s", exc)
            use_vad = False
        else:
            if sample_rate not in (8000, 16000, 32000, 48000):
                logging.warning("VAD disabled (unsupported sample rate: %s)", sample_rate)
                use_vad = False
            else:
                vad = webrtcvad.Vad(vad_mode)

    hotword_samples = max(256, int(sample_rate * block_ms / 1000))
    vad_samples = max(160, int(sample_rate * vad_frame_ms / 1000))
    blocksize = vad_samples if use_vad else hotword_samples

    model_spec = hotword_model if hotword_model else hotword_name
    try:
        model = Model(wakeword_models=[model_spec])
    except Exception as exc:
        logging.error("Failed to load openWakeWord model '%s': %s", model_spec, exc)
        raise SystemExit(2)

    label = hotword_name
    try:
        probe = np.zeros(blocksize, dtype=np.float32)
        pred = model.predict(probe)
        if label not in pred and len(pred) == 1:
            label = list(pred.keys())[0]
    except Exception:
        pass

    if use_vad:
        logging.info(
            "Hotword listening (%s). VAD=%s mode=%s frame=%sms min_frames=%s hangover=%sms",
            label,
            use_vad,
            vad_mode,
            vad_frame_ms,
            vad_min_frames,
            vad_hangover_ms,
        )
    else:
        logging.info("Hotword listening (%s). Trigger URL: %s", label, trigger_url)

    last_trigger = 0.0
    speech_frames = 0
    speech_hold = 0
    buffer = np.zeros(0, dtype=np.float32)

    def callback(indata, frames, time_info, status):
        nonlocal last_trigger, speech_frames, speech_hold, buffer
        if status:
            logging.warning("Audio status: %s", status)

        audio = indata[:, 0].astype(np.float32)

        if use_vad and vad is not None:
            audio_i16 = (audio * 32767.0).astype(np.int16)
            is_speech = vad.is_speech(audio_i16.tobytes(), sample_rate)
            if is_speech:
                speech_frames = min(speech_frames + 1, vad_min_frames)
                speech_hold = max(1, int(vad_hangover_ms / vad_frame_ms))
            else:
                if speech_hold > 0:
                    speech_hold -= 1
                else:
                    speech_frames = 0

            if speech_frames < vad_min_frames and speech_hold == 0:
                buffer = np.zeros(0, dtype=np.float32)
                return

        buffer = np.concatenate((buffer, audio))
        if buffer.size < hotword_samples:
            return

        chunk = buffer[-hotword_samples:]
        buffer = chunk

        try:
            prediction = model.predict(chunk)
        except Exception as exc:
            logging.error("Prediction error: %s", exc)
            return

        score = float(prediction.get(label, 0.0))
        now = time.time()
        if score >= threshold and (now - last_trigger) >= cooldown_sec:
            last_trigger = now
            payload = {
                "wakeword": label,
                "score": score,
                "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
            }
            try:
                requests.post(trigger_url, json=payload, timeout=2)
                logging.info("Hotword detected (score=%.3f)", score)
            except Exception as exc:
                logging.error("Trigger POST failed: %s", exc)

    with sd.InputStream(
        channels=1,
        samplerate=sample_rate,
        blocksize=blocksize,
        callback=callback,
        dtype="float32",
    ):
        while True:
            sd.sleep(1000)


if __name__ == "__main__":
    main()
