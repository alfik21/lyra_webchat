(() => {
  const CSS = `
    .voice-fab {
      position: fixed;
      right: 28px;
      bottom: 28px;
      width: 60px;
      height: 60px;
      border: none;
      border-radius: 50%;
      background: radial-gradient(circle, #fb923c, #f97316);
      color: #0b1120;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 14px 30px rgba(249, 115, 22, 0.45);
      z-index: 10005;
    }
    .voice-modal {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    .voice-modal.visible {
      display: flex;
    }
    .voice-modal-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(6px);
    }
    .voice-modal-panel {
      position: relative;
      width: min(420px, 95vw);
      max-height: 90vh;
      background: #0b1224;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      color: #e2e8f0;
      box-shadow: 0 40px 90px rgba(0, 0, 0, 0.55);
      z-index: 2;
      overflow: hidden;
    }
    .voice-modal-panel header {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .voice-face {
      font-size: 2.2rem;
    }
    .voice-modal-close {
      margin-left: auto;
      background: transparent;
      border: none;
      font-size: 1.4rem;
      color: #94a3b8;
      cursor: pointer;
    }
    .voice-meters {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }
    .voice-meter {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.85rem;
      color: #cbd5f5;
    }
    .voice-meter select,
    .voice-meter input[type="range"] {
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.25);
      background: rgba(255, 255, 255, 0.05);
      color: #e2e8f0;
      padding: 6px 10px;
    }
    .voice-meter input[type="range"] {
      accent-color: #fb923c;
    }
    .voice-settings {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 10px;
    }
    .voice-mixer {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(15, 23, 42, 0.8);
    }
    .voice-mixer span {
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .voice-checkboxes {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .voice-checkboxes label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: #e2e8f0;
    }
    .voice-filter-line {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding-bottom: 6px;
    }
    .voice-filter-slider {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .voice-filter-slider input[type="range"] {
      flex: 1;
    }
    .voice-slider-block {
      padding: 10px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.02);
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.85rem;
      color: #cbd5f5;
    }
    .voice-slider-block input[type="range"] {
      width: 100%;
      accent-color: #fb923c;
    }
    .voice-slider-block span {
      font-size: 0.75rem;
      color: #94a3b8;
    }
    .voice-meter-meter {
      width: 100%;
      height: 10px;
      border-radius: 999px;
      background: rgba(226, 232, 240, 0.13);
      overflow: hidden;
    }
    .voice-meter-level {
      width: 0;
      height: 100%;
      background: linear-gradient(135deg, #34d399, #10b981);
      transition: width 0.1s ease;
    }
    .voice-smeter {
      font-size: 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;
      color: #94a3b8;
    }
    .voice-smeter strong {
      font-size: 0.85rem;
      color: #fb923c;
    }
    .voice-hotword {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 12px;
      padding: 10px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.85rem;
      color: #e2e8f0;
    }
    .voice-hotword input[type="text"] {
      width: 100%;
      padding: 6px 10px;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.5);
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }
    .voice-hotword-status {
      font-size: 0.8rem;
      color: #22c55e;
      padding: 6px 8px;
      border-radius: 10px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .voice-bridge {
      margin-top: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.85rem;
    }
    .voice-bridge-entry {
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      max-width: 75%;
      word-break: break-word;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
    }
    .voice-bridge-entry.user {
      align-self: flex-end;
      background: rgba(37, 99, 235, 0.18);
      color: #bfdbfe;
    }
    .voice-bridge-entry.lyra {
      align-self: flex-start;
      background: rgba(6, 182, 212, 0.12);
      color: #cffafe;
    }
    .voice-hotword {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 12px;
      padding: 10px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.85rem;
      color: #e2e8f0;
    }
    .voice-hotword input[type="text"] {
      width: 100%;
      padding: 6px 10px;
      border-radius: 10px;
      border: 1px solid rgba(148, 163, 184, 0.5);
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }
    .voice-hotword-status {
      font-size: 0.8rem;
      color: #22c55e;
      padding: 6px 8px;
      border-radius: 10px;
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .voice-bridge {
      margin-top: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.85rem;
    }
    .voice-bridge-entry {
      padding: 8px 12px;
      border-radius: 12px;
      font-size: 0.85rem;
      max-width: 75%;
      word-break: break-word;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
    }
    .voice-bridge-entry.user {
      align-self: flex-end;
      background: rgba(37, 99, 235, 0.18);
      color: #bfdbfe;
    }
    .voice-bridge-entry.lyra {
      align-self: flex-start;
      background: rgba(6, 182, 212, 0.12);
      color: #cffafe;
    }
    .voice-controls {
      display: flex;
      gap: 10px;
    }
    .voice-controls button {
      flex: 1;
      border: none;
      border-radius: 999px;
      padding: 10px 0;
      font-weight: 700;
      cursor: pointer;
      font-size: 0.9rem;
    }
    .voice-controls .btn-start {
      background: linear-gradient(135deg, #22d3ee, #3b82f6);
      color: #fff;
      transition: background 160ms ease, color 160ms ease;
    }
    .voice-controls .btn-stop {
      background: rgba(255, 255, 255, 0.05);
      color: #fb923c;
      border: 1px solid rgba(251, 146, 60, 0.4);
    }
    .voice-controls .btn-start.active {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: #fff;
    }
    @media (max-width: 600px) {
      .voice-modal-panel {
        width: min(92vw, 420px);
        max-height: 96vh;
        padding: 16px;
      }
      .voice-controls {
        flex-direction: column;
      }
      .voice-meter select,
      .voice-meter input[type="range"],
      .voice-slider-block input[type="range"] {
        width: 100%;
      }
      .voice-meter-meter {
        height: 8px;
      }
    }
    .voice-log {
      font-size: 0.82rem;
      font-family: "JetBrains Mono", monospace;
      min-height: 30px;
      border-radius: 10px;
      padding: 5px 10px;
      background: rgba(255, 255, 255, 0.05);
    }
  `;

  const addStyles = () => {
    const style = document.createElement("style");
    style.setAttribute("id", "voice-modal-styles");
    style.textContent = CSS;
    document.head.appendChild(style);
  };

  const createModal = () => {
    const modal = document.createElement("div");
    modal.className = "voice-modal";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="voice-modal-backdrop" data-close="true"></div>
      <section class="voice-modal-panel">
        <header>
          <div class="voice-face" id="voiceFace">😌</div>
          <div>
            <h3>Rozmowa głosowa z Lyrą</h3>
            <p style="margin:0;font-size:0.82rem;opacity:0.8;">Live ASR → chat → TTS</p>
          </div>
          <button class="voice-modal-close" data-close="true">×</button>
        </header>
        <div class="voice-meters">
            <div class="voice-meter">
              <label for="voiceMicSelect">Mikrofon</label>
              <select id="voiceMicSelect" name="voiceMicSelect"></select>
              <button class="voice-refresh" id="refreshMics" type="button">Odśwież</button>
            </div>
            <div class="voice-meter">
              <label for="voiceOutputSelect">Wyjście</label>
              <select id="voiceOutputSelect" name="voiceOutputSelect"></select>
            </div>
            <div class="voice-meter">
              <label for="voiceVolume">Głośność</label>
              <input type="range" id="voiceVolume" name="voiceVolume" min="0" max="1" step="0.01" value="0.8" />
            </div>
            <div class="voice-meter">
              <label for="voiceSensitivity">Czułość</label>
              <input type="range" id="voiceSensitivity" name="voiceSensitivity" min="0.1" max="1" step="0.05" value="0.5" />
            </div>
        </div>
            <div class="voice-mixer">
          <label for="voiceMicGain">Gain mikrofonu</label>
          <input type="range" id="voiceMicGain" name="voiceMicGain" min="0.5" max="2" step="0.05" value="1" />
          <span id="voiceMicGainValue">100%</span>
        </div>
        <div class="voice-settings">
        <div class="voice-checkboxes">
            <div class="voice-filter-line">
            <label class="voice-checkbox-item">
              <input type="checkbox" id="voiceEcho" name="voiceEcho" checked />
              Echo cancellation
            </label>
            <div class="voice-filter-slider">
              <input type="range" id="voiceEchoStrength" name="voiceEchoStrength" min="0" max="1" step="0.05" value="0.8" />
              <span id="voiceEchoStrengthValue">80%</span>
            </div>
          </div>
          <div class="voice-filter-line">
            <label class="voice-checkbox-item">
              <input type="checkbox" id="voiceNoise" name="voiceNoise" checked />
              Redukcja szumów
            </label>
            <div class="voice-filter-slider">
              <input type="range" id="voiceNoiseStrength" name="voiceNoiseStrength" min="0" max="1" step="0.05" value="0.8" />
              <span id="voiceNoiseStrengthValue">80%</span>
            </div>
          </div>
          <div class="voice-filter-line">
            <label class="voice-checkbox-item">
              <input type="checkbox" id="voiceAgc" name="voiceAgc" checked />
              Auto gain control
            </label>
            <div class="voice-filter-slider">
              <input type="range" id="voiceAgcStrength" name="voiceAgcStrength" min="0" max="1" step="0.05" value="0.8" />
              <span id="voiceAgcStrengthValue">80%</span>
            </div>
          </div>
        </div>
          <div class="voice-slider-block">
            <label for="voiceSpeechDuration">Długość mowy (max 1000 s)</label>
            <input type="range" id="voiceSpeechDuration" min="1" max="1000" step="1" value="6" />
            <span id="voiceSpeechDurationValue">6 s</span>
          </div>
        </div>
        <div class="voice-meter-meter">
          <div class="voice-meter-level" id="voiceMeterLevel"></div>
        </div>
        <div class="voice-smeter">
          <span>S-metr</span>
          <strong id="voiceSmeterValue">0.0 dB</strong>
        </div>
        <div class="voice-controls">
          <button id="voiceStart" class="btn-start">Włącz mikrofon</button>
          <button id="voiceStop" class="btn-stop" disabled>Wyłącz</button>
        </div>
        <div class="voice-log" id="voiceLog">Gotowe.</div>
        <audio id="voiceResponse" autoplay playsinline></audio>
      </section>
    `;
    document.body.appendChild(modal);
    return modal;
  };

  const createFab = () => {
    const button = document.createElement("button");
    button.className = "voice-fab";
    button.id = "voiceFab";
    button.textContent = "Mów";
    button.title = "Rozpocznij rozmowę głosową";
    document.body.appendChild(button);
    return button;
  };

  const setupLiveSession = () => {
    let modal, meterLevel, startBtn, stopBtn, face, logEl, responseAudio, volumeSlider, sensitivitySlider;
    let micSelect, refreshMicsBtn, outputSelect;
    let echoCheckbox, noiseCheckbox, agcCheckbox, speechDurationSlider, speechDurationValue;
    let echoSlider, noiseSlider, agcSlider;
    let echoSliderValue, noiseSliderValue, agcSliderValue;
    let micGainSlider = null;
    let micGainValue = null;
    let speakButton = null;
    let closeButtons = [];
    let smeterValue = null;
    let liveStream = null;
    let recorder = null;
    let audioCtx = null;
    let gainNode = null;
    let meterFrame = 0;
    let analyserNode = null;
    let sessionTimeoutId = null;
    let shouldRestartAfterResponse = false;
    let isLive = false;
    const MIC_STORAGE_KEY = "lyra_voice_selected_mic";
    const OUTPUT_STORAGE_KEY = "lyra_voice_selected_output";
    const STORAGE_KEYS = {
      echo: "lyra_voice_modal_echo",
      noise: "lyra_voice_modal_noise",
      agc: "lyra_voice_modal_agc",
      duration: "lyra_voice_modal_duration",
      volume: "lyra_voice_modal_volume",
      sensitivity: "lyra_voice_modal_sensitivity",
      micGain: "lyra_voice_modal_mic_gain",
      echoStrength: "lyra_voice_modal_echo_strength",
      noiseStrength: "lyra_voice_modal_noise_strength",
      agcStrength: "lyra_voice_modal_agc_strength",
    };

    const clamp = (val) => Math.min(100, Math.max(0, val));

    const setLog = (text) => {
      if (logEl) logEl.textContent = text;
    };

    const filterStrengths = {
      echo: 0.8,
      noise: 0.8,
      agc: 0.8,
    };

    const getMicGain = () => {
      const volume = Number(volumeSlider?.value || 0.8);
      const sensitivity = Number(sensitivitySlider?.value || 0.5);
      const micGain = Number(micGainSlider?.value || 1);
      const agcBoost = 0.6 + filterStrengths.agc * 0.6;
      const noiseBias = 1 + filterStrengths.noise * 0.5;
      const base = volume * (0.3 + sensitivity * 0.7);
      const gain = Math.min(3.5, Math.max(0.1, base * agcBoost * noiseBias * micGain));
      return gain;
    };

    const applyGain = () => {
      const gain = getMicGain();
      if (gainNode && audioCtx) {
        gainNode.gain.setValueAtTime(gain + filterStrengths.echo * 0.1, audioCtx.currentTime);
      }
      if (responseAudio) {
        responseAudio.volume = Math.min(1, Number(volumeSlider?.value || 0.8));
      }
    };

    const loadBool = (key, def = true) => {
      const value = localStorage.getItem(key);
      if (value === null) return def;
      return value === "1";
    };

    const loadNumber = (key, def) => {
      const value = localStorage.getItem(key);
      if (value === null) return def;
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : def;
    };

    const formatPercent = (value) => `${Math.round(value * 100)}%`;

    const updateFilterSliderLabel = (value, labelEl) => {
      if (!labelEl) return;
      labelEl.textContent = formatPercent(Number(value || 0));
    };

    const storeFilterValue = (key, value) => {
      setStored(key, value.toString());
    };

    const applyFilterStrength = (type, slider, labelEl) => {
      const value = Number(slider?.value ?? 0.8);
      filterStrengths[type] = value;
      updateFilterSliderLabel(value, labelEl);
      storeFilterValue(STORAGE_KEYS[`${type}Strength`], value);
    };

    const getAudioConstraints = () => {
      const echoEnabled = echoCheckbox?.checked ?? true;
      const noiseEnabled = noiseCheckbox?.checked ?? true;
      const agcEnabled = agcCheckbox?.checked ?? true;
      return {
        echoCancellation: echoEnabled && filterStrengths.echo >= 0.05,
        noiseSuppression: noiseEnabled && filterStrengths.noise >= 0.05,
        autoGainControl: agcEnabled && filterStrengths.agc >= 0.05,
      };
    };

    const getSessionDurationMs = () => {
      const raw = Number(speechDurationSlider?.value || 6);
      const clamped = Math.min(1000, Math.max(1, raw));
      return clamped * 1000;
    };

    const updateSpeechDurationLabel = () => {
      if (!speechDurationSlider || !speechDurationValue) return;
      speechDurationValue.textContent = `${speechDurationSlider.value} s`;
    };

    const saveSettings = () => {
      if (echoCheckbox) setStored(STORAGE_KEYS.echo, echoCheckbox.checked ? "1" : "0");
      if (noiseCheckbox) setStored(STORAGE_KEYS.noise, noiseCheckbox.checked ? "1" : "0");
      if (agcCheckbox) setStored(STORAGE_KEYS.agc, agcCheckbox.checked ? "1" : "0");
      if (speechDurationSlider) setStored(STORAGE_KEYS.duration, speechDurationSlider.value);
      if (volumeSlider) setStored(STORAGE_KEYS.volume, volumeSlider.value);
      if (sensitivitySlider) setStored(STORAGE_KEYS.sensitivity, sensitivitySlider.value);
      if (micGainSlider) setStored(STORAGE_KEYS.micGain, micGainSlider.value);
    };

    const updateMicGainLabel = () => {
      if (!micGainValue || !micGainSlider) return;
      micGainValue.textContent = formatPercent(Number(micGainSlider.value));
    };

    const restoreSettings = () => {
      if (echoCheckbox) echoCheckbox.checked = loadBool(STORAGE_KEYS.echo, true);
      if (noiseCheckbox) noiseCheckbox.checked = loadBool(STORAGE_KEYS.noise, true);
      if (agcCheckbox) agcCheckbox.checked = loadBool(STORAGE_KEYS.agc, true);
      if (speechDurationSlider) {
        const stored = loadNumber(STORAGE_KEYS.duration, 6);
        speechDurationSlider.value = `${Math.min(1000, Math.max(1, stored))}`;
      }
      if (volumeSlider) {
        const storedVolume = loadNumber(STORAGE_KEYS.volume, 0.8);
        volumeSlider.value = `${Math.min(1, Math.max(0, storedVolume))}`;
      }
      if (sensitivitySlider) {
        const storedSensitivity = loadNumber(STORAGE_KEYS.sensitivity, 0.5);
        sensitivitySlider.value = `${Math.min(1, Math.max(0.1, storedSensitivity))}`;
      }
      updateSpeechDurationLabel();
      if (echoSlider) {
        const stored = loadNumber(STORAGE_KEYS.echoStrength, 0.8);
        echoSlider.value = `${Math.min(1, Math.max(0, stored))}`;
      }
      if (noiseSlider) {
        const stored = loadNumber(STORAGE_KEYS.noiseStrength, 0.8);
        noiseSlider.value = `${Math.min(1, Math.max(0, stored))}`;
      }
      if (agcSlider) {
        const stored = loadNumber(STORAGE_KEYS.agcStrength, 0.8);
        agcSlider.value = `${Math.min(1, Math.max(0, stored))}`;
      }
      updateMicGainLabel();
      applyFilterStrength("echo", echoSlider, echoSliderValue);
      applyFilterStrength("noise", noiseSlider, noiseSliderValue);
      applyFilterStrength("agc", agcSlider, agcSliderValue);
    };

    const clearSessionTimeout = () => {
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        sessionTimeoutId = null;
      }
    };

    const scheduleSessionTimeout = () => {
      if (!speechDurationSlider) return;
      clearSessionTimeout();
      if (!isLive) return;
      sessionTimeoutId = window.setTimeout(() => {
        logEl && logEl.textContent && setLog("Limit czasu mowy osiągnięty.");
        stopLiveSession({ silent: true, keepActive: false });
      }, getSessionDurationMs());
    };

    const restartLiveSession = () => {
      if (!isLive) return;
      stopLiveSession({ silent: true, keepActive: false });
      setTimeout(() => startLive(), 200);
    };

    const stopLiveSession = ({ silent = false, keepActive = false } = {}) => {
      if (!isLive) return;
      isLive = false;
      cleanup();
      stopMeter();
      if (stopBtn) stopBtn.disabled = true;
      if (startBtn) {
        startBtn.disabled = keepActive;
        if (!keepActive) updateStartButtonState(false);
      }
      if (!silent) {
        setLog("Sesja zakończona.");
      }
      if (!keepActive) {
        shouldRestartAfterResponse = false;
      }
      clearSessionTimeout();
    };

    const pauseLiveForResponse = () => {
      if (!isLive) return;
      shouldRestartAfterResponse = true;
      stopLiveSession({ silent: true, keepActive: true });
    };

    const prepareForResponse = () => {
      if (isLive) {
        pauseLiveForResponse();
      }
    };


    const getStored = (key) => localStorage.getItem(key) || "";
    const setStored = (key, value) => localStorage.setItem(key, (value || "").trim());

    const showFace = (state) => {
      if (!face) return;
      if (state === "listening") face.textContent = "🎤";
      else if (state === "speaking") face.textContent = "🗣️";
      else face.textContent = "😌";
    };

    const updateStartButtonState = (active) => {
      if (!startBtn) return;
      if (active) {
        startBtn.textContent = "Rozmowa w trakcie";
        startBtn.classList.add("active");
      } else {
        startBtn.textContent = "Włącz mikrofon";
        startBtn.classList.remove("active");
      }
    };

    const initMetering = () => {
      startMeter();
    };

    const restartMetering = () => {
      stopMeter();
      startMeter();
    };

    const updateMeter = () => {
      if (!analyserNode || !meterLevel) {
        meterFrame = requestAnimationFrame(updateMeter);
        return;
      }
      const data = new Uint8Array(analyserNode.fftSize);
      analyserNode.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const db = 20 * Math.log10(Math.max(rms, 1e-6));
      const normalized = Math.min(1, Math.max(0, (db + 60) / 60));
      const level = clamp(normalized * 100);
      meterLevel.style.width = `${level}%`;
      if (smeterValue) {
        smeterValue.textContent = `${db.toFixed(1)} dB`;
      }
      showFace(normalized > 0.08 ? "listening" : "idle");
      meterFrame = requestAnimationFrame(updateMeter);
    };

    const startMeter = () => {
      cancelAnimationFrame(meterFrame);
      meterFrame = requestAnimationFrame(updateMeter);
    };

    const stopMeter = () => {
      cancelAnimationFrame(meterFrame);
      if (meterLevel) meterLevel.style.width = "0%";
    };

    const stopMetering = () => {
      analyserNode = null;
      stopMeter();
    };

    const cleanup = () => {
      if (recorder && recorder.state !== "inactive") recorder.stop();
      recorder = null;
      if (audioCtx) {
        audioCtx.close().catch(() => {});
        audioCtx = null;
      }
      if (liveStream) {
        liveStream.getTracks().forEach((track) => track.stop());
        liveStream = null;
      }
      gainNode = null;
      showFace("idle");
    };

    const sendChunk = async (blob) => {
      if (!blob || blob.size === 0) return;
      try {
        const form = new FormData();
        form.append("audio", blob, "live.webm");
        const resp = await fetch("/voice", { method: "POST", body: form });
        if (!resp.ok) {
          setLog(`Błąd serwera: ${resp.status}`);
          return;
        }
        const wav = await resp.blob();
        const url = URL.createObjectURL(wav);
        prepareForResponse();
        if (responseAudio) {
          responseAudio.src = url;
          responseAudio.volume = Number(volumeSlider?.value || 0.8);
          responseAudio
            .play()
            .catch(() => {
              /* Android may require user gesture; ignore */
            });
          showFace("speaking");
        }
        setLog("Lyra odpowiada…");
      } catch (err) {
        console.error(err);
        setLog("Błąd wysyłania audio.");
      }
    };

    const populateMicList = async () => {
      if (!micSelect || !navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputs = devices.filter((d) => d.kind === "audioinput");
        const stored = getStored(MIC_STORAGE_KEY);
        micSelect.innerHTML = "<option value=''>Domyślny</option>";
        inputs.forEach((device, idx) => {
          const opt = document.createElement("option");
          opt.value = device.deviceId;
          opt.textContent = device.label || `Mikrofon ${idx + 1}`;
          if (stored && stored === device.deviceId) opt.selected = true;
          micSelect.appendChild(opt);
        });
        if (!micSelect.value && stored) {
          const fallback = Array.from(micSelect.options).find((opt) => opt.value === stored);
          if (fallback) fallback.selected = true;
        }
      } catch (err) {
        console.error("Błąd listy mikrofonów", err);
      }
    };

    const populateOutputList = async () => {
      if (!outputSelect || !navigator.mediaDevices?.enumerateDevices) return;
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter((d) => d.kind === "audiooutput");
        const stored = getStored(OUTPUT_STORAGE_KEY);
        outputSelect.innerHTML = "<option value=''>Domyślne</option>";
        outputs.forEach((device, idx) => {
          const opt = document.createElement("option");
          opt.value = device.deviceId;
          opt.textContent = device.label || `Głośnik ${idx + 1}`;
          if (stored && stored === device.deviceId) opt.selected = true;
          outputSelect.appendChild(opt);
        });
        if (!outputSelect.value && stored) {
          const fallback = Array.from(outputSelect.options).find((opt) => opt.value === stored);
          if (fallback) fallback.selected = true;
        }
        applyOutputSelection();
      } catch (err) {
        console.error("Błąd listy wyjść audio", err);
      }
    };

    const applyOutputSelection = () => {
      if (!responseAudio || typeof responseAudio.setSinkId !== "function") return;
      const sinkId = outputSelect?.value;
      if (sinkId) {
        responseAudio.setSinkId(sinkId).catch((err) => console.error("Nie ustawiono wyjścia audio:", err));
      }
    };

    const startLive = async () => {
      if (isLive) return;
      if (!navigator.mediaDevices?.getUserMedia) {
        setLog("Przeglądarka nie wspiera mikrofonu.");
        return;
      }
      if (startBtn) startBtn.disabled = true;
      try {
        const constraints = getAudioConstraints();
        if (micSelect?.value) {
          constraints.deviceId = { exact: micSelect.value };
        }
        liveStream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(liveStream);
        gainNode = audioCtx.createGain();
        analyserNode = audioCtx.createAnalyser();
        analyserNode.fftSize = 2048;
        source.connect(gainNode);
        gainNode.connect(analyserNode);
        analyserNode.connect(audioCtx.destination);
        startMeter();
        recorder = new MediaRecorder(liveStream);
        recorder.ondataavailable = (ev) => sendChunk(ev.data);
        recorder.start(1700);
        applyGain();
        isLive = true;
        shouldRestartAfterResponse = false;
        showFace("listening");
        const sessionSec = (getSessionDurationMs() / 1000).toFixed(1);
        setLog(`Nagrywam… maks. ${sessionSec} s`);
        if (stopBtn) stopBtn.disabled = false;
        updateStartButtonState(true);
        scheduleSessionTimeout();
      } catch (err) {
        console.error(err);
        setLog("Nie udało się uruchomić mikrofonu.");
        if (stopBtn) stopBtn.disabled = true;
        updateStartButtonState(false);
        isLive = false;
      } finally {
        if (startBtn) startBtn.disabled = false;
      }
    };

    const stopLive = () => {
      stopLiveSession({ silent: false, keepActive: false });
    };

    const toggleLiveSession = () => {
      if (isLive) {
        stopLive();
      } else {
        startLive();
      }
    };

    const handleResponseAudioEnd = () => {
      if (shouldRestartAfterResponse) {
        shouldRestartAfterResponse = false;
        setLog("Wznawiam nasłuch…");
        showFace("listening");
        setTimeout(() => startLive(), 200);
      }
    };

    return {
      init: () => {
        modal = document.querySelector(".voice-modal");
        if (!modal) return;
        meterLevel = modal.querySelector("#voiceMeterLevel");
        face = modal.querySelector("#voiceFace");
        logEl = modal.querySelector("#voiceLog");
        responseAudio = modal.querySelector("#voiceResponse");
        volumeSlider = modal.querySelector("#voiceVolume");
        sensitivitySlider = modal.querySelector("#voiceSensitivity");
        micSelect = modal.querySelector("#voiceMicSelect");
        refreshMicsBtn = modal.querySelector("#refreshMics");
        outputSelect = modal.querySelector("#voiceOutputSelect");
        smeterValue = modal.querySelector("#voiceSmeterValue");
        startBtn = modal.querySelector("#voiceStart");
        stopBtn = modal.querySelector("#voiceStop");
        echoCheckbox = modal.querySelector("#voiceEcho");
        noiseCheckbox = modal.querySelector("#voiceNoise");
        agcCheckbox = modal.querySelector("#voiceAgc");
        speechDurationSlider = modal.querySelector("#voiceSpeechDuration");
        speechDurationValue = modal.querySelector("#voiceSpeechDurationValue");
        echoSlider = modal.querySelector("#voiceEchoStrength");
        noiseSlider = modal.querySelector("#voiceNoiseStrength");
        agcSlider = modal.querySelector("#voiceAgcStrength");
        echoSliderValue = modal.querySelector("#voiceEchoStrengthValue");
        noiseSliderValue = modal.querySelector("#voiceNoiseStrengthValue");
        agcSliderValue = modal.querySelector("#voiceAgcStrengthValue");
        micGainSlider = modal.querySelector("#voiceMicGain");
        micGainValue = modal.querySelector("#voiceMicGainValue");
        speakButton = document.getElementById("voiceFab");
        closeButtons = Array.from(modal.querySelectorAll("[data-close='true']"));
        responseAudio?.addEventListener("ended", handleResponseAudioEnd);
        responseAudio?.addEventListener("error", handleResponseAudioEnd);
        restoreSettings();
        applyGain();
        updateSpeechDurationLabel();

        speakButton?.addEventListener("click", async (evt) => {
          evt.preventDefault();
          modal.classList.add("visible");
          modal.setAttribute("aria-hidden", "false");
          setLog("Gotowe na żywą rozmowę.");
          initMetering();
        });
        closeButtons.forEach((btn) =>
          btn.addEventListener("click", () => {
            modal.classList.remove("visible");
            modal.setAttribute("aria-hidden", "true");
            stopLive();
            stopMetering();
          })
        );
        startBtn?.addEventListener("click", toggleLiveSession);
        stopBtn?.addEventListener("click", stopLive);
        volumeSlider?.addEventListener("input", () => {
          applyGain();
          saveSettings();
        });
        sensitivitySlider?.addEventListener("input", () => {
          applyGain();
          saveSettings();
        });
        const restartFilters = () => {
          restartMetering();
          restartLiveSession();
        };
        const checkboxHandler = () => {
          saveSettings();
          restartFilters();
        };
        const handleFilterSlide = (type, slider, labelEl) => {
          applyFilterStrength(type, slider, labelEl);
          applyGain();
          restartFilters();
        };
        echoSlider?.addEventListener("input", () => handleFilterSlide("echo", echoSlider, echoSliderValue));
        noiseSlider?.addEventListener("input", () => handleFilterSlide("noise", noiseSlider, noiseSliderValue));
        agcSlider?.addEventListener("input", () => handleFilterSlide("agc", agcSlider, agcSliderValue));
        echoCheckbox?.addEventListener("change", checkboxHandler);
        noiseCheckbox?.addEventListener("change", checkboxHandler);
        agcCheckbox?.addEventListener("change", checkboxHandler);
        micGainSlider?.addEventListener("input", () => {
          updateMicGainLabel();
          applyGain();
          saveSettings();
        });
        speechDurationSlider?.addEventListener("input", () => {
          updateSpeechDurationLabel();
          saveSettings();
          if (isLive) {
            scheduleSessionTimeout();
          }
        });
        refreshMicsBtn?.addEventListener("click", populateMicList);
        micSelect?.addEventListener("change", () => {
          setStored(MIC_STORAGE_KEY, micSelect.value);
          restartMetering();
        });
        outputSelect?.addEventListener("change", () => {
          setStored(OUTPUT_STORAGE_KEY, outputSelect.value);
          applyOutputSelection();
        });
        populateMicList();
        populateOutputList();
        initMetering();
        updateStartButtonState(false);
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
      },
    };
  };

  document.addEventListener("DOMContentLoaded", () => {
    addStyles();
    const modal = createModal();
    const fab = createFab();
    const liveSession = setupLiveSession();
    liveSession.init();
  });
})();
