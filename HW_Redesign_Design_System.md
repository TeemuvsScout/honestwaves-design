# HonestWaves Pixar v.1 Design System Reference

**Audience:** the HonestWaves engineering team porting the Pixar v.1 prototypes into the production dashboard.

**Source of truth:** the 14 HTML prototypes in [`teemuvsscout/honestwaves-design`](https://github.com/TeemuvsScout/honestwaves-design) — `HW_Redesign_01_Chrome_and_Dashboard.html` through `HW_Redesign_13_Asset_Accounting.html`.

**Live preview:** <https://teemuvsscout.github.io/honestwaves-design/HW_Redesign_Browse.html>

This doc maps every pattern in the prototypes to: where it appears, what it depends on, and how to port it into the production stack without breaking the current dashboard.

---

## Table of contents

1. [Overview & tech assumptions](#1-overview--tech-assumptions)
2. [Design tokens](#2-design-tokens)
3. [Layout patterns](#3-layout-patterns)
4. [Component anatomy](#4-component-anatomy)
5. [Interaction patterns](#5-interaction-patterns)
6. [Page composition map](#6-page-composition-map)
7. [Compatibility notes](#7-compatibility-notes)
8. [Migration guide](#8-migration-guide)
9. [State-machine reference](#9-state-machine-reference)

---

## 1. Overview & tech assumptions

### What the prototypes are

Each prototype is a single self-contained `.html` file. There is no build step, no framework runtime, and no external CSS library. The only runtime dependency is the Inter and JetBrains Mono fonts loaded from Google Fonts.

Patterns are expressed in three layers:

| Layer | How it's encoded | Purpose |
|---|---|---|
| **Tokens** | CSS custom properties on `:root` | Single source of truth for color, spacing, type, radius, elevation |
| **Components** | BEM-ish CSS classes | Reusable atoms (`.btn`, `.pill`, `.kpi`, `.drawer-side`, etc.) |
| **Interactions** | Vanilla JS + class toggles | Tab switching, accordion expand, drawer open, list/tile toggle |

### Why it's framework-agnostic on purpose

The prototypes are deliberately not Vue or React. The dev team can wrap each component pattern in whatever the production stack uses — PrimeVue components, Vue SFCs, React functional components, Svelte stores — without losing visual or behavioral fidelity. Tokens, classes, and interactions are designed to translate.

### Target stack

| Layer | Recommended target | Compatible alternative |
|---|---|---|
| Tokens | Tailwind theme + CSS variables fallback | Style Dictionary, Stitches, Emotion theme |
| Components | PrimeVue (Aura unstyled) + Tailwind utilities | Vuetify, Naive UI, Headless UI + Tailwind, shadcn/ui port |
| Interactions | Vue 3 reactive state (`ref` + `computed`) | Pinia store, React `useState` / `useReducer` |
| Routing | Vue Router (one route per page) | Same |

The current production dashboard is the baseline — these prototypes are intended to **extend** it, not replace it. The token set is additive (adds the `--c-pixar` accent and the `Pixar v.1` namespace) and won't conflict with the existing scope.

---

## 2. Design tokens

### 2.1 Color tokens

Every prototype declares this token set under `:root`. Copy it verbatim into your global stylesheet.

```css
:root {
  /* Surface scale (light) */
  --c-bg:           #F8FAFC;
  --c-surface:      #FFFFFF;
  --c-surface-2:    #F8FAFC;
  --c-surface-3:    #F1F5F9;

  /* Lines */
  --c-border:        #E2E8F0;
  --c-border-strong: #CBD5E1;
  --c-divider:       #EDF1F6;

  /* Text scale */
  --c-text:        #0F172A;
  --c-text-2:      #475569;
  --c-text-muted:  #94A3B8;

  /* Brand (primary blue) */
  --c-brand:       #2563EB;
  --c-brand-hover: #1D4ED8;
  --c-brand-deep:  #1E40AF;
  --c-brand-soft:  #EFF6FF;

  /* Pixar v.1 accent (violet — used for NEW sections only) */
  --c-pixar:      #7C3AED;
  --c-pixar-soft: #EDE9FE;

  /* Semantic */
  --c-success:      #10B981;
  --c-success-soft: #D1FAE5;
  --c-warning:      #F59E0B;
  --c-warning-text: #B45309;
  --c-warning-soft: #FEF3C7;
  --c-danger:       #DC2626;
  --c-danger-soft:  #FEE2E2;
  --c-info:         #0EA5E9;
  --c-info-soft:    #E0F2FE;

  /* Secondary accents (used by chips + state pills) */
  --c-violet:      #8B5CF6;
  --c-violet-soft: #EDE9FE;
  --c-cyan:        #06B6D4;
  --c-cyan-soft:   #CFFAFE;
  --c-rose:        #FB7185;
  --c-slate:       #64748B;
  --c-slate-soft:  #F1F5F9;

  /* Executive dark (used on hero / transition slides only) */
  --c-navy:      #0F172A;
  --c-navy-deep: #020617;
  --c-ice:       #CADCFC;
}
```

**Naming convention:** `--c-{role}` for base, `--c-{role}-soft` for the tinted variant, `--c-{role}-text` for accessible-on-soft text. The soft variant is always ~10% saturation of the base — designed to pair safely with the base color as text.

### 2.2 Spacing scale

```css
:root {
  --s-1: 4px;
  --s-2: 8px;
  --s-3: 12px;
  --s-4: 16px;
  --s-5: 20px;
  --s-6: 24px;
  --s-7: 32px;
}
```

Maps to Tailwind: `--s-1 → spacing.1`, `--s-3 → spacing.3`, etc. (Tailwind's default scale is the same multiples of 4px.)

### 2.3 Typography

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Consolas, monospace;

  --t-11: 11px;
  --t-12: 12px;
  --t-13: 13px;  /* body default */
  --t-14: 14px;
  --t-16: 16px;
  --t-20: 20px;
  --t-22: 22px;
}
```

| Role | Size | Weight | Color |
|---|---|---|---|
| Page title (`h1.page-title`) | 20px | 600 | `--c-text` |
| Page sub (`.page-sub`) | 12px | 400 | `--c-text-2` |
| Card title | 14px | 600 | `--c-text` |
| Body | 13px | 400 | `--c-text` |
| KPI value | 22px | 600, tabular-nums | semantic color |
| KPI label | 10px caps, 0.04em letterspacing | 600 | `--c-text-muted` |
| Pill | 11px | 600 | semantic-on-soft |
| Code / IDs | 10-11px mono | 500 | `--c-text-muted` |

### 2.4 Radius & elevation

```css
:root {
  --r-sm: 4px;
  --r-md: 6px;   /* default for buttons, pills, cards */
  --r-lg: 10px;  /* hero cards, modals */

  --sh-1: 0 1px 2px rgba(15,23,42,.04);  /* single elevation */
}
```

Only one elevation token by design — flat enterprise look. Modals use `0 24px 48px rgba(15,23,42,.18)` inline, not as a token (only place it's used).

---

## 3. Layout patterns

### 3.1 The shell

Every prototype uses the same CSS Grid shell:

```css
.shell {
  display: grid;
  grid-template-columns: 232px 1fr;
  grid-template-rows: 52px 1fr;
  grid-template-areas:
    "logo top"
    "side main";
  height: calc(100vh - 36px); /* 36px = annotation strip; production: 100vh */
}
.logo    { grid-area: logo; }
.topbar  { grid-area: top; }
.sidebar { grid-area: side; }
.main    { grid-area: main; overflow-y: auto; }
```

**Dimensions:**
- Sidebar: 232px fixed
- Topbar: 52px fixed
- Logo block: 232×52, top-left, single border-bottom + border-right
- Main: fills remaining, scrolls vertically

The drawer (when used) is `position: fixed` and overlays the main column — it's not part of the grid.

### 3.2 Sidebar (left rail)

```html
<aside class="sidebar">
  <p class="nav-h">Operate</p>
  <a class="nav-item active"><svg class="nav-icon">…</svg>Dashboard</a>
  <a class="nav-item"><svg class="nav-icon">…</svg>Mission Control</a>

  <p class="nav-h">Manage</p>
  <a class="nav-item"><svg class="nav-icon">…</svg>Lockers</a>
  …
</aside>
```

**States:**
- Default: `.nav-item` — 13px, `--c-text-2`, transparent background
- Hover: `--c-surface-3` background, `--c-text` color
- Active: `--c-brand-soft` background, `--c-brand-deep` color, 600 weight, 2px `--c-brand` left bar via `::before`
- Section header: `.nav-h` — 10px caps, `--c-text-muted`, 0.06em letterspacing

**Sub-nav (accordion):** see [§4.7](#47-sub-nav-sidebar-accordion).

### 3.3 Topbar

```html
<div class="topbar">
  <div class="breadcrumb">
    <span>Section</span>
    <svg>›</svg>
    <strong>Current page</strong>
  </div>
  <div class="topbar-spacer"></div>
  <div class="search">⌘K …</div>
  <button class="icon-btn">🔔<span class="badge">99+</span></button>
  <button class="icon-btn">🌙</button>
  <button class="avatar-btn">
    <div class="avatar">AR</div>
    <div class="avatar-meta">…</div>
  </button>
</div>
```

The topbar is intentionally minimal — it's a chrome surface, not a primary work area.

### 3.4 Main content

The main area is `padding: var(--s-5) var(--s-6)` with `max-width: 1480px` for wide tables, and uses one of these compositions:

- **Single column** (Dashboard, Lockers list)
- **Two column** (Asset Accounting overview, Settings detail panels)
- **Left content + right drawer** (Mission Control with bay drawer)

### 3.5 Drawer (right slide-in)

```css
.drawer-side {
  position: fixed;
  top: 0; right: 0;
  width: 380px; /* 420px in Settings */
  height: 100vh;
  background: var(--c-surface);
  border-left: 1px solid var(--c-border);
  box-shadow: -4px 0 24px rgba(15,23,42,.08);
  transform: translateX(100%);  /* hidden by default */
  transition: transform .25s ease;
  z-index: 50;
  overflow-y: auto;
}
.drawer-side.open { transform: translateX(0); }
```

**Usage:** any list row that drills into detail. The drawer overlays the main area without reflow. Drawer width is contextual — 380px for entity detail, 420px for forms (Settings).

---

## 4. Component anatomy

### 4.1 Button (`.btn`)

```html
<button class="btn">Default</button>
<button class="btn primary">Primary</button>
<button class="btn ghost">Ghost</button>
<button class="btn danger">Destructive</button>
```

```css
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 30px; padding: 0 var(--s-3);
  font-size: var(--t-12); font-weight: 500;
  color: var(--c-text);
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  box-shadow: var(--sh-1);
}
.btn.primary { background: var(--c-brand); color: white; border-color: var(--c-brand); }
.btn.ghost   { background: transparent; border-color: transparent; box-shadow: none; }
.btn.danger  { color: var(--c-danger); }
```

Anatomy: 30px height (32px in some forms), icon slot before label, single-line.

### 4.2 Pill (`.pill`)

```html
<span class="pill success"><span class="pill-dot"></span>Available</span>
<span class="pill warning"><span class="pill-dot"></span>Overdue</span>
<span class="pill danger"><span class="pill-dot"></span>Lost</span>
<span class="pill info"><span class="pill-dot"></span>In use</span>
<span class="pill muted">Deactivated</span>
```

```css
.pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: var(--t-11); font-weight: 600;
}
.pill .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.pill.success { background: var(--c-success-soft); color: var(--c-success); }
.pill.warning { background: var(--c-warning-soft); color: var(--c-warning-text); }
/* etc. */
```

**Rule:** every pill uses `{soft-bg + base-text}` not `{base-bg + white-text}`. This keeps the surface light and the type accessible. The `.pill-dot` is always the same color as the text (`currentColor`).

### 4.3 KPI tile (`.kpi`)

```html
<div class="kpi">
  <div class="kpi-label"><span class="kpi-label-dot" style="background:var(--c-brand)"></span>In use right now</div>
  <div class="kpi-value">37</div>
  <div class="kpi-sub">of 56 bays · ▲12 vs avg</div>
</div>
```

```css
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--s-3); }
.kpi {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  padding: var(--s-3) var(--s-4);
}
.kpi-label { font-size: 10px; font-weight: 600; color: var(--c-text-muted);
             text-transform: uppercase; letter-spacing: .04em;
             display: flex; align-items: center; gap: 5px; margin-bottom: 4px; }
.kpi-label-dot { width: 6px; height: 6px; border-radius: 50%; }
.kpi-value { font-size: 22px; font-weight: 600; letter-spacing: -.02em;
             line-height: 1.1; font-variant-numeric: tabular-nums; }
.kpi-sub { font-size: 10px; color: var(--c-text-muted); margin-top: 2px;
           font-variant-numeric: tabular-nums; }
.kpi-value.danger { color: var(--c-danger); }
.kpi-value.warn   { color: var(--c-warning-text); }
.kpi-value.success { color: var(--c-success); }
```

Default 4-up grid. Reduce to 3-up or 2-up by overriding `grid-template-columns` inline.

### 4.4 Table (`.data-table-card`)

```html
<div class="data-table-card">
  <table>
    <thead>
      <tr><th>Device</th><th>Status</th><th>User</th><th>Bay</th></tr>
    </thead>
    <tbody>
      <tr><td>iPhone15</td><td><span class="pill warning"><span class="pill-dot"></span>Overdue</span></td><td>Crosby Smith</td><td>Pink8 · Bay 1</td></tr>
    </tbody>
  </table>
</div>
```

```css
.data-table-card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  box-shadow: var(--sh-1);
  overflow: hidden;
}
.data-table-card table { width: 100%; border-collapse: collapse; font-size: var(--t-13); }
.data-table-card thead { background: var(--c-surface-2); border-bottom: 1px solid var(--c-border); }
.data-table-card th { text-align: left; padding: 8px 12px;
                      font-size: var(--t-11); font-weight: 600;
                      color: var(--c-text-muted); text-transform: uppercase;
                      letter-spacing: .04em; }
.data-table-card td { padding: 10px 12px; border-bottom: 1px solid var(--c-border);
                      vertical-align: middle; }
.data-table-card tr:last-child td { border-bottom: none; }
.data-table-card tr:hover { background: var(--c-surface-2); }
```

**Cell utilities:**
- `.num` — `font-variant-numeric: tabular-nums; font-weight: 600`
- `.num.danger`, `.num.success` — colored numeric values
- `.muted` — `color: var(--c-text-muted)`

### 4.5 Card (`.card`)

```html
<div class="card">
  <div class="card-head">
    <div>
      <h3 class="card-title">Top departments by loss</h3>
      <p class="card-sub">This quarter — click row to drill</p>
    </div>
    <button class="btn ghost">View all</button>
  </div>
  <div class="card-body">…</div>
  <div class="card-foot">…optional</div>
</div>
```

```css
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  box-shadow: var(--sh-1);
  overflow: hidden;
}
.card-head { padding: var(--s-3) var(--s-4); border-bottom: 1px solid var(--c-divider);
             display: flex; align-items: center; justify-content: space-between; }
.card-title { font-size: var(--t-14); font-weight: 600; margin: 0; }
.card-sub   { font-size: var(--t-11); color: var(--c-text-2); margin-top: 2px; }
.card-body  { padding: var(--s-3) var(--s-4); }
.card-foot  { padding: var(--s-3) var(--s-4); background: var(--c-surface-2);
              border-top: 1px solid var(--c-divider); }
```

### 4.6 Sub-tabs (page-level tabs)

```html
<div class="subtabs">
  <div class="subtab active" data-pane="activity">
    <svg>…</svg>Activity log <span class="count">109</span>
  </div>
  <div class="subtab" data-pane="status">
    <svg>…</svg>Device status
  </div>
  <div class="subtab" data-pane="custom">
    <svg>…</svg>Custom report
  </div>
</div>
```

```css
.subtabs { display: flex; align-items: center; gap: 2px;
           border-bottom: 1px solid var(--c-border);
           margin-bottom: var(--s-5); }
.subtab { display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 12px;
          font-size: var(--t-13); font-weight: 500; color: var(--c-text-2);
          border-bottom: 2px solid transparent;
          margin-bottom: -1px; cursor: pointer; }
.subtab.active { color: var(--c-brand-deep); border-bottom-color: var(--c-brand);
                 font-weight: 600; }
.subtab .count { font-size: 10px; font-weight: 600; padding: 1px 6px;
                 border-radius: 999px; background: var(--c-surface-3);
                 color: var(--c-text-2); }
.subtab.active .count { background: var(--c-brand-soft); color: var(--c-brand-deep); }
```

**Critical:** `data-pane="X"` attribute is the binding hook. JS finds matching panes by `[data-pane]` selectors and toggles `.active` based on the clicked element's `dataset.pane`.

### 4.7 Sub-nav (sidebar accordion, multi-level)

```html
<a class="nav-item active" href="#">Lockers</a>
<div class="sub-nav">
  <div class="sub-nav-group expanded">
    <div class="sub-nav-item active" data-pane="lockers">
      <svg class="chev">▾</svg>
      <svg class="sub-nav-icon">📦</svg>
      Lockers <span class="sub-count">12</span>
    </div>
    <div class="sub-nav-l3">
      <div class="sub-nav-group-l3 expanded">
        <div class="sub-nav-item-l3">
          <svg class="chev">▾</svg>
          Troy Hospital <span class="l3-count">5 depts</span>
        </div>
        <div class="sub-nav-l4">
          <div class="sub-nav-item-l4">Emergency Medicine <span class="l4-count">62</span></div>
          <div class="sub-nav-item-l4">Nursing <span class="l4-count">84</span></div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**4 levels supported** (see [§5.2](#52-sidebar-accordion-expandcollapse) for interaction):
- L1: `.nav-item` — top-level page (always 13px)
- L2: `.sub-nav-item` (inside `.sub-nav-group`) — 12px, with chevron
- L3: `.sub-nav-item-l3` (inside `.sub-nav-l3`) — 11px, indented + bordered
- L4: `.sub-nav-item-l4` (inside `.sub-nav-l4`) — 11px muted, deepest indent

**Counts** at each level (`.sub-count`, `.l3-count`, `.l4-count`) — small grey badges aligned right via `margin-left: auto`.

**Expanded state** is the `.expanded` modifier on the wrapping `.sub-nav-group` (L2) or `.sub-nav-group-l3` (L3). Chevron rotates 90° when expanded.

### 4.8 Drawer-side (slide-in detail)

```html
<aside class="drawer-side open">
  <div class="drawer-head">
    <h2 class="drawer-title">Hardware fault</h2>
    <div class="drawer-sub">bay.hardware.fault · evt_8f4c2a1e</div>
    <button class="drawer-close">✕</button>
  </div>
  <div class="drawer-section">
    <p class="drawer-h">What happened</p>
    <div>Detail content…</div>
  </div>
</aside>
```

See [§3.5](#35-drawer-right-slide-in) for the layout/transition CSS.

**Sections:**
- `.drawer-head` — sticky-feeling header with title + sub + close button
- `.drawer-section` — repeatable content block with `p.drawer-h` (10px caps label) + body
- `.drawer-actions` — sticky footer with primary + secondary buttons

**Esc-to-close** is wired in JS for every drawer.

### 4.9 Modal (`.modal-backdrop` / `.modal`)

```html
<div class="modal-backdrop open">
  <div class="modal">
    <header class="modal-head">
      <div>
        <h2>Edit Guest registration</h2>
        <p>How locker self-registrations are handled.</p>
      </div>
      <button class="modal-close">✕</button>
    </header>
    <div class="modal-body">
      <div class="setting-row">…</div>
    </div>
    <footer class="modal-foot">
      <button class="btn ghost">Cancel</button>
      <button class="btn primary">Save</button>
    </footer>
  </div>
</div>
```

```css
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(2px);
  z-index: 1000;
  display: none;
  align-items: center; justify-content: center;
  padding: var(--s-5);
}
.modal-backdrop.open { display: flex; }
.modal {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-lg);
  box-shadow: 0 24px 48px rgba(15,23,42,.18);
  width: 100%; max-width: 540px;
  display: flex; flex-direction: column;
  overflow: hidden;
}
```

The canonical example is in `HW_Redesign_05_Users.html` (Edit Guest Registration). Three-section structure: head / body / foot.

### 4.10 Toggle switch (`.toggle`)

```html
<label class="toggle">
  <input type="checkbox" checked />
  <span class="toggle-slider"></span>
</label>
```

```css
.toggle { position: relative; display: inline-block; width: 36px; height: 20px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0;
                 background: var(--c-border-strong);
                 border-radius: 999px; transition: .2s; cursor: pointer; }
.toggle-slider::before {
  content: "";
  position: absolute; height: 14px; width: 14px;
  left: 3px; top: 3px;
  background: white; border-radius: 50%;
  transition: .2s;
  box-shadow: 0 1px 2px rgba(0,0,0,.15);
}
.toggle input:checked + .toggle-slider { background: var(--c-brand); }
.toggle input:checked + .toggle-slider::before { transform: translateX(16px); }
```

Used in: Settings (every section), Edit Guest registration modal, Mission Control bay disable.

### 4.11 User mark (avatar)

```html
<span class="user-mark">CS</span>
<span class="user-mark warn">LD</span>
<span class="user-mark danger">JS</span>
```

24×24px circle, 10px bold initials, colored background per state. Used in tables and timeline rows.

### 4.12 Filter bar

```html
<div class="filter-bar">
  <div class="filter-search">
    <svg>🔍</svg>
    <input placeholder="Search…" />
  </div>
  <select class="filter-select">…</select>
  <select class="filter-select">…</select>
</div>
```

Standard horizontal toolbar above any table. Reusable across Reports, Devices, Lockers, Users.

---

## 5. Interaction patterns

### 5.1 Tab switching (page-level)

**Pattern:** all tabs declare `data-pane="X"` and all panes declare matching IDs (`#pane-X`). A single `showPane(name)` function toggles `.active` on both.

```js
const tabs = document.querySelectorAll('.subtab[data-pane], .sub-nav-item[data-pane]');
const panes = {
  activity:  document.getElementById('pane-activity'),
  status:    document.getElementById('pane-status'),
  scheduled: document.getElementById('pane-scheduled'),
  custom:    document.getElementById('pane-custom')
};

function showPane(name) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.pane === name));
  Object.entries(panes).forEach(([k, el]) => {
    if (el) el.classList.toggle('active', k === name);
  });
  try { localStorage.setItem('hw.reports.pane', name); } catch (e) {}
}

tabs.forEach(t => t.addEventListener('click', () => showPane(t.dataset.pane)));

// Restore on load
try {
  const saved = localStorage.getItem('hw.reports.pane');
  if (saved && panes[saved]) showPane(saved);
} catch (e) {}
```

**CSS supporting:**

```css
.tab-pane { display: none; }
.tab-pane.active { display: block; }
```

**Critical design property:** the top tabs and the sidebar accordion both share the `data-pane` attribute. One `showPane()` call updates both surfaces. No race conditions, no separate state machines.

### 5.2 Sidebar accordion expand/collapse

**Pattern:** chevron clicks toggle `.expanded` on the parent group. Active item auto-expands its ancestor.

```html
<div class="sub-nav-group" onclick="toggleGroup(event, this)">
  <div class="sub-nav-item" onclick="event.stopPropagation();showPane('lockers')">
    <svg class="chev" onclick="event.stopPropagation();this.closest('.sub-nav-group').classList.toggle('expanded')">▾</svg>
    Lockers
  </div>
  <div class="sub-nav-l3">…</div>
</div>
```

```js
function toggleGroup(e, el) {
  if (e.target === el) el.classList.toggle('expanded');
}

// Auto-expand the active group on load
document.addEventListener('DOMContentLoaded', () => {
  const activeLink = document.querySelector('.sub-nav-item.active');
  if (activeLink) {
    const grp = activeLink.closest('.sub-nav-group');
    if (grp) grp.classList.add('expanded');
  }
});
```

**Why `event.stopPropagation()` everywhere:** the chevron, the item label, and the group are stacked click targets with different intents. Stopping propagation isolates them.

### 5.3 Drawer open/close

```js
function openDrawer(entityId) {
  const drawer = document.querySelector('.drawer-side');
  // populate drawer with entity data here
  drawer.classList.add('open');
}

function closeDrawer() {
  document.querySelector('.drawer-side').classList.remove('open');
}

// Esc to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer();
});

// Click outside (optional) — backdrop pattern
document.querySelector('.drawer-backdrop').addEventListener('click', closeDrawer);
```

In Vue/React, this becomes a `drawerOpen` ref/state with `v-if` / conditional rendering. The CSS transition handles the slide animation regardless of framework.

### 5.4 List/tile view toggle

```html
<div class="view-toggle">
  <button id="viewListBtn" class="active" aria-label="List view">☰</button>
  <button id="viewTileBtn" aria-label="Tile view">▦</button>
</div>

<div class="view-list show">…list content…</div>
<div class="view-tile">…tile content…</div>
```

```js
function show(view) {
  document.querySelector('.view-list').classList.toggle('show', view === 'list');
  document.querySelector('.view-tile').classList.toggle('show', view === 'tile');
  listBtn.classList.toggle('active', view === 'list');
  tileBtn.classList.toggle('active', view === 'tile');
  try { localStorage.setItem('hw.lockers.view', view); } catch (e) {}
}
```

Used in: Lockers (03), Devices (04), Notifications (08).

### 5.5 Modal open/close

```js
const modal = document.getElementById('guestRegModal');

function openModal() { modal.classList.add('open'); }
function closeModal() { modal.classList.remove('open'); }

// Backdrop click closes
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();  // only if click was on backdrop, not modal body
});

// Esc closes
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
});
```

### 5.6 LocalStorage preference persistence

Every interactive preference is namespaced as `hw.<page>.<key>`:

| Key | Stored value | Where used |
|---|---|---|
| `hw.lockers.view` | `"list" \| "tile"` | Lockers prototype |
| `hw.devices.view` | `"list" \| "tile"` | Devices prototype |
| `hw.notif.view` | `"list" \| "tile"` | Notifications prototype |
| `hw.users.pane` | `"users" \| "departments" \| "guests"` | Users prototype |
| `hw.reports.pane` | `"activity" \| "status" \| "scheduled" \| "custom"` | Reports prototype |
| `hw.notif.pane` | `"all" \| "unread" \| "critical" \| "rules"` | Notifications prototype |
| `hw.settings.section` | one of 9 section keys | Settings prototype |
| `hw.assetacc.pane` | `"overview" \| "loss" \| "inventory" \| "repair" \| "rules"` | Asset Accounting |
| `hw.access.persp` | `"locker-bay" \| "user" \| "department" \| "grant-path"` | Access Matrix |

**Recommendation for production:** keep the same namespace pattern but route through your existing user-prefs API/store. Falling back to localStorage when offline is reasonable.

### 5.7 Synced navigation (sidebar accordion ↔ top tabs)

The most important interaction guarantee in the system: **clicking a tab in either surface updates both surfaces.**

Implementation: a single query selector matches all `data-pane` elements regardless of where they live:

```js
const allNavs = document.querySelectorAll('.subtab[data-pane], .sub-nav-item[data-pane]');

function showPane(name) {
  allNavs.forEach(t => t.classList.toggle('active', t.dataset.pane === name));
  // pane visibility logic…
}
```

This is the dev-team-critical pattern. In Vue/React you'd lift the active pane name into a shared parent state (Pinia store, React context, or just a `<script setup>` ref passed via props).

---

## 6. Page composition map

The 14 prototypes compose into a few canonical patterns. The dev team can build one component per pattern and reuse.

| # | Prototype | Layout | Patterns used |
|---|---|---|---|
| 01 | Dashboard | Shell + main only | KPI strip ×1, widget grid ×5, alarms list, inbox, NEW Lost Devices widget (2-card) |
| 02 | Mission Control | Shell + main + drawer | Locker tabs (`.subtab`), bay card grid, bay drawer, Reset modal |
| 03 | Lockers | Shell + main + drawer | Subtabs ×3, list/tile toggle, drawer, **4-level accordion** (Lockers → Locations → Site → Department) |
| 04 | Devices | Shell + main + drawer | Subtabs ×2, list/tile toggle, drawer, **3-level accordion** (Devices → by status) |
| 05 | Users | Shell + main + drawer | Subtabs ×3, drawer, **modal** (Edit Guest Registration), **4-level accordion** (Departments → members), toggle, select-input |
| 06 | Reports | Shell + main + drawer | Subtabs ×4 (Activity/Device status/Scheduled/Custom), sticky filter bar, data-table-card, event drawer, sidebar accordion |
| 07 | Access Matrix | Shell + main + drawer | Perspective pivots ×4, **3-level accordion** sync, drill-in drawer with inheritance trail |
| 08 | Notifications | Shell + main + drawer | Subtabs ×4 with JS filtering, list+tile toggle, Custom Rules pane (different content shape), drawer |
| 09 | Tracker | Shell + main + drawer | Entity picker (User/Device/Bay/Locker/Order), timeline component, drawer |
| 10 | Software Updates | Shell + main + drawer | 5 status pills, command-lifecycle drawer, staged rollout table |
| 11 | Settings | Shell + 2 sidebars + main | Two-level nav (main sidebar accordion + in-page rail), 9 section panels, modal, toggle |
| 12 | Modals & States | Shell + main | Pattern library — 8 modal types + empty/error states |
| 13 | Asset Accounting | Shell + main + drawer | Subtabs ×5 (Overview/Loss/Inventory/Repair/Rules), **3-level accordion per pivot**, drill tables, activity feed |
| Browse | Iframe wrapper | (none) | Hash routing (#01 – #13), iframe slot |

### Reusable building blocks the dev team should build first

| Component | Built once, used in |
|---|---|
| `<PageShell>` | All 14 prototypes — wraps everything |
| `<Sidebar>` + `<NavItem>` + `<SubNav>` | All 14 |
| `<Topbar>` | All 14 |
| `<SubTabs>` + `<TabPane>` | 06, 07, 08, 11, 13 |
| `<KpiStrip>` + `<KpiTile>` | 01, 02, 13 |
| `<DataTableCard>` | 03, 04, 05, 06, 13 |
| `<FilterBar>` | 06, 08, 13 |
| `<Drawer>` | 02, 03, 04, 05, 06, 07, 08, 09, 10, 13 |
| `<Modal>` | 05, 11, 12 |
| `<Pill>` | All 14 |
| `<Button>` | All 14 |
| `<UserMark>` | 05, 06, 09, 13 |

That's 12 reusable components for the entire system. The page-specific stuff (timeline, heat map, bay grid) compose on top of these atoms.

---

## 7. Compatibility notes

### 7.1 What's safe to lift today (zero risk)

- **CSS tokens** — drop the `:root` block into your existing stylesheet. Tokens are namespaced (`--c-*`, `--s-*`, `--t-*`, `--r-*`, `--sh-*`) and won't collide with the current dashboard's variables (assuming the current dashboard uses different names).
- **Inter + JetBrains Mono fonts** — already used by the current dashboard if it's the staging build at staging.honestwaves.com. If not, the prototypes load from Google Fonts via `<link>` and that load is non-blocking.
- **Pill, button, KPI styles** — atomic CSS classes, paste-and-go. No JS required.

### 7.2 What needs a thin wrapper

| Pattern in prototype | Wrap as | Notes |
|---|---|---|
| `.subtab[data-pane]` + `showPane()` | `<TabBar>` Vue/React component | Replace `data-pane` attribute with a `value` prop; lift active pane into reactive state |
| `.sub-nav-item` + accordion JS | `<NavItem>` + `<NavGroup>` Vue/React | Same as above; emit click event upward |
| `.drawer-side` slide-in | `<Drawer>` component with `show` prop | CSS unchanged; replace `classList.add('open')` with state binding |
| `.modal-backdrop` | `<Modal>` component with `show` prop | Same |
| `localStorage` writes | Route through user-prefs API | Keep the `hw.<page>.<key>` namespace |

### 7.3 What needs design discussion before porting

- **Tab routing vs. pane visibility** — the prototypes use a single page with multiple `[data-pane]` panes hidden/shown via CSS. The production app may prefer one route per pane. Both work; the visual design is unchanged. Recommend: route-driven for tabs that have distinct URL state (Reports/Notifications/Asset Accounting), pane-visibility for transient view toggles.
- **Accordion in the production sidebar** — if your current sidebar is a single-level nav, adding the multi-level accordion is a visual change for existing users. Recommend: ship accordion as a per-page opt-in initially, then promote to default after a release cycle.
- **The Pixar v.1 violet** (`--c-pixar: #7C3AED`) — only appears on NEW sections (Asset Accounting, Custom Rules pane). It's intentionally distinct from the brand blue. If you don't want to introduce a new accent color, demote it to the brand color — visual hierarchy still works but loses the "this section is new" signal.

### 7.4 What absolutely won't break

- The token additions are additive — no existing tokens are renamed or removed.
- The new HTML structure doesn't depend on any specific framework — it's just classes on divs.
- The JS patterns are vanilla — they'll run side-by-side with existing Vue/React/jQuery without conflict.
- The font additions are optional — fall back to the system stack and the design degrades gracefully.

---

## 8. Migration guide

A staged port that keeps the production dashboard shipping the whole way:

### Stage 1 — Tokens (1 day)

1. Add the `:root` token block from §2 to your global stylesheet.
2. Add Inter + JetBrains Mono via `<link>` to `<head>`.
3. Verify: existing styles are unaffected. No visual change yet.

### Stage 2 — Atomic components (1 sprint)

Wrap and ship in order:

1. `<Button>` (3 variants)
2. `<Pill>` (8 variants)
3. `<UserMark>` (3 variants)
4. `<KpiTile>` + `<KpiStrip>`
5. `<Card>` + `<CardHead>` + `<CardBody>`
6. `<DataTableCard>` (with sticky header)
7. `<FilterBar>`

Verify each one independently in the existing dashboard. None of these change page layout.

### Stage 3 — Layout shell (1 sprint)

1. Replace existing sidebar with `<Sidebar>` + `<NavItem>` (no accordion yet).
2. Replace existing topbar with `<Topbar>`.
3. Wrap each page in `<PageShell>`.
4. Add `<Drawer>` as a reusable slot — used by Mission Control, Devices, Users, Reports.
5. Add `<Modal>` as a reusable slot — used by Users, Settings.

After this stage the production app looks like the prototypes for layout/chrome, but pages still render existing content.

### Stage 4 — Page-by-page (per-page sprints)

Order suggested:
1. Dashboard (01) — highest visibility, simplest port
2. Mission Control (02) — most-used by ops, drawer pattern proof
3. Reports (06) — 4 subtabs land + biggest verbiage cleanup
4. Notifications (08) — Custom Rules new section
5. Users (05) — modal pattern + new Departments/Guests subtabs
6. Lockers (03) + Devices (04) — list/tile + accordion
7. Access Matrix (07)
8. Tracker (09)
9. Software Updates (10)
10. Settings (11) — two-level nav, biggest content rework
11. Asset Accounting (13) — net-new section, ship last

### Stage 5 — Polish

1. Add accordion sub-nav (Stage 3 was no-accordion; promote here).
2. Enable localStorage preference persistence.
3. Add 3rd/4th-level accordion drill-down where it adds value (Lockers, Users, Asset Accounting).
4. Verbiage sweep per `HonestWaves_Copy_Audit.xlsx`.

---

## 9. State-machine reference

The interactions are simpler than a typical SPA. Three state machines cover the entire system.

### 9.1 Pane visibility (per page)

```
States:        {pane: 'A' | 'B' | 'C' | ...}
Events:        TAB_CLICK(name)
Transition:    pane = name
Side effects:  - localStorage.setItem('hw.<page>.pane', name)
               - For Mission Control: hide drawer if pane !== 'main'
               - For Users: hide drawer if pane !== 'users' (only users-pane has drawer)
```

### 9.2 Drawer (per page)

```
States:        {drawer: 'closed' | 'open', selectedEntity: id | null}
Events:        ROW_CLICK(id) -> drawer = 'open', selectedEntity = id
               CLOSE_CLICK   -> drawer = 'closed', selectedEntity = null
               ESC_KEY       -> CLOSE_CLICK
Side effects:  - apply/remove .open class on .drawer-side
               - drawer content rendered from selectedEntity
```

### 9.3 Accordion (per group)

```
States:        Per-group: {expanded: bool}
Events:        CHEVRON_CLICK(groupId) -> toggle expanded
               ITEM_ACTIVATE(itemId)  -> ensure ancestor group is expanded
Side effects:  - apply/remove .expanded on .sub-nav-group / .sub-nav-group-l3
```

These compose without conflict — clicking a sub-nav item triggers (a) ITEM_ACTIVATE on the accordion machine and (b) TAB_CLICK on the pane machine in parallel.

---

## Appendix A — file map

```
HW_Redesign_01_Chrome_and_Dashboard.html    Global chrome + Dashboard
HW_Redesign_02_Mission_Control.html         Per-bay live state
HW_Redesign_03_Lockers.html                 Lockers / Locations / Templates
HW_Redesign_04_Devices.html                 Devices / Manage Models
HW_Redesign_05_Users.html                   Users / Departments / Guests
HW_Redesign_06_Reports.html                 Activity / Device status / Scheduled / Custom
HW_Redesign_07_Access_Matrix.html           4 perspectives
HW_Redesign_08_Notifications.html           All / Unread / Critical / Custom rules
HW_Redesign_09_Tracker.html                 Entity timeline tracer
HW_Redesign_10_Software_Updates.html        Locker firmware + APK
HW_Redesign_11_Settings.html                Profile / Security / Branding / Self-reg / ...
HW_Redesign_12_Modals_States.html           Pattern library (modals + empty states)
HW_Redesign_13_Asset_Accounting.html        Finance section (NEW)
HW_Redesign_Browse.html                     Single-URL hub (iframe + hash routing)
HW_Redesign_Component_Library.html          Live component playground (this is the companion to this doc)
```

## Appendix B — token JSON

If your build pipeline uses Style Dictionary, here's the token export:

```json
{
  "color": {
    "bg":           { "value": "#F8FAFC" },
    "surface":      { "value": "#FFFFFF" },
    "surface-2":    { "value": "#F8FAFC" },
    "surface-3":    { "value": "#F1F5F9" },
    "border":       { "value": "#E2E8F0" },
    "border-strong":{ "value": "#CBD5E1" },
    "divider":      { "value": "#EDF1F6" },
    "text":         { "value": "#0F172A" },
    "text-2":       { "value": "#475569" },
    "text-muted":   { "value": "#94A3B8" },
    "brand":        { "value": "#2563EB" },
    "brand-hover":  { "value": "#1D4ED8" },
    "brand-deep":   { "value": "#1E40AF" },
    "brand-soft":   { "value": "#EFF6FF" },
    "pixar":        { "value": "#7C3AED" },
    "pixar-soft":   { "value": "#EDE9FE" },
    "success":      { "value": "#10B981" },
    "success-soft": { "value": "#D1FAE5" },
    "warning":      { "value": "#F59E0B" },
    "warning-text": { "value": "#B45309" },
    "warning-soft": { "value": "#FEF3C7" },
    "danger":       { "value": "#DC2626" },
    "danger-soft":  { "value": "#FEE2E2" },
    "info":         { "value": "#0EA5E9" },
    "info-soft":    { "value": "#E0F2FE" }
  },
  "spacing": {
    "1": { "value": "4px" }, "2": { "value": "8px" }, "3": { "value": "12px" },
    "4": { "value": "16px" }, "5": { "value": "20px" }, "6": { "value": "24px" },
    "7": { "value": "32px" }
  },
  "radius": {
    "sm": { "value": "4px" }, "md": { "value": "6px" }, "lg": { "value": "10px" }
  },
  "typography": {
    "11": { "value": "11px" }, "12": { "value": "12px" }, "13": { "value": "13px" },
    "14": { "value": "14px" }, "16": { "value": "16px" }, "20": { "value": "20px" },
    "22": { "value": "22px" }
  }
}
```

---

**Questions, gaps, or anything that doesn't translate cleanly to your stack — flag them in the GitHub repo or DM Jeff. This doc is a living reference and will be updated as the port progresses.**
