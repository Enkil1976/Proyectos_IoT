import { computed } from 'vue'

function formatKpiValue(value, title) {
  if (value === null || value === undefined || value === '--') return '--'

  const val = typeof value === 'string' ? parseFloat(value) : value

  if (typeof val === 'number' && !isNaN(val)) {
    if (title?.toLowerCase().includes('conductividad')) return `${val.toFixed(2)} µS/cm`
    if (title?.toLowerCase().includes('ppm')) return `${val} ppm`
    if (title?.toLowerCase().includes('ph')) return val.toFixed(1)
    return val.toFixed(1)
  }

  return value
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d.getTime())
}

export const useKpiLogic = (props) => {
  // Log inicial para trazabilidad
  console.debug('[KPI LOGIC] Props recibidas:', props)

  const formattedValue = computed(() => formatKpiValue(props.value, props.title))

  const valueColor = computed(() => {
    return props.statusColor === 'grey' ? 'grey darken-2' : 'white'
  })

  const statusMessage = computed(() => {
    if (props.statusText) return props.statusText
    switch (props.statusColor) {
      case 'green': return 'Estado óptimo'
      case 'orange': return 'Atención requerida'
      case 'red': return 'Alerta crítica'
      default: return 'Sin datos'
    }
  })

  const formattedTimestamp = computed(() => {
    const raw = props.timestamp

    // Si viene como texto legible, úsalo
    if (typeof raw === 'string' && !raw.includes('T') && !raw.includes('Z') && isNaN(Date.parse(raw))) {
      return raw
    }

    try {
      const date = new Date(raw)
      if (!isValidDate(date)) {
        console.warn('Fecha inválida (no ISO):', raw)
        return 'Hora no disponible'
      }

      const options = {
        timeZone: 'America/Santiago',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
      return date.toLocaleTimeString('es-CL', options)
    } catch (e) {
      console.error('Error formateando fecha:', e)
      return 'Hora no disponible'
    }
  })

  const normalizationRules = {
    'humedad': v => Math.min(100, Math.max(0, v)),
    'temperatura': v => Math.min(100, Math.max(0, (v / 40) * 100)),
    'punto rocío': v => Math.min(100, Math.max(0, (v / 30) * 100)),
    'conductividad': v => Math.min(100, Math.max(0, (v / 2000) * 100)),
    'ppm': v => Math.min(100, Math.max(0, (v / 1000) * 100)),
    'ph': v => {
      if (typeof v !== 'number' || isNaN(v)) return 50
      return (v / 14) * 100
    }
  }

  const normalizedTrendValue = computed(() => {
    if (props.trendValue !== undefined && props.trendValue !== null) return props.trendValue

    let numValue = typeof props.value === 'string' ? parseFloat(props.value) : props.value
    if (isNaN(numValue)) return 50

    for (const key in normalizationRules) {
      if (props.title?.toLowerCase().includes(key)) {
        return normalizationRules[key](numValue)
      }
    }

    return 50
  })

  const computedTrendColor = computed(() => {
    if (props.trendColor) return props.trendColor

    switch (props.statusColor) {
      case 'green': return 'yellow accent-2'
      case 'orange': return 'blue lighten-1'
      case 'red': return 'cyan accent-2'
      default: return 'white'
    }
  })

  const showProgress = computed(() => {
    return props.variant !== 'compact' && props.value !== undefined && props.value !== '--'
  })

  return {
    formattedValue,
    valueColor,
    statusMessage,
    formattedTimestamp,
    normalizedTrendValue,
    computedTrendColor,
    showProgress
  }
}
