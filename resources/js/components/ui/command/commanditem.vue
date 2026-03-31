<script setup>
import { ComboboxItem } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  value: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  asChild: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<template>
  <ComboboxItem
    data-slot="command-item"
    :value="value"
    :disabled="disabled"
    :as-child="asChild"
    :class="cn(
      'relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
      props.class
    )"
    @select="$emit('select', $event)"
  >
    <slot />
  </ComboboxItem>
</template>
