<template>
  <div>
    <h1>我的服务</h1>
    <!-- 代码缩进调整：使用2个实际空格替代&nbsp;，提升代码可读性 -->
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.100:5050" target="_blank">模型资产管理</a></h2>
    <br style="margin-left: 20px;">         <!-- 通过CSS控制页面显示缩进 -->
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.100:5051" target="_blank">模型隐私安全 黑盒测试</a></h2>
    <br style="margin-left: 20px;">         <!-- 通过CSS控制页面显示缩进 -->
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.100:5173/upload_files/Chat_Web/Chat1.html" target="_blank">流式传输 对话Web A</a></h2>
    <br style="margin-left: 20px;">         <!-- 通过CSS控制页面显示缩进 -->
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.100:5173/upload_files/Chat_Web/Chat2.html" target="_blank">流式传输 对话Web B</a></h2>
    <br style="margin-left: 20px;">         <!-- 通过CSS控制页面显示缩进 -->
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.99:1145" target="_blank">Qwen 图片识别（请启动Server实例 Qwen_Picture）</a></h2>
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.99:1145/attack" target="_blank">红队攻击页面</a></h2>
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.99:1145/defense" target="_blank">蓝队防御页面</a></h2>
    <br style="margin-left: 20px;">         <!-- 通过CSS控制页面显示缩进 -->
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.100:5000/" target="_blank">模型分析（请启动Ubuntu_server实例 privacy_meter）</a></h2>
    <br style="margin-left: 20px;">         <!-- 通过CSS控制页面显示缩进 -->
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.100:9191/" target="_blank">API 密钥加密（请启动Server实例 API Encryption）</a></h2>
    <br style="margin-left: 20px;">         <!-- 通过CSS控制页面显示缩进 -->
    <h2 style="margin-left: 20px;"><a href="http://192.168.1.100:8000/" target="_blank">智驾视觉模型安全分析实战（请启动Server实例 Mix_end）</a></h2>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
div {
  padding: 20px;
  background: white;
  margin: 20px;
  border-radius: 16px;
}

h1 {
  font-size: 50px;                            /* 标题字号调整 */
}
/* 去除下划线 */
a {
  text-decoration: none;
  color: black;
}

</style>