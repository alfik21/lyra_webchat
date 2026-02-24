// Pasek akcji ala ChatGPT: Kopiuj / 👍 / 👎 / ⋮ Więcej + plusik przy polu wprowadzania.
(function(){
  if (window.__lyraActionsLoaded) return;
  window.__lyraActionsLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .lyra-action-bar { display:flex; gap:6px; padding:4px 2px; opacity:0.9; }
    .lyra-action-btn { display:flex; align-items:center; justify-content:center; height:28px; min-width:28px; padding:0 8px; border-radius:10px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#e2e8f0; font-size:12px; cursor:pointer; }
    .lyra-action-btn:hover { background:rgba(148,163,184,0.16); }
    .lyra-input-plus { display:flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:12px; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.05); color:#e2e8f0; cursor:pointer; margin-left:6px; }
    .lyra-input-plus:hover { background:rgba(148,163,184,0.16); }
    .lyra-plus-menu { position:absolute; bottom:52px; right:0; background:rgba(15,23,42,0.95); border:1px solid rgba(255,255,255,0.12); border-radius:12px; box-shadow:0 15px 35px rgba(0,0,0,0.35); padding:8px; display:none; flex-direction:column; gap:6px; min-width:160px; z-index:9999; }
    .lyra-plus-menu button { width:100%; border-radius:10px; border:1px solid rgba(255,255,255,0.1); padding:8px 10px; background:rgba(255,255,255,0.04); color:#e2e8f0; cursor:pointer; text-align:left; }
    .lyra-plus-menu button:hover { background:rgba(148,163,184,0.16); }
  `;
  document.head.appendChild(style);

  function flash(txt){
    const old=document.getElementById('lyra-toast');
    if(old) try{old.remove();}catch{}
    const note=document.createElement('div');
    note.id='lyra-toast';
    note.textContent=txt;
    Object.assign(note.style,{
      position:'fixed',bottom:'18px',right:'18px',padding:'10px 14px',background:'rgba(15,23,42,0.92)',color:'#e2e8f0',border:'1px solid rgba(255,255,255,0.12)',borderRadius:'12px',boxShadow:'0 10px 25px rgba(0,0,0,0.35)',zIndex:9999
    });
    document.body.appendChild(note);
    setTimeout(()=>{ try{note.remove();}catch{} },1400);
  }

  function addActions(){
    const chats=document.querySelectorAll('.chat');
    chats.forEach(chat=>{
      if (chat.classList.contains('lyra-actions-added')) return;
      const bubble=chat.querySelector('.chat-bubble');
      if (!bubble) return;
      if (chat.className.includes('chat-end')) return; // tylko asystent
      // Jeśli jest ukryty pasek (display:none / data-lyra-auto-hidden), usuń go, żeby nie dublować.
      const existingBars = bubble.parentElement?.querySelectorAll('.lyra-action-bar') || [];
      existingBars.forEach(b => {
        const style = (b.getAttribute('style') || '').toLowerCase();
        if (style.includes('display:none') || b.getAttribute('data-lyra-auto-hidden') === '1') {
          try { b.remove(); } catch {}
        }
      });
      if (bubble.parentElement?.querySelector('.lyra-action-bar')) { chat.classList.add('lyra-actions-added'); return; }
      const bar=document.createElement('div');
      bar.className='lyra-action-bar';
      const actions=[
        {label:'📋 Kopiuj', fn:()=>{const txt=bubble.innerText||''; navigator.clipboard?.writeText(txt); flash('Skopiowano');}},
        {label:'👍 Dobra', fn:()=>flash('Zgłoszono: dobra odpowiedź')},
        {label:'👎 Zła', fn:()=>flash('Zgłoszono: zła odpowiedź')},
        {label:'⋮ Więcej', fn:()=>flash('Więcej: do zaimplementowania')},
      ];
      actions.forEach(a=>{
        const b=document.createElement('button');
        b.className='lyra-action-btn';
        b.textContent=a.label;
        b.onclick=(ev)=>{ ev.stopPropagation(); a.fn(); };
        bar.appendChild(b);
      });
      bubble.parentElement?.appendChild(bar);
      chat.classList.add('lyra-actions-added');
    });
  }

  // Plusik przy polu input
  function addPlus(){
    const inputWrap=document.querySelector('.join, form, .chat-input') || document.querySelector('textarea')?.parentElement;
    if (!inputWrap) return;
    if (document.querySelector('.lyra-input-plus')) return;
    const plus=document.createElement('button');
    plus.type='button';
    plus.className='lyra-input-plus';
    plus.textContent='+';
    plus.title='Opcje (załącz/akcje)';
    plus.style.position='relative';
    plus.style.zIndex='5';
    const menu=document.createElement('div');
    menu.className='lyra-plus-menu';
    const items=[
      {label:'Wklej ze schowka', fn:()=>{navigator.clipboard?.readText().then(t=>{insertText(t);});}},
      {label:'Wyczyść pole', fn:()=>insertText('')},
      {label:'Załaduj plik (placeholder)', fn:()=>flash('Upload pliku: do zaimplementowania')},
      {label:'Otwórz zrzut ChatGPT', fn:()=>{ window.open('/chatgpt-embed.html','_blank'); }},
      {label:'Otwórz nakładkę ChatGPT', fn:()=>{ const ov=document.getElementById('lyra-chatgpt-overlay'); if(ov){ ov.style.display='block'; } else { flash('Nakładka niedostępna'); } }},
      {label:'Ustawienia TTS', fn:()=>{ window.open('/tts-settings.html','_blank'); }},
      {label:'Kamera / Live', fn:()=>{ window.open('/remote-camera','_blank'); }},
      {label:'Pokaż/ukryj debug log', fn:()=>{ const dbg=document.getElementById('lyra-debug-log'); if(dbg){ const vis=dbg.style.display!=='none'; dbg.style.display=vis?'none':'block'; } else { flash('Brak logu debug'); } }},
      {label:'Autoczytaj ON/OFF', fn:()=>{ if (window.toggleLyraAutoRead) { window.toggleLyraAutoRead(); } else { flash('Brak sterowania autoczytaj'); } }},
      {label:'Budzik', fn:()=>{ if (window.openLyraAlarm) { window.openLyraAlarm(); } else { flash('Budzik niedostępny'); } }},
    ];
    items.forEach(it=>{
      const b=document.createElement('button');
      b.textContent=it.label;
      b.onclick=(ev)=>{ ev.stopPropagation(); menu.style.display='none'; it.fn(); };
      menu.appendChild(b);
    });
    plus.onclick=(ev)=>{ ev.preventDefault(); ev.stopPropagation(); menu.style.display= menu.style.display==='flex'?'none':'flex'; };
    plus.appendChild(menu);
    // wstawiamy przy końcu wrappera
    if (inputWrap.appendChild) inputWrap.appendChild(plus);
  }

  function insertText(t){
    if (!t) return;
    const input=document.querySelector('textarea, input[type="text"]');
    if (input){ input.value=t; input.dispatchEvent(new Event('input',{bubbles:true})); input.focus(); }
  }

  const mo=new MutationObserver(()=>{ addActions(); addPlus(); });
  mo.observe(document.body,{childList:true,subtree:true});
  addActions();
  addPlus();
})();
