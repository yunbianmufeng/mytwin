// 数据初始化脚本
import { db } from './indexedDB.js'

// 初始化工艺数据 - 按照工艺管理模块的数据格式
const initProcesses = async () => {
  const processes = [
    {
      id: 'process-001',
      name: '晶圆清洗工艺',
      description: '8英寸晶圆表面清洗处理工艺',
      deviceType: '清洗',
      category: 'Wet Process',
      parameters: [
        { name: '时间', value: '10分钟', unit: 'min' },
        { name: '温度', value: '60', unit: '°C' },
        { name: '热水洗次数', value: '3', unit: '次' },
        { name: '冷水洗次数', value: '2', unit: '次' }
      ],
      equipment: [
        { name: '清洗机台', model: 'CW-2000', status: 'normal' },
        { name: '超纯水系统', model: 'UPW-500', status: 'normal' }
      ],
      materials: [
        { name: '超纯水', amount: 50, unit: 'L', cost: 5.0 },
        { name: '清洗剂', amount: 0.5, unit: 'L', cost: 25.0 }
      ],
      quality: {
        standard: '无颗粒污染',
        testMethod: 'KLA检测',
        acceptance: '0颗粒/cm²'
      },
      status: 'active',
      createTime: '2024-12-01',
      updateTime: '2024-12-15'
    },
    {
      id: 'process-002',
      name: '光刻工艺',
      description: '精密光刻图形转移工艺',
      deviceType: '光刻',
      category: 'Lithography',
      parameters: [
        { name: '光刻胶种类', value: 'PR-2000', unit: '' },
        { name: '匀胶温度', value: '23', unit: '°C' },
        { name: '匀胶转速', value: '3000', unit: 'rpm' },
        { name: '曝光时间', value: '15', unit: 's' },
        { name: '曝光间隔', value: '2', unit: 's' },
        { name: '循环次数', value: '1', unit: '次' },
        { name: '显影液种类', value: 'DEV-100', unit: '' }
      ],
      equipment: [
        { name: '光刻机', model: 'ASML-1000', status: 'normal' },
        { name: '显影机', model: 'DEV-500', status: 'normal' }
      ],
      materials: [
        { name: '光刻胶', amount: 10, unit: 'mL', cost: 150.0 },
        { name: '显影液', amount: 20, unit: 'mL', cost: 80.0 },
        { name: '去胶液', amount: 15, unit: 'mL', cost: 60.0 }
      ],
      quality: {
        standard: '线宽精度±0.1μm',
        testMethod: 'SEM测量',
        acceptance: '线宽误差<0.1μm'
      },
      status: 'active',
      createTime: '2024-11-20',
      updateTime: '2024-12-10'
    },
    {
      id: 'process-003',
      name: '薄膜沉积工艺',
      description: '磁控溅射薄膜沉积工艺',
      deviceType: '磁控',
      category: 'Thin Film',
      parameters: [
        { name: '时间', value: '30', unit: 'min' },
        { name: '功率', value: '1000', unit: 'W' },
        { name: '气压', value: '5e-3', unit: 'Torr' },
        { name: '温度', value: '150', unit: '°C' }
      ],
      equipment: [
        { name: '磁控溅射台', model: 'PVD-800', status: 'normal' },
        { name: '真空泵系统', model: 'VP-2000', status: 'normal' }
      ],
      materials: [
        { name: '靶材(铝)', amount: 0.1, unit: 'kg', cost: 200.0 },
        { name: '氩气', amount: 5, unit: 'L', cost: 15.0 },
        { name: '真空泵油', amount: 0.05, unit: 'L', cost: 30.0 }
      ],
      quality: {
        standard: '膜厚均匀性±5%',
        testMethod: '四探针测量',
        acceptance: '电阻率<2.8μΩ·cm'
      },
      status: 'active',
      createTime: '2024-10-15',
      updateTime: '2024-12-05'
    },
    {
      id: 'process-004',
      name: '等离子刻蚀工艺',
      description: '干法等离子刻蚀工艺',
      deviceType: '干燥',
      category: 'Etch',
      parameters: [
        { name: '时间', value: '20', unit: 'min' },
        { name: '温度', value: '25', unit: '°C' },
        { name: '射频功率', value: '800', unit: 'W' },
        { name: '气体流量', value: '100', unit: 'sccm' }
      ],
      equipment: [
        { name: '等离子刻蚀机', model: 'RIE-600', status: 'normal' },
        { name: '匹配器', model: 'RF-Match', status: 'normal' }
      ],
      materials: [
        { name: 'CF4气体', amount: 2, unit: 'L', cost: 45.0 },
        { name: 'O2气体', amount: 1, unit: 'L', cost: 10.0 },
        { name: '石英环', amount: 1, unit: '个', cost: 120.0 }
      ],
      quality: {
        standard: '刻蚀速率50nm/min',
        testMethod: '台阶仪测量',
        acceptance: '刻蚀深度误差<±10%'
      },
      status: 'active',
      createTime: '2024-09-10',
      updateTime: '2024-11-30'
    },
    {
      id: 'process-005',
      name: '热处理工艺',
      description: '高温退火热处理工艺',
      deviceType: '热稳定',
      category: 'Thermal',
      parameters: [
        { name: '时间', value: '60', unit: 'min' },
        { name: '温度', value: '400', unit: '°C' },
        { name: '升温速率', value: '5', unit: '°C/min' },
        { name: '气氛', value: 'N2', unit: '' }
      ],
      equipment: [
        { name: '管式炉', model: 'TUBE-1200', status: 'normal' },
        { name: '温控系统', model: 'TC-500', status: 'normal' }
      ],
      materials: [
        { name: '氮气', amount: 10, unit: 'L', cost: 8.0 },
        { name: '石英舟', amount: 1, unit: '个', cost: 80.0 }
      ],
      quality: {
        standard: '温度均匀性±2°C',
        testMethod: '热电偶测量',
        acceptance: '退火效果合格'
      },
      status: 'active',
      createTime: '2024-08-25',
      updateTime: '2024-11-25'
    }
  ]

  try {
    await db.openDB()
    for (const process of processes) {
      await db.put('processes', process)
      console.log(`工艺 ${process.name} 初始化成功`)
    }
  } catch (error) {
    console.error('工艺数据初始化失败:', error)
  }
}

// 初始化产品数据
const initProducts = async () => {
  const products = [
    {
      id: 'product-001',
      name: '精密轴承',
      model: 'PB-6205',
      description: '高精度深沟球轴承，适用于精密机械',
      specifications: {
        innerDiameter: '25mm',
        outerDiameter: '52mm',
        width: '15mm',
        precision: 'P5',
        material: '铬钢GCr15'
      },
      price: 125.50,
      cost: 85.30,
      category: '精密机械',
      status: 'active',
      stock: 500,
      minStock: 50,
      createTime: '2024-11-01T08:00:00.000Z',
      updateTime: '2024-12-15T10:00:00.000Z'
    },
    {
      id: 'product-002',
      name: '智能控制器',
      model: 'SC-2024A',
      description: '工业级智能控制器，支持多种通信协议',
      specifications: {
        processor: 'ARM Cortex-A7',
        memory: '1GB RAM + 8GB Flash',
        interfaces: 'RS485, Ethernet, CAN',
        workingTemp: '-20°C ~ +70°C',
        protection: 'IP65'
      },
      price: 850.00,
      cost: 520.00,
      category: '电子设备',
      status: 'active',
      stock: 200,
      minStock: 20,
      createTime: '2024-10-15T09:00:00.000Z',
      updateTime: '2024-12-12T15:30:00.000Z'
    },
    {
      id: 'product-003',
      name: '特种涂料',
      model: 'TC-100',
      description: '高性能防腐涂料，适用于恶劣环境',
      specifications: {
        type: '环氧树脂涂料',
        color: '灰色',
        dryTime: '4小时',
        coverage: '8-10㎡/L',
        shelfLife: '12个月'
      },
      price: 180.00,
      cost: 110.00,
      category: '化工材料',
      status: 'active',
      stock: 150,
      minStock: 30,
      createTime: '2024-09-20T07:30:00.000Z',
      updateTime: '2024-12-10T14:20:00.000Z'
    }
  ]

  try {
    await db.openDB()
    for (const product of products) {
      await db.put('products', product)
      console.log(`产品 ${product.name} 初始化成功`)
    }
  } catch (error) {
    console.error('产品数据初始化失败:', error)
  }
}

// 初始化产线配置数据
const initProductConfigs = async () => {
  const configs = [
    {
      id: 'config-001',
      productName: '精密轴承生产线A',
      productModel: 'PB-6205',
      plannedQuantity: 1000,
      completedQuantity: 650,
      startNumber: 1,
      currentNumber: 651,
      startDate: '2024-12-01T08:00:00.000Z',
      expectedEndDate: '2024-12-25T18:00:00.000Z',
      priority: 'high',
      status: 'running',
      processId: 'process-001',
      remarks: '优先生产订单，质量要求高',
      createTime: '2024-11-28T10:00:00.000Z',
      updateTime: '2024-12-15T16:30:00.000Z'
    },
    {
      id: 'config-002',
      productName: '智能控制器生产线B',
      productModel: 'SC-2024A',
      plannedQuantity: 500,
      completedQuantity: 200,
      startNumber: 1,
      currentNumber: 201,
      startDate: '2024-12-05T09:00:00.000Z',
      expectedEndDate: '2024-12-30T17:00:00.000Z',
      priority: 'normal',
      status: 'running',
      processId: 'process-002',
      remarks: '按计划稳步推进',
      createTime: '2024-12-02T14:00:00.000Z',
      updateTime: '2024-12-15T11:45:00.000Z'
    },
    {
      id: 'config-003',
      productName: '特种涂料生产线C',
      productModel: 'TC-100',
      plannedQuantity: 300,
      completedQuantity: 0,
      startNumber: 1,
      currentNumber: 1,
      startDate: '2024-12-20T08:00:00.000Z',
      expectedEndDate: '2025-01-15T16:00:00.000Z',
      priority: 'low',
      status: 'waiting',
      processId: 'process-003',
      remarks: '等待原料到货',
      createTime: '2024-12-10T13:00:00.000Z',
      updateTime: '2024-12-10T13:00:00.000Z'
    }
  ]

  try {
    await db.openDB()
    for (const config of configs) {
      await db.put('productConfigs', config)
      console.log(`产线配置 ${config.productName} 初始化成功`)
    }
  } catch (error) {
    console.error('产线配置数据初始化失败:', error)
  }
}

// 初始化工艺线数据
const initProductions = async () => {
  const productions = [
    {
      id: 'production-001',
      name: '标准CMOS工艺产线',
      description: '用于生产CMOS集成电路的标准工艺线',
      layers: [
        {
          id: 'layer-001',
          steps: [
            {
              id: 'step-001',
              processId: 'process-001',
              processType: '清洗',
              processName: '晶圆清洗工艺',
              parameters: [
                { name: '时间', value: '10', unit: 'min' },
                { name: '温度', value: '60', unit: '°C' },
                { name: '热水洗次数', value: '3', unit: '次' },
                { name: '冷水洗次数', value: '2', unit: '次' }
              ],
              materials: [
                { name: '超纯水', defaultValue: '50', unit: 'L' },
                { name: '清洗剂', defaultValue: '0.5', unit: 'L' }
              ]
            }
          ]
        },
        {
          id: 'layer-002',
          steps: [
            {
              id: 'step-002',
              processId: 'process-002',
              processType: '光刻',
              processName: '光刻工艺',
              parameters: [
                { name: '光刻胶种类', value: 'PR-2000', unit: '' },
                { name: '匀胶温度', value: '23', unit: '°C' },
                { name: '匀胶转速', value: '3000', unit: 'rpm' },
                { name: '曝光时间', value: '15', unit: 's' }
              ],
              materials: [
                { name: '光刻胶', defaultValue: '10', unit: 'mL' },
                { name: '显影液', defaultValue: '20', unit: 'mL' }
              ]
            }
          ]
        }
      ],
      createTime: '2024-11-01',
      updateTime: '2024-12-15',
      remark: '标准CMOS制造工艺线，用于生产8英寸晶圆'
    },
    {
      id: 'production-002',
      name: '高精度传感器工艺产线',
      description: '专用于MEMS传感器制造的工艺线',
      layers: [
        {
          id: 'layer-003',
          steps: [
            {
              id: 'step-003',
              processId: 'process-004',
              processType: '干燥',
              processName: '等离子刻蚀工艺',
              parameters: [
                { name: '时间', value: '20', unit: 'min' },
                { name: '温度', value: '25', unit: '°C' },
                { name: '射频功率', value: '800', unit: 'W' }
              ],
              materials: [
                { name: 'CF4气体', defaultValue: '2', unit: 'L' },
                { name: 'O2气体', defaultValue: '1', unit: 'L' }
              ]
            }
          ]
        }
      ],
      createTime: '2024-10-15',
      updateTime: '2024-12-10',
      remark: 'MEMS传感器专用工艺线，包含深刻蚀等特殊工艺'
    }
  ]

  try {
    await db.openDB()
    for (const production of productions) {
      await db.put('productions', production)
      console.log(`工艺线 ${production.name} 初始化成功`)
    }
  } catch (error) {
    console.error('工艺线数据初始化失败:', error)
  }
}

// 执行初始化
const initAllData = async () => {
  console.log('开始初始化数据...')
  await initProcesses()
  await initProducts()
  await initProductConfigs()
  await initProductions()
  console.log('数据初始化完成！')
}

export { initAllData, initProcesses, initProducts, initProductConfigs, initProductions }
