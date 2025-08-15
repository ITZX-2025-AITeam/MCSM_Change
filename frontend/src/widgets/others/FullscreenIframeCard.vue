<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { $t as t } from "@/lang/i18n";
import type { LayoutCard } from "@/types/index";
import { useLayoutCardTools } from "@/hooks/useCardTools";
import { Empty } from "ant-design-vue";

const props = defineProps<{
  card: LayoutCard;
}>();

const { getMetaValue } = useLayoutCardTools(props.card);

const urlSrc = ref(getMetaValue("url", ""));
const myIframe = ref<HTMLIFrameElement | null>(null);
const myIframeLoading = ref(false);
const hasError = ref(false);

const errorHost = computed(() => {
  try {
    const u = new URL(urlSrc.value);
    return u.hostname || urlSrc.value;
  } catch {
    return urlSrc.value;
  }
});

// 计算导航栏高度，用于全屏显示
const navbarHeight = 60; // MCSManager导航栏实际高度
const fullscreenHeight = computed(() => `calc(100vh - ${navbarHeight}px)`);

onMounted(() => {
  if (myIframe.value) {
    myIframeLoading.value = true;
    myIframe.value.onload = () => {
      myIframeLoading.value = false;
      hasError.value = false;
    };
    myIframe.value.onerror = () => {
      myIframeLoading.value = false;
      hasError.value = true;
    };
  }
});
</script>

<template>
  <div class="fullscreen-iframe-container">
    <div v-if="urlSrc !== ''" class="fullscreen-iframe-wrapper">
      <!-- 加载状态 -->
      <div v-show="myIframeLoading" class="loading-overlay">
        <a-spin size="large" />
        <div class="loading-text">{{ t("正在加载") }} {{ card.title }}</div>
      </div>

      <!-- 错误状态 -->
      <div v-if="hasError" class="error-overlay">
        <div class="error-box">
          <div class="error-line">{{ errorHost }} 拒绝了我们的连接请求。</div>
          <div class="error-line">请前往后端运行实例服务</div>
        </div>
      </div>
      
      <!-- 全屏iframe -->
      <iframe
        v-show="!myIframeLoading && !hasError"
        ref="myIframe"
        :src="urlSrc"
        class="fullscreen-iframe"
        :style="{ height: fullscreenHeight }"
        frameborder="0"
        marginwidth="0"
        marginheight="0"
        allowfullscreen
      ></iframe>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="empty-state-container">
      <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE">
        <template #description>
          <span>{{ t("未配置URL地址") }}</span>
        </template>
      </a-empty>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fullscreen-iframe-container {
  position: fixed;
  top: 60px; /* 导航栏实际高度 */
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: #ffffff;
  margin: 0;
  padding: 0;
  border: none;
  box-sizing: border-box;
  /* 消除可能的边距和边框 */
  outline: none;
  overflow: hidden;
}

.fullscreen-iframe-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.fullscreen-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
  /* 确保iframe完全贴合 */
  vertical-align: top;
  box-sizing: border-box;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.9);
  z-index: 1001;
}

.loading-text {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
}

.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 1002;
}

.error-box {
  text-align: center;
  color: #333;
  font-size: 16px;
  line-height: 1.8;
}

.error-line + .error-line {
  margin-top: 6px;
}

.empty-state-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #fafafa;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .fullscreen-iframe-container {
    top: 60px; /* 保持一致的导航栏高度 */
  }
}

/* 确保在移动设备上也能正常显示 */
@media (orientation: landscape) and (max-height: 500px) {
  .fullscreen-iframe-container {
    top: 60px; /* 保持一致 */
  }
}

/* 全局样式重置，确保无缝隙 */
body.fullscreen-mode {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
