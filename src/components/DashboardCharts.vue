<template>
  <div class="dashboard-charts">
    <h2>Dashboard Sensores IoT</h2>
    <div class="charts-grid">
      <div v-for="key in Object.keys(charts)" :key="key" class="chart-box">
        <div class="chart-header">
          <h3>{{ charts[key].title }}</h3>
        </div>
        <div class="realtime-container">
          <div class="multi-metrics horizontal-metrics" style="display: flex; flex-direction: row; gap: 2rem; align-items: center; justify-content: center;">
            <div v-for="(metric, idx) in charts[key].metrics" :key="idx" class="mini-card metric-box">
              <VueApexCharts
                width="160"
                height="160"
                type="radialBar"
                :options="{
                  ...metric.options,
                  theme: { mode: 'dark' },
                  dataLabels: {
                    ...((metric.options && metric.options.dataLabels) || {}),
                    name: {
                      ...(metric.options && metric.options.dataLabels && metric.options.dataLabels.name ? metric.options.dataLabels.name : {}),
                      show: false,
                      style: {
                        ...(metric.options && metric.options.dataLabels && metric.options.dataLabels.name && metric.options.dataLabels.name.style ? metric.options.dataLabels.name.style : {}),
                        colors: ['#fff']
                      }
                    }
                  }
                }"
                :series="metric.series"
              />
              <div class="metric-info">
                <span class="metric-icon" :class="metric.label.toLowerCase()">
                  <template v-if="metric.label === 'EC'">💧</template>
                  <template v-else-if="metric.label === 'PH'">⚗️</template>
                  <template v-else-if="metric.label === 'PPM'">🌡️</template>
                  <template v-else-if="metric.label === 'light'">💡</template>
                  <template v-else-if="metric.label === 'white_light'">🌕</template>
                  <template v-else-if="metric.label === 'raw_light'">🔆</template>
                  <template v-else>🔹</template>
                </span>
                <span class="metric-number">{{ metric.series[0] }}</span>
                <span class="metric-unit" v-if="metric.label === 'EC'">mS/cm</span>
                <span class="metric-unit" v-else-if="metric.label === 'PH'">pH</span>
                <span class="metric-unit" v-else-if="metric.label === 'PPM'">ppm</span>
                <span class="metric-unit" v-else-if="metric.label === 'light'">lux</span>
                <span class="metric-unit" v-else-if="metric.label === 'white_light'">lux</span>
                <span class="metric-unit" v-else-if="metric.label === 'raw_light'">lux</span>
                <span class="metric-name">{{ metric.label }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="historical-container">
          <div class="chart-range-btns" style="margin: 16px 0 4px 0; justify-content: flex-end;">
            <button v-for="range in ranges" :key="range.value" :class="['range-btn', charts[key].selectedRange === range.value ? 'active' : '']" @click="setChartRange(key, range.value)">
              {{ range.label }}
            </button>
          </div>
          <div class="historical-graph">
            <VueApexCharts
              v-if="charts[key].history && charts[key].history.length > 0"
              type="line"
              height="320"
              width="100%"
              :options="charts[key].lineOptions"
              :series="charts[key].filteredSeries || charts[key].lineSeries"
            />
            <div v-else class="no-data">Sin datos históricos</div>
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

// Mapear topic a endpoint backend
const topicToEndpoint = {
  'Invernadero/Agua/data': '/api/calidad-agua',
  'Invernadero/Luxometro/data': '/api/luxometro',
  'Invernadero/TemHum/data': '/api/temhum1',
  'Invernadero/TemHum2/data': '/api/temhum2',
};

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
                  formatter: function(v) { 
                    return (v !== undefined && v !== null ? Number(v).toFixed(2) : '0.00');
                  },
                  suffix: '',
                  offsetY: 5
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
    ],
    history: [],
    lineSeries: [],
    lineOptions: {
      chart: { type: 'line', background: 'transparent', toolbar: { show: false } },
      theme: { mode: 'dark' },
      stroke: { curve: 'smooth', width: 3 },
      xaxis: { type: 'datetime', labels: { style: { colors: '#8fc2ff' } } },
      yaxis: { labels: { style: { colors: '#8fc2ff' } } },
      legend: { labels: { colors: '#f6f6f6' }, position: 'top', fontWeight: 600 },
      tooltip: { theme: 'dark' },
      grid: { borderColor: '#23283b', strokeDashArray: 4 }
    },
    selectedRange: 'live'
  };
}

const ranges = [
  { value: 'live', label: 'Live' },
  { value: '5m', label: '5 min' },
  { value: '30m', label: '30 min' },
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '12h', label: '12h' },
  { value: '1d', label: '1 día' },
  { value: '1w', label: '1 semana' }
];

let client = null;

// Función para obtener históricos del backend
async function fetchHistory(endpoint) {
  try {
    const res = await fetch(endpoint);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

// Mapear snake_case a camelCase para compatibilidad
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, g => g[1].toUpperCase());
}

// Magnus formula para punto de rocío en °C
function calcDewPoint(temp, hum) {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(hum / 100);
  return +(b * alpha / (a - alpha)).toFixed(2);
}

// Cargar históricos al montar y refrescar cada 5 segundos
let historyInterval = null;

// Función para cargar históricos
async function loadHistory() {
  for (const { topic } of topics) {
    const endpoint = topicToEndpoint[topic];
    if (!endpoint) continue;
    const data = await fetchHistory(endpoint);
    // Detectar métricas, soportando snake_case y camelCase
    const metricKeys = data.length > 0 ? Object.keys(data[0]).filter(k => !['id','received_at'].includes(k)) : [];
    charts[topic].history = data;
    // Si el sensor es TemHum1 o TemHum2, calcula dew_point si no existe
    if ((topic === 'temhum1' || topic === 'temhum2') && data.length > 0) {
      // Crea un array de dew_point calculado si falta
      const dewPointSeries = data.map(row => {
        let temp = row.temperatura !== undefined ? row.temperatura : row.temperatura;
        let hum = row.humedad !== undefined ? row.humedad : row.humedad;
        let dew = row.dew_point !== undefined && row.dew_point !== null ? row.dew_point : calcDewPoint(temp, hum);
        return [row.received_at, dew];
      });
      charts[topic].lineSeries = metricKeys
        .filter(k => k !== 'dew_point')
        .map(k => ({
          name: k,
          data: data.map(row => {
            const camel = toCamelCase(k);
            return [row.received_at, row[k] !== undefined ? row[k] : row[camel]];
          })
        }));
      charts[topic].lineSeries.push({ name: 'dew_point', data: dewPointSeries });
    } else {
      charts[topic].lineSeries = metricKeys.map(k => ({
        name: k,
        data: data.map(row => {
          const camel = toCamelCase(k);
          return [row.received_at, row[k] !== undefined ? row[k] : row[camel]];
        })
      }));
    }
  }
}

onMounted(async () => {
  await loadHistory();
  historyInterval = setInterval(loadHistory, 5000);
  
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
              if (!isNaN(v)) {
                charts[t].metrics.push({
                  label: k,
                  series: [Number(v)],
                  options: {
                    chart: {
                      type: 'radialBar',
                      height: 120,
                      toolbar: { show: false }
                    },
                    plotOptions: {
                      radialBar: {
                        hollow: { size: '70%' },
                        dataLabels: {
                          show: true,
                          name: { show: true, fontSize: '13px', offsetY: 0 },
                          value: { 
                            show: true, 
                            fontSize: '22px', 
                            offsetY: 5,
                            formatter: function(v) {
                              return (v !== undefined && v !== null ? Number(v).toFixed(2) : '0.00');
                            },
                            suffix: ''
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
                        gradientToColors: ['#ABE5A1'],
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
              options: {
                ...charts[t].metrics[0].options,
                plotOptions: {
                  ...charts[t].metrics[0].options.plotOptions,
                  radialBar: {
                    ...charts[t].metrics[0].options.plotOptions.radialBar,
                    dataLabels: {
                      ...charts[t].metrics[0].options.plotOptions.radialBar.dataLabels,
                      value: {
                        ...charts[t].metrics[0].options.plotOptions.radialBar.dataLabels.value,
                        suffix: ''
                      }
                    }
                  }
                }
              }
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
    }
  });
});

onUnmounted(() => {
  disconnectMQTT();
  if (historyInterval) clearInterval(historyInterval);
});

function setChartRange(chartKey, range) {
  console.log(`[setChartRange] key: ${chartKey}, range: ${range}`);
  charts[chartKey].selectedRange = range;
  if (range === 'live') {
    charts[chartKey].filteredSeries = null;
    console.log('[setChartRange] Modo live, sin filtro.');
  } else {
    applyTimeFilter(chartKey, range);
  }
}

function applyTimeFilter(chartKey, range) {
  const now = Date.now();
  let ms = 0;
  switch (range) {
    case '5m': ms = 5 * 60 * 1000; break;
    case '30m': ms = 30 * 60 * 1000; break;
    case '1h': ms = 60 * 60 * 1000; break;
    case '6h': ms = 6 * 60 * 60 * 1000; break;
    case '12h': ms = 12 * 60 * 60 * 1000; break;
    case '1d': ms = 24 * 60 * 60 * 1000; break;
    case '1w': ms = 7 * 24 * 60 * 60 * 1000; break;
    default: ms = 0;
  }
  const chart = charts[chartKey];
  if (!chart.lineSeries) {
    console.warn(`[applyTimeFilter] No hay lineSeries para ${chartKey}`);
    return;
  }
  if (ms === 0) {
    chart.filteredSeries = null;
    console.log(`[applyTimeFilter] Sin filtro para ${chartKey}`);
  } else {
    chart.filteredSeries = chart.lineSeries.map(serie => ({
      ...serie,
      data: serie.data.filter(([ts]) => {
        const t = new Date(ts).getTime();
        return t >= now - ms;
      })
    }));
    console.log(`[applyTimeFilter] Filtro aplicado para ${chartKey} (${range}):`, chart.filteredSeries);
  }
}
</script>

<style scoped>
.dashboard-charts {
  padding: 20px;
}
.charts-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.chart-box {
  display: flex;
  flex-direction: column;
  gap: 32px;

  background: #23272f;
  border-radius: 12px;
  box-shadow: 0 2px 12px #0001;
  padding: 18px 24px;
  min-width: 900px;
  max-width: 100vw;
  margin: 0 auto;
}
.chart-header {
  color: #fff;
  font-size: 1.4em;
  font-weight: 700;
  letter-spacing: 0.01em;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px #0005;

  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.chart-range-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.range-btn {
  background: #1f2530;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 4px 12px;
  font-size: 0.95em;
  cursor: pointer;
  opacity: 0.7;
  transition: background 0.2s, opacity 0.2s;
}
.range-btn.active, .range-btn:hover {
  background: #4299e1;
  opacity: 1;
}
.no-data {
  color: #aaa;
  font-style: italic;
  text-align: center;
  margin-top: 16px;
  flex-direction: row;
}
.realtime-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background: #232b36;
  border-radius: 10px;
  padding: 16px 10px 16px 10px;
  margin-bottom: 4px;
  box-shadow: 0 1px 8px #0002;
}
.historical-container {
  background: #23272f;
  border-radius: 10px;
  padding: 18px 10px 24px 10px;
  margin-top: 4px;
  box-shadow: 0 1px 10px #0002;
}
:deep(.metric-info), :deep(.metric-info *) {
  color: #fff !important;
}
</style>
