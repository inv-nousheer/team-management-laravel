<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-foreground">Activity Reports</h2>
        <p class="text-sm text-muted-foreground">Analytics and insights on team activities</p>
      </div>
      <button class="btn-primary" @click="openExportPopup">
        <DownloadIcon class="w-4 h-4 mr-2 inline" />
        Export Report
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="border border-border rounded-lg p-4 bg-card">
        <p class="stat-label">Total Activities</p>
        <p class="stat-value text-primary">{{ totalActivities }}</p>
      </div>
      <div class="border border-border rounded-lg p-4 bg-card">
        <p class="stat-label">Total Hours</p>
        <p class="stat-value text-primary">{{ totalHours.toFixed(1) }}</p>
      </div>
      <div class="border border-border rounded-lg p-4 bg-card">
        <p class="stat-label">Avg. Duration</p>
        <p class="stat-value text-primary">{{ avgActivityLength }}m</p>
      </div>
      <div class="border border-border rounded-lg p-4 bg-card">
        <p class="stat-label">Team Members</p>
        <p class="stat-value text-primary">{{ members.length }}</p>
      </div>
      <div class="border border-border rounded-lg p-4 bg-card">
        <p class="stat-label">Blockers</p>
        <p class="stat-value text-red-600">🚨 {{ totalBlockers }}</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-border rounded-lg p-4 bg-card">
      <div class="card-full">
        <div class="card-header">
          <h3 class="card-title">Activities by Member</h3>
          <p class="card-description">Total hours logged per team member</p>
        </div>
        <v-chart class="chart" :option="lineChartOption" autoresize />
      </div>
      <div class="card-full">
        <div class="card-header">
          <h3 class="card-title">Activities by Type</h3>
          <p class="card-description">Distribution of activity categories</p>
        </div>
        <v-chart class="chart" :option="pieChartOption" autoresize />
      </div>
    </div>

    <!-- Bar Chart -->
    <div class="border border-border rounded-lg p-4 bg-card">
      <div class="card-header">
        <h3 class="card-title">Activities Last 7 Days</h3>
        <p class="card-description">Daily activity count</p>
      </div>
      <v-chart class="chart" :option="barChartOption" autoresize />
    </div>

    <!-- Blockers -->
    <div class="border border-border rounded-lg p-4 bg-card">
      <div class="card-header">
        <h3 class="card-title">🚨 Current Blockers</h3>
        <p class="card-description">Activities that are blocked and need attention</p>
      </div>
      <div v-if="totalBlockers === 0" class="text-sm text-muted-foreground p-4">No blockers reported 🎉</div>
      <div v-else class="space-y-4 p-4">
        <div v-for="activity in blockerActivities" :key="activity.id" class="p-4 border border-red-500 rounded-xl bg-red-50">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold text-red-700">{{ activity.member_name }}</h4>
              <p class="text-sm text-muted-foreground">{{ activity.description }}</p>
            </div>
            <span class="badge-red">Blocker 🚨</span>
          </div>
          <p class="text-xs text-gray-500 mt-2">Date: {{ formatDate(activity.date) }} · Status: {{ activity.status }}</p>
        </div>
      </div>
    </div>

    <!-- Member Activity Summary -->
    <div class="border border-border rounded-lg p-4 bg-card">
      <div class="card-header">
        <h3 class="card-title">Member Activity Summary</h3>
        <p class="card-description">Detailed breakdown by team member</p>
      </div>
      <div class="space-y-4 p-4">
        <div v-for="member in hoursByMember" :key="member.name" class="flex items-center justify-between p-4 border border-border rounded-lg">
          <div class="flex-1">
            <h4 class="font-semibold text-foreground">{{ member.name }}</h4>
            <p class="text-sm text-muted-foreground">
              {{ activities.filter((a) => a.member_name === member.name).length }} activities · {{ member.minutes }} minutes total
            </p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-primary">{{ member.hours }}</div>
            <p class="text-sm text-muted-foreground">hours</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Popup -->
    <div v-if="showExportPopup" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-card w-full max-w-2xl rounded-2xl shadow-xl p-8 space-y-6">
        <div>
          <h3 class="text-xl font-bold text-foreground">Export Activity Report</h3>
          <p class="text-sm text-muted-foreground">Select employee and date range to export report.</p>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Select Employee</label>
          <select v-model="selectedEmployee" class="input-field">
            <option value="">All Employees</option>
            <option v-for="member in members" :key="member.id" :value="member.name">{{ member.name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">From Date</label>
            <input type="date" v-model="fromDate" class="input-field" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">To Date</label>
            <input type="date" v-model="toDate" class="input-field" />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Report Type</label>
          <select v-model="reportType" class="input-field">
            <option value="all">All Activities</option>
            <option value="pending">Pending Activities</option>
            <option value="completed">Completed Activities</option>
            <option value="blocker">Blocker Activities</option>
          </select>
        </div>
        <div class="flex flex-col gap-4 pt-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Download Format</label>
            <select v-model="exportFormat" class="input-field">
              <option value="csv">CSV File</option>
              <option value="pdf">PDF Report</option>
              <option value="ppt">PowerPoint (PPT)</option>

            </select>
          </div>
          <div class="flex justify-end gap-3">
            <button class="btn-outline" @click="showExportPopup = false">Cancel</button>
            <button class="btn-purple" :disabled="isGenerating" @click="generateEmployeeReport(exportFormat)">
              {{ isGenerating ? 'Generating...' : 'Download Report' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { Download as DownloadIcon } from 'lucide-vue-next'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { buildActivityPDF } from '../../utils/pdf-helpers'
import { buildActivityPPT } from '../../utils/ppt-helpers'


use([CanvasRenderer, LineChart, BarChart, PieChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps<{ activities: any[]; members: any[]; activityTypes: any[] }>()

// ─── Export state ─────────────────────────────────────────────────────────────
const showExportPopup  = ref(false)
const selectedEmployee = ref('')
const fromDate         = ref('')
const toDate           = ref('')
const reportType       = ref('all')
const exportFormat     = ref('csv')
const isGenerating     = ref(false)

// ═══════════════════════════════════════════════════════════════════════════════
// PDF DESIGN CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const NAVY       = [15, 23, 42]
const NAVY_800   = [30, 41, 59]
const BLUE_700   = [29, 78, 216]
const BLUE_600   = [37, 99, 235]
const BLUE_500   = [59, 130, 246]
const BLUE_100   = [219, 234, 254]
const SLATE_50   = [248, 250, 252]
const SLATE_700  = [51, 65, 85]
const WHITE      = [255, 255, 255]
const GREEN      = [16, 185, 129]
const GREEN_DARK = [5, 150, 105]
const AMBER      = [245, 158, 11]
const RED        = [239, 68, 68]
const GRAY_200   = [226, 232, 240]
const GRAY_300   = [203, 213, 225]
const CYAN       = [6, 182, 212]
const CYAN_DARK  = [8, 145, 178]
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 12


const parseDate = (dateVal: any): Date => {
  if (!dateVal) return new Date()
  if (dateVal instanceof Date) return dateVal
  if (typeof dateVal === 'string') return new Date(dateVal)
  if (dateVal.$date) {
    const inner = dateVal.$date
    if (inner.$numberLong) return new Date(parseInt(inner.$numberLong))
    if (typeof inner === 'string') return new Date(inner)
    if (typeof inner === 'number') return new Date(inner)
  }
  return new Date()
}
const formatDate = (d: any) => parseDate(d).toLocaleDateString()

// ═══════════════════════════════════════════════════════════════════════════════
// COMPUTED STATS
// ═══════════════════════════════════════════════════════════════════════════════
const hoursByMember = computed(() =>
  props.members.map((m: any) => {
    const mins = props.activities.filter((a: any) => a.member_id === m.id).reduce((s: number, a: any) => s + (a.duration || 0), 0)
    return { name: m.name, hours: parseFloat((mins / 60).toFixed(1)), minutes: mins }
  })
)
const activitiesByType  = computed(() => props.activityTypes.map((t: any) => ({ name: t.name, value: props.activities.filter((a: any) => a.activity_type_id === t.id).length, color: t.color })))
const totalActivities   = computed(() => props.activities.length)
const totalHours        = computed(() => props.activities.reduce((s: number, a: any) => s + (a.duration || 0), 0) / 60)
const avgActivityLength = computed(() => totalActivities.value > 0 ? Math.round(props.activities.reduce((s: number, a: any) => s + (a.duration || 0), 0) / totalActivities.value) : 0)
const blockerActivities = computed(() => props.activities.filter((a: any) => a.blocker === true || a.blocker === 'TRUE' || a.blocker === 'true'))
const totalBlockers     = computed(() => blockerActivities.value.length)
const last7Days         = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i)
    return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), count: props.activities.filter((a: any) => parseDate(a.date).toDateString() === d.toDateString()).length }
  }).reverse()
)

// ═══════════════════════════════════════════════════════════════════════════════
// ECHART OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════
const lineChartOption = computed(() => ({
  tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].name}: ${p[0].value}h` },
  legend: { data: ['hours'] },
  xAxis: { type: 'category', data: hoursByMember.value.map((m) => m.name) },
  yAxis: { type: 'value' },
  series: [{ name: 'hours', type: 'line', data: hoursByMember.value.map((m) => m.hours), smooth: true, lineStyle: { width: 3 }, symbolSize: 8 }],
}))
const pieChartOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} activities' },
  legend: { orient: 'vertical', left: 'left' },
  series: [{ type: 'pie', radius: '60%', data: activitiesByType.value.map((t) => ({ name: t.name, value: t.value, itemStyle: { color: t.color } })), label: { formatter: '{b}: {c}' } }],
}))
const barChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: last7Days.value.map((d) => d.date) },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: last7Days.value.map((d) => d.count), barMaxWidth: 48, itemStyle: { borderRadius: [8, 8, 0, 0] } }],
}))

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT METHODS
// ═══════════════════════════════════════════════════════════════════════════════
function openExportPopup() {
  const now = new Date()
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  fromDate.value = fmt(new Date(now.getFullYear(), now.getMonth(), 1))
  toDate.value   = fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  showExportPopup.value = true
}

function generateEmployeeReport(format: string) {
  if (!fromDate.value || !toDate.value) { alert('Please select date range'); return }
  if (format === 'pdf') generatePDF()
  else if (format === 'csv') generateCSV()
  else if (format === 'ppt') generatePPT()  // ← add this
}

async function generatePPT() {
  isGenerating.value = true
  try {
    await buildActivityPPT({
      employee:     selectedEmployee.value || 'All Employees',
      from:         fromDate.value,
      to:           toDate.value,
      reportType:   reportType.value,
      filtered:     getFilteredActivities(),
      activityTypes: props.activityTypes,
    })
    showExportPopup.value = false
  } finally {
    isGenerating.value = false
  }
}

function getFilteredActivities() {
  const employee = selectedEmployee.value || 'All Employees'
  const start = new Date(fromDate.value); start.setHours(0, 0, 0, 0)
  const end   = new Date(toDate.value);   end.setHours(23, 59, 59, 999)
  const type  = reportType.value
  return props.activities.filter((a: any) => {
    const d = parseDate(a.date); d.setHours(0, 0, 0, 0)
    if (employee !== 'All Employees' && a.member_name !== employee) return false
    if (d < start || d > end) return false
    if (type === 'pending'   && a.status !== 'pending')                     return false
    if (type === 'completed' && a.status !== 'completed')                   return false
    if (type === 'blocker'   && a.blocker !== true && a.blocker !== 'TRUE') return false
    return true
  })
}

async function getLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch('/company_logo.jpeg')  // ← your logo filename in /public
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}
async function generatePDF() {
  isGenerating.value = true
  try {
    const filtered   = getFilteredActivities()
    const logoBase64 = await getLogoBase64()  // ← fetch logo at runtime

    buildActivityPDF({
      employee:      selectedEmployee.value || 'All Employees',
      from:          fromDate.value,
      to:            toDate.value,
      reportType:    reportType.value,
      filtered,
      activityTypes: props.activityTypes,
      logoBase64,                              // ← pass it in
    })
    showExportPopup.value = false
  } finally {
    isGenerating.value = false
  }
}

function generateCSV() {
  const employee = selectedEmployee.value || 'All Employees'
  const filtered = getFilteredActivities()
  const headers  = ['Name', 'Date', 'Type', 'Description', 'Duration (min)', 'Status', 'Blocker']
  const rows     = filtered.map((a: any) => [
    a.member_name || '',
    parseDate(a.date).toLocaleDateString('en-US'),
    props.activityTypes.find((t: any) => t.id === a.activity_type_id)?.name || '-',
    `"${(a.description || '').replace(/"/g, '""')}"`,
    a.duration || 0,
    a.status || '',
    a.blocker ? 'Yes' : 'No',
  ].join(','))
  const csv  = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = `Activity_Report_${employee}.csv`; a.click()
  URL.revokeObjectURL(url)
  showExportPopup.value = false
}
</script>

<style scoped>
.space-y-6 > * + * { margin-top: 1.5rem; }
.space-y-4 > * + * { margin-top: 1rem; }
.space-y-2 > * + * { margin-top: 0.5rem; }
.stat-label { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-bottom: 0.5rem; }
.stat-value { font-size: 1.875rem; font-weight: 700; }
.card-full { background: hsl(var(--card)); border-radius: 0.75rem; }
.card-header { padding: 1rem 0 0.5rem; }
.card-title { font-size: 1.125rem; font-weight: 600; color: hsl(var(--foreground)); }
.card-description { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-top: 0.25rem; }
.chart { height: 300px; width: 100%; padding: 1rem 0; }
.btn-primary { display: inline-flex; align-items: center; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer; border: none; font-size: 0.875rem; transition: opacity 0.15s; }
.btn-primary:hover { opacity: 0.9; }
.btn-outline { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer; background: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); font-size: 0.875rem; }
.btn-outline:hover { background: hsl(var(--muted)); }
.btn-purple { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; cursor: pointer; background: #9333ea; color: #fff; border: none; font-size: 0.875rem; transition: background 0.15s; }
.btn-purple:hover { background: #7e22ce; }
.btn-purple:disabled { opacity: 0.6; cursor: not-allowed; }
.badge-red { background: #dc2626; color: #fff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.input-field { width: 100%; border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 0.5rem 0.75rem; background: hsl(var(--background)); color: hsl(var(--foreground)); font-size: 0.875rem; }
</style>
