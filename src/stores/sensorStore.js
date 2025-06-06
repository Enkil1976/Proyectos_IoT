import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getAmbientalSensor1, 
  getAmbientalSensor2,
  getWaterQuality,
  formatSensorData,
  formatWaterQualityData
} from '../services/sensorService'

export const useSensorStore = defineStore('sensor', () => {
  const temperatureHumidityData = ref({
    sensor1: [],
    sensor2: []
  })

  const waterQualityData = ref(null)
  const error = ref(null)

  const fetchTemperatureHumidityData = async () => {
    try {
      error.value = null

      let sensor1Data = []
      let sensor2Data = []

      try {
        const sensor1Response = await getAmbientalSensor1()
        const sensor2Response = await getAmbientalSensor2()

        if (!sensor1Response || !sensor2Response) {
          throw new Error('No se recibieron datos de los sensores')
        }

        // La API devuelve objetos directos
        sensor1Data = [sensor1Response]
        sensor2Data = [sensor2Response]

      } catch (err) {
        console.error('Error obteniendo datos de sensores, usando datos demo:', err.message)
        const now = new Date()
        sensor1Data = [{
          id: 1,
          temperatura: 18.4,
          humedad: 68,
          dew_point: 12.4,
          received_at: now.toISOString()
        }]
        sensor2Data = [{
          id: 2,
          temperatura: 19.1,
          humedad: 65,
          dew_point: 12.7,
          received_at: now.toISOString()
        }]
      }

      const formatData = (data, sensorId) => {
        if (!Array.isArray(data)) {
          console.error(`Datos del sensor ${sensorId?.name || 'desconocido'} no son un array:`, data)
          return []
        }

        const filtered = data.filter(item => {
          const isValid = item &&
            item.temperatura !== undefined &&
            item.humedad !== undefined &&
            item.dew_point !== undefined

          if (!isValid) {
            console.warn(`Item inválido en sensor ${sensorId?.name || 'desconocido'}:`, item)
          }

          return isValid
        })

        const formatted = filtered.map(item => formatSensorData({
          ...item,
          sensor_id: {
            id: sensorId.apiId,
            name: sensorId.name
          },
          received_at: item.received_at || new Date().toISOString(),
          dew_point: item.dew_point
        }))

        return formatted
      }

      const sensorDefinitions = {
        1: { apiId: 'temhum1', name: 'Principal' },
        2: { apiId: 'temhum2', name: 'Secundario' }
      }

      temperatureHumidityData.value.sensor1 = formatData(sensor1Data, sensorDefinitions[1])
      temperatureHumidityData.value.sensor2 = formatData(sensor2Data, sensorDefinitions[2])

    } catch (err) {
      error.value = err.message
      console.error('Error general obteniendo datos de sensores:', err)
    }
  }

  const fetchWaterQualityData = async () => {
    try {
      error.value = null

      const data = await getWaterQuality()

      const formattedData = formatWaterQualityData(data)

      // Como normalmente esperamos un solo objeto, tomamos el primero
      waterQualityData.value = formattedData.length > 0 ? formattedData[0] : null

      console.log('[Store] Datos de calidad de agua actualizados:', waterQualityData.value)

    } catch (err) {
      error.value = err.message
      console.error('[Store] Error obteniendo datos de calidad de agua:', err)
    }
  }

  return {
    temperatureHumidityData,
    waterQualityData,
    error,
    fetchTemperatureHumidityData,
    fetchWaterQualityData
  }
})
