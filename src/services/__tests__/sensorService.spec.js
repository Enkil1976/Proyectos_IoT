import { getAmbientalSensor1, formatSensorData } from '../sensorService';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}));

describe('sensorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAmbientalSensor1', () => {
    it('should return sensor data on successful API call', async () => {
      const mockData = {
        success: true,
        data: {
          temperatura: 25.3,
          humedad: 60.2,
          dew_point: 17.1,
          received_at: '2025-02-06T00:00:00Z'
        }
      };
      axios.get.mockResolvedValue({ status: 200, data: mockData });

      const result = await getAmbientalSensor1();
      expect(result).toEqual(mockData.data);
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:4000/api/temhum1',
        expect.objectContaining({
          timeout: 5000,
          headers: expect.any(Object)
        })
      );
    });

    it('should throw error when API returns success=false', async () => {
      const mockData = { success: false, error: 'Sensor offline' };
      axios.get.mockResolvedValue({ status: 200, data: mockData });

      await expect(getAmbientalSensor1()).rejects.toThrow(
        `API respondió con success=false: ${JSON.stringify(mockData)}`
      );
    });

    it('should throw error on API failure', async () => {
      const error = new Error('Network error');
      axios.get.mockRejectedValue(error);

      await expect(getAmbientalSensor1()).rejects.toThrow(error);
    });
  });

  describe('formatSensorData', () => {
    it('should format sensor data correctly', () => {
      const input = {
        temperatura: '25.3456',
        humedad: '60.234',
        dew_point: '17.123',
        received_at: '2025-02-06T00:00:00Z'
      };

      const result = formatSensorData(input);
      expect(result).toEqual({
        temperatura: '25.3',
        humedad: '60.2',
        dewPoint: '17.1',
        timestamp: new Date(input.received_at)
      });
    });

    it('should handle missing values', () => {
      const input = {
        temperatura: null,
        humedad: undefined,
        dew_point: '17.123',
        received_at: '2025-02-06T00:00:00Z'
      };

      const result = formatSensorData(input);
      expect(result).toEqual({
        temperatura: 'NaN',
        humedad: 'NaN',
        dewPoint: '17.1',
        timestamp: new Date(input.received_at)
      });
    });
  });
});
