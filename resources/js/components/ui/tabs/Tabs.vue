<script setup>
import { provide, ref, watch } from 'vue'
console.log('Tabs mounted - providing context')
const props = defineProps({
  modelValue: String
})

const emit = defineEmits(['update:modelValue'])

// ✅ make it reactive
const activeTab = ref(props.modelValue)

// sync parent → child
watch(() => props.modelValue, (val) => {
  activeTab.value = val
})

// sync child → parent
const setValue = (val) => {
  activeTab.value = val
  emit('update:modelValue', val)
}

// ✅ provide correct object
provide('tabsContext', {
  activeTab,
  setValue
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
