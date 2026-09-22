import { getWeather } from "../api/weather"
import { getAllCities } from "../storage/citiesStorage"
import { Settings } from "../types/Settings"
import { logError, logWarning, printForecastTable } from "../presentation/output"
import { colors, colorize } from "../utils/colors"

export async function handle7DayForecast(settings: Settings): Promise<void> {
  const cities = await getAllCities()

  if (cities.length === 0) {
    logWarning("\nNenhuma cidade cadastrada. Primeiro adicione uma cidade (opção 3).")
    return
  }

  console.log(colorize("\nPrevisão de 7 dias:", colors.cyan))

  for (const city of cities) {
    console.log(colorize(`\n--- ${city.name} ---`, colors.green))

    try {
      const weatherData = await getWeather(city.lat, city.lon)
      printForecastTable(weatherData, settings)
    } catch (error) {
      logError(`Erro ao buscar previsão para ${city.name}:`, error instanceof Error ? error.message : String(error))
    }
  }
}