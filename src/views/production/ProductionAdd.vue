<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import draggable from 'vuedraggable'
import { Plus, Delete, InfoFilled, Rank, CopyDocument } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const store = useStore()

// 获取工艺设备列表
const processes = computed(() => store.getters['process/getProcesses'])
const deviceTypes = computed(() => store.getters['process/getDeviceTypes'])

// 判断是否为编辑模式
const isEdit = computed(() => route.name === 'ProductionEdit')

// 设备参数记忆存储 - 记住用户设置的参数值
const deviceParameterMemory = ref({})

// 复制粘贴功能
const copiedStep = ref(null)

// 键盘事件处理
const handleKeydown = (event) => {
  // Ctrl+V 粘贴
  if (event.ctrlKey && event.key === 'v' && copiedStep.value) {
    event.preventDefault()
    pasteStep()
  }
}

onMounted(async () => {
  // 添加键盘事件监听
  document.addEventListener('keydown', handleKeydown)
  
  if (isEdit.value) {
    // 确保数据已加载
    await store.dispatch('production/fetchProductions')
    
    const id = route.params.id // 不转换类型，直接使用原始参数
    const production = store.getters['production/getProductionById'](id)
    
    if (!production) {
      ElMessage.error('未找到工艺线信息')
      router.push('/production/list')
      return
    }

    // 填充表单数据
    Object.assign(formData, {
      name: production.name,
      description: production.description,
      layers: JSON.parse(JSON.stringify(production.layers || [])), // 深拷贝
      remark: production.remark
    })
  }
})

onUnmounted(() => {
  // 移除键盘事件监听
  document.removeEventListener('keydown', handleKeydown)
})

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  layers: [], // 改为层结构
  remark: ''
})

// 表单规则
const rules = {
  name: [{ required: true, message: '请输入工艺线名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入工艺线描述', trigger: 'blur' }],
  layers: [{ required: true, message: '请添加至少一层工艺流程', trigger: 'change' }]
}

// 当前编辑的设备步骤
const stepDialogVisible = ref(false)
const currentStep = reactive({
  layerIndex: -1,
  stepIndex: -1, // 添加 stepIndex 用于标识编辑的步骤索引
  processType: '',
  processId: '',
  parameters: [],
  materials: [],
  isEdit: false // 添加标识是否为编辑模式
})

// 复制步骤
const copyStep = (layerIndex, stepIndex) => {
  const step = formData.layers[layerIndex].steps[stepIndex]
  copiedStep.value = JSON.parse(JSON.stringify(step))
  ElMessage.success('步骤已复制，可使用 Ctrl+V 粘贴')
}

// 粘贴步骤
const pasteStep = () => {
  if (!copiedStep.value) {
    ElMessage.warning('没有已复制的步骤')
    return
  }

  // 找到最新的层
  if (formData.layers.length === 0) {
    ElMessage.warning('请先添加层')
    return
  }

  const latestLayer = formData.layers[formData.layers.length - 1]
  const newStep = JSON.parse(JSON.stringify(copiedStep.value))
  
  // 为新步骤生成新的ID
  newStep.id = Date.now()
  
  latestLayer.steps.push(newStep)
  ElMessage.success('步骤已粘贴到最新层')
}

// 编辑步骤
const handleEditStep = (layerIndex, stepIndex) => {
  const step = formData.layers[layerIndex].steps[stepIndex]
  currentStep.layerIndex = layerIndex
  currentStep.stepIndex = stepIndex
  currentStep.isEdit = true
  currentStep.processType = step.processType
  currentStep.processId = step.processId
  currentStep.parameters = JSON.parse(JSON.stringify(step.parameters))
  currentStep.materials = JSON.parse(JSON.stringify(step.materials))
  stepDialogVisible.value = true
}

// 添加新层
const addLayer = () => {
  formData.layers.push({
    id: Date.now(),
    steps: [],
    remark: ''
  })
}

// 删除层
const deleteLayer = (layerIndex) => {
  formData.layers.splice(layerIndex, 1)
}

// 添加工艺步骤
const handleAddStep = (layerIndex) => {
  currentStep.layerIndex = layerIndex
  currentStep.stepIndex = -1
  currentStep.isEdit = false
  currentStep.processType = ''
  currentStep.processId = ''
  currentStep.parameters = []
  currentStep.materials = []
  stepDialogVisible.value = true
}

// 删除步骤
const deleteStep = (layerIndex, stepIndex) => {
  formData.layers[layerIndex].steps.splice(stepIndex, 1)
}

// 当选择工艺类型时
const handleProcessTypeChange = (type) => {
  currentStep.processType = type
  currentStep.processId = ''
  currentStep.parameters = []
  currentStep.materials = []
}

// 当选择具体设备时
const handleProcessSelect = (processId) => {
  const process = processes.value.find(p => p.id === processId)
  if (process) {
    currentStep.processId = processId
    
    // 检查是否有用户之前设置的参数值（参数记忆功能）
    const rememberedParams = deviceParameterMemory.value[processId]
    
    // 复制参数信息，优先使用记忆的值，其次使用默认值
    currentStep.parameters = (process.parameters || []).map(param => ({
      ...param,
      value: rememberedParams?.parameters?.find(p => p.name === param.name)?.value || param.value || ''
    }))
    
    // 复制物料信息，优先使用记忆的值，其次使用默认值
    currentStep.materials = (process.materials || []).map(material => ({
      ...material,
      defaultValue: rememberedParams?.materials?.find(m => m.name === material.name)?.defaultValue || material.defaultValue || ''
    }))
  }
}

// 确认添加或编辑步骤
const confirmAddStep = () => {
  const process = processes.value.find(p => p.id === currentStep.processId)
  if (process) {
    // 保存用户设置的参数到记忆中
    deviceParameterMemory.value[currentStep.processId] = {
      parameters: JSON.parse(JSON.stringify(currentStep.parameters)),
      materials: JSON.parse(JSON.stringify(currentStep.materials))
    }
    
    const step = {
      id: currentStep.isEdit ? formData.layers[currentStep.layerIndex].steps[currentStep.stepIndex].id : Date.now(),
      processId: currentStep.processId,
      processType: currentStep.processType,
      processName: process.name,
      parameters: currentStep.parameters,
      materials: currentStep.materials
    }
    
    if (currentStep.isEdit) {
      // 编辑模式：更新现有步骤
      formData.layers[currentStep.layerIndex].steps[currentStep.stepIndex] = step
    } else {
      // 添加模式：添加新步骤
      formData.layers[currentStep.layerIndex].steps.push(step)
    }
    stepDialogVisible.value = false
  }
}

// 计算层的物料消耗汇总
const calculateLayerMaterials = (layer) => {
  const materialSummary = {}
  layer.steps.forEach(step => {
    step.materials.forEach(material => {
      const key = `${material.name}(${material.unit})`
      if (!materialSummary[key]) {
        materialSummary[key] = 0
      }
      materialSummary[key] += Number(material.defaultValue || 0)
    })
  })
  return Object.entries(materialSummary)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
}

const formRef = ref(null)

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 编辑模式
          const id = route.params.id // 使用原始ID，不进行类型转换
          await store.dispatch('production/updateProduction', {
            id,
            updates: {
              name: formData.name,
              description: formData.description,
              layers: formData.layers,
              remark: formData.remark
            }
          })
          ElMessage.success('更新成功')
        } else {
          // 添加模式
          await store.dispatch('production/addProduction', {
            name: formData.name,
            description: formData.description,
            layers: formData.layers,
            remark: formData.remark
          })
          ElMessage.success('添加成功')
        }
        router.push('/production/list')
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  
  if (isEdit.value) {
    // 编辑模式下重置为原始数据
    const id = route.params.id // 使用原始ID
    const production = store.getters['production/getProductionById'](id)
    
    if (production) {
      Object.assign(formData, {
        name: production.name,
        description: production.description,
        layers: JSON.parse(JSON.stringify(production.layers || [])),
        remark: production.remark
      })
    }
  } else {
    // 添加模式下清空表单
    formRef.value.resetFields()
    formData.layers = []
    formData.remark = ''
  }
}
</script>

<template>
  <div class="production-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑' : '添加' }}工艺线</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="production-form"
      >
        <el-form-item label="工艺线名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入工艺线名称"></el-input>
        </el-form-item>

        <el-form-item label="工艺线描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入工艺线描述"
          ></el-input>
        </el-form-item>

        <el-form-item label="工艺流程" prop="layers">
          <div class="layers-container">
            <draggable
              v-model="formData.layers"
              item-key="id"
              handle=".layer-drag-handle"
              ghost-class="ghost"
              :animation="200"
            >
              <template #item="{ element: layer, index: layerIndex }">
                <div class="layer-item">
                  <div class="layer-header">
                    <el-icon class="layer-drag-handle"><Rank /></el-icon>
                    <span class="layer-title">第 {{ layerIndex + 1 }} 层</span>
                    <el-tooltip
                      :content="calculateLayerMaterials(layer)"
                      placement="top"
                      effect="light"
                      :show-after="200"
                    >
                      <el-icon class="info-icon"><InfoFilled /></el-icon>
                    </el-tooltip>
                    <el-button
                      type="danger"
                      link
                      :icon="Delete"
                      @click="deleteLayer(layerIndex)"
                    ></el-button>
                  </div>
                  
                  <div class="steps-container">
                    <draggable
                      v-model="layer.steps"
                      item-key="id"
                      handle=".step-drag-handle"
                      ghost-class="ghost"
                      :animation="200"
                    >
                      <template #item="{ element: step, index: stepIndex }">
                        <div class="step-item">
                          <el-icon class="step-drag-handle"><Rank /></el-icon>
                          <span class="step-index">{{ stepIndex + 1 }}</span>
                          <span class="step-content">
                            {{ step.processName }}
                          </span>
                          <div class="step-actions">
                            <el-button
                              type="primary"
                              link
                              @click="handleEditStep(layerIndex, stepIndex)"
                            >
                              编辑
                            </el-button>
                            <el-button
                              type="success"
                              link
                              :icon="CopyDocument"
                              @click="copyStep(layerIndex, stepIndex)"
                              title="复制步骤 (可用Ctrl+V粘贴)"
                            >
                              复制
                            </el-button>
                            <el-button
                              type="danger"
                              link
                              :icon="Delete"
                              @click="deleteStep(layerIndex, stepIndex)"
                            ></el-button>
                          </div>
                        </div>
                      </template>
                    </draggable>
                    <el-button type="primary" link @click="handleAddStep(layerIndex)">
                      <el-icon><Plus /></el-icon>
                      添加步骤
                    </el-button>
                  </div>
                </div>
              </template>
            </draggable>
            
            <el-button type="primary" plain @click="addLayer">
              <el-icon><Plus /></el-icon>
              添加层数
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ isEdit ? '保存' : '提交' }}</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button v-if="isEdit" @click="router.push('/production/list')">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 添加/编辑工艺步骤对话框 -->
    <el-dialog
      v-model="stepDialogVisible"
      :title="currentStep.isEdit ? '编辑工艺步骤' : '添加工艺步骤'"
      width="60%"
    >
      <el-form label-width="100px">
        <el-form-item label="工艺类型">
          <el-select
            v-model="currentStep.processType"
            placeholder="请选择工艺类型"
            @change="handleProcessTypeChange"
            style="width: 100%"
          >
            <el-option
              v-for="type in deviceTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="选择设备" v-if="currentStep.processType">
          <el-select
            v-model="currentStep.processId"
            placeholder="请选择设备"
            @change="handleProcessSelect"
            style="width: 100%"
          >
            <el-option
              v-for="process in processes.filter(p => p.type === currentStep.processType)"
              :key="process.id"
              :label="process.name"
              :value="process.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <template v-if="currentStep.processId">
          <el-divider>工艺参数</el-divider>
          <el-form-item 
            v-for="param in currentStep.parameters"
            :key="param.name"
            :label="`${param.name}${param.unit ? ` (${param.unit})` : ''}`"
          >
            <el-input
              v-model="param.value"
              type="number"
              :placeholder="`请输入${param.name}${param.unit ? ` (${param.unit})` : ''}`"
            ></el-input>
          </el-form-item>

          <el-divider>物料消耗</el-divider>
          <el-form-item
            v-for="material in currentStep.materials"
            :key="material.name"
            :label="`${material.name}${material.unit ? ` (${material.unit})` : ''}`"
          >
            <el-input
              v-model="material.defaultValue"
              type="number"
              :placeholder="`请输入${material.name}用量${material.unit ? ` (${material.unit})` : ''}`"
            ></el-input>
          </el-form-item>
        </template>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="stepDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddStep">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.production-add {
  padding: 20px;
}

.production-form {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.layers-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  background: #f5f7fa;
}

.layer-item {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
}

.layer-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.layer-drag-handle,
.step-drag-handle {
  cursor: move;
  margin-right: 10px;
  color: #909399;
}

.layer-title {
  flex: 1;
  font-weight: bold;
  color: #303133;
}

.info-icon {
  margin-right: 10px;
  color: #409EFF;
  cursor: pointer;
}

.steps-container {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.step-index {
  margin-right: 10px;
  color: #909399;
  font-weight: bold;
}

.step-content {
  flex: 1;
}

.step-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb !important;
  border: 2px dashed #409EFF !important;
}

.el-divider {
  margin: 20px 0;
}
</style>
