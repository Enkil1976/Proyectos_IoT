import { computed } from 'vue'
import { useTimeLogic } from './useTimeLogic'

export function useStatusLogic() {
  const { isDaytime } = useTimeLogic()

  const getStatusColor = (value, min, max, optimalMin, optimalMax) => {
    if (value === null || value === undefined) return 'grey'
    
    if (value < min || value > max) return 'red'
    if (value < optimalMin || value > optimalMax) return 'orange'
    return 'green'
  }

  const getTemperatureStatus = (value) => {
    if (value === null || value === undefined) return { color: 'grey', status: 'Sin datos' }
    
    const ranges = isDaytime.value 
      ? { min: 16, max: 22, optimalMin: 18, optimalMax: 20 }
      : { min: 10, max: 16, optimalMin: 12, optimalMax: 14 }
    
    const color = getStatusColor(value, ranges.min, ranges.max, ranges.optimalMin, ranges.optimalMax)
    let status = 'Óptima'
    
    if (value < ranges.min) status = 'Baja'
    if (value > ranges.max) status = 'Alta'
    if (value < ranges.optimalMin) status = 'Baja'
    if (value > ranges.optimalMax) status = 'Alta'
    
    return { color, status }
  }

  const getHumidityStatus = (value) => {
    if (value === null || value === undefined) {
      return { color: 'grey', status: 'Sin datos' }
    }

    let color, status
    
    if (value < 45) {
      color = 'red'
      status = 'Muy baja'
    } else if (value < 55) {
      color = 'orange'
      status = 'Baja'
    } else if (value <= 67) {
      color = 'green'
      status = 'Óptima'
    } else if (value <= 70) {
      color = 'green'
      status = 'Óptima'
    } else if (value <= 80) {
      color = 'orange'
      status = 'Alta'
    } else {
      color = 'red'
      status = 'Muy alta'
    }
    
    return { color, status }
  }

  const getDewPointStatus = (temp, humidity) => {
    // Cálculo simplificado del punto de rocío
    const dewPoint = temp - ((100 - humidity) / 5)
    const diff = temp - dewPoint
    
    if (diff <= 1) return 'red'
    if (diff <= 2) return 'orange'
    return 'green'
  }

  const getWaterQualityStatus = (type, value) => {
    const ranges = {
      ph: { min: 5.5, max: 6.5, optimalMin: 5.8, optimalMax: 6.2 },
      ec: { min: 1.0, max: 1.5, optimalMin: 1.2, optimalMax: 1.4 },
      ppm: { min: 700, max: 900, optimalMin: 750, optimalMax: 850 }
    }
    return getStatusColor(value, ranges[type].min, ranges[type].max, 
                         ranges[type].optimalMin, ranges[type].optimalMax)
  }

  const getLightStatus = (lux) => {
    if (lux < 5000) return 'red'
    if (lux < 10000) return 'orange'
    return 'green'
  }

  return {
    getStatusColor,
    getTemperatureStatus: (value) => {
      const { color, status } = getTemperatureStatus(value)
      return { color, status }
    },
    getHumidityStatus: (value) => {
      const { color, status } = getHumidityStatus(value)
      return { color, status }
    },
    getDewPointStatus,
    getWaterQualityStatus,
    getLightStatus
  }
}
