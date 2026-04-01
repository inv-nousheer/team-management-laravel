<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

import { X, Filter, Loader2 } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// ✅ Props
const props = defineProps({
  day: Number,
  date: Date,
  activities: Array,
  members: Array,
  activityTypes: Array
})

// ✅ Emits
const emit = defineEmits([
  'close',
  'addActivity',
  'editActivity',
  'updateActivity'
])

// ✅ State
const selectedMember = ref(null)
const selectedStatus = ref(null)
const loadingId = ref(null)
console.log('activities', props.activities)

// ✅ Helpers
const formatDate = (date) => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

const getActivityTypeColor = (typeId) => {
  return props.activityTypes.find(t => t.id === typeId)?.color || '#000'
}

const getActivityTypeIcon = (typeId) => {
  return props.activityTypes.find(t => t.id === typeId)?.icon || '•'
}

const getActivityTypeName = (typeId) => {
  return props.activityTypes.find(t => t.id === typeId)?.name || 'Activity'
}

const getMemberName = (id) => {
  return props.members.find(m => m.id === id)?.name || 'Unknown'
}

const getMemberColor = (memberId) => {
  return props.members.find(m => m.id === memberId)?.color || '#000'
}

// ✅ Selected Date String
const selectedDateString = computed(() => {
  const d = props.date
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})

// ✅ Filtered Activities
const dayActivities = computed(() => {
  return props.activities.filter(activity => {
    const d = new Date(activity.date)

    const activityDate =
      `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    return (
      activityDate === selectedDateString.value &&
      (!selectedMember.value || activity.memberId === selectedMember.value) &&
      (!selectedStatus.value || activity.status === selectedStatus.value)
    )
  })
})

// ✅ Total Duration
const totalDuration = computed(() =>
  dayActivities.value.reduce((sum, a) => sum + (a.duration || 0), 0)
)

// ✅ ESC Close
const handleKeyDown = (e) => {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown))

// ✅ Update Activity
const updateStatus = async (activity) => {
  if (activity.status === 'pending' && loadingId.value !== activity.id) {
    loadingId.value = activity.id

    await emit('updateActivity', activity.id, {
      ...activity,
      status: 'completed'
    })

    loadingId.value = null
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4 overflow-y-auto">

    <Card class="w-full max-w-2xl max-h-[90vh] flex flex-col">

      <!-- Header -->
      <div class="flex justify-between p-6 border-b">
        <div>
          <h2 class="text-xl font-bold">
            Activities for {{ formatDate(date) }}
          </h2>
          <p class="text-sm text-muted-foreground">Day {{ day }}</p>
        </div>

        <button @click="$emit('close')">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Member Filter -->
      <div class="flex items-center gap-2 pt-4 pl-6">
        <Filter class="w-4 h-4" />
        <div class="flex gap-2 flex-wrap">

          <Badge
            :variant="!selectedMember ? 'default' : 'outline'"
            @click="selectedMember = null"
          >
            All Members
          </Badge>

          <Badge
            v-for="m in members"
            :key="m.id"
            :variant="selectedMember === m.id ? 'default' : 'outline'"
            @click="selectedMember = selectedMember === m.id ? null : m.id"
          >
            {{ m.name }}
          </Badge>

        </div>
      </div>

      <!-- Status Filter -->
      <div class="flex items-center gap-2 mt-3 pl-6">
        <span>Status:</span>

        <Badge
          :variant="!selectedStatus ? 'default' : 'outline'"
          @click="selectedStatus = null"
        >
          All
        </Badge>

        <Badge
          :variant="selectedStatus === 'pending' ? 'default' : 'outline'"
          @click="selectedStatus = selectedStatus === 'pending' ? null : 'pending'"
        >
          Pending
        </Badge>

        <Badge
          :variant="selectedStatus === 'completed' ? 'default' : 'outline'"
          @click="selectedStatus = selectedStatus === 'completed' ? null : 'completed'"
        >
          Completed
        </Badge>
      </div>

      <!-- Content -->
      <CardContent class="p-6 overflow-y-auto flex-1">

        <div v-if="dayActivities.length">

          <!-- Summary -->
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div class="p-4 text-center bg-secondary rounded">
              {{ dayActivities.length }} Activities
            </div>

            <div class="p-4 text-center bg-secondary rounded">
              {{ totalDuration }} min
            </div>

            <div class="p-4 text-center bg-secondary rounded">
              {{ (totalDuration / 60).toFixed(1) }} hrs
            </div>
          </div>

          <!-- List -->
          <div class="space-y-3">
            <div
              v-for="activity in dayActivities"
              :key="activity.id"
              class="p-3 border-l-2 border-primary bg-secondary rounded"
            >
              <div class="flex justify-between">

                <div>{{ activity.description }}</div>

                <Badge @click="$emit('editActivity', activity)">
                  Edit
                </Badge>

              </div>

              <div class="flex gap-2 mt-2 flex-wrap">

                <Badge :style="{ backgroundColor: getMemberColor(activity.member_id), color: 'white'}">
                  {{ getActivityTypeIcon(activity.activityType) }}
                  {{ (activity.member_name) }}
                </Badge>
                <Badge :style="{ backgroundColor: getActivityTypeColor(activity.activity_type_id), color: 'white' }">

                {{ getActivityTypeName(activity.activity_type_id) }}
                </Badge>

                <Badge>{{ activity.duration }} min</Badge>

                <Badge
                  @click="updateStatus(activity)"
                  :class="activity.status === 'pending' ? 'cursor-pointer' : 'opacity-50'"
                >
                  <span v-if="loadingId === activity.id">
                    <Loader2 class="animate-spin w-3 h-3" />
                  </span>
                  <span v-else>{{ activity.status }}</span>
                </Badge>

              </div>

            </div>
          </div>

        </div>

        <!-- Empty -->
        <div v-else class="text-center py-10">
          No activities for this day

          <Button @click="$emit('addActivity', { date: selectedDate })" class="mt-3">
            Add Activity
          </Button>
        </div>

      </CardContent>

      <!-- Footer -->
      <div class="flex justify-end gap-2 p-6 border-t">
        <Button variant="outline" @click="$emit('close')">Close</Button>
        <Button @click="$emit('addActivity', { date: selectedDate })">Add Activity</Button>
      </div>

    </Card>
  </div>
</template>
