<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <textarea
    data-slot="textarea"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :class="cn(
      'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      props.class
    )"
    v-bind="$attrs"
  />
</template>
