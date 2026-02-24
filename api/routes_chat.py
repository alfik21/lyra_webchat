    except subprocess.CalledProcessError as exc:
        err = getattr(exc, "stderr", "") or ""
        if isinstance(err, bytes):
            details = err.decode(errors="ignore")[-400:]
        else:
            details = str(err)[-400:]
        return jsonify({"ok": False, "error": f"Błąd ASR/TTS: {details}"}), 500
