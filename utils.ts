import * as fs from 'fs';
import * as path from 'path';
import { analyseVersion, isEqualVersion } from './versionmanage';
// import { consoleStyle } from './consolestyle';

// 从package.json文件中提取需要的三个属性
export interface DepConfObj {
  name: string;
  version: string;
  dependencies: object | undefined;
}

const globalModulesPath: string = path.resolve(
    process.execPath,
    '../../lib/node_modules',
);

export const localDependencies: Map<string, DepConfObj> = new Map();
export const globalDependencies: Map<string, DepConfObj> = new Map();

// 使用递归遍历算法，遍历给定目录下的所有依赖，并根据给定参数在相应列表中
export function readModuleDependencies(
    base_name: string = process.cwd(),
    isLocal = true,
) {
    if (!fs.existsSync(base_name)) {
        return;
    }
    if (!fs.statSync(base_name).isDirectory()) {
        return;
    }
    const pkgJsonFilePath: string = path.join(base_name, 'package.json');

    if (fs.existsSync(pkgJsonFilePath)) {
        try {
            // 一般本项目的依赖包的开发依赖都不会安装，所以使用devDependencies没有意义
            const { name, version, dependencies } = require(pkgJsonFilePath);
            // let {name, version, devDependencies} = require(pkgJsonFilePath);
            // if(name==="packagedepgraph"){
            //     console.log(name, version, devDependencies);
            // }

            if (name && version) {
                isLocal
                    ? localDependencies.set(name + '&' + version, {
                        name,
                        version,
                        dependencies,
                    })
                    : globalDependencies.set(name + '&' + version, {
                        name,
                        version,
                        dependencies,
                    });
            }
        } catch (e) {
            // console.error(`Warning:${pkgJsonFilePath}解析有问题，已忽略！`);
        }
    }
    const dependencyList: string[] = fs.readdirSync(base_name);
    // let packageConfig: DepConfObj;
    dependencyList.forEach((item) => {
        const subDir = path.join(base_name, item);
        readModuleDependencies(subDir, isLocal);
    });
}

export function dependencyInit() {
    readModuleDependencies();
    readModuleDependencies(globalModulesPath, false);
}

// 给定参数满足语义化版本规范就可以了
export function getLocalDepConfObj(
    packageName: string,
    version: string,
    isLocal: boolean = true,
): DepConfObj {
    let depConfObj: DepConfObj = {
        name: '',
        version: '',
        dependencies: undefined,
    };
    let key: string = '';
    const fullPackage = analyseVersion(packageName, version);
    version =
    fullPackage.reg +
    [fullPackage.firstVer, fullPackage.secondVer, fullPackage.fixVer].join('.');

    for (key of Array.from(localDependencies.keys())) {
        if (
            isEqualVersion(
        key.split('&').at(0) as string,
        key.split('&').at(1) as string,
        fullPackage.packageName,
        version,
            )
        ) {
            depConfObj = (isLocal ? localDependencies : globalDependencies).get(
                key,
            ) as DepConfObj;
            break;
        }
    }
    if (depConfObj.name === '' && depConfObj.version === '') {
        for (key of Array.from(localDependencies.keys())) {
            // 为了能跑起来，先舍弃一部分，把保证包名一致就可以了
            if (key.split('&').at(0) === packageName) {
                depConfObj = (isLocal ? localDependencies : globalDependencies).get(
                    key,
                ) as DepConfObj;
                // console.error(`${consoleStyle.red}${packageName}:${version} 该版本的模块不存在，正在返回相同模块名而版本号不同的数据${consoleStyle.endStyle}`);
                break;
            }
        }
        if (depConfObj.name === '' && depConfObj.version === '') {
            // console.log(packageName, version)
            throw new Error(
                `[${packageName}]该模块不存在，可能是包名与package.json中的name字段不匹配导致的`,
            );
        }
    }
    return depConfObj;
}

export function getGlobalDepConfObj(
    packageName: string,
    version: string,
    isLocal: boolean = false,
): DepConfObj {
    let depConfObj: DepConfObj = {
        name: '',
        version: '',
        dependencies: undefined,
    };
    let key: string = '';
    const fullPackage = analyseVersion(packageName, version);
    version =
    fullPackage.reg +
    [fullPackage.firstVer, fullPackage.secondVer, fullPackage.fixVer].join('.');

    for (key of Array.from(
        (isLocal ? localDependencies : globalDependencies).keys(),
    )) {
        if (
            isEqualVersion(
        key.split('&').at(0) as string,
        key.split('&').at(1) as string,
        fullPackage.packageName,
        version,
            )
        ) {
            depConfObj = (isLocal ? localDependencies : globalDependencies).get(
                key,
            ) as DepConfObj;
            break;
        }
    }
    if (depConfObj.name === '' && depConfObj.version === '') {
        for (key of Array.from(localDependencies.keys())) {
            // 为了能跑起来，先舍弃一部分，把保证包名一致就可以了
            if (key.split('&').at(0) === packageName) {
                depConfObj = (isLocal ? localDependencies : globalDependencies).get(
                    key,
                ) as DepConfObj;
                // console.error(`${consoleStyle.red}${packageName}:${version} 该版本的模块不存在，正在返回相同模块名而版本号不同的数据${consoleStyle.endStyle}`);
                break;
            }
        }
        if (depConfObj.name === '' && depConfObj.version === '') {
            // console.log(packageName, version)
            throw new Error(
                `[${packageName}]该模块不存在，可能是包名与package.json中的name字段不匹配导致的`,
            );
        }
    }
    return depConfObj;
}

export interface DepPkgVer {
  packageName: string;
  version: string;
}

export function getDepPkgVerList(isLocal = true): DepPkgVer[] {
    const mapList: DepPkgVer[] = [];
    let packageName: string = '';
    let version: string = '';
    let key: string = '';
    let map: DepPkgVer;
    for (key of Array.from(
        isLocal ? localDependencies.keys() : globalDependencies.keys(),
    )) {
        packageName = key.split('&').at(0) as string;
        version = key.split('&').at(1) as string;
        map = { packageName, version };
        mapList.push(map);
    }
    return mapList;
}

// function checkVersion(){
//     readModuleDependencies();
//     let key:string = "";
//     let depConfObj:DepConfObj;
//     for(key of localDependencies.keys()){
//         depConfObj = localDependencies.get(key) as DepConfObj;
//         const dependencies:{[key:string]:string} = depConfObj["dependencies"] as {[key:string]:string};
//         let k1:string="";
//         for(k1 in dependencies){
//             const pattern:RegExp = /^[\^\~]?\d{1,}\.\d{1,}\.\d{1,}$/;
//             const version:string = dependencies[k1];
//             if(!pattern.test(version)){
//                 console.log(depConfObj);
//                 console.log(k1, version);
//             }
//         }
//     }
// }

// checkVersion();
/*

npm:string-width@^4.2.0
npm:strip-ansi@^6.0.1
npm:wrap-ansi@^7.0.0
*
*
*
*
*
*
*
*
*
*
^1
*
*
*
*
^5.0.0 || ^6.0.2 || ^7.0.0
>= 2.1.2 < 3
^9.1.1 || ^10.0.0
^5.0.0 || ^6.0.2 || ^7.0.0
*/
