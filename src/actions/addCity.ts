import { searchCity } from "../api/geocoding"
import { addCity, setDefaultCity, loadCities } from "../storage/citiesStorage"
import { CityCoordinates } from "../types/City"
import { askQuestion } from "../presentation/input"
import { logError, logSuccess, logWarning, logInfo } from "../presentation/output"
import { colors, colorize } from "../utils/colors"

export async function handleSearchAndAddCity(preloadedName?: string): Promise<void> {
  const cityName = (preloadedName ?? (await askQuestion("\nDigite o nome da cidade: "))).trim()

  if (!cityName) {
    logError("Nome da cidade não pode ser vazio.")
    return
  }

  console.log(colorize(`Buscando cidade: ${cityName}...`, colors.yellow))

  try {
    const cities = await searchCity(cityName)

    if (!cities || cities.length === 0) {
      logError(`Cidade '${cityName}' não encontrada. Verifique o nome e tente novamente.`)
      return
    }

    let coordinates: CityCoordinates

    if (cities.length === 1) {
      coordinates = cities[0]
      const state = coordinates.admin1 ? ` (${coordinates.admin1})` : ""
      console.log(colorize(`\nCidade encontrada: ${coordinates.name}, ${coordinates.country || "desconhecido"}${state}`, colors.green))
      console.log(colorize(`Coordenadas: ${coordinates.latitude}, ${coordinates.longitude}`, colors.green))
    } else {
      console.log(colorize(`\nMúltiplas cidades encontradas para '${cityName}':`, colors.yellow))
      cities.forEach((city, i) => {
        const state = city.admin1 ? ` (${city.admin1})` : ""
        const importance = city.importance ? ` (importância: ${city.importance})` : ""
        console.log(colorize(`  ${i + 1}. ${city.name}, ${city.country || "desconhecido"}${state}${importance}`, colors.cyan))
      })
      const selection = await askQuestion("\nDigite o número da cidade desejada: ")
      const index = parseInt(selection) - 1
      if (isNaN(index) || index < 0 || index >= cities.length) {
        logError("Seleção inválida.")
        return
      }
      coordinates = cities[index]
      const state = coordinates.admin1 ? ` (${coordinates.admin1})` : ""
      console.log(colorize(`\nCidade selecionada: ${coordinates.name}, ${coordinates.country || "desconhecido"}${state}`, colors.green))
      console.log(colorize(`Coordenadas: ${coordinates.latitude}, ${coordinates.longitude}`, colors.green))
    }

    const confirm = await askQuestion("Deseja adicionar esta cidade? (s/n): ")

    if (confirm.toLowerCase() !== "s" && confirm.toLowerCase() !== "sim") {
      logWarning("Cidade não adicionada.")
      return
    }

    const city = {
      name: coordinates.name,
      lat: coordinates.latitude,
      lon: coordinates.longitude
    }

    const added = await addCity(city)
    if (added) {
      logSuccess(`Cidade '${coordinates.name}' adicionada com sucesso!`)
      const data = await loadCities()
      if (!data.defaultCity) {
        await setDefaultCity(coordinates.name)
        logSuccess(`Definida como cidade padrão.`)
      }
    } else {
      logWarning(`A cidade '${coordinates.name}' já está cadastrada.`)
    }
  } catch (error) {
    logError("Erro ao buscar cidade:", error instanceof Error ? error.message : String(error))
  }
}