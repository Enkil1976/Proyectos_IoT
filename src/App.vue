<template>
  <div id="app">
    <AppHeader />
    <DashboardCharts />
    <footer class="app-footer">
      <span>Invernadero IoT &copy; 2025 &mdash; Dashboard UX/UI by Windsurf AI</span>
    </footer>
  </div>
</template>

<script setup>
import DashboardCharts from './components/DashboardCharts.vue';
import AppHeader from './components/AppHeader.vue';
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 40px;
}
</style>

<style>
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
</style>

