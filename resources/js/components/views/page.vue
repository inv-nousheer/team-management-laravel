<script setup>
import { ref, reactive, onMounted, watch } from 'vue'

// components
import Dashboard from '../views/dashboard.vue'
import ActivityForm from '../views/activity-form.vue'
import DayDetails from '../views/day-details.vue'
import MembersPanel from '../views/members-panel.vue'
import ActivityTypesPanel from '../views/activity-types-panel.vue'
import ActivityReports from '../views/activity-reports.vue'
import { Sun, Moon } from 'lucide-vue-next'

// ui
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { Button } from '../ui/button'

// state
const activeTab = ref('dashboard')
const showActivityForm = ref(false)
const showDayDetails = ref(false)

const selectedDay = ref(null)
const selectedDate = ref(null)
const formInitialDate = ref(null)

const activities = ref([])
const members = ref([])
const activityTypes = ref([])

const monthCache = reactive({})
const loading = ref(true)
const error = ref(null)
const currentDate = ref(new Date())
const editingActivity = ref(null)

// helpers
const getMonthKey = (month, year) => `${year}-${month}`

// Invalidate cache for current month
const invalidateCurrentMonthCache = () => {
  const month = currentDate.value.getMonth() + 1
  const year = currentDate.value.getFullYear()
  delete monthCache[getMonthKey(month, year)]
}

// fetch activities for a specific month
const fetchActivities = async (month, year) => {
  const key = getMonthKey(month, year)
  if (monthCache[key]) return monthCache[key]

  const res = await fetch(`/api/activities?month=${month}&year=${year}`)
  const data = await res.json()

  const parsed = data.map(a => ({
    ...a,
    date: parseMongoDate(a.date)  // ← use helper here too
  }))

  monthCache[key] = parsed
  return parsed
}

// load data — only called on mount and month navigation
const fetchData = async () => {
  try {
    loading.value = true
    error.value = null

    const month = currentDate.value.getMonth() + 1
    const year = currentDate.value.getFullYear()

    const prevDate = new Date(year, month - 2)
    const nextDate = new Date(year, month)

    const [currentActivities, , , memData, typesData] =
      await Promise.all([
        fetchActivities(month, year),
        fetchActivities(prevDate.getMonth() + 1, prevDate.getFullYear()),
        fetchActivities(nextDate.getMonth() + 1, nextDate.getFullYear()),
        members.value.length === 0
          ? fetch('/api/members').then(r => r.json())
          : Promise.resolve(members.value),
        activityTypes.value.length === 0
          ? fetch('/api/activity-types').then(r => r.json())
          : Promise.resolve(activityTypes.value),
      ])

    activities.value = currentActivities
    members.value = memData
    activityTypes.value = typesData
  } catch (err) {
    error.value = err.message || 'Failed to load data'
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// ✅ Watch currentDate — only fires on month navigation
watch(currentDate, fetchData)

// ── Handlers ──────────────────────────────────────────────────────────────────
const parseMongoDate = (dateVal) => {
  if (!dateVal) return new Date()
  if (dateVal instanceof Date) return dateVal
  if (typeof dateVal === 'string') return new Date(dateVal)
  if (dateVal.$date) {
    // MongoDB extended JSON format: { $date: { $numberLong: "..." } } or { $date: "..." }
    const inner = dateVal.$date
    if (inner.$numberLong) return new Date(parseInt(inner.$numberLong))
    if (typeof inner === 'string') return new Date(inner)
    if (typeof inner === 'number') return new Date(inner)
  }
  return new Date()
}
const handleAddActivity = async (activityData) => {
  try {
    const isEdit = activityData.id && activities.value.some(a => a.id === activityData.id)

    const res = await fetch(
      isEdit ? `/api/activities/${activityData.id}` : '/api/activities',
      {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activityData)
      }
    )

    const saved = await res.json()
    console.log('saved from server:', saved)
    console.log('saved.date:', saved.date)          // ← is date present?
    console.log('saved.member_id:', saved.member_id) // ← is member_id present?

    invalidateCurrentMonthCache()

    if (isEdit) {
      await handleUpdateActivity(activityData.id, activityData)
    } else {
      const newActivity = { ...saved, date: parseMongoDate(saved.date) }
      activities.value = [newActivity, ...activities.value]
    }

    showActivityForm.value = false
    showDayDetails.value = false
    editingActivity.value = null

  } catch (err) {
    console.error('error:', err)
    alert(err.message)
  }
}

const handleEditActivity = (activity) => {
  editingActivity.value = activity
  showActivityForm.value = true
}

const handleSelectDay = ({ day, date }) => {
  selectedDay.value = day
  selectedDate.value = date
  showDayDetails.value = true
}

const handleOpenForm = (date) => {
  formInitialDate.value = date
  showActivityForm.value = true
}

const handleOpenFormFromDayDetails = () => {
  showDayDetails.value = false
  showActivityForm.value = true
}

const handleUpdateActivity = async (id, updatedActivity) => {
  try {
    const res = await fetch(`/api/activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedActivity)
    })

    const saved = await res.json()

    // ✅ Invalidate cache
    invalidateCurrentMonthCache()

    // ✅ Update in array
    activities.value = activities.value.map(a =>
    a.id === id ? { ...saved, date: parseMongoDate(saved.date) } : a
    )
  } catch (err) {
    console.error('handleUpdateActivity error:', err)
    alert(err.message)
  }
}

const handleMonthChange = (newDate) => {
    console.log('handleMonthChange called with:', newDate)  // Debug log
  currentDate.value = newDate  // ← triggers watch(currentDate, fetchData)
}

const handleAddMember = async (member) => {
  try {
    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    })
    const saved = await res.json()
    members.value = [...members.value, saved]
  } catch (err) {
    alert(err.message)
  }
}

const handleUpdateMember = async (id, updatedMember) => {
  try {
    const res = await fetch(`/api/members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMember)
    })
    const saved = await res.json()
    members.value = members.value.map(m => m.id === id ? saved : m)
  } catch (err) {
    alert(err.message)
  }
}

const handleAddType = async (type) => {
  try {
    const res = await fetch('/api/activity-types', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(type)
    })
    const saved = await res.json()
    activityTypes.value = [...activityTypes.value, saved]
  } catch (err) {
    alert(err.message)
  }
}

const handleUpdateActivityType = async (id, updatedType) => {
  try {
    const res = await fetch(`/api/activity-types/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedType)
    })
    const saved = await res.json()
    activityTypes.value = activityTypes.value.map(t => t.id === id ? saved : t)
  } catch (err) {
    alert(err.message)
  }
}

// ── Theme ─────────────────────────────────────────────────────────────────────

const isDark = ref(false)

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">

    <!-- Navbar -->
    <nav class="border-b border-border bg-card">
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between">
        <h1 class="text-2xl font-bold text-primary">Team Activity Logger</h1>
        <div class="flex items-center gap-3">
          <Button variant="outline" size="icon" @click="toggleTheme">
            <Sun v-if="isDark" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </Button>
          <Button @click="handleOpenForm(new Date())">
            + Log Activity
          </Button>
        </div>
      </div>
    </nav>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-4 py-6">
      <Tabs v-model="activeTab">
        <TabsList class="bg-secondary">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="types">Activity Types</TabsTrigger>
        </TabsList>

        <!-- Dashboard -->
        <TabsContent value="dashboard">
          <Dashboard
            :activities="activities"
            :members="members"
            :activityTypes="activityTypes"
            :currentDate="currentDate"
            @open-form="handleOpenForm"
            @update-activity="handleUpdateActivity"
            @month-change="handleMonthChange"
            @select-day="handleSelectDay"
          />
        </TabsContent>

        <!-- Reports -->
        <TabsContent value="reports">
          <ActivityReports
            :activities="activities"
            :members="members"
            :activityTypes="activityTypes"
          />
        </TabsContent>

        <!-- Members -->
        <TabsContent value="members">
          <MembersPanel
            :members="members"
            @add-member="handleAddMember"
            @update-member="handleUpdateMember"
          />
        </TabsContent>

        <!-- Types -->
        <TabsContent value="types">
          <ActivityTypesPanel
            :types="activityTypes"
            @add-type="handleAddType"
            @update-activity-type="handleUpdateActivityType"
          />
        </TabsContent>
      </Tabs>
    </div>

    <!-- Modals -->
    <ActivityForm
      v-if="showActivityForm"
      :members="members"
      :activityTypes="activityTypes"
      :activity="editingActivity"
      :initialDate="formInitialDate"
      @submit="handleAddActivity"
      @close="showActivityForm = false"
    />

    <DayDetails
      v-if="showDayDetails"
      :day="selectedDay"
      :date="selectedDate"
      :activities="activities"
      :members="members"
      :activityTypes="activityTypes"
      @close="showDayDetails = false"
      @add-activity="handleOpenFormFromDayDetails"
      @edit-activity="handleEditActivity"
    />

  </div>
</template>
