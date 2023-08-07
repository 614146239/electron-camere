<template>
  <div class="page">
    <div class="isFaceModel">
      <label> 是否背景切割</label>
      <el-switch
        v-model="backgroundCutConfig.isCut"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        @change="changeCut"
      />
    </div>
    <div class="isFaceModel">
      <!-- <label> 是否背景切割</label> -->
      <el-switch
        v-model="backgroundCutConfig.bokehOrSwitch"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        active-text="背景模糊"
        inactive-text="替换背景"
        :disabled="!backgroundCutConfig.isCut"
        @change="changeBrokeh"
      />
    </div>
    <div class="bokeh">
      <h1>背景虚化</h1>
      <div class="slider">
        <span class="label">前景阈值</span>
        <el-slider
          v-model="backgroundCutConfig.foregroundThreshold"
          :min="0"
          show-stops
          :max="1"
          :step="0.1"
          @change="change($event, 'foregroundThreshold')"
        />
      </div>
      <div class="slider">
        <span class="label">背景模糊</span>
        <el-slider
          v-model="backgroundCutConfig.backgroundBlurAmount"
          :min="1"
          show-stops
          :max="20"
          :step="1"
          @change="change($event, 'backgroundBlurAmount')"
        />
      </div>
      <div class="slider">
        <span class="label">边缘模糊</span>
        <el-slider
          v-model="backgroundCutConfig.edgeBlurAmount"
          :min="0"
          show-stops
          :max="20"
          :step="1"
          @change="change($event, 'edgeBlurAmount')"
        />
      </div>
    </div>
    <div class="bokeh">
      <h1>背景替换</h1>
      <div class="slider">
        <span class="label">遮罩不透明度</span>
        <el-slider
          v-model="backgroundCutConfig.opacity"
          :min="0"
          input-size="large"
          show-stops
          :max="1"
          :step="0.1"
          @change="change($event, 'opacity')"
        />
      </div>
      <div class="slider">
        <span class="label">蒙版模糊</span>
        <el-slider
          v-model="backgroundCutConfig.maskBlurAmount"
          :min="0"
          show-stops
          :max="20"
          :step="1"
          @change="change($event, 'maskBlurAmount')"
        />
      </div>
    </div>
    <!--  -->
    <div class="backdropImg">
      <h1>背景贴图</h1>
      <ul class="list">
        <li
          v-for="item in backdropImg"
          :key="item.path"
          :class="choice == item.path ? 'chooseItem' : ''"
          @click="choose(item)"
        >
          <img :src="item.path" alt="" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from '../store/index'
import { useBroadcastChannel } from '@vueuse/core'

const store = useStore()
const backgroundCutConfig = store.backgroundCutConfig

const { post } = useBroadcastChannel({
  name: 'backdropCut'
})
const change = (value, config): void => {
  backgroundCutConfig[config] = value
  post(JSON.stringify(backgroundCutConfig))
}
const changeCut = (bool): void => {
  backgroundCutConfig.isCut = bool
  post(JSON.stringify(backgroundCutConfig))
}
const changeBrokeh = (bool): void => {
  backgroundCutConfig.bokehOrSwitch = bool
  post(JSON.stringify(backgroundCutConfig))
}
//
const backdropImg: { path: string }[] = [
  {
    path: 'https://static.yximgs.com/udata/pkg/y-tech-open-platform/common/2ed5edc1a56e353bf8dabdabb640480e.jpeg'
  },
  {
    path: 'https://static.yximgs.com/udata/pkg/y-tech-open-platform/common/d842f4673127224d42a84b9a9684f07f.jpeg'
  },
  {
    path: 'https://static.yximgs.com/udata/pkg/y-tech-open-platform/common/dea36ed8b7756727351a94f197b0daad.jpeg'
  },
  {
    path: 'https://static.yximgs.com/udata/pkg/y-tech-open-platform/common/ed83312458fa92498baacff647537f90.jpeg'
  }
]
const choice = ref(
  'https://static.yximgs.com/udata/pkg/y-tech-open-platform/common/2ed5edc1a56e353bf8dabdabb640480e.jpeg'
)
choice.value = backgroundCutConfig.backdropImg
const choose = (item: { path: string }): void => {
  choice.value = item.path
  backgroundCutConfig.backdropImg = item.path
  post(JSON.stringify(backgroundCutConfig))
}
</script>

<style scoped lang="less">
.page {
  padding: 20px;
  color: #fff;
  .isFaceModel {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    label {
      font-weight: bold;
      color: #fff !important;
      margin-right: 20px !important;
    }
  }
  .bokeh {
    h1 {
      font-size: 25px;
      margin-bottom: 20px;
      color: #1d9f92;
    }
    .slider {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      .label {
        width: 100px;
      }
    }
  }
  .backdropImg {
    h1 {
      margin-bottom: 20px;
      color: #1d9f92;
    }
    .list {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-gap: 10px;
      // padding: 20px;
      li {
        width: 100%;
        border: 2px solid #1fa059;
        background-color: #4f6174;
        img {
          width: 100%;
          height: 100%;
          background-size: cover;
        }
      }
    }
  }
}
:deep(.el-switch__label) {
  color: var(--el-color-white);
  :ddep(.is-active) {
    color: var(--el-color-primary);
  }
}
.chooseItem {
  border: 2px solid red !important;
  background-color: #fff !important;
}
</style>
