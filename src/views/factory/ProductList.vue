<script setup>
import { ref, computed } from 'vue'
import * as echarts from 'echarts'
import { onMounted } from 'vue'

// 搜索条件
const searchForm = ref({
  name: '',
  productionLine: '',
  date: []
})

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    name: '',
    productionLine: '',
    date: []
  }
}

// 模拟数据
const tableData = ref([
  {
    id: 1,
    name: '8寸CMOS晶圆',
    description: '标准8寸CMOS工艺制程晶圆',
    productionLine: {
      id: 1,
      name: '标准CMOS工艺产线'
    },
    plannedQuantity: 1000,
    completedQuantity: 800,
    estimatedTime: 72,
    materialConsumption: [
      { name: '光刻胶', amount: 50, unit: 'L' },
      { name: '超纯水', amount: 1000, unit: 'L' },
      { name: '显影液', amount: 30, unit: 'L' }
    ],
    status: 'running',
    startTime: '2025-08-01',
    expectedEndTime: '2025-08-04'
  }
])

// 产线选项
const productionLines = ref([
  { id: 1, name: '标准CMOS工艺产线' },
  { id: 2, name: 'MEMS工艺产线' }
])

// 模拟生产
const simulateProduction = (row) => {
  // TODO: 实现模拟生产逻辑
}

// 状态显示
const statusText = computed(() => ({
  waiting: '等待中',
  running: '生产中',
  completed: '已完成',
  paused: '已暂停'
}))

// 状态类型
const statusType = computed(() => ({
  waiting: 'info',
  running: 'success',
  completed: 'primary',
  paused: 'warning'
}))

// 图表初始化
onMounted(() => {
  initCharts()
})

const initCharts = () => {
  const progressChart = echarts.init(document.getElementById('progressChart'))
  progressChart.setOption({
    title: { text: '生产进度' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['计划产量', '完成产量'] },
    xAxis: { type: 'category', data: ['8寸CMOS晶圆', 'MEMS器件', '存储芯片'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: '计划产量',
        type: 'bar',
        data: [1000, 800, 1200]
      },
      {
        name: '完成产量',
        type: 'bar',
        data: [800, 600, 900]
      }
    ]
  })

  const materialChart = echarts.init(document.getElementById('materialChart'))
  materialChart.setOption({
    title: { text: '物料消耗预测' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '预计消耗量',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 50, name: '光刻胶' },
          { value: 1000, name: '超纯水' },
          { value: 30, name: '显影液' }
        ]
      }
    ]
  })

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    progressChart.resize()
    materialChart.resize()
  })
}
</script>

<template>
  <div class="product-list">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <div id="progressChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div id="materialChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <!-- 搜索区域 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.name" placeholder="请输入产品名称"></el-input>
        </el-form-item>
        <el-form-item label="产线">
          <el-select v-model="searchForm.productionLine" placeholder="请选择产线">
            <el-option
              v-for="line in productionLines"
              :key="line.id"
              :label="line.name"
              :value="line.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
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
        <el-table-column prop="name" label="产品名称" min-width="150"></el-table-column>
        <el-table-column prop="productionLine.name" label="产线" width="180"></el-table-column>
        <el-table-column label="生产数量" width="200">
          <template #default="scope">
            <el-progress
              :percentage="Math.round((scope.row.completedQuantity / scope.row.plannedQuantity) * 100)"
              :format="(percentage) => `${scope.row.completedQuantity}/${scope.row.plannedQuantity}`"
            ></el-progress>
          </template>
        </el-table-column>
        <el-table-column prop="estimatedTime" label="预计用时(h)" width="120"></el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="statusType[scope.row.status]">
              {{ statusText[scope.row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="物料消耗" min-width="250">
          <template #default="scope">
            <el-tag
              v-for="material in scope.row.materialConsumption"
              :key="material.name"
              size="small"
              style="margin-right: 5px; margin-bottom: 5px"
            >
              {{ material.name }}: {{ material.amount }}{{ material.unit }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="140"></el-table-column>
        <el-table-column prop="expectedEndTime" label="预计结束" width="140"></el-table-column>
        <el-table-column fixed="right" label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="simulateProduction(scope.row)">
              模拟生产
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
          :total="1"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.product-list {
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

.el-card {
  margin-bottom: 20px;
}
</style>
