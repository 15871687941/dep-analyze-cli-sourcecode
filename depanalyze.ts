import GraphByAdjacencyList from "./graph";
import path from "path"
import fs from "fs"
import { getLocalDepConfObj, getGlobalDepConfObj, DepConfObj, dependencyInit, getDepPkgVerList, DepPkgVer} from "./utils";


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

    load(entryPackage:string, entryVersion:string, depthLimited:number){
        if(!this.isExecInit){
            throw new Error("请先执行init方法，初始化环境");
        }
        this.isExecLoad = true;
        this.clear();
        this.entryPackage = entryPackage;
        this.entryVersion = entryVersion;
        this.readDepsGraph(entryPackage, entryVersion, depthLimited);
        this.hasMulPack();
        // this.depth += 1;
        // console.log(this.toObject());

    }

    clear(){
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
    }

    // 获取入口模块的依赖图
    // 深度优先遍历
    private readDepsGraph(ep:string, ev:string, depthLimited:number){
        if(depthLimited <= 0){
            return;
        }
        // 获取该模块对应版本的依赖对象{name:ep, version:ev, dependencies:{}}
        let depConfObj:DepConfObj = this.getDepConfigObj(ep, ev);
        // 构造节点 name&version
        let node:string = depConfObj.name + "&" +depConfObj.version;
        
        // 添加节点
        this.depGraph.addNode(node);
        if(!this.allDepList.includes(node)){
            this.allDepList.push(node);
        }
        this.helpQueue.push(node);
        this.depth = this.helpQueue.length > this.depth?this.helpQueue.length: this.depth;
        this.visited[this.allDepList.indexOf(node)] = true;
        depthLimited = depthLimited - 1;
        if(depthLimited <= 0){
            this.helpQueue.pop();
            return;
        }
        
        // 检测是否为叶子节点
        if (depConfObj.dependencies === undefined){
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
            if(!this.allDepList.includes(depNode)){
                this.allDepList.push(depNode);
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
                continue;
            }
        
            // 解决多次访问一个节点的问题
            if(!this.visited[this.allDepList.indexOf(w)]){
                this.readDepsGraph(w.split("&").at(0) as string, w.split("&").at(1) as string, depthLimited);
            }   
        }
        this.helpQueue.pop();
    }
    // // 层次遍历
    // // --depth
    // getOrderedDepthGraph(depth:number):GraphByAdjacencyList{
    //     if(!this.isExecInit || !this.isExecLoad){
    //         throw new Error("请先调用init和load方法");
    //     }
    //     if(depth >= this.depth || depth < 0){
    //         depth = this.depth;
    //     }
    //     let orderedDepthGraph:GraphByAdjacencyList = new GraphByAdjacencyList();
    //     let entryNode:string = this.entryPackage + "&" + this.entryVersion;
    //     orderedDepthGraph.addNode(entryNode);
    //     depth -= 1;
    //     this.helpQueue.push(entryNode);
    //     while(this.helpQueue.length !== 0 && depth > 0){
    //         let len = this.helpQueue.length;
    //         for(let i=0;i<len;i++){
    //             const depNode = this.helpQueue.pop() as string;
    //             this.depGraph.getNeighbors(depNode)?.forEach((item, index)=>{
    //                 if(this.helpQueue.indexOf(item) < 0){
    //                     this.helpQueue.push(item);
    //                 }
    //                 orderedDepthGraph.addNode(item);
    //                 orderedDepthGraph.addEdge(depNode, item);
                    
    //             });
    //         }
    //         depth -= 1;
    //     }
    //     if(!this.isExecInit || !this.isExecLoad){
    //         throw new Error("请先调用init和load方法");
    //     }
    //     return orderedDepthGraph;
    // }

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

    getDepList():string[]{
        let depList:DepPkgVer[] = getDepPkgVerList()
        let depsString:string[] = [];
        for(let index in depList){
            const dep = depList[index];
            depsString.push(`${depList[index]["packageName"]}:${depList[index].version}`);
        }
        depsString.sort();
        return depsString;
    }

    toObject():object{
        // console.log(this.depGraph);
        if(!this.isExecInit || !this.isExecLoad){
            throw new Error("请先调用init和load方法");
        }
        const links:object[] = [];
        const mapNodes:Map<string, number> = new Map();
        mapNodes.set(`${this.entryPackage}&${this.entryVersion}`, 0);
        for(let source of this.depGraph.getNodes()){
            for(let target of this.depGraph.getNeighbors(source) as string[] ){
                links.push({source, target});
                if(mapNodes.has(target)){
                    mapNodes.set(target, (mapNodes.get(target) as number)+1);
                }else{
                    mapNodes.set(target, 1);
                }
            }
        }
        const nodes:object[] = Array.from(mapNodes, ([key ,val])=>{
            return {name: key, count: val};
        });
        return {
            entryPackageName: this.entryPackage,
            entryVersion: this.entryVersion,
            nodeCount: this.allDepList.length,
            nodes: nodes,
            links:links,
            depth: this.depth,
            isCircle: this.isCircle,
            circleDepList: this.circcleDepList,
            isMulPackage: this.isExistMulPack,
            mulPackageList: this.mulPackList
        }
    }

    toSimpleObject():object{
        if(!this.isExecInit || !this.isExecLoad){
            throw new Error("请先调用init和load方法");
        }
        return {
            entryPackageName: this.entryPackage,
            entryVersion: this.entryVersion,
            nodeCount: this.allDepList.length,
            depth: this.depth,
            isCircle: this.isCircle,
            circleDepList: this.circcleDepList,
            isMulPackage: this.isExistMulPack,
            mulPackageList: this.mulPackList
        }
    }

    save(filePath:string="./data/depanalyze.json"){
        if(!this.isExecInit || !this.isExecLoad){
            throw new Error("请先调用init和load方法");
        }
        const parentPath:string = path.resolve(filePath, "..")
        if(!fs.existsSync(parentPath)){
            fs.mkdirSync(parentPath);
        }
        fs.writeFile(filePath, JSON.stringify(this.toObject()), function(err){
            if(err){
                console.log(err);
            }else{
                console.log("保存成功");
            }
        });
    }
}

const depAnalyze = new DepAnalyze();
depAnalyze.init();
// // "acorn", "8.10.0" 1
// // "glob", "10.3.3"
// // "express","4.18.2"
depAnalyze.load("packagedepgraph", "1.0.0", 8);
console.log(depAnalyze.toSimpleObject());
// depAnalyze.save();
// console.log("first");

