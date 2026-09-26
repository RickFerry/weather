"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const citiesStorage_1 = require("../../src/storage/citiesStorage");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
describe('CitiesStorage', () => {
    const DATA_FILE = path_1.default.join(process.cwd(), 'cities.json');
    let originalData;
    beforeEach(async () => {
        try {
            const content = await promises_1.default.readFile(DATA_FILE, 'utf-8');
            originalData = JSON.parse(content);
        }
        catch (err) {
            originalData = null;
        }
    });
    afterEach(async () => {
        if (originalData) {
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(originalData, null, 2), 'utf-8');
        }
        else {
            try {
                await promises_1.default.unlink(DATA_FILE);
            }
            catch (err) {
                // Ignore if file doesn't exist
            }
        }
    });
    describe('loadCities', () => {
        test('should load existing cities.json file', async () => {
            const testData = {
                defaultCity: 'Test City',
                cities: [
                    { name: 'Test City', lat: 0, lon: 0 },
                    { name: 'Another City', lat: 1, lon: 1 }
                ],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.defaultCity).toBe('Test City');
            expect(loaded.cities).toHaveLength(2);
            expect(loaded.cities[0].name).toBe('Test City');
            expect(loaded.cities[1].name).toBe('Another City');
        });
        test('should create default data if file does not exist', async () => {
            try {
                await promises_1.default.unlink(DATA_FILE);
            }
            catch (err) {
                // Ignore if file doesn't exist
            }
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.defaultCity).toBe('');
            expect(loaded.cities).toHaveLength(0);
            expect(loaded.settings.temperatureUnit).toBe('celsius');
        });
        test('should fall back to defaults and warn on malformed JSON', async () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            await promises_1.default.writeFile(DATA_FILE, '{ isto nao e json', 'utf-8');
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded).toEqual({
                defaultCity: '',
                cities: [],
                settings: { temperatureUnit: 'celsius' }
            });
            expect(errorSpy).toHaveBeenCalledWith('Erro ao carregar dados. Usando dados padrão.');
            errorSpy.mockRestore();
        });
        test('should fall back to defaults when defaultCity has wrong type', async () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify({ defaultCity: 42, cities: [], settings: { temperatureUnit: 'celsius' } }), 'utf-8');
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.defaultCity).toBe('');
            expect(loaded.cities).toHaveLength(0);
            errorSpy.mockRestore();
        });
        test('should fall back to defaults when cities is not an array', async () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify({ defaultCity: '', cities: 'nao-lista', settings: { temperatureUnit: 'celsius' } }), 'utf-8');
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.cities).toHaveLength(0);
            errorSpy.mockRestore();
        });
        test('should fall back to defaults when settings are missing', async () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify({ defaultCity: '', cities: [] }), 'utf-8');
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.settings.temperatureUnit).toBe('celsius');
            errorSpy.mockRestore();
        });
        test('should fall back to defaults when temperatureUnit is not a string', async () => {
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify({ defaultCity: '', cities: [], settings: { temperatureUnit: 99 } }), 'utf-8');
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.settings.temperatureUnit).toBe('celsius');
            errorSpy.mockRestore();
        });
    });
    describe('saveCities', () => {
        test('should save data to cities.json', async () => {
            const testData = {
                defaultCity: 'Test City',
                cities: [{ name: 'Test City', lat: 0, lon: 0 }],
                settings: { temperatureUnit: 'celsius' }
            };
            await (0, citiesStorage_1.saveCities)(testData);
            const content = await promises_1.default.readFile(DATA_FILE, 'utf-8');
            const saved = JSON.parse(content);
            expect(saved.defaultCity).toBe('Test City');
            expect(saved.cities).toHaveLength(1);
            expect(saved.cities[0].name).toBe('Test City');
        });
    });
    describe('getDefaultCity', () => {
        test('should return default city when it exists', async () => {
            const testData = {
                defaultCity: 'São Paulo',
                cities: [
                    { name: 'São Paulo', lat: -23.5475, lon: -46.63611 },
                    { name: 'Rio de Janeiro', lat: -22.90642, lon: -43.18223 }
                ],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const city = await (0, citiesStorage_1.getDefaultCity)();
            expect(city).not.toBeNull();
            expect(city?.name).toBe('São Paulo');
        });
        test('should return null when no default city is set', async () => {
            const testData = {
                defaultCity: '',
                cities: [{ name: 'São Paulo', lat: -23.5475, lon: -46.63611 }],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const city = await (0, citiesStorage_1.getDefaultCity)();
            expect(city).toBeNull();
        });
        test('should match the default city case-insensitively', async () => {
            const testData = {
                defaultCity: 'são paulo',
                cities: [{ name: 'São Paulo', lat: -23.5475, lon: -46.63611 }],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const city = await (0, citiesStorage_1.getDefaultCity)();
            expect(city?.name).toBe('São Paulo');
        });
        test('should return null when the default city is not in the list', async () => {
            const testData = {
                defaultCity: 'Cidade Removida',
                cities: [{ name: 'São Paulo', lat: -23.5475, lon: -46.63611 }],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            expect(await (0, citiesStorage_1.getDefaultCity)()).toBeNull();
        });
    });
    describe('setDefaultCity', () => {
        test('should set default city successfully', async () => {
            const testData = {
                defaultCity: '',
                cities: [
                    { name: 'São Paulo', lat: -23.5475, lon: -46.63611 },
                    { name: 'Rio de Janeiro', lat: -22.90642, lon: -43.18223 }
                ],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const result = await (0, citiesStorage_1.setDefaultCity)('São Paulo');
            expect(result).toBe(true);
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.defaultCity).toBe('São Paulo');
        });
        test('should return false if city does not exist', async () => {
            const testData = {
                defaultCity: '',
                cities: [{ name: 'São Paulo', lat: -23.5475, lon: -46.63611 }],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const result = await (0, citiesStorage_1.setDefaultCity)('Rio de Janeiro');
            expect(result).toBe(false);
        });
    });
    describe('addCity', () => {
        test('should add new city successfully', async () => {
            const testData = {
                defaultCity: '',
                cities: [],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const city = { name: 'São Paulo', lat: -23.5475, lon: -46.63611 };
            const result = await (0, citiesStorage_1.addCity)(city);
            expect(result).toBe(true);
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.cities).toHaveLength(1);
            expect(loaded.cities[0].name).toBe('São Paulo');
        });
        test('should not add duplicate city', async () => {
            const testData = {
                defaultCity: '',
                cities: [{ name: 'São Paulo', lat: -23.5475, lon: -46.63611 }],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const city = { name: 'São Paulo', lat: -23.5475, lon: -46.63611 };
            const result = await (0, citiesStorage_1.addCity)(city);
            expect(result).toBe(false);
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.cities).toHaveLength(1);
        });
    });
    describe('removeCity', () => {
        test('should remove city by name successfully', async () => {
            const testData = {
                defaultCity: 'São Paulo',
                cities: [
                    { name: 'São Paulo', lat: -23.5475, lon: -46.63611 },
                    { name: 'Rio de Janeiro', lat: -22.90642, lon: -43.18223 }
                ],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const result = await (0, citiesStorage_1.removeCity)('São Paulo');
            expect(result).toBe(true);
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.cities).toHaveLength(1);
            expect(loaded.cities[0].name).toBe('Rio de Janeiro');
            expect(loaded.defaultCity).toBe('');
        });
        test('should not remove non-existent city', async () => {
            const testData = {
                defaultCity: '',
                cities: [{ name: 'São Paulo', lat: -23.5475, lon: -46.63611 }],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const result = await (0, citiesStorage_1.removeCity)('Rio de Janeiro');
            expect(result).toBe(false);
            const loaded = await (0, citiesStorage_1.loadCities)();
            expect(loaded.cities).toHaveLength(1);
        });
    });
    describe('getAllCities', () => {
        test('should return all cities', async () => {
            const testData = {
                defaultCity: '',
                cities: [
                    { name: 'São Paulo', lat: -23.5475, lon: -46.63611 },
                    { name: 'Rio de Janeiro', lat: -22.90642, lon: -43.18223 },
                    { name: 'Salvador', lat: -12.97563, lon: -38.49096 }
                ],
                settings: { temperatureUnit: 'celsius' }
            };
            await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
            const cities = await (0, citiesStorage_1.getAllCities)();
            expect(cities).toHaveLength(3);
            expect(cities[0].name).toBe('São Paulo');
            expect(cities[1].name).toBe('Rio de Janeiro');
            expect(cities[2].name).toBe('Salvador');
        });
    });
});
