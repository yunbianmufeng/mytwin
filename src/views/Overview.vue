<script setup>
import { onMounted } from 'vue'
import * as echarts from 'echarts'

onMounted(() => {
  // 初始化所有图表
  initCharts()
})

const initCharts = () => {
  // 饼图：物料分布
  const materialPieChart = echarts.init(document.getElementById('materialPie'))
  materialPieChart.setOption({
    title: { text: '物料类型分布' },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [{
      type: 'pie',
      radius: '50%',
      data: [
        { value: 35, name: '光刻胶' },
        { value: 25, name: '超纯水' },
        { value: 20, name: '电镀液' },
        { value: 20, name: '其他' }
      ]
    }]
  })

  // 柱状图：产线使用率
  const productionBarChart = echarts.init(document.getElementById('productionBar'))
  productionBarChart.setOption({
    title: { text: '产线使用率' },
    tooltip: { trigger: 'axis' },
    xAxis: { data: ['产线A', '产线B', '产线C', '产线D'] },
    yAxis: { type: 'value', max: 100 },
    series: [{
      type: 'bar',
      data: [88, 75, 92, 65]
    }]
  })

  // 折线图：月度产量趋势
  const productionLineChart = echarts.init(document.getElementById('productionLine'))
  productionLineChart.setOption({
    title: { text: '月度产量趋势' },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: [150, 180, 220, 270, 320, 350]
    }]
  })

  // 仪表盘：设备健康度
  const healthGauge = echarts.init(document.getElementById('healthGauge'))
  healthGauge.setOption({
    title: { text: '设备健康度' },
    series: [{
      type: 'gauge',
      progress: { show: true },
      detail: { valueAnimation: true, formatter: '{value}%' },
      data: [{ value: 85 }]
    }]
  })

  // 雷达图：工艺指标
  const processRadar = echarts.init(document.getElementById('processRadar'))
  processRadar.setOption({
    title: { text: '工艺指标评分' },
    radar: {
      indicator: [
        { name: '清洗', max: 100 },
        { name: '镀膜', max: 100 },
        { name: '光刻', max: 100 },
        { name: '氧扫', max: 100 },
        { name: '电镀', max: 100 }
      ]
    },
    series: [{
      type: 'radar',
      data: [{
        value: [90, 85, 95, 88, 92],
        name: '当前评分'
      }]
    }]
  })

  // 堆叠面积图：物料消耗趋势
  const materialArea = echarts.init(document.getElementById('materialArea'))
  materialArea.setOption({
    title: { text: '物料消耗趋势' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['光刻胶', '超纯水', '电镀液'] },
    xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五'] },
    yAxis: { type: 'value' },
    series: [
      {
        name: '光刻胶',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        data: [120, 132, 101, 134, 90]
      },
      {
        name: '超纯水',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        data: [220, 182, 191, 234, 290]
      },
      {
        name: '电镀液',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        data: [150, 232, 201, 154, 190]
      }
    ]
  })

  // 监听窗口大小变化，重绘图表
  window.addEventListener('resize', () => {
    materialPieChart.resize()
    productionBarChart.resize()
    productionLineChart.resize()
    healthGauge.resize()
    processRadar.resize()
    materialArea.resize()
  });
}
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <div id="materialPie" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div id="productionBar" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div id="productionLine" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card>
          <div id="healthGauge" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div id="processRadar" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card>
          <div id="materialArea" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.chart {
  height: 300px;
  width: 100%;
}

.el-card {
  margin-bottom: 20px;
}
</style>
