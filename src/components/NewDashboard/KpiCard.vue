<template>
  <v-card :color="statusColor" dark>
    <v-card-title class="d-flex justify-space-between align-center">
      <div>
        <v-icon left>{{ icon }}</v-icon>
        <span class="text-subtitle-1">{{ title }}</span>
      </div>
      <v-chip class="text-h5 font-weight-medium" :color="valueColor">
        {{ formattedValue }}
      </v-chip>
    </v-card-title>
    <v-card-text>
      <v-progress-linear
        v-if="showProgress"
        :model-value="trendValue"
        :color="trendColor"
        height="8"
      />
      <div class="d-flex justify-space-between mt-2">
        <span class="text-caption">{{ statusMessage }}</span>
        <span class="text-caption">{{ formattedTimestamp }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    default: 'mdi-chart-line'
  },
  statusColor: {
    type: String,
    default: 'green'
  },
  trendValue: {
    type: Number,
    default: 50
  },
  trendColor: {
    type: String,
    default: 'green'
  },
  statusText: {
    type: String,
    default: ''
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  timestamp: {
    type: String,
    default: ''
  }
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toFixed(1)
  }
  return props.value
})

const valueColor = computed(() => {
  return props.statusColor === 'grey' ? 'grey darken-2' : 'white'
})

const statusMessage = computed(() => {
  if (props.statusText) return props.statusText
  
  switch(props.statusColor) {
    case 'green': return 'Estado óptimo'
    case 'orange': return 'Atención requerida'
    case 'red': return 'Alerta crítica'
    default: return 'Sin datos'
  }
})

const formattedTimestamp = computed(() => {
  if (!props.timestamp) return ''
  return new Date(props.timestamp).toLocaleTimeString()
})
</script>
