<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { X, Loader2, Check, ChevronsUpDown } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popovercontent'
import { cn } from '@/lib/utils'

// ✅ PROPS
const props = defineProps({
  members: { type: Array, default: () => [] },
  activityTypes: { type: Array, default: () => [] },
  activity: { type: Object, default: null },
  initialDate: { type: Date, default: null },
})

const emit = defineEmits(['submit', 'close'])

// ✅ HELPERS
const getInitialDate = () => {
  const d = props.initialDate || new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getInitialStatus = () => {
  if (!props.initialDate) return 'pending'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const selected = new Date(props.initialDate)
  selected.setHours(0, 0, 0, 0)
  return selected < today ? 'completed' : 'pending'
}

const getNowLocal = () =>
  new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)

// ✅ FORM STATE
const memberId = ref(props.activity ? String(props.activity.memberId) : '')
const activityType = ref(props.activity ? String(props.activity.activityType) : '')
const description = ref('')
const date = ref(getInitialDate())
const duration = ref('1')
const status = ref(getInitialStatus())
const blocker = ref(false)
const expectedEndingTime = ref('')
const isSubmitting = ref(false)
const openMember = ref(false)

// ✅ SELECTED MEMBER (for display in combobox trigger)
const selectedMember = computed(() =>
  props.members.find((m) => String(m.id) === String(memberId.value))
)

// ✅ POPULATE FORM when editing an existing activity
const formPopulated = ref(false) // ← add this flag

watch(
  [() => props.activity, () => props.members, () => props.activityTypes],
  ([activity, members, activityTypes]) => {
    if (!activity || !members?.length || !activityTypes?.length) return
    if (formPopulated.value) return // ← skip if already populated

    memberId.value      = String(activity.member_id)
    activityType.value  = String(activity.activity_type_id)
    description.value   = activity.description || ''
    duration.value      = String(activity.duration || 1)
    status.value        = activity.status || 'pending'
    blocker.value       = activity.blocker || false

    const d     = new Date(activity.date)
    const year  = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day   = String(d.getDate()).padStart(2, '0')
    date.value  = `${year}-${month}-${day}`

    if (activity.expected_ending_time) {
      const dt    = new Date(activity.expected_ending_time)
      const eyear = dt.getFullYear()
      const emon  = String(dt.getMonth() + 1).padStart(2, '0')
      const eday  = String(dt.getDate()).padStart(2, '0')
      const hours = String(dt.getHours()).padStart(2, '0')
      const mins  = String(dt.getMinutes()).padStart(2, '0')
      expectedEndingTime.value = `${eyear}-${emon}-${eday}T${hours}:${mins}`
    }

    formPopulated.value = true // ← mark as populated, won't reset again
  },
  { immediate: true }
)

// ✅ KEYBOARD CLOSE
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && !isSubmitting.value) emit('close')
}
onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))


const toggleStatus = (checked) => {
  console.log('Switch fired:', checked)
  status.value = checked ? 'completed' : 'pending'
  console.log('Status is now:', status.value)
}

// ✅ SUBMIT
const handleSubmit = async () => {
    console.log({
      memberId: memberId.value,
      activityType: activityType.value,
      description: description.value,
      date: date.value,
      duration: duration.value,
      status: status.value,
      blocker: blocker.value,
      expectedEndingTime: expectedEndingTime.value,
    })
  if (!memberId.value || !activityType.value || !description.value) {
    alert('Please fill in all required fields')
    return
  }
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    const newActivity = {
      id: props.activity?.id || Date.now().toString(),
      member_id: memberId.value,
      member_name: props.members.find((m) => m.id === memberId.value)?.name || '',
      activity_type_id: activityType.value,
      description: description.value,
      date: new Date(date.value),
      duration: parseInt(duration.value),
      status: status.value,
      blocker: blocker.value,
      expected_ending_time: expectedEndingTime.value,
    }
    await emit('submit', newActivity)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <Card class="border-border w-full max-w-2xl">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-xl font-bold text-foreground">
          {{ activity ? 'Edit Activity' : 'Log New Activity' }}
        </h2>
        <button
          @click="$emit('close')"
          class="p-1 hover:bg-secondary rounded transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">

        <!-- Member + Activity Type -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Member Combobox -->
          <div class="space-y-2 min-w-0">
            <Label class="text-foreground">Team Member *</Label>
            <Popover v-model:open="openMember">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  role="combobox"
                  class="w-full justify-between bg-secondary border-border text-foreground"
                >
                  {{ selectedMember ? selectedMember.name : 'Select member' }}
                  <ChevronsUpDown class="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-[--radix-popover-trigger-width] p-0 bg-card border-border">
                <Command>
                  <CommandInput placeholder="Search member..." />
                  <CommandEmpty>No member found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      v-for="member in members"
                      :key="member.id"
                      :value="member.name"
                      @select="() => { memberId = String(member.id); openMember = false }"
                    >
                      <Check
                        class="mr-2 h-4 w-4"
                        :class="String(memberId) === String(member.id) ? 'opacity-100' : 'opacity-0'"
                      />
                      {{ member.name }}
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <!-- Activity Type -->
          <div class="space-y-2 min-w-0">
            <Label class="text-foreground">Activity Type *</Label>
            <Select v-model="activityType">
              <SelectTrigger class="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent class="bg-card border-border">
                <SelectItem
                  v-for="type in activityTypes"
                  :key="type.id"
                  :value="type.id"
                >
                  {{ type.icon }} {{ type.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Date + Duration + Expected Ending Time -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="space-y-2">
            <Label class="text-foreground">Date</Label>
            <Input
              type="date"
              v-model="date"
              class="w-full bg-secondary border-border text-foreground"
            />
          </div>

          <div class="space-y-2">
            <Label class="text-foreground">Duration (minutes)</Label>
            <Input
              type="number"
              min="1"
              v-model="duration"
              class="w-full bg-secondary border-border text-foreground"
            />
          </div>

          <div class="space-y-2 md:col-span-2">
            <Label class="text-foreground">Expected Ending Time</Label>
            <Input
              type="datetime-local"
              step="60"
              v-model="expectedEndingTime"
              class="w-full bg-secondary border-border text-foreground"
            />
          </div>
        </div>

        <!-- Status Toggle -->
        <div class="flex items-center justify-between rounded-lg border border-border p-4 bg-secondary/80">
          <div class="space-y-0.5">
            <Label class="text-foreground">Status</Label>
            <p class="text-sm text-muted-foreground">
              {{ status === 'completed' ? 'Activity is done' : 'Activity is in progress' }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-sm font-medium"
              :class="status === 'pending' ? 'text-foreground' : 'text-muted-foreground'"
            >
              Pending
            </span>
            <Switch
            :checked="status === 'completed'"
            @update:checked="toggleStatus"
            />
            <span
              class="text-sm font-medium"
              :class="status === 'completed' ? 'text-foreground' : 'text-muted-foreground'"
            >
              Completed
            </span>
          </div>
        </div>

        <!-- Description + Blocker -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label class="text-foreground">Description *</Label>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-foreground">🚨 Blocker</span>
              <Switch
                :checked="blocker"
                @update:checked="(checked) => blocker = checked"
              />
            </div>
          </div>
          <Textarea
            placeholder="What did the team member do?"
            v-model="description"
            class="bg-secondary border-border text-foreground min-h-24"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            :disabled="isSubmitting"
            class="border-border hover:bg-secondary bg-transparent"
            @click="$emit('close')"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="isSubmitting"
            class="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <template v-if="isSubmitting">
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </template>
            <template v-else>
              {{ activity ? 'Update Activity' : 'Log Activity' }}
            </template>
          </Button>
        </div>

      </form>
    </Card>
  </div>
</template>
