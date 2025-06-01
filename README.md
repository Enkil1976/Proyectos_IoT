# Invernadero IoT - Dashboard de Monitoreo

Dashboard para monitoreo de sensores ambientales en un invernadero, construido con Vue 3 y Vite.

## Características Principales

- Visualización en tiempo real de datos de sensores:
  - Temperatura (2 sensores)
  - Humedad (2 sensores) 
  - Punto de rocío
  - Índice de calor
  - Calidad de agua (pH, EC, PPM)
  - Iluminación (LUX)

- Gráficos interactivos:
  - Vista radial de métricas actuales
  - Gráficos históricos con filtros de tiempo
  - Alertas visuales por umbrales

- Configuración personalizable:
  - Unidades de medida (°C/°F, mS/cm/µS/cm)
  - Rango de tiempo (24h, semana, mes)
  - Activación/desactivación de sensores

## Tecnologías

### Frontend
- Vue 3 (Composition API)
- Vite
- Vuetify 3 (UI Framework)
- ApexCharts (Visualización de datos)
- Sass (Estilos)

### Backend
- Express.js
- PostgreSQL (Almacenamiento de datos)
- API REST

## Estructura del Proyecto

```
invernadero-iot/
├── src/
│   ├── App.vue                # Componente raíz
│   ├── main.js                # Configuración Vue
│   ├── components/
│   │   ├── NewDashboard.vue   # Dashboard principal
│   │   ├── DashboardCharts.vue # Gráficos interactivos
│   │   ├── EnvironmentChart.vue # Datos ambientales
│   ├── services/
│   │   └── sensorService.js   # Conexión API sensores
├── server.js                  # Backend Express
├── vite.config.js             # Configuración Vite
├── package.json
```

## Configuración

1. **Requisitos**:
   - Node.js (v18+)
   - PostgreSQL (configurar en server.js)

2. **Instalación**:
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

## Configuración de PostgreSQL

El backend espera una base de datos PostgreSQL con las siguientes tablas:
- `Luxometro` (light, white_light, raw_light, received_at)
- `Calidad_Agua` (ec, ppm, ph, received_at) 
- `TemHum1` (temperatura, humedad, dew_point, received_at)
- `TemHum2` (temperatura, humedad, dew_point, received_at)

Puedes crear las tablas ejecutando:
```bash
curl -X POST http://localhost:4000/api/deploy-tables
```

## Variables de Entorno

El backend usa las siguientes variables (configurar en server.js):
- `PG_URI`: Cadena de conexión PostgreSQL
- `PORT`: Puerto del backend (default: 4000)

## API Endpoints

- `GET /api/luxometro` - Datos de iluminación
- `GET /api/calidad-agua` - Parámetros de agua
- `GET /api/temhum1` - Sensor temperatura/humedad 1
- `GET /api/temhum2` - Sensor temperatura/humedad 2
- `POST /api/deploy-tables` - Crear tablas en PostgreSQL

## Licencia

MIT
