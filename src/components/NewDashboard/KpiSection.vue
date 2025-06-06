<template>
  <v-container fluid class="mt-16 pt-4">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Información en Tiempo Real</h2>
        <v-divider class="mb-4"></v-divider>
      </v-col>

      <!-- Sensores de temperatura y humedad -->
      <template v-if="sensorStore.temperatureHumidityData.sensor1?.length || sensorStore.temperatureHumidityData.sensor2?.length">
        <v-col cols="12" v-for="(sensorData, index) in sensorBlocks" :key="index">
          <v-card class="pa-4 mb-4" outlined>
            <h4 class="text-subtitle-1 mb-3">{{ sensorData.title }}</h4>
            <v-row>
              <v-col cols="12" md="4">
                <KpiCard
                  title="Temperatura"
                  :value="`${sensorData.latest?.temperatura ?? '--'}°C`"
                  icon="mdi-thermometer"
                  :statusColor="getTemperatureStatus(sensorData.latest?.temperatura).color"
                  :statusText="getTemperatureStatus(sensorData.latest?.temperatura).status"
                  :timestamp="timestampDiff(sensorData.latest?.timestamp || sensorData.latest?.received_at)"
                />
              </v-col>
              <v-col cols="12" md="4">
                <KpiCard
                  title="Humedad"
                  :value="`${sensorData.latest?.humedad ?? '--'}%`"
                  icon="mdi-water-percent"
                  :statusColor="getHumidityStatus(sensorData.latest?.humedad).color"
                  :statusText="getHumidityStatus(sensorData.latest?.humedad).status"
                  :timestamp="timestampDiff(sensorData.latest?.timestamp || sensorData.latest?.received_at)"
                />
              </v-col>
              <v-col cols="12" md="4">
                <KpiCard
                  title="Punto Rocío"
                  :value="computeDewPoint(sensorData.latest?.temperatura, sensorData.latest?.humedad)"
                  icon="mdi-weather-rainy"
                  :statusColor="getDewPointStatus(sensorData.latest?.temperatura, sensorData.latest?.humedad)"
                  :statusText="getDewPointText(sensorData.latest?.temperatura, sensorData.latest?.humedad)"
                  :timestamp="timestampDiff(sensorData.latest?.timestamp || sensorData.latest?.received_at)"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </template>

      <!-- Calidad del agua -->
      <v-col cols="12">
        <v-card class="pa-4 mb-4" outlined>
          <h4 class="text-subtitle-1 mb-3">Calidad del Agua</h4>
          <v-row>
            <v-col cols="12" md="4">
              <KpiCard
                title="pH"
                :value="sensorStore.waterQualityData?.ph ?? '--'"
                icon="mdi-water"
                :statusColor="getWaterQualityStatus('ph', sensorStore.waterQualityData?.ph)"
                :statusText="getWaterStatusText('ph', sensorStore.waterQualityData?.ph)"
                :timestamp="timestampDiff(sensorStore.waterQualityData?.timestamp)"
              />
            </v-col>
            <v-col cols="12" md="4">
              <KpiCard
                title="Conductividad"
                :value="sensorStore.waterQualityData?.conductivity ? `${sensorStore.waterQualityData.conductivity} µS/cm` : '--'"
                icon="mdi-lightning-bolt"
                :statusColor="getWaterQualityStatus('ec', sensorStore.waterQualityData?.conductivity)"
                :statusText="getWaterStatusText('ec', sensorStore.waterQualityData?.conductivity)"
                :timestamp="timestampDiff(sensorStore.waterQualityData?.timestamp)"
              />
            </v-col>
            <v-col cols="12" md="4">
              <KpiCard
                title="PPM"
                :value="sensorStore.waterQualityData?.ppm ? `${sensorStore.waterQualityData.ppm} ppm` : '--'"
                icon="mdi-flask"
                :statusColor="getWaterQualityStatus('ppm', sensorStore.waterQualityData?.ppm)"
                :statusText="getWaterStatusText('ppm', sensorStore.waterQualityData?.ppm)"
                :timestamp="timestampDiff(sensorStore.waterQualityData?.timestamp)"
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Estado de carga -->
      <v-col v-if="!sensorStore.temperatureHumidityData.sensor1?.length &&
                  !sensorStore.temperatureHumidityData.sensor2?.length" cols="12">
        <v-alert type="info">Cargando datos de sensores...</v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useSensorStore } from '@/stores/sensorStore'
import { useStatusLogic } from '@/composables/useStatusLogic'
import KpiCard from './KpiCard.vue'

const sensorStore = useSensorStore()
const { 
  getTemperatureStatus, 
  getHumidityStatus, 
  getDewPointStatus, 
  getWaterQualityStatus 
} = useStatusLogic()

// Cargar datos iniciales
onMounted(async () => {
  await sensorStore.fetchWaterQualityData()
  await sensorStore.fetchTemperatureHumidityData()
  
  // Actualizar datos cada 30 segundos
  setInterval(async () => {
    await sensorStore.fetchWaterQualityData()
    await sensorStore.fetchTemperatureHumidityData()
  }, 30000)
})

const latestSensor1 = computed(() => getLatest(sensorStore.temperatureHumidityData.sensor1))
const latestSensor2 = computed(() => getLatest(sensorStore.temperatureHumidityData.sensor2))

const sensorBlocks = computed(() => [
  { title: 'Sensor 1 (Principal)', latest: latestSensor1.value },
  { title: 'Sensor 2 (Secundario)', latest: latestSensor2.value },
])

function getLatest(data) {
  if (!Array.isArray(data)) return null
  return data.reduce((latest, item) => {
    if (!item?.timestamp && !item?.received_at) return latest
    const itemDate = new Date(item.timestamp || item.received_at)
    const latestDate = latest ? new Date(latest.timestamp || latest.received_at) : null
    return (!latest || itemDate > latestDate) ? item : latest
  }, null)
}

function timestampDiff(timestamp) {
  if (!timestamp) return 'Sin datos'
  const now = new Date()
  const date = new Date(timestamp)
  const diffMin = Math.floor((now - date) / 60000)
  if (diffMin < 1) return 'Hace menos de 1 minuto'
  if (diffMin === 1) return 'Hace 1 minuto'
  return `Hace ${diffMin} minutos`
}

function computeDewPoint(temp, humidity) {
  if (temp == null || humidity == null) return '--'
  // fórmula simplificada aproximada para punto de rocío
  const dewPoint = temp - ((100 - humidity) / 5)
  return `${dewPoint.toFixed(1)}°C`
}

function getDewPointText(temp, humidity) {
  if (temp == null || humidity == null) return 'Sin datos'
  const diff = temp - (temp - ((100 - humidity) / 5))
  if (diff <= 1) return 'Crítico'
  if (diff <= 2) return 'Alerta'
  return 'Óptimo'
}

function getWaterStatusText(type, value) {
  if (value === null || value === undefined) return 'Sin datos'
  const ranges = {
    ph: { min: 5.5, max: 6.5, optimalMin: 5.8, optimalMax: 6.2 },
    ec: { min: 1.0, max: 1.5, optimalMin: 1.2, optimalMax: 1.4 },
    ppm: { min: 700, max: 900, optimalMin: 750, optimalMax: 850 }
  }
  if (value < ranges[type].min || value > ranges[type].max) return 'Crítico'
  if (value < ranges[type].optimalMin || value > ranges[type].optimalMax) return 'Alerta'
  return 'Óptimo'
}
</script>
