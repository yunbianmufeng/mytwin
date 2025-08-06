<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 表单数据
const formData = reactive({
  name: '',
  type: '',
  model: '',
  totalAmount: '',
  unit: '',
  remark: ''
})

// 表单规则
const rules = {
  name: [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入物料类型', trigger: 'blur' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  totalAmount: [
    { required: true, message: '请输入总量', trigger: 'blur' },
    { type: 'number', message: '总量必须为数字', trigger: 'blur' }
  ],
  unit: [{ required: true, message: '请选择单位', trigger: 'change' }]
}

// 单位选项
const unitOptions = [
  { value: 'L', label: '升(L)' },
  { value: 'kg', label: '千克(kg)' },
  { value: 'g', label: '克(g)' },
  { value: 'mL', label: '毫升(mL)' }
]

// 物料类型选项
const typeOptions = [
  { value: '光刻胶', label: '光刻胶' },
  { value: '清洗剂', label: '清洗剂' },
  { value: '电镀材料', label: '电镀材料' },
  { value: '其他', label: '其他' }
]

const formRef = ref(null)

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
      router.push('/material/list')
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
}
</script>

<template>
  <div class="material-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加物料</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="material-form"
      >
        <el-form-item label="物料名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入物料名称"></el-input>
        </el-form-item>

        <el-form-item label="物料类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择物料类型" style="width: 100%">
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="型号" prop="model">
          <el-input v-model="formData.model" placeholder="请输入型号"></el-input>
        </el-form-item>

        <el-form-item label="总量" prop="totalAmount">
          <el-input-number 
            v-model="formData.totalAmount" 
            :min="0"
            style="width: 100%"
          ></el-input-number>
        </el-form-item>

        <el-form-item label="单位" prop="unit">
          <el-select v-model="formData.unit" placeholder="请选择单位" style="width: 100%">
            <el-option
              v-for="item in unitOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.material-add {
  padding: 20px;
}

.material-form {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>
