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