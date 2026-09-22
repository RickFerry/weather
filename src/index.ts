import { printMenu } from "./presentation/menu"
import { askQuestion } from "./presentation/input"
import { loadCities } from "./storage/citiesStorage"
import { handleDefaultCityWeather, handleAllCitiesWeather } from "./actions/getWeather"
import { handleSearchAndAddCity } from "./actions/addCity"
import { handleRemoveCity } from "./actions/removeCity"
import { handleSetDefaultCity } from "./actions/setDefaultCity"
import { handle7DayForecast } from "./actions/forecast"
import { handleSettings } from "./actions/settings"
import { Settings } from "./types/Settings"
import { colors, colorize } from "./utils/colors"

async function main(): Promise<void> {
  console.log(colorize("Carregando dados...", colors.yellow))

  const data = await loadCities()
  let settings: Settings = data.settings

  if (!data.defaultCity) {
    console.log(colorize("Bem-vindo ao Weather CLI!", colors.green + colors.bold))
    console.log(colorize("Use a opção 3 para adicionar sua primeira cidade.", colors.cyan))
  }

  while (true) {
    printMenu()
    const choice = await askQuestion("Selecciona una opción: ")

    switch (choice) {
      case "1":
        await handleDefaultCityWeather(settings)
        break
      case "2":
        await handleAllCitiesWeather(settings)
        break
      case "3":
        await handleSearchAndAddCity()
        break
      case "4":
        await handleRemoveCity()
        break
      case "5":
        await handleSetDefaultCity()
        break
      case "6":
        await handle7DayForecast(settings)
        break
      case "8":
        settings = await handleSettings(settings)
        break
      case "9":
        console.log(colorize("\nObrigado por usar Weather CLI!", colors.green))
        process.exit(0)
        break
      default:
        if (/^\d+$/.test(choice) || !choice.trim()) {
          console.log(colorize("Opção inválida. Por favor, selecciona uma opção válida.", colors.red))
        } else {
          await handleSearchAndAddCity(choice.trim())
        }
    }
  }
}

main().catch((err) => {
  console.error(colorize("Erro no aplicativo:", colors.red), err)
  process.exit(1)
})