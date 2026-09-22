import { getWeather } from "../api/weather"
import { getDefaultCity, getAllCities } from "../storage/citiesStorage"
import { City } from "../types/City"
import { Settings } from "../types/Settings"
import { logError, logWarning, printWeather } from "../presentation/output"
import { colors, colorize } from "../utils/colors"

export async function getWeatherForCity(city: City, settings: Settings): Promise<void> {
  console.log(colorize(`\nBuscando clima para ${city.name}...`, colors.yellow))

  try {
    const weatherData = await getWeather(city.lat, city.lon)
    printWeather(city, weatherData, settings)
  } catch (error) {
    logError(`Erro ao buscar clima de ${city.name}:`, error instanceof Error ? error.message : String(error))
  }
}

export async function handleDefaultCityWeather(settings: Settings): Promise<void> {
  const defaultCity = await getDefaultCity()

  if (!defaultCity) {
    logWarning("\nNenhuma cidade padrão definida. Use a opção 5 para establecer uma.")
    return
  }

  await getWeatherForCity(defaultCity, settings)
}

export async function handleAllCitiesWeather(settings: Settings): Promise<void> {
  const cities = await getAllCities()

  if (cities.length === 0) {
    logWarning("\nNenhuma cidade cadastrada. Use a opção 3 para adicionar cidades.")
    return
  }

  for (const city of cities) {
    await getWeatherForCity(city, settings)
  }
}