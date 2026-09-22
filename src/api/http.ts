import https from "https"
import { API_RETRIES, API_TIMEOUT_MS } from "../utils/constants"

export function getJson<T>(
  apiLabel: string,
  url: string,
  retries = API_RETRIES,
  timeoutMs = API_TIMEOUT_MS
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = (remaining: number) => {
      const req = https.get(url, (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          try {
            resolve(JSON.parse(data) as T)
          } catch (err) {
            reject(new Error(`Erro ao parsear resposta da API ${apiLabel}: ${err}`))
          }
        })
      })

      req.on("error", (err) => {
        if (remaining > 0) attempt(remaining - 1)
        else reject(err)
      })

      req.setTimeout(timeoutMs, () => {
        req.destroy()
        if (remaining > 0) attempt(remaining - 1)
        else reject(new Error(`Timeout da API ${apiLabel}`))
      })
    }

    attempt(retries)
  })
}