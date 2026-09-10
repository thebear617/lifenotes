const GATEWAY_URL = 'http://127.0.0.1:4332';
const STORAGE_PREFIX = 'local-agent-gateway-v1';

const BACKEND_LABELS = {
  'claude-code': 'Claude Code',
  opencode: 'OpenCode',
  codebuddy: 'CodeBuddy',
};

const styles = `
.agent-chat-widget { position: fixed; right: 24px; bottom: 24px; z-index: 1400; display: flex; flex-direction: column; align-items: flex-end; color: #26343a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif; }
.agent-chat-toggle { display: inline-flex; align-items: center; gap: 9px; min-height: 44px; padding: 0 16px; border: 1px solid #0f766e; border-radius: 999px; color: #fff; background: #0f766e; box-shadow: 0 10px 28px rgba(15, 118, 110, .24); font-size: 13px; font-weight: 800; }
.agent-chat-toggle:hover { border-color: #115e59; color: #fff; background: #115e59; }
.agent-chat-toggle:focus-visible, .agent-chat-panel button:focus-visible, .agent-chat-panel textarea:focus-visible { outline: 3px solid rgba(20, 184, 166, .24); outline-offset: 2px; }
.agent-chat-toggle-dot { width: 8px; height: 8px; border-radius: 50%; background: #99f6e4; box-shadow: 0 0 0 3px rgba(153, 246, 228, .16); }
.agent-chat-panel { position: relative; display: grid; grid-template-rows: auto auto auto minmax(180px, 1fr) auto; width: min(430px, calc(100vw - 28px)); height: min(690px, calc(100vh - 94px)); margin-bottom: 10px; overflow: hidden; border: 1px solid #d7e3e5; border-radius: 16px; background: rgba(255, 255, 255, .98); box-shadow: 0 22px 60px rgba(15, 63, 70, .22); }
.agent-chat-panel[hidden] { display: none; }
.agent-chat-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 16px; border-bottom: 1px solid #e5eeee; background: #fbfefe; }
.agent-chat-title { display: flex; align-items: center; gap: 9px; min-width: 0; }
.agent-chat-title strong { color: #16343a; font-size: 16px; letter-spacing: -.02em; }
.agent-chat-badge { display: grid; width: 30px; height: 30px; flex: none; place-items: center; border-radius: 50%; background: #e6f4f1; color: #0f766e; }
.agent-chat-badge svg { width: 15px; height: 15px; }
.agent-chat-header-actions { display: inline-flex; align-items: center; gap: 5px; }
.agent-chat-icon-button { display: grid; width: 28px; height: 28px; place-items: center; padding: 0; border: 0; border-radius: 7px; color: #6e8388; background: transparent; font-size: 19px; line-height: 1; }
.agent-chat-icon-button:hover { color: #0f766e; background: #e9f8f5; }
.agent-chat-toolbar { display: flex; align-items: center; gap: 7px; padding: 9px 12px; border-bottom: 1px solid #e5eeee; }
.agent-chat-toolbar button, .agent-chat-composer button, .agent-chat-backend { min-height: 32px; border: 1px solid #d4e2e4; border-radius: 8px; color: #48666c; background: #fff; font-size: 11px; font-weight: 800; }
.agent-chat-toolbar button { padding: 0 10px; }
.agent-chat-toolbar .agent-chat-new { margin-left: auto; min-height: 34px; padding: 0 14px; border: 1px solid #0f766e; border-radius: 10px; color: #fff; background: #0f766e; font-size: 12px; }
.agent-chat-toolbar .agent-chat-new:hover { border-color: #115e59; background: #115e59; }
.agent-chat-toolbar button:hover, .agent-chat-backend:hover { border-color: #8ed2c9; color: #0f766e; background: #f0fdfa; }
.agent-chat-connection { display: inline-flex; align-items: center; gap: 7px; min-width: 0; color: #8aa0a5; font-size: 12px; }
.agent-chat-connection-dot { width: 8px; height: 8px; flex: none; border-radius: 50%; background: #c3d2d4; }
.agent-chat-connection strong { color: #245660; }
.agent-chat-connection-detail { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.agent-chat-connection.is-online .agent-chat-connection-dot { background: #16a34a; }
.agent-chat-connection.is-error { color: #b42318; }
.agent-chat-connection.is-error .agent-chat-connection-dot { background: #dc2626; }
.agent-chat-sessions { display: flex; gap: 6px; min-height: 0; overflow-x: auto; padding: 8px 12px; border-bottom: 1px solid #edf3f3; scrollbar-width: thin; }
.agent-chat-session-wrap { position: relative; flex: 0 0 142px; min-width: 0; }
.agent-chat-session { display: grid; width: 100%; align-content: center; gap: 3px; min-height: 49px; padding: 7px 27px 7px 9px; border: 1px solid #e1ebec; border-radius: 8px; color: #38565e; background: #fff; text-align: left; }
.agent-chat-session:hover, .agent-chat-session.is-active { border-color: #8ed2c9; background: #f0fdfa; }
.agent-chat-session.is-stale { opacity: .58; }
.agent-chat-session strong, .agent-chat-session small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.agent-chat-session strong { color: #245660; font-size: 11px; }
.agent-chat-session small { color: #8aa0a5; font-size: 9px; }
.agent-chat-session-end { position: absolute; top: 5px; right: 5px; display: grid; width: 20px; height: 20px; place-items: center; padding: 0; border: 0; border-radius: 5px; color: #a3b3b6; background: transparent; font-size: 13px; line-height: 1; }
.agent-chat-session-end:hover { color: #b42318; background: #fff0ee; }
.agent-chat-messages { min-height: 0; overflow-y: auto; padding: 14px 13px; background: #f8fbfb; scrollbar-width: thin; }
.agent-chat-empty { display: grid; min-height: 100%; place-items: center; padding: 22px; text-align: center; }
.agent-chat-empty-body { display: grid; justify-items: center; gap: 4px; max-width: 300px; }
.agent-chat-empty-art { width: 100px; height: 80px; margin-bottom: 10px; }
.agent-chat-empty-title { margin: 0; color: #2c4148; font-size: 14px; font-weight: 800; }
.agent-chat-empty-desc { margin: 0; color: #8aa0a5; font-size: 12px; line-height: 1.7; }
.agent-chat-message { max-width: 94%; margin: 0 0 10px; padding: 9px 11px; border: 1px solid #e0eaeb; border-radius: 11px; background: #fff; color: #344e55; font-size: 12px; line-height: 1.65; white-space: pre-wrap; overflow-wrap: anywhere; }
.agent-chat-message.user { margin-left: auto; border-color: #b9e3dd; background: #e8f8f5; color: #245e5b; }
.agent-chat-message.assistant.is-error { border-color: #f0c2bd; background: #fff6f5; color: #a33a32; }
.agent-chat-message-label { display: block; margin-bottom: 3px; color: #8aa0a5; font-size: 9px; font-weight: 800; }
.agent-chat-message.assistant p { margin: 0 0 8px; }
.agent-chat-message.assistant p:last-child { margin-bottom: 0; }
.agent-chat-message.assistant h1, .agent-chat-message.assistant h2, .agent-chat-message.assistant h3 { margin: 0 0 8px; color: #245660; font-size: 14px; line-height: 1.35; }
.agent-chat-message.assistant h2 { font-size: 13px; }
.agent-chat-message.assistant h3 { font-size: 12px; }
.agent-chat-message.assistant ul, .agent-chat-message.assistant ol { margin: 4px 0 8px 18px; padding: 0; }
.agent-chat-message.assistant li { margin: 3px 0; }
.agent-chat-message.assistant blockquote { margin: 6px 0 8px; padding: 4px 9px; border-left: 3px solid #9bd7cf; color: #587078; background: #f3faf8; }
.agent-chat-message.assistant table { margin: 6px 0 8px; border-collapse: collapse; font-size: 11px; }
.agent-chat-message.assistant th, .agent-chat-message.assistant td { padding: 4px 8px; border: 1px solid #dce7e8; text-align: left; }
.agent-chat-message.assistant th { color: #245660; background: #f0f6f6; font-weight: 800; }
.agent-chat-message.assistant code { padding: 1px 4px; border-radius: 4px; color: #9a3412; background: #fff1e8; font: 11px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
.agent-chat-message.assistant pre { margin: 7px 0 8px; padding: 8px 9px; overflow: auto; border-radius: 7px; color: #e8f3f1; background: #173b42; }
.agent-chat-message.assistant pre code { padding: 0; color: inherit; background: transparent; }
.agent-chat-message.assistant a { color: #0f766e; text-decoration: underline; text-underline-offset: 2px; }
.agent-chat-reasoning { margin: 0 0 10px; border: 1px solid #e2e8f0; border-radius: 9px; background: #f8fafc; color: #64748b; font-size: 11px; }
.agent-chat-reasoning summary { cursor: pointer; padding: 7px 9px; font-weight: 800; }
.agent-chat-reasoning div { padding: 0 9px 8px; white-space: pre-wrap; overflow-wrap: anywhere; }
.agent-chat-tool { margin: 0 0 10px; padding: 8px 9px; border: 1px solid #dbe5e7; border-radius: 9px; background: #fff; color: #587078; font-size: 10px; line-height: 1.5; }
.agent-chat-tool strong { color: #33616a; font-size: 11px; }
.agent-chat-tool pre { max-height: 100px; margin: 5px 0 0; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
.agent-chat-permission { margin: 0 0 10px; padding: 10px; border: 1px solid #f1c27d; border-radius: 9px; background: #fffaf0; color: #76531f; font-size: 11px; line-height: 1.5; }
.agent-chat-permission strong { display: block; color: #8a5a12; }
.agent-chat-permission small { display: block; margin-top: 4px; white-space: pre-wrap; overflow-wrap: anywhere; }
.agent-chat-permission-actions { display: flex; gap: 6px; margin-top: 8px; }
.agent-chat-permission-actions button { min-height: 28px; padding: 0 8px; border: 1px solid #e3bd77; border-radius: 7px; color: #76531f; background: #fff; font-size: 10px; font-weight: 800; }
.agent-chat-permission-actions button:hover { border-color: #b7791f; background: #fff4d9; }
.agent-chat-composer { display: grid; gap: 7px; padding: 10px 12px 12px; border-top: 1px solid #e5eeee; background: #fff; }
.agent-chat-composer { min-width: 0; }
.agent-chat-composer textarea { box-sizing: border-box; width: 100%; height: 74px; min-height: 74px; max-height: 210px; overflow-y: hidden; resize: none; padding: 9px 10px; border: 1px solid #d4e2e4; border-radius: 9px; outline: 0; color: #26343a; background: #fbfefe; font-size: 12px; line-height: 1.55; }
.agent-chat-composer textarea:disabled { background: #f3f6f6; cursor: not-allowed; }
.agent-chat-composer-row { display: flex; align-items: center; gap: 7px; }
.agent-chat-hint { min-width: 0; overflow: hidden; color: #8aa0a5; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.agent-chat-send { margin-left: auto; min-width: 58px; padding: 0 12px; border-color: #0f766e !important; color: #fff !important; background: #0f766e !important; }
.agent-chat-send:hover { border-color: #115e59 !important; background: #115e59 !important; }
.agent-chat-send:disabled { cursor: wait; opacity: .55; }
.agent-chat-new-dialog { position: absolute; top: 50%; left: 50%; z-index: 1410; display: grid; gap: 13px; width: min(390px, calc(100% - 28px)); padding: 16px; transform: translate(-50%, -50%); border: 1px solid #cfe0e2; border-radius: 16px; background: rgba(255, 255, 255, .99); box-shadow: 0 22px 60px rgba(15, 63, 70, .26); }
.agent-chat-new-dialog[hidden] { display: none; }
.agent-chat-new-dialog-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.agent-chat-new-dialog-header strong { color: #0f4c55; font-size: 15px; }
.agent-chat-new-dialog-header small { display: block; margin-top: 4px; color: #82979c; font-size: 10px; }
.agent-chat-new-dialog-close { width: 28px; height: 28px; padding: 0; border: 0; border-radius: 7px; color: #6e8388; background: transparent; font-size: 19px; }
.agent-chat-new-dialog-close:hover { color: #0f766e; background: #e9f8f5; }
.agent-chat-new-dialog-label { display: grid; gap: 6px; color: #48666c; font-size: 10px; font-weight: 800; }
.agent-chat-new-dialog-label input { box-sizing: border-box; width: 100%; min-height: 38px; padding: 0 10px; border: 1px solid #d4e2e4; border-radius: 9px; outline: 0; color: #26343a; background: #fbfefe; font-size: 12px; }
.agent-chat-new-dialog-label input:focus { border-color: #8ed2c9; box-shadow: 0 0 0 3px rgba(20, 184, 166, .12); }
.agent-chat-backends { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.agent-chat-backends[hidden] { display: none; }
.agent-chat-backend { min-height: 58px; padding: 6px; border: 1px solid #d4e2e4; border-radius: 9px; color: #48666c; background: #fff; text-align: center; }
.agent-chat-backend:hover, .agent-chat-backend.is-selected { border-color: #0f9f91; color: #0f766e; background: #effcf9; }
.agent-chat-backend small { display: block; margin-top: 3px; color: #8aa0a5; font-size: 9px; font-weight: 600; }
.agent-chat-backend:disabled { cursor: not-allowed; opacity: .48; }
.agent-chat-new-dialog-actions { display: flex; justify-content: flex-end; gap: 7px; }
.agent-chat-new-dialog-actions button { min-height: 34px; padding: 0 13px; border: 1px solid #d4e2e4; border-radius: 8px; color: #48666c; background: #fff; font-size: 11px; font-weight: 800; }
.agent-chat-new-dialog-actions button:hover { border-color: #8ed2c9; color: #0f766e; background: #f0fdfa; }
.agent-chat-new-dialog-actions .is-primary { border-color: #0f766e; color: #fff; background: #0f766e; }
.agent-chat-new-dialog-actions .is-primary:hover { border-color: #115e59; color: #fff; background: #115e59; }
.agent-chat-new-dialog-actions button:disabled { cursor: not-allowed; opacity: .45; }
.agent-chat-widget.is-busy .agent-chat-toggle-dot { background: #fbbf24; animation: agent-chat-pulse 1.2s ease-in-out infinite; }
@keyframes agent-chat-pulse { 50% { opacity: .35; transform: scale(.72); } }
@media (max-width: 620px) { .agent-chat-widget { right: 14px; bottom: 14px; } .agent-chat-panel { height: min(680px, calc(100vh - 78px)); } }
`;

export function mountAgentChat({ entrySite }) {
  if (document.querySelector('.agent-chat-widget')) return;
  document.head.append(Object.assign(document.createElement('style'), { id: 'agent-chat-styles', textContent: styles }));
  const root = document.createElement('div');
  root.className = 'agent-chat-widget';
  root.innerHTML = `
    <section class="agent-chat-panel" id="agent-chat-panel" hidden role="dialog" aria-modal="false" aria-labelledby="agent-chat-title">
      <header class="agent-chat-header">
        <div class="agent-chat-title"><span class="agent-chat-badge" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg></span><strong id="agent-chat-title">本地 Agent 会话</strong></div>
        <div class="agent-chat-header-actions"><button class="agent-chat-icon-button" id="agent-chat-close" type="button" title="隐藏聊天窗" aria-label="隐藏聊天窗">×</button></div>
      </header>
      <div class="agent-chat-toolbar"><span class="agent-chat-connection" id="agent-chat-connection" hidden></span><button id="agent-chat-resume" type="button" hidden>恢复会话</button><button class="agent-chat-new" id="agent-chat-new" type="button">＋ 新建会话</button></div>
      <div class="agent-chat-sessions" id="agent-chat-sessions"></div>
      <div class="agent-chat-messages" id="agent-chat-messages" role="log" aria-live="polite"></div>
      <form class="agent-chat-composer" id="agent-chat-form">
        <textarea id="agent-chat-input" rows="3" disabled placeholder="先新建或选择一个 Agent 会话…"></textarea>
        <div class="agent-chat-composer-row"><span class="agent-chat-hint" id="agent-chat-hint">Enter 发送 · Shift+Enter 换行</span><button class="agent-chat-send" id="agent-chat-send" type="submit" disabled>发送</button><button id="agent-chat-interrupt" type="button" hidden>中断</button></div>
      </form>
      <section class="agent-chat-new-dialog" id="agent-chat-new-dialog" hidden role="dialog" aria-modal="false" aria-labelledby="agent-chat-new-title">
      <div class="agent-chat-new-dialog-header"><div><strong id="agent-chat-new-title">新建 Agent 会话</strong></div><button class="agent-chat-new-dialog-close" id="agent-chat-new-dialog-close" type="button" aria-label="关闭新建会话窗口">×</button></div>
      <div class="agent-chat-backends" id="agent-chat-backends"></div>
      <label class="agent-chat-new-dialog-label" for="agent-chat-session-title">会话名称<input id="agent-chat-session-title" type="text" maxlength="80" autocomplete="off" /></label>
      <div class="agent-chat-new-dialog-actions"><button id="agent-chat-new-cancel" type="button">取消</button><button class="is-primary" id="agent-chat-new-create" type="button" disabled>创建会话</button></div>
      </section>
    </section>
    <button class="agent-chat-toggle" id="agent-chat-toggle" type="button" aria-expanded="false" aria-controls="agent-chat-panel"><span class="agent-chat-toggle-dot" aria-hidden="true"></span>Agent</button>`;
  document.body.append(root);
  return new AgentChatController(root, entrySite);
}

class AgentChatController {
  constructor(root, entrySite) {
    this.root = root;
    this.entrySite = entrySite;
    this.panel = root.querySelector('#agent-chat-panel');
    this.sessionList = root.querySelector('#agent-chat-sessions');
    this.messages = root.querySelector('#agent-chat-messages');
    this.backends = root.querySelector('#agent-chat-backends');
    this.newDialog = root.querySelector('#agent-chat-new-dialog');
    this.sessionTitle = root.querySelector('#agent-chat-session-title');
    this.createButton = root.querySelector('#agent-chat-new-create');
    this.input = root.querySelector('#agent-chat-input');
    this.sendButton = root.querySelector('#agent-chat-send');
    this.interruptButton = root.querySelector('#agent-chat-interrupt');
    this.resumeButton = root.querySelector('#agent-chat-resume');
    this.connection = root.querySelector('#agent-chat-connection');
    this.sessions = [];
    this.backendsData = [];
    this.current = null;
    this.currentMessages = [];
    this.currentReasoning = '';
    this.currentTools = new Map();
    this.currentPermissions = new Map();
    this.selectedBackend = null;
    this.eventAbort = null;
    this.token = null;
    this.gatewayReady = false;
    this.refreshInFlight = false;
    this.pollTimer = null;
    this.storageKey = `${STORAGE_PREFIX}:sessions:${entrySite}`;
    this.bind();
    this.renderMessages();
    void this.bootstrap();
  }

  bind() {
    this.root.querySelector('#agent-chat-toggle').onclick = () => this.togglePanel();
    this.root.querySelector('#agent-chat-close').onclick = () => this.closePanel();
    this.root.querySelector('#agent-chat-new').onclick = () => this.toggleBackends(true);
    this.root.querySelector('#agent-chat-new-dialog-close').onclick = () => this.toggleBackends(false);
    this.root.querySelector('#agent-chat-new-cancel').onclick = () => this.toggleBackends(false);
    this.createButton.onclick = () => { void this.createSelectedSession(); };
    this.sessionTitle.onkeydown = (event) => {
      if (event.key === 'Enter') { event.preventDefault(); void this.createSelectedSession(); }
    };
    this.sessionTitle.oninput = () => { this.createButton.disabled = !this.selectedBackend || !this.sessionTitle.value.trim() || !this.gatewayReady; };
    this.resumeButton.onclick = () => { void this.resumeCurrent(); };
    this.root.querySelector('#agent-chat-form').onsubmit = (event) => { event.preventDefault(); void this.send(); };
    this.input.onkeydown = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void this.send(); }
    };
    this.input.oninput = () => this.resizeInput();
    this.interruptButton.onclick = () => { void this.interrupt(); };
    this.root.querySelector('#agent-chat-toggle').onmouseenter = () => {
      if (window.matchMedia?.('(hover: hover)').matches) window.setTimeout(() => this.openPanel(), 220);
    };
  }

  async bootstrap() {
    try {
      const response = await fetch(`${GATEWAY_URL}/v1/bootstrap`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gateway bootstrap 失败');
      this.token = data.token;
      this.gatewayReady = true;
      this.setConnection('', 'online');
      await this.refresh();
      if (!this.pollTimer) this.pollTimer = window.setInterval(() => { void this.refresh(); }, 30_000);
    } catch (error) {
      this.setConnection('');
      this.renderSessions();
      window.setTimeout(() => { void this.bootstrap(); }, 10_000);
    }
  }

  async refresh() {
    if (!this.gatewayReady || this.refreshInFlight) return;
    this.refreshInFlight = true;
    try {
      const [backendData, sessionData] = await Promise.all([this.request('/v1/backends'), this.request('/v1/sessions')]);
      const nextBackends = backendData.backends || [];
      const live = (sessionData.sessions || []).filter((session) => session.entrySite === this.entrySite && session.status !== 'ended');
      const remembered = this.readRememberedSessions().filter((session) => session.status !== 'ended');
      const liveIds = new Set(live.map((session) => session.id));
      const nextSessions = [...live, ...remembered.filter((session) => !liveIds.has(session.id)).map((session) => ({ ...session, status: 'unavailable' }))];
      const sessionsChanged = JSON.stringify(nextSessions) !== JSON.stringify(this.sessions);
      const backendsChanged = JSON.stringify(nextBackends) !== JSON.stringify(this.backendsData);
      this.backendsData = nextBackends;
      this.sessions = nextSessions;
      if (sessionsChanged || backendsChanged) {
        this.renderSessions();
        this.renderBackendChoices();
      }
      if (this.current && liveIds.has(this.current.id)) {
        const next = this.sessions.find((session) => session.id === this.current.id);
        if (next && (next.status !== this.current.status || next.lastActivityAt !== this.current.lastActivityAt)) {
          this.current = next;
          this.updateCurrentChrome();
        }
      } else if (this.current && !liveIds.has(this.current.id)) {
        this.disconnectEvents();
        this.current = null;
        this.currentMessages = [];
        this.renderMessages('Gateway 已重启；原 session 不再运行，请新建会话。');
      }
      this.setConnection(`${live.length} 个本地会话`, 'online');
    } catch (error) {
      this.setConnection('Gateway 请求失败', 'error');
    } finally {
      this.refreshInFlight = false;
    }
  }

  async request(path, options = {}) {
    const headers = { ...(options.headers || {}), 'X-Agent-Gateway-Token': this.token };
    const response = await fetch(`${GATEWAY_URL}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || data.error || `Gateway HTTP ${response.status}`);
    return data;
  }

  togglePanel() { this.panel.hidden ? this.openPanel() : this.closePanel(); }
  openPanel() { this.panel.hidden = false; this.root.querySelector('#agent-chat-toggle').setAttribute('aria-expanded', 'true'); }
  closePanel() { this.panel.hidden = true; this.root.querySelector('#agent-chat-toggle').setAttribute('aria-expanded', 'false'); }
  toggleBackends(open) {
    this.newDialog.hidden = !open;
    if (open) {
      this.selectedBackend = null;
      this.sessionTitle.value = '';
      this.renderBackendChoices();
      window.setTimeout(() => this.sessionTitle.focus(), 0);
    }
  }

  renderBackendChoices() {
    this.backends.innerHTML = '';
    for (const backend of this.backendsData) {
      const button = document.createElement('button');
      button.className = 'agent-chat-backend';
      button.type = 'button';
      button.disabled = !backend.installed || backend.adapter !== 'configured';
      if (this.selectedBackend === backend.id) button.classList.add('is-selected');
      button.innerHTML = `<span>${BACKEND_LABELS[backend.id] || backend.id}</span>`;
      button.onclick = () => { this.selectedBackend = backend.id; this.renderBackendChoices(); };
      this.backends.append(button);
    }
    this.createButton.disabled = !this.selectedBackend || !this.sessionTitle.value.trim() || !this.gatewayReady;
  }

  async createSelectedSession() {
    const backend = this.selectedBackend;
    const title = this.sessionTitle.value.trim();
    if (!backend || !title) return;
    await this.createSession(backend, title);
  }

  async createSession(backend, title) {
    if (!this.gatewayReady) return;
    this.toggleBackends(false);
    this.setConnection(`正在启动 ${BACKEND_LABELS[backend] || backend}…`);
    try {
      const session = await this.request('/v1/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ backend, entrySite: this.entrySite, recommendedRepo: this.defaultRepo(), title }) });
      this.sessions = [session, ...this.sessions.filter((item) => item.id !== session.id)];
      this.rememberSession(session);
      await this.selectSession(session);
      this.setConnection(`${this.sessions.filter((item) => item.status !== 'unavailable').length} 个本地会话`, 'online');
    } catch (error) {
      this.setConnection(error.message, 'error');
    }
  }

  async selectSession(session) {
    if (session.status === 'unavailable') {
      this.current = session;
      this.disconnectEvents();
      this.currentMessages = [];
      this.renderMessages('这个 session 属于已重启的 Gateway，当前不能恢复。请新建会话。');
      this.updateCurrentChrome();
      return;
    }
    if (session.status === 'suspended') {
      this.current = session;
      this.disconnectEvents();
      this.currentMessages = this.readTranscript(session.id);
      this.currentReasoning = '';
      this.currentTools = new Map();
      this.currentPermissions = new Map();
      this.renderSessions();
      this.renderMessages('Gateway 已重启；原生 session 已挂起。点击“恢复会话”后继续。');
      this.updateCurrentChrome();
      return;
    }
    this.current = session;
    this.currentMessages = this.readTranscript(session.id);
    this.currentReasoning = '';
    this.currentTools = new Map();
    this.currentPermissions = new Map();
    this.renderSessions();
    this.renderMessages();
    this.updateCurrentChrome();
    this.connectEvents(session);
  }

  connectEvents(session) {
    this.disconnectEvents();
    const controller = new AbortController();
    this.eventAbort = controller;
    void (async () => {
      try {
        const response = await fetch(`${GATEWAY_URL}/v1/sessions/${encodeURIComponent(session.id)}/events`, { headers: { 'X-Agent-Gateway-Token': this.token }, signal: controller.signal });
        if (!response.ok || !response.body) throw new Error('无法连接 session 事件流');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (!controller.signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split(/\r?\n\r?\n/);
          buffer = chunks.pop() || '';
          for (const chunk of chunks) {
            const line = chunk.split(/\r?\n/).find((item) => item.startsWith('data: '));
            if (!line) continue;
            try { this.handleEvent(JSON.parse(line.slice(6))); } catch { /* Ignore malformed event payloads. */ }
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) this.setConnection(error.message, 'error');
      }
    })();
  }

  disconnectEvents() { this.eventAbort?.abort(); this.eventAbort = null; }

  handleEvent(event) {
    if (!this.current) return;
    if (event.type === 'status') {
      this.current.status = event.status;
      this.rememberSession(this.current);
      this.updateCurrentChrome();
      return;
    }
    if (event.type === 'message-delta') {
      let message = this.currentMessages.at(-1);
      if (!message || message.role !== 'assistant' || message.complete) {
        message = { role: 'assistant', text: '', complete: false };
        this.currentMessages.push(message);
      }
      message.text += event.text || '';
      this.persistCurrent();
      this.renderMessages();
      return;
    }
    if (event.type === 'reasoning-delta') {
      this.currentReasoning += event.text || '';
      this.renderMessages();
      return;
    }
    if (event.type === 'tool-start') {
      this.currentTools.set(event.callId, { name: event.tool, detail: event.input, status: 'running' });
      this.renderMessages();
      return;
    }
    if (event.type === 'tool-update') {
      const tool = this.currentTools.get(event.callId) || { name: 'background-task' };
      tool.detail = event.detail || tool.detail;
      this.currentTools.set(event.callId, tool);
      this.renderMessages();
      return;
    }
    if (event.type === 'tool-result') {
      const tool = this.currentTools.get(event.callId) || { name: 'tool' };
      tool.detail = event.output || tool.detail;
      tool.status = event.isError ? '失败' : '完成';
      this.currentTools.set(event.callId, tool);
      this.renderMessages();
      return;
    }
    if (event.type === 'permission-request') {
      this.currentPermissions.set(event.requestId, { ...event, pending: true });
      this.current.status = 'waiting-approval';
      this.rememberSession(this.current);
      this.renderMessages();
      this.updateCurrentChrome();
      return;
    }
    if (event.type === 'permission-resolution') {
      this.currentPermissions.delete(event.requestId);
      this.renderMessages();
      return;
    }
    if (event.type === 'error') {
      this.currentMessages.push({ role: 'assistant', text: event.message || 'Agent 返回错误。', error: true, complete: true });
      this.persistCurrent();
      this.renderMessages();
      return;
    }
    if (event.type === 'done') {
      const message = this.currentMessages.at(-1);
      if (message?.role === 'assistant') message.complete = true;
      this.currentReasoning = '';
      this.currentTools.clear();
      this.persistCurrent();
      this.renderMessages();
    }
  }

  async send() {
    const content = this.input.value.trim();
    if (!content || !this.current || ['unavailable', 'suspended', 'ended'].includes(this.current.status)) return;
    this.input.value = '';
    this.resizeInput();
    this.currentMessages.push({ role: 'user', text: content, complete: true });
    this.persistCurrent();
    this.renderMessages();
    this.current.status = 'running';
    this.updateCurrentChrome();
    try {
      await this.request(`/v1/sessions/${encodeURIComponent(this.current.id)}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, context: this.collectContext() }) });
    } catch (error) {
      this.currentMessages.push({ role: 'assistant', text: error.message, error: true, complete: true });
      this.persistCurrent();
      this.renderMessages();
      this.current.status = 'idle';
      this.updateCurrentChrome();
    }
  }

  async interrupt() {
    if (!this.current) return;
    try { await this.request(`/v1/sessions/${encodeURIComponent(this.current.id)}/interrupt`, { method: 'POST' }); }
    catch (error) { this.setConnection(error.message, 'error'); }
  }

  async resumeCurrent() {
    if (!this.current || this.current.status !== 'suspended') return;
    this.resumeButton.disabled = true;
    this.setConnection('正在恢复原生 session…');
    try {
      const session = await this.request(`/v1/sessions/${encodeURIComponent(this.current.id)}/resume`, { method: 'POST' });
      this.current = session;
      this.sessions = this.sessions.map((item) => item.id === session.id ? session : item);
      this.rememberSession(session);
      this.renderMessages();
      this.updateCurrentChrome();
      this.connectEvents(session);
    } catch (error) {
      this.setConnection(error.message, 'error');
      this.updateCurrentChrome();
    } finally {
      this.resumeButton.disabled = false;
    }
  }

  async approvePermission(requestId, decision) {
    const permission = this.currentPermissions.get(requestId);
    if (!permission || permission.pending === false || !this.current) return;
    permission.pending = false;
    this.currentPermissions.set(requestId, permission);
    this.renderMessages();
    try {
      await this.request(`/v1/sessions/${encodeURIComponent(this.current.id)}/approvals/${encodeURIComponent(requestId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, remember: decision === 'always' }),
      });
    } catch (error) {
      permission.pending = true;
      this.currentPermissions.set(requestId, permission);
      this.setConnection(error.message, 'error');
      this.renderMessages();
    }
  }

  async endCurrent(session = this.current) {
    if (!session || session.status === 'unavailable' || session.status === 'ended') return;
    if (!window.confirm(`结束“${session.title || BACKEND_LABELS[session.backend] || session.backend}”会话？结束后不会继续保留本地进程。`)) return;
    try {
      const data = await this.request(`/v1/sessions/${encodeURIComponent(session.id)}`, { method: 'DELETE' });
      const ended = data.session || data;
      this.sessions = this.sessions.filter((item) => item.id !== ended.id);
      this.forgetSession(ended);
      if (this.current?.id === ended.id) {
        this.disconnectEvents();
        this.current = null;
        this.currentMessages = [];
        this.currentReasoning = '';
        this.currentTools.clear();
        this.currentPermissions.clear();
        const next = this.sessions.find((item) => !['unavailable', 'ended'].includes(item.status));
        if (next) await this.selectSession(next);
        else this.renderMessages('当前会话已结束；可以继续使用剩余会话，或新建一个会话。');
      }
      this.updateCurrentChrome();
      this.renderSessions();
    } catch (error) { this.setConnection(error.message, 'error'); }
  }

  collectContext() {
    const value = (id) => document.getElementById(id)?.value || '';
    const body = document.getElementById('body');
    const selection = body && body.selectionStart !== body.selectionEnd ? body.value.slice(body.selectionStart, body.selectionEnd) : '';
    const editorStatus = document.getElementById('status')?.textContent || '';
    const hasUnsavedDraft = /自动保存中|等待自动保存|恢复未保存|新建模式/.test(editorStatus);
    return {
      entrySite: this.entrySite,
      workspaceRoot: '/Users/mokaiche/Documents/htmls/',
      recommendedRepo: this.defaultRepo(),
      articlePath: value('entry-path') || value('folder-path'),
      articleTitle: value('title'),
      board: value('board'),
      category: value('category'),
      subcategory: value('subcategory'),
      slug: value('slug'),
      currentMarkdown: body?.value || '',
      unsavedDraft: hasUnsavedDraft ? body?.value || '' : '',
      selectedText: selection,
    };
  }

  defaultRepo() { return `/Users/mokaiche/Documents/htmls/${this.entrySite}`; }

  renderSessions() {
    this.sessionList.innerHTML = '';
    if (!this.sessions.length) {
      this.sessionList.innerHTML = '<span class="agent-chat-hint">还没有本地会话</span>';
      return;
    }
    for (const session of this.sessions.slice(0, 12)) {
      const wrap = document.createElement('div');
      wrap.className = 'agent-chat-session-wrap';
      const button = document.createElement('button');
      button.className = `agent-chat-session${this.current?.id === session.id ? ' is-active' : ''}${session.status === 'unavailable' ? ' is-stale' : ''}`;
      button.type = 'button';
      button.innerHTML = `<strong>${escapeHtml(session.title || BACKEND_LABELS[session.backend] || session.backend)}</strong><small>${escapeHtml(session.status === 'unavailable' ? 'Gateway 已重启' : `${BACKEND_LABELS[session.backend] || session.backend} · ${session.status || 'idle'}`)} · ${formatTime(session.lastActivityAt || session.createdAt)}</small>`;
      button.onclick = () => { void this.selectSession(session); };
      wrap.append(button);
      if (!['unavailable', 'ended'].includes(session.status)) {
        const endButton = document.createElement('button');
        endButton.className = 'agent-chat-session-end';
        endButton.type = 'button';
        endButton.title = '结束此 Agent 会话';
        endButton.setAttribute('aria-label', `结束 ${session.title || BACKEND_LABELS[session.backend] || session.backend} 会话`);
        endButton.textContent = '⌫';
        endButton.onclick = (event) => { event.stopPropagation(); void this.endCurrent(session); };
        wrap.append(endButton);
      }
      this.sessionList.append(wrap);
    }
  }

  renderMessages(emptyMessage = '') {
    this.messages.innerHTML = '';
    if (!this.current) {
      this.messages.innerHTML = emptyStateHtml('开始你的对话', '新建或选择一个本地 Agent 会话即可开始。');
      this.syncComposer();
      return;
    }
    if (emptyMessage) {
      this.messages.innerHTML = emptyStateHtml('', emptyMessage);
      this.syncComposer();
      return;
    }
    if (!this.currentMessages.length && !this.currentReasoning && !this.currentTools.size) {
      this.messages.innerHTML = emptyStateHtml('开始你的对话', '直接发送任务即可；当前页面文章和未保存草稿会随首条消息传入。');
    }
    for (const message of this.currentMessages) {
      const node = document.createElement('div');
      node.className = `agent-chat-message ${message.role}${message.error ? ' is-error' : ''}`;
      node.innerHTML = `<span class="agent-chat-message-label">${message.role === 'user' ? '你' : 'Agent'}</span>${message.role === 'assistant' ? renderMarkdown(message.text) : escapeHtml(message.text)}`;
      this.messages.append(node);
    }
    if (this.currentReasoning) {
      const node = document.createElement('details');
      node.className = 'agent-chat-reasoning';
      node.open = true;
      node.innerHTML = `<summary>思考过程</summary><div>${escapeHtml(this.currentReasoning)}</div>`;
      this.messages.append(node);
    }
    for (const permission of this.currentPermissions.values()) {
      const node = document.createElement('div');
      node.className = 'agent-chat-permission';
      node.innerHTML = `<strong>Agent 请求权限：${escapeHtml(permission.action || '操作')}</strong><small>${escapeHtml(permission.detail || '')}</small><div class="agent-chat-permission-actions"><button type="button" data-decision="once" ${permission.pending === false ? 'disabled' : ''}>批准一次</button><button type="button" data-decision="always" ${permission.pending === false ? 'disabled' : ''}>始终允许</button><button type="button" data-decision="reject" ${permission.pending === false ? 'disabled' : ''}>拒绝</button></div>`;
      node.querySelectorAll('button').forEach((button) => { button.onclick = () => { void this.approvePermission(permission.requestId, button.dataset.decision); }; });
      this.messages.append(node);
    }
    for (const [callId, tool] of this.currentTools) {
      const node = document.createElement('div');
      node.className = 'agent-chat-tool';
      node.innerHTML = `<strong>${escapeHtml(tool.name || 'tool')} · ${escapeHtml(tool.status || '运行中')}</strong><pre>${escapeHtml(formatDetail(tool.detail))}</pre>`;
      node.dataset.callId = callId;
      this.messages.append(node);
    }
    this.messages.scrollTop = this.messages.scrollHeight;
    this.syncComposer();
  }

  syncComposer() {
    const canSend = Boolean(this.current && !['unavailable', 'suspended', 'ended'].includes(this.current.status) && this.gatewayReady);
    const busy = this.current?.status === 'running' || this.current?.status === 'waiting-approval';
    this.input.disabled = !canSend || busy;
    this.sendButton.disabled = !canSend || busy;
    this.interruptButton.hidden = !busy;
    this.resumeButton.hidden = !this.current || this.current.status !== 'suspended';
    this.root.classList.toggle('is-busy', busy);
    this.input.placeholder = canSend ? '输入消息，按 Enter 发送…' : '先新建或选择一个可用会话…';
    this.resizeInput();
  }

  resizeInput() {
    this.input.style.height = '74px';
    const maxHeight = 210;
    if (this.input.scrollHeight > 74) {
      const height = Math.min(this.input.scrollHeight, maxHeight);
      this.input.style.height = `${height}px`;
      this.input.style.overflowY = this.input.scrollHeight > maxHeight ? 'auto' : 'hidden';
    } else {
      this.input.style.overflowY = 'hidden';
    }
  }

  updateCurrentChrome() {
    this.renderSessions();
    this.syncComposer();
  }

  setConnection(text, state = '') {
    this.connection.className = `agent-chat-connection${state === 'online' ? ' is-online' : ''}${state === 'error' ? ' is-error' : ''}`;
    this.connection.hidden = !text && state !== 'online';
    this.connection.innerHTML = `<span class="agent-chat-connection-dot" aria-hidden="true"></span>${state === 'online' ? '<strong>Gateway</strong>' : ''}${text ? `<span class="agent-chat-connection-detail">${state === 'online' ? '· ' : ''}${escapeHtml(text)}</span>` : ''}`;
  }

  readRememberedSessions() {
    try { return JSON.parse(localStorage.getItem(this.storageKey) || '[]'); } catch { return []; }
  }

  rememberSession(session) {
    if (!session?.id) return;
    if (session.status === 'ended') { this.forgetSession(session); return; }
    const list = [session, ...this.readRememberedSessions().filter((item) => item.id !== session.id)].slice(0, 24);
    try { localStorage.setItem(this.storageKey, JSON.stringify(list.map(({ subscribers, adapter, ...item }) => item))); } catch { /* Local storage is optional. */ }
  }

  forgetSession(session) {
    if (!session?.id) return;
    const list = this.readRememberedSessions().filter((item) => item.id !== session.id && item.status !== 'ended');
    try { localStorage.setItem(this.storageKey, JSON.stringify(list)); } catch { /* Local storage is optional. */ }
  }

  transcriptKey(id) { return `${STORAGE_PREFIX}:transcript:${this.entrySite}:${id}`; }
  readTranscript(id) { try { return JSON.parse(localStorage.getItem(this.transcriptKey(id)) || '[]'); } catch { return []; } }
  persistCurrent() { if (!this.current) return; try { localStorage.setItem(this.transcriptKey(this.current.id), JSON.stringify(this.currentMessages.slice(-80))); } catch { /* Transcript persistence is optional. */ } }
}

const EMPTY_STATE_ART = `<svg class="agent-chat-empty-art" viewBox="0 0 120 96" fill="none" aria-hidden="true"><g stroke="#94c6b9" stroke-width="3" stroke-linecap="round"><path d="M86 12 93 4"/><path d="M90 20 101 16"/><path d="M80 10 83 3"/></g><g fill="#e3eaed"><rect x="10" y="12" width="62" height="48" rx="15"/><path d="M24 58 26 74 42 58Z"/></g><g fill="#b9c7cc"><circle cx="30" cy="36" r="3.6"/><circle cx="41" cy="36" r="3.6"/><circle cx="52" cy="36" r="3.6"/></g><g fill="#d7e8e0"><rect x="60" y="48" width="44" height="32" rx="12"/><path d="M70 77 68 89 82 78Z"/></g></svg>`;

function emptyStateHtml(title, description) {
  return `<div class="agent-chat-empty"><div class="agent-chat-empty-body">${EMPTY_STATE_ART}${title ? `<p class="agent-chat-empty-title">${escapeHtml(title)}</p>` : ''}${description ? `<p class="agent-chat-empty-desc">${escapeHtml(description)}</p>` : ''}</div></div>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function renderMarkdown(value) {
  const lines = String(value ?? '').replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  let fenced = false;
  let code = [];
  let language = '';
  let listType = null;
  let table = null;

  const closeList = () => {
    if (listType) output.push(`</${listType}>`);
    listType = null;
  };
  const closeFence = () => {
    output.push(`<pre><code${language ? ` data-language="${escapeHtml(language)}"` : ''}>${escapeHtml(code.join('\n'))}</code></pre>`);
    fenced = false;
    code = [];
    language = '';
  };
  const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('\\|').join('\u0001').split('|').map((cell) => cell.trim().split('\u0001').join('|'));
  const isDelimRow = (line) => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(line);
  const rowAligns = (line) => splitRow(line).map((cell) => cell.endsWith(':') ? (cell.startsWith(':') ? 'center' : 'right') : cell.startsWith(':') ? 'left' : '');
  const flushTable = () => {
    if (!table) return;
    const [head, aligns, bodyRows] = [table[0], table[1], table.slice(2)];
    const cell = (value, tag, index) => `<${tag}${aligns[index] ? ` style="text-align: ${aligns[index]}"` : ''}>${inlineMarkdown(value)}</${tag}>`;
    output.push(`<table><thead><tr>${head.map((value, index) => cell(value, 'th', index)).join('')}</tr></thead><tbody>${bodyRows.map((row) => `<tr>${row.map((value, index) => cell(value, 'td', index)).join('')}</tr>`).join('')}</tbody></table>`);
    table = null;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = line.match(/^\s*```\s*([^\s]*)\s*$/);
    if (fence) {
      closeList();
      flushTable();
      if (fenced) closeFence();
      else { fenced = true; language = fence[1] || ''; }
      continue;
    }
    if (fenced) { code.push(line); continue; }
    if (!line.trim()) { closeList(); flushTable(); continue; }

    const row = /^\s*\|.*\|/.test(line) ? splitRow(line) : null;
    if (table && !row) flushTable();
    if (!table && row && index + 1 < lines.length && isDelimRow(lines[index + 1])) {
      table = [row, rowAligns(lines[index + 1])];
      index += 1;
      continue;
    }
    if (table) { table.push(row); continue; }

    const heading = line.match(/^\s*(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (heading) { closeList(); output.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`); continue; }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const nextType = unordered ? 'ul' : 'ol';
      if (listType !== nextType) { closeList(); listType = nextType; output.push(`<${listType}>`); }
      output.push(`<li>${inlineMarkdown((unordered || ordered)[1])}</li>`);
      continue;
    }
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) { closeList(); output.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`); continue; }
    if (/^\s*((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line)) { closeList(); output.push('<hr>'); continue; }
    closeList();
    output.push(`<p>${inlineMarkdown(line)}</p>`);
  }
  if (fenced) closeFence();
  closeList();
  flushTable();
  return output.join('');
}

function inlineMarkdown(value) {
  const tokens = [];
  let text = escapeHtml(value).replace(/`([^`]+)`/g, (_, code) => {
    tokens.push(`<code>${code}</code>`);
    return `\u0000${tokens.length - 1}\u0000`;
  });
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/__([^_]+)__/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/_([^_]+)_/g, '<em>$1</em>');
  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)] || '');
}

function formatDetail(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}

function formatTime(value) {
  if (!value) return '刚刚';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? '刚刚' : date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

const bootstrapScript = document.querySelector('script[data-agent-entry-site]');
if (bootstrapScript?.dataset.agentEntrySite) mountAgentChat({ entrySite: bootstrapScript.dataset.agentEntrySite });
