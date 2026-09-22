import fs from "fs/promises"
import path from "path"

const DATA_FILE = path.join(process.cwd(), "cities.json")

export interface City {
  name: string
  lat: number
  lon: number
}

export interface Settings {
  temperatureUnit: "celsius" | "fahrenheit"
}

export interface CityData {
  defaultCity: string
  cities: City[]
  settings: Settings
}

const DEFAULT_DATA: CityData = {
  defaultCity: "",
  cities: [],
  settings: {
    temperatureUnit: "celsius"
  }
}

export async function loadCities(): Promise<CityData> {
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8")
    const data = JSON.parse(content) as CityData
    validateData(data)
    return data
  } catch (err: any) {
    if (err.code === "ENOENT") {
      await saveCities(DEFAULT_DATA)
      return DEFAULT_DATA
    }
    console.error("Erro ao carregar dados. Usando dados padrão.")
    return DEFAULT_DATA
  }
}

export async function saveCities(data: CityData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
}

function validateData(data: any): asserts data is CityData {
  if (typeof data.defaultCity !== "string") throw new Error("Invalid defaultCity")
  if (!Array.isArray(data.cities)) throw new Error("Invalid cities")
  if (!data.settings || typeof data.settings.temperatureUnit !== "string") {
    throw new Error("Invalid settings")
  }
}

export async function getDefaultCity(): Promise<City | null> {
  const data = await loadCities()
  if (!data.defaultCity) return null
  const city = data.cities.find(
    (c) => c.name.toLowerCase() === data.defaultCity.toLowerCase()
  )
  return city || null
}

export async function setDefaultCity(cityName: string): Promise<boolean> {
  const data = await loadCities()
  const exists = data.cities.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  )
  if (!exists) return false
  data.defaultCity = cityName
  await saveCities(data)
  return true
}

export async function addCity(city: City): Promise<boolean> {
  const data = await loadCities()
  const exists = data.cities.find(
    (c) => c.name.toLowerCase() === city.name.toLowerCase()
  )
  if (exists) return false
  data.cities.push(city)
  await saveCities(data)
  return true
}

export async function removeCity(cityName: string): Promise<boolean> {
  const data = await loadCities()
  const index = data.cities.findIndex(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  )
  if (index === -1) return false
  const removed = data.cities.splice(index, 1)[0]
  if (data.defaultCity.toLowerCase() === removed.name.toLowerCase()) {
    data.defaultCity = ""
  }
  await saveCities(data)
  return true
}

export async function getAllCities(): Promise<City[]> {
  const data = await loadCities()
  return data.cities
}

export async function updateSettings(settings: Settings): Promise<void> {
  const data = await loadCities()
  data.settings = settings
  await saveCities(data)
}

export async function getSettings(): Promise<Settings> {
  const data = await loadCities()
  return data.settings
}
