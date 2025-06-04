<template>
  <div ref="chartContainer" style="width: 100%; height: 100%">
    <slot v-if="isReady && $attrs['has-data']"></slot>
    <v-alert v-if="isReady && !$attrs['has-data']" type="warning" class="ma-2">
      {{ $attrs['no-data-message'] || 'No hay datos disponibles' }}
    </v-alert>
    <v-alert v-if="!isReady" type="info" class="ma-2" :title="$attrs['loading-title'] || 'Cargando'">
      {{ $attrs['loading-message'] || 'Cargando datos de sensores...' }}
      <template #append>
        <v-progress-circular indeterminate color="primary" size="24" width="2" />
      </template>
    </v-alert>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const chartContainer = ref(null)
const isReady = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isReady.value = true
        observer.disconnect()
      }
    })
  }, {
    threshold: 0.1
  })

  if (chartContainer.value) {
    setTimeout(() => {
      observer.observe(chartContainer.value)
    }, 100)
  }
})
</script>
