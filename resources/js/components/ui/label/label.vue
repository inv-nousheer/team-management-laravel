<script setup>
import { Label as LabelPrimitive } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps({
  as: {
    type: [String, Object],
    default: "label",
  },
  asChild: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <LabelPrimitive
    data-slot="label"
    :as="as"
    :as-child="asChild"
    :class="cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      props.class
    )"
  >
    <slot />
  </LabelPrimitive>
</template>
