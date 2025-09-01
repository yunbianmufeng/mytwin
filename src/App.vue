<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const isCollapse = ref(false)
const router = useRouter()

const handleSelect = (key, keyPath) => {
  console.log(key, keyPath)
}

// 默认展开的子菜单
const defaultOpeneds = ref(['1', '2', '3', '4', '5'])

// 捕获子组件错误
onErrorCaptured((error, instance, info) => {
  console.error('Captured error:', error)
  console.error('Error info:', info)
  // 返回 false 阻止错误继续传播
  return false
})
</script>

<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <el-menu
        default-active="1"
        :default-openeds="defaultOpeneds"
        class="el-menu-vertical"
        :collapse="isCollapse"
        @select="handleSelect"
        router
      >
        <el-menu-item index="/">
          <el-icon><DataLine /></el-icon>
          <template #title>总览</template>
        </el-menu-item>

        <el-sub-menu index="2">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>物料管理</span>
          </template>
          <el-menu-item index="/material/list">物料列表</el-menu-item>
          <el-menu-item index="/material/add">物料添加</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="3">
          <template #title>
            <el-icon><Cpu /></el-icon>
            <span>工艺管理</span>
          </template>
          <el-menu-item index="/production/list">工艺列表</el-menu-item>
          <el-menu-item index="/production/add">工艺添加</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="4">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>设备管理</span>
          </template>
          <el-menu-item index="/process/list">工艺设备</el-menu-item>
          <el-menu-item index="/process/add">设备录入</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="5">
          <template #title>
            <el-icon><House /></el-icon>
            <span>产线模拟</span>
          </template>
          <el-menu-item index="/factory/list">产线列表</el-menu-item>
          <el-menu-item index="/factory/config">产线配置</el-menu-item>
          <el-menu-item index="/factory/other">其他</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header>芯片产线管理系统</el-header>
      <el-main>
        <router-view v-slot="{ Component }">
          <component :is="Component" :key="$route.path" />
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  
  height: 100vh;
  width: 99vw;
}

.el-header {
  background-color: #B3C0D1;
  color: #333;
  line-height: 60px;
  text-align: center;
  font-size: 20px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

.el-main {
  /* width: 100vw; */
  background-color: #E9EEF3;
  color: #333;
  padding: 20px;
}
</style>
