<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const store = useStore()
const router = useRouter()
const route = useRoute()

// 判断是否为编辑模式
const isEditMode = computed(() => route.params.id !== undefined)
const editId = computed(() => route.params.id)

// 从 store 获取工艺线列表
const productionLines = computed(() => store.getters['production/getProductions'])

// 根据工艺线ID获取工艺线名称
const getProductionLineName = (id) => {
  const line = productionLines.value.find(l => l.id === id)
  return line ? line.name : '未指定'
}

// 初始化时加载数据
onMounted(async () => {
  try {
    await store.dispatch('product/getProductConfigs')
    await store.dispatch('production/getProductions')
    
    // 如果是编辑模式，加载配置数据
    if (isEditMode.value) {
      await loadConfigForEdit()
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
})

// 组件卸载前清理
onBeforeUnmount(() => {
  // 清理数据，避免内存泄漏
  formRef.value = null
})

// 加载编辑配置数据
const loadConfigForEdit = async () => {
  try {
    const config = store.getters['product/getProductConfigById'](editId.value)
    if (config) {
      formData.value = {
        ...config,
        startDate: config.startDate ? new Date(config.startDate) : ''
      }
    } else {
      ElMessage.error('未找到产品配置')
      router.push('/factory/list')
    }
  } catch (error) {
    ElMessage.error('加载配置数据失败')
    router.push('/factory/list')
  }
}

// 表单数据
const formData = ref({
  productName: '',  // 产品名称
  productionLineId: '',  // 工艺线ID
  description: '',  // 描述
  plannedQuantity: 0,  // 计划生产数量
  maxDailyQuantity: 0,  // 每天最大生产数量
  startNumber: 0,  // 起始编号
  currentNumber: 0,  // 当前生产编号
  startDate: '',  // 开始时间
  priority: 'normal',  // 优先级
  expectedEndDate: '',  // 预期结束时间
  status: 'waiting',  // 状态
  completedQuantity: 0,  // 已完成数量
  remarks: '',  // 备注
})

// 表单验证规则
const rules = {
  productName: [
    { required: true, message: '请输入产品名称', trigger: 'blur' }
  ],
  productionLineId: [
    { required: true, message: '请选择工艺线', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入产线描述', trigger: 'blur' }
  ],
  plannedQuantity: [
    { required: true, message: '请输入计划生产数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  maxDailyQuantity: [
    { required: true, message: '请输入每日最大生产数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  startNumber: [
    { required: true, message: '请输入起始编号', trigger: 'blur' },
    { type: 'number', min: 1001, max: 9999, message: '编号必须是4位数字', trigger: 'blur' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 计算结束编号
const endNumber = computed(() => {
  if (!formData.value.startNumber || !formData.value.plannedQuantity) return ''
  return formData.value.startNumber + formData.value.plannedQuantity - 1
})

// 计算分组信息
const groupInfo = computed(() => {
  if (!formData.value.maxDailyQuantity || !formData.value.plannedQuantity) return []
  
  const groups = []
  let remaining = formData.value.plannedQuantity
  let currentStart = formData.value.startNumber
  let day = 1

  while (remaining > 0) {
    const dayQuantity = Math.min(remaining, formData.value.maxDailyQuantity)
    groups.push({
      day,
      range: `${currentStart} - ${currentStart + dayQuantity - 1}`,
      quantity: dayQuantity
    })
    remaining -= dayQuantity
    currentStart += dayQuantity
    day++
  }

  return groups
})

const formRef = ref(null)

// 优先级选项
const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '普通', value: 'normal' },
  { label: '高', value: 'high' },
  { label: '紧急', value: 'urgent' }
]

// 状态选项
const statusOptions = [
  { label: '等待中', value: 'waiting' },
  { label: '生产中', value: 'running' },
  { label: '已暂停', value: 'paused' },
  { label: '已完成', value: 'completed' }
]

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 获取工艺线名称并准备配置数据
        const productionLineName = getProductionLineName(formData.value.productionLineId)
        
        // 准备要保存的数据，确保日期格式正确
        const configData = {
          ...formData.value,
          productionLineName, // 添加工艺线名称
          endNumber: endNumber.value,
          groups: groupInfo.value,
          updateTime: new Date().toISOString(),
          // 确保日期字段为字符串格式
          startDate: formData.value.startDate ? 
            (typeof formData.value.startDate === 'string' ? 
              formData.value.startDate : 
              formData.value.startDate.toISOString()) : '',
          expectedEndDate: formData.value.expectedEndDate ? 
            (typeof formData.value.expectedEndDate === 'string' ? 
              formData.value.expectedEndDate : 
              formData.value.expectedEndDate.toISOString()) : ''
        }

        if (isEditMode.value) {
          // 编辑模式
          await store.dispatch('product/updateProductConfig', configData)
          ElMessage.success('配置更新成功')
        } else {
          // 新增模式
          await store.dispatch('product/addProductConfig', {
            ...configData,
            status: 'waiting',  // 初始状态为等待中
            completedQuantity: 0,  // 已完成数量初始为0
            currentStepInfo: null  // 当前步骤信息
          })
          ElMessage.success('配置保存成功')
        }
        
        // 保存成功后跳转到产线列表
        router.push('/factory/list')
      } catch (error) {
        console.error('Save error:', error)
        ElMessage.error(isEditMode.value ? '配置更新失败' : '配置保存失败')
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  
  // 重置数组字段
  formData.value.materialConsumption = []
  formData.value.qualityStandards = []
  formData.value.processSteps = []
}

// 取消编辑
const cancelEdit = () => {
  router.push('/factory/list')
}
</script>

<template>
  <div class="product-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEditMode ? '编辑产线配置' : '新建产线配置' }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="140px"
        class="config-form"
      >
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="formData.productName" placeholder="请输入产品名称"></el-input>
        </el-form-item>

        <el-form-item label="工艺线" prop="productionLineId">
          <el-select v-model="formData.productionLineId" placeholder="请选择工艺线" style="width: 100%">
            <el-option
              v-for="line in productionLines"
              :key="line.id"
              :label="line.name"
              :value="line.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入产线描述"
          ></el-input>
        </el-form-item>

        <el-form-item label="计划生产数量" prop="plannedQuantity">
          <el-input-number
            v-model="formData.plannedQuantity"
            :min="1"
            controls-position="right"
            style="width: 200px"
          ></el-input-number>
        </el-form-item>

        <el-form-item label="每日最大生产数量" prop="maxDailyQuantity">
          <el-input-number
            v-model="formData.maxDailyQuantity"
            :min="1"
            controls-position="right"
            style="width: 200px"
          ></el-input-number>
        </el-form-item>

        <el-form-item label="起始编号" prop="startNumber">
          <el-input-number
            v-model="formData.startNumber"
            :min="1001"
            :max="9999"
            controls-position="right"
            style="width: 200px"
          ></el-input-number>
          <span class="number-range" v-if="endNumber">
            编号范围: {{ formData.startNumber }} - {{ endNumber }}
          </span>
        </el-form-item>

        <el-form-item label="开始时间" prop="startDate">
          <el-date-picker
            v-model="formData.startDate"
            type="date"
            placeholder="选择开始日期"
            style="width: 200px"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="预期结束时间">
          <el-date-picker
            v-model="formData.expectedEndDate"
            type="date"
            placeholder="选择预期结束日期"
            style="width: 200px"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="formData.priority" placeholder="请选择优先级" style="width: 200px">
            <el-option
              v-for="option in priorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="状态" v-if="isEditMode">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 200px">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="已完成数量" v-if="isEditMode">
          <el-input-number
            v-model="formData.completedQuantity"
            :min="0"
            :max="formData.plannedQuantity"
            controls-position="right"
            style="width: 200px"
          ></el-input-number>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="formData.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          ></el-input>
        </el-form-item>

        <el-form-item label="生产分组预览">
          <div class="group-preview" v-if="groupInfo.length">
            <el-table :data="groupInfo" border style="width: 100%">
              <el-table-column prop="day" label="天数" width="80">
                <template #default="scope">
                  第 {{ scope.row.day }} 天
                </template>
              </el-table-column>
              <el-table-column prop="range" label="编号范围"></el-table-column>
              <el-table-column prop="quantity" label="数量" width="100"></el-table-column>
            </el-table>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">
            {{ isEditMode ? '保存更新' : '保存配置' }}
          </el-button>
          <el-button @click="isEditMode ? cancelEdit() : resetForm()">
            {{ isEditMode ? '取消' : '重置' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.product-config {
  padding: 20px;
}

.config-form {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.number-range {
  margin-left: 12px;
  color: #606266;
}

.group-preview {
  margin-top: 12px;
}

.material-section,
.quality-section,
.process-section {
  width: 100%;
}

.material-item,
.quality-item,
.process-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
}
</style>
