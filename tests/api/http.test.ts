import https from 'https'
import { EventEmitter } from 'events'
import { getJson } from '../../src/api/http'

jest.mock('https')

const mockedHttps = https as jest.Mocked<typeof https>

function makeRequest(): any {
  const req = new EventEmitter() as any
  req.setTimeout = jest.fn()
  req.destroy = jest.fn()
  return req
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('getJson', () => {
  it('should resolve parsed JSON on success', async () => {
    const res = new EventEmitter() as any
    mockedHttps.get.mockImplementationOnce((_url: any, cb: any) => {
      cb(res)
      setImmediate(() => {
        res.emit('data', '{"ok":true}')
        res.emit('end')
      })
      return makeRequest()
    })

    const result = await getJson<{ ok: boolean }>('teste', 'https://x')
    expect(result).toEqual({ ok: true })
  })

  it('should concatenate multiple data chunks', async () => {
    const res = new EventEmitter() as any
    mockedHttps.get.mockImplementationOnce((_url: any, cb: any) => {
      cb(res)
      setImmediate(() => {
        res.emit('data', '{"a":')
        res.emit('data', '1}')
        res.emit('end')
      })
      return makeRequest()
    })

    const result = await getJson<{ a: number }>('teste', 'https://x')
    expect(result).toEqual({ a: 1 })
  })

  it('should reject on invalid JSON', async () => {
    const res = new EventEmitter() as any
    mockedHttps.get.mockImplementationOnce((_url: any, cb: any) => {
      cb(res)
      setImmediate(() => {
        res.emit('data', 'not json')
        res.emit('end')
      })
      return makeRequest()
    })

    await expect(getJson('teste', 'https://x')).rejects.toThrow(
      /Erro ao parsear resposta da API teste/
    )
  })

  it('should retry on network error then reject when exhausted', async () => {
    const err = new Error('ECONNREFUSED')
    mockedHttps.get
      .mockImplementationOnce((_url: any, _cb: any) => {
        const req = makeRequest()
        setImmediate(() => req.emit('error', err))
        return req
      })
      .mockImplementationOnce((_url: any, _cb: any) => {
        const req = makeRequest()
        setImmediate(() => req.emit('error', err))
        return req
      })

    await expect(getJson('teste', 'https://x', 1)).rejects.toThrow('ECONNREFUSED')
    expect(mockedHttps.get).toHaveBeenCalledTimes(2)
  })

  it('should retry then succeed after a network error', async () => {
    mockedHttps.get
      .mockImplementationOnce((_url: any, _cb: any) => {
        const req = makeRequest()
        setImmediate(() => req.emit('error', new Error('boom')))
        return req
      })
      .mockImplementationOnce((_url: any, cb: any) => {
        const res = new EventEmitter() as any
        cb(res)
        setImmediate(() => {
          res.emit('data', '{"recovered":true}')
          res.emit('end')
        })
        return makeRequest()
      })

    const result = await getJson<{ recovered: boolean }>('teste', 'https://x', 1)
    expect(result).toEqual({ recovered: true })
    expect(mockedHttps.get).toHaveBeenCalledTimes(2)
  })

  it('should retry on timeout then reject with timeout error when exhausted', async () => {
    mockedHttps.get
      .mockImplementationOnce((_url: any, _cb: any) => {
        const req = makeRequest()
        req.setTimeout.mockImplementation((_ms: number, cb: () => void) => {
          setImmediate(cb)
        })
        return req
      })
      .mockImplementationOnce((_url: any, _cb: any) => {
        const req = makeRequest()
        req.setTimeout.mockImplementation((_ms: number, cb: () => void) => {
          setImmediate(cb)
        })
        return req
      })

    await expect(getJson('teste', 'https://x', 1)).rejects.toThrow(
      'Timeout da API teste'
    )
    expect(mockedHttps.get).toHaveBeenCalledTimes(2)
  })

  it('should retry then succeed after a timeout', async () => {
    mockedHttps.get
      .mockImplementationOnce((_url: any, _cb: any) => {
        const req = makeRequest()
        req.setTimeout.mockImplementation((_ms: number, cb: () => void) => {
          setImmediate(cb)
        })
        return req
      })
      .mockImplementationOnce((_url: any, cb: any) => {
        const res = new EventEmitter() as any
        cb(res)
        setImmediate(() => {
          res.emit('data', '{"late":true}')
          res.emit('end')
        })
        return makeRequest()
      })

    const result = await getJson<{ late: boolean }>('teste', 'https://x', 1)
    expect(result).toEqual({ late: true })
  })

  it('should set the provided timeout on the request', async () => {
    const res = new EventEmitter() as any
    let capturedReq: any
    mockedHttps.get.mockImplementationOnce((_url: any, cb: any) => {
      cb(res)
      capturedReq = makeRequest()
      setImmediate(() => {
        res.emit('data', '{}')
        res.emit('end')
      })
      return capturedReq
    })

    await getJson('teste', 'https://x', 0, 1234)
    expect(capturedReq.setTimeout).toHaveBeenCalledWith(1234, expect.any(Function))
  })
})
