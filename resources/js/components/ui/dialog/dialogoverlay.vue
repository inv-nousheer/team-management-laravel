<script setup>
import { DialogOverlay as DialogOverlayPrimitive } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <DialogOverlayPrimitive
    data-slot="dialog-overlay"
    :as-child="asChild"
    :class="cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      props.class
    )"
  />
</template>
