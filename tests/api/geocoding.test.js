"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const geocoding_1 = require("../../src/api/geocoding");
const http_1 = require("../../src/api/http");
jest.mock('../../src/api/http', () => ({
    getJson: jest.fn()
}));
const mockedGetJson = http_1.getJson;
describe('Geocoding API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('should find a single city for exact match', async () => {
        mockedGetJson.mockResolvedValueOnce({
            results: [{ name: 'São Paulo', latitude: -23.5475, longitude: -46.63611, country: 'Brasil' }]
        });
        const cities = await (0, geocoding_1.searchCity)('São Paulo');
        expect(cities).not.toBeNull();
        expect(cities).toBeInstanceOf(Array);
        expect(cities.length).toBeGreaterThan(0);
        expect(cities[0].name).toBe('São Paulo');
    });
    test('should return multiple cities for ambiguous query', async () => {
        mockedGetJson.mockResolvedValueOnce({
            results: [
                { name: 'São Paulo', latitude: -23.5475, longitude: -46.63611, country: 'Brasil' },
                { name: 'São José dos Campos', latitude: -23.19, longitude: -45.89, country: 'Brasil' }
            ]
        });
        const cities = await (0, geocoding_1.searchCity)('São');
        expect(cities).not.toBeNull();
        expect(cities.length).toBeGreaterThan(1);
    });
    test('should return null for non-existent city', async () => {
        mockedGetJson.mockResolvedValueOnce({ results: [] });
        const cities = await (0, geocoding_1.searchCity)('CidadeInexistente123');
        expect(cities).toBeNull();
    });
    test('should request 15 results with pt language from the geocoding API', async () => {
        mockedGetJson.mockResolvedValueOnce({
            results: [{ name: 'Teste', latitude: 1, longitude: 2, country: 'Brasil' }]
        });
        await (0, geocoding_1.searchCity)('Teste');
        const url = mockedGetJson.mock.calls[0][1];
        expect(url).toContain('count=15');
        expect(url).toContain('language=pt');
        expect(url).toContain('format=json');
        expect(url).toContain(encodeURIComponent('Teste'));
    });
    test('should default country, admin1 and timezone to empty strings', async () => {
        mockedGetJson.mockResolvedValueOnce({
            results: [{ name: 'SemPais', latitude: 1, longitude: 2 }]
        });
        const cities = await (0, geocoding_1.searchCity)('SemPais');
        expect(cities).toEqual([
            {
                name: 'SemPais',
                latitude: 1,
                longitude: 2,
                country: '',
                admin1: '',
                timezone: '',
                importance: undefined
            }
        ]);
    });
    test('should remove duplicate cities sharing name, country and admin1', async () => {
        mockedGetJson.mockResolvedValueOnce({
            results: [
                { name: 'Guarulhos', latitude: 1, longitude: 2, country: 'Brasil', admin1: 'São Paulo' },
                { name: 'Guarulhos', latitude: 1, longitude: 2, country: 'Brasil', admin1: 'São Paulo' }
            ]
        });
        const cities = await (0, geocoding_1.searchCity)('Guarulhos');
        expect(cities).toHaveLength(1);
    });
    test('should keep same-named cities in different states', async () => {
        mockedGetJson.mockResolvedValueOnce({
            results: [
                { name: 'Guarulhos', latitude: 1, longitude: 2, country: 'Brasil', admin1: 'São Paulo' },
                { name: 'Guarulhos', latitude: 3, longitude: 4, country: 'Brasil', admin1: 'Rio de Janeiro' }
            ]
        });
        const cities = await (0, geocoding_1.searchCity)('Guarulhos');
        expect(cities).toHaveLength(2);
    });
    test('should return null when results is an empty array', async () => {
        mockedGetJson.mockResolvedValueOnce({ results: [] });
        expect(await (0, geocoding_1.searchCity)('Nada')).toBeNull();
    });
    test('should return null when results field is missing', async () => {
        mockedGetJson.mockResolvedValueOnce({});
        expect(await (0, geocoding_1.searchCity)('SemResultados')).toBeNull();
    });
});
