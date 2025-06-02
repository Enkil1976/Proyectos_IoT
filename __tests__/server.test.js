const request = require('supertest');
const app = require('../server').app;
const client = require('../server').client;

let server;

beforeAll(async () => {
  // Usar puerto diferente si 4000 está ocupado
  server = app.listen(0); // 0 = puerto aleatorio disponible
  
  // Crear tabla sensor_data si no existe
  await client.query(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id SERIAL PRIMARY KEY,
      dew_point FLOAT,
      light FLOAT,
      raw_light FLOAT,
      received_at TIMESTAMP,
      white_light FLOAT
    )
  `);
  
  // Insertar datos de prueba
  await client.query(`
    INSERT INTO sensor_data (dew_point, light, raw_light, received_at, white_light)
    VALUES (14.5, 12500, 18000, NOW(), 7500)
  `);
});

afterAll(async () => {
  await client.end();
  server.close();
});

describe('Conexión PostgreSQL', () => {
  test('Debería conectar a PostgreSQL', async () => {
    try {
      const res = await client.query('SELECT NOW()');
      expect(res.rows[0].now).toBeInstanceOf(Date);
    } catch (err) {
      console.error('Error en prueba de conexión:', err);
      throw err;
    }
  });
});

describe('Valor de punto de rocío', () => {
  test('Debería obtener el punto de rocío desde la base de datos', async () => {
    const res = await client.query('SELECT dew_point FROM sensor_data LIMIT 1');
    expect(res.rows[0].dew_point).toBeDefined();
    expect(typeof res.rows[0].dew_point).toBe('number');
  });
});

describe('Endpoints API', () => {
  beforeAll(async () => {
    try {
      // Crear tablas de prueba
      await request(server)
        .post('/api/deploy-tables')
        .send();
    } catch (err) {
      console.error('Error al crear tablas:', err);
      throw err;
    }
  });

  test('GET /api/pg-test debería responder con timestamp', async () => {
    const res = await request(app).get('/api/pg-test');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.now).toBeDefined();
  });

  test('POST /api/deploy-tables debería crear las tablas', async () => {
    // Verificar conexión activa
    try {
      await client.query('SELECT 1');
    } catch (err) {
      console.log('Reconectando a PostgreSQL...');
      await client.connect();
    }

    const res = await request(app)
      .post('/api/deploy-tables')
      .send();
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Verificar que las tablas existen
    const tables = ['Luxometro', 'Calidad_Agua', 'TemHum1', 'TemHum2'];
    for (const table of tables) {
      const check = await client.query(
        `SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = current_schema() AND tablename = '${table.toLowerCase()}')`
      );
      expect(check.rows[0].exists).toBe(true);
    }
  });

  test('Endpoints deberían devolver arrays vacíos inicialmente', async () => {
    // Tablas que usan los endpoints
    const endpointTables = ['Luxometro', 'Calidad_Agua', 'TemHum1', 'TemHum2'];
    
    // Bloquear y limpiar tablas
    await client.query('BEGIN');
    try {
      // Verificar conexión activa
      try {
        await client.query('SELECT 1');
      } catch (err) {
        console.log('Reconectando a PostgreSQL...');
        await client.connect();
      }

      // Eliminar y recrear tablas para asegurar estado limpio
      for (const table of endpointTables) {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        
        // Recrear tabla según esquema original
        await client.query(`
          CREATE TABLE ${table} (
            id SERIAL PRIMARY KEY,
            temperatura FLOAT,
            humedad FLOAT,
            dew_point FLOAT,
            received_at TIMESTAMP
          )
        `);
        
        const check = await client.query(`SELECT COUNT(*) FROM ${table}`);
        expect(parseInt(check.rows[0].count)).toBe(0);
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
    
    for (const table of endpointTables) {
      try {
        const check = await client.query(`SELECT COUNT(*) FROM ${table}`);
        expect(parseInt(check.rows[0].count)).toBe(0);
      } catch (err) {
        console.error(`Error verificando tabla ${table}:`, err);
        throw err;
      }
    }

    const endpoints = [
      '/api/luxometro',
      '/api/calidad-agua', 
      '/api/temhum1',
      '/api/temhum2'
    ];

    for (const endpoint of endpoints) {
      const res = await request(app).get(endpoint);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    }
  });
});
