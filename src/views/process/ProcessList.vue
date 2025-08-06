<script setup>
import { ref } from 'vue'

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

// 模拟工艺设备数据
const tableData = ref([
  {
    id: 1,
    name: 'RCA清洗机',
    type: '清洗',
    model: 'RCA-100',
    parameters: [
      { name: '清洗时间', value: '30', unit: 'min' },
      { name: '温度', value: '25', unit: '℃' },
      { name: '配比', value: '1:1:5', unit: '' }
    ],
    materials: [
      { name: '超纯水', consumption: 10, unit: 'L' },
      { name: '硫酸', consumption: 2, unit: 'L' },
      { name: '过氧化氢', consumption: 2, unit: 'L' }
    ],
    createTime: '2025-07-01',
    updateTime: '2025-08-05'
  },
  {
    id: 2,
    name: '步进式光刻机',
    type: '光刻',
    model: 'ST-200',
    parameters: [
      { name: '曝光时间', value: '45', unit: 's' },
      { name: '功率', value: '500', unit: 'W' },
      { name: '对准精度', value: '±0.1', unit: 'μm' }
    ],
    materials: [
      { name: '光刻胶', consumption: 0.1, unit: 'L' },
      { name: '显影液', consumption: 0.2, unit: 'L' }
    ],
    createTime: '2025-07-15',
    updateTime: '2025-08-06'
  }
])

// 删除工艺
const handleDelete = (index, row) => {
  tableData.value.splice(index, 1)
  ElMessage({
    type: 'success',
    message: '删除成功'
  })
}

// 查看详情
const handleView = (row) => {
  // TODO: 实现查看详情的逻辑
}
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
            <el-option label="清洗" value="清洗"></el-option>
            <el-option label="镀膜" value="镀膜"></el-option>
            <el-option label="光刻" value="光刻"></el-option>
            <el-option label="氧扫" value="氧扫"></el-option>
            <el-option label="电镀" value="电镀"></el-option>
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
          <el-button type="primary" :icon="Search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="name" label="设备名称" min-width="150"></el-table-column>
        <el-table-column prop="type" label="类型" width="100"></el-table-column>
        <el-table-column prop="model" label="型号" width="120"></el-table-column>
        <el-table-column label="工艺参数" min-width="200">
          <template #default="scope">
            <el-tag
              v-for="param in scope.row.parameters"
              :key="param.name"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ param.name }}: {{ param.value }}{{ param.unit }}
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
              {{ material.name }}: {{ material.consumption }}{{ material.unit }}/次
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="140"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="140"></el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
            <el-button link type="primary" :icon="Edit" @click="$router.push('/process/edit/' + scope.row.id)">
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
</style>
