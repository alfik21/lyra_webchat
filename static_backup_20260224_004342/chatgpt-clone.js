// Lekka nakładka funkcji jak w ChatGPT: pasek akcji przy bąbelku, skróty klawiatury, prosty sidebar.
(function(){
  if (window.__lyraChatgptCloneLoaded) return;
  window.__lyraChatgptCloneLoaded = true;
  const style = document.createElement('style');
  style.textContent = `
    .lyra-action-bar { display:flex; gap:6px; padding:4px 2px; opacity:0.85; }
    .lyra-action-btn { display:flex; align-items:center; justify-content:center; height:28px; min-width:28px; padding:0 8px; border-radius:10px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.04); color:#e2e8f0; font-size:12px; cursor:pointer; }
    .lyra-action-btn:hover { background:rgba(148,163,184,0.16); }
    .lyra-sidebar { position:fixed; left:10px; top:70px; width:190px; padding:10px; border-radius:12px; background:rgba(15,23,42,0.92); border:1px solid rgba(255,255,255,0.08); box-shadow:0 12px 30px rgba(0,0,0,0.35); z-index:9990; color:#e2e8f0; font-size:13px; }
    .lyra-sidebar h4 { margin:0 0 8px 0; font-size:13px; font-weight:700; }
    .lyra-sidebar button { width:100%; margin-bottom:6px; padding:8px 10px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); color:#e2e8f0; cursor:pointer; }
    .lyra-sidebar button:hover { background:rgba(148,163,184,0.15); }
    .lyra-typing { position:fixed; bottom:12px; left:12px; padding:8px 12px; border-radius:12px; background:rgba(15,23,42,0.92); border:1px solid rgba(255,255,255,0.08); color:#e2e8f0; font-size:12px; z-index:9991; box-shadow:0 8px 20px rgba(0,0,0,0.25); display:none; }
    .lyra-typing span { display:inline-block; width:6px; height:6px; margin-right:4px; border-radius:50%; background:#fbbf24; animation:lyra-dots 1.2s infinite ease-in-out; }
    .lyra-typing span:nth-child(2){ animation-delay:0.15s; }
    .lyra-typing span:nth-child(3){ animation-delay:0.3s; }
    @keyframes lyra-dots { 0%,80%,100% { transform:scale(0.5); opacity:0.5; } 40% { transform:scale(1); opacity:1; } }
  `;
  document.head.appendChild(style);

  // Sidebar prosty (Nowa rozmowa + placeholder wątków)
  // Sidebar wątków wyłączony (zasłania UI) – pozostawione hooki na przyszłość.

  // Typing indicator
  let typing = document.querySelector('.lyra-typing');
  if (!typing) {
    typing = document.createElement('div');
    typing.className = 'lyra-typing';
    typing.innerHTML = '<span></span><span></span><span></span> Lyra pisze...';
    document.body.appendChild(typing);
  }
  let pendingCount = 0;
  function showTyping(on){ typing.style.display = on ? 'inline-flex' : 'none'; }

  // Pasek akcji przy bąbelku (kopiuj / good / bad / więcej)
  function addActions() {
    const chats = document.querySelectorAll('.chat');
    chats.forEach(chat => {
      if (chat.classList.contains('lyra-actions-added')) return;
      const bubble = chat.querySelector('.chat-bubble');
      if (!bubble) return;
      // Pomijaj bąbelki użytkownika; zostawiamy tylko asystenta.
      if (chat.className.includes('chat-end')) return;
      // Unikaj duplikatów w tym samym kontenerze
      if (bubble.parentElement?.querySelector('.lyra-action-bar')) { chat.classList.add('lyra-actions-added'); return; }
      const bar = document.createElement('div');
      bar.className = 'lyra-action-bar';
      const actions = [
        { label: '📋 Kopiuj', fn: () => { const txt = bubble.innerText || ''; navigator.clipboard?.writeText(txt); flash('Skopiowano'); } },
        { label: '👍 Dobra', fn: () => flash('Zgłoszono: dobra odpowiedź') },
        { label: '👎 Zła', fn: () => flash('Zgłoszono: zła odpowiedź') },
        { label: '⋮ Więcej', fn: () => flash('Więcej akcji – do zaimplementowania') },
      ];
      actions.forEach(a => {
        const b = document.createElement('button');
        b.className = 'lyra-action-btn';
        b.textContent = a.label;
        b.onclick = (ev) => { ev.stopPropagation(); a.fn(); };
        bar.appendChild(b);
      });
      bubble.parentElement?.appendChild(bar);
      chat.classList.add('lyra-actions-added');
    });
  }

  function flash(txt){
    const existing = document.getElementById('lyra-toast');
    if (existing) { try{ existing.remove(); }catch{} }
    const note = document.createElement('div');
    note.id = 'lyra-toast';
    note.textContent = txt;
    note.style.position = 'fixed';
    note.style.bottom = '20px';
    note.style.right = '20px';
    note.style.padding = '10px 14px';
    note.style.background = 'rgba(15,23,42,0.92)';
    note.style.color = '#e2e8f0';
    note.style.border = '1px solid rgba(255,255,255,0.12)';
    note.style.borderRadius = '12px';
    note.style.boxShadow = '0 10px 25px rgba(0,0,0,0.35)';
    note.style.zIndex = '9999';
    document.body.appendChild(note);
    setTimeout(()=>{ try{ note.remove(); }catch{} }, 1500);
  }

  // Skróty klawiaturowe: Ctrl+Enter => Wyślij; Esc => fokus pola tekstowego
  function sendShortcut(){
    const sendBtn = document.querySelector('button[aria-label*="Wyślij" i], button[aria-label*="wyslij" i], button[type="submit"], button.btn-primary');
    if (sendBtn) sendBtn.click();
  }
  function focusInput(){
    const input = document.querySelector('textarea, input[type="text"]');
    if (input){ input.focus(); input.selectionStart = input.value.length; }
  }
  document.addEventListener('keydown', (ev) => {
    if (ev.ctrlKey && ev.key === 'Enter'){ ev.preventDefault(); sendShortcut(); }
    if (ev.key === 'Escape'){ focusInput(); }
  });

  // Nasłuch DOM na nowe bąbelki
  const mo = new MutationObserver(() => addActions());
  mo.observe(document.body, { childList:true, subtree:true });
  addActions();

  // Prostą detekcję fetch długich zapytań (tylko informacja wizualna)
  const origFetch = window.fetch;
  window.fetch = function(input, init){
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const isChat = url.includes('/v1/chat/completions');
    if (isChat) { pendingCount++; showTyping(true); }
    return origFetch(input, init).then(resp => {
      if (isChat) {
        pendingCount = Math.max(0, pendingCount-1);
        if (pendingCount === 0) showTyping(false);
      }
      return resp;
    }).catch(err => {
      if (isChat) {
        pendingCount = Math.max(0, pendingCount-1);
        if (pendingCount === 0) showTyping(false);
      }
      throw err;
    });
  };
})();
