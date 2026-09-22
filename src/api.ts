import https from "https"
import { URL } from "url"

export interface CityCoordinates {
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
  timezone: string
}

export interface CityOption extends CityCoordinates {
  importance?: number
}

export interface WeatherData {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current: {
    time: string
    interval: number
    temperature_2m: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    relative_humidity_2m: number
  }
  hourly?: any
  daily?: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
  }
}

export interface FormattedWeather {
  location: string
  temperature: number
  unit: "celsius" | "fahrenheit"
  weatherCode: number
  windSpeed: number
  windDirection: number
  humidity: number
  description: string
  time: string
}

function getJson<T>(
  apiLabel: string,
  url: string,
  retries = 1,
  timeoutMs = 15000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = (remaining: number) => {
      const req = https.get(url, (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          try {
            resolve(JSON.parse(data) as T)
          } catch (err) {
            reject(new Error(`Erro ao parsear resposta da API ${apiLabel}: ${err}`))
          }
        })
      })

      req.on("error", (err) => {
        if (remaining > 0) attempt(remaining - 1)
        else reject(err)
      })

      req.setTimeout(timeoutMs, () => {
        req.destroy()
        if (remaining > 0) attempt(remaining - 1)
        else reject(new Error(`Timeout da API ${apiLabel}`))
      })
    }

    attempt(retries)
  })
}

export async function searchCity(cityName: string): Promise<CityOption[] | null> {
  const encodedName = encodeURIComponent(cityName)
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedName}&count=15&language=pt&format=json`

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

export async function getWeather(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&format=json`

  const json = await getJson<any>("de weather", url)
  if (json.error) {
    throw new Error(`Erro na API OpenMeteo: ${json.error}`)
  }
  return json
}

export async function formatWeatherResponse(
  data: WeatherData,
  unit: "celsius" | "fahrenheit" = "celsius"
): Promise<FormattedWeather> {
  const current = data.current
  const description = getWeatherDescription(current.weather_code)

  return {
    location: `${data.latitude}, ${data.longitude}`,
    temperature: current.temperature_2m,
    unit,
    weatherCode: current.weather_code,
    windSpeed: current.wind_speed_10m,
    windDirection: current.wind_direction_10m,
    humidity: current.relative_humidity_2m,
    description,
    time: current.time
  }
}

function getWeatherDescription(code: number): string {
  const weatherDescriptions: { [key: number]: string } = {
    0: "Céu limpo",
    1: "Predominantemente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    4: "Nevoeiro costeiro",
    5: "Garoa de nevoeiro",
    6: "Garoa",
    7: "Garoa de neve",
    8: "Neve",
    9: "Rajadas de neve",
    10: "Tormenta de neve",
    11: "Tempestade de neve",
    12: "Garoa congelante",
    13: "Tempestade de chuva",
    14: "Granizo",
    15: "Garoa de granizo",
    16: "Rajadas de tempestade",
    17: "Tempestade de neve",
    18: "Rajadas de tempestade",
    19: "Rajadas de tempestade"
  }

  return weatherDescriptions[code] || "Condições desconhecidas"
}

export async function getCityWeather(
  cityName: string,
  latitude?: number,
  longitude?: number
): Promise<{ location: CityCoordinates | null; weather: FormattedWeather | null; error: string | null }> {
  let location: CityCoordinates | null = null

  if (latitude && longitude) {
    location = {
      name: cityName,
      latitude,
      longitude,
      country: "",
      timezone: ""
    }
  } else {
    const cities = await searchCity(cityName)
    if (!cities || cities.length === 0) {
      return { location: null, weather: null, error: `Cidade \'${cityName}\' não encontrada` }
    }
    location = cities[0]
  }

  try {
    const weatherData = await getWeather(location!.latitude, location!.longitude)
    const formattedWeather = await formatWeatherResponse(weatherData)
    return { location, weather: formattedWeather, error: null }
  } catch (error) {
    return { location, weather: null, error: error instanceof Error ? error.message : "Erro desconhecido" }
  }
}
