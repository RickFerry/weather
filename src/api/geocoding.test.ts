import { searchCity } from './geocoding'

describe('Geocoding API', () => {
  test('should find a single city for exact match', async () => {
    const cities = await searchCity('São Paulo')
    expect(cities).not.toBeNull()
    expect(cities).toBeInstanceOf(Array)
    expect(cities!.length).toBeGreaterThan(0)
  })

  test('should return multiple cities for ambiguous query', async () => {
    const cities = await searchCity('São')
    expect(cities).not.toBeNull()
    expect(cities!.length).toBeGreaterThan(1)
  })

  test('should return null for non-existent city', async () => {
    const cities = await searchCity('CidadeInexistente123')
    expect(cities).toBeNull()
  })
})