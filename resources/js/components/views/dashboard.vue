<script setup>
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card'

// ✅ PROPS
const props = defineProps({
  members: { type: Array, default: () => [] },       // ← default [] prevents null errors
  activities: { type: Array, default: () => [] },
  activityTypes: { type: Array, default: () => [] },
  currentDate: { type: Date, default: () => new Date() }
})

const emit = defineEmits(['onUpdateActivity', 'month-change', 'select-day'])

// ✅ UI STATE
const selectedMember = ref(null)
const selectedType = ref(null)

// ✅ TOGGLES
// Clicking the same badge again deselects it (acts as toggle)
const toggleMember = (id) => {
  selectedMember.value = selectedMember.value === id ? null : id
}

const toggleType = (id) => {
  selectedType.value = selectedType.value === id ? null : id
}

// ✅ FILTERED ACTIVITIES
// Filters by selectedMember AND selectedType simultaneously
// Uses activity.memberId for member filter
// Uses activity.activity_type_id for type filter (fixed field name)
const filteredActivities = computed(() => {
  return props.activities.filter(a => {
    const memberMatch = !selectedMember.value || a.member_id === selectedMember.value  // ← member_id
    const typeMatch   = !selectedType.value   || a.activity_type_id === selectedType.value
    return memberMatch && typeMatch
  })
})

// ✅ ACTIVITIES BY DATE — uses filteredActivities so calendar updates on filter
const activitiesByDate = computed(() => {
  const map = {}
  filteredActivities.value.forEach(a => {
    const day = new Date(a.date).getDate()
    if (!map[day]) map[day] = []
    map[day].push(a)
  })
  return map
})

// ✅ MEMBER COUNT — counts per member from filtered set
// When a type filter is active, member counts reflect that type only
const memberCountMap = computed(() => {
  const map = {}
  props.activities
    .filter(a => !selectedType.value || a.activity_type_id === selectedType.value)
    .forEach(a => {
      map[a.member_id] = (map[a.member_id] || 0) + 1  // ← member_id
    })
  return map
})

// ✅ TYPE COUNT — counts per type from filtered set
// When a member filter is active, type counts reflect that member only
const activityTypeCountMap = computed(() => {
  const map = {}
  // Count from ALL activities filtered by member only (ignore type filter)
  // so each type badge shows how many exist for the selected member
  props.activities
    .filter(a => !selectedMember.value || a.memberId === selectedMember.value)
    .forEach(a => {
      map[a.activity_type_id] = (map[a.activity_type_id] || 0) + 1
    })
  return map
})

// ✅ TOTALS shown on "All" badges
const totalMonthlyCount = computed(() =>
  props.activities.filter(a => !selectedType.value || a.activity_type_id === selectedType.value).length
)
const allTypeTotalCount = computed(() =>
  props.activities.filter(a => !selectedMember.value || a.memberId === selectedMember.value).length
)

// ✅ CALENDAR DAYS
const calendarDays = computed(() => {
  const date = props.currentDate
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= totalDays; i++) days.push(i)
  return days
})

// ✅ MONTH NAME
const monthName = computed(() =>
  props.currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
)

// ✅ STATIC DAYS LABEL
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ✅ HELPERS — null-safe guards
const getActivityTypeColor = (typeId) => {
  if (!props.activityTypes?.length) return '#6b7280'
  const type = props.activityTypes.find(t => t.id === typeId)
  return type?.color || '#6b7280'
}

const getMemberName = (id) => {
  if (!props.members?.length) return 'Unknown'
  const member = props.members.find(m => m.id === id)
  return member?.name || 'Unknown'
}

// ✅ NAVIGATION
const previousMonth = () => {
  const date = new Date(props.currentDate)
  date.setMonth(date.getMonth() - 1)
  emit('month-change', date)
}

const nextMonth = () => {
  const date = new Date(props.currentDate)
  date.setMonth(date.getMonth() + 1)
  emit('month-change', date)
}

const handleDayClick = (day) => {
  const selectedDate = new Date(props.currentDate)
  selectedDate.setDate(day)
  emit('select-day', { day, date: selectedDate })
}

// ✅ DEBUG WATCH (remove in production)
watch(() => props.activities, (val) => console.log('activities:', val), { immediate: true, deep: true })
</script>

<template>
  <div class="space-y-4 sm:space-y-6 max-w-full overflow-hidden">

    <!-- ── Filters ── -->
    <div class="space-y-3">

      <!-- Member filter row -->
      <div class="flex items-center gap-2">
        <Filter class="w-4 h-4 text-muted-foreground shrink-0" />

        <div class="flex flex-wrap gap-2 pb-2">
          <!-- "All Members" resets member filter -->
          <Badge
            :variant="!selectedMember ? 'default' : 'outline'"
            class="cursor-pointer"
            @click="selectedMember = null"
          >
            All Members
            <span class="px-2 text-xs bg-secondary rounded ml-1">
              {{ totalMonthlyCount }}
            </span>
          </Badge>


        <Badge
        v-for="member in members"
        :key="member.id"
        :variant="selectedMember === member.id ? 'default' : 'outline'"
        class="cursor-pointer flex items-center gap-2 border border-primary"
        @click="toggleMember(member.id)"
        >
        {{ member.name }}
        <span class="px-2 text-xs bg-secondary rounded ml-1">
            {{ memberCountMap[member.id] || 0 }}  <!-- member.id must match member_id in activities -->
        </span>
        </Badge>
        </div>
      </div>

      <!-- Type filter row -->
      <div class="flex items-center gap-2">
        <div class="w-4 shrink-0"></div>

        <div class="flex flex-wrap gap-2 pb-2">
          <!-- "All Types" resets type filter -->
          <Badge
            :variant="!selectedType ? 'default' : 'outline'"
            class="cursor-pointer"
            @click="selectedType = null"
          >
            All Types
            <span class="px-2 text-xs bg-secondary rounded ml-1">
              {{ allTypeTotalCount }}
            </span>
          </Badge>

          <Badge
            v-for="type in activityTypes"
            :key="type.id"
            :variant="selectedType === type.id ? 'default' : 'outline'"
            class="cursor-pointer flex items-center gap-2"
            :style="{
              backgroundColor: selectedType === type.id ? getActivityTypeColor(type.id) : 'transparent',
              borderColor: getActivityTypeColor(type.id),
              color: selectedType === type.id ? '#fff' : 'inherit'
            }"
            @click="toggleType(type.id)"
          >
            {{ type.icon }} {{ type.name }}
            <span class="px-2 text-xs bg-secondary rounded ml-1">
              {{ activityTypeCountMap[type.id] || 0 }}
            </span>
          </Badge>
        </div>
      </div>
    </div>

    <!-- ── Calendar ── -->
    <Card>
      <CardHeader>
        <div class="flex justify-between items-start">
          <div>
            <CardTitle>{{ monthName }}</CardTitle>
            <CardDescription>
              Activity calendar
              <!-- Show active filters as hints -->
              <span v-if="selectedMember || selectedType" class="ml-2 text-primary font-medium">
                (filtered
                <span v-if="selectedMember">
                  · {{ members.find(m => m.id === selectedMember)?.name }}
                </span>
                <span v-if="selectedType">
                  · {{ activityTypes.find(t => t.id === selectedType)?.name }}
                </span>
                )
              </span>
            </CardDescription>
          </div>

          <div class="flex gap-2">
            <Button variant="outline" size="icon" @click="previousMonth">
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" @click="nextMonth">
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <!-- Day headers -->
        <div class="grid grid-cols-7 mb-2">
          <div
            v-for="day in days"
            :key="day"
            class="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {{ day }}
          </div>
        </div>

        <!-- Date cells -->
        <div class="grid grid-cols-7 gap-1">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            :class="[
              'border rounded p-1 min-h-[80px] transition-colors',
              day ? 'bg-primary-foreground cursor-pointer hover:bg-muted' : 'bg-transparent border-transparent'
            ]"
            @click="day && handleDayClick(day)"
          >
            <span v-if="day" class="text-xs font-semibold text-muted-foreground">{{ day }}</span>

            <!-- Activity pills — filtered by selected member & type -->
            <div
              v-for="activity in (activitiesByDate[day] || [])"
              :key="activity.id"
              class="text-white text-xs px-1 py-0.5 rounded mt-1 truncate"
              :style="{ backgroundColor: getActivityTypeColor(activity.activity_type_id) }"
              :title="activity.member_name"
            >
              {{ activity.member_name }}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

  </div>
</template>
