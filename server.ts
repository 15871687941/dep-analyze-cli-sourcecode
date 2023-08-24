import express from 'express';
import DepAnalyze from './depanalyze';
import net from 'net';
import path from 'path';
import { consoleStyle } from './consolestyle';

export const default_port = 50000;
export const depAnalyze = new DepAnalyze();
depAnalyze.init();

let firstRequestDepth: number = Infinity;
let firstRequest: number = 1;

export function isPortOpen(port: number = default_port): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();

        server.once('error', (err: Error) => {
            if ((err as any).code === 'EADDRINUSE') {
                console.log(
                    `Warning: ${consoleStyle.red}Server[http:127.0.0.1:50000] is running, please don't execute command[pkg-cli runserver]${consoleStyle.endStyle}`,
                );
                resolve(false); // 端口被占用
            } else {
                reject(err); // 其他错误
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(true); // 端口可用
        });

        server.listen(port);
    });
}

export function run_server(port: number = default_port) {
    const app = express();
    app.use(express.static(path.join(__dirname, 'vue')));

    // GET https://localhost:50000/
    app.get('/', (res, req) => {
        req.sendFile(path.resolve(path.join(__dirname, 'vue', 'index.html')));
    });

    // https://localhost:50000/deplist
    app.get('/deplist', (res, rep) => {
        const depList = depAnalyze.getDepList();
        rep.json(depList);
    });

    // https://localhost:50000/depgraph/glob&0.0.1/10

    app.get('/depgraph/:dep/:depth?', (res, rep) => {
        let depObj: object = {};
        let depth: number | string = res.params.depth || '-1';
        depth = parseInt(depth) as number;
        // console.log(depth)

        if (depth <= 0) {
            depth = Infinity;
        }
        try {
            if (res.params.dep === 'default') {
                if (firstRequest === 1) {
                    // console.log(process.argv);
                    process.argv.forEach((item) => {
                        if (item.startsWith('--depth=') || item.startsWith('-d=')) {
                            firstRequestDepth = parseInt(item.split('=')[1]);
                            if (firstRequestDepth <= 0) {
                                firstRequestDepth = Infinity;
                            }
                        }
                    });
                    firstRequest = firstRequest - 1;
                }
                // console.log(firstRequestDepth);
                depth = firstRequestDepth;
                const { name, version } = require(path.join(
                    process.cwd(),
                    'package.json',
                ));
                depAnalyze.load(name, version, depth);
                depObj = depAnalyze.toObject();
                rep.json(depObj);
            } else {
                const [name, version] = res.params.dep.split('&');
                depAnalyze.load(name, version, depth);
                depObj = depAnalyze.toObject();
                rep.json(depObj);
            }
        } catch (e) {
            console.log((e as Error).message);
        }
    });

    app.get('/depgraph-simple/:dep/:depth?', (res, rep) => {
        let depObj: object = {};
        let depth: number | string = res.params.depth || '-1';
        depth = parseInt(depth) as number;
        if (depth <= 0) {
            depth = Infinity;
        }
        try {
            if (res.params.dep === 'default') {
                const { name, version } = require(path.join(
                    process.cwd(),
                    'package.json',
                ));
                depAnalyze.load(name, version, depth);
                depObj = depAnalyze.toSimpleObject();
                rep.json(depObj);
            } else {
                const [name, version] = res.params.dep.split('&');
                depAnalyze.load(name, version, depth);
                depObj = depAnalyze.toSimpleObject();
                rep.json(depObj);
            }
        } catch (e) {
            console.log((e as Error).message);
        }
    });

    app.listen(port, () => {
    // console.log(`
    //  _____ _   ___
    // |     | |_|_  |___ ___ ___ ___ ___ ___
    // |   --|   |_  |   |   |   |   |   |   |
    // |_____|_|_|___|_|_|_|_|_|_|_|_|_|_|_|_|

        //            折腾不息 · 乐此不疲. `)
        console.log('Starting to run a server...');
        console.log(
            `Local:   %shttp://127.0.0.1:${port}%s`,
            consoleStyle.green,
            consoleStyle.endStyle,
        );
        console.log(
            `Function:${consoleStyle.blue}graphically display the current project dependencies information${consoleStyle.endStyle}`,
        );
    });
}
