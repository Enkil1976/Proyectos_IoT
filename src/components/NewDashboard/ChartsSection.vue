<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="text-h6">
            <v-icon left color="primary">mdi-thermometer</v-icon>
            <span class="font-weight-bold">Temperatura y Humedad</span>
          </v-card-title>
          <v-card-text style="height: 350px;">
              <TemperatureHumidityChart ref="tempHumidityChart" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-water</v-icon>
            Calidad de Agua
          </v-card-title>
          <v-card-text style="height: 300px;">
            <WaterQualityChart ref="waterQualityChart" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-white-balance-sunny</v-icon>
            Iluminación
          </v-card-title>
          <v-card-text style="height: 300px;">
            <ChartWrapper>
              <LightChart />
            </ChartWrapper>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-chart-bell-curve</v-icon>
            Histórico 24h
          </v-card-title>
          <v-card-text style="height: 300px;">
            <ChartWrapper>
              <HistoricalChart />
            </ChartWrapper>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'

import ChartWrapper from '@/components/common/ChartWrapper.vue'
import WaterQualityChart from '@/components/WaterQualityChart.vue'
import LightChart from './LightChart.vue'
import HistoricalChart from './HistoricalChart.vue'
import TemperatureHumidityChart from '@/components/TemperatureHumidityChart.vue'

const tempHumidityChart = ref(null)
const waterQualityChart = ref(null)

onMounted(() => {
  console.log('[ChartsSection] Componente montado')
  if (tempHumidityChart.value) {
    console.log('[ChartsSection] TemperatureHumidityChart está montado')
  } else {
    console.warn('[ChartsSection] TemperatureHumidityChart no está disponible')
  }
  
  if (waterQualityChart.value) {
    console.log('[ChartsSection] WaterQualityChart está montado')
  }
})
</script>
