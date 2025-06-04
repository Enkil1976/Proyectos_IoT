<template>
  <v-container fluid class="mt-16 pt-4">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Información en Tiempo Real</h2>
        <v-divider class="mb-4"></v-divider>
      </v-col>
      
      <template v-if="sensorStore.temperatureHumidityData.length">
        <!-- Tarjetas originales y copias -->
        <template v-for="sensorId in uniqueSensorIds" :key="`sensor-${sensorId}`">
          <!-- Grupo original -->
          <v-col cols="12">
            <v-card class="pa-4 mb-4" outlined>
              <h4 class="text-subtitle-1 mb-3">Sensor {{ sensorId }}</h4>
              <v-row>
                <!-- Temperatura -->
                <v-col cols="12" md="4">
                  <KpiCard
                    :title="`Temperatura`"
                    :value="`${latestSensorData[sensorId]?.temperatura || '--'}°C`"
                    icon="mdi-thermometer"
                    :statusColor="getTemperatureStatus(latestSensorData[sensorId]?.temperatura).color"
                    :statusText="getTemperatureStatus(latestSensorData[sensorId]?.temperatura).status"
                    :timestamp="latestSensorData[sensorId]?.received_at"
                  />
                </v-col>
                
                <!-- Humedad -->
                <v-col cols="12" md="4">
                  <KpiCard
                    :title="`Humedad`"
                    :value="`${latestSensorData[sensorId]?.humedad || '--'}%`"
                    icon="mdi-water-percent"
                    :statusColor="getHumidityStatus(latestSensorData[sensorId]?.humedad).color"
                    :statusText="getHumidityStatus(latestSensorData[sensorId]?.humedad).status"
                    :timestamp="latestSensorData[sensorId]?.received_at"
                  />
                </v-col>
                
                <!-- Punto de Rocío -->
                <v-col cols="12" md="4">
                  <KpiCard
                    :title="`Punto Rocío`"
                    :value="`${latestSensorData[sensorId]?.dew_point || '--'}°C`"
                    icon="mdi-weather-rainy"
                    :statusColor="getDewPointStatus(latestSensorData[sensorId]?.dew_point).color"
                    :statusText="getDewPointStatus(latestSensorData[sensorId]?.dew_point).status"
                    :timestamp="latestSensorData[sensorId]?.received_at"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>

          <!-- Grupo copia -->
          <v-col cols="12">
            <v-card class="pa-4 mb-4" outlined>
              <h4 class="text-subtitle-1 mb-3">Sensor {{ sensorId}} (Copia)</h4>
              <v-row>
                <!-- Temperatura -->
                <v-col cols="12" md="4">
                  <KpiCard
                    :title="`Temperatura`"
                    :value="`${latestSensorData[sensorId]?.temperatura || '--'}°C`"
                    icon="mdi-thermometer"
                    :statusColor="getTemperatureStatus(latestSensorData[sensorId]?.temperatura).color"
                    :statusText="getTemperatureStatus(latestSensorData[sensorId]?.temperatura).status"
                    :timestamp="latestSensorData[sensorId]?.received_at"
                  />
                </v-col>
                
                <!-- Humedad -->
                <v-col cols="12" md="4">
                  <KpiCard
                    :title="`Humedad`"
                    :value="`${latestSensorData[sensorId]?.humedad || '--'}%`"
                    icon="mdi-water-percent"
                    :statusColor="getHumidityStatus(latestSensorData[sensorId]?.humedad).color"
                    :statusText="getHumidityStatus(latestSensorData[sensorId]?.humedad).status"
                    :timestamp="latestSensorData[sensorId]?.received_at"
                  />
                </v-col>
                
                <!-- Punto de Rocío -->
                <v-col cols="12" md="4">
                  <KpiCard
                    :title="`Punto Rocío`"
                    :value="`${latestSensorData[sensorId]?.dew_point || '--'}°C`"
                    icon="mdi-weather-rainy"
                    :statusColor="getDewPointStatus(latestSensorData[sensorId]?.dew_point).color"
                    :statusText="getDewPointStatus(latestSensorData[sensorId]?.dew_point).status"
                    :timestamp="latestSensorData[sensorId]?.received_at"
                  />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </template>
      </template>
      <v-col v-else cols="12">
        <v-alert type="info">Cargando datos de sensores...</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue'
import { useSensorStore } from '@/stores/sensorStore'
import { useStatusLogic } from '@/composables/useStatusLogic'
import KpiCard from './KpiCard.vue'

const sensorStore = useSensorStore()
const { getTemperatureStatus, getHumidityStatus, getDewPointStatus } = useStatusLogic()

const uniqueSensorIds = computed(() => {
  return [...new Set(sensorStore.temperatureHumidityData.map(item => item.sensor_id))]
})

const latestSensorData = computed(() => {
  const result = {}
  sensorStore.temperatureHumidityData.forEach(item => {
    if (!result[item.sensor_id] || 
        new Date(item.received_at) > new Date(result[item.sensor_id].received_at)) {
      result[item.sensor_id] = item
    }
  })
  return result
})

</script>
