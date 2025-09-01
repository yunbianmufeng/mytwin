<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()

// 从 store 获取产线列表
const tableData = computed(() => store.getters['production/getProductions'])

// 组件挂载时加载数据
onMounted(async () => {
  try {
    await store.dispatch('production/fetchProductions')
  } catch (error) {
    console.error('加载工艺线数据失败:', error)
    ElMessage.error('加载工艺线数据失败')
  }
})

// 搜索表单
const searchForm = ref({
  name: '',
  dateRange: []
})

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    name: '',
    dateRange: []
  }
}

// 删除产线
const handleDelete = async (index, row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该产线吗？此操作不可恢复。',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await store.dispatch('production/deleteProduction', row.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const dialogVisible = ref(false)
const materialDialogVisible = ref(false)
const parameterDialogVisible = ref(false)
const currentProduction = ref(null)
const currentMaterials = ref([])
const currentStepDetail = ref(null)

// 查看步骤详情
const handleViewStepDetail = (material, detail) => {
  // 从当前生产线中找到对应的步骤
  const layerMatch = detail.layer.match(/第 (\d+) 层 第 (\d+) 步/)
  if (layerMatch && currentProduction.value) {
    const layerIndex = parseInt(layerMatch[1]) - 1
    const stepIndex = parseInt(layerMatch[2]) - 1
    const step = currentProduction.value.layers[layerIndex]?.steps[stepIndex]
    if (step) {
      currentStepDetail.value = {
        processName: step.processName,
        parameters: step.parameters,
        materials: step.materials,
        layerInfo: detail.layer
      }
      parameterDialogVisible.value = true
    }
  }
}

// 查看工艺步骤
const handleViewSteps = (row) => {
  currentProduction.value = row
  dialogVisible.value = true
}

// 查看物料消耗详情
const handleViewMaterials = (row) => {
  currentProduction.value = row  // 保存当前生产线信息
  // 计算总物料消耗并转换为数组形式
  const materialSummary = {}
  row.layers?.forEach(layer => {
    layer.steps?.forEach(step => {
      step.materials?.forEach(material => {
        const key = material.name
        if (!materialSummary[key]) {
          materialSummary[key] = {
            name: material.name,
            unit: material.unit,
            total: 0,
            details: [] // 用于存储每个步骤的消耗详情
          }
        }
        materialSummary[key].total += Number(material.defaultValue || 0)
        materialSummary[key].details.push({
          layer: `第 ${row.layers.indexOf(layer) + 1} 层 第 ${layer.steps.indexOf(step) + 1} 步`,
          value: material.defaultValue,
          processName: step.processName
        })
      })
    })
  })
  
  currentMaterials.value = Object.values(materialSummary)
  materialDialogVisible.value = true
}

// 计算物料消耗汇总（单层）
const calculateMaterialSummary = (layer) => {
  if (!layer.steps?.length) return ''
  const materialSummary = {}
  layer.steps.forEach(step => {
    step.materials?.forEach(material => {
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

// 计算整条产线的物料消耗汇总
const calculateTotalMaterialSummary = (production) => {
  if (!production.layers?.length) return ''
  const materialSummary = {}
  production.layers.forEach(layer => {
    layer.steps?.forEach(step => {
      step.materials?.forEach(material => {
        const key = `${material.name}(${material.unit})`
        if (!materialSummary[key]) {
          materialSummary[key] = 0
        }
        materialSummary[key] += Number(material.defaultValue || 0)
      })
    })
  })
  return Object.entries(materialSummary)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')
}
</script>

<template>
  <div class="production-list">
    <el-card>
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="工艺线名称">
          <el-input v-model="searchForm.name" placeholder="请输入工艺线名称"></el-input>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="name" label="工艺线名称" min-width="150"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column label="工艺步骤" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="handleViewSteps(scope.row)">
              查看步骤 ({{ scope.row.layers?.reduce((total, layer) => total + (layer.steps?.length || 0), 0) || 0 }})
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="物料消耗" min-width="180">
          <template #default="scope">
            <el-tooltip
              :content="calculateTotalMaterialSummary(scope.row)"
              placement="top"
              effect="light"
              :show-after="200"
            >
              <el-button link type="primary" :icon="InfoFilled" @click="handleViewMaterials(scope.row)">
                查看物料消耗
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="140"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="140"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150"></el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="$router.push('/production/edit/' + scope.row.id)">
              编辑
            </el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          :current-page="1"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="2"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 工艺步骤查看对话框 -->
    <el-dialog
      v-if="currentProduction"
      v-model="dialogVisible"
      :title="currentProduction.name + ' - 工艺步骤'"
      width="70%"
    >
      <div class="steps-view">
        <div v-for="(layer, layerIndex) in currentProduction.layers" :key="layer.id" class="layer-info">
          <div class="layer-header">
            <h4>第 {{ layerIndex + 1 }} 层</h4>
            <el-tooltip
              :content="calculateMaterialSummary(layer)"
              placement="top"
              effect="light"
              :show-after="200"
            >
              <el-icon class="info-icon"><info-filled /></el-icon>
            </el-tooltip>
          </div>
          <el-steps 
            :active="layer.steps.length" 
            finish-status="success"
            simple
            style="margin-top: 16px;"
          >
            <el-step 
              v-for="step in layer.steps" 
              :key="step.id"
              :title="step.processName"
              :description="
                '参数: ' + step.parameters.map(p => `${p.name}=${p.value}${p.unit}`).join(', ') +
                '\n物料: ' + step.materials.map(m => `${m.name}=${m.defaultValue}${m.unit}`).join(', ')
              "
            />
          </el-steps>
        </div>
      </div>
    </el-dialog>

    <!-- 物料消耗详情对话框 -->
    <el-dialog
      v-model="materialDialogVisible"
      title="物料消耗详情"
      width="70%"
    >
      <div class="materials-view">
        <el-card v-for="material in currentMaterials" :key="material.name" class="material-card">
          <template #header>
            <div class="material-header">
              <h3>{{ material.name }}</h3>
              <span class="material-total">总消耗: {{ material.total }}{{ material.unit }}</span>
            </div>
          </template>
          <el-table 
            :data="material.details" 
            style="width: 100%"
            @row-click="(row) => handleViewStepDetail(material, row)"
          >
            <el-table-column label="所在位置" prop="layer" min-width="150">
              <template #default="scope">
                <el-button link type="primary">{{ scope.row.layer }}</el-button>
              </template>
            </el-table-column>
            <el-table-column label="工序名称" prop="processName" min-width="120"></el-table-column>
            <el-table-column label="消耗量" width="120">
              <template #default="scope">
                {{ scope.row.value }}{{ material.unit }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-dialog>

    <!-- 步骤参数详情对话框 -->
    <el-dialog
      v-if="currentStepDetail"
      v-model="parameterDialogVisible"
      :title="'工艺步骤详情 - ' + currentStepDetail.layerInfo"
      width="50%"
    >
      <div class="step-detail-view">
        <el-descriptions border>
          <el-descriptions-item label="工序名称" :span="3">
            {{ currentStepDetail.processName }}
          </el-descriptions-item>
          
          <template v-if="currentStepDetail.parameters?.length">
            <el-descriptions-item label="工艺参数" :span="3">
              <div class="params-list">
                <div v-for="param in currentStepDetail.parameters" :key="param.name" class="param-item">
                  <span class="param-name">{{ param.name }}:</span>
                  <span class="param-value">{{ param.value }}{{ param.unit }}</span>
                </div>
              </div>
            </el-descriptions-item>
          </template>
          
          <template v-if="currentStepDetail.materials?.length">
            <el-descriptions-item label="物料消耗" :span="3">
              <div class="params-list">
                <div v-for="material in currentStepDetail.materials" :key="material.name" class="param-item">
                  <span class="param-name">{{ material.name }}:</span>
                  <span class="param-value">{{ material.defaultValue }}{{ material.unit }}</span>
                </div>
              </div>
            </el-descriptions-item>
          </template>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.production-list {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.steps-view {
  max-height: 60vh;
  overflow-y: auto;
  padding: 10px;
}

.layer-info {
  margin-bottom: 30px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.layer-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.layer-header h4 {
  margin: 0;
  color: #606266;
}

.info-icon {
  color: #409EFF;
  cursor: pointer;
}

:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-step__description) {
  font-size: 12px;
  white-space: pre-line;
}

.materials-view {
  max-height: 70vh;
  overflow-y: auto;
  padding: 10px;
}

.material-card {
  margin-bottom: 20px;
}

.material-card:last-child {
  margin-bottom: 0;
}

.material-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.material-header h3 {
  margin: 0;
  color: #303133;
}

.material-total {
  font-size: 16px;
  font-weight: bold;
  color: #409EFF;
}

.clickable-table {
  cursor: pointer;
}

.clickable-table tbody tr:hover {
  background-color: #f5f7fa;
}

.clickable-text {
  color: #409EFF;
  text-decoration: underline;
}

.step-detail-view {
  padding: 20px;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.param-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.param-name {
  color: #606266;
  min-width: 120px;
  font-weight: 500;
}

.param-value {
  color: #303133;
}

.step-detail-view {
  padding: 10px;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item {
  display: flex;
  gap: 8px;
}

.param-name {
  color: #606266;
  min-width: 100px;
}

.param-value {
  color: #303133;
  font-weight: 500;
}
</style>
