import { getJson } from "./http"
import { searchCity } from "./geocoding"
import { CityCoordinates } from "../types/City"
import { WeatherData, FormattedWeather } from "../types/Weather"
import { getWeatherDescription } from "../utils/format"

export async function getWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&format=json`

  const json = await getJson<any>("de weather", url)
  if (json.error) {
    throw new Error(`Erro na API OpenMeteo: ${json.error}`)
  }
  return json
}

export async function formatWeatherResponse(
  data: WeatherData,
  unit: "celsius" | "fahrenheit" = "celsius"
): Promise<FormattedWeather> {
  const current = data.current
  const description = getWeatherDescription(current.weather_code)

  return {
    location: `${data.latitude}, ${data.longitude}`,
    temperature: current.temperature_2m,
    unit,
    weatherCode: current.weather_code,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    humidity: current.relative_humidity_2m,
    description,
    time: current.time
  }
}

export async function getCityWeather(
  cityName: string,
  latitude?: number,
  longitude?: number
): Promise<{ location: CityCoordinates | null; weather: FormattedWeather | null; error: string | null }> {
  let location: CityCoordinates | null = null

  if (latitude && longitude) {
    location = {
      name: cityName,
      latitude,
      longitude,
      country: "",
      timezone: ""
    }
  } else {
    const cities = await searchCity(cityName)
    if (!cities || cities.length === 0) {
      return { location: null, weather: null, error: `Cidade \'${cityName}\' não encontrada` }
    }
    location = cities[0]
  }

  try {
    const weatherData = await getWeather(location!.latitude, location!.longitude)
    const formattedWeather = await formatWeatherResponse(weatherData)
    return { location, weather: formattedWeather, error: null }
  } catch (error) {
    return { location, weather: null, error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}