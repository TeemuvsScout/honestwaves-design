/* =====================================================================
   Pixar v.2 — companion layer
   Forked v.1 markup carries its own inline interactivity (tabs, modals,
   sub-nav, drawers, sub-section show/hide). This file adds three things:
     1. "/" shortcut to focus any search input
     2. cursor:pointer safety net on common interactive selectors
     3. "View as PrimeVue" floating button → opens a drawer with the
        page's canonical Vue template, so dev can copy-paste the
        component implementation while looking at the running design.
   ===================================================================== */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ------------------ Vue snippet per page ------------------ */
  const SNIPPETS = {
    'HW_PixarV2_Dashboard.html': {
      title: 'Dashboard',
      pattern: 'KPI strip + Lost Devices DataTable + Card composition',
      vue: `<!-- Dashboard.vue -->
<template>
  <div class="grid grid-cols-4 gap-4 mb-5">
    <Card v-for="kpi in kpis" :key="kpi.label">
      <template #content>
        <div class="text-xs text-color-secondary uppercase">{{ kpi.label }}</div>
        <div class="text-2xl font-bold mt-1" :class="kpi.tone">{{ kpi.value }}</div>
        <div class="text-xs text-color-secondary mt-1">{{ kpi.sub }}</div>
      </template>
    </Card>
  </div>

  <Card>
    <template #title>Lost devices · by department</template>
    <template #content>
      <DataTable :value="lostDevices" :rowsPerPage="10" stripedRows>
        <Column field="device" header="Device" sortable />
        <Column field="holder" header="Holder" />
        <Column field="dept" header="Department" />
        <Column field="lastSeen" header="Last seen" />
        <Column field="days" header="Days">
          <template #body="{ data }">
            <Tag :severity="data.days > 14 ? 'danger' : 'warning'" :value="data.days + 'd'" />
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'

const kpis = ref([
  { label: 'Bays in use', value: '189', sub: '56% utilization', tone: '' },
  { label: 'Devices lost', value: '11', sub: '3 high-risk users', tone: 'text-red-500' },
  { label: 'Locker uptime', value: '99.4%', sub: 'last 30 days', tone: 'text-green-500' },
  { label: 'Pending updates', value: '87', sub: 'tonight', tone: 'text-amber-600' }
])
const lostDevices = ref([
  { device: 'PHN-0017', holder: 'Maria Reyes', dept: 'ICU 5N', lastSeen: '14d ago', days: 14 },
  // ... more rows
])
</script>`
    },

    'HW_PixarV2_Mission_Control.html': {
      title: 'Mission Control',
      pattern: 'Locker SelectButton + bay grid + Sidebar drawer + ConfirmDialog',
      vue: `<!-- MissionControl.vue -->
<template>
  <SelectButton v-model="activeLocker" :options="lockers" optionLabel="name" />

  <div class="grid grid-cols-8 gap-2 mt-5">
    <button v-for="bay in bays" :key="bay.id"
            @click="openBay(bay)"
            class="aspect-square rounded-md grid place-items-center font-semibold"
            :class="bayClass(bay.state)">
      {{ bay.id }}
    </button>
  </div>

  <Sidebar v-model:visible="drawerOpen" position="right" class="w-[420px]">
    <h3 class="text-xl font-bold">Bay {{ activeBay?.id }}</h3>
    <Tag :severity="activeBay?.severity" :value="activeBay?.status" />
    <div class="mt-4">{{ activeBay?.holderName }} · {{ activeBay?.duration }}</div>
    <Button label="Reset bay" severity="danger" @click="confirmReset" />
  </Sidebar>

  <ConfirmDialog />
</template>

<script setup>
import { ref } from 'vue'
import SelectButton from 'primevue/selectbutton'
import Sidebar from 'primevue/sidebar'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'

const confirm = useConfirm()
const lockers = ref([{name:'All lockers'},{name:'Pink8'},{name:'Blue34'},{name:'Green8'}])
const activeLocker = ref(lockers.value[1])
const drawerOpen = ref(false)
const activeBay = ref(null)

function openBay(bay) { activeBay.value = bay; drawerOpen.value = true }
function confirmReset() {
  confirm.require({
    message: 'Reset bay ' + activeBay.value.id + '?',
    header: 'Reset bay',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger'
  })
}
function bayClass(state) { return { available: 'bg-green-100', overdue: 'bg-red-100', off: 'bg-slate-100' }[state] }
</script>`
    },

    'HW_PixarV2_Lockers.html': {
      title: 'Lockers',
      pattern: 'TabView (Lockers / Locations / Templates) + DataTable + SelectButton List/Tile',
      vue: `<!-- Lockers.vue -->
<template>
  <TabView v-model:activeIndex="tab">
    <TabPanel header="Lockers" :badge="lockers.length.toString()">
      <SelectButton v-model="view" :options="['List','Tile']" />
      <DataTable :value="lockers" v-if="view === 'List'" stripedRows
                 selectionMode="single" @row-select="onRowSelect">
        <Column field="id" header="Locker" sortable />
        <Column field="location" header="Location" />
        <Column field="bays" header="Bays" />
        <Column header="Utilization">
          <template #body="{ data }">
            <ProgressBar :value="data.util" style="height:6px" />
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag :severity="data.severity" :value="data.status" />
          </template>
        </Column>
      </DataTable>
      <div v-else class="grid grid-cols-3 gap-4">
        <Card v-for="locker in lockers" :key="locker.id">
          <template #content>
            <strong>{{ locker.id }}</strong>
            <Tag :severity="locker.severity" :value="locker.status" />
          </template>
        </Card>
      </div>
    </TabPanel>

    <TabPanel header="Locations" :badge="locations.length.toString()">
      <DataTable :value="locations" stripedRows>
        <Column field="name" header="Location" sortable />
        <Column field="lockerCount" header="Lockers" />
      </DataTable>
    </TabPanel>

    <TabPanel header="Templates" :badge="templates.length.toString()">
      <div class="grid grid-cols-2 gap-4">
        <Card v-for="t in templates" :key="t.id">
          <template #title>{{ t.name }}</template>
          <template #content>{{ t.description }}</template>
        </Card>
      </div>
    </TabPanel>
  </TabView>

  <Sidebar v-model:visible="drawerOpen" position="right" />
</template>

<script setup>
import { ref } from 'vue'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import SelectButton from 'primevue/selectbutton'
import Sidebar from 'primevue/sidebar'

const tab = ref(0); const view = ref('List')
const drawerOpen = ref(false); const activeLocker = ref(null)
const lockers = ref([{ id:'L-GR-001', location:'Grand Rapids', bays:24, util:67, status:'Online', severity:'success' }])
const locations = ref([{ name:'Grand Rapids', lockerCount: 3 }])
const templates = ref([{ id:'er-lobby', name:'ER Lobby', description:'24-bay standard · RFID + PIN' }])
function onRowSelect(e) { activeLocker.value = e.data; drawerOpen.value = true }
</script>`
    },

    'HW_PixarV2_Devices.html': {
      title: 'Devices',
      pattern: 'DataTable with filters, sortable cols, lazy load + Avatar + status Tag',
      vue: `<!-- Devices.vue -->
<template>
  <TabView v-model:activeIndex="tab">
    <TabPanel header="Devices">
      <div class="flex gap-2 mb-3">
        <IconField iconPosition="left">
          <InputIcon class="pi pi-search" />
          <InputText v-model="filters.global.value" placeholder="Search…" />
        </IconField>
        <MultiSelect v-model="filters.model" :options="models" placeholder="Model" />
        <MultiSelect v-model="filters.status" :options="statuses" placeholder="Status" />
      </div>

      <DataTable :value="devices" v-model:filters="filters" :paginator="true" :rows="10"
                 selectionMode="single" stripedRows lazy
                 @row-select="row => { active = row.data; drawerOpen = true }">
        <Column field="id" header="Device" sortable>
          <template #body="{ data }"><strong>{{ data.id }}</strong></template>
        </Column>
        <Column field="model" header="Model" sortable filter />
        <Column field="serial" header="Serial" />
        <Column field="location" header="Location" />
        <Column header="Holder">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <Avatar :label="data.holderInitials" shape="circle" />
              {{ data.holder }}
            </div>
          </template>
        </Column>
        <Column field="battery" header="Battery">
          <template #body="{ data }">
            <i class="pi pi-bolt" :class="batteryColor(data.battery)" /> {{ data.battery }}%
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag :severity="data.severity" :value="data.status" />
          </template>
        </Column>
      </DataTable>
    </TabPanel>

    <TabPanel header="Manage Models" :badge="models.length.toString()">
      <DataTable :value="modelCatalog" />
    </TabPanel>
  </TabView>

  <Sidebar v-model:visible="drawerOpen" position="right" class="w-[420px]">
    <h3 class="text-xl font-bold">{{ active?.id }}</h3>
    <Tag :severity="active?.severity" :value="active?.status" />
    <!-- Full device detail -->
  </Sidebar>
</template>

<script setup>
import { ref } from 'vue'
import { FilterMatchMode } from 'primevue/api'
import TabView from 'primevue/tabview'; import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'; import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'; import InputIcon from 'primevue/inputicon'
import MultiSelect from 'primevue/multiselect'
import Avatar from 'primevue/avatar'; import Tag from 'primevue/tag'
import Sidebar from 'primevue/sidebar'

const tab = ref(0); const drawerOpen = ref(false); const active = ref(null)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  model: null, status: null
})
const models = ref(['Zebra TC52','Honeywell CT60','iPad Pro 11"','Motorola APX 4000'])
const statuses = ref(['In bay','Checked out','Lost','Battery low'])
const devices = ref([/* ... */])
const modelCatalog = ref([/* ... */])
function batteryColor(p) { return p > 50 ? 'text-green-500' : p > 20 ? 'text-amber-500' : 'text-red-500' }
</script>`
    },

    'HW_PixarV2_Users.html': {
      title: 'Users',
      pattern: 'TabView (Users / Departments / Guests) + DataTable + Avatar + edit Dialog',
      vue: `<!-- Users.vue -->
<template>
  <TabView v-model:activeIndex="tab">
    <TabPanel header="Users" :badge="users.length.toString()">
      <Toolbar class="mb-3">
        <template #start>
          <Button icon="pi pi-user-plus" label="Invite user" />
          <Button icon="pi pi-upload" label="Import" outlined class="ml-2" />
        </template>
        <template #end>
          <IconField iconPosition="left">
            <InputIcon class="pi pi-search" />
            <InputText v-model="search" placeholder="Search users…" />
          </IconField>
        </template>
      </Toolbar>

      <DataTable :value="users" v-model:selection="selected" :paginator="true" :rows="20"
                 selectionMode="multiple">
        <Column selectionMode="multiple" />
        <Column header="Name" sortable>
          <template #body="{ data }">
            <div class="flex items-center gap-3">
              <Avatar :label="data.initials" shape="circle" />
              <div>
                <strong>{{ data.name }}</strong>
                <div class="text-xs">{{ data.id }}</div>
              </div>
            </div>
          </template>
        </Column>
        <Column field="email" header="Email" />
        <Column field="department" header="Department" />
        <Column field="role" header="Role">
          <template #body="{ data }">
            <Tag :value="data.role" />
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag :severity="data.locked ? 'danger' : 'success'"
                 :value="data.locked ? 'Locked' : 'Active'"
                 :icon="data.locked ? 'pi pi-lock' : null" />
          </template>
        </Column>
      </DataTable>
    </TabPanel>

    <TabPanel header="Departments" :badge="departments.length.toString()">
      <DataTable :value="departments" />
    </TabPanel>

    <TabPanel header="Guests" :badge="guests.length.toString()">
      <DataTable :value="guests" />
    </TabPanel>
  </TabView>

  <Dialog v-model:visible="editOpen" modal header="Edit user" :style="{ width: '460px' }">
    <UserEditForm v-model="editing" />
    <template #footer>
      <Button label="Cancel" text @click="editOpen = false" />
      <Button label="Save" @click="save" />
    </template>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import TabView from 'primevue/tabview'; import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'; import Column from 'primevue/column'
import Avatar from 'primevue/avatar'; import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'; import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'
import IconField from 'primevue/iconfield'; import InputIcon from 'primevue/inputicon'
import Dialog from 'primevue/dialog'

const tab = ref(0); const search = ref(''); const selected = ref([])
const editOpen = ref(false); const editing = ref(null)
const users = ref([/* … */]); const departments = ref([/* … */]); const guests = ref([/* … */])
function save() { /* … */ editOpen.value = false }
</script>`
    },

    'HW_PixarV2_Reports.html': {
      title: 'Reports',
      pattern: 'TabView (Activity / Device status / Scheduled / Custom) + DataTable + Card grid',
      vue: `<!-- Reports.vue -->
<template>
  <TabView v-model:activeIndex="tab">
    <TabPanel header="Activity log">
      <DataTable :value="activityLog" stripedRows :paginator="true" :rows="50">
        <Column field="timestamp" header="When" sortable />
        <Column field="actor" header="Actor" />
        <Column field="action" header="Action">
          <template #body="{ data }">
            <Tag :severity="severityFor(data.action)" :value="data.action" />
          </template>
        </Column>
        <Column field="entity" header="Entity" />
        <Column field="ip" header="IP" />
      </DataTable>
    </TabPanel>

    <TabPanel header="Device status"><DataTable :value="deviceStatus" /></TabPanel>

    <TabPanel header="Scheduled reports">
      <div class="grid grid-cols-2 gap-4">
        <Card v-for="r in scheduled" :key="r.id">
          <template #title>{{ r.name }}</template>
          <template #content>
            <div>{{ r.schedule }}</div>
            <div class="text-xs">→ {{ r.destination }}</div>
            <Button label="Run now" outlined size="small" class="mt-2" />
          </template>
        </Card>
      </div>
    </TabPanel>

    <TabPanel header="Custom reports">
      <DataView :value="customReports" layout="grid" />
    </TabPanel>
  </TabView>
</template>

<script setup>
import { ref } from 'vue'
import TabView from 'primevue/tabview'; import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'; import Column from 'primevue/column'
import Card from 'primevue/card'; import Tag from 'primevue/tag'; import Button from 'primevue/button'
import DataView from 'primevue/dataview'

const tab = ref(0)
const activityLog = ref([/* … */])
const deviceStatus = ref([/* … */])
const scheduled = ref([/* … */])
const customReports = ref([/* … */])
function severityFor(action) {
  if (/lost|delete|reset/i.test(action)) return 'danger'
  if (/check.?out|warn/i.test(action)) return 'warning'
  return 'success'
}
</script>`
    },

    'HW_PixarV2_Access_Matrix.html': {
      title: 'Access Matrix',
      pattern: 'SelectButton perspective switcher + Tailwind grid matrix + grant resolution Card',
      vue: `<!-- AccessMatrix.vue -->
<template>
  <SelectButton v-model="perspective"
    :options="['Locker → Bay','User','Department','Grant path']" />

  <AutoComplete v-model="entity" :suggestions="suggestions" @complete="search"
                placeholder="Pick a locker / user / department" />

  <Card class="mt-4">
    <template #content>
      <div class="overflow-x-auto">
        <table class="text-sm">
          <thead><tr>
            <th class="px-3 py-2">Department</th>
            <th v-for="bay in bays" :key="bay" class="px-2 py-2">{{ bay }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="dept in departments" :key="dept">
              <td class="px-3 py-2 font-semibold">{{ dept }}</td>
              <td v-for="cell in matrix[dept]" :key="cell.bay">
                <div class="w-9 h-9 rounded-md grid place-items-center cursor-pointer"
                     :class="cellClass(cell.state)" @click="openDetail(cell)">
                  <i :class="cellIcon(cell.state)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </Card>

  <Dialog v-model:visible="detailOpen" header="Grant path" modal>
    <Timeline :value="grantPath" />
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import SelectButton from 'primevue/selectbutton'
import AutoComplete from 'primevue/autocomplete'
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import Timeline from 'primevue/timeline'

const perspective = ref('Locker → Bay')
const entity = ref('L-GR-001'); const suggestions = ref([])
const detailOpen = ref(false); const grantPath = ref([])

const bays = Array.from({length:12}, (_,i)=>'Bay '+(i+1))
const departments = ['ER North','ICU 5N','Security','Rehab Pavilion','IT','Guest (24h)']
const matrix = ref({/* per-dept array of {bay, state: allow|deny|inherit|none} */})

function cellClass(state) { return { allow:'bg-green-100 text-green-800', deny:'bg-red-100 text-red-800', inherit:'bg-blue-50 text-blue-700', none:'bg-slate-100 text-slate-400' }[state] }
function cellIcon(state) { return { allow:'pi pi-check', deny:'pi pi-ban', inherit:'pi pi-arrow-up', none:'pi pi-minus' }[state] }
function search(e) { /* suggestions = api.search(e.query) */ }
function openDetail(cell) { detailOpen.value = true /* load grant path */ }
</script>`
    },

    'HW_PixarV2_Notifications.html': {
      title: 'Notifications',
      pattern: 'TabView 4 tabs + Card list + Toast service + InputSwitch on rules',
      vue: `<!-- Notifications.vue -->
<template>
  <TabView v-model:activeIndex="tab">
    <TabPanel header="All" :badge="all.length.toString()">
      <Card v-for="n in all" :key="n.id" class="mb-2">
        <template #content>
          <div class="flex items-center">
            <Tag :severity="n.severity" :value="n.severity" />
            <strong class="ml-2">{{ n.title }}</strong>
            <span class="ml-auto text-xs">{{ n.when }}</span>
          </div>
          <div class="text-xs mt-1">{{ n.detail }}</div>
        </template>
      </Card>
    </TabPanel>

    <TabPanel header="Unread"><!-- filtered list --></TabPanel>

    <TabPanel header="Critical" :badge="critical.length.toString()" badgeSeverity="danger">
      <Card v-for="n in critical" :key="n.id" class="mb-2 border-l-4 border-red-500">
        <template #content>
          <strong>{{ n.title }}</strong>
          <Button label="Investigate" size="small" />
          <Button label="Acknowledge" text size="small" />
        </template>
      </Card>
    </TabPanel>

    <TabPanel header="Custom rules" :badge="rules.length.toString()">
      <Button icon="pi pi-plus" label="New rule" class="mb-3" />
      <Card v-for="rule in rules" :key="rule.id" class="mb-2">
        <template #content>
          <div class="flex items-center">
            <div>
              <strong>{{ rule.name }}</strong>
              <div class="text-xs">{{ rule.when }} → {{ rule.destination }}</div>
            </div>
            <InputSwitch v-model="rule.active" class="ml-auto" />
          </div>
        </template>
      </Card>
    </TabPanel>
  </TabView>

  <Toast position="top-right" />
</template>

<script setup>
import { ref } from 'vue'
import TabView from 'primevue/tabview'; import TabPanel from 'primevue/tabpanel'
import Card from 'primevue/card'; import Tag from 'primevue/tag'; import Button from 'primevue/button'
import InputSwitch from 'primevue/inputswitch'; import Toast from 'primevue/toast'

const tab = ref(0)
const all = ref([/* … */]); const critical = ref([/* … */]); const rules = ref([/* … */])
</script>`
    },

    'HW_PixarV2_Tracker.html': {
      title: 'Tracker',
      pattern: 'SelectButton entity-type + AutoComplete + Timeline + Card chips',
      vue: `<!-- Tracker.vue -->
<template>
  <Card>
    <template #content>
      <SelectButton v-model="entityType"
        :options="['User','Device','Bay','Locker','Order']" />
      <AutoComplete v-model="entity" :suggestions="suggestions" @complete="search"
                    forceSelection placeholder="Pick a target" />
      <DateRangePicker v-model="range" />
    </template>
  </Card>

  <div class="grid grid-cols-4 gap-4 mt-4">
    <Card><template #title>{{ entity?.id }}</template>
      <template #content>{{ entity?.subtitle }}</template></Card>
    <Card><template #title>Status</template>
      <template #content><Tag :severity="entity?.severity" :value="entity?.status" /></template></Card>
    <Card><template #title>Holder</template>
      <template #content>{{ entity?.holder }}</template></Card>
    <Card><template #title>Events</template>
      <template #content>{{ events.length }}</template></Card>
  </div>

  <Card class="mt-4">
    <template #title>Event timeline</template>
    <template #content>
      <Timeline :value="events" align="left">
        <template #marker="{ item }">
          <span class="w-3 h-3 rounded-full" :class="markerColor(item.kind)" />
        </template>
        <template #content="{ item }">
          <Tag :severity="item.severity" :value="item.kind" />
          <strong class="ml-2">{{ item.title }}</strong>
          <div class="text-xs">{{ item.detail }}</div>
        </template>
        <template #opposite="{ item }">{{ item.when }}</template>
      </Timeline>
    </template>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'; import SelectButton from 'primevue/selectbutton'
import AutoComplete from 'primevue/autocomplete'; import Timeline from 'primevue/timeline'; import Tag from 'primevue/tag'

const entityType = ref('Device'); const entity = ref(null); const suggestions = ref([])
const range = ref([new Date(Date.now() - 14 * 86400e3), new Date()])
const events = ref([/* … */])
function search(e) { /* … */ }
function markerColor(kind) { return { lost:'bg-red-500', warn:'bg-amber-500', checkout:'bg-blue-500', checkin:'bg-green-500' }[kind] }
</script>`
    },

    'HW_PixarV2_Software_Updates.html': {
      title: 'Software Updates',
      pattern: 'TabView 4 tabs + ProgressBar live rollout + DataTable + status Tag',
      vue: `<!-- SoftwareUpdates.vue -->
<template>
  <!-- Live rollout banner -->
  <Card class="border-l-4 border-blue-500 mb-4">
    <template #content>
      <div class="flex items-center gap-4">
        <i class="pi pi-cloud-download text-3xl text-blue-700" />
        <div class="flex-1">
          <strong>Rolling out: Locker firmware 4.13.0</strong>
          <ProgressBar :value="rolloutProgress" style="height:6px" class="mt-2" />
        </div>
        <Button label="View detail" outlined size="small" />
      </div>
    </template>
  </Card>

  <TabView v-model:activeIndex="tab">
    <TabPanel header="Locker firmware">
      <DataTable :value="lockerQueue" stripedRows>
        <Column field="locker" header="Locker" />
        <Column field="location" header="Location" />
        <Column field="currentFw" header="Current FW" />
        <Column field="targetFw" header="Target" />
        <Column header="Progress">
          <template #body="{ data }">
            <ProgressBar :value="data.progress" style="height:6px" />
          </template>
        </Column>
        <Column header="Status">
          <template #body="{ data }">
            <Tag :severity="data.severity" :value="data.status" />
          </template>
        </Column>
      </DataTable>
    </TabPanel>

    <TabPanel header="Device APK"><DataTable :value="apkQueue" /></TabPanel>
    <TabPanel header="Scheduled rollouts">
      <Card v-for="r in scheduled" :key="r.id" class="mb-2">
        <template #content>
          <strong>{{ r.name }}</strong> · {{ r.when }} · {{ r.scope }}
        </template>
      </Card>
    </TabPanel>
    <TabPanel header="Release notes">
      <Card v-for="rel in releases" :key="rel.version" class="mb-2">
        <template #title>{{ rel.version }}</template>
        <template #content>{{ rel.notes }}</template>
      </Card>
    </TabPanel>
  </TabView>
</template>

<script setup>
import { ref } from 'vue'
import TabView from 'primevue/tabview'; import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'; import Column from 'primevue/column'
import ProgressBar from 'primevue/progressbar'; import Card from 'primevue/card'
import Tag from 'primevue/tag'; import Button from 'primevue/button'

const tab = ref(0); const rolloutProgress = ref(64)
const lockerQueue = ref([/* … */]); const apkQueue = ref([/* … */])
const scheduled = ref([/* … */]); const releases = ref([/* … */])
</script>`
    },

    'HW_PixarV2_Settings.html': {
      title: 'Settings',
      pattern: 'PanelMenu sub-nav + Card sections + InputText / InputSwitch / FileUpload',
      vue: `<!-- Settings.vue -->
<template>
  <div class="grid grid-cols-[220px_1fr] gap-6">
    <PanelMenu :model="settingsNav" v-model:activeItem="activeSection" />

    <div>
      <!-- Sections render based on activeSection.key -->
      <template v-if="activeSection.key === 'branding'">
        <Card class="mb-4">
          <template #title>Organization identity</template>
          <template #content>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs uppercase">Organization name</label>
                <InputText v-model="org.name" class="w-full" />
              </div>
              <div>
                <label class="text-xs uppercase">Display name</label>
                <InputText v-model="org.display" class="w-full" />
              </div>
            </div>
          </template>
        </Card>

        <Card class="mb-4">
          <template #title>Brand assets</template>
          <template #content>
            <FileUpload mode="basic" :auto="true" accept="image/*" :maxFileSize="2000000" />
          </template>
        </Card>

        <Card>
          <template #title>Self-registration</template>
          <template #content>
            <div class="flex items-center justify-between mb-3">
              <div>Allow guest self-registration</div>
              <InputSwitch v-model="org.selfReg" />
            </div>
            <Dropdown v-model="org.defaultTtl" :options="ttlOptions" placeholder="Default TTL" />
          </template>
        </Card>
      </template>

      <template v-if="activeSection.key === 'masterKeys'">
        <DataTable :value="masterKeys" />
      </template>

      <!-- … other sections -->
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PanelMenu from 'primevue/panelmenu'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'; import InputSwitch from 'primevue/inputswitch'
import Dropdown from 'primevue/dropdown'; import FileUpload from 'primevue/fileupload'
import DataTable from 'primevue/datatable'

const settingsNav = ref([
  { key:'profile', label:'Profile', icon:'pi pi-user' },
  { key:'security', label:'Security', icon:'pi pi-shield' },
  { key:'branding', label:'Branding', icon:'pi pi-palette' },
  { key:'selfReg', label:'Self-registration', icon:'pi pi-user-plus' },
  { key:'masterKeys', label:'Master Keys', icon:'pi pi-key' },
  { key:'integrations', label:'Integrations', icon:'pi pi-link' },
  { key:'notifications', label:'Notifications', icon:'pi pi-bell' }
])
const activeSection = ref(settingsNav.value[2]) // Branding
const org = ref({ name:'Corewell Health', display:'Corewell', selfReg: true, defaultTtl:'24h' })
const ttlOptions = ['1h','8h','24h','7d']
const masterKeys = ref([/* … */])
</script>`
    },

    'HW_PixarV2_Modals_States.html': {
      title: 'Modals & States',
      pattern: 'Dialog · ConfirmDialog · Sidebar · Toast · Skeleton patterns',
      vue: `<!-- ModalsStates.vue — pattern reference -->
<template>
  <!-- 1. Dialog (medium) -->
  <Dialog v-model:visible="editOpen" header="Edit user" modal :style="{ width: '480px' }">
    <template #default>
      <!-- form fields -->
    </template>
    <template #footer>
      <Button label="Cancel" text @click="editOpen = false" />
      <Button label="Save" @click="save" />
    </template>
  </Dialog>

  <!-- 2. ConfirmDialog (destructive) -->
  <ConfirmDialog />
  <Button label="Delete" severity="danger" @click="confirmDelete" />

  <!-- 3. Sidebar (right-side drawer) -->
  <Sidebar v-model:visible="drawerOpen" position="right" class="w-[420px]" />

  <!-- 4. Toast service -->
  <Toast position="top-right" />

  <!-- 5. Skeleton loading -->
  <div v-if="loading">
    <Skeleton width="100%" height="2rem" class="mb-2" />
    <Skeleton width="60%" height="1rem" />
  </div>

  <!-- 6. Empty state -->
  <Card v-if="!items.length">
    <template #content>
      <div class="text-center p-10">
        <i class="pi pi-search text-4xl" />
        <h3>No results</h3>
        <Button label="Clear filters" outlined />
      </div>
    </template>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import Dialog from 'primevue/dialog'
import ConfirmDialog from 'primevue/confirmdialog'
import Sidebar from 'primevue/sidebar'
import Toast from 'primevue/toast'
import Skeleton from 'primevue/skeleton'
import Card from 'primevue/card'
import Button from 'primevue/button'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

const confirm = useConfirm(); const toast = useToast()
const editOpen = ref(false); const drawerOpen = ref(false); const loading = ref(false)
const items = ref([])

function save() { toast.add({ severity:'success', summary:'Saved', detail:'Branding changes published.' }); editOpen.value = false }
function confirmDelete() {
  confirm.require({
    message: 'Delete Maria Reyes? This revokes all device grants.',
    header: 'Delete user',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => { /* do delete */ }
  })
}
</script>`
    },

    'HW_PixarV2_Asset_Accounting.html': {
      title: 'Asset Accounting',
      pattern: 'KPI strip + Chart (Chart.js) + DataTable (top departments) + Card grid',
      vue: `<!-- AssetAccounting.vue -->
<template>
  <div class="grid grid-cols-5 gap-3 mb-5">
    <Card v-for="kpi in kpis" :key="kpi.label">
      <template #content>
        <div class="text-xs uppercase">{{ kpi.label }}</div>
        <div class="text-2xl font-bold mt-1">{{ kpi.value }}</div>
      </template>
    </Card>
  </div>

  <div class="grid grid-cols-2 gap-4">
    <Card>
      <template #title>Replacement cost trend (90d)</template>
      <template #content>
        <Chart type="line" :data="trendData" :options="chartOpts" />
      </template>
    </Card>

    <Card>
      <template #title>Top departments by exposure</template>
      <template #content>
        <DataTable :value="topDepts">
          <Column field="department" header="Department" />
          <Column field="exposure" header="Exposure">
            <template #body="{ data }">\${{ data.exposure.toLocaleString() }}</template>
          </Column>
          <Column field="trend" header="vs last mo">
            <template #body="{ data }">
              <Tag :severity="data.trend > 0 ? 'danger' : 'success'"
                   :value="(data.trend > 0 ? '+' : '') + data.trend + '%'" />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>

  <Card class="mt-4">
    <template #title>High-risk users</template>
    <template #content>
      <DataTable :value="highRiskUsers" :paginator="true" :rows="10">
        <Column header="User">
          <template #body="{ data }">
            <Avatar :label="data.initials" /> {{ data.name }}
          </template>
        </Column>
        <Column field="lostCount" header="Devices lost (12mo)" sortable />
        <Column field="exposure" header="Exposure" sortable />
        <Column field="lastIncident" header="Last incident" />
      </DataTable>
    </template>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'; import Chart from 'primevue/chart'
import DataTable from 'primevue/datatable'; import Column from 'primevue/column'
import Avatar from 'primevue/avatar'; import Tag from 'primevue/tag'

const kpis = ref([
  { label:'Devices in fleet', value:'1,247' },
  { label:'Total replacement cost', value:'$2.36M' },
  { label:'Lost last 90d', value:'11' },
  { label:'Exposure ($)', value:'$20,845' },
  { label:'Recovered', value:'7' }
])
const trendData = ref({/* labels + datasets for Chart.js */})
const chartOpts = ref({/* options */})
const topDepts = ref([/* … */])
const highRiskUsers = ref([/* … */])
</script>`
    },

    'HW_PixarV2_404.html': {
      title: '404',
      pattern: 'Centered error state with brand mark + sketch portrait + Button CTAs',
      vue: `<!-- Error404.vue -->
<template>
  <div class="grid grid-cols-2 gap-12 items-center max-w-5xl mx-auto p-16">
    <div class="portrait">
      <img src="/assets/pixar.png" alt="Pixar the locker assistant" />
      <div class="caption italic">A note from <span class="font-medium">Pixar</span>, our concierge.</div>
    </div>

    <div>
      <Tag value="404" severity="warning" />
      <h1 class="text-5xl font-bold mt-3">This bay's empty.</h1>
      <p class="text-lg mt-3">The page you tried isn't on the rack.</p>
      <div class="flex gap-2 mt-6">
        <Button label="Open the hub" icon="pi pi-home" as="router-link" to="/" />
        <Button label="Dashboard" outlined as="router-link" to="/dashboard" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Tag from 'primevue/tag'
import Button from 'primevue/button'
</script>`
    }
  };

  /* ------------------ Drawer UI ------------------ */
  function buildDrawer() {
    if (document.getElementById('pv2-vue-drawer')) return;

    const fab = document.createElement('button');
    fab.id = 'pv2-vue-fab';
    fab.innerHTML = '<span style="display:inline-block;width:16px;height:16px;background:#41B883;border-radius:3px;margin-right:6px;vertical-align:-3px;"></span>View as PrimeVue';
    Object.assign(fab.style, {
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 9500,
      background: '#0F172A', color: '#fff', border: 'none',
      padding: '10px 16px', borderRadius: '999px',
      fontSize: '13px', fontWeight: '600',
      boxShadow: '0 8px 24px rgba(15,23,42,.25)',
      cursor: 'pointer', fontFamily: 'Inter, system-ui, sans-serif'
    });
    document.body.appendChild(fab);

    const drawer = document.createElement('div');
    drawer.id = 'pv2-vue-drawer';
    drawer.innerHTML = `
      <div class="pv2-vue-backdrop"></div>
      <aside class="pv2-vue-pane">
        <header class="pv2-vue-head">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="display:inline-block;width:18px;height:18px;background:#41B883;border-radius:4px;"></span>
            <strong>Vue + PrimeVue template</strong>
            <span class="pv2-vue-page-title" style="color:#94A3B8;font-weight:400;margin-left:6px;"></span>
          </div>
          <div style="margin-left:auto;display:flex;gap:8px;">
            <button class="pv2-vue-copy" style="font-size:11px;color:#fff;background:#1E40AF;padding:4px 10px;border:none;border-radius:4px;cursor:pointer;font-weight:600;">Copy</button>
            <button class="pv2-vue-close" style="font-size:18px;color:#94A3B8;background:transparent;border:none;cursor:pointer;line-height:1;padding:0 6px;">×</button>
          </div>
        </header>
        <div class="pv2-vue-pattern"></div>
        <pre class="pv2-vue-code"></pre>
      </aside>`;
    document.body.appendChild(drawer);

    const css = document.createElement('style');
    css.textContent = `
      #pv2-vue-drawer { position: fixed; inset: 0; z-index: 9400; pointer-events: none; }
      #pv2-vue-drawer.open { pointer-events: auto; }
      .pv2-vue-backdrop { position:absolute; inset:0; background: rgba(15,23,42,.32); opacity: 0; transition: opacity .15s ease; }
      #pv2-vue-drawer.open .pv2-vue-backdrop { opacity: 1; }
      .pv2-vue-pane { position:absolute; top:0; right:0; height:100%; width: 640px; max-width: 92vw;
        background: #0F172A; color: #E2E8F0; box-shadow: -8px 0 24px rgba(15,23,42,.4);
        transform: translateX(100%); transition: transform .2s ease; display:flex; flex-direction:column;
        font-family: Inter, system-ui, sans-serif; }
      #pv2-vue-drawer.open .pv2-vue-pane { transform: translateX(0); }
      .pv2-vue-head { padding: 14px 18px; border-bottom: 1px solid #1E293B; display:flex; align-items:center; gap: 10px; font-size: 13px; }
      .pv2-vue-pattern { padding: 10px 18px; border-bottom: 1px solid #1E293B; font-size: 11px; color: #94A3B8; }
      .pv2-vue-code { padding: 18px; margin: 0; overflow: auto; flex: 1; font-family: 'JetBrains Mono', ui-monospace, Menlo, monospace; font-size: 12px; line-height: 1.6; color: #E2E8F0; white-space: pre; tab-size: 2; }
      .pv2-vue-code .tag    { color: #7DD3FC; }
      .pv2-vue-code .attr   { color: #FCD34D; }
      .pv2-vue-code .string { color: #FCA5A5; }
      .pv2-vue-code .keyw   { color: #C4B5FD; }
      .pv2-vue-code .comm   { color: #64748B; font-style: italic; }
    `;
    document.head.appendChild(css);

    fab.addEventListener('click', () => openVueDrawer());
    drawer.querySelector('.pv2-vue-backdrop').addEventListener('click', closeVueDrawer);
    drawer.querySelector('.pv2-vue-close').addEventListener('click', closeVueDrawer);
    drawer.querySelector('.pv2-vue-copy').addEventListener('click', () => {
      const code = drawer.querySelector('.pv2-vue-code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        const b = drawer.querySelector('.pv2-vue-copy');
        const orig = b.textContent;
        b.textContent = 'Copied ✓';
        setTimeout(() => b.textContent = orig, 1200);
      });
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVueDrawer(); });
  }

  function highlight(code) {
    return code
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/(\/\/[^\n]*)/g, '<span class="comm">$1</span>')
      .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="comm">$1</span>')
      .replace(/(\bimport\b|\bfrom\b|\bref\b|\bcomputed\b|\bconst\b|\blet\b|\bfunction\b|\breturn\b|\btrue\b|\bfalse\b|\bnull\b)/g, '<span class="keyw">$1</span>')
      .replace(/(&lt;\/?)(\w+[\w-]*)/g, '$1<span class="tag">$2</span>')
      .replace(/(\s)([:@]?[a-z][\w-]*)(=)/gi, '$1<span class="attr">$2</span>$3')
      .replace(/("[^"]*"|'[^']*')/g, '<span class="string">$1</span>');
  }

  function openVueDrawer() {
    const pageName = (location.pathname.split('/').pop() || '').replace(/\?.*$/, '');
    const snip = SNIPPETS[pageName];
    const drawer = document.getElementById('pv2-vue-drawer');
    if (!snip) {
      drawer.querySelector('.pv2-vue-page-title').textContent = '— no snippet for this page';
      drawer.querySelector('.pv2-vue-pattern').textContent = 'This page is a reference / landing page. Check Tokens or Components.';
      drawer.querySelector('.pv2-vue-code').innerHTML = '<span class="comm">// No Vue equivalent — this is a meta page (Hub, Browse, Tokens, or Components).</span>';
    } else {
      drawer.querySelector('.pv2-vue-page-title').textContent = '· ' + snip.title;
      drawer.querySelector('.pv2-vue-pattern').textContent = 'Pattern: ' + snip.pattern;
      drawer.querySelector('.pv2-vue-code').innerHTML = highlight(snip.vue);
    }
    drawer.classList.add('open');
  }

  function closeVueDrawer() {
    const d = document.getElementById('pv2-vue-drawer');
    if (d) d.classList.remove('open');
  }

  /* ------------------ Other small wires ------------------ */
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
    buildDrawer();
    console.log('[Pixar v.2] forked from v.1 · "View as PrimeVue" button bottom-right · "/" focuses search.');
  });
})();
