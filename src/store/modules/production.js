// 产线管理模块
export default {
  namespaced: true,

  state: {
    productions: [], // 产线列表
    processes: [
      {
        id: 1,
        name: '清洗',
        devices: [
          { 
            id: 101, 
            name: 'RCA清洗机',
            parameters: {
              time: { label: '清洗时间(min)', default: '30' },
              temperature: { label: '温度(℃)', default: '25' },
              concentration: { label: '配比(H2SO4:H2O2:H2O)', default: '1:1:5' }
            }
          },
          { 
            id: 102,
            name: '超声波清洗机',
            parameters: {
              time: { label: '清洗时间(min)', default: '20' },
              power: { label: '功率(W)', default: '800' }
            }
          }
        ]
      },
      {
        id: 2,
        name: '光刻',
        devices: [
          {
            id: 201,
            name: '步进式光刻机',
            parameters: {
              time: { label: '曝光时间(s)', default: '45' },
              power: { label: '功率(W)', default: '500' },
              alignment: { label: '对准精度', default: '±0.1μm' }
            }
          }
        ]
      },
      {
        id: 3,
        name: '氧化',
        devices: [
          {
            id: 301,
            name: '氧化炉',
            parameters: {
              time: { label: '氧化时间(min)', default: '60' },
              temperature: { label: '温度(℃)', default: '1000' },
              pressure: { label: '压力', default: '1atm' }
            }
          }
        ]
      }
    ]
  },

  mutations: {
    SET_PRODUCTIONS(state, productions) {
      state.productions = productions
    },
    ADD_PRODUCTION(state, production) {
      state.productions.push(production)
    },
    UPDATE_PRODUCTION(state, { id, updates }) {
      const index = state.productions.findIndex(p => p.id === id)
      if (index !== -1) {
        state.productions[index] = { ...state.productions[index], ...updates }
      }
    },
    DELETE_PRODUCTION(state, id) {
      state.productions = state.productions.filter(p => p.id !== id)
    }
  },

  actions: {
    // 获取产线列表
    async fetchProductions({ commit }) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockFetchProductions()
        commit('SET_PRODUCTIONS', response)
      } catch (error) {
        console.error('获取产线列表失败:', error)
        throw error
      }
    },

    // 添加产线
    async addProduction({ commit }, production) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockAddProduction(production)
        commit('ADD_PRODUCTION', response)
        return response
      } catch (error) {
        console.error('添加产线失败:', error)
        throw error
      }
    },

    // 更新产线
    async updateProduction({ commit }, { id, updates }) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockUpdateProduction(id, updates)
        commit('UPDATE_PRODUCTION', { id, updates: response })
        return response
      } catch (error) {
        console.error('更新产线失败:', error)
        throw error
      }
    },

    // 删除产线
    async deleteProduction({ commit }, id) {
      try {
        // TODO: 实际项目中这里应该调用API
        await mockDeleteProduction(id)
        commit('DELETE_PRODUCTION', id)
      } catch (error) {
        console.error('删除产线失败:', error)
        throw error
      }
    }
  },

  getters: {
    // 获取产线列表
    getProductions: (state) => state.productions,
    
    // 获取工艺和设备选项
    getProcesses: (state) => state.processes,
    
    // 根据ID获取产线
    getProductionById: (state) => (id) => {
      return state.productions.find(p => p.id === id)
    },

    // 根据工艺ID获取设备列表
    getDevicesByProcessId: (state) => (processId) => {
      const process = state.processes.find(p => p.id === processId)
      return process ? process.devices : []
    }
  }
}

// 模拟API调用
function mockFetchProductions() {
  return Promise.resolve([
    {
      id: 1,
      name: '标准CMOS工艺产线',
      description: '用于生产CMOS集成电路',
      steps: [
        { 
          processId: 1,
          processName: '清洗',
          deviceId: 101,
          deviceName: 'RCA清洗机',
          parameters: {
            time: '30',
            temperature: '25',
            concentration: '1:1:5'
          }
        },
        {
          processId: 2,
          processName: '光刻',
          deviceId: 201,
          deviceName: '步进式光刻机',
          parameters: {
            time: '45',
            power: '500',
            alignment: '±0.1μm'
          }
        }
      ],
      createTime: '2025-07-01',
      updateTime: '2025-08-05',
      remark: '日产能：100片'
    }
  ])
}

function mockAddProduction(production) {
  return Promise.resolve({
    ...production,
    id: Date.now(),
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  })
}

function mockUpdateProduction(id, updates) {
  return Promise.resolve({
    ...updates,
    updateTime: new Date().toISOString()
  })
}

function mockDeleteProduction(id) {
  return Promise.resolve()
}
