<template>
  <v-navigation-drawer v-model="drawer" app temporary>
    <v-list>
      <v-list-item title="Configuración"></v-list-item>
      
      <v-list-group value="Rango de tiempo">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" prepend-icon="mdi-clock" title="Rango de tiempo"></v-list-item>
        </template>
        <v-list-item 
          v-for="(range, i) in timeRanges" 
          :key="i" 
          :value="range.value" 
          @click="selectedRange = range.value"
        >
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
          <v-select 
            v-model="ecUnit" 
            :items="['mS/cm', 'µS/cm']" 
            label="Unidad EC"
          >
            <template v-slot:selection="{ item }">
              <span>{{ item.title }}</span>
            </template>
            <template v-slot:item="{ item }">
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </template>
          </v-select>
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
</template>

<script setup>
import { ref } from 'vue'

const drawer = ref(false)
const tempUnit = ref('c')
const ecUnit = ref('mS/cm')
const selectedRange = ref('24h')

const timeRanges = [
  { text: 'Últimas 24 horas', value: '24h' },
  { text: 'Última semana', value: 'week' },
  { text: 'Último mes', value: 'month' }
]

const sensors = [
  { id: 1, name: 'Sensor Temperatura 1', active: true },
  { id: 2, name: 'Sensor Temperatura 2', active: true },
  { id: 3, name: 'Sensor Humedad 1', active: true },
  { id: 4, name: 'Sensor Humedad 2', active: true },
  { id: 5, name: 'Sensor LUX', active: true },
  { id: 6, name: 'Sensor pH', active: true },
  { id: 7, name: 'Sensor EC', active: true }
]

defineExpose({
  toggleDrawer: () => drawer.value = !drawer.value
})
</script>
