# 腾讯云CloudBase部署指南

## 🌟 方案优势
- ✅ **国内访问速度快**
- ✅ **完全免费**（个人开发者）
- ✅ **无需GitHub**
- ✅ **支持Python环境**
- ✅ **自动HTTPS**

## 📋 部署前准备

### 1. 注册腾讯云账号
访问 [cloud.tencent.com](https://cloud.tencent.com) 注册账号

### 2. 开通CloudBase服务
1. 进入 [CloudBase控制台](https://console.cloud.tencent.com/tcb)
2. 点击"新建环境"
3. 选择"按量计费"（有免费额度）
4. 环境名称填写：`json-tools`

### 3. 安装CloudBase CLI
```bash
# 使用npm安装（需要先安装Node.js）
npm install -g @cloudbase/cli

# 或者使用国内镜像
npm install -g @cloudbase/cli --registry=https://registry.npmmirror.com
```

## 🚀 快速部署

### 方法1：通过CloudBase控制台（最简单）

1. **登录CloudBase控制台**
   - 访问 [console.cloud.tencent.com/tcb](https://console.cloud.tencent.com/tcb)
   - 选择您创建的环境

2. **上传代码**
   - 进入"云函数"页面
   - 点击"新建云函数"
   - 函数名称：`json-tools`
   - 运行环境：Python 3.7
   - 上传方式：本地上传文件夹
   - 选择您的项目文件夹
   - 执行方法：`app.app`

3. **配置HTTP访问**
   - 在云函数详情页点击"触发管理"
   - 添加触发路径：`/`
   - 触发类型：HTTP访问

### 方法2：通过CLI部署（推荐）

```bash
# 1. 登录CloudBase
tcb login

# 2. 初始化配置（首次部署）
tcb framework deploy

# 3. 按照提示选择环境
# 4. 等待部署完成
```

## 🔧 项目配置说明

### cloudbaserc.json 配置文件
```json
{
  "envId": "您的环境ID",
  "functionRoot": "./",
  "functions": [
    {
      "name": "json-tools",
      "timeout": 60,
      "envVariables": {},
      "runtime": "Python3.7",
      "memorySize": 256,
      "handler": "app.app"
    }
  ]
}
```

## 💰 免费额度说明

腾讯云CloudBase为个人开发者提供丰富的免费额度：

| 资源类型 | 免费额度 | 说明 |
|---------|---------|------|
| 资源使用量 | 1GB/月 | 完全够用 |
| 外网出流量 | 1GB/月 | 静态资源访问 |
| 云函数资源使用 | 40万GBs/月 | 大量请求 |
| 云函数调用次数 | 100万次/月 | 高频使用 |

## 🌐 访问地址

部署成功后，您将获得专属访问地址：
```
https://您的环境ID.service.tcloudbase.com
```

例如：`https://json-tools-123456.service.tcloudbase.com`

## 🔄 更新部署

当您修改代码后，重新部署：
```bash
# 重新部署
tcb framework deploy

# 或者通过控制台重新上传代码包
```

## 🛠️ 故障排除

### 常见问题
1. **环境ID获取**：在CloudBase控制台的环境概览中查看
2. **依赖安装失败**：确保requirements.txt文件正确
3. **访问404**：检查触发路径配置是否正确

### 日志查看
```bash
# 查看部署日志
tcb logs

# 查看函数运行日志
tcb fn invoke json-tools
```

## 📞 技术支持

- 腾讯云官方文档：https://cloud.tencent.com/document/product/876
- 社区支持：CloudBase开发者社区
- 客服热线：95716

---

**总结**：腾讯云CloudBase是目前最适合国内用户的免费部署方案，访问速度快，部署简单！