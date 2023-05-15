import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import { createPinia } from 'pinia'
// import piniaPersist from 'pinia-plugin-persist'
const app = createApp(App)
import pinia from './store/store'
// 数据持久化
// const pinia = createPinia()
// pinia.use(piniaPersist)

app.use(router)
app.use(pinia)
app.mount('#app')