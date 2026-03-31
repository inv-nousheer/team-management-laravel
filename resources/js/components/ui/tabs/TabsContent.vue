<script setup>
import { TabsContent as TabsContentPrimitive } from 'reka-ui'
import { cn } from '@/lib/utils'
const props = defineProps({
  value: { type: String, required: true },
  asChild: { type: Boolean, default: false },
})
</script>
<template>
  <TabsContentPrimitive
    :value="value"
    :as-child="asChild"
    :class="cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', props.class)"
  >
    <slot />
  </TabsContentPrimitive>
</template>
