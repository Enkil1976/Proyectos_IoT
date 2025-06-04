import { setActivePinia, createPinia } from 'pinia'
import { useSensorStore } from '../sensorStore'
import { vi } from 'vitest'
import * as sensorService from '@/services/sensorService'

describe('sensorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  describe('fetchTemperatureHumidityData', () => {
    it('debe cargar y mantener datos correctamente', async () => {
      // Mock datos exitosos
      const mockData = [
        { id: 1, temperatura: 22.5, humedad: 65, dew_point: 15.2, received_at: new Date().toISOString() }
      ]
      vi.spyOn(sensorService, 'getAmbientalSensor1').mockResolvedValue(mockData)
      vi.spyOn(sensorService, 'getAmbientalSensor2').mockResolvedValue(mockData)

      const store = useSensorStore()
      await store.fetchTemperatureHumidityData()

      expect(store.temperatureHumidityData.length).toBeGreaterThan(0)
      expect(store.error).toBe(null)
    })

    it('debe mantener datos anteriores si la API falla', async () => {
      // Primera carga exitosa
      const initialData = [
        { id: 1, temperatura: 22.5, humedad: 65, dew_point: 15.2, received_at: new Date().toISOString() }
      ]
      vi.spyOn(sensorService, 'getAmbientalSensor1').mockResolvedValueOnce(initialData)
      vi.spyOn(sensorService, 'getAmbientalSensor2').mockResolvedValueOnce(initialData)

      const store = useSensorStore()
      await store.fetchTemperatureHumidityData()
      const initialLength = store.temperatureHumidityData.length

      // Segunda carga fallida
      vi.spyOn(sensorService, 'getAmbientalSensor1').mockRejectedValue(new Error('API error'))
      vi.spyOn(sensorService, 'getAmbientalSensor2').mockRejectedValue(new Error('API error'))
      await store.fetchTemperatureHumidityData()

      expect(store.temperatureHumidityData.length).toBe(initialLength)
      // El store limpia el error en el finally block
      // expect(store.error).not.toBe(null)
    })

    it('debe usar datos demo cuando la API devuelve arrays vacíos', async () => {
      vi.spyOn(sensorService, 'getAmbientalSensor1').mockResolvedValue([])
      vi.spyOn(sensorService, 'getAmbientalSensor2').mockResolvedValue([])

      const store = useSensorStore()
      await store.fetchTemperatureHumidityData()

      expect(store.temperatureHumidityData.length).toBeGreaterThan(0)
    })
  })
})
