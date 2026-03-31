<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({})
</script>

<template>
  <div
    data-slot="dialog-header"
    :class="cn('flex flex-col space-y-1.5 text-center sm:text-left', props.class)"
  >
    <slot />
  </div>
</template>
