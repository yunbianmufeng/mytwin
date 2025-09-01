# Unity WebGL 集成详细操作教程

## 一、Unity项目设置和脚本创建

### 1. Unity场景设置
1. **创建场景结构**
   ```
   场景1
   └── ProductionLine (GameObject)
       ├── 清洗工艺 (GameObject)
       ├── 干燥工艺 (GameObject)
       ├── 生成工艺 (GameObject)
       ├── 测试工艺 (GameObject)
       └── ... (其他工艺GameObject)
   ```

2. **在Unity中创建GameManager脚本**
   - 在项目中创建新的C#脚本，命名为`GameManager.cs`
   - 将脚本挂载到场景中的一个GameObject上（建议创建空的GameObject命名为"GameManager"）

### 2. GameManager.cs 脚本代码

```csharp
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

[System.Serializable]
public class ProcessTypeData
{
    public ProcessType[] processTypes;
}

[System.Serializable]
public class ProcessType
{
    public string name;
    public bool enabled;
}

public class GameManager : MonoBehaviour
{
    [Header("生产线配置")]
    public GameObject productionLineParent; // ProductionLine父对象
    
    [Header("工艺设备GameObject映射")]
    public Dictionary<string, GameObject> processEquipmentMap = new Dictionary<string, GameObject>();
    
    private void Start()
    {
        // 初始化设备映射
        InitializeEquipmentMap();
        
        // 默认隐藏所有设备
        HideAllEquipment();
        
        Debug.Log("GameManager初始化完成");
    }
    
    /// <summary>
    /// 初始化设备映射关系
    /// </summary>
    private void InitializeEquipmentMap()
    {
        if (productionLineParent == null)
        {
            productionLineParent = GameObject.Find("ProductionLine");
            if (productionLineParent == null)
            {
                Debug.LogError("未找到ProductionLine对象！");
                return;
            }
        }
        
        // 遍历ProductionLine下的所有子对象
        for (int i = 0; i < productionLineParent.transform.childCount; i++)
        {
            GameObject child = productionLineParent.transform.GetChild(i).gameObject;
            string equipmentName = child.name;
            
            // 移除"工艺"后缀，获取原始工艺类型
            if (equipmentName.EndsWith("工艺"))
            {
                string processType = equipmentName.Substring(0, equipmentName.Length - 2);
                processEquipmentMap[processType] = child;
                Debug.Log($"映射设备: {processType} -> {equipmentName}");
            }
            else
            {
                // 如果没有"工艺"后缀，直接使用原名
                processEquipmentMap[equipmentName] = child;
                Debug.Log($"映射设备: {equipmentName} -> {equipmentName}");
            }
        }
        
        Debug.Log($"设备映射初始化完成，共映射 {processEquipmentMap.Count} 个设备");
    }
    
    /// <summary>
    /// 隐藏所有设备
    /// </summary>
    private void HideAllEquipment()
    {
        foreach (var kvp in processEquipmentMap)
        {
            if (kvp.Value != null)
            {
                kvp.Value.SetActive(false);
            }
        }
        Debug.Log("所有设备已隐藏");
    }
    
    /// <summary>
    /// 生产线加载方法 - 由Vue.js调用
    /// </summary>
    /// <param name="jsonData">JSON格式的工艺类型数据</param>
    public void productionLineLoad(string jsonData)
    {
        Debug.Log($"接收到Vue数据: {jsonData}");
        
        try
        {
            // 解析JSON数据
            ProcessTypeData data = JsonUtility.FromJson<ProcessTypeData>(jsonData);
            
            if (data == null || data.processTypes == null)
            {
                Debug.LogError("数据解析失败或数据为空");
                return;
            }
            
            // 首先隐藏所有设备
            HideAllEquipment();
            
            // 根据数据显示或隐藏对应设备
            foreach (ProcessType processType in data.processTypes)
            {
                if (processEquipmentMap.ContainsKey(processType.name))
                {
                    GameObject equipment = processEquipmentMap[processType.name];
                    if (equipment != null)
                    {
                        equipment.SetActive(processType.enabled);
                        Debug.Log($"设备 {processType.name} 设置为: {(processType.enabled ? "显示" : "隐藏")}");
                    }
                    else
                    {
                        Debug.LogWarning($"设备 {processType.name} 的GameObject为空");
                    }
                }
                else
                {
                    Debug.LogWarning($"未找到设备映射: {processType.name}");
                    
                    // 尝试模糊匹配
                    foreach (var kvp in processEquipmentMap)
                    {
                        if (kvp.Key.Contains(processType.name) || processType.name.Contains(kvp.Key))
                        {
                            kvp.Value.SetActive(processType.enabled);
                            Debug.Log($"模糊匹配设备 {kvp.Key} 设置为: {(processType.enabled ? "显示" : "隐藏")}");
                            break;
                        }
                    }
                }
            }
            
            Debug.Log("生产线设备显隐设置完成");
            
            // 发送完成消息给Vue
            SendMessageToVue("设备显隐设置完成");
        }
        catch (Exception e)
        {
            Debug.LogError($"处理生产线数据时出错: {e.Message}");
            SendMessageToVue($"错误: {e.Message}");
        }
    }
    
    /// <summary>
    /// 重置摄像机视角
    /// </summary>
    public void ResetCamera()
    {
        Camera mainCamera = Camera.main;
        if (mainCamera != null)
        {
            // 重置摄像机位置和旋转
            mainCamera.transform.position = new Vector3(0, 5, -10);
            mainCamera.transform.rotation = Quaternion.Euler(15, 0, 0);
            Debug.Log("摄像机视角已重置");
        }
    }
    
    /// <summary>
    /// 显示特定设备
    /// </summary>
    /// <param name="equipmentName">设备名称</param>
    public void ShowEquipment(string equipmentName)
    {
        if (processEquipmentMap.ContainsKey(equipmentName))
        {
            processEquipmentMap[equipmentName].SetActive(true);
            Debug.Log($"显示设备: {equipmentName}");
        }
    }
    
    /// <summary>
    /// 隐藏特定设备
    /// </summary>
    /// <param name="equipmentName">设备名称</param>
    public void HideEquipment(string equipmentName)
    {
        if (processEquipmentMap.ContainsKey(equipmentName))
        {
            processEquipmentMap[equipmentName].SetActive(false);
            Debug.Log($"隐藏设备: {equipmentName}");
        }
    }
    
    /// <summary>
    /// 发送消息到Vue.js
    /// </summary>
    /// <param name="message">消息内容</param>
    private void SendMessageToVue(string message)
    {
        Application.ExternalCall("SendMessageToVue", message);
    }
    
    /// <summary>
    /// 获取当前设备状态（调试用）
    /// </summary>
    public void GetEquipmentStatus()
    {
        foreach (var kvp in processEquipmentMap)
        {
            bool isActive = kvp.Value != null ? kvp.Value.activeSelf : false;
            Debug.Log($"设备 {kvp.Key}: {(isActive ? "显示" : "隐藏")}");
        }
    }
}
```

## 二、Unity WebGL 构建设置

### 1. 构建设置
1. **打开构建设置**
   - File → Build Settings
   - 选择 WebGL 平台
   - 点击 "Switch Platform"

2. **播放器设置**
   - Edit → Project Settings → Player
   - **WebGL Settings:**
     - Company Name: MyTwin
     - Product Name: ProductionLineSimulation
     - Version: 1.0.0
     - **WebGL Template:** 选择 "Default" 或自定义模板

3. **优化设置**
   - **Optimization:**
     - Scripting Backend: IL2CPP
     - Api Compatibility Level: .NET Standard 2.1
   - **Publishing Settings:**
     - Compression Format: Gzip（推荐）
     - Name Files As Hashes: 启用
     - Data caching: 启用

### 2. 构建输出
1. **构建项目**
   - 在Build Settings中点击 "Build"
   - 选择输出目录: `e:\AI_workspace\mytwin\public\webgl\Build`
   - 构建完成后会生成以下文件：
     ```
     Build/
     ├── WebGL.data
     ├── WebGL.framework.js
     ├── WebGL.loader.js
     └── WebGL.wasm
     ```

## 三、Vue.js 集成配置

### 1. 文件结构确认
确保以下文件存在且路径正确：
```
public/
└── webgl/
    ├── index.html (已创建)
    ├── TemplateData/
    │   └── style.css (已创建)
    └── Build/
        ├── WebGL.data (Unity构建生成)
        ├── WebGL.framework.js (Unity构建生成)
        ├── WebGL.loader.js (Unity构建生成)
        └── WebGL.wasm (Unity构建生成)
```

### 2. 测试WebGL集成
1. **启动Vue开发服务器**
   ```bash
   npm run dev
   ```

2. **访问产线列表页面**
   - 导航到产线列表
   - 点击任意产线的"模拟生产"按钮

3. **验证功能**
   - 页面应该跳转到模拟仿真页面
   - 左侧显示工艺设备列表
   - 右侧显示WebGL窗口
   - WebGL加载完成后自动发送数据到Unity

## 四、调试和问题排查

### 1. 常见问题
1. **WebGL无法加载**
   - 检查Build文件是否存在
   - 检查浏览器控制台错误信息
   - 确认服务器支持WASM文件类型

2. **SendMessage调用失败**
   - 检查Unity中GameObject名称是否正确（GameManager）
   - 检查方法名是否匹配（productionLineLoad）
   - 查看Unity Console中的Debug信息

3. **设备显隐不工作**
   - 检查Unity场景中设备名称是否正确
   - 查看processEquipmentMap映射是否正确
   - 检查JSON数据格式

### 2. 调试技巧
1. **Unity端调试**
   ```csharp
   // 在GameManager中添加调试方法
   public void DebugInfo()
   {
       Debug.Log("设备映射数量: " + processEquipmentMap.Count);
       GetEquipmentStatus();
   }
   ```

2. **Vue端调试**
   ```javascript
   // 在Simulation.vue中添加
   console.log('发送到Unity的数据:', processTypeData.value)
   ```

3. **浏览器控制台**
   - 查看网络请求状态
   - 检查WebGL加载错误
   - 观察Unity Debug.Log输出

## 五、扩展功能建议

### 1. 摄像机控制
- 添加鼠标控制摄像机旋转和缩放
- 实现预设视角快速切换

### 2. 设备交互
- 点击设备显示详细信息
- 设备状态动画效果

### 3. 数据同步
- 实时更新设备运行状态
- 生产进度可视化

### 4. 性能优化
- LOD系统减少渲染开销
- 异步加载大型资源

## 六、部署注意事项

1. **服务器配置**
   - 确保服务器支持.wasm MIME类型
   - 启用gzip压缩减少加载时间

2. **浏览器兼容性**
   - 现代浏览器支持WebGL 2.0
   - 移动设备性能限制

3. **安全设置**
   - 配置CORS头允许iframe访问
   - 设置适当的CSP策略

这个集成方案提供了完整的Unity WebGL与Vue.js通信机制，能够实现数据驱动的3D设备显隐控制。
