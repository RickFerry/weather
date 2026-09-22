import { updateSettings, getSettings } from './settingsStorage'
import fs from 'fs/promises'
import path from 'path'

describe('SettingsStorage', () => {
  const DATA_FILE = path.join(process.cwd(), 'cities.json')
  let originalData: any

  beforeEach(async () => {
    try {
      const content = await fs.readFile(DATA_FILE, 'utf-8')
      originalData = JSON.parse(content)
    } catch (err) {
      originalData = null
    }
  })

  afterEach(async () => {
    if (originalData) {
      await fs.writeFile(DATA_FILE, JSON.stringify(originalData, null, 2), 'utf-8')
    } else {
      try {
        await fs.unlink(DATA_FILE)
      } catch (err) {
        // Ignore if file doesn't exist
      }
    }
  })

  test('should update temperature unit', async () => {
    const testData = {
      defaultCity: '',
      cities: [],
      settings: { temperatureUnit: 'celsius' as const }
    }
    await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8')

    await updateSettings({ temperatureUnit: 'fahrenheit' })

    const content = await fs.readFile(DATA_FILE, 'utf-8')
    const data = JSON.parse(content)
    expect(data.settings.temperatureUnit).toBe('fahrenheit')
  })

  test('should return default settings if file does not exist', async () => {
    try {
      await fs.unlink(DATA_FILE)
    } catch (err) {
      // Ignore if file doesn't exist
    }

    const settings = await getSettings()
    expect(settings.temperatureUnit).toBe('celsius')
  })
})