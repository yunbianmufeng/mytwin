import { createStore } from 'vuex'

// 导入各个模块
import material from './modules/material'
import production from './modules/production'
import process from './modules/process'
import factory from './modules/factory'

export default createStore({
  modules: {
    material,
    production,
    process,
    factory
  }
})
