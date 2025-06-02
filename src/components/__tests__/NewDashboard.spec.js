import { mount } from '@vue/test-utils'
import NewDashboard from '../NewDashboard.vue'
import { vuetify } from '../../../test-setup'

describe('NewDashboard', () => {
  it('renders correctly', () => {
    const wrapper = mount(NewDashboard, {
      global: {
        plugins: [vuetify]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays initial data', async () => {
    const wrapper = mount(NewDashboard)
    await wrapper.vm.$nextTick()
    
    // Debug: Mostrar HTML completo
    console.log(wrapper.html())
    
    const title = wrapper.find('[data-test="app-title"]')
    expect(title.exists()).toBe(true, 'Elemento con data-test="app-title" no encontrado')
    expect(title.isVisible()).toBe(true, 'El título no es visible')
    expect(title.text()).toContain('Invernadero IoT')
  })
})
