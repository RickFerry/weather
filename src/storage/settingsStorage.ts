import { Settings } from "../types/Settings"
import { loadCities, saveCities } from "./citiesStorage"

export async function updateSettings(settings: Settings): Promise<void> {
  const data = await loadCities()
  data.settings = settings
  await saveCities(data)
}

export async function getSettings(): Promise<Settings> {
  const data = await loadCities()
  return data.settings
}