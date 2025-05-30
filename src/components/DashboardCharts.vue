<template>
  <div class="dashboard-charts">
    <h2>Dashboard Sensores IoT</h2>
    <div class="charts-grid">
      <div v-for="(chart, key) in charts" :key="key" class="chart-box">
        <h3>{{ chart.title }}</h3>
        <div class="multi-metrics horizontal-metrics">
          <div v-for="(metric, idx) in chart.metrics" :key="idx" class="mini-card metric-box">
            <VueApexCharts
              width="160"
              height="160"
              type="radialBar"
              :options="{...metric.options, theme: { mode: 'dark' }}"
              :series="metric.series"
            />
            <div class="metric-label">
              {{ metric.label }}
            </div>
            <div class="metric-value">
              {{ metric.series[0] }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, defineExpose } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { connectMQTT, disconnectMQTT } from '../mqtt';

// Registrar el componente localmente
const components = { VueApexCharts };
defineExpose({ components });

const topics = [
  { topic: 'Invernadero/Agua/data', title: 'Calidad del Agua' },
  { topic: 'Invernadero/Luxometro/data', title: 'Luxómetro (Luz)' },
  { topic: 'Invernadero/TemHum/data', title: 'Temperatura/Humedad 1' },
  { topic: 'Invernadero/TemHum2/data', title: 'Temperatura/Humedad 2' }
];

const charts = reactive({});

// Inicializar la estructura de cada gráfico
for (const { topic, title } of topics) {
  charts[topic] = {
    title,
    metrics: [
      {
        label: title,
        series: [0],
        options: {
          chart: {
            id: topic,
            type: 'radialBar',
            animations: { enabled: true }
          },
          plotOptions: {
            radialBar: {
              hollow: { size: '70%' },
              dataLabels: {
                name: { show: true },
                value: {
                  show: true,
                  fontSize: '22px',
                  formatter: v => (v !== undefined && v !== null ? Number(v).toFixed(2) : '0.00')
                }
              }
            }
          },
          fill: {
            type: 'gradient',
            gradient: {
              shade: 'dark',
              type: 'horizontal',
              shadeIntensity: 0.5,
              gradientToColors: ['#ABE5A1', '#FEB019', '#FF4560', '#775DD0'],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          labels: [title]
        }
      }
    ]
  };
}

let client = null;

onMounted(() => {
  client = connectMQTT({
    topics: topics.map(t => t.topic),
    onMessage: (t, msg) => {
      try {
        // Intentar parsear JSON, si no es posible, usar valor directo
        let value;
        try {
          const parsed = JSON.parse(msg);
          if (typeof parsed === 'object' && parsed.value !== undefined) {
            value = parsed.value;
          } else {
            value = parsed;
          }
        } catch {
          value = parseFloat(msg);
        }
        if (charts[t]) {
          // Si el mensaje es un objeto con varias métricas
          if (typeof value === 'object' && value !== null) {
            charts[t].metrics = [];
            for (const [k, v] of Object.entries(value)) {
              if (typeof v === 'number' && k !== 'heatIndex') {
                // Colores de acento por métrica
                const accentMap = {
                  EC: ['#005bea', '#00c6fb'], // azul
                  PPM: ['#43e97b', '#38f9d7'], // verde
                  PH: ['#00eaff', '#00c6fb'], // cyan
                  lux: ['#ffe259', '#ffa751'], // amarillo
                  temperatura: ['#ff5858', '#f09819'], // rojo
                  humedad: ['#43e97b', '#38f9d7'], // verde claro
                  dewPoint: ['#8fd3f4', '#84fab0'], // azul-verde
                };
                const gradColors = accentMap[k] || ['#8fc2ff', '#775DD0'];
                charts[t].metrics.push({
                  label: k,
                  series: [v],
                  options: {
                    chart: {
                      id: `${t}_${k}`,
                      type: 'radialBar',
                      animations: { enabled: true }
                    },
                    plotOptions: {
                      radialBar: {
                        hollow: { size: '60%' },
                        track: {
                          background: '#23283b',
                          strokeWidth: '100%',
                          margin: 8,
                        },
                        dataLabels: {
                          name: {
                            show: true,
                            fontSize: '1.2em',
                            fontWeight: 700,
                            color: gradColors[0],
                            offsetY: 18
                          },
                          value: {
                            show: true,
                            fontSize: '2.3em',
                            fontWeight: 800,
                            color: '#fff',
                            offsetY: -18,
                            formatter: val => (val !== undefined && val !== null ? Number(val).toFixed(2) : '0.00')
                          }
                        }
                      }
                    },
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shade: 'dark',
                        type: 'horizontal',
                        shadeIntensity: 0.7,
                        gradientToColors: gradColors,
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 100]
                      }
                    },
                    labels: [k]
                  }
                });
              }
            }
          } else if (!isNaN(value)) {
            charts[t].metrics = [{
              label: charts[t].title,
              series: [Number(value)],
              options: charts[t].metrics[0].options
            }];
          } else {
            charts[t].metrics = [{
              label: charts[t].title,
              series: [0],
              options: charts[t].metrics[0].options
            }];
          }
        }
      } catch (e) {
        console.warn('Error procesando mensaje MQTT:', t, msg, e);
      }
    },
  });
});

onUnmounted(() => {
  disconnectMQTT();
});
</script>

<style scoped>
html, body {
  background: #181c24 !important;
  color: #f6f6f6;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
}

.dashboard-charts {
  max-width: 1200px;
  margin: 0 auto;
  background: #181c24;
  color: #f6f6f6;
  min-height: 100vh;
  padding-bottom: 2rem;
}
.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 98vw;
  max-width: 1200px;
  margin: 0 auto;
  align-items: center;
}
.chart-box {
  width: 100%;
  max-width: 900px;
  background: #232837;
  border-radius: 18px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.22);
  padding: 2.2rem 2rem 1.5rem 2rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid #232837;
}
.chart-box h3 {
  color: #fff;
  font-size: 1.5em;
  font-weight: 700;
  margin-bottom: 1.5rem;
  letter-spacing: 0.01em;
}
.multi-metrics {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: stretch;
  overflow-x: auto;
  width: 100%;
  padding-bottom: 0.5rem;
  justify-content: center;
}
.mini-card {
  background: #242b3d;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.16);
  padding: 1.2rem 1rem 1rem 1rem;
  min-width: 180px;
  max-width: 210px;
  flex: 0 0 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #252c3e;
  margin-bottom: 0.5rem;
}
.metric-label {
  color: #8fc2ff;
  font-size: 1.1em;
  font-weight: 600;
  margin-top: 0.5rem;
  margin-bottom: 0.2rem;
  text-align: center;
  letter-spacing: 0.01em;
}
.metric-value {
  color: #fff;
  font-size: 2.1em;
  font-weight: 700;
  margin-bottom: 0.2rem;
  text-align: center;
  letter-spacing: 0.01em;
}
.vertical-metrics {
  flex-direction: column;
}
.horizontal-metrics {
  flex-direction: row;
}
</style>
