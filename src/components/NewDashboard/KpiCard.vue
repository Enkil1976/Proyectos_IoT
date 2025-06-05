<template>
  <v-card :color="statusColor" dark>
    <template v-if="variant === 'default'">
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
          :model-value="normalizedTrendValue"
          :color="computedTrendColor"
          height="8"
        />
        <div class="d-flex justify-space-between mt-2">
          <span class="text-caption">{{ statusMessage }}</span>
          <span class="text-caption">{{ formattedTimestamp }}</span>
        </div>
      </v-card-text>
    </template>

    <template v-else-if="variant === 'default'">
      <v-card-text class="pa-2">
        <div class="d-flex justify-space-between align-center">
          <div>
            <v-icon small left>{{ icon }}</v-icon>
            <span class="text-caption">{{ title }}</span>
          </div>
          <v-chip small class="text-body-1 font-weight-medium" :color="valueColor">
            {{ formattedValue }}
          </v-chip>
        </div>
        <v-progress-linear
          v-if="showProgress"
          :model-value="normalizedTrendValue"
          :color="computedTrendColor"
          height="4"
          class="mt-1"
        />
      </v-card-text>
    </template>
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
    default: 0
  },
  trendColor: {
    type: String,
    default: ''
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
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact'].includes(value)
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

const normalizedTrendValue = computed(() => {
  if (props.trendValue) return props.trendValue;
  
  // Extraer valor numérico del string (ej: "25°C" -> 25)
  const numValue = typeof props.value === 'string' 
    ? parseFloat(props.value.replace(/[^0-9.-]/g, '')) 
    : props.value;

  if (props.title?.includes('Humedad')) {
    // Humedad ya está en porcentaje (0-100)
    return Math.min(100, Math.max(0, numValue));
  } else if (props.title?.includes('Temperatura')) {
    // Normalizar temperatura (0-40°C)
    return Math.min(100, Math.max(0, (numValue / 40) * 100));
  } else if (props.title?.includes('Punto Rocío')) {
    // Normalizar punto de rocío (0-30°C)
    return Math.min(100, Math.max(0, (numValue / 30) * 100));
  }
  return 50; // Valor por defecto
})

const computedTrendColor = computed(() => {
  if (props.trendColor) return props.trendColor;
  
  // Colores con máximo contraste según el estado
  switch(props.statusColor) {
    case 'green': return 'yellow accent-2'; // Amarillo contrasta con verde
    case 'orange': return 'blue lighten-1'; // Azul contrasta con naranja
    case 'red': return 'cyan accent-2'; // Cian contrasta con rojo
    default: return 'white'; // Blanco para máximo contraste
  }
})
</script>
