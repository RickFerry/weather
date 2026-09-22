🇧🇷 **Português** | [🇺🇸 English](README.en.md)

<div align="center">

# ⛅ Weather CLI

**Clima e previsão de 7 dias direto no seu terminal — sem API key, sem dependências.**

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Jest](https://img.shields.io/badge/Jest-29%20tests-C21325?logo=jest&logoColor=white)](https://jestjs.io)
[![Runtime deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen)](#-stack)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-ISC-blue)](#-licen%C3%A7a)

</div>

---

## 📸 Demo

```bash
═════════════════════════════════════════════
                 WEATHER CLI
═════════════════════════════════════════════
  1. Clima de cidade default
  2. Clima de todas as cidades
  3. Buscar y agregar ciudad
  4. Eliminar ciudad
  5. Establecer ciudad default
  6. Previsão de 7 dias
  8. Ajustes (°C/°F)
  9. Salir
═════════════════════════════════════════════
Selecciona una opción: 1

Buscando clima para São Paulo...

--- Clima atual ---
Cidade: São Paulo, America/Sao_Paulo
Temperatura: 19.2°C
Condição: Nublado
Umidade: 86%
Velocidade do vento: 8.8 km/h
Direção do vento: 311°
---
```

```bash
Selecciona una opción: 6

Previsão de 7 dias:

--- São Paulo ---
Data       | Temp Max | Temp Min | Tempo
───────────┼──────────┼──────────┼──────────────
21/09/2026 |    22.3°C |    16.5°C | Condições desconhecidas
22/09/2026 |    17.2°C |    13.1°C | Condições desconhecidas
23/09/2026 |    19.2°C |    13.0°C | Nublado
24/09/2026 |    26.2°C |    14.3°C | Condições desconhecidas
25/09/2026 |    29.4°C |    15.1°C | Nublado
26/09/2026 |    30.1°C |    17.2°C | Nublado
27/09/2026 |    30.2°C |    17.3°C | Nublado
```

> 🌈 As cores reais (menu em ciano, temperaturas em amarelo, sucesso/erro em verde/vermelho) aparecem no terminal — este bloco foi capturado sem os códigos ANSI.

---

## ✨ Funcionalidades

- **🌤️ Clima atual** — temperatura, condição, umidade e vento da cidade default ou de todas as cadastradas.
- **📅 Previsão de 7 dias** — temperatura máxima/mínima e condição por dia.
- **🔍 Busca inteligente** — até 15 resultados por busca, com **desambiguação por estado**: `Guarulhos, Brasil (São Paulo)` vs `Guarulhos, Brasil (Rio de Janeiro)`.
- **⌨️ Atalho** — digite o nome de uma cidade direto no menu para buscá-la e adicioná-la.
- **🌡️ Ajustes °C/°F** — unidades de temperatura configuráveis.
- **💾 Persistência local** — tudo salvo em `cities.json`.
- **🔁 Robustez** — timeout de 15s com retry automático nas chamadas de API.
- **🎨 Interface colorida** — feedback claro com cores ANSI.

---

## 🛠️ Stack

| Tecnologia | Papel |
|---|---|
| [Node.js](https://nodejs.org) ≥ 18 | Runtime |
| [TypeScript](https://www.typescriptlang.org) 5 | Linguagem |
| [OpenMeteo](https://open-meteo.com) | API de geocoding e clima (grátis, sem API key) |
| [Jest](https://jestjs.io) + ts-jest | Testes automatizados |
| — | **Zero dependências de runtime** (só a stdlib do Node: `https`, `fs`, `readline`) |

---

## 🚀 Como executar

Pré-requisitos: [Node.js](https://nodejs.org) ≥ 18 e npm.

```bash
npm install
npm run dev        # compila e executa em um passo
```

Ou separadamente:

```bash
npm run build      # tsc → dist/
npm start          # node dist/index.js
```

Rodar os testes:

```bash
npm test           # 29 testes em 5 suítes
npm run test:cov   # com cobertura (mínimo 80%)
```

### ⬇️ Binários

A cada bump de versão no `package.json` com push em `main`, o [workflow de release](.github/workflows/release.yml) gera a tag `vX.Y.Z` e publica binários prontos (Linux, Windows e macOS x64) na página de [Releases](../../releases) do repositório — sem necessidade de instalar Node.js.

---

## 📖 Como usar

Navegue pelo menu com os números (1–9) ou digite o nome de uma cidade para buscá-la rapidamente:

```bash
Selecciona una opción: Florida

Múltiplas cidades encontradas para 'Florida':
  1. Florida, EUA (Nova Iorque)
  2. Florida, EUA (Massachusetts)
  3. Florida, Colômbia (Putumayo)
  ...

Digite o número da cidade desejada: 1

Cidade selecionada: Florida, EUA (Nova Iorque)
Coordenadas: 41.943, -74.56549
Deseja adicionar esta cidade? (s/n): s
✅ Cidade 'Florida' adicionada com sucesso!
```

A busca usa a **posição administrativa** (estado/província) para resolver homônimos — cidades repetidas são removidas automaticamente.

---

## 🏗️ Arquitetura

Camadas organizadas conforme o padrão do projeto:

```
src/
├── actions/        # Orquestram cada ação do menu
│   ├── getWeather.ts        getWeather → clima atual
│   ├── addCity.ts           busca + adiciona cidade
│   ├── removeCity.ts        remove cidade
│   ├── setDefaultCity.ts    define cidade default
│   ├── listCities.ts        lista cidades cadastradas
│   ├── forecast.ts          previsão de 7 dias
│   └── settings.ts          ajustes °C/°F
├── api/            # Integração com OpenMeteo
│   ├── http.ts             getJson com timeout + retry
│   ├── geocoding.ts        busca de cidades (admin1 + dedup)
│   └── weather.ts          clima atual e previsão
├── presentation/   # Interface do CLI
│   ├── menu.ts             menu e cabeçalho
│   ├── input.ts            leitura do terminal
│   └── output.ts           saída formatada com cores
├── storage/        # Persistência em cities.json
│   ├── citiesStorage.ts
│   └── settingsStorage.ts
├── types/          # Contratos TypeScript compartilhados
├── utils/          # format, colors, constants, time
└── index.ts        # Entry point + loop principal
```

Fluxo de dados:

```
  index.ts (loop do menu)
      │
      ▼
  presentation/ ──────────────► actions/
  (menu, input, output)        (regras de cada ação)
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
                api/ ◄─► OpenMeteo           storage/
                (geocoding + weather)         (cities.json)
```

---

## 💾 Dados

Toda a persistência fica em `cities.json` na raiz do projeto:

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

Duas chamadas gratuitas da [OpenMeteo](https://open-meteo.com) — sem chave, sem cadastro:

1. **Geocoding** — converte nome de cidade em coordenadas:
   ```
   https://geocoding-api.open-meteo.com/v1/search?name=Florida&count=15&language=pt&format=json
   ```
2. **Forecast** — clima atual + previsão diária:
   ```
   https://api.open-meteo.com/v1/forecast?latitude=-23.5475&longitude=-46.63611&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto
   ```

---

## 🧪 Testes

- **[Jest](https://jestjs.io)** com **ts-jest** — 29 testes em 5 suítes, colocalizados junto aos módulos (`citiesStorage.test.ts`, `geocoding.test.ts`, etc.).
- Cobertura com threshold mínimo de **80%** (`npm run test:cov`).
- Os testes de storage isolam o `cities.json` real e restauram o estado original ao final.

---

## 🗺️ Roadmap

- [ ] ESLint + Prettier
- [x] CI/CD (GitHub Actions)
- [ ] Container Docker
- [ ] Mais opções de configuração

---

## 📄 Licença

ISC — use, modifique e distribua à vontade.