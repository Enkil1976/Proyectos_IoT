# Invernadero IoT - Dashboard de Monitoreo

Sistema completo para monitoreo y análisis de condiciones ambientales en invernaderos, con:
- Backend en Node.js/Express para recolección de datos
- Frontend en Vue 3 con panel de control interactivo
- Almacenamiento en PostgreSQL para datos históricos

## Características Principales

- **Monitoreo en tiempo real** de:
  - Temperatura (2 sensores independientes)
  - Humedad relativa (2 sensores)
  - Punto de rocío (calculado automáticamente)
  - Índice de calor
  - Calidad de agua (pH, conductividad eléctrica, PPM)
  - Niveles de iluminación (LUX)

- **Visualización avanzada**:
  - Dashboard con tarjetas KPI interactivas
  - Gráficos históricos con selección de rangos de tiempo
  - Sistema de alertas por umbrales configurables
  - Indicadores de tendencia (mejorando/empeorando/estable)

- **Configuración flexible**:
  - Unidades de medida configurables (°C/°F, mS/cm/µS/cm)
  - Selección de rango temporal (24h, semana, mes)
  - Activación/desactivación individual de sensores
  - Umbrales personalizables para alertas

## Tecnologías

### Frontend
- **Vue 3** (Composition API) - Framework principal
- **Vite** - Bundler y entorno de desarrollo
- **Vuetify 3** - Componentes UI Material Design
- **ApexCharts** - Visualización interactiva de datos
- **Sass** - Estilos avanzados con variables y mixins
- **Axios** - Cliente HTTP para comunicación con backend

### Backend
- **Express.js** - Servidor API REST
- **PostgreSQL** - Almacenamiento persistente de datos
- **node-postgres (pg)** - Cliente PostgreSQL para Node.js
- **CORS** - Middleware para permitir solicitudes cruzadas

## Estructura del Proyecto

```
invernadero-iot/
├── src/
│   ├── App.vue                # Componente raíz de la aplicación
│   ├── main.js                # Configuración Vue y plugins
│   ├── components/
│   │   └── NewDashboard.vue   # Dashboard principal con todos los KPIs
│   ├── services/
│   │   └── sensorService.js   # Servicio para obtener datos de sensores (actualmente solo temhum1)
├── __tests__/                 # Pruebas unitarias
│   └── server.test.js         # Pruebas del backend
├── server.js                  # Backend Express con conexión a PostgreSQL
├── vite.config.js             # Configuración de Vite
├── package.json               # Dependencias y scripts
├── package-lock.json
```

## Conexión a PostgreSQL

El backend implementa un sistema robusto de conexión con:
- Reintentos automáticos ante fallos
- Heartbeat cada 5 minutos para mantener conexión activa
- Manejo de errores ECONNRESET y desconexiones
- Timeout configurable (5 segundos por defecto)

La cadena de conexión se configura en `server.js` con la variable `PG_URI`.

## Configuración

1. **Requisitos**:
   - Node.js (v18+)
   - PostgreSQL (configurar en server.js)

2. **Pruebas Unitarias**:
   ```bash
   # Ejecutar todas las pruebas
   npm test
   
   # Ejecutar pruebas con cobertura
   npm test --coverage
   
   # Ver reporte de cobertura
   open coverage/lcov-report/index.html
   ```

3. **Instalación**:
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Iniciar backend** (en otra terminal):
   ```bash
   node server.js
   ```

5. **Construir para producción**:
   ```bash
   npm run build
   ```

## Cálculos Automáticos

El backend realiza los siguientes cálculos:

1. **Punto de Rocío**:
   - Calculado usando la fórmula de Magnus:
   ```javascript
   function calcDewPoint(temp, hum) {
     const a = 17.27;
     const b = 237.7;
     const alpha = ((a * temp) / (b + temp)) + Math.log(hum / 100);
     return +(b * alpha / (a - alpha)).toFixed(2);
   }
   ```
   - Se almacena automáticamente junto con temperatura/humedad

## Configuración de PostgreSQL

El backend espera una base de datos PostgreSQL con las tablas:
- `luxometro` (light, white_light, raw_light, received_at)
- `calidad_agua` (ec, ppm, ph, received_at)
- `temhum1` (temperatura, humedad, dew_point, received_at)
- `temhum2` (temperatura, humedad, dew_point, received_at)

Para crear las tablas automáticamente:
```bash
curl -X POST http://localhost:4000/api/deploy-tables
```

## Variables de Entorno

El backend usa las siguientes variables (configurar en server.js):
- `PG_URI`: Cadena de conexión PostgreSQL
- `PORT`: Puerto del backend (default: 4000)

## API Endpoints

El backend proporciona los siguientes endpoints REST:

### Sensores
- `GET /api/luxometro` 
  - Devuelve: Array de lecturas de iluminación
  - Campos: light, white_light, raw_light, received_at
  - Orden: Más reciente primero

- `GET /api/calidad-agua`
  - Devuelve: Array de lecturas de calidad de agua
  - Campos: ec, ppm, ph, received_at
  - Orden: Más reciente primero

- `GET /api/temhum1`
  - Devuelve: Array de lecturas del sensor 1
  - Campos: temperatura, humedad, dew_point, received_at
  - Orden: Más reciente primero

- `GET /api/temhum2` 
  - Devuelve: Array de lecturas del sensor 2
  - Campos: temperatura, humedad, dew_point, received_at
  - Orden: Más reciente primero

### Administración
- `POST /api/deploy-tables`
  - Crea las tablas necesarias en PostgreSQL
  - No requiere body
  - Devuelve: {success: boolean, message: string}

- `GET /api/pg-test`
  - Prueba la conexión a PostgreSQL
  - Devuelve: {success: boolean, now: timestamp}

## Licencia

MIT
