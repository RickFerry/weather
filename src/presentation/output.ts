import { colors, colorize, getColorTemperatureUnit } from "../utils/colors"
import { celsiusToFahrenheit, formatTemperature, getWeatherDescription } from "../utils/format"
import { City } from "../types/City"
import { WeatherData } from "../types/Weather"
import { Settings } from "../types/Settings"

export function logInfo(message: string): void {
  console.log(colorize(message, colors.cyan))
}

export function logWarning(message: string): void {
  console.log(colorize(message, colors.yellow))
}

export function logSuccess(message: string): void {
  console.log(colorize(message, colors.green))
}

export function logError(message: string, detail?: string): void {
  if (detail !== undefined) {
    console.error(colorize(message, colors.red), detail)
  } else {
    console.error(colorize(message, colors.red))
  }
}

export function printWeather(city: City, weatherData: WeatherData, settings: Settings): void {
  const formatted = {
    temperature: weatherData.current.temperature_2m,
    description: getWeatherDescription(weatherData.current.weather_code),
    humidity: weatherData.current.relative_humidity_2m,
    windSpeed: weatherData.current.wind_speed_10m,
    windDirection: weatherData.current.wind_direction_10m
  }

  if (settings.temperatureUnit === "fahrenheit") {
    formatted.temperature = celsiusToFahrenheit(weatherData.current.temperature_2m)
  }

  console.log("\n--- " + colorize("Clima atual", colors.green) + " ---")
  console.log(`Cidade: ${city.name}, ${weatherData.timezone}`)
  console.log(`Temperatura: ${colorize(formatTemperature(formatted.temperature, settings.temperatureUnit), getColorTemperatureUnit(settings.temperatureUnit))}`)
  console.log(`Condição: ${formatted.description}`)
  console.log(`Umidade: ${formatted.humidity}%`)
  console.log(`Velocidade do vento: ${formatted.windSpeed} km/h`)
  console.log(`Direção do vento: ${formatted.windDirection}°`)
  console.log("---")
}

export function printForecastTable(weatherData: WeatherData, settings: Settings): void {
  const daily = weatherData.daily
  if (!daily || !daily.time || daily.time.length === 0) {
    logError("Dados de previsão não disponíveis.")
    return
  }

  console.log(colorize(`Data       | Temp Max | Temp Min | Tempo`, colors.cyan))
  console.log(colorize(`───────────┼──────────────────┼──────────────────┼───────`, colors.cyan))

  for (let i = 0; i < Math.min(7, daily.time.length); i++) {
    const date = new Date(daily.time[i]).toLocaleDateString("pt-BR")
    const maxTemp = daily.temperature_2m_max[i]
    const minTemp = daily.temperature_2m_min[i]
    const weather = getWeatherDescription(daily.weather_code[i])

    if (settings.temperatureUnit === "fahrenheit") {
      const maxFahrenheit = celsiusToFahrenheit(maxTemp)
      const minFahrenheit = celsiusToFahrenheit(minTemp)
      console.log(`${date.padEnd(10)} | ${colorize(maxFahrenheit.toFixed(1) + "°F", getColorTemperatureUnit("fahrenheit")).padStart(18)} | ${colorize(minFahrenheit.toFixed(1) + "°F", getColorTemperatureUnit("fahrenheit")).padStart(18)} | ${weather}`)
    } else {
      console.log(`${date.padEnd(10)} | ${colorize(maxTemp.toFixed(1) + "°C", getColorTemperatureUnit("celsius")).padStart(18)} | ${colorize(minTemp.toFixed(1) + "°C", getColorTemperatureUnit("celsius")).padStart(18)} | ${weather}`)
    }
  }
}