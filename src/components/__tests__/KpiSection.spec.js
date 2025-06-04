import { mount } from '@vue/test-utils'
import KpiSection from '../NewDashboard/KpiSection.vue'
import { useSensorStore } from '@/stores/sensorStore'
import { createPinia } from 'pinia'
import { vuetify } from '../../../test-setup'

// Mock de componentes Vuetify
jest.mock('vuetify/components', () => ({
  VCard: {
    template: '<div class="v-card-mock"><slot /></div>'
  },
  VCardText: {
    template: '<div class="v-card-text-mock"><slot /></div>'
  },
  VProgressLinear: {
    template: '<div class="v-progress-linear-mock"><slot /></div>'
  }
}))

// Mock de KpiCard
jest.mock('../NewDashboard/KpiCard.vue', () => ({
  template: '<div class="kpi-card-mock">{{ title }}: {{ value }}</div>',
  props: ['title', 'value', 'icon', 'statusColor', 'statusText', 'timestamp']
}))

// Mocks
jest.mock('@/composables/useStatusLogic', () => ({
  useStatusLogic: () => ({
    getTemperatureStatus: () => ({ color: 'green', status: 'OK' }),
    getHumidityStatus: () => ({ color: 'blue', status: 'OK' }),
    getDewPointStatus: () => ({ color: 'gray', status: 'OK' })
  })
}))

describe('KpiSection', () => {
  let wrapper
  let store

  beforeEach(() => {
    const pinia = createPinia()
    
    store = useSensorStore(pinia)
    store.temperatureHumidityData = [
      {
        id: 1,
        sensor_id: { id: 'temhum1', name: 'Principal' },
        temperatura: 24.5,
        humedad: 65,
        dew_point: 18.2,
        received_at: new Date().toISOString()
      },
      {
        id: 2,
        sensor_id: { id: 'temhum2', name: 'Secundario' },
        temperatura: 23.8,
        humedad: 62,
        dew_point: 17.5,
        received_at: new Date().toISOString()
      }
    ]

    wrapper = mount(KpiSection, {
      global: {
        plugins: [pinia, vuetify]
      }
    })
  })

  it('muestra correctamente los nombres de los sensores', async () => {
    const cards = wrapper.findAllComponents({ name: 'KpiCard' })
    
    // Verificar que se muestren los 6 KPI cards (3 métricas x 2 sensores)
    expect(cards.length).toBe(6)
    
    // Verificar los títulos para el sensor 1
    expect(cards[0].props('title')).toBe('Temperatura (Principal temhum1)')
    expect(cards[1].props('title')).toBe('Humedad (Principal temhum1)')
    expect(cards[2].props('title')).toBe('Punto Rocío (Principal temhum1)')
    
    // Verificar los títulos para el sensor 2
    expect(cards[3].props('title')).toBe('Temperatura (Secundario temhum2)')
    expect(cards[4].props('title')).toBe('Humedad (Secundario temhum2)')
    expect(cards[5].props('title')).toBe('Punto Rocío (Secundario temhum2)')
  })

  it('muestra los valores correctos de los sensores', async () => {
    const cards = wrapper.findAllComponents({ name: 'KpiCard' })
    
    // Verificar valores del sensor 1
    expect(cards[0].props('value')).toBe('24.5°C')
    expect(cards[1].props('value')).toBe('65%')
    expect(cards[2].props('value')).toBe('18.2°C')
    
    // Verificar valores del sensor 2
    expect(cards[3].props('value')).toBe('23.8°C')
    expect(cards[4].props('value')).toBe('62%')
    expect(cards[5].props('value')).toBe('17.5°C')
  })
})
