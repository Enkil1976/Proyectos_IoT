import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getAmbientalSensor1, 
  getAmbientalSensor2,
  getWaterQuality,
  formatSensorData
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
      //console.log('[fetchTemperatureHumidityData] Iniciando carga de datos...')

      let sensor1Data = []
      let sensor2Data = []

      try {
        const sensor1Response = await getAmbientalSensor1()
        //console.log('[Sensor 1] Respuesta recibida:', sensor1Response)

        const sensor2Response = await getAmbientalSensor2()
        //console.log('[Sensor 2] Respuesta recibida:', sensor2Response)

        if (!sensor1Response || !sensor2Response) {
          throw new Error('Una o ambas respuestas de API son undefined')
        }

        sensor1Data = Array.isArray(sensor1Response) ? sensor1Response : []
        sensor2Data = Array.isArray(sensor2Response) ? sensor2Response : []

        if (sensor1Data.length === 0 && sensor2Data.length === 0) {
          //console.warn('API devolvió arrays vacíos, usando datos demo')
        } else if (sensor1Data.length === 0 || sensor2Data.length === 0) {
          //console.warn('Advertencia: Uno de los sensores devolvió array vacío')
        }

      } catch (error) {
        console.error('Error obteniendo datos de sensores, usando datos demo:', error.message)
        if (error.code === 'ECONNABORTED') {
          console.warn('Timeout excedido al conectar con el API')
        }
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

        //console.log(`[${sensorId.name}] Datos formateados:`, formatted)
        return formatted
      }

      const sensorDefinitions = {
        1: { apiId: 'temhum1', name: 'Principal' },
        2: { apiId: 'temhum2', name: 'Secundario' }
      }

      const formatted1 = formatData(sensor1Data, sensorDefinitions[1])
      const formatted2 = formatData(sensor2Data, sensorDefinitions[2])

      temperatureHumidityData.value.sensor1 = formatted1
      temperatureHumidityData.value.sensor2 = formatted2

      //console.log('[fetchTemperatureHumidityData] sensor1:', formatted1)
      //console.log('[fetchTemperatureHumidityData] sensor2:', formatted2)

    } catch (err) {
      error.value = err.message
      console.error('Error general obteniendo datos de sensores:', err)
    }
  }

  const fetchWaterQualityData = async () => {
    try {
      error.value = null
      //console.log('[fetchWaterQualityData] Solicitando datos...')

      const data = await getWaterQuality()
      //console.log('[fetchWaterQualityData] Respuesta recibida:', data)

      waterQualityData.value = {
        ph: Number(data.ph),
        ec: Number(data.ec),
        ppm: Number(data.ppm),
        timestamp: data.timestamp || new Date().toISOString()
      }

      //console.log('[fetchWaterQualityData] Datos formateados:', waterQualityData.value)

    } catch (err) {
      error.value = err.message
      console.error('Error fetching water quality data:', err)
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
