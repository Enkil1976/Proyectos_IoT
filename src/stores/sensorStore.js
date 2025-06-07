import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getAmbientalSensor1, 
  getAmbientalSensor2,
  getWaterQuality,
  formatSensorData,
  formatWaterQualityData,
  getAmbientalChart1,
  getAmbientalChart2,
  getWaterQualityChart
} from '../services/sensorService'

export const useSensorStore = defineStore('sensor', () => {
  const temperatureHumidityData = ref({
    sensor1: null,
    sensor2: null
  })

  const waterQualityData = ref(null)
  const waterQualityChartData = ref(null)
  const ambientalChart1 = ref(null)
  const ambientalChart2 = ref(null)
  const error = ref(null)
  const loading = ref(false)

  const fetchTemperatureHumidityData = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('[Store] Obteniendo datos de temperatura/humedad...')

      const [sensor1Data, sensor2Data] = await Promise.all([
        getAmbientalSensor1(),
        getAmbientalSensor2()
      ])

      temperatureHumidityData.value = {
        sensor1: formatSensorData(sensor1Data),
        sensor2: formatSensorData(sensor2Data)
      }

      console.log('[Store] Datos actualizados:', temperatureHumidityData.value)
    } catch (err) {
      error.value = err.message
      console.error('[Store] Error:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchWaterQualityData = async () => {
    try {
      loading.value = true
      error.value = null
      const data = await getWaterQuality()
      const formatted = formatWaterQualityData(data)
      waterQualityData.value = Array.isArray(formatted) ? formatted[0] : formatted
      console.log('[Store] Water quality data:', waterQualityData.value)
    } catch (err) {
      error.value = err.message
      console.error('[Store] Error fetching water quality:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchAmbientalChart1 = async () => {
    try {
      const data = await getAmbientalChart1()
      ambientalChart1.value = data
    } catch (err) {
      error.value = err.message
    }
  }

  const fetchAmbientalChart2 = async () => {
    try {
      const data = await getAmbientalChart2()
      ambientalChart2.value = data
    } catch (err) {
      error.value = err.message
    }
  }

  const fetchWaterQualityChart = async () => {
    try {
      loading.value = true
      error.value = null
      console.log('[Store Chart] Iniciando fetchWaterQualityChart...')
      
      const data = await getWaterQualityChart()
      console.log('[Store Chart] Respuesta API:', data)
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error('Formato de datos inválido de la API')
      }
      
      waterQualityChartData.value = data
      console.log('[Store Chart] Datos almacenados:', waterQualityChartData.value)
    } catch (err) {
      error.value = `Error al obtener datos de calidad de agua: ${err.message}`
      console.error('[Store Chart] Error:', err)
      waterQualityChartData.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    temperatureHumidityData,
    waterQualityData,
    waterQualityChartData,
    ambientalChart1,
    ambientalChart2,
    error,
    loading,
    fetchTemperatureHumidityData,
    fetchWaterQualityData,
    fetchAmbientalChart1,
    fetchAmbientalChart2,
    fetchWaterQualityChart
  }
})
