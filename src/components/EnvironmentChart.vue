<template>
  <div class="environment-chart">
    <h3>Datos Ambientales Sensor 1</h3>
    <div v-if="loading" class="loading">Cargando datos...</div>
    <div v-else-if="error" class="error">Datos no disponibles</div>
    <div v-else class="sensor-data">
      <div class="data-row">
        <span class="label">Temperatura:</span>
        <span class="value">{{ sensorData.temperature || sensorData.temperatura || 'N/A' }}°C</span>
      </div>
      <div class="data-row">
        <span class="label">Humedad:</span>
        <span class="value">{{ sensorData.humidity || sensorData.humedad || 'N/A' }}%</span>
      </div>
      <div class="data-row">
        <span class="label">Punto de rocío:</span>
        <span class="value">{{ sensorData.dewPoint || 'N/A' }}°C</span>
      </div>
      <div class="timestamp">Última actualización: {{ formattedTime }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(true)
const error = ref(null)
const sensorData = ref({})
const formattedTime = ref('')

async function fetchData() {
  try {
    loading.value = true
    const response = await axios.get('/api/temhum1')
    sensorData.value = response.data
    formattedTime.value = new Date().toLocaleTimeString()
    error.value = null
  } catch (err) {
    error.value = 'Error al obtener datos del sensor'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
  setInterval(fetchData, 5000)
})
</script>

<style scoped>
.environment-chart {
  padding: 1.5rem;
  border: 1px solid #2d3748;
  border-radius: 12px;
  margin: 1rem 0;
  background: #1a202c;
  color: #e2e8f0;
}

.environment-chart h3 {
  margin-top: 0;
  color: #63b3ed;
  font-size: 1.2rem;
}

.loading, .error {
  color: #a0aec0;
  font-style: italic;
}

.sensor-data {
  display: grid;
  gap: 0.8rem;
}

.data-row {
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: 500;
  color: #a0aec0;
}

.value {
  font-weight: 600;
  color: #f7fafc;
}

.timestamp {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #718096;
  text-align: right;
}
</style>
