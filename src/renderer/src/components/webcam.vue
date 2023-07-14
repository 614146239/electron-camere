<template>
  <div ref="contain" class="video" :style="borderStyle">
    <video
      ref="videoRef"
      width="200"
      height="200"
      autoplay
      :muted="constraints.audio.muted"
      :class="{ reverse: config.reverse }"
    ></video>
    <canvas ref="canvasRef" width="200" height="200" :class="{ reverse: config.reverse }"></canvas>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '../store'
import { onMounted, onBeforeUnmount } from 'vue'
import { ref, reactive } from 'vue'
import drag from '../utils/drag'
import { useRoute } from 'vue-router'

// three
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  Uint16BufferAttribute,
  Vector3,
  VideoTexture,
  WebGLRenderer
} from 'three'
// 加载tf
import * as tf from '@tensorflow/tfjs'
import '@mediapipe/face_detection'
import '@tensorflow/tfjs-core'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/face_mesh'
// import * as faceDetection from '@tensorflow-models/face-detection'
// 导入 delaunator 库
import { TRIANGULATION, uvCoords } from '../utils/TRIANGULATION'
const videoRef = ref()
const canvasRef = ref()
const contain = ref()
const tracks = ref()
const loopRender = ref()

const route = useRoute()
let faces = reactive([])

// 数据要从store中存储
const store = useStore()
const config = store.config
const constraints = store.constraints
const borderStyle = reactive({
  border: `${config.borderWidth}px  solid  ${config.borderColor}`
})
onMounted(async () => {
  drag(Number(route.query.id))
  const video = videoRef.value
  navigator.mediaDevices.getUserMedia({ video: constraints.video }).then((stream) => {
    video.srcObject = stream
    tracks.value = stream.getTracks()
  })

  //tf
  tf.setBackend('webgl')
  // 加载模型
  const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
  const detectorConfig = {
    maxFaces: 1, //检测到的最大面部数量
    runtime: 'mediapipe', //tfjs，mediapipe
    refineLandmarks: true, //可以完善眼睛和嘴唇周围的地标坐标，并在虹膜周围输出其他地标
    solutionPath: '../../src/assets/model/@mediapipe/face_mesh' //必须到src根路径才不会丢失路径
  }
  const detector = await faceLandmarksDetection.createDetector(model, detectorConfig)

  // 获取人脸位置信息
  const detectFaces = async (): Promise<void> => {
    faces = await detector.estimateFaces(video, { flipHorizontal: false })
    // 人脸加载完成进行贴图
    if (faces.length > 0) {
      const keypoints = faces[0].keypoints
      // 去除name属性，去除键名，返回人脸xyz数组
      const facePosition = keypoints
        .map((faces) => {
          const { name, ...rest } = faces
          return rest
        })
        .map((faces) => Object.values(faces))
      if (facePosition) {
        // 更新人脸位置
        updateGeometry(facePosition)
      }
    } else {
      // 未检测人脸贴图消失
      updateGeometry([])
    }
  }

  const canvas = canvasRef.value
  const scene = new Scene()
  //添加一些光照
  scene.add(new AmbientLight(0xcccccc, 0.4))
  // const camera = new PerspectiveCamera(45, 1, 0.1, 1000)
  const w = window.innerWidth
  const h = window.innerHeight
  const camera = new OrthographicCamera(w / -2, w / 2, h / 2, h / -2, 0.1, 2000)
  camera.position.set(0, 0, 1000)
  camera.add(new PointLight(0xffffff, 0.8))
  camera.position.set(0, 0, 0.15)
  scene.add(camera)
  const renderer = new WebGLRenderer({
    canvas: canvas,
    // 抗锯齿
    antialias: true,
    alpha: true //背景透明
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  // 监听屏幕改变canvas
  window.addEventListener('resize', () => {
    // camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  // 视频纹理
  const videoTexture = new VideoTexture(videoRef.value)
  videoTexture.repeat.set(1, 1)
  videoTexture.minFilter = LinearFilter
  videoTexture.magFilter = LinearFilter
  // three.js  颜色值rgba,否则视频发白
  videoTexture.colorSpace = SRGBColorSpace
  videoTexture.needsUpdate = true
  //
  const canvasWidth = canvas.clientWidth
  const canvasHeight = canvas.clientHeight
  // 计算宽高比例
  const aspectRatio = canvasWidth / canvasHeight
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
  const uvAttribute = new Float32BufferAttribute(uvCoords.flat(), 2) // 2 表示每个 UV 坐标由两个分量组成
  // 创建几何体对象并将顶点和 UV 属性设置给它
  geometry.setAttribute('uv', uvAttribute)
  // 创建线条材质
  const material = new LineBasicMaterial({ color: 'blue' })
  // 创建线条对象并将几何体作为参数传入
  const lines = new LineSegments(geometry, material)
  scene.add(lines)

  // geometry.computeVertexNormals()
  // 创建material  加载贴图
  const textureLoader = new TextureLoader()
  // const meshImg =meshList[meshIndex].src //材质图片地址
  textureLoader.load('../../src/assets/img/face.png', (texture) => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 16
    // 创建材质
    const faceMaterial = new MeshBasicMaterial({
      map: texture
      // color: 'red'
    })
    faceMaterial.needsUpdate = true
    const mesh = new Mesh(geometry, faceMaterial)
    scene.add(mesh)
  })
  //从人脸检测模型获取的人脸网格坐标转换为模型位置
  const resolveMesh = (faceMesh, vw, vh): any => {
    // return faceMesh.map((p) => [p[0] - vw / 2, vh / 2 - p[1], -p[2]]).flat()
    return faceMesh.map((p) => [p[0] - vw / 2, vh / 2 - p[1], 0]).flat()
  }
  // updateGeometry方法用于更新Three.js场景中的几何体（geometry），以便根据检测到的人脸关键点的位置进行渲染。
  const updateGeometry = (prediction): void => {
    const positionBuffer = resolveMesh(
      prediction,
      videoRef.value.videoWidth,
      videoRef.value.videoHeight
    )
    geometry.setAttribute('position', new Float32BufferAttribute(positionBuffer, 3))
    geometry.computeVertexNormals()

    geometry.attributes.position.needsUpdate = true
  }
  // 控制场景渲染
  const render = async (): void => {
    await detectFaces()
    renderer.render(scene, camera)
    loopRender.value = requestAnimationFrame(render)
  }
  video.addEventListener('loadeddata', async () => {
    render()
  })
})

// 关闭所有流媒体
onBeforeUnmount(() => {
  cancelAnimationFrame(loopRender.value)
  tracks.value.forEach(function (track) {
    track.stop()
  })
  videoRef.value.srcObject = null
})
</script>

<style scoped lang="less">
.video {
  width: 100vw;
  height: 100vh;
  // border-radius: 50%;
  overflow: hidden;
  z-index: 9999;
}
video {
  display: none;
}
.reverse {
  // 切换镜像，video旋转y轴180
  transform: rotateY(180deg);
  // object-fit: cover;
}

img {
  width: 50%;
  object-fit: cover;
}
</style>
