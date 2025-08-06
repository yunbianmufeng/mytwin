// 模拟工厂模块
export default {
  namespaced: true,

  state: {
    products: [], // 产品列表
    simulations: [] // 模拟记录
  },

  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products
    },
    ADD_PRODUCT(state, product) {
      state.products.push(product)
    },
    UPDATE_PRODUCT(state, { id, updates }) {
      const index = state.products.findIndex(p => p.id === id)
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updates }
      }
    },
    DELETE_PRODUCT(state, id) {
      state.products = state.products.filter(p => p.id !== id)
    },
    ADD_SIMULATION(state, simulation) {
      state.simulations.push(simulation)
    }
  },

  actions: {
    // 获取产品列表
    async fetchProducts({ commit }) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockFetchProducts()
        commit('SET_PRODUCTS', response)
      } catch (error) {
        console.error('获取产品列表失败:', error)
        throw error
      }
    },

    // 添加产品
    async addProduct({ commit }, product) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockAddProduct(product)
        commit('ADD_PRODUCT', response)
        return response
      } catch (error) {
        console.error('添加产品失败:', error)
        throw error
      }
    },

    // 更新产品
    async updateProduct({ commit }, { id, updates }) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockUpdateProduct(id, updates)
        commit('UPDATE_PRODUCT', { id, updates: response })
        return response
      } catch (error) {
        console.error('更新产品失败:', error)
        throw error
      }
    },

    // 删除产品
    async deleteProduct({ commit }, id) {
      try {
        // TODO: 实际项目中这里应该调用API
        await mockDeleteProduct(id)
        commit('DELETE_PRODUCT', id)
      } catch (error) {
        console.error('删除产品失败:', error)
        throw error
      }
    },

    // 执行生产模拟
    async simulateProduction({ commit }, { productionLineId, quantity }) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockSimulateProduction(productionLineId, quantity)
        commit('ADD_SIMULATION', response)
        return response
      } catch (error) {
        console.error('生产模拟失败:', error)
        throw error
      }
    }
  },

  getters: {
    // 获取产品列表
    getProducts: (state) => state.products,
    
    // 获取模拟记录
    getSimulations: (state) => state.simulations,
    
    // 根据ID获取产品
    getProductById: (state) => (id) => {
      return state.products.find(p => p.id === id)
    }
  }
}

// 模拟API调用
function mockFetchProducts() {
  return Promise.resolve([
    {
      id: 1,
      name: '8寸CMOS晶圆',
      description: '标准8寸CMOS工艺制程晶圆',
      productionLine: {
        id: 1,
        name: '标准CMOS工艺产线'
      },
      plannedQuantity: 1000,
      estimatedTime: 72,
      materialConsumption: [
        { name: '光刻胶', amount: 50, unit: 'L' },
        { name: '超纯水', amount: 1000, unit: 'L' },
        { name: '显影液', amount: 30, unit: 'L' }
      ],
      createTime: '2025-07-01',
      updateTime: '2025-08-05'
    }
  ])
}

function mockAddProduct(product) {
  return Promise.resolve({
    ...product,
    id: Date.now(),
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  })
}

function mockUpdateProduct(id, updates) {
  return Promise.resolve({
    ...updates,
    updateTime: new Date().toISOString()
  })
}

function mockDeleteProduct(id) {
  return Promise.resolve()
}

function mockSimulateProduction(productionLineId, quantity) {
  // 模拟计算生产数据
  return Promise.resolve({
    id: Date.now(),
    productionLineId,
    quantity,
    estimatedTime: quantity * 0.5, // 假设每件产品需要0.5小时
    materialConsumption: [
      { name: '光刻胶', amount: quantity * 0.05, unit: 'L' },
      { name: '超纯水', amount: quantity * 1, unit: 'L' },
      { name: '显影液', amount: quantity * 0.03, unit: 'L' }
    ],
    simulationTime: new Date().toISOString()
  })
}
