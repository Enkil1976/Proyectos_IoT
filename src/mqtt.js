// src/mqtt.js
import mqtt from 'mqtt';

// Cambia estos valores por los de tu despliegue EMQX
const MQTT_BROKER_URL = 'wss://sdb201a6.ala.us-east-1.emqxsl.com:8084/mqtt';
const MQTT_OPTIONS = {
  username: 'Esp01-DTH22',
  password: '11211121',
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 4000,
};

let client = null;

export function connectMQTT({
  onConnect,
  onMessage,
  onError,
  onClose,
  topics = [],
} = {}) {
  client = mqtt.connect(MQTT_BROKER_URL, MQTT_OPTIONS);

  client.on('connect', () => {
    if (topics.length > 0) {
      client.subscribe(topics, (err) => {
        if (err) console.error('Suscripción fallida:', err);
      });
    }
    onConnect && onConnect();
  });

  client.on('message', (topic, message) => {
    onMessage && onMessage(topic, message.toString());
  });

  client.on('error', (err) => {
    console.error('MQTT error:', err);
    onError && onError(err);
  });

  client.on('close', () => {
    onClose && onClose();
  });

  return client;
}

export function publish(topic, message) {
  if (client) {
    client.publish(topic, message);
  }
}

export function disconnectMQTT() {
  if (client) {
    client.end();
    client = null;
  }
}
