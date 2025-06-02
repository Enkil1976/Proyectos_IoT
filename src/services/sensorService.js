// Servicio para obtener datos de sensores ambientales
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';
console.log(`Configurando servicio con URL base: ${API_BASE_URL}`);

export const getAmbientalSensor1 = async () => {
  try {
    console.log(`Haciendo request a: ${API_BASE_URL}/temhum1`);
    const response = await axios.get(`${API_BASE_URL}/temhum1`, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      withCredentials: false
    });
    
    console.log('Respuesta del API:', {
      status: response.status,
      data: response.data
    });

    if (!response.data?.success) {
      throw new Error(`API respondió con success=false: ${JSON.stringify(response.data)}`);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error detallado en getAmbientalSensor1:', {
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method
      },
      response: error.response?.data
    });
    throw error;
  }
};

// Formatear datos para gráficos
export const getAmbientalSensor2 = async () => {
  try {
    console.log(`Haciendo request a: ${API_BASE_URL}/temhum2`);
    const response = await axios.get(`${API_BASE_URL}/temhum2`, {
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      withCredentials: false
    });
    
    console.log('Respuesta del API:', {
      status: response.status,
      data: response.data
    });

    if (!response.data?.success) {
      throw new Error(`API respondió con success=false: ${JSON.stringify(response.data)}`);
    }

    return response.data.data;
  } catch (error) {
    console.error('Error detallado en getAmbientalSensor2:', {
      message: error.message,
      code: error.code,
      config: {
        url: error.config?.url,
        method: error.config?.method
      },
      response: error.response?.data
    });
    throw error;
  }
};

export const formatSensorData = (sensorData) => {
  console.log('Datos recibidos para formatear:', sensorData);
  const formatted = {
    temperatura: parseFloat(sensorData.temperatura).toFixed(1),
    humedad: parseFloat(sensorData.humedad).toFixed(1),
    dewPoint: parseFloat(sensorData.dew_point).toFixed(1),
    timestamp: new Date(sensorData.received_at)
  };
  console.log('Datos formateados:', formatted);
  return formatted;
};
