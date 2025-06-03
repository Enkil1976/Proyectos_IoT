# Invernadero IoT - Dashboard de Monitoreo

Sistema completo para monitoreo y análisis de condiciones ambientales en invernaderos, con:
- Backend en Node.js/Express para recolección de datos
- Frontend en Vue 3 con panel de control interactivo
- Almacenamiento en PostgreSQL para datos históricos

## Características Principales

- **Monitoreo en tiempo real** de:
  - Temperatura (2 sensores independientes)
    - Rango diurno ideal: 16-22°C (óptimo 18-20°C)
    - Rango nocturno ideal: 10-16°C (óptimo 12-14°C)
  - Humedad relativa (2 sensores)
    - Rango óptimo: 60-67%
    - Rango aceptable: 55-70%
    - Rango crítico: <50% o >75%
  - Punto de rocío (calculado automáticamente)
  - Índice de calor
  - Calidad de agua (pH, conductividad eléctrica, PPM)
  - Niveles de iluminación (LUX)

- **Sistema de alertas inteligente**:
  - Detecta automáticamente periodo día/noche (6am-8pm día)
  - Mensajes descriptivos en español
  - Colores según severidad (verde/naranja/rojo)
  - Historial de alertas en panel lateral

- **Visualización avanzada**:
  - Dashboard con tarjetas KPI interactivas
  - Gráficos históricos con selección de rangos de tiempo
  - Sistema de alertas por umbrales configurables
  - Indicadores de tendencia (mejorando/empeorando/estable)

## Análisis de Componentes

### SensorService.js
Servicio para obtener datos de sensores ambientales que incluye:

1. Funciones principales:
   - `getAmbientalSensor1()`: Obtiene datos del sensor 1 (temperatura/humedad) desde /api/temhum1
   - `getAmbientalSensor2()`: Obtiene datos del sensor 2 (temperatura/humedad) desde /api/temhum2
   - `getWaterQuality()`: Obtiene datos de calidad de agua desde /api/calidad-agua

2. Características técnicas:
   - Usa Axios para llamadas HTTP con timeout de 5000ms
   - Implementa manejo detallado de errores con logging
   - Incluye funciones de formateo para los datos recibidos

3. Validaciones:
   - Verifica que la respuesta tenga success=true
   - Procesa y formatea los valores numéricos
   - Asigna estados (high/low/optimal) según umbrales

### NewDashboard.vue
Componente principal de visualización con:

1. Estructura:
   - Barra superior con título, estado global y fecha/hora
   - Panel lateral desplegable para configuración
   - Tarjetas KPI organizadas por categorías
   - Gráficos y timeline de alertas

2. Funcionalidades clave:
   - Actualización automática cada 5 segundos
   - Sistema de colores según estado
   - Cálculo de diferencias temperatura/punto de rocío
   - Manejo de unidades configurables

3. Integración:
   - Consume datos de sensorService.js
   - Muestra datos reales en los KPIs
   - Diseño responsive con Vuetify

## Análisis del Backend (server.js)

El servidor backend implementa las siguientes funcionalidades:

1. **Conexión a PostgreSQL**:
   - Sistema robusto de conexión con reintentos automáticos
   - Heartbeat cada 5 minutos para mantener conexión activa
   - Manejo de errores ECONNRESET y desconexiones
   - Timeout configurable (5 segundos)

2. **Endpoints API**:
   - `/api/luxometro`: Lecturas de iluminación
   - `/api/calidad-agua`: Datos de calidad de agua (EC, PPM, pH)
   - `/api/temhum1` y `/api/temhum2`: Datos de temperatura/humedad
   - `/api/deploy-tables`: Crea las tablas necesarias en PostgreSQL
   - `/api/pg-test`: Prueba de conexión a la base de datos

3. **Características técnicas**:
   - Cálculo automático del punto de rocío usando fórmula de Magnus
   - Middleware CORS para permitir solicitudes cruzadas
   - Manejo de transacciones SQL para operaciones críticas
   - Sistema de logging detallado

4. **Configuración**:
   - Puerto configurable (default: 4000)
   - Cadena de conexión PostgreSQL en variable PG_URI
   - Exportación de componentes para testing

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

[Resto del contenido original del README.md se mantiene igual...]
