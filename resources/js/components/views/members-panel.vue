<script setup>
import { ref,nextTick } from 'vue'
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
  members: { type: Array, default: () => [] },
})

const emit = defineEmits(['addMember', 'updateMember'])

// ✅ COLOR OPTIONS
const colorOptions = [
  'bg-blue-600',
  'bg-green-600',
  'bg-purple-600',
  'bg-pink-600',
  'bg-red-600',
  'bg-yellow-600',
  'bg-indigo-600',
  'bg-cyan-600',
]

// ✅ STATE
const showForm = ref(false)
const name = ref('')
const role = ref('')
const email = ref('')
const selectedColor = ref(colorOptions[0])
const open = ref(false)
const selectedMember = ref(null)
const showFileUpload = ref(false)
const loading = ref(false)
const fileInput = ref(null)

// ✅ RESET FORM
const resetForm = () => {
  selectedMember.value = null
  name.value = ''
  role.value = ''
  email.value = ''
  selectedColor.value = colorOptions[0]
}

// ✅ MEMBER CLICK (open edit dialog)
const handleMemberClick = async (member) => {
  resetForm()
  await nextTick()

  selectedMember.value = member
  name.value = member.name
  email.value = member.email
  role.value = member.role
  selectedColor.value = member.color

  await nextTick()
  open.value = true
}

// ✅ SUBMIT (add or update)
const handleSubmit = async () => {
  if (!name.value || !email.value || !role.value) {
    alert('Please fill in all required fields')
    return
  }

  const member = {
    id: selectedMember.value?.id || name.value.toLowerCase().replace(/\s+/g, '-'),
    name: name.value,
    email: email.value,
    role: role.value,
    color: selectedColor.value,
  }

  loading.value = true
  try {
    if (selectedMember.value) {
      await emit('updateMember', selectedMember.value.id, member)
    } else {
      await emit('addMember', member)
    }
    open.value = false
    showForm.value = false
    resetForm()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Error')
  } finally {
    loading.value = false
  }
}

// ✅ FILE UPLOAD SUBMIT
const handleSubmitFileUpload = async () => {
  const file = fileInput.value?.files?.[0]

  if (!file) {
    alert('Please select a file.')
    return
  }

  const isCSV  = file.name.endsWith('.csv')
  const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xlsm') || file.name.endsWith('.xls')

  if (!isCSV && !isXLSX) {
    alert('Please upload a .csv or .xlsx / .xlsm file.')
    return
  }

  loading.value = true

  try {
    let rows = []

    if (isCSV) {
      const text = await file.text()
      rows = text
        .trim()
        .split(/\r?\n/)
        .map((line) => {
          const result = []
          let cur = ''
          let inQuote = false
          for (const ch of line) {
            if (ch === '"') { inQuote = !inQuote; continue }
            if (ch === ',' && !inQuote) { result.push(cur.trim()); cur = ''; continue }
            cur += ch
          }
          result.push(cur.trim())
          return result
        })
    } else {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
    }

    if (rows.length < 2) {
      alert('File is empty or has no data rows.')
      return
    }

    const headers = rows[0].map((h) => String(h).toLowerCase().trim())
    const idx = {
      name:  headers.indexOf('name'),
      email: headers.indexOf('email'),
      role:  headers.indexOf('job role'),
    }

    if (idx.name === -1 || idx.email === -1 || idx.role === -1) {
      alert(`Missing required columns.\nFound: ${headers.join(', ')}\nRequired: name, email, job role`)
      return
    }

    const dataRows = rows.slice(1).filter((r) => r.some((c) => String(c ?? '').trim() !== ''))
    let successCount = 0
    const errors = []

    for (const row of dataRows) {
      const memberName  = String(row[idx.name]  ?? '').trim()
      const memberEmail = String(row[idx.email] ?? '').trim()
      const memberRole  = String(row[idx.role]  ?? '').trim()

      if (!memberName || !memberEmail || !memberRole) continue

      const member = {
        id:    `${memberName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${successCount}`,
        name:  memberName,
        email: memberEmail,
        role:  memberRole,
        color: 'bg-blue-600',
      }

      try {
        await emit('addMember', member)
        successCount++
      } catch (err) {
        errors.push(`"${memberName}": ${err instanceof Error ? err.message : 'failed'}`)
      }
    }

    showFileUpload.value = false
    alert(
      errors.length > 0
        ? `Imported ${successCount} member(s) with ${errors.length} error(s):\n${errors.join('\n')}`
        : `Successfully imported ${successCount} member(s)!`
    )
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Error reading file')
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
        <h2 class="text-2xl font-bold text-foreground">Team Members</h2>
        <p class="text-sm text-muted-foreground">Manage your team members</p>
      </div>
      <div class="flex gap-5">
        <Button
          class="bg-primary hover:bg-primary/90 text-primary-foreground"
          @click="showForm = !showForm"
        >
          <Plus class="w-4 h-4 mr-2" />
          Add Member
        </Button>
        <Button class="bg-primary hover:bg-primary/90 text-primary-foreground">
          <a href="/files/Member_format.xlsm" download>Download Format</a>
        </Button>
        <Button
          class="bg-primary hover:bg-primary/90 text-primary-foreground"
          @click="showFileUpload = !showFileUpload"
        >
          Excel Import
        </Button>
      </div>
    </div>

    <!-- Add Member Form -->
    <Card v-if="showForm" class="bg-card border-border">
      <CardHeader>
        <CardTitle>Add New Member</CardTitle>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div class="space-y-2">
              <Label class="text-foreground">Name *</Label>
              <Input
                v-model="name"
                placeholder="Full name"
                class="bg-secondary border-border text-foreground"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-foreground">Email *</Label>
              <Input
                v-model="email"
                type="email"
                placeholder="email@company.com"
                class="bg-secondary border-border text-foreground"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-foreground">Role *</Label>
              <Input
                v-model="role"
                placeholder="Job title"
                class="bg-secondary border-border text-foreground"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-foreground">Avatar Color</Label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="color in colorOptions"
                  :key="color"
                  type="button"
                  :class="['w-8 h-8 rounded', color, selectedColor === color ? 'ring-2 ring-primary' : '']"
                  @click="selectedColor = color"
                />
              </div>
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
              Add Member
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

    <!-- Members Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card
        v-for="member in members"
        :key="member.id"
        class="bg-card border-border cursor-pointer hover:shadow-md hover:scale-[1.02] transition"
        @click="handleMemberClick(member)"
      >
        <CardContent class="pt-6">
          <div class="flex items-start gap-4">
            <div :class="['w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold', member.color]">
              {{ member.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-foreground truncate">{{ member.name }}</h3>
              <p class="text-sm text-muted-foreground truncate">{{ member.role }}</p>
              <p class="text-xs text-muted-foreground truncate mt-1">{{ member.email }}</p>
              <p class="text-xs text-muted-foreground truncate mt-1">{{ member.phone }}</p>
              <Badge variant="secondary" class="mt-2">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Edit Member Dialog -->
    <Dialog
      :open="open"
      @update:open="(val) => { open = val; if (!val) resetForm() }"
    >
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>Update the member details below.</DialogDescription>
        </DialogHeader>

        <Card class="bg-card border-border">
          <CardContent class="pt-6">
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div class="space-y-2">
                  <Label class="text-foreground">Name *</Label>
                  <Input
                    v-model="name"
                    placeholder="Full name"
                    class="bg-secondary border-border text-foreground"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground">Email *</Label>
                  <Input
                    v-model="email"
                    type="email"
                    placeholder="email@company.com"
                    class="bg-secondary border-border text-foreground"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground">Role *</Label>
                  <Input
                    v-model="role"
                    placeholder="Job title"
                    class="bg-secondary border-border text-foreground"
                  />
                </div>

                <div class="space-y-2">
                  <Label class="text-foreground">Avatar Color</Label>
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="color in colorOptions"
                      :key="color"
                      type="button"
                      :class="['w-8 h-8 rounded', color, selectedColor === color ? 'ring-2 ring-primary' : '']"
                      @click="selectedColor = color"
                    />
                  </div>
                </div>
              </div>

              <div class="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  @click="() => { resetForm(); open = false }"
                >
                  Cancel
                </Button>
                <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                  {{ loading ? 'Saving...' : 'Update Member' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>

    <!-- File Upload Dialog -->
    <Dialog :open="showFileUpload" @update:open="(val) => showFileUpload = val">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Excel Import</DialogTitle>
          <DialogDescription>Upload a .csv or .xlsx file to import members.</DialogDescription>
        </DialogHeader>

        <Card class="bg-card border-border">
          <CardContent class="pt-6">
            <form @submit.prevent="handleSubmitFileUpload" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-foreground">Select File *</Label>
                  <input
                    ref="fileInput"
                    type="file"
                    class="flex h-9 w-full rounded-md border border-input bg-secondary px-3 py-1 text-sm text-foreground"
                    />
                </div>
              </div>

              <div class="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  @click="showFileUpload = false"
                >
                  Cancel
                </Button>
                <Button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
                  {{ loading ? 'Saving...' : 'Upload' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>

  </div>
</template>
