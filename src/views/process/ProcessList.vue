<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, Edit, Delete, View, Picture, InfoFilled, DataAnalysis } from '@element-plus/icons-vue'

const store = useStore()
const router = useRouter()

// 搜索条件
const searchForm = ref({
  name: '',
  type: '',
  date: []
})

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    name: '',
    type: '',
    date: []
  }
}

// 表格数据
const tableData = ref([])

// 分页参数
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载工艺列表
const loadProcessList = async () => {
  try {
    await store.dispatch('process/fetchProcesses')
    tableData.value = store.getters['process/getProcesses']
    pagination.value.total = tableData.value.length
  } catch (error) {
    ElMessage.error('加载工艺设备列表失败')
  }
}

// 删除工艺
const handleDelete = async (index, row) => {
  try {
    await ElMessageBox.confirm('确定要删除该工艺设备吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await store.dispatch('process/deleteProcess', row.id)
    ElMessage.success('删除成功')
    await loadProcessList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 查看详情
const handleView = (row) => {
  router.push(`/process/detail/${row.id}`)
}

// 编辑工艺
const handleEdit = (row) => {
  router.push(`/process/edit/${row.id}`)
}

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索功能
  loadProcessList()
}

// 页面加载时获取数据
onMounted(() => {
  loadProcessList()
})

// 统计数据计算属性
const deviceStats = computed(() => {
  const stats = {
    total: tableData.value.length,
    byType: {},
    byStatus: {}
  }
  
  tableData.value.forEach(device => {
    // 按设备类型统计
    const deviceType = device.deviceType || device.type || '未分类'
    stats.byType[deviceType] = (stats.byType[deviceType] || 0) + 1
    
    // 按状态统计
    const status = device.status || 'unknown'
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1
  })
  
  return stats
})
</script>

<template>
  <div class="process-list">
    <el-card>
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="设备名称">
          <el-input v-model="searchForm.name" placeholder="请输入设备名称"></el-input>
        </el-form-item>
        <el-form-item label="设备类型">
          <el-select v-model="searchForm.type" placeholder="请选择设备类型">
            <el-option
              v-for="type in store.getters['process/getDeviceTypes']"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.date"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column label="设备图片" width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.imageUrl"
              :src="scope.row.imageUrl"
              fit="cover"
              style="width: 70px; height: 70px"
              :preview-src-list="[scope.row.imageUrl]"
            >
              <template #error>
                <el-icon><Picture /></el-icon>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="设备名称" min-width="150"></el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="scope">
            {{ store.getters['process/getDeviceTypes'].find(t => t.value === scope.row.type)?.label || scope.row.type }}
          </template>
        </el-table-column>
        <el-table-column prop="model" label="型号" width="120"></el-table-column>
        <el-table-column label="工艺参数" min-width="200">
          <template #default="scope">
            <el-tag
              v-for="param in scope.row.parameters"
              :key="param.name"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              <!-- {{ param.name }}: {{ param.value }}{{ param.unit }} -->
              {{ param.name }}:{{ param.unit }}
              <el-tooltip v-if="param.remark" :content="param.remark" placement="top">
                <el-icon class="ml-1"><InfoFilled /></el-icon>
              </el-tooltip>
              <!-- <el-tooltip v-if="param.remark" :content="param.remark" placement="top">
                <el-icon class="ml-1"><InfoFilled /></el-icon>
              </el-tooltip> -->
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="物料消耗" min-width="200">
          <template #default="scope">
            <el-tag
              v-for="material in scope.row.materials"
              :key="material.name"
              type="success"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ material.name }}: {{ material.defaultValue }}{{ material.unit }}
              <el-tooltip v-if="material.remark" :content="material.remark" placement="top">
                <el-icon class="ml-1"><InfoFilled /></el-icon>
              </el-tooltip>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="140"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="140"></el-table-column>
        <el-table-column label="备注" min-width="150">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.remark"
              :content="scope.row.remark"
              placement="top"
              :hide-after="2000"
            >
              <span class="remark-text">{{ scope.row.remark }}</span>
            </el-tooltip>
            <span v-else class="remark-empty">暂无备注</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" :icon="View" @click="handleView(scope.row)">查看</el-button>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 设备统计信息 -->
      <el-card class="stats-card" shadow="never">
        <template #header>
          <div class="stats-header">
            <el-icon><DataAnalysis /></el-icon>
            <span>设备统计</span>
          </div>
        </template>
        <div class="stats-content">
          <div class="stats-item">
            <div class="stats-number">{{ deviceStats.total }}</div>
            <div class="stats-label">设备总数</div>
          </div>
          
          <el-divider direction="vertical" />
          
          <div class="stats-section">
            <div class="stats-section-title">设备类型分布</div>
            <div class="stats-tags">
              <el-tag
                v-for="(count, type) in deviceStats.byType"
                :key="type"
                class="stats-tag"
                size="small"
              >
                {{ type }}: {{ count }}台
              </el-tag>
            </div>
          </div>
          
          <el-divider direction="vertical" />
          
          <div class="stats-section">
            <div class="stats-section-title">设备状态分布</div>
            <div class="stats-tags">
              <el-tag
                v-for="(count, status) in deviceStats.byStatus"
                :key="status"
                :type="status === 'active' ? 'success' : status === 'inactive' ? 'danger' : 'info'"
                class="stats-tag"
                size="small"
              >
                {{ status === 'active' ? '正常' : status === 'inactive' ? '停用' : status }}: {{ count }}台
              </el-tag>
            </div>
          </div>
        </div>
      </el-card>

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
  </div>
</template>

<style scoped>
.process-list {
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

.remark-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #606266;
}

.remark-empty {
  color: #909399;
  font-size: 13px;
}

.stats-card {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
}

.stats-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px 0;
}

.stats-item {
  text-align: center;
  min-width: 80px;
}

.stats-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  line-height: 1;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 12px;
  color: #909399;
}

.stats-section {
  flex: 1;
}

.stats-section-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.stats-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stats-tag {
  font-size: 12px;
}
</style>
