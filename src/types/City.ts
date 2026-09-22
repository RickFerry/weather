export interface City {
  name: string
  lat: number
  lon: number
}

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