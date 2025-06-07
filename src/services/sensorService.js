import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
console.log('[SensorService] Configurando API base:', API_BASE_URL);

export const getWaterQuality = async () => {
  try {
    console.groupCollapsed('[SensorService] Obteniendo calidad de agua actual');
    console.log('Endpoint:', `${API_BASE_URL}/latest/calidad_agua`);
    
    const startTime = Date.now();
    const response = await axios.get(`${API_BASE_URL}/latest/calidad_agua`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const duration = Date.now() - startTime;
    console.log(`Respuesta recibida en ${duration}ms`);
    console.log('Datos:', response.data);
    console.groupEnd();
    return response.data;

  } catch (error) {
    console.error('[SensorService] Error al obtener calidad de agua:', error);
    throw error;
  }
};

export const getWaterQualityChart = async () => {
  try {
    console.groupCollapsed('[SensorService] Obteniendo histórico calidad de agua');
    console.log('Endpoint:', `${API_BASE_URL}/chart/calidad_agua`);
    
    const response = await axios.get(`${API_BASE_URL}/chart/calidad_agua`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json', 
        'Content-Type': 'application/json'
      }
    });

    console.log('Respuesta HTTP:', response.status, response.statusText);
    
    if (!response.data) {
      console.warn('La API no devolvió datos');
      return { data: [] };
    }

    let formattedData = response.data;
    if (Array.isArray(response.data)) {
      formattedData = { data: response.data };
    } else if (response.data.hours && !response.data.data) {
      formattedData = { data: [] };
    }

    console.log('Datos formateados:', formattedData);
    console.groupEnd();
    return formattedData;

  } catch (error) {
    console.error('[SensorService] Error al obtener histórico:', error);
    return { data: [] };
  }
};

export const formatSensorData = (sensorData) => {
  console.log('[SensorService] Formateando datos de sensor:', sensorData);
  return {
    temperatura: parseFloat(sensorData.temperatura).toFixed(1),
    humedad: parseFloat(sensorData.humedad).toFixed(1),
    dew_point: parseFloat(sensorData.dew_point).toFixed(1),
    timestamp: new Date(sensorData.received_at)
  };
};

export const formatWaterQualityData = (waterData) => {
  console.log('[SensorService] Formateando datos de calidad de agua:', waterData);
  
  const parseValue = (value, min, max, defaultValue) => {
    const parsed = parseFloat(value || defaultValue);
    return Math.max(min, Math.min(max, parsed));
  };

  // Formato API con hours y data
  if (waterData?.hours !== undefined) {
    return {
      data: waterData.data.map(item => ({
        time: item.time,
        ph: parseValue(item.ph, 0, 14, 7.0),
        ec: parseValue(item.ec, 0, Infinity, 0),
        ppm: parseInt(item.ppm || 0)
      }))
    };
  }

  // Formato para datos históricos
  if (waterData?.data) {
    return {
      data: waterData.data.map(item => ({
        time: item.time,
        ph: parseValue(item.ph, 0, 14, 7.0),
        ec: parseValue(item.ec || item.conductivity, 0, Infinity, 0),
        ppm: parseInt(item.ppm || 0)
      }))
    };
  }

  // Formato para datos puntuales
  const dataArray = Array.isArray(waterData) ? waterData : [waterData];
  return dataArray.map(item => ({
    ph: parseValue(item.ph, 0, 14, 7.0),
    conductivity: parseValue(item.ec || item.conductivity, 0, Infinity, 0),
    ppm: parseInt(item.ppm || 0),
    timestamp: item.received_at || item.timestamp || new Date().toISOString()
  }));
};

export const getAmbientalSensor1 = async () => {
  try {
    console.log('[SensorService] Obteniendo datos sensor ambiental 1');
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
    console.log('[SensorService] Obteniendo datos sensor ambiental 2');
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

export const getAmbientalChart1 = async () => {
  try {
    console.log('[SensorService] Obteniendo histórico sensor ambiental 1');
    const response = await axios.get(`${API_BASE_URL}/chart/temhum1`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getAmbientalChart1:', error);
    throw error;
  }
};

export const getAmbientalChart2 = async () => {
  try {
    console.log('[SensorService] Obteniendo histórico sensor ambiental 2');
    const response = await axios.get(`${API_BASE_URL}/chart/temhum2`, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error en getAmbientalChart2:', error);
    throw error;
  }
};
