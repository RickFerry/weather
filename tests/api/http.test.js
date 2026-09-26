"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const events_1 = require("events");
const http_1 = require("../../src/api/http");
jest.mock('https');
const mockedHttps = https_1.default;
function makeRequest() {
    const req = new events_1.EventEmitter();
    req.setTimeout = jest.fn();
    req.destroy = jest.fn();
    return req;
}
beforeEach(() => {
    jest.clearAllMocks();
});
describe('getJson', () => {
    it('should resolve parsed JSON on success', async () => {
        const res = new events_1.EventEmitter();
        mockedHttps.get.mockImplementationOnce((_url, cb) => {
            cb(res);
            setImmediate(() => {
                res.emit('data', '{"ok":true}');
                res.emit('end');
            });
            return makeRequest();
        });
        const result = await (0, http_1.getJson)('teste', 'https://x');
        expect(result).toEqual({ ok: true });
    });
    it('should concatenate multiple data chunks', async () => {
        const res = new events_1.EventEmitter();
        mockedHttps.get.mockImplementationOnce((_url, cb) => {
            cb(res);
            setImmediate(() => {
                res.emit('data', '{"a":');
                res.emit('data', '1}');
                res.emit('end');
            });
            return makeRequest();
        });
        const result = await (0, http_1.getJson)('teste', 'https://x');
        expect(result).toEqual({ a: 1 });
    });
    it('should reject on invalid JSON', async () => {
        const res = new events_1.EventEmitter();
        mockedHttps.get.mockImplementationOnce((_url, cb) => {
            cb(res);
            setImmediate(() => {
                res.emit('data', 'not json');
                res.emit('end');
            });
            return makeRequest();
        });
        await expect((0, http_1.getJson)('teste', 'https://x')).rejects.toThrow(/Erro ao parsear resposta da API teste/);
    });
    it('should retry on network error then reject when exhausted', async () => {
        const err = new Error('ECONNREFUSED');
        mockedHttps.get
            .mockImplementationOnce((_url, _cb) => {
            const req = makeRequest();
            setImmediate(() => req.emit('error', err));
            return req;
        })
            .mockImplementationOnce((_url, _cb) => {
            const req = makeRequest();
            setImmediate(() => req.emit('error', err));
            return req;
        });
        await expect((0, http_1.getJson)('teste', 'https://x', 1)).rejects.toThrow('ECONNREFUSED');
        expect(mockedHttps.get).toHaveBeenCalledTimes(2);
    });
    it('should retry then succeed after a network error', async () => {
        mockedHttps.get
            .mockImplementationOnce((_url, _cb) => {
            const req = makeRequest();
            setImmediate(() => req.emit('error', new Error('boom')));
            return req;
        })
            .mockImplementationOnce((_url, cb) => {
            const res = new events_1.EventEmitter();
            cb(res);
            setImmediate(() => {
                res.emit('data', '{"recovered":true}');
                res.emit('end');
            });
            return makeRequest();
        });
        const result = await (0, http_1.getJson)('teste', 'https://x', 1);
        expect(result).toEqual({ recovered: true });
        expect(mockedHttps.get).toHaveBeenCalledTimes(2);
    });
    it('should retry on timeout then reject with timeout error when exhausted', async () => {
        mockedHttps.get
            .mockImplementationOnce((_url, _cb) => {
            const req = makeRequest();
            req.setTimeout.mockImplementation((_ms, cb) => {
                setImmediate(cb);
            });
            return req;
        })
            .mockImplementationOnce((_url, _cb) => {
            const req = makeRequest();
            req.setTimeout.mockImplementation((_ms, cb) => {
                setImmediate(cb);
            });
            return req;
        });
        await expect((0, http_1.getJson)('teste', 'https://x', 1)).rejects.toThrow('Timeout da API teste');
        expect(mockedHttps.get).toHaveBeenCalledTimes(2);
    });
    it('should retry then succeed after a timeout', async () => {
        mockedHttps.get
            .mockImplementationOnce((_url, _cb) => {
            const req = makeRequest();
            req.setTimeout.mockImplementation((_ms, cb) => {
                setImmediate(cb);
            });
            return req;
        })
            .mockImplementationOnce((_url, cb) => {
            const res = new events_1.EventEmitter();
            cb(res);
            setImmediate(() => {
                res.emit('data', '{"late":true}');
                res.emit('end');
            });
            return makeRequest();
        });
        const result = await (0, http_1.getJson)('teste', 'https://x', 1);
        expect(result).toEqual({ late: true });
    });
    it('should set the provided timeout on the request', async () => {
        const res = new events_1.EventEmitter();
        let capturedReq;
        mockedHttps.get.mockImplementationOnce((_url, cb) => {
            cb(res);
            capturedReq = makeRequest();
            setImmediate(() => {
                res.emit('data', '{}');
                res.emit('end');
            });
            return capturedReq;
        });
        await (0, http_1.getJson)('teste', 'https://x', 0, 1234);
        expect(capturedReq.setTimeout).toHaveBeenCalledWith(1234, expect.any(Function));
    });
});
