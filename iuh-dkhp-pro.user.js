// ==UserScript==
// @name         IUH DKHP Pro - Mobile & Desktop (Turbo + WakeLock Edition)
// @namespace    https://dkhp.iuh.edu.vn/
// @version      1.3.0
// @description  Tool hỗ trợ sinh viên IUH đăng ký học phần, săn slot lớp đầy, auto click giờ G, giữ phiên, giữ sáng màn hình (WakeLock) và Turbo Vượt Lag trên Tampermonkey Mobile & Desktop.
// @author       IUH Student Support
// @match        *://dkhp.iuh.edu.vn/*
// @match        *://sv.iuh.edu.vn/*
// @match        *://*.iuh.edu.vn/*
// @match        http://localhost/*
// @match        http://127.0.0.1/*
// @match        file:///*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_notification
// @grant        GM_addStyle
// @grant        unsafeWindow
// @homepageURL  https://github.com/milu1219/dkhpiux_mobile
// @downloadURL  https://raw.githubusercontent.com/milu1219/dkhpiux_mobile/main/iuh-dkhp-pro.user.js
// @updateURL    https://raw.githubusercontent.com/milu1219/dkhpiux_mobile/main/iuh-dkhp-pro.user.js
// ==/UserScript==

/**
 * IUH DKHP Pro - All-in-One Userscript (Mobile & Desktop Ultra Optimized)
 * - Giữ nguyên 100% logic crawl / request / auto-click đăng ký A-Z (Multi-stage Zero-Delay 20ms).
 * - Loại bỏ hoàn toàn popup.html -> Tích hợp Floating Action Button (FAB) hỗ trợ kéo thả cảm ứng (Touch & Mouse) + Bảng điều khiển nổi tối ưu cho Mobile & Desktop.
 * - Tối ưu hóa toàn bộ Query Selectors tương thích cả giao diện Mobile (bảng thu gọn, thẻ card/list, stacked cells) lẫn Desktop của dkhp.iuh.edu.vn & sv.iuh.edu.vn.
 * - Tích hợp navigator.wakeLock tự động giữ màn hình luôn sáng trong suốt lúc vòng lặp canh môn đang chạy (tự động cấp lại quyền khi quay lại tab).
 */

(function () {
  'use strict';

  const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

  // Tránh khởi tạo trùng lặp
  if (window.__IUH_DKHP_PRO_USERSCRIPT_INJECTED__ || pageWindow.__IUH_DKHP_PRO_USERSCRIPT_INJECTED__) return;
  window.__IUH_DKHP_PRO_USERSCRIPT_INJECTED__ = true;
  try {
    pageWindow.__IUH_DKHP_PRO_USERSCRIPT_INJECTED__ = true;
  } catch (_) {}

  console.log('[IUH DKHP Pro - Mobile Userscript] Đã khởi tạo thành công!');

  // =========================================================
  // 1. NHÚNG CSS GIAO DIỆN (FAB + HUD MOBILE & DESKTOP + TURBO)
  // =========================================================
  const STYLES = `
    :root {
      --iuh-primary: #004d99;
      --iuh-primary-hover: #003366;
      --iuh-accent: #f39c12;
      --iuh-accent-hover: #e67e22;
      --iuh-success: #27ae60;
      --iuh-danger: #e74c3c;
      --iuh-dark: #1a252f;
      --iuh-light: #f8fafc;
      --iuh-border: #cbd5e1;
      --iuh-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15);
    }

    /* Chế độ Turbo: Ẩn tài nguyên ảnh/media nặng nhưng giữ nguyên Captcha & UI của Tool */
    html.iuh-turbo-active img:not([src*="captcha" i]):not([id*="captcha" i]):not([class*="captcha" i]):not([alt*="captcha" i]):not([src*="MaBaoVe" i]):not(.iuh-keep-img),
    html.iuh-turbo-active video,
    html.iuh-turbo-active iframe:not([src*="captcha" i]) {
      display: none !important;
    }

    /* Floating Action Button (FAB) ở góc dưới màn hình - Hỗ trợ kéo thả cảm ứng */
    #iuh-dkhp-fab {
      position: fixed;
      bottom: 20px;
      right: 16px;
      height: 46px;
      min-width: 46px;
      padding: 0 14px;
      border-radius: 23px;
      background: linear-gradient(135deg, #004d99 0%, #002855 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: grab;
      box-shadow: 0 6px 20px rgba(0, 40, 85, 0.45);
      z-index: 2147483647;
      border: 2px solid #f39c12;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      font-weight: 700;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      -webkit-tap-highlight-color: transparent;
      transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
    }

    #iuh-dkhp-fab:active {
      cursor: grabbing;
      transform: scale(0.96);
    }

    #iuh-dkhp-fab.hunting {
      background: linear-gradient(135deg, #065f46 0%, #047857 100%);
      border-color: #4ade80;
      box-shadow: 0 0 16px rgba(34, 197, 94, 0.65);
    }

    #iuh-dkhp-fab .iuh-fab-icon {
      font-size: 16px;
      line-height: 1;
    }

    #iuh-dkhp-fab .iuh-mini-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #94a3b8;
      border: 2px solid #fff;
      flex-shrink: 0;
    }

    #iuh-dkhp-fab .iuh-mini-dot.running {
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
      animation: iuh-pulse 1.4s infinite;
    }

    #iuh-dkhp-fab .iuh-fab-badge {
      background: #f39c12;
      color: #000;
      font-size: 10px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 10px;
      line-height: 1.3;
    }

    /* Bảng điều khiển nổi (Floating Control Panel / HUD) */
    #iuh-dkhp-hud {
      position: fixed;
      bottom: 76px;
      right: 16px;
      width: 375px;
      max-width: calc(100vw - 20px);
      max-height: calc(100vh - 96px);
      background: #ffffff;
      border-radius: 14px;
      box-shadow: var(--iuh-shadow);
      border: 1.5px solid rgba(0, 77, 153, 0.3);
      z-index: 2147483646;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 13px;
      color: #334155;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      contain: layout style;
      transform: translateZ(0);
      -webkit-tap-highlight-color: transparent;
    }

    #iuh-dkhp-hud * {
      box-sizing: border-box;
    }

    /* Draggable Header (Hỗ trợ cả Touch & Mouse) */
    .iuh-hud-header {
      background: linear-gradient(135deg, #004d99 0%, #002855 100%);
      color: #ffffff;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: move;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      border-bottom: 2px solid #f39c12;
      flex-shrink: 0;
    }

    .iuh-hud-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 13.5px;
      letter-spacing: 0.2px;
      flex-wrap: wrap;
    }

    .iuh-hud-title .iuh-badge {
      background: #f39c12;
      color: #000;
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 5px;
      font-weight: 800;
    }

    .iuh-hud-controls {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .iuh-hud-btn-icon {
      background: rgba(255, 255, 255, 0.18);
      border: none;
      color: #fff;
      width: 28px;
      height: 28px;
      border-radius: 7px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      transition: background 0.2s;
    }

    .iuh-hud-btn-icon:hover,
    .iuh-hud-btn-icon:active {
      background: rgba(255, 255, 255, 0.35);
    }

    /* Navigation Tabs */
    .iuh-hud-tabs {
      display: flex;
      background: #f1f5f9;
      border-bottom: 1px solid #e2e8f0;
      overflow-x: auto;
      scrollbar-width: none;
      flex-shrink: 0;
    }

    .iuh-hud-tabs::-webkit-scrollbar {
      display: none;
    }

    .iuh-hud-tab {
      flex: 1;
      min-width: 64px;
      padding: 9px 4px;
      text-align: center;
      background: none;
      border: none;
      border-bottom: 2.5px solid transparent;
      font-size: 11.5px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .iuh-hud-tab.active {
      color: #004d99;
      border-bottom-color: #004d99;
      background: #ffffff;
    }

    /* Tab Content Areas */
    .iuh-hud-body {
      padding: 12px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      flex: 1;
      max-height: 68vh;
    }

    .iuh-tab-pane {
      display: none;
    }

    .iuh-tab-pane.active {
      display: block;
    }

    /* Status & WakeLock Banner */
    .iuh-status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 10px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .iuh-status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
      font-size: 12px;
    }

    .iuh-status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #94a3b8;
    }

    .iuh-status-dot.running {
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
      animation: iuh-pulse 1.5s infinite;
    }

    .iuh-wakelock-pill {
      font-size: 10.5px;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 8px;
      background: #e2e8f0;
      color: #475569;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    .iuh-wakelock-pill.active {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    @keyframes iuh-pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.15); }
      100% { opacity: 1; transform: scale(1); }
    }

    /* Input Group & Controls */
    .iuh-input-group {
      display: flex;
      gap: 6px;
      margin-bottom: 10px;
    }

    .iuh-input {
      flex: 1;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      font-size: 13px;
      outline: none;
      background: #fff;
      color: #1e293b;
      transition: border-color 0.2s;
    }

    .iuh-input:focus {
      border-color: #004d99;
      box-shadow: 0 0 0 2px rgba(0, 77, 153, 0.15);
    }

    .iuh-btn {
      padding: 9px 12px;
      border-radius: 7px;
      border: none;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.15s;
      touch-action: manipulation;
    }

    .iuh-btn:active {
      transform: scale(0.98);
    }

    .iuh-btn-primary { background: #004d99; color: #fff; }
    .iuh-btn-primary:hover { background: #003366; }

    .iuh-btn-success { background: #16a34a; color: #fff; }
    .iuh-btn-success:hover { background: #15803d; }

    .iuh-btn-danger { background: #dc2626; color: #fff; }
    .iuh-btn-danger:hover { background: #b91c1c; }

    .iuh-btn-secondary { background: #e2e8f0; color: #334155; }
    .iuh-btn-secondary:hover { background: #cbd5e1; }

    .iuh-btn-warning { background: #f59e0b; color: #fff; }
    .iuh-btn-warning:hover { background: #d97706; }

    .iuh-btn-block {
      width: 100%;
      padding: 10px;
      margin-top: 6px;
      font-size: 13px;
    }

    /* Targets List */
    .iuh-targets-title {
      font-weight: 700;
      font-size: 11.5px;
      color: #475569;
      margin: 8px 0 6px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .iuh-targets-list {
      max-height: 150px;
      overflow-y: auto;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #f8fafc;
      padding: 4px;
      margin-bottom: 10px;
    }

    .iuh-target-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 8px;
      background: #ffffff;
      border-radius: 6px;
      margin-bottom: 4px;
      border: 1px solid #e2e8f0;
    }

    .iuh-target-item:last-child {
      margin-bottom: 0;
    }

    .iuh-target-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }

    .iuh-target-code {
      font-weight: 700;
      font-size: 12.5px;
      color: #004d99;
    }

    .iuh-target-status {
      font-size: 10.5px;
      color: #64748b;
    }

    .iuh-target-status.open { color: #16a34a; font-weight: 700; }
    .iuh-target-status.full { color: #dc2626; }
    .iuh-target-status.registered { color: #0284c7; font-weight: 700; }

    .iuh-btn-del {
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
    }

    .iuh-btn-del:hover,
    .iuh-btn-del:active {
      color: #dc2626;
      background: #fee2e2;
    }

    /* Settings and Options */
    .iuh-setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 7px 0;
      border-bottom: 1px dashed #e2e8f0;
      font-size: 12px;
      gap: 8px;
    }

    .iuh-setting-row:last-child {
      border-bottom: none;
    }

    .iuh-setting-label {
      display: flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      flex: 1;
    }

    .iuh-setting-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
      flex-shrink: 0;
    }

    /* Console Log View */
    .iuh-log-container {
      background: #0f172a;
      color: #38bdf8;
      font-family: Consolas, Monaco, "Courier New", monospace;
      font-size: 11px;
      padding: 8px;
      border-radius: 8px;
      height: 185px;
      overflow-y: auto;
      line-height: 1.45;
      margin-top: 8px;
      border: 1px solid #1e293b;
    }

    .iuh-log-line {
      margin-bottom: 3px;
      word-break: break-word;
    }

    .iuh-log-line.success { color: #4ade80; font-weight: bold; }
    .iuh-log-line.warn { color: #facc15; }
    .iuh-log-line.error { color: #f87171; }
    .iuh-log-line.info { color: #38bdf8; }
    .iuh-log-time { color: #94a3b8; margin-right: 4px; }

    /* Inline Injected Buttons on IUH Web Table / Mobile Cards */
    .iuh-inline-add-btn {
      background: linear-gradient(135deg, #004d99 0%, #0284c7 100%) !important;
      color: #ffffff !important;
      border: none !important;
      border-radius: 5px !important;
      padding: 4px 8px !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
      margin-left: 6px !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 3px !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15) !important;
      vertical-align: middle !important;
      touch-action: manipulation !important;
    }

    .iuh-inline-add-btn.added {
      background: #16a34a !important;
    }

    /* Highlighting styles on target tables & mobile cards */
    .iuh-highlight-open {
      background-color: rgba(34, 197, 94, 0.14) !important;
    }

    .iuh-highlight-target {
      background-color: rgba(245, 158, 11, 0.2) !important;
      border-left: 4px solid #f59e0b !important;
    }

    .iuh-row-full {
      opacity: 0.55;
    }

    .iuh-row-hidden {
      display: none !important;
    }

    /* Turbo & Ping Styles */
    .iuh-ping-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .iuh-ping-badge.good {
      background: rgba(34, 197, 94, 0.25);
      color: #4ade80;
      border: 1px solid rgba(74, 222, 128, 0.4);
    }

    .iuh-ping-badge.medium {
      background: rgba(245, 158, 11, 0.25);
      color: #fde047;
      border: 1px solid rgba(253, 224, 71, 0.4);
    }

    .iuh-ping-badge.bad {
      background: rgba(239, 68, 68, 0.25);
      color: #fca5a5;
      border: 1px solid rgba(252, 165, 165, 0.4);
      animation: iuh-pulse 1s infinite;
    }

    .iuh-turbo-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 9px 11px;
      margin-bottom: 8px;
    }

    .iuh-turbo-card.active {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .iuh-turbo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .iuh-turbo-title {
      font-weight: 700;
      font-size: 12.5px;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .iuh-turbo-desc {
      font-size: 11px;
      color: #64748b;
      line-height: 1.35;
    }

    .iuh-toggle-switch {
      position: relative;
      display: inline-block;
      width: 38px;
      height: 20px;
      flex-shrink: 0;
    }

    .iuh-toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .iuh-toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #cbd5e1;
      transition: 0.25s;
      border-radius: 20px;
    }

    .iuh-toggle-slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.25s;
      border-radius: 50%;
    }

    .iuh-toggle-switch input:checked + .iuh-toggle-slider {
      background-color: #16a34a;
    }

    .iuh-toggle-switch input:checked + .iuh-toggle-slider:before {
      transform: translateX(18px);
    }

    .iuh-network-stats {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    .iuh-stat-box {
      flex: 1;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px;
      text-align: center;
    }

    .iuh-stat-val {
      font-size: 13px;
      font-weight: 800;
      color: #004d99;
    }

    .iuh-stat-lbl {
      font-size: 10px;
      color: #64748b;
    }

    @media (max-width: 480px) {
      #iuh-dkhp-hud {
        right: 10px;
        left: 10px;
        bottom: 72px;
        width: auto;
        max-width: none;
      }
      .iuh-input {
        font-size: 16px; /* Chống iOS Safari tự động zoom khi focus vào ô input */
      }
    }
  `;

  function injectStyles() {
    try {
      if (typeof GM_addStyle === 'function') {
        GM_addStyle(STYLES);
        return;
      }
    } catch (_) {}
    const styleEl = document.createElement('style');
    styleEl.id = 'iuh-dkhp-pro-styles';
    styleEl.textContent = STYLES;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  injectStyles();

  // =========================================================
  // 2. NHÚNG MAIN-WORLD HOOKS (XHR, FETCH, ALERT, RELOAD BẢNG)
  // =========================================================
  function mainWorldScript() {
    if (window.__IUH_DKHP_MAIN_INJECTED__) return;
    window.__IUH_DKHP_MAIN_INJECTED__ = true;

    const isDkhpUrl = function (url) {
      const u = String(url || '');
      return (
        u.includes('DangKy') ||
        u.includes('LopHocPhan') ||
        u.includes('HocPhan') ||
        u.includes('SinhVien') ||
        u.includes('api') ||
        u.includes('action')
      );
    };

    // 1. Hook XMLHttpRequest.prototype an toàn
    try {
      const origOpen = XMLHttpRequest.prototype.open;
      const origSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function (method, url) {
        this.__iuhMethod = method;
        this.__iuhUrl = String(url || '');
        return origOpen.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function () {
        const xhr = this;
        const url = xhr.__iuhUrl || '';

        if (isDkhpUrl(url)) {
          xhr.addEventListener('load', function () {
            try {
              if (xhr.status >= 500 || xhr.status === 0) {
                window.postMessage(
                  {
                    source: 'IUH_DKHP_INJECTED',
                    type: 'SERVER_NETWORK_ERROR',
                    url: url,
                    status: xhr.status,
                    statusText: xhr.statusText
                  },
                  '*'
                );
              } else {
                window.postMessage(
                  {
                    source: 'IUH_DKHP_INJECTED',
                    type: 'XHR_RESPONSE',
                    url: url,
                    status: xhr.status,
                    response: typeof xhr.responseText === 'string' ? xhr.responseText : ''
                  },
                  '*'
                );
              }
            } catch (_) {}
          });

          xhr.addEventListener('error', function () {
            try {
              window.postMessage(
                {
                  source: 'IUH_DKHP_INJECTED',
                  type: 'SERVER_NETWORK_ERROR',
                  url: url,
                  status: 0,
                  statusText: 'Network Connection Failed'
                },
                '*'
              );
            } catch (_) {}
          });

          xhr.addEventListener('timeout', function () {
            try {
              window.postMessage(
                {
                  source: 'IUH_DKHP_INJECTED',
                  type: 'SERVER_NETWORK_ERROR',
                  url: url,
                  status: 504,
                  statusText: 'Gateway / Connection Timed Out'
                },
                '*'
              );
            } catch (_) {}
          });
        }

        return origSend.apply(this, arguments);
      };
    } catch (e) {
      console.warn('[IUH DKHP Pro] Không thể hook XMLHttpRequest:', e);
    }

    // 2. Hook window.fetch cho các cổng dùng Fetch API trên mobile/desktop
    try {
      if (typeof window.fetch === 'function') {
        const origFetch = window.fetch;
        window.fetch = function (input, init) {
          const url = typeof input === 'string' ? input : (input && input.url) || '';
          const p = origFetch.apply(this, arguments);
          if (isDkhpUrl(url) && !url.includes('favicon.ico')) {
            p.then(function (res) {
              if (res.status >= 500) {
                window.postMessage(
                  {
                    source: 'IUH_DKHP_INJECTED',
                    type: 'SERVER_NETWORK_ERROR',
                    url: url,
                    status: res.status,
                    statusText: res.statusText
                  },
                  '*'
                );
              } else {
                try {
                  res.clone().text().then(function (txt) {
                    window.postMessage(
                      {
                        source: 'IUH_DKHP_INJECTED',
                        type: 'FETCH_RESPONSE',
                        url: url,
                        status: res.status,
                        response: txt || ''
                      },
                      '*'
                    );
                  }).catch(function () {});
                } catch (_) {}
              }
            }).catch(function () {});
          }
          return p;
        };
      }
    } catch (_) {}

    // 3. Hook window.alert để ghi nhận thông báo hệ thống
    try {
      const originalAlert = window.alert;
      window.alert = function (msg) {
        window.postMessage(
          {
            source: 'IUH_DKHP_INJECTED',
            type: 'WINDOW_ALERT',
            message: String(msg)
          },
          '*'
        );
        return originalAlert.apply(this, arguments);
      };
    } catch (_) {}

    // 4. Lắng nghe lệnh gọi hàm gốc từ Userscript
    window.addEventListener('message', function (event) {
      if (!event.data || event.data.target !== 'IUH_DKHP_INJECTED_INVOKE') return;
      const funcName = event.data.funcName;
      const args = event.data.args;

      if (funcName === '__RELOAD_DKHP_TABLES__') {
        try {
          if (window.jQuery) {
            const $ = window.jQuery;
            $('select').not('#iuh-dkhp-hud select').each(function () {
              if ($(this).val()) $(this).trigger('change');
            });
            $('input[type="radio"]:checked').not('#iuh-dkhp-hud input').each(function () {
              $(this).trigger('click').trigger('change');
            });
          }

          const candidateFuncs = [
            'LoadDanhSachHocPhan',
            'LayDanhSachHocPhanChoDangKy',
            'GetDanhSachHocPhanChoDangKy',
            'LoadHocPhanChoDangKy',
            'loadDanhSachLopHocPhan',
            'TimKiemHocPhan'
          ];
          for (let i = 0; i < candidateFuncs.length; i++) {
            const fn = candidateFuncs[i];
            if (typeof window[fn] === 'function') {
              window[fn]();
              break;
            }
          }
        } catch (err) {
          console.warn('[IUH DKHP Pro] Lỗi khi reload bảng:', err);
        }
        return;
      }

      if (typeof window[funcName] === 'function') {
        try {
          window[funcName].apply(window, args || []);
        } catch (_) {}
      }
    });
  }

  function injectMainWorldHook() {
    try {
      const script = document.createElement('script');
      script.textContent = '(' + mainWorldScript.toString() + ')();';
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    } catch (_) {}

    // Fallback chạy trực tiếp trên pageWindow nếu CSP chặn inline script
    try {
      if (!pageWindow.__IUH_DKHP_MAIN_INJECTED__) {
        mainWorldScript.call(pageWindow);
      }
    } catch (_) {}
  }

  injectMainWorldHook();

  // =========================================================
  // 3. STATE QUẢN LÝ & WAKE LOCK (GIỮ MÀN HÌNH SÁNG KHI SĂN)
  // =========================================================
  const state = {
    isRunning: false,
    timerId: null,
    keepAliveTimerId: null,
    pingTimerId: null,
    wakeLockSentinel: null,
    sessionStartTime: Date.now(),
    targets: [], // [{ code: '420300123401', practiceGroup: '', status: 'idle', name: '' }]
    retryCount: 0,
    currentPing: -1,
    settings: {
      autoRegister: true,
      intervalMs: 500,
      soundAlert: true,
      keepScreenAwake: true,     // Tích hợp navigator.wakeLock giữ sáng màn hình khi đang săn
      antiLogout: true,
      antiLogoutMinutes: 2,
      autoSelectPractice: true,
      notifySystem: true,
      hideFullClasses: false,
      highlightOpenClasses: true,
      stopOnSuccess: true,
      isMinimized: true,         // Mặc định chỉ hiện nút nổi FAB gọn gàng
      autoOpenHUD: false,
      fabPosition: null,         // Vị trí nút nổi FAB đã kéo thả { left, top }
      // TURBO & ZERO-DELAY SETTINGS:
      turboMode: true,
      zeroDelayMode: true,
      autoRetryOn50x: true,
      maxRetries: 5,
      retryDelayMs: 300,
      // AUTO-LOGIN & AUTO-RESUME SETTINGS:
      autoLoginEnabled: true,
      autoRedirectDkhp: true,
      savedUsername: '',
      savedPassword: ''
    },
    logs: []
  };

  // Quản lý Screen Wake Lock API (navigator.wakeLock)
  async function requestWakeLock() {
    if (!state.settings.keepScreenAwake) {
      updateWakeLockUI(false);
      return;
    }
    if (!('wakeLock' in navigator) || !navigator.wakeLock || typeof navigator.wakeLock.request !== 'function') {
      updateWakeLockUI(false, 'Không hỗ trợ');
      return;
    }
    try {
      if (state.wakeLockSentinel && !state.wakeLockSentinel.released) {
        updateWakeLockUI(true);
        return;
      }
      state.wakeLockSentinel = await navigator.wakeLock.request('screen');
      updateWakeLockUI(true);
      addLog('🔆 [WakeLock] Đã kích hoạt giữ màn hình luôn sáng trong lúc săn môn!', 'info');

      state.wakeLockSentinel.addEventListener('release', () => {
        updateWakeLockUI(false);
        if (state.isRunning && document.visibilityState === 'visible' && state.settings.keepScreenAwake) {
          requestWakeLock();
        }
      });
    } catch (err) {
      updateWakeLockUI(false);
      console.warn('[IUH DKHP Pro] Không thể yêu cầu WakeLock:', err);
    }
  }

  async function releaseWakeLock() {
    try {
      if (state.wakeLockSentinel) {
        await state.wakeLockSentinel.release();
        state.wakeLockSentinel = null;
      }
    } catch (_) {}
    updateWakeLockUI(false);
  }

  function updateWakeLockUI(isActive, customText) {
    const pill = document.getElementById('iuh-wakelock-indicator');
    if (!pill) return;
    if (isActive) {
      pill.className = 'iuh-wakelock-pill active';
      pill.textContent = '🔆 Màn hình: Luôn sáng';
    } else {
      pill.className = 'iuh-wakelock-pill';
      pill.textContent = customText ? `🌙 ${customText}` : '🌙 WakeLock: Tắt';
    }
  }

  // Tự động cấp lại WakeLock khi người dùng mở lại màn hình / chuyển lại tab đang chạy săn môn trên Mobile
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.isRunning && state.settings.keepScreenAwake) {
      requestWakeLock();
    }
  });

  window.addEventListener('focus', () => {
    if (state.isRunning && state.settings.keepScreenAwake) {
      requestWakeLock();
    }
  });

  // Nếu Auto-Resume kích hoạt săn tự động khi vừa tải trang, đảm bảo cấp lại WakeLock ngay khi chạm màn hình
  document.addEventListener(
    'touchstart',
    () => {
      if (state.isRunning && state.settings.keepScreenAwake && (!state.wakeLockSentinel || state.wakeLockSentinel.released)) {
        requestWakeLock();
      }
    },
    { passive: true }
  );

  // Quản lý chế độ Turbo Vượt Lag trong Userscript
  function applyTurboMode(enabled) {
    if (enabled) {
      document.documentElement.classList.add('iuh-turbo-active');
    } else {
      document.documentElement.classList.remove('iuh-turbo-active');
    }
  }

  // Thông báo hệ thống & Rung phản hồi trên điện thoại
  function sendSystemNotification(title, body) {
    try {
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch (_) {}

    if (!state.settings.notifySystem) return;
    try {
      if (typeof GM_notification === 'function') {
        GM_notification({
          title: title || 'IUH DKHP PRO',
          text: body || 'Đã có sự kiện đăng ký học phần!',
          timeout: 5000
        });
        return;
      }
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title || 'IUH DKHP PRO', { body: body });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') new Notification(title || 'IUH DKHP PRO', { body: body });
          });
        }
      }
    } catch (_) {}
  }

  // =========================================================
  // 4. ÂM THANH BÁO HIỆU (Web Audio API Synthesizer)
  // =========================================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq, duration, type = 'sine', startTimeOffset = 0) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTimeOffset);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + startTimeOffset);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTimeOffset + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTimeOffset);
      osc.stop(ctx.currentTime + startTimeOffset + duration);
    } catch (_) {}
  }

  function playSoundAlert(type) {
    if (!state.settings.soundAlert) return;
    try {
      if (type === 'success') {
        playTone(523.25, 0.12, 'triangle', 0);
        playTone(659.25, 0.12, 'triangle', 0.13);
        playTone(783.99, 0.14, 'triangle', 0.26);
        playTone(1046.50, 0.35, 'triangle', 0.40);
      } else if (type === 'slot_found') {
        playTone(880, 0.1, 'sine', 0);
        playTone(1174.66, 0.2, 'sine', 0.12);
      } else if (type === 'error' || type === 'warn') {
        playTone(330, 0.15, 'sawtooth', 0);
        playTone(220, 0.25, 'sawtooth', 0.15);
      }
    } catch (_) {}
  }

  // =========================================================
  // 5. HỆ THỐNG GHI NHẬT KÝ (LOGS) - TỐI ƯU HÓA DOM
  // =========================================================
  function addLog(text, type = 'info') {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
    const logItem = { time: timeStr, text: text, type: type };
    state.logs.push(logItem);
    if (state.logs.length > 200) state.logs.shift();

    if (!state.settings.isMinimized) {
      const logContainer = document.getElementById('iuh-log-view');
      if (logContainer) {
        const line = document.createElement('div');
        line.className = `iuh-log-line ${type}`;
        line.innerHTML = `<span class="iuh-log-time">[${timeStr}]</span> ${escapeHTML(text)}`;
        logContainer.appendChild(line);
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }
  }

  function renderAllLogs() {
    const logContainer = document.getElementById('iuh-log-view');
    if (!logContainer) return;
    let html = '';
    state.logs.forEach((item) => {
      html += `<div class="iuh-log-line ${item.type}"><span class="iuh-log-time">[${item.time}]</span> ${escapeHTML(item.text)}</div>`;
    });
    logContainer.innerHTML = html;
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, (tag) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag
    ));
  }

  // =========================================================
  // 6. LOAD & SAVE CẤU HÌNH (GM STORAGE + LOCALSTORAGE FALLBACK)
  // =========================================================
  function loadConfig(callback) {
    try {
      let savedSettings = null;
      let savedTargets = null;

      if (typeof GM_getValue === 'function') {
        savedSettings = GM_getValue('dkhp_settings', null);
        savedTargets = GM_getValue('dkhp_targets', null);
      }

      if (!savedSettings) {
        const rawSettings = localStorage.getItem('__iuh_dkhp_settings__');
        if (rawSettings) savedSettings = JSON.parse(rawSettings);
      }
      if (!savedTargets) {
        const rawTargets = localStorage.getItem('__iuh_dkhp_targets__');
        if (rawTargets) savedTargets = JSON.parse(rawTargets);
      }

      if (savedSettings && typeof savedSettings === 'object') {
        state.settings = Object.assign(state.settings, savedSettings);
      }
      if (Array.isArray(savedTargets)) {
        state.targets = savedTargets;
      }
    } catch (e) {
      console.warn('[IUH DKHP Pro] Lỗi đọc cấu hình:', e);
    }

    applyTurboMode(state.settings.turboMode !== false);
    if (callback) callback();
  }

  function saveConfig() {
    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue('dkhp_settings', state.settings);
        GM_setValue('dkhp_targets', state.targets);
      }
    } catch (_) {}

    try {
      localStorage.setItem('__iuh_dkhp_settings__', JSON.stringify(state.settings));
      localStorage.setItem('__iuh_dkhp_targets__', JSON.stringify(state.targets));
    } catch (_) {}

    updateFabBadge();
  }

  // Đồng bộ danh sách mã LHP giữa các tab (vd: Chương trình khung <-> Đăng ký học phần)
  try {
    if (typeof GM_addValueChangeListener === 'function') {
      GM_addValueChangeListener('dkhp_targets', (name, oldVal, newVal, remote) => {
        if (remote && Array.isArray(newVal)) {
          state.targets = newVal;
          updateTargetUI();
          applyTableFilters();
          updateFabBadge();
        }
      });
    }
    window.addEventListener('storage', (e) => {
      if (e.key === '__iuh_dkhp_targets__' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            state.targets = parsed;
            updateTargetUI();
            applyTableFilters();
            updateFabBadge();
          }
        } catch (_) {}
      }
    });
  } catch (_) {}

  // =========================================================
  // 7. ĐO PING THỜI GIAN THỰC ĐẾN MÁY CHỦ IUH
  // =========================================================
  async function measurePing(showLog = false) {
    if (state.isRunning && !showLog) return;

    const start = performance.now();
    try {
      const pingTarget = (window.location.origin.includes('http') ? window.location.origin : '') + '/favicon.ico?_t=' + Date.now();
      await fetch(pingTarget, {
        method: 'HEAD',
        cache: 'no-store',
        mode: 'no-cors'
      });
      const latency = Math.round(performance.now() - start);
      state.currentPing = latency;
      updatePingUI(latency);
      if (showLog) {
        addLog(`📡 Ping đến máy chủ: ${latency}ms`, latency < 200 ? 'success' : 'warn');
      }
    } catch (err) {
      state.currentPing = -1;
      updatePingUI(-1);
      if (showLog) {
        addLog(`❌ Ping thất bại: Không kết nối được đến máy chủ (${err.message})`, 'error');
      }
    }
  }

  function updatePingUI(latency) {
    const badge = document.getElementById('iuh-ping-indicator');
    const liveVal = document.getElementById('iuh-ping-live-val');
    const netStatus = document.getElementById('iuh-net-status-val');

    if (latency < 0) {
      if (badge) {
        badge.className = 'iuh-ping-badge bad';
        badge.textContent = 'Mất kết nối 🔴';
      }
      if (liveVal) liveVal.textContent = 'Timeout';
      if (netStatus) {
        netStatus.textContent = 'Nghẽn/Sập';
        netStatus.style.color = '#ef4444';
      }
    } else {
      let cls = 'good';
      let statusText = 'Mượt mà';
      let color = '#16a34a';

      if (latency > 400) {
        cls = 'bad';
        statusText = 'Nghẽn nặng';
        color = '#ef4444';
      } else if (latency > 180) {
        cls = 'medium';
        statusText = 'Chậm/Lag';
        color = '#f59e0b';
      }

      if (badge) {
        badge.className = `iuh-ping-badge ${cls}`;
        badge.textContent = `Ping: ${latency}ms`;
      }
      if (liveVal) liveVal.textContent = `${latency} ms`;
      if (netStatus) {
        netStatus.textContent = statusText;
        netStatus.style.color = color;
      }
    }
  }

  // =========================================================
  // 8. MỞ KHÓA & NẠP LẠI BẢNG HỌC PHẦN (SOFT REFRESH)
  // =========================================================
  function softRefreshTable() {
    addLog('🔓 [Mở Khóa & Làm Mới] Đang khôi phục hiển thị và nạp lại danh sách môn học...', 'info');

    document.querySelectorAll('table, tbody, tr.iuh-row-hidden, tr.iuh-row-full, .iuh-row-hidden, .iuh-row-full, .hidden, .d-none').forEach((el) => {
      if (el.closest('#iuh-dkhp-hud') || el.closest('#iuh-dkhp-fab')) return;
      el.classList.remove('iuh-row-hidden', 'iuh-row-full', 'hidden', 'd-none');
      if (el.style && el.style.display === 'none' && (el.tagName === 'TR' || el.tagName === 'TBODY' || el.tagName === 'TABLE')) {
        el.style.display = '';
      }
    });

    document.querySelectorAll('select[disabled], input[type="radio"][disabled], button[disabled], input[type="button"][disabled]').forEach((el) => {
      if (el.closest('#iuh-dkhp-hud') || el.closest('#iuh-dkhp-fab')) return;
      el.disabled = false;
      el.removeAttribute('disabled');
    });

    const selects = document.querySelectorAll('select');
    for (let i = 0; i < selects.length; i++) {
      const sel = selects[i];
      if (sel.closest('#iuh-dkhp-hud')) continue;
      if (sel.options && sel.options.length > 0 && (sel.textContent || '').includes('HK')) {
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }

    const checkedRadio = document.querySelector('input[type="radio"]:checked');
    if (checkedRadio && !checkedRadio.closest('#iuh-dkhp-hud')) {
      checkedRadio.dispatchEvent(new Event('change', { bubbles: true }));
      checkedRadio.click();
    }

    window.postMessage(
      {
        target: 'IUH_DKHP_INJECTED_INVOKE',
        funcName: '__RELOAD_DKHP_TABLES__',
        args: []
      },
      '*'
    );

    setTimeout(() => {
      injectInlineButtons();
      applyTableFilters();
      addLog('✅ Đã gửi lệnh mở khóa và tải lại bảng học phần!', 'success');
    }, 500);
  }

  // =========================================================
  // 9. TỐI ƯU QUERY SELECTOR TƯƠNG THÍCH MOBILE & DESKTOP
  // =========================================================

  function isExcludedUI(el) {
    return !!(el && el.closest && (el.closest('#iuh-dkhp-hud') || el.closest('#iuh-dkhp-fab')));
  }

  function isVisible(el) {
    if (!el) return false;
    if (el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0) return true;
    try {
      const style = window.getComputedStyle(el);
      return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    } catch (_) {
      return false;
    }
  }

  // Tự động tích chọn ô "HIỂN THỊ LỚP HỌC PHẦN KHÔNG TRÙNG LỊCH" (Hỗ trợ cả giao diện Mobile & Desktop)
  function ensureNoScheduleConflictChecked() {
    try {
      // Cách 1: Tìm theo id/name/onclick/data-bind trên cả Desktop và Mobile
      let chk = document.querySelector(
        'input[type="checkbox"][id*="TrungLich" i], ' +
        'input[type="checkbox"][name*="TrungLich" i], ' +
        'input[type="checkbox"][onclick*="TrungLich" i], ' +
        'input[type="checkbox"][data-bind*="TrungLich" i], ' +
        '.chk-khong-trung-lich input[type="checkbox"]'
      );

      // Cách 2: Tìm theo nhãn text "không trùng lịch" (bao gồm cả cấu trúc label bọc ngoài hoặc đứng cạnh trên mobile)
      if (!chk) {
        const allInputs = document.querySelectorAll('input[type="checkbox"]');
        for (let i = 0; i < allInputs.length; i++) {
          const inp = allInputs[i];
          if (isExcludedUI(inp)) continue;
          const parentText =
            ((inp.parentElement && inp.parentElement.textContent) || '') +
            ' ' +
            ((inp.nextElementSibling && inp.nextElementSibling.textContent) || '') +
            ' ' +
            ((inp.previousElementSibling && inp.previousElementSibling.textContent) || '') +
            ' ' +
            ((inp.closest('label, .checkbox, .form-check, .custom-control') &&
              inp.closest('label, .checkbox, .form-check, .custom-control').textContent) ||
              '');
          if (parentText.toLowerCase().includes('không trùng lịch')) {
            chk = inp;
            break;
          }
        }
      }

      if (chk && !chk.checked) {
        simulateRealClick(chk);
        if (!chk.checked) {
          chk.checked = true;
          chk.dispatchEvent(new Event('change', { bubbles: true }));
        }
        addLog('✅ Đã tự động tích chọn "HIỂN THỊ LỚP HỌC PHẦN KHÔNG TRÙNG LỊCH"!', 'success');
        return true;
      }
    } catch (_) {}
    return false;
  }

  // Lấy text sạch của phần tử mà không bị lẫn chữ của nút [⚡ Săn]
  function getCleanText(el) {
    if (!el) return '';
    if (!el.querySelector || !el.querySelector('.iuh-inline-add-btn')) {
      return (el.textContent || '').trim();
    }
    const clone = el.cloneNode(true);
    clone.querySelectorAll('.iuh-inline-add-btn').forEach((b) => b.remove());
    return (clone.textContent || '').trim();
  }

  // Tìm mã HP (10 số) / mã LHP (12 số) trong cả dòng <tr> (Desktop/Mobile table) lẫn thẻ Card/List (Mobile view)
  function extractCodeFromRow(rowEl) {
    if (!rowEl) return null;

    // 1. Kiểm tra thuộc tính data-* hoặc input[value] (thường có trên giao diện Mobile hoặc radio button)
    const attrCandidates = [
      rowEl.getAttribute('data-malophocphan'),
      rowEl.getAttribute('data-mahocphan'),
      rowEl.getAttribute('data-code'),
      rowEl.getAttribute('data-id')
    ];
    const radioOrChk = rowEl.querySelector('input[type="radio"], input[type="checkbox"]');
    if (radioOrChk) {
      attrCandidates.push(radioOrChk.value, radioOrChk.id, radioOrChk.getAttribute('data-code'));
    }

    const cells = rowEl.cells && rowEl.cells.length
      ? Array.from(rowEl.cells)
      : Array.from(rowEl.querySelectorAll('td, [data-title], [data-label], .lhp-code, .mahp, .malhp, b, strong, span, div'));

    // Ưu tiên 1: Tìm ô chứa mã bắt đầu bằng 420... (chuẩn mã HP 10 số / mã LHP 12 số của IUH)
    for (let i = 0; i < cells.length; i++) {
      const cellText = getCleanText(cells[i]);
      const match = cellText.match(/(?:^|\D)(420\d{7,11})(?:\D|$)/);
      if (match) {
        return { code: match[1], cell: cells[i], cellIndex: i };
      }
    }

    // Ưu tiên 2: Kiểm tra trong thuộc tính data-* / value của input
    for (let i = 0; i < attrCandidates.length; i++) {
      const val = String(attrCandidates[i] || '').trim();
      const match = val.match(/(?:^|\D)(420\d{7,11}|\d{10,14})(?:\D|$)/);
      if (match) {
        return { code: match[1], cell: cells[1] || cells[0] || rowEl, cellIndex: 1 };
      }
    }

    // Ưu tiên 3: Tìm ô chứa dãy số độc lập từ 10 - 14 chữ số (mã LHP / mã HP chung)
    for (let i = 0; i < cells.length; i++) {
      const cellText = getCleanText(cells[i]);
      const match = cellText.match(/(?:^|\D)(\d{10,14})(?:\D|$)/);
      if (match) {
        return { code: match[1], cell: cells[i], cellIndex: i };
      }
    }

    return null;
  }

  // Tìm tất cả các dòng lớp học phần / môn học trên cả giao diện Bảng (Desktop/Mobile) và Card/List (Mobile)
  function findClassRows() {
    const rows = [];
    const allTrs = document.querySelectorAll('table tr');
    let currentTable = null;
    let inCompulsorySection = false;
    let compulsoryColIndex = -1;

    for (let i = 0; i < allTrs.length; i++) {
      const tr = allTrs[i];
      if (isExcludedUI(tr)) continue;

      const parentTable = tr.closest('table');
      if (parentTable !== currentTable) {
        currentTable = parentTable;
        inCompulsorySection = false;
        compulsoryColIndex = -1;
        if (parentTable) {
          const ths = parentTable.querySelectorAll('th');
          for (let h = 0; h < ths.length; h++) {
            const thText = (ths[h].textContent || '').toLowerCase();
            if (thText.includes('bắt buộc')) {
              compulsoryColIndex = h;
              break;
            }
          }
        }
      }

      if (tr.firstElementChild && tr.firstElementChild.tagName === 'TH') continue;

      const rowTextLower = (tr.textContent || '').toLowerCase();
      if (rowTextLower.includes('học phần bắt buộc')) {
        inCompulsorySection = true;
        continue;
      }
      if (rowTextLower.includes('học phần tự chọn')) {
        inCompulsorySection = false;
        continue;
      }

      // Bỏ qua các môn nằm trong mục HỌC PHẦN BẮT BUỘC (Chương trình khung)
      if (inCompulsorySection) continue;

      // Bỏ qua các môn có dấu tích ở cột "Bắt buộc" trên bảng Môn học chờ đăng ký
      if (compulsoryColIndex !== -1 && tr.cells && tr.cells[compulsoryColIndex]) {
        const compCell = tr.cells[compulsoryColIndex];
        const compText = (compCell.textContent || '').trim().toLowerCase();
        const hasCompIcon = compCell.querySelector(
          'i, img, svg, span[class*="check" i], span[class*="ok" i], input:checked'
        );
        if (hasCompIcon || compText === 'x' || compText === '✓' || compText === '✔' || compText === 'có') {
          continue;
        }
      }

      const hasInput = tr.querySelector('input[type="radio"], input[type="checkbox"]');
      const codeObj = extractCodeFromRow(tr);
      if (hasInput || codeObj) {
        rows.push(tr);
      }
    }

    // Hỗ trợ bổ sung cho giao diện Mobile dạng Card / List-Group nếu trang không render bằng <table>
    if (rows.length === 0) {
      const mobileItems = document.querySelectorAll(
        '.list-group-item, .lhp-item, .monhoc-item, .course-item, .card-hocphan, ' +
        'div[onclick*="LopHocPhan" i], div[onclick*="HocPhan" i], [data-malophocphan], [data-mahocphan]'
      );
      for (let i = 0; i < mobileItems.length; i++) {
        const item = mobileItems[i];
        if (isExcludedUI(item)) continue;
        const codeObj = extractCodeFromRow(item);
        const hasInput = item.querySelector('input[type="radio"], input[type="checkbox"]');
        if (codeObj || hasInput) {
          rows.push(item);
        }
      }
    }

    return rows;
  }

  // Trích xuất thông tin dòng lớp học phần tương thích cả bảng Desktop (nhiều cột) và bảng Mobile (cột gộp / rút gọn)
  function parseRowInfo(tr) {
    if (!tr) return null;
    const cells = tr.cells && tr.cells.length
      ? Array.from(tr.cells)
      : Array.from(tr.querySelectorAll('td, [data-title], [data-label], .cell, div, span'));
    if (!cells.length) return null;

    const codeObj = extractCodeFromRow(tr);
    const code = codeObj ? codeObj.code : '';
    const codeCell = codeObj ? codeObj.cell : (cells[1] || cells[0]);
    const codeCellIndex = codeObj ? codeObj.cellIndex : 1;

    const cellTexts = [];
    for (let i = 0; i < cells.length; i++) {
      cellTexts.push(getCleanText(cells[i]));
    }
    const rowText = getCleanText(tr).replace(/\s+/g, ' ');

    // Nhận diện cột/nhãn Trạng thái thông minh (tương thích cả Desktop, Simulator và Mobile gộp cột)
    let statusText = '';
    const statusBadge = tr.querySelector(
      '[id*="slot" i], [class*="badge" i], [class*="trangthai" i], [class*="status" i], ' +
      'td[data-title*="Trạng thái" i], td[data-label*="Trạng thái" i]'
    );
    if (statusBadge && !statusBadge.classList.contains('iuh-inline-add-btn')) {
      statusText = getCleanText(statusBadge);
    }

    if (!statusText) {
      // Quét các ô để tìm cụm từ trạng thái chuẩn của cổng IUH
      const statusKeywords = [
        'chờ sinh viên đăng ký',
        'chờ sinh viên đăng kí',
        'chấp nhận mở lớp',
        'đã khóa',
        'đang lên kế hoạch',
        'hết chỗ',
        'còn chỗ',
        'đã hủy',
        'đang mở'
      ];
      for (let i = cells.length - 1; i >= 0; i--) {
        const ctLower = (cellTexts[i] || '').toLowerCase();
        if (statusKeywords.some((kw) => ctLower.includes(kw)) || /còn\s+\d+\s+chỗ/i.test(ctLower)) {
          statusText = cellTexts[i];
          break;
        }
      }
    }

    if (!statusText && cells.length >= 5) {
      statusText = cellTexts[cells.length - 1];
    }

    const selectorInput = tr.querySelector('input[type="radio"], input[type="checkbox"]');

    let enrolled = -1;
    let max = -1;
    let remaining = -1;

    // Tính Sĩ số / Đã ĐK cho dòng Lớp học phần (Mã LHP >= 11 số)
    if (!code || code.length >= 11) {
      // Dạng 1: Phân số "59/60" (Rất phổ biến trên giao diện Mobile gộp cột & Simulator)
      const fractionMatch = rowText.match(/(\d{1,3})\s*[\/|\\]\s*(\d{1,3})/);
      if (fractionMatch) {
        enrolled = parseInt(fractionMatch[1], 10);
        max = parseInt(fractionMatch[2], 10);
        remaining = max - enrolled;
      } else {
        // Dạng 2: Nhãn Mobile "Sĩ số: 60 ... Đã ĐK: 59"
        const mobileMaxMatch = rowText.match(/(?:sĩ số|tối đa)\s*[:\-]?\s*(\d{1,3})/i);
        const mobileEnrolledMatch = rowText.match(/(?:đã đk|đã đăng ký)\s*[:\-]?\s*(\d{1,3})/i);
        if (mobileMaxMatch && mobileEnrolledMatch) {
          max = parseInt(mobileMaxMatch[1], 10);
          enrolled = parseInt(mobileEnrolledMatch[1], 10);
          remaining = max - enrolled;
        } else if (tr.cells && tr.cells.length > codeCellIndex + 1) {
          // Dạng 3: Bảng chuẩn Desktop (2 cột số nguyên cuối cùng sau cột Mã LHP là [Sĩ số tối đa, Đã đăng ký])
          const numericCols = [];
          for (let i = codeCellIndex + 1; i < tr.cells.length; i++) {
            const t = getCleanText(tr.cells[i]);
            if (/^\d{1,3}$/.test(t)) {
              numericCols.push(parseInt(t, 10));
            }
          }
          if (numericCols.length >= 2) {
            max = numericCols[numericCols.length - 2];
            enrolled = numericCols[numericCols.length - 1];
            remaining = max - enrolled;
          }
        }
      }
    }

    return {
      tr: tr,
      code: code,
      codeCell: codeCell,
      input: selectorInput,
      enrolled: enrolled,
      max: max,
      remaining: remaining,
      statusText: statusText,
      text: rowText
    };
  }

  // Tìm nút Đăng Ký trên trang IUH (Tương thích cả nút Desktop lẫn thanh sticky/action bar trên Mobile)
  function findRegisterButton() {
    const specificSelectors =
      '#btnDangKy, #btnDangKyHocPhan, #btnDangKyMonHoc, #btnLuu, #btnSubmit, .btn-dangky, .btnDangKy, ' +
      'button[id*="DangKy" i], input[id*="DangKy" i], a[id*="DangKy" i], ' +
      'button[name*="DangKy" i], input[name*="DangKy" i], ' +
      'button[onclick*="DangKy" i], input[onclick*="DangKy" i], a[onclick*="DangKy" i], ' +
      'button[ng-click*="DangKy" i], a[ng-click*="DangKy" i]';

    const specificList = document.querySelectorAll(specificSelectors);
    for (let i = 0; i < specificList.length; i++) {
      const el = specificList[i];
      if (isExcludedUI(el)) continue;
      if (isVisible(el)) {
        if (el.disabled) {
          el.disabled = false;
          el.removeAttribute('disabled');
        }
        return el;
      }
    }

    const candidates = document.querySelectorAll(
      'button, input[type="button"], input[type="submit"], a.btn, a[class*="btn"], [role="button"]'
    );

    for (let i = 0; i < candidates.length; i++) {
      const el = candidates[i];
      if (isExcludedUI(el) || el.classList.contains('iuh-inline-add-btn')) continue;

      if (el.tagName === 'A') {
        const href = (el.getAttribute('href') || '').trim();
        if (href && href !== '#' && !href.toLowerCase().startsWith('javascript:')) continue;
      }

      const val = (el.textContent || el.value || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (
        (val === 'đăng ký' ||
          val === 'đăng kí' ||
          val === 'đăng ký hp' ||
          val.includes('đăng ký môn học') ||
          val.includes('đăng kí môn học') ||
          val.includes('đăng ký học phần') ||
          val.includes('lưu đăng ký') ||
          val.includes('thực hiện đăng ký') ||
          val.includes('xác nhận đăng ký') ||
          val.includes('lưu vào') ||
          val.includes('đăng ký ngay')) &&
        isVisible(el)
      ) {
        if (el.disabled) {
          el.disabled = false;
          el.removeAttribute('disabled');
        }
        return el;
      }
    }

    return null;
  }

  // Tìm và tự động xác nhận hộp thoại Popup / Modal (SweetAlert, Bootstrap Modal, Bootbox, jConfirm trên Mobile & Desktop)
  function handleConfirmDialog() {
    const swalConfirm = document.querySelector(
      '.swal2-confirm, .swal-button--confirm, .sweet-alert button.confirm'
    );
    if (swalConfirm && isVisible(swalConfirm)) {
      addLog('⚡ Tự động xác nhận hộp thoại SweetAlert...', 'warn');
      simulateRealClick(swalConfirm);
      return true;
    }

    const modalConfirm = document.querySelector(
      '.modal.in .btn-primary, .modal.show .btn-primary, .modal .btn-success, ' +
      '.bootbox .btn-primary, .bootbox .btn-success, .bootbox-accept, ' +
      '.ui-dialog-buttonset button:first-child, .jconfirm-buttons button.btn-blue, .jconfirm-buttons button.btn-primary'
    );
    if (modalConfirm && isVisible(modalConfirm)) {
      addLog('⚡ Tự động xác nhận popup modal...', 'warn');
      simulateRealClick(modalConfirm);
      return true;
    }

    return false;
  }

  function watchAndAutoConfirm(maxWaitMs = 2000) {
    const start = Date.now();
    const interval = setInterval(() => {
      const confirmed = handleConfirmDialog();
      if (confirmed || Date.now() - start > maxWaitMs) {
        clearInterval(interval);
      }
    }, 20);
  }

  // Click mô phỏng tương thích cả cảm ứng Mobile (Pointer/Mouse/Click) lẫn Desktop
  function simulateRealClick(element) {
    if (!element) return;
    try {
      element.focus({ preventScroll: true });
    } catch (_) {}

    if (element.tagName === 'INPUT' && (element.type === 'radio' || element.type === 'checkbox')) {
      element.click();
      if (!element.checked) {
        element.checked = true;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }

    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach((type) => {
      try {
        element.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
      } catch (_) {}
    });
  }

  function selectTableRow(rowInfo) {
    if (!rowInfo) return;
    if (rowInfo.input && !rowInfo.input.checked) {
      simulateRealClick(rowInfo.input);
    }
    if (rowInfo.codeCell) {
      simulateRealClick(rowInfo.codeCell);
    }
    if (rowInfo.tr) {
      simulateRealClick(rowInfo.tr);
    }
  }

  // =========================================================
  // 10. LOGIC ĐĂNG KÝ TỰ ĐỘNG A-Z (MULTI-STAGE ZERO-DELAY)
  // =========================================================
  let isRegisteringLock = false;

  function waitAndSelectOpenClassForSubject(subjectCode, targetItem) {
    ensureNoScheduleConflictChecked();
    addLog(`⏳ Đang lọc lớp KHÔNG TRÙNG LỊCH & tìm lớp "Chờ sinh viên đăng ký" cho môn [${subjectCode}]...`, 'info');

    let attempts = 0;
    const waitClassInterval = setInterval(() => {
      attempts++;
      if (ensureNoScheduleConflictChecked()) {
        return;
      }

      const allRows = findClassRows();
      let hasAnyClassOfSubject = false;

      for (let i = 0; i < allRows.length; i++) {
        const info = parseRowInfo(allRows[i]);
        if (info && info.code && info.code.length >= 11 && info.code.startsWith(subjectCode)) {
          hasAnyClassOfSubject = true;
          if (isRowOpenForReg(info)) {
            clearInterval(waitClassInterval);
            addLog(`🎯 Tìm thấy lớp [${info.code}] (Chờ SV đăng ký - Không trùng lịch)! Tự động chọn & ĐK...`, 'success');
            selectTableRow(info);
            triggerPracticeAndSubmit(targetItem || { code: info.code, practiceGroup: '' });
            return;
          }
        }
      }

      if (attempts >= 25 || (hasAnyClassOfSubject && attempts >= 8)) {
        clearInterval(waitClassInterval);
        if (hasAnyClassOfSubject) {
          addLog(
            `⚠️ Môn [${subjectCode}] hiện không có lớp nào ở trạng thái "Chờ sinh viên đăng ký" (hoặc đều Đã khóa / Đang lên kế hoạch / Trùng lịch).`,
            'warn'
          );
        }
      }
    }, 120);
  }

  function executeRegistration(targetItem, rowInfo) {
    if (isRegisteringLock) return;
    isRegisteringLock = true;
    setTimeout(() => {
      isRegisteringLock = false;
    }, 1200);

    ensureNoScheduleConflictChecked();

    const codeLabel = (rowInfo && rowInfo.code) || (targetItem && targetItem.code) || 'Lớp đã chọn';
    state.retryCount = 0;

    // 1. Nếu là Mã học phần 10 số (bảng Môn học chờ đăng ký)
    const isSubjectRow = rowInfo && rowInfo.code && rowInfo.code.length === 10;
    if (isSubjectRow) {
      addLog(`⚡ [Auto-Register] Chọn môn [${rowInfo.code}]...`, 'warn');
      selectTableRow(rowInfo);
      waitAndSelectOpenClassForSubject(rowInfo.code, targetItem);
      return;
    }

    // 2. Nếu là Lớp học phần 12 số: kiểm tra trạng thái "Chờ sinh viên đăng ký"
    if (rowInfo && !isRowOpenForReg(rowInfo)) {
      addLog(`⛔ Lớp [${codeLabel}] có trạng thái "${rowInfo.statusText || 'Đã khóa/Đang lên KH'}" -> Bỏ qua, không đăng ký!`, 'warn');
      return;
    }

    addLog(`⚡ [Auto-Register] Đang chọn lớp [${codeLabel}] và tự động đăng ký...`, 'warn');
    selectTableRow(rowInfo);

    // 3. Tự động chọn nhóm Thực hành (nếu có) và bấm nút Đăng Ký ngay khi sẵn sàng
    triggerPracticeAndSubmit(targetItem);
  }

  function triggerPracticeAndSubmit(targetItem) {
    const checkpoints = state.settings.zeroDelayMode ? [25, 120, 300, 600] : [150, 350, 700];
    let clickedRegister = false;

    checkpoints.forEach((delayMs, idx) => {
      setTimeout(() => {
        if (clickedRegister) return;

        selectPracticeGroupIfAny(targetItem);

        if (state.settings.autoRegister) {
          const regBtn = findRegisterButton();
          if (regBtn) {
            clickedRegister = true;
            const btnLabel = (regBtn.textContent || regBtn.value || 'Nút ĐK').replace(/\s+/g, ' ').trim();
            addLog(`⚡ [Auto-Register] Tự động bấm "${btnLabel}"!`, 'success');
            simulateRealClick(regBtn);
            watchAndAutoConfirm(2500);
          } else if (idx === checkpoints.length - 1) {
            addLog('⚠️ Chưa thấy nút "Đăng Ký" trên trang (Hãy đảm bảo bạn đang ở mục Đăng Ký Học Phần).', 'warn');
          }
        }
      }, delayMs);
    });
  }

  // Chọn nhóm thực hành tương thích cả Dropdown <select>, Radio button và dòng/card trên Mobile & Desktop
  function selectPracticeGroupIfAny(targetItem) {
    // 1. Hỗ trợ ô dropdown <select> "Nhóm thực hành"
    const allSelects = document.querySelectorAll('select');
    for (let s = 0; s < allSelects.length; s++) {
      const sel = allSelects[s];
      if (isExcludedUI(sel)) continue;
      const selId = ((sel.id || '') + ' ' + (sel.name || '') + ' ' + (sel.className || '')).toLowerCase();
      const parentTxt = ((sel.parentElement && sel.parentElement.textContent) || '').toLowerCase();
      const isPracticeSelect =
        selId.includes('nhom') ||
        selId.includes('thuchanh') ||
        parentTxt.includes('nhóm thực hành') ||
        parentTxt.includes('ca thực hành');

      if (isPracticeSelect && sel.options && sel.options.length > 0) {
        for (let o = 0; o < sel.options.length; o++) {
          const opt = sel.options[o];
          const val = (opt.value || '').trim();
          const txt = (opt.textContent || '').trim();
          if (val && val !== '0' && val !== '-1' && !txt.toLowerCase().includes('chọn nhóm') && !opt.disabled) {
            if (sel.value !== val) {
              sel.value = val;
              sel.dispatchEvent(new Event('change', { bubbles: true }));
              addLog(`Tự động chọn Nhóm thực hành: ${txt}`, 'info');
            }
            break;
          }
        }
      }
    }

    // 2. Hỗ trợ radio button chọn nhóm thực hành
    const practiceRadios = document.querySelectorAll(
      '#divNhomThucHanh input[type="radio"], .nhom-thuc-hanh input[type="radio"], ' +
      'table input[name*="ThucHanh" i], table input[name*="ChiTiet" i], table input[name*="Nhom" i], ' +
      '#tbChiTietLopHocPhan input[type="radio"], [id*="ChiTietLop" i] input[type="radio"], [id*="ThucHanh" i] input[type="radio"]'
    );

    if (practiceRadios.length) {
      let selectedRadio = null;

      if (targetItem && targetItem.practiceGroup) {
        for (let i = 0; i < practiceRadios.length; i++) {
          const rad = practiceRadios[i];
          const parentText = (rad.closest('tr, .list-group-item, label') || rad.parentElement || {}).textContent || '';
          if (parentText.includes(targetItem.practiceGroup)) {
            selectedRadio = rad;
            break;
          }
        }
      }

      if (!selectedRadio && state.settings.autoSelectPractice) {
        for (let i = 0; i < practiceRadios.length; i++) {
          const rad = practiceRadios[i];
          const rowTxt = ((rad.closest('tr, .list-group-item') || rad.parentElement || {}).textContent || '').toLowerCase();
          if (!rad.disabled && !rowTxt.includes('hết chỗ')) {
            selectedRadio = rad;
            break;
          }
        }
      }

      if (selectedRadio && !selectedRadio.checked) {
        const pText = (selectedRadio.closest('tr, .list-group-item') || selectedRadio.parentElement || {}).textContent || 'Mặc định';
        addLog(`Tự động chọn nhóm thực hành: ${pText.replace(/\s+/g, ' ').slice(0, 35)}`, 'info');
        simulateRealClick(selectedRadio);
        const parentTr = selectedRadio.closest('tr, .list-group-item');
        if (parentTr) simulateRealClick(parentTr);
      }
      return;
    }

    // 3. Trường hợp bảng Chi tiết nhóm TH chọn bằng cách click vào dòng <tr> hoặc .list-group-item
    const detailRows = document.querySelectorAll(
      '#divNhomThucHanh tbody tr, #tbChiTietLopHocPhan tbody tr, .nhom-thuc-hanh tbody tr, ' +
      '[id*="ChiTietLop" i] tbody tr, #divNhomThucHanh .list-group-item, #tbChiTietLopHocPhan .list-group-item'
    );
    for (let i = 0; i < detailRows.length; i++) {
      const tr = detailRows[i];
      if (!tr.classList.contains('active') && !tr.classList.contains('selected')) {
        const txt = (tr.textContent || '').trim();
        if (txt && !txt.toLowerCase().includes('hết chỗ')) {
          addLog(`Tự động chọn dòng thực hành: ${txt.replace(/\s+/g, ' ').slice(0, 35)}`, 'info');
          simulateRealClick(tr);
          break;
        }
      }
    }
  }

  // Kiểm tra dòng Lớp học phần có đủ điều kiện đăng ký không
  function isRowOpenForReg(rowInfo) {
    if (!rowInfo) return false;
    if (rowInfo.code && rowInfo.code.length === 10) return false;

    const statusLower = (rowInfo.statusText || '').toLowerCase();
    const rowLower = (rowInfo.text || '').toLowerCase();

    if (
      statusLower.includes('đã khóa') ||
      statusLower.includes('đang lên kế hoạch') ||
      statusLower.includes('hết chỗ') ||
      statusLower.includes('đã hủy') ||
      statusLower.includes('ngưng') ||
      rowLower.includes('đã khóa') ||
      rowLower.includes('đang lên kế hoạch') ||
      rowLower.includes('hết chỗ')
    ) {
      return false;
    }

    if (statusLower) {
      const isValidStatus =
        statusLower.includes('chờ sinh viên đăng ký') ||
        statusLower.includes('chờ sinh viên đăng kí') ||
        statusLower.includes('chấp nhận mở lớp') ||
        statusLower.includes('còn chỗ') ||
        statusLower.includes('đang mở') ||
        /còn\s+\d+\s+chỗ/i.test(statusLower);
      if (!isValidStatus) return false;
    }

    if (rowInfo.remaining === 0 || (rowInfo.max > 0 && rowInfo.enrolled >= rowInfo.max)) {
      return false;
    }

    if (rowInfo.input && rowInfo.input.disabled) return false;
    return true;
  }

  // =========================================================
  // 11. VÒNG LẶP SĂN SLOT (HUNT LOOP) & WAKE LOCK
  // =========================================================
  function runHuntCycle() {
    if (!state.isRunning) return;

    ensureNoScheduleConflictChecked();

    const rows = findClassRows();

    for (let t = 0; t < state.targets.length; t++) {
      const target = state.targets[t];
      if (target.status === 'success' && state.settings.stopOnSuccess) continue;

      let subjectRow = null;
      let firstClassRow = null;
      let openClassRow = null;

      const subjectPrefix = target.code.length >= 10 ? target.code.slice(0, 10) : target.code;

      for (let i = 0; i < rows.length; i++) {
        const tr = rows[i];
        const rowText = tr.textContent || '';
        if (rowText.includes(target.code) || (subjectPrefix && rowText.includes(subjectPrefix))) {
          const candidate = parseRowInfo(tr);
          if (!candidate || !candidate.code) continue;

          if (candidate.code.length === 10 && candidate.code === subjectPrefix) {
            subjectRow = candidate;
          } else if (candidate.code.includes(target.code)) {
            if (!firstClassRow) firstClassRow = candidate;
            if (isRowOpenForReg(candidate)) {
              openClassRow = candidate;
              break;
            }
          }
        }
      }

      if (!firstClassRow && !openClassRow && subjectRow) {
        if (!subjectRow.input || !subjectRow.input.checked) {
          addLog(`📂 Tự động chọn môn [${subjectRow.code}] để tải danh sách lớp học phần...`, 'info');
          selectTableRow(subjectRow);
          ensureNoScheduleConflictChecked();
        }
        updateTargetStatusInList(target.code, 'Đang tải danh sách lớp...');
        continue;
      }

      const foundRow = openClassRow || firstClassRow;

      if (foundRow) {
        let statusStr = '';
        if (foundRow.max !== -1 && foundRow.enrolled !== -1) {
          statusStr = `${foundRow.enrolled}/${foundRow.max}`;
        }
        if (foundRow.statusText) {
          statusStr = statusStr ? `${statusStr} - ${foundRow.statusText}` : foundRow.statusText;
        } else if (!statusStr) {
          statusStr = 'Đang mở';
        }

        if (openClassRow) {
          target.status = 'open';
          addLog(`🔥 PHÁT HIỆN LỚP [${openClassRow.code}] (${statusStr})! TỰ ĐỘNG ĐĂNG KÝ...`, 'success');
          playSoundAlert('slot_found');
          sendSystemNotification('🔥 PHÁT HIỆN LỚP CHỜ SV ĐĂNG KÝ!', `Lớp ${openClassRow.code} (${statusStr}). Đang tự động đăng ký!`);

          executeRegistration(target, openClassRow);
          target.status = 'attempting';
          updateTargetUI();
          break;
        } else {
          target.status = 'full';
          updateTargetStatusInList(target.code, `Chưa mở (${statusStr})`);
        }
      } else {
        updateTargetStatusInList(target.code, 'Chưa thấy trên bảng');
      }
    }

    if (state.isRunning) {
      const delay = Math.max(250, parseInt(state.settings.intervalMs, 10) || 500);
      state.timerId = setTimeout(runHuntCycle, delay);
    }
  }

  function startHunting() {
    if (state.isRunning) return;
    if (!state.targets.length) {
      alert('Vui lòng thêm ít nhất một Mã lớp học phần (12 số) hoặc Mã học phần (10 số) vào danh sách cần săn!');
      return;
    }

    state.isRunning = true;
    try {
      sessionStorage.setItem('__iuh_auto_resume_hunt__', '1');
    } catch (_) {}

    addLog(
      `🚀 BẮT ĐẦU SĂN SLOT (Tần suất: ${state.settings.intervalMs}ms - ZeroDelay: ${state.settings.zeroDelayMode ? 'ON' : 'OFF'})`,
      'success'
    );
    playSoundAlert('slot_found');

    // Kích hoạt navigator.wakeLock giữ sáng màn hình trong lúc vòng lặp canh môn chạy
    requestWakeLock();

    updateHUDStatus(true);
    runHuntCycle();
  }

  function stopHunting() {
    state.isRunning = false;
    try {
      sessionStorage.removeItem('__iuh_auto_resume_hunt__');
    } catch (_) {}

    if (state.timerId) {
      clearTimeout(state.timerId);
      state.timerId = null;
    }

    // Giải phóng WakeLock khi dừng vòng lặp canh môn
    releaseWakeLock();

    addLog('🛑 ĐÃ TẠM DỪNG SĂN SLOT', 'warn');
    updateHUDStatus(false);
  }

  // =========================================================
  // 12. BỘ LỌC BẢNG & NÚT [+ SĂN] INLINE TRÊN DÒNG/CARD
  // =========================================================
  function applyTableFilters() {
    const rows = findClassRows();

    for (let i = 0; i < rows.length; i++) {
      const tr = rows[i];
      const info = parseRowInfo(tr);
      if (!info) continue;

      const isTarget = state.targets.some((t) => info.code && (t.code === info.code || info.code.startsWith(t.code)));
      if (isTarget) {
        tr.classList.add('iuh-highlight-target');
      } else {
        tr.classList.remove('iuh-highlight-target');
      }

      if (info.code && info.code.length === 10) {
        tr.classList.remove('iuh-row-full', 'iuh-row-hidden', 'iuh-highlight-open');
        continue;
      }

      const canRegister = isRowOpenForReg(info);
      if (!canRegister) {
        tr.classList.remove('iuh-highlight-open');
        tr.classList.add('iuh-row-full');
        if (state.settings.hideFullClasses) {
          tr.classList.add('iuh-row-hidden');
        } else {
          tr.classList.remove('iuh-row-hidden');
        }
      } else {
        tr.classList.remove('iuh-row-full', 'iuh-row-hidden');
        if (state.settings.highlightOpenClasses) {
          tr.classList.add('iuh-highlight-open');
        } else {
          tr.classList.remove('iuh-highlight-open');
        }
      }
    }
  }

  function injectInlineButtons() {
    const rows = findClassRows();
    let count = 0;

    for (let i = 0; i < rows.length; i++) {
      const tr = rows[i];
      if (tr.querySelector('.iuh-inline-add-btn')) continue;

      const info = parseRowInfo(tr);
      if (!info || !info.code) continue;

      if (info.code.length >= 11 && info.statusText) {
        const st = info.statusText.toLowerCase();
        if (st.includes('đã khóa') || st.includes('đã hủy')) {
          continue;
        }
      }

      const targetCell = info.codeCell || (tr.cells && (tr.cells[1] || tr.cells[0])) || tr;
      if (!targetCell) continue;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'iuh-inline-add-btn';
      btn.setAttribute('data-iuh-code', info.code);

      const alreadyInList = state.targets.some((t) => t.code === info.code);
      if (alreadyInList) {
        btn.classList.add('added');
        btn.innerHTML = '✓ Đang săn';
      } else {
        btn.innerHTML = '⚡ Săn';
      }
      btn.title = `Thêm mã ${info.code} vào danh sách săn môn của Tool`;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        addTargetCode(info.code);
        btn.classList.add('added');
        btn.innerHTML = '✓ Đang săn';

        const isCurriculumPage = window.location.href.toLowerCase().includes('chuong-trinh-khung');
        if (isCurriculumPage) {
          updateTargetStatusInList(info.code, 'Đã lưu (Mở trang ĐKHP để săn)');
          return;
        }

        if (!state.isRunning) {
          startHunting();
        }
        const targetObj = state.targets.find((t) => t.code === info.code) || { code: info.code, practiceGroup: '' };
        executeRegistration(targetObj, info);
      });

      targetCell.appendChild(btn);
      count++;
    }

    if (count > 0) {
      addLog(`Đã gắn nút [⚡ Săn] vào ${count} dòng hợp lệ trên trang`, 'info');
    }
  }

  // =========================================================
  // 13. KEEP-ALIVE GIỮ PHIÊN & LẮNG NGHE SỰ KIỆN MAIN WORLD
  // =========================================================
  function setupKeepAlive() {
    if (state.keepAliveTimerId) clearInterval(state.keepAliveTimerId);

    const minutes = Math.max(1, parseInt(state.settings.antiLogoutMinutes, 10) || 2);
    const intervalMs = minutes * 60 * 1000;

    state.keepAliveTimerId = setInterval(() => {
      if (!state.settings.antiLogout) return;

      const pingUrl = window.location.pathname.toLowerCase().includes('dkhp') ? window.location.href : '/Home/Index';

      fetch(pingUrl, {
        method: 'GET',
        cache: 'no-cache',
        credentials: 'include'
      })
        .then((res) => {
          if (res.ok) {
            addLog(`🛡️ [Keep-Alive] Giữ phiên thành công (Status: ${res.status})`, 'info');
          }
        })
        .catch(() => {});
    }, intervalMs);
  }

  window.addEventListener('message', (event) => {
    if (!event.data || event.data.source !== 'IUH_DKHP_INJECTED') return;

    if (event.data.type === 'WINDOW_ALERT') {
      const msg = event.data.message || '';
      addLog(`📢 Thông báo hệ thống: "${msg}"`, 'warn');

      if (msg.toLowerCase().includes('thành công')) {
        addLog('🎉🎉🎉 CHÚC MỪNG! HỆ THỐNG XÁC NHẬN ĐĂNG KÝ THÀNH CÔNG!', 'success');
        playSoundAlert('success');
        sendSystemNotification('🎉 ĐĂNG KÝ THÀNH CÔNG!', `IUH Portal: ${msg}`);
      } else if (msg.toLowerCase().includes('hết chỗ') || msg.toLowerCase().includes('trùng lịch') || msg.toLowerCase().includes('không thể')) {
        addLog(`Cảnh báo đăng ký: ${msg}`, 'error');
        playSoundAlert('error');
      }
    }

    if (event.data.type === 'XHR_RESPONSE' || event.data.type === 'FETCH_RESPONSE') {
      const resp = (event.data.response || '').toLowerCase();
      if (resp.includes('đăng ký thành công') || resp.includes('"success":true')) {
        addLog('🎉 Nhận được phản hồi đăng ký thành công từ máy chủ!', 'success');
        playSoundAlert('success');
      }
    }

    if (event.data.type === 'SERVER_NETWORK_ERROR') {
      const status = event.data.status;
      addLog(`⚠️ Cảnh báo nghẽn mạng server (Mã: ${status || 'Connection Reset'})!`, 'error');
      playSoundAlert('error');

      state.retryCount = (state.retryCount || 0) + 1;
      const retryVal = document.getElementById('iuh-retry-count-val');
      if (retryVal) retryVal.textContent = String(state.retryCount);

      if (state.settings.autoRetryOn50x && state.isRunning) {
        if (state.retryCount <= (state.settings.maxRetries || 5)) {
          addLog(`🔁 [Turbo Retry] Tự động thử lại lần ${state.retryCount}/${state.settings.maxRetries}...`, 'warn');
          setTimeout(() => {
            const regBtn = findRegisterButton();
            if (regBtn) {
              simulateRealClick(regBtn);
              watchAndAutoConfirm(1500);
            }
          }, state.settings.retryDelayMs || 300);
        } else {
          addLog(`Đã thử lại tối đa ${state.settings.maxRetries} lần nhưng server vẫn nghẽn. Tiếp tục chu kỳ săn...`, 'error');
          state.retryCount = 0;
        }
      }
    }
  });

  // =========================================================
  // 14. GIAO DIỆN FLOATING ACTION BUTTON (FAB) & BẢNG ĐIỀU KHIỂN
  // =========================================================
  function createHUD() {
    if (document.getElementById('iuh-dkhp-hud')) return;

    // 1. Tạo Bảng Điều Khiển Nổi (Control Panel)
    const hud = document.createElement('div');
    hud.id = 'iuh-dkhp-hud';
    hud.innerHTML = `
      <div class="iuh-hud-header" id="iuh-hud-drag-handle">
        <div class="iuh-hud-title">
          <span>⚡ IUH DKHP PRO</span>
          <span class="iuh-badge">MOBILE v1.3</span>
          <span class="iuh-ping-badge good" id="iuh-ping-indicator">Ping: --ms</span>
        </div>
        <div class="iuh-hud-controls">
          <button class="iuh-hud-btn-icon" id="iuh-btn-minimize" title="Thu gọn về nút nổi">_</button>
          <button class="iuh-hud-btn-icon" id="iuh-btn-close" title="Thu gọn">✕</button>
        </div>
      </div>

      <div class="iuh-hud-tabs">
        <button class="iuh-hud-tab active" data-tab="tab-hunter">🎯 Săn Lớp</button>
        <button class="iuh-hud-tab" data-tab="tab-turbo">⚡ Vượt Lag</button>
        <button class="iuh-hud-tab" data-tab="tab-filter">🔍 Lọc Bảng</button>
        <button class="iuh-hud-tab" data-tab="tab-session">🛡️ Giữ Phiên</button>
        <button class="iuh-hud-tab" data-tab="tab-logs">📜 Nhật Ký</button>
      </div>

      <div class="iuh-hud-body">
        <!-- TAB 1: SĂN LỚP -->
        <div class="iuh-tab-pane active" id="tab-hunter">
          <div class="iuh-status-bar">
            <div class="iuh-status-indicator">
              <span class="iuh-status-dot" id="iuh-status-dot"></span>
              <span id="iuh-status-text">Đang tạm dừng</span>
            </div>
            <span class="iuh-wakelock-pill" id="iuh-wakelock-indicator">🌙 WakeLock: Tắt</span>
            <div>
              <span id="iuh-session-timer" style="font-weight: 700; font-size: 11px; color: #004d99;">00:00:00</span>
            </div>
          </div>

          <div class="iuh-input-group">
            <input type="text" id="iuh-input-code" class="iuh-input" inputmode="numeric" placeholder="Nhập mã LHP 12 số / Mã HP 10 số" />
            <button class="iuh-btn iuh-btn-primary" id="iuh-btn-add-code">+ Thêm</button>
          </div>

          <div class="iuh-targets-title">
            <span>DANH SÁCH MÃ LHP THEO DÕI</span>
            <span id="iuh-target-count" style="color: #004d99; font-weight: 700;">(0)</span>
          </div>

          <div class="iuh-targets-list" id="iuh-targets-container"></div>

          <div style="display: flex; gap: 6px; margin-bottom: 8px;">
            <button class="iuh-btn iuh-btn-success" id="iuh-btn-start" style="flex: 1;">
              🚀 BẮT ĐẦU SĂN
            </button>
            <button class="iuh-btn iuh-btn-danger" id="iuh-btn-stop" style="flex: 1; display: none;">
              🛑 DỪNG LẠI
            </button>
            <button class="iuh-btn iuh-btn-warning" id="iuh-btn-force-now" title="Bấm thử đăng ký ngay lập tức">
              ⚡ ĐK Ngay
            </button>
          </div>

          <div class="iuh-setting-row">
            <label class="iuh-setting-label">
              <span>Tốc độ quét:</span>
            </label>
            <select id="iuh-select-speed" class="iuh-input" style="width: 145px; flex: none; padding: 5px 8px;">
              <option value="250">Tối đa (250ms)</option>
              <option value="300">Cực nhanh (300ms)</option>
              <option value="500" selected>Mượt mà (500ms)</option>
              <option value="800">Chuẩn (800ms)</option>
              <option value="1500">An toàn (1.5s)</option>
            </select>
          </div>

          <div class="iuh-setting-row">
            <label class="iuh-setting-label">
              <input type="checkbox" id="iuh-chk-auto-register" checked />
              <span>Tự động bấm Đăng Ký khi có slot</span>
            </label>
          </div>

          <div class="iuh-setting-row">
            <label class="iuh-setting-label">
              <input type="checkbox" id="iuh-chk-wakelock" checked />
              <span>Giữ màn hình luôn sáng khi săn (WakeLock)</span>
            </label>
          </div>

          <div class="iuh-setting-row">
            <label class="iuh-setting-label">
              <input type="checkbox" id="iuh-chk-auto-open" />
              <span>Tự động mở bảng điều khiển khi vào trang</span>
            </label>
          </div>

          <div class="iuh-setting-row">
            <label class="iuh-setting-label">
              <input type="checkbox" id="iuh-chk-sound" checked />
              <span>Phát âm thanh & rung báo hiệu</span>
            </label>
            <button class="iuh-btn iuh-btn-secondary" id="iuh-btn-test-sound" style="padding: 4px 8px; font-size: 11px;">Thử loa</button>
          </div>
        </div>

        <!-- TAB 2: VƯỢT LAG (TURBO BOOSTER) -->
        <div class="iuh-tab-pane" id="tab-turbo">
          <div class="iuh-turbo-card active" id="iuh-card-turbo-status">
            <div class="iuh-turbo-header">
              <div class="iuh-turbo-title">
                <span>🚀 Turbo Mode (Ẩn ảnh/media nặng)</span>
              </div>
              <label class="iuh-toggle-switch">
                <input type="checkbox" id="iuh-switch-turbo" checked />
                <span class="iuh-toggle-slider"></span>
              </label>
            </div>
            <div class="iuh-turbo-desc">
              Tối ưu tốc độ render & băng thông trên di động, giữ nguyên ảnh Captcha đăng nhập.
            </div>
          </div>

          <div class="iuh-turbo-card active" id="iuh-card-zero-delay">
            <div class="iuh-turbo-header">
              <div class="iuh-turbo-title">
                <span>⚡ Zero-Delay Fast-Track (20ms)</span>
              </div>
              <label class="iuh-toggle-switch">
                <input type="checkbox" id="iuh-switch-zero-delay" checked />
                <span class="iuh-toggle-slider"></span>
              </label>
            </div>
            <div class="iuh-turbo-desc">
              Loại bỏ độ trễ nhân tạo, chọn lớp + nhóm TH và bấm nút ĐK chỉ trong 20ms!
            </div>
          </div>

          <div class="iuh-network-stats">
            <div class="iuh-stat-box">
              <div class="iuh-stat-val" id="iuh-ping-live-val">-- ms</div>
              <div class="iuh-stat-lbl">Độ trễ Server</div>
            </div>
            <div class="iuh-stat-box">
              <div class="iuh-stat-val" id="iuh-net-status-val" style="color: #16a34a;">Tốt</div>
              <div class="iuh-stat-lbl">Đường truyền</div>
            </div>
            <div class="iuh-stat-box">
              <div class="iuh-stat-val" id="iuh-retry-count-val">0</div>
              <div class="iuh-stat-lbl">Lần đã Retry</div>
            </div>
          </div>

          <div class="iuh-setting-row" style="margin-top: 8px;">
            <label class="iuh-setting-label">
              <input type="checkbox" id="iuh-chk-auto-retry" checked />
              <span>Tự động Retry khi dính lỗi 502/503/504</span>
            </label>
          </div>

          <div class="iuh-setting-row">
            <span>Tốc độ Retry lỗi mạng:</span>
            <select id="iuh-select-retry-speed" class="iuh-input" style="width: 135px; flex: none; padding: 5px;">
              <option value="200">Cực nhanh (200ms)</option>
              <option value="300" selected>Tối ưu (300ms)</option>
              <option value="600">Nhịp an toàn (600ms)</option>
            </select>
          </div>

          <div style="display: flex; gap: 6px; margin-top: 8px;">
            <button class="iuh-btn iuh-btn-primary" id="iuh-btn-test-ping" style="flex: 1;">
              📡 Đo Ping
            </button>
            <button class="iuh-btn iuh-btn-secondary" id="iuh-btn-soft-refresh" style="flex: 1;">
              🔄 Tải Lại Bảng
            </button>
          </div>
        </div>

        <!-- TAB 3: LỌC BẢNG -->
        <div class="iuh-tab-pane" id="tab-filter">
          <div class="iuh-setting-row">
            <label class="iuh-setting-label">
              <input type="checkbox" id="iuh-chk-hide-full" />
              <span>Ẩn tất cả các lớp đã đầy / Đã khóa</span>
            </label>
          </div>

          <div class="iuh-setting-row">
            <label class="iuh-setting-label">
              <input type="checkbox" id="iuh-chk-highlight" checked />
              <span>Tô màu xanh nổi bật lớp còn chỗ</span>
            </label>
          </div>

          <button class="iuh-btn iuh-btn-primary iuh-btn-block" id="iuh-btn-inject-buttons">
            ⚡ Gắn nút [⚡ Săn] vào các dòng trên bảng
          </button>
          <button class="iuh-btn iuh-btn-secondary iuh-btn-block" id="iuh-btn-refresh-table">
            🔄 Áp dụng lọc & Quét lại bảng
          </button>
        </div>

        <!-- TAB 4: GIỮ PHIÊN & AUTO LOGIN -->
        <div class="iuh-tab-pane" id="tab-session">
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; font-size: 11px; color: #1e40af;">
            💡 <b>Chống Văng Phiên & Tự Đăng Nhập Lại:</b><br>
            Giữ phiên bằng Keep-Alive. Nếu văng ra trang Login, Tool tự điền MSSV + Mật khẩu và focus sẵn vào ô Captcha.
          </div>

          <div class="iuh-setting-row">
            <label class="iuh-setting-label">
              <input type="checkbox" id="iuh-chk-anti-logout" checked />
              <span>Kích hoạt tự động giữ phiên (Keep-Alive)</span>
            </label>
          </div>

          <div class="iuh-setting-row">
            <span>Tần suất ping:</span>
            <select id="iuh-select-ping-time" class="iuh-input" style="width: 120px; flex: none; padding: 5px;">
              <option value="1">Mỗi 1 phút</option>
              <option value="2" selected>Mỗi 2 phút</option>
              <option value="5">Mỗi 5 phút</option>
            </select>
          </div>

          <button class="iuh-btn iuh-btn-secondary iuh-btn-block" id="iuh-btn-manual-ping" style="margin-bottom: 10px;">
            📡 Gửi ping giữ phiên ngay bây giờ
          </button>

          <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; margin-top: 4px;">
            <div style="font-weight: 700; font-size: 11.5px; color: #0f172a; margin-bottom: 6px;">
              🔑 TÀI KHOẢN TỰ ĐỘNG ĐĂNG NHẬP KHI VĂNG:
            </div>
            <div style="display: flex; gap: 6px; margin-bottom: 6px;">
              <input type="text" id="iuh-input-mssv" class="iuh-input" placeholder="MSSV" style="flex: 1; padding: 6px 8px;" />
              <input type="password" id="iuh-input-pass" class="iuh-input" placeholder="Mật khẩu" style="flex: 1; padding: 6px 8px;" />
            </div>
            <button class="iuh-btn iuh-btn-primary iuh-btn-block" id="iuh-btn-save-cred" style="margin-bottom: 6px; padding: 7px;">
              💾 Lưu Tài Khoản Tự Đăng Nhập
            </button>
            <div class="iuh-setting-row" style="padding: 4px 0;">
              <label class="iuh-setting-label">
                <input type="checkbox" id="iuh-chk-auto-login" checked />
                <span>Tự điền MSSV/Mật khẩu & Focus ô Captcha</span>
              </label>
            </div>
            <div class="iuh-setting-row" style="padding: 4px 0;">
              <label class="iuh-setting-label">
                <input type="checkbox" id="iuh-chk-auto-redirect" checked />
                <span>Đăng nhập xong tự vào lại ĐKHP & Săn tiếp</span>
              </label>
            </div>
          </div>
        </div>

        <!-- TAB 5: NHẬT KÝ -->
        <div class="iuh-tab-pane" id="tab-logs">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; font-size: 11px;">LIVE EVENT LOGS:</span>
            <button class="iuh-btn iuh-btn-secondary" id="iuh-btn-clear-logs" style="padding: 3px 8px; font-size: 10.5px;">Xóa log</button>
          </div>
          <div class="iuh-log-container" id="iuh-log-view"></div>
        </div>
      </div>
    `;

    document.body.appendChild(hud);

    // 2. Tạo Floating Action Button (FAB) ở góc dưới màn hình (Kéo thả bằng cảm ứng Touch & Mouse)
    const fab = document.createElement('div');
    fab.id = 'iuh-dkhp-fab';
    fab.innerHTML = `
      <span class="iuh-fab-icon">⚡</span>
      <span id="iuh-mini-label">DKHP PRO</span>
      <span class="iuh-fab-badge" id="iuh-fab-count">0</span>
      <span class="iuh-mini-dot" id="iuh-mini-status-dot"></span>
    `;
    fab.title = 'Chạm để Bật/Tắt bảng điều khiển ĐKHP (Có thể giữ và kéo thả vị trí)';
    document.body.appendChild(fab);

    // Khôi phục vị trí FAB nếu người dùng đã kéo thả trước đó
    if (state.settings.fabPosition && typeof state.settings.fabPosition.left === 'number') {
      const clamped = clampToViewport(
        state.settings.fabPosition.left,
        state.settings.fabPosition.top,
        fab.offsetWidth || 130,
        fab.offsetHeight || 46
      );
      fab.style.left = clamped.left + 'px';
      fab.style.top = clamped.top + 'px';
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
    }

    const shouldMinimize = state.settings.autoOpenHUD ? false : state.settings.isMinimized !== false;
    state.settings.isMinimized = shouldMinimize;
    hud.style.display = shouldMinimize ? 'none' : 'flex';

    const toggleHUD = bindHUDEvents();
    makeTouchAndMouseDraggable(
      fab,
      fab,
      (left, top) => {
        state.settings.fabPosition = { left, top };
        saveConfig();
      },
      toggleHUD
    );
    makeTouchAndMouseDraggable(hud, document.getElementById('iuh-hud-drag-handle'));
    updateFabBadge();
  }

  function clampToViewport(left, top, width, height) {
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const maxTop = Math.max(8, window.innerHeight - height - 8);
    return {
      left: Math.max(8, Math.min(left, maxLeft)),
      top: Math.max(8, Math.min(top, maxTop))
    };
  }

  function updateFabBadge() {
    const badge = document.getElementById('iuh-fab-count');
    if (badge) {
      badge.textContent = String(state.targets.length);
      badge.style.display = state.targets.length > 0 ? 'inline-block' : 'none';
    }
  }

  // Kéo thả mượt mà hỗ trợ cả Cảm ứng (touchstart/touchmove/touchend) và Chuột (mousedown/mousemove/mouseup)
  function makeTouchAndMouseDraggable(element, handle, onSavePosition, onTap) {
    if (!element || !handle) return;

    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;
    let isDragging = false;
    let hasMoved = false;
    let lastTouchTapTs = 0;

    const isInteractiveChild = (target) => {
      if (!target || target === handle) return false;
      const tag = target.tagName;
      return tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || !!target.closest('button, input, select');
    };

    const getPoint = (e) => {
      if (e.touches && e.touches.length > 0) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
      if (e.changedTouches && e.changedTouches.length > 0) {
        return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      }
      return { x: e.clientX, y: e.clientY };
    };

    const onStart = (e) => {
      if (isInteractiveChild(e.target)) return;
      const pt = getPoint(e);
      const rect = element.getBoundingClientRect();

      startX = pt.x;
      startY = pt.y;
      initialLeft = rect.left;
      initialTop = rect.top;
      isDragging = true;
      hasMoved = false;

      if (e.type === 'mousedown') {
        e.preventDefault();
        document.addEventListener('mousemove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
      } else if (e.type === 'touchstart') {
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
      }
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const pt = getPoint(e);
      const dx = pt.x - startX;
      const dy = pt.y - startY;

      // Ngưỡng 8px để phân biệt giữa chạm (Tap) và kéo thả (Drag) trên màn hình cảm ứng
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        hasMoved = true;
      }

      if (!hasMoved) return;
      if (e.cancelable) e.preventDefault();

      const clamped = clampToViewport(
        initialLeft + dx,
        initialTop + dy,
        element.offsetWidth,
        element.offsetHeight
      );

      element.style.left = clamped.left + 'px';
      element.style.top = clamped.top + 'px';
      element.style.right = 'auto';
      element.style.bottom = 'auto';
    };

    const onEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;

      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('touchcancel', onEnd);

      if (hasMoved) {
        if (typeof onSavePosition === 'function') {
          const rect = element.getBoundingClientRect();
          onSavePosition(Math.round(rect.left), Math.round(rect.top));
        }
      } else if (e && e.type === 'touchend' && typeof onTap === 'function') {
        lastTouchTapTs = Date.now();
        onTap();
      }
    };

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, { passive: true });

    // Xử lý click chuột (Desktop) và chặn click giả sau khi đã kéo thả hoặc vừa xử lý touchend
    handle.addEventListener(
      'click',
      (e) => {
        if (hasMoved) {
          e.preventDefault();
          e.stopPropagation();
          hasMoved = false;
          return;
        }
        if (typeof onTap === 'function') {
          if (Date.now() - lastTouchTapTs < 450) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onTap();
        }
      },
      true
    );

    // Giữ phần tử luôn nằm trong màn hình khi xoay ngang/dọc điện thoại
    window.addEventListener('resize', () => {
      if (element.style.left && element.style.left !== 'auto') {
        const rect = element.getBoundingClientRect();
        const clamped = clampToViewport(rect.left, rect.top, element.offsetWidth || 120, element.offsetHeight || 46);
        element.style.left = clamped.left + 'px';
        element.style.top = clamped.top + 'px';
      }
    });
  }

  // =========================================================
  // 15. XỬ LÝ SỰ KIỆN GIAO DIỆN HUD & FAB
  // =========================================================
  function bindHUDEvents() {
    const hud = document.getElementById('iuh-dkhp-hud');

    const minimizeHUD = () => {
      hud.style.display = 'none';
      state.settings.isMinimized = true;
      saveConfig();
    };

    const expandHUD = () => {
      hud.style.display = 'flex';
      state.settings.isMinimized = false;
      saveConfig();
      renderAllLogs();
    };

    const toggleHUD = () => {
      if (hud.style.display === 'none') {
        expandHUD();
      } else {
        minimizeHUD();
      }
    };

    document.getElementById('iuh-btn-minimize').addEventListener('click', minimizeHUD);
    document.getElementById('iuh-btn-close').addEventListener('click', minimizeHUD);

    const chkAutoOpen = document.getElementById('iuh-chk-auto-open');
    if (chkAutoOpen) {
      chkAutoOpen.checked = !!state.settings.autoOpenHUD;
      chkAutoOpen.addEventListener('change', (e) => {
        state.settings.autoOpenHUD = e.target.checked;
        saveConfig();
      });
    }

    const chkWakeLock = document.getElementById('iuh-chk-wakelock');
    if (chkWakeLock) {
      chkWakeLock.checked = state.settings.keepScreenAwake !== false;
      chkWakeLock.addEventListener('change', (e) => {
        state.settings.keepScreenAwake = e.target.checked;
        saveConfig();
        if (state.isRunning) {
          if (e.target.checked) {
            requestWakeLock();
          } else {
            releaseWakeLock();
          }
        }
      });
    }

    // Chuyển Tabs
    const tabs = hud.querySelectorAll('.iuh-hud-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        hud.querySelectorAll('.iuh-tab-pane').forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab');
        const pane = document.getElementById(targetId);
        if (pane) pane.classList.add('active');
        if (targetId === 'tab-logs') {
          renderAllLogs();
        }
      });
    });

    // Thêm mã LHP
    const inputCode = document.getElementById('iuh-input-code');
    const btnAdd = document.getElementById('iuh-btn-add-code');

    const handleAdd = () => {
      const code = (inputCode.value || '').trim();
      if (!code) return;
      addTargetCode(code);
      inputCode.value = '';
    };

    btnAdd.addEventListener('click', handleAdd);
    inputCode.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleAdd();
    });

    document.getElementById('iuh-btn-start').addEventListener('click', startHunting);
    document.getElementById('iuh-btn-stop').addEventListener('click', stopHunting);

    document.getElementById('iuh-btn-force-now').addEventListener('click', () => {
      addLog('⚡ Bấm lệnh Đăng Ký Ngay Lập Tức!', 'warn');
      const rows = findClassRows();
      if (!rows.length) {
        addLog('Không tìm thấy bảng lớp học phần nào trên trang!', 'error');
        return;
      }
      for (let t = 0; t < state.targets.length; t++) {
        const target = state.targets[t];
        for (let i = 0; i < rows.length; i++) {
          const tr = rows[i];
          if ((tr.textContent || '').includes(target.code)) {
            const rowInfo = parseRowInfo(tr);
            if (rowInfo) {
              executeRegistration(target, rowInfo);
              return;
            }
          }
        }
      }
      addLog('Chưa tìm thấy mã LHP nào trong danh sách trên bảng!', 'error');
    });

    const selectSpeed = document.getElementById('iuh-select-speed');
    selectSpeed.value = String(state.settings.intervalMs || 500);
    if (!selectSpeed.value) selectSpeed.value = '500';
    selectSpeed.addEventListener('change', (e) => {
      state.settings.intervalMs = parseInt(e.target.value, 10);
      saveConfig();
      addLog(`Đã đổi tốc độ quét: ${state.settings.intervalMs}ms`, 'info');
    });

    const chkAutoReg = document.getElementById('iuh-chk-auto-register');
    chkAutoReg.checked = state.settings.autoRegister !== false;
    chkAutoReg.addEventListener('change', (e) => {
      state.settings.autoRegister = e.target.checked;
      saveConfig();
    });

    const chkSound = document.getElementById('iuh-chk-sound');
    chkSound.checked = state.settings.soundAlert !== false;
    chkSound.addEventListener('change', (e) => {
      state.settings.soundAlert = e.target.checked;
      saveConfig();
    });

    document.getElementById('iuh-btn-test-sound').addEventListener('click', () => {
      playSoundAlert('success');
    });

    // TURBO MODE SWITCH
    const switchTurbo = document.getElementById('iuh-switch-turbo');
    const cardTurbo = document.getElementById('iuh-card-turbo-status');
    if (switchTurbo) {
      switchTurbo.checked = state.settings.turboMode !== false;
      if (!switchTurbo.checked) cardTurbo.classList.remove('active');
      switchTurbo.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        state.settings.turboMode = enabled;
        applyTurboMode(enabled);
        if (enabled) {
          cardTurbo.classList.add('active');
          addLog('🚀 [Turbo Booster] ĐÃ BẬT chế độ vượt lag', 'success');
        } else {
          cardTurbo.classList.remove('active');
          addLog('⚠️ [Turbo Booster] ĐÃ TẮT chế độ vượt lag', 'warn');
        }
        saveConfig();
      });
    }

    // ZERO-DELAY SWITCH
    const switchZeroDelay = document.getElementById('iuh-switch-zero-delay');
    const cardZeroDelay = document.getElementById('iuh-card-zero-delay');
    if (switchZeroDelay) {
      switchZeroDelay.checked = state.settings.zeroDelayMode !== false;
      if (!switchZeroDelay.checked) cardZeroDelay.classList.remove('active');
      switchZeroDelay.addEventListener('change', (e) => {
        state.settings.zeroDelayMode = e.target.checked;
        if (e.target.checked) {
          cardZeroDelay.classList.add('active');
          addLog('⚡ [Zero-Delay] ĐÃ BẬT Fast-Track 20ms', 'success');
        } else {
          cardZeroDelay.classList.remove('active');
          addLog('⚠️ [Zero-Delay] Đã chuyển về chế độ bấm thường (150ms)', 'warn');
        }
        saveConfig();
      });
    }

    const chkAutoRetry = document.getElementById('iuh-chk-auto-retry');
    if (chkAutoRetry) {
      chkAutoRetry.checked = state.settings.autoRetryOn50x !== false;
      chkAutoRetry.addEventListener('change', (e) => {
        state.settings.autoRetryOn50x = e.target.checked;
        saveConfig();
      });
    }

    const selectRetrySpeed = document.getElementById('iuh-select-retry-speed');
    if (selectRetrySpeed) {
      selectRetrySpeed.value = String(state.settings.retryDelayMs || 300);
      selectRetrySpeed.addEventListener('change', (e) => {
        state.settings.retryDelayMs = parseInt(e.target.value, 10);
        saveConfig();
        addLog(`Đã đổi tốc độ Auto-Retry lỗi mạng: ${state.settings.retryDelayMs}ms`, 'info');
      });
    }

    document.getElementById('iuh-btn-test-ping').addEventListener('click', () => measurePing(true));
    document.getElementById('iuh-btn-soft-refresh').addEventListener('click', () => softRefreshTable());

    // Tab Lọc
    const chkHideFull = document.getElementById('iuh-chk-hide-full');
    chkHideFull.checked = !!state.settings.hideFullClasses;
    chkHideFull.addEventListener('change', (e) => {
      state.settings.hideFullClasses = e.target.checked;
      applyTableFilters();
      saveConfig();
    });

    const chkHighlight = document.getElementById('iuh-chk-highlight');
    chkHighlight.checked = state.settings.highlightOpenClasses !== false;
    chkHighlight.addEventListener('change', (e) => {
      state.settings.highlightOpenClasses = e.target.checked;
      applyTableFilters();
      saveConfig();
    });

    document.getElementById('iuh-btn-inject-buttons').addEventListener('click', () => injectInlineButtons());
    document.getElementById('iuh-btn-refresh-table').addEventListener('click', () => {
      applyTableFilters();
      injectInlineButtons();
      addLog('Đã quét và cập nhật lại bảng học phần', 'info');
    });

    // Tab Giữ phiên & Auto-Login
    const chkAntiLogout = document.getElementById('iuh-chk-anti-logout');
    chkAntiLogout.checked = state.settings.antiLogout !== false;
    chkAntiLogout.addEventListener('change', (e) => {
      state.settings.antiLogout = e.target.checked;
      saveConfig();
    });

    const selectPingTime = document.getElementById('iuh-select-ping-time');
    if (selectPingTime) {
      selectPingTime.value = String(state.settings.antiLogoutMinutes || 2);
      selectPingTime.addEventListener('change', (e) => {
        state.settings.antiLogoutMinutes = parseInt(e.target.value, 10) || 2;
        saveConfig();
        setupKeepAlive();
      });
    }

    document.getElementById('iuh-btn-manual-ping').addEventListener('click', () => {
      fetch(window.location.href, { cache: 'no-cache', credentials: 'include' })
        .then(() => addLog('📡 Đã gửi ping thủ công giữ phiên thành công!', 'success'))
        .catch((err) => addLog(`Lỗi ping: ${err.message}`, 'error'));
    });

    const inputMssv = document.getElementById('iuh-input-mssv');
    const inputPass = document.getElementById('iuh-input-pass');
    const btnSaveCred = document.getElementById('iuh-btn-save-cred');
    const chkAutoLogin = document.getElementById('iuh-chk-auto-login');
    const chkAutoRedirect = document.getElementById('iuh-chk-auto-redirect');

    if (inputMssv) inputMssv.value = state.settings.savedUsername || '';
    if (inputPass) inputPass.value = state.settings.savedPassword || '';
    if (chkAutoLogin) {
      chkAutoLogin.checked = state.settings.autoLoginEnabled !== false;
      chkAutoLogin.addEventListener('change', (e) => {
        state.settings.autoLoginEnabled = e.target.checked;
        saveConfig();
      });
    }
    if (chkAutoRedirect) {
      chkAutoRedirect.checked = state.settings.autoRedirectDkhp !== false;
      chkAutoRedirect.addEventListener('change', (e) => {
        state.settings.autoRedirectDkhp = e.target.checked;
        saveConfig();
      });
    }
    if (btnSaveCred) {
      btnSaveCred.addEventListener('click', () => {
        state.settings.savedUsername = (inputMssv ? inputMssv.value : '').trim();
        state.settings.savedPassword = inputPass ? inputPass.value : '';
        saveConfig();
        addLog(`💾 Đã lưu tài khoản [${state.settings.savedUsername || 'Trống'}] để tự động đăng nhập khi bị văng!`, 'success');
      });
    }

    document.getElementById('iuh-btn-clear-logs').addEventListener('click', () => {
      state.logs = [];
      const logContainer = document.getElementById('iuh-log-view');
      if (logContainer) logContainer.innerHTML = '';
    });

    // Bộ đếm thời gian phiên
    setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.sessionStartTime) / 1000);
      const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      const timerEl = document.getElementById('iuh-session-timer');
      if (timerEl) timerEl.textContent = `${h}:${m}:${s}`;
    }, 1000);

    updateTargetUI();
    return toggleHUD;
  }

  function updateHUDStatus(running) {
    const dot = document.getElementById('iuh-status-dot');
    const text = document.getElementById('iuh-status-text');
    const miniDot = document.getElementById('iuh-mini-status-dot');
    const miniLabel = document.getElementById('iuh-mini-label');
    const fab = document.getElementById('iuh-dkhp-fab');
    const btnStart = document.getElementById('iuh-btn-start');
    const btnStop = document.getElementById('iuh-btn-stop');

    if (running) {
      if (dot) dot.className = 'iuh-status-dot running';
      if (miniDot) miniDot.className = 'iuh-mini-dot running';
      if (fab) fab.classList.add('hunting');
      if (miniLabel) miniLabel.textContent = 'Đang săn...';
      if (text) text.textContent = 'Đang săn slot...';
      if (btnStart) btnStart.style.display = 'none';
      if (btnStop) btnStop.style.display = 'inline-flex';
    } else {
      if (dot) dot.className = 'iuh-status-dot';
      if (miniDot) miniDot.className = 'iuh-mini-dot';
      if (fab) fab.classList.remove('hunting');
      if (miniLabel) miniLabel.textContent = 'DKHP PRO';
      if (text) text.textContent = 'Đang tạm dừng';
      if (btnStart) btnStart.style.display = 'inline-flex';
      if (btnStop) btnStop.style.display = 'none';
    }
  }

  function addTargetCode(code) {
    code = String(code || '').trim();
    if (!code) return;
    if (state.targets.some((t) => t.code === code)) {
      updateTargetUI();
      applyTableFilters();
      saveConfig();
      addLog(`Mã [${code}] đã có trong danh sách theo dõi!`, 'info');
      return;
    }

    state.targets.push({
      code: code,
      practiceGroup: '',
      status: 'idle'
    });

    updateTargetUI();
    applyTableFilters();
    saveConfig();
    addLog(`Đã thêm mã theo dõi: ${code}`, 'success');
  }

  function removeTargetCode(code) {
    state.targets = state.targets.filter((t) => t.code !== code);
    updateTargetUI();
    applyTableFilters();
    saveConfig();

    document.querySelectorAll(`.iuh-inline-add-btn[data-iuh-code="${code}"]`).forEach((btn) => {
      btn.classList.remove('added');
      btn.innerHTML = '⚡ Săn';
    });

    addLog(`Đã xóa mã: ${code}`, 'info');
  }

  function updateTargetUI() {
    const container = document.getElementById('iuh-targets-container');
    const countEl = document.getElementById('iuh-target-count');
    updateFabBadge();
    if (!container) return;

    if (countEl) countEl.textContent = `(${state.targets.length})`;

    if (!state.targets.length) {
      container.innerHTML = `
        <div style="text-align: center; color: #94a3b8; padding: 12px; font-size: 11px;">
          Chưa có mã LHP nào. Nhập mã ở trên hoặc bấm nút [⚡ Săn] trên bảng!
        </div>
      `;
      return;
    }

    let html = '';
    state.targets.forEach((t) => {
      let statusClass = '';
      let statusLabel = 'Đang chờ';
      if (t.status === 'open') {
        statusClass = 'open';
        statusLabel = 'Còn chỗ!';
      } else if (t.status === 'full') {
        statusClass = 'full';
        statusLabel = 'Đầy chỗ';
      } else if (t.status === 'success') {
        statusClass = 'registered';
        statusLabel = 'ĐÃ ĐK THÀNH CÔNG';
      }

      html += `
        <div class="iuh-target-item" id="iuh-target-item-${escapeHTML(t.code)}">
          <div class="iuh-target-info">
            <span class="iuh-target-code">${escapeHTML(t.code)}</span>
            <span class="iuh-target-status ${statusClass}" id="iuh-target-status-${escapeHTML(t.code)}">${statusLabel}</span>
          </div>
          <div class="iuh-target-actions">
            <button class="iuh-btn-del" data-code="${escapeHTML(t.code)}" title="Xóa mã này">✕</button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.iuh-btn-del').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const code = e.currentTarget.getAttribute('data-code');
        removeTargetCode(code);
      });
    });
  }

  function updateTargetStatusInList(code, text) {
    const el = document.getElementById(`iuh-target-status-${code}`);
    if (el) {
      el.textContent = text;
      if (text.includes('Đầy') || text.includes('Chưa mở')) {
        el.className = 'iuh-target-status full';
      } else if (text.includes('Còn') || text.includes('Mở')) {
        el.className = 'iuh-target-status open';
      }
    }
  }

  // =========================================================
  // 16. CLICK CHỌN MÔN/LỚP THỦ CÔNG -> TỰ LỌC & BẤM ĐĂNG KÝ
  // =========================================================
  function setupManualSelectAutoRegister() {
    document.addEventListener(
      'click',
      (e) => {
        if (!state.settings.autoRegister) return;
        if (!e.isTrusted) return;
        const targetEl = e.target;
        if (!targetEl || !targetEl.closest) return;
        if (isExcludedUI(targetEl)) return;
        if (targetEl.classList.contains('iuh-inline-add-btn')) return;
        if (targetEl.tagName === 'BUTTON' || targetEl.tagName === 'A') return;
        if (targetEl.tagName === 'INPUT' && targetEl.type === 'checkbox') return;

        const rowEl = targetEl.closest('table tr, .list-group-item, .lhp-item, .monhoc-item, [data-malophocphan], [data-mahocphan]');
        if (!rowEl || (rowEl.firstElementChild && rowEl.firstElementChild.tagName === 'TH')) return;

        const info = parseRowInfo(rowEl);
        if (!info) return;

        if (info.code && info.code.length === 10) {
          addLog(`📂 Bạn vừa chọn môn [${info.code}] -> Tự động tích "Không trùng lịch" & chọn lớp "Chờ SV đăng ký"...`, 'info');
          waitAndSelectOpenClassForSubject(info.code, { code: info.code, practiceGroup: '' });
          return;
        }

        if ((info.code && info.code.length >= 11) || info.input) {
          ensureNoScheduleConflictChecked();
          if (isRowOpenForReg(info)) {
            addLog(`⚡ Bạn vừa chọn lớp [${info.code || 'LHP'}] (Chờ SV đăng ký)! Tự động chọn nhóm TH & bấm Đăng Ký...`, 'warn');
            triggerPracticeAndSubmit({ code: info.code || '', practiceGroup: '' });
          } else {
            addLog(`⛔ Lớp [${info.code || 'LHP'}] có trạng thái "${info.statusText || 'Đã khóa/Đang lên KH'}" -> Không thể đăng ký!`, 'warn');
          }
        }
      },
      true
    );
  }

  // =========================================================
  // 17. TỰ ĐỘNG ĐĂNG NHẬP LẠI KHI VĂNG PHIÊN & TIẾP TỤC SĂN
  // =========================================================
  function setupAutoLoginAndResume() {
    const passInputs = Array.from(document.querySelectorAll('input[type="password"]')).filter(
      (el) => !isExcludedUI(el) && isVisible(el)
    );

    const hasActiveTargets = state.targets && state.targets.some((t) => t.status !== 'success');

    // TRƯỜNG HỢP 1: ĐANG Ở TRANG ĐĂNG NHẬP (MOBILE / DESKTOP)
    if (passInputs.length > 0) {
      const passInput = passInputs[0];
      const formContainer = passInput.closest('form') || document.body;

      const userInput = Array.from(
        formContainer.querySelectorAll(
          'input[name*="UserName" i], input[id*="UserName" i], input[name*="MaSinhVien" i], input[id*="MaSinhVien" i], ' +
          'input[name*="TaiKhoan" i], input[id*="TaiKhoan" i], input[type="text"], input[type="tel"], input[inputmode="numeric"]'
        )
      ).find((el) => !isExcludedUI(el) && el !== passInput && isVisible(el));

      const captchaInput = Array.from(
        formContainer.querySelectorAll(
          'input[name*="Captcha" i], input[id*="Captcha" i], input[name*="MaBaoVe" i], input[id*="MaBaoVe" i], ' +
          'input[placeholder*="bảo vệ" i], input[placeholder*="captcha" i], input[placeholder*="xác nhận" i]'
        )
      ).find((el) => !isExcludedUI(el) && el !== userInput && el !== passInput && isVisible(el));

      const loginBtn = Array.from(
        formContainer.querySelectorAll(
          'button[type="submit"], input[type="submit"], #btnDangNhap, .btn-login, button[onclick*="Login" i], a[onclick*="Login" i]'
        )
      ).find((el) => !isExcludedUI(el) && isVisible(el));

      const saveTypedCredentials = () => {
        if (userInput && passInput && userInput.value.trim() && passInput.value) {
          state.settings.savedUsername = userInput.value.trim();
          state.settings.savedPassword = passInput.value;
          saveConfig();
        }
        if (hasActiveTargets && state.settings.autoRedirectDkhp !== false) {
          try {
            sessionStorage.setItem('__iuh_auto_resume_hunt__', '1');
          } catch (_) {}
        }
      };

      if (loginBtn) loginBtn.addEventListener('click', saveTypedCredentials);
      if (formContainer.tagName === 'FORM') formContainer.addEventListener('submit', saveTypedCredentials);

      if (state.settings.autoLoginEnabled !== false && state.settings.savedUsername && state.settings.savedPassword) {
        const setNativeValue = (inputEl, val) => {
          if (!inputEl) return;
          const descriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          if (descriptor && descriptor.set) {
            descriptor.set.call(inputEl, val);
          } else {
            inputEl.value = val;
          }
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));
        };

        setNativeValue(userInput, state.settings.savedUsername);
        setNativeValue(passInput, state.settings.savedPassword);

        if (hasActiveTargets && state.settings.autoRedirectDkhp !== false) {
          try {
            sessionStorage.setItem('__iuh_auto_resume_hunt__', '1');
          } catch (_) {}
        }

        if (captchaInput) {
          playSoundAlert('warn');
          captchaInput.style.outline = '3px solid #f59e0b';
          captchaInput.style.backgroundColor = '#fffbeb';
          captchaInput.style.fontWeight = '700';

          setTimeout(() => {
            captchaInput.focus();
            captchaInput.select();
          }, 50);

          captchaInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && loginBtn) {
              saveTypedCredentials();
              loginBtn.click();
            }
          });

          addLog(
            '🔑 [Auto-Login] Đã tự điền MSSV & Mật khẩu! Con trỏ đã đặt sẵn ở ô Captcha -> Nhập Captcha rồi bấm Enter!',
            'warn'
          );
        } else if (loginBtn) {
          let lastAttempt = 0;
          try {
            lastAttempt = parseInt(sessionStorage.getItem('__iuh_login_attempt_ts__') || '0', 10);
          } catch (_) {}

          if (Date.now() - lastAttempt > 8000) {
            try {
              sessionStorage.setItem('__iuh_login_attempt_ts__', String(Date.now()));
            } catch (_) {}
            addLog('🔑 [Auto-Login] Đã tự điền MSSV & Mật khẩu -> Tự động bấm Đăng Nhập!', 'success');
            setTimeout(() => {
              loginBtn.click();
            }, 150);
          } else {
            addLog('⚠️ [Auto-Login] Đã điền sẵn MSSV & Mật khẩu. Vui lòng kiểm tra lại thông tin đăng nhập.', 'warn');
          }
        }
      }
      return;
    }

    // TRƯỜNG HỢP 2: ĐÃ ĐĂNG NHẬP THÀNH CÔNG -> KIỂM TRA CHUYỂN HƯỚNG & SĂN TIẾP
    const pathLower = window.location.pathname.toLowerCase();
    const isDkhpPage = pathLower.includes('dangkyhocphan');
    const isCtkPage = pathLower.includes('chuong-trinh-khung');
    let shouldResume = false;
    try {
      shouldResume = sessionStorage.getItem('__iuh_auto_resume_hunt__') === '1';
    } catch (_) {}

    if (
      state.settings.autoRedirectDkhp !== false &&
      !isDkhpPage &&
      !isCtkPage &&
      window.location.hostname.toLowerCase().includes('dkhp.iuh.edu.vn') &&
      (shouldResume || hasActiveTargets)
    ) {
      try {
        sessionStorage.setItem('__iuh_auto_resume_hunt__', '1');
      } catch (_) {}
      addLog('🔄 [Auto-Resume] Đăng nhập thành công! Đang tự động chuyển thẳng vào trang Đăng Ký Học Phần...', 'success');
      setTimeout(() => {
        window.location.href = 'https://dkhp.iuh.edu.vn/DangKyHocPhan';
      }, 300);
      return;
    }

    if (isDkhpPage && shouldResume && hasActiveTargets) {
      setTimeout(() => {
        if (!state.isRunning && state.targets.some((t) => t.status !== 'success')) {
          addLog('🚀 [Auto-Resume] Đã vào lại trang ĐKHP -> Tự động BẮT ĐẦU SĂN tiếp & kích hoạt WakeLock!', 'success');
          startHunting();
        }
      }, 1000);
    }
  }

  // =========================================================
  // 18. KHỞI ĐỘNG USERSCRIPT
  // =========================================================
  function init() {
    loadConfig(() => {
      createHUD();
      setupKeepAlive();
      setupManualSelectAutoRegister();
      setupAutoLoginAndResume();
      addLog('Đã khởi tạo IUH DKHP Pro Mobile Userscript sẵn sàng!', 'success');

      measurePing(false);
      state.pingTimerId = setInterval(() => {
        measurePing(false);
      }, 5000);

      setTimeout(() => {
        injectInlineButtons();
        applyTableFilters();

        if (window.location.pathname.toLowerCase().includes('dangkyhocphan') && findClassRows().length === 0) {
          softRefreshTable();
        }
      }, 900);

      let mutationDebounceTimer = null;
      const observer = new MutationObserver((mutations) => {
        let hasTableChanges = false;
        for (let i = 0; i < mutations.length; i++) {
          const m = mutations[i];
          if (isExcludedUI(m.target)) continue;
          if (m.addedNodes && m.addedNodes.length > 0) {
            hasTableChanges = true;
            break;
          }
        }
        if (hasTableChanges) {
          clearTimeout(mutationDebounceTimer);
          mutationDebounceTimer = setTimeout(() => {
            injectInlineButtons();
            applyTableFilters();
          }, 300);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
