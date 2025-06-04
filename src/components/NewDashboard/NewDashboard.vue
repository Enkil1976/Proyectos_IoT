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
import { ref } from 'vue'
import { useSensorData } from '@/composables/useSensorData'
import AppHeader from './AppHeader.vue'
import SensorConfig from './SensorConfig.vue'
import KpiSection from './KpiSection.vue'
import ChartsSection from './ChartsSection.vue'
import AlertsSection from './AlertsSection.vue'

// Configurar actualización periódica de datos
const { fetchData: fetchSensorData } = useSensorData()

const sensorConfig = ref(null)

const toggleDrawer = () => {
  sensorConfig.value?.toggleDrawer()
}

// Exponer para pruebas
defineExpose({
  fetchSensorData
})
</script>
