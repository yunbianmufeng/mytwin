&lt;script setup&gt;
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const processData = ref(null)

// 加载工艺详情
const loadProcessDetail = async () => {
  const id = parseInt(route.params.id)
  try {
    processData.value = store.getters['process/getProcessById'](id)
    if (!processData.value) {
      ElMessage.error('未找到工艺设备信息')
      router.push('/process/list')
    }
  } catch (error) {
    ElMessage.error('加载工艺设备信息失败')
    router.push('/process/list')
  }
}

onMounted(() => {
  loadProcessDetail()
})

// 返回列表
const goBack = () => {
  router.push('/process/list')
}
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="process-detail" v-if="processData"&gt;
    &lt;el-card&gt;
      &lt;template #header&gt;
        &lt;div class="card-header"&gt;
          &lt;el-button :icon="ArrowLeft" link @click="goBack"&gt;返回列表&lt;/el-button&gt;
          &lt;span class="title"&gt;工艺设备详情&lt;/span&gt;
        &lt;/div&gt;
      &lt;/template&gt;

      &lt;div class="detail-content"&gt;
        &lt;el-row :gutter="20"&gt;
          &lt;el-col :span="8"&gt;
            &lt;div class="detail-image"&gt;
              &lt;el-image
                v-if="processData.imageUrl"
                :src="processData.imageUrl"
                fit="contain"
                style="width: 100%"
                :preview-src-list="[processData.imageUrl]"
              &gt;
                &lt;template #error&gt;
                  &lt;div class="image-slot"&gt;
                    &lt;el-icon&gt;&lt;Picture /&gt;&lt;/el-icon&gt;
                  &lt;/div&gt;
                &lt;/template&gt;
              &lt;/el-image&gt;
            &lt;/div&gt;
          &lt;/el-col&gt;
          &lt;el-col :span="16"&gt;
            &lt;el-descriptions title="基本信息" :column="2" border&gt;
              &lt;el-descriptions-item label="设备名称"&gt;{{ processData.name }}&lt;/el-descriptions-item&gt;
              &lt;el-descriptions-item label="设备类型"&gt;{{ processData.type }}&lt;/el-descriptions-item&gt;
              &lt;el-descriptions-item label="设备型号"&gt;{{ processData.model }}&lt;/el-descriptions-item&gt;
              &lt;el-descriptions-item label="创建时间"&gt;{{ processData.createTime }}&lt;/el-descriptions-item&gt;
              &lt;el-descriptions-item label="更新时间" :span="2"&gt;{{ processData.updateTime }}&lt;/el-descriptions-item&gt;
              &lt;el-descriptions-item label="备注" :span="2"&gt;{{ processData.remark || '无' }}&lt;/el-descriptions-item&gt;
            &lt;/el-descriptions&gt;
          &lt;/el-col&gt;
        &lt;/el-row&gt;

        &lt;el-divider content-position="left"&gt;工艺参数&lt;/el-divider&gt;
        &lt;el-table :data="processData.parameters" border style="width: 100%"&gt;
          &lt;el-table-column prop="name" label="参数名称" width="180"&gt;&lt;/el-table-column&gt;
          &lt;el-table-column prop="value" label="参数值"&gt;
            &lt;template #default="scope"&gt;
              {{ scope.row.value }}{{ scope.row.unit }}
            &lt;/template&gt;
          &lt;/el-table-column&gt;
          &lt;el-table-column prop="type" label="参数类型" width="180"&gt;&lt;/el-table-column&gt;
        &lt;/el-table&gt;

        &lt;el-divider content-position="left"&gt;物料消耗&lt;/el-divider&gt;
        &lt;el-table :data="processData.materials" border style="width: 100%"&gt;
          &lt;el-table-column prop="name" label="物料名称" width="180"&gt;&lt;/el-table-column&gt;
          &lt;el-table-column prop="consumption" label="单次消耗"&gt;
            &lt;template #default="scope"&gt;
              {{ scope.row.consumption }}{{ scope.row.unit }}
            &lt;/template&gt;
          &lt;/el-table-column&gt;
        &lt;/el-table&gt;
      &lt;/div&gt;

      &lt;div class="detail-actions"&gt;
        &lt;el-button type="primary" @click="router.push(`/process/edit/${processData.id}`)"&gt;编辑&lt;/el-button&gt;
        &lt;el-button @click="goBack"&gt;返回&lt;/el-button&gt;
      &lt;/div&gt;
    &lt;/el-card&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;style scoped&gt;
.process-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  .title {
    margin-left: 20px;
    font-size: 18px;
    font-weight: bold;
  }
}

.detail-content {
  padding: 20px 0;
}

.detail-image {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: #f5f7fa;
}

.el-divider {
  margin: 32px 0 24px;
}

.detail-actions {
  margin-top: 32px;
  text-align: center;
}
&lt;/style&gt;
