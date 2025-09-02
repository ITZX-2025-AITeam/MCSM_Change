# 配置文件路径问题修复

## 问题描述

用户反映目录文件web显示消失，目标目录为`/root/server/MCSM_Change/my_services/model_test/test_cfg`。

## 问题分析

1. **路径问题**：原代码使用相对路径`'test_cfg'`，但在某些情况下可能无法正确解析
2. **可移植性问题**：硬编码的绝对路径会影响项目的可移植性
3. **文件过滤**：没有明确过滤JSON配置文件

## 解决方案

### 1. 使用绝对相对路径

**修改前**：
```python
config_dir = 'test_cfg'
```

**修改后**：
```python
# 使用相对路径，确保项目可移植性
current_dir = os.path.dirname(os.path.abspath(__file__))
config_dir = os.path.join(current_dir, 'test_cfg')
```

### 2. 改进文件过滤

**修改前**：
```python
for filename in os.listdir(config_dir):
    if os.path.isfile(os.path.join(config_dir, filename)):
        config_files.append(filename)
```

**修改后**：
```python
for filename in os.listdir(config_dir):
    if filename.endswith('.json'):  # 只显示JSON配置文件
        config_files.append(filename)
```

### 3. 添加文件排序

```python
# 按文件名排序
config_files.sort()
```

## 技术改进

### 路径解析逻辑

```python
def get_config_dir():
    """获取配置文件目录的绝对路径"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(current_dir, 'test_cfg')
```

### 错误处理

- 自动创建目录（如果不存在）
- 优雅的错误处理和用户友好的错误消息
- 日志记录用于调试

### 前端改进

- 添加了调试日志（已清理）
- 改进了错误处理和用户反馈
- 保持了原有的用户体验

## 验证结果

### 测试脚本输出

```
🧪 测试配置文件加载功能
==================================================
📁 配置文件目录: /root/server/MCSM_Change/my_services/model_test/test_cfg
📂 目录是否存在: True
📋 目录中的JSON文件: ['default_config.json', 'security_focused.json', 'performance_focused.json']
✅ default_config.json: 格式正确
   - 名称: 默认配置
   - 描述: 标准模型检测配置
✅ security_focused.json: 格式正确
   - 名称: 安全专项配置
   - 描述: 专注于安全漏洞检测的配置
✅ performance_focused.json: 格式正确
   - 名称: 性能专项配置
   - 描述: 专注于性能测试的配置

🌐 测试API接口
✅ API响应成功: {'configs': ['default_config.json', 'performance_focused.json', 'security_focused.json'], 'status': 'success'}
```

### API响应

```json
{
  "configs": [
    "default_config.json",
    "performance_focused.json", 
    "security_focused.json"
  ],
  "status": "success"
}
```

## 项目可移植性

### 相对路径优势

1. **跨平台兼容**：使用`os.path.join()`确保跨平台兼容性
2. **部署灵活**：项目可以部署到任何目录
3. **维护简单**：不需要修改硬编码路径

### 路径解析策略

```python
# 获取脚本所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 构建相对路径
config_dir = os.path.join(current_dir, 'test_cfg')

# 验证路径存在
if not os.path.exists(config_dir):
    os.makedirs(config_dir, exist_ok=True)
```

## 文件结构

```
model_test/
├── main.py                    # 主应用文件
├── test_cfg/                  # 配置文件目录
│   ├── default_config.json    # 默认配置
│   ├── security_focused.json  # 安全专项配置
│   └── performance_focused.json # 性能专项配置
├── templates/                 # 前端模板
│   └── index.html            # 主页面
└── test_config_loading.py    # 测试脚本
```

## 总结

通过使用绝对相对路径和改进的文件过滤逻辑，成功解决了配置文件web显示消失的问题。现在项目具有良好的可移植性，可以在任何环境下正常运行。

### 关键改进点

1. ✅ 使用`os.path.dirname(os.path.abspath(__file__))`获取脚本目录
2. ✅ 使用`os.path.join()`构建跨平台路径
3. ✅ 只显示`.json`配置文件
4. ✅ 添加文件排序功能
5. ✅ 改进错误处理和日志记录
6. ✅ 保持项目可移植性


