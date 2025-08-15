#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
专利图表生成器
生成符合专利要求的黑色线条图，包含详细的标记和说明
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ConnectionPatch
import numpy as np
from matplotlib.patches import Polygon
import matplotlib.patches as mpatches
import matplotlib.font_manager as fm

# 设置中文字体 - 使用更通用的方法
def setup_chinese_font():
    """设置中文字体"""
    # 尝试多种中文字体
    chinese_fonts = ['SimHei', 'Microsoft YaHei', 'WenQuanYi Micro Hei', 'Noto Sans CJK SC', 
                     'Source Han Sans CN', 'PingFang SC', 'Hiragino Sans GB', 'STHeiti']
    
    # 查找可用的中文字体
    available_fonts = [f.name for f in fm.fontManager.ttflist]
    selected_font = None
    
    for font in chinese_fonts:
        if font in available_fonts:
            selected_font = font
            break
    
    if selected_font is None:
        # 如果没有找到中文字体，使用默认字体并添加字体文件
        try:
            # 尝试使用系统默认字体
            plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial Unicode MS', 'Liberation Sans']
        except:
            pass
    else:
        plt.rcParams['font.sans-serif'] = [selected_font, 'DejaVu Sans']
    
    plt.rcParams['axes.unicode_minus'] = False

# 调用字体设置函数
setup_chinese_font()

def create_system_architecture_diagram():
    """生成系统整体架构图"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 12))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # 标题
    ax.text(8, 11.5, '系统整体架构图', fontsize=16, fontweight='bold', ha='center')
    
    # 1. 用户终端
    user_terminal = FancyBboxPatch((0.5, 9), 2, 1.5, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(user_terminal)
    ax.text(1.5, 9.75, '1. 用户终端', ha='center', va='center', fontsize=10)
    
    # 2. 负载均衡器
    load_balancer = FancyBboxPatch((3.5, 9), 2, 1.5, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(load_balancer)
    ax.text(4.5, 9.75, '2. 负载均衡器', ha='center', va='center', fontsize=10)
    
    # 3. 面板服务
    panel_service = FancyBboxPatch((6.5, 9), 2, 1.5, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(panel_service)
    ax.text(7.5, 9.75, '3. 面板服务', ha='center', va='center', fontsize=10)
    
    # 4. 前端界面
    frontend = FancyBboxPatch((9.5, 9), 2, 1.5, boxstyle="round,pad=0.1", 
                              facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(frontend)
    ax.text(10.5, 9.75, '4. 前端界面', ha='center', va='center', fontsize=10)
    
    # 5. 数据库
    database = FancyBboxPatch((12.5, 9), 2, 1.5, boxstyle="round,pad=0.1", 
                              facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(database)
    ax.text(13.5, 9.75, '5. 数据库', ha='center', va='center', fontsize=10)
    
    # 6. 守护进程
    daemon = FancyBboxPatch((3.5, 7), 2, 1.5, boxstyle="round,pad=0.1", 
                            facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(daemon)
    ax.text(4.5, 7.75, '6. 守护进程', ha='center', va='center', fontsize=10)
    
    # 7. 容器集群
    container_cluster = FancyBboxPatch((0.5, 5), 3, 2, boxstyle="round,pad=0.1", 
                                      facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(container_cluster)
    ax.text(2, 6.5, '7. 容器集群', ha='center', va='center', fontsize=10)
    ax.text(2, 6, 'Container 1', ha='center', va='center', fontsize=8)
    ax.text(2, 5.5, 'Container 2', ha='center', va='center', fontsize=8)
    ax.text(2, 5, 'Container N', ha='center', va='center', fontsize=8)
    
    # 8. 监控系统
    monitoring = FancyBboxPatch((4.5, 5), 2, 2, boxstyle="round,pad=0.1", 
                               facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(monitoring)
    ax.text(5.5, 6.5, '8. 监控系统', ha='center', va='center', fontsize=10)
    
    # 9. 资源调度器
    scheduler = FancyBboxPatch((7.5, 5), 2, 2, boxstyle="round,pad=0.1", 
                               facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(scheduler)
    ax.text(8.5, 6.5, '9. 资源调度器', ha='center', va='center', fontsize=10)
    
    # 10. 网络交换机
    network_switch = FancyBboxPatch((10.5, 5), 2, 2, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(network_switch)
    ax.text(11.5, 6.5, '10. 网络交换机', ha='center', va='center', fontsize=10)
    
    # 连接线
    # 用户终端到负载均衡器
    ax.arrow(2.5, 9.75, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(2.9, 9.5, 'HTTP/HTTPS', ha='center', va='center', fontsize=8)
    
    # 负载均衡器到面板服务
    ax.arrow(5.5, 9.75, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(5.9, 9.5, 'HTTP/HTTPS', ha='center', va='center', fontsize=8)
    
    # 面板服务到前端界面
    ax.arrow(8.5, 9.75, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(8.9, 9.5, 'HTTP/HTTPS', ha='center', va='center', fontsize=8)
    
    # 面板服务到数据库
    ax.arrow(8.5, 9, 3.8, -1.2, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(10.5, 7.5, 'SQL', ha='center', va='center', fontsize=8)
    
    # 面板服务到守护进程
    ax.arrow(7.5, 9, -3.8, -1.2, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(5.5, 7.5, 'WebSocket', ha='center', va='center', fontsize=8)
    
    # 守护进程到容器集群
    ax.arrow(4.5, 7, -3.8, -1.2, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(2.5, 5.5, 'API', ha='center', va='center', fontsize=8)
    
    # 容器集群到监控系统
    ax.arrow(3.5, 6, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(3.9, 5.7, '监控数据', ha='center', va='center', fontsize=8)
    
    # 监控系统到资源调度器
    ax.arrow(6.5, 6, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(6.9, 5.7, '调度指令', ha='center', va='center', fontsize=8)
    
    # 资源调度器到网络交换机
    ax.arrow(9.5, 6, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(9.9, 5.7, '网络流量', ha='center', va='center', fontsize=8)
    
    plt.tight_layout()
    plt.savefig('图1-系统整体架构图.png', dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def create_scheduling_flow_diagram():
    """生成算力调度流程图"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 12))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # 标题
    ax.text(8, 11.5, '算力调度流程图', fontsize=16, fontweight='bold', ha='center')
    
    # 11. 系统启动
    start_ellipse = patches.Ellipse((8, 10), 3, 1, facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(start_ellipse)
    ax.text(8, 10, '11. 系统启动', ha='center', va='center', fontsize=10)
    
    # 12. 初始化监控模块
    init_monitor = FancyBboxPatch((6, 8.5), 4, 1, boxstyle="round,pad=0.1", 
                                 facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(init_monitor)
    ax.text(8, 9, '12. 初始化监控模块', ha='center', va='center', fontsize=10)
    
    # 13. 收集系统资源信息
    collect_info = FancyBboxPatch((6, 7), 4, 1, boxstyle="round,pad=0.1", 
                                 facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(collect_info)
    ax.text(8, 7.5, '13. 收集系统资源信息', ha='center', va='center', fontsize=10)
    
    # 14. 分析资源使用情况
    analyze_usage = FancyBboxPatch((6, 5.5), 4, 1, boxstyle="round,pad=0.1", 
                                  facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(analyze_usage)
    ax.text(8, 6, '14. 分析资源使用情况', ha='center', va='center', fontsize=10)
    
    # 15. 判断是否需要调度
    decision = Polygon([(8, 4.5), (6, 3.5), (10, 3.5)], facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(decision)
    ax.text(8, 4, '15. 判断是否需要调度', ha='center', va='center', fontsize=10)
    
    # 16. 执行资源调度算法
    execute_scheduling = FancyBboxPatch((6, 2.5), 4, 1, boxstyle="round,pad=0.1", 
                                       facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(execute_scheduling)
    ax.text(8, 3, '16. 执行资源调度算法', ha='center', va='center', fontsize=10)
    
    # 17. 更新容器资源配置
    update_config = FancyBboxPatch((6, 1), 4, 1, boxstyle="round,pad=0.1", 
                                  facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(update_config)
    ax.text(8, 1.5, '17. 更新容器资源配置', ha='center', va='center', fontsize=10)
    
    # 18. 监控调度效果
    monitor_effect = FancyBboxPatch((11, 4), 3, 1, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(monitor_effect)
    ax.text(12.5, 4.5, '18. 监控调度效果', ha='center', va='center', fontsize=10)
    
    # 19. 记录调度日志
    log_scheduling = FancyBboxPatch((11, 2.5), 3, 1, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(log_scheduling)
    ax.text(12.5, 3, '19. 记录调度日志', ha='center', va='center', fontsize=10)
    
    # 20. 返回监控循环
    return_loop = FancyBboxPatch((11, 1), 3, 1, boxstyle="round,pad=0.1", 
                                facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(return_loop)
    ax.text(12.5, 1.5, '20. 返回监控循环', ha='center', va='center', fontsize=10)
    
    # 连接线
    # 系统启动到初始化监控模块
    ax.arrow(8, 9.5, 0, -0.3, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 初始化监控模块到收集系统资源信息
    ax.arrow(8, 8.5, 0, -0.3, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 收集系统资源信息到分析资源使用情况
    ax.arrow(8, 7, 0, -0.3, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 分析资源使用情况到判断是否需要调度
    ax.arrow(8, 5.5, 0, -0.3, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 判断是否需要调度到执行资源调度算法
    ax.arrow(8, 3.5, 0, -0.3, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 执行资源调度算法到更新容器资源配置
    ax.arrow(8, 2.5, 0, -0.3, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 判断是否需要调度到监控调度效果
    ax.arrow(10, 4, 0.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.text(10.5, 3.8, '否', ha='center', va='center', fontsize=8)
    
    # 监控调度效果到记录调度日志
    ax.arrow(12.5, 4, 0, -0.3, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 记录调度日志到返回监控循环
    ax.arrow(12.5, 2.5, 0, -0.3, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 返回监控循环到收集系统资源信息
    ax.arrow(11, 1.5, -4.8, 5.8, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 判断分支标签
    ax.text(7.5, 4.2, '是', ha='center', va='center', fontsize=8)
    
    plt.tight_layout()
    plt.savefig('图2-算力调度流程图.png', dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def create_monitoring_interface_diagram():
    """生成资源监控界面图"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 12))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # 标题
    ax.text(8, 11.5, '资源监控界面图', fontsize=16, fontweight='bold', ha='center')
    
    # 顶部区域 - 监控仪表板
    dashboard = FancyBboxPatch((0.5, 9), 15, 2, boxstyle="round,pad=0.1", 
                              facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(dashboard)
    ax.text(8, 10.5, '监控仪表板', ha='center', va='center', fontsize=12, fontweight='bold')
    
    # 21. CPU使用率图表
    cpu_chart = FancyBboxPatch((1, 9.2), 4, 1.5, boxstyle="round,pad=0.1", 
                               facecolor='white', edgecolor='black', linewidth=1)
    ax.add_patch(cpu_chart)
    ax.text(3, 9.95, '21. CPU使用率图表', ha='center', va='center', fontsize=10)
    # 模拟CPU图表线条
    x_cpu = np.linspace(1.2, 4.8, 10)
    y_cpu = 9.5 + 0.8 * np.sin(x_cpu * 2) * np.exp(-x_cpu/3)
    ax.plot(x_cpu, y_cpu, 'k-', linewidth=2)
    ax.text(3, 9.3, '实时CPU使用率', ha='center', va='center', fontsize=8)
    
    # 22. 内存使用率图表
    memory_chart = FancyBboxPatch((5.5, 9.2), 4, 1.5, boxstyle="round,pad=0.1", 
                                 facecolor='white', edgecolor='black', linewidth=1)
    ax.add_patch(memory_chart)
    ax.text(7.5, 9.95, '22. 内存使用率图表', ha='center', va='center', fontsize=10)
    # 模拟内存图表线条
    x_mem = np.linspace(5.7, 9.3, 10)
    y_mem = 9.5 + 0.6 * np.cos(x_mem * 1.5) * np.exp(-x_mem/4)
    ax.plot(x_mem, y_mem, 'k-', linewidth=2)
    ax.text(7.5, 9.3, '实时内存使用率', ha='center', va='center', fontsize=8)
    
    # 23. 网络流量图表
    network_chart = FancyBboxPatch((10, 9.2), 4, 1.5, boxstyle="round,pad=0.1", 
                                  facecolor='white', edgecolor='black', linewidth=1)
    ax.add_patch(network_chart)
    ax.text(12, 9.95, '23. 网络流量图表', ha='center', va='center', fontsize=10)
    # 模拟网络图表线条
    x_net = np.linspace(10.2, 13.8, 10)
    y_net = 9.5 + 0.7 * np.sin(x_net * 3) * np.exp(-x_net/5)
    ax.plot(x_net, y_net, 'k-', linewidth=2)
    ax.text(12, 9.3, '实时网络流量', ha='center', va='center', fontsize=8)
    
    # 中部区域 - 实例管理区域
    instance_area = FancyBboxPatch((0.5, 6), 10, 2.5, boxstyle="round,pad=0.1", 
                                  facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(instance_area)
    ax.text(5.5, 8, '实例管理区域', ha='center', va='center', fontsize=12, fontweight='bold')
    
    # 24. 实例状态列表
    instance_list = FancyBboxPatch((1, 6.2), 4, 2, boxstyle="round,pad=0.1", 
                                  facecolor='white', edgecolor='black', linewidth=1)
    ax.add_patch(instance_list)
    ax.text(3, 7.7, '24. 实例状态列表', ha='center', va='center', fontsize=10)
    instances = ['实例1 - 运行中', '实例2 - 运行中', '实例3 - 已停止', '实例4 - 运行中',
                '实例5 - 运行中', '实例6 - 已停止', '实例7 - 运行中', '实例8 - 运行中']
    for i, instance in enumerate(instances):
        ax.text(1.2, 7.4 - i*0.15, instance, ha='left', va='center', fontsize=8)
    
    # 25. 系统负载指示器
    load_indicator = FancyBboxPatch((5.5, 6.2), 2, 1.5, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=1)
    ax.add_patch(load_indicator)
    ax.text(6.5, 7.4, '25. 系统负载指示器', ha='center', va='center', fontsize=10)
    # 圆形负载指示器
    load_circle = patches.Circle((6.5, 6.8), 0.3, facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(load_circle)
    ax.text(6.5, 6.8, '75%', ha='center', va='center', fontsize=10, fontweight='bold')
    ax.text(6.5, 6.4, '系统负载', ha='center', va='center', fontsize=8)
    
    # 26. 资源分配面板
    resource_panel = FancyBboxPatch((5.5, 5.2), 2, 0.8, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=1)
    ax.add_patch(resource_panel)
    ax.text(6.5, 5.6, '26. 资源分配面板', ha='center', va='center', fontsize=10)
    ax.text(6.5, 5.4, 'CPU: 8核  内存: 16GB', ha='center', va='center', fontsize=8)
    
    # 右侧区域 - 控制面板
    control_panel = FancyBboxPatch((11.5, 6), 4, 2.5, boxstyle="round,pad=0.1", 
                                  facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(control_panel)
    ax.text(13.5, 8, '控制面板', ha='center', va='center', fontsize=12, fontweight='bold')
    
    # 28. 操作控制按钮
    buttons = [
        ('28. 启动实例', 7.5),
        ('停止实例', 7.1),
        ('重启实例', 6.7),
        ('配置实例', 6.3)
    ]
    for text, y_pos in buttons:
        button = FancyBboxPatch((11.7, y_pos-0.1), 3.6, 0.3, boxstyle="round,pad=0.05", 
                               facecolor='white', edgecolor='black', linewidth=1)
        ax.add_patch(button)
        ax.text(13.5, y_pos, text, ha='center', va='center', fontsize=9)
    
    # 底部区域 - 系统信息区域
    info_area = FancyBboxPatch((0.5, 3), 15, 2.5, boxstyle="round,pad=0.1", 
                              facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(info_area)
    ax.text(8, 4.5, '系统信息区域', ha='center', va='center', fontsize=12, fontweight='bold')
    
    # 27. 告警信息区域
    alert_area = FancyBboxPatch((1, 3.2), 6, 2, boxstyle="round,pad=0.1", 
                               facecolor='white', edgecolor='black', linewidth=1)
    ax.add_patch(alert_area)
    ax.text(4, 4.7, '27. 告警信息区域', ha='center', va='center', fontsize=10)
    alerts = ['⚠ 实例1 CPU使用率过高', '⚠ 实例3内存不足', '✓ 系统运行正常', 'ℹ 网络连接正常']
    for i, alert in enumerate(alerts):
        ax.text(1.2, 4.4 - i*0.15, alert, ha='left', va='center', fontsize=8)
    
    # 29. 实时数据更新
    data_update = FancyBboxPatch((7.5, 3.2), 3, 2, boxstyle="round,pad=0.1", 
                                facecolor='white', edgecolor='black', linewidth=1)
    ax.add_patch(data_update)
    ax.text(9, 4.7, '29. 实时数据更新', ha='center', va='center', fontsize=10)
    data_info = ['最后更新: 2024-01-15', '14:30:25', '更新频率: 10秒', '数据源: 系统监控']
    for i, info in enumerate(data_info):
        ax.text(7.7, 4.4 - i*0.15, info, ha='left', va='center', fontsize=8)
    
    # 30. 历史数据查询
    history_query = FancyBboxPatch((11, 3.2), 3, 2, boxstyle="round,pad=0.1", 
                                  facecolor='white', edgecolor='black', linewidth=1)
    ax.add_patch(history_query)
    ax.text(12.5, 4.7, '30. 历史数据查询', ha='center', va='center', fontsize=10)
    history_info = ['查询范围: 24小时', '数据点: 8640个', '导出格式: CSV', '图表类型: 折线图']
    for i, info in enumerate(history_info):
        ax.text(11.2, 4.4 - i*0.15, info, ha='left', va='center', fontsize=8)
    
    plt.tight_layout()
    plt.savefig('图3-资源监控界面图.png', dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def create_container_configuration_diagram():
    """生成容器配置图"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 12))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # 标题
    ax.text(8, 11.5, '容器配置图', fontsize=16, fontweight='bold', ha='center')
    
    # 第一行模块
    # 31. 容器镜像仓库
    image_repo = FancyBboxPatch((0.5, 9), 3, 1.5, boxstyle="round,pad=0.1", 
                               facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(image_repo)
    ax.text(2, 9.75, '31. 容器镜像仓库', ha='center', va='center', fontsize=10)
    ax.text(2, 9.5, 'Docker Hub', ha='center', va='center', fontsize=8)
    ax.text(2, 9.25, '私有仓库', ha='center', va='center', fontsize=8)
    ax.text(2, 9, '本地镜像', ha='center', va='center', fontsize=8)
    
    # 32. 容器创建模块
    container_create = FancyBboxPatch((4, 9), 3, 1.5, boxstyle="round,pad=0.1", 
                                     facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(container_create)
    ax.text(5.5, 9.75, '32. 容器创建模块', ha='center', va='center', fontsize=10)
    ax.text(5.5, 9.5, '镜像拉取', ha='center', va='center', fontsize=8)
    ax.text(5.5, 9.25, '容器初始化', ha='center', va='center', fontsize=8)
    ax.text(5.5, 9, '基础配置', ha='center', va='center', fontsize=8)
    
    # 33. 资源限制配置
    resource_limit = FancyBboxPatch((7.5, 9), 3, 1.5, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(resource_limit)
    ax.text(9, 9.75, '33. 资源限制配置', ha='center', va='center', fontsize=10)
    ax.text(9, 9.5, 'CPU限制', ha='center', va='center', fontsize=8)
    ax.text(9, 9.25, '内存限制', ha='center', va='center', fontsize=8)
    ax.text(9, 9, 'IO限制', ha='center', va='center', fontsize=8)
    
    # 34. 网络配置模块
    network_config = FancyBboxPatch((11, 9), 3, 1.5, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(network_config)
    ax.text(12.5, 9.75, '34. 网络配置模块', ha='center', va='center', fontsize=10)
    ax.text(12.5, 9.5, '网络模式', ha='center', va='center', fontsize=8)
    ax.text(12.5, 9.25, '端口映射', ha='center', va='center', fontsize=8)
    ax.text(12.5, 9, '网络别名', ha='center', va='center', fontsize=8)
    
    # 第二行模块
    # 35. 存储配置模块
    storage_config = FancyBboxPatch((0.5, 7), 3, 1.5, boxstyle="round,pad=0.1", 
                                   facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(storage_config)
    ax.text(2, 7.75, '35. 存储配置模块', ha='center', va='center', fontsize=10)
    ax.text(2, 7.5, '卷挂载', ha='center', va='center', fontsize=8)
    ax.text(2, 7.25, '工作目录', ha='center', va='center', fontsize=8)
    ax.text(2, 7, '数据持久化', ha='center', va='center', fontsize=8)
    
    # 36. 环境变量设置
    env_vars = FancyBboxPatch((4, 7), 3, 1.5, boxstyle="round,pad=0.1", 
                             facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(env_vars)
    ax.text(5.5, 7.75, '36. 环境变量设置', ha='center', va='center', fontsize=10)
    ax.text(5.5, 7.5, '系统环境', ha='center', va='center', fontsize=8)
    ax.text(5.5, 7.25, '应用配置', ha='center', va='center', fontsize=8)
    ax.text(5.5, 7, '运行时参数', ha='center', va='center', fontsize=8)
    
    # 37. 端口映射配置
    port_mapping = FancyBboxPatch((7.5, 7), 3, 1.5, boxstyle="round,pad=0.1", 
                                 facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(port_mapping)
    ax.text(9, 7.75, '37. 端口映射配置', ha='center', va='center', fontsize=10)
    ax.text(9, 7.5, '主机端口', ha='center', va='center', fontsize=8)
    ax.text(9, 7.25, '容器端口', ha='center', va='center', fontsize=8)
    ax.text(9, 7, '协议类型', ha='center', va='center', fontsize=8)
    
    # 38. 容器启动模块
    container_start = FancyBboxPatch((11, 7), 3, 1.5, boxstyle="round,pad=0.1", 
                                    facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(container_start)
    ax.text(12.5, 7.75, '38. 容器启动模块', ha='center', va='center', fontsize=10)
    ax.text(12.5, 7.5, '启动命令', ha='center', va='center', fontsize=8)
    ax.text(12.5, 7.25, '运行参数', ha='center', va='center', fontsize=8)
    ax.text(12.5, 7, '启动策略', ha='center', va='center', fontsize=8)
    
    # 第三行模块
    # 39. 容器监控模块
    container_monitor = FancyBboxPatch((3, 5), 3, 1.5, boxstyle="round,pad=0.1", 
                                      facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(container_monitor)
    ax.text(4.5, 5.75, '39. 容器监控模块', ha='center', va='center', fontsize=10)
    ax.text(4.5, 5.5, '性能监控', ha='center', va='center', fontsize=8)
    ax.text(4.5, 5.25, '状态检查', ha='center', va='center', fontsize=8)
    ax.text(4.5, 5, '日志收集', ha='center', va='center', fontsize=8)
    
    # 40. 容器销毁模块
    container_destroy = FancyBboxPatch((7.5, 5), 3, 1.5, boxstyle="round,pad=0.1", 
                                      facecolor='white', edgecolor='black', linewidth=2)
    ax.add_patch(container_destroy)
    ax.text(9, 5.75, '40. 容器销毁模块', ha='center', va='center', fontsize=10)
    ax.text(9, 5.5, '停止容器', ha='center', va='center', fontsize=8)
    ax.text(9, 5.25, '删除容器', ha='center', va='center', fontsize=8)
    ax.text(9, 5, '清理资源', ha='center', va='center', fontsize=8)
    
    # 连接线
    # 第一行连接
    ax.arrow(3.5, 9.75, 0.3, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.arrow(7, 9.75, 0.3, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.arrow(10.5, 9.75, 0.3, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 第二行连接
    ax.arrow(3.5, 7.75, 0.3, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.arrow(7, 7.75, 0.3, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.arrow(10.5, 7.75, 0.3, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 垂直连接
    ax.arrow(12.5, 8.5, -8.8, -1.3, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    ax.arrow(4.5, 6.5, 2.8, 0, head_width=0.1, head_length=0.1, fc='black', ec='black', linewidth=2)
    
    # 反馈循环
    feedback = ConnectionPatch((4.5, 5.75), (9, 9.75), "data", "data",
                             arrowstyle="->", shrinkA=5, shrinkB=5, 
                             mutation_scale=20, fc="black", ec="black", linewidth=2, linestyle='--')
    ax.add_patch(feedback)
    
    # 标签
    labels = [
        ('镜像选择', 3.8, 9.5),
        ('资源配置', 7.3, 9.5),
        ('网络配置', 10.8, 9.5),
        ('环境配置', 3.8, 7.5),
        ('端口配置', 7.3, 7.5),
        ('启动配置', 10.8, 7.5),
        ('生命周期管理', 4.5, 4.5),
        ('资源清理', 9, 4.5),
        ('反馈循环', 6.5, 6.5)
    ]
    
    for text, x, y in labels:
        ax.text(x, y, text, ha='center', va='center', fontsize=8)
    
    plt.tight_layout()
    plt.savefig('图4-容器配置图.png', dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def main():
    """主函数"""
    print("正在生成专利图表...")
    
    # 生成系统整体架构图
    print("生成图1-系统整体架构图.png")
    create_system_architecture_diagram()
    
    # 生成算力调度流程图
    print("生成图2-算力调度流程图.png")
    create_scheduling_flow_diagram()
    
    # 生成资源监控界面图
    print("生成图3-资源监控界面图.png")
    create_monitoring_interface_diagram()
    
    # 生成容器配置图
    print("生成图4-容器配置图.png")
    create_container_configuration_diagram()
    
    print("所有图表生成完成！")

if __name__ == "__main__":
    main()
