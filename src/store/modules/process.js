// 工艺管理模块
export default {
  namespaced: true,

  state: {
    processes: [], // 工艺列表
    deviceTypes: [
      '清洗',
      '镀膜',
      '光刻',
      '氧扫',
      '电镀'
    ]
  },

  mutations: {
    SET_PROCESSES(state, processes) {
      state.processes = processes
    },
    ADD_PROCESS(state, process) {
      state.processes.push(process)
    },
    UPDATE_PROCESS(state, { id, updates }) {
      const index = state.processes.findIndex(p => p.id === id)
      if (index !== -1) {
        state.processes[index] = { ...state.processes[index], ...updates }
      }
    },
    DELETE_PROCESS(state, id) {
      state.processes = state.processes.filter(p => p.id !== id)
    }
  },

  actions: {
    // 获取工艺列表
    async fetchProcesses({ commit }) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockFetchProcesses()
        commit('SET_PROCESSES', response)
      } catch (error) {
        console.error('获取工艺列表失败:', error)
        throw error
      }
    },

    // 添加工艺
    async addProcess({ commit }, process) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockAddProcess(process)
        commit('ADD_PROCESS', response)
        return response
      } catch (error) {
        console.error('添加工艺失败:', error)
        throw error
      }
    },

    // 更新工艺
    async updateProcess({ commit }, { id, updates }) {
      try {
        // TODO: 实际项目中这里应该调用API
        const response = await mockUpdateProcess(id, updates)
        commit('UPDATE_PROCESS', { id, updates: response })
        return response
      } catch (error) {
        console.error('更新工艺失败:', error)
        throw error
      }
    },

    // 删除工艺
    async deleteProcess({ commit }, id) {
      try {
        // TODO: 实际项目中这里应该调用API
        await mockDeleteProcess(id)
        commit('DELETE_PROCESS', id)
      } catch (error) {
        console.error('删除工艺失败:', error)
        throw error
      }
    }
  },

  getters: {
    // 获取工艺列表
    getProcesses: (state) => state.processes,
    
    // 获取设备类型列表
    getDeviceTypes: (state) => state.deviceTypes,
    
    // 根据ID获取工艺
    getProcessById: (state) => (id) => {
      return state.processes.find(p => p.id === id)
    }
  }
}

// 模拟API调用
function mockFetchProcesses() {
  return Promise.resolve([
    {
      id: 1,
      name: 'RCA清洗',
      type: '清洗',
      model: 'RCA-100',
      parameters: {
        time: { label: '清洗时间', type: 'number', unit: 'min', default: 30 },
        temperature: { label: '温度', type: 'number', unit: '℃', default: 25 },
        ratio: { label: '配比', type: 'string', default: '1:1:5' }
      },
      materials: [
        { name: '超纯水', consumption: 10, unit: 'L' },
        { name: '硫酸', consumption: 2, unit: 'L' },
        { name: '过氧化氢', consumption: 2, unit: 'L' }
      ],
      createTime: '2025-07-01',
      updateTime: '2025-08-05',
      remark: '标准RCA清洗工艺'
    }
  ])
}

function mockAddProcess(process) {
  return Promise.resolve({
    ...process,
    id: Date.now(),
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  })
}

function mockUpdateProcess(id, updates) {
  return Promise.resolve({
    ...updates,
    updateTime: new Date().toISOString()
  })
}

function mockDeleteProcess(id) {
  return Promise.resolve()
}
