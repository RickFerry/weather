import { celsiusToFahrenheit, fahrenheitToCelsius, formatTemperature, getWeatherDescription, sleep } from './utils'

describe('Utils module', () => {
  describe('Temperature conversion', () => {
    test('should convert Celsius to Fahrenheit correctly', () => {
      expect(celsiusToFahrenheit(0)).toBe(32)
      expect(celsiusToFahrenheit(100)).toBe(212)
      expect(celsiusToFahrenheit(37.5)).toBe(99.5)
    })

    test('should convert Fahrenheit to Celsius correctly', () => {
      expect(fahrenheitToCelsius(32)).toBe(0)
      expect(fahrenheitToCelsius(212)).toBe(100)
      expect(fahrenheitToCelsius(98.6)).toBe(37)
    })

    test('should format temperature with correct unit', () => {
      expect(formatTemperature(25, 'celsius')).toBe('25.0°C')
      expect(formatTemperature(25, 'fahrenheit')).toBe('25.0°F')
      expect(formatTemperature(0, 'celsius')).toBe('0.0°C')
      expect(formatTemperature(100, 'fahrenheit')).toBe('100.0°F')
    })
  })

  describe('Weather description', () => {
    test('should return description for valid weather codes', () => {
      expect(getWeatherDescription(0)).toBe('Céu limpo')
      expect(getWeatherDescription(3)).toBe('Nublado')
      expect(getWeatherDescription(45)).toBe('Condições desconhecidas')
    })

    test('should handle unknown weather codes', () => {
      expect(getWeatherDescription(999)).toBe('Condições desconhecidas')
    })
  })

  describe('Sleep function', () => {
    test('should wait for specified duration', async () => {
      const start = Date.now()
      await sleep(100)
      const duration = Date.now() - start
      expect(duration).toBeGreaterThanOrEqual(90)
    })
  })
})