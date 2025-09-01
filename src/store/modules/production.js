import { db } from "../../utils/indexedDB";

// 产线管理模块
export default {
  namespaced: true,

  state: {
    productions: [], // 产线列表，改为从IndexedDB加载
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
      state.productions = productions;
    },
    ADD_PRODUCTION(state, production) {
      state.productions.push(production);
    },
    UPDATE_PRODUCTION(state, { id, updates }) {
      const index = state.productions.findIndex(p => p.id === id);
      if (index !== -1) {
        state.productions[index] = { ...state.productions[index], ...updates };
      }
    },
    DELETE_PRODUCTION(state, id) {
      state.productions = state.productions.filter(p => p.id !== id);
    }
  },

  actions: {
    // 获取产线列表
    async fetchProductions({ commit }) {
      try {
        const productions = await db.getAll("productions");
        commit("SET_PRODUCTIONS", productions);
        return productions;
      } catch (error) {
        console.error('获取产线列表失败:', error);
        throw error;
      }
    },

    // 获取产线列表 (别名)
    async getProductions({ dispatch }) {
      try {
        return await dispatch("fetchProductions");
      } catch (error) {
        console.error('获取产线列表失败:', error);
        throw error;
      }
    },

    // 添加产线
    async addProduction({ commit, dispatch }, production) {
      try {
        const response = await dispatch("mockAddProduction", production);
        // 转换为普通对象，确保可以序列化到IndexedDB
        const plainResponse = JSON.parse(JSON.stringify(response));
        await db.put("productions", plainResponse);
        commit("ADD_PRODUCTION", plainResponse);
        return plainResponse;
      } catch (error) {
        console.error('添加产线失败:', error);
        throw error;
      }
    },

    // 更新产线
    async updateProduction({ commit, dispatch }, { id, updates }) {
      try {
        const response = await dispatch("mockUpdateProduction", { id, updates });
        // 转换为普通对象
        const plainUpdates = JSON.parse(JSON.stringify(response));
        const updatedProduction = { id, ...plainUpdates };
        await db.put("productions", updatedProduction);
        commit("UPDATE_PRODUCTION", { id, updates: plainUpdates });
        return plainUpdates;
      } catch (error) {
        console.error('更新产线失败:', error);
        throw error;
      }
    },

    // 删除产线
    async deleteProduction({ commit, dispatch }, id) {
      try {
        await dispatch("mockDeleteProduction", id);
        await db.delete("productions", id);
        commit("DELETE_PRODUCTION", id);
      } catch (error) {
        console.error('删除产线失败:', error);
        throw error;
      }
    },

    // 模拟API调用 - 添加产线
    async mockAddProduction(_, production) {
      const now = new Date().toISOString().split("T")[0];
      return Promise.resolve({
        ...production,
        id: Date.now(), // 保持ID为数字类型
        createTime: now,
        updateTime: now,
      });
    },

    // 模拟API调用 - 更新产线
    async mockUpdateProduction(_, { id, updates }) {
      const now = new Date().toISOString().split("T")[0];
      return Promise.resolve({
        ...updates,
        updateTime: now,
      });
    },

    // 模拟API调用 - 删除产线
    async mockDeleteProduction() {
      return Promise.resolve();
    }
  },

  getters: {
    // 获取产线列表
    getProductions: (state) => state.productions,
    
    // 获取工艺和设备选项
    getProcesses: (state) => state.processes,
    
    // 根据ID获取产线
    getProductionById: (state) => (id) => {
      // 兼容字符串和数字类型的ID
      const numId = typeof id === 'string' ? parseInt(id) : id;
      const strId = typeof id === 'number' ? id.toString() : id;
      return state.productions.find(p => 
        p.id === id || 
        p.id === numId || 
        p.id === strId ||
        p.id == id
      );
    },

    // 根据工艺ID获取设备列表
    getDevicesByProcessId: (state) => (processId) => {
      const process = state.processes.find(p => p.id === processId)
      return process ? process.devices : []
    }
  }
}
