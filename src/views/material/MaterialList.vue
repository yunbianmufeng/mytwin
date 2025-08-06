<script setup>
import { ref } from 'vue'

// 模拟数据
const tableData = ref([
  {
    id: 1,
    name: '正性光刻胶',
    type: '光刻胶',
    model: 'AZ5214E',
    totalAmount: 1000,
    remainingAmount: 800,
    unit: 'L',
    lastPurchaseDate: '2025-07-20',
    lastUsageDate: '2025-08-05',
    remark: '用于光刻工艺'
  },
  {
    id: 2,
    name: '超纯水',
    type: '清洗剂',
    model: 'UP-H2O',
    totalAmount: 5000,
    remainingAmount: 3500,
    unit: 'L',
    lastPurchaseDate: '2025-08-01',
    lastUsageDate: '2025-08-06',
    remark: '用于晶圆清洗'
  },
  {
    id: 3,
    name: '电镀液',
    type: '电镀材料',
    model: 'CU-100',
    totalAmount: 500,
    remainingAmount: 350,
    unit: 'L',
    lastPurchaseDate: '2025-07-15',
    lastUsageDate: '2025-08-04',
    remark: '用于铜互连层电镀'
  }
])

// 搜索条件
const searchForm = ref({
  name: '',
  type: '',
  model: ''
})

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    name: '',
    type: '',
    model: ''
  }
}

// 删除物料
const handleDelete = (index, row) => {
  tableData.value.splice(index, 1)
  ElMessage({
    type: 'success',
    message: '删除成功'
  })
}
</script>

<template>
  <div class="material-list">
    <el-card>
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="物料名称">
          <el-input v-model="searchForm.name" placeholder="请输入物料名称"></el-input>
        </el-form-item>
        <el-form-item label="物料类型">
          <el-input v-model="searchForm.type" placeholder="请输入物料类型"></el-input>
        </el-form-item>
        <el-form-item label="型号">
          <el-input v-model="searchForm.model" placeholder="请输入型号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格区域 -->
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column prop="name" label="名称" min-width="120"></el-table-column>
        <el-table-column prop="type" label="种类" width="100"></el-table-column>
        <el-table-column prop="model" label="型号" width="120"></el-table-column>
        <el-table-column prop="totalAmount" label="总量" width="100">
          <template #default="scope">
            {{ scope.row.totalAmount + ' ' + scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="remainingAmount" label="余量" width="100">
          <template #default="scope">
            {{ scope.row.remainingAmount + ' ' + scope.row.unit }}
          </template>
        </el-table-column>
        <el-table-column prop="lastPurchaseDate" label="上次采购时间" width="140"></el-table-column>
        <el-table-column prop="lastUsageDate" label="最后使用时间" width="140"></el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150"></el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button link type="primary" :icon="Edit" @click="$router.push('/material/edit/' + scope.row.id)">
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
          :total="3"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.material-list {
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
