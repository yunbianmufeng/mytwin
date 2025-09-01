import { db, migrateFromLocalStorage } from "../../utils/indexedDB";

// 工艺管理模块
export default {
  namespaced: true,

  state: {
    processes: [], // 工艺列表
    deviceTypes: [
      {
        value: "清洗",
        label: "清洗",
        defaultParams: ["时间", "温度", "热水洗次数", "冷水洗次数"],
      },
      { value: "干燥", label: "干燥", defaultParams: ["时间", "温度"] },
      { value: "生成", label: "生成", defaultParams: ["时间", "温度"] },
      { value: "氧扫", label: "氧扫", defaultParams: ["时间", "温度"] },
      { value: "磁控", label: "磁控", defaultParams: ["时间"] },
      {
        value: "电镀",
        label: "电镀",
        defaultParams: ["时间", "电流", "温度"],
      },
      {
        value: "研抛",
        label: "研抛",
        defaultParams: ["时间", "配重", "转速", "抛光布种类"],
      },
      {
        value: "光刻",
        label: "光刻",
        defaultParams: [
          "光刻胶种类",
          "匀胶温度",
          "匀胶转速",
          "曝光时间",
          "曝光间隔",
          "循环次数",
          "显影液种类",
        ],
      },
      { value: "热稳定", label: "热稳定", defaultParams: ["时间", "温度"] },
      { value: "其他", label: "其他", defaultParams: [] },
    ],
  },

  mutations: {
    SET_PROCESSES(state, processes) {
      state.processes = processes;
    },
    ADD_PROCESS(state, process) {
      state.processes.push(process);
    },
    UPDATE_PROCESS(state, { id, updates }) {
      const index = state.processes.findIndex((p) => p.id === id);
      if (index !== -1) {
        state.processes[index] = { ...state.processes[index], ...updates };
      }
    },
    DELETE_PROCESS(state, id) {
      state.processes = state.processes.filter((p) => p.id !== id);
    },
  },

  actions: {
    // 模拟API调用 - 获取工艺列表
    async mockFetchProcesses({ state }) {
      return Promise.resolve(state.processes);
    },

    // 模拟API调用 - 添加工艺
    async mockAddProcess(_, process) {
      const now = new Date().toISOString().split("T")[0];
      return Promise.resolve({
        ...process,
        id: Date.now(),
        createTime: now,
        updateTime: now,
      });
    },

    // 模拟API调用 - 更新工艺
    async mockUpdateProcess(_, { id, updates }) {
      const now = new Date().toISOString().split("T")[0];
      return Promise.resolve({
        ...updates,
        updateTime: now,
      });
    },

    // 模拟API调用 - 删除工艺
    async mockDeleteProcess() {
      return Promise.resolve();
    },

    // 初始化数据库并迁移数据
    async initDB({ dispatch }) {
      try {
        // 从 localStorage 迁移数据到 IndexedDB
        await migrateFromLocalStorage("processes", "processes");
        // 加载数据
        await dispatch("fetchProcesses");
      } catch (error) {
        console.error("数据库初始化失败:", error);
        throw error;
      }
    },

    // 获取工艺列表
    async fetchProcesses({ commit }) {
      try {
        const processes = await db.getAll("processes");
        commit("SET_PROCESSES", processes);
      } catch (error) {
        console.error("获取工艺列表失败:", error);
        throw error;
      }
    },

    // 添加工艺
    async addProcess({ commit, dispatch }, process) {
      try {
        const response = await dispatch("mockAddProcess", process);
        // 转换为普通对象
        const plainResponse = JSON.parse(JSON.stringify(response));
        await db.put("processes", plainResponse);
        commit("ADD_PROCESS", plainResponse);
        return plainResponse;
      } catch (error) {
        console.error("添加工艺失败:", error);
        throw error;
      }
    },

    // 更新工艺
    async updateProcess({ commit, dispatch }, { id, updates }) {
      try {
        const response = await dispatch("mockUpdateProcess", { id, updates });
        // 转换为普通对象
        const plainUpdates = JSON.parse(JSON.stringify(response));
        const updatedProcess = { id, ...plainUpdates };
        await db.put("processes", updatedProcess);
        commit("UPDATE_PROCESS", { id, updates: plainUpdates });
        return plainUpdates;
      } catch (error) {
        console.error("更新工艺失败:", error);
        throw error;
      }
    },

    // 删除工艺
    async deleteProcess({ commit, dispatch }, id) {
      try {
        await dispatch("mockDeleteProcess", id);
        await db.delete("processes", id);
        commit("DELETE_PROCESS", id);
      } catch (error) {
        console.error("删除工艺失败:", error);
        throw error;
      }
    },
  },

  getters: {
    // 获取工艺列表
    getProcesses: (state) => state.processes,

    // 获取设备类型列表
    getDeviceTypes: (state) => state.deviceTypes,

    // 根据ID获取工艺
    getProcessById: (state) => (id) => {
      return state.processes.find((p) => p.id === id);
    },
  },
};
