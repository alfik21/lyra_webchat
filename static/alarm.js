(function () {
  if (window.__lyraAlarmLoaded) return;
  window.__lyraAlarmLoaded = true;

  const style = document.createElement("style");
  style.textContent = `
    .lyra-alarm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.82);
      backdrop-filter: blur(6px);
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .lyra-alarm-card {
      width: min(420px, 90vw);
      background: rgba(11, 17, 33, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 18px 20px;
      color: #e2e8f0;
      box-shadow: 0 18px 40px rgba(0,0,0,0.35);
      display: flex;
      flex-direction: column;
      gap: 12px;
      font-family: Inter, system-ui, sans-serif;
    }
    .lyra-alarm-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .lyra-alarm-row input[type=time], .lyra-alarm-row input[type=number] {
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.05);
      color: #e2e8f0;
      flex: 1;
      min-width: 120px;
    }
    .lyra-alarm-actions { display: flex; gap: 10px; justify-content: flex-end; }
    .lyra-alarm-btn {
      border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.06);
      color: #e2e8f0;
      border-radius: 10px;
      padding: 8px 12px;
      cursor: pointer;
      font-weight: 700;
    }
    .lyra-alarm-btn.primary { background: linear-gradient(135deg, #fb923c, #f97316); color: #0b1120; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "lyra-alarm-overlay";
  overlay.innerHTML = `
    <div class="lyra-alarm-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div style="font-weight:800;">Budzik Lyra</div>
        <button class="lyra-alarm-btn" id="lyra-alarm-close">×</button>
      </div>
      <div class="lyra-alarm-row">
        <label for="lyra-alarm-time" style="min-width:80px;">Godzina</label>
        <input id="lyra-alarm-time" type="time">
      </div>
      <div class="lyra-alarm-row">
        <label for="lyra-alarm-offset" style="min-width:80px;">Za (min)</label>
        <input id="lyra-alarm-offset" type="number" min="1" max="720" value="5">
      </div>
      <div class="lyra-alarm-row">
        <span id="lyra-alarm-status" style="color:#94a3b8;">Brak aktywnego budzika.</span>
      </div>
      <div class="lyra-alarm-actions">
        <button class="lyra-alarm-btn" id="lyra-alarm-stop">Stop</button>
        <button class="lyra-alarm-btn primary" id="lyra-alarm-start">Ustaw</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const elTime = overlay.querySelector("#lyra-alarm-time");
  const elOffset = overlay.querySelector("#lyra-alarm-offset");
  const elStatus = overlay.querySelector("#lyra-alarm-status");
  const btnClose = overlay.querySelector("#lyra-alarm-close");
  const btnStart = overlay.querySelector("#lyra-alarm-start");
  const btnStop = overlay.querySelector("#lyra-alarm-stop");

  let alarmTimer = null;
  let audioCtx = null;
  let beepNode = null;

  function playBeep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.1;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      beepNode = osc;
      setTimeout(() => { try { osc.stop(); } catch {} }, 2000);
    } catch (e) {
      // fallback
      alert("BUDZIK!");
    }
  }

  function clearAlarm() {
    if (alarmTimer) {
      clearTimeout(alarmTimer);
      alarmTimer = null;
    }
    elStatus.textContent = "Brak aktywnego budzika.";
  }

  function setStatus(txt) { elStatus.textContent = txt; }

  btnClose.onclick = () => { overlay.style.display = "none"; };
  btnStop.onclick = () => { clearAlarm(); if (beepNode) { try { beepNode.stop(); } catch {} } };
  btnStart.onclick = () => {
    clearAlarm();
    const hhmm = (elTime.value || "").trim();
    const offsetMin = parseInt(elOffset.value || "0", 10);
    let targetMs = 0;
    if (hhmm) {
      const [hh, mm] = hhmm.split(":").map((v) => parseInt(v || "0", 10));
      const now = new Date();
      const target = new Date();
      target.setHours(hh, mm, 0, 0);
      if (target.getTime() <= now.getTime()) target.setTime(target.getTime() + 24 * 60 * 60 * 1000);
      targetMs = target.getTime() - now.getTime();
    } else if (offsetMin > 0) {
      targetMs = offsetMin * 60 * 1000;
    }
    if (targetMs <= 0) {
      setStatus("Ustaw godzinę lub opóźnienie (min).");
      return;
    }
    alarmTimer = setTimeout(() => {
      setStatus("🔔 Budzik!"); playBeep();
    }, targetMs);
    const minLeft = Math.round(targetMs / 60000);
    setStatus(`Budzik ustawiony za ~${minLeft} min.`);
  };

  window.openLyraAlarm = () => { overlay.style.display = "flex"; };
})();
