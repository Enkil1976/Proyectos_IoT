<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left color="red">mdi-alert</v-icon>
            Alertas Activas
          </v-card-title>
          <v-card-text>
            <v-alert
              v-for="alert in activeAlerts"
              :key="alert.id"
              :type="alert.type"
              :icon="alert.icon"
              class="mb-2"
            >
              <div class="d-flex justify-space-between align-center">
                <div>
                  <strong>{{ alert.title }}</strong> - {{ alert.message }}
                  <div class="text-caption">{{ alert.timestamp }}</div>
                </div>
                <v-btn
                  size="small"
                  variant="text"
                  :icon="alert.acknowledged ? 'mdi-check-circle' : 'mdi-close-circle'"
                  @click="toggleAcknowledge(alert)"
                ></v-btn>
              </div>
            </v-alert>

            <v-alert
              v-if="!activeAlerts.length"
              type="success"
              icon="mdi-check-circle"
            >
              No hay alertas activas - Todos los sistemas funcionando normalmente
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'

const activeAlerts = ref([
  {
    id: 1,
    title: 'Temperatura Crítica',
    message: 'Sensor 1 reporta temperatura de 32°C',
    type: 'error',
    icon: 'mdi-thermometer-alert',
    timestamp: 'Hace 15 minutos',
    acknowledged: false
  },
  {
    id: 2,
    title: 'Humedad Baja',
    message: 'Sensor 2 reporta humedad de 40%',
    type: 'warning',
    icon: 'mdi-water-alert',
    timestamp: 'Hace 30 minutos',
    acknowledged: true
  }
])

const toggleAcknowledge = (alert) => {
  alert.acknowledged = !alert.acknowledged
}
</script>
