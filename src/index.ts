import * as readline from "readline"
import {
  loadCities,
  getDefaultCity,
  setDefaultCity,
  addCity,
  removeCity,
  getAllCities,
  getSettings,
  updateSettings,
  City,
  Settings
} from "./data"
import { searchCity, getWeather, formatWeatherResponse, CityCoordinates } from "./api"
import { celsiusToFahrenheit, formatTemperature, colors, colorize, getColorTemperatureUnit, getWeatherDescription } from "./utils"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const inputBuffer: string[] = []
const waiters: Array<(line: string) => void> = []
rl.on("line", (line) => {
  const waiter = waiters.shift()
  if (waiter) waiter(line)
  else inputBuffer.push(line)
})

function askQuestion(query: string): Promise<string> {
  process.stdout.write(query)
  if (inputBuffer.length) return Promise.resolve(inputBuffer.shift()!.trim())
  return new Promise((resolve) => waiters.push((line) => resolve(line.trim())))
}

function printHeader(title: string): void {
  const width = 45
  const topBottom = "═".repeat(width)
  const paddedTitle = title.padStart(Math.ceil((width - title.length) / 2 + title.length), " ")
  console.log("\n" + topBottom)
  console.log(colorize(paddedTitle, colors.cyan + colors.bold))
  console.log(topBottom)
}

function printMenu(): void {
  printHeader("WEATHER CLI")
  console.log("  1. " + colorize("Clima de cidade default", colors.cyan))
  console.log("  2. " + colorize("Clima de todas as cidades", colors.cyan))
  console.log("  3. " + colorize("Buscar y agregar ciudad", colors.cyan))
  console.log("  4. " + colorize("Eliminar ciudad", colors.cyan))
  console.log("  5. " + colorize("Establecer ciudad default", colors.cyan))
  console.log("  6. " + colorize("Previsão de 7 dias", colors.cyan))
  console.log("  8. " + colorize("Ajustes (°C/°F)", colors.cyan))
  console.log("  9. " + colorize("Salir", colors.red))
  console.log("═".repeat(45))
}

async function getWeatherForCity(city: City, settings: Settings): Promise<void> {
  console.log(colorize(`\nBuscando clima para ${city.name}...`, colors.yellow))

  try {
    const weatherData = await getWeather(city.lat, city.lon)
    const formatted = await formatWeatherResponse(weatherData, settings.temperatureUnit)

    if (settings.temperatureUnit === "fahrenheit") {
      formatted.temperature = celsiusToFahrenheit(weatherData.current!.temperature_2m)
    }

    console.log("\n--- " + colorize("Clima atual", colors.green) + " ---")
    console.log(`Cidade: ${city.name}, ${weatherData.timezone}`)
    console.log(`Temperatura: ${colorize(formatTemperature(formatted.temperature, settings.temperatureUnit), getColorTemperatureUnit(settings.temperatureUnit))}`)
    console.log(`Condição: ${formatted.description}`)
    console.log(`Umidade: ${formatted.humidity}%`)
    console.log(`Velocidade do vento: ${formatted.windSpeed} km/h`)
    console.log(`Direção do vento: ${formatted.windDirection}°`)
    console.log("---")
  } catch (error) {
    console.error(colorize(`Erro ao buscar clima de ${city.name}:`, colors.red), error instanceof Error ? error.message : String(error))
  }
}

async function handleDefaultCityWeather(settings: Settings): Promise<void> {
  const defaultCity = await getDefaultCity()

  if (!defaultCity) {
    console.log("\nNenhuma cidade padrão definida. Use a opção 5 para establecer uma.")
    return
  }

  await getWeatherForCity(defaultCity, settings)
}

async function handleAllCitiesWeather(settings: Settings): Promise<void> {
  const cities = await getAllCities()

  if (cities.length === 0) {
    console.log("\nNenhuma cidade cadastrada. Use a opção 3 para adicionar cidades.")
    return
  }

  for (const city of cities) {
    await getWeatherForCity(city, settings)
  }
}

async function handleSearchAndAddCity(preloadedName?: string): Promise<void> {
  const cityName = (preloadedName ?? (await askQuestion("\nDigite o nome da cidade: "))).trim()

  if (!cityName) {
    console.log(colorize("Nome da cidade não pode ser vazio.", colors.red))
    return
  }

  console.log(colorize(`Buscando cidade: ${cityName}...`, colors.yellow))

  try {
    const cities = await searchCity(cityName)

    if (!cities || cities.length === 0) {
      console.log(colorize(`Cidade \'${cityName}\' não encontrada. Verifique o nome e tente novamente.`, colors.red))
      return
    }

    let coordinates: CityCoordinates

    if (cities.length === 1) {
      coordinates = cities[0]
      const state = coordinates.admin1 ? ` (${coordinates.admin1})` : ""
      console.log(colorize(`\nCidade encontrada: ${coordinates.name}, ${coordinates.country || "desconhecido"}${state}`, colors.green))
      console.log(colorize(`Coordenadas: ${coordinates.latitude}, ${coordinates.longitude}`, colors.green))
    } else {
      console.log(colorize(`\nMúltiplas cidades encontradas para \'${cityName}\':`, colors.yellow))
      cities.forEach((city, i) => {
        const state = city.admin1 ? ` (${city.admin1})` : ""
        const importance = city.importance ? ` (importância: ${city.importance})` : ""
        console.log(colorize(`  ${i + 1}. ${city.name}, ${city.country || "desconhecido"}${state}${importance}`, colors.cyan))
      })
      const selection = await askQuestion("\nDigite o número da cidade desejada: ")
      const index = parseInt(selection) - 1
      if (isNaN(index) || index < 0 || index >= cities.length) {
        console.log(colorize("Seleção inválida.", colors.red))
        return
      }
      coordinates = cities[index]
      const state = coordinates.admin1 ? ` (${coordinates.admin1})` : ""
      console.log(colorize(`\nCidade selecionada: ${coordinates.name}, ${coordinates.country || "desconhecido"}${state}`, colors.green))
      console.log(colorize(`Coordenadas: ${coordinates.latitude}, ${coordinates.longitude}`, colors.green))
    }

    const confirm = await askQuestion("Deseja adicionar esta cidade? (s/n): ")

    if (confirm.toLowerCase() !== "s" && confirm.toLowerCase() !== "sim") {
      console.log(colorize("Cidade não adicionada.", colors.yellow))
      return
    }

    const city: City = {
      name: coordinates.name,
      lat: coordinates.latitude,
      lon: coordinates.longitude
    }

    const added = await addCity(city)
    if (added) {
      console.log(colorize(`Cidade \'${coordinates.name}\' adicionada com sucesso!`, colors.green))
      const data = await loadCities()
      if (!data.defaultCity) {
        await setDefaultCity(coordinates.name)
        console.log(colorize(`Definida como cidade padrão.`, colors.green))
      }
    } else {
      console.log(colorize(`A cidade \'${coordinates.name}\' já está cadastrada.`, colors.yellow))
    }
  } catch (error) {
    console.error(colorize("Erro ao buscar cidade:", colors.red), error instanceof Error ? error.message : String(error))
  }
}

async function handleRemoveCity(): Promise<void> {
  const cities = await getAllCities()

  if (cities.length === 0) {
    console.log(colorize("\nNenhuma cidade cadastrada.", colors.yellow))
    return
  }

  console.log(colorize("\nCidades cadastradas:", colors.cyan))
  cities.forEach((city, i) => console.log(`  ${i + 1}. ${city.name}`))

  const input = await askQuestion("\nDigite o número ou nome da cidade a eliminar: ")

  let cityToRemove: City | null = null

  if (/^\d+$/.test(input)) {
    const index = parseInt(input) - 1
    if (index >= 0 && index < cities.length) {
      cityToRemove = cities[index]
    }
  } else {
    cityToRemove = cities.find(
      (c) => c.name.toLowerCase() === input.toLowerCase()
    ) || null
  }

  if (!cityToRemove) {
    console.log(colorize("Cidade não encontrada.", colors.red))
    return
  }

  const confirm = await askQuestion(
    `Tem certeza que deseja eliminar '${cityToRemove.name}'? (s/n): `
  )

  if (confirm.toLowerCase() !== "s" && confirm.toLowerCase() !== "sim") {
    console.log(colorize("Operação cancelada.", colors.yellow))
    return
  }

  const removed = await removeCity(cityToRemove.name)
  if (removed) {
    console.log(colorize(`Cidade '${cityToRemove.name}' eliminada com sucesso!`, colors.green))
  } else {
    console.log(colorize(`Erro ao eliminar a cidade.`, colors.red))
  }
}

async function handleSetDefaultCity(): Promise<void> {
  const cities = await getAllCities()

  if (cities.length === 0) {
    console.log(colorize("\nNenhuma cidade cadastrada. Primeiro adicione uma cidade (opção 3).", colors.yellow))
    return
  }

  const currentData = await loadCities()
  const currentDefault = currentData.defaultCity || "Nenhuma"

  console.log(colorize(`\nCidade default atual: ${currentDefault}`, colors.cyan))
  console.log(colorize("Cidades disponíveis:", colors.cyan))
  cities.forEach((city, i) => console.log(`  ${i + 1}. ${city.name}`))

  const input = await askQuestion("\nDigite o número ou nome da cidade: ")

  let cityToSet: City | null = null

  if (/^\d+$/.test(input)) {
    const index = parseInt(input) - 1
    if (index >= 0 && index < cities.length) {
      cityToSet = cities[index]
    }
  } else {
    cityToSet = cities.find(
      (c) => c.name.toLowerCase() === input.toLowerCase()
    ) || null
  }

  if (!cityToSet) {
    console.log("Cidade não encontrada.")
    return
  }

  await setDefaultCity(cityToSet.name)
  console.log(`Cidade default definida para: ${cityToSet.name}`)
}

async function handleSettings(settings: Settings): Promise<Settings> {
  console.log(colorize(`\nConfigurações atuais:`, colors.cyan))
  console.log(`  Unidade de temperatura: ${colorize(settings.temperatureUnit === "celsius" ? "°C" : "°F", getColorTemperatureUnit(settings.temperatureUnit))}`)

  const choice = await askQuestion("\nDigite 'c' para °C ou 'f' para °F: ")

  let newUnit: "celsius" | "fahrenheit" = settings.temperatureUnit

  if (choice.toLowerCase() === "c") {
    newUnit = "celsius"
  } else if (choice.toLowerCase() === "f") {
    newUnit = "fahrenheit"
  } else {
    console.log(colorize("Opção inválida. Mantendo configuração atual.", colors.red))
    return settings
  }

  const updatedSettings: Settings = { ...settings, temperatureUnit: newUnit }
  await updateSettings(updatedSettings)
  console.log(colorize(`Unidade de temperatura atualizada para ${newUnit === "celsius" ? "°C" : "°F"}`, colors.green))

  return updatedSettings
}

async function handle7DayForecast(settings: Settings): Promise<void> {
  const cities = await getAllCities()

  if (cities.length === 0) {
    console.log(colorize("\nNenhuma cidade cadastrada. Primeiro adicione uma cidade (opção 3).", colors.yellow))
    return
  }

  console.log(colorize("\nPrevisão de 7 dias:", colors.cyan))

  for (const city of cities) {
    console.log(colorize(`\n--- ${city.name} ---`, colors.green))

    try {
      const weatherData = await getWeather(city.lat, city.lon)
      const daily = weatherData.daily

      if (daily && daily.time && daily.time.length > 0) {
        console.log(colorize(`Data       | ${settings.temperatureUnit === "celsius" ? "Temp Max" : "Temp Max"} | ${settings.temperatureUnit === "celsius" ? "Temp Min" : "Temp Min"} | Tempo`, colors.cyan))
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
      } else {
        console.log(colorize("Dados de previsão não disponíveis.", colors.red))
      }
    } catch (error) {
      console.error(colorize(`Erro ao buscar previsão para ${city.name}:`, colors.red), error instanceof Error ? error.message : String(error))
    }
  }
}

async function main(): Promise<void> {
  console.log(colorize("Carregando dados...", colors.yellow))

  let settings = await getSettings()
  const data = await loadCities()
  settings = data.settings

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
