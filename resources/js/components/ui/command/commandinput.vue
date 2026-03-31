<script setup>
import { ComboboxInput } from 'reka-ui'
import { Search } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center border-b px-3" data-cmdk-input-wrapper>
    <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <ComboboxInput
      data-slot="command-input"
      :model-value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="cn(
        'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
        props.class
      )"
      @update:modelValue="$emit('update:modelValue', $event)"
      v-bind="$attrs"
    />
  </div>
</template>
