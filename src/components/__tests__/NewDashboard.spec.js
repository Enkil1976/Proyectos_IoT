import { mount } from '@vue/test-utils'
import NewDashboard from '../NewDashboard.vue'
import { vuetify } from '../../../test-setup'

describe('NewDashboard', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NewDashboard, {
      global: {
        plugins: [vuetify]
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays initial data', () => {
    const title = wrapper.find('[data-test="app-title"]')
    expect(title.text()).toContain('Invernadero IoT')
  })

  describe('Lógica de humedad', () => {
    const testCases = [
      { value: 63, expectedStatus: 'Óptima', expectedColor: 'green' },
      { value: 65, expectedStatus: 'Óptima', expectedColor: 'green' },
      { value: 55, expectedStatus: 'Baja', expectedColor: 'orange' },
      { value: 70, expectedStatus: 'Alta', expectedColor: 'orange' },
      { value: 45, expectedStatus: 'Muy baja', expectedColor: 'red' },
      { value: 80, expectedStatus: 'Muy alta', expectedColor: 'red' }
    ]

    testCases.forEach(({ value, expectedStatus, expectedColor }) => {
      it(`debe mostrar "${expectedStatus}" para humedad ${value}%`, async () => {
        await wrapper.setData({
          kpis: wrapper.vm.kpis.map(kpi => 
            kpi.name.includes('Humedad') 
              ? {...kpi, value}
              : kpi
          )
        })
        
        const statusText = wrapper.find('[data-test="status-text"]')
        expect(statusText.text()).toContain(expectedStatus)
        
        if (expectedColor === 'red' || expectedColor === 'orange') {
          expect(wrapper.vm.alerts.some(a => 
            a.color === expectedColor && 
            a.message.includes(expectedStatus)
          )).toBe(true)
        }
      })
    })
  })

  describe('Lógica de temperatura', () => {
    it('debe mostrar "Óptima" para temperatura diurna 18-20°C', async () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 
        new Date('2025-02-06T12:00:00').valueOf()
      )
      await wrapper.setData({
        kpis: wrapper.vm.kpis.map(kpi => 
          kpi.name.includes('Temperatura') 
            ? {...kpi, value: 19}
            : kpi
        )
      })
      const tempCard = wrapper.find('[data-test="temperature-card"]')
      expect(tempCard.text()).toContain('Óptima')
    })

    it('debe mostrar alerta naranja para temperatura nocturna <12°C', async () => {
      jest.spyOn(global.Date, 'now').mockImplementation(() => 
        new Date('2025-02-06T22:00:00').valueOf()
      )
      await wrapper.setData({
        kpis: wrapper.vm.kpis.map(kpi => 
          kpi.name.includes('Temperatura') 
            ? {...kpi, value: 11}
            : kpi
        )
      })
      expect(wrapper.vm.alerts.some(a => a.color === 'orange')).toBe(true)
    })
  })

  it('debe actualizar datos cada 5 segundos', () => {
    jest.useFakeTimers()
    const fetchSpy = jest.spyOn(wrapper.vm, 'fetchSensorData')
    jest.advanceTimersByTime(5000)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    jest.useRealTimers()
  })
})
