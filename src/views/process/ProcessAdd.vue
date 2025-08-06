<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 设备类型选项
const deviceTypes = [
  { value: 'cleaning', label: '清洗', defaultParams: ['时间', '温度', '浓度'] },
  { value: 'coating', label: '镀膜', defaultParams: ['时间', '温度', '压力', '气体流量'] },
  { value: 'lithography', label: '光刻', defaultParams: ['曝光时间', '功率', '对准精度'] },
  { value: 'oxidation', label: '氧扫', defaultParams: ['时间', '温度', '氧气流量'] },
  { value: 'plating', label: '电镀', defaultParams: ['时间', '电流密度', '温度', '搅拌速度'] }
]

// 表单数据
const formData = reactive({
  name: '',
  type: '',
  model: '',
  image: '',
  parameters: [],
  materials: [],
  remark: ''
})

// 表单规则
const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }]
}

// 参数列表
const parameterList = ref([
  { name: '', type: 'number', unit: '', defaultValue: '' }
])

// 物料消耗列表
const materialList = ref([
  { name: '', consumption: '', unit: '' }
])

// 当设备类型改变时
const handleTypeChange = (type) => {
  const selectedType = deviceTypes.find(t => t.value === type)
  if (selectedType) {
    // 根据设备类型预设参数
    parameterList.value = selectedType.defaultParams.map(param => ({
      name: param,
      type: 'number',
      unit: '',
      defaultValue: ''
    }))
  }
}

// 添加参数
const addParameter = () => {
  parameterList.value.push({
    name: '',
    type: 'number',
    unit: '',
    defaultValue: ''
  })
}

// 删除参数
const removeParameter = (index) => {
  parameterList.value.splice(index, 1)
}

// 添加物料
const addMaterial = () => {
  materialList.value.push({
    name: '',
    consumption: '',
    unit: ''
  })
}

// 删除物料
const removeMaterial = (index) => {
  materialList.value.splice(index, 1)
}

const formRef = ref(null)

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      // 整理参数和物料数据
      formData.parameters = parameterList.value.filter(p => p.name)
      formData.materials = materialList.value.filter(m => m.name)

      // TODO: 在这里添加实际的提交逻辑
      ElMessage({
        type: 'success',
        message: '添加成功'
      })
      router.push('/process/list')
    }
  })
}

// 重置表单
const resetForm = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  parameterList.value = [{ name: '', type: 'number', unit: '', defaultValue: '' }]
  materialList.value = [{ name: '', consumption: '', unit: '' }]
}

// 单位选项
const unitOptions = [
  { value: 's', label: '秒(s)' },
  { value: 'min', label: '分钟(min)' },
  { value: '℃', label: '摄氏度(℃)' },
  { value: 'W', label: '瓦特(W)' },
  { value: 'mW', label: '毫瓦(mW)' },
  { value: 'μm', label: '微米(μm)' },
  { value: 'nm', label: '纳米(nm)' },
  { value: 'L', label: '升(L)' },
  { value: 'mL', label: '毫升(mL)' },
  { value: 'g', label: '克(g)' },
  { value: 'kg', label: '千克(kg)' },
  { value: 'rpm', label: '转每分(rpm)' }
]
</script>

<template>
  <div class="process-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加工艺设备</span>
        </div>
      </template>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="process-form"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入设备名称"></el-input>
        </el-form-item>

        <el-form-item label="设备类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择设备类型" @change="handleTypeChange" style="width: 100%">
            <el-option
              v-for="item in deviceTypes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="设备型号" prop="model">
          <el-input v-model="formData.model" placeholder="请输入设备型号"></el-input>
        </el-form-item>

        <el-form-item label="设备图片">
          <el-upload
            class="image-upload"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
          >
            <template #default>
              <el-icon><Plus /></el-icon>
            </template>
            <template #file="{ file }">
              <img
                class="el-upload-list__item-thumbnail"
                :src="file.url"
                alt=""
              />
            </template>
          </el-upload>
        </el-form-item>

        <el-divider>工艺参数设置</el-divider>

        <div v-for="(param, index) in parameterList" :key="index" class="parameter-item">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item :label="index === 0 ? '参数名称' : ''" :prop="'parameters.' + index + '.name'">
                <el-input v-model="param.name" placeholder="参数名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="index === 0 ? '类型' : ''" :prop="'parameters.' + index + '.type'">
                <el-select v-model="param.type" style="width: 100%">
                  <el-option label="数值" value="number"></el-option>
                  <el-option label="文本" value="text"></el-option>
                  <el-option label="布尔" value="boolean"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="index === 0 ? '单位' : ''" :prop="'parameters.' + index + '.unit'">
                <el-select v-model="param.unit" style="width: 100%">
                  <el-option
                    v-for="unit in unitOptions"
                    :key="unit.value"
                    :label="unit.label"
                    :value="unit.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item :label="index === 0 ? '默认值' : ''" :prop="'parameters.' + index + '.defaultValue'">
                <el-input v-model="param.defaultValue" placeholder="默认值"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="1" class="flex-center">
              <el-button
                v-if="parameterList.length > 1"
                type="danger"
                link
                :icon="Delete"
                @click="removeParameter(index)"
              ></el-button>
            </el-col>
          </el-row>
        </div>

        <el-form-item>
          <el-button type="primary" link @click="addParameter">添加参数</el-button>
        </el-form-item>

        <el-divider>物料消耗设置</el-divider>

        <div v-for="(material, index) in materialList" :key="index" class="material-item">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item :label="index === 0 ? '物料名称' : ''" :prop="'materials.' + index + '.name'">
                <el-input v-model="material.name" placeholder="物料名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item :label="index === 0 ? '单次消耗量' : ''" :prop="'materials.' + index + '.consumption'">
                <el-input-number v-model="material.consumption" :min="0" style="width: 100%"></el-input-number>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item :label="index === 0 ? '单位' : ''" :prop="'materials.' + index + '.unit'">
                <el-select v-model="material.unit" style="width: 100%">
                  <el-option
                    v-for="unit in unitOptions"
                    :key="unit.value"
                    :label="unit.label"
                    :value="unit.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="1" class="flex-center">
              <el-button
                v-if="materialList.length > 1"
                type="danger"
                link
                :icon="Delete"
                @click="removeMaterial(index)"
              ></el-button>
            </el-col>
          </el-row>
        </div>

        <el-form-item>
          <el-button type="primary" link @click="addMaterial">添加物料</el-button>
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
  </div>
</template>

<style scoped>
.process-add {
  padding: 20px;
}

.process-form {
  max-width: 1000px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.parameter-item,
.material-item {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-upload {
  :deep(.el-upload) {
    width: 180px;
    height: 180px;
  }
}

.el-divider {
  margin: 24px 0;
}
</style>
