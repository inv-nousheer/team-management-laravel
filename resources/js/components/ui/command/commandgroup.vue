<script setup>
import { ComboboxGroup, ComboboxLabel } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  heading: { type: String, default: '' },
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <ComboboxGroup
    data-slot="command-group"
    :as-child="asChild"
    :class="cn(
      'overflow-hidden p-1 text-foreground',
      props.class
    )"
  >
    <ComboboxLabel
      v-if="heading"
      class="px-2 py-1.5 text-xs font-medium text-muted-foreground"
    >
      {{ heading }}
    </ComboboxLabel>
    <slot />
  </ComboboxGroup>
</template>
