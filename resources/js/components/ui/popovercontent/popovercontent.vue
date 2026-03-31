<script setup>
import { PopoverPortal, PopoverContent as PopoverContentPrimitive } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  align: { type: String, default: 'center' },
  sideOffset: { type: Number, default: 4 },
  asChild: { type: Boolean, default: false },
})
</script>

<template>
  <PopoverPortal>
    <PopoverContentPrimitive
      data-slot="popover-content"
      :align="align"
      :side-offset="sideOffset"
      :as-child="asChild"
      :class="cn(
        'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        props.class
      )"
    >
      <slot />
    </PopoverContentPrimitive>
  </PopoverPortal>
</template>
