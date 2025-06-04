// Simple Express backend with PostgreSQL and Redis
const express = require('express');
const { Client } = require('pg');
const { createClient } = require('redis');
const cors = require('cors');
const fs = require('fs');

// Configurar Redis
const redisClient = createClient({
  url: 'redis://localhost:6379'
});

redisClient.on('error', err => console.error('Redis Client Error', err));
redisClient.connect().then(() => console.log('✅ Conexión exitosa a Redis'));

const app = express();
app.use(cors());
app.use(express.json());

const PG_URI = 'postgres://innovaiq:5Anf0rd01!@2h4eh9.easypanel.host:5423/innovaiq?sslmode=disable';

const client = new Client({ 
  connectionString: PG_URI,
  // Configuración para manejo de conexión
  connectionTimeoutMillis: 5000,
  idle_in_transaction_session_timeout: 10000,
  keepAlive: true
});

async function connectWithRetry() {
  try {
    await client.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    
    // Heartbeat cada 5 minutos para mantener conexión activa
    setInterval(async () => {
      try {
        await client.query('SELECT 1');
      } catch (err) {
        console.error('❌ Error en heartbeat PostgreSQL:', err);
        await handleDisconnect();
      }
    }, 300000);
    
  } catch (err) {
    console.error('❌ Error de conexión a PostgreSQL:', err);
    console.log('Reintentando conexión en 5 segundos...');
    setTimeout(connectWithRetry, 5000);
  }
}

async function handleDisconnect() {
  try {
    await client.end();
    console.log('Conexión PostgreSQL cerrada. Reconectando...');
    await connectWithRetry();
  } catch (err) {
    console.error('Error al cerrar conexión PostgreSQL:', err);
  }
}

// Manejar eventos de error
client.on('error', async (err) => {
  console.error('⚠️ Error en cliente PostgreSQL:', err);
  if (err.code === 'ECONNRESET') {
    await handleDisconnect();
  }
});

// Iniciar conexión
connectWithRetry();

// Magnus formula para punto de rocío en °C
function calcDewPoint(temp, hum) {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temp) / (b + temp)) + Math.log(hum / 100);
  return +(b * alpha / (a - alpha)).toFixed(2);
}

// --- NO MQTT Integration ---
// El backend no se suscribe a MQTT, solo consulta la base de datos

// No hay manejo de mensajes MQTT

// Endpoint para desplegar las tablas necesarias
app.post('/api/deploy-tables', async (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS luxometro (
        id SERIAL PRIMARY KEY,
        light FLOAT,
        white_light FLOAT,
        raw_light FLOAT,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS calidad_agua (
        id SERIAL PRIMARY KEY,
        ec FLOAT,
        ppm FLOAT,
        ph FLOAT,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS temhum1 (
        id SERIAL PRIMARY KEY,
        temperatura FLOAT,
        humedad FLOAT,
        dew_point FLOAT,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS temhum2 (
        id SERIAL PRIMARY KEY,
        temperatura FLOAT,
        humedad FLOAT,
        dew_point FLOAT,
        received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await client.query('BEGIN');
    for (const stmt of sql.split(';')) {
      if (stmt.trim()) await client.query(stmt);
    }
    await client.query('COMMIT');
    res.json({ success: true, message: 'Tablas creadas exitosamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  }
});

// API endpoints para consultar datos históricos desde PostgreSQL
app.get('/api/luxometro', async (req, res) => {
  const cacheKey = 'luxometro:latest';
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: JSON.parse(cachedData), cached: true });
    }

    const result = await client.query('SELECT * FROM luxometro ORDER BY received_at DESC');
    const data = result.rows;
    await redisClient.setEx(cacheKey, 10, JSON.stringify(data));
    
    res.json({ success: true, data, cached: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/calidad-agua', async (req, res) => {
  const cacheKey = 'calidad-agua:latest';
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json({ 
        success: true, 
        data: JSON.parse(cachedData), 
        cached: true 
      });
    }

    const result = await client.query('SELECT id, ec, ppm, ph, received_at FROM calidad_agua ORDER BY received_at DESC');
    const data = result.rows.map(row => ({
      ...row,
      ppm: row.ppm || 0 // Asegurar que siempre haya valor
    }));
    
    await redisClient.setEx(cacheKey, 10, JSON.stringify(data));
    res.json({ success: true, data, cached: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/temhum1', async (req, res) => {
  const cacheKey = 'temhum1:latest';
  try {
    // Intentar obtener datos de caché
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: JSON.parse(cachedData), cached: true });
    }

    // Si no hay caché, consultar PostgreSQL
    const result = await client.query('SELECT * FROM temhum1 ORDER BY received_at DESC');
    const data = result.rows;
    
    // Guardar en caché con TTL de 10 segundos
    await redisClient.setEx(cacheKey, 10, JSON.stringify(data));
    
    res.json({ success: true, data, cached: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/temhum2', async (req, res) => {
  const cacheKey = 'temhum2:latest';
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json({ success: true, data: JSON.parse(cachedData), cached: true });
    }

    const result = await client.query('SELECT * FROM temhum2 ORDER BY received_at DESC');
    const data = result.rows;
    await redisClient.setEx(cacheKey, 10, JSON.stringify(data));
    
    res.json({ success: true, data, cached: false });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para comprobar la conexión a PostgreSQL
app.get('/api/pg-test', async (req, res) => {
  try {
    const result = await client.query('SELECT NOW()');
    res.json({ success: true, now: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 4000;

// Exportar componentes para testing
module.exports = {
  app,
  client,
  calcDewPoint
};

// Solo iniciar servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  });
}
