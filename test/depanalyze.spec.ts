import DepAnalyze from '../depanalyze'
import { beforeEach, describe, expect, test } from 'vitest'
import * as fs from 'fs'
import { afterEach } from 'node:test';

describe('DepAnalyze', () => {
    let depAnalyze = new DepAnalyze();
    const filePath = process.cwd()+'/test/depanalyze.json';
    beforeEach(()=>{
        depAnalyze.init();
        depAnalyze.load('test', '1.0.0', 8);
        depAnalyze.save(filePath)
    })
    afterEach(()=>{
        fs.unlink(filePath,(err) => {
            if (err) {
              console.log('删除文件时出错：', err);
            } else {
              console.log('文件删除成功');
            }
          })
    })
    test('should return a correct depth', () => {
        expect(depAnalyze.getDepth()).toBe(5)
    })
    test('should return a correct isHasCircleDep', () => {
        expect(depAnalyze.hasCircleDep()).toBe(false)
    })
    test('should return a correct isHasMulPack', () => {
        expect(depAnalyze.hasMulPack()).toBe(false)
    })
    test('should return a correct DepList', () => {
        expect(depAnalyze.getDepList().length).toBeGreaterThan(0)
    })
    test('should return a object', () => {
        expect(depAnalyze.toObject()).toBeTypeOf('object')
        expect(depAnalyze.toSimpleObject()).toBeTypeOf('object')
    })
    test('should save a json correctly', async () => {
        expect(fs.existsSync(filePath)).toBe(true)
    })
})
