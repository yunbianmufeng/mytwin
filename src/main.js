import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createStore } from 'vuex'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 创建 Vuex store
const store = createStore({
  state() {
    return {
      // 状态将在此处定义
    }
  },
  mutations: {
    // mutations 将在此处定义
  },
  actions: {
    // actions 将在此处定义
  }
})

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(store)
app.use(ElementPlus)
app.mount('#app')
