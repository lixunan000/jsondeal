# JSON小工具

一个基于Flask的JSON格式化和对比工具，支持GitHub Pages部署。

## 功能特性

- ✅ JSON格式化（美化输出）
- ✅ JSON对比（找出差异）
- ✅ 响应式设计
- ✅ 支持中文字符
- ✅ 静态版本和动态版本

## 快速开始

### 本地运行

1. 克隆项目
```bash
git clone https://github.com/your-username/json-tools.git
cd json-tools
```

2. 安装依赖
```bash
pip install -r requirements.txt
```

3. 启动应用
```bash
python app.py
```

4. 访问 http://localhost:7777

### GitHub Pages部署

1. Fork或创建新的GitHub仓库
2. 上传所有项目文件到仓库
3. 启用GitHub Pages：
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"
4. 推送代码到main分支，自动部署

访问地址：`https://your-username.github.io/json-tools`

## 项目结构

```
json-tools/
├── app.py                 # Flask主应用
├── index.html            # 动态版本主页
├── index_static.html     # 静态版本主页
├── script.js             # 前端JavaScript
├── style.css             # 样式文件
├── requirements.txt       # Python依赖
├── gunicorn_config.py    # Gunicorn配置
├── wsgi.py               # WSGI入口
├── .github/workflows/    # GitHub Actions
│   └── deploy.yml        # 部署工作流
└── static/               # 静态资源目录
```

## API接口

### JSON格式化
- **端点**: `POST /api/format`
- **参数**: `{ "json_string": "your json here" }`
- **返回**: 格式化后的JSON

### JSON对比
- **端点**: `POST /api/compare`
- **参数**: `{ "json1": "first json", "json2": "second json" }`
- **返回**: 差异分析结果

### 健康检查
- **端点**: `GET /api/health`
- **返回**: 服务状态信息

## 部署选项

### 1. GitHub Pages（推荐）
- 完全免费
- 自动SSL证书
- 全球CDN加速
- 自动化部署

### 2. 传统服务器部署
- 使用Gunicorn + Nginx
- 支持高并发
- 生产环境稳定

### 3. 云函数部署
- 支持腾讯云云函数
- 按量计费
- 弹性伸缩

## 开发指南

### 环境要求
- Python 3.7+
- Flask 2.3.3+
- 现代浏览器

### 开发命令
```bash
# 安装开发依赖
pip install -r requirements.txt

# 运行开发服务器
python app.py

# 运行生产服务器
gunicorn -c gunicorn_config.py app:app
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 技术支持

- 问题反馈：GitHub Issues
- 文档：本项目README
- 部署帮助：参考部署指南

---

**注意**：GitHub Pages版本为静态版本，部分高级功能需要后端支持。完整功能请部署Flask版本。