<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

const store = useStore()
const router = useRouter()

// 图表实例引用
let progressChart = null
let materialChart = null

// 加载数据
const initData = async () => {
  try {
    await store.dispatch('product/getProductConfigs')
    await store.dispatch('production/fetchProductions')
  } catch (error) {
    console.error('加载数据失败:', error)
  }
}

onMounted(() => {
  initData()
  initCharts()
})

// 获取产品配置和工艺线数据
const productConfigs = computed(() => store.getters['product/getProductConfigs'] || [])
const productionLines = computed(() => store.getters['production/getProductions'] || [])

// 计算当前用时（从开始时间到现在）
const calculateCurrentTime = (startTime) => {
  if (!startTime) return '0天0小时'
  
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now - start
  
  if (diffMs <= 0) return '0天0小时'
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  return `${days}天${hours}小时`
}

// 计算预计时间（根据计划生产数量除以每日最大生产数量）
const calculateEstimatedTime = (plannedQuantity, maxDailyQuantity) => {
  if (!maxDailyQuantity || maxDailyQuantity <= 0) return '未知'
  const days = Math.ceil(plannedQuantity / maxDailyQuantity)
  return `${days}天`
}

// 从工艺线获取物料消耗信息（仅显示物料名称）
const getMaterialNamesFromProductionLine = (productionLineId) => {
  const productionLine = productionLines.value.find(line => line.id == productionLineId)
  if (!productionLine || !productionLine.layers) return []
  
  const materialNames = new Set()
  
  productionLine.layers.forEach(layer => {
    if (layer.steps) {
      layer.steps.forEach(step => {
        if (step.materials) {
          step.materials.forEach(material => {
            materialNames.add(material.name)
          })
        }
      })
    }
  })
  
  return Array.from(materialNames)
}

// 处理产线配置数据，按配置时间排序，每个产线一个card
const processedProductLines = computed(() => {
  if (!productConfigs.value || productConfigs.value.length === 0) return []
  
  // 按创建时间升序排序
  const sortedConfigs = [...productConfigs.value].sort((a, b) => {
    return new Date(a.createTime || 0) - new Date(b.createTime || 0)
  })
  
  return sortedConfigs.map((config, index) => {
    const productionLine = productionLines.value.find(line => line.id == config.productionLineId)
    const materialNames = getMaterialNamesFromProductionLine(config.productionLineId)
    
    return {
      id: config.id,
      index: index + 1,
      total: sortedConfigs.length,
      name: config.productName,
      description: config.description,
      productionLine: {
        id: config.productionLineId,
        name: config.productionLineName || '未知产线'
      },
      numberRange: `${config.startNumber} - ${config.endNumber}`,
      currentNumber: config.currentNumber || config.startNumber,
      plannedQuantity: config.plannedQuantity,
      completedQuantity: config.completedQuantity || 0,
      maxDailyQuantity: config.maxDailyQuantity,
      priority: config.priority || 'normal',
      materialNames: materialNames,
      status: config.status || 'waiting',
      startTime: config.startDate,
      currentTime: calculateCurrentTime(config.startDate),
      estimatedTime: calculateEstimatedTime(config.plannedQuantity, config.maxDailyQuantity),
      expectedEndTime: config.expectedEndTime,
      deadline: config.deadline,
      originalConfig: config,
      productionLineData: productionLine
    }
  })
})

// 处理编辑
const handleEdit = (productLine) => {
  const originalConfig = productLine.originalConfig
  if (originalConfig) {
    store.commit('product/SET_CURRENT_CONFIG', originalConfig)
    router.push(`/factory/config/${productLine.id}`)
  }
}

// 处理删除
const handleDelete = async (productLine) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除产品"${productLine.name}"吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await store.dispatch('product/deleteProductConfig', productLine.id)
    ElMessage.success('删除成功')
    await initData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 模拟生产
const simulateProduction = (productLine) => {
  console.log('模拟生产:', productLine)
}

// 计算已完成晶圆编号范围
const getCompletedWaferRange = (config) => {
  const startNumber = parseInt(config.startNumber)
  const completedQuantity = config.completedQuantity || 0
  
  if (completedQuantity === 0) return null
  
  const endNumber = startNumber + completedQuantity - 1
  return `${startNumber}~${endNumber}`
}

// 展开已完成晶圆详情
const expandedWafers = ref({})

const toggleWaferExpansion = (configId) => {
  expandedWafers.value[configId] = !expandedWafers.value[configId]
}

// 生成已完成的单个晶圆列表
const getCompletedWaferDetails = (config) => {
  const startNumber = parseInt(config.startNumber)
  const completedQuantity = config.completedQuantity || 0
  const wafers = []
  
  for (let i = 0; i < completedQuantity; i++) {
    const waferNumber = startNumber + i
    const completionDate = new Date(config.startDate || Date.now())
    completionDate.setDate(completionDate.getDate() + Math.floor(i / (config.maxDailyQuantity || 1)))
    completionDate.setHours(18, 0, 0, 0)
    
    wafers.push({
      number: waferNumber,
      completionTime: completionDate.toLocaleString('zh-CN'),
      materialConsumption: calculateWaferMaterialConsumption(config.productionLineId)
    })
  }
  
  return wafers
}

// 计算单片晶圆的物料消耗
const calculateWaferMaterialConsumption = (productionLineId) => {
  const productionLine = productionLines.value.find(line => line.id == productionLineId)
  if (!productionLine || !productionLine.layers) return []
  
  const materialConsumption = {}
  
  productionLine.layers.forEach(layer => {
    if (layer.steps) {
      layer.steps.forEach(step => {
        if (step.materials) {
          step.materials.forEach(material => {
            const key = material.name
            if (!materialConsumption[key]) {
              materialConsumption[key] = {
                name: material.name,
                amount: 0,
                unit: material.unit || ''
              }
            }
            materialConsumption[key].amount += parseFloat(material.defaultValue || 0)
          })
        }
      })
    }
  })
  
  return Object.values(materialConsumption)
}

// 计算已完成晶圆的总物料消耗
const getTotalMaterialConsumption = (config) => {
  const singleWaferConsumption = calculateWaferMaterialConsumption(config.productionLineId)
  const completedQuantity = config.completedQuantity || 0
  
  return singleWaferConsumption.map(material => ({
    ...material,
    amount: material.amount * completedQuantity
  }))
}

// 计算当前生产状态
const getCurrentProductionStatus = (config) => {
  const currentNumber = config.currentNumber || config.startNumber
  const startDate = new Date(config.startDate || Date.now())
  const now = new Date()
  
  const startHour = 9
  const endHour = 18
  
  const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24))
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()
  
  const productionLine = productionLines.value.find(line => line.id == config.productionLineId)
  let currentStep = '准备中'
  let estimatedEndTime = '未知'
  
  if (productionLine && productionLine.layers && productionLine.layers.length > 0) {
    const totalSteps = productionLine.layers.reduce((sum, layer) => sum + (layer.steps ? layer.steps.length : 0), 0)
    
    if (currentHour >= startHour && currentHour < endHour) {
      const hoursWorkedToday = currentHour - startHour + currentMinutes / 60
      const totalWorkHours = endHour - startHour
      const progressToday = hoursWorkedToday / totalWorkHours
      
      const stepIndex = Math.floor(progressToday * totalSteps)
      
      let currentStepIndex = 0
      let foundStep = false
      
      for (const layer of productionLine.layers) {
        if (layer.steps) {
          for (const step of layer.steps) {
            if (currentStepIndex === stepIndex && !foundStep) {
              currentStep = step.processName || '未知步骤'
              foundStep = true
              break
            }
            currentStepIndex++
          }
        }
        if (foundStep) break
      }
      
      const endTime = new Date(startDate)
      endTime.setDate(endTime.getDate() + daysPassed)
      endTime.setHours(endHour, 0, 0, 0)
      estimatedEndTime = endTime.toLocaleString('zh-CN')
    } else if (currentHour < startHour) {
      currentStep = '待开始'
      const startTime = new Date(now)
      startTime.setHours(startHour, 0, 0, 0)
      estimatedEndTime = startTime.toLocaleString('zh-CN')
    } else {
      currentStep = '已结束'
      estimatedEndTime = '已完成'
    }
  }
  
  return {
    currentNumber: currentNumber,
    currentStep: currentStep,
    estimatedEndTime: estimatedEndTime,
    startTime: startDate.toLocaleString('zh-CN')
  }
}

// 状态显示文本
const statusText = computed(() => ({
  waiting: '等待',
  running: '生产中',
  completed: '已完成',
  paused: '已暂停'
}))

// 状态显示类型
const statusType = computed(() => ({
  waiting: 'info',
  running: 'success',
  completed: 'primary',
  paused: 'warning'
}))

const initCharts = () => {
  if (progressChart) {
    progressChart.dispose()
    progressChart = null
  }
  if (materialChart) {
    materialChart.dispose()
    materialChart = null
  }

  const progressElement = document.getElementById('progressChart')
  const materialElement = document.getElementById('materialChart')
  
  if (progressElement) {
    progressChart = echarts.init(progressElement)
    progressChart.setOption({
      title: { text: '生产进度' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['计划产量', '完成产量'] },
      xAxis: { type: 'category', data: ['8寸CMOS晶圆', 'MEMS器件', '存储芯片'] },
      yAxis: { type: 'value' },
      series: [
        {
          name: '计划产量',
          type: 'bar',
          data: [1000, 800, 1200]
        },
        {
          name: '完成产量',
          type: 'bar',
          data: [800, 600, 900]
        }
      ]
    })
  }

  if (materialElement) {
    materialChart = echarts.init(materialElement)
    materialChart.setOption({
      title: { text: '物料消耗预测' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: 'right' },
      series: [
        {
          name: '预计消耗量',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 50, name: '光刻胶' },
            { value: 1000, name: '超纯水' },
            { value: 30, name: '显影液' }
          ]
        }
      ]
    })
  }

  const handleResize = () => {
    if (progressChart) progressChart.resize()
    if (materialChart) materialChart.resize()
  }
  window.addEventListener('resize', handleResize)
}

onBeforeUnmount(() => {
  if (progressChart) {
    progressChart.dispose()
    progressChart = null
  }
  if (materialChart) {
    materialChart.dispose()
    materialChart = null
  }
  
  window.removeEventListener('resize', () => {
    if (progressChart) progressChart.resize()
    if (materialChart) materialChart.resize()
  })
})
</script>

<template>
  <div class="product-list">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div id="progressChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div id="materialChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 如果没有产线配置，显示提示 -->
    <div v-if="processedProductLines.length === 0" class="no-data-container">
      <el-empty description="当前无产线信息，请前往产线配置进行添加">
        <el-button type="primary" @click="router.push('/factory/config')">
          前往产线配置
        </el-button>
      </el-empty>
    </div>

    <!-- 产线卡片列表 -->
    <div v-else>
      <el-card 
        v-for="productLine in processedProductLines" 
        :key="productLine.id" 
        class="production-card"
        style="margin-top: 15px;"
      >
        <!-- 产线信息头部 -->
        <template #header>
          <div class="card-header">
            <span class="production-info">
              当前产线为第{{ productLine.index }}条，共{{ productLine.total }}条
            </span>
            <div class="header-actions">
              <el-button link type="primary" @click="handleEdit(productLine)">
                编辑
              </el-button>
              <el-button link type="primary" @click="simulateProduction(productLine)">
                模拟生产
              </el-button>
              <el-button link type="danger" @click="handleDelete(productLine)">
                删除
              </el-button>
            </div>
          </div>
        </template>

        <!-- 产线详细信息表格 -->
        <el-table :data="[productLine]" style="width: 100%" border>
          <el-table-column type="expand">
            <template #default="props">
              <el-tabs>
                <el-tab-pane label="已完成晶圆">
                  <div v-if="props.row.completedQuantity > 0">
                    <!-- 晶圆范围显示 -->
                    <div class="wafer-range-container" style="margin-bottom: 15px;">
                      <el-button 
                        @click="toggleWaferExpansion(props.row.id)"
                        type="primary"
                        link
                      >
                        晶圆编号: {{ getCompletedWaferRange(props.row.originalConfig) }}
                        <el-icon style="margin-left: 5px;">
                          <component :is="expandedWafers[props.row.id] ? ArrowUp : ArrowDown" />
                        </el-icon>
                      </el-button>
                    </div>
                    
                    <!-- 未展开时显示总物料消耗 -->
                    <div v-if="!expandedWafers[props.row.id]" class="total-consumption">
                      <h4>总物料消耗:</h4>
                      <div class="material-tags">
                        <el-tag
                          v-for="material in getTotalMaterialConsumption(props.row.originalConfig)"
                          :key="material.name"
                          size="small"
                          style="margin-right: 8px; margin-bottom: 5px"
                        >
                          {{ material.name }}: {{ material.amount }}{{ material.unit }}
                        </el-tag>
                      </div>
                    </div>
                    
                    <!-- 展开时显示单个晶圆详情 -->
                    <el-table 
                      v-if="expandedWafers[props.row.id]"
                      :data="getCompletedWaferDetails(props.row.originalConfig)" 
                      border 
                      style="width: 100%"
                    >
                      <el-table-column prop="number" label="晶圆编号" width="100"></el-table-column>
                      <el-table-column prop="completionTime" label="完成时间" width="180"></el-table-column>
                      <el-table-column label="物料消耗">
                        <template #default="scope">
                          <el-tag
                            v-for="material in scope.row.materialConsumption"
                            :key="material.name"
                            size="small"
                            style="margin-right: 5px; margin-bottom: 2px"
                          >
                            {{ material.name }}: {{ material.amount }}{{ material.unit }}
                          </el-tag>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                  <el-empty v-else description="暂无已完成的晶圆"></el-empty>
                </el-tab-pane>
                
                <el-tab-pane label="当前生产状态">
                  <el-descriptions border :column="2">
                    <el-descriptions-item label="当前晶圆编号">
                      {{ getCurrentProductionStatus(props.row.originalConfig).currentNumber }}
                    </el-descriptions-item>
                    <el-descriptions-item label="当前工步">
                      {{ getCurrentProductionStatus(props.row.originalConfig).currentStep }}
                    </el-descriptions-item>
                    <el-descriptions-item label="开始时间">
                      {{ getCurrentProductionStatus(props.row.originalConfig).startTime }}
                    </el-descriptions-item>
                    <el-descriptions-item label="预计结束时间">
                      {{ getCurrentProductionStatus(props.row.originalConfig).estimatedEndTime }}
                    </el-descriptions-item>
                  </el-descriptions>
                </el-tab-pane>
              </el-tabs>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="产品名称" min-width="150"></el-table-column>
          <el-table-column prop="productionLine.name" label="工艺线" width="180"></el-table-column>
          <el-table-column prop="numberRange" label="编号范围" width="120"></el-table-column>
          
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-tag :type="statusType[scope.row.status]">
                {{ statusText[scope.row.status] }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="生产进度" width="200">
            <template #default="scope">
              <el-progress
                :percentage="Math.round((scope.row.completedQuantity / scope.row.plannedQuantity) * 100)"
                :format="(percentage) => `${scope.row.completedQuantity}/${scope.row.plannedQuantity}`"
              ></el-progress>
            </template>
          </el-table-column>
          
          <el-table-column label="物料消耗" min-width="200">
            <template #default="scope">
              <el-tag
                v-for="materialName in scope.row.materialNames"
                :key="materialName"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px"
              >
                {{ materialName }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="currentTime" label="当前用时" width="120"></el-table-column>
          <el-table-column prop="estimatedTime" label="预计时间" width="100"></el-table-column>
          <el-table-column prop="description" label="备注" min-width="150"></el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.product-list {
  padding: 10px;
}

.no-data-container {
  margin-top: 20px;
}

.production-card {
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.production-info {
  font-weight: bold;
  color: #409EFF;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.wafer-range-container {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.total-consumption h4 {
  margin-bottom: 10px;
}

.material-tags {
  display: flex;
  flex-wrap: wrap;
}

.el-card {
  margin-bottom: 10px;
}
</style>
