<script setup>
import { ref } from 'vue'
import { Plus, Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// ✅ PROPS
const props = defineProps({
  types: { type: Array, default: () => [] },
})

const emit = defineEmits(['addType', 'updateActivityType'])

// ✅ CONSTANTS
const defaultColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#6366F1']
const iconOptions = ['📅', '🎓', '📊', '💼', '🚀', '💻', '🤝', '⚡']
const priorityOptions = [
  { value: 1, label: 'High' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Normal' },
  { value: 4, label: 'Low' },
]

// ✅ STATE
const showForm = ref(false)
const name = ref('')
const color = ref(defaultColors[0])
const selectedIcon = ref(iconOptions[0])
const priority = ref(3)
const subjectTemplate = ref('')
const emailTemplate = ref('')
const open = ref(false)
const selectedActivityType = ref(null)
const loading = ref(false)

// ✅ RESET
const resetForm = () => {
  selectedActivityType.value = null
  name.value = ''
  color.value = defaultColors[0]
  selectedIcon.value = iconOptions[0]
  priority.value = 3
  subjectTemplate.value = ''
  emailTemplate.value = ''
}

// ✅ CLICK EXISTING TYPE (open edit dialog)
const handleActivityTypeClick = (activityType) => {
  selectedActivityType.value = activityType
  name.value = activityType.name || ''
  color.value = activityType.color || defaultColors[0]
  selectedIcon.value = activityType.icon || iconOptions[0]
  priority.value = activityType.priority || 3
  subjectTemplate.value = activityType.subjectTemplate || ''
  emailTemplate.value = activityType.emailTemplate || ''
  open.value = true
}

// ✅ SUBMIT (add or update)
const handleSubmit = async () => {
  if (!name.value) {
    alert('Please enter an activity type name')
    return
  }

  loading.value = true
  try {
    const activity = {
      id: selectedActivityType.value?.id || name.value.toLowerCase().replace(/\s+/g, '-'),
      name: name.value,
      color: color.value,
      icon: selectedIcon.value,
      priority: priority.value,
      subjectTemplate: subjectTemplate.value,
      emailTemplate: emailTemplate.value,
    }

    if (selectedActivityType.value) {
      await emit('updateActivityType', selectedActivityType.value.id, activity)
      open.value = false
    } else {
      await emit('addType', activity)
      showForm.value = false
    }

    resetForm()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-foreground">Activity Types</h2>
        <p class="text-sm text-muted-foreground">Define and customize activity categories</p>
      </div>
      <Button
        class="bg-primary hover:bg-primary/90 text-primary-foreground"
        @click="showForm = true"
      >
        <Plus class="w-4 h-4 mr-2" />
        Add Type
      </Button>
    </div>

    <!-- Add Form -->
    <Card v-if="showForm" class="bg-card border-border">
      <CardHeader>
        <CardTitle>Add New Activity Type</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-foreground">Type Name *</Label>
              <Input
                v-model="name"
                placeholder="e.g., Conference"
                class="bg-secondary border-border text-foreground"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-foreground">Mail Subject</Label>
              <Input
                v-model="subjectTemplate"
                placeholder="e.g., ⏰ Meeting Reminder for {{name}}"
                class="bg-secondary border-border text-foreground"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-foreground">Email Content</Label>
              <textarea
                v-model="emailTemplate"
                :rows="5"
                placeholder="Hello {{name}}, your activity {{activityName}} ends in {{minutes}} minutes."
                class="w-full rounded-md bg-secondary border border-border p-3 text-sm text-foreground"
              />
              <!-- <p class="text-xs text-muted-foreground">
                Available placeholders: {{ '{{name}}' }}, {{ '{{activityName}}' }}, {{ '{{description}}' }}, {{ '{{minutes}}' }}
              </p> -->
            </div>

            <div class="space-y-2">
              <Label class="text-foreground">Color</Label>
              <div class="flex gap-2">
                <Input
                  v-model="color"
                  type="color"
                  class="bg-secondary border-border h-10 w-20"
                />
                <div class="text-sm text-muted-foreground mt-2">{{ color }}</div>
              </div>
            </div>
          </div>

          <!-- Icon Picker -->
          <div class="space-y-2">
            <Label class="text-foreground">Icon</Label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="icon in iconOptions"
                :key="icon"
                type="button"
                :class="['text-2xl p-2 rounded border', selectedIcon === icon ? 'border-primary bg-primary/10' : 'border-border']"
                @click="selectedIcon = icon"
              >
                {{ icon }}
              </button>
            </div>
          </div>

          <!-- Priority Picker -->
          <div class="space-y-2">
            <Label class="text-foreground">Priority</Label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="option in priorityOptions"
                :key="option.value"
                type="button"
                :class="['p-2 rounded border text-sm', priority === option.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground']"
                @click="priority = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              class="border-border hover:bg-secondary"
              @click="showForm = false"
            >
              Cancel
            </Button>
            <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground">
              Add Type
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Types Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="type in types"
        :key="type.id"
        class="bg-card border-border cursor-pointer hover:shadow-md hover:scale-[1.02] transition"
        @click="handleActivityTypeClick(type)"
      >
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-lg flex items-center justify-center text-3xl"
              :style="{ backgroundColor: `${type.color}20`, color: type.color }"
            >
              {{ type.icon }}
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-foreground">{{ type.name }}</h3>
              <Badge variant="secondary" class="mt-1 text-xs">
                Priority {{ type.priority }}
              </Badge>
              <div class="flex items-center gap-2 mt-2">
                <div
                  class="w-4 h-4 rounded"
                  :style="{ backgroundColor: type.color }"
                />
                <span class="text-xs text-muted-foreground">{{ type.color }}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Edit Dialog -->
    <Dialog
      :open="open"
      @update:open="(val) => { open = val; if (!val) resetForm() }"
    >
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Activity Type</DialogTitle>
          <DialogDescription>Update the activity type details below.</DialogDescription>
        </DialogHeader>

        <Card class="bg-card border-border">
          <CardContent>
            <form @submit.prevent="handleSubmit" class="space-y-4">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-foreground">Type Name *</Label>
                  <Input
                    v-model="name"
                    placeholder="e.g., Conference"
                    class="bg-secondary border-border text-foreground"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground">Mail Subject</Label>
                  <Input
                    v-model="subjectTemplate"
                    placeholder="e.g., ⏰ Meeting Reminder for {{name}}"
                    class="bg-secondary border-border text-foreground"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground">Email Content</Label>
                  <textarea
                    v-model="emailTemplate"
                    :rows="5"
                    placeholder="Hello {{name}}, your activity {{activityName}} ends in {{minutes}} minutes."
                    class="w-full rounded-md bg-secondary border border-border p-3 text-sm text-foreground"
                  />
                  <!-- <p class="text-xs text-muted-foreground">
                    Available placeholders: {{ '{{name}}' }}, {{ '{{activityName}}' }}, {{ '{{description}}' }}, {{ '{{minutes}}' }}
                  </p> -->
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground">Color</Label>
                  <div class="flex gap-2">
                    <Input
                      v-model="color"
                      type="color"
                      class="bg-secondary border-border h-10 w-20"
                    />
                    <div class="text-sm text-muted-foreground mt-2">{{ color }}</div>
                  </div>
                </div>
              </div>

              <!-- Icon Picker -->
              <div class="space-y-2">
                <Label class="text-foreground">Icon</Label>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="icon in iconOptions"
                    :key="icon"
                    type="button"
                    :class="['text-2xl p-2 rounded border', selectedIcon === icon ? 'border-primary bg-primary/10' : 'border-border']"
                    @click="selectedIcon = icon"
                  >
                    {{ icon }}
                  </button>
                </div>
              </div>

              <!-- Priority Picker -->
              <div class="space-y-2">
                <Label class="text-foreground">Priority</Label>
                <div class="grid grid-cols-4 gap-2">
                  <button
                    v-for="option in priorityOptions"
                    :key="option.value"
                    type="button"
                    :class="['p-2 rounded border text-sm', priority === option.value ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground']"
                    @click="priority = option.value"
                  >
                    {{ option.label }}
                  </button>
                </div>
              </div>

              <div class="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  class="border-border hover:bg-secondary"
                  @click="() => { resetForm(); open = false }"
                >
                  Cancel
                </Button>
                <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                  {{ loading ? 'Saving...' : 'Update Type' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>

  </div>
</template>
