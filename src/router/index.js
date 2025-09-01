import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Overview',
    component: () => import('../views/Overview.vue')
  },
  {
    path: '/material',
    name: 'Material',
    component: () => import('../views/material/MaterialLayout.vue'),
    children: [
      {
        path: 'list',
        name: 'MaterialList',
        component: () => import('../views/material/MaterialList.vue')
      },
      {
        path: 'add',
        name: 'MaterialAdd',
        component: () => import('../views/material/MaterialAdd.vue')
      }
    ]
  },
  {
    path: '/production',
    name: 'Production',
    component: () => import('../views/production/ProductionLayout.vue'),
    children: [
      {
        path: 'list',
        name: 'ProductionList',
        component: () => import('../views/production/ProductionList.vue')
      },
      {
        path: 'add',
        name: 'ProductionAdd',
        component: () => import('../views/production/ProductionAdd.vue')
      },
      {
        path: 'edit/:id',
        name: 'ProductionEdit',
        component: () => import('../views/production/ProductionAdd.vue')
      }
    ]
  },
  {
    path: '/process',
    name: 'Process',
    component: () => import('../views/process/ProcessLayout.vue'),
    children: [
      {
        path: 'list',
        name: 'ProcessList',
        component: () => import('../views/process/ProcessList.vue')
      },
      {
        path: 'add',
        name: 'ProcessAdd',
        component: () => import('../views/process/ProcessAdd.vue')
      },
      {
        path: 'detail/:id',
        name: 'ProcessDetail',
        component: () => import('../views/process/ProcessDetail.vue')
      },
      {
        path: 'edit/:id',
        name: 'ProcessEdit',
        component: () => import('../views/process/ProcessAdd.vue')
      }
    ]
  },
  {
    path: '/factory',
    name: 'Factory',
    component: () => import('../views/factory/FactoryLayout.vue'),
    children: [
      {
        path: 'list',
        name: 'ProductList',
        component: () => import('../views/factory/ProductList.vue')
      },
      {
        path: 'config',
        name: 'ProductConfig',
        component: () => import('../views/factory/ProductConfig.vue')
      },
      {
        path: 'config/:id',
        name: 'ProductConfigEdit',
        component: () => import('../views/factory/ProductConfig.vue')
      },
      {
        path: 'simulation',
        name: 'Simulation',
        component: () => import('../views/factory/Simulation.vue')
      },
      {
        path: 'other',
        name: 'Other',
        component: () => import('../views/factory/Other.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
