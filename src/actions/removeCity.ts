import { removeCity } from "../storage/citiesStorage"
import { City } from "../types/City"
import { askQuestion } from "../presentation/input"
import { listCities } from "./listCities"
import { logError, logSuccess, logWarning } from "../presentation/output"

export async function handleRemoveCity(): Promise<void> {
  const cities = await listCities()

  if (cities.length === 0) {
    logWarning("\nNenhuma cidade cadastrada.")
    return
  }

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
    logError("Cidade não encontrada.")
    return
  }

  const confirm = await askQuestion(
    `Tem certeza que deseja eliminar '${cityToRemove.name}'? (s/n): `
  )

  if (confirm.toLowerCase() !== "s" && confirm.toLowerCase() !== "sim") {
    logWarning("Operação cancelada.")
    return
  }

  const removed = await removeCity(cityToRemove.name)
  if (removed) {
    logSuccess(`Cidade '${cityToRemove.name}' eliminada com sucesso!`)
  } else {
    logError("Erro ao eliminar a cidade.")
  }
}