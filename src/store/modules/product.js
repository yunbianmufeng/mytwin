import { db } from '../../utils/indexedDB'

// 确保数据库初始化
const initDatabase = async () => {
  try {
    await db.openDB()
  } catch (error) {
    console.error('初始化数据库失败:', error)
    throw error
  }
}

// 产品配置模块
const state = {
  productConfigs: [], // 存储所有产品配置
  currentConfig: null // 当前正在编辑的配置
}

const mutations = {
  ADD_PRODUCT_CONFIG(state, config) {
    state.productConfigs.push(config)
  },
  UPDATE_PRODUCT_CONFIG(state, config) {
    const index = state.productConfigs.findIndex(item => item.id === config.id)
    if (index > -1) {
      state.productConfigs[index] = config
    }
  },
  DELETE_PRODUCT_CONFIG(state, configId) {
    state.productConfigs = state.productConfigs.filter(config => config.id !== configId)
  },
  SET_PRODUCT_CONFIGS(state, configs) {
    state.productConfigs = configs
  },
  SET_CURRENT_CONFIG(state, config) {
    state.currentConfig = config
  }
}

const actions = {
  // 添加产品配置
  async addProductConfig({ commit }, config) {
    try {
      // 确保数据库已初始化
      await initDatabase()
      
      const newConfig = {
        ...config,
        id: Date.now().toString(), // 生成唯一ID
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      // 保存到 IndexedDB
      await db.put('productConfigs', newConfig)
      commit('ADD_PRODUCT_CONFIG', newConfig)
      return newConfig
    } catch (error) {
      console.error('保存产品配置失败:', error)
      throw error
    }
  },
  
  // 更新产品配置
  async updateProductConfig({ commit }, config) {
    try {
      // 确保数据库已初始化
      await initDatabase()
      
      const updatedConfig = {
        ...config,
        updateTime: new Date().toISOString()
      }
      // 更新到 IndexedDB
      await db.put('productConfigs', updatedConfig)
      commit('UPDATE_PRODUCT_CONFIG', updatedConfig)
      return updatedConfig
    } catch (error) {
      console.error('更新产品配置失败:', error)
      throw error
    }
  },

  // 获取所有产品配置
  async getProductConfigs({ commit }) {
    try {
      // 确保数据库已初始化
      await initDatabase()
      
      // 从 IndexedDB 获取所有配置
      const configs = await db.getAll('productConfigs')
      commit('SET_PRODUCT_CONFIGS', configs)
      return configs
    } catch (error) {
      console.error('获取产品配置失败:', error)
      throw error
    }
  },

  // 删除产品配置
  async deleteProductConfig({ commit }, configId) {
    try {
      // 确保数据库已初始化
      await initDatabase()
      
      // 从 IndexedDB 删除
      await db.delete('productConfigs', configId)
      commit('DELETE_PRODUCT_CONFIG', configId)
      return true
    } catch (error) {
      console.error('删除产品配置失败:', error)
      throw error
    }
  }
}

const getters = {
  // 获取所有产品配置
  getProductConfigs: state => state.productConfigs,
  
  // 通过ID获取特定产品配置
  getProductConfigById: state => id => {
    return state.productConfigs.find(config => config.id === id)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
