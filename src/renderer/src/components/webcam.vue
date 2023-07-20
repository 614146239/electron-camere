<template>
  <div ref="contain" class="video" :style="borderStyle">
    <video
      ref="videoRef"
      autoplay
      :muted="constraints.audio.muted"
      :class="{ reverse: config.reverse }"
    ></video>
    <canvas ref="canvasRef" :class="{ reverse: config.reverse }"></canvas>
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
  Box3,
  BufferGeometry,
  Float32BufferAttribute,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
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
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
// Register WebGL backend.
// import '@tensorflow/tfjs-backend-webgl'
// import '@mediapipe/face_mesh'
// import * as faceDetection from '@tensorflow-models/face-detection'
// 导入 delaunator 库
import { TRIANGULATION, uvCoords } from '../utils/TRIANGULATION'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
const videoRef = ref()
const canvasRef = ref()
const contain = ref()
const tracks = ref()
const loopRender = ref()

const route = useRoute()
let faces

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
  console.log(faceLandmarksDetection)

  const detector = await faceLandmarksDetection.createDetector(model, {
    maxFaces: 1, //检测到的最大面部数量
    runtime: 'mediapipe', //tfjs，mediapipe
    refineLandmarks: true, //可以完善眼睛和嘴唇周围的地标坐标，并在虹膜周围输出其他地标
    solutionPath: '../../src/assets/model/@mediapipe/face_mesh/' //必须到src根路径才不会丢失路径
    // solutionPath: 'https://unpkg.com/@mediapipe/face_mesh'
  })
  console.log(detector)

  // 获取人脸位置信息
  const detectFaces = async (): Promise<void> => {
    faces = await detector.estimateFaces(video, { flipHorizontal: false })
    // console.log(faces)

    // 人脸加载完成进行贴图
    if (faces.length > 0) {
      const keypoints = faces[0]?.keypoints
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
    const windowAspectRatio = window.innerWidth / window.innerHeight
    const videoAspectRatio = video.videoWidth / video.videoHeight

    let newWidth, newHeight

    if (windowAspectRatio > videoAspectRatio) {
      newWidth = window.innerWidth
      newHeight = window.innerWidth / videoAspectRatio
      videoTexture.repeat.set(1, videoAspectRatio / windowAspectRatio)
      videoTexture.offset.y = (1 - videoAspectRatio / windowAspectRatio) / 2
    } else {
      newWidth = window.innerHeight * videoAspectRatio
      newHeight = window.innerHeight
      videoTexture.repeat.set(windowAspectRatio / videoAspectRatio, 1)
      videoTexture.offset.x = (1 - windowAspectRatio / videoAspectRatio) / 2
    }
    // 更新视频和渲染器的大小
    video.width = newWidth
    video.height = newHeight
    // 更新相机和投影矩阵
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
  // geometry.setIndex(TRIANGULATION)

  //加载uv
  const uvAttribute = new Float32BufferAttribute(
    // uv中v是反的需要转换，如果不转换下巴在头上
    uvCoords.flat().map((item, index) => ((index + 1) % 2 ? item : 1 - item)),
    2
  ) // 2 表示每个 UV 坐标由两个分量组成
  // 创建几何体对象并将顶点和 UV 属性设置给它
  geometry.setAttribute('uv', uvAttribute)
  // 创建material  加载贴图
  const textureLoader = new TextureLoader()
  // const meshImg =meshList[meshIndex].src //材质图片地址
  textureLoader.load('../../src/assets/img/face.png', (texture) => {
    texture.colorSpace = SRGBColorSpace
    texture.anisotropy = 16
    // 创建材质
    const faceMaterial = new MeshBasicMaterial({
      map: texture
    })
    faceMaterial.needsUpdate = true
    const mesh = new Mesh(geometry, faceMaterial)
    scene.add(mesh)
  })
  // 加载模型
  const loader = new GLTFLoader()
  // const object3D = new Object3D()
  // model.position.set( 0, 0, 0 )
  loader.load('../../src/assets/img/bear.glb', (gltf) => {
    const object = gltf.scene
    const box = new Box3().setFromObject(object)
    // const size = box.getSize(new Vector3()).length()

    const center = box.getCenter(new Vector3())
    object.position.x += object.position.x - center.x
    object.position.y += object.position.y - center.y + 1
    object.position.z += object.position.z - center.z - 15

    // object3D.add(object)
    // scene.add(object3D)
  })
  // const getScale = (object, face, x, y): any => {
  //   // const KeyPointA = face.keypoints[x]
  //   // const KeyPointB = face.keypoints[y]
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
  //   // 计算最左侧和最右侧关键点之间的距离
  //   const distance = Math.sqrt(
  //     Math.pow(KeyPointA[0] - KeyPointB[0], 2) +
  //       Math.pow(KeyPointA[1] - KeyPointB[1], 2) +
  //       Math.pow(KeyPointA[2] - KeyPointB[2], 2)
  //   )
  //   return distance
  // }
  // const quaternion = new Quaternion()
  // const getRotation = (object, face, top, left, right): any => {
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
  //     // getScale(object, face, 234, 454)
  //     object.scale.setScalar(scale / 18)
  //     object.scale.x *= -1
  //     // 模型旋转
  //     // const rotation = getRotation(object, face, 10, 50, 280)
  //     // object.setRotationFromQuaternion(rotation)
  //     // object.rotation.setFromRotationMatrix(rotation)
  //   }
  // }
  //从人脸检测模型获取的人脸网格坐标转换为模型位置
  const resolveMesh = (faceMesh, vw, vh): [] => {
    const videoWidth = videoRef.value.videoWidth
    const videoHeight = videoRef.value.videoHeight
    const canvasWidth = renderer.domElement.width
    const canvasHeight = renderer.domElement.height
    const scaleX = canvasWidth / videoWidth
    const scaleY = canvasHeight / videoHeight
    // return faceMesh.map((p) => [p[0] - vw / 2, vh / 2 - p[1], -800]).flat()
    //
    return faceMesh
      .map((p) => [(p[0] - vw / 2) * scaleX, (vh / 2 - p[1]) * scaleY, -p[2] - 100])
      .flat()
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
  const render = async (): Promise<void> => {
    await detectFaces()
    // track(object3D, faces[0])
    renderer.render(scene, camera)
    loopRender.value = requestAnimationFrame(render)
  }
  video.addEventListener('loadeddata', async () => {
    video.style.display = 'none'
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
  border-radius: 50%;
  overflow: hidden;
  z-index: 9999;
}
video {
  width: 100%;
  height: 100%;
  // display: none;
  object-fit: cover;
}
canvas {
  z-index: 99999;
}
.reverse {
  // 切换镜像，video旋转y轴180
  transform: rotateY(180deg);
  // object-fit: cover;
}
</style>
