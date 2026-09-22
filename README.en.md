[🇧🇷 Português](README.md) | 🇺🇸 **English**

<div align="center">

# ⛅ Weather CLI

**Weather and 7-day forecast right in your terminal — no API key, zero dependencies.**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Jest](https://img.shields.io/badge/Jest-29%20tests-C21325?logo=jest&logoColor=white)](https://jestjs.io)
[![Runtime deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen)](#-stack)
[![License](https://img.shields.io/badge/license-ISC-blue)](#-license)

</div>

---

## 📸 Demo

```bash
═════════════════════════════════════════════
                 WEATHER CLI
═════════════════════════════════════════════
  1. Default city weather
  2. All cities weather
  3. Search and add city
  4. Remove city
  5. Set default city
  6. 7-day forecast
  8. Settings (°C/°F)
  9. Exit
═════════════════════════════════════════════
Select an option: 1

Fetching weather for São Paulo...

--- Current weather ---
City: São Paulo, America/Sao_Paulo
Temperature: 19.2°C
Condition: Clouds
Humidity: 86%
Wind speed: 8.8 km/h
Wind direction: 311°
---
```

```bash
Select an option: 6

7-day forecast:

--- São Paulo ---
Date       | Temp Max | Temp Min | Weather
───────────┼──────────┼──────────┼──────────────
21/09/2026 |    22.3°C |    16.5°C | Unknown conditions
22/09/2026 |    17.2°C |    13.1°C | Unknown conditions
23/09/2026 |    19.2°C |    13.0°C | Cloudy
24/09/2026 |    26.2°C |    14.3°C | Unknown conditions
25/09/2026 |    29.4°C |    15.1°C | Cloudy
26/09/2026 |    30.1°C |    17.2°C | Cloudy
27/09/2026 |    30.2°C |    17.3°C | Cloudy
```

> 🌈 Real ANSI colors (cyan menu, yellow temperatures, green/red success/error) show up in your terminal — the block above was captured without ANSI codes.

---

## ✨ Features

- **🌤️ Current weather** — temperature, condition, humidity and wind for the default city or all saved cities.
- **📅 7-day forecast** — daily high/low temperature and condition.
- **🔍 Smart search** — up to 15 results per query with **state-level disambiguation**: `Guarulhos, Brazil (São Paulo)` vs `Guarulhos, Brazil (Rio de Janeiro)`.
- **⌨️ Shortcut** — type a city name straight into the menu to search and add it.
- **🌡️ °C/°F settings** — configurable temperature unit.
- **💾 Local persistence** — everything is stored in `cities.json`.
- **🔁 Robustness** — 15s timeout with automatic retry on API calls.
- **🎨 Colored interface** — clear ANSI feedback.

---

## 🛠️ Stack

| Technology | Role |
|---|---|
| [Node.js](https://nodejs.org) ≥ 18 | Runtime |
| [TypeScript](https://www.typescriptlang.org) 5 | Language |
| [OpenMeteo](https://open-meteo.com) | Geocoding + weather API (free, no API key) |
| [Jest](https://jestjs.io) + ts-jest | Automated tests |
| — | **Zero runtime dependencies** (Node stdlib only: `https`, `fs`, `readline`) |

---

## 🚀 Getting started

Prerequisites: [Node.js](https://nodejs.org) ≥ 18 and npm.

```bash
npm install
npm run dev        # build and run in one step
```

Or separately:

```bash
npm run build      # tsc → dist/
npm start          # node dist/index.js
```

Run the tests:

```bash
npm test           # 29 tests in 5 suites
npm run test:cov   # with coverage (minimum 80%)
```

### ⬇️ Binaries

On every version bump in `package.json` pushed to `main`, the [release workflow](.github/workflows/release.yml) creates the `vX.Y.Z` tag and publishes ready-to-run binaries (Linux, Windows and macOS x64) on the repository [Releases](../../releases) page — no need to install Node.js.

---

## 📖 Usage

Navigate the menu with the numbers (1–9) or type a city name to search it instantly:

```bash
Select an option: Florida

Multiple cities found for 'Florida':
  1. Florida, USA (New York)
  2. Florida, USA (Massachusetts)
  3. Florida, Colombia (Putumayo)
  ...

Enter the number of the desired city: 1

Selected city: Florida, USA (New York)
Coordinates: 41.943, -74.56549
Add this city? (y/n): y
✅ City 'Florida' added successfully!
```

The search uses the **administrative position** (state/province) to resolve homonyms — duplicate cities are removed automatically.

---

## 🏗️ Architecture

Layers organized following the project convention:

```
src/
├── actions/        # Orchestrate each menu action
│   ├── getWeather.ts        current weather
│   ├── addCity.ts           search + add city
│   ├── removeCity.ts        remove city
│   ├── setDefaultCity.ts    set default city
│   ├── listCities.ts        list saved cities
│   ├── forecast.ts          7-day forecast
│   └── settings.ts          °C/°F settings
├── api/            # OpenMeteo integration
│   ├── http.ts             getJson with timeout + retry
│   ├── geocoding.ts        city search (admin1 + dedup)
│   └── weather.ts          current weather and forecast
├── presentation/   # CLI interface
│   ├── menu.ts             menu and header
│   ├── input.ts            terminal input
│   └── output.ts           colored formatted output
├── storage/        # Persistence in cities.json
│   ├── citiesStorage.ts
│   └── settingsStorage.ts
├── types/          # Shared TypeScript contracts
├── utils/          # format, colors, constants, time
└── index.ts        # Entry point + main loop
```

Data flow:

```
  index.ts (menu loop)
      │
      ▼
  presentation/ ──────────────► actions/
  (menu, input, output)        (action logic)
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
                api/ ◄─► OpenMeteo           storage/
                (geocoding + weather)         (cities.json)
```

---

## 💾 Data

All persistence lives in `cities.json` at the project root:

```json
{
  "defaultCity": "São Paulo",
  "cities": [
    { "name": "São Paulo", "lat": -23.5475, "lon": -46.63611 },
    { "name": "Paris", "lat": 48.85341, "lon": 2.3488 }
  ],
  "settings": { "temperatureUnit": "celsius" }
}
```

---

## 🌐 APIs

Two free [OpenMeteo](https://open-meteo.com) calls — no key, no signup:

1. **Geocoding** — city name → coordinates:
   ```
   https://geocoding-api.open-meteo.com/v1/search?name=Florida&count=15&language=pt&format=json
   ```
2. **Forecast** — current weather + daily forecast:
   ```
   https://api.open-meteo.com/v1/forecast?latitude=-23.5475&longitude=-46.63611&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
   ```

---

## 🧪 Tests

- **[Jest](https://jestjs.io)** with **ts-jest** — 29 tests in 5 suites, colocated with their modules (`citiesStorage.test.ts`, `geocoding.test.ts`, etc.).
- Coverage with a **80%** minimum threshold (`npm run test:cov`).
- Storage tests isolate the real `cities.json` and restore the original state afterwards.

---

## 🗺️ Roadmap

- [ ] ESLint + Prettier
- [x] CI/CD (GitHub Actions)
- [ ] Docker container
- [ ] More configuration options

---

## 📄 License

ISC — free to use, modify and distribute.