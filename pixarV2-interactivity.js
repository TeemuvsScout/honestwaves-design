/* =====================================================================
   Pixar v.2 — minimal companion layer
   Forked v.1 prototypes carry their own inline interactivity (tabs,
   sub-nav, modals, drawers, sub-section show/hide). This file ONLY adds:
     - "/" keyboard shortcut to focus any search input
     - cursor:pointer safety net on .btn / .nav-item if missing
     - console marker so dev can confirm load
   Anything more would conflict with v.1's existing onclick handlers.
   ===================================================================== */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function wireSearchShortcut() {
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const search = document.querySelector('input[type="search"], input[placeholder*="earch" i], #search, .search input');
        if (search) search.focus();
      }
    });
  }

  function wireCursors() {
    document.querySelectorAll('.btn, .nav-item, .s-nav-item, .sub-nav-item-side, .locker-tab, .tab, .icon-btn, .avatar-btn').forEach(el => {
      if (!el.style.cursor) el.style.cursor = 'pointer';
    });
  }

  ready(() => {
    wireSearchShortcut();
    wireCursors();
    console.log('[Pixar v.2] forked from v.1 — all original inline handlers preserved. "/" focuses search.');
  });
})();
