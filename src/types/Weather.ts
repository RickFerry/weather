export interface WeatherData {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current: {
    time: string
    interval: number
    temperature_2m: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    relative_humidity_2m: number
  }
  hourly?: any
  daily?: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
  }
}

export interface FormattedWeather {
  location: string
  temperature: number
  unit: "celsius" | "fahrenheit"
  weatherCode: number
  windSpeed: number
  windDirection: number
  humidity: number
  description: string
  time: string
}