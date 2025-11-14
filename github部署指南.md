# GitHub部署指南 - JSON小工具

## 🎯 方案概述
使用GitHub Pages + GitHub Actions实现自动化部署，完全免费且无需服务器。

## 📋 准备工作

### 1. GitHub账号
- 如果您还没有GitHub账号，请先注册：https://github.com/signup

### 2. 创建GitHub仓库
1. 登录GitHub
2. 点击右上角"+" → "New repository"
3. 填写仓库信息：
   - Repository name: `json-tools` (或其他您喜欢的名称)
   - Description: "JSON格式化和对比工具"
   - 选择 Public (公开)
   - 勾选 "Add a README file"
   - 点击 "Create repository"

## 🚀 部署步骤

### 步骤1：上传代码到GitHub

#### 方法一：使用Git命令行
```bash
# 克隆您的仓库
git clone https://github.com/您的用户名/json-tools.git
cd json-tools

# 复制项目文件到仓库目录
# 将您的所有项目文件复制到此目录

# 添加文件到Git
git add .

# 提交更改
git commit -m "Initial commit: JSON tools application"

# 推送到GitHub
git push origin main
```

#### 方法二：使用GitHub网页上传
1. 在GitHub仓库页面，点击"Add file" → "Upload files"
2. 拖拽或选择您的所有项目文件
3. 填写提交信息，点击"Commit changes"

### 步骤2：配置GitHub Actions

在项目根目录创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
      
    - name: Setup Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
        
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        
    - name: Test application
      run: |
        python -c "import flask; print('Flask installed successfully')"
        
    - name: Upload artifact
      uses: actions/upload-pages-artifact@v1
      with:
        path: .
        
    - name: Deploy to GitHub Pages
      uses: actions/deploy-pages@v1
      if: github.ref == 'refs/heads/main'
```

### 步骤3：启用GitHub Pages

1. 进入仓库设置：Settings → Pages
2. 在"Source"部分选择：
   - Branch: `gh-pages` (或选择GitHub Actions)
   - Folder: `/ (root)`
3. 点击"Save"

### 步骤4：配置应用设置

由于GitHub Pages是静态托管，我们需要调整应用为静态模式：

1. 修改 `app.py` 中的端口设置
2. 确保所有静态资源路径正确

## 🌐 访问您的应用

部署完成后，您的应用将在以下地址可用：
```
https://您的用户名.github.io/json-tools
```

## 🔧 本地开发

### 本地运行
```bash
# 安装依赖
pip install -r requirements.txt

# 运行应用
python app.py

# 访问 http://localhost:7777
```

### 开发环境变量
创建 `.env` 文件（可选）：
```
FLASK_DEBUG=true
FLASK_ENV=development
```

## 💰 成本分析

| 项目 | 费用 | 说明 |
|-----|------|------|
| GitHub Pages | 免费 | 无限流量，自动SSL |
| GitHub Actions | 免费 | 每月2000分钟 |
| 自定义域名 | 可选 | 可绑定自己的域名 |
| **总计** | **0元** | 完全免费部署 |

## 🔄 自动化部署流程

每次您推送代码到main分支时：
1. GitHub Actions自动运行测试
2. 构建应用
3. 部署到GitHub Pages
4. 自动更新网站内容

## 🛠️ 常见问题

### Q: 应用无法正常显示？
A: 检查以下内容：
1. 确保所有文件路径正确
2. 检查浏览器控制台错误信息
3. 验证GitHub Actions部署日志

### Q: 如何绑定自定义域名？
A: 在仓库Settings → Pages中：
1. 添加您的域名到Custom domain
2. 在域名服务商处配置CNAME记录

### Q: 依赖安装失败？
A: 检查requirements.txt格式，确保版本兼容

### Q: 如何调试部署问题？
A: 查看GitHub Actions的运行日志：
1. 进入仓库 → Actions
2. 点击最近的workflow运行
3. 查看详细日志

## 📞 技术支持

- GitHub官方文档：https://docs.github.com
- GitHub Pages文档：https://pages.github.com
- GitHub Actions文档：https://docs.github.com/actions

---

**总结**：GitHub部署方案是完全免费的现代化部署方式，支持自动化CI/CD，无需服务器维护！