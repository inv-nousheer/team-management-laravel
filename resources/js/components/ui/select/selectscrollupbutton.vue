<script setup>
import { SelectScrollUpButton as SelectScrollUpButtonPrimitive } from 'reka-ui'
import { ChevronUp } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <SelectScrollUpButtonPrimitive
    data-slot="select-scroll-up-button"
    :as-child="asChild"
    :class="cn('flex cursor-default items-center justify-center py-1', props.class)"
  >
    <ChevronUp class="h-4 w-4" />
  </SelectScrollUpButtonPrimitive>
</template>
