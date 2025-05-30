<template>
  <header class="app-header">
    <div class="logo-title">
      <img v-if="logo" :src="logo" alt="Logo" class="logo" />
      <span class="title">Invernadero IoT Dashboard</span>
    </div>
  </header>
</template>

<script setup>
const logo = null; // Puedes reemplazar por la ruta de tu logo si tienes uno
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  width: 100vw;
  background: rgba(24, 28, 36, 0.96);
  box-shadow: 0 2px 12px rgba(0,0,0,0.14);
  z-index: 50;
  padding: 0.7rem 0 0.7rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.logo-title {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}
.logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: contain;
}
.title {
  color: #eaf6ff;
  font-size: 2.1em;
  font-weight: 800;
  letter-spacing: 0.01em;
  font-family: 'Inter', 'Roboto', Arial, sans-serif;
}
</style>
