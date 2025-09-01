<template>
  <div class="simulation-page">
    <el-card class="header-card">
      <template #header>
        <div class="header-content">
          <h2>模拟仿真 - {{ productionLineName }}</h2>
          <el-button @click="goBack" type="primary" plain>
            返回产线列表
          </el-button>
        </div>
      </template>
      
      <div class="production-info">
        <el-descriptions border :column="3">
          <el-descriptions-item label="产线名称">{{ productionLineName }}</el-descriptions-item>
          <el-descriptions-item label="工艺步骤数">{{ totalSteps }}</el-descriptions-item>
          <el-descriptions-item label="涉及设备类型">{{ processTypeData.length }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>

    <el-card>
          <template #header>
            <div class="webgl-header">
              <h3>3D仿真展示</h3>
              <div class="webgl-controls">
                <el-button @click="refreshSimulation" size="small" type="primary">
                  刷新仿真
                </el-button>
                <el-button @click="resetCamera" size="small">
                  重置视角
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="webgl-container">
            <div v-if="!webglLoaded" class="webgl-loading">
              <el-loading-spinner size="50" />
              <p>正在加载WebGL仿真...</p>
            </div>
            
            <iframe
              ref="webglIframe"
              :src="webglUrl"
              @load="onWebGLLoaded"
              class="webgl-iframe"
              :style="{
                width: webglWidth,
                height: webglHeight * 0.4,
                display: webglLoaded ? 'block' : 'none'
              }"
            ></iframe>
          </div>
        </el-card>

    <!-- 调试信息 -->
    <el-card style="margin-top: 20px;" v-if="showDebugInfo">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3>调试信息</h3>
          <el-switch v-model="showDebugInfo" active-text="显示" inactive-text="隐藏" />
        </div>
      </template>
      
      <el-tabs>
        <el-tab-pane label="ProcessTypeData">
          <pre>{{ JSON.stringify(processTypeData, null, 2) }}</pre>
        </el-tab-pane>
        <el-tab-pane label="原始数据">
          <pre>{{ JSON.stringify(productionLineData, null, 2) }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

// 响应式数据
const productionLineData = ref(null)
const processTypeData = ref([])
const webglLoaded = ref(false)
const showDebugInfo = ref(false)
const webglIframe = ref(null)

// WebGL相关配置
const webglUrl = ref('/webgl/index.html')
const webglWidth = computed(() => '100%')
// 根据1920:1080的宽高比计算高度，确保完全填满容器宽度
const webglHeight = computed(() => {
  // 1920:1080 = 16:9的宽高比
  const aspectRatio = 9 / 16 // 高度/宽度
  return `calc(100vw * ${aspectRatio} - 0px)` // 减去页面padding
})

// 计算属性
const productionLineName = computed(() => {
  return productionLineData.value?.name || '未知产线'
})

const totalSteps = computed(() => {
  if (!productionLineData.value?.layers) return 0
  return productionLineData.value.layers.reduce((total, layer) => {
    return total + (layer.steps ? layer.steps.length : 0)
  }, 0)
})

// 生成工艺类型数据结构
const generateProcessTypeData = (lineData) => {
  if (!lineData || !lineData.layers) return []
  
  const processTypeMap = new Map()
  
  // 遍历所有层级和步骤
  lineData.layers.forEach(layer => {
    if (layer.steps) {
      layer.steps.forEach(step => {
        const processType = step.processType
        if (processType) {
          const processTypeName = processType + '工艺'
          
          if (!processTypeMap.has(processTypeName)) {
            processTypeMap.set(processTypeName, {
              name: processTypeName,
              originalType: processType,
              enabled: true, // 默认显示
              stepCount: 0,
              steps: []
            })
          }
          
          const typeData = processTypeMap.get(processTypeName)
          typeData.stepCount++
          typeData.steps.push({
            id: step.id || Date.now() + Math.random(),
            processName: step.processName,
            layerName: layer.name
          })
        }
      })
    }
  })
  
  return Array.from(processTypeMap.values())
}

// WebGL加载完成回调
const onWebGLLoaded = async () => {
  console.log('WebGL加载完成')
  webglLoaded.value = true
  
  // 等待一下确保WebGL完全初始化
  await nextTick()
  setTimeout(() => {
    sendProcessTypeDataToUnity()
  }, 2000)
}

// 发送数据到Unity WebGL
const sendProcessTypeDataToUnity = () => {
  try {
    if (!webglIframe.value || !webglIframe.value.contentWindow) {
      console.error('WebGL iframe未准备好')
      return
    }
    
    // 转换数据为Unity需要的格式
    const unityData = {
      processTypes: processTypeData.value.map(item => ({
        name: item.originalType, // 使用原始类型名称
        enabled: item.enabled
      }))
    }
    
    const dataString = JSON.stringify(unityData)
    console.log('发送数据到Unity:', dataString)
    
    // 调用Unity的方法
    // 注意：这里假设Unity中有一个名为"GameManager"的GameObject
    // 并且有一个名为"productionLineLoad"的方法
    if (webglIframe.value.contentWindow.unityInstance) {
      webglIframe.value.contentWindow.unityInstance.SendMessage(
        'GameManager', 
        'productionLineLoad', 
        dataString
      )
    } else {
      console.warn('Unity实例未找到，尝试直接调用SendMessage')
      // 备用方案：直接调用全局SendMessage函数
      if (webglIframe.value.contentWindow.SendMessage) {
        webglIframe.value.contentWindow.SendMessage(
          'GameManager', 
          'productionLineLoad', 
          dataString
        )
      }
    }
  } catch (error) {
    console.error('发送数据到Unity失败:', error)
  }
}

// 刷新仿真
const refreshSimulation = () => {
  sendProcessTypeDataToUnity()
}

// 重置摄像机
const resetCamera = () => {
  try {
    if (webglIframe.value?.contentWindow?.unityInstance) {
      webglIframe.value.contentWindow.unityInstance.SendMessage(
        'GameManager', 
        'ResetCamera', 
        ''
      )
    }
  } catch (error) {
    console.error('重置摄像机失败:', error)
  }
}

// 返回按钮
const goBack = () => {
  router.push('/factory/list')
}

// 初始化数据
const initData = () => {
  // 从路由参数获取产线数据
  const lineDataStr = route.query.productionLineData
  if (lineDataStr) {
    try {
      productionLineData.value = JSON.parse(decodeURIComponent(lineDataStr))
      processTypeData.value = generateProcessTypeData(productionLineData.value)
      console.log('生成的工艺类型数据:', processTypeData.value)
    } catch (error) {
      console.error('解析产线数据失败:', error)
      productionLineData.value = null
      processTypeData.value = []
    }
  }
}

// 窗口大小改变处理
const handleResize = () => {
  // 可以在这里处理窗口大小改变
}

onMounted(() => {
  initData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.simulation-page {
  padding: 0px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header-card {
  margin-bottom: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  margin: 0;
  color: #409EFF;
}

.production-info {
  margin-top: 15px;
}

.process-type-list {
  max-height: 800px;
  overflow-y: auto;
}

.process-type-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #fafafa;
  transition: all 0.3s ease;
}

.process-type-item.active {
  border-color: #409EFF;
  background-color: #f0f9ff;
}

.process-type-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.process-name {
  font-weight: bold;
  font-size: 16px;
  flex: 1;
}

.process-type-details {
  font-size: 14px;
  color: #666;
}

.process-type-details ul {
  margin: 5px 0 0 0;
  padding-left: 20px;
}

.process-type-details li {
  margin-bottom: 2px;
}

.webgl-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.webgl-header h3 {
  margin: 0;
}

.webgl-controls {
  display: flex;
  gap: 0px;
}

.webgl-container {
  position: relative;
  width: 100%;
  height: 700px;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  margin: 0px;
  padding: 0px;
  /* 保持1920:1080的宽高比 */
  aspect-ratio: 16 / 9;
}

.webgl-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0px;
  color: white;
}

.webgl-iframe {
  border: none;
  border-radius: 8px;
  display: block;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  /* 确保iframe内容适应容器 */
  object-fit: contain;
}

pre {
  background-color: #f5f5f5;
  padding: 0px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
