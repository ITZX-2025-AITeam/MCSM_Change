<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { $t as t } from "@/lang/i18n";
import { useAppToolsStore } from "@/stores/useAppToolsStore";
import { useLayoutContainerStore } from "@/stores/useLayoutContainerStore";
import CardPanel from "@/components/CardPanel.vue";
import IconBtn from "@/components/IconBtn.vue";
import type { LayoutCard } from "@/types/index";
import { Empty } from "ant-design-vue";
import { FullscreenOutlined, FullscreenExitOutlined } from "@ant-design/icons-vue";
import { useLayoutCardTools } from "@/hooks/useCardTools";

const props = defineProps<{
  card: LayoutCard;
}>();

const { getMetaValue, setMetaValue } = useLayoutCardTools(props.card);

const { containerState } = useLayoutContainerStore();
const urlSrc = ref(getMetaValue("url", ""));
const fullCard = computed(() => getMetaValue("full"));
const { openInputDialog } = useAppToolsStore();

const editImgSrc = async () => {
  try {
    urlSrc.value = (await openInputDialog(t("TXT_CODE_45364559"))) as string;
    setMetaValue("url", urlSrc.value);
  } catch (error: any) {}
};

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

const toggleFullCard = () => {
  setMetaValue("full", !fullCard.value);
};

onMounted(() => {
  watch([urlSrc, myIframe], () => {
    try {
      myIframeLoading.value = true;
      if (myIframe.value) {
        myIframe.value.onload = () => {
          myIframeLoading.value = false;
          hasError.value = false;
        };
        myIframe.value.onerror = () => {
          myIframeLoading.value = false;
          hasError.value = true;
        };
      }
    } catch (error: any) {
      console.error(error);
    }
  });
});
</script>

<template>
  <div style="width: 100%; height: 100%; position: relative">
    <CardPanel v-if="urlSrc !== ''" style="backdrop-filter: blur()">
      <template #title>
        {{ card.title }}
        <a-button
          v-if="urlSrc !== '' && containerState.isDesignMode"
          class="ml-10"
          type="primary"
          size="small"
          @click="editImgSrc()"
        >
          {{ t("TXT_CODE_78930f0f") }}
        </a-button>
      </template>
      <template v-if="containerState.isDesignMode" #operator>
        <IconBtn
          :icon="fullCard ? FullscreenExitOutlined : FullscreenOutlined"
          :title="fullCard ? t('TXT_CODE_2818a7bc') : t('TXT_CODE_52ba5942')"
          @click="toggleFullCard"
        ></IconBtn>
      </template>

      <template #body>
        <a-skeleton
          v-show="myIframeLoading"
          active
          :paragraph="{ rows: parseInt(card.height[0]) * 2 }"
        />
        <div v-if="hasError" class="error-overlay">
          <div class="error-box">
            <div class="error-line">{{ errorHost }} 拒绝了我们的连接请求。</div>
            <div class="error-line">请前往后端运行实例服务</div>
          </div>
        </div>
        <iframe
          v-show="!myIframeLoading && !hasError"
          ref="myIframe"
          :src="urlSrc"
          :style="{
            height: card.height,
            width: '100%',
            'z-index': containerState.isDesignMode ? -1 : 1
          }"
          :class="{ 'full-card-iframe': fullCard }"
          frameborder="0"
          marginwidth="0"
          marginheight="0"
        ></iframe>
      </template>
    </CardPanel>
    <CardPanel v-else style="height: 100%">
      <template #body>
        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE">
          <template #description>
            <span>{{ t("TXT_CODE_6239c6b6") }}</span>
          </template>
          <a-button type="primary" @click="editImgSrc()">{{ t("TXT_CODE_dde54f31") }}</a-button>
        </a-empty>
      </template>
    </CardPanel>
  </div>
</template>

<style scoped lang="scss">
.full-card-iframe {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  border-radius: 6px;
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
  z-index: 10;
}

.error-box {
  text-align: center;
  color: #333;
  font-size: 14px;
  line-height: 1.8;
}

.error-line + .error-line {
  margin-top: 6px;
}
</style>
