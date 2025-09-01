// IndexedDB 工具类
export class IndexedDBUtil {
  constructor(dbName, version = 3) {
    this.dbName = dbName
    this.version = version
    this.db = null
    this.initPromise = null
  }

  // 打开数据库
  async openDB() {
    // 如果已经有一个初始化过程在进行，返回该Promise
    if (this.initPromise) {
      return this.initPromise
    }

    // 如果数据库已经打开，先关闭它
    if (this.db) {
      this.db.close()
      this.db = null
    }

    console.log(`Opening database ${this.dbName} version ${this.version}...`)

    this.initPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.dbName, this.version)

        request.onerror = () => {
          console.error('Database open error:', request.error)
          this.initPromise = null
          reject(request.error)
        }

        request.onupgradeneeded = (event) => {
          console.log('Database upgrade needed...')
          const db = event.target.result
          const oldVersion = event.oldVersion
          const newVersion = event.newVersion
          
          console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`)
          
          // 创建所需的所有存储对象
          const stores = [
            'processes',      // 工艺管理
            'products',       // 产品管理 (factory.js)
            'productConfigs', // 产线配置 (product.js)
            'materials',      // 物料管理
            'productions',    // 生产管理
            'equipment',      // 设备管理
            'factories'       // 工厂管理
          ]
          
          stores.forEach(storeName => {
            if (!db.objectStoreNames.contains(storeName)) {
              console.log(`Creating store: ${storeName}`)
              db.createObjectStore(storeName, { keyPath: 'id' })
            } else {
              console.log(`Store ${storeName} already exists`)
            }
          })
          
          // 如果是从版本 1 升级，尝试迁移数据
          if (oldVersion === 1) {
            console.log('Migrating data from version 1...')
            // 这里可以添加数据迁移逻辑
          }
          
          console.log('Database upgrade completed')
        }

        request.onsuccess = () => {
          console.log('Database opened successfully')
          this.db = request.result

          // 添加错误处理
          this.db.onerror = (event) => {
            console.error('Database error:', event.target.error)
          }

          // 验证所有存储对象是否存在
          const requiredStores = ['processes', 'products', 'productConfigs', 'materials', 'productions', 'equipment', 'factories']
          const missingStores = requiredStores.filter(store => !this.db.objectStoreNames.contains(store))
          if (missingStores.length > 0) {
            console.warn(`Missing stores (will be created on next upgrade): ${missingStores.join(', ')}`)
          }

          this.initPromise = null
          resolve(this.db)
        }

        request.onblocked = () => {
          console.error('Database blocked')
          this.initPromise = null
          reject(new Error('Database blocked'))
        }
      } catch (error) {
        console.error('Database initialization error:', error)
        this.initPromise = null
        reject(error)
      }
    })

    return this.initPromise
  }

  // 获取所有数据
  async getAll(storeName) {
    try {
      await this.openDB()
      console.log(`Getting all data from store: ${storeName}`)
      
      return new Promise((resolve, reject) => {
        if (!this.db.objectStoreNames.contains(storeName)) {
          const error = new Error(`Store ${storeName} not found`)
          console.error(error)
          reject(error)
          return
        }

        const transaction = this.db.transaction(storeName, 'readonly')
        const store = transaction.objectStore(storeName)
        const request = store.getAll()

        request.onerror = () => {
          console.error(`Error getting data from ${storeName}:`, request.error)
          reject(request.error)
        }

        request.onsuccess = () => {
          console.log(`Successfully retrieved ${request.result.length} items from ${storeName}`)
          resolve(request.result)
        }
      })
    } catch (error) {
      console.error(`Error in getAll(${storeName}):`, error)
      throw error
    }
  }

  // 清理数据，确保可以被 IndexedDB 序列化
  cleanData(data, seen = new WeakSet()) {
    // 处理 null 和 undefined
    if (data === null || data === undefined) {
      return data
    }

    // 处理基本类型
    if (typeof data !== 'object') {
      return data
    }

    // 检查循环引用
    if (seen.has(data)) {
      return {}
    }
    seen.add(data)

    // 处理日期对象
    if (data instanceof Date) {
      return data.toISOString()
    }

    // 处理数组
    if (Array.isArray(data)) {
      return data.map(item => this.cleanData(item, seen))
    }

    // 处理普通对象
    if (data.constructor === Object) {
      const cleanObj = {}
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key]
          
          // 跳过函数、symbol 等不可序列化的类型
          if (typeof value === 'function' || typeof value === 'symbol') {
            continue
          }
          
          // 跳过 DOM 元素和其他不可序列化的对象
          if (value && typeof value === 'object' && value.nodeType) {
            continue
          }

          cleanObj[key] = this.cleanData(value, seen)
        }
      }
      return cleanObj
    }

    // 对于其他类型的对象，尝试转换为普通对象
    try {
      return JSON.parse(JSON.stringify(data))
    } catch (error) {
      console.warn('Cannot serialize object:', data)
      return {}
    }
  }

  // 添加或更新数据
  async put(storeName, data) {
    try {
      await this.openDB()
      console.log(`Putting data in store: ${storeName}`)
      
      return new Promise((resolve, reject) => {
        if (!this.db.objectStoreNames.contains(storeName)) {
          const error = new Error(`Store ${storeName} not found`)
          console.error(error)
          reject(error)
          return
        }

        const transaction = this.db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        // 清理数据后再存储
        const cleanedData = this.cleanData(data)
        const request = store.put(cleanedData)

        request.onerror = () => {
          console.error(`Error putting data in ${storeName}:`, request.error)
          reject(request.error)
        }

        request.onsuccess = () => {
          console.log(`Successfully put data in ${storeName}`)
          resolve(request.result)
        }
      })
    } catch (error) {
      console.error(`Error in put(${storeName}):`, error)
      throw error
    }
  }

  // 删除数据
  async delete(storeName, id) {
    try {
      await this.openDB()
      console.log(`Deleting data from store: ${storeName}`)
      
      return new Promise((resolve, reject) => {
        if (!this.db.objectStoreNames.contains(storeName)) {
          const error = new Error(`Store ${storeName} not found`)
          console.error(error)
          reject(error)
          return
        }

        const transaction = this.db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.delete(id)

        request.onerror = () => {
          console.error(`Error deleting data from ${storeName}:`, request.error)
          reject(request.error)
        }

        request.onsuccess = () => {
          console.log(`Successfully deleted data from ${storeName}`)
          resolve()
        }
      })
    } catch (error) {
      console.error(`Error in delete(${storeName}):`, error)
      throw error
    }
  }

  // 清空存储对象
  async clear(storeName) {
    try {
      await this.openDB()
      console.log(`Clearing store: ${storeName}`)
      
      return new Promise((resolve, reject) => {
        if (!this.db.objectStoreNames.contains(storeName)) {
          const error = new Error(`Store ${storeName} not found`)
          console.error(error)
          reject(error)
          return
        }

        const transaction = this.db.transaction(storeName, 'readwrite')
        const store = transaction.objectStore(storeName)
        const request = store.clear()

        request.onerror = () => {
          console.error(`Error clearing ${storeName}:`, request.error)
          reject(request.error)
        }

        request.onsuccess = () => {
          console.log(`Successfully cleared ${storeName}`)
          resolve()
        }
      })
    } catch (error) {
      console.error(`Error in clear(${storeName}):`, error)
      throw error
    }
  }
}

// 创建单例实例
export const db = new IndexedDBUtil('mytwin', 3)

// 数据迁移函数
export async function migrateFromLocalStorage(key, storeName) {
  try {
    console.log(`Migrating data from localStorage key "${key}" to store "${storeName}"`)
    // 从 localStorage 读取数据
    const data = localStorage.getItem(key)
    if (data) {
      const items = JSON.parse(data)
      if (Array.isArray(items)) {
        // 将数据写入 IndexedDB
        await db.putMany(storeName, items)
        console.log(`Successfully migrated ${items.length} items to IndexedDB`)
        
        // 迁移成功后可以选择清除 localStorage 中的数据
        // localStorage.removeItem(key)
      }
    }
  } catch (error) {
    console.error('数据迁移失败:', error)
    throw error
  }
}
