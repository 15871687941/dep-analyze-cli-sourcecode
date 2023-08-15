import express from "express"
import DepAnalyze from "./depanalyze"

export var is_running:boolean = false;

export  function run_server(){
    const app = express();

    const default_port = 50000;
    let depAnalyze = new DepAnalyze();
    depAnalyze.init();

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

    // https://localhost:50000/depgraph/glob&0.0.1

    app.get("/depgraph/:dep", (res,rep)=>{
        let depObj:object = {}
        if(res.params.dep === "default"){
            let {name, version} = require("./package.json");
            depAnalyze.load(name, version);
            depObj = depAnalyze.toObject();
            rep.json(depObj);
        }else{
            try{
                let [name, version] = res.params.dep.split("&");
                depAnalyze.load(name, version);
                depObj = depAnalyze.toObject();
                rep.json(depObj);
            }catch(e){
                
            }   
        }
        
    })

    app.listen(default_port, ()=>{
        console.log(`start a server of http://localhost:${default_port}`);
    })
    is_running = true;
    var c = require('child_process');
    c.exec('start http://localhost:50000/');
}
