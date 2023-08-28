import * as semver from 'semver';
export interface FullPackage {
  packageName: string;
  reg: string;
  firstVer: number;
  secondVer: number;
  fixVer: number;
}

/*
 *function:解析包名和版本名
 *pk:string 包名：glob
 *v:string 版本名称：^1.0.1
 *return {'packageName': 'glob', 'reg':'^', 'firstVer':1, 'secondVer':0, 'fixVer':1};
 */

// 精确版本号
// 范围版本号 > < >= <= ~ ^
// 预发布版本号 -beta 、--beta
// 通配符版本号 *
// 逻辑运算版本号 || &&
// 特殊版本号：{dependencies:{'string-width-cjs': 'npm:string-width@^4.2.0'}}

// 转换奇奇怪怪的包名和版本号名
export function analyseVersion(pk: string, v: string): FullPackage {
    const fullPackage: FullPackage = {
        packageName: '',
        reg: '',
        firstVer: 0,
        secondVer: 0,
        fixVer: 0,
    };
    // 解决特殊依赖版本号问题{dependencies:{'string-width-cjs': 'npm:string-width@^4.2.0'}}
    if (pk.endsWith('-cjs') && v.includes('npm')) {
        pk = v.split(':')[1].split('@')[0];
        v = v.split(':')[1].split('@')[1];
    }
    fullPackage.packageName = pk;
    // 解决范围匹配版本号问题
    if (v.startsWith('^')) {
    // ^2.1.1
        fullPackage.reg = '^';
        v = v.slice(1);
    } else if (v.startsWith('~')) {
    // ~2.1.1
        fullPackage.reg = '~';
        v = v.slice(1);
    } else {
        fullPackage.reg = '';
    }
    fullPackage.firstVer = parseInt(v.split('.').at(0) as string);
    fullPackage.secondVer = parseInt(v.split('.').at(1) as string);
    fullPackage.fixVer = parseInt(v.split('.').at(2) as string);
    return fullPackage;
}

/*
 *function:比较两个指定版本的包是否可以依赖
 *v1必须是精确的版本号
 *pk1:string 包名1：glob
 *v1:string 版本1：2.3.0
 *v2遵循予语义化版本规范就可以
 *pk2:string 包名2：glob
 *v2:string 版本2：^2.4.0
 *return boolean;
 */
// 目前只匹配了''、'^'、'~'，还有'*'、'>='、'<='等未实现
export function isEqualVersion(
    pk1: string,
    v1: string,
    pk2: string,
    v2: string,
): boolean {
    if (pk1 !== pk2) {
        return false;
    }
    /*
    semver`库支持以下语义化版本比对：
    1. 等于（Equal）：`=` 或 `==`。例如，`1.2.3 = 1.2.3`。

    2. 不等于（Not equal）：`!=`。例如，`1.2.3 != 2.0.0`。

    3. 大于（Greater than）：`>`。例如，`2.0.0 > 1.2.3`。

    4. 大于等于（Greater than or equal）：`>=`。例如，`2.0.0 >= 1.2.3`。

    5. 小于（Less than）：`<`。例如，`1.2.3 < 2.0.0`。

    6. 小于等于（Less than or equal）：`<=`。例如，`1.2.3 <= 2.0.0`。

    7. 范围（Range）：使用类似 `^`、`~`、`>=`、`<=`、`>`、`<` 等符号来定义范围。例如，`^1.2.3` 表示大于等于 `1.2.3` 且小于 `2.0.0`。

    8. 预发布版本（Prerelease）：可以使用 `-` 或 `--` 来指定预发布版本。例如，`1.2.3-alpha`。

    9. 版本范围（Range set）：可以使用逗号 `,` 来指定多个版本范围。例如，`1.2.3, 2.0.0`。
*/
    // 使用semver使程序更加健壮
    if (semver.satisfies(v1, v2)) {
        return true;
    }
    const fullPackage1: FullPackage = analyseVersion(pk1, v1);
    const fullPackage2: FullPackage = analyseVersion(pk2, v2);
    
    if (fullPackage2.reg === '^') {
        return fullPackage1.firstVer === fullPackage2.firstVer;
    }
    if (fullPackage2.reg === '~') {
        return (
            fullPackage1.firstVer === fullPackage2.firstVer &&
      fullPackage1.secondVer === fullPackage2.secondVer
        );
    }
    if (fullPackage2.reg === '') {
        return (
            fullPackage1.firstVer === fullPackage2.firstVer &&
      fullPackage1.secondVer === fullPackage2.secondVer &&
      fullPackage1.fixVer === fullPackage2.fixVer
        );
    }
    return false;
}

// analyseVersion('glob', '1.0.1');
// analyseVersion('glob', '^1.0.1');
// analyseVersion('glob', '~1.0.1');

// console.log(isEqualVersion('glob', '2.3.0', 'glob', '^2.10.100'));
// console.log(isEqualVersion('glob', '2.3.0', 'glob', '~2.10.100'));
// console.log(isEqualVersion('glob', '2.3.0', 'glob', '2.10.100'));
