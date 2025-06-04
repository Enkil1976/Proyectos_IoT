<template>
  <v-app-bar app color="green-darken-3" dark>
    <template v-slot:prepend>
      <v-app-bar-nav-icon @click="$emit('toggle-drawer')"></v-app-bar-nav-icon>
    </template>

    <v-toolbar-title>
      <v-icon left>mdi-sprout</v-icon>
      Invernadero IoT
    </v-toolbar-title>

    <template v-slot:append>
      <v-chip :color="statusColor" dark>
        {{ statusText }}
      </v-chip>
      <v-chip class="ml-2" color="grey-darken-2">
        {{ currentDateTime }}
      </v-chip>
    </template>
  </v-app-bar>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    default: 'optimal'
  },
  currentDateTime: {
    type: String,
    default: new Date().toLocaleString()
  }
})

const statusText = computed(() => {
  return {
    optimal: 'Óptimo',
    warning: 'Atención',
    critical: 'Crítico'
  }[props.status]
})

const statusColor = computed(() => {
  return {
    optimal: 'green',
    warning: 'orange',
    critical: 'red'
  }[props.status]
})
</script>
