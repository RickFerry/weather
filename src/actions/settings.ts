import { updateSettings } from "../storage/settingsStorage"
import { Settings } from "../types/Settings"
import { askQuestion } from "../presentation/input"
import { getColorTemperatureUnit, colors, colorize } from "../utils/colors"

export async function handleSettings(settings: Settings): Promise<Settings> {
  console.log(colorize(`\nConfigurações atuais:`, colors.cyan))
  console.log(`  Unidade de temperatura: ${colorize(settings.temperatureUnit === "celsius" ? "°C" : "°F", getColorTemperatureUnit(settings.temperatureUnit))}`)

  const choice = await askQuestion("\nDigite 'c' para °C ou 'f' para °F: ")

  let newUnit: "celsius" | "fahrenheit" = settings.temperatureUnit

  if (choice.toLowerCase() === "c") {
    newUnit = "celsius"
  } else if (choice.toLowerCase() === "f") {
    newUnit = "fahrenheit"
  } else {
    console.log(colorize("Opção inválida. Mantendo configuração atual.", colors.red))
    return settings
  }

  const updatedSettings: Settings = { ...settings, temperatureUnit: newUnit }
  await updateSettings(updatedSettings)
  console.log(colorize(`Unidade de temperatura atualizada para ${newUnit === "celsius" ? "°C" : "°F"}`, colors.green))

  return updatedSettings
}