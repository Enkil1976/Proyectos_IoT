import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';


export const getWaterQuality = async () => {
  try {
    console.log('[WaterQuality] Iniciando request a API...')
    console.log(`[WaterQuality] Endpoint: ${API_BASE_URL}/latest/calidad_agua`)
    
    const startTime = Date.now()

    const response = await axios.get(`${API_BASE_URL}/latest/calidad_agua`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })

    const duration = Date.now() - startTime
    console.log(`[WaterQuality] Respuesta recibida en ${duration}ms`)
    console.log('[WaterQuality] Datos recibidos:', response.data)

    return response.data

  } catch (error) {
    console.error('[WaterQuality] Error al obtener datos:', error.message)

    if (error.code === 'ECONNABORTED') {
      console.warn('[WaterQuality] Timeout al conectar con la API')
    }

    throw error
  }
}


export const formatWaterQualityData = (waterData) => {
  console.log('[WaterQuality] Formateando datos:', waterData);
  
  const dataArray = Array.isArray(waterData) ? waterData : [waterData];
  
  return dataArray.map(item => ({
    ph: parseFloat(item.ph || 7.0),
    conductivity: parseFloat(item.ec || item.conductivity || 0),
    ppm: parseInt(item.ppm || 0),
    timestamp: item.received_at || item.timestamp || new Date().toISOString()
  }));
};

export const formatSensorData = (sensorData) => {
  return {
    temperatura: parseFloat(sensorData.temperatura).toFixed(1),
    humedad: parseFloat(sensorData.humedad).toFixed(1),
    dew_point: parseFloat(sensorData.dew_point).toFixed(1),
    timestamp: new Date(sensorData.received_at)
  };
};

export const getAmbientalSensor1 = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/latest/temhum1`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getAmbientalSensor1:', error);
    throw error;
  }
};

export const getAmbientalSensor2 = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/latest/temhum2`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getAmbientalSensor2:', error);
    throw error;
  }
};
