"""
Most startujący instancję Lyry w trybie głosowym.

Na razie to bezpieczny szkielet: uruchamiamy agent.py z przekazanymi
parametrami (session-id / conversation / urządzenia audio), przechowujemy
uchwyt do procesu i zwracamy dane startowe dla frontu.
"""

from __future__ import annotations

import json
import select
import subprocess
import time
import uuid
from pathlib import Path
from typing import Dict, Optional, Tuple

LYRA_AGENT_DIR = Path.home() / "lyra_agent"
AGENT_PY = LYRA_AGENT_DIR / "agent.py"


class AgentBridge:
    _sessions: Dict[str, subprocess.Popen] = {}

    def __init__(
        self,
        conversation_id: Optional[str] = None,
        input_device: Optional[str] = None,
        output_device: Optional[str] = None,
    ) -> None:
        self.conversation_id = conversation_id
        self.input_device = input_device
        self.output_device = output_device

    def start(self) -> dict:
        """
        Startuje proces agent.py w trybie głosowym.

        UWAGA: Jeżeli agent.py nie obsługuje poniższych flag, trzeba będzie
        dostosować listę argumentów.
        """
        session_id = str(uuid.uuid4())

        cmd = [
            "python3",
            str(AGENT_PY),
            "--mode",
            "voice",
            "--session-id",
            session_id,
        ]

        if self.conversation_id:
            cmd += ["--conversation", self.conversation_id]
        if self.input_device:
            cmd += ["--mic", self.input_device]
        if self.output_device:
            cmd += ["--speaker", self.output_device]

        proc = subprocess.Popen(
            cmd,
            cwd=str(LYRA_AGENT_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        AgentBridge._sessions[session_id] = proc

        port, ws_path = self._read_endpoint_from_stdout(proc)
        return {
            "session_id": session_id,
            "port": port,
            "ws": ws_path,
            "hint": "voice session uruchomiona",
        }

    @classmethod
    def stop(cls, session_id: str) -> None:
        proc = cls._sessions.pop(session_id, None)
        if proc and proc.poll() is None:
            proc.terminate()

    @staticmethod
    def _read_endpoint_from_stdout(proc: subprocess.Popen) -> Tuple[Optional[int], Optional[str]]:
        """
        Próbuje wczytać z pierwszych linii stdout JSON z portem/ws.
        Oczekiwany format wypisywany przez agent.py:
          {"port": 11888, "ws": "/events"}
        Jeśli nic nie uda się odczytać w 5 sekund – zwraca (None, None).
        """
        if not proc.stdout:
            return None, None

        deadline = time.time() + 5.0
        while time.time() < deadline:
            # select na stdout, żeby nie zablokować
            rlist, _, _ = select.select([proc.stdout], [], [], 0.2)
            if not rlist:
                continue
            line = proc.stdout.readline()
            if not line:
                continue
            line = line.strip()
            try:
                obj = json.loads(line)
                port = obj.get("port")
                ws_path = obj.get("ws") or obj.get("path")
                try:
                    port = int(port) if port is not None else None
                except Exception:
                    port = None
                return port, ws_path
            except Exception:
                # nieprawidłowa linia – lecimy dalej
                continue
        return None, None
