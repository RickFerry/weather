import { getWeather, formatWeatherResponse, getCityWeather } from '../../src/api/weather'
import { celsiusToFahrenheit } from '../../src/utils/format'

describe('Weather API', () => {
  describe('getWeather', () => {
    test('should fetch current weather data', async () => {
      const weather = await getWeather(-23.5475, -46.63611) // São Paulo coordinates
      expect(weather).toBeDefined()
      expect(weather.current).toBeDefined()
      expect(weather.current.temperature_2m).toBeDefined()
      expect(typeof weather.current.temperature_2m).toBe('number')
    })

    test('should handle invalid coordinates', async () => {
      await expect(getWeather(999, 999)).rejects.toThrow()
    })
  })

  describe('formatWeatherResponse', () => {
    test('should format weather data in Celsius', async () => {
      const mockData = {
        latitude: -23.5475,
        longitude: -46.63611,
        generationtime_ms: 100,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: 'BRT',
        elevation: 760,
        current: {
          time: '2023-01-01T12:00:00',
          interval: 3600,
          temperature_2m: 25,
          weather_code: 0,
          wind_speed_10m: 10,
          wind_direction_10m: 180,
          relative_humidity_2m: 80
        }
      }
      const formatted = await formatWeatherResponse(mockData, 'celsius')
      expect(formatted.temperature).toBe(25)
      expect(formatted.unit).toBe('celsius')
      expect(formatted.description).toBeDefined()
    })

    test('should format weather data in Fahrenheit', async () => {
      const mockData = {
        latitude: -23.5475,
        longitude: -46.63611,
        generationtime_ms: 100,
        utc_offset_seconds: -10800,
        timezone: 'America/Sao_Paulo',
        timezone_abbreviation: 'BRT',
        elevation: 760,
        current: {
          time: '2023-01-01T12:00:00',
          interval: 3600,
          temperature_2m: 25,
          weather_code: 0,
          wind_speed_10m: 10,
          wind_direction_10m: 180,
          relative_humidity_2m: 80
        }
      }
      const formatted = await formatWeatherResponse(mockData, 'fahrenheit')
      expect(formatted.temperature).toBe(25)
      expect(formatted.unit).toBe('fahrenheit')
      expect(celsiusToFahrenheit(25)).toBe(77)
    })
  })

  describe('getCityWeather', () => {
    test('should get weather for existing city by name', async () => {
      const result = await getCityWeather('São Paulo')
      expect(result.location).not.toBeNull()
      expect(result.weather).not.toBeNull()
      expect(result.location?.name).toBe('São Paulo')
    })

    test('should return error for non-existent city', async () => {
      const result = await getCityWeather('CidadeInexistente123')
      expect(result.error).toBeDefined()
    })

    test('should use provided coordinates without searching', async () => {
      const result = await getCityWeather('Qualquer', -23.5475, -46.63611)

      expect(result.error).toBeNull()
      expect(result.location).toEqual({
        name: 'Qualquer',
        latitude: -23.5475,
        longitude: -46.63611,
        country: '',
        timezone: ''
      })
    })

    test('should ignore partial coordinates and search by name', async () => {
      const result = await getCityWeather('São Paulo', -23.5475)

      expect(result.location?.name).toBe('São Paulo')
    })

    test('should return error when the weather API responds with an error', async () => {
      const result = await getCityWeather('São Paulo', 999, 999)

      expect(result.weather).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })
})
