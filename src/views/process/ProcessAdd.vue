<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'
import { Plus, Delete } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

// 判断是否为编辑模式
const isEdit = computed(() => route.name === 'ProcessEdit')

// 如果是编辑模式，加载现有数据
onMounted(async () => {
  if (isEdit.value) {
    const id = parseInt(route.params.id)
    const processData = store.getters['process/getProcessById'](id)
    if (processData) {
      // 填充表单数据
      Object.assign(formData, {
        ...processData,
        parameters: [], // 这里先清空，后面会重新填充
        materials: []   // 这里先清空，后面会重新填充
      })
      
      // 填充参数列表
      parameterList.value = processData.parameters.map(p => ({
        name: p.name,
        type: p.type,
        unit: p.unit,
        defaultValue: p.value,
        remark: p.remark
      }))
      
      // 填充物料列表
      materialList.value = processData.materials.map(m => ({
        name: m.name,
        type: m.type,
        unit: m.unit,
        defaultValue: m.defaultValue,
        remark: m.remark
      }))
    } else {
      ElMessage.error('未找到工艺设备信息')
      router.push('/process/list')
    }
  }
})

// 图片上传处理
const handleImageChange = (file) => {
  const isImage = file.raw.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  // 将图片转换为base64
  const reader = new FileReader()
  reader.readAsDataURL(file.raw)
  reader.onload = () => {
    formData.image = reader.result
    formData.imageUrl = reader.result
  }
}

// 图片上传前的验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 设备类型选项
const deviceTypes = [
  { value: '清洗', label: '清洗', defaultParams: ['时间', '温度', '热水洗次数', '冷水洗次数'] },
  { value: '干燥', label: '干燥', defaultParams: ['时间', '温度'] },
  { value: '生成', label: '生成', defaultParams: ['时间', '温度'] },
  { value: '氧扫', label: '氧扫', defaultParams: ['时间', '温度'] },
  { value: '磁控', label: '磁控', defaultParams: ['时间'] },
  { value: '电镀', label: '电镀', defaultParams: ['时间', '电流', '温度'] },
  { value: '研抛', label: '研抛', defaultParams: ['时间', '配重', '转速','抛光布种类'] },
  { value: '光刻', label: '光刻', defaultParams: ['光刻胶种类','匀胶温度','匀胶转速','曝光时间','曝光间隔','循环次数', '显影液种类'] },
  { value: '热稳定', label: '热稳定', defaultParams: ['时间', '温度'] },
  { value: '其他', label: '其他', defaultParams: [] }
]

// 表单数据
const formData = reactive({
  name: '',
  type: '',
  model: '',
  image: '',
  imageUrl: '',  // 用于预览图片
  parameters: [],
  materials: [],
  remark: '',
  createTime: '',
  updateTime: ''
})

// 表单规则
const rules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  model: [{ required: true, message: '请输入设备型号', trigger: 'blur' }],
  'parameters.*.name': [{ required: true, message: '请输入参数名称', trigger: 'blur' }],
  'parameters.*.defaultValue': [{ required: true, message: '请输入默认值', trigger: 'blur' }],
  'materials.*.name': [{ required: true, message: '请输入物料名称', trigger: 'blur' }],
  'materials.*.defaultValue': [{ required: true, message: '请输入默认值', trigger: 'blur' }]
}

// 参数列表
const parameterList = ref([
  { name: '', type: 'number', unit: '', defaultValue: '1', remark: '' }
])

// 物料消耗列表
const materialList = ref([
  { name: '', type: 'number', unit: '', defaultValue: '1', remark: '' }
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
      defaultValue: '',
      remark: ''
    }))
  }
}

// 添加参数
const addParameter = () => {
  parameterList.value.push({
    name: '',
    type: 'number',
    unit: '',
    defaultValue: '1',
    remark: ''
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
    type: 'number',
    unit: '',
    defaultValue: '1',
    remark: ''
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
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 整理数据
        const processData = {
          ...formData,
          parameters: parameterList.value.filter(p => p.name).map(p => ({
            name: p.name,
            type: p.type,
            unit: p.unit,
            value: p.defaultValue,
            remark: p.remark
          })),
          materials: materialList.value.filter(m => m.name)
        }

        if (isEdit.value) {
          // 更新工艺
          await store.dispatch('process/updateProcess', {
            id: parseInt(route.params.id),
            updates: processData
          })
          ElMessage.success('更新成功')
        } else {
          // 添加新工艺
          await store.dispatch('process/addProcess', processData)
          ElMessage.success('添加成功')
        }
        
        router.push('/process/list')
      } catch (error) {
        ElMessage.error(error.message || (isEdit.value ? '更新失败' : '添加失败'))
      }
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
  { value: 'm²', label: '平方米(m²)' },
  { value: '℃', label: '摄氏度(℃)' },
  { value: 'n', label: '次(n)' },
  { value: 'W', label: '瓦特(W)' },
  { value: '%', label: '浓度(%)' },
  { value: 'μm', label: '微米(μm)' },
  { value: 'nm', label: '纳米(nm)' },
  { value: 'L', label: '升(L)' },
  { value: 'mL', label: '毫升(mL)' },
  { value: 'g', label: '克(g)' },
  { value: 'kg', label: '千克(kg)' },
  { value: 'rpm', label: '转每分(rpm)' },
  { value: 'A', label: '电流(A)' }
]
</script>

<template>
  <div class="process-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑' : '添加' }}工艺设备</span>
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
            :limit="1"
            accept=".jpg,.jpeg,.png"
            :on-change="handleImageChange"
            :before-upload="beforeImageUpload"
          >
            <template #default>
              <el-icon><Plus /></el-icon>
            </template>
            <template #file="{ file }">
              <img
                class="el-upload-list__item-thumbnail"
                :src="formData.imageUrl"
                alt=""
              />
            </template>
          </el-upload>
        </el-form-item>

        <el-divider>工艺参数设置</el-divider>

        <div v-for="(param, index) in parameterList" :key="index" class="parameter-item">
          <el-row :gutter="20">
            <el-col :span="6">
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
            <el-col :span="6">
              <el-form-item :label="index === 0 ? '默认值' : ''" :prop="'parameters.' + index + '.defaultValue'">
                <el-input v-model="param.defaultValue" placeholder="默认值" type="number"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="index === 0 ? '备注' : ''" :prop="'parameters.' + index + '.remark'">
                <el-input v-model="param.remark" placeholder="备注"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="2" class="flex-center">
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
            <el-col :span="6">
              <el-form-item :label="index === 0 ? '物料名称' : ''" :prop="'materials.' + index + '.name'">
                <el-input v-model="material.name" placeholder="物料名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="index === 0 ? '类型' : ''" :prop="'materials.' + index + '.type'">
                <el-select v-model="material.type" style="width: 100%">
                  <el-option label="数值" value="number"></el-option>
                  <el-option label="文本" value="text"></el-option>
                  <el-option label="布尔" value="boolean"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
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
            <el-col :span="6">
              <el-form-item :label="index === 0 ? '默认值' : ''" :prop="'materials.' + index + '.defaultValue'">
                <el-input v-model="material.defaultValue" placeholder="默认值" type="number"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="index === 0 ? '备注' : ''" :prop="'materials.' + index + '.remark'">
                <el-input v-model="material.remark" placeholder="备注"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="2" class="flex-center">
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

        <el-form-item label="设备备注" prop="remark">
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
