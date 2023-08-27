import { isPortOpen, run_server } from '../server'
import { describe, expect, test } from 'vitest'
import http from 'http'

describe('API Tests', () => {
    test("isPortOpen should return true if port is available", async () => {
        const result = await isPortOpen(50000);
        expect(result).toBe(true);
    });
    test("isPortOpen should return false if port is already in use", async () => {
        // 创建一个占用端口的HTTP服务器
        const server = http.createServer();
        server.listen(50000);
      
        const result = await isPortOpen(50000);
        expect(result).toBe(false);
        server.close();
      
    });
    test("run_server should start the server and listen on the specified port", async () => {
        const port = 50000;
        const server = run_server("", "", port);
      
        // 检查服务器是否正在监听指定的端口
        const result = await isPortOpen(port);
        expect(result).toBe(false);
        
    });
});