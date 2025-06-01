<template>
  <v-app>
    <NewDashboard />
    <v-footer app color="green-darken-4" class="text-center">
      <span class="text-caption">Invernadero IoT &copy; 2025 &mdash; Dashboard UX/UI by Windsurf AI</span>
    </v-footer>
  </v-app>
</template>

<script setup>
import NewDashboard from './components/NewDashboard.vue';
</script>

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
