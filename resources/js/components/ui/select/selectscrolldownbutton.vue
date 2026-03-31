<script setup>
import { SelectScrollDownButton as SelectScrollDownButtonPrimitive } from 'reka-ui'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <SelectScrollDownButtonPrimitive
    data-slot="select-scroll-down-button"
    :as-child="asChild"
    :class="cn('flex cursor-default items-center justify-center py-1', props.class)"
  >
    <ChevronDown class="h-4 w-4" />
  </SelectScrollDownButtonPrimitive>
</template>
