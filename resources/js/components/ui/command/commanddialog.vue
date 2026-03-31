<script setup>
import { Dialog, DialogContent } from '@/components/ui/dialog'
import Command from './command.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
})

defineEmits(['update:open'])
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="overflow-hidden p-0 shadow-lg">
      <Command
        class="[&_[data-cmdk-input-wrapper]_svg]:h-5 [&_[data-cmdk-input-wrapper]_svg]:w-5"
      >
        <slot />
      </Command>
    </DialogContent>
  </Dialog>
</template>
