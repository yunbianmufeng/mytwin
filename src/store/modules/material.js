// 物料管理模块
export default {
  namespaced: true,

  state: {
    materials: [], // 物料列表
    materialTypes: [
      '光刻胶',
      '清洗剂',
      '电镀材料',
      '其他'
    ],
    units: [
      { value: 'L', label: '升(L)' },
      { value: 'kg', label: '千克(kg)' },
      { value: 'g', label: '克(g)' },
      { value: 'mL', label: '毫升(mL)' }
    ]
  },

  mutations: {
    SET_MATERIALS(state, materials) {
      state.materials = materials
    },
    ADD_MATERIAL(state, material) {
      state.materials.push(material)
    },
    UPDATE_MATERIAL(state, { id, updates }) {
      const index = state.materials.findIndex(m => m.id === id)
      if (index !== -1) {
        state.materials[index] = { ...state.materials[index], ...updates }
      }
    },
    DELETE_MATERIAL(state, id) {
      state.materials = state.materials.filter(m => m.id !== id)
    }
  },

  actions: {
    // 获取物料列表
    async fetchMaterials({ commit }) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockFetchMaterials()
        commit('SET_MATERIALS', response)
      } catch (error) {
        console.error('获取物料列表失败:', error)
        throw error
      }
    },

    // 添加物料
    async addMaterial({ commit }, material) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockAddMaterial(material)
        commit('ADD_MATERIAL', response)
        return response
      } catch (error) {
        console.error('添加物料失败:', error)
        throw error
      }
    },

    // 更新物料
    async updateMaterial({ commit }, { id, updates }) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockUpdateMaterial(id, updates)
        commit('UPDATE_MATERIAL', { id, updates: response })
        return response
      } catch (error) {
        console.error('更新物料失败:', error)
        throw error
      }
    },

    // 删除物料
    async deleteMaterial({ commit }, id) {
      try {
        // TODO: 实际项目中这里应该调用API
        await mockDeleteMaterial(id)
        commit('DELETE_MATERIAL', id)
      } catch (error) {
        console.error('删除物料失败:', error)
        throw error
      }
    }
  },

  getters: {
    // 获取物料列表
    getMaterials: (state) => state.materials,
    
    // 获取物料类型列表
    getMaterialTypes: (state) => state.materialTypes,
    
    // 获取单位列表
    getUnits: (state) => state.units,
    
    // 根据ID获取物料
    getMaterialById: (state) => (id) => {
      return state.materials.find(m => m.id === id)
    }
  }
}

// 模拟API调用
function mockFetchMaterials() {
  return Promise.resolve([
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
    }
  ])
}

function mockAddMaterial(material) {
  return Promise.resolve({
    ...material,
    id: Date.now(),
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  })
}

function mockUpdateMaterial(id, updates) {
  return Promise.resolve({
    ...updates,
    updateTime: new Date().toISOString()
  })
}

function mockDeleteMaterial(id) {
  return Promise.resolve()
}
