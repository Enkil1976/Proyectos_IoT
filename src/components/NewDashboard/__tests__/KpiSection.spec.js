import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { useSensorStore } from '@/stores/sensorStore'
import { createPinia } from 'pinia'
import KpiSection from '../KpiSection.vue'
import KpiCard from '../KpiCard.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'


describe('KpiSection.vue', () => {
  const pinia = createPinia()
  const vuetify = createVuetify({ components, directives })
  
  it('debe mostrar el último dato válido del sensor 2', async () => {
    // Mock del store
    const mockSensorData = [
      { 
        temperatura: 23, 
        humedad: 64, 
        dew_point: 16, 
        received_at: '2025-04-06T22:05:00Z',
        sensor_id: { id: 'temhum2', name: 'Secundario' }
      },
      { 
        temperatura: 22, 
        humedad: 65, 
        dew_point: 15, 
        received_at: '2025-04-06T22:00:00Z',
        sensor_id: { id: 'temhum1', name: 'Principal' }
      }
    ]
    const store = useSensorStore(pinia)
    store.temperatureHumidityData.value = mockSensorData
    vi.spyOn(store.temperatureHumidityData, 'value', 'get').mockReturnValue(mockSensorData)

    const wrapper = mount(KpiSection, {
      global: {
        plugins: [pinia, vuetify],
        components: {
          'KpiCard': KpiCard
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Verificar que se muestra el último dato (temperatura 23)
    expect(wrapper.text()).toContain('23°C')
    expect(wrapper.text()).toContain('64%')
  })

  it('debe manejar correctamente datos vacíos', async () => {
    // Mock del store con datos vacíos
    const mockEmptyData = []
    const store = useSensorStore(pinia)
    store.temperatureHumidityData.value = mockEmptyData
    vi.spyOn(store.temperatureHumidityData, 'value', 'get').mockReturnValue(mockEmptyData)

    const wrapper = mount(KpiSection, {
      global: {
        plugins: [pinia, vuetify],
        components: {
          'KpiCard': KpiCard
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Verificar que muestra el mensaje de carga
    expect(wrapper.text()).toContain('Cargando datos de sensores')
  })

  it('debe ignorar items con fecha inválida', async () => {
    // Mock con datos inválidos
    const mockInvalidData = [
      { 
        temperatura: 23, 
        humedad: 64, 
        dew_point: 16, 
        received_at: '2025-04-06T22:05:00Z',
        sensor_id: { id: 'temhum2', name: 'Secundario' }
      },
      { 
        temperatura: 22, 
        humedad: 65, 
        dew_point: 15, 
        received_at: 'fecha-invalida',
        sensor_id: { id: 'temhum1', name: 'Principal' }
      }
    ]
    const store = useSensorStore(pinia)
    store.temperatureHumidityData.value = mockInvalidData
    vi.spyOn(store.temperatureHumidityData, 'value', 'get').mockReturnValue(mockInvalidData)

    const wrapper = mount(KpiSection, {
      global: {
        plugins: [pinia, vuetify],
        components: {
          'KpiCard': KpiCard
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Debería mostrar el segundo item (el válido)
    expect(wrapper.text()).toContain('23°C')
    expect(wrapper.text()).not.toContain('22°C')
  })

  it('debe mostrar valores numéricos con precisión exacta', async () => {
    const mockPrecisionData = [
      { 
        temperatura: 22.37, 
        humedad: 65.12, 
        dew_point: 15.84, 
        received_at: '2025-04-06T22:10:00Z',
        sensor_id: { id: 'temhum2', name: 'Secundario' }
      }
    ]
    const store = useSensorStore(pinia)
    store.temperatureHumidityData.value = mockPrecisionData
    vi.spyOn(store.temperatureHumidityData, 'value', 'get').mockReturnValue(mockPrecisionData)

    const wrapper = mount(KpiSection, {
      global: {
        plugins: [pinia, vuetify],
        components: {
          'KpiCard': KpiCard
        }
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('22.37°C')
    expect(wrapper.text()).toContain('65.12%')
    expect(wrapper.text()).toContain('15.84°C')
  })

  it('debe formatear correctamente las fechas', async () => {
    const mockDateData = [
      { 
        temperatura: 22, 
        humedad: 65, 
        dew_point: 15, 
        received_at: '2025-04-06T22:15:00Z',
        sensor_id: { id: 'temhum2', name: 'Secundario' }
      }
    ]
    const store = useSensorStore(pinia)
    store.temperatureHumidityData.value = mockDateData
    vi.spyOn(store.temperatureHumidityData, 'value', 'get').mockReturnValue(mockDateData)

    const wrapper = mount(KpiSection, {
      global: {
        plugins: [pinia, vuetify],
        components: {
          'KpiCard': KpiCard
        }
      }
    })

    await wrapper.vm.$nextTick()

    // Verificar que la fecha se muestra en formato local
    expect(wrapper.findComponent(KpiCard).props('timestamp'))
      .toMatch(/2025|22:15/)
  })
})
