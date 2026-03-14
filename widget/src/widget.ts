// AgentForge Chat Widget
// Embed: <script src="widget.js" data-token="YOUR_TOKEN"></script>

(function () {
  // ─── Config ────────────────────────────────────────────────────────────────

  const script = document.currentScript as HTMLScriptElement | null;
  const token = script?.getAttribute('data-token') ?? '';
  const agentName = script?.getAttribute('data-name') ?? 'AI Assistant';
  const agentAvatar = script?.getAttribute('data-avatar') ?? '';
  const API_BASE = (script?.getAttribute('data-api') ?? 'https://api.agentforge.ai/api/v1').replace(/\/$/, '');

  if (!token) {
    console.warn('[AgentForge] Missing data-token attribute.');
    return;
  }

  // Prevent double-init
  if ((window as any).__agentForgeLoaded) return;
  (window as any).__agentForgeLoaded = true;

  // ─── Session ────────────────────────────────────────────────────────────────

  let sessionId = sessionStorage.getItem('af_session_' + token);
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    sessionStorage.setItem('af_session_' + token, sessionId);
  }

  // ─── Types ──────────────────────────────────────────────────────────────────

  interface Message {
    role: 'user' | 'assistant';
    content: string;
    ts: number;
  }

  // ─── State ──────────────────────────────────────────────────────────────────

  const messages: Message[] = [];
  let isOpen = false;
  let isLoading = false;

  // ─── Styles ─────────────────────────────────────────────────────────────────

  const css = `
    #af-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #af-root { position: fixed; bottom: 24px; right: 24px; z-index: 2147483647; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }

    #af-bubble {
      width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
      box-shadow: 0 0 0 0 rgba(124,58,237,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      animation: af-pulse 2.5s infinite;
    }
    #af-bubble:hover { transform: scale(1.08); box-shadow: 0 8px 32px rgba(124,58,237,0.5); animation: none; }
    #af-bubble svg, #af-bubble img { pointer-events: none; }
    #af-bubble img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }

    @keyframes af-pulse {
      0%   { box-shadow: 0 0 0 0   rgba(124,58,237,0.55); }
      70%  { box-shadow: 0 0 0 12px rgba(124,58,237,0);   }
      100% { box-shadow: 0 0 0 0   rgba(124,58,237,0);    }
    }

    #af-window {
      width: 368px; height: 540px; display: flex; flex-direction: column; overflow: hidden;
      background: #18181F; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.15);
      transform-origin: bottom right;
      transition: opacity 0.2s, transform 0.2s;
    }
    #af-window.af-hidden { opacity: 0; transform: scale(0.92) translateY(8px); pointer-events: none; }

    #af-header {
      padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
      background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, transparent 100%);
      display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
    }
    #af-header-left { display: flex; align-items: center; gap: 10px; }
    #af-avatar {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
      display: flex; align-items: center; justify-content: center;
    }
    #af-header-title { color: #E2E2F0; font-size: 14px; font-weight: 600; margin: 0; }
    #af-header-sub { color: #8888AA; font-size: 11px; margin: 0; display: flex; align-items: center; gap: 5px; }
    #af-status-dot { width: 6px; height: 6px; background: #22C55E; border-radius: 50%; display: inline-block; box-shadow: 0 0 6px #22C55E; }
    #af-close {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; color: #8888AA; cursor: pointer; padding: 6px 8px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    #af-close:hover { background: rgba(255,255,255,0.1); color: #E2E2F0; }

    #af-messages {
      flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    #af-messages::-webkit-scrollbar { width: 4px; }
    #af-messages::-webkit-scrollbar-track { background: transparent; }
    #af-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

    .af-msg { display: flex; flex-direction: column; max-width: 82%; }
    .af-msg.af-user { align-self: flex-end; align-items: flex-end; }
    .af-msg.af-assistant { align-self: flex-start; align-items: flex-start; }

    .af-bubble-msg {
      padding: 10px 14px; border-radius: 16px; font-size: 13px; line-height: 1.55; word-break: break-word;
    }
    .af-user .af-bubble-msg {
      background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
      color: #fff; border-bottom-right-radius: 4px;
    }
    .af-assistant .af-bubble-msg {
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
      color: #E2E2F0; border-bottom-left-radius: 4px;
    }
    .af-ts { color: #44445A; font-size: 10px; margin-top: 4px; }

    #af-typing { align-self: flex-start; display: flex; align-items: center; gap: 4px; padding: 12px 14px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; border-bottom-left-radius: 4px; }
    #af-typing span { width: 6px; height: 6px; background: #8888AA; border-radius: 50%; animation: af-bounce 1.2s infinite ease-in-out; }
    #af-typing span:nth-child(2) { animation-delay: 0.15s; }
    #af-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes af-bounce { 0%,80%,100% { transform: scale(0.7); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

    #af-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: #44445A; text-align: center; padding: 24px; }
    #af-empty svg { opacity: 0.3; }
    #af-empty p { font-size: 13px; margin: 0; }

    #af-footer { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
    #af-form { display: flex; gap: 8px; }
    #af-input {
      flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; color: #E2E2F0; font-size: 13px; outline: none;
      padding: 10px 14px; resize: none; line-height: 1.4; height: 42px; max-height: 120px;
      transition: border-color 0.15s;
    }
    #af-input::placeholder { color: #44445A; }
    #af-input:focus { border-color: rgba(124,58,237,0.5); }
    #af-send {
      width: 42px; height: 42px; flex-shrink: 0; border: none; border-radius: 12px; cursor: pointer;
      background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
      display: flex; align-items: center; justify-content: center;
      transition: opacity 0.15s, transform 0.15s;
    }
    #af-send:hover:not(:disabled) { opacity: 0.85; transform: scale(1.05); }
    #af-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    #af-powered { text-align: center; color: #2A2A3A; font-size: 10px; margin-top: 8px; }
    #af-powered a { color: #44445A; text-decoration: none; }
    #af-powered a:hover { color: #8888AA; }
  `;

  // ─── DOM ────────────────────────────────────────────────────────────────────

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function createRoot(): HTMLElement {
    const root = document.createElement('div');
    root.id = 'af-root';
    document.body.appendChild(root);
    return root;
  }

  const bubbleIconSvg = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill="white" fill-opacity="0.9"/>
    </svg>`;

  const bubbleContent = agentAvatar
    ? `<img src="${agentAvatar}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;" alt="${agentName}" />`
    : bubbleIconSvg;

  const avatarContent = agentAvatar
    ? `<img src="${agentAvatar}" style="width:36px;height:36px;border-radius:10px;object-fit:cover;" alt="${agentName}" />`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 12c5.33 0 8 2.67 8 4v2H4v-2c0-1.33 2.67-4 8-4z" fill="white" fill-opacity="0.9"/>
       </svg>`;

  function createBubble(): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.id = 'af-bubble';
    btn.setAttribute('aria-label', 'Open chat');
    btn.innerHTML = bubbleContent;
    return btn;
  }

  function createWindow(): HTMLElement {
    const win = document.createElement('div');
    win.id = 'af-window';
    win.className = 'af-hidden';
    win.innerHTML = `
      <div id="af-header">
        <div id="af-header-left">
          <div id="af-avatar">
            ${avatarContent}
          </div>
          <div>
            <p id="af-header-title">${agentName}</p>
            <p id="af-header-sub"><span id="af-status-dot"></span> Online</p>
          </div>
        </div>
        <button id="af-close" aria-label="Close chat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div id="af-messages">
        <div id="af-empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="#8888AA"/>
          </svg>
          <p>Ask me anything!</p>
        </div>
      </div>
      <div id="af-footer">
        <form id="af-form">
          <textarea id="af-input" placeholder="Type a message…" rows="1" autocomplete="off"></textarea>
          <button type="submit" id="af-send" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <line x1="22" y1="2" x2="11" y2="13" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2" fill="white" fill-opacity="0.9"/>
            </svg>
          </button>
        </form>
        <p id="af-powered">Powered by <a href="https://agentforge.ai" target="_blank" rel="noopener">AgentForge</a></p>
      </div>
    `;
    return win;
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function fmt(ts: number): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }

  function renderMessages(container: HTMLElement) {
    const empty = container.querySelector('#af-empty') as HTMLElement | null;
    if (messages.length === 0) {
      if (empty) empty.style.display = 'flex';
      return;
    }
    if (empty) empty.style.display = 'none';

    // Re-render all messages (simple approach for small chat)
    const existing = container.querySelectorAll('.af-msg');
    existing.forEach((el) => el.remove());

    for (const msg of messages) {
      const div = document.createElement('div');
      div.className = `af-msg af-${msg.role}`;
      div.innerHTML = `
        <div class="af-bubble-msg">${escapeHtml(msg.content)}</div>
        <span class="af-ts">${fmt(msg.ts)}</span>
      `;
      container.appendChild(div);
    }
  }

  function showTyping(container: HTMLElement) {
    let el = container.querySelector('#af-typing') as HTMLElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'af-typing';
      el.innerHTML = '<span></span><span></span><span></span>';
      container.appendChild(el);
    }
    el.style.display = 'flex';
    scrollToBottom(container);
  }

  function hideTyping(container: HTMLElement) {
    const el = container.querySelector('#af-typing') as HTMLElement | null;
    if (el) el.style.display = 'none';
  }

  function scrollToBottom(container: HTMLElement) {
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }

  // ─── API ────────────────────────────────────────────────────────────────────

  async function sendMessage(text: string): Promise<string> {
    const res = await fetch(`${API_BASE}/chat/${token}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, sessionId }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json() as { data?: { answer?: string }; error?: string };
    if (json.error) throw new Error(json.error);
    return json.data?.answer ?? '…';
  }

  // ─── Init ───────────────────────────────────────────────────────────────────

  function init() {
    injectStyles();
    const root = createRoot();
    const bubble = createBubble();
    const win = createWindow();

    root.appendChild(win);
    root.appendChild(bubble);

    const msgContainer = win.querySelector('#af-messages') as HTMLElement;
    const input = win.querySelector('#af-input') as HTMLTextAreaElement;
    const form = win.querySelector('#af-form') as HTMLFormElement;
    const sendBtn = win.querySelector('#af-send') as HTMLButtonElement;
    const closeBtn = win.querySelector('#af-close') as HTMLButtonElement;

    const closeSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    function open() {
      isOpen = true;
      win.classList.remove('af-hidden');
      bubble.innerHTML = closeSvg;
      bubble.setAttribute('aria-label', 'Close chat');
      setTimeout(() => input.focus(), 200);
    }

    function close() {
      isOpen = false;
      win.classList.add('af-hidden');
      bubble.innerHTML = bubbleContent;
      bubble.setAttribute('aria-label', 'Open chat');
    }

    bubble.addEventListener('click', () => (isOpen ? close() : open()));
    closeBtn.addEventListener('click', close);

    // Auto-resize textarea
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    // Shift+Enter = newline, Enter = submit
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { bubbles: true }));
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text || isLoading) return;

      input.value = '';
      input.style.height = '42px';

      messages.push({ role: 'user', content: text, ts: Date.now() });
      renderMessages(msgContainer);
      scrollToBottom(msgContainer);

      isLoading = true;
      sendBtn.disabled = true;
      showTyping(msgContainer);

      try {
        const answer = await sendMessage(text);
        hideTyping(msgContainer);
        messages.push({ role: 'assistant', content: answer, ts: Date.now() });
        renderMessages(msgContainer);
        scrollToBottom(msgContainer);
      } catch (err) {
        hideTyping(msgContainer);
        messages.push({
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          ts: Date.now(),
        });
        renderMessages(msgContainer);
        scrollToBottom(msgContainer);
        console.error('[AgentForge] Error:', err);
      } finally {
        isLoading = false;
        sendBtn.disabled = false;
        input.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
