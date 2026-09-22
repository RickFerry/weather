import * as readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const inputBuffer: string[] = []
const waiters: Array<(line: string) => void> = []
rl.on("line", (line) => {
  const waiter = waiters.shift()
  if (waiter) waiter(line)
  else inputBuffer.push(line)
})

export function askQuestion(query: string): Promise<string> {
  process.stdout.write(query)
  if (inputBuffer.length) return Promise.resolve(inputBuffer.shift()!.trim())
  return new Promise((resolve) => waiters.push((line) => resolve(line.trim())))
}