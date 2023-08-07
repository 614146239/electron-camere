<template>
  <div ref="containRef" class="app" :style="borderStyle">
    <video ref="videoRef" autoplay muted="true" :class="{ reverse: config.reverse }"></video>
    <canvas ref="canvasSegmentation" class="none" :class="{ reverse: config.reverse }"></canvas>
    <canvas ref="canvasRef" class="threeJs" :class="{ reverse: config.reverse }"></canvas>
    <div ref="settingRef" class="setting">
      <div class="until">
        <div class="icon">
          <el-icon @click="closeWindow"><SwitchButton /></el-icon>
        </div>
        <div class="icon">
          <el-icon v-if="!config.isFullScreen" @click="fullScreen"><FullScreen /></el-icon>
          <el-icon v-else @click="exitFullScreen"><Crop /></el-icon>
        </div>
        <div class="icon">
          <el-icon @click="overturn"><Switch /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { ref, reactive } from 'vue'
import drag from '../utils/drag'
import { useRoute } from 'vue-router'

// three
import {
  AmbientLight,
  // Box3,
  BufferGeometry,
  DoubleSide,
  // Euler,
  Float32BufferAttribute,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  // Object3D,
  OrthographicCamera,
  PlaneGeometry,
  PointLight,
  // Quaternion,
  SRGBColorSpace,
  Scene,
  Texture,
  TextureLoader,
  Uint16BufferAttribute,
  // Vector3,
  VideoTexture,
  WebGLRenderer
} from 'three'

import '@mediapipe/face_mesh'

import * as tf from '@tensorflow/tfjs'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
// Register WebGL backend.
// 导入 delaunator 库
import { TRIANGULATION, uvCoords } from '../utils/TRIANGULATION'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
// 身体分割
import * as bodySegmentation from '@tensorflow-models/body-segmentation'
import '@mediapipe/selfie_segmentation'
import { useBroadcastChannel } from '@vueuse/core'
const videoRef = ref()
const canvasRef = ref()
const canvasSegmentation = ref()
const containRef = ref()
const tracks = ref()
const loopRender = ref()
const windowWidth = window.innerWidth
const windowHeight = window.innerHeight
const route = useRoute()
const { data: faceModel }: { data: any } = useBroadcastChannel({
  name: 'faceModel'
})
let faces
// 数据要从store中存储
const store = useStore()
let config = store.config
const constraints = store.constraints
let faceModelConfig = store.faceModelConfig
const borderStyle = reactive({
  border: `${config.borderWidth}px  solid  ${config.borderColor}`,
  borderRadius: config.isCircle ? '50%' : '5%'
})
onMounted(async () => {
  const canvas = canvasRef.value
  const canvas2D = canvasSegmentation.value
  const ctx = canvas2D.getContext('2d', { alpha: true })
  const video = videoRef.value

  drag(Number(route.query.id))
  navigator.mediaDevices.getUserMedia({ video: constraints.video }).then((stream) => {
    video.srcObject = stream
    tracks.value = stream.getTracks()
    // const capabilities = tracks.value.getCapabilities()
    // for (const option of capabilities.width) {
    //   if (option > constraints.video.width) {
    //     constraints.video.width = option
    //   }
    // }
    // for (const option of capabilities.height) {
    //   if (option > constraints.video.width) {
    //     constraints.video.width = option
    //   }
    // }
  })
  //tf
  tf.setBackend('webgl')
  // 加载模型
  const faceMmodel = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
  const detector = await faceLandmarksDetection.createDetector(faceMmodel, {
    //mediapipe参数 vite打包失败
    maxFaces: 1, //检测到的最大面部数量
    refineLandmarks: true, //可以完善眼睛和嘴唇周围的地标坐标，并在虹膜周围输出其他地标
    runtime: 'mediapipe', //tfjs，mediapipe
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh'
    // solutionPath: new URL('../../public/face_mesh', import.meta.url).href
  })

  // 获取人脸位置信息
  const detectFaces = async (): Promise<void> => {
    faces = await detector.estimateFaces(video, { flipHorizontal: false })
    // 人脸加载完成进行贴图
    if (faces.length > 0) {
      const keypoints = faces[0]?.keypoints
      // 去除name属性，去除键名，返回人脸xyz数组
      const facePosition = keypoints
        .map((faces) => {
          const { name, ...rest } = faces
          return rest
        })
        .map((faces: { [s: string]: unknown } | ArrayLike<unknown>) => Object.values(faces))
      if (facePosition) {
        // 更新人脸位置
        updateGeometry(facePosition)
      }
    } else {
      // 未检测人脸贴图消失
      updateGeometry([])
    }
  }
  // 获取身体位置
  const bodyModel = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation
  const segmenter = await bodySegmentation.createSegmenter(bodyModel, {
    runtime: 'mediapipe',
    modelType: 'landscape', // 'general', 'landscape
    // solutionPath: '../../src/assets/model/@mediapipe/selfie_segmentation'
    solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation'
  })
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = (): void => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }
  let backgroundCutConfig = store.backgroundCutConfig

  // 跨页面通讯
  const { data: backdropCut }: { data: any } = useBroadcastChannel({
    name: 'backdropCut'
  })
  // 缓存纹理
  const textureCache = {}
  const handleBackgroundCutConfigChange = (): void => {
    const key = backgroundCutConfig.isCut ? 'cut' : 'video'
    // 如果已经有缓存的纹理对象，则直接使用缓存的纹理
    if (textureCache[key]) {
      videoMaterial.map = textureCache[key]
      return
    }
    if (backgroundCutConfig.isCut) {
      videoTexture = new Texture(canvas2D)
    } else {
      videoTexture = new VideoTexture(videoRef.value)
    }
    videoMaterial.map = videoTexture
    videoTexture.minFilter = LinearFilter
    videoTexture.magFilter = LinearFilter
    videoTexture.colorSpace = SRGBColorSpace
    textureCache[key] = videoTexture
  }
  watch(backdropCut, async (): Promise<void> => {
    backgroundCutConfig = JSON.parse(backdropCut.value)
    handleBackgroundCutConfigChange()
    backdropImg = await loadImage(backgroundCutConfig.backdropImg)
  })
  const foregroundColor = { r: 0, g: 0, b: 0, a: 0 }
  const backgroundColor = { r: 0, g: 0, b: 0, a: 255 }

  let backdropImg = await loadImage(backgroundCutConfig.backdropImg)

  const backgroundReplace = async (): Promise<void> => {
    const people = await segmenter.segmentPeople(video, {
      flipHorizontal: false,
      multiSegmentation: false,
      segmentBodyParts: true
    })

    if (backgroundCutConfig.bokehOrSwitch) {
      await bodySegmentation.drawBokehEffect(
        canvas2D,
        video,
        people,
        backgroundCutConfig.foregroundThreshold,
        backgroundCutConfig.backgroundBlurAmount,
        backgroundCutConfig.edgeBlurAmount,
        false
      )
    } else {
      const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
        people,
        foregroundColor,
        backgroundColor
      )
      await bodySegmentation.drawMask(
        canvas2D,
        video,
        backgroundDarkeningMask,
        backgroundCutConfig.opacity,
        backgroundCutConfig.maskBlurAmount,
        false
      )
      // 合成
      ctx.putImageData(backgroundDarkeningMask, 0, 0)
      ctx.globalCompositeOperation = 'source-in'
      // // 背景图
      ctx.drawImage(backdropImg, 0, 0, video.videoWidth, video.videoHeight)
      ctx.globalCompositeOperation = 'destination-over'

      // // 视频
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  const scene = new Scene()
  //添加一些光照
  scene.add(new AmbientLight(0xcccccc, 0.4))
  const camera = new OrthographicCamera(
    windowWidth / -2,
    windowWidth / 2,
    windowHeight / 2,
    windowHeight / -2,
    0.1,
    2000
  )
  camera.position.set(0, 0, 1000)
  camera.add(new PointLight(0xffffff, 0.8))
  camera.position.set(0, 0, 0.15)
  scene.add(camera)
  const renderer = new WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)

  // 视频纹理
  let videoTexture
  if (backgroundCutConfig.isCut) {
    videoTexture = new Texture(canvas2D)
  } else {
    videoTexture = new VideoTexture(videoRef.value)
  }

  videoTexture.repeat.set(1, 1)
  videoTexture.minFilter = LinearFilter
  videoTexture.magFilter = LinearFilter
  // three.js  颜色值rgba,否则视频发白
  videoTexture.colorSpace = SRGBColorSpace
  //
  const canvasWidth = canvas.clientWidth
  const canvasHeight = canvas.clientHeight
  // 计算宽高比例
  const aspectRatio = canvasWidth / canvasHeight
  //
  // 创建材质大小和canvas大小一致
  const videoGeometry = new PlaneGeometry(canvasWidth, canvasWidth / aspectRatio)
  const videoMaterial = new MeshBasicMaterial({
    map: videoTexture
  })
  const videoCube = new Mesh(videoGeometry, videoMaterial)
  videoCube.position.set(0, 0, -800)
  scene.add(videoCube)
  camera.lookAt(videoCube.position)

  //创建geometry，将468个人脸特征点按照一定的顺序(TRIANGULATION)组成三角网格，并加载UV_COORDS
  const geometry = new BufferGeometry()
  // 设置连接顺序
  geometry.setIndex(new Uint16BufferAttribute(TRIANGULATION, 1))
  //加载uv
  const uvAttribute = new Float32BufferAttribute(
    // uv中v是反的需要转换，如果不转换下巴在头上
    uvCoords.flat().map((item, index) => ((index + 1) % 2 ? item : 1 - item)),
    2
  )
  // 创建几何体对象并将顶点和 UV 属性设置给它
  geometry.setAttribute('uv', uvAttribute)
  // 创建material  加载贴图
  const textureLoader = new TextureLoader()
  let faceMaterial: MeshBasicMaterial
  textureLoader.load(faceModelConfig.modelUrl, (texture) => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 16
    // 创建材质
    faceMaterial = new MeshBasicMaterial({
      map: texture,
      side: DoubleSide,
      transparent: true
    })
    faceMaterial.needsUpdate = true
    const mesh = new Mesh(geometry, faceMaterial)
    scene.add(mesh)
  })
  // 跨页面通信
  watch(faceModel, () => {
    faceModelConfig = JSON.parse(faceModel.value)
    faceMaterial.map = textureLoader.load(faceModelConfig.modelUrl, (texture) => {
      texture.colorSpace = SRGBColorSpace
      texture.anisotropy = 16
    })
  })
  // 加载模型
  // const loader = new GLTFLoader()
  // // const object3D = new Object3D()
  // // model.position.set(0, 0, 0)
  // loader.load('../../src/assets/img/bear.glb', (gltf) => {
  //   const object = gltf.scene
  //   const box = new Box3().setFromObject(object)
  //   // const size = box.getSize(new Vector3()).length()

  //   const center = box.getCenter(new Vector3())
  //   object.position.x += object.position.x - center.x
  //   object.position.y += object.position.y - center.y + 1
  //   object.position.z += object.position.z - center.z - 15

  //   // object3D.add(object)
  //   // scene.add(object3D)
  // })
  // const getScale = (object, face, x, y): number => {
  //   const KeyPointA = resolveMesh(
  //     [Object.values(face.keypoints[x])],
  //     videoRef.value.videoWidth,
  //     videoRef.value.videoHeight
  //   )
  //   const KeyPointB = resolveMesh(
  //     [Object.values(face.keypoints[y])],
  //     videoRef.value.videoWidth,
  //     videoRef.value.videoHeight
  //   )
  //   //   // 计算最左侧和最右侧关键点之间的距离
  //   const distance = Math.sqrt(
  //     Math.pow(KeyPointA[0] - KeyPointB[0], 2) +
  //       Math.pow(KeyPointA[1] - KeyPointB[1], 2) +
  //       Math.pow(KeyPointA[2] - KeyPointB[2], 2)
  //   )
  //   return distance
  // }
  // const getRotation = (object, face, top, left, right): Quaternion => {
  //   const KeyPointTop = resolveMesh(
  //     [Object.values(face.keypoints[top])],
  //     videoRef.value.videoWidth,
  //     videoRef.value.videoHeight
  //   )
  //   const KeyPointLeft = resolveMesh(
  //     [Object.values(face.keypoints[left])],
  //     videoRef.value.videoWidth,
  //     videoRef.value.videoHeight
  //   )
  //   const KeyPointRight = resolveMesh(
  //     [Object.values(face.keypoints[right])],
  //     videoRef.value.videoWidth,
  //     videoRef.value.videoHeight
  //   )
  //   // 计算旋转的欧拉角（Euler angles）
  //   const angleX = Math.atan2(
  //     KeyPointRight[1] - KeyPointLeft[1],
  //     KeyPointRight[2] - KeyPointLeft[2]
  //   )
  //   const angleY = Math.atan2(
  //     KeyPointTop[0] - (KeyPointLeft[0] + KeyPointRight[0]) / 2,
  //     KeyPointTop[2] - (KeyPointLeft[2] + KeyPointRight[2]) / 2
  //   )
  //   const angleZ = 0

  //   const euler = new Euler(angleX, angleY, angleZ, 'YXZ')
  //   const quaternion = new Quaternion().setFromEuler(euler)
  //   return quaternion
  // }
  // const track = (object, face): void => {
  //   if (face) {
  //     const position = face?.keypoints[9]
  //     const centerPosition = resolveMesh(
  //       [Object.values(position)],
  //       videoRef.value.videoWidth,
  //       videoRef.value.videoHeight
  //     )
  //     object.position.set(...centerPosition)
  //     const scale = getScale(object, face, 234, 454)
  //     getScale(object, face, 234, 454)
  //     object.scale.setScalar(scale / 18)
  //     object.scale.x *= -1
  //     // 模型旋转
  //     // const rotation = getRotation(object, face, 10, 50, 280)
  //     // object.setRotationFromQuaternion(rotation)
  //     // object.rotation.setFromRotationMatrix(rotation)
  //   }
  // }
  //从人脸检测模型获取的人脸网格坐标转换为模型位置
  const resolveMesh = (faceMesh, videoWidth, videoHeight): [] => {
    const canvasWidth = windowWidth
    const canvasHeight = windowHeight
    const scaleX = canvasWidth / video.videoWidth
    const scaleY = canvasHeight / video.videoHeight
    return faceMesh
      .map((p: number[]) => [
        (p[0] - videoWidth / 2) * scaleX,
        (videoHeight / 2 - p[1]) * scaleY,
        -p[2] - 100
      ])
      .flat()
  }
  // updateGeometry方法用于更新Three.js场景中的几何体（geometry），以便根据检测到的人脸关键点的位置进行渲染。
  const updateGeometry = (prediction): void => {
    const positionBuffer = resolveMesh(prediction, video.videoWidth, video.videoHeight)
    videoTexture.needsUpdate = true
    geometry.setAttribute('position', new Float32BufferAttribute(positionBuffer, 3))
    geometry.computeVertexNormals()
    geometry.attributes.uv.needsUpdate = true
    geometry.attributes.position.needsUpdate = true
  }
  // 控制场景渲染
  const render = async (): Promise<void> => {
    // 背景替换
    if (backgroundCutConfig.isCut) {
      await backgroundReplace()
    }
    // 人脸贴图
    if (faceModelConfig.isFaceModel) {
      await detectFaces()
    } else {
      updateGeometry([])
      videoTexture.needsUpdate = true
    }
    // track(object3D, faces[0])
    renderer.render(scene, camera)
    loopRender.value = requestAnimationFrame(render)
  }
  video.addEventListener('loadeddata', async () => {
    video.style.display = 'none'
    render()
  })
  // 监听屏幕改变canvas
  window.addEventListener('resize', () => {
    if (!config.isFullScreen) {
      window.api.resize(Number(route.query.id), config.isCircle)
    }
    // // 更新相机和投影矩阵
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
})

const closeWindow = (): void => {
  store.closeWindow(route.query.id)
}
const fullScreen = (): void => {
  config.isFullScreen = true
  borderStyle.borderRadius = '0'
  window.api.setFullScreen(route.query.id, true)
}
const exitFullScreen = (): void => {
  config.isFullScreen = false
  borderStyle.borderRadius = config.isCircle ? '50%' : '5%'
  window.api.setFullScreen(route.query.id, false)
}
const overturn = (): void => {
  config.reverse = !config.reverse
}
const { data: webCam }: { data: any } = useBroadcastChannel({
  name: 'webCam'
})
watch(webCam, () => {
  config = JSON.parse(webCam.value)
  borderStyle.border = `${config.borderWidth}px  solid  ${config.borderColor}`
  borderStyle.borderRadius = config.isCircle ? '50%' : '5%'
  window.api.changeShape(route.query.id, window.innerHeight, config.isCircle)
})

// 关闭所有流媒体
onBeforeUnmount(() => {
  cancelAnimationFrame(loopRender.value)
  tracks.value.forEach((track): void => {
    track.stop()
  })
  videoRef.value.srcObject = null
})
</script>

<style scoped lang="less">
.app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 9999;
  position: relative;
  &:hover > .setting {
    display: block;
  }
}
video {
  width: 100%;
  height: 100%;
  // display: none;
  object-fit: cover;
}
.threeJs {
  z-index: 99999;
}
.none {
  // width: 100%;
  // height: 100%;
  display: none;
  // object-fit: cover;
}
.reverse {
  // 切换镜像，video旋转y轴180
  transform: rotateY(180deg);
}
.setting {
  position: absolute;
  bottom: 8vh;
  left: 50%;
  transform: translateX(-50%);
  display: none;
  .until {
    width: 100%;
    display: flex;
  }
  .el-icon {
    width: 8vw;
    font-size: min(5vw, 40px);
    // &:hover {
    //   background-color: #4cc9f0;
    //   -webkit-box-shadow: 10px 10px 99px 6px rgba(76, 201, 240, 1);
    //   box-shadow: 10px 10px 99px 6px rgba(76, 201, 240, 1);
    // }
  }
}
</style>
