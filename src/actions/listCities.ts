import { getAllCities } from "../storage/citiesStorage"
import { City } from "../types/City"
import { logInfo } from "../presentation/output"

export async function listCities(): Promise<City[]> {
  const cities = await getAllCities()

  if (cities.length === 0) {
    return cities
  }

  logInfo("\nCidades cadastradas:")
  cities.forEach((city, i) => console.log(`  ${i + 1}. ${city.name}`))

  return cities
}