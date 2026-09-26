"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const settingsStorage_1 = require("../../src/storage/settingsStorage");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
describe('SettingsStorage', () => {
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
    test('should update temperature unit', async () => {
        const testData = {
            defaultCity: '',
            cities: [],
            settings: { temperatureUnit: 'celsius' }
        };
        await promises_1.default.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), 'utf-8');
        await (0, settingsStorage_1.updateSettings)({ temperatureUnit: 'fahrenheit' });
        const content = await promises_1.default.readFile(DATA_FILE, 'utf-8');
        const data = JSON.parse(content);
        expect(data.settings.temperatureUnit).toBe('fahrenheit');
    });
    test('should return default settings if file does not exist', async () => {
        try {
            await promises_1.default.unlink(DATA_FILE);
        }
        catch (err) {
            // Ignore if file doesn't exist
        }
        const settings = await (0, settingsStorage_1.getSettings)();
        expect(settings.temperatureUnit).toBe('celsius');
    });
});
