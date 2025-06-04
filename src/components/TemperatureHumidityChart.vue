<template>
      <ChartWrapper 
        :has-data="series && series[0] && series[0].data && series[0].data.length > 0"
        loading-message="Obteniendo lecturas de sensores..."
        loading-title="Cargando datos"
        no-data-message="No hay datos disponibles"
      >
    <apexchart
      type="line"
      height="350"
      :options="chartOptions"
      :series="series"
    />
  </ChartWrapper>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import ChartWrapper from '@/components/common/ChartWrapper.vue'
import { useSensorStore } from '@/stores/sensorStore'
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'TemperatureHumidityChart',
  components: {
    apexchart: VueApexCharts,
    ChartWrapper
  },
  setup() {
    const sensorStore = useSensorStore()
    const series = ref([
      {
        name: 'Temperatura',
        data: []
      },
      {
        name: 'Humedad',
        data: []
      },
      {
        name: 'Punto de Rocío',
        data: []
      }
    ])

    const chartOptions = ref({
      chart: {
        id: 'tem-hum-chart',
        animations: {
          enabled: true
        },
        toolbar: {
          show: true
        },
        zoom: {
          enabled: true
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      markers: {
        size: 0
      },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false
        }
      },
      yaxis: [
        {
          title: {
            text: 'Temperatura (°C)'
          },
          min: 0,
          max: 50
        },
        {
          opposite: true,
          title: {
            text: 'Humedad (%)'
          },
          min: 0,
          max: 100
        }
      ],
      tooltip: {
        shared: true,
        x: {
          format: 'dd MMM yyyy HH:mm:ss'
        }
      }
    })

    let intervalId = null

    const chartMounted = ref(false)
    const chartContainer = ref(null)
    const chartDiv = ref(null)

    onMounted(() => {
      // Usar setTimeout para asegurar que el DOM esté listo
      setTimeout(() => {
        updateChartData()
        intervalId = setInterval(updateChartData, 10000)
      }, 100)
    })

    onBeforeUnmount(() => {
      if (intervalId) clearInterval(intervalId)
    })

    const updateChartData = async () => {
      try {
        await sensorStore.fetchTemperatureHumidityData()
        
        if (!sensorStore.temperatureHumidityData || sensorStore.temperatureHumidityData.length === 0) {
          console.warn('No hay datos disponibles')
          return
        }
        
        // Mapear datos asegurando valores numéricos
        const mappedData = sensorStore.temperatureHumidityData
          .filter(item => item && item.received_at)
          .map(item => {
            const timestamp = new Date(item.received_at).getTime()
            return {
              x: isNaN(timestamp) ? Date.now() : timestamp,
              yTemperatura: Number(item.temperatura) || null,
              yHumedad: Number(item.humedad) || null,
              yDewPoint: Number(item.dew_point) || null
            }
          })
          .filter(item => item.yTemperatura !== null && item.yHumedad !== null)

        console.log('Datos mapeados:', mappedData);

        // Asignar series con datos validados
        series.value = [
          {
            name: 'Temperatura (°C)',
            data: mappedData.map(d => ({x: d.x, y: d.yTemperatura}))
          },
          {
            name: 'Humedad (%)',
            data: mappedData.map(d => ({x: d.x, y: d.yHumedad}))
          },
          {
            name: 'Punto de Rocío (°C)',
            data: mappedData.map(d => ({x: d.x, y: d.yDewPoint}))
          }
        ];

        console.log('Series configuradas:', series.value);
      } catch (error) {
        console.error('Error updating chart data:', error)
      }
    }

    return {
      series,
      chartOptions
    }
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  margin: 20px 0;
  min-height: 350px;
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 350px;
  font-size: 18px;
  color: #666;
}
</style>
