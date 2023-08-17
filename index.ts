#!/usr/bin/env node
import {isPortOpen, run_server} from "./server";
import { depAnalyze } from "./server";
import { getLocalDepConfObj, DepConfObj } from "./utils";
import fs from "fs";
import path from "path";

// 判断端口是否被占用，没有被占用则打开服务器，被占用则不执行
isPortOpen().then((isOpen:boolean)=>{
    if(isOpen){
        run_server();
    }
}).catch((err:Error)=>{
    console.error(err);
})

// 命令行解析执行


let depth:number = -1;
let jsonPath:string = "";
let pkg = "";
let ver = "";
let helpFlag = false;
// 帮助提示信息 待填写
const helpInfo = 
`你好`;

try{
    if(process.argv[2] === "help" || process.argv.length === 0){
        console.log(helpInfo);
    }else if(process.argv[2] === "analyze"){
        const argv = process.argv.slice(3);
        argv.forEach((item, index)=>{
            if(item.startsWith("--depth=")){
                depth = parseInt(item.split("=")[1]);
            }else if(item.startsWith("--json=")){
                jsonPath = item.split("=")[1];
            }else if(item.startsWith("--package=")){
                pkg = item.split("=")[1];
            }else if(item.startsWith("--version=")){
                ver = item.split("=")[1];
            }else if(item.startsWith("--help")){
                helpFlag = true;
            }
        })
        
        if(helpFlag){
            console.log(helpInfo);
        }else{
            if(depth < 0){
                depth = Infinity;
            }
            if(pkg === "" && ver === ""){
                if(fs.existsSync(path.join(process.cwd(), "package.json"))){
                    let {name, version} = require(path.join(process.cwd(), "package.json"));
                    pkg = name;
                    ver =version;
                }else{
                    throw new Error("请在nodejs项目根路径下执行[analyze-cli]命令")
                }
            }else if(pkg !== "" && ver ===""){
            
            }else{
                throw new Error("命令格式--package选项和--version选项必须一起不出现或者一起出现");
            }
            
            let depConfObj:DepConfObj = getLocalDepConfObj(pkg, ver);
                
            depAnalyze.load(depConfObj.name, depConfObj.version, depth);
            
            console.log(depAnalyze.toObject());
            
            if(jsonPath!==""){
                if(jsonPath.endsWith(".json")){
                    depAnalyze.save(jsonPath);
                }
            }
        }
    }else{
        throw new Error(`Error:命令格式不规范：\n${helpInfo}`);
    }
}catch(e){
    console.error((e as any).message);
}


