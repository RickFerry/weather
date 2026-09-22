import { MENU_WIDTH } from "../utils/constants"
import { colors, colorize } from "../utils/colors"
import { MenuOption } from "../types/MenuOption"

const MENU_OPTIONS: MenuOption[] = [
  { key: "1", label: "Clima de cidade default" },
  { key: "2", label: "Clima de todas as cidades" },
  { key: "3", label: "Buscar y agregar ciudad" },
  { key: "4", label: "Eliminar ciudad" },
  { key: "5", label: "Establecer ciudad default" },
  { key: "6", label: "Previsão de 7 dias" },
  { key: "8", label: "Ajustes (°C/°F)" },
  { key: "9", label: "Salir" }
]

export function printHeader(title: string): void {
  const width = MENU_WIDTH
  const topBottom = "═".repeat(width)
  const paddedTitle = title.padStart(Math.ceil((width - title.length) / 2 + title.length), " ")
  console.log("\n" + topBottom)
  console.log(colorize(paddedTitle, colors.cyan + colors.bold))
  console.log(topBottom)
}

export function printMenu(): void {
  printHeader("WEATHER CLI")
  MENU_OPTIONS.forEach((option) => {
    const color = option.key === "9" ? colors.red : colors.cyan
    console.log(`  ${option.key}. ${colorize(option.label, color)}`)
  })
  console.log("═".repeat(MENU_WIDTH))
}