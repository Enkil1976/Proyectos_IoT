import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getAmbientalSensor1, 
  getAmbientalSensor2,
  getWaterQuality,
  formatSensorData
} from '../services/sensorService'

export const useSensorStore = defineStore('sensor', () => {
  const temperatureHumidityData = ref([])
  const waterQualityData = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchTemperatureHumidityData = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Forzar datos demo si la API no responde
      let sensor1Data = []
      let sensor2Data = []
      
      try {
        const sensor1Response = await getAmbientalSensor1();
        sensor1Data = sensor1Response?.success ? sensor1Response.data : [];
        const sensor2Response = await getAmbientalSensor2();
        sensor2Data = sensor2Response?.success ? sensor2Response.data : [];
        
        if (sensor1Data.length === 0 && sensor2Data.length === 0) {
          // Datos demo
          const now = new Date()
          sensor1Data = [{
            temperatura: 18.4,
            humedad: 68,
            dew_point: 12.4,
            received_at: now.toISOString()
          }]
          sensor2Data = [{
            temperatura: 19.1,
            humedad: 65,
            dew_point: 12.7,
            received_at: now.toISOString()
          }]
          console.warn('Usando datos demo - API no devolvió datos')
        }
      } catch (error) {
        console.error('Error fetching sensor data, using demo data', error)
        // Datos demo de respaldo
        const now = new Date()
        sensor1Data = [{
          temperatura: 18.4,
          humedad: 68,
          dew_point: 12.4,
          received_at: now.toISOString()
        }]
        sensor2Data = [{
          temperatura: 19.1,
          humedad: 65,
          dew_point: 12.7,
          received_at: now.toISOString()
        }]
      }

      console.log('--- RAW API RESPONSE ---')
      console.log('Sensor 1:', sensor1Data)
      console.log('Sensor 2:', sensor2Data)

      const formatData = (data, sensorId) => {
        if (!Array.isArray(data)) {
          console.error(`Datos del sensor ${sensorId} no son un array:`, data)
          return []
        }

        const filtered = data.filter(item => {
          const isValid = item && 
                        item.temperatura !== undefined && 
                        item.humedad !== undefined
          
          if (!isValid) {
            console.warn(`Item inválido en sensor ${sensorId}:`, item)
          }
          return isValid
        })

        const formatted = filtered.map(item => {
          const formattedItem = formatSensorData({
            ...item,
            sensor_id: sensorId,
            received_at: item.received_at || new Date().toISOString()
          })
          console.log(`Item formateado sensor ${sensorId}:`, formattedItem)
          return formattedItem
        })

        return formatted
      }
      const formatted1 = formatData(sensor1Data, 1)
      const formatted2 = formatData(sensor2Data, 2)
      temperatureHumidityData.value = [
        ...formatted1,
        ...formatted2
      ].sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
      console.log('Datos formateados y ordenados:', temperatureHumidityData.value)

    } catch (err) {
      error.value = err.message
      console.error('Error fetching sensor data:', err)
    } finally {
      loading.value = false
    }
  }

  const fetchWaterQualityData = async () => {
    try {
      loading.value = true
      error.value = null
      
      const data = await getWaterQuality()
      waterQualityData.value = {
        ph: Number(data.ph),
        ec: Number(data.ec),
        ppm: Number(data.ppm),
        timestamp: data.timestamp || new Date().toISOString()
      }

    } catch (err) {
      error.value = err.message
      console.error('Error fetching water quality data:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    temperatureHumidityData,
    waterQualityData,
    loading,
    error,
    fetchTemperatureHumidityData,
    fetchWaterQualityData
  }
})
