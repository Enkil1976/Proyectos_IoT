<template>
  <div class="mqtt-status">
    <h2>Estado de conexión MQTT</h2>
    <p>
      <strong>Broker:</strong> {{ broker }}<br>
      <strong>Estado:</strong>
      <span :style="{ color: isConnected ? 'green' : 'red' }">
        {{ isConnected ? 'Conectado' : 'Desconectado' }}
      </span>
    </p>
    <h3>Mensajes recibidos</h3>
    <ul>
      <li v-for="(msg, idx) in messages" :key="idx">{{ msg }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { connectMQTT, disconnectMQTT } from '../mqtt';

const broker = 'wss://sdb201a6.ala.us-east-1.emqxsl.com:8084/mqtt';
const topics = [
  'Invernadero/Luxometro/data',
  'Invernadero/Luxometro/commands',
  'Invernadero/TemHum/data',
  'Invernadero/TemHum2/data',
  'Invernadero/Agua/data',
];
const isConnected = ref(false);
const messages = ref([]);
let client = null;

onMounted(() => {
  client = connectMQTT({
    topics,
    onConnect: () => {
      isConnected.value = true;
    },
    onMessage: (t, msg) => {
      console.log('[MQTT][Mensaje recibido]', { topic: t, msg });
      messages.value.unshift(`[${t}] ${msg}`);
      if (messages.value.length > 20) messages.value.pop();
    },
    onError: () => {
      isConnected.value = false;
    },
    onClose: () => {
      isConnected.value = false;
    },
  });
});

onUnmounted(() => {
  disconnectMQTT();
});
</script>

<style scoped>
.mqtt-status {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  margin: 2rem auto;
  max-width: 400px;
  background: #f9f9f9;
}
ul {
  text-align: left;
  font-size: 0.95em;
  max-height: 200px;
  overflow-y: auto;
}
</style>
