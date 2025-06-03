<template>
  <div>
    <apexchart
      v-if="loaded"
      :key="chartKey"
      type="bar"
      height="350"
      :options="chartOptions"
      :series="series"
    />
    <div v-else class="text-center pa-4">
      Cargando datos de calidad de agua...
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

export default defineComponent({
  name: 'WaterQualityChart',
  components: {
    apexchart: VueApexCharts
  },
  props: {
    ph: {
      type: Number,
      default: 6.0
    },
    ec: {
      type: Number,
      default: 3.0
    },
    ppm: {
      type: Number,
      default: 1500
    }
  },
  data() {
    return {
      chartKey: 0,
      loaded: false,
      series: [{
        name: 'Valor Actual',
        data: [this.ph || 0, this.ec || 0, this.ppm || 0]
      }, {
        name: 'Rango Óptimo',
        data: [6.5, 3.5, 1750],
        type: 'line'
      }],
      chartOptions: {
        chart: {
          type: 'bar',
          height: 350
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
            endingShape: 'rounded'
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: ['pH', 'EC (mS/cm)', 'PPM'],
        },
        yaxis: {
          title: {
            text: 'Valores'
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val.toFixed(2)
            }
          }
        }
      }
    }
  },
  watch: {
    ph: {
      immediate: true,
      handler(newVal) {
        this.updateChartData()
      }
    },
    ec: {
      immediate: true,
      handler(newVal) {
        this.updateChartData()
      }
    },
    ppm: {
      immediate: true,
      handler(newVal) {
        this.updateChartData()
      }
    }
  },
  methods: {
    updateChartData() {
      // Usar JSON.parse/stringify para crear nuevo objeto reactivo
      this.series = JSON.parse(JSON.stringify([
        {
          name: 'Valor Actual',
          data: [parseFloat(this.ph), parseFloat(this.ec), parseInt(this.ppm)]
        },
        {
          name: 'Rango Óptimo',
          data: [6.5, 3.5, 1750],
          type: 'line'
        }
      ]));
      this.loaded = true;
      
      // Forzar actualización del gráfico
      this.chartKey = Date.now();
    }
  },
  mounted() {
    this.updateChartData()
  }
})
</script>
