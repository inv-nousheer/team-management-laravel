<script setup>
import { ComboboxEmpty } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <ComboboxEmpty
    data-slot="command-empty"
    :as-child="asChild"
    :class="cn('py-6 text-center text-sm', props.class)"
  >
    <slot />
  </ComboboxEmpty>
</template>
