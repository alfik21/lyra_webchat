// Debug overlay to show responses from /v1/chat/completions even if UI fails to render.
(function() {
  const originalFetch = window.fetch;
  const log = document.createElement('div');
  log.id = 'lyra-debug-log';
  log.style.position = 'fixed';
  log.style.bottom = '12px';
  log.style.left = '12px';
  log.style.width = '340px';
  log.style.maxHeight = '55vh';
  log.style.overflow = 'auto';
  log.style.zIndex = '99999';
  log.style.padding = '10px';
  log.style.borderRadius = '10px';
  log.style.background = 'rgba(15,23,42,0.92)';
  log.style.color = '#e2e8f0';
  log.style.fontSize = '12px';
  log.style.boxShadow = '0 10px 30px rgba(0,0,0,0.35)';
  log.innerHTML = '<div style="font-weight:700;margin-bottom:6px;">Lyra debug</div>';

  // === Prosty pasek TTS (czytanie odpowiedzi) ===
  let lastContent = '';
  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '6px';
  controls.style.flexWrap = 'wrap';
  controls.style.marginBottom = '8px';

  let autoRead = false;

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
      const r = await fetch("http://127.0.0.1:11446/api/tts/get");
      const data = await r.json();
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
    // Jeśli już mówi, drugie kliknięcie = stop.
    if (speechSynthesis && speechSynthesis.speaking) {
      stopSpeaking();
      return;
    }
    if ((backendToggle.value || 'browser') === 'backend') {
      backendSpeak(text);
      return;
    }
    try {
      const utt = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utt.voice = voice;
      utt.lang = voice?.lang || 'pl-PL';
      utt.rate = 1.0;
      utt.pitch = 1.0;
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

  if (typeof speechSynthesis !== 'undefined') {
    populateVoices();
    speechSynthesis.onvoiceschanged = populateVoices;
  }
  populateBackend();

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

  async function backendSpeak(text) {
    try {
      const payload = {
        engine: engineSelect.value || 'piper',
        voice: voiceSelect.value || '',
        text: text || 'Test TTS',
      };
      const r = await fetch("http://127.0.0.1:11446/api/tts/test", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      append('[tts-backend] ' + JSON.stringify(data));
      const wav = await fetch("http://127.0.0.1:11446/api/tts/file");
      if (wav.ok) {
        const blob = await wav.blob();
        player.src = URL.createObjectURL(blob);
        player.play().catch(()=>{});
        player.onended = () => setLipsActive(false);
      } else {
        append('[tts-backend] brak pliku WAV ' + wav.status);
      }
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
    try {
      const resp = await originalFetch(input, init);
      if (!isChat) return resp;
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
