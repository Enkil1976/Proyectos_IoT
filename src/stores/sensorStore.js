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
  const error = ref(null)

  const fetchTemperatureHumidityData = async () => {
    try {
      error.value = null
      
      // Mantener datos anteriores mientras se cargan nuevos
      const previousData = [...temperatureHumidityData.value]
      
      // Forzar datos demo si la API no responde
      let sensor1Data = []
      let sensor2Data = []
      
      try {
        const sensor1Response = await getAmbientalSensor1();
        const sensor2Response = await getAmbientalSensor2();
        
      // Respuestas API comentadas para producción
        
        if (!sensor1Response || !sensor2Response) {
          throw new Error('Una o ambas respuestas de API son undefined');
        }

        sensor1Data = Array.isArray(sensor1Response) ? sensor1Response : [];
        sensor2Data = Array.isArray(sensor2Response) ? sensor2Response : [];
        
        if (sensor1Data.length === 0 && sensor2Data.length === 0) {
          console.warn('API devolvió arrays vacíos, usando datos demo');
          // Datos demo de respaldo
          const now = new Date();
          sensor1Data = [{
            id: 1,
            temperatura: 18.4,
            humedad: 68,
            dew_point: 12.4,
            received_at: now.toISOString()
          }];
          sensor2Data = [{
            id: 2,
            temperatura: 19.1,
            humedad: 65,
            dew_point: 12.7,
            received_at: now.toISOString()
          }];
        } else if (sensor1Data.length === 0 || sensor2Data.length === 0) {
          console.warn('Advertencia: Uno de los sensores devolvió array vacío');
        }
      } catch (error) {
        console.error('Error obteniendo datos de sensores, usando datos demo:', error.message);
      if (error.code === 'ECONNABORTED') {
        console.warn('Timeout excedido al conectar con el API');
      }
        // Datos demo de respaldo
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

      // Logs de respuesta API cruda comentados para producción

  const formatData = (data, sensorId) => {
    if (!Array.isArray(data)) {
      console.error(`Datos del sensor ${sensorId || 'desconocido'} no son un array:`, data)
      return []
    }

    const filtered = data.filter(item => {
      const isValid = item && 
                    item.temperatura !== undefined && 
                    item.humedad !== undefined &&
                    item.dew_point !== undefined
      
      if (!isValid) {
        console.warn(`Item inválido en sensor ${sensorId || 'desconocido'}:`, item)
      }
      return isValid
    })

      const formatted = filtered.map(item => {
      const formattedItem = formatSensorData({
        ...item,
        sensor_id: {
          id: sensorId.apiId,
          name: sensorId.name
        },
        received_at: item.received_at || new Date().toISOString(),
        dew_point: item.dew_point
      })
      return formattedItem
    })

        return formatted
      }
      // IDs hardcodeados según configuración física de sensores
      // Sensor 1: Temperatura/Humedad principal
      // Sensor 2: Temperatura/Humedad secundario
      // Definición clara de los sensores
      const sensorDefinitions = {
        1: { apiId: 'temhum1', name: 'Principal' },
        2: { apiId: 'temhum2', name: 'Secundario' }
      }
      
      const formatted1 = formatData(sensor1Data, sensorDefinitions[1])
      const formatted2 = formatData(sensor2Data, sensorDefinitions[2])
      // Combinar datos nuevos con anteriores si existen
      const newData = [
        ...formatted1,
        ...formatted2
      ]
      
      // Mantener datos anteriores si no hay nuevos
      temperatureHumidityData.value = newData.length > 0 
        ? newData.sort((a, b) => new Date(b.received_at) - new Date(a.received_at))
        : previousData
      // Log de datos finales comentado para producción

    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo datos de sensores')
    } finally {
      // loading eliminado
    }
  }

  const fetchWaterQualityData = async () => {
    try {
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
      // loading eliminado
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
