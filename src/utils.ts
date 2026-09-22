export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9
}

export function formatTemperature(temp: number, unit: "celsius" | "fahrenheit"): string {
  const symbol = unit === "celsius" ? "°C" : "°F"
  return `${temp.toFixed(1)}${symbol}`
}

export function getWeatherDescription(code: number): string {
  const weatherDescriptions: { [key: number]: string } = {
    0: "Céu limpo",
    1: "Predominantemente limpo",
    2: "Parcialmente nublado",
    3: "Nublado",
    4: "Nevoeiro costeiro",
    5: "Garoa de nevoeiro",
    6: "Garoa",
    7: "Garoa de neve",
    8: "Neve",
    9: "Rajadas de neve",
    10: "Tempestade de neve",
    11: "Tempestade de neve",
    12: "Garoa congelante",
    13: "Tempestade de chuva",
    14: "Granizo",
    15: "Garoa de granizo",
    16: "Rajadas de tempestade",
    17: "Tempestade de neve",
    18: "Rajadas de tempestade",
    19: "Rajadas de tempestade"
  }

  return weatherDescriptions[code] || "Condições desconhecidas"
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const colors = {
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
}

export function colorize(text: string, color: string): string {
  return `${color}${text}${colors.reset}`
}

export function getColorTemperatureUnit(unit: 'celsius' | 'fahrenheit'): string {
  return unit === 'celsius' ? colors.cyan : colors.yellow
}
