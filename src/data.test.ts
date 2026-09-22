import { loadCities, saveCities, getDefaultCity, setDefaultCity, addCity, removeCity, getAllCities, updateSettings, getSettings } from './data'
import fs from 'fs/promises'
import path from 'path'

describe('Data module', () => {
  const DATA_FILE = path.join(process.cwd(), 'cities.json')
  let originalData: any

  beforeEach(async () => {
    // Save original data before each test
    try {
      const content = await fs.readFile(DATA_FILE, 'utf-8')
      originalData = JSON.parse(content)
    } catch (err) {
      // File doesn't exist yet, use default
      originalData = null
    }
  })

  afterEach(async () => {
    // Restore original data after each test
    if (originalData) {
      await fs.writeFile(DATA_FILE, JSON.stringify(originalData, null, 2), 'utf-8')
    } else {
      // Clean up test file if it exists
      try {
        await fs.unlink(DATA_FILE)
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }
  })

  describe('loadCities', () => {
    test('should load existing cities.json file', async () => {
      // Create test data file
      const testData: {
        defaultCity: string;
        cities: { name: string; lat: number; lon: number; }[];
      } = {
        defaultCity: 'Test City',
        cities: [
          { name: 'Test City', lat: 0, lon: 0 },
          { name: 'Another City', lat: 1, lon: 1 }
        ]
      }
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const loaded = await loadCities()
      expect(loaded.defaultCity).toBe('Test City')
      expect(loaded.cities).toHaveLength(2)
      expect(loaded.cities[0].name).toBe('Test City')
      expect(loaded.cities[1].name).toBe('Another City')
    })

    test('should create default data if file does not exist', async () => {
      // Ensure test file doesn't exist
      try {
        await fs.unlink(DATA_FILE)
      } catch (err) {
        // Ignore
      }

      const loaded = await loadCities()
      expect(loaded.defaultCity).toBe('')
      expect(loaded.cities).toHaveLength(0)
      expect(loaded.settings.temperatureUnit).toBe('celsius')
    })
  })

  describe('saveCities', () => {
    test('should save data to cities.json', async () => {
      const testData: {
        defaultCity: string;
        cities: { name: string; lat: number; lon: number; }[];
        settings: { temperatureUnit: "celsius" | "fahrenheit" };
      } = {
        defaultCity: 'Test City',
        cities: [{ name: 'Test City', lat: 0, lon: 0 }],
        settings: { temperatureUnit: 'celsius' as const }
      }

      await saveCities(testData)

      const content = await fs.readFile(DATA_FILE, 'utf-8')
      const saved = JSON.parse(content)
      expect(saved.defaultCity).toBe('Test City')
      expect(saved.cities).toHaveLength(1)
      expect(saved.cities[0].name).toBe('Test City')
    })
  })

  describe('getDefaultCity', () => {
    test('should return default city when it exists', async () => {
      const testData: {
        defaultCity: string;
        cities: { name: string; lat: number; lon: number; }[];
      } = {
        defaultCity: 'São Paulo',
        cities: [
          { name: 'São Paulo', lat: -23.5475, lon: -46.63611 },
          { name: 'Rio de Janeiro', lat: -22.90642, lon: -43.18223 }
        ]
      }
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const city = await getDefaultCity()
      expect(city).not.toBeNull()
      expect(city?.name).toBe('São Paulo')
    })

    test('should return null when no default city is set', async () => {
      const testData: {
        defaultCity: string;
        cities: { name: string; lat: number; lon: number; }[];
      } = {
        defaultCity: '',
        cities: [
          { name: 'São Paulo', lat: -23.5475, lon: -46.63611 }
        ]
      }
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const city = await getDefaultCity()
      expect(city).toBeNull()
    })
  })

  describe('setDefaultCity', () => {
    test('should set default city successfully', async () => {
      const testData = {
        defaultCity: '',
        cities: [
          { name: 'São Paulo', lat: -23.5475, lon: -46.63611 },
          { name: 'Rio de Janeiro', lat: -22.90642, lon: -43.18223 }
      ]
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const result = await setDefaultCity('São Paulo')
      expect(result).toBe(true)

      const loaded = await loadCities()
      expect(loaded.defaultCity).toBe('São Paulo')
    })

    test('should return false if city does not exist', async () => {
      const testData = {
        defaultCity: '',
        cities: [
          { name: 'São Paulo', lat: -23.5475, lon: -46.63611 }
      ]
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const result = await setDefaultCity('Rio de Janeiro')
      expect(result).toBe(false)
    })
  })

  describe('addCity', () => {
    test('should add new city successfully', async () => {
      const testData = {
        defaultCity: '',
        cities: [],
        settings: { temperatureUnit: 'celsius' as const }
      }
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const city = { name: 'São Paulo', lat: -23.5475, lon: -46.63611 }
      const result = await addCity(city)
      expect(result).toBe(true)

      const loaded = await loadCities()
      expect(loaded.cities).toHaveLength(1)
      expect(loaded.cities[0].name).toBe('São Paulo')
    })

    test('should not add duplicate city', async () => {
      const testData = {
        defaultCity: '',
        cities: [{ name: 'São Paulo', lat: -23.5475, lon: -46.63611 }],
        settings: { temperatureUnit: 'celsius' as const }
      }
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const city = { name: 'São Paulo', lat: -23.5475, lon: -46.63611 }
      const result = await addCity(city)
      expect(result).toBe(false)

      const loaded = await loadCities()
      expect(loaded.cities).toHaveLength(1)
    })
  })

  describe('removeCity', () => {
    test('should remove city by name successfully', async () => {
      const testData = {
        defaultCity: 'São Paulo',
        cities: [
          { name: 'São Paulo', lat: -23.5475, lon: -46.63611 },
          { name: 'Rio de Janeiro', lat: -22.90642, lon: -43.18223 }
      ]
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const result = await removeCity('São Paulo')
      expect(result).toBe(true)

      const loaded = await loadCities()
      expect(loaded.cities).toHaveLength(1)
      expect(loaded.cities[0].name).toBe('Rio de Janeiro')
      expect(loaded.defaultCity).toBe('')
    })

    test('should not remove non-existent city', async () => {
      const testData = {
        defaultCity: '',
        cities: [{ name: 'São Paulo', lat: -23.5475, lon: -46.63611 }]
      }
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const result = await removeCity('Rio de Janeiro')
      expect(result).toBe(false)

      const loaded = await loadCities()
      expect(loaded.cities).toHaveLength(1)
    })
  })

  describe('getAllCities', () => {
    test('should return all cities', async () => {
      const testData = {
        defaultCity: '',
        cities: [
          { name: 'São Paulo', lat: -23.5475, lon: -46.63611 },
          { name: 'Rio de Janeiro', lat: -22.90642, lon: -43.18223 },
          { name: 'Salvador', lat: -12.97563, lon: -38.49096 }
      ]
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const cities = await getAllCities()
      expect(cities).toHaveLength(3)
      expect(cities[0].name).toBe('São Paulo')
      expect(cities[1].name).toBe('Rio de Janeiro')
      expect(cities[2].name).toBe('Salvador')
    })
  })

  describe('settings', () => {
    test('should update temperature unit', async () => {
      const testData = {
        defaultCity: '',
        cities: [],
        settings: { temperatureUnit: 'celsius' as const }
      }
      await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

      const updatedSettings = { temperatureUnit: 'fahrenheit' as const }
      await updateSettings(updatedSettings)

      const loaded = await loadCities()
      expect(loaded.settings.temperatureUnit).toBe('fahrenheit')
    })

    test('should return default settings if file does not exist', async () => {
      try {
        await fs.unlink(DATA_FILE)
      } catch (err) {
        // Ignore
      }

      const settings = await getSettings()
      expect(settings.temperatureUnit).toBe('celsius')
    })
  })
}
