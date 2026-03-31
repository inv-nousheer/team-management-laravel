<script setup>
import { TabsList as TabsListPrimitive } from 'reka-ui'
import { cn } from '@/lib/utils'
const props = defineProps({ asChild: { type: Boolean, default: false } })
</script>
<template>
  <TabsListPrimitive
    :as-child="asChild"
    :class="cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', props.class)"
  >
    <slot />
  </TabsListPrimitive>
</template>
