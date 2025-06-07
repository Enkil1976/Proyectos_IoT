# Documentación del Servicio de Sensores

## Funciones principales

### `getWaterQuality()`
- Obtiene datos actuales de calidad de agua
- Endpoint: `/latest/calidad_agua`
- Logs: Muestra tiempo de respuesta y datos recibidos

### `getWaterQualityChart()`
- Obtiene histórico de calidad de agua
- Endpoint: `/chart/calidad_agua`
- Logs: Muestra estado HTTP y datos formateados

## Funciones de formateo

### `formatSensorData(sensorData)`
- Formatea datos de temperatura/humedad
- Parámetros:
  - temperatura
  - humedad  
  - dew_point
  - received_at
- Retorna objeto con valores formateados

### `formatWaterQualityData(waterData)`
- Formatea datos de calidad de agua
- Maneja 3 formatos:
  1. Nuevo formato API (con hours y data)
  2. Formato histórico
  3. Datos puntuales
- Parámetros:
  - ph (0-14)
  - ec/conductividad
  - ppm

## Funciones para sensores ambientales

### `getAmbientalSensor1()` y `getAmbientalSensor2()`
- Obtienen datos actuales de sensores ambientales
- Endpoints: `/latest/temhum1` y `/latest/temhum2`

### `getAmbientalChart1()` y `getAmbientalChart2()`
- Obtienen histórico de sensores ambientales  
- Endpoints: `/chart/temhum1` y `/chart/temhum2`

## Configuración
- URL base: `http://localhost:4000/api`
- Timeout: 10000ms
- Headers: Accept/Content-Type: application/json

## Logging
Todas las funciones incluyen:
- Logs de inicio/fin de operación
- Errores detallados
- Tiempos de respuesta
- Datos recibidos
