import { ref, onMounted, onUnmounted } from 'vue'
import { useSensorStore } from '@/stores/sensorStore'

export function useSensorData(interval = 5000) {
  const store = useSensorStore()
  const intervalId = ref(null)
  
  const fetchData = async () => {
    try {
      await store.fetchTemperatureHumidityData()
    } catch (error) {
      console.error('Error fetching sensor data:', error)
    }
  }

  onMounted(() => {
    fetchData()
    intervalId.value = setInterval(fetchData, interval)
  })

  onUnmounted(() => {
    clearInterval(intervalId.value)
  })

  return {
    temperatureHumidityData: store.temperatureHumidityData,
    loading: store.loading,
    error: store.error
  }
}


export function useWaterQualityData(interval = 5000) {
  const store = useSensorStore()
  const intervalId = ref(null)
  
  const fetchData = async () => {
    try {
      await store.fetchWaterQualityData()
    } catch (error) {
      console.error('Error fetching water quality data:', error)
    }
  }

  onMounted(() => {
    fetchData()
    intervalId.value = setInterval(fetchData, interval)
  })

  onUnmounted(() => {
    clearInterval(intervalId.value)
  })

  return {
    waterQualityData: store.waterQualityData,
    loading: store.loading,
    error: store.error
  }
}
