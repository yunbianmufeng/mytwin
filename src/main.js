import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入数据初始化函数
import { initAllData } from './utils/initData.js'
import { db } from './utils/indexedDB.js'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(store)
app.use(ElementPlus)

// 初始化数据库和数据恢复
const initializeApp = async () => {
  try {
    // 检查是否需要初始化数据
    await db.openDB()
    const processes = await db.getAll('processes')
    const products = await db.getAll('products')
    const productConfigs = await db.getAll('productConfigs')
    const productions = await db.getAll('productions')
    
    console.log('当前数据库状态：')
    console.log(`- 工艺数据: ${processes.length} 条`)
    console.log(`- 产品数据: ${products.length} 条`) 
    console.log(`- 产线配置: ${productConfigs.length} 条`)
    console.log(`- 工艺线数据: ${productions.length} 条`)
    
    // 如果数据为空或很少，则初始化示例数据
    if (processes.length === 0 || products.length === 0 || productConfigs.length === 0 || productions.length === 0) {
      console.log('检测到数据库数据不完整，正在初始化示例数据...')
      await initAllData()
      console.log('示例数据初始化完成！')
    }

    // 初始化 store 数据，确保正确加载工艺数据
    await Promise.all([
      store.dispatch('process/fetchProcesses'), // 直接获取工艺数据，不依赖initDB
      store.dispatch('product/getProductConfigs'),
      store.dispatch('production/getProductions')
    ])
    
  } catch (error) {
    console.error('数据初始化失败:', error)
    // 即使初始化失败也尝试初始化 store
    try {
      await Promise.all([
        store.dispatch('process/initDB'),
        store.dispatch('product/getProductConfigs'),
        store.dispatch('production/getProductions')
      ])
    } catch (storeError) {
      console.error('Store 初始化失败:', storeError)
    }
  }
}

// 先初始化数据，然后启动应用
initializeApp().finally(() => {
  app.mount('#app')
})
