<script setup>
import { ref } from 'vue'

// 其他功能待实现
const message = ref('其他功能开发中...')
</script>

<template>
  <div class="other">
    <el-empty :description="message"></el-empty>
  </div>
</template>

<style scoped>
.other {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
</style>
