import { ref, onMounted, onUnmounted } from 'vue'

export function useTimeLogic() {
  const currentTime = ref(new Date())
  const isDaytime = ref(false)

  const updateTime = () => {
    currentTime.value = new Date()
    const hours = currentTime.value.getHours()
    isDaytime.value = hours >= 6 && hours < 20 // 6am-8pm es considerado día
  }

  onMounted(() => {
    updateTime()
    const interval = setInterval(updateTime, 60000) // Actualizar cada minuto
    onUnmounted(() => clearInterval(interval))
  })

  return {
    currentTime,
    isDaytime
  }
}
