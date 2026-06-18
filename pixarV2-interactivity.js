/* =====================================================================
   Pixar v.2 — shared interactivity layer
   Wires the click behaviors that v.1 had inline, so dev sees intent
   even though these are static HTML prototypes (no Vue runtime).

   Patterns wired here:
     1. TabView tab switching
     2. SelectButton group toggle (List/Tile, perspectives)
     3. Filter chip toggle (border + remove-X on click)
     4. DataTable row click → opens right-side drawer (CSS-injected)
     5. Sortable column header → cycles asc / desc / none
     6. Sidebar nav active state (auto from current URL)
     7. Modal trigger by [data-modal="id"]
     8. Search "/" keyboard shortcut
     9. Action menu (.pi-ellipsis-v) → small popover
    10. Pill / button hover lift cursor:pointer

   Load AFTER pixarV2-tokens.css. Self-bootstraps on DOMContentLoaded.
   ===================================================================== */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ---------------- 1. TabView tab switching ---------------- */
  function wireTabs() {
    document.querySelectorAll('.p-tabview-nav').forEach(nav => {
      nav.querySelectorAll('li').forEach(li => {
        const link = li.querySelector('.p-tabview-nav-link');
        if (!link) return;
        link.style.cursor = 'pointer';
        link.addEventListener('click', e => {
          e.preventDefault();
          nav.querySelectorAll('li').forEach(s => {
            s.classList.remove('p-tabview-selected', 'p-highlight');
          });
          li.classList.add('p-tabview-selected', 'p-highlight');
        });
      });
    });
  }

  /* ---------------- 2. SelectButton group toggle ---------------- */
  function wireSelectButtons() {
    document.querySelectorAll('.p-selectbutton, .p-buttonset').forEach(group => {
      const buttons = group.querySelectorAll('button.p-button');
      if (buttons.length < 2) return;
      buttons.forEach(btn => {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', e => {
          e.preventDefault();
          buttons.forEach(b => {
            b.classList.remove('p-highlight');
            b.classList.add('p-button-text');
          });
          btn.classList.remove('p-button-text');
          btn.classList.add('p-highlight');
        });
      });
    });
  }

  /* ---------------- 3. Filter chip toggle ---------------- */
  function wireFilterChips() {
    // Heuristic: a .p-tag inside a flex row near a search input is a filter chip
    document.querySelectorAll('.p-tag[style*="cursor:pointer"], .p-tag[style*="cursor: pointer"]').forEach(chip => {
      chip.addEventListener('click', e => {
        e.preventDefault();
        const isActive = chip.dataset.active === '1';
        if (isActive) {
          chip.dataset.active = '0';
          chip.style.outline = '';
          chip.style.outlineOffset = '';
        } else {
          chip.dataset.active = '1';
          chip.style.outline = '2px solid var(--c-brand)';
          chip.style.outlineOffset = '2px';
        }
      });
    });
  }

  /* ---------------- 4. DataTable row click → drawer ---------------- */
  function wireRowClicks() {
    // Inject drawer container if not present
    if (!document.getElementById('pv2-drawer')) {
      const d = document.createElement('div');
      d.id = 'pv2-drawer';
      d.innerHTML = `
        <div class="pv2-drawer-backdrop"></div>
        <aside class="pv2-drawer-pane">
          <header class="pv2-drawer-head">
            <span class="v1-pill v1-pill-brand" id="pv2-drawer-tag">Detail</span>
            <button class="pv2-drawer-close p-button p-button-text p-button-sm"><i class="pi pi-times"></i></button>
          </header>
          <div class="pv2-drawer-body">
            <h3 id="pv2-drawer-title" style="font-size:var(--t-20); font-weight:600; margin:0 0 4px;">—</h3>
            <div id="pv2-drawer-sub" class="v1-muted" style="font-size:var(--t-12); margin-bottom:var(--s-4);">—</div>
            <div id="pv2-drawer-content" style="font-size:var(--t-13); line-height:1.5;"></div>
            <div style="display:flex; gap:var(--s-2); margin-top:var(--s-5);">
              <button class="p-button p-button-sm" id="pv2-drawer-primary"><i class="pi pi-pencil mr-2"></i>Edit</button>
              <button class="p-button p-button-outlined p-button-sm">View trail</button>
            </div>
          </div>
        </aside>`;
      document.body.appendChild(d);
      const css = document.createElement('style');
      css.textContent = `
        #pv2-drawer { position: fixed; inset: 0; z-index: 9000; pointer-events: none; }
        #pv2-drawer.open { pointer-events: auto; }
        .pv2-drawer-backdrop { position:absolute; inset:0; background: rgba(15,23,42,.18); opacity: 0; transition: opacity .15s ease; }
        #pv2-drawer.open .pv2-drawer-backdrop { opacity: 1; }
        .pv2-drawer-pane { position:absolute; top:0; right:0; height:100%; width: var(--drawer-w, 380px); background: var(--c-surface); border-left: 1px solid var(--c-border); box-shadow: var(--sh-drawer); transform: translateX(100%); transition: transform .2s ease; display:flex; flex-direction:column; }
        #pv2-drawer.open .pv2-drawer-pane { transform: translateX(0); }
        .pv2-drawer-head { padding: var(--s-4); border-bottom: 1px solid var(--c-border); display:flex; align-items:center; gap: var(--s-2); }
        .pv2-drawer-close { margin-left:auto; }
        .pv2-drawer-body { padding: var(--s-4); flex:1; overflow-y: auto; }
      `;
      document.head.appendChild(css);
      // Wire close
      d.querySelector('.pv2-drawer-backdrop').addEventListener('click', closeDrawer);
      d.querySelector('.pv2-drawer-close').addEventListener('click', closeDrawer);
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });
    }

    function openDrawer({ tag, title, sub, content }) {
      const d = document.getElementById('pv2-drawer');
      d.querySelector('#pv2-drawer-tag').textContent = tag || 'Detail';
      d.querySelector('#pv2-drawer-title').textContent = title || '—';
      d.querySelector('#pv2-drawer-sub').textContent = sub || '';
      d.querySelector('#pv2-drawer-content').innerHTML = content || '';
      d.classList.add('open');
    }

    function closeDrawer() {
      const d = document.getElementById('pv2-drawer');
      if (d) d.classList.remove('open');
    }

    // Wire DataTable rows — make every <tbody> <tr> clickable
    document.querySelectorAll('.p-datatable tbody tr, table tbody tr').forEach(tr => {
      if (tr.querySelector('th')) return; // skip header-like rows
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', e => {
        // ignore clicks on input, checkbox, button, link
        if (e.target.closest('input, button, a, .p-button')) return;
        const cells = tr.querySelectorAll('td');
        const primary = cells[1]?.textContent.trim().split('\n')[0] || cells[0]?.textContent.trim();
        const sub = cells[2]?.textContent.trim() || '';
        const statusTag = tr.querySelector('.p-tag, .v1-pill');
        const tagText = statusTag ? statusTag.textContent.trim() : 'Detail';
        openDrawer({
          tag: tagText.slice(0, 24),
          title: primary,
          sub: sub,
          content: `<div class="v1-muted" style="font-size:var(--t-11); text-transform:uppercase; letter-spacing:.04em; margin-bottom:8px;">Row preview</div>
                    <div>Static demo drawer. In production this is &lt;Sidebar position="right"&gt; with the full record bound.</div>
                    <ul style="margin-top:12px; padding-left:16px; line-height:1.7;">
                      ${Array.from(cells).slice(0,6).map(c => `<li class="v1-secondary">${c.textContent.trim().slice(0,60)}</li>`).join('')}
                    </ul>`
        });
      });
    });

    // Wire any element with [data-drawer-title] to open with its own content
    document.querySelectorAll('[data-drawer-title]').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', e => {
        e.preventDefault();
        openDrawer({
          tag: el.dataset.drawerTag,
          title: el.dataset.drawerTitle,
          sub: el.dataset.drawerSub,
          content: el.dataset.drawerContent || ''
        });
      });
    });

    // Expose for inline use
    window.PixarV2 = window.PixarV2 || {};
    window.PixarV2.openDrawer = openDrawer;
    window.PixarV2.closeDrawer = closeDrawer;
  }

  /* ---------------- 5. Sortable column headers ---------------- */
  function wireSortableHeaders() {
    document.querySelectorAll('th i.pi-sort-amount-up-alt, th i.pi-sort-amount-down').forEach(icon => {
      const th = icon.closest('th');
      if (!th) return;
      th.style.cursor = 'pointer';
      th.addEventListener('click', e => {
        const cur = icon.classList.contains('pi-sort-amount-down') ? 'desc' : icon.classList.contains('pi-sort-amount-up-alt') ? 'asc' : 'none';
        icon.classList.remove('pi-sort-amount-up-alt', 'pi-sort-amount-down', 'pi-sort');
        if (cur === 'asc') icon.classList.add('pi-sort-amount-down');
        else if (cur === 'desc') icon.classList.add('pi-sort');
        else icon.classList.add('pi-sort-amount-up-alt');
      });
    });
  }

  /* ---------------- 6. Sidebar nav auto-active + sub-nav toggle ---------------- */
  function wireSidebar() {
    const here = (location.pathname.split('/').pop() || '').toLowerCase();
    document.querySelectorAll('aside a[href], .v1-side a[href]').forEach(a => {
      const target = (a.getAttribute('href') || '').toLowerCase();
      if (!target.startsWith('#') && target && here.endsWith(target)) {
        a.classList.add('active');
      }
    });
    // Sub-nav (ml-7 children) expand on click of parent
    document.querySelectorAll('aside a.bg-brand-soft, aside .v1-nav-item.active').forEach(parent => {
      // Already styled as active in markup — no-op
    });
  }

  /* ---------------- 7. Modal trigger [data-modal] ---------------- */
  function wireModalTriggers() {
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', e => {
        e.preventDefault();
        const id = btn.dataset.modalOpen;
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'block';
      });
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', e => {
        e.preventDefault();
        const id = btn.dataset.modalClose;
        const modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
      });
    });
  }

  /* ---------------- 8. "/" search shortcut ---------------- */
  function wireSearchShortcut() {
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const search = document.querySelector('input[placeholder*="earch" i], #search');
        if (search) search.focus();
      }
    });
  }

  /* ---------------- 9. Ellipsis menu (pi-ellipsis-v) popover ---------------- */
  function wireEllipsisMenus() {
    document.querySelectorAll('i.pi-ellipsis-v').forEach(icon => {
      icon.style.cursor = 'pointer';
      icon.addEventListener('click', e => {
        e.stopPropagation();
        // Remove existing popovers
        document.querySelectorAll('.pv2-ellipsis-pop').forEach(p => p.remove());
        const pop = document.createElement('div');
        pop.className = 'pv2-ellipsis-pop';
        pop.innerHTML = `
          <div class="pv2-ellipsis-item"><i class="pi pi-eye"></i>View detail</div>
          <div class="pv2-ellipsis-item"><i class="pi pi-pencil"></i>Edit</div>
          <div class="pv2-ellipsis-item"><i class="pi pi-history"></i>View trail</div>
          <div class="pv2-ellipsis-item pv2-ellipsis-danger"><i class="pi pi-trash"></i>Delete</div>`;
        Object.assign(pop.style, {
          position: 'absolute',
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--sh-popover)',
          padding: '4px',
          zIndex: 8000,
          fontSize: 'var(--t-13)',
          minWidth: '160px'
        });
        const rect = icon.getBoundingClientRect();
        pop.style.top = (rect.bottom + window.scrollY + 4) + 'px';
        pop.style.left = (rect.left + window.scrollX - 130) + 'px';
        document.body.appendChild(pop);
        // Style items via inline rules
        pop.querySelectorAll('.pv2-ellipsis-item').forEach(item => {
          Object.assign(item.style, { padding: '6px 10px', borderRadius: 'var(--r-sm)', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', color:'var(--c-text)' });
          item.addEventListener('mouseenter', () => item.style.background = 'var(--c-surface-3)');
          item.addEventListener('mouseleave', () => item.style.background = '');
          item.addEventListener('click', () => pop.remove());
          if (item.classList.contains('pv2-ellipsis-danger')) item.style.color = 'var(--c-danger)';
        });
        // Close on outside click
        setTimeout(() => {
          document.addEventListener('click', function once() {
            pop.remove();
            document.removeEventListener('click', once);
          });
        }, 0);
      });
    });
  }

  /* ---------------- 10. Cursor pointer on all interactive surfaces ---------------- */
  function wireCursors() {
    document.querySelectorAll('.p-button, .p-tag[style*="cursor"], .v1-nav-item, label.p-checkbox, input[type="checkbox"]').forEach(el => {
      if (!el.style.cursor) el.style.cursor = 'pointer';
    });
  }

  /* ---------------- Bootstrap ---------------- */
  ready(() => {
    wireTabs();
    wireSelectButtons();
    wireFilterChips();
    wireRowClicks();
    wireSortableHeaders();
    wireSidebar();
    wireModalTriggers();
    wireSearchShortcut();
    wireEllipsisMenus();
    wireCursors();
    console.log('[Pixar v.2] interactivity layer loaded — tabs, drawers, filters, sort, menus, /-shortcut all wired.');
  });
})();
