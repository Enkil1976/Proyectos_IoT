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

    <template v-else-if="variant === 'compact'">
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
import { useKpiLogic } from '@/composables/useKpiLogic'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: false, default: '--' },
  icon: { type: String, default: 'mdi-chart-line' },
  statusColor: { type: String, default: 'green' },
  statusText: { type: String, default: '' },
  timestamp: { type: String, default: '' },
  variant: { 
    type: String, 
    default: 'default', 
    validator: v => ['default', 'compact'].includes(v) 
  }
})
console.debug('[KPI CARD] Props:', props)

const { 
  formattedValue,
  valueColor,
  statusMessage,
  formattedTimestamp,
  normalizedTrendValue,
  computedTrendColor,
  showProgress
} = useKpiLogic(props)
</script>
