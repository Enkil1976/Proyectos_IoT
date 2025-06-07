<template>
  <div ref="chartContainer" style="width: 100%; height: 100%">
    <apexchart
      v-if="isReady && hasData"
      type="line"
      height="350"
      :options="chartOptions"
      :series="series"
    />
    <v-alert v-if="isReady && !hasData" type="warning" class="ma-2">
      No hay datos de calidad de agua disponibles
    </v-alert>
    <v-alert v-if="!isReady" type="info" class="ma-2" title="Cargando">
      Cargando datos de calidad de agua...
      <template #append>
        <v-progress-circular indeterminate color="primary" size="24" width="2" />
      </template>
    </v-alert>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useSensorStore } from '@/stores/sensorStore'
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'WaterQualityChart',
  components: {
    apexchart: VueApexCharts
  },
  setup() {
    const sensorStore = useSensorStore()
    
    const chartContainer = ref(null)
    const isReady = ref(false)
    const hasData = computed(() => series.value.some(s => s.data.length > 0))

    const series = ref([
      { name: 'pH', data: [] },
      { name: 'PPM', data: [] }
    ])

    const chartOptions = ref({
      chart: {
        id: 'water-quality-chart',
        animations: { enabled: true },
        toolbar: { show: true },
        zoom: { enabled: true }
      },
      stroke: { curve: 'smooth', width: 2 },
      markers: { size: 4 },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false,
          format: 'HH:mm',
          formatter: function(value) {
            const date = new Date(value)
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
          },
          style: {
            fontSize: '12px',
            colors: '#333',
            fontWeight: 'bold'
          }
        },
        axisBorder: {
          show: true,
          color: '#78909C',
          height: 2
        },
        axisTicks: {
          show: true,
          color: '#78909C',
          height: 6
        }
      },
      yaxis: [
        {
          title: { text: 'pH' },
          min: 0,
          max: 14,
          labels: {
            formatter: (value) => value.toFixed(1),
            style: {
              colors: ['#333'],
              fontSize: '12px'
            }
          }
        },
        {
          opposite: true,
          title: { text: 'PPM' },
          min: 0,
          labels: {
            formatter: (value) => value.toFixed(0),
            style: {
              colors: ['#333'],
              fontSize: '12px'
            }
          }
        }
      ],
      tooltip: {
        shared: true,
        x: { 
          format: 'HH:mm',
          formatter: function(value) {
            const date = new Date(value)
            return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
          }
        }
      },
      grid: {
        show: true,
        borderColor: '#e0e0e0',
        strokeDashArray: 4,
        position: 'back',
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px',
        markers: {
          width: 12,
          height: 12,
          radius: 6
        },
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      }
    })

    const processWaterData = (chartData) => {
      if (!chartData) {
        console.warn('[WaterQualityChart] Datos no definidos')
        return []
      }

      console.log('[WaterQualityChart] Datos recibidos:', chartData)
      
      if (chartData.data && Array.isArray(chartData.data)) {
        return chartData.data.map(item => ({
          x: new Date(item.time).getTime(),
          y1: parseFloat(item.ph),
          y2: parseFloat(item.ppm)
        }))
      }

      console.warn('[WaterQualityChart] Formato de datos no reconocido:', chartData)
      return []
    }

    const updateChartData = async () => {
      try {
        console.groupCollapsed('[WaterQualityChart] Actualizando datos...')
        console.log('[WaterQualityChart] Llamando a fetchWaterQualityChart...')
        await sensorStore.fetchWaterQualityChart()
        
        if (!sensorStore.waterQualityChartData) {
          console.warn('[WaterQualityChart] Store vacío - no hay datos disponibles')
          console.groupEnd()
          return
        }

        console.log('[WaterQualityChart] Datos del store:', sensorStore.waterQualityChartData)
        const processedData = processWaterData(sensorStore.waterQualityChartData)
        console.log('[WaterQualityChart] Datos procesados:', processedData)

        if (!processedData || processedData.length === 0) {
          console.warn('[WaterQualityChart] Datos procesados vacíos o inválidos')
          console.groupEnd()
          return
        }

        console.log('[WaterQualityChart] Actualizando series del gráfico...')
        series.value = [
          { 
            name: 'pH', 
            data: processedData.map(p => ({x: p.x, y: p.y1}))
          },
          { 
            name: 'PPM', 
            data: processedData.map(p => ({x: p.x, y: p.y2}))
          }
        ]
        console.log('[WaterQualityChart] Series actualizadas:', series.value)
        console.log('[WaterQualityChart] Actualización completada')
        console.groupEnd()
      } catch (error) {
        console.error('[WaterQualityChart] Error al cargar datos:', error)
        console.groupEnd()
      }
    }

    let intervalId = null
    let observer = null

    onMounted(() => {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            isReady.value = true
            updateChartData()
            intervalId = setInterval(updateChartData, 300000)
            observer.disconnect()
          }
        })
      }, { threshold: 0.1 })

      if (chartContainer.value) {
        setTimeout(() => observer.observe(chartContainer.value), 100)
      }
    })

    onBeforeUnmount(() => {
      if (intervalId) clearInterval(intervalId)
      if (observer) observer.disconnect()
    })

    return { chartContainer, isReady, hasData, series, chartOptions }
  }
}
</script>
