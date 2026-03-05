# api/routes_chat.py

from flask import Flask, request, jsonify, send_from_directory, send_file, after_this_request, Response, stream_with_context
from pathlib import Path

import requests
import subprocess
from datetime import datetime
import tempfile
import os
import json
import time

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
LYRA_AGENT_DIR = Path.home() / "lyra_agent"
LYRA_AGENT_CONFIG = LYRA_AGENT_DIR / "config.json"
LYRA_AGENT_RUNTIME = LYRA_AGENT_DIR / "config" / "lyra_runtime.json"

# Lokalny serwer LLM (llama.cpp / bielik)
# UWAGA: bez nawiasów <> (requests tego nie obsłuży)
LLAMA_URL = "http://127.0.0.1:11435/completion"
LLAMA_TIMEOUT = 120

# Sesja bez proxy (system może mieć ustawiony proxy który blokuje localhost)
no_proxy_session = requests.Session()
no_proxy_session.trust_env = False


def _load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def _safe_int(value, default):
    try:
        return int(value)
    except Exception:
        return default


def _safe_float(value, default):
    try:
        return float(value)
    except Exception:
        return default


def _clamp_float(value, min_v, max_v, default):
    n = _safe_float(value, default)
    if n < min_v:
        return min_v
    if n > max_v:
        return max_v
    return n


def _llama_urls():
    primary_override = (os.environ.get("LYRA_LLAMA_URL") or "").strip()
    fallback_override = (os.environ.get("LYRA_LLAMA_FALLBACK_URL") or "").strip()
    if primary_override:
        if fallback_override and fallback_override != primary_override:
            return [primary_override, fallback_override]
        return [primary_override]

    cfg = _load_json(LYRA_AGENT_CONFIG)
    rt = _load_json(LYRA_AGENT_RUNTIME)
    host = str(cfg.get("llama_host") or "127.0.0.1")
    primary_port = _safe_int(cfg.get("llama_port"), 11435)
    cpu_port = _safe_int(rt.get("cpu_port"), 11439)
    primary = f"http://{host}:{primary_port}/completion"
    if cpu_port == primary_port:
        return [primary]
    fallback = f"http://{host}:{cpu_port}/completion"
    return [primary, fallback]


def _post_llama(payload: dict, stream: bool = False):
    last_exc = None
    attempts = []
    failures = 0
    r = None
    for url in _llama_urls():
        try:
            r = no_proxy_session.post(url, json=payload, stream=stream, timeout=LLAMA_TIMEOUT)
            r.raise_for_status()
            if failures:
                _log_fallback("fallback", f"selected={url} after {failures} failure(s)")
            return r
        except requests.RequestException as exc:
            last_exc = exc
            failures += 1
            attempts.append(f"{url}: {exc}")
            _log_fallback("failure", f"url={url} err={exc}")
            try:
                if r is not None:
                    r.close()
            except Exception:
                pass
            continue
    details = " | ".join(attempts) if attempts else "no endpoints"
    raise requests.RequestException(f"LLAMA backend unavailable ({details})") from last_exc


def _log_fallback(event: str, detail: str):
    try:
        ts = datetime.now().isoformat()
        with open("/tmp/lyra_webchat_fallback.log", "a", encoding="utf-8") as f:
            f.write(f"{ts} {event} {detail}\n")
    except Exception:
        pass

# =============================
#   POMOCNICZE
# =============================

def call_llama(prompt: str, n_predict: int = 128, temperature: float = 0.7):
    payload = {
        "prompt": prompt,
        "n_predict": n_predict,
        "temperature": temperature,
        "stop": ["</s>", "[INST]", "[/INST]"],
    }

    r = _post_llama(payload, stream=False)
    return (r.json() or {}).get("content", "")


def secure_headers(resp: Response):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "SAMEORIGIN"
    resp.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    resp.headers["Cache-Control"] = "no-store"
    return resp

# =============================
#   GŁÓWNA FABRYKA APP
# =============================

def create_app():
    app = Flask(__name__, static_folder=str(STATIC_DIR))

    @app.route("/assets/<path:filename>")
    def serve_assets(filename):
        return app.send_static_file(f"assets/{filename}")

    @app.route("/__debug/ping")
    def debug_ping():
        return jsonify({"status": "ok", "message": "Lyra API is running"})

    # Runtime config endpoints used by settings UI
    RUNTIME_FILE = BASE_DIR / "runtime.json"

    def _load_runtime():
        if not RUNTIME_FILE.exists():
            return {"config": {"input_mode": "chat", "humor_level": 3, "intel_level": 5, "tools_allowed": []}}
        try:
            with open(RUNTIME_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {"config": {"input_mode": "chat", "humor_level": 3, "intel_level": 5, "tools_allowed": []}}

    def _save_runtime(obj: dict):
        try:
            with open(RUNTIME_FILE, 'w', encoding='utf-8') as f:
                json.dump(obj, f, ensure_ascii=False, indent=2)
            return True
        except Exception:
            return False

    @app.route('/api/runtime/get', methods=['GET'])
    def api_runtime_get():
        data = _load_runtime()
        tools_all = ["tts", "voice", "camera", "fusion", "llama", "remote_camera"]
        cfg = data.get('config', {})
        return jsonify({"config": cfg, "tools_all": tools_all})

    @app.route('/api/runtime/set', methods=['POST'])
    def api_runtime_set():
        payload = request.get_json(force=True, silent=True) or {}
        data = _load_runtime()
        cfg = data.get('config', {})
        # update allowed fields
        for k in ('input_mode', 'humor_level', 'intel_level', 'tools_allowed'):
            if k in payload:
                cfg[k] = payload[k]
        data['config'] = cfg
        ok = _save_runtime(data)
        if not ok:
            return jsonify({'ok': False, 'error': 'Unable to write runtime file'}), 500
        return jsonify({'ok': True, 'config': cfg})

    @app.route("/<path:filename>")
    def serve_static_files(filename):
        return send_from_directory(STATIC_DIR, filename)

    @app.route("/<path:filename>.html")
    def serve_html(filename):
        return send_from_directory(STATIC_DIR, f"{filename}.html")

    def sse(payload: str):
        return f"data: {payload}\n\n"

    @app.route("/api/tts", methods=["POST"])
    def tts_generate():
        data = request.get_json(force=True, silent=True) or {}
        text = (data.get("text") or "").strip()
        voice = (data.get("voice") or "piper-pl-female").strip()
        tts_style = (data.get("tts_style") or "neutral").strip().lower()
        tts_rate = _clamp_float(data.get("tts_rate", 1.0), 0.6, 1.8, 1.0)
        tts_pitch = _clamp_float(data.get("tts_pitch", 1.0), 0.5, 2.0, 1.0)

        style_presets = {
            "neutral": {"rate": 1.0, "pitch": 1.0},
            "assistant": {"rate": 1.0, "pitch": 1.0},
            "calm": {"rate": 0.9, "pitch": 0.95},
            "energetic": {"rate": 1.15, "pitch": 1.05},
        }
        if tts_style not in style_presets:
            tts_style = "neutral"
        preset = style_presets.get(tts_style, style_presets["neutral"])
        resolved_rate = _clamp_float(tts_rate * preset["rate"], 0.6, 1.8, 1.0)
        resolved_pitch = _clamp_float(tts_pitch * preset["pitch"], 0.5, 2.0, 1.0)

        if not text:
            return jsonify({"error": "empty text"}), 400

        voice_models = {
            "piper-pl-female": "/models/piper/pl_PL-iza-medium.onnx",
            "piper-pl-male": "/models/piper/pl_PL-jan-medium.onnx",
        }

        model = voice_models.get(voice)
        if not model:
            return jsonify({"error": "voice not supported"}), 400

        wav_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        wav_file.close()

        try:
            length_scale = max(0.1, min(2.0, 1.0 / max(0.1, resolved_rate)))
            result = subprocess.run(
                [
                    "piper",
                    "--model",
                    model,
                    "--length_scale",
                    f"{length_scale:.3f}",
                    "--output_file",
                    wav_file.name,
                ],
                input=text.encode("utf-8"),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=True,
            )
        except FileNotFoundError:
            return jsonify({"error": "tts failed", "detail": "piper binary not found"}), 500
        except subprocess.CalledProcessError as exc:
            err = (exc.stderr or b"").decode("utf-8", "ignore")
            return jsonify({"error": "tts failed", "detail": err[:2000]}), 500

        if abs(resolved_pitch - 1.0) > 0.01:
            _log_fallback("tts_pitch_ignored", f"voice={voice} pitch={resolved_pitch}")

        @after_this_request
        def _cleanup(response):
            try:
                os.unlink(wav_file.name)
            except Exception:
                pass
            return response

        return send_file(wav_file.name, mimetype="audio/wav")

    @app.route("/api/asr", methods=["POST"])
    def api_asr():
        if "audio" in request.files:
            audio = request.files["audio"]
        elif "file" in request.files:
            audio = request.files["file"]
        else:
            return jsonify({"error": "no audio file provided"}), 400

        filename = (audio.filename or "audio.wav").lower()
        mimetype = (audio.mimetype or "").lower()
        allowed_ext = (".wav", ".ogg", ".oga", ".webm")
        allowed_mimes = ("audio/wav", "audio/x-wav", "audio/ogg", "application/ogg", "audio/webm")
        if not any(filename.endswith(ext) for ext in allowed_ext) and mimetype not in allowed_mimes:
            return jsonify({"error": "unsupported audio format; use wav/ogg"}), 400

        temp_path = None
        try:
            suffix = ".ogg" if filename.endswith((".ogg", ".oga")) else ".wav"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as temp:
                temp_path = temp.name
                audio.save(temp_path)

            cmd = None
            proc = None
            for candidate in (("whisper-cli", temp_path), ("whisper", temp_path)):
                try:
                    proc = subprocess.run(
                        list(candidate),
                        capture_output=True,
                        text=True,
                        timeout=120,
                    )
                    cmd = candidate[0]
                    break
                except FileNotFoundError:
                    continue

            if cmd is None:
                return jsonify({
                    "error": "ASR unavailable",
                    "detail": "Whisper binary not available. Install whisper-cli or whisper.",
                }), 503

            if proc is None:
                return jsonify({"error": "asr failed", "detail": "whisper process did not start"}), 500

            if proc.returncode != 0:
                detail = (proc.stderr or proc.stdout or "whisper failed").strip()[:2000]
                return jsonify({"error": "asr failed", "detail": detail}), 500

            transcript = (proc.stdout or "").strip()
            if not transcript:
                return jsonify({"error": "empty transcript"}), 400

            return jsonify({"ok": True, "transcription": transcript, "engine": cmd})
        except subprocess.TimeoutExpired:
            return jsonify({"error": "asr timeout", "detail": "Whisper execution timed out"}), 504
        except Exception as exc:
            return jsonify({"error": "asr error", "detail": str(exc)[:2000]}), 500
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except Exception:
                    pass

    @app.route("/hotword_trigger", methods=["POST"])
    def hotword_trigger():
        data = request.get_json(force=True, silent=True) or {}
        source = (data.get("source") or "unknown").strip()[:120]
        ts = (data.get("timestamp") or datetime.now().isoformat())
        try:
            with open("/tmp/hotword_trigger.log", "a", encoding="utf-8") as f:
                f.write(f"{ts} source={source}\n")
        except Exception as exc:
            return jsonify({"ok": False, "error": str(exc)}), 500
        return jsonify({"ok": True, "message": "hotword trigger received", "source": source})

    # Panel TTS (proxy) - aby uniknac CORS i hardcoded portow w JS
    PANEL_URL = "http://127.0.0.1:11446"

    @app.route('/api/tts/<path:subpath>', methods=['GET', 'POST'])
    def proxy_tts(subpath: str):
        """Proxy requests to local TTS panel to avoid cross-origin and hard-coded ports in client JS."""
        target = f"{PANEL_URL}/api/tts/{subpath}"
        def _log_tts_issue(route, status, preview=None):
            try:
                with open('/tmp/lyra_tts_proxy.log', 'a', encoding='utf-8') as lf:
                    lf.write(f"{datetime.now().isoformat()} {route} status={status}\n")
                    if preview:
                        txt = preview.replace('\n', ' ')[:400]
                        lf.write(txt + "\n")
            except Exception:
                pass

        # perform request with a couple retries to tolerate transient panel hiccups
        def _do_get(url, params=None, attempts=2):
            last_exc = None
            for i in range(attempts):
                try:
                    return no_proxy_session.get(url, params=params, timeout=10)
                except requests.RequestException as e:
                    last_exc = e
                    time.sleep(0.15)
            raise last_exc if last_exc else requests.RequestException("TTS panel GET request failed")

        def _do_post(url, data=None, headers=None, attempts=2):
            last_exc = None
            for i in range(attempts):
                try:
                    return no_proxy_session.post(url, data=data, headers=headers, timeout=30)
                except requests.RequestException as e:
                    last_exc = e
                    time.sleep(0.15)
            raise last_exc if last_exc else requests.RequestException("TTS panel POST request failed")
        try:
            if request.method == 'GET':
                r = _do_get(target, params=request.args)
                ct = (r.headers.get('Content-Type') or '').lower()
                # If panel returned HTML (likely panel down / login page), log and return JSON error to client
                if 'text/html' in ct:
                    preview = (r.text or '')[:800]
                    _log_tts_issue(target, r.status_code, preview)
                    return jsonify({"error": "TTS panel returned HTML", "status": r.status_code, "preview": preview}), 502
                return Response(r.content, status=r.status_code, content_type=r.headers.get('Content-Type', 'application/octet-stream'))
            else:
                # forward raw body (JSON or form)
                headers = {k: v for k, v in request.headers if k.lower() != 'host'}
                r = _do_post(target, data=request.get_data(), headers=headers)
                ct = (r.headers.get('Content-Type') or '').lower()
                if 'text/html' in ct:
                    preview = (r.text or '')[:800]
                    _log_tts_issue(target, r.status_code, preview)
                    return jsonify({"error": "TTS panel returned HTML", "status": r.status_code, "preview": preview}), 502
                return Response(r.content, status=r.status_code, content_type=r.headers.get('Content-Type', 'application/octet-stream'))
        except requests.RequestException as exc:
            _log_tts_issue(target, 'exception', str(exc))
            return jsonify({"error": "TTS panel unreachable", "detail": str(exc)}), 502

    # =============================
    #   CHAT + STREAM (SSE)
    # =============================

    @app.route("/v1/chat/completions", methods=["POST"])
    def chat_completions():
        data = request.get_json(force=True) or {}
        stream = bool(data.get("stream", False))
        messages = data.get("messages") or []

        user_text = (messages[-1].get("content", "") if messages else "").strip()
        if not user_text:
            return jsonify({"error": "Empty prompt"}), 400

        payload = {
            "prompt": user_text,
            "n_predict": int(data.get("max_tokens", 256) or 256),
            "temperature": float(data.get("temperature", 0.7) or 0.7),
            "stream": stream,
        }

        # ======= TRYB BEZ STREAMU =======
        if not stream:
            created = int(time.time())
            model = (data.get("model") or "bielik")

            r = _post_llama(payload, stream=False)
            content = (r.json() or {}).get("content", "")

            return jsonify({
                "id": f"lyra-chatcmpl-{created}",
                "object": "chat.completion",
                "created": created,
                "model": model,
                "choices": [{
                    "index": 0,
                    "message": {"role": "assistant", "content": content},
                    "finish_reason": "stop",
                }],
            })

        # ======= TRYB STREAM (SSE) =======
        def generate():
            created = int(time.time())

            # start chunk
            yield sse(json.dumps({
                "id": "lyra-stream",
                "object": "chat.completion.chunk",
                "created": created,
                "model": "bielik",
                "choices": [{
                    "index": 0,
                    "delta": {"role": "assistant"},
                    "finish_reason": None,
                }],
            }, ensure_ascii=False))

            final_timings = None

            with _post_llama(payload, stream=True) as r:
                r.raise_for_status()

                for line in r.iter_lines(decode_unicode=True):
                    if not line:
                        continue

                    # jeśli backend zwraca "data: {...}" (SSE), utnij prefiks
                    if line.startswith("data:"):
                        line = line[len("data:"):].strip()

                    if not line:
                        continue

                    try:
                        obj = json.loads(line)
                    except Exception:
                        continue

                    if obj.get("stop") is True:
                        final_timings = obj.get("timings") or {}
                        break

                    token_text = obj.get("content", "")
                    if not token_text:
                        continue

                    yield sse(json.dumps({
                        "id": "lyra-stream",
                        "object": "chat.completion.chunk",
                        "created": int(time.time()),
                        "model": "bielik",
                        "choices": [{
                            "index": 0,
                            "delta": {"content": token_text},
                            "finish_reason": None,
                        }],
                    }, ensure_ascii=False))

            # zakończenie + tokens/sec
            yield sse(json.dumps({
                "id": "lyra-stream",
                "object": "chat.completion.chunk",
                "created": int(time.time()),
                "model": "bielik",
                "choices": [{
                    "index": 0,
                    "delta": {},
                    "finish_reason": "stop",
                }],
                "timings": final_timings,
                "lyra_stats": {
                    "tokens_per_second": (final_timings or {}).get("predicted_per_second")
                },
            }, ensure_ascii=False))

            yield sse("[DONE]")

        resp = Response(stream_with_context(generate()), mimetype="text/event-stream")
        resp.headers["Cache-Control"] = "no-cache"
        resp.headers["X-Accel-Buffering"] = "no"
        return resp

    # =============================
    #   VOICE
    # =============================

    @app.route("/voice", methods=["POST"])
    def voice_pipeline():
        # accept either 'file' or 'audio' form field (client may send 'audio')
        if "file" in request.files:
            audio = request.files["file"]
        elif "audio" in request.files:
            audio = request.files["audio"]
        else:
            return jsonify({"error": "No audio file"}), 400

        temp_path = None
        transcript = ""
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp:
                temp_path = temp.name
                audio.save(temp_path)

            try:
                # Try common CLI names: whisper-cli then whisper
                try:
                    whisper = subprocess.run([
                        "whisper-cli", temp_path
                    ], capture_output=True, text=True, timeout=30)
                except FileNotFoundError:
                    whisper = subprocess.run([
                        "whisper", temp_path
                    ], capture_output=True, text=True, timeout=30)
                transcript = (whisper.stdout or "").strip()
            except FileNotFoundError:
                # whisper not installed — provide graceful fallback transcript so UI can continue
                transcript = "(ASR unavailable: whisper not found)"
            except Exception as e:
                return f"ASR error: {e}", 500
        finally:
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except Exception:
                    pass

        if not transcript:
            return jsonify({"error": "Empty transcript"}), 400

        # If we provided a fallback transcript because ASR binary is missing, create a friendly reply
        if str(transcript).startswith("(ASR unavailable"):
            reply = "ASR unavailable on server; install whisper to enable speech-to-text"
        else:
            reply = call_llama(transcript)

        # Try to generate TTS via local panel. If unavailable, return a small silent WAV so client can play.
        tts_bytes = None
        tts_ct = "audio/wav"
        try:
            tts_payload = {"engine": request.form.get('voice_selection') or 'piper', "voice": request.form.get('voice_selection') or '' , "text": reply}
            # call panel test endpoint to generate TTS
            panel_test = no_proxy_session.post(PANEL_URL + "/api/tts/test", json=tts_payload, timeout=10)
            panel_test.raise_for_status()
            # fetch produced file
            panel_file = no_proxy_session.get(PANEL_URL + "/api/tts/file", timeout=10)
            panel_file.raise_for_status()
            tts_bytes = panel_file.content
            tts_ct = panel_file.headers.get('Content-Type', tts_ct) or tts_ct
        except Exception:
            # fallback: generate 1s silent WAV
            import io, wave, struct
            buf = io.BytesIO()
            with wave.open(buf, 'wb') as w:
                sr = 16000
                n_seconds = 1
                n_samples = sr * n_seconds
                w.setnchannels(1)
                w.setsampwidth(2)
                w.setframerate(sr)
                # write silent frames
                silent = struct.pack('<h', 0)
                for _ in range(n_samples):
                    w.writeframes(silent)
            tts_bytes = buf.getvalue()
            tts_ct = 'audio/wav'

        # Return audio blob with transcript headers for client compatibility
        resp = Response(tts_bytes, status=200, content_type=tts_ct)
        resp.headers["X-Transcript"] = transcript
        resp.headers["X-Llm-Reply"] = reply
        return resp

    # =============================
    #   LOG HOTWORD (zachowane)
    # =============================

    @app.route("/log/hotword", methods=["POST"])
    def log_hotword():
        data = request.get_json(force=True) or {}
        wake_word = data.get("wakeWord", "")
        ts = data.get("timestamp")
        try:
            with open("/tmp/hotword.log", "a", encoding="utf-8") as f:
                f.write(f"{ts} - {wake_word}\n")
        except Exception as exc:
            return jsonify({"ok": False, "error": str(exc)}), 500
        return jsonify({"ok": True})

    # =============================
    #   STATIC (zachowane)
    # =============================

    @app.route("/")
    def index():
        return send_from_directory(STATIC_DIR, "index.html")

    @app.route("/voice.html")
    def voice_ui():
        return send_from_directory(STATIC_DIR, "voice.html")

    @app.route("/app")
    def app_page():
        return send_from_directory(STATIC_DIR / "app", "index.html")

    @app.route("/chat-app")
    def chat_app():
        return send_from_directory(STATIC_DIR / "chat-app", "index.html")

    @app.route("/chat")
    def chat():
        return send_from_directory(STATIC_DIR / "chat-app", "index.html")

    @app.route("/remote-camera")
    def remote_camera():
        return send_from_directory(STATIC_DIR, "remote-camera.html")

    @app.route("/settings.html")
    def settings_ui():
        return send_from_directory(STATIC_DIR, "settings.html")

    @app.route("/llama.html")
    def llama_ui():
        return send_from_directory(STATIC_DIR, "llama.html")

    @app.route("/tts.html")
    def tts_ui():
        return send_from_directory(STATIC_DIR, "tts.html")

    @app.route("/fusion.html")
    def fusion_ui():
        return send_from_directory(STATIC_DIR, "fusion.html")

    # ======= NAGŁÓWKI BEZPIECZEŃSTWA =======
    @app.after_request
    def add_security_headers(resp):
        return secure_headers(resp)

    return app
