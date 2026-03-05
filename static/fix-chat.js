// Debug overlay to show responses from /v1/chat/completions even if UI fails to render.
(function() {
  const originalFetch = window.fetch;
  const log = document.createElement('div');
  log.id = 'lyra-debug-log';
  log.style.position = 'fixed';
  log.style.top = '80px';
  log.style.right = 'auto';
  log.style.left = '12px';
  log.style.bottom = 'auto';
  log.style.width = '380px';
  log.style.maxHeight = '60vh';
  log.style.overflow = 'auto';
  log.style.zIndex = '99999';
  log.style.padding = '10px';
  log.style.borderRadius = '10px';
  log.style.background = 'rgba(15,23,42,0.92)';
  log.style.color = '#e2e8f0';
  log.style.fontSize = '12px';
  log.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
  log.innerHTML = '<div style="font-weight:700;margin-bottom:6px;">Lyra debug <span style="float:right;cursor:pointer;" onclick="this.parentElement.parentElement.style.display=\'none\'">✕</span></div>';

  // Przycisk toggle widoczny zawsze
  const toggleBtn = document.createElement('button');
  toggleBtn.textContent = '👁️ Debug';
  toggleBtn.style.position = 'fixed';
  toggleBtn.style.top = '80px';
  toggleBtn.style.right = 'auto';
  toggleBtn.style.left = '12px';
  toggleBtn.style.zIndex = '99999';
  toggleBtn.style.padding = '8px 12px';
  toggleBtn.style.borderRadius = '8px';
  toggleBtn.style.border = '1px solid rgba(255,255,255,0.3)';
  toggleBtn.style.background = 'rgba(15,23,42,0.9)';
  toggleBtn.style.color = '#e2e8f0';
  toggleBtn.style.fontSize = '12px';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.onclick = () => {
    log.style.display = log.style.display === 'none' ? 'block' : 'none';
  };
  document.body.appendChild(toggleBtn);

  // small TPS badge near the debug toggle
  const tpsBadge = document.createElement('div');
  tpsBadge.id = 'lyra-tps-badge';
  tpsBadge.style.position = 'fixed';
  tpsBadge.style.top = '78px';
  tpsBadge.style.right = 'auto';
  tpsBadge.style.left = '110px';
  tpsBadge.style.zIndex = '100000';
  tpsBadge.style.minWidth = '68px';
  tpsBadge.style.padding = '6px 10px';
  tpsBadge.style.borderRadius = '10px';
  tpsBadge.style.background = 'rgba(15,23,42,0.6)';
  tpsBadge.style.color = '#e6eef8';
  tpsBadge.style.fontSize = '12px';
  tpsBadge.style.fontWeight = '700';
  tpsBadge.style.textAlign = 'center';
  tpsBadge.style.boxShadow = '0 6px 18px rgba(2,6,23,0.5)';
  tpsBadge.style.border = '1px solid rgba(255,255,255,0.06)';
  tpsBadge.style.backdropFilter = 'blur(6px)';
  tpsBadge.style.transition = 'background 220ms ease, transform 220ms ease, opacity 220ms ease';
  tpsBadge.textContent = 'TPS —';
  document.body.appendChild(tpsBadge);

  function setTPS(val) {
    try {
      if (!val && val !== 0) {
        tpsBadge.textContent = 'TPS: -';
        tpsBadge.style.opacity = '0.7';
        return;
      }
      const n = Number(val);
      if (!isFinite(n)) {
        tpsBadge.textContent = `TPS: ${val}`;
        tpsBadge.style.opacity = '0.95';
        tpsBadge.style.transform = 'scale(1)';
        tpsBadge.style.background = 'rgba(255,255,255,0.04)';
        tpsBadge.style.borderColor = 'rgba(255,255,255,0.06)';
        return;
      }
      tpsHistory.push(n);
      if (tpsHistory.length > maxHistory) tpsHistory.shift();
      tpsBadge.textContent = `${n.toFixed(1)} TPS`;
      tpsBadge.style.opacity = '1';
      tpsBadge.style.transform = 'scale(1.04)';
      // color scale: red (<20), amber (20-50), green (>50)
      if (n > 50) {
        tpsBadge.style.background = 'linear-gradient(90deg,#10b981,#34d399)';
        tpsBadge.style.borderColor = 'rgba(16,185,129,0.35)';
      } else if (n >= 20) {
        tpsBadge.style.background = 'linear-gradient(90deg,#f59e0b,#fb923c)';
        tpsBadge.style.borderColor = 'rgba(245,158,11,0.25)';
      } else if (n > 0) {
        tpsBadge.style.background = 'linear-gradient(90deg,#ef4444,#f97316)';
        tpsBadge.style.borderColor = 'rgba(239,68,68,0.25)';
      } else {
        tpsBadge.style.background = 'rgba(255,255,255,0.04)';
        tpsBadge.style.borderColor = 'rgba(255,255,255,0.06)';
      }
    } catch (e) { /* ignore */ }
  }

  // history + tooltip
  const tpsHistory = [];
  const maxHistory = 30;
  const tooltip = document.createElement('div');
  tooltip.id = 'lyra-tps-tooltip';
  tooltip.style.position = 'fixed';
  tooltip.style.top = '110px';
  tooltip.style.right = 'auto';
  tooltip.style.left = '110px';
  tooltip.style.zIndex = '100001';
  tooltip.style.padding = '8px';
  tooltip.style.borderRadius = '10px';
  tooltip.style.background = 'rgba(2,6,23,0.9)';
  tooltip.style.color = '#e6eef8';
  tooltip.style.fontSize = '12px';
  tooltip.style.boxShadow = '0 12px 30px rgba(2,6,23,0.6)';
  tooltip.style.display = 'none';
  tooltip.style.minWidth = '160px';
  tooltip.style.pointerEvents = 'none';
  tooltip.innerHTML = '<div style="font-weight:700;margin-bottom:6px;">TPS (ostatnie)</div>';
  const sparkContainer = document.createElement('div');
  sparkContainer.style.height = '40px';
  sparkContainer.style.display = 'flex';
  sparkContainer.style.alignItems = 'center';
  tooltip.appendChild(sparkContainer);
  document.body.appendChild(tooltip);

  function renderSparkline() {
    const h = 36, w = 150, pad = 6;
    const data = tpsHistory.slice(-maxHistory);
    const svgNS = 'http://www.w3.org/2000/svg';
    while (sparkContainer.firstChild) sparkContainer.removeChild(sparkContainer.firstChild);
    if (!data.length) return;
    const min = Math.min(...data), max = Math.max(...data);
    const range = (max - min) || 1;
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    const path = document.createElementNS(svgNS, 'path');
    let d = '';
    data.forEach((v, i) => {
      const x = pad + (i / (data.length - 1 || 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / range) * (h - pad * 2);
      d += (i === 0 ? 'M' : ' L') + x.toFixed(1) + ' ' + y.toFixed(1);
    });
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#60a5fa');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);
    // area
    const area = document.createElementNS(svgNS, 'path');
    const areaD = d + ' L ' + (pad + (data.length - 1) / (data.length - 1 || 1) * (w - pad * 2)).toFixed(1) + ' ' + (h - pad) + ' L ' + pad + ' ' + (h - pad) + ' Z';
    area.setAttribute('d', areaD);
    area.setAttribute('fill', 'rgba(96,165,250,0.12)');
    svg.insertBefore(area, path);
    sparkContainer.appendChild(svg);
    // add stats
    const stats = document.createElement('div');
    stats.style.marginLeft = '8px';
    stats.style.fontSize = '11px';
    stats.innerHTML = `<div style="font-weight:600">Średnio: ${(data.reduce((a,b)=>a+b,0)/data.length).toFixed(1)} TPS</div><div style="color:#94a3b8">Min ${min.toFixed(1)} • Max ${max.toFixed(1)}</div>`;
    sparkContainer.appendChild(stats);
  }

  tpsBadge.addEventListener('mouseenter', () => {
    renderSparkline();
    tooltip.style.display = 'block';
  });
  tpsBadge.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
  });

  // === Prosty pasek TTS (czytanie odpowiedzi) ===
  let lastContent = '';
  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '6px';
  controls.style.flexWrap = 'wrap';
  controls.style.marginBottom = '8px';

  let autoRead = false;
  const TTS_RATE_KEY = 'tts_rate';
  const TTS_PITCH_KEY = 'tts_pitch';
  const TTS_STYLE_KEY = 'tts_style';

  function clamp(v, min, max, fallback) {
    const n = Number(v);
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function getTtsSettings() {
    return {
      rate: clamp(localStorage.getItem(TTS_RATE_KEY), 0.6, 1.8, 1.0),
      pitch: clamp(localStorage.getItem(TTS_PITCH_KEY), 0.5, 2.0, 1.0),
      style: (localStorage.getItem(TTS_STYLE_KEY) || 'neutral').trim() || 'neutral',
    };
  }

  function saveTtsSettings(settings) {
    localStorage.setItem(TTS_RATE_KEY, String(clamp(settings.rate, 0.6, 1.8, 1.0)));
    localStorage.setItem(TTS_PITCH_KEY, String(clamp(settings.pitch, 0.5, 2.0, 1.0)));
    localStorage.setItem(TTS_STYLE_KEY, (settings.style || 'neutral').trim() || 'neutral');
  }

  const speakBtn = document.createElement('button');
  speakBtn.textContent = '🔊 Czytaj ostatnią';
  speakBtn.style.padding = '6px 8px';
  speakBtn.style.border = '1px solid rgba(255,255,255,0.2)';
  speakBtn.style.borderRadius = '8px';
  speakBtn.style.background = 'rgba(56,189,248,0.1)';
  speakBtn.style.color = '#e2e8f0';
  speakBtn.style.cursor = 'pointer';

  const autoBtn = document.createElement('button');
  autoBtn.textContent = '🗣️ Auto-czytaj';
  autoBtn.style.padding = '6px 8px';
  autoBtn.style.border = '1px solid rgba(255,255,255,0.2)';
  autoBtn.style.borderRadius = '8px';
  autoBtn.style.background = 'rgba(34,197,94,0.15)';
  autoBtn.style.color = '#e2e8f0';
  autoBtn.style.cursor = 'pointer';
  autoBtn.onclick = () => {
    autoRead = !autoRead;
    autoBtn.style.background = autoRead ? 'rgba(34,197,94,0.35)' : 'rgba(34,197,94,0.15)';
    autoBtn.textContent = autoRead ? '🗣️ Auto-czytaj (ON)' : '🗣️ Auto-czytaj';
  };

  const settingsBtn = document.createElement('button');
  settingsBtn.textContent = '⚙️ Ustawienia mowy';
  settingsBtn.style.padding = '6px 8px';
  settingsBtn.style.border = '1px solid rgba(255,255,255,0.2)';
  settingsBtn.style.borderRadius = '8px';
  settingsBtn.style.background = 'rgba(56,189,248,0.1)';
  settingsBtn.style.color = '#e2e8f0';
  settingsBtn.style.cursor = 'pointer';

  const settingsPanel = document.createElement('div');
  settingsPanel.style.display = 'none';
  settingsPanel.style.marginTop = '6px';
  settingsPanel.style.padding = '6px';
  settingsPanel.style.border = '1px solid rgba(255,255,255,0.1)';
  settingsPanel.style.borderRadius = '8px';
  settingsPanel.style.background = 'rgba(255,255,255,0.03)';
  settingsPanel.innerHTML = '<div style="margin-bottom:6px;font-weight:600;">Wybierz głos (PL) albo backend:</div>';

  const backendToggle = document.createElement('select');
  backendToggle.style.width = '100%';
  backendToggle.style.padding = '6px';
  backendToggle.style.borderRadius = '6px';
  backendToggle.style.border = '1px solid rgba(255,255,255,0.2)';
  backendToggle.innerHTML = `
    <option value="browser">TTS przeglądarki</option>
    <option value="backend">TTS Lyry (Piper/RHVoice)</option>
  `;
  settingsPanel.appendChild(backendToggle);

  const engineSelect = document.createElement('select');
  engineSelect.style.width = '100%';
  engineSelect.style.marginTop = '6px';
  engineSelect.style.padding = '6px';
  engineSelect.style.borderRadius = '6px';
  engineSelect.style.border = '1px solid rgba(255,255,255,0.2)';
  settingsPanel.appendChild(engineSelect);

  const voiceSelect = document.createElement('select');
  voiceSelect.style.width = '100%';
  voiceSelect.style.marginTop = '6px';
  voiceSelect.style.padding = '6px';
  voiceSelect.style.borderRadius = '6px';
  voiceSelect.style.border = '1px solid rgba(255,255,255,0.2)';
  settingsPanel.appendChild(voiceSelect);

  const styleSelect = document.createElement('select');
  styleSelect.style.width = '100%';
  styleSelect.style.marginTop = '6px';
  styleSelect.style.padding = '6px';
  styleSelect.style.borderRadius = '6px';
  styleSelect.style.border = '1px solid rgba(255,255,255,0.2)';
  styleSelect.innerHTML = `
    <option value="neutral">Styl: neutral</option>
    <option value="assistant">Styl: assistant</option>
    <option value="calm">Styl: calm</option>
    <option value="energetic">Styl: energetic</option>
  `;
  settingsPanel.appendChild(styleSelect);

  const rateWrap = document.createElement('div');
  rateWrap.style.marginTop = '8px';
  rateWrap.innerHTML = '<div style="font-size:12px;margin-bottom:4px;">Tempo</div>';
  const rateInput = document.createElement('input');
  rateInput.type = 'range';
  rateInput.min = '0.6';
  rateInput.max = '1.8';
  rateInput.step = '0.1';
  rateInput.style.width = '100%';
  const rateValue = document.createElement('div');
  rateValue.style.fontSize = '12px';
  rateValue.style.opacity = '0.9';
  rateWrap.appendChild(rateInput);
  rateWrap.appendChild(rateValue);
  settingsPanel.appendChild(rateWrap);

  const pitchWrap = document.createElement('div');
  pitchWrap.style.marginTop = '8px';
  pitchWrap.innerHTML = '<div style="font-size:12px;margin-bottom:4px;">Pitch</div>';
  const pitchInput = document.createElement('input');
  pitchInput.type = 'range';
  pitchInput.min = '0.5';
  pitchInput.max = '2.0';
  pitchInput.step = '0.1';
  pitchInput.style.width = '100%';
  const pitchValue = document.createElement('div');
  pitchValue.style.fontSize = '12px';
  pitchValue.style.opacity = '0.9';
  pitchWrap.appendChild(pitchInput);
  pitchWrap.appendChild(pitchValue);
  settingsPanel.appendChild(pitchWrap);

  const player = document.createElement('audio');
  player.controls = true;
  player.style.width = '100%';
  player.style.marginTop = '6px';
  settingsPanel.appendChild(player);

  settingsBtn.onclick = () => {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  };

  controls.appendChild(speakBtn);
  controls.appendChild(autoBtn);
  controls.appendChild(settingsBtn);
  // Udostępnij toggle auto-czytania globalnie dla innych modułów (np. plus-menu).
  window.toggleLyraAutoRead = () => {
    autoRead = !autoRead;
    autoBtn.style.background = autoRead ? 'rgba(34,197,94,0.35)' : 'rgba(34,197,94,0.15)';
    autoBtn.textContent = autoRead ? '🗣️ Auto-czytaj (ON)' : '🗣️ Auto-czytaj';
  };
  log.insertBefore(controls, log.firstChild);
  log.insertBefore(settingsPanel, controls.nextSibling);

  async function populateBackend() {
    try {
      const r = await fetch("/api/tts/get");
      let data;
      try {
        data = await r.json();
      } catch (e) {
        const txt = await r.text().catch(()=>'<no-body>');
        append('[tts-backend] invalid JSON from proxy: ' + txt.slice(0,400));
        return;
      }
      if (data?.error) {
        append('[tts-backend] proxy error: ' + (data.error || 'unknown') + (data.preview ? '\n' + data.preview.slice(0,400) : ''));
        return;
      }
      const engines = data.engines || [];
      const voices = data.voices || {};
      engineSelect.innerHTML = engines.map(e => `<option value="${e}">${e}</option>`).join("");
      const eng = data.tts?.engine || engines[0] || "piper";
      engineSelect.value = eng;
      const list = voices?.[eng] || voices?.[eng?.split(':')[0]] || [];
      voiceSelect.innerHTML = list.map(v => `<option value="${v}">${v}</option>`).join("");
      if (data.tts?.voice && list.includes(data.tts.voice)) voiceSelect.value = data.tts.voice;
    } catch (e) {
      append('[tts-backend] ' + e);
    }
  }

  function populateVoices() {
    const voices = speechSynthesis.getVoices() || [];
    const plVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('pl'));
    const options = [
      { label: 'Auto (PL jeśli dostępne)', value: '' },
      { label: 'Ewa (jeśli dostępna)', value: 'ewa' },
      { label: 'Magda (jeśli dostępna)', value: 'magda' },
    ];
    voiceSelect.innerHTML = '';
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      voiceSelect.appendChild(o);
    });
    // Dodaj wszystkie znalezione głosy PL
    plVoices.forEach(v => {
      const o = document.createElement('option');
      o.value = v.name;
      o.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(o);
    });
  }

  function pickVoice() {
    const want = (voiceSelect.value || '').toLowerCase();
    const voices = speechSynthesis.getVoices() || [];
    if (!voices.length) return null;
    const plVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('pl'));
    const byName = voices.find(v => (v.name || '').toLowerCase().includes(want));
    if (byName) return byName;
    if (plVoices.length) return plVoices[0];
    return voices[0];
  }

  function stopSpeaking() {
    try { speechSynthesis.cancel(); } catch {}
    try { player.pause(); player.currentTime = 0; } catch {}
    setLipsActive(false);
  }

  function speak(text) {
    if (!text) return;
    const pref = (localStorage.getItem('tts_voice') || '').trim();
    if (pref === 'off') return;
    // Jeśli już mówi, drugie kliknięcie = stop.
    if (speechSynthesis && speechSynthesis.speaking) {
      stopSpeaking();
      return;
    }
    if (pref && pref !== 'system') {
      backendSpeak(text, pref);
      return;
    }
    if ((backendToggle.value || 'browser') === 'backend') {
      backendSpeak(text);
      return;
    }
    try {
      const tts = getTtsSettings();
      const utt = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utt.voice = voice;
      utt.lang = voice?.lang || 'pl-PL';
      utt.rate = tts.rate;
      utt.pitch = tts.pitch;
      utt.onend = () => setLipsActive(false);
      utt.oncancel = () => setLipsActive(false);
      speechSynthesis.cancel();
      speechSynthesis.speak(utt);
    } catch (e) {
      append('[tts-error] ' + e);
    } finally {
      setTimeout(() => setLipsActive(false), 5000);
    }
  }

  function refreshTtsUi() {
    const tts = getTtsSettings();
    rateInput.value = String(tts.rate);
    pitchInput.value = String(tts.pitch);
    styleSelect.value = tts.style;
    rateValue.textContent = `Tempo: ${tts.rate.toFixed(1)}`;
    pitchValue.textContent = `Pitch: ${tts.pitch.toFixed(1)}`;
  }

  rateInput.addEventListener('input', () => {
    saveTtsSettings({
      rate: rateInput.value,
      pitch: pitchInput.value,
      style: styleSelect.value,
    });
    refreshTtsUi();
  });
  pitchInput.addEventListener('input', () => {
    saveTtsSettings({
      rate: rateInput.value,
      pitch: pitchInput.value,
      style: styleSelect.value,
    });
    refreshTtsUi();
  });
  styleSelect.addEventListener('change', () => {
    saveTtsSettings({
      rate: rateInput.value,
      pitch: pitchInput.value,
      style: styleSelect.value,
    });
    refreshTtsUi();
  });

  if (typeof speechSynthesis !== 'undefined') {
    populateVoices();
    speechSynthesis.onvoiceschanged = populateVoices;
  }
  populateBackend();
  refreshTtsUi();

  // Stale przyciski: "usta" (czytaj) i "mikrofon" (mowa->tekst) przy pasku czatu
  const lipsBtn = document.createElement('button');
  lipsBtn.textContent = '👄';
  lipsBtn.title = 'Czytaj ostatnią odpowiedź';
  lipsBtn.style.position = 'fixed';
  lipsBtn.style.bottom = '130px'; // przybliżone miejsce przy pasku akcji/bąbelkach
  lipsBtn.style.right = '82px';
  lipsBtn.style.width = '44px';
  lipsBtn.style.height = '44px';
  lipsBtn.style.borderRadius = '50%';
  lipsBtn.style.border = '1px solid rgba(255,255,255,0.25)';
  lipsBtn.style.background = 'linear-gradient(135deg, #fb7185, #f472b6)';
  lipsBtn.style.color = '#0b1120';
  lipsBtn.style.fontSize = '20px';
  lipsBtn.style.cursor = 'pointer';
  lipsBtn.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)';
  function setLipsActive(on) {
    lipsBtn.style.animation = on ? 'lyra-pulse 1.4s ease-in-out infinite' : '';
    lipsBtn.style.opacity = on ? '1' : '0.9';
  }
  lipsBtn.onclick = () => { if (lastContent) { setLipsActive(true); speak(lastContent); } };

  // Mikrofon - mowa na tekst (przy polu "wpisz wiadomosc")
  const micBtn = document.createElement('button');
  micBtn.textContent = '🎙';
  micBtn.title = 'Mów – tekst trafi do pola czatu';
  micBtn.style.position = 'fixed';
  micBtn.style.bottom = '130px';
  micBtn.style.right = '32px';
  micBtn.style.width = '44px';
  micBtn.style.height = '44px';
  micBtn.style.borderRadius = '50%';
  micBtn.style.border = '1px solid rgba(255,255,255,0.25)';
  micBtn.style.background = 'linear-gradient(135deg, #38bdf8, #22d3ee)';
  micBtn.style.color = '#0b1120';
  micBtn.style.fontSize = '20px';
  micBtn.style.cursor = 'pointer';
  micBtn.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)';

  let recognition = null;
  let listening = false;
  function ensureRecognizer() {
    if (recognition) return recognition;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      append('[stt] Brak wsparcia SpeechRecognition w tej przeglądarce.');
      return null;
    }
    recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'pl-PL';
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      updateChatInput(transcript.trim());
    };
    recognition.onerror = (e) => append('[stt-error] ' + (e.error || e.message || e));
    recognition.onend = () => {
      listening = false;
      setMicActive(false);
    };
    return recognition;
  }

  function setMicActive(on) {
    micBtn.style.animation = on ? 'lyra-pulse 1.2s ease-in-out infinite' : '';
    micBtn.style.opacity = on ? '1' : '0.9';
  }

  function updateChatInput(text) {
    if (!text) return;
    const input = document.querySelector('textarea, input[type="text"]');
    if (input) {
      input.value = text;
      const ev = new Event('input', { bubbles: true });
      input.dispatchEvent(ev);
    }
  }

  micBtn.onclick = () => {
    const rec = ensureRecognizer();
    if (!rec) return;
    if (listening) {
      rec.stop();
      listening = false;
      setMicActive(false);
      return;
    }
    try {
      rec.start();
      listening = true;
      setMicActive(true);
    } catch (e) {
      append('[stt-error] ' + e);
      listening = false;
      setMicActive(false);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(lipsBtn);
      document.body.appendChild(micBtn);
    });
  } else {
    document.body.appendChild(lipsBtn);
    document.body.appendChild(micBtn);
  }

  // Wstrzykniecie ikonki "usta" bezposrednio w pasek akcji wiadomosci (obok kopiuj/regeneruj/edytuj)
  function injectInlineLips() {
    const bars = document.querySelectorAll('.flex-row-reverse, .lyra-actions');
    bars.forEach(bar => {
      if (bar.querySelector('.lyra-lips-inline')) return;
      if (!bar.querySelector('.lyra-btn-regenerate') && !bar.querySelector('.lyra-btn-copy')) return;
      const btn = document.createElement('button');
      btn.className = 'btn-mini w-8 h-8 flex items-center justify-center lyra-lips-inline';
      btn.title = 'Czytaj tę odpowiedź';
      btn.setAttribute('aria-label', 'Czytaj tę odpowiedź');
      btn.style.border = '1px solid rgba(255,255,255,0.2)';
      btn.style.background = 'linear-gradient(135deg, #fb7185, #f472b6)';
      btn.style.color = '#0b1120';
      btn.textContent = '👄';
      btn.onclick = (ev) => {
        ev.stopPropagation();
        const bubble = bar.closest('.chat') || document;
        const text = bubble?.querySelector('.chat-bubble')?.innerText || lastContent;
        if (text && text.trim()) {
          setLipsActive(true);
          speak(text.trim());
        }
      };
      bar.appendChild(btn);
    });
  }

  // Mutacja DOM - nasluchuj nowych paskow akcji
  const mo = new MutationObserver(() => injectInlineLips());
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectInlineLips();
      mo.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    injectInlineLips();
    mo.observe(document.body, { childList: true, subtree: true });
  }

  async function backendSpeak(text, voiceOverride) {
    try {
      const pref = (voiceOverride || localStorage.getItem('tts_voice') || voiceSelect.value || 'piper-pl-female').trim();
      if (!pref || pref === 'off' || pref === 'system') {
        return;
      }
      const payload = {
        text: text || 'Test TTS',
        voice: pref,
        tts_rate: getTtsSettings().rate,
        tts_pitch: getTtsSettings().pitch,
        tts_style: getTtsSettings().style,
      };
      const r = await fetch("/api/tts", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const txt = await r.text().catch(()=>'<no-body>');
        append('[tts-backend] HTTP ' + r.status + ' ' + txt.slice(0,400));
        return;
      }
      const blob = await r.blob();
      player.src = URL.createObjectURL(blob);
      player.play().catch(()=>{});
      player.onended = () => setLipsActive(false);
    } catch (e) {
      append('[tts-backend-error] ' + e);
    } finally {
      setTimeout(() => setLipsActive(false), 5000);
    }
  }

  function append(text) {
    const p = document.createElement('div');
    p.textContent = text;
    p.style.marginBottom = '6px';
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
  }

  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : (input.url || '');
    const isChat = url.includes('/v1/chat/completions');
    const isStream = init && init.stream;
    let streamContent = '';
    let patchedInput = input;
    let patchedInit = init;
    if (isChat && init && typeof init.body === 'string') {
      try {
        const bodyObj = JSON.parse(init.body);
        const ttsSettings = getTtsSettings();
        const ttsVoice = (localStorage.getItem('tts_voice') || 'piper-pl-female').trim() || 'piper-pl-female';
        if (!bodyObj.tts_voice) {
          bodyObj.tts_voice = ttsVoice;
        }
        if (bodyObj.tts_rate === undefined) bodyObj.tts_rate = ttsSettings.rate;
        if (bodyObj.tts_pitch === undefined) bodyObj.tts_pitch = ttsSettings.pitch;
        if (!bodyObj.tts_style) bodyObj.tts_style = ttsSettings.style;
        patchedInit = Object.assign({}, init, { body: JSON.stringify(bodyObj) });
      } catch (e) { /* ignore */ }
    }
    
    try {
      const resp = await originalFetch(patchedInput, patchedInit);
      if (!isChat) return resp;
      
      // Handle streaming responses
      if (isStream && resp.body) {
        const reader = resp.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        
        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;
                  try {
                    const json = JSON.parse(data);
                    const delta = json?.choices?.[0]?.delta?.content;
                    if (delta) {
                      streamContent += delta;
                    }
                    // Check for timings in final chunk
                    const timings = json?.timings;
                    if (timings && json?.choices?.[0]?.finish_reason === 'stop') {
                      const tps = timings.predicted_per_second || (json?.lyra_stats || {}).tokens_per_second || null;
                      append('[stream-end] tokens/sec: ' + (tps || '?'));
                      setTPS(tps);
                    }
                  } catch (e) { /* ignore parse errors */ }
                }
              }
            }
            if (streamContent) {
              lastContent = streamContent;
              if (autoRead) {
                setLipsActive(true);
                speak(streamContent);
              }
            }
          } catch (e) {
            append('[stream-error] ' + e);
          }
        };
        
        processStream();
        setTPS(null);
        append('[stream] started...');
        return resp;
      }
      
      // Handle non-stream responses
      const clone = resp.clone();
      clone.json().then(data => {
        let content = '';
        try {
          if (data?.choices?.[0]?.message?.content) content = data.choices[0].message.content;
          else if (data?.choices?.[0]?.content) content = data.choices[0].content;
          if (content) {
            lastContent = content;
            if (autoRead) {
              setLipsActive(true);
              speak(content);
            }
          }
        } catch (e) { /* ignore */ }
        append('[chat] ' + (content || JSON.stringify(data).slice(0,400)));
        }).catch(() => {});
      // non-stream responses might include timings/lyra_stats
      try {
        clone.json().then(data => {
          const tps = (data?.timings?.predicted_per_second) || (data?.lyra_stats?.tokens_per_second) || null;
          if (tps) setTPS(tps);
        }).catch(()=>{});
      } catch(e){}
      return resp;
    } catch (e) {
      if (isChat) append('[error] ' + e);
      throw e;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(log));
  } else {
    document.body.appendChild(log);
  }
})();
