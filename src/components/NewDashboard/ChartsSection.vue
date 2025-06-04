<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-chart-line</v-icon>
            Temperatura y Humedad
          </v-card-title>
          <v-card-text style="height: 300px;">
            <ChartWrapper>
              <TemperatureHumidityChart />
            </ChartWrapper>
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
            <ChartWrapper>
              <WaterQualityChart />
            </ChartWrapper>
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
import { ref } from 'vue'

import ChartWrapper from '../common/ChartWrapper.vue'
import TemperatureHumidityChart from '../TemperatureHumidityChart.vue'
import WaterQualityChart from '../WaterQualityChart.vue'
import LightChart from './LightChart.vue'
import HistoricalChart from './HistoricalChart.vue'
</script>
