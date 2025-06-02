import { mount } from '@vue/test-utils'
import EnvironmentChart from '../EnvironmentChart.vue'
import { vi } from 'vitest'
import axios from 'axios'

vi.mock('axios')

describe('EnvironmentChart', () => {
  it('displays environment data', async () => {
    const testData = {
      temperature: 25,
      humidity: 60,
      dewPoint: 18
    }

    axios.get.mockResolvedValue({ 
      data: testData
    })

    const wrapper = mount(EnvironmentChart, {
      global: {
        mocks: {
          $t: (msg) => msg === 'noData' ? 'Datos no disponibles' : msg
        }
      }
    })

    // Esperar a que se complete la carga
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    
    // Verificar que los datos se muestren correctamente
    const sensorData = wrapper.find('.sensor-data')
    expect(sensorData.exists()).toBe(true)
    
    const dataRows = sensorData.findAll('.data-row')
    expect(dataRows.length).toBe(3)
    
    const tempValue = dataRows[0].find('.value')
    const humValue = dataRows[1].find('.value')
    expect(tempValue.exists()).toBe(true)
    expect(humValue.exists()).toBe(true)
    expect(tempValue.text()).toContain('25')
    expect(humValue.text()).toContain('60')
  })

  it('handles missing data', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'))

    const wrapper = mount(EnvironmentChart, {
      global: {
        mocks: {
          $t: (msg) => msg === 'noData' ? 'Datos no disponibles' : msg
        }
      }
    })

    // Esperar a que se complete la carga
    await new Promise(resolve => setTimeout(resolve, 100))
    await wrapper.vm.$nextTick()
    const errorMsg = wrapper.find('.error')
    expect(errorMsg.exists()).toBe(true)
    expect(errorMsg.text()).toBe('Datos no disponibles')
  })
})
