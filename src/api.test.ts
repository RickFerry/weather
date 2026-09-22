import { searchCity, getWeather, formatWeatherResponse, getCityWeather } from './api'
import { celsiusToFahrenheit } from './utils'
import { CityCoordinates } from './api'

describe('API module', () => {
  describe('searchCity', () => {
    test('should find a single city for exact match', async () => {
      const cities = await searchCity('São Paulo')
      expect(cities).not.toBeNull()
      expect(cities).toBeInstanceOf(Array)
      expect(cities.length).toBeGreaterThan(0)
    })

    test('should return multiple cities for ambiguous query', async () => {
      const cities = await searchCity('São')
      expect(cities).not.toBeNull()
      expect(cities.length).toBeGreaterThan(1)
    })

    test('should return null for non-existent city', async () => {
      const cities = await searchCity('CidadeInexistente123')
      expect(cities).toBeNull()
    })
  })

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
      expect(formatted.temperature).toBe(77)
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
  })
}