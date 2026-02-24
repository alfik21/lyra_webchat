(function () {
  const STYLE_ID = "voice-overlay-style";
  const OVERLAY_ID = "voice-overlay";
  const LOG_PANEL_ID = "voice-log-panel";
  const CHAT_CONTAINER_ID = "voice-chat-entries";
  const CHAT_BRIDGE_ID = "voice-messages-in-chat";
  const OVERLAY_LOG_ID = "voice-overlay-log";
  const VOICE_ENTRIES_MAX = 60;
  const voiceEntries = [];
  const chatBuffer = [];
  let overlay;
  let overlayLog;
  let statusLabel;
  let recordButton;
  let gateSlider;
  let gateValue;
  let voiceSelect;
  let mediaRecorder;
  let recorderBuffer = [];
  let isRecording = false;
  let meterFill;
  let meterLabel;
  let durationSlider;
  let durationValue;
  let noiseValue;
  let echoValue;
  let agcValue;
  let noiseSlider;
  let echoSlider;
  let agcSlider;
  let hotwordInput;
  let hotwordSave;
  let autoListenToggle;
  let autoWakeToggle;
  let muteButton;
  let logClear;
  const DEFAULT_HOTWORD = (localStorage.getItem("lyra_voice_hotword") || "Hey Lyra").trim() || "Hey Lyra";
  let hotwordPattern = DEFAULT_HOTWORD;
  let detectionAnalyser = null;
  let detectionData = null;
  let detectionRAF = null;
  let lastDetectionTime = 0;
  let autoListenEnabled = true;
  let autoWakeEnabled = true;
  let isMuted = false;
  let conversationId = null;
  let currentParentId = null;
  // --- nowy moduł lokalnego voice ---
  let voiceModuleSession = null;
  let voiceModuleSocket = null;
  let voiceModulePort = null;
  let voiceModulePath = null;
  const player = new Audio();
  player.volume = 0.6;
  let audioContext;
  let sourceNode;
  let noiseFilterNode;
  let compressorNode;
  let delayNode;
  let delayGainNode;
  let analyserNode;
  let processedStream;
  let detectionRawStream;
  let destinationStream;
  let recordingTimeoutId = null;
  const STORAGE_KEYS = {
    gate: "lyra_voice_gate",
    duration: "lyra_voice_duration",
    noise: "lyra_voice_noise",
    echo: "lyra_voice_echo",
    agc: "lyra_voice_agc",
    autoListen: "lyra_voice_auto_listen",
    autoWake: "lyra_voice_auto_wake",
    hotword: "lyra_voice_hotword",
  };

  const ensureStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${OVERLAY_ID} {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(3, 7, 17, 0.72);
        backdrop-filter: blur(20px);
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
        z-index: 1300;
      }
      #${OVERLAY_ID}.visible {
        opacity: 1;
        visibility: visible;
      }
      #${OVERLAY_ID} .voice-overlay-panel {
        width: min(450px, 92vw);
        background: #04050d;
        border-radius: 22px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 18px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
        color: #f8fafc;
        position: relative;
        z-index: 1;
      }
      #${OVERLAY_ID} .voice-overlay-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        margin-bottom: 10px;
      }
      #${OVERLAY_ID} .voice-overlay-close {
        background: transparent;
        border: none;
        color: #cbd5f5;
        font-size: 1.4rem;
        cursor: pointer;
      }
      #${OVERLAY_ID} .voice-overlay-body {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      #${OVERLAY_LOG_ID} {
        height: 140px;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        padding: 10px;
        font-family: "JetBrains Mono", Consolas, monospace;
        font-size: 0.85rem;
        line-height: 1.4;
      }
      #${OVERLAY_ID} .voice-overlay-footer {
        margin-top: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      #${OVERLAY_ID} button {
        font-family: inherit;
      }
      #${OVERLAY_ID} .voice-overlay-footer button.recording {
        background: #dc2626;
        border-color: rgba(255, 255, 255, 0.4);
        color: #fff;
      }
      #${OVERLAY_ID} .voice-overlay-status {
        font-size: 0.9rem;
        color: #34d399;
      }
      #${OVERLAY_ID} .voice-overlay-status.error {
        color: #f87171;
      }
      #${OVERLAY_ID} .voice-overlay-slider {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.9rem;
      }
      #${OVERLAY_ID} input[type=range] {
        accent-color: #fb923c;
        width: 100%;
      }
      .voice-log-panel {
        margin-top: 12px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(12, 17, 34, 0.85);
        padding: 12px;
        font-size: 0.92rem;
        min-height: 80px;
        line-height: 1.4;
        color: #e2e8f0;
        overflow: hidden;
      }
      #${CHAT_CONTAINER_ID} {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 12px;
        max-height: 180px;
        overflow-y: auto;
      }
      #${CHAT_BRIDGE_ID} {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 14px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      #${CHAT_CONTAINER_ID} {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 12px;
      }
      .voice-entry {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 6px 8px;
        border-radius: 12px;
        margin-bottom: 6px;
      }
      .voice-entry-role {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #94a3b8;
      }
      .voice-entry-text {
        font-size: 0.92rem;
        color: #f4f4f5;
      }
      .voice-entry-user {
        background: rgba(59, 130, 246, 0.15);
        align-self: flex-end;
      }
      .voice-entry-lyra {
        background: rgba(16, 185, 129, 0.08);
        align-self: flex-start;
      }
      .voice-chat-bubble {
        padding: 8px 12px;
        border-radius: 14px;
        font-size: 0.92rem;
        max-width: 74%;
        line-height: 1.35;
        word-break: break-word;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      }
      .voice-chat-bubble.user {
        background: rgba(37, 99, 235, 0.18);
        align-self: flex-end;
      }
      .voice-chat-bubble.lyra {
        background: rgba(6, 182, 212, 0.12);
        align-self: flex-start;
      }
      .voice-overlay-mic-button {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: transparent;
        color: #f97316;
        font-size: 1.1rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .voice-overlay-mic-button:focus-visible {
        outline: 2px solid #fb923c;
        outline-offset: 2px;
      }
      .voice-overlay-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
        margin-top: 12px;
      }
      .voice-overlay-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: space-between;
      }
      .voice-overlay-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }
      .voice-overlay-card {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.85rem;
        color: #cbd5f5;
      }
      .voice-overlay-card input[type="range"] {
        accent-color: #fb923c;
      }
      .voice-overlay-meter {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.85rem;
        color: #cbd5f5;
      }
      .voice-overlay-meter-bar {
        width: 100%;
        height: 10px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        overflow: hidden;
      }
      .voice-overlay-meter-fill {
        width: 0;
        height: 100%;
        background: linear-gradient(135deg, #34d399, #10b981);
        transition: width 0.1s ease;
      }
      .voice-overlay-hotword {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        padding: 8px 10px;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.03);
      }
      .voice-overlay-hotword input[type="text"] {
        flex: 1;
        padding: 6px 10px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.04);
        color: #f8fafc;
      }
      .voice-overlay-log-section {
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 12px;
        background: rgba(3, 7, 17, 0.85);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .voice-overlay-log {
        height: 160px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.35);
        border-radius: 10px;
        padding: 10px;
        font-family: "JetBrains Mono", Consolas, monospace;
        font-size: 0.82rem;
        line-height: 1.35;
        white-space: pre-wrap;
      }
      .voice-overlay-log-section button {
        align-self: flex-start;
      }
      @media (max-width: 768px) {
        #${OVERLAY_ID} .voice-overlay-panel {
          width: min(95vw, 420px);
        }
      }
    `;
    document.head.appendChild(style);
  };

  const appendVoiceEntry = (role, text) => {
    const payload = text?.trim();
    const sanitized = payload || (role === "lyra" ? "(brak odpowiedzi)" : "(cisza)");
    voiceEntries.push({ role, text: sanitized, ts: Date.now() });
    if (voiceEntries.length > VOICE_ENTRIES_MAX) {
      voiceEntries.shift();
    }
    renderVoiceLogPanel();
    pushToMainChat(role, sanitized);
    if (payload) {
      appendToHistory(role, payload);
    }
  };

  const ensureChatBridge = () => {
    const batchContainer = document.getElementById(CHAT_BRIDGE_ID);
    if (batchContainer) return;
    const parent = document.getElementById("messages-list");
    if (!parent) return;
    const batch = document.createElement("div");
    batch.id = CHAT_BRIDGE_ID;
    parent.parentElement?.insertBefore(batch, parent);
  };

  const pushToMainChat = (role, text) => {
    const batch = document.getElementById(CHAT_BRIDGE_ID);
    if (!batch) return;
    const entry = document.createElement("div");
    entry.className = `voice-chat-bubble ${role}`;
    entry.textContent = text;
    batch.appendChild(entry);
    if (batch.children.length > 6) {
      batch.removeChild(batch.firstChild);
    }
  };

  const ensureVoiceLogPanel = () => {
    const messagesList = document.getElementById("messages-list");
    if (!messagesList || !messagesList.parentElement) return null;
    let panel = document.getElementById(LOG_PANEL_ID);
    if (!panel) {
      panel = document.createElement("div");
      panel.id = LOG_PANEL_ID;
      panel.className = "voice-log-panel";
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = "column";
      wrapper.style.gap = "4px";
      const title = document.createElement("span");
      title.textContent = "Rozmowa głosowa";
      title.style.fontSize = "0.85rem";
      title.style.letterSpacing = "0.1em";
      title.style.textTransform = "uppercase";
      title.style.color = "#a5b4fc";
      wrapper.appendChild(title);
      const chatContainer = document.createElement("div");
      chatContainer.id = CHAT_CONTAINER_ID;
      wrapper.appendChild(panel);
      wrapper.appendChild(chatContainer);
      messagesList.parentElement.insertBefore(wrapper, messagesList.nextSibling);
      return panel;
    }
    return panel;
  };

  const renderVoiceLogPanel = () => {
    const panel = ensureVoiceLogPanel();
    if (!panel) return;
    const chatContainer = document.getElementById(CHAT_CONTAINER_ID);
    panel.innerHTML = "";
    voiceEntries.forEach((entry) => {
      const row = document.createElement("div");
      row.className = `voice-entry voice-entry-${entry.role}`;
      const badge = document.createElement("div");
      badge.className = "voice-entry-role";
      badge.textContent = entry.role === "lyra" ? "Lyra" : "Ty (głos)";
      const text = document.createElement("div");
      text.className = "voice-entry-text";
      text.textContent = entry.text;
      row.appendChild(badge);
      row.appendChild(text);
    panel.appendChild(row);
    });
    panel.scrollTop = panel.scrollHeight;
    if (chatContainer) {
      chatContainer.innerHTML = "";
      voiceEntries.slice(-6).forEach((entry) => {
        const bubble = document.createElement("div");
        bubble.className = `voice-chat-bubble ${entry.role}`;
        bubble.textContent = entry.text;
        chatContainer.appendChild(bubble);
      });
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  const logOverlay = (text) => {
    if (!overlayLog) return;
    const stamp = `[${new Date().toLocaleTimeString()}] `;
    overlayLog.textContent = `${stamp}${text}` + "\n" + overlayLog.textContent;
  };

  const setStatus = (text, danger = false) => {
    if (!statusLabel) return;
    statusLabel.textContent = text;
    statusLabel.classList.toggle("error", danger);
  };

  const setRecordButtonState = (active) => {
    if (!recordButton) return;
    if (active) {
      recordButton.textContent = "Rozmowa w trakcie";
      recordButton.classList.add("recording");
    } else {
      recordButton.textContent = "Włącz mikrofon";
      recordButton.classList.remove("recording");
    }
  };


  const updateSliderLabel = (slider, label, suffix = "%") => {
    if (slider && label) {
      label.textContent = `${slider.value}${suffix}`;
    }
  };

  const readStoredValue = (key, fallback) => {
    if (typeof localStorage === "undefined") return fallback;
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    const parsed = Number(stored);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const persistValue = (key, value) => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, String(value));
  };

  const mapNoiseToFrequency = (value) => {
    return 200 + (Number(value) / 100) * 4800;
  };

  const mapEchoToGain = (value) => {
    return Math.min(0.9, Math.max(0, Number(value) / 100));
  };

  const mapAgcToThreshold = (value) => {
    return -60 + (Number(value) / 100) * 40;
  };

  const mapAgcToRatio = (value) => {
    return 1 + (Number(value) / 100) * 11;
  };

  const applyAudioSettings = () => {
    if (!noiseFilterNode || !compressorNode || !delayNode || !delayGainNode) return;
    const noiseVal = Number(noiseSlider?.value ?? 60);
    noiseFilterNode.frequency.value = mapNoiseToFrequency(noiseVal);
    noiseFilterNode.Q.value = Math.max(0.5, noiseVal / 20);
    const agcVal = Number(agcSlider?.value ?? 50);
    compressorNode.threshold.value = mapAgcToThreshold(agcVal);
    compressorNode.ratio.value = mapAgcToRatio(agcVal);
    compressorNode.attack.value = 0.003 + (1 - agcVal / 100) * 0.05;
    compressorNode.release.value = 0.15 + (agcVal / 100) * 0.35;
    const echoVal = Number(echoSlider?.value ?? 40);
    delayNode.delayTime.value = 0.02 + (echoVal / 100) * 0.4;
    delayGainNode.gain.value = -mapEchoToGain(echoVal);
  };

  const updateSliderFromStorage = (slider, label, key, defaultValue, suffix = "%") => {
    if (!slider) return defaultValue;
    const value = readStoredValue(key, defaultValue);
    slider.value = value;
    if (label) {
      label.textContent = `${value}${suffix}`;
    }
    return value;
  };

  const getDetectionThreshold = () => {
    if (!gateSlider) return 0.2;
    const gate = Number(gateSlider.value || 35);
    return Math.min(0.6, 0.02 + (gate / 100) * 0.45);
  };

  const ensureConversationState = async () => {
    if (!window || typeof window.location === "undefined") return;
    const match = window.location.pathname.match(/\/chat\/([^\/]+)/);
    if (!match) return;
    conversationId = match[1];
    if (!conversationId || !window.El) return;
    try {
      const conv = await window.El.getOneConversation(conversationId);
      currentParentId = conv?.currNode ?? conv?.id ?? null;
    } catch (err) {
      console.warn("Nie udało się ustawić rozmowy", err);
    }
  };

  async function appendToHistory(role, text) {
    if (!window.El || !conversationId) return;
    const entryId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const entry = {
      id: entryId,
      convId: conversationId,
      type: "text",
      timestamp: Date.now(),
      role: role === "lyra" ? "assistant" : "user",
      content: text,
      parent: currentParentId,
      children: [],
    };
    try {
      await window.El.appendMsg(conversationId, entry);
      currentParentId = entryId;
    } catch (err) {
      console.warn("Nie udało się zapisać do historii czatu", err);
    }
  }

  // ====== Lokalny moduł voice (HTTP -> WS) ======
  const startVoiceModule = async () => {
    if (voiceModuleSession) return;

    const payload = {
      conversation_id: conversationId || null,
      params: {
        mic: window.localStorage.getItem("lyra_voice_mic") || null,
        speaker: window.localStorage.getItem("lyra_voice_speaker") || null,
      },
    };

    let data;
    try {
      const resp = await fetch("/api/voice/module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await resp.json();
    } catch (err) {
      logOverlay(`Błąd startu modułu voice: ${err?.message || err}`);
      return;
    }

    if (!data || data.ok === false) {
      logOverlay(`Moduł voice nie wystartował: ${data?.error || "brak danych"}`);
      return;
    }

    voiceModuleSession = data.session_id || data.sessionId || null;
    voiceModulePort = data.port;
    voiceModulePath = data.ws || data.path || "/events";

    if (!voiceModulePort) {
      logOverlay("Brak portu modułu voice w odpowiedzi.");
      return;
    }

    const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProto}//${location.hostname}:${voiceModulePort}${voiceModulePath}`;
    try {
      voiceModuleSocket = new WebSocket(wsUrl, "lyra-voice");
      voiceModuleSocket.addEventListener("message", onVoiceModuleEvent);
      voiceModuleSocket.addEventListener("close", () => {
        logOverlay("Moduł voice rozłączony.");
        voiceModuleSession = null;
        voiceModuleSocket = null;
      });
      voiceModuleSocket.addEventListener("error", (evt) => {
        console.error("voice/ws error", evt);
        logOverlay("Błąd połączenia z modułem voice.");
      });
      logOverlay("Moduł voice połączony.");
    } catch (err) {
      logOverlay(`Nie udało się połączyć z modułem voice: ${err?.message || err}`);
    }
  };

  const stopVoiceModule = async () => {
    if (!voiceModuleSession) return;
    try {
      await fetch(`/api/voice/module?session_id=${voiceModuleSession}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Voice module stop error", err);
    } finally {
      voiceModuleSession = null;
      if (voiceModuleSocket) {
        try {
          voiceModuleSocket.close();
        } catch (e) {}
      }
      voiceModuleSocket = null;
    }
  };

  const onVoiceModuleEvent = (evt) => {
    let payload;
    try {
      payload = JSON.parse(evt.data);
    } catch (err) {
      console.error("voice/ws parse error", err);
      return;
    }

    const kind = payload.kind;
    if (kind === "transcript") {
      appendVoiceEntry("user", payload.text || "");
    } else if (kind === "assistant_reply") {
      appendVoiceEntry("lyra", payload.text || "");
    } else if (kind === "audio_url") {
      if (payload.url) {
        player.src = payload.url;
        player.play().catch(() => {});
      }
    } else if (kind === "status") {
      logOverlay(payload.state || "status");
    }
  };

  const ensureDetectionStream = async () => {
    if (detectionAnalyser && processedStream) return true;
    releaseDetectionResources();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      logOverlay("Twoja przeglądarka nie wspiera getUserMedia.");
      return false;
    }
    try {
      detectionRawStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
        },
      });
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      sourceNode = audioContext.createMediaStreamSource(detectionRawStream);
      noiseFilterNode = audioContext.createBiquadFilter();
      noiseFilterNode.type = "highpass";
      compressorNode = audioContext.createDynamicsCompressor();
      delayNode = audioContext.createDelay(1);
      delayGainNode = audioContext.createGain();
      const merger = audioContext.createGain();
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserNode.minDecibels = -90;
      analyserNode.maxDecibels = -10;
      destinationStream = audioContext.createMediaStreamDestination();
      applyAudioSettings();
      sourceNode.connect(noiseFilterNode);
      noiseFilterNode.connect(compressorNode);
      compressorNode.connect(merger);
      compressorNode.connect(delayNode);
      delayNode.connect(delayGainNode);
      delayGainNode.connect(merger);
      merger.connect(analyserNode);
      analyserNode.connect(destinationStream);
      processedStream = destinationStream.stream;
      detectionAnalyser = analyserNode;
      detectionData = new Float32Array(analyserNode.fftSize);
      return true;
    } catch (err) {
      logOverlay(`Brak dostępu do wykrywania: ${err?.message || err}`);
      releaseDetectionResources();
      return false;
    }
  };

  const releaseDetectionResources = () => {
    recordingTimeoutId && clearTimeout(recordingTimeoutId);
    recordingTimeoutId = null;
    if (detectionRawStream) {
      detectionRawStream.getTracks().forEach((track) => track.stop());
    }
    detectionRawStream = null;
    detectionData = null;
    detectionAnalyser = null;
    processedStream = null;
    destinationStream = null;
    sourceNode = null;
    noiseFilterNode = null;
    compressorNode = null;
    delayNode = null;
    delayGainNode = null;
    if (audioContext) {
      audioContext.close().catch(() => {});
    }
    audioContext = null;
  };

  const stopDetectionLoop = () => {
    if (detectionRAF) {
      cancelAnimationFrame(detectionRAF);
      detectionRAF = null;
    }
  };

  const detectionLoop = () => {
    if (!detectionAnalyser || !meterFill) return;
    detectionAnalyser.getFloatTimeDomainData(detectionData);
    let sum = 0;
    for (let i = 0; i < detectionData.length; i++) {
      sum += detectionData[i] * detectionData[i];
    }
    const rms = Math.sqrt(sum / detectionData.length) || 0;
    const normalized = Math.min(1, Math.max(0, rms * 10));
    meterFill.style.width = `${Math.round(normalized * 100)}%`;
    if (meterLabel) {
      meterLabel.textContent = `S-metr: ${Math.round(normalized * 100)}%`;
    }
    if (
      autoWakeEnabled &&
      autoListenEnabled &&
      !isRecording &&
      normalized >= getDetectionThreshold() &&
      Date.now() - lastDetectionTime > 1400
    ) {
      lastDetectionTime = Date.now();
      logOverlay("Autodetekcja uruchamia nagrywanie");
      startRecording();
    }
    detectionRAF = requestAnimationFrame(detectionLoop);
  };

  const startDetectionLoop = async () => {
    if (!autoListenEnabled || isRecording || isMuted) return;
    const ready = await ensureDetectionStream();
    if (!ready || !detectionAnalyser) {
      setStatus("Brak dostępu do mikrofonu", true);
      return;
    }
    stopDetectionLoop();
    detectionLoop();
  };

  player.addEventListener("playing", () => {
    stopDetectionLoop();
    setStatus("Lyra odpowiada");
  });
  player.addEventListener("ended", () => {
    setStatus("Gotowe");
    if (overlay?.classList.contains("visible")) {
      startDetectionLoop();
    }
  });
  player.addEventListener("error", () => {
    setStatus("Gotowe");
    if (overlay?.classList.contains("visible")) {
      startDetectionLoop();
    }
  });

  const stopRecording = () => {
    if (!isRecording) return;
    mediaRecorder?.stop();
    isRecording = false;
    recordingTimeoutId && clearTimeout(recordingTimeoutId);
    recordingTimeoutId = null;
    setRecordButtonState(false);
    setStatus("Przetwarzam...");
  };

  const sendAudio = async (blob) => {
    if (!blob || blob.size === 0) {
      logOverlay("Nagranie jest puste.");
      setStatus("Brak danych", true);
      return;
    }
    const form = new FormData();
    form.append("audio", blob, "voice.webm");
    const voiceSelection = voiceSelect?.value || "piper:magda";
    form.append("voice_selection", voiceSelection);
    try {
      const resp = await fetch("/voice", { method: "POST", body: form });
      if (!resp.ok) {
        throw new Error(await resp.text());
      }
      const transcript = resp.headers.get("X-Transcript") || "";
      const reply = resp.headers.get("X-Llm-Reply") || "";
      logOverlay(`Transkrypcja: ${transcript || "(brak)"}`);
      logOverlay(`Lyra: ${reply || "(brak)"}`);
      // Jeśli działa lokalny moduł voice, prześlij tekst do WS zamiast /obok starego pipelinu.
      if (voiceModuleSocket) {
        try {
          voiceModuleSocket.send(
            JSON.stringify({
              kind: "text",
              text: transcript || "",
            })
          );
        } catch (err) {
          console.warn("voice/ws send error", err);
        }
      }
      appendVoiceEntry("user", transcript);
      appendVoiceEntry("lyra", reply);
      const wav = await resp.blob();
      player.src = URL.createObjectURL(wav);
      try {
        await player.play();
      } catch (playErr) {
        logOverlay(`Błąd odtwarzania: ${playErr?.message || playErr}`);
        if (overlay?.classList.contains("visible")) {
          startDetectionLoop();
        }
      }
      setStatus("Lyra odpowiada");
    } catch (err) {
      logOverlay(`Błąd wysyłki: ${err?.message || err}`);
      setStatus("Błąd sieci", true);
      if (overlay?.classList.contains("visible")) {
        startDetectionLoop();
      }
    }
  };

  const startRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    if (isMuted) {
      setStatus("Mikrofon wyciszony", true);
      return;
    }
    const ready = await ensureDetectionStream();
    if (!ready || !processedStream) {
      setStatus("Brak ścieżki audio", true);
      return;
    }
    stopDetectionLoop();
    recorderBuffer = [];
    try {
      mediaRecorder = new MediaRecorder(processedStream, { mimeType: "audio/webm" });
    } catch (err) {
      setStatus("Błąd kodeka", true);
      logOverlay(`Rejestrator nie zadziałał: ${err?.message || err}`);
      startDetectionLoop();
      return;
    }
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recorderBuffer.push(event.data);
      }
    };
    mediaRecorder.onstop = async () => {
      if (!recorderBuffer.length) {
        setStatus("Brak nagrania", true);
        logOverlay("Nic nie nagrano.");
        startDetectionLoop();
        return;
      }
      setStatus("Wysyłanie...", false);
      const blob = new Blob(recorderBuffer, { type: "audio/webm" });
      recorderBuffer = [];
      await sendAudio(blob);
    };
    mediaRecorder.start();
    isRecording = true;
    setRecordButtonState(true);
    setStatus("Nagrywam...");
    logOverlay("Rozpoczęto nagrywanie.");
    const duration = Number(durationSlider?.value ?? 12);
    recordingTimeoutId = window.setTimeout(() => {
      if (isRecording) {
        logOverlay("Limit nagrania osiągnięty.");
        stopRecording();
      }
    }, duration * 1000);
  };

  const fetchVoices = async () => {
    if (!voiceSelect) return;
    try {
      const resp = await fetch("/api/tts/voices");
      const data = await resp.json();
      const voices = data.voices || [];
      voiceSelect.innerHTML = "";
      if (!voices.length) {
        voiceSelect.innerHTML = "<option>Brak głosów</option>";
        return;
      }
      voices.forEach((voice) => {
        const option = document.createElement("option");
        option.value = voice.id || voice;
        option.textContent = voice.label || voice.id || voice;
        voiceSelect.appendChild(option);
      });
      voiceSelect.value = data.default || voices[0].id || voices[0];
    } catch (err) {
      voiceSelect.innerHTML = "<option>Brak połączenia</option>";
      logOverlay(`Nie można pobrać głosów: ${err?.message || err}`);
    }
  };

  const ensureOverlay = () => {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div class="voice-overlay-backdrop"></div>
      <div class="voice-overlay-panel">
        <div class="voice-overlay-header">
          <span>Rozmowa głosowa z Lyrą</span>
          <button type="button" aria-label="Zamknij" class="voice-overlay-close">×</button>
        </div>
        <div class="voice-overlay-body">
          <div class="voice-overlay-row">
            <div class="voice-overlay-controls">
              <label for="voice-tts-select">Wybór głosu TTS</label>
              <select id="voice-tts-select"></select>
            </div>
            <div class="voice-overlay-meter">
              <span>Poziom sygnału</span>
              <div class="voice-overlay-meter-bar">
                <div class="voice-overlay-meter-fill" id="voice-meter-fill"></div>
              </div>
              <span id="voice-meter-label">S-metr: 0%</span>
            </div>
          </div>
          <div class="voice-overlay-grid">
            <div class="voice-overlay-card">
              <label for="voice-gate-slider">Maska tła <span id="voice-gate-value">35%</span></label>
              <input type="range" id="voice-gate-slider" min="0" max="100" value="35" />
            </div>
            <div class="voice-overlay-card">
              <label for="voice-duration-slider">Limit nagrania <span id="voice-duration-value">12 s</span></label>
              <input type="range" id="voice-duration-slider" min="2" max="1000" value="12" />
            </div>
          </div>
          <div class="voice-overlay-grid">
            <div class="voice-overlay-card">
              <label for="voice-noise-slider">Redukcja szumów <span id="voice-noise-value">60%</span></label>
              <input type="range" id="voice-noise-slider" min="0" max="100" value="60" />
            </div>
            <div class="voice-overlay-card">
              <label for="voice-echo-slider">Echo <span id="voice-echo-value">40%</span></label>
              <input type="range" id="voice-echo-slider" min="0" max="100" value="40" />
            </div>
            <div class="voice-overlay-card">
              <label for="voice-agc-slider">AGC <span id="voice-agc-value">50%</span></label>
              <input type="range" id="voice-agc-slider" min="0" max="100" value="50" />
            </div>
          </div>
          <div class="voice-overlay-hotword">
            <input type="text" id="voice-hotword-input" value="Hey Lyra" placeholder="Hotword" />
            <button id="voice-hotword-save" type="button" class="btn btn-ghost btn-sm">Zapisz</button>
            <label><input type="checkbox" id="voice-auto-listen" checked /> Autodetekcja</label>
            <label><input type="checkbox" id="voice-auto-wake" checked /> Hotword</label>
          </div>
          <div class="voice-overlay-row">
            <button id="voice-mute-btn" type="button" class="btn btn-ghost btn-sm">Mute</button>
            <button id="voice-log-clear" type="button" class="btn btn-ghost btn-sm">Wyczyść log</button>
          </div>
          <div class="voice-overlay-log-section">
            <div id="${OVERLAY_LOG_ID}" class="voice-overlay-log">Logi rozmowy pojawią się tutaj.</div>
            <audio id="voice-overlay-player" controls></audio>
          </div>
        </div>
        <div class="voice-overlay-footer">
          <button id="voice-record-btn" type="button" class="btn btn-primary">🎙 Nagraj</button>
          <span class="voice-overlay-status" id="voice-status">Gotowe</span>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlayLog = overlay.querySelector(`#${OVERLAY_LOG_ID}`);
    statusLabel = overlay.querySelector("#voice-status");
    recordButton = overlay.querySelector("#voice-record-btn");
    gateSlider = overlay.querySelector("#voice-gate-slider");
    gateValue = overlay.querySelector("#voice-gate-value");
    durationSlider = overlay.querySelector("#voice-duration-slider");
    durationValue = overlay.querySelector("#voice-duration-value");
    noiseSlider = overlay.querySelector("#voice-noise-slider");
    noiseValue = overlay.querySelector("#voice-noise-value");
    echoSlider = overlay.querySelector("#voice-echo-slider");
    echoValue = overlay.querySelector("#voice-echo-value");
    agcSlider = overlay.querySelector("#voice-agc-slider");
    agcValue = overlay.querySelector("#voice-agc-value");
    hotwordInput = overlay.querySelector("#voice-hotword-input");
    hotwordSave = overlay.querySelector("#voice-hotword-save");
    autoListenToggle = overlay.querySelector("#voice-auto-listen");
    autoWakeToggle = overlay.querySelector("#voice-auto-wake");
    muteButton = overlay.querySelector("#voice-mute-btn");
    logClear = overlay.querySelector("#voice-log-clear");
    meterFill = overlay.querySelector("#voice-meter-fill");
    meterLabel = overlay.querySelector("#voice-meter-label");
    voiceSelect = overlay.querySelector("#voice-tts-select");
    if (recordButton) {
      recordButton.addEventListener("click", startRecording);
    }
    if (gateSlider) {
      const gateValueLabel = readStoredValue(STORAGE_KEYS.gate, 35);
      gateSlider.value = gateValueLabel;
      gateValue.textContent = `${gateSlider.value}%`;
      gateSlider.addEventListener("input", () => {
        updateSliderLabel(gateSlider, gateValue);
        persistValue(STORAGE_KEYS.gate, gateSlider.value);
      });
    }
    durationSlider && updateSliderFromStorage(durationSlider, durationValue, STORAGE_KEYS.duration, 12, " s");
    durationSlider?.addEventListener("input", () => {
      updateSliderLabel(durationSlider, durationValue, " s");
      persistValue(STORAGE_KEYS.duration, durationSlider.value);
    });
    noiseSlider && updateSliderFromStorage(noiseSlider, noiseValue, STORAGE_KEYS.noise, 60);
    noiseSlider?.addEventListener("input", () => {
      updateSliderLabel(noiseSlider, noiseValue);
      persistValue(STORAGE_KEYS.noise, noiseSlider.value);
      applyAudioSettings();
    });
    echoSlider && updateSliderFromStorage(echoSlider, echoValue, STORAGE_KEYS.echo, 40);
    echoSlider?.addEventListener("input", () => {
      updateSliderLabel(echoSlider, echoValue);
      persistValue(STORAGE_KEYS.echo, echoSlider.value);
      applyAudioSettings();
    });
    agcSlider && updateSliderFromStorage(agcSlider, agcValue, STORAGE_KEYS.agc, 50);
    agcSlider?.addEventListener("input", () => {
      updateSliderLabel(agcSlider, agcValue);
      persistValue(STORAGE_KEYS.agc, agcSlider.value);
      applyAudioSettings();
    });
    autoListenEnabled = !!readStoredValue(STORAGE_KEYS.autoListen, 1);
    autoListenToggle && (autoListenToggle.checked = autoListenEnabled);
    autoListenToggle?.addEventListener("change", () => {
      autoListenEnabled = autoListenToggle.checked;
      persistValue(STORAGE_KEYS.autoListen, autoListenEnabled ? 1 : 0);
      if (autoListenEnabled) {
        startDetectionLoop();
      } else {
        stopDetectionLoop();
      }
    });
    autoWakeEnabled = !!readStoredValue(STORAGE_KEYS.autoWake, 1);
    autoWakeToggle && (autoWakeToggle.checked = autoWakeEnabled);
    autoWakeToggle?.addEventListener("change", () => {
      autoWakeEnabled = autoWakeToggle.checked;
      persistValue(STORAGE_KEYS.autoWake, autoWakeEnabled ? 1 : 0);
    });
    if (hotwordInput) {
      hotwordInput.value = hotwordPattern;
    }
    hotwordSave?.addEventListener("click", () => {
      if (!hotwordInput) return;
      hotwordPattern = hotwordInput.value.trim() || DEFAULT_HOTWORD;
      persistValue(STORAGE_KEYS.hotword, hotwordPattern);
      logOverlay(`Hotword ustawiony: ${hotwordPattern}`);
    });
    muteButton?.addEventListener("click", () => {
      isMuted = !isMuted;
      if (isMuted) {
        muteButton.textContent = "Włącz nasłuch";
        muteButton.classList.add("muted");
        stopRecording();
        stopDetectionLoop();
        releaseDetectionResources();
        setStatus("Mikrofon wyciszony");
      } else {
        muteButton.textContent = "Mute";
        muteButton.classList.remove("muted");
        setStatus("Gotowe");
        startDetectionLoop();
      }
    });
    logClear?.addEventListener("click", () => {
      overlayLog && (overlayLog.textContent = "");
    });
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay || event.target.classList.contains("voice-overlay-backdrop") || event.target.classList.contains("voice-overlay-close")) {
        closeOverlay();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("visible")) {
        closeOverlay();
      }
    });
    return overlay;
  };

  const closeOverlay = () => {
    if (!overlay) return;
    overlay.classList.remove("visible");
    stopRecording();
    stopDetectionLoop();
    releaseDetectionResources();
    setRecordButtonState(false);
  };

  const openOverlay = () => {
    ensureOverlay();
    overlay.classList.add("visible");
    setRecordButtonState(false);
    setStatus("Gotowe");
    startDetectionLoop();
  };

  const buildMicButton = () => {
    const micBtn = document.createElement("button");
    micBtn.type = "button";
    micBtn.id = "voice-open-btn";
    micBtn.className = "voice-overlay-mic-button";
    micBtn.setAttribute("aria-label", "Rozmowa głosowa");
    micBtn.innerHTML = "🎙";
    return micBtn;
  };

  const stripLegacyButton = (toolbar) => {
    const legacy = toolbar.querySelector("[aria-label='Nagraj głos']");
    if (legacy) {
      legacy.style.display = "none";
    }
  };

  const addMicButton = () => {
    const toolbar = document.querySelector(".flex.flex-row.gap-2.ml-2");
    if (!toolbar) {
      requestAnimationFrame(addMicButton);
      return;
    }
    stripLegacyButton(toolbar);
    if (toolbar.querySelector("#voice-open-btn")) return;
    const micBtn = buildMicButton();
    micBtn.addEventListener("click", openOverlay);
    toolbar.insertBefore(micBtn, toolbar.firstChild);
    const observer = new MutationObserver(() => {
      if (!toolbar.contains(document.getElementById("voice-open-btn"))) {
        const fresh = buildMicButton();
        fresh.addEventListener("click", openOverlay);
        toolbar.insertBefore(fresh, toolbar.firstChild);
      }
    });
    observer.observe(toolbar, { childList: true, subtree: true });
  };

  const initVoiceLogWatcher = () => {
    const messagesList = document.getElementById("messages-list");
    if (!messagesList) {
      setTimeout(initVoiceLogWatcher, 500);
      return;
    }
    renderVoiceLogPanel();
    const observer = new MutationObserver(() => renderVoiceLogPanel());
    observer.observe(messagesList, { childList: true });
  };

  document.addEventListener("DOMContentLoaded", () => {
    ensureStyle();
    ensureOverlay();
    fetchVoices();
    addMicButton();
    initVoiceLogWatcher();
    ensureChatBridge();
    ensureConversationState();
    startVoiceModule().catch((err) => {
      console.error("Nie udało się uruchomić modułu voice", err);
      logOverlay("Moduł voice niedostępny.");
    });
  });

  window.addEventListener("beforeunload", () => {
    stopVoiceModule();
  });
})();
