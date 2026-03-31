<script setup>
import { DialogTitle as DialogTitlePrimitive } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <DialogTitlePrimitive
    data-slot="dialog-title"
    :as-child="asChild"
    :class="cn('text-lg font-semibold leading-none tracking-tight', props.class)"
  >
    <slot />
  </DialogTitlePrimitive>
</template>
