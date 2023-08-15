import {is_running, run_server} from "./server";
import DepAnalyze from "./depanalyze"

// 服务器启动
if(is_running === false){
    run_server();
}

// 命令行解析
console.log(process.argv);

