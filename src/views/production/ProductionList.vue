<script setup>
import { ref } from 'vue'

// 模拟数据
const tableData = ref([
  {
    id: 1,
    name: '标准CMOS工艺产线',
    description: '用于生产CMOS集成电路',
    steps: [
      { name: '清洗', device: 'RCA清洗机', time: 30 },
      { name: '氧化', device: '氧化炉', time: 60 },
      { name: '光刻', device: '光刻机', time: 45 }
    ],
    createTime: '2025-07-01',
    updateTime: '2025-08-05',
    remark: '日产能：100片'
  },
  {
    id: 2,
    name: 'MEMS工艺产线',
    description: '用于生产MEMS器件',
    steps: [
      { name: '清洗', device: '超声波清洗机', time: 25 },
      { name: '刻蚀', device: '深硅刻蚀机', time: 90 },
      { name: '键合', device: '晶圆键合机', time: 60 }
    ],
    createTime: '2025-07-15',
    updateTime: '2025-08-06',
    remark: '日产能：50片'
  }
])

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
const handleDelete = (index, row) => {
  tableData.value.splice(index, 1)
  ElMessage({
    type: 'success',
    message: '删除成功'
  })
}

// 查看工艺步骤
const handleViewSteps = (row) => {
  // TODO: 实现查看工艺步骤的逻辑
}
</script>

<template>
  <div class="production-list">
    <el-card>
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产线名称">
          <el-input v-model="searchForm.name" placeholder="请输入产线名称"></el-input>
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
        <el-table-column prop="name" label="产线名称" min-width="150"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="200"></el-table-column>
        <el-table-column label="工艺步骤" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="handleViewSteps(scope.row)">
              查看步骤 ({{ scope.row.steps.length }})
            </el-button>
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
</style>
