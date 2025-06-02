import { mount, flushPromises } from '@vue/test-utils'
import DashboardCharts from '../DashboardCharts.vue'
import { vi } from 'vitest'
import axios from 'axios'

vi.mock('axios')
vi.mock('vue3-apexcharts', () => ({
  default: {
    render: () => null,
    props: ['options', 'series']
  }
}))

describe('DashboardCharts', () => {
  it('renders dashboard container', async () => {
    const wrapper = mount(DashboardCharts)
    expect(wrapper.find('[data-test="dashboard-container"]').exists()).toBe(true)
    expect(wrapper.vm.charts).toBeDefined()
  })

  it('loads sensor data', async () => {
    // Clear any previous mock calls first
    axios.get.mockClear()

    // Setup mock responses that match component expectations
    axios.get.mockImplementation(url => {
      console.log('Mock axios call to:', url)
      if (url.includes('calidad-agua')) {
        return Promise.resolve({ data: { value: 6.8 } })
      }
      if (url.includes('luxometro')) {
        return Promise.resolve({ data: { value: 12000 } })
      }
      if (url.includes('temhum1') || url.includes('temhum2')) {
        return Promise.resolve({ 
          data: { 
            value: 25.1
          } 
        })
      }
      return Promise.reject(new Error('Invalid URL'))
    })

    // Mount component with stubs for child components
    const wrapper = mount(DashboardCharts, {
      global: {
        stubs: ['ApexChart']
      }
    })
    await flushPromises()

    expect(axios.get).toHaveBeenCalledTimes(4)
    expect(axios.get).toHaveBeenCalledWith('/api/calidad-agua')
    expect(axios.get).toHaveBeenCalledWith('/api/luxometro')
    expect(axios.get).toHaveBeenCalledWith('/api/temhum1')
    expect(axios.get).toHaveBeenCalledWith('/api/temhum2')
    
    // Verify charts data structure
    expect(wrapper.vm.charts).toHaveProperty('calidad-agua')
    expect(wrapper.vm.charts).toHaveProperty('luxometro')
    expect(wrapper.vm.charts).toHaveProperty('temhum1')
    expect(wrapper.vm.charts).toHaveProperty('temhum2')
  })
})
