import { getJson } from "./http"
import { CityOption } from "../types/City"
import { GEOCODING_COUNT, GEOCODING_LANGUAGE } from "../utils/constants"

export async function searchCity(cityName: string): Promise<CityOption[] | null> {
  const encodedName = encodeURIComponent(cityName)
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedName}&count=${GEOCODING_COUNT}&language=${GEOCODING_LANGUAGE}&format=json`

  const json = await getJson<{ results?: any[] }>("de geocoding", url)
  if (!json.results || json.results.length === 0) {
    return null
  }

  const results: CityOption[] = json.results.map((result: any) => ({
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: result.country || "",
    admin1: result.admin1 || "",
    timezone: result.timezone || "",
    importance: result.importance
  }))

  return results.filter(
    (city, index, self) =>
      self.findIndex(
        (c) =>
          c.name === city.name &&
          c.country === city.country &&
          c.admin1 === city.admin1
      ) === index
  )
}