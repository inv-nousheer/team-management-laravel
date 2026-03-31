<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({})
</script>

<template>
  <div
    data-slot="command-separator"
    :class="cn('-mx-1 h-px bg-border', props.class)"
  />
</template>
