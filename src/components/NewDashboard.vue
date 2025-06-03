<template>
  <!-- Componente principal del dashboard - Estructura Vuetify -->
  <!-- 
    Estructura jerárquica:
    1. v-app: Contenedor raíz de Vuetify
      1.1 v-app-bar: Barra superior de navegación
      1.2 v-navigation-drawer: Panel lateral desplegable
      1.3 v-main: Área de contenido principal
        1.3.1 v-container: Contenedor responsive
          1.3.1.1 v-row/v-col: Sistema de grillas
            1.3.1.1.1 v-card: Tarjetas de KPIs
            1.3.1.1.2 v-subheader: Títulos de sección
            1.3.1.1.3 Gráficos y timeline
  -->
  <v-app>
    <!-- Barra superior (AppBar) -->
    <!-- Contiene:
      - Icono para abrir/cerrar panel lateral
      - Título de la aplicación
      - Indicador de estado global
      - Fecha y hora actual
    -->
    <v-app-bar app color="green-darken-3" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title data-test="app-title">
        <v-icon left>mdi-sprout</v-icon>
        Invernadero IoT
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-chip :color="getStatusColor(globalStatus)" dark>
        {{ globalStatusText }}
      </v-chip>
      <v-chip class="ml-2" color="grey-darken-2">
        {{ currentDateTime }}
      </v-chip>
    </v-app-bar>

    <!-- Panel lateral de configuración -->
    <!-- Controles disponibles:
     1. Rango de tiempo: Permite seleccionar el periodo de visualización (24h, semana, mes)
     2. Unidades: Configura las unidades de medida para temperatura y conductividad
     3. Sensores: Activa/desactiva la visualización de sensores específicos -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-list>
        <v-list-item title="Configuración"></v-list-item>
        
        <v-list-group value="Rango de tiempo">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-clock" title="Rango de tiempo"></v-list-item>
          </template>
          <v-list-item v-for="(range, i) in timeRanges" :key="i" :value="range.value" @click="selectedRange = range.value">
            <v-list-item-title>{{ range.text }}</v-list-item-title>
          </v-list-item>
        </v-list-group>

        <v-list-group value="Unidades">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-ruler" title="Unidades"></v-list-item>
          </template>
          <v-list-item>
            <v-switch v-model="tempUnit" label="°C / °F" true-value="f" false-value="c"></v-switch>
          </v-list-item>
          <v-list-item>
            <v-select v-model="ecUnit" :items="['mS/cm', 'µS/cm']" label="Unidad EC"></v-select>
          </v-list-item>
        </v-list-group>

        <v-list-group value="Sensores">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-chip" title="Sensores"></v-list-item>
          </template>
          <v-list-item v-for="sensor in sensors" :key="sensor.id">
            <v-switch v-model="sensor.active" :label="sensor.name"></v-switch>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <!-- Contenido principal -->
    <v-main>
      <v-container fluid>
        <!-- Tarjetas KPI - Clima -->
        <v-row class="mt-2">
          <!-- Columna Temperatura -->
          <v-col cols="12" md="3">
            <v-subheader>Temperatura</v-subheader>
            <v-row>
              <v-col v-for="kpi in kpis.filter(k => k.name.includes('Temperatura'))" :key="kpi.id" cols="12">
                <v-card :color="getStatusColor(kpi.status, kpi.value, kpi.name)" dark class="mb-2">
                  <v-card-title class="d-flex justify-space-between">
                    <div>
                      <v-icon left>{{ kpi.icon }}</v-icon>
                      {{ kpi.name }}
                    </div>
                    <v-chip>{{ kpi.value }} {{ kpi.unit }}</v-chip>
                  </v-card-title>
                  <v-card-text>
                    <v-progress-linear v-if="kpi.trend" :model-value="kpi.trendValue" :color="kpi.trendColor"></v-progress-linear>
                    <div class="text-caption mt-2">{{ kpi.statusText }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Columna Humedad -->
          <v-col cols="12" md="3">
            <v-subheader>Humedad</v-subheader>
            <v-row>
              <v-col v-for="kpi in kpis.filter(k => k.name.includes('Humedad'))" :key="kpi.id" cols="12">
                <v-card :color="getStatusColor(kpi.status, kpi.value, kpi.name)" dark class="mb-2">
                  <v-card-title class="d-flex justify-space-between">
                    <div>
                      <v-icon left>{{ kpi.icon }}</v-icon>
                      {{ kpi.name }}
                    </div>
                    <v-chip>{{ kpi.value }} {{ kpi.unit }}</v-chip>
                  </v-card-title>
                  <v-card-text>
                    <v-progress-linear v-if="kpi.trend" :model-value="kpi.trendValue" :color="kpi.trendColor"></v-progress-linear>
                    <div class="text-caption mt-2">{{ kpi.statusText }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Columna Punto de Rocío -->
          <v-col cols="12" md="3">
            <v-subheader>Punto de Rocío</v-subheader>
            <v-row>
              <v-col v-for="kpi in kpis.filter(k => k.name.includes('DewPoint'))" :key="kpi.id" cols="12">
                <v-card :color="getStatusColor(kpi.status)" dark class="mb-2">
                  <v-card-title class="d-flex justify-space-between">
                    <div>
                      <v-icon left>mdi-weather-rainy</v-icon>
                      {{ kpi.name }}
                    </div>
                    <v-chip>{{ kpi.value }} {{ kpi.unit }}</v-chip>
                  </v-card-title>
                  <v-card-text>
                    <v-progress-linear v-if="kpi.trend" :model-value="kpi.trendValue" :color="kpi.trendColor"></v-progress-linear>
                    <div class="text-caption mt-2">{{ kpi.statusText }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>

          <!-- Columna Índice de Calor -->
          <v-col cols="12" md="3">
            <v-subheader>Índice de Calor</v-subheader>
            <v-row>
              <v-col v-for="kpi in kpis.filter(k => k.name.includes('HeatIndex'))" :key="kpi.id" cols="12">
                <v-card :color="getStatusColor(kpi.status)" dark class="mb-2">
                  <v-card-title class="d-flex justify-space-between">
                    <div>
                      <v-icon left>mdi-thermometer-alert</v-icon>
                      {{ kpi.name }}
                    </div>
                    <v-chip>{{ kpi.value }} {{ kpi.unit }}</v-chip>
                  </v-card-title>
                  <v-card-text>
                    <v-progress-linear v-if="kpi.trend" :model-value="kpi.trendValue" :color="kpi.trendColor"></v-progress-linear>
                    <div class="text-caption mt-2">{{ kpi.statusText }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Tarjetas KPI - Calidad de Agua -->
        <v-row class="mt-2">
          <v-col cols="12">
            <v-subheader>Calidad de Agua</v-subheader>
          </v-col>
          <v-col v-for="kpi in kpis.filter(k => ['pH','EC','PPM'].some(t => k.name.includes(t)))" :key="kpi.id" cols="12" sm="6" md="4" lg="3">
            <v-card :color="getStatusColor(kpi.status)" dark>
              <v-card-title class="d-flex justify-space-between">
                <div>
                  <v-icon left>{{ kpi.icon }}</v-icon>
                  {{ kpi.name }}
                </div>
                <v-chip>{{ kpi.value }} {{ kpi.unit }}</v-chip>
              </v-card-title>
              <v-card-text>
                <v-progress-linear v-if="kpi.trend" :model-value="kpi.trendValue" :color="kpi.trendColor"></v-progress-linear>
                <div class="text-caption mt-2">{{ kpi.statusText }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tarjetas KPI - Iluminación -->
        <v-row class="mt-2">
          <v-col cols="12">
            <v-subheader>Iluminación</v-subheader>
          </v-col>
          <v-col v-for="kpi in kpis.filter(k => k.name.includes('LUX'))" :key="kpi.id" cols="12" sm="6" md="4" lg="3">
            <v-card :color="getStatusColor(kpi.status)" dark>
              <v-card-title class="d-flex justify-space-between">
                <div>
                  <v-icon left>{{ kpi.icon }}</v-icon>
                  {{ kpi.name }}
                </div>
                <v-chip>{{ kpi.value }} {{ kpi.unit }}</v-chip>
              </v-card-title>
              <v-card-text>
                <v-progress-linear v-if="kpi.trend" :model-value="kpi.trendValue" :color="kpi.trendColor"></v-progress-linear>
                <div class="text-caption mt-2">{{ kpi.statusText }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Gráficos -->
        <v-row class="mt-4">
          <v-col cols="12" md="8">
            <v-card>
              <v-card-title>Parámetros de Agua</v-card-title>
              <v-card-text>
                <div style="height: 300px;" class="d-flex align-center justify-center">
                  [Gráfico pH/EC/PPM]
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>Alertas Recientes</v-card-title>
              <v-card-text>
                <v-timeline density="compact" align="start">
                  <v-timeline-item v-for="alert in alerts" :key="alert.time" :dot-color="alert.color" size="small">
                    <div class="text-caption">{{ alert.time }}</div>
                    <div>{{ alert.message }}</div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <v-card>
              <v-card-title>Temperatura y Humedad</v-card-title>
              <v-card-text>
                <div style="height: 300px;" class="d-flex align-center justify-center">
                  [Gráfico comparativo]
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { getAmbientalSensor1, getAmbientalSensor2, getWaterQuality, formatSensorData } from '@/services/sensorService';

export default {
  data() {
    return {
      sensorData: null,
      updateInterval: null,
      drawer: false,
      globalStatus: 'optimal',
      currentDateTime: new Date().toLocaleString(),
      tempUnit: 'c',
      ecUnit: 'mS/cm',
      selectedRange: '24h',
      timeRanges: [
        { text: 'Últimas 24 horas', value: '24h' },
        { text: 'Última semana', value: 'week' },
        { text: 'Último mes', value: 'month' }
      ],
      sensors: [
        { id: 1, name: 'Sensor Temperatura 1', active: true },
        { id: 2, name: 'Sensor Temperatura 2', active: true },
        { id: 3, name: 'Sensor Humedad 1', active: true },
        { id: 4, name: 'Sensor Humedad 2', active: true },
        { id: 5, name: 'Sensor LUX', active: true },
        { id: 6, name: 'Sensor pH', active: true },
        { id: 7, name: 'Sensor EC', active: true }
      ],
      kpis: [
        { id: 1, name: 'pH', value: 6.8, unit: '', icon: 'mdi-water', status: 'optimal', trend: 'up', trendValue: 70, trendColor: 'green', statusText: 'En rango óptimo' },
        { id: 2, name: 'EC', value: 1.2, unit: 'mS/cm', icon: 'mdi-flask', status: 'warning', trend: 'down', trendValue: 30, trendColor: 'orange', statusText: 'Bajo nivel' },
        { id: 3, name: 'PPM', value: 840, unit: 'ppm', icon: 'mdi-chemical-weapon', status: 'optimal', trend: 'stable', trendValue: 50, trendColor: 'green', statusText: 'Estable' },
        { id: 4, name: 'Temperatura 1', value: 24.5, unit: '°C', icon: 'mdi-thermometer', status: 'optimal', trend: 'up', trendValue: 60, trendColor: 'green', statusText: 'Óptima' },
        { id: 5, name: 'Temperatura 2', value: 25.1, unit: '°C', icon: 'mdi-thermometer', status: 'optimal', trend: 'stable', trendValue: 50, trendColor: 'green', statusText: 'Óptima' },
        { id: 6, name: 'Humedad 1', value: 65, unit: '%', icon: 'mdi-water-percent', status: 'warning', trend: 'down', trendValue: 40, trendColor: 'orange', statusText: 'Bajando' },
        { id: 7, name: 'Humedad 2', value: 68, unit: '%', icon: 'mdi-water-percent', status: 'warning', trend: 'stable', trendValue: 50, trendColor: 'orange', statusText: 'Estable' },
        { id: 8, name: 'LUX', value: 12000, unit: 'lux', icon: 'mdi-white-balance-sunny', status: 'critical', trend: 'up', trendValue: 80, trendColor: 'red', statusText: 'Alto nivel' },
        { id: 9, name: 'DewPoint 1', value: 18.2, unit: '°C', icon: 'mdi-weather-rainy', status: 'optimal', trend: 'stable', trendValue: 50, trendColor: 'green', statusText: 'Normal' },
        { id: 10, name: 'DewPoint 2', value: 17.8, unit: '°C', icon: 'mdi-weather-rainy', status: 'optimal', trend: 'stable', trendValue: 50, trendColor: 'green', statusText: 'Normal' },
        { id: 11, name: 'HeatIndex 1', value: 26.3, unit: '°C', icon: 'mdi-thermometer-alert', status: 'warning', trend: 'up', trendValue: 65, trendColor: 'orange', statusText: 'Cuidado' },
        { id: 12, name: 'HeatIndex 2', value: 27.1, unit: '°C', icon: 'mdi-thermometer-alert', status: 'warning', trend: 'up', trendValue: 70, trendColor: 'orange', statusText: 'Cuidado' }
      ],
      alerts: [
        { time: '15:30', message: 'Nivel de LUX excede máximo', color: 'red' },
        { time: '14:45', message: 'Humedad bajando rápidamente', color: 'orange' },
        { time: '13:20', message: 'pH fuera de rango óptimo', color: 'orange' },
        { time: '10:15', message: 'Temperatura estable', color: 'green' }
      ]
    }
  },
  computed: {
    globalStatusText() {
      return {
        optimal: 'Óptimo',
        warning: 'Atención',
        critical: 'Crítico'
      }[this.globalStatus]
    }
  },
  methods: {
    async fetchSensorData() {
      try {
        const [data1, data2, waterData] = await Promise.all([
          getAmbientalSensor1(),
          getAmbientalSensor2(),
          getWaterQuality()
        ]);
        
        console.log('Datos de calidad de agua recibidos:', waterData);
        
        this.sensorData = {
          sensor1: formatSensorData(data1[0]),
          sensor2: formatSensorData(data2[0]),
          water: waterData[0] // Usa el formato de formatWaterQualityData
        };

        console.log('Datos de calidad de agua formateados:', this.sensorData.water);
        
        // Actualizamos los KPIs con datos reales
        this.kpis = this.kpis.map(kpi => {
          if (kpi.name === 'Temperatura 1') {
            return {...kpi, value: this.sensorData.sensor1.temperatura};
          }
          if (kpi.name === 'Temperatura 2') {
            return {...kpi, value: this.sensorData.sensor2.temperatura};
          }
          if (kpi.name === 'Humedad 1') {
            return {...kpi, value: this.sensorData.sensor1.humedad};
          }
          if (kpi.name === 'Humedad 2') {
            return {...kpi, value: this.sensorData.sensor2.humedad};
          }
          if (kpi.name === 'DewPoint 1') {
            return {...kpi, value: this.sensorData.sensor1.dewPoint};
          }
          if (kpi.name === 'DewPoint 2') {
            return {...kpi, value: this.sensorData.sensor2.dewPoint};
          }
          if (kpi.name === 'pH') {
            return {
              ...kpi, 
              value: this.sensorData.water.ph,
              status: this.sensorData.water.status.ph,
              statusText: `pH ${this.sensorData.water.status.ph === 'optimal' ? 'óptimo' : this.sensorData.water.status.ph === 'high' ? 'alto' : 'bajo'}`
            };
          }
          if (kpi.name === 'EC') {
            return {
              ...kpi, 
              value: this.sensorData.water.conductivity,
              unit: this.ecUnit,
              status: this.sensorData.water.status.ppm, // Usamos status de PPM para EC
              statusText: `Conductividad ${this.sensorData.water.status.ppm === 'optimal' ? 'óptima' : this.sensorData.water.status.ppm === 'high' ? 'alta' : 'baja'}`
            };
          }
          if (kpi.name === 'PPM') {
            return {
              ...kpi, 
              value: this.sensorData.water.ppm,
              status: this.sensorData.water.status.ppm,
              statusText: `PPM ${this.sensorData.water.status.ppm === 'optimal' ? 'óptimos' : this.sensorData.water.status.ppm === 'high' ? 'altos' : 'bajos'}`
            };
          }
          return kpi;
        });
      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    },

    getStatusColor(status, value, name) {
      // Lógica para temperatura vs dew point
      if (name && (name.includes('Temperatura') || name.includes('DewPoint'))) {
        const temp = this.kpis.find(k => k.name.includes('Temperatura'))?.value || 0;
        const dewPoint = this.kpis.find(k => k.name.includes('DewPoint'))?.value || 0;
        const diff = temp - dewPoint;
        
        if (diff <= 1) return 'red'; // Alerta crítica
        if (diff <= 2) return 'orange'; // Alerta preventiva
        
        // Lógica normal para temperatura
        if (name.includes('Temperatura')) {
          if (value < 5 || value > 30) return 'red';
          if (Math.abs(value - 22) > 2) return 'orange';
          return 'green';
        }
        
        // Lógica normal para dew point
        return 'green';
      }
      
      // Lógica para humedad
      if (name && name.includes('Humedad')) {
        if (Math.abs(value - 63) > 10) return 'red';
        if (Math.abs(value - 63) > 5) return 'orange';
        return 'green';
      }

      // Lógica por defecto para otros KPIs
      return {
        optimal: 'green',
        warning: 'orange',
        critical: 'red'
      }[status];
    }
  },
  mounted() {
    this.fetchSensorData();
    // Actualizar datos cada 5 segundos
    this.updateInterval = setInterval(this.fetchSensorData, 5000);
  },
  beforeUnmount() {
    clearInterval(this.updateInterval);
  }
}
</script>

<style scoped>
/* Estilos personalizados */
.v-card {
  transition: all 0.3s ease;
}
.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
</style>
