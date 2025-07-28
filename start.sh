#!/bin/bash

# 无桌面环境版 - 后台进程方案
currentPath="$(pwd)"
log_dir="$currentPath/logs"

# 创建日志目录
mkdir -p "$log_dir"

for action in "daemon" "panel" "frontend"; do
    # 为每个模块创建独立日志文件
    log_file="$log_dir/${action}.log"
    
    # 后台启动命令（关键修改）
    nohup npm run $action > "$log_file" 2>&1 &
    pid=$!
    
    # 记录进程信息
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] 启动 $action | PID: $pid | 日志: $log_file" >> "$log_dir/launch.log"
    echo "模块 $action 已在后台运行 (PID: $pid)"
done

# 显示监控提示
echo -e "\n-------------------------------------------"
echo "后台进程已全部启动！"
echo "查看实时日志:   tail -f $log_dir/{daemon,panel,frontend}.log"
echo "查看启动记录:   cat $log_dir/launch.log"
echo "停止所有进程:   pkill -f 'npm run' && rm -f nohup.out"
echo "-------------------------------------------"
