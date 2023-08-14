 
export default  class GraphByAdjacencyList{
    private nodes: Map<string, string[]>;

    constructor() {
        this.nodes = new Map();
    }

    addNode(node: string): boolean {
        if (!this.hasNode(node)) {
            this.nodes.set(node, []);
            return true;
        }
        return false;
    }

    addEdge(node1: string, node2: string): boolean {
        if(this.hasNode(node1) && this.hasNode(node2)){
            const neighbors:string[] = this.getNeighbors(node1) as string[];
            if(!neighbors.includes(node2)){
              neighbors.push(node2);
              return true;
            }
        }
        return false;
    }
    
    hasNode(node: string):boolean{
        return this.nodes.has(node);
    }

    getNeighbors(node: string): string[] | undefined{
        if(this.hasNode(node)){
          return this.nodes.get(node);
        }
        return undefined;
    }

    getNodes():string[]{
      let ns:string[] = [];
      for(let n of Array.from(this.nodes.keys())){
        ns.push(n);
      }
      return ns;
    }

    getFirstNeighbor(node:string):string | undefined{
        if(this.hasNode(node)){
            return this.nodes.get(node)?.at(0);
        }
        return undefined;
    }

    getNextNeighbor(node1:string, node2:string):string|undefined{
        if(this.hasNode(node1)){
            const index:number  = this.nodes.get(node1)?.indexOf(node2) as number;
            if(index === -1){
              return undefined;
            }
            return this.nodes.get(node1)?.at(index+1);
        }
        return undefined;
    }

    toObject():Object{
      return Object.fromEntries(this.nodes);
    }
}