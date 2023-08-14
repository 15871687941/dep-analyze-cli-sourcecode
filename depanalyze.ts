import GraphByAdjacencyList from "./graph";
import path from "path"
import fs from "fs"
import { getLocalDepConfObj, getGlobalDepConfObj, DepConfObj, dependencyInit } from "./utils";
import { config } from "process";
import { BlobOptions } from "buffer";

export default class DepAnalyze{
    // 依赖关系
    private depGraph: GraphByAdjacencyList;
    // 依赖关系的深度
    private depth:number;
    // 依赖关系的入口
    private entryPackage:string;

    private entryVersion:string;
    // 是否存在循环依赖
    private isCircle: boolean;
    // 循环依赖项列表
    private circcleDepList: any[];

    private allDepList:string[];

    private visited:boolean[];
    // 是否存在多个不同版本的包
    private isExistMulPack: boolean;
    // 多个不同版本的包的列表
    private mulPackList: any[];
    // 辅助队列
    private helpQueue: string[];

    private isLocal:boolean;

    private getDepConfigObj:(entryPackage:string, entryVersion:string)=>DepConfObj;

    private isExecInit:boolean;
    private isExecLoad:boolean;

    constructor(){
        this.depGraph = new GraphByAdjacencyList();
        this.depth = 0;
        this.entryPackage = ""
        this.entryVersion = "";
        this.isCircle = false;
        this.circcleDepList = [];
        this.isExistMulPack = false;
        this.mulPackList = [];
        this.helpQueue = [];
        this.allDepList  = [];
        this.visited = [];
        this.isLocal = true;
        this.getDepConfigObj = getLocalDepConfObj;
        this.isExecInit = false;
        this.isExecLoad = false;
        
    }

    init(isLocal=true){
        dependencyInit();
        this.isLocal = isLocal;
        this.getDepConfigObj = isLocal?getLocalDepConfObj:getGlobalDepConfObj;
        this.isExecInit = true;
    }

    load(entryPackage:string, entryVersion:string){
        if(!this.isExecInit){
            throw new Error("请先执行init方法，初始化环境");
        }
        this.entryPackage = entryPackage;
        this.entryVersion = entryVersion;
        this.readDepsGraph(entryPackage, entryVersion);
        this.isExecLoad = true;

    }

    // 获取入口模块的依赖图
    // 深度优先遍历
    private readDepsGraph(ep:string, ev:string){
        // 获取该模块对应版本的依赖对象{name:ep, version:ev, dependencies:{}}
        let depConfObj:DepConfObj = this.getDepConfigObj(ep, ev);
        // 构造节点 name&version
        let node:string = depConfObj.name + "&" +depConfObj.version;
        
        // 添加节点
        this.depGraph.addNode(node);
        if(!this.allDepList.includes(node)){
            this.allDepList.push(node);
        }
        this.visited[this.allDepList.indexOf(node)] = true;

        this.helpQueue.push(node);
        // 检测是否为叶子节点
        if (depConfObj.dependencies === undefined){
            this.depth = this.helpQueue.length > this.depth?this.helpQueue.length: this.depth;
            this.helpQueue.pop();
            return;
        }
        // 如果该模块有依赖对象，则遍历依赖对象，将每个依赖添加为节点，且添加该模块节点的邻接表
        let deps:Map<string, string> = new Map(Object.entries(depConfObj.dependencies));
        let depName:string = ""
        let verName:string = "";
        let depConfObj1:DepConfObj;
        let depNode:string = "";
        for(depName of deps.keys()){
            verName = deps.get(depName) as string;

            depConfObj1 = this.getDepConfigObj(depName, verName) as DepConfObj;
            depNode = depConfObj1.name + "&" + depConfObj1.version;
            this.depGraph.addNode(depNode);
            if(!this.allDepList.includes(node)){
                this.allDepList.push(node);
            }
            this.depGraph.addEdge(node, depNode)
            
        }
        let i:number = 0;
        for(let w:string = this.depGraph.getFirstNeighbor(node) as string; w!==undefined;w=this.depGraph.getNextNeighbor(node, w) as string){   
            // 即将遍历w节点
            // 解决循环依赖问题
            if (this.helpQueue.includes(w)) {
                this.isCircle = true;
                const startIndex = this.helpQueue.indexOf(w);
                this.helpQueue.push(w);
                const circleDep = this.helpQueue.slice(startIndex);
                this.circcleDepList.push(circleDep);
                this.helpQueue.pop();
                this.depth = this.helpQueue.length > this.depth?this.helpQueue.length: this.depth;
                continue;
            }
            // 解决多次访问一个节点的问题
            if(!this.visited[this.allDepList.indexOf(w)]){
                this.readDepsGraph(w.split("&").at(0) as string, w.split("&").at(1) as string);
            }   
        }
        this.helpQueue.pop();
            
    }

    // 层次遍历
    // --depth
    getOrderedDepthGraph(depth:number):GraphByAdjacencyList{
        if(!this.isExecInit || !this.isExecLoad){
            throw new Error("请先调用init和load方法");
        }
        if(depth >= this.depth){
            return this.depGraph;
        }
        let orderedDepthGraph:GraphByAdjacencyList = new GraphByAdjacencyList();
        let entryNode:string = this.entryPackage + "&" + this.entryVersion;
        orderedDepthGraph.addNode(entryNode);
        depth -= 1;
        this.helpQueue.push(entryNode);
        while(this.helpQueue.length !== 0 && depth > 0){
            let len = this.helpQueue.length;
            for(let i=0;i<len;i++){
                const depNode = this.helpQueue.pop() as string;
                this.depGraph.getNeighbors(depNode)?.forEach((item, index)=>{
                    if(this.helpQueue.indexOf(item) < 0){
                        this.helpQueue.push(item);
                    }
                    orderedDepthGraph.addNode(item);
                    orderedDepthGraph.addEdge(depNode, item);
                    
                });
            }
            depth -= 1;
        }
        return orderedDepthGraph;
    }

    getDepth():number{
        if(!this.isExecInit || !this.isExecLoad){
            throw new Error("请先调用init和load方法");
        }
        return this.depth;
    }

    hasCircleDep():boolean{
        if(!this.isExecInit || !this.isExecLoad){
            throw new Error("请先调用init和load方法");
        }
        return this.isCircle;
    }

    hasMulPack():boolean{
        if(!this.isExecInit || !this.isExecLoad){
            throw new Error("请先调用init和load方法");
        }
        let nodes:string[] = this.depGraph.getNodes();
        let pNodes:string[] = [];
        if(nodes.length <2){
            return this.isExistMulPack;
        }
        nodes = nodes.sort();
        nodes.forEach((item, index)=>{
            pNodes.push(item.split("&").at(0) as string);
        });
        let startPos:number = 0;
        for(let i=1;i<pNodes.length;i++){
            if(pNodes[startPos] !== pNodes[i]){
                if((i - startPos) >= 2){
                    this.mulPackList.push(new Set<string>(nodes.slice(startPos, i)));
                }
                startPos = i;
            }
        }
        this.isExistMulPack = this.mulPackList.length > 0;
        return this.isExistMulPack;
    }

    toObject():Object{
        if(!this.isExecInit || !this.isExecLoad){
            throw new Error("请先调用init和load方法");
        }
        return {
            packageName: this.entryPackage, 
            isLocalPackage: this.isLocal,
            packageVersion: this.entryVersion, 
            depGraph: this.depGraph.toObject(),
            depth:this.depth,
            isCircle: this.isCircle,
            circcleDepList: this.circcleDepList,
            isExistMulPack: this.isExistMulPack,
            mulPackList:this.mulPackList, 
        }
    }

    save(filename:string="depanalyze.json"){
        if(!this.isExecInit || !this.isExecLoad){
            throw new Error("请先调用init和load方法");
        }
        const fullPath:string = path.join(__dirname, filename);
        fs.writeFile(filename, JSON.stringify(this.toObject()), function(err){
            if(err){
                console.log(err);
            }
            console.log("保存成功");
        });
    }
}

// const depAnalyze = new DepAnalyze();
// depAnalyze.init();
// // "acorn", "8.10.0" 1
// // "glob", "10.3.3"
// // "express","4.18.2"
// depAnalyze.load("glob", "10.3.3");
// console.log(depAnalyze.getOrderedDepthGraph(2));
// depAnalyze.save();
// console.log("first");


