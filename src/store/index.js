import { createStore } from 'vuex'

// 导入各个模块
import material from './modules/material'
import production from './modules/production'
import process from './modules/process'
import factory from './modules/factory'
import product from './modules/product'

export default createStore({
  modules: {
    material,
    production,
    process,
    factory,
    product
  }
})
