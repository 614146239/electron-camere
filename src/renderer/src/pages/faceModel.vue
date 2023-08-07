<template>
  <div class="page">
    <div class="isFaceModel">
      <label> 加载人脸模型</label>
      <el-switch
        v-model="faceModelConfig.isFaceModel"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
        @change="changeModel"
      />
    </div>
    <div class="module">
      <ul class="list">
        <li
          v-for="item in modelArr"
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
import { useStore } from '../store/index'
import { ref } from 'vue';
import { useBroadcastChannel } from '@vueuse/core'
const store = useStore()
const faceModelConfig = store.faceModelConfig
const choice = ref(new URL('../assets/img/face.png', import.meta.url).href)
choice.value = faceModelConfig.modelUrl

const modelArr: { path: string }[] = [
  {
    path: new URL('../assets/img/face.png', import.meta.url).href
  },
  {
    path: new URL('../assets/img/cheek.png', import.meta.url).href
  },
  {
    path: new URL('../assets/img/face_.png', import.meta.url).href
  },
  {
    path: new URL('../assets/img/face_gird.png', import.meta.url).href
  },
  {
    path: new URL('../assets/img/glass.png', import.meta.url).href
  },
  {
    path: new URL('../assets/img/makeup.png', import.meta.url).href
  }
]
const { post } = useBroadcastChannel({
  name: 'faceModel'
})
const choose = (item: { path: string }): void => {
  choice.value = item.path
  faceModelConfig.modelUrl = item.path
  post(JSON.stringify(faceModelConfig))
}
const changeModel = (bool): void => {
  faceModelConfig.isFaceModel = bool
  post(JSON.stringify(faceModelConfig))
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
      color: #fff;
      margin-right: 20px;
    }
  }
  .module {
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
        }
      }
    }
  }
  .chooseItem {
    border: 2px solid red !important;
    background-color: #fff !important;
  }
}
</style>
