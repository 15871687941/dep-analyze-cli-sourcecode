import express from "express"
import DepAnalyze from "./depanalyze"
import net from "net"

const default_port = 50000;
export const depAnalyze = new DepAnalyze();
depAnalyze.init();

export function isPortOpen(port: number=default_port): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (err: Error) => {
      if ((err as any).code === 'EADDRINUSE') {
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


export  function run_server(port:number=default_port){
    const app = express();

    // GET https://localhost:50000/
    app.get("/", (res, req)=>{
        
        req.send("Hello World!");

    });

    // https://localhost:50000/deplist
    app.get("/deplist", (res,rep)=>{
        depAnalyze.init();
        const depList = depAnalyze.getDepList();
        rep.json(depList);
    });

    // https://localhost:50000/depgraph/glob&0.0.1?depth=10

    app.get("/depgraph/:dep/:depth", (res,rep)=>{
        let depObj:object = {}
        let depth:number | string = res.params.depth || "-1";
        depth = parseInt(depth) as number;
        if(depth < 0){
            depth = Infinity;
        }
        if(res.params.dep === "default"){
            let {name, version} = require("./package.json");
            
            depAnalyze.load(name, version, depth);
            depObj = depAnalyze.toObject();
            rep.json(depObj);
        }else{
            try{
                let [name, version] = res.params.dep.split("&");
                depAnalyze.load(name, version, depth);
                depObj = depAnalyze.toObject();
                rep.json(depObj);
            }catch(e){
                
            }   
        }
        
    })

    app.listen(default_port, ()=>{
        console.log(`start a server of http://localhost:${default_port}`);
    })
    var c = require('child_process');
    c.exec('start http://localhost:50000/');
}
