<script setup>
import { DialogDescription as DialogDescriptionPrimitive } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <DialogDescriptionPrimitive
    data-slot="dialog-description"
    :as-child="asChild"
    :class="cn('text-sm text-muted-foreground', props.class)"
  >
    <slot />
  </DialogDescriptionPrimitive>
</template>
