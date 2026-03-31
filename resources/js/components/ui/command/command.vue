<script setup>
import { ComboboxRoot } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: String, default: '' },
  open: { type: Boolean, default: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <ComboboxRoot
    data-slot="command"
    :model-value="modelValue"
    :open="open"
    :class="cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      props.class
    )"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <slot />
  </ComboboxRoot>
</template>
