/* =====================================================================
   Pixar v.2 — shared interactivity layer (v2: content-swapping enabled)
   Wires the click behaviors that v.1 had inline, so dev sees intent.
   ===================================================================== */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ---------------- Alternate tab-panel content per page ----------------
     index 0 is always the original page content; we save it on first switch.
     index 1+ are the alternate-tab views. */
  const TAB_PANELS = {
    'HW_PixarV2_Lockers.html': [
      null,
      // [1] Locations
      `<div class="grid grid-cols-3 gap-4 mt-3">
         ${['Grand Rapids · Helen DeVos','Detroit · Beaumont Royal Oak','Lansing · Sparrow Main','Detroit · ER North','Grand Rapids · 5th Floor ICU','Lansing · Rehab Pavilion'].map((loc,i)=>`
         <div class="p-card"><div class="p-card-body">
           <div class="flex items-center"><i class="pi pi-map-marker text-brand"></i><span class="ml-2 font-semibold">${loc}</span><span class="ml-auto v1-pill v1-pill-success">Online</span></div>
           <div class="text-xs mt-2" style="color:var(--c-text-2);">${['3 lockers · 72 bays','2 lockers · 60 bays','1 locker · 24 bays','1 locker · 24 bays','1 locker · 24 bays','1 locker · 24 bays'][i]}</div>
           <div class="text-xs v1-muted mt-1">${['12 MI · Primary','24 MI · Cardiology hub','8 MI · Rehab focus','24 MI · Trauma','12 MI · Critical care','8 MI · Outpatient'][i]}</div>
         </div></div>`).join('')}
       </div>`,
      // [2] Templates
      `<div class="grid grid-cols-2 gap-4 mt-3">
         ${[['ER Lobby','24-bay standard','RFID + PIN','Photo capture','Default for ER deployments'],
            ['ICU Critical','12-bay accelerated','Badge-only','High-priority alerts','Used in ICU 5N / 5S'],
            ['Outpatient','36-bay capacity','PIN-only','Guest self-reg enabled','For lobby + outpatient'],
            ['Rehab Pavilion','24-bay light','Badge-only','Extended TTL','Therapy departments']].map(([t,sub,...feats])=>`
         <div class="p-card"><div class="p-card-body">
           <div class="flex items-center"><strong>${t}</strong><span class="ml-auto v1-pill v1-pill-brand">Template</span></div>
           <div class="text-xs mt-1" style="color:var(--c-text-2);">${sub}</div>
           <ul class="text-xs mt-3 space-y-1" style="color:var(--c-text-2);">${feats.map(f=>`<li>· ${f}</li>`).join('')}</ul>
           <div class="flex gap-2 mt-3"><button class="p-button p-button-outlined p-button-sm">Clone</button><button class="p-button p-button-text p-button-sm">Edit</button></div>
         </div></div>`).join('')}
       </div>`
    ],

    'HW_PixarV2_Devices.html': [
      null,
      // [1] Manage Models
      `<div class="p-datatable mt-3"><table class="w-full bg-white rounded-lg">
         <thead><tr class="text-left text-xs uppercase" style="background:var(--c-surface-3); color:var(--c-text-2);">
           <th class="px-4 py-3">Model</th><th class="px-4 py-3">Type</th><th class="px-4 py-3">In fleet</th><th class="px-4 py-3">Replacement cost</th><th class="px-4 py-3">EOL</th><th class="px-4 py-3">Status</th><th class="px-4 py-3 w-8"></th>
         </tr></thead>
         <tbody class="text-sm">
         ${[['Zebra TC52','Phone scanner',847,'$1,895','2027-12'],['Honeywell CT60','Phone scanner',122,'$2,150','2026-09'],['iPad Pro 11"','Tablet',88,'$1,099','2028-06'],['iPad Air','Tablet',54,'$799','2027-03'],['Motorola APX 4000','Radio',91,'$2,800','2029-01'],['Zebra DS3678','Bluetooth scanner',32,'$565','2027-08'],['Apple AirPods Pro','Headset',13,'$249','2026-12']].map(([m,t,n,c,e])=>`
           <tr><td class="px-4 py-3 font-semibold">${m}</td><td class="px-4 py-3">${t}</td><td class="px-4 py-3">${n}</td><td class="px-4 py-3 v1-mono">${c}</td><td class="px-4 py-3 v1-muted">${e}</td><td class="px-4 py-3"><span class="v1-pill v1-pill-success">Active</span></td><td class="px-4 py-3"><i class="pi pi-ellipsis-v v1-muted"></i></td></tr>
         `).join('')}
         </tbody>
       </table></div>
       <div class="flex justify-end mt-3"><button class="p-button p-button-sm"><i class="pi pi-plus mr-2"></i>Add Model</button></div>`
    ],

    'HW_PixarV2_Users.html': [
      null,
      // [1] Departments
      `<div class="p-datatable mt-3"><table class="w-full bg-white rounded-lg">
         <thead><tr class="text-left text-xs uppercase" style="background:var(--c-surface-3); color:var(--c-text-2);">
           <th class="px-4 py-3">Department</th><th class="px-4 py-3">Manager</th><th class="px-4 py-3">Users</th><th class="px-4 py-3">Devices granted</th><th class="px-4 py-3">Locked</th><th class="px-4 py-3 w-8"></th>
         </tr></thead>
         <tbody class="text-sm">
         ${[['ER North','Crosby Smith',214,'18 bays · 4 lockers',1],['ICU 5N','Maria Reyes',88,'12 bays · 2 lockers',0],['Security','James Tan',24,'All bays (override)',0],['Rehab Pavilion','Diane Wu',62,'8 bays · 1 locker',0],['IT','Admin Rowe',12,'All bays (override)',0],['Cardiology','Linda Park',147,'14 bays · 2 lockers',1],['Outpatient Lobby','Daniel Cho',39,'24 bays · 1 locker',1],['Guest (24h)','—',128,'2 bays · 1 locker',0]].map(([d,m,u,g,l])=>`
           <tr><td class="px-4 py-3 font-semibold">${d}</td><td class="px-4 py-3">${m}</td><td class="px-4 py-3">${u}</td><td class="px-4 py-3 v1-muted">${g}</td><td class="px-4 py-3">${l>0?'<span class="v1-pill v1-pill-danger">'+l+'</span>':'<span class="v1-muted">0</span>'}</td><td class="px-4 py-3"><i class="pi pi-ellipsis-v v1-muted"></i></td></tr>`).join('')}
         </tbody>
       </table></div>`,
      // [2] Guests
      `<div class="flex items-center gap-3 mt-3 mb-3">
         <button class="p-button p-button-sm"><i class="pi pi-user-plus mr-2"></i>Register guest</button>
         <span class="v1-pill v1-pill-info">Self-registration: enabled</span>
         <span class="v1-pill v1-pill-brand">Default TTL: 24h</span>
       </div>
       <div class="p-datatable"><table class="w-full bg-white rounded-lg">
         <thead><tr class="text-left text-xs uppercase" style="background:var(--c-surface-3); color:var(--c-text-2);">
           <th class="px-4 py-3">Guest</th><th class="px-4 py-3">Host</th><th class="px-4 py-3">Department</th><th class="px-4 py-3">Registered</th><th class="px-4 py-3">Expires</th><th class="px-4 py-3">Status</th>
         </tr></thead>
         <tbody class="text-sm">
         ${[['Anika Patel','Maria Reyes','ICU 5N · visit','2h ago','22h','Active','success'],['Robert Hayes','James Tan','Security walkthrough','5h ago','19h','Active','success'],['Yuki Tanaka','Linda Park','Cardiology rounds','12h ago','12h','Active','warning'],['Tomás Vidal','Diane Wu','Rehab evaluator','yesterday','expired','Expired','danger']].map(([n,h,d,r,e,s,p])=>`
           <tr><td class="px-4 py-3 font-semibold">${n}</td><td class="px-4 py-3">${h}</td><td class="px-4 py-3 v1-muted">${d}</td><td class="px-4 py-3 v1-muted">${r}</td><td class="px-4 py-3">${e}</td><td class="px-4 py-3"><span class="v1-pill v1-pill-${p}">${s}</span></td></tr>`).join('')}
         </tbody>
       </table></div>`
    ],

    'HW_PixarV2_Reports.html': [
      null,
      // [1] Device status
      `<div class="p-datatable mt-3"><table class="w-full bg-white rounded-lg">
         <thead><tr class="text-left text-xs uppercase" style="background:var(--c-surface-3); color:var(--c-text-2);">
           <th class="px-4 py-3">Device</th><th class="px-4 py-3">Model</th><th class="px-4 py-3">Last seen</th><th class="px-4 py-3">Battery</th><th class="px-4 py-3">Cycles (30d)</th><th class="px-4 py-3">Status</th>
         </tr></thead>
         <tbody class="text-sm">
         ${[['PHN-0001','Zebra TC52','2m ago','94%',182,'In bay','success'],['PHN-0002','Zebra TC52','2h ago','67%',156,'Checked out','info'],['PHN-0017','Zebra TC52','14d ago','—',0,'Lost','danger'],['SCN-0003','Honeywell CT60','5m ago','18%',98,'Battery low','warning'],['TBL-0009','iPad Pro 11"','just now','100%',23,'In bay','success'],['RAD-0021','Motorola APX 4000','17m ago','82%',201,'Checked out','info']].map(([d,m,l,b,c,s,p])=>`
           <tr><td class="px-4 py-3 font-semibold">${d}</td><td class="px-4 py-3">${m}</td><td class="px-4 py-3 v1-muted">${l}</td><td class="px-4 py-3">${b}</td><td class="px-4 py-3">${c}</td><td class="px-4 py-3"><span class="v1-pill v1-pill-${p}">${s}</span></td></tr>`).join('')}
         </tbody>
       </table></div>`,
      // [2] Scheduled
      `<div class="grid grid-cols-2 gap-4 mt-3">
         ${[['Daily fleet snapshot','Weekdays · 06:00','PDF → admin@corewell.test','Last run: today 06:00'],['Weekly Asset Accounting','Mondays · 07:00','CSV → finance@corewell.test','Last run: 3d ago'],['Monthly Lost Devices','1st of month','XLSX → leadership-group','Next run: Jul 1'],['Quarterly Audit Trail','Q-end · 23:00','JSON → audit-vault','Next run: Sep 30']].map(([t,sch,dest,last])=>`
         <div class="p-card"><div class="p-card-body">
           <div class="flex items-center"><i class="pi pi-calendar text-brand"></i><strong class="ml-2">${t}</strong><span class="ml-auto v1-pill v1-pill-success">Active</span></div>
           <div class="text-xs mt-2" style="color:var(--c-text-2);">${sch}</div>
           <div class="text-xs v1-muted mt-1">→ ${dest}</div>
           <div class="text-xs v1-muted mt-1">${last}</div>
           <div class="flex gap-2 mt-3"><button class="p-button p-button-outlined p-button-sm">Run now</button><button class="p-button p-button-text p-button-sm">Edit</button></div>
         </div></div>`).join('')}
       </div>`,
      // [3] Custom
      `<div class="flex items-center gap-3 mt-3 mb-3">
         <button class="p-button p-button-sm"><i class="pi pi-plus mr-2"></i>New custom report</button>
         <span class="v1-muted text-xs">5 saved · 2 shared with team</span>
       </div>
       <div class="grid grid-cols-3 gap-3">
         ${['Lost devices by department · 90d','High-touch users · Q2','Battery degradation curve','Bay utilization heatmap','Audit: master key usage'].map(t=>`
         <div class="p-card"><div class="p-card-body">
           <strong style="font-size:var(--t-13);">${t}</strong>
           <div class="text-xs mt-2 v1-muted">Saved by Admin Rowe · last viewed yesterday</div>
           <button class="p-button p-button-text p-button-sm mt-2"><i class="pi pi-arrow-right mr-2"></i>Open</button>
         </div></div>`).join('')}
       </div>`
    ],

    'HW_PixarV2_Notifications.html': [
      null,
      // [1] Unread
      `<div class="space-y-2 mt-3">
       ${[['danger','Lost device flagged','PHN-0017 · Maria Reyes · 14d no return','9:14 AM'],['warning','Battery low','SCN-0003 · L-DET-001 Bay 12 · 18%','9:02 AM'],['warning','Bay near capacity','L-GR-002 · 92% utilization · 5th Floor ICU','8:48 AM'],['info','Self-registered guest','Anika Patel · host: Maria Reyes','2h ago'],['info','Firmware rollout 64%','9 of 14 lockers complete','3h ago']].map(([p,t,s,when])=>`
         <div class="p-card"><div class="p-card-body" style="padding:12px 16px;">
           <div class="flex items-center"><span class="v1-pill v1-pill-${p}">${p}</span><strong class="ml-2">${t}</strong><span class="ml-auto v1-muted text-xs">${when}</span></div>
           <div class="text-xs mt-1" style="color:var(--c-text-2);">${s}</div>
         </div></div>`).join('')}
       </div>`,
      // [2] Critical
      `<div class="space-y-2 mt-3">
       ${[['Lost device flagged','PHN-0017 · Maria Reyes · 14d no return','9:14 AM'],['Master key MK-002 used','James Tan · L-DET-002 · audit logged','7:33 AM'],['L-DET-002 offline 3h','No checkin since 02:14 · auto-retry queued','7:00 AM']].map(([t,s,when])=>`
         <div class="p-card" style="border-left:3px solid var(--c-danger);"><div class="p-card-body" style="padding:12px 16px;">
           <div class="flex items-center"><i class="pi pi-exclamation-triangle text-danger"></i><strong class="ml-2">${t}</strong><span class="ml-auto v1-muted text-xs">${when}</span></div>
           <div class="text-xs mt-1" style="color:var(--c-text-2);">${s}</div>
           <div class="flex gap-2 mt-2"><button class="p-button p-button-sm">Investigate</button><button class="p-button p-button-text p-button-sm">Acknowledge</button></div>
         </div></div>`).join('')}
       </div>`,
      // [3] Custom rules
      `<div class="flex items-center gap-3 mt-3 mb-3">
         <button class="p-button p-button-sm"><i class="pi pi-plus mr-2"></i>New rule</button>
         <span class="v1-muted text-xs">8 active rules · 2 paused</span>
       </div>
       <div class="space-y-2">
       ${[['Lost device threshold','When: no checkin > 14d · Severity: critical','Email + Slack #hw-alerts'],['Battery low','When: any device < 20% · Severity: warning','Push notification'],['Locker offline > 1h','When: no sync · Severity: critical','Page on-call · auto-ticket'],['Master key usage','When: any · Severity: info','Audit log + email security'],['Guest expired','When: TTL reached · Severity: info','Auto-revoke + notify host']].map(([t,when,dest])=>`
         <div class="p-card"><div class="p-card-body" style="padding:12px 16px; display:flex; align-items:center;">
           <div><strong>${t}</strong><div class="text-xs v1-muted mt-1">${when}</div><div class="text-xs mt-1" style="color:var(--c-text-2);">→ ${dest}</div></div>
           <div class="ml-auto flex gap-2"><span class="v1-pill v1-pill-success">Active</span><button class="p-button p-button-text p-button-sm"><i class="pi pi-pencil"></i></button></div>
         </div></div>`).join('')}
       </div>`
    ],

    'HW_PixarV2_Software_Updates.html': [
      null,
      // [1] Device APK
      `<div class="rounded-xl p-4 flex items-center gap-4 mt-3 mb-3" style="background:var(--c-info-soft); border-left:3px solid var(--c-info);">
         <i class="pi pi-android text-2xl text-info"></i>
         <div class="flex-1"><div class="font-semibold text-info">HW-Scout v3.8.2 rolling out · 87 pending</div><div class="text-xs v1-muted mt-1">Approved May 30 · QA passed</div></div>
         <button class="p-button p-button-outlined p-button-sm">Pause</button>
       </div>
       <div class="p-datatable"><table class="w-full bg-white rounded-lg">
         <thead><tr class="text-left text-xs uppercase" style="background:var(--c-surface-3); color:var(--c-text-2);">
           <th class="px-4 py-3">Device</th><th class="px-4 py-3">Model</th><th class="px-4 py-3">Current APK</th><th class="px-4 py-3">Target</th><th class="px-4 py-3">Status</th>
         </tr></thead>
         <tbody class="text-sm">
         ${[['PHN-0042','Zebra TC52','3.8.1','3.8.2','Queued · warning'],['PHN-0117','Zebra TC52','3.8.1','3.8.2','Installing · info'],['TBL-0009','iPad Pro 11"','3.8.0','3.8.2','Complete · success'],['SCN-0003','Honeywell CT60','3.7.4','3.8.2','Failed — offline · danger']].map(([d,m,cur,t,s])=>{const[lab,p]=s.split(' · ');return `<tr><td class="px-4 py-3 font-semibold">${d}</td><td class="px-4 py-3">${m}</td><td class="px-4 py-3 v1-mono">${cur}</td><td class="px-4 py-3 v1-mono">${t}</td><td class="px-4 py-3"><span class="v1-pill v1-pill-${p}">${lab}</span></td></tr>`}).join('')}
         </tbody>
       </table></div>`,
      // [2] Scheduled
      `<div class="grid grid-cols-2 gap-4 mt-3">
       ${[['Detroit locker batch','Tonight 02:00 ET','4 lockers · firmware 4.13.0','Maintenance window: 30 min'],['Outpatient APK refresh','Jun 19 03:00 ET','62 devices · HW-Scout 3.8.2','Pre-shift completion'],['ICU urgent patch','Jun 18 22:00 ET','12 devices · security CVE','Approved by IT lead'],['Quarterly firmware','Q3 schedule','All 14 lockers · 4.14.0','Stagger by region']].map(([t,when,scope,note])=>`
         <div class="p-card"><div class="p-card-body">
           <div class="flex items-center"><i class="pi pi-calendar text-brand"></i><strong class="ml-2">${t}</strong><span class="ml-auto v1-pill v1-pill-info">Scheduled</span></div>
           <div class="text-xs mt-2"><strong>${when}</strong></div>
           <div class="text-xs mt-1 v1-muted">${scope}</div>
           <div class="text-xs mt-1" style="color:var(--c-text-2);">${note}</div>
           <div class="flex gap-2 mt-3"><button class="p-button p-button-outlined p-button-sm">Edit window</button><button class="p-button p-button-text p-button-sm">Cancel</button></div>
         </div></div>`).join('')}
       </div>`,
      // [3] Release notes
      `<div class="space-y-3 mt-3">
       ${[['Firmware 4.13.0','Released May 28','Improved RFID detection · faster bay open · 2 CVE fixes (CVE-2026-1184, CVE-2026-1209)'],['Firmware 4.12.2','Apr 14','Bay sensor calibration · LED color correction'],['HW-Scout APK 3.8.2','May 30','Battery telemetry · offline queue sync · crash fix on Android 13']].map(([t,d,n])=>`
         <div class="p-card"><div class="p-card-body">
           <div class="flex items-center"><strong>${t}</strong><span class="ml-auto v1-pill v1-pill-brand">${d}</span></div>
           <div class="text-xs mt-2" style="color:var(--c-text-2);">${n}</div>
           <button class="p-button p-button-text p-button-sm mt-2"><i class="pi pi-file mr-2"></i>Full changelog</button>
         </div></div>`).join('')}
       </div>`
    ]
  };

  /* ---------------- 1. TabView tab switching + content swap ---------------- */
  function wireTabs() {
    const pageName = (location.pathname.split('/').pop() || '').replace(/\?.*$/, '');
    const panels = TAB_PANELS[pageName] || null;

    document.querySelectorAll('.p-tabview').forEach(tabview => {
      // Set up a sibling swap zone after the tabview
      let swapZone = tabview.parentElement.querySelector('#pv2-tab-zone');
      if (!swapZone) {
        swapZone = document.createElement('div');
        swapZone.id = 'pv2-tab-zone';
        // Move ALL siblings after tabview into the swap zone
        let next = tabview.nextElementSibling;
        const movedNodes = [];
        while (next) {
          const move = next;
          next = next.nextElementSibling;
          movedNodes.push(move);
        }
        tabview.after(swapZone);
        movedNodes.forEach(n => swapZone.appendChild(n));
        swapZone.dataset.originalHtml = swapZone.innerHTML;
      }

      const lis = tabview.querySelectorAll('.p-tabview-nav li');
      lis.forEach((li, idx) => {
        const link = li.querySelector('.p-tabview-nav-link');
        if (!link) return;
        link.style.cursor = 'pointer';
        link.addEventListener('click', e => {
          e.preventDefault();
          lis.forEach(s => s.classList.remove('p-tabview-selected', 'p-highlight'));
          li.classList.add('p-tabview-selected', 'p-highlight');

          if (idx === 0) {
            swapZone.innerHTML = swapZone.dataset.originalHtml;
          } else if (panels && panels[idx]) {
            swapZone.innerHTML = panels[idx];
          } else {
            swapZone.innerHTML = `
              <div class="p-card" style="margin-top:16px;"><div class="p-card-body" style="text-align:center; padding:48px 24px;">
                <i class="pi pi-info-circle" style="font-size:32px; color:var(--c-text-muted);"></i>
                <div style="font-weight:600; margin-top:12px; font-size:var(--t-14);">${link.textContent.trim()}</div>
                <div class="v1-muted" style="font-size:var(--t-12); margin-top:6px; max-width:480px; margin-left:auto; margin-right:auto;">
                  Mock view. Dev intent: render this tab's dataset via &lt;DataTable&gt; or &lt;Card&gt; grid using the same shell.
                </div>
              </div></div>`;
          }
          // Re-wire freshly injected content
          setTimeout(() => {
            wireRowClicks();
            wireSortableHeaders();
            wireEllipsisMenus();
            wireSelectButtons();
            wireFilterChips();
            wireCursors();
          }, 0);
        });
      });
    });
  }

  /* ---------------- 2. SelectButton group toggle ---------------- */
  function wireSelectButtons() {
    document.querySelectorAll('.p-selectbutton, .p-buttonset').forEach(group => {
      if (group.dataset.pv2Wired === '1') return;
      const buttons = group.querySelectorAll('button.p-button');
      if (buttons.length < 2) return;
      buttons.forEach(btn => {
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', e => {
          e.preventDefault();
          buttons.forEach(b => { b.classList.remove('p-highlight'); b.classList.add('p-button-text'); });
          btn.classList.remove('p-button-text'); btn.classList.add('p-highlight');
        });
      });
      group.dataset.pv2Wired = '1';
    });
  }

  /* ---------------- 3. Filter chip toggle ---------------- */
  function wireFilterChips() {
    document.querySelectorAll('.p-tag[style*="cursor:pointer"], .p-tag[style*="cursor: pointer"]').forEach(chip => {
      if (chip.dataset.pv2Wired === '1') return;
      chip.addEventListener('click', e => {
        e.preventDefault();
        const isActive = chip.dataset.active === '1';
        chip.dataset.active = isActive ? '0' : '1';
        chip.style.outline = isActive ? '' : '2px solid var(--c-brand)';
        chip.style.outlineOffset = isActive ? '' : '2px';
      });
      chip.dataset.pv2Wired = '1';
    });
  }

  /* ---------------- 4. DataTable row click → drawer ---------------- */
  function wireRowClicks() {
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
              <button class="p-button p-button-sm"><i class="pi pi-pencil mr-2"></i>Edit</button>
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

    document.querySelectorAll('.p-datatable tbody tr, table tbody tr').forEach(tr => {
      if (tr.querySelector('th')) return;
      if (tr.dataset.pv2Wired === '1') return;
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', e => {
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
                    <div>Static demo drawer. In production: &lt;Sidebar position="right"&gt; with bound record.</div>
                    <ul style="margin-top:12px; padding-left:16px; line-height:1.7;">
                      ${Array.from(cells).slice(0,6).map(c => `<li class="v1-secondary">${c.textContent.trim().slice(0,60)}</li>`).join('')}
                    </ul>`
        });
      });
      tr.dataset.pv2Wired = '1';
    });

    document.querySelectorAll('[data-drawer-title]').forEach(el => {
      if (el.dataset.pv2Wired === '1') return;
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
      el.dataset.pv2Wired = '1';
    });

    window.PixarV2 = window.PixarV2 || {};
    window.PixarV2.openDrawer = openDrawer;
    window.PixarV2.closeDrawer = closeDrawer;
  }

  /* ---------------- 5. Sortable column headers ---------------- */
  function wireSortableHeaders() {
    document.querySelectorAll('th i.pi-sort-amount-up-alt, th i.pi-sort-amount-down').forEach(icon => {
      if (icon.dataset.pv2Wired === '1') return;
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
      icon.dataset.pv2Wired = '1';
    });
  }

  /* ---------------- 6. Settings sub-nav swap ---------------- */
  const SETTINGS_PANELS = {
    'Profile': `<div class="p-card"><div class="p-card-body">
        <h2 style="font-size:var(--t-16); font-weight:600;">Profile</h2>
        <div class="text-xs mt-1" style="color:var(--c-text-2);">Your account, display name, and 2FA.</div>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div><label class="text-xs font-semibold uppercase v1-muted">Name</label><input class="p-inputtext w-full mt-1" value="Admin Rowe"/></div>
          <div><label class="text-xs font-semibold uppercase v1-muted">Email</label><input class="p-inputtext w-full mt-1" value="admin@honestwaves.test"/></div>
          <div><label class="text-xs font-semibold uppercase v1-muted">Role</label><input class="p-inputtext w-full mt-1" value="Admin"/></div>
          <div><label class="text-xs font-semibold uppercase v1-muted">Two-factor</label><div class="mt-2 flex items-center gap-2"><span class="p-inputswitch p-inputswitch-checked"><span class="p-inputswitch-slider"></span></span><span class="text-sm">Authenticator app</span></div></div>
        </div></div></div>`,
    'Security': `<div class="p-card"><div class="p-card-body">
        <h2 style="font-size:var(--t-16); font-weight:600;">Security</h2>
        <div class="text-xs mt-1" style="color:var(--c-text-2);">Password, sessions, SSO.</div>
        <div class="space-y-3 mt-4">
          <div class="flex items-center justify-between p-3 border rounded"><div><strong>Password</strong><div class="text-xs v1-muted">Last changed 14d ago</div></div><button class="p-button p-button-outlined p-button-sm">Change</button></div>
          <div class="flex items-center justify-between p-3 border rounded"><div><strong>Active sessions</strong><div class="text-xs v1-muted">3 devices · this device, MacBook · Chrome</div></div><button class="p-button p-button-outlined p-button-sm">Manage</button></div>
          <div class="flex items-center justify-between p-3 border rounded"><div><strong>SSO (Azure AD)</strong><div class="text-xs v1-muted">Enabled · synced 7m ago</div></div><span class="v1-pill v1-pill-success">Connected</span></div>
        </div></div></div>`,
    'Self-registration': `<div class="p-card"><div class="p-card-body">
        <h2 style="font-size:var(--t-16); font-weight:600;">Guest self-registration</h2>
        <div class="text-xs mt-1" style="color:var(--c-text-2);">Configure who can self-register on kiosks.</div>
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div><label class="text-xs font-semibold uppercase v1-muted">Allow self-reg</label><div class="mt-2"><span class="p-inputswitch p-inputswitch-checked"><span class="p-inputswitch-slider"></span></span></div></div>
          <div><label class="text-xs font-semibold uppercase v1-muted">Default TTL</label><input class="p-inputtext w-full mt-1" value="24 hours"/></div>
          <div><label class="text-xs font-semibold uppercase v1-muted">Photo required</label><div class="mt-2"><span class="p-inputswitch p-inputswitch-checked"><span class="p-inputswitch-slider"></span></span></div></div>
          <div><label class="text-xs font-semibold uppercase v1-muted">Host approval</label><div class="mt-2"><span class="p-inputswitch"><span class="p-inputswitch-slider"></span></span></div></div>
        </div></div></div>`,
    'Master Keys': `<div class="p-card"><div class="p-card-body">
        <h2 style="font-size:var(--t-16); font-weight:600;">Master Keys <i class="pi pi-shield text-warning"></i></h2>
        <div class="text-xs mt-1" style="color:var(--c-text-2);">Physical override keys. Use triggers a high-severity alert.</div>
        <table class="w-full text-sm mt-4">
          <thead><tr class="text-left text-xs uppercase v1-muted"><th class="py-2">Key</th><th>Holder</th><th>Last used</th><th>Status</th><th></th></tr></thead>
          <tbody class="divide-y" style="border-color:var(--c-divider);">
            <tr><td class="py-2 v1-mono">MK-001</td><td>Admin Rowe</td><td class="v1-muted">3w ago</td><td><span class="v1-pill v1-pill-success">Active</span></td><td><button class="p-button p-button-text p-button-sm">Rotate</button></td></tr>
            <tr><td class="py-2 v1-mono">MK-002</td><td>James Tan</td><td class="v1-muted">12h ago</td><td><span class="v1-pill v1-pill-success">Active</span></td><td><button class="p-button p-button-text p-button-sm">Rotate</button></td></tr>
            <tr><td class="py-2 v1-mono">MK-003</td><td class="v1-muted">Unassigned</td><td class="v1-muted">never</td><td><span class="v1-pill v1-pill-warning">Spare</span></td><td><button class="p-button p-button-text p-button-sm">Assign</button></td></tr>
          </tbody>
        </table></div></div>`,
    'Integrations': `<div class="p-card"><div class="p-card-body">
        <h2 style="font-size:var(--t-16); font-weight:600;">Integrations</h2>
        <div class="text-xs mt-1" style="color:var(--c-text-2);">Connected systems.</div>
        <div class="grid grid-cols-2 gap-3 mt-4">
          ${[['Epic EMR','epic-connect','success','Synced 4m ago'],['Workday HRIS','workday','success','Synced 2h ago'],['Slack #hw-alerts','slack','success','Active webhook'],['ServiceNow tickets','servicenow','warning','Auth expires in 3d'],['Single Sign-On (Azure AD)','azure','success','SCIM sync enabled'],['Splunk audit log','splunk','info','Streaming']].map(([n,_,p,sub])=>`
            <div class="p-3 border rounded flex items-center"><i class="pi pi-link text-brand"></i><div class="ml-3"><strong>${n}</strong><div class="text-xs v1-muted">${sub}</div></div><span class="v1-pill v1-pill-${p} ml-auto">Active</span></div>`).join('')}
        </div></div></div>`,
    'Notifications': `<div class="p-card"><div class="p-card-body">
        <h2 style="font-size:var(--t-16); font-weight:600;">Notification preferences</h2>
        <div class="text-xs mt-1" style="color:var(--c-text-2);">How you receive alerts.</div>
        <div class="space-y-2 mt-4">
          ${['Critical (lost devices, offline lockers, master key use)','Warning (battery low, near capacity)','Info (rollouts, self-registered guests)','Daily digest at 06:00'].map(t=>`
            <div class="flex items-center justify-between p-3 border rounded"><div><strong style="font-size:var(--t-13);">${t}</strong></div><div class="flex gap-3 text-xs items-center"><span>Email</span><span class="p-inputswitch p-inputswitch-checked"><span class="p-inputswitch-slider"></span></span><span>Push</span><span class="p-inputswitch p-inputswitch-checked"><span class="p-inputswitch-slider"></span></span><span>SMS</span><span class="p-inputswitch"><span class="p-inputswitch-slider"></span></span></div></div>`).join('')}
        </div></div></div>`
  };

  function wireSettingsSubNav() {
    if (!location.pathname.endsWith('HW_PixarV2_Settings.html')) return;
    const items = document.querySelectorAll('aside .ml-7 a');
    if (!items.length) return;
    const main = document.querySelector('main');
    if (!main) return;
    if (!main.dataset.origHtml) main.dataset.origHtml = main.innerHTML;
    items.forEach(item => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', e => {
        e.preventDefault();
        items.forEach(s => { s.classList.remove('text-brand-deep','font-semibold'); s.classList.add('text-slate-500','hover:text-slate-900'); s.textContent = s.textContent.replace(/^›\s*/, ''); });
        item.classList.add('text-brand-deep','font-semibold'); item.classList.remove('text-slate-500','hover:text-slate-900');
        const label = item.textContent.trim();
        item.textContent = '› ' + label;
        const panel = SETTINGS_PANELS[label];
        if (panel) {
          main.innerHTML = `<div class="max-w-4xl space-y-5">${panel}</div>`;
          setTimeout(() => { wireRowClicks(); wireCursors(); }, 0);
        }
      });
    });
  }

  /* ---------------- 7. Lockers/Devices/Users sub-nav (ml-7) ---------------- */
  function wireSidebarSubNav() {
    const subnav = document.querySelectorAll('aside .ml-7 a');
    subnav.forEach(item => {
      if (item.dataset.pv2Wired === '1') return;
      item.style.cursor = 'pointer';
      item.addEventListener('click', e => {
        e.preventDefault();
        const label = item.textContent.replace(/^›\s*/, '').trim();
        // Try to find matching tab in the page tabview
        const tabs = document.querySelectorAll('.p-tabview-nav li');
        let matched = false;
        tabs.forEach(li => {
          const txt = li.textContent.trim();
          if (txt.toLowerCase().startsWith(label.toLowerCase())) {
            li.querySelector('.p-tabview-nav-link')?.click();
            matched = true;
          }
        });
        if (matched) {
          subnav.forEach(s => { s.classList.remove('text-brand-deep','font-semibold'); s.classList.add('text-slate-500','hover:text-slate-900'); s.textContent = s.textContent.replace(/^›\s*/, ''); });
          item.classList.add('text-brand-deep','font-semibold'); item.classList.remove('text-slate-500','hover:text-slate-900');
          item.textContent = '› ' + label;
        }
      });
      item.dataset.pv2Wired = '1';
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

  /* ---------------- 9. Ellipsis menu popover ---------------- */
  function wireEllipsisMenus() {
    document.querySelectorAll('i.pi-ellipsis-v').forEach(icon => {
      if (icon.dataset.pv2Wired === '1') return;
      icon.style.cursor = 'pointer';
      icon.addEventListener('click', e => {
        e.stopPropagation();
        document.querySelectorAll('.pv2-ellipsis-pop').forEach(p => p.remove());
        const pop = document.createElement('div');
        pop.className = 'pv2-ellipsis-pop';
        pop.innerHTML = `
          <div class="pv2-ellipsis-item"><i class="pi pi-eye"></i>View detail</div>
          <div class="pv2-ellipsis-item"><i class="pi pi-pencil"></i>Edit</div>
          <div class="pv2-ellipsis-item"><i class="pi pi-history"></i>View trail</div>
          <div class="pv2-ellipsis-item pv2-ellipsis-danger"><i class="pi pi-trash"></i>Delete</div>`;
        Object.assign(pop.style, { position:'absolute', background:'var(--c-surface)', border:'1px solid var(--c-border)', borderRadius:'var(--r-md)', boxShadow:'var(--sh-popover)', padding:'4px', zIndex:8000, fontSize:'var(--t-13)', minWidth:'160px' });
        const rect = icon.getBoundingClientRect();
        pop.style.top = (rect.bottom + window.scrollY + 4) + 'px';
        pop.style.left = (rect.left + window.scrollX - 130) + 'px';
        document.body.appendChild(pop);
        pop.querySelectorAll('.pv2-ellipsis-item').forEach(item => {
          Object.assign(item.style, { padding:'6px 10px', borderRadius:'var(--r-sm)', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', color:'var(--c-text)' });
          item.addEventListener('mouseenter', () => item.style.background = 'var(--c-surface-3)');
          item.addEventListener('mouseleave', () => item.style.background = '');
          item.addEventListener('click', () => pop.remove());
          if (item.classList.contains('pv2-ellipsis-danger')) item.style.color = 'var(--c-danger)';
        });
        setTimeout(() => {
          document.addEventListener('click', function once() { pop.remove(); document.removeEventListener('click', once); });
        }, 0);
      });
      icon.dataset.pv2Wired = '1';
    });
  }

  /* ---------------- 10. Cursors ---------------- */
  function wireCursors() {
    document.querySelectorAll('.p-button, .p-tag[style*="cursor"], .v1-nav-item').forEach(el => {
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
    wireSettingsSubNav();
    wireSidebarSubNav();
    wireSearchShortcut();
    wireEllipsisMenus();
    wireCursors();
    console.log('[Pixar v.2] interactivity v2 — tabs swap content, sub-nav wired, drawers + menus active.');
  });
})();
