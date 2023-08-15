
// 查询 GET https://localhost:50000/depgraph/glob-0.0.1
// 本地项目依赖图 GET https://localhost:50000/depgraph/default
a = {
    entryPackageName: "glob",
    entryVersion: "1.1.0",
    nodeCount: 24,
    nodes: [
        "glob&0.0.1",

    ],
    links:[
        {source: "glob&0.0.1", target:""}, 
        {},

    ],
    depth: 5,
    isCircle: true,
    circleDepList: [[A, B, D, E, A], [A, C, D, E, A]],
    isMulPackage: true,
    mulPackageList: [["D&1.1.1", "D&2.1.1"], []]
}
// GET https://localhost:50000/deplist
// GET https://localhost:50000/depgraph/glob-0.0.1

b = [
    "arg:0.0.1",
    "glob:0.0.1",
]




// GET https://localhost:50000/

// pkg-cli
// 检测50000端口是否被占用 开启服务器
// start https://localhost:50000


