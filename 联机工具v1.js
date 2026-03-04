import { createPinia, defineStore } from 'https://cdn.jsdelivr.net/npm/pinia/+esm'; // 引入 Pinia

// JS-Slash-Runner 的 srcdoc iframe 内没有全局 Vue/jQuery，必须从父窗口获取
const parentWindow = (() => {
    try { return window.top || window.parent || window; } catch (e) { return window; }
})();
const o = parentWindow.Vue || window.Vue;
if (!o) {
    console.error('[联机Mod] 无法获取 Vue 实例，脚本终止');
    throw new Error('Vue not found');
}
const $ = parentWindow.jQuery || window.jQuery;
const { ref, reactive, computed, watch, shallowRef, triggerRef, onMounted, onUnmounted, nextTick, defineComponent, createApp } = o;

const _trackedEventOffs = [];
let _eventOffMissingWarned = false;

const onEventTracked = (eventName, handler) => {
    const eventOnFn =
        (typeof eventOn === 'function' && eventOn) ||
        (typeof parentWindow.eventOn === 'function' && parentWindow.eventOn) ||
        null;

    const eventOffFn =
        (typeof eventOff === 'function' && eventOff) ||
        (typeof parentWindow.eventOff === 'function' && parentWindow.eventOff) ||
        null;

    if (!eventOnFn) {
        console.error('[联机Mod] eventOn 不可用，事件未注册:', eventName);
        return;
    }

    let off = null;

    try {
        const ret = eventOnFn(eventName, handler);
        if (typeof ret === 'function') {
            off = ret;
        }
    } catch (e) {
        console.error('[联机Mod] 事件注册失败:', eventName, e);
        return;
    }

    if (!off && eventOffFn) {
        off = () => {
            try { eventOffFn(eventName, handler); } catch (e) {}
        };
    }

    if (off) {
        _trackedEventOffs.push(off);
    } else if (!_eventOffMissingWarned) {
        _eventOffMissingWarned = true;
        console.info('[联机Mod] 当前环境未提供可追踪 eventOff；事件可用，但热重载时将依赖页面卸载清理。');
    }
};

const offAllTrackedEvents = () => {
    while (_trackedEventOffs.length > 0) {
        const off = _trackedEventOffs.pop();
        try { off?.(); } catch (e) {}
    }
};

// ==========================================
// 1. CSS样式注入
// ==========================================
const STYLE_ID = 'multiplayer-mod-styles';
const STYLE_VERSION = '2026-02-27-03';

const injectStyles = () => {
    const targetDoc = parentWindow.document;
    const prevStyle = targetDoc.getElementById(STYLE_ID);
    if (prevStyle) prevStyle.remove();

    const style = targetDoc.createElement('style');
    style.id = STYLE_ID;
    style.setAttribute('data-style-version', STYLE_VERSION);
    style.innerHTML = `
:root{
  /* ===== Discord-like Base Tokens ===== */
  --mp-full:100%;
  --mp-z:99999; /* 置顶显示，确保位于 SillyTavern 设置页上方 */

  /* 尺寸 */
  --mp-w:340px;
  --mp-minw:160px;
  --mp-hh:44px;
  --mp-hc:34px;
  --mp-log-min:110px;
  --mp-log-max:180px;
  --mp-room-max:190px;
  --mp-pending-max:130px;
  --mp-user-h:32px;
  --mp-icon-btn:32px;
  --mp-mini:16px;

  /* 圆角 */
  --mp-r1:8px;
  --mp-r2:10px;
  --mp-rp:999px;
  --mp-rf:50%;

  /* 间距 */
  --mp-s1:4px;
  --mp-s2:8px;
  --mp-s3:12px;
  --mp-s4:14px;
  --mp-s5:16px;
  --mp-s6:20px;
  --mp-s7:96px;

  /* 字体 */
  --mp-ff:"gg sans","Noto Sans","Helvetica Neue",Helvetica,Arial,"PingFang SC","Microsoft YaHei","Heiti SC",sans-serif;
  --mp-f1:12px; /* 注释 */
  --mp-f2:13px; /* 正文 */
  --mp-f3:15px; /* 标题/重点正文 */
  --mp-f4:16px; /* 主标题 */
  --mp-w1:400;
  --mp-w2:500;
  --mp-w3:700;
  --mp-ic:14px;

  /* 颜色 */
  --mp-bg:#323339;
  --mp-surface:#393A41;
  --mp-border:#323339;
  --mp-title:#F9FAFF;
  --mp-text:#B8B8B8;
  --mp-accent:#79C0FF;
  --mp-danger:#D43030;

  --mp-ok:#59C98A;
  --mp-warn:#E8BE61;
  --mp-host:#E8BE61;
  --mp-spec:#79C0FF;

  /* 透明色 */
  --mp-bg-soft:rgba(57,58,65,.72);
  --mp-bd-soft:rgba(50,51,57,.80);
  --mp-bd-strong:rgba(50,51,57,1);
  --mp-hover:rgba(98,110,240,.20);
  --mp-hover-soft:rgba(98,110,240,.12);
  --mp-hover-danger:rgba(212,48,48,.18);
  --mp-shadow:rgba(49,51,57,.62);

  --mp-white-10:rgba(50,51,57,.92);
  --mp-white-14:rgba(50,51,57,.95);
  --mp-white-18:rgba(50,51,57,.98);
  --mp-white-22:rgba(50,51,57,1);

  --mp-scroll:#7C7C82;

  /* 交互色 */
  --mp-header-bg:rgba(57,58,65,.86);
  --mp-focus-ring:rgba(98,110,240,.20);
  --mp-input-focus-bg:#3D3E47;

  --mp-primary:#4E5ADF;
  --mp-primary-border:#626EF0;
  --mp-primary-hover:#5A66EA;
  --mp-primary-border-hover:#6D78F4;

  --mp-surface-hover:#444654;
  --mp-icon-hover:rgba(249,250,255,.08);
  --mp-danger-hover:rgba(212,48,48,.14);

  --mp-selected-bg:rgba(98,110,240,.14);
  --mp-user-host-bg:rgba(232,190,97,.14);
  --mp-user-host-border:rgba(232,190,97,.6);
  --mp-user-submitted-bg:rgba(89,201,138,.14);
  --mp-user-submitted-border:rgba(89,201,138,.56);
  --mp-user-spectator-bg:rgba(121,192,255,.14);
  --mp-user-spectator-border:rgba(121,192,255,.55);

  --mp-shadow-connected:rgba(89,201,138,.62);
  --mp-error-text:#F38F8F;
  --mp-muted:#A9ADBB;
  --mp-transfer-hover:#FFE3A6;
  --mp-transfer-hover-bg:rgba(232,190,97,.20);

  --mp-fast:.16s;
  --mp-mid:.24s;
  --mp-ease:ease;
}

/* ===== Panel ===== */
.multiplayer-panel{
  position:fixed;
  z-index:var(--mp-z);
  width:var(--mp-w);
  min-height:var(--mp-hh);
  display:flex;
  flex-direction:column;
  overflow:hidden;

  font-family:var(--mp-ff)!important;
  font-size:var(--mp-f2);
  font-weight:var(--mp-w2);
  color:var(--mp-text)!important;

  background:var(--mp-bg);
  border:1px solid var(--mp-bd-strong);
  border-radius:var(--mp-r2);
  box-shadow:0 12px 30px var(--mp-shadow);
  transition:border-color var(--mp-mid) var(--mp-ease), opacity var(--mp-fast) var(--mp-ease);
}
.multiplayer-panel.minimized{
  width:fit-content;
  min-width:var(--mp-minw);
  max-height:var(--mp-hh);
}
.multiplayer-panel.settings-open:not(.minimized){
  height:min(540px,calc(100vh - 18px));
  max-height:min(540px,calc(100vh - 18px));
}
.multiplayer-panel.dragging{opacity:.94;cursor:grabbing;}

/* ===== Header ===== */
.panel-header{
  height:var(--mp-hh);
  padding:0 8px 0 var(--mp-s5);
  display:flex;
  align-items:center;
  justify-content:space-between;
  background:var(--mp-header-bg);
  border-bottom:1px solid var(--mp-white-10);
  cursor:grab;
  touch-action:none;
  user-select:none;
}
.header-left,.header-actions{display:flex;align-items:center;}
.header-left{flex:1;min-width:0;gap:var(--mp-s2);}
.header-actions{
  margin-left:10px;
  gap:2px;
}
.title{
  flex:1;min-width:0;
  height:var(--mp-hh);
  display:flex;align-items:center;
  font-size:var(--mp-f4);
  font-weight:var(--mp-w3);
  color:var(--mp-title);
  letter-spacing:.1px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}

/* ===== Content Containers ===== */
.panel-content{
  flex:1;
  display:flex;
  flex-direction:column;
  gap:var(--mp-s3);
  padding:var(--mp-s4);
  overflow:auto;
}
.settings-section,.online-rooms-section,.create-room-section,.username-section{
  display:flex;flex-direction:column;
}
.settings-section,.online-rooms-section{gap:var(--mp-s4);}
.create-room-section{
  margin-top:var(--mp-s2);
  padding-top:var(--mp-s3);
  border-top:1px solid var(--mp-white-10);
  gap:var(--mp-s2);
}
.username-section{
  gap:var(--mp-s2);
  padding-bottom:var(--mp-s3);
  border-bottom:1px solid var(--mp-white-10);
}
.setting-row{
  display:flex;
  align-items:center;
  gap:var(--mp-s2);
  min-height:var(--mp-hc);
}
.setting-row label{
  min-width:60px;
  height:var(--mp-hc);
  display:inline-flex;
  align-items:center;
}
.section-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.join-room-section{
  display:grid;
  grid-template-columns:minmax(0,1fr) 74px 74px;
  align-items:center;
  gap:var(--mp-s2);
  margin-top:var(--mp-s1);
}
.create-room-options,.button-group,.chat-input-area{display:flex;gap:var(--mp-s2);}
.button-group{margin-top:var(--mp-s1);}
.input-submit-area{
  display:flex;flex-direction:column;gap:var(--mp-s2);
  padding:var(--mp-s3);
  border:1px solid var(--mp-white-14);
  border-radius:var(--mp-r1);
  background:var(--mp-bg-soft);
}
.sync-buttons-row{
  display:grid;
  grid-template-columns:repeat(3, minmax(0, 1fr));
  gap:var(--mp-s2);
  margin-bottom:var(--mp-s1);
}

/* ===== Inputs ===== */
.multiplayer-panel .input-field,
.multiplayer-panel .settings-input,
.multiplayer-panel .chat-input,
.multiplayer-panel .input-textarea{
  box-sizing:border-box;
  border:1px solid var(--mp-white-18)!important;
  border-radius:var(--mp-r1)!important;
  background:var(--mp-surface)!important;
  color:var(--mp-text)!important;
  -webkit-text-fill-color:var(--mp-text)!important;
  outline:none;
  font-family:var(--mp-ff);
  font-size:var(--mp-f2);
  font-weight:var(--mp-w2);
  line-height:1.45;
  padding:7px 12px;
  transition:border-color var(--mp-fast) var(--mp-ease), background var(--mp-fast) var(--mp-ease), box-shadow var(--mp-fast) var(--mp-ease);
}
.multiplayer-panel .input-field,
.multiplayer-panel .settings-input,
.multiplayer-panel .chat-input{height:var(--mp-hc);}
.multiplayer-panel .input-field{flex:1;}
.multiplayer-panel .input-field:focus,
.multiplayer-panel .settings-input:focus,
.multiplayer-panel .chat-input:focus,
.multiplayer-panel .input-textarea:focus{
  border-color:var(--mp-border)!important;
  box-shadow:0 0 0 2px var(--mp-focus-ring);
  background:var(--mp-input-focus-bg)!important;
}
.input-field.medium{min-width:128px;max-width:176px;}
.input-field.small{max-width:86px;}
.input-field.tiny{max-width:72px;}
.input-textarea{
  width:var(--mp-full);
  min-height:84px;
  resize:vertical;
}
.settings-input{
  width:var(--mp-full);
  appearance:none;
  -webkit-appearance:none;
}
input[type="number"].settings-input{background:var(--mp-surface)!important;}
.join-room-section .input-field{min-width:0;max-width:var(--mp-full);}
.chat-input{flex:1;}

/* ===== Buttons ===== */
.icon-btn,.refresh-btn,.action-btn,.send-btn,.sync-history-btn,.transfer-leading-btn{
  transition:all var(--mp-fast) var(--mp-ease);
  font-family:var(--mp-ff);
}
.icon-btn{
  width:28px;
  height:28px;
  border:none;
  border-radius:var(--mp-r1);
  background:transparent!important;
  color:var(--mp-text)!important;
  cursor:pointer;
}
.refresh-btn{
  width:var(--mp-icon-btn);
  height:var(--mp-icon-btn);
  border:1px solid var(--mp-white-14);
  border-radius:var(--mp-r1);
  background:var(--mp-surface)!important;
  color:var(--mp-text)!important;
  cursor:pointer;
}
.icon-btn:hover{
  background:var(--mp-icon-hover)!important;
  color:var(--mp-title)!important;
}
.refresh-btn:hover:not(:disabled){
  border-color:var(--mp-bd-strong);
  background:var(--mp-surface-hover)!important;
  color:var(--mp-title)!important;
}
.icon-btn.danger-icon:hover{
  background:var(--mp-danger-hover)!important;
  color:var(--mp-danger)!important;
}

.action-btn,.send-btn{
  border-radius:var(--mp-r1);
  border:1px solid transparent;
  cursor:pointer;
  min-height:var(--mp-hc);
}
.action-btn{
  flex:1;
  min-width:72px;
  padding:0 12px;
  font-size:var(--mp-f2);
  font-weight:var(--mp-w2);
  color:var(--mp-title);
}
.action-btn.primary,.send-btn{
  background:var(--mp-primary);
  border-color:var(--mp-primary-border);
  color:#F9FAFF;
}
.action-btn.primary:hover:not(:disabled),.send-btn:hover:not(:disabled){
  background:var(--mp-primary-hover);
  border-color:var(--mp-primary-border-hover);
}
.action-btn.secondary{
  background:var(--mp-surface);
  border-color:var(--mp-white-22);
  color:var(--mp-text);
}
.action-btn.secondary:hover:not(:disabled){
  color:var(--mp-title);
  border-color:var(--mp-primary-border);
  background:var(--mp-surface-hover);
}

.create-room-section .action-btn{
  min-height:38px;
  font-size:var(--mp-f2);
  padding:0 12px;
}
.join-room-section .action-btn{
  min-width:74px;
  padding:0 var(--mp-s2);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:var(--mp-s2);
  white-space:nowrap;
}
.join-room-section .join-btn-icon.fa-solid{font-size:var(--mp-ic);line-height:1;}
.join-room-section .join-btn-label{line-height:1;overflow:hidden;text-overflow:ellipsis;}

.send-btn{
  min-width:46px;
  padding:0 12px;
  font-size:var(--mp-f2);
  font-weight:var(--mp-w2);
}
.sync-history-btn{
  display:flex;
  align-items:center;
  justify-content:center;
  width:100%;
  padding:6px 10px;
  border-radius:var(--mp-r1);
  border:1px solid var(--mp-primary-border);
  background:var(--mp-primary);
  color:#F9FAFF;
  cursor:pointer;
  font-size:var(--mp-f1);
  font-weight:var(--mp-w1);
}
.sync-history-btn:hover{
  background:var(--mp-primary-hover);
  border-color:var(--mp-primary-border-hover);
}
.transfer-leading-btn{
  width:var(--mp-mini);
  min-width:var(--mp-mini);
  height:var(--mp-mini);
  padding:0;
  border:none;
  border-radius:var(--mp-rf);
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:transparent;
  color:var(--mp-host);
  font-size:11px;
  cursor:pointer;
}
.transfer-leading-btn:hover{
  color:#FFE3A6;
  background:rgba(232,190,97,.20);
}
.action-btn:disabled,.send-btn:disabled,.refresh-btn:disabled{opacity:.45;cursor:not-allowed;}

/* ===== Scrollbars ===== */
.panel-content,.settings-modal-body,.chat-logs,.room-list,.pending-inputs{
  scrollbar-width:thin;
  scrollbar-color:var(--mp-scroll) transparent!important;
}
.panel-content::-webkit-scrollbar,.settings-modal-body::-webkit-scrollbar,.chat-logs::-webkit-scrollbar,.room-list::-webkit-scrollbar,.pending-inputs::-webkit-scrollbar{
  width:6px;
  height:6px;
}
.panel-content::-webkit-scrollbar-thumb,.settings-modal-body::-webkit-scrollbar-thumb,.chat-logs::-webkit-scrollbar-thumb,.room-list::-webkit-scrollbar-thumb,.pending-inputs::-webkit-scrollbar-thumb{
  background:var(--mp-scroll)!important;
  border-radius:var(--mp-rp);
}
.panel-content::-webkit-scrollbar-button,
.settings-modal-body::-webkit-scrollbar-button,
.chat-logs::-webkit-scrollbar-button,
.room-list::-webkit-scrollbar-button,
.pending-inputs::-webkit-scrollbar-button{
  display:none;
  width:0;
  height:0;
}

/* ===== Typo Hierarchy ===== */
.section-title{
  margin-bottom:var(--mp-s1);
  font-size:var(--mp-f3); /* 标题 > 正文 */
  font-weight:var(--mp-w3);
  letter-spacing:.2px;
  color:var(--mp-title);
  text-transform:none;
}
.setting-row label,.room-meta,.empty-rooms,.host-badge,.all-submitted,.pending-input-item,.empty-inputs,.hint,.preview-label,.preview-text,.sync-history-btn{
  font-family:var(--mp-ff);
  font-size:var(--mp-f1);
  font-weight:var(--mp-w1);
}
.hint{opacity:.84;color:#A9ADBB;}
.icon-btn.fa-solid,.refresh-btn.fa-solid,.join-btn-icon.fa-solid,.transfer-leading-btn.fa-solid,.user-leading-icon.fa-solid,.send-btn.fa-solid,.sync-history-btn.fa-solid,.action-btn.fa-solid,.section-title.fa-solid{
  font-family:"Font Awesome 6 Free","Font Awesome 5 Free"!important;
  font-weight:900!important;
  font-size:var(--mp-ic);
  line-height:1;
}

/* ===== Status ===== */
.status-dot{
  width:10px;
  height:10px;
  border-radius:var(--mp-rf);
  background:#8F93A3;
  border:1px solid transparent;
}
.status-dot.connected{
  background-color:var(--mp-ok)!important;
  border-color:var(--mp-ok)!important;
  box-shadow:0 0 8px var(--mp-shadow-connected);
}
.status-dot.connecting{
  background-color:var(--mp-warn)!important;
  border-color:var(--mp-warn)!important;
  animation:mp-pulse 1s infinite;
}

/* ===== Room List ===== */
.room-list{
  display:flex;flex-direction:column;gap:var(--mp-s2);
  max-height:var(--mp-room-max);
  overflow-y:auto;
}
.room-item,.empty-rooms{
  border-radius:var(--mp-r1);
  background:var(--mp-bg-soft);
}
.room-item{
  border:1px solid var(--mp-white-14);
  padding:10px 12px;
  cursor:pointer;
}
.room-item:hover{
  border-color:var(--mp-bd-soft);
  background:#3A3D49;
}
.room-item.selected{
  border-color:var(--mp-bd-strong);
  background:var(--mp-selected-bg);
}
.room-info,.room-meta{
  display:flex;align-items:center;gap:var(--mp-s2);
}
.room-name{
  color:var(--mp-title);
  font-size:var(--mp-f2);
  font-weight:var(--mp-w2);
}
.room-meta{
  margin-top:var(--mp-s1);
  opacity:.95;
}
.empty-rooms{
  padding:var(--mp-s6);
  text-align:center;
  color:var(--mp-muted);
}

/* ===== Users (胶囊) ===== */
.user-list,.spectator-list{flex-shrink:0;}
.user-list .section-title,.spectator-list .section-title{margin-bottom:var(--mp-s2);}
.user-items,.spectator-items{display:flex;flex-wrap:wrap;gap:var(--mp-s2);}
.user-item{
  display:inline-flex;
  align-items:center;
  gap:var(--mp-s2);
  min-width:76px;
  max-width:130px;
  height:var(--mp-user-h);
  padding:0 12px;
  border-radius:var(--mp-rp);
  border:1px solid var(--mp-white-18);
  background:var(--mp-bg-soft);
  font-size:var(--mp-f1);
  color:var(--mp-text);
  white-space:nowrap;
  overflow:hidden;
}
.user-item.host{
  background:var(--mp-user-host-bg);
  border-color:var(--mp-user-host-border);
}
.user-item.submitted{
  background:var(--mp-user-submitted-bg);
  border-color:var(--mp-user-submitted-border);
}
.user-item.spectator-item{
  background:var(--mp-user-spectator-bg);
  border-color:var(--mp-user-spectator-border);
}
.user-leading-icon{
  width:14px;min-width:14px;
  text-align:center;
  font-size:11px;
  opacity:.92;
}
.user-leading-icon.host-crown{color:var(--mp-host);opacity:1;}
.user-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;}
.host-badge{margin-left:var(--mp-s2);color:var(--mp-host);}
.all-submitted{margin-left:var(--mp-s2);color:var(--mp-ok);}

/* 指定重点文本区域字体 */
.multiplayer-panel .input-field,
.multiplayer-panel .settings-input,
.multiplayer-panel .chat-input,
.multiplayer-panel .input-textarea,
.user-item,
.user-name,
.log-item,
.log-from,
.log-content,
.pending-input-item,
.input-user,
.input-content{
  font-family:var(--mp-ff)!important;
}

/* ===== Logs ===== */
.chat-logs{
  flex:1;
  min-height:var(--mp-log-min);
  max-height:var(--mp-log-max);
  overflow-y:auto;
  padding:var(--mp-s2);
  border:1px solid var(--mp-white-14);
  border-radius:var(--mp-r1);
  background:var(--mp-bg-soft)!important;
}
.log-item{
  padding:4px 2px;
  line-height:1.5;
  word-break:break-word;
  color:var(--mp-text);
}
.log-item.chat{color:var(--mp-text)!important;}
.log-item.error{color:var(--mp-error-text);}

.log-from{
  margin-right:var(--mp-s1);
  font-weight:var(--mp-w2);
  color:var(--mp-title);
}
.log-item.chat .log-from,.log-item.chat .log-content{font-weight:var(--mp-w2);}
.empty-logs{
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:72px;
  color:var(--mp-muted);
  text-align:center;
}


/* ===== Pending Inputs ===== */
.pending-inputs{
  max-height:var(--mp-pending-max);
  overflow-y:auto;
  padding:var(--mp-s2);
  border-radius:var(--mp-r1);
  border:1px solid var(--mp-white-14);
  background:rgba(57,58,65,.74);
}
.pending-input-item{
  padding:5px 2px;
  border-bottom:1px solid var(--mp-white-10);
}
.pending-input-item:last-child{border-bottom:none;}
.input-user{
  margin-right:var(--mp-s2);
  font-weight:var(--mp-w2);
  color:var(--mp-accent);
}
.input-content{color:#C6C8D2;}
.empty-inputs{
  padding:var(--mp-s3);
  text-align:center;
  color:#A9ADBB;
}

/* ===== Settings Modal (卡片化) ===== */
.settings-modal,.settings-modal-content{
  width:var(--mp-full);
  flex:1;min-height:0;
  display:flex;flex-direction:column;
}
.settings-modal-content{
  overflow:hidden;
  border:1px solid var(--mp-bd-strong)!important;
  border-radius:0 0 var(--mp-r2) var(--mp-r2);
  background:var(--mp-bg)!important;
}

.settings-tabs{
  display:flex;
  align-items:flex-end;
  gap:18px;
  padding:0 0 8px 0;
  margin-bottom:8px;
  border-bottom:1px solid rgba(124,124,130,.28);
  background:transparent;
}

.settings-tab-btn{
  position:relative;
  height:auto;
  padding:0 2px 8px 2px;
  border:none;
  background:transparent;
  color:#B8B8B8;
  cursor:pointer;
  font-family:var(--mp-ff);
  font-size:var(--mp-f3);
  font-weight:var(--mp-w3);
  line-height:1;
}

.settings-tab-btn.active::after{
  content:"";
  position:absolute;
  left:0;
  right:0;
  bottom:-8px;
  height:3px;
  border-radius:999px;
  background:#626EF0;
}


.settings-modal-body{
  flex:1;
  min-height:0;
  overflow:auto;
  padding:14px 16px 18px 16px;
  display:flex;
  flex-direction:column;
  gap:18px;
}

/* 设置页改为平面分组（非卡片） */
.setting-item{
  display:block;
  font-size:var(--mp-f2);
  color:var(--mp-text)!important;
  background:transparent;
  border:none;
  border-radius:0;
  padding:0 0 14px 0;
  border-bottom:1px solid rgba(124,124,130,.28);
}
.settings-modal-body .setting-item:last-child{
  border-bottom:none;
  padding-bottom:0;
}
.settings-modal-body .setting-item>label{
  display:block;
  margin-bottom:8px;
  font-family:var(--mp-ff);
  font-size:var(--mp-f3);
  font-weight:var(--mp-w2);
  color:var(--mp-title);
}

.settings-modal-body .toggle-label,
.settings-modal-body .toggle-label > span{
  font-family:var(--mp-ff);
  font-size:var(--mp-f3);
  font-weight:var(--mp-w2);
  color:var(--mp-title);
}
.preview-box{
  margin-top:var(--mp-s2);
  padding:var(--mp-s3);
  border-radius:var(--mp-r1);
  border:1px solid var(--mp-white-14);
  background:rgba(57,58,65,.78);
}
.preview-label{margin-right:var(--mp-s2);opacity:.92;color:var(--mp-title);}
.preview-text{font-style:normal;color:var(--mp-text);}

.mp-choice-group{
  display:flex;
  flex-direction:column;
  gap:2px;
}
.mp-choice-item{
  display:flex;
  align-items:flex-start;
  gap:10px;
  padding:6px 0;
  cursor:pointer;
  user-select:none;
}
.mp-choice-dot{
  width:16px;
  height:16px;
  margin-top:2px;
  border-radius:50%;
  border:2px solid #6F7482;
  background:transparent;
  position:relative;
  flex-shrink:0;
}

.mp-choice-item.active .mp-choice-dot{
  border-color:#626EF0;
  background:#626EF0;
}

.mp-choice-item.active .mp-choice-dot::after{
  content:"";
  position:absolute;
  left:50%;
  top:50%;
  width:6px;
  height:6px;
  border-radius:50%;
  background:#F9FAFF;
  transform:translate(-50%,-50%);
}
.mp-choice-content{
  min-width:0;
}
.mp-choice-title{
  font-family:var(--mp-ff);
  font-size:var(--mp-f3);
  font-weight:var(--mp-w2);
  color:var(--mp-title);
  line-height:1.25;
}
.mp-choice-item.active .mp-choice-title{
  color:#F9FAFF;
}
.mp-choice-desc{
  margin-top:2px;
  font-family:var(--mp-ff);
  font-size:var(--mp-f1);
  color:#A9ADBB;
  line-height:1.35;
}

/* toggle */
.toggle-item{margin-bottom:0;}
.toggle-label{
  display:flex;
  align-items:center;
  gap:var(--mp-s4);
  cursor:pointer;
  font-size:var(--mp-f3);
  font-weight:var(--mp-w2);
  color:var(--mp-title);
}
.toggle-switch{
  position:relative;
  display:inline-block;
  width:44px;height:24px;
  border-radius:999px;
  background:#575A67;
  border:1px solid rgba(249,250,255,.20);
}
.toggle-switch::after{
  content:"";
  position:absolute;
  top:2px;left:2px;
  width:18px;height:18px;
  border-radius:var(--mp-rf);
  background:#F9FAFF;
  transition:transform var(--mp-mid) var(--mp-ease);
}
.toggle-switch.active{
  background:#5A66EA!important;
  border-color:#6D78F4;
}
.toggle-switch.active::after{transform:translateX(20px)!important;}

/* util */
@keyframes mp-pulse{0%,100%{opacity:1;}50%{opacity:.52;}}
@keyframes mp-shake{
  0%,100%{transform:translateX(0);}
  20%{transform:translateX(-4px);}
  40%{transform:translateX(4px);}
  60%{transform:translateX(-3px);}
  80%{transform:translateX(3px);}
}
.mp-input-shake{
  border-color:var(--mp-danger)!important;
  animation:mp-shake .32s ease;
}
.hidden-content{color:var(--mp-text);font-style:italic;}
.mp-spoiler{
  padding:0 6px;
  border-radius:var(--mp-r1);
  cursor:pointer;user-select:none;
  color:transparent;
  background:#5D606C;
}
.mp-spoiler:hover{background:#6A6E7C;}
.mp-spoiler.revealed{
  color:inherit;
  cursor:text;
  user-select:auto;
  background:transparent;
}

/* helper */
.mp-fa-gap{margin-right:6px;}
.mp-spectator-header{display:flex;align-items:center;justify-content:space-between;cursor:pointer;}
.mp-mt-1{margin-top:var(--mp-s1);}
.mp-mt-2{margin-top:var(--mp-s2);}
.mp-mb-1{margin-bottom:var(--mp-s1);}
.mp-hidden{display:none!important;}
.mp-input-narrow{width:var(--mp-s7)!important;}

/* ===== Mobile 缩放（整体缩小一圈） ===== */
@media (max-width: 768px), (hover: none) and (pointer: coarse){
  :root{
    --mp-w:300px;
    --mp-minw:136px;
    --mp-hh:40px;
    --mp-hc:30px;
    --mp-log-min:88px;
    --mp-log-max:140px;
    --mp-room-max:150px;
    --mp-pending-max:108px;
    --mp-user-h:28px;
    --mp-icon-btn:28px;
    --mp-mini:14px;

    --mp-s2:6px;
    --mp-s3:10px;
    --mp-s4:12px;
    --mp-s5:14px;
    --mp-s6:16px;

    --mp-f1:11px;
    --mp-f2:12px;
    --mp-f3:14px;
    --mp-f4:15px;
    --mp-ic:13px;
  }

  .multiplayer-panel{
    box-shadow:0 8px 18px var(--mp-shadow);
  }
}
`;
    targetDoc.head.appendChild(style);
};

// ==========================================
// 2. 大厅 API 服务 
// ==========================================
const requestWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            cache: 'no-store'
        });
        return response;
    } catch (e) {
        if (e?.name === 'AbortError') {
            throw new Error('请求超时，请检查网络或稍后重试');
        }
        throw e;
    } finally {
        clearTimeout(timer);
    }
};

const RoomApiService = {
    async fetchRooms(baseUrl) {
        const response = await requestWithTimeout(`${baseUrl}/rooms`, {}, 8000);
        if (!response.ok) throw new Error('获取房间列表失败');
        return (await response.json()).rooms || [];
    },
    async createRoom(baseUrl, params) {
        const response = await requestWithTimeout(`${baseUrl}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        }, 8000);

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || '创建房间失败');
        return data;
    },
    async verifyAndJoin(baseUrl, roomId, password) {
        const response = await requestWithTimeout(`${baseUrl}/rooms/${roomId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        }, 8000);

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const err = new Error(
                data.error ||
                (response.status === 404 ? '房间不存在或已关闭' : '加入房间失败')
            );
            err.status = response.status;
            err.code = 'ROOM_JOIN_FAILED';
            throw err;
        }

        return `${baseUrl.replace('http', 'ws')}/ws/room/${roomId}`;
    }
};

// ==========================================
// 3. 网络通信模块
// ==========================================
const generateId = () => Math.random().toString(36).substring(2, 10); // 生成随机用户ID

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.userId = generateId();
        this.userName = '';
        this.isConnected = false;
        this.isHost = false;
        this.isSpectator = false;
        this.handlers = {};

        this.heartbeatTimer = null;
        this.pendingPong = false;
        this.missedPongs = 0;

        this.HEARTBEAT_INTERVAL = 5000;
        this.MAX_MISSED_PONGS = 8;
        this.CONNECT_TIMEOUT_MS = 10000;
    }

    init(handlers) {
        this.handlers = handlers;
    }

    async connect(url, password) {
        return new Promise((resolve, reject) => {
            let settled = false;
            let connectTimer = null;

            const safeReject = (err) => {
                if (settled) return;
                settled = true;
                clearTimeout(connectTimer);
                reject(err);
            };

            const safeResolve = () => {
                if (settled) return;
                settled = true;
                clearTimeout(connectTimer);
                resolve();
            };

            try {
                this.ws = new WebSocket(url);

                connectTimer = setTimeout(() => {
                    this.handlers.onError?.('连接超时，请重试');
                    try { this.ws?.close(); } catch (e) {}
                    safeReject(new Error('连接超时'));
                }, this.CONNECT_TIMEOUT_MS);

                this.ws.onopen = () => {
                    this.isConnected = true;
                    this.missedPongs = 0;
                    this.pendingPong = false;

                    this.startHeartbeat();
                    this.send({
                        type: 'join',
                        data: {
                            name: this.userName,
                            password,
                            spectator: !!this.isSpectator
                        }
                    });
                    this.handlers.onConnectionChange?.(true);

                    safeResolve();
                };

                this.ws.onclose = () => {
                    this.stopHeartbeat();
                    this.isConnected = false;
                    this.handlers.onConnectionChange?.(false);

                    if (!settled) {
                        safeReject(new Error('连接已关闭'));
                    }
                };

                this.ws.onerror = (e) => {
                    this.handlers.onError?.('WebSocket错误');
                    safeReject(e instanceof Error ? e : new Error('WebSocket错误'));
                };

                this.ws.onmessage = (e) => {
                    // 收到任意消息都说明链路可用，降低误判断线
                    this.pendingPong = false;
                    this.missedPongs = 0;

                    let msg = null;
                    try {
                        msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                    } catch (err) {
                        console.warn('[联机Mod] 收到非 JSON 消息，已忽略:', e.data);
                        return;
                    }

                    if (!msg || typeof msg !== 'object' || typeof msg.type !== 'string') {
                        console.warn('[联机Mod] 收到非法消息结构，已忽略:', msg);
                        return;
                    }

                    switch (msg.type) {
                        case 'pong':
                            break;
                        case 'error':
                            if (msg.data?.targetId === this.userId) {
                                this.handlers.onError?.(msg.data.message);
                            }
                            break;
                        case 'join': {
                            const d = msg.data || {};
                            const hasSpectatorFlag =
                                Object.prototype.hasOwnProperty.call(d, 'spectator') ||
                                Object.prototype.hasOwnProperty.call(d, 'isSpectator') ||
                                Object.prototype.hasOwnProperty.call(d, 'observer') ||
                                Object.prototype.hasOwnProperty.call(d, 'is_observer') ||
                                Object.prototype.hasOwnProperty.call(d, 'role');

                            const parsedSpectator =
                                d.spectator ??
                                d.isSpectator ??
                                d.observer ??
                                d.is_observer ??
                                (d.role === 'spectator' || d.role === 'observer');

                            const joinUser = {
                                id: msg.from,
                                name: msg.fromName,
                                isHost: false
                            };

                            if (hasSpectatorFlag) {
                                joinUser.isSpectator = !!parsedSpectator;
                            }

                            this.handlers.onUserJoin?.(joinUser);
                            break;
                        }
                        case 'leave':
                            this.handlers.onUserLeave?.(msg.from);
                            break;
                        case 'sync_state':
                            if (msg.data?.users) {
                                msg.data.users.forEach(u => this.handlers.onUserJoin?.(u));
                            }
                            break;
                        case 'host_change':
                            this.handlers.onMessage?.(msg);
                            break;
                        default:
                            this.handlers.onMessage?.(msg);
                    }
                };
            } catch (e) {
                safeReject(e);
            }
        });
    }

    send(payload) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                ...payload,
                from: this.userId,
                fromName: this.userName,
                timestamp: Date.now()
            }));
        }
    }

    broadcast(payload) {
        this.send(payload);
    }

    startHeartbeat() {
        this.stopHeartbeat();
        this.pendingPong = false;

        this.heartbeatTimer = setInterval(() => {
            if (!this.isConnected) return;

            if (this.pendingPong) {
                this.missedPongs++;
                if (this.missedPongs >= this.MAX_MISSED_PONGS) {
                    this.handlers.onError?.('网络不稳定，连接已断开');
                    this.ws?.close();
                    return;
                }
            }

            this.pendingPong = true;
            this.send({ type: 'ping', data: { timestamp: Date.now() } });
        }, this.HEARTBEAT_INTERVAL);
    }

    stopHeartbeat() {
        clearInterval(this.heartbeatTimer);
        this.pendingPong = false;
        this.missedPongs = 0;
    }

    disconnect() {
        this.stopHeartbeat();
        this.ws?.close();
        this.isConnected = false;
    }
}

class LocalChannelClient {
    constructor() {
        this.channel = null; this.userId = generateId(); this.userName = '';
        this.isConnected = false; this.isHost = false; this.isSpectator = false; this.roomPassword = ''; this.users = new Map();
    }
    init(handlers) { this.handlers = handlers; }
    async startServer(config) {
        this.isHost = true;
        this.isSpectator = false;
        this.roomPassword = config.password || '';
        this.userName = config.userName || this.userName || '房主';

        this.channel = new BroadcastChannel(`st-multiplayer-${config.port}`); // 使用本地频道作为房主
        this.channel.onmessage = (e) => this.handleMessage(e.data);
        this.isConnected = true;
        this.handlers.onConnectionChange?.(true);

        const hostUser = { id: this.userId, name: this.userName, isHost: true, isSpectator: false };
        this.users.set(this.userId, hostUser);
        this.handlers.onUserJoin?.(hostUser);
    }
    async connect(port, password, userName, spectator = false) {
        this.isHost = false;
        this.isSpectator = !!spectator;
        this.userName = userName || `用户${this.userId.substring(0, 4)}`;
        this.channel = new BroadcastChannel(`st-multiplayer-${port}`); // 客户端连接本地频道
        this.channel.onmessage = (e) => this.handleMessage(e.data);
        this.isConnected = true;
        this.handlers.onConnectionChange?.(true);
        this.send({ type: 'join', data: { name: this.userName, password, spectator: this.isSpectator } });
    }
    send(payload) {
        if (this.channel && this.isConnected) {
            this.channel.postMessage({ ...payload, from: this.userId, fromName: this.userName, timestamp: Date.now() }); // 本地广播消息
        }
    }
    broadcast(payload) { this.send(payload); }
    handleMessage(msg) {
        if (msg.from === this.userId) return;

        if (msg.type === 'join') {
            if (this.isHost && this.roomPassword && msg.data.password !== this.roomPassword) {
                this.send({
                    type: 'error',
                    data: { targetId: msg.from, message: '密码错误' }
                });
                return;
            }

            const newUser = {
                id: msg.from,
                name: msg.data.name || msg.fromName,
                isSpectator: !!msg.data?.spectator
            };

            this.users.set(msg.from, newUser);
            this.handlers.onUserJoin?.(newUser);

            if (this.isHost) {
                this.send({
                    type: 'sync_state',
                    data: { users: Array.from(this.users.values()) }
                });
            }
            return;
        }

        if (msg.type === 'error') {
            const targetId = (msg.data?.targetId || '').toString();
            if (!targetId || targetId === this.userId) {
                this.handlers.onError?.(msg.data?.message || '连接错误');
                // 密码错误等致命错误时主动断开，避免“假在线”
                this.disconnect();
                this.handlers.onConnectionChange?.(false);
            }
            return;
        }

        if (msg.type === 'leave') {
            this.users.delete(msg.from);
            this.handlers.onUserLeave?.(msg.from);
            return;
        }

        if (msg.type === 'sync_state' && !this.isHost) {
            msg.data.users.forEach(u => {
                if (!this.users.has(u.id)) {
                    this.users.set(u.id, u);
                    this.handlers.onUserJoin?.(u);
                }
            });
            return;
        }

        this.handlers.onMessage?.(msg);
    }
    disconnect() { this.send({ type: 'leave', data: null }); this.channel?.close(); this.isConnected = false; }
}

// ==========================================
// 4. 状态管理器
// ==========================================

const useMultiplayerStore = defineStore('multiplayer', () => {
    const isConnected = ref(false);
    const mode = ref('disconnected');
    const isHost = ref(false);

    const users = ref([]);
    const chatLogs = ref([]);

    const pendingInputs = shallowRef(new Map());
    const pendingInputsVersion = ref(0);

    const pendingPersonas = shallowRef(new Map());
    const acuSyncState = ref({ fullSynced: false, lastSyncTimestamp: 0, isolationKey: '' });

    // 仅用于“隐藏模式”重roll时补回隐藏输入上下文（不直接展示到用户层）
    const hiddenRerollContext = ref('');
    const setHiddenRerollContext = (content = '') => {
        hiddenRerollContext.value = (content || '').toString().trim();
    };
    const getHiddenRerollContext = () => {
        return (hiddenRerollContext.value || '').toString().trim();
    };

    const settings = reactive({
        onlineMode: true,
        onlineServer: 'https://room.yufugemini.cloud',
        defaultUserName: '',
        timedInputSeconds: 0
    });

    // 变量模式（可多选：mvu / apotheosis）
    const _VM_KEY = 'st_multiplayer_variable_mode';
    const VARIABLE_MODE_OPTIONS = Object.freeze(['mvu', 'apotheosis']);

    const normalizeVariableModes = (raw) => {
        let src = raw;

        if (typeof src === 'string') {
            const s = src.trim();
            if (!s || s === 'none') return [];
            try {
                const parsed = JSON.parse(s);
                if (Array.isArray(parsed)) src = parsed;
                else src = [s];
            } catch (e) {
                src = [s];
            }
        }

        if (!Array.isArray(src)) src = [];
        const set = new Set(
            src.map(x => String(x || '').trim().toLowerCase()).filter(Boolean)
        );
        return VARIABLE_MODE_OPTIONS.filter(x => set.has(x));
    };

    const variableMode = ref(normalizeVariableModes(localStorage.getItem(_VM_KEY)));
    watch(variableMode, (v) => {
        localStorage.setItem(_VM_KEY, JSON.stringify(normalizeVariableModes(v)));
    }, { deep: true });

    const spectatorMode = ref(false);

    let networkClient = null;
    let userJoinOrderSeed = 0;

    // 房主限时发送计时器
    let timeoutTimer = null;
    let lastPendingSize = 0;

    // 自动重连状态
    let reconnectTimer = null;
    let reconnectAttempt = 0;
    const reconnectDelays = [1000, 2000, 4000];
    const MAX_RECONNECT_ATTEMPTS = 5;
    let reconnectContext = null;
    let sessionEstablished = false;
    let manualDisconnect = false;

    const NO_ROOM_KEY = '__no_room__';
    const currentRoomId = ref('');
    const MAX_CHAT_LOGS = 50;

    // 仅会话内存日志，不做本地持久化
    const roomLogsMap = ref({});

    // 系统实时播报日志（显示后自动消失，不入历史）
    const transientSystemLogs = ref([]);
    const SYSTEM_LOG_TTL_MS = 3500;

    // -------------------------
    // 工具函数
    // -------------------------
    const normalizeRoomKey = (roomId = '') => ((roomId || '').toString().trim().toLowerCase() || NO_ROOM_KEY);
    const normalizeUserName = (name = '') => name.trim().toLowerCase();
    const normalizeUid = (uid = '') => uid.toString().trim().toLowerCase();

    const makeBoundUserId = (roomId, uid) => {
        const roomKey = (roomId || 'global').toString().trim().toLowerCase();
        const uidKey = normalizeUid(uid || 'uid_anonymous') || 'uid_anonymous';
        return `u_${encodeURIComponent(roomKey)}_${encodeURIComponent(uidKey)}`;
    };

    const normalizeIncomingUser = (user = {}) => {
        const hasHostField =
            Object.prototype.hasOwnProperty.call(user, 'isHost') ||
            Object.prototype.hasOwnProperty.call(user, 'host');

        const hasSpectatorField =
            Object.prototype.hasOwnProperty.call(user, 'isSpectator') ||
            Object.prototype.hasOwnProperty.call(user, 'spectator') ||
            Object.prototype.hasOwnProperty.call(user, 'is_observer') ||
            Object.prototype.hasOwnProperty.call(user, 'observer');

        return {
            id: user.id,
            name: user.name || user.fromName || '匿名',
            isHost: !!(user.isHost ?? user.host ?? false),
            isSpectator: !!(user.isSpectator ?? user.spectator ?? user.is_observer ?? user.observer ?? false),
            hasHostField,
            hasSpectatorField
        };
    };

    const touchPendingInputs = () => {
        pendingInputsVersion.value++;
        triggerRef(pendingInputs);
    };

    const clearPendingInputs = () => {
        pendingInputs.value.clear();
        touchPendingInputs();
        if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
        }
    };

    const getJoinOrder = (u, idx = 0) => Number.isFinite(u?._joinOrder) ? u._joinOrder : (idx + 1);

    const buildUsersSnapshot = () => {
        return users.value.map((u, idx) => ({
            id: u.id,
            name: u.name || '匿名',
            isHost: !!u.isHost,
            isSpectator: !!u.isSpectator,
            _joinOrder: getJoinOrder(u, idx)
        }));
    };

    const buildPendingInputsSnapshot = () => {
        return Array.from(pendingInputs.value.entries())
            .map(([userId, data]) => ({
                userId,
                userName: data?.userName || '匿名',
                content: (data?.content ?? '').toString(),
                prefix: data?.prefix || '[{name}]:',
                suffix: (data?.suffix ?? '').toString(),
                submittedAt: Number(data?.submittedAt || 0),
                hideContent: !!data?.hideContent
            }))
            .filter(item => item.content.trim().length > 0)
            .sort((a, b) => {
                if (a.submittedAt !== b.submittedAt) return a.submittedAt - b.submittedAt;
                return String(a.userId).localeCompare(String(b.userId), 'zh-CN');
            });
    };

    const pickNextHostCandidate = () => {
        return users.value
            .filter(u => !u.isSpectator)
            .slice()
            .sort((a, b) => {
                const d = getJoinOrder(a) - getJoinOrder(b);
                if (d !== 0) return d;
                return String(a.id).localeCompare(String(b.id), 'zh-CN');
            })[0] || null;
    };

    // -------------------------
    // 日志相关
    // -------------------------
    const buildDisplayLogs = (roomId = '') => {
        const key = normalizeRoomKey(roomId);
        const logs = Array.isArray(roomLogsMap.value[key]) ? roomLogsMap.value[key] : [];

        return logs
            .filter(item => item?.type === 'chat' || item?.type === 'error')
            .sort((a, b) => {
                const ta = Number(a?.timestamp || 0);
                const tb = Number(b?.timestamp || 0);
                if (ta !== tb) return ta - tb;
                return String(a?.id || '').localeCompare(String(b?.id || ''), 'zh-CN');
            });
    };

    const refreshCurrentRoomLogs = () => {
        const roomKey = normalizeRoomKey(currentRoomId.value);
        const base = buildDisplayLogs(currentRoomId.value);
        const transient = (transientSystemLogs.value || [])
            .filter(item => normalizeRoomKey(item.roomId) === roomKey);

        chatLogs.value = [...base, ...transient].sort((a, b) => {
            const ta = Number(a?.timestamp || 0);
            const tb = Number(b?.timestamp || 0);
            if (ta !== tb) return ta - tb;
            return String(a?.id || '').localeCompare(String(b?.id || ''), 'zh-CN');
        });
    };

    const switchRoomLogs = (roomId = '') => {
        currentRoomId.value = (roomId || '').toString().trim();
        const key = normalizeRoomKey(currentRoomId.value);

        if (!Array.isArray(roomLogsMap.value[key])) {
            roomLogsMap.value[key] = [];
        }

        refreshCurrentRoomLogs();
    };

    const pruneRoomLogsByExistingRoomIds = (roomIds = []) => {
        const keepKeys = new Set(roomIds.map(id => normalizeRoomKey(id)));
        const next = {};

        Object.entries(roomLogsMap.value || {}).forEach(([k, logs]) => {
            if (k === NO_ROOM_KEY || keepKeys.has(k)) {
                next[k] = Array.isArray(logs) ? logs.slice(-MAX_CHAT_LOGS) : [];
            }
        });

        roomLogsMap.value = next;

        const currentKey = normalizeRoomKey(currentRoomId.value);
        if (currentKey !== NO_ROOM_KEY && !keepKeys.has(currentKey)) {
            currentRoomId.value = '';
            chatLogs.value = [];
        } else {
            refreshCurrentRoomLogs();
        }
    };

    const clearRoomLogCache = (roomId = '') => {
        const key = normalizeRoomKey(roomId || currentRoomId.value);
        if (key === NO_ROOM_KEY) return;

        if (Object.prototype.hasOwnProperty.call(roomLogsMap.value, key)) {
            delete roomLogsMap.value[key];
        }

        if (normalizeRoomKey(currentRoomId.value) === key) {
            chatLogs.value = [];
        }
    };

    const addLog = (type, from, content) => {
        if (type !== 'chat' && type !== 'error') return;

        const key = normalizeRoomKey(currentRoomId.value);
        const text = (content ?? '').toString();

        // 系统日志：实时播报，播完即消失，不入历史
        if ((from || '').toString().trim() === '系统') {
            const item = {
                id: `log-live-${Date.now()}-${Math.random()}`,
                type,
                from,
                content: text,
                timestamp: Date.now(),
                roomId: currentRoomId.value || ''
            };

            transientSystemLogs.value = [...transientSystemLogs.value, item];
            refreshCurrentRoomLogs();

            setTimeout(() => {
                transientSystemLogs.value = transientSystemLogs.value.filter(x => x.id !== item.id);
                refreshCurrentRoomLogs();
            }, SYSTEM_LOG_TTL_MS);

            return;
        }

        const item = {
            id: `log-${Date.now()}-${Math.random()}`,
            type,
            from,
            content: text,
            timestamp: Date.now()
        };

        const list = Array.isArray(roomLogsMap.value[key]) ? [...roomLogsMap.value[key]] : [];
        list.push(item);
        roomLogsMap.value[key] = list.slice(-MAX_CHAT_LOGS);

        if (key === normalizeRoomKey(currentRoomId.value)) {
            refreshCurrentRoomLogs();
        }
    };

    // -------------------------
    // 重连相关
    // -------------------------
    const clearReconnectTimer = () => {
        if (!reconnectTimer) return;
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
    };

    const scheduleReconnect = () => {
        if (manualDisconnect || !reconnectContext || reconnectTimer || isConnected.value) return;

        if (reconnectAttempt >= MAX_RECONNECT_ATTEMPTS) {
            addLog('error', '系统', '网络已断开，重连失败次数过多，已自动退出房间');
            disconnect();
            return;
        }

        const idx = Math.min(reconnectAttempt, reconnectDelays.length - 1);
        const delay = reconnectDelays[idx];
        reconnectAttempt++;

        reconnectTimer = setTimeout(async () => {
            reconnectTimer = null;
            if (manualDisconnect || isConnected.value || !reconnectContext) return;

            try {
                await connectOnline(
                    reconnectContext.roomId,
                    reconnectContext.pwd,
                    reconnectContext.name,
                    reconnectContext.uid,
                    { isReconnect: true }
                );
            } catch (e) {
                const status = Number(e?.status || 0);
                const msg = String(e?.message || '');

                if (status === 404 || /404|房间不存在|已关闭/.test(msg)) {
                    addLog('error', '系统', '房间已不存在，已停止自动重连并退出房间');
                    disconnect();
                    return;
                }

                scheduleReconnect();
            }
        }, delay);
    };




    // -------------------------
    // 用户/连接处理
    // -------------------------
    const syncHostStateIfNeeded = () => {
        if (!isHost.value) return;
        networkClient?.broadcast({
            type: 'sync_user_state',
            data: { users: buildUsersSnapshot() }
        });
    };

    const ensureMeExists = () => {
        const myId = networkClient?.userId;
        if (!myId) return;

        const me = users.value.find(u => u.id === myId);
        if (me) return;

        users.value.push({
            id: myId,
            name: networkClient?.userName || '我',
            isHost: false,
            isSpectator: !!networkClient?.isSpectator,
            _joinOrder: ++userJoinOrderSeed
        });
    };

    const upsertUser = (user) => {
        const normalized = normalizeIncomingUser(user);
        const selfId = networkClient?.userId || '';

        const target = users.value.find(u => u.id === normalized.id);
        if (!target) {
            users.value.push({
                id: normalized.id,
                name: normalized.name,
                isHost: normalized.id === selfId
                    ? (!!normalized.isHost && !networkClient?.isSpectator)
                    : normalized.isHost,
                isSpectator: normalized.id === selfId
                    ? !!networkClient?.isSpectator
                    : normalized.isSpectator,
                _joinOrder: ++userJoinOrderSeed
            });
        } else {
            const oldId = target.id;
            const idChanged = !!(normalized.id && target.id !== normalized.id);

            if (idChanged) {
                target.id = normalized.id;
                if (pendingInputs.value.has(oldId)) {
                    const oldInput = pendingInputs.value.get(oldId);
                    pendingInputs.value.delete(oldId);
                    pendingInputs.value.set(normalized.id, oldInput);
                    touchPendingInputs();
                }
            }

            if (normalized.hasHostField) target.isHost = normalized.isHost;
            if (normalized.hasSpectatorField) target.isSpectator = normalized.isSpectator;
            if (normalized.name && normalized.name !== target.name) target.name = normalized.name;

            if (normalized.id === selfId) {
                target.isSpectator = !!networkClient?.isSpectator;
                if (target.isSpectator) target.isHost = false;
            }

            if (!target.isHost && idChanged) {
                target._joinOrder = ++userJoinOrderSeed;
            } else if (!Number.isFinite(target._joinOrder)) {
                target._joinOrder = ++userJoinOrderSeed;
            }
        }

        if (normalized.id === selfId) {
            const me = users.value.find(u => u.id === selfId);
            isHost.value = !!(me?.isHost && !me?.isSpectator);
            mode.value = me?.isSpectator ? 'spectator' : 'client';
        }

        syncHostStateIfNeeded();
    };

    const handleUserLeave = (userId) => {
        const idx = users.value.findIndex(u => u.id === userId);
        if (idx === -1) return;

        const leaving = users.value[idx];
        const wasHost = !!leaving.isHost;

        users.value.splice(idx, 1);
        pendingInputs.value.delete(userId);
        touchPendingInputs();

        if (!wasHost || !isConnected.value) return;

        const nextHost = pickNextHostCandidate();
        if (!nextHost) {
            clearRoomLogCache(currentRoomId.value);
            disconnect();
            return;
        }

        users.value.forEach(u => {
            u.isHost = (u.id === nextHost.id);
        });

        isHost.value = nextHost.id === (networkClient?.userId || '');
        if (isHost.value) {
            mode.value = 'client';
            networkClient?.broadcast({
                type: 'host_change',
                data: { hostId: nextHost.id, hostName: nextHost.name }
            });
            syncHostStateIfNeeded();
        }
    };

    const initNetwork = (forceOnline = settings.onlineMode) => {
        if (networkClient) {
            try { networkClient.disconnect(); } catch (e) {}
        }

        networkClient = forceOnline ? new WebSocketClient() : new LocalChannelClient();

        networkClient.init({
            onConnectionChange: (status) => {
                isConnected.value = status;

                if (status) {
                    sessionEstablished = true;
                    reconnectAttempt = 0;
                    clearReconnectTimer();
                    return;
                }

                users.value = [];
                clearPendingInputs();

                if (timeoutTimer) {
                    clearTimeout(timeoutTimer);
                    timeoutTimer = null;
                }

                const canAutoReconnect =
                    settings.onlineMode &&
                    !manualDisconnect &&
                    sessionEstablished &&
                    !!reconnectContext;

                if (canAutoReconnect) {
                    mode.value = 'reconnecting';
                    scheduleReconnect();
                    return;
                }

                mode.value = 'disconnected';
                currentRoomId.value = '';
                chatLogs.value = [];
            },

            onError: (msg) => addLog('error', '系统', msg),

            onUserJoin: (user) => upsertUser(user),

            onUserLeave: (userId) => handleUserLeave(userId),

            onMessage: (msg) => {
                const myId = (networkClient?.userId || '').toString();

                const emitMap = {
                    ai_stream: 'multiplayer_ai_stream',
                    delete_last_message: 'multiplayer_delete_last_message',
                    request_input: 'multiplayer_request_input',
                    sync_history_data: 'multiplayer_sync_history_data',
                    sync_regex_data: 'multiplayer_sync_regex_data',
                    acu_full_sync: 'multiplayer_acu_full_sync',
                    acu_delta_sync: 'multiplayer_acu_delta_sync'
                };

                switch (msg.type) {
                    case 'chat':
                        if (msg.from !== myId) addLog('chat', msg.fromName, msg.data.content);
                        break;

                    case 'rename': {
                        const newName = (msg.data?.name || msg.fromName || '').trim();
                        if (!newName) break;

                        const duplicated = users.value.find(
                            u => u.id !== msg.from && normalizeUserName(u.name) === normalizeUserName(newName)
                        );
                        if (duplicated) {
                            addLog('error', '系统', `用户名 "${newName}" 已存在，重命名被忽略`);
                            break;
                        }

                        const target = users.value.find(u => u.id === msg.from);
                        if (target) target.name = newName;
                        break;
                    }

                    case 'user_input':
                        pendingInputs.value.set(msg.from, {
                            userName: msg.fromName,
                            content: msg.data.content,
                            prefix: msg.data.messagePrefix,
                            suffix: msg.data.messageSuffix || '',
                            submittedAt: msg.timestamp || Date.now(),
                            hideContent: !!msg.data?.hideContent
                        });
                        touchPendingInputs();
                        break;

                    case 'revoke_input':
                        if (pendingInputs.value.has(msg.from)) {
                            pendingInputs.value.delete(msg.from);
                            touchPendingInputs();
                        }
                        break;

                    case 'spectator_mode': {
                        const enabled = !!msg.data?.enabled;
                        const targetId = msg.from || msg.data?.userId || '';
                        const target = users.value.find(u => u.id === targetId);

                        if (target) {
                            target.isSpectator = enabled;
                            if (enabled && pendingInputs.value.has(target.id)) {
                                pendingInputs.value.delete(target.id);
                                touchPendingInputs();
                            }
                        }

                        syncHostStateIfNeeded();
                        break;
                    }

                    case 'ai_response':
                        if (msg.data?.variableModes !== undefined) {
                            variableMode.value = normalizeVariableModes(msg.data.variableModes);
                        }
                        eventEmit('multiplayer_ai_response', msg.data || {});
                        break;

                    case 'user_message':
                        clearPendingInputs();
                        eventEmit('multiplayer_user_message', msg.data || {});
                        break;

                    case 'request_pending_inputs':
                        if (isHost.value && msg.from !== myId) {
                            networkClient.send({
                                type: 'sync_pending_inputs',
                                data: {
                                    targetUserId: msg.from,
                                    items: buildPendingInputsSnapshot()
                                }
                            });
                            networkClient.send({
                                type: 'sync_user_state',
                                data: {
                                    targetUserId: msg.from,
                                    users: buildUsersSnapshot()
                                }
                            });
                        }
                        break;

                    case 'sync_pending_inputs':
                        if (!isHost.value && msg.data?.targetUserId === myId) {
                            pendingInputs.value.clear();
                            (msg.data.items || []).forEach(item => {
                                pendingInputs.value.set(item.userId, {
                                    userName: item.userName,
                                    content: item.content,
                                    prefix: item.prefix,
                                    suffix: item.suffix || '',
                                    hideContent: !!item.hideContent
                                });
                            });
                            touchPendingInputs();
                        }
                        break;

                    case 'sync_user_state':
                        if (!isHost.value) {
                            const targetUserId = (msg.data?.targetUserId || '').toString();
                            if (targetUserId && targetUserId !== myId) break;

                            const incoming = Array.isArray(msg.data?.users) ? msg.data.users : [];
                            const nextUsers = incoming
                                .map((u, idx) => {
                                    const nu = normalizeIncomingUser(u);
                                    return {
                                        id: nu.id,
                                        name: nu.name,
                                        isHost: nu.isHost,
                                        isSpectator: nu.isSpectator,
                                        _joinOrder: Number.isFinite(u?._joinOrder) ? u._joinOrder : (idx + 1)
                                    };
                                })
                                .filter(u => !!u.id);

                            if (myId && !nextUsers.some(u => u.id === myId)) {
                                nextUsers.push({
                                    id: myId,
                                    name: networkClient?.userName || '我',
                                    isHost: false,
                                    isSpectator: !!networkClient?.isSpectator,
                                    _joinOrder: nextUsers.length + 1
                                });
                            }

                            users.value = nextUsers;

                            const me = users.value.find(u => u.id === myId);
                            if (me) {
                                me.isSpectator = !!networkClient?.isSpectator;
                                if (me.isSpectator) me.isHost = false;
                            }

                            isHost.value = !!users.value.find(u => u.id === myId)?.isHost;
                            mode.value = me?.isSpectator ? 'spectator' : 'client';
                        }
                        break;

                    case 'reset_input':
                        clearPendingInputs();
                        break;

                    case 'sync_history_request':
                        if (isHost.value) {
                            eventEmit('multiplayer_sync_history_request', {
                                userId: msg.from,
                                depth: msg.data?.depth || 0
                            });
                        }
                        break;

                    case 'sync_regex_request':
                        if (isHost.value) {
                            eventEmit('multiplayer_sync_regex_request', {
                                userId: msg.from,
                                scopes: Array.isArray(msg.data?.scopes) ? msg.data.scopes : ['character']
                            });
                        }
                        break;

                    case 'sync_variables_request':
                        if (isHost.value) {
                            eventEmit('multiplayer_sync_variables_request', {
                                userId: msg.from,
                                variableModes: msg.data?.variableModes
                            });
                        }
                        break;

                    case 'sync_variables':
                        if (!isHost.value) {
                            const targetUserId = (msg.data?.targetUserId || '').toString();
                            if (targetUserId && targetUserId !== myId) break;
                            eventEmit('multiplayer_sync_variables', {
                                variableType: msg.data?.variableType,
                                content: msg.data?.content,
                                targetUserId
                            });
                        }
                        break;

                    case 'user_persona':
                        pendingPersonas.value.set(msg.from, {
                            userName: msg.fromName,
                            content: msg.data.content,
                            prefix: msg.data.prefix
                        });
                        triggerRef(pendingPersonas);
                        break;

                    case 'transfer_host': {
                        // 只允许当前房主处理转让请求：兼容“服务器只投递给房主”的实现
                        if (!isHost.value) break;

                        const targetUserId = (msg.data?.targetUserId || '').toString();
                        if (!targetUserId) break;

                        const target = users.value.find(u => u.id === targetUserId);
                        if (!target || target.isSpectator) {
                            addLog('error', '系统', '房主转让失败：目标不存在或为观众');
                            break;
                        }

                        users.value.forEach(u => {
                            u.isHost = (u.id === target.id);
                        });

                        // 由“当前房主”广播 host_change + 完整用户态，避免依赖目标客户端二次广播
                        networkClient?.broadcast({
                            type: 'host_change',
                            data: { hostId: target.id, hostName: target.name }
                        });
                        networkClient?.broadcast({
                            type: 'sync_user_state',
                            data: { users: buildUsersSnapshot() }
                        });

                        // 本端（旧房主）立刻降权；新房主会在 host_change 里自动开启同步
                        isHost.value = false;
                        break;
                    }

                    case 'host_change':
                        if (msg.data?.hostId) {
                            let targetHost = users.value.find(u => u.id === msg.data.hostId);

                            if (!targetHost || targetHost.isSpectator) {
                                const fallbackHost = pickNextHostCandidate();
                                if (!fallbackHost) {
                                    clearRoomLogCache(currentRoomId.value);
                                    disconnect();
                                    break;
                                }
                                targetHost = fallbackHost;
                            }

                            users.value.forEach(u => {
                                u.isHost = (u.id === targetHost.id);
                            });

                            isHost.value = targetHost.id === myId && !targetHost.isSpectator;
                            if (isHost.value) {
                                // 切换为新房主后，主动同步一次状态，避免客户端依赖旧房主继续广播
                                syncHostStateIfNeeded();
                            }
                        }
                        break;

                    default:
                        if (emitMap[msg.type]) {
                            if (msg.type === 'acu_full_sync' && !isHost.value) {
                                acuSyncState.value.fullSynced = true;
                                acuSyncState.value.lastSyncTimestamp = Date.now();
                                acuSyncState.value.isolationKey = msg.data?.isolationKey || '';
                            }
                            if (msg.type === 'acu_delta_sync' && !isHost.value) {
                                acuSyncState.value.lastSyncTimestamp = Date.now();
                            }
                            eventEmit(emitMap[msg.type], msg.data || {});
                        }
                        break;
                }
            }
        });
    };

    // -------------------------
    // 输入池限时自动发送
    // -------------------------
    watch(pendingInputsVersion, () => {
        const newSize = pendingInputs.value.size;
        const oldSize = lastPendingSize;
        lastPendingSize = newSize;

        if (isHost.value && settings.timedInputSeconds > 0 && newSize > 0 && newSize > oldSize) {
            if (timeoutTimer) clearTimeout(timeoutTimer);
            timeoutTimer = setTimeout(() => {
                if (isHost.value && pendingInputs.value.size > 0) {
                    submitToAI();
                }
            }, settings.timedInputSeconds * 1000);
        }
    });

    // -------------------------
    // 对外动作
    // -------------------------
    const submitToAI = async () => {
        if (!isHost.value) return;

        if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
        }

        const snapshot = buildPendingInputsSnapshot();
        if (snapshot.length === 0) {
            addLog('error', '系统', '没有可发送的输入');
            return;
        }

        const toLine = (item) => {
            const p = (item.prefix || '[{name}]:').replace('{name}', item.userName);
            return `${p} ${item.content}${item.suffix || ''}`;
        };

        const fullCombined = snapshot.map(toLine).join('\n\n');
        const visibleInputs = snapshot.filter(item => !item.hideContent);
        const hiddenInputs = snapshot.filter(item => item.hideContent);
        const visibleCombined = visibleInputs.map(toLine).join('\n\n');
        const hiddenCombined = hiddenInputs.map(toLine).join('\n\n');

        const batchId = `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        try {
            await createChatMessages([{ role: 'user', message: fullCombined }]);
            const hostMsgId = getLastMessageId();

            networkClient?.broadcast({
                type: 'user_message',
                data: {
                    batchId,
                    content: visibleCombined,
                    inputs: visibleInputs,
                    userLayerHidden: visibleInputs.length !== snapshot.length
                }
            });

            await triggerSlash('/trigger');

            setHiddenRerollContext(hiddenCombined.trim() ? hiddenCombined : '');

            try {
                if (hostMsgId >= 0) {
                    if (visibleCombined.trim()) {
                        await setChatMessages([{ message_id: hostMsgId, message: visibleCombined }]);
                    } else {
                        await deleteChatMessages([hostMsgId]);
                    }
                }
            } catch (e) {
                console.warn('[联机Mod] 用户层脱敏回写失败:', e);
            }

            clearPendingInputs();
        } catch (e) {
            addLog('error', '系统', `发送给AI失败: ${e.message}`);
            console.error('[联机Mod] submitToAI 失败:', e);
        }
    };

    const renameSelf = (newNameRaw) => {
        if (!networkClient) return { ok: false, reason: 'no_client' };

        const newName = (newNameRaw || '').trim();
        if (!newName) return { ok: false, reason: 'empty' };

        const myId = networkClient.userId;
        const duplicated = users.value.find(
            u => u.id !== myId && normalizeUserName(u.name) === normalizeUserName(newName)
        );

        if (duplicated) {
            addLog('error', '系统', `用户名 "${newName}" 已被占用`);
            return { ok: false, reason: 'duplicate' };
        }

        networkClient.userName = newName;
        const me = users.value.find(u => u.id === myId);
        if (me) me.name = newName;

        if (isConnected.value) {
            networkClient.broadcast({ type: 'rename', data: { name: newName } });
        }

        return { ok: true };
    };

    const setClientIdentity = ({ roomKey, name, uid, spectator }) => {
        const safeName = (name || '').trim() || '匿名';
        const safeUid = (uid || '').trim() || `uid_${Math.random().toString(36).slice(2, 10)}`;

        networkClient.userName = safeName;
        networkClient.userId = makeBoundUserId(roomKey, safeUid);
        networkClient.isSpectator = !!spectator;

        spectatorMode.value = !!spectator;
        return { safeName, safeUid };
    };

    const postJoinSync = (spectatorFlag) => {
        mode.value = spectatorFlag ? 'spectator' : 'client';
        isHost.value = false;

        ensureMeExists();

        const me = users.value.find(u => u.id === networkClient.userId);
        if (me) me.isSpectator = spectatorFlag;

        networkClient.send({
            type: 'spectator_mode',
            data: {
                enabled: spectatorFlag,
                userId: networkClient.userId,
                userName: networkClient.userName
            }
        });

        networkClient.send({ type: 'request_pending_inputs', data: {} });
    };

    const connectOnline = async (roomId, pwd, name, uid, options = {}) => {
        const { isReconnect = false, spectator = false } = options;
        const spectatorFlag = isReconnect ? !!reconnectContext?.spectator : !!spectator;

        if (!isReconnect) {
            sessionEstablished = false;
            reconnectAttempt = 0;
        }

        manualDisconnect = false;
        reconnectContext = { roomId, pwd, name, uid, spectator: spectatorFlag };

        initNetwork(true);
        if (!isReconnect) switchRoomLogs(roomId);

        setClientIdentity({
            roomKey: roomId,
            name,
            uid,
            spectator: spectatorFlag
        });

        try {
            const wsUrl = await RoomApiService.verifyAndJoin(settings.onlineServer, roomId, pwd);
            await networkClient.connect(wsUrl, pwd);
            postJoinSync(spectatorFlag);
        } catch (e) {
            addLog('error', '系统', `${isReconnect ? '自动重连失败' : '连接失败'}: ${e.message}`);
            throw e;
        }
    };

    const startOfflineServer = async (port, pwd, name, uid) => {
        manualDisconnect = false;
        sessionEstablished = false;
        reconnectContext = null;
        reconnectAttempt = 0;

        const channelPort = String((port || '').toString().trim() || '2157');
        const roomKey = `local_${channelPort}`;

        initNetwork(false);
        switchRoomLogs(roomKey);

        const safeName = (name || '').trim() || '房主';
        setClientIdentity({
            roomKey,
            name: safeName,
            uid,
            spectator: false
        });

        try {
            await networkClient.startServer({
                port: channelPort,
                password: pwd || '',
                userName: safeName
            });

            mode.value = 'client';
            isHost.value = true;
        } catch (e) {
            addLog('error', '系统', `创建本地房间失败: ${e.message}`);
            throw e;
        }
    };

    const connectOffline = async (port, pwd, name, uid, options = {}) => {
        const spectatorFlag = !!options.spectator;

        manualDisconnect = false;
        sessionEstablished = false;
        reconnectContext = null;
        reconnectAttempt = 0;

        const channelPort = String((port || '').toString().trim() || '2157');
        const roomKey = `local_${channelPort}`;

        initNetwork(false);
        switchRoomLogs(roomKey);

        const { safeName } = setClientIdentity({
            roomKey,
            name,
            uid,
            spectator: spectatorFlag
        });

        try {
            await networkClient.connect(channelPort, pwd || '', safeName, spectatorFlag);
            postJoinSync(spectatorFlag);
        } catch (e) {
            addLog('error', '系统', `本地连接失败: ${e.message}`);
            throw e;
        }
    };

    const disconnect = () => {
        manualDisconnect = true;
        sessionEstablished = false;
        reconnectContext = null;
        reconnectAttempt = 0;
        clearReconnectTimer();

        setHiddenRerollContext('');

        if (timeoutTimer) {
            clearTimeout(timeoutTimer);
            timeoutTimer = null;
        }

        isConnected.value = false;
        mode.value = 'disconnected';
        isHost.value = false;
        users.value = [];
        clearPendingInputs();
        currentRoomId.value = '';
        chatLogs.value = [];
        transientSystemLogs.value = [];
        networkClient?.disconnect();
    };

    const revokeMyInput = () => {
        if (!networkClient || !isConnected.value) return;

        const myId = networkClient.userId;
        if (!pendingInputs.value.has(myId)) return;

        pendingInputs.value.delete(myId);
        touchPendingInputs();

        networkClient.broadcast({
            type: 'revoke_input',
            data: {}
        });
    };

    const setSpectatorMode = (enabled) => {
        const next = !!enabled;

        // 房主禁止切到观众
        if (isHost.value && next) {
            spectatorMode.value = false;
            addLog('error', '系统', '房主不可切换为观众模式');
            return { ok: false, reason: 'host_forbidden' };
        }

        spectatorMode.value = next;

        if (!networkClient) {
            return { ok: true };
        }

        networkClient.isSpectator = next;

        const me = users.value.find(u => u.id === networkClient.userId);
        if (me) me.isSpectator = next;

        if (!isConnected.value) {
            return { ok: true };
        }

        if (next && pendingInputs.value.has(networkClient.userId)) {
            pendingInputs.value.delete(networkClient.userId);
            touchPendingInputs();
            networkClient.broadcast({ type: 'revoke_input', data: {} });
        }

        networkClient.broadcast({
            type: 'spectator_mode',
            data: {
                enabled: next,
                userId: networkClient.userId,
                userName: networkClient.userName
            }
        });

        mode.value = next ? 'spectator' : 'client';
        return { ok: true };
    };

    return {
        isConnected,
        mode,
        isHost,
        users,
        chatLogs,
        pendingInputs,
        pendingInputsVersion,
        pendingPersonas,
        settings,
        acuSyncState,
        variableMode,
        spectatorMode,
        addLog,
        initNetwork,
        connectOnline,
        connectOffline,
        startOfflineServer,
        submitToAI,
        clearPendingInputs,
        revokeMyInput,
        setSpectatorMode,
        renameSelf,
        disconnect,
        pruneRoomLogsByExistingRoomIds,
        currentRoomId,
        getHiddenRerollContext,
        getClient: () => networkClient
    };
});


// ==========================================
// 5. 数据库 
// ==========================================
const initACUSync = (store) => {
    const getWin = () => window.top || window.parent || window;
    const getApi = () => getWin().AutoCardUpdaterAPI || null;
    const ACU_REGISTER_GUARD_KEY = '__st_multiplayer_acu_callback_registered_v1__';
    const ACU_REGISTERED_CALLBACK_KEY = '__st_multiplayer_acu_registered_callback_v1__';

    let retry = 0;
    let debounceTimer = null;

    // 模板恢复状态
    let hasTemplateBackup = false;
    let originalTemplateBackup = null;
    let templateOverriddenBySync = false;
    let restoringTemplate = false;

    const deepClone = (obj) => {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return null;
        }
    };

    const sanitizeTableData = (raw) => {
        const src = (raw && typeof raw === 'object') ? raw : {};
        const out = {};

        const mate = (src.mate && typeof src.mate === 'object')
            ? deepClone(src.mate)
            : { type: 'chatSheets', version: 1 };

        out.mate = mate || { type: 'chatSheets', version: 1 };

        Object.keys(src).forEach((k) => {
            if (k.startsWith('sheet_')) {
                out[k] = deepClone(src[k]);
            }
        });

        return out;
    };

    const hasAnySheet = (data) => {
        return !!Object.keys(data || {}).find(k => k.startsWith('sheet_'));
    };

    const backupOriginalTemplateIfNeeded = () => {
        if (hasTemplateBackup) return;

        const api = getApi();
        if (!api?.getTableTemplate) return;

        const current = api.getTableTemplate();
        originalTemplateBackup = current ? deepClone(current) : null;
        hasTemplateBackup = true;
    };

    const restoreOriginalTemplateIfNeeded = async (reason = 'disconnect') => {
        if (!templateOverriddenBySync || restoringTemplate) return;

        const api = getApi();
        if (!api) return;

        restoringTemplate = true;
        try {
            if (originalTemplateBackup && api.importTemplateFromData) {
                const ret = await api.importTemplateFromData(originalTemplateBackup);
                if (!ret?.success) {
                    store.addLog('error', '系统', `恢复原模板失败: ${ret?.message || '未知错误'}`);
                    return;
                }
            } else if (!originalTemplateBackup && api.resetTemplate) {
                await api.resetTemplate();
            }

            store.addLog('chat', '系统', `已恢复本地模板（${reason}）`);
            templateOverriddenBySync = false;
            hasTemplateBackup = false;
            originalTemplateBackup = null;
        } catch (e) {
            store.addLog('error', '系统', `恢复原模板失败: ${e?.message || e}`);
        } finally {
            restoringTemplate = false;
        }
    };

    const extractACUData = () => {
        const api = getApi();
        if (!api?.exportTableAsJson) return null;

        const tableJson = api.exportTableAsJson();
        const tables = sanitizeTableData(tableJson);

        if (!hasAnySheet(tables)) return null;

        const currentTemplate = api.getTableTemplate ? deepClone(api.getTableTemplate()) : null;

        // isolationKey 仅用于状态展示/兼容
        const chat = getWin().SillyTavern?.getContext?.()?.chat || [];
        let isoKey = '';
        for (let i = chat.length - 1; i >= 0; i--) {
            const msg = chat[i] || {};
            if (msg.TavernDB_ACU_IsolatedData) {
                const keys = Object.keys(msg.TavernDB_ACU_IsolatedData);
                if (keys.length > 0) {
                    isoKey = keys[0];
                    break;
                }
            }
            if (msg.TavernDB_ACU_Identity !== undefined) {
                isoKey = msg.TavernDB_ACU_Identity || '';
                break;
            }
        }

        return {
            isolationKey: isoKey,
            tables,
            template: currentTemplate,
            modifiedKeys: Object.keys(tables).filter(k => k.startsWith('sheet_'))
        };
    };

    const importTemplateIfProvided = async (template) => {
        if (!template || typeof template !== 'object') return;

        const api = getApi();
        if (!api?.importTemplateFromData) return;

        backupOriginalTemplateIfNeeded();

        const ret = await api.importTemplateFromData(template);
        if (!ret?.success) {
            throw new Error(ret?.message || '模板导入失败');
        }

        templateOverriddenBySync = true;
    };

    const importTablesIfProvided = async (tables) => {
        if (!tables || typeof tables !== 'object') return;

        const api = getApi();
        if (!api?.importTableAsJson) return;

        const sanitized = sanitizeTableData(tables);
        if (!hasAnySheet(sanitized)) return;

        const ok = await api.importTableAsJson(JSON.stringify(sanitized));
        if (ok === false) {
            throw new Error('表格数据导入失败');
        }
    };

    const register = () => {
        const api = getApi();

        if (!api?.registerTableUpdateCallback) {
            if (++retry < 20) setTimeout(register, 3000);
            return;
        }

        const win = getWin();

        const oldCb = win[ACU_REGISTERED_CALLBACK_KEY];
        if (oldCb && typeof api.unregisterTableUpdateCallback === 'function') {
            try {
                api.unregisterTableUpdateCallback(oldCb);
            } catch (e) {}
        }

        const cb = () => {
            if (store.isConnected && store.isHost) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    const data = extractACUData();
                    if (!data) return;

                    const shouldFull = !store.acuSyncState.fullSynced;
                    const payload = shouldFull
                        ? data
                        : {
                            isolationKey: data.isolationKey,
                            tables: data.tables,
                            modifiedKeys: data.modifiedKeys
                        };

                    store.getClient()?.broadcast({
                        type: shouldFull ? 'acu_full_sync' : 'acu_delta_sync',
                        data: payload
                    });

                    if (shouldFull) {
                        store.acuSyncState.fullSynced = true;
                        store.acuSyncState.lastSyncTimestamp = Date.now();
                        store.acuSyncState.isolationKey = data.isolationKey || '';
                    }
                }, 3000);
            }
        };

        api.registerTableUpdateCallback(cb);
        win[ACU_REGISTERED_CALLBACK_KEY] = cb;
        win[ACU_REGISTER_GUARD_KEY] = true;
    };

    onEventTracked('multiplayer_acu_full_sync', async (payload) => {
        if (store.isHost) return;

        try {
            await importTemplateIfProvided(payload?.template);
            await importTablesIfProvided(payload?.tables);
        } catch (e) {
            store.addLog('error', '系统', `同步数据库失败: ${e?.message || e}`);
        }
    });

    onEventTracked('multiplayer_acu_delta_sync', async (payload) => {
        if (store.isHost) return;

        try {
            if (payload?.template) {
                await importTemplateIfProvided(payload.template);
            }
            await importTablesIfProvided(payload?.tables);
        } catch (e) {
            store.addLog('error', '系统', `增量同步数据库失败: ${e?.message || e}`);
        }
    });

    watch(
        () => store.isConnected,
        (connected) => {
            if (!connected) {
                store.acuSyncState.fullSynced = false;
                store.acuSyncState.lastSyncTimestamp = 0;
                store.acuSyncState.isolationKey = '';
                restoreOriginalTemplateIfNeeded('退出房间');
            }
        }
    );

    register();
};

// ==========================================
// 6. 剧透遮罩渲染 
// ==========================================
const initSpoilerEngine = () => {
    const targetDoc = parentWindow.document;
    const ua = parentWindow.navigator?.userAgent || '';
    const deviceMemory = Number(parentWindow.navigator?.deviceMemory || 8);
    const hardwareConcurrency = Number(parentWindow.navigator?.hardwareConcurrency || 8);
    const isLowPerfDevice =
        /Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(ua) ||
        deviceMemory <= 4 ||
        hardwareConcurrency <= 4;

    const process = (root) => {
        if (!root || root.dataset?.mpSpoilerScanned === '1') return;

        const walker = targetDoc.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        const nodes = [];
        while (walker.nextNode()) {
            if (walker.currentNode.textContent.includes('||')) nodes.push(walker.currentNode);
        }

        nodes.forEach(node => {
            const text = node.textContent;
            const regex = /\|\|(.+?)\|\|/g;

            if (regex.test(text)) {
                const frag = targetDoc.createDocumentFragment();
                let match;
                let last = 0;
                regex.lastIndex = 0;

                while ((match = regex.exec(text)) !== null) {
                    if (match.index > last) {
                        frag.appendChild(targetDoc.createTextNode(text.slice(last, match.index)));
                    }
                    const span = targetDoc.createElement('span');
                    span.className = 'mp-spoiler';
                    span.textContent = match[1];
                    span.onclick = function() { this.classList.toggle('revealed'); };
                    frag.appendChild(span);
                    last = match.index + match[0].length;
                }

                if (last < text.length) {
                    frag.appendChild(targetDoc.createTextNode(text.slice(last)));
                }

                node.parentNode?.replaceChild(frag, node);
            }
        });

        if (root.dataset) root.dataset.mpSpoilerScanned = '1';
    };

    const handler = (mesId) => setTimeout(() => {
        const el = targetDoc.querySelector(`[mesid="${mesId}"] .mes_text`);
        if (el) process(el);
    }, 50);

    onEventTracked(tavern_events.USER_MESSAGE_RENDERED, handler);
    onEventTracked(tavern_events.CHARACTER_MESSAGE_RENDERED, handler);

    const processInChunks = (elements, chunkSize = 8) => {
        let i = 0;
        const run = () => {
            const end = Math.min(i + chunkSize, elements.length);
            for (; i < end; i++) process(elements[i]);
            if (i < elements.length) {
                setTimeout(run, 16);
            }
        };
        run();
    };

    setTimeout(() => {
        const all = Array.from(targetDoc.querySelectorAll('.mes_text'));
        const seed = isLowPerfDevice ? all.slice(-20) : all;
        processInChunks(seed, isLowPerfDevice ? 4 : 10);
    }, 1000);
};

// ==========================================
// 7. ST 原生事件桥接 
// ==========================================
const initSTHooks = (store) => {
    let streamMsgId = null; // 客户端当前流式消息 ID
    let lastDeleteTrackId = getLastMessageId(); // 删除追踪

    // 房主端流标识
    let hostStreamId = '';
    let hostStreamSeq = 0;
    let hostAiResponseSent = false;
    let hostLastAiResponseContent = '';

    // 客户端端流状态
    let clientActiveStreamId = '';
    let clientLastSeq = 0;

    // 串行化消息写入，避免 create/set 并发竞态
    let streamQueue = Promise.resolve();
    const enqueueStreamTask = (task) => {
        streamQueue = streamQueue
            .then(() => task())
            .catch((e) => {
                console.error('[联机Mod] 流式任务失败:', e);
            });
        return streamQueue;
    };

    // 历史同步去重：sourceIndex -> { fingerprint, localMessageId }
    const historySyncIndexMap = new Map();

    // ---- 正则同步：范围解析 + 备份/回滚 ----
    const REGEX_SCOPE_ALIASES = Object.freeze({
        character: ['character']
    });

    const normalizeRegexScopeKey = (scope) => {
        return 'character';
    };

    const normalizeRegexScopeList = (scopes) => {
        const src = Array.isArray(scopes) ? scopes : ['character'];
        const set = new Set(src.map(normalizeRegexScopeKey));
        const ordered = ['character'];
        return ordered.filter(k => set.has(k));
    };

    const cloneRegexes = (regexes) => JSON.parse(JSON.stringify(regexes || []));

    const tryGetRegexesByScope = async (scopeKey) => {
        const key = normalizeRegexScopeKey(scopeKey);
        const candidates = REGEX_SCOPE_ALIASES[key] || [key];

        for (const apiScope of candidates) {
            try {
                const regexes = await Promise.resolve(getTavernRegexes({ scope: apiScope }));
                if (Array.isArray(regexes)) {
                    return { ok: true, apiScope, regexes };
                }
            } catch (e) {}
        }

        return { ok: false, apiScope: candidates[0] || key, regexes: [] };
    };

    const tryReplaceRegexesByScope = async (scopeKey, regexes, preferredApiScope = '') => {
        const key = normalizeRegexScopeKey(scopeKey);
        const alias = REGEX_SCOPE_ALIASES[key] || [key];
        const candidates = [preferredApiScope, ...alias].filter(Boolean);
        const uniqueCandidates = Array.from(new Set(candidates));

        let lastErr = null;
        for (const apiScope of uniqueCandidates) {
            try {
                await replaceTavernRegexes(regexes, { scope: apiScope });
                return apiScope;
            } catch (e) {
                lastErr = e;
            }
        }

        throw lastErr || new Error(`replaceTavernRegexes 失败: ${key}`);
    };

    const regexBackupMap = new Map();

    const ensureRegexBackup = async (scopeKey, fallbackApiScope = '') => {
        const key = normalizeRegexScopeKey(scopeKey);
        if (regexBackupMap.has(key)) return;

        const snap = await tryGetRegexesByScope(key);
        if (!snap.ok) return;

        regexBackupMap.set(key, {
            scopeKey: key,
            apiScope: fallbackApiScope || snap.apiScope || key,
            regexes: cloneRegexes(snap.regexes)
        });
    };

    const applyRegexSyncPacket = async (packet) => {
        const scopeKey = normalizeRegexScopeKey(packet?.scopeKey);
        const regexes = Array.isArray(packet?.regexes) ? packet.regexes : null;
        if (!regexes) return;

        await ensureRegexBackup(scopeKey, packet?.apiScope || '');
        await tryReplaceRegexesByScope(scopeKey, regexes, packet?.apiScope || '');
    };

    const rollbackRegexBackups = async (reason = 'disconnect') => {
        if (regexBackupMap.size === 0) return;

        const entries = Array.from(regexBackupMap.values());
        for (const item of entries) {
            try {
                await tryReplaceRegexesByScope(item.scopeKey, item.regexes, item.apiScope);
            } catch (e) {
                store.addLog('error', '系统', `回滚${item.scopeKey}正则失败: ${e?.message || e}`);
            }
        }

        regexBackupMap.clear();
        store.addLog('chat', '系统', `已回滚正则覆盖（${reason}）`);
    };

    let lastConnected = !!store.isConnected;
    watch(
        () => store.isConnected,
        (connected) => {
            if (lastConnected && !connected) {
                rollbackRegexBackups('连接断开');
            }
            if (!connected) {
                historySyncIndexMap.clear();
            }
            lastConnected = !!connected;
        }
    );

    watch(
        () => store.currentRoomId,
        () => {
            historySyncIndexMap.clear();
        }
    );

    // ---- 房主：广播流式 Token ----
    onEventTracked(tavern_events.STREAM_TOKEN_RECEIVED, (token) => {
        if (store.isHost && store.isConnected) {
            if (!hostStreamId) {
                hostStreamId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                hostStreamSeq = 0;
                hostAiResponseSent = false;
                hostLastAiResponseContent = '';
            }
            hostStreamSeq += 1;

            store.getClient()?.broadcast({
                type: 'ai_stream',
                data: {
                    streamId: hostStreamId,
                    seq: hostStreamSeq,
                    content: token
                }
            });
        }
    });

    // ---- 房主：广播完整 AI 回复 ----
    onEventTracked(tavern_events.MESSAGE_RECEIVED, (data) => {
        lastDeleteTrackId = getLastMessageId();
        if (!store.isHost || !store.isConnected) return;

        const msgs = getChatMessages(data);
        if (msgs.length > 0 && msgs[0].role === 'assistant') {
            if (!hostStreamId) {
                hostStreamId = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                hostStreamSeq = 0;
                hostAiResponseSent = false;
                hostLastAiResponseContent = '';
            }

            const doneStreamId = hostStreamId;
            const content = (msgs[0].message ?? '').toString();

            // 某些环境下 MESSAGE_RECEIVED 可能对同一条消息触发多次，避免反复广播正文
            if (hostAiResponseSent && hostLastAiResponseContent === content) return;

            store.getClient()?.broadcast({
                type: 'ai_response',
                data: {
                    streamId: doneStreamId,
                    content,
                    variableModes: Array.isArray(store.variableMode) ? store.variableMode : []
                }
            });

            hostAiResponseSent = true;
            hostLastAiResponseContent = content;
        }
    });

    // ---- 房主：消息发送后更新追踪 ID ----
    onEventTracked(tavern_events.MESSAGE_SENT, () => {
        lastDeleteTrackId = getLastMessageId();
    });

    // ---- 房主：检测删除最新消息并广播 ----
    onEventTracked(tavern_events.MESSAGE_DELETED, (id) => {
        if (store.isConnected && store.isHost) {
            if (id === lastDeleteTrackId) {
                store.getClient()?.broadcast({ type: 'delete_last_message', data: {} });
            }
            lastDeleteTrackId = getLastMessageId();
        }
    });

    // ---- 房主：AI 生成结束后同步 MVU 变量 ----
    onEventTracked(tavern_events.GENERATION_ENDED, () => {
        if (store.isConnected && store.isHost) {
            // 一轮生成结束：重置流标识，保证下一轮不会复用旧 streamId
            hostStreamId = '';
            hostStreamSeq = 0;
            hostAiResponseSent = false;
            hostLastAiResponseContent = '';
        }

        if (
            store.isConnected &&
            store.isHost &&
            Array.isArray(store.variableMode) &&
            store.variableMode.includes('mvu')
        ) {
            setTimeout(() => {
                const msgId = getLastMessageId();
                if (msgId < 0) return;
                try {
                    const vars = getVariables({ type: 'message', message_id: msgId });
                    if (vars && (vars.stat_data || vars.display_data)) {
                        store.getClient()?.broadcast({
                            type: 'sync_variables',
                            data: {
                                variableType: 'mvu',
                                content: {
                                    stat_data: vars.stat_data,
                                    display_data: vars.display_data,
                                    delta_data: vars.delta_data,
                                    schema: vars.schema
                                }
                            }
                        });
                    }
                } catch (e) { console.error('[联机Mod] MVU 自动同步失败:', e); }
            }, 500);
        }
    });

    // ---- 房主：注入联机玩家 Persona ----
    onEventTracked(tavern_events.GENERATION_AFTER_COMMANDS, () => {
        const personaMap = (() => {
            const pp = store.pendingPersonas;
            return (pp && typeof pp.has === 'function') ? pp : (pp?.value ?? new Map());
        })();

        if (store.isHost && personaMap.size > 0) {
            const combined = Array.from(personaMap.values())
                .map(p => `${p.prefix} ${p.content}`)
                .join('\n\n');
            injectPrompts([{
                id: 'mp_personas',
                position: 'in_chat',
                depth: 0,
                role: 'system',
                content: combined
            }], { once: true });
            personaMap.clear();
            try { triggerRef(store.pendingPersonas); } catch (e) {}
        }

        // 重roll补偿：隐藏模式输入不会保留在用户层消息中，这里在生成前补回系统层上下文
        const hiddenCtx = (store.getHiddenRerollContext?.() || '').toString().trim();
        if (store.isHost && hiddenCtx) {
            injectPrompts([{
                id: 'mp_hidden_inputs_reroll',
                position: 'in_chat',
                depth: 0,
                role: 'system',
                content: `以下为本轮隐藏模式输入，仅用于保持重roll一致性：\n\n${hiddenCtx}`
            }], { once: true });
        }
    });

    // ---- 客户端：接收流式 Token ----
    onEventTracked('multiplayer_ai_stream', (payload) => {
        if (store.isHost) return;

        enqueueStreamTask(async () => {
            const data = typeof payload === 'string'
                ? { content: payload, streamId: '', seq: 0 }
                : (payload || {});

            const token = (data.content ?? '').toString();
            const incomingStreamId = (data.streamId || '').toString();
            const incomingSeq = Number(data.seq || 0);

            // 新流：重置序列与消息引用
            if (incomingStreamId && incomingStreamId !== clientActiveStreamId) {
                clientActiveStreamId = incomingStreamId;
                clientLastSeq = 0;
                streamMsgId = null;
            }

            // 去重/乱序保护（有 seq 时生效）
            if (incomingSeq > 0) {
                if (incomingSeq <= clientLastSeq) return;
                clientLastSeq = incomingSeq;
            }

            if (streamMsgId === null) {
                await createChatMessages([{ role: 'assistant', message: token }]);
                streamMsgId = getLastMessageId();
            } else {
                await setChatMessages([{ message_id: streamMsgId, message: token }]);
            }
        });
    });

    // ---- 客户端：接收完整 AI 回复 ----
    onEventTracked('multiplayer_ai_response', (payload) => {
        if (store.isHost) return;

        enqueueStreamTask(async () => {
            try {
                const data = typeof payload === 'string'
                    ? { content: payload, streamId: '' }
                    : (payload || {});

                const content = (data.content ?? '').toString();
                const doneStreamId = (data.streamId || '').toString();

                let finalContent = content;
                if (
                    Array.isArray(store.variableMode) &&
                    store.variableMode.includes('mvu') &&
                    !content.includes('<StatusPlaceHolderImpl/>')
                ) {
                    finalContent = content + '\n\n<StatusPlaceHolderImpl/>';
                }

                if (doneStreamId && clientActiveStreamId && doneStreamId !== clientActiveStreamId) {
                    // 完整包属于新轮次，直接新建，避免覆盖旧流
                    streamMsgId = null;
                    clientActiveStreamId = doneStreamId;
                    clientLastSeq = 0;
                }

                if (streamMsgId !== null) {
                    await setChatMessages([{ message_id: streamMsgId, message: finalContent }]);
                } else {
                    await createChatMessages([{ role: 'assistant', message: finalContent }]);
                }

                streamMsgId = null;
                clientActiveStreamId = '';
                clientLastSeq = 0;

            } catch (e) {
                store.addLog('error', '系统', '同步AI回复失败');
                console.error('[联机Mod] 同步AI回复失败:', e);
            }
        });
    });

    // ---- 客户端：接收用户合并消息 ----
    const _seenUserMessageBatchIds = new Set();
    const _seenUserMessageBatchQueue = [];
    const rememberUserBatchId = (id) => {
        if (!id) return;
        if (_seenUserMessageBatchIds.has(id)) return;
        _seenUserMessageBatchIds.add(id);
        _seenUserMessageBatchQueue.push(id);
        if (_seenUserMessageBatchQueue.length > 50) {
            const drop = _seenUserMessageBatchQueue.shift();
            if (drop) _seenUserMessageBatchIds.delete(drop);
        }
    };

    onEventTracked('multiplayer_user_message', async (payload) => {
        if (store.isHost) return;

        try {
            const batchId = (payload?.batchId || '').toString();
            if (batchId && _seenUserMessageBatchIds.has(batchId)) return;
            rememberUserBatchId(batchId);

            let content = '';

            if (payload && Array.isArray(payload.inputs) && payload.inputs.length > 0) {
                content = payload.inputs
                    .map(item => {
                        const name = item.userName || '匿名';
                        const prefix = (item.prefix || '[{name}]:').replace('{name}', name);
                        return `${prefix} ${(item.content ?? '').toString()}`;
                    })
                    .join('\n\n');
            } else {
                content = (payload?.content ?? '').toString();
            }

            if (!content.trim()) {
                if (!payload?.userLayerHidden) {
                    store.addLog('error', '系统', '同步用户消息为空，已忽略');
                }
                return;
            }

            await createChatMessages([{ role: 'user', message: content }]);
        } catch (e) {
            store.addLog('error', '系统', '创建用户消息失败');
            console.error('[联机Mod] 创建用户消息失败:', e);
        }
    });

    // ---- 客户端：接收删除最新消息指令 ----
    onEventTracked('multiplayer_delete_last_message', async () => {
        if (store.isHost) return;
        try {
            const lastId = getLastMessageId();
            if (lastId >= 0) {
                await deleteChatMessages([lastId]);
            }
        } catch (e) {
            store.addLog('error', '系统', '删除消息失败');
            console.error('[联机Mod] 删除消息失败:', e);
        }
    });

    // ---- 房主：处理历史同步请求 ----
    onEventTracked('multiplayer_sync_history_request', async (payload) => {
        if (!store.isHost) return;

        const safePayload = payload ?? {};
        let userId = '';
        let depth = 0;

        if (typeof safePayload === 'string') {
            userId = safePayload;
        } else {
            userId = (safePayload.userId || '').toString();
            const d = Number(safePayload.depth);
            depth = Number.isFinite(d) && d >= 0 ? Math.floor(d) : 0;
        }

        try {
            const lastId = getLastMessageId();
            if (lastId < 0) return;

            let startId = 0;
            if (depth > 0 && lastId >= depth) {
                startId = lastId - depth + 1;
            }

            const messages = getChatMessages(`${startId}-${lastId}`).map((m, idx) => ({
                role: m.role,
                message: m.message,
                sourceIndex: startId + idx
            }));

            const client = store.getClient();
            for (const msg of messages) {
                client?.send({
                    type: 'sync_history_data',
                    data: {
                        role: msg.role,
                        message: msg.message,
                        sourceIndex: msg.sourceIndex,
                        targetUserId: userId
                    }
                });
            }

            client?.send({
                type: 'sync_history_data',
                data: {
                    complete: true,
                    count: messages.length,
                    targetUserId: userId
                }
            });
        } catch (e) {
            store.addLog('error', '系统', '获取历史消息失败');
            console.error('[联机Mod] 获取历史消息失败:', e);
        }
    });

    // ---- 客户端：接收历史消息数据 ----
    onEventTracked('multiplayer_sync_history_data', async (data) => {
        if (store.isHost) return;

        const myId = (store.getClient()?.userId || '').toString();
        const targetUserId = (data?.targetUserId || '').toString();

        if (targetUserId && targetUserId !== myId) return;

        try {
            if (data?.complete) {
                eventEmit('multiplayer_sync_history_result', {
                    ok: true,
                    count: Number(data?.count || 0)
                });
                return;
            }

            if (data?.role && Object.prototype.hasOwnProperty.call(data, 'message')) {
                const role = data.role;
                const message = (data.message ?? '').toString();
                const sourceIndexNum = Number(data?.sourceIndex);
                const hasSourceIndex = Number.isFinite(sourceIndexNum);

                const fingerprint = `${role}\u0000${message}`;

                if (hasSourceIndex) {
                    const hit = historySyncIndexMap.get(sourceIndexNum);

                    if (hit?.fingerprint === fingerprint) {
                        return;
                    }

                    if (hit && Number.isFinite(hit.localMessageId) && hit.localMessageId >= 0) {
                        await setChatMessages([{ message_id: hit.localMessageId, message }]);
                        historySyncIndexMap.set(sourceIndexNum, {
                            fingerprint,
                            localMessageId: hit.localMessageId
                        });
                        return;
                    }
                }

                await createChatMessages([{ role, message }]);
                const localMessageId = getLastMessageId();

                if (hasSourceIndex && localMessageId >= 0) {
                    historySyncIndexMap.set(sourceIndexNum, {
                        fingerprint,
                        localMessageId
                    });
                }
            }
        } catch (e) {
            store.addLog('error', '系统', '创建历史消息失败');
            eventEmit('multiplayer_sync_history_result', {
                ok: false,
                message: '创建历史消息失败'
            });
            console.error('[联机Mod] 创建历史消息失败:', e);
        }
    });

    // ---- 房主：处理正则同步请求 ----
    onEventTracked('multiplayer_sync_regex_request', async (payload) => {
        if (!store.isHost) return;

        const userId = (payload?.userId || payload || '').toString();
        const scopes = normalizeRegexScopeList(payload?.scopes);

        try {
            const packs = [];

            for (const scopeKey of scopes) {
                const snap = await tryGetRegexesByScope(scopeKey);
                if (!snap.ok) continue;

                packs.push({
                    scopeKey,
                    apiScope: snap.apiScope,
                    regexes: cloneRegexes(snap.regexes)
                });
            }

            if (packs.length === 0) {
                store.addLog('error', '系统', '未获取到可同步的正则数据');
                return;
            }

            store.getClient()?.send({
                type: 'sync_regex_data',
                data: {
                    packs,
                    targetUserId: userId
                }
            });
        } catch (e) {
            store.addLog('error', '系统', '获取正则失败');
            console.error('[联机Mod] 获取正则失败:', e);
        }
    });

    // ---- 客户端：接收正则数据 ----
    onEventTracked('multiplayer_sync_regex_data', async (data) => {
        if (store.isHost) return;

        const myId = (store.getClient()?.userId || '').toString();
        const targetUserId = (data?.targetUserId || '').toString();

        if (targetUserId && targetUserId !== myId) return;

        try {
            if (Array.isArray(data?.packs) && data.packs.length > 0) {
                for (const packet of data.packs) {
                    await applyRegexSyncPacket(packet);
                }
                eventEmit('multiplayer_sync_regex_result', { ok: true });
                return;
            }

            const regexes = Array.isArray(data?.regexes) ? data.regexes : null;
            if (regexes) {
                await applyRegexSyncPacket({
                    scopeKey: data?.scopeKey || 'character',
                    apiScope: data?.apiScope || 'character',
                    regexes
                });
                eventEmit('multiplayer_sync_regex_result', { ok: true });
                return;
            }

            eventEmit('multiplayer_sync_regex_result', {
                ok: false,
                message: '未收到可用的正则数据'
            });
        } catch (e) {
            store.addLog('error', '系统', '替换正则失败');
            eventEmit('multiplayer_sync_regex_result', {
                ok: false,
                message: e?.message || '替换正则失败'
            });
            console.error('[联机Mod] 替换正则失败:', e);
        }
    });

    // ---- 房主：处理变量同步请求 ----
    onEventTracked('multiplayer_sync_variables_request', async (payload) => {
        if (!store.isHost) return;

        const userId = (payload?.userId || '').toString();
        const reqRaw = payload?.variableModes ?? [];
        const reqModes = Array.isArray(reqRaw)
            ? reqRaw.map(x => String(x || '').trim().toLowerCase())
            : [String(reqRaw || '').trim().toLowerCase()];

        const picked = new Set(reqModes.filter(Boolean));
        const client = store.getClient();

        try {
            if (picked.has('mvu')) {
                const msgId = getLastMessageId();
                if (msgId < 0) {
                    client?.send({
                        type: 'sync_variables',
                        data: {
                            variableType: 'mvu',
                            content: { error: '无消息ID' },
                            targetUserId: userId
                        }
                    });
                } else {
                    const vars = getVariables({ type: 'message', message_id: msgId });
                    if (!vars || (!vars.stat_data && !vars.display_data && !vars.delta_data)) {
                        client?.send({
                            type: 'sync_variables',
                            data: {
                                variableType: 'mvu',
                                content: { error: '无MVU变量' },
                                targetUserId: userId
                            }
                        });
                    } else {
                        client?.send({
                            type: 'sync_variables',
                            data: {
                                variableType: 'mvu',
                                content: {
                                    stat_data: vars.stat_data,
                                    display_data: vars.display_data,
                                    delta_data: vars.delta_data,
                                    schema: vars.schema
                                },
                                targetUserId: userId
                            }
                        });
                    }
                }
            }

            if (picked.has('apotheosis')) {
                const api = parentWindow.AutoCardUpdaterAPI;

                if (!api?.exportTableAsJson) {
                    client?.send({
                        type: 'sync_variables',
                        data: {
                            variableType: 'apotheosis',
                            content: { error: '数据库API不可用（缺少 exportTableAsJson）' },
                            targetUserId: userId
                        }
                    });
                } else {
                    const deepClone = (obj) => {
                        try {
                            return JSON.parse(JSON.stringify(obj));
                        } catch (e) {
                            return null;
                        }
                    };

                    const sanitizeTables = (raw) => {
                        const src = (raw && typeof raw === 'object') ? raw : {};
                        const out = {};
                        const mate = (src.mate && typeof src.mate === 'object')
                            ? deepClone(src.mate)
                            : { type: 'chatSheets', version: 1 };

                        out.mate = mate || { type: 'chatSheets', version: 1 };

                        Object.keys(src).forEach((k) => {
                            if (k.startsWith('sheet_')) {
                                out[k] = deepClone(src[k]);
                            }
                        });

                        return out;
                    };

                    const rawTables = api.exportTableAsJson();
                    const tables = sanitizeTables(rawTables);
                    const hasSheet = Object.keys(tables).some((k) => k.startsWith('sheet_'));
                    const template = api.getTableTemplate ? deepClone(api.getTableTemplate()) : null;

                    if (!hasSheet) {
                        client?.send({
                            type: 'sync_variables',
                            data: {
                                variableType: 'apotheosis',
                                content: { error: '无数据库变量' },
                                targetUserId: userId
                            }
                        });
                    } else {
                        client?.broadcast({
                            type: 'acu_full_sync',
                            data: {
                                isolationKey: '',
                                tables,
                                template
                            }
                        });

                        store.acuSyncState.fullSynced = true;
                        store.acuSyncState.lastSyncTimestamp = Date.now();
                        store.acuSyncState.isolationKey = '';
                    }
                }
            }

            if (!picked.has('mvu') && !picked.has('apotheosis')) {
                client?.send({
                    type: 'sync_variables',
                    data: {
                        variableType: 'unknown',
                        content: { error: '未选择变量模式' },
                        targetUserId: userId
                    }
                });
            }
        } catch (e) {
            store.addLog('error', '系统', `变量同步失败: ${e.message}`);
            console.error('[联机Mod] 变量同步失败:', e);
        }
    });

    // ---- 客户端：接收变量同步数据 ----
    onEventTracked('multiplayer_sync_variables', async (payload) => {
        if (store.isHost) return;

        const variableType = payload?.variableType;
        const content = payload?.content;

        try {
            if (!content) {
                return;
            }

            if (content?.error) {
                store.addLog('error', '系统', `同步变量失败: ${content.error}`);
                eventEmit('multiplayer_sync_variables_result', {
                    ok: false,
                    message: content.error
                });
                return;
            }

            if (variableType === 'mvu') {
                const msgId = getLastMessageId();
                if (msgId >= 0) {
                    await updateVariablesWith((v) => {
                        if (content.stat_data) v.stat_data = content.stat_data;
                        if (content.display_data) v.display_data = content.display_data;
                        if (content.delta_data) v.delta_data = content.delta_data;
                        if (content.schema) v.schema = content.schema;
                        return v;
                    }, { type: 'message', message_id: msgId });
                }
            }

            eventEmit('multiplayer_sync_variables_result', { ok: true });
        } catch (e) {
            store.addLog('error', '系统', `变量同步失败: ${e.message}`);
            eventEmit('multiplayer_sync_variables_result', {
                ok: false,
                message: e?.message || '变量同步失败'
            });
            console.error('[联机Mod] 变量同步失败:', e);
        }
    });
};

// ==========================================
// 8. Vue 界面组件 (UI)
// ==========================================

const MultiplayerPanel = defineComponent({
    setup() {
        const store = useMultiplayerStore();

        const UI_TOKENS = Object.freeze({
            panelStartOffset: 20,
            panelFallbackWidth: 320,
            panelFallbackHeight: 44
        });

        const px = (n) => `${n}px`;
        const isMinimized = ref(true);
        const showSettings = ref(false);
        const isDragging = ref(false);
        const panelRef = ref(null);

        const settingsTab = ref('general');
        const SETTINGS_TAB_OPTIONS = Object.freeze([
            { value: 'general', label: '通用' },
            { value: 'host', label: '房主' },
            { value: 'player', label: '玩家' }
        ]);

        // 不再在 render 中绑定 style，改为 DOM 定位写入
        const panelPos = reactive({
            left: UI_TOKENS.panelStartOffset,
            top: UI_TOKENS.panelStartOffset + 20
        });

        const applyPanelPos = () => {
            const el = panelRef.value;
            if (!el) return;
            el.style.left = px(panelPos.left);
            el.style.top = px(panelPos.top);
        };

        let dragOffset = { x: 0, y: 0 };
        const DRAG_TAP_THRESHOLD = 6;
        let dragStartPoint = { x: 0, y: 0 };
        let dragMoved = false;

        const userName = ref(store.settings.defaultUserName || '');
        const offlinePort = ref('2157');
        const offlinePassword = ref('');
        const myInput = ref('');
        const chatMsg = ref('');
        const logsRef = ref(null);

        const joinPwdShake = ref(false);
        const offlinePwdShake = ref(false);

        const isPasswordError = (err) => {
            const msg = (err && err.message) ? err.message : (err || '');
            return /密码|password/i.test(String(msg));
        };

        const triggerInputShake = (flagRef) => {
            flagRef.value = false;
            requestAnimationFrame(() => {
                flagRef.value = true;
                setTimeout(() => { flagRef.value = false; }, 360);
            });
        };

        const syncState = reactive({
            history: false,
            regex: false,
            variables: false
        });
        const syncTimers = new Map();
        const SYNC_TIMEOUT_MS = 12000;

        const clearSyncTimer = (type) => {
            const t = syncTimers.get(type);
            if (t) {
                clearTimeout(t);
                syncTimers.delete(type);
            }
        };

        const startSync = (type, label) => {
            syncState[type] = true;
            clearSyncTimer(type);
            const timer = setTimeout(() => {
                finishSync(type, false, `${label}超时，请检查网络后重试`);
            }, SYNC_TIMEOUT_MS);
            syncTimers.set(type, timer);
        };

        const finishSync = (type, ok, message) => {
            clearSyncTimer(type);
            syncState[type] = false;

            const _toastr = parentWindow.toastr || window.toastr;
            if (ok) {
                _toastr?.success(message);
                store.addLog('chat', '系统', message);
            } else {
                _toastr?.error(message);
                store.addLog('error', '系统', message);
            }
        };

        // 在线房间相关
        const onlineRooms = ref([]);
        const isLoadingRooms = ref(false);
        const isJoining = ref(false);
        const isCreating = ref(false);

        const selectedRoom = ref(null);
        const joinPassword = ref('');
        const newRoomName = ref('');
        const newRoomPassword = ref('');
        const newRoomMaxUsers = ref(8);

        const normalizeRoomName = (name = '') => name.trim().toLowerCase();

        const displayRooms = computed(() => {
            const map = new Map();
            for (const room of onlineRooms.value) {
                const key = normalizeRoomName(room?.name || '');
                if (!key) continue;
                if (!map.has(key)) map.set(key, room);
            }
            return Array.from(map.values());
        });

        const toSafeInt = (v) => {
            const n = Number(v);
            return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
        };

        const getRoomDisplayCurrentUsers = (room = {}) => {
            const explicitTotal = toSafeInt(
                room.totalUsers ??
                room.totalCount ??
                room.onlineCount
            );

            if (explicitTotal > 0) return explicitTotal;

            const players = toSafeInt(
                room.currentUsers ??
                room.currentUserCount ??
                room.playerCount ??
                room.players
            );

            const spectators = toSafeInt(
                room.spectatorCount ??
                room.spectators ??
                room.observerCount ??
                room.watchers ??
                room.audienceCount
            );

            return players + spectators;
        };

        const fetchRooms = async () => {
            if (!store.settings.onlineMode) return;
            isLoadingRooms.value = true;
            try {
                onlineRooms.value = await RoomApiService.fetchRooms(store.settings.onlineServer);
                store.pruneRoomLogsByExistingRoomIds((onlineRooms.value || []).map(r => r.id));
            } catch (e) {
                store.addLog('error', '系统', '获取房间列表失败: ' + e.message);
            } finally {
                isLoadingRooms.value = false;
            }
        };

        const selectRoom = (room) => {
            selectedRoom.value = room.id;
            joinPassword.value = '';
        };

        const joinSelectedRoom = async (asSpectator = false) => {
            if (!selectedRoom.value || isJoining.value) return;

            const safeName = (userName.value || '').trim();
            if (!safeName) {
                const _toastr = parentWindow.toastr || window.toastr;
                _toastr?.error('请输入用户名');
                return;
            }

            isJoining.value = true;
            try {
                store.settings.defaultUserName = safeName;
                await store.connectOnline(
                    selectedRoom.value,
                    joinPassword.value || '',
                    safeName,
                    localSettings.clientUid,
                    { spectator: asSpectator }
                );
            } catch (e) {
                console.error(e);
                if (isPasswordError(e)) {
                    triggerInputShake(joinPwdShake);
                }
            } finally {
                isJoining.value = false;
            }
        };

        const createAndJoinRoom = async () => {
            if (isCreating.value) return;

            const roomName = newRoomName.value.trim();
            const creatorName = (userName.value || '').trim() || '匿名';
            if (!roomName) return;

            const duplicated = displayRooms.value.some(
                r => normalizeRoomName(r.name) === normalizeRoomName(roomName)
            );
            if (duplicated) {
                const _toastr = parentWindow.toastr || window.toastr;
                _toastr?.error('房间名已存在，请换一个');
                return;
            }

            isCreating.value = true;
            try {
                store.settings.defaultUserName = creatorName;
                const room = await RoomApiService.createRoom(store.settings.onlineServer, {
                    name: roomName,
                    password: newRoomPassword.value || undefined,
                    maxUsers: newRoomMaxUsers.value || 8,
                    creatorName
                });

                if (room?.id) {
                    await store.connectOnline(
                        room.id,
                        newRoomPassword.value || '',
                        creatorName,
                        localSettings.clientUid
                    );
                }
            } catch (e) {
                console.error(e);
            } finally {
                isCreating.value = false;
            }
        };

        if (store.settings.onlineMode) fetchRooms();

        const syncCurrentRoomCreatorName = () => {
            const roomId = (store.currentRoomId || '').toString().trim();
            if (!roomId || !Array.isArray(onlineRooms.value) || onlineRooms.value.length === 0) return;

            const hostUser = store.users.find(u => !!u.isHost);
            const hostName = (hostUser?.name || '').trim();
            if (!hostName) return;

            onlineRooms.value = onlineRooms.value.map(room => {
                if (room.id !== roomId) return room;
                if ((room.creatorName || '') === hostName) return room;
                return { ...room, creatorName: hostName };
            });
        };

        watch(
            () => store.users.map(u => `${u.id}|${u.name}|${u.isHost}`).join(';'),
            () => syncCurrentRoomCreatorName()
        );

        watch(
            () => store.currentRoomId,
            () => syncCurrentRoomCreatorName()
        );

        const getPendingMap = () => {
            const pi = store.pendingInputs;
            return (pi && typeof pi.has === 'function') ? pi : (pi?.value ?? new Map());
        };

        const hasSubmitted = (userId) => getPendingMap().has(userId);

        const mySubmitted = computed(() => {
            const _v = store.pendingInputsVersion;
            const client = store.getClient();
            if (!client) return false;
            return getPendingMap().has(client.userId);
        });

        const myClientId = computed(() => store.getClient()?.userId || '');

        const getJoinOrder = (u, idx = 0) => Number.isFinite(u?._joinOrder) ? u._joinOrder : (idx + 1);

        const onlineUsers = computed(() => {
            return store.users
                .filter(u => !u.isSpectator)
                .slice()
                .sort((a, b) => {
                    if (!!a.isHost !== !!b.isHost) return a.isHost ? -1 : 1;
                    return getJoinOrder(a) - getJoinOrder(b);
                });
        });

        const spectators = computed(() => {
            return store.users
                .filter(u => !!u.isSpectator)
                .slice()
                .sort((a, b) => getJoinOrder(a) - getJoinOrder(b));
        });

        const spectatorsCollapsed = ref(true);
        const toggleSpectatorsCollapsed = () => {
            spectatorsCollapsed.value = !spectatorsCollapsed.value;
        };

        const userCount = computed(() => onlineUsers.value.length);

        const submittedCount = computed(() => {
            const _v = store.pendingInputsVersion;
            let count = 0;
            for (const [uid] of getPendingMap().entries()) {
                const u = store.users.find(x => x.id === uid);
                if (u && !u.isSpectator) count++;
            }
            return count;
        });

        const allSubmitted = computed(() => {
            const _v = store.pendingInputsVersion;
            return userCount.value > 0 && submittedCount.value >= userCount.value;
        });

        const sendChat = () => {
            if (!chatMsg.value.trim() || !store.getClient()) return;
            store.getClient().send({ type: 'chat', data: { content: chatMsg.value.trim() } });
            store.addLog('chat', userName.value || '我', chatMsg.value.trim());
            chatMsg.value = '';
        };

        const sendInput = () => {
            if (store.spectatorMode) return;
            if (!myInput.value.trim() || !store.getClient()) return;

            const prefix = applyNameToken(localSettings.messagePrefix || '[{name}]:');

            if (localSettings.sendUserPersona) {
                const personaRaw = getPersonaContentRaw();
                if (personaRaw) {
                    store.getClient().send({
                        type: 'user_persona',
                        data: {
                            content: personaRaw,
                            prefix: applyNameToken(localSettings.personaPrefix || '[{name}]的设定:')
                        }
                    });
                }
            }

            store.getClient().send({
                type: 'user_input',
                data: {
                    content: myInput.value,
                    messagePrefix: prefix,
                    messageSuffix: localSettings.messageSuffix || '',
                    hideContent: !!localSettings.hideUserInputContent
                }
            });

            myInput.value = '';
        };

        const revokeInput = () => {
            const client = store.getClient();
            if (!client) return;

            const mine = getPendingMap().get(client.userId);
            if (mine?.content) {
                myInput.value = String(mine.content);
            }

            store.revokeMyInput();
        };

        const submitToAI = async () => {
            await store.submitToAI();
            myInput.value = '';
        };

        const resetInputs = () => {
            store.clearPendingInputs();
            store.getClient()?.broadcast({ type: 'reset_input', data: {} });
            myInput.value = '';
        };

        const requestSyncHistory = () => {
            try {
                if (!store.isConnected) {
                    finishSync('history', false, '同步历史失败: 当前未连接');
                    return;
                }

                const client = store.getClient();
                if (!client) {
                    finishSync('history', false, '同步历史失败: 当前客户端不可用');
                    return;
                }

                startSync('history', '同步历史');
                const depthRaw = Number(localSettings.syncHistoryDepth);
                const depth = Number.isFinite(depthRaw) && depthRaw >= 0 ? Math.floor(depthRaw) : 10;
                client.send({ type: 'sync_history_request', data: { depth } });
            } catch (e) {
                finishSync('history', false, `同步历史失败: ${e?.message || e}`);
            }
        };

        const requestSyncRegex = (scopes = ['character']) => {
            try {
                if (!store.isConnected) {
                    finishSync('regex', false, '同步正则失败: 当前未连接');
                    return;
                }

                const client = store.getClient();
                if (!client) {
                    finishSync('regex', false, '同步正则失败: 当前客户端不可用');
                    return;
                }

                startSync('regex', '同步正则');
                const normalized = Array.from(new Set(
                    (Array.isArray(scopes) ? scopes : ['character'])
                        .map(s => String(s || '').trim().toLowerCase())
                        .filter(Boolean)
                ));
                client.send({ type: 'sync_regex_request', data: { scopes: normalized } });
            } catch (e) {
                finishSync('regex', false, `同步正则失败: ${e?.message || e}`);
            }
        };

        const requestSyncVariables = () => {
            try {
                if (!store.isConnected) {
                    finishSync('variables', false, '同步变量失败: 当前未连接');
                    return;
                }

                const client = store.getClient();
                if (!client) {
                    finishSync('variables', false, '同步变量失败: 当前客户端不可用');
                    return;
                }

                startSync('variables', '同步变量');
                const variableModes = Array.isArray(store.variableMode) ? store.variableMode : [];
                client.send({
                    type: 'sync_variables_request',
                    data: { variableModes }
                });
            } catch (e) {
                finishSync('variables', false, `同步变量失败: ${e?.message || e}`);
            }
        };

        const autoSyncInFlight = ref(false);
        const triggerAutoSync = () => {
            if (!store.isConnected || store.isHost || autoSyncInFlight.value) return;

            const picked = new Set(normalizeAutoSyncFeatures(localSettings.autoSyncFeatures));
            if (picked.size === 0) return;

            try {
                console.log('[联机Mod] 自动同步触发:', Array.from(picked));
            } catch (e) {}

            autoSyncInFlight.value = true;
            setTimeout(() => {
                try {
                    if (picked.has('history')) requestSyncHistory();

                    const regexScopes = [];
                    if (picked.has('regex_character')) regexScopes.push('character');
                    if (regexScopes.length > 0) requestSyncRegex(regexScopes);

                    if (picked.has('variables')) requestSyncVariables();
                } finally {
                    setTimeout(() => { autoSyncInFlight.value = false; }, 400);
                }
            }, 200);
        };

        watch(() => store.isConnected, (connected) => {
            if (!connected) {
                autoSyncInFlight.value = false;
                ['history', 'regex', 'variables'].forEach((t) => {
                    clearSyncTimer(t);
                    syncState[t] = false;
                });
                return;
            }
            triggerAutoSync();
        });

        onEventTracked('multiplayer_sync_history_result', (result) => {
            if (store.isHost) return;
            if (result?.ok) {
                const cnt = Number(result?.count || 0);
                finishSync('history', true, cnt > 0 ? `同步历史成功（${cnt}条）` : '同步历史成功');
            } else {
                finishSync('history', false, `同步历史失败: ${result?.message || '未知错误'}`);
            }
        });

        onEventTracked('multiplayer_sync_regex_result', (result) => {
            if (store.isHost) return;
            if (result?.ok) {
                finishSync('regex', true, '同步正则成功');
            } else {
                finishSync('regex', false, `同步正则失败: ${result?.message || '未知错误'}`);
            }
        });

        onEventTracked('multiplayer_sync_variables_result', (result) => {
            if (store.isHost) return;
            if (result?.ok) {
                finishSync('variables', true, '同步变量成功');
            } else {
                finishSync('variables', false, `同步变量失败: ${result?.message || '未知错误'}`);
            }
        });

        onEventTracked('multiplayer_acu_full_sync', () => {
            if (store.isHost) return;
            if (syncState.variables) {
                finishSync('variables', true, '同步变量成功（数据库）');
            }
        });

        const VARIABLE_MODE_FEATURE_OPTIONS = Object.freeze([
            { value: 'mvu', label: 'MVU变量', desc: '同步消息级变量（stat/display/delta/schema）' },
            { value: 'apotheosis', label: '数据库', desc: '同步 ACU 隔离表与数据库变量' }
        ]);

        const AUTO_SYNC_FEATURE_OPTIONS = Object.freeze([
            { value: 'regex_character', label: '局部正则', desc: '自动拉取房主角色正则' },
            { value: 'history', label: '历史记录', desc: '自动同步最近历史消息' },
            { value: 'variables', label: '变量', desc: '自动同步已勾选的变量模式数据' }
        ]);

        const getVariableModes = () => Array.isArray(store.variableMode) ? store.variableMode : [];

        const isVariableModePicked = (key) => getVariableModes().includes(key);

        const toggleVariableMode = (key) => {
            const next = new Set(getVariableModes());
            if (next.has(key)) next.delete(key);
            else next.add(key);
            store.variableMode = Array.from(next);
        };

        const renderMultiSelectSetting = (
            h,
            {
                label,
                options,
                isPicked,
                onToggle,
                hint,
                extraClass = 'mp-mt-2'
            }
        ) => {
            return h('div', { class: ['setting-item', extraClass] }, [
                h('label', {}, label),
                h('div', { class: 'mp-choice-group' },
                    options.map(opt =>
                        h('div', {
                            key: opt.value,
                            class: ['mp-choice-item', { active: isPicked(opt.value) }],
                            onClick: () => onToggle(opt.value)
                        }, [
                            h('span', { class: 'mp-choice-dot' }),
                            h('div', { class: 'mp-choice-content' }, [
                                h('div', { class: 'mp-choice-title' }, opt.label),
                                opt.desc ? h('div', { class: 'mp-choice-desc' }, opt.desc) : null
                            ].filter(Boolean))
                        ])
                    )
                ),
                hint ? h('small', { class: 'hint' }, hint) : null
            ].filter(Boolean));
        };

        const normalizeAutoSyncFeatures = (raw) => {
            const valid = new Set(AUTO_SYNC_FEATURE_OPTIONS.map(x => x.value));
            const src = Array.isArray(raw) ? raw : [];
            const picked = [];
            for (const item of src) {
                const key = String(item || '').trim();
                if (valid.has(key) && !picked.includes(key)) picked.push(key);
            }
            return picked;
        };

        const isAutoSyncPicked = (key) => normalizeAutoSyncFeatures(localSettings.autoSyncFeatures).includes(key);

        const toggleAutoSyncFeature = (key) => {
            const next = new Set(normalizeAutoSyncFeatures(localSettings.autoSyncFeatures));
            if (next.has(key)) next.delete(key);
            else next.add(key);
            localSettings.autoSyncFeatures = normalizeAutoSyncFeatures(Array.from(next));
            saveSettings();

            // 已连接时，切换选项后立即触发一次自动同步，方便用户验证
            if (store.isConnected && !store.isHost) {
                triggerAutoSync();
            }
        };

        const autoSubmitInFlight = ref(false);
        watch(allSubmitted, async (ready) => {
            if (!ready) return;
            if (!store.isHost || store.spectatorMode) return;
            if (!localSettings.autoSendWhenAllSubmitted) return;
            if (getPendingMap().size <= 0 || autoSubmitInFlight.value) return;

            autoSubmitInFlight.value = true;
            try {
                await submitToAI();
            } finally {
                setTimeout(() => { autoSubmitInFlight.value = false; }, 0);
            }
        });

        const transferHost = (userId) => {
            if (confirm('确定要将房主权限转让给该用户吗？')) {
                store.getClient()?.send({ type: 'transfer_host', data: { targetUserId: userId } });
            }
        };

        const SETTINGS_KEY = 'st_multiplayer_settings';
        const makeRandomUid = () => `uid_${Math.random().toString(36).slice(2, 10)}`;

        const defaultSettings = {
            defaultUserName: '',
            clientUid: makeRandomUid(),
            messagePrefix: '[{name}]:',
            messageSuffix: '',
            autoSendWhenAllSubmitted: false,
            autoSyncFeatures: ['regex_character', 'history', 'variables'],
            hideUserInputContent: false,
            sendUserPersona: true,
            personaPrefix: '[{name}]的设定:',
            timedInputSeconds: 0,
            syncHistoryDepth: 10,
            uiThemeTokens: {},
            onlineMode: true,
            onlineServer: 'https://room.yufugemini.cloud'
        };

        const loadSettings = () => {
            try {
                const raw = localStorage.getItem(SETTINGS_KEY);
                if (!raw) return { ...defaultSettings };
                const parsed = JSON.parse(raw) || {};
                const merged = { ...defaultSettings, ...parsed };

                if (!Array.isArray(parsed.autoSyncFeatures) && typeof parsed.autoSyncOnConnect === 'boolean') {
                    merged.autoSyncFeatures = parsed.autoSyncOnConnect
                        ? [...defaultSettings.autoSyncFeatures]
                        : [];
                }

                merged.autoSyncFeatures = normalizeAutoSyncFeatures(merged.autoSyncFeatures);
                return merged;
            } catch (e) {
                return { ...defaultSettings };
            }
        };

        const localSettings = reactive(loadSettings());
        const saveSettings = () => {
            try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(localSettings)); } catch (e) {}
        };

        const normalizeThemeTokenKey = (rawKey = '') => {
            const key = String(rawKey || '').trim();
            if (key.startsWith('--mp-')) return key;
            if (key.startsWith('mp-')) return `--${key}`;
            return '';
        };

        const extractThemeTokensFromPayload = (payload) => {
            const sources = [payload?.mpThemeTokens, payload?.tokens, payload?.variables, payload];
            const out = {};
            for (const src of sources) {
                if (!src || typeof src !== 'object' || Array.isArray(src)) continue;
                for (const [k, v] of Object.entries(src)) {
                    const nk = normalizeThemeTokenKey(k);
                    if (!nk) continue;
                    if (v === null || v === undefined) continue;
                    out[nk] = String(v).trim();
                }
                if (Object.keys(out).length > 0) break;
            }
            return out;
        };

        const applyThemeTokens = (tokens = {}) => {
            const doc = parentWindow.document || document;
            const root = doc?.documentElement;
            if (!root) return 0;

            let applied = 0;
            Object.entries(tokens || {}).forEach(([k, v]) => {
                const nk = normalizeThemeTokenKey(k);
                const nv = String(v || '').trim();
                if (!nk || !nv) return;
                root.style.setProperty(nk, nv);
                applied++;
            });
            return applied;
        };

        const themeFileInputRef = ref(null);

        const onThemeFileChange = async (e) => {
            const file = e?.target?.files?.[0];
            if (!file) return;

            const _toastr = parentWindow.toastr || window.toastr;

            try {
                const raw = await file.text();
                const json = JSON.parse(raw);
                const tokens = extractThemeTokensFromPayload(json);
                const count = applyThemeTokens(tokens);

                if (count <= 0) throw new Error('未找到可用的 --mp- 主题变量');

                localSettings.uiThemeTokens = tokens;
                saveSettings();
                _toastr?.success(`UI主题导入成功（${count} 项）`);
            } catch (err) {
                _toastr?.error(`UI主题导入失败：${err?.message || err}`);
            } finally {
                if (e?.target) e.target.value = '';
            }
        };

        applyThemeTokens(localSettings.uiThemeTokens || {});

        store.settings.defaultUserName = (localSettings.defaultUserName || '').trim();
        store.settings.timedInputSeconds = Number(localSettings.timedInputSeconds) || 0;
        store.settings.onlineMode = !!localSettings.onlineMode;
        store.settings.onlineServer = (localSettings.onlineServer || 'https://room.yufugemini.cloud').trim();

        watch(() => localSettings.timedInputSeconds, (v) => {
            const next = Number(v) || 0;
            if (store.settings.timedInputSeconds !== next) store.settings.timedInputSeconds = next;
            saveSettings();
        });

        watch(() => store.settings.timedInputSeconds, (v) => {
            const next = Number(v) || 0;
            if ((Number(localSettings.timedInputSeconds) || 0) !== next) {
                localSettings.timedInputSeconds = next;
                saveSettings();
            }
        });

        watch(() => store.settings.onlineMode, (v) => {
            const next = !!v;
            if (localSettings.onlineMode !== next) {
                localSettings.onlineMode = next;
                saveSettings();
            }
        });

        watch(() => store.settings.onlineServer, (v) => {
            const next = (v || '').toString().trim();
            if ((localSettings.onlineServer || '') !== next) {
                localSettings.onlineServer = next;
                saveSettings();
            }
        });

        // 从用户设定正文中解析「姓名」字段（如 **姓名:**夏高·纳西索斯），用于 {name} 占位符
        const getPersonaNameFromDescription = () => {
            const ctx = parentWindow.SillyTavern?.getContext?.();
            const userPersona = ctx?.userPersona;
            const text = typeof userPersona === 'string'
                ? userPersona
                : (userPersona?.description || userPersona?.content || '');
            const domPersona = (
                parentWindow.document?.querySelector('#persona_description')?.value ||
                parentWindow.document?.querySelector('textarea[name="persona_description"]')?.value ||
                ''
            );
            const raw = (text || domPersona || '').toString();
            const m = raw.match(/\*\*姓名\*\*:\s*([^*\n]+?)(?=\s*\*\*|$)/m) ||
                raw.match(/姓名\s*[：:]\s*([^\n*]+?)(?=\s*\*\*|$)/m) ||
                raw.match(/\*\*姓名\*\*:\s*([^*\n]+)/);
            return m ? m[1].trim() : '';
        };

        const getPersonaRoleName = () => {
            const ctx = parentWindow.SillyTavern?.getContext?.();
            const pu = parentWindow.power_user || ctx?.power_user || {};

            const roleName = (
                (typeof ctx?.userPersona === 'object' ? ctx?.userPersona?.name : '') ||
                ctx?.persona?.name ||
                pu?.persona_name ||
                ctx?.personaName ||
                getPersonaNameFromDescription() ||
                ctx?.name1 ||
                ''
            ).toString().trim();

            return roleName || '角色名';
        };

        const applyNameToken = (template) => {
            return (template || '').replace(/\{\s*name\s*\}|\[\s*name\s*\]/gi, getPersonaRoleName());
        };

        const personaRefreshTick = ref(0);
        let personaPreviewTimer = null;

        if (localSettings.defaultUserName && !userName.value) userName.value = localSettings.defaultUserName;

        let renameDebounceTimer = null;
        let lastBroadcastName = '';

        const doRenameBroadcast = (nextName) => {
            const ret = store.renameSelf(nextName);
            if (ret?.ok) lastBroadcastName = nextName;
            else if (ret?.reason === 'duplicate') {
                const _toastr = parentWindow.toastr || window.toastr;
                _toastr?.error('该用户名已在房间中使用');
            }
        };

        const flushRenameNow = () => {
            const nextName = (localSettings.defaultUserName || '').trim();
            if (!store.isConnected || !nextName) return;

            if (renameDebounceTimer) {
                clearTimeout(renameDebounceTimer);
                renameDebounceTimer = null;
            }

            if (nextName === lastBroadcastName) return;
            doRenameBroadcast(nextName);
        };

        watch(() => localSettings.defaultUserName, (val) => {
            const nextName = (val || '').trim();
            userName.value = nextName;
            store.settings.defaultUserName = nextName;
            saveSettings();

            if (!store.isConnected || !nextName) return;

            if (renameDebounceTimer) clearTimeout(renameDebounceTimer);

            renameDebounceTimer = setTimeout(() => {
                if (nextName === lastBroadcastName) return;
                doRenameBroadcast(nextName);
            }, 700);
        });

        const previewText = computed(() => {
            const prefix = applyNameToken(localSettings.messagePrefix || '[{name}]:');
            return `${prefix} 消息内容${localSettings.messageSuffix}`;
        });

        const getPersonaContentRaw = () => {
            const ctx = parentWindow.SillyTavern?.getContext?.();
            const pu = parentWindow.power_user || ctx?.power_user || {};

            const userPersona = ctx?.userPersona;
            const userPersonaText = typeof userPersona === 'string'
                ? userPersona
                : (userPersona?.description || userPersona?.content || '');

            const domPersona = (
                parentWindow.document?.querySelector('#persona_description')?.value ||
                parentWindow.document?.querySelector('textarea[name="persona_description"]')?.value ||
                ''
            );

            const raw = (
                userPersonaText ||
                ctx?.persona?.description ||
                ctx?.persona_description ||
                pu?.persona_description ||
                domPersona ||
                ''
            ).toString().trim();

            return raw.replace(/<[^>]+>/g, '').trim();
        };

        const personaPreviewText = computed(() => {
            const prefix = applyNameToken(localSettings.personaPrefix || '[{name}]的设定:');
            const raw = getPersonaContentRaw() || '（未读取到用户设定内容）';
            const merged = `${prefix} ${raw}`.replace(/\s+/g, ' ').trim();
            return merged.length > 80 ? `${merged.slice(0, 80)}...` : merged;
        });

        watch(showSettings, (opened) => {
            if (personaPreviewTimer) {
                clearInterval(personaPreviewTimer);
                personaPreviewTimer = null;
            }

            if (opened) {
                personaRefreshTick.value++;
                personaPreviewTimer = setInterval(() => {
                    personaRefreshTick.value++;
                }, 1000);
            }
        });

        const scrollLogsToBottom = () => {
            nextTick(() => {
                if (!logsRef.value) return;
                logsRef.value.scrollTop = logsRef.value.scrollHeight;
            });
        };

        watch(() => store.chatLogs.length, () => scrollLogsToBottom());

        watch(isMinimized, (minimized) => {
            if (!minimized) scrollLogsToBottom();
        });

        watch(showSettings, (opened) => {
            if (!opened && !isMinimized.value) scrollLogsToBottom();
        });

        let activePointerId = null;
        let dragPointerTarget = null;

        const startPointerDrag = (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea') || e.target.closest('select')) return;

            isDragging.value = true;
            activePointerId = e.pointerId;
            dragPointerTarget = e.currentTarget || null;

            dragOffset.x = e.clientX - panelPos.left;
            dragOffset.y = e.clientY - panelPos.top;

            dragStartPoint.x = e.clientX;
            dragStartPoint.y = e.clientY;
            dragMoved = false;

            try { dragPointerTarget?.setPointerCapture?.(activePointerId); } catch (_) {}

            const targetDoc = parentWindow.document || document;
            targetDoc.addEventListener('pointermove', onPointerDrag, { passive: false });
            targetDoc.addEventListener('pointerup', stopPointerDrag);
            targetDoc.addEventListener('pointercancel', stopPointerDrag);
        };

        const getViewportSize = () => {
            const vv = parentWindow.visualViewport;
            const viewportWidth = vv?.width || parentWindow.innerWidth || window.innerWidth || 0;
            const viewportHeight = vv?.height || parentWindow.innerHeight || window.innerHeight || 0;
            return {
                width: Math.max(0, Math.floor(viewportWidth)),
                height: Math.max(0, Math.floor(viewportHeight))
            };
        };

        let lastViewportHeight = 0;
        let lastStablePanelTop = panelPos.top;
        let keyboardClosePending = false;
        let keyboardSettleTimer = null;

        const clearKeyboardSettleTimer = () => {
            if (!keyboardSettleTimer) return;
            clearTimeout(keyboardSettleTimer);
            keyboardSettleTimer = null;
        };

        const clampPanelIntoViewport = (options = {}) => {
            const { skipWhenKeyboardOpen = false } = options;

            if (skipWhenKeyboardOpen && isMobileLike() && isVirtualKeyboardLikelyOpen()) {
                return;
            }

            const panelEl = panelRef.value;
            if (!panelEl) return;

            const { width: viewportWidth, height: viewportHeight } = getViewportSize();
            const panelWidth = panelEl.offsetWidth || UI_TOKENS.panelFallbackWidth;
            const panelHeight = panelEl.offsetHeight || UI_TOKENS.panelFallbackHeight;

            if (
                skipWhenKeyboardOpen &&
                isMobileLike() &&
                keyboardClosePending &&
                viewportHeight > 0 &&
                panelHeight > 0 &&
                viewportHeight <= panelHeight + 12
            ) {
                return;
            }

            const maxLeft = Math.max(0, viewportWidth - panelWidth);
            const maxTop = Math.max(0, viewportHeight - panelHeight);

            const nextLeft = Math.min(maxLeft, Math.max(0, panelPos.left));
            const nextTop = Math.min(maxTop, Math.max(0, panelPos.top));

            panelPos.left = nextLeft;
            panelPos.top = nextTop;
            applyPanelPos();
        };


        let resizeRafId = null;
        const KEYBOARD_RESIZE_DELTA = 60;
        const KEYBOARD_SETTLE_MS = 140;

        const onViewportResize = () => {
            if (resizeRafId !== null) {
                parentWindow.cancelAnimationFrame?.(resizeRafId);
                resizeRafId = null;
            }
            resizeRafId = (parentWindow.requestAnimationFrame || window.requestAnimationFrame)(() => {
                resizeRafId = null;

                const { height: viewportHeight } = getViewportSize();
                const prevHeight = lastViewportHeight || viewportHeight;
                const delta = viewportHeight - prevHeight;
                const mobileLike = isMobileLike();

                if (mobileLike && delta < -KEYBOARD_RESIZE_DELTA) {
                    // 视口快速变小：通常是键盘弹出，缓存当前稳定 top，避免后续收起回弹到 0
                    lastStablePanelTop = panelPos.top;
                    keyboardClosePending = false;
                    clearKeyboardSettleTimer();

                    clampPanelIntoViewport({ skipWhenKeyboardOpen: true });
                    lastViewportHeight = viewportHeight;
                    return;
                }

                if (mobileLike && delta > KEYBOARD_RESIZE_DELTA) {
                    // 视口快速变大：通常是键盘收起，等待视口稳定后再钳制，避免过渡帧把 top 吸到 0
                    keyboardClosePending = true;
                    clearKeyboardSettleTimer();

                    keyboardSettleTimer = setTimeout(() => {
                        keyboardClosePending = false;

                        const { height: settledHeight } = getViewportSize();
                        if (settledHeight > 0) {
                            lastViewportHeight = settledHeight;
                        }

                        if (panelPos.top <= 0 && lastStablePanelTop > 0) {
                            panelPos.top = lastStablePanelTop;
                            applyPanelPos();
                        }

                        clampPanelIntoViewport({ skipWhenKeyboardOpen: true });

                        if (!isVirtualKeyboardLikelyOpen()) {
                            lastStablePanelTop = panelPos.top;
                        }
                    }, KEYBOARD_SETTLE_MS);

                    lastViewportHeight = viewportHeight;
                    return;
                }

                clampPanelIntoViewport({ skipWhenKeyboardOpen: true });

                if (!isVirtualKeyboardLikelyOpen()) {
                    lastStablePanelTop = panelPos.top;
                }

                lastViewportHeight = viewportHeight;
            });
        };

        const onPointerDrag = (e) => {
            if (!isDragging.value) return;
            if (activePointerId !== null && e.pointerId !== activePointerId) return;

            e.preventDefault();

            const dx = Math.abs(e.clientX - dragStartPoint.x);
            const dy = Math.abs(e.clientY - dragStartPoint.y);
            if (dx > DRAG_TAP_THRESHOLD || dy > DRAG_TAP_THRESHOLD) {
                dragMoved = true;
            }

            const { width: viewportWidth, height: viewportHeight } = getViewportSize();
            const panelEl = panelRef.value;
            const panelWidth = panelEl?.offsetWidth || UI_TOKENS.panelFallbackWidth;
            const panelHeight = panelEl?.offsetHeight || UI_TOKENS.panelFallbackHeight;

            const maxLeft = Math.max(0, viewportWidth - panelWidth);
            const maxTop = Math.max(0, viewportHeight - panelHeight);

            panelPos.left = Math.min(maxLeft, Math.max(0, e.clientX - dragOffset.x));
            panelPos.top = Math.min(maxTop, Math.max(0, e.clientY - dragOffset.y));
            applyPanelPos();
        };

        const stopPointerDrag = (e) => {
            if (e && activePointerId !== null && e.pointerId !== activePointerId) return;
            isDragging.value = false;

            try {
                if (dragPointerTarget && activePointerId !== null) {
                    dragPointerTarget.releasePointerCapture?.(activePointerId);
                }
            } catch (_) {}

            const wasTap = !dragMoved;

            activePointerId = null;
            dragPointerTarget = null;

            const targetDoc = parentWindow.document || document;
            targetDoc.removeEventListener('pointermove', onPointerDrag);
            targetDoc.removeEventListener('pointerup', stopPointerDrag);
            targetDoc.removeEventListener('pointercancel', stopPointerDrag);

            if (wasTap) {
                isMinimized.value = !isMinimized.value;
                if (isMinimized.value) {
                    showSettings.value = false;
                }
            }

            if (!isVirtualKeyboardLikelyOpen()) {
                lastStablePanelTop = panelPos.top;
            }

            dragMoved = false;
        };

        const isMobileLike = () => {
            try {
                const mm = parentWindow.matchMedia?.('(hover: none) and (pointer: coarse)');
                if (mm?.matches) return true;
            } catch (_) {}
            const ua = parentWindow.navigator?.userAgent || '';
            return /Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(ua);
        };

        const OUTSIDE_MINIMIZE_WHITELIST_SELECTORS = [
            'input',
            'textarea',
            'select',
            '[contenteditable="true"]',
            '.swal2-container',
            '.dropdown-menu',
            '.ui-autocomplete',
            '.autocomplete',
            '.ime-candidate',
            '.candidate-window',
            '.composition-view',
            '.tox-tinymce'
        ];

        const isWhitelistedTarget = (target) => {
            if (!target || typeof target.closest !== 'function') return false;
            return OUTSIDE_MINIMIZE_WHITELIST_SELECTORS.some(selector => !!target.closest(selector));
        };

        const isVirtualKeyboardLikelyOpen = () => {
            if (!isMobileLike()) return false;

            const doc = parentWindow.document || document;
            const ae = doc.activeElement;

            const isEditing = !!ae && (
                ae.tagName === 'INPUT' ||
                ae.tagName === 'TEXTAREA' ||
                ae.isContentEditable
            );

            if (!isEditing) return false;

            const vv = parentWindow.visualViewport;
            if (!vv) return true;

            const baseHeight = parentWindow.innerHeight || window.innerHeight || 0;
            if (!baseHeight) return isEditing;

            return vv.height < baseHeight * 0.82;
        };

        let autoMinimizeLastCheckTs = 0;
        const AUTO_MINIMIZE_CHECK_INTERVAL_MS = 120;

        const onBrowserOffline = () => {
            if (!store.isConnected) return;
            store.addLog('error', '系统', '网络已断开，已自动退出房间');
            store.disconnect();
        };

        const onDocumentPointerDownAutoMinimize = (e) => {
            if (!isMobileLike() || isMinimized.value) return;

            const nowTs = Number(e?.timeStamp || Date.now());
            if (nowTs - autoMinimizeLastCheckTs < AUTO_MINIMIZE_CHECK_INTERVAL_MS) return;
            autoMinimizeLastCheckTs = nowTs;

            const panelEl = panelRef.value;
            const target = e.target;

            if (!panelEl || !target) return;
            if (panelEl.contains(target)) return;

            const doc = parentWindow.document || document;

            const ae = doc.activeElement;
            const isPanelEditing = !!ae && panelEl.contains(ae) && (
                ae.tagName === 'INPUT' ||
                ae.tagName === 'TEXTAREA' ||
                ae.isContentEditable
            );
            if (isPanelEditing) return;

            const acEl = doc.querySelector('.autocomplete, .ui-autocomplete');
            const acVisible = !!(acEl && acEl.offsetParent !== null);
            if (acVisible) return;

            if (isWhitelistedTarget(target)) return;
            if (isVirtualKeyboardLikelyOpen()) return;

            isMinimized.value = true;
            showSettings.value = false;
        };

        onMounted(() => {
            const targetDoc = parentWindow.document || document;
            targetDoc.addEventListener('pointerdown', onDocumentPointerDownAutoMinimize, true);

            const initialViewport = getViewportSize();
            lastViewportHeight = initialViewport.height;
            lastStablePanelTop = panelPos.top;

            parentWindow.addEventListener('resize', onViewportResize);
            parentWindow.addEventListener('orientationchange', onViewportResize);

            const vv = parentWindow.visualViewport;
            vv?.addEventListener('resize', onViewportResize);

            parentWindow.addEventListener('offline', onBrowserOffline);

            nextTick(() => {
                applyPanelPos();
                clampPanelIntoViewport();
                if (!isVirtualKeyboardLikelyOpen()) {
                    lastStablePanelTop = panelPos.top;
                }
            });
        });

        onUnmounted(() => {
            stopPointerDrag();
            clearKeyboardSettleTimer();

            const targetDoc = parentWindow.document || document;
            targetDoc.removeEventListener('pointerdown', onDocumentPointerDownAutoMinimize, true);

            parentWindow.removeEventListener('resize', onViewportResize);
            parentWindow.removeEventListener('orientationchange', onViewportResize);

            const vv = parentWindow.visualViewport;
            vv?.removeEventListener('resize', onViewportResize);

            parentWindow.removeEventListener('offline', onBrowserOffline);

            if (resizeRafId !== null) {
                parentWindow.cancelAnimationFrame?.(resizeRafId);
                resizeRafId = null;
            }

            if (renameDebounceTimer) {
                clearTimeout(renameDebounceTimer);
                renameDebounceTimer = null;
            }

            if (personaPreviewTimer) {
                clearInterval(personaPreviewTimer);
                personaPreviewTimer = null;
            }
        });

        const joinRoom = async () => {
            if (isJoining.value) return;

            if (!offlinePort.value.toString().trim()) {
                const _toastr = parentWindow.toastr || window.toastr;
                _toastr?.error('请输入端口');
                return;
            }

            const safeName = (userName.value || '').trim();
            if (!safeName) {
                const _toastr = parentWindow.toastr || window.toastr;
                _toastr?.error('请输入用户名');
                return;
            }

            isJoining.value = true;
            try {
                store.settings.defaultUserName = safeName;
                await store.connectOffline(
                    offlinePort.value || '2157',
                    offlinePassword.value || '',
                    safeName,
                    localSettings.clientUid
                );
            } catch (e) {
                console.error(e);
                const _toastr = parentWindow.toastr || window.toastr;
                _toastr?.error('连接失败: ' + e.message);
                if (isPasswordError(e)) {
                    triggerInputShake(offlinePwdShake);
                }
            } finally {
                isJoining.value = false;
            }
        };

        const createLocalRoom = async () => {
            if (isJoining.value) return;

            if (!offlinePort.value.toString().trim()) {
                const _toastr = parentWindow.toastr || window.toastr;
                _toastr?.error('请输入端口');
                return;
            }

            const safeName = (userName.value || '').trim();
            if (!safeName) {
                const _toastr = parentWindow.toastr || window.toastr;
                _toastr?.error('请输入用户名');
                return;
            }

            isJoining.value = true;
            try {
                store.settings.defaultUserName = safeName;
                await store.startOfflineServer(
                    offlinePort.value || '2157',
                    offlinePassword.value || '',
                    safeName,
                    localSettings.clientUid
                );
            } catch (e) {
                console.error(e);
                const _toastr = parentWindow.toastr || window.toastr;
                _toastr?.error('创建失败: ' + e.message);
            } finally {
                isJoining.value = false;
            }
        };

        const disconnect = () => store.disconnect();

        return () => {
            const h = o.h;
            const statusClass = store.isConnected
                ? 'connected'
                : (store.mode !== 'disconnected' ? 'connecting' : 'disconnected');

            const faGap = (icon) => h('span', { class: ['fa-solid', 'mp-fa-gap'] }, String.fromCharCode(icon));

            const toggleSettings = () => {
                if (!showSettings.value && isMinimized.value) isMinimized.value = false;
                showSettings.value = !showSettings.value;
            };

            return h('div', {
                class: ['multiplayer-panel', {
                    minimized: isMinimized.value,
                    dragging: isDragging.value,
                    'settings-open': !isMinimized.value && showSettings.value
                }],
                ref: panelRef
            }, [
                h('div', { class: 'panel-header', onPointerdown: startPointerDrag }, [
                    h('div', { class: 'header-left' }, [
                        h('span', { class: ['status-dot', statusClass] }),
                        h('span', { class: 'title' }, '联机工具')
                    ]),
                    h('div', { class: 'header-actions' }, [
                        store.mode !== 'disconnected'
                            ? h('button', {
                                class: 'icon-btn danger-icon fa-solid',
                                title: '断开连接',
                                onClick: (e) => { e.stopPropagation(); disconnect(); }
                            }, String.fromCharCode(0xf011))
                            : null,
                        h('button', {
                            class: 'icon-btn fa-solid',
                            title: '设置',
                            onClick: (e) => { e.stopPropagation(); toggleSettings(); }
                        }, String.fromCharCode(0xf013))
                    ].filter(Boolean))
                ]),

                (!isMinimized.value && !showSettings.value) ? h('div', { class: 'panel-content' }, [
                    store.mode === 'disconnected' ? h('div', { class: 'settings-section' }, [
                        h('div', { class: 'username-section' }, [
                            h('div', { class: 'section-title' }, [faGap(0xf007), '用户名']),
                            h('input', {
                                value: userName.value,
                                onInput: (e) => {
                                    const nextName = (e.target.value || '');
                                    userName.value = nextName;
                                    localSettings.defaultUserName = nextName;
                                },
                                onBlur: flushRenameNow,
                                placeholder: '输入用户名',
                                class: 'input-field'
                            })
                        ]),

                        store.settings.onlineMode ? h(o.Fragment, null, [
                            h('div', { key: 'rooms-section', class: 'online-rooms-section' }, [
                                h('div', { class: 'section-header' }, [
                                    h('span', { class: 'section-title' }, [faGap(0xf0ac), '在线房间']),
                                    h('button', {
                                        class: 'refresh-btn fa-solid',
                                        onClick: fetchRooms,
                                        disabled: isLoadingRooms.value
                                    }, isLoadingRooms.value ? String.fromCharCode(0xf252) : String.fromCharCode(0xf021))
                                ]),

                                displayRooms.value.length > 0
                                    ? h('div', { class: 'room-list' },
                                        displayRooms.value.map(room =>
                                            h('div', {
                                                key: room.id,
                                                class: ['room-item', { selected: selectedRoom.value === room.id }],
                                                onClick: () => selectRoom(room)
                                            }, [
                                                h('div', { class: 'room-info' }, [
                                                    h('span', { class: 'room-name' }, room.name),
                                                    room.hasPassword
                                                        ? h('span', { class: 'room-lock fa-solid' }, String.fromCharCode(0xf023))
                                                        : null
                                                ].filter(Boolean)),
                                                h('div', { class: 'room-meta' }, [
                                                    h('span', { class: 'fa-solid' }, String.fromCharCode(0xf0c0) + ' ' + getRoomDisplayCurrentUsers(room) + '/' + room.maxUsers),
                                                    h('span', {}, 'by ' + room.creatorName)
                                                ])
                                            ])
                                        )
                                    )
                                    : h('div', { class: 'empty-rooms' }, isLoadingRooms.value ? '加载中...' : '暂无房间，点击下方创建'),

                                selectedRoom.value
                                    ? h('div', { class: 'join-room-section' }, [
                                        h('input', {
                                            value: joinPassword.value,
                                            onInput: (e) => joinPassword.value = e.target.value,
                                            type: 'password',
                                            placeholder: '密码（可留空）',
                                            class: ['input-field', { 'mp-input-shake': joinPwdShake.value }]
                                        }),
                                        h('button', {
                                            class: 'action-btn primary',
                                            onClick: () => joinSelectedRoom(false),
                                            disabled: isJoining.value,
                                            title: isJoining.value ? '正在加入，请稍候...' : '加入'
                                        }, [
                                            h('span', { class: 'join-btn-icon fa-solid' }, String.fromCharCode(0xf2f6)),
                                            h('span', { class: 'join-btn-label' }, '加入')
                                        ]),
                                        h('button', {
                                            class: 'action-btn primary',
                                            onClick: () => joinSelectedRoom(true),
                                            disabled: isJoining.value,
                                            title: isJoining.value ? '正在进入观看，请稍候...' : '观看'
                                        }, [
                                            h('span', { class: 'join-btn-icon fa-solid' }, String.fromCharCode(0xf06e)),
                                            h('span', { class: 'join-btn-label' }, '观看')
                                        ])
                                    ])
                                    : null,

                                h('div', { class: 'create-room-section' }, [
                                    h('div', { class: 'section-title' }, [faGap(0xf067), '创建房间']),
                                    h('input', {
                                        value: newRoomName.value,
                                        onInput: (e) => newRoomName.value = e.target.value,
                                        placeholder: '房间名称',
                                        class: 'input-field'
                                    }),
                                    h('div', { class: 'create-room-options' }, [
                                        h('input', {
                                            value: newRoomPassword.value,
                                            onInput: (e) => newRoomPassword.value = e.target.value,
                                            type: 'password',
                                            placeholder: '密码（可留空）',
                                            class: 'input-field medium'
                                        }),
                                        h('input', {
                                            value: newRoomMaxUsers.value,
                                            onInput: (e) => newRoomMaxUsers.value = parseInt(e.target.value) || 8,
                                            type: 'number',
                                            placeholder: '人数',
                                            class: 'input-field tiny',
                                            min: 2,
                                            max: 20
                                        })
                                    ]),
                                    h('button', {
                                        class: 'action-btn primary',
                                        onClick: createAndJoinRoom,
                                        disabled: !newRoomName.value.trim() || isCreating.value
                                    }, isCreating.value ? '创建中...' : '创建并加入')
                                ])
                            ])
                        ]) : h(o.Fragment, null, [
                            h('div', { key: 'offline-port', class: 'setting-row' }, [
                                h('label', {}, '端口:'),
                                h('input', {
                                    value: offlinePort.value,
                                    onInput: (e) => offlinePort.value = e.target.value,
                                    type: 'number',
                                    class: 'input-field small'
                                })
                            ]),
                            h('div', { key: 'offline-pwd', class: 'setting-row' }, [
                                h('label', {}, '密码:'),
                                h('input', {
                                    value: offlinePassword.value,
                                    onInput: (e) => offlinePassword.value = e.target.value,
                                    type: 'password',
                                    placeholder: '可选',
                                    class: ['input-field', { 'mp-input-shake': offlinePwdShake.value }]
                                })
                            ]),
                            h('div', { key: 'offline-btns', class: 'button-group' }, [
                                h('button', {
                                    class: 'action-btn secondary',
                                    onClick: createLocalRoom,
                                    disabled: isJoining.value
                                }, isJoining.value ? '处理中...' : '创建房间'),
                                h('button', {
                                    class: 'action-btn primary',
                                    onClick: joinRoom,
                                    disabled: isJoining.value
                                }, isJoining.value ? '处理中...' : '加入房间')
                            ])
                        ])
                    ]) : null,

                    store.mode !== 'disconnected' ? h(o.Fragment, null, [
                        h('div', { key: 'user-list', class: 'user-list' }, [
                            h('div', { class: 'section-title fa-solid' }, [
                                String.fromCharCode(0xf0c0) + ' 玩家 (' + userCount.value + ') ',
                                store.isHost ? h('span', { class: 'host-badge' }, '你是房主') : null
                            ]),
                            h('div', { class: 'user-items' },
                                onlineUsers.value.map(u => {
                                    const leadingNode = u.isHost
                                        ? h('span', {
                                            class: ['user-leading-icon', 'host-crown', 'fa-solid'],
                                            title: '房主'
                                        }, String.fromCharCode(0xf521))
                                        : (
                                            store.isHost
                                                ? h('button', {
                                                    class: 'transfer-leading-btn fa-solid',
                                                    title: '转让房主',
                                                    onClick: (e) => {
                                                        e.stopPropagation();
                                                        transferHost(u.id);
                                                    }
                                                }, String.fromCharCode(0xf362))
                                                : h('span', {
                                                    class: ['user-leading-icon', 'fa-solid'],
                                                    title: '玩家'
                                                }, String.fromCharCode(0xf007))
                                        );

                                    return h('div', {
                                        key: u.id,
                                        class: ['user-item', { host: u.isHost, submitted: hasSubmitted(u.id) }]
                                    }, [
                                        leadingNode,
                                        h('span', { class: 'user-name' }, u.name || '匿名')
                                    ]);
                                })
                            )
                        ]),

                        spectators.value.length > 0
                            ? h('div', { key: 'spectator-list', class: 'spectator-list' }, [
                                h('div', {
                                    class: 'section-title fa-solid mp-spectator-header',
                                    onClick: toggleSpectatorsCollapsed
                                }, [
                                    h('span', {}, `${String.fromCharCode(0xf06e)} 观众 (${spectators.value.length})`),
                                    h('span', { class: 'fa-solid' }, spectatorsCollapsed.value ? String.fromCharCode(0xf078) : String.fromCharCode(0xf077))
                                ]),
                                !spectatorsCollapsed.value
                                    ? h('div', { class: 'spectator-items' },
                                        spectators.value.map(u =>
                                            h('span', { key: u.id, class: ['user-item', 'spectator-item'] }, [
                                                h('span', {
                                                    class: ['user-leading-icon', 'fa-solid'],
                                                    title: '观众'
                                                }, String.fromCharCode(0xf06e)),
                                                h('span', { class: 'user-name' }, u.name || '匿名')
                                            ])
                                        )
                                    )
                                    : null
                            ])
                            : null,

                        h(o.Fragment, null, [
                            h('div', { class: 'section-title fa-solid' }, `${String.fromCharCode(0xf4ad)} 聊天消息`),
                            h('div', { key: 'chat-logs', class: 'chat-logs', ref: logsRef }, [
                                ...store.chatLogs.map(log =>
                                    h('div', { key: log.id, class: ['log-item', log.type] }, [
                                        h('span', { class: 'log-from' }, log.from + ':'),
                                        h('span', { class: 'log-content' }, log.content)
                                    ])
                                ),
                                store.chatLogs.length === 0
                                    ? h('div', { class: 'empty-logs' }, '暂无输入')
                                    : null
                            ])
                        ]),

                        h('div', { key: 'inputs-display' }, [
                            h('div', { class: 'section-title fa-solid' }, [
                                `${String.fromCharCode(0xf46d)} 本轮输入池 (${submittedCount.value}/${userCount.value}) `,
                                allSubmitted.value && userCount.value > 0 ? h('span', { class: 'all-submitted' }, '✓ 全部到齐') : null
                            ]),
                            getPendingMap().size > 0
                                ? h('div', { class: 'pending-inputs' },
                                    Array.from(getPendingMap().entries()).map(([uid, data]) =>
                                        h('div', { key: uid, class: 'pending-input-item' }, [
                                            h('span', { class: 'input-user' }, data.userName + ':'),
                                            (data.hideContent && uid !== myClientId.value)
                                                ? h('span', { class: 'input-content hidden-content' }, '********')
                                                : h('span', { class: 'input-content' }, data.content.substring(0, 50) + (data.content.length > 50 ? '...' : ''))
                                        ])
                                    )
                                )
                                : h('div', { class: 'empty-inputs' }, '暂无输入')
                        ]),

                        h('div', { key: 'input-submit', class: 'input-submit-area' }, [
                            !store.isHost
                                ? h('div', { class: 'sync-buttons-row' }, [
                                    h('button', {
                                        class: 'sync-history-btn',
                                        title: '同步房主的历史消息',
                                        onClick: requestSyncHistory,
                                        disabled: syncState.history
                                    }, syncState.history ? '同步中…' : '同步历史'),
                                    h('button', {
                                        class: 'sync-history-btn',
                                        title: '同步房主的局部正则',
                                        onClick: () => requestSyncRegex(['character']),
                                        disabled: syncState.regex
                                    }, syncState.regex ? '同步中…' : '同步正则'),
                                    h('button', {
                                        class: 'sync-history-btn',
                                        title: '同步房主的变量数据',
                                        onClick: requestSyncVariables,
                                        disabled: syncState.variables
                                    }, syncState.variables ? '同步中…' : '同步变量')
                                ])
                                : null,

                            !store.spectatorMode
                                ? h('textarea', {
                                    value: myInput.value,
                                    onInput: (e) => myInput.value = e.target.value,
                                    class: 'input-textarea',
                                    placeholder: store.isHost
                                        ? '房主输入（可选，会与其他输入合并）...'
                                        : '输入你的本轮内容，点击提交发送...',
                                    rows: 3
                                })
                                : null,

                            !store.spectatorMode
                                ? h('div', { class: 'button-group' }, [
                                    store.isHost
                                        ? h('button', {
                                            class: 'action-btn secondary',
                                            onClick: resetInputs,
                                            disabled: getPendingMap().size === 0
                                        }, '重置')
                                        : null,
                                    h('button', {
                                        class: ['action-btn', mySubmitted.value ? 'secondary fa-solid' : 'primary'],
                                        onClick: mySubmitted.value ? revokeInput : sendInput,
                                        disabled: mySubmitted.value ? false : !myInput.value.trim()
                                    }, mySubmitted.value ? `${String.fromCharCode(0xf2ea)} 撤回` : '提交输入'),
                                    store.isHost
                                        ? h('button', {
                                            class: 'action-btn primary',
                                            onClick: submitToAI,
                                            disabled: getPendingMap().size === 0
                                        }, '立即发送 ')
                                        : null
                                ].filter(Boolean))
                                : null
                        ]),

                        h('div', { key: 'chat-input', class: 'chat-input-area' }, [
                            h('input', {
                                value: chatMsg.value,
                                onInput: (e) => chatMsg.value = e.target.value,
                                onKeyup: (e) => { if (e.key === 'Enter') sendChat(); },
                                placeholder: '发送聊天消息...',
                                class: 'chat-input'
                            }),
                            h('button', {
                                class: 'send-btn small fa-solid',
                                onClick: sendChat,
                                disabled: !chatMsg.value.trim()
                            }, String.fromCharCode(0xf1d8))
                        ])
                    ]) : null
                ]) : null,

                (!isMinimized.value && showSettings.value) ? h('div', {
                    key: 'settings',
                    class: 'settings-modal'
                }, [
                    h('div', { class: 'settings-modal-content' }, [
                        h('div', { class: 'settings-modal-body' }, [
                            h('div', { class: 'settings-tabs' },
                                SETTINGS_TAB_OPTIONS.map(tab =>
                                    h('button', {
                                        key: tab.value,
                                        class: ['settings-tab-btn', { active: settingsTab.value === tab.value }],
                                        onClick: (e) => {
                                            e.stopPropagation();
                                            settingsTab.value = tab.value;
                                        }
                                    }, tab.label)
                                )
                            ),
                            settingsTab.value === 'general'
                                ? h('div', { class: ['setting-item', 'mp-mt-1'] }, [
                                    h('label', { class: 'mp-theme-import-label' }, 'UI主题导入:'),
                                    h('input', {
                                        ref: themeFileInputRef,
                                        type: 'file',
                                        accept: '.json,application/json',
                                        class: 'mp-hidden',
                                        onChange: onThemeFileChange
                                    }),
                                    h('button', {
                                        class: 'action-btn secondary fa-solid',
                                        onClick: () => themeFileInputRef.value?.click()
                                    }, String.fromCharCode(0xf093) + ' 导入JSON'),
                                    h('small', { class: 'hint' }, '支持 mpThemeTokens / tokens / variables / 根对象中的 --mp- 变量')
                                ])
                                : null,

                            settingsTab.value === 'general'
                                ? h('div', { class: 'setting-item' }, [
                                    h('label', {}, '用户名'),
                                    h('input', {
                                        value: localSettings.defaultUserName,
                                        onInput: (e) => { localSettings.defaultUserName = e.target.value; },
                                        onChange: saveSettings,
                                        onBlur: flushRenameNow,
                                        onKeyup: (e) => { if (e.key === 'Enter') flushRenameNow(); },
                                        placeholder: '设置用户名',
                                        class: 'settings-input'
                                    })
                                ])
                                : null,

                            settingsTab.value === 'general'
                                ? h('div', { class: ['setting-item', 'mp-mt-1'] }, [
                                    h('label', {}, 'UID:'),
                                    h('input', {
                                        value: localSettings.clientUid,
                                        onInput: (e) => { localSettings.clientUid = e.target.value; },
                                        onChange: saveSettings,
                                        placeholder: '用户唯一标识（可自定义）',
                                        class: 'settings-input',
                                        disabled: store.isConnected
                                    }),
                                    h('small', { class: 'hint' },
                                        store.isConnected
                                            ? '已连接状态下 UID 已锁定，断开后可修改'
                                            : '用于绑定身份，不随用户名变化'
                                    )
                                ])
                                : null,

                            settingsTab.value === 'general'
                                ? h('div', { class: ['setting-item', 'toggle-item', 'mp-mt-2'] }, [
                                    h('div', {
                                        class: 'toggle-label',
                                        onClick: () => { store.settings.onlineMode = !store.settings.onlineMode; }
                                    }, [
                                        h('span', {}, '在线模式:'),
                                        h('span', { class: ['toggle-switch', { active: store.settings.onlineMode }] })
                                    ]),
                                    h('small', { class: 'hint' }, '连接到公共服务器创建/加入房间')
                                ])
                                : null,

                            (settingsTab.value === 'general' && store.settings.onlineMode)
                                ? h('div', { class: ['setting-item', 'mp-mb-1'] }, [
                                    h('label', {}, '服务器地址:'),
                                    h('input', {
                                        value: store.settings.onlineServer,
                                        onInput: (e) => { store.settings.onlineServer = e.target.value; },
                                        placeholder: 'https://room.example.com',
                                        class: 'settings-input'
                                    })
                                ])
                                : null,

                            settingsTab.value === 'player'
                                ? h('div', { class: ['setting-item', 'toggle-item', 'mp-mt-2'] }, [
                                    h('div', {
                                        class: 'toggle-label',
                                        onClick: () => {
                                            const next = !store.spectatorMode;
                                            const ret = store.setSpectatorMode(next);
                                            if (ret?.ok === false) return;
                                            saveSettings();
                                        }
                                    }, [
                                        h('span', {}, '观众模式:'),
                                        h('span', { class: ['toggle-switch', { active: store.spectatorMode }] })
                                    ]),
                                    h('small', { class: 'hint' },
                                        store.isHost
                                            ? '房主不可切换为观众模式'
                                            : (store.isConnected ? '已连接：立即切换观战状态' : '未连接：作为默认加入身份')
                                    )
                                ])
                                : null,

                            settingsTab.value === 'host'
                                ? renderMultiSelectSetting(h, {
                                    label: '变量模式:',
                                    options: VARIABLE_MODE_FEATURE_OPTIONS,
                                    isPicked: isVariableModePicked,
                                    onToggle: toggleVariableMode,
                                    hint: '可同时勾选：MVU变量 + 数据库',
                                    extraClass: ''
                                })
                                : null,

                            settingsTab.value === 'host'
                                ? h('div', { class: 'setting-item toggle-item' }, [
                                    h('div', {
                                        class: 'toggle-label',
                                        onClick: () => {
                                            localSettings.autoSendWhenAllSubmitted = !localSettings.autoSendWhenAllSubmitted;
                                            saveSettings();
                                        }
                                    }, [
                                        h('span', {}, '自动发送:'),
                                        h('span', { class: ['toggle-switch', { active: localSettings.autoSendWhenAllSubmitted }] })
                                    ]),
                                    h('small', { class: 'hint' }, '开启后，所有玩家提交完成将自动发送')
                                ])
                                : null,

                            settingsTab.value === 'host'
                                ? h('div', { class: 'setting-item' }, [
                                    h('label', {}, '限时输入 (秒):'),
                                    h('input', {
                                        type: 'number',
                                        value: localSettings.timedInputSeconds,
                                        onInput: (e) => { localSettings.timedInputSeconds = parseInt(e.target.value) || 0; },
                                        onChange: saveSettings,
                                        min: 0,
                                        max: 300,
                                        class: 'settings-input mp-input-narrow'
                                    }),
                                    h('small', { class: 'hint' }, '有人提交后N秒自动发送，0为关闭')
                                ])
                                : null,

                            settingsTab.value === 'player'
                                ? renderMultiSelectSetting(h, {
                                    label: '同步选项:',
                                    options: AUTO_SYNC_FEATURE_OPTIONS,
                                    isPicked: isAutoSyncPicked,
                                    onToggle: toggleAutoSyncFeature,
                                    hint: '可多选：局部正则 / 历史记录 / 变量'
                                })
                                : null,

                            settingsTab.value === 'general'
                                ? h('div', { class: ['setting-item', 'toggle-item', 'mp-mt-2'] }, [
                                    h('div', {
                                        class: 'toggle-label',
                                        onClick: () => {
                                            localSettings.hideUserInputContent = !localSettings.hideUserInputContent;
                                            saveSettings();
                                        }
                                    }, [
                                        h('span', {}, '隐藏模式:'),
                                        h('span', { class: ['toggle-switch', { active: localSettings.hideUserInputContent }] })
                                    ]),
                                    h('small', { class: 'hint' }, '开启后其他人看不到你输入的具体内容（显示为 ********）')
                                ])
                                : null,

                            settingsTab.value === 'player'
                                ? h('div', { class: 'setting-item' }, [
                                    h('label', {}, '同步历史消息层数:'),
                                    h('input', {
                                        type: 'number',
                                        value: localSettings.syncHistoryDepth,
                                        onInput: (e) => { localSettings.syncHistoryDepth = parseInt(e.target.value) || 0; },
                                        onChange: saveSettings,
                                        min: 0,
                                        max: 1000,
                                        class: 'settings-input mp-input-narrow'
                                    }),
                                    h('small', { class: 'hint' }, '限制同步的历史消息数量，0为全部')
                                ])
                                : null,

                            settingsTab.value === 'general'
                                ? h('div', { class: ['setting-item', 'toggle-item', 'mp-mt-2'] }, [
                                    h('div', {
                                        class: 'toggle-label',
                                        onClick: () => { localSettings.sendUserPersona = !localSettings.sendUserPersona; saveSettings(); }
                                    }, [
                                        h('span', {}, '发送用户设定:'),
                                        h('span', { class: ['toggle-switch', { active: localSettings.sendUserPersona }] })
                                    ]),
                                    h('small', { class: 'hint' }, '开启后提交输入时会将酒馆用户设定同步给房主')
                                ])
                                : null,

                            (settingsTab.value === 'general' && localSettings.sendUserPersona)
                                ? h('div', { class: ['setting-item', 'mp-mt-1'] }, [
                                    h('label', {}, '设定前缀:'),
                                    h('input', {
                                        value: localSettings.personaPrefix,
                                        onInput: (e) => { localSettings.personaPrefix = e.target.value; },
                                        onChange: saveSettings,
                                        placeholder: '例如: [{name}]的设定:',
                                        class: 'settings-input'
                                    }),
                                    h('small', { class: 'hint' }, `当前设定前缀预览：${applyNameToken(localSettings.personaPrefix || '[{name}]的设定:')}`)
                                ])
                                : null,

                            settingsTab.value === 'general'
                                ? h('div', { class: ['setting-item', 'message-prefix-setting', 'mp-mt-1'] }, [
                                    h('label', {}, '消息前缀:'),
                                    h('input', {
                                        value: localSettings.messagePrefix,
                                        onInput: (e) => { localSettings.messagePrefix = e.target.value; },
                                        onChange: saveSettings,
                                        placeholder: '例如: [{name}]',
                                        class: 'settings-input'
                                    }),
                                    h('small', { class: 'hint' }, '使用 {name}，默认按用户设定角色名替换')
                                ])
                                : null,

                            settingsTab.value === 'general'
                                ? h('div', { class: ['setting-item', 'mp-mt-1'] }, [
                                    h('label', {}, '消息后缀:'),
                                    h('input', {
                                        value: localSettings.messageSuffix,
                                        onInput: (e) => { localSettings.messageSuffix = e.target.value; },
                                        onChange: saveSettings,
                                        placeholder: '例如: desu!!',
                                        class: 'settings-input'
                                    })
                                ])
                                : null,

                            settingsTab.value === 'general'
                                ? h('div', { class: 'preview-box' }, [
                                    h('div', {}, [
                                        h('span', { class: 'preview-label' }, '消息预览:'),
                                        h('span', { class: 'preview-text' }, previewText.value)
                                    ]),
                                    h('div', { class: 'mp-mt-2' }, [
                                        h('span', { class: 'preview-label' }, '用户设定发送预览:'),
                                        h('span', { class: 'preview-text' }, personaPreviewText.value)
                                    ])
                                ])
                                : null
                        ].filter(Boolean))
                    ])
                ]) : null
            ]);
        };
    }
});



// ==========================================
// 9. 挂载与初始化 
// ==========================================
let _app = null; // 模块级变量，用于 unload 时 unmount
let _unloadHandler = null; // 防重复绑定 unload


// JS-Slash-Runner iframe 中 DOM 可能已 ready，用兼容写法确保执行
const bootstrap = () => {
    const CONTAINER_ID = 'st-multiplayer-container-v2';
    const targetDoc = parentWindow.document;

    // 二次防抖清理：先清掉残留事件监听（热重载/重复执行时避免叠加）
    offAllTrackedEvents();

    // 若旧容器存在，先尝试卸载旧 app 再移除容器
    const existed = targetDoc.getElementById(CONTAINER_ID);
    if (existed) {
        try { _app?.unmount(); } catch (e) {}
        existed.remove();
    }

    // 注入样式
    injectStyles();

    // 创建挂载点 — 面板需要挂到父窗口的 body 上才能在酒馆主界面可见
    const container = targetDoc.createElement('div');
    container.id = CONTAINER_ID;
    targetDoc.body.appendChild(container);

    const pinia = createPinia();
    _app = createApp(MultiplayerPanel);
    _app.use(pinia);
    _app.mount(container);


    const store = useMultiplayerStore();
    initSTHooks(store);
    initACUSync(store);
    initSpoilerEngine();

    if (_unloadHandler) {
        window.removeEventListener('unload', _unloadHandler);
    }

    _unloadHandler = () => {
        try {
            const s = useMultiplayerStore();
            if (s.isConnected) s.getClient()?.disconnect();
        } catch (e) {}

        offAllTrackedEvents();

        try {
            const win = window.top || window.parent || window;
            const api = win.AutoCardUpdaterAPI;
            const cbKey = '__st_multiplayer_acu_registered_callback_v1__';
            const cb = win[cbKey];

            if (cb && typeof api?.unregisterTableUpdateCallback === 'function') {
                api.unregisterTableUpdateCallback(cb);
            }

            delete win[cbKey];
            delete win.__st_multiplayer_acu_callback_registered_v1__;
        } catch (e) {}

        try { _app?.unmount(); } catch (e) {}

        const doc = (parentWindow.document || document);

        const old = doc.getElementById(CONTAINER_ID);
        if (old) old.remove();

        const oldStyle = doc.getElementById(STYLE_ID);
        if (oldStyle) oldStyle.remove();
    };

    window.addEventListener('unload', _unloadHandler);
    const toastr = parentWindow.toastr || window.toastr;
    toastr?.success('联机工具 已加载完毕！', '');
};

// 兼容 jQuery 存在/不存在两种情况
if ($ && typeof $ === 'function') {
    $(bootstrap);
} else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
