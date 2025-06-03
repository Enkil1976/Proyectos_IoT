import { mount } from '@vue/test-utils'
import WaterQualityChart from '../WaterQualityChart.vue'
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock para vue3-apexcharts
vi.mock('vue3-apexcharts', () => ({
  default: {
    template: '<div class="apexcharts-mock"></div>',
    methods: {
      updateSeries: vi.fn()
    }
  }
}))

describe('WaterQualityChart', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(WaterQualityChart, {
      props: {
        ph: 6.0,
        ec: 1.5,
        ppm: 1000
      },
      global: {
        stubs: {
          apexchart: true
        }
      }
    })
  })

  it('should initialize with default values', () => {
    expect(wrapper.vm.series).toEqual([
      {
        name: 'Valor Actual',
        data: [6.0, 1.5, 1000]
      },
      {
        name: 'Rango Óptimo',
        data: [6.5, 3.5, 1750],
        type: 'line'
      }
    ])
  })

  it('should update chart data when props change', async () => {
    await wrapper.setProps({
      ph: 7.0,
      ec: 2.0,
      ppm: 1500
    })

    expect(wrapper.vm.series[0].data).toEqual([7.0, 2.0, 1500])
    expect(wrapper.vm.chartKey).toBeGreaterThan(0)
  })

  it('should handle invalid number values', async () => {
    await wrapper.setProps({
      ph: 'invalid',
      ec: null,
      ppm: undefined
    })

    expect(wrapper.vm.series[0].data).toEqual([null, null, 1500])
  })

  it('should force chart update with new key', async () => {
    const initialKey = wrapper.vm.chartKey
    await wrapper.vm.updateChartData()
    expect(wrapper.vm.chartKey).not.toBe(initialKey)
  })
})
