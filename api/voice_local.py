"""
Prosty blueprint do startu/zatrzymania sesji głosowej Lyry.

Docelowo frontend może wołać:
  POST /api/voice/module   -> start nowej sesji voice (zwraca session_id/port)
  DELETE /api/voice/module?session_id=... -> zatrzymanie sesji
"""

from __future__ import annotations

from flask import Blueprint, jsonify, request

from .agent_bridge import AgentBridge

bp = Blueprint("voice_local", __name__)


@bp.route("/api/voice/module", methods=["POST"])
def start_voice_session():
    payload = request.get_json(force=True, silent=True) or {}
    conv_id = payload.get("conversation_id")
    params = payload.get("params") or {}

    bridge = AgentBridge(
        conversation_id=conv_id,
        input_device=params.get("mic"),
        output_device=params.get("speaker"),
    )
    session = bridge.start()
    return jsonify({"ok": True, **session})


@bp.route("/api/voice/module", methods=["DELETE"])
def stop_voice_session():
    session_id = request.args.get("session_id") or (request.get_json(silent=True) or {}).get("session_id")
    if not session_id:
        return {"ok": False, "error": "Brak session_id"}, 400
    AgentBridge.stop(session_id)
    return {"ok": True}

