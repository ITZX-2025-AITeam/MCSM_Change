#!/bin/bash

# 模型报告诊断系统启动脚本

echo "===========================================" 
echo "    模型报告诊断系统启动脚本"
echo "==========================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "错误: 未找到npm，请先安装npm"
    exit 1
fi

# 切换到项目目录
cd "$(dirname "$0")"

echo "当前目录: $(pwd)"

# 检查package.json是否存在
if [ ! -f "package.json" ]; then
    echo "错误: 未找到package.json文件"
    exit 1
fi

# 检查node_modules是否存在，如果不存在则安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖包..."
    npm install
    if [ $? -ne 0 ]; then
        echo "错误: 依赖安装失败"
        exit 1
    fi
fi

# 报告目录固定为项目根目录下的report
REPORT_DIR="/root/server/test/MCSM_Change_Start/report"
if [ ! -d "$REPORT_DIR" ]; then
    echo "警告: 报告目录不存在: $REPORT_DIR"
    echo "请确保报告目录存在并包含.md或.html文件"
fi

echo "启动服务器..."
echo "访问地址: http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo "==========================================="

# 启动服务器
npm start
