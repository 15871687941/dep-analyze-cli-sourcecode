```mermaid
graph
    packagedepgraph&1.0.0-->express&4.18.2
    packagedepgraph&1.0.0-->B&1.0.0
    B&1.0.0-->C&1.0.0
    B&1.0.0-->D&1.0.0
    C&1.0.0-->B&1.0.0
    D&1.0.0-->packagedepgraph&1.0.0
    D&1.0.0-->B&2.0.0
    B&2.0.0-->C&1.0.0
    B&2.0.0-->D&1.0.0



```
