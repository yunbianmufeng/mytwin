<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'

const router = useRouter()

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  steps: [],
  remark: ''
})

// 表单规则
const rules = {
  name: [{ required: true, message: '请输入产线名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入产线描述', trigger: 'blur' }],
  steps: [{ required: true, message: '请添加至少一个工艺步骤', trigger: 'change' }]
}

// 工艺步骤对话框
const stepDialogVisible = ref(false)
const currentStep = reactive({
  processId: '',
  processName: '',
  deviceId: '',
  deviceName: '',
  parameters: {}
})

// 工艺设备选项（这里使用模拟数据，实际应该从后端获取）
const processOptions = ref([
  {
    id: 1,
    name: '清洗',
    devices: [
      { id: 101, name: 'RCA清洗机', parameters: { time: '30', temperature: '25', concentration: '1:1:5' } },
      { id: 102, name: '超声波清洗机', parameters: { time: '20', power: '800' } }
    ]
  },
  {
    id: 2,
    name: '光刻',
    devices: [
      { id: 201, name: '步进式光刻机', parameters: { time: '45', power: '500', alignment: '±0.1μm' } }
    ]
  },
  {
    id: 3,
    name: '氧化',
    devices: [
      { id: 301, name: '氧化炉', parameters: { time: '60', temperature: '1000', pressure: '1atm' } }
    ]
  }
])

const formRef = ref(null)

// 添加工艺步骤
const handleAddStep = () => {
  stepDialogVisible.value = true
  Object.assign(currentStep, {
    processId: '',
    processName: '',
    deviceId: '',
    deviceName: '',
    parameters: {}
  })
}

// 当选择工艺类型时
const handleProcessChange = (processId) => {
  currentStep.processName = processOptions.value.find(p => p.id === processId)?.name || ''
  currentStep.deviceId = ''
  currentStep.deviceName = ''
  currentStep.parameters = {}
}

// 当选择设备时
const handleDeviceChange = (deviceId) => {
  const process = processOptions.value.find(p => p.id === currentStep.processId)
  const device = process?.devices.find(d => d.id === deviceId)
  if (device) {
    currentStep.deviceName = device.name
    currentStep.parameters = { ...device.parameters }
  }
}

// 确认添加步骤
const confirmAddStep = () => {
  const step = {
    id: Date.now(), // 使用时间戳作为临时ID
    processId: currentStep.processId,
    processName: currentStep.processName,
    deviceId: currentStep.deviceId,
    deviceName: currentStep.deviceName,
    parameters: { ...currentStep.parameters }
  }
  formData.steps.push(step)
  stepDialogVisible.value = false
}

// 删除步骤
const deleteStep = (index) => {
  formData.steps.splice(index, 1)
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 在这里添加实际的提交逻辑
      ElMessage({
        type: 'success',
        message: '添加成功'
      })
      router.push('/production/list')
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  formData.steps = []
}
</script>

<template>
  <div class="production-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加产线</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="production-form"
      >
        <el-form-item label="产线名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入产线名称"></el-input>
        </el-form-item>

        <el-form-item label="产线描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="2"
            placeholder="请输入产线描述"
          ></el-input>
        </el-form-item>

        <el-form-item label="工艺步骤" prop="steps">
          <div class="steps-container">
            <draggable
              v-model="formData.steps"
              item-key="id"
              handle=".drag-handle"
              ghost-class="ghost"
              :animation="200"
            >
              <template #item="{ element, index }">
                <div class="step-item">
                  <el-icon class="drag-handle"><DragHandle /></el-icon>
                  <span class="step-index">{{ index + 1 }}</span>
                  <span class="step-content">
                    {{ element.processName }} - {{ element.deviceName }}
                  </span>
                  <el-button
                    type="danger"
                    link
                    :icon="Delete"
                    @click="deleteStep(index)"
                  ></el-button>
                </div>
              </template>
            </draggable>
            <el-button type="primary" plain @click="handleAddStep">添加步骤</el-button>
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
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 添加工艺步骤对话框 -->
    <el-dialog
      v-model="stepDialogVisible"
      title="添加工艺步骤"
      width="50%"
    >
      <el-form label-width="100px">
        <el-form-item label="工艺类型">
          <el-select
            v-model="currentStep.processId"
            placeholder="请选择工艺类型"
            @change="handleProcessChange"
            style="width: 100%"
          >
            <el-option
              v-for="item in processOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="设备选择" v-if="currentStep.processId">
          <el-select
            v-model="currentStep.deviceId"
            placeholder="请选择设备"
            @change="handleDeviceChange"
            style="width: 100%"
          >
            <el-option
              v-for="device in processOptions.find(p => p.id === currentStep.processId)?.devices"
              :key="device.id"
              :label="device.name"
              :value="device.id"
            ></el-option>
          </el-select>
        </el-form-item>

        <template v-if="currentStep.deviceId && currentStep.parameters">
          <el-form-item
            v-for="(value, key) in currentStep.parameters"
            :key="key"
            :label="key"
          >
            <el-input v-model="currentStep.parameters[key]"></el-input>
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
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.steps-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  min-height: 100px;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fff;
}

.drag-handle {
  cursor: move;
  margin-right: 10px;
  color: #909399;
}

.step-index {
  margin-right: 10px;
  color: #909399;
  font-weight: bold;
}

.step-content {
  flex: 1;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
