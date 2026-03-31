<script setup>
import { ComboboxContent } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <ComboboxContent
    data-slot="command-list"
    :as-child="asChild"
    :class="cn('max-h-[300px] overflow-y-auto overflow-x-hidden', props.class)"
  >
    <slot />
  </ComboboxContent>
</template>
