import { setDefaultCity, loadCities } from "../storage/citiesStorage"
import { City } from "../types/City"
import { askQuestion } from "../presentation/input"
import { logInfo } from "../presentation/output"
import { colors, colorize } from "../utils/colors"

export async function handleSetDefaultCity(): Promise<void> {
  const cities = await getAvailableCities()
  if (cities.length === 0) return

  const currentData = await loadCities()
  const currentDefault = currentData.defaultCity || "Nenhuma"
  console.log(colorize(`\nCidade default atual: ${currentDefault}`, colors.cyan))

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

async function getAvailableCities(): Promise<City[]> {
  const cities = await loadCities()
  if (cities.cities.length === 0) {
    console.log(colorize("\nNenhuma cidade cadastrada. Primeiro adicione uma cidade (opção 3).", colors.yellow))
    return []
  }
  logInfo("\nCidades disponíveis:")
  cities.cities.forEach((city, i) => console.log(`  ${i + 1}. ${city.name}`))
  return cities.cities
}