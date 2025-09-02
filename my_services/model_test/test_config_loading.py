#!/usr/bin/env python3
"""
测试配置文件加载功能
"""

import os
import json
import requests

def test_config_loading():
    """测试配置文件加载功能"""
    print("🧪 测试配置文件加载功能")
    print("=" * 50)
    
    # 1. 检查test_cfg目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_dir = os.path.join(current_dir, 'test_cfg')
    
    print(f"📁 配置文件目录: {config_dir}")
    print(f"📂 目录是否存在: {os.path.exists(config_dir)}")
    
    if os.path.exists(config_dir):
        files = os.listdir(config_dir)
        json_files = [f for f in files if f.endswith('.json')]
        print(f"📋 目录中的JSON文件: {json_files}")
        
        # 检查每个配置文件的内容
        for config_file in json_files:
            config_path = os.path.join(config_dir, config_file)
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    config_data = json.load(f)
                print(f"✅ {config_file}: 格式正确")
                print(f"   - 名称: {config_data.get('name', 'N/A')}")
                print(f"   - 描述: {config_data.get('description', 'N/A')}")
            except Exception as e:
                print(f"❌ {config_file}: 格式错误 - {e}")
    
    # 2. 测试API接口
    print("\n🌐 测试API接口")
    try:
        response = requests.get('http://localhost:5010/get_test_configs', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API响应成功: {data}")
        else:
            print(f"❌ API响应失败: {response.status_code}")
    except Exception as e:
        print(f"❌ API请求失败: {e}")
    
    # 3. 测试相对路径
    print("\n🔗 测试相对路径")
    print(f"当前工作目录: {os.getcwd()}")
    print(f"脚本所在目录: {current_dir}")
    print(f"相对路径test_cfg: {os.path.join(current_dir, 'test_cfg')}")
    
    # 4. 验证可移植性
    print("\n📦 验证项目可移植性")
    test_paths = [
        'test_cfg',
        os.path.join(current_dir, 'test_cfg'),
        os.path.join(os.getcwd(), 'test_cfg')
    ]
    
    for path in test_paths:
        exists = os.path.exists(path)
        print(f"路径 {path}: {'✅ 存在' if exists else '❌ 不存在'}")

if __name__ == '__main__':
    test_config_loading()


