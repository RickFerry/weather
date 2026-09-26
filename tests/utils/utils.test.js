"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format_1 = require("../../src/utils/format");
const time_1 = require("../../src/utils/time");
describe('Utils', () => {
    describe('Temperature conversion', () => {
        test('should convert Celsius to Fahrenheit correctly', () => {
            expect((0, format_1.celsiusToFahrenheit)(0)).toBe(32);
            expect((0, format_1.celsiusToFahrenheit)(100)).toBe(212);
            expect((0, format_1.celsiusToFahrenheit)(37.5)).toBe(99.5);
        });
        test('should convert Fahrenheit to Celsius correctly', () => {
            expect((0, format_1.fahrenheitToCelsius)(32)).toBe(0);
            expect((0, format_1.fahrenheitToCelsius)(212)).toBe(100);
            expect((0, format_1.fahrenheitToCelsius)(98.6)).toBe(37);
        });
        test('should format temperature with correct unit', () => {
            expect((0, format_1.formatTemperature)(25, 'celsius')).toBe('25.0°C');
            expect((0, format_1.formatTemperature)(25, 'fahrenheit')).toBe('25.0°F');
            expect((0, format_1.formatTemperature)(0, 'celsius')).toBe('0.0°C');
            expect((0, format_1.formatTemperature)(100, 'fahrenheit')).toBe('100.0°F');
        });
    });
    describe('Weather description', () => {
        test('should return description for valid weather codes', () => {
            expect((0, format_1.getWeatherDescription)(0)).toBe('Céu limpo');
            expect((0, format_1.getWeatherDescription)(3)).toBe('Nublado');
            expect((0, format_1.getWeatherDescription)(45)).toBe('Condições desconhecidas');
        });
        test('should handle unknown weather codes', () => {
            expect((0, format_1.getWeatherDescription)(999)).toBe('Condições desconhecidas');
        });
    });
    describe('Sleep function', () => {
        test('should wait for specified duration', async () => {
            const start = Date.now();
            await (0, time_1.sleep)(100);
            const duration = Date.now() - start;
            expect(duration).toBeGreaterThanOrEqual(90);
        });
    });
});
