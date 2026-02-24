(function () {
  const style = document.createElement("style");
  style.textContent = `
    .lyra-utility-nav {
      position: fixed;
      top: 12px;
      right: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 6px 20px rgba(15, 23, 42, 0.6);
      z-index: 9999;
      font-size: 0.75rem;
      backdrop-filter: blur(6px);
    }
    .lyra-utility-nav a {
      color: #e2e8f0;
      font-weight: 600;
      text-decoration: none;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      transition: background 0.2s ease, color 0.2s ease;
    }
    .lyra-utility-nav a:hover {
      background: rgba(251, 146, 60, 0.15);
      color: #fb923c;
    }
  `;
  const nav = document.createElement("div");
  nav.className = "lyra-utility-nav";
  nav.innerHTML = `
    <a href="/">Czat</a>
    <a href="/voice.html">Voice UI</a>
    <a href="/voice">Live</a>
    <a href="/tts-settings.html">👄 TTS</a>
    <a href="/remote-camera">Kamera</a>
    <a href="/simple-chat.html">Prosty czat</a>
    <a href="/app">Nowa strona</a>
    <a href="/chatgpt-embed.html" target="_blank" rel="noopener">ChatGPT (pełny)</a>
    <!-- Nakładka wyłączona, by nie ładować brakujących zasobów z chatgpt.html -->
  `;
  const insert = () => {
    const root = document.body;
    if (!root) return;
    if (!document.body.contains(nav)) {
      root.appendChild(nav);
    }
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      document.head.appendChild(style);
      insert();
    });
  } else {
    document.head.appendChild(style);
    insert();
  }
})();
