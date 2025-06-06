<template>
  <apexchart
    type="line"
    height="350"
    :options="chartOptions"
    :series="series"
  />
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useSensorStore } from '@/stores/sensorStore'
import VueApexCharts from 'vue3-apexcharts'

export default {
  name: 'TemperatureHumidityChart',
  components: {
    apexchart: VueApexCharts
  },
  setup() {
    const sensorStore = useSensorStore()
    const series = ref([
      { name: 'Temperatura (°C)', data: [] },
      { name: 'Humedad (%)', data: [] }
    ])

    const chartOptions = ref({
      chart: {
        id: 'historical-temp-hum-chart',
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
          format: 'HH:mm'
        }
      },
      yaxis: [
        {
          title: { text: 'Temperatura (°C)' },
          min: 0,
          max: 40,
          labels: {
            formatter: (value) => value.toFixed(1)
          }
        },
        {
          opposite: true,
          title: { text: 'Humedad (%)' },
          min: 0,
          max: 100,
          labels: {
            formatter: (value) => value.toFixed(1)
          }
        }
      ],
      tooltip: {
        shared: true,
        x: { format: 'dd MMM HH:mm' },
        y: {
          formatter: (value) => value.toFixed(1)
        }
      }
    })

    let intervalId = null

    const processHistoricalData = (chartData) => {
      console.log('Procesando chartData:', chartData)
      
      // Manejar caso donde chartData es directamente el array de datos
      if (Array.isArray(chartData)) {
        return chartData.map(item => ({
          x: new Date(item.time).getTime(),
          y: item.temperatura,
          y2: item.humedad
        }))
      }
      
      // Manejar caso donde los datos están en propiedad 'data'
      if (chartData?.data && Array.isArray(chartData.data)) {
        return chartData.data.map(item => ({
          x: new Date(item.time).getTime(),
          y: item.temperatura,
          y2: item.humedad
        }))
      }

      console.error('Formato de datos no reconocido:', chartData)
      return []
    }

    const updateChartData = async () => {
      try {
        console.log('Iniciando carga de datos...')
        await sensorStore.fetchAmbientalChart1()
        await sensorStore.fetchAmbientalChart2()

        console.log('Datos del store:', {
          chart1: sensorStore.ambientalChart1,
          chart2: sensorStore.ambientalChart2
        })

        // Manejar caso donde los datos son undefined
        const chart1Data = sensorStore.ambientalChart1 || []
        const chart2Data = sensorStore.ambientalChart2 || []

        const data1 = processHistoricalData(chart1Data)
        const data2 = processHistoricalData(chart2Data)
        const allData = [...data1, ...data2]

        console.log('Datos procesados:', {
          data1: data1,
          data2: data2,
          combined: allData
        })

        if (allData.length === 0) {
          console.warn('No hay datos válidos para mostrar')
          // Mostrar datos de ejemplo más completos
          const now = new Date()
          const demoData = []
          // Generar 24 puntos de datos de ejemplo (una por hora)
          for (let i = 0; i < 24; i++) {
            const time = new Date(now)
            time.setHours(now.getHours() - i)
            demoData.push({
              x: time.getTime(),
              y: 18 + Math.sin(i/3) * 5, // Temperatura fluctuante
              y2: 60 + Math.cos(i/2) * 10 // Humedad fluctuante
            })
          }
          series.value = [
            { name: 'Temperatura (°C)', data: demoData.map(d => ({x: d.x, y: d.y})) },
            { name: 'Humedad (%)', data: demoData.map(d => ({x: d.x, y: d.y2})) }
          ]
          return
        }

        series.value = [
          {
            name: 'Temperatura (°C)',
            data: allData.map(d => ({ x: d.x, y: d.y }))
          },
          {
            name: 'Humedad (%)',
            data: allData.map(d => ({ x: d.x, y: d.y2 }))
          }
        ]
      } catch (error) {
        console.error('Error al cargar datos históricos:', error)
      }
    }

    onMounted(() => {
      updateChartData()
      intervalId = setInterval(updateChartData, 300000)
    })

    onBeforeUnmount(() => {
      if (intervalId) clearInterval(intervalId)
    })

    return { series, chartOptions }
  }
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  margin: 20px 0;
  min-height: 350px;
}
</style>
