<template>
  <v-app>
    <div>
      <AppHeader @toggle-drawer="toggleDrawer" />
      <SensorConfig ref="sensorConfig" />
      <main>
        <KpiSection />
        <ChartsSection />
        <AlertsSection />
      </main>
    </div>
  </v-app>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useSensorData } from '@/composables/useSensorData'
import AppHeader from './AppHeader.vue'
import SensorConfig from './SensorConfig.vue'
import KpiSection from './KpiSection.vue'
import ChartsSection from './ChartsSection.vue'
import AlertsSection from './AlertsSection.vue'

// Manejo global de errores
onErrorCaptured((err) => {
  console.error('Error capturado en NewDashboard:', err)
  return false // Permitir propagación del error
})

// Configurar actualización periódica de datos
const { fetchData: fetchSensorData, error } = useSensorData()

const sensorConfig = ref(null)

const toggleDrawer = () => {
  sensorConfig.value?.toggleDrawer()
}

// Exponer para pruebas
defineExpose({
  fetchSensorData,
  error
})
</script>
