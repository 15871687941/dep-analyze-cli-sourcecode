import { 
    localDependencies,
    globalDependencies,
    readModuleDependencies,
    getLocalDepConfObj,
    getGlobalDepConfObj,
    getDepPkgVerList
} from '../utils';
import { describe, expect, test } from 'vitest'; 


describe('readModuleDependencies', () => {
    test('should read module dependencies correctly', () => {
        // 模拟需要测试的目录结构和package.json文件
        const baseDir = process.cwd() + '/test';
        const isLocal = true;
        console.log(baseDir);
        readModuleDependencies(baseDir, isLocal);
        expect(localDependencies.size).toBe(10);
        expect(globalDependencies.size).toBe(0);
    });
});
  
describe('getLocalDepConfObj', () => {
    test('should return local dependency configuration object', () => {
        // 模拟需要测试的场景
        const packageName = 'package-name';
        const version = '1.0.0';
        const isLocal = true;

        // 创建测试用的localDependencies
        localDependencies.set('package-name&1.0.0', {
            name: 'package-name',
            version: '1.0.0',
            dependencies: {}
        });

        // 调用getLocalDepConfObj函数
        const result = getLocalDepConfObj(packageName, version, isLocal);

        // 验证返回的DepConfObj是否符合预期
        expect(result).toEqual({
            name: 'package-name',
            version: '1.0.0',
            dependencies: {}
        });

        // 清理测试用的localDependencies
        localDependencies.clear();
    });
});
  
describe('getGlobalDepConfObj', () => {
    test('should return global dependency configuration object', () => {
        // 模拟需要测试的场景
        const packageName = 'package-name';
        const version = '1.0.0';
        const isLocal = false;

        // 创建测试用的globalDependencies
        globalDependencies.set('package-name&1.0.0', {
            name: 'package-name',
            version: '1.0.0',
            dependencies: {}
        });

        // 调用getGlobalDepConfObj函数
        const result = getGlobalDepConfObj(packageName, version, isLocal);

        // 验证返回的DepConfObj是否符合预期
        expect(result).toEqual({
            name: 'package-name',
            version: '1.0.0',
            dependencies: {}
        });

        // 清理测试用的globalDependencies
        globalDependencies.clear();
    });
});
  
describe('getDepPkgVerList', () => {
    test('should return dependency package version list', () => {
        // 模拟需要测试的场景
        const isLocal = true;

        // 创建测试用的localDependencies
        localDependencies.set('package1&1.0.0', {
            name: 'package1',
            version: '1.0.0',
            dependencies: {}
        });
        localDependencies.set('package2&2.0.0', {
            name: 'package2',
            version: '2.0.0',
            dependencies: {}
        });

        // 调用getDepPkgVerList函数
        const result = getDepPkgVerList(isLocal);

        // 验证返回的DepPkgVerList是否符合预期
        expect(result).toEqual([
            { packageName: 'package1', version: '1.0.0' },
            { packageName: 'package2', version: '2.0.0' }
        ]);

        // 清理测试用的localDependencies
        localDependencies.clear();
    });
});