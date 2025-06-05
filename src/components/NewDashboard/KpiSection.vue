<template>
  <v-container fluid class="mt-16 pt-4">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Información en Tiempo Real</h2>
        <v-divider class="mb-4"></v-divider>
      </v-col>

      <template v-if="sensorStore.temperatureHumidityData.sensor1?.length || sensorStore.temperatureHumidityData.sensor2?.length">
        <!-- Sensor 1 -->
        <v-col cols="12">
          <v-card class="pa-4 mb-4" outlined>
            <h4 class="text-subtitle-1 mb-3">Sensor 1 (Principal)</h4>
            <v-row>
              <v-col cols="12" md="4">
                <KpiCard
                  :title="`Temperatura`"
                  :value="`${latestSensor1?.temperatura || '--'}°C`"
                  icon="mdi-thermometer"
                  :statusColor="getTemperatureStatus(latestSensor1?.temperatura).color"
                  :statusText="getTemperatureStatus(latestSensor1?.temperatura).status"
                  :timestamp="timestampDiff(latestSensor1?.received_at)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <KpiCard
                  :title="`Humedad`"
                  :value="`${latestSensor1?.humedad || '--'}%`"
                  icon="mdi-water-percent"
                  :statusColor="getHumidityStatus(latestSensor1?.humedad).color"
                  :statusText="getHumidityStatus(latestSensor1?.humedad).status"
                  :timestamp="timestampDiff(latestSensor1?.received_at)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <KpiCard
                  :title="`Punto Rocío`"
                  :value="`${latestSensor1?.dew_point || '--'}°C`"
                  icon="mdi-weather-rainy"
                  :statusColor="getDewPointStatus(latestSensor1?.dew_point).color"
                  :statusText="getDewPointStatus(latestSensor1?.dew_point).status"
                  :timestamp="timestampDiff(latestSensor1?.received_at)"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>

        <!-- Sensor 2 -->
        <v-col cols="12">
          <v-card class="pa-4 mb-4" outlined>
            <h4 class="text-subtitle-1 mb-3">Sensor 2 (Secundario)</h4>
            <v-row>
              <v-col cols="12" md="4">
                <KpiCard
                  :title="`Temperatura`"
                  :value="`${latestSensor2?.temperatura || '--'}°C`"
                  icon="mdi-thermometer"
                  :statusColor="getTemperatureStatus(latestSensor2?.temperatura).color"
                  :statusText="getTemperatureStatus(latestSensor2?.temperatura).status"
                  :timestamp="timestampDiff(latestSensor2?.received_at)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <KpiCard
                  :title="`Humedad`"
                  :value="`${latestSensor2?.humedad || '--'}%`"
                  icon="mdi-water-percent"
                  :statusColor="getHumidityStatus(latestSensor2?.humedad).color"
                  :statusText="getHumidityStatus(latestSensor2?.humedad).status"
                  :timestamp="timestampDiff(latestSensor2?.received_at)"
                />
              </v-col>

              <v-col cols="12" md="4">
                <KpiCard
                  :title="`Punto Rocío`"
                  :value="`${latestSensor2?.dew_point || '--'}°C`"
                  icon="mdi-weather-rainy"
                  :statusColor="getDewPointStatus(latestSensor2?.dew_point).color"
                  :statusText="getDewPointStatus(latestSensor2?.dew_point).status"
                  :timestamp="timestampDiff(latestSensor2?.received_at)"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
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


// Función para calcular "hace X minutos"
const timestampDiff = (timestamp) => {
  if (!timestamp) return 'Sin datos'
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Hace menos de 1 minuto'
  if (diffMin === 1) return 'Hace 1 minuto'
  return `Hace ${diffMin} minutos`
}

const latestSensor1 = computed(() => {
  const data = sensorStore.temperatureHumidityData.sensor1
  console.log('data', data)
  if (!Array.isArray(data)) return null
  
  return data.reduce((latest, item) => {
  if (!item?.timestamp) return latest; // Verificar existencia de timestamp
  
  // Convertir las cadenas a fechas comparables
  const itemDate = new Date(item.timestamp);
  const latestDate = latest ? new Date(latest.timestamp) : null;
  
  // Si latest no existe o la nueva fecha es más reciente
  return (!latest || itemDate > latestDate) ? item : latest;
}, null);
})
const latestSensor2 = computed(() => {
  const data = sensorStore.temperatureHumidityData.sensor2
  console.log('data', data)
  if (!Array.isArray(data)) return null
  
  return data.reduce((latest, item) => {
  if (!item?.timestamp) return latest; // Verificar existencia de timestamp
  
  // Convertir las cadenas a fechas comparables
  const itemDate = new Date(item.timestamp);
  const latestDate = latest ? new Date(latest.timestamp) : null;
  
  // Si latest no existe o la nueva fecha es más reciente
  return (!latest || itemDate > latestDate) ? item : latest;
}, null);
})
</script>
