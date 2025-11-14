# JSON小工具 - 部署指南

## 📋 项目概述
这是一个基于Flask的JSON格式化和对比工具，支持在线使用。

## 🚀 快速部署

### 1. 本地测试部署
```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python app.py

# 访问地址
http://localhost:7777
```

### 2. 生产环境部署（推荐）

#### 使用Gunicorn部署
```bash
# 安装依赖
pip install -r requirements.txt

# 使用Gunicorn启动
# 方式1：直接启动
gunicorn -c gunicorn_config.py app:app

# 方式2：后台启动
nohup gunicorn -c gunicorn_config.py app:app > app.log 2>&1 &

# 方式3：使用systemd（推荐用于服务器）
sudo cp json-tools.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start json-tools
sudo systemctl enable json-tools
```

#### 创建systemd服务文件
创建 `/etc/systemd/system/json-tools.service`：
```ini
[Unit]
Description=JSON Tools Web Application
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/path/to/your/json_tools
Environment=PATH=/usr/bin:/usr/local/bin
ExecStart=/usr/local/bin/gunicorn -c gunicorn_config.py app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

### 3. 云平台部署

#### Vercel部署
1. 安装Vercel CLI: `npm i -g vercel`
2. 在项目根目录运行: `vercel`
3. 按照提示配置

#### Heroku部署
1. 创建 `Procfile`：
```
web: gunicorn -c gunicorn_config.py app:app
```
2. 部署到Heroku

#### 腾讯云/阿里云部署
1. 上传代码到云服务器
2. 按照"生产环境部署"步骤操作
3. 配置Nginx反向代理

## 🔧 环境配置

### 环境变量
```bash
# 开发模式
FLASK_DEBUG=true

# 生产模式  
FLASK_DEBUG=false
```

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:7777;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📊 监控和维护

### 日志查看
```bash
# 查看应用日志
tail -f app.log

# 查看系统日志
journalctl -u json-tools -f
```

### 健康检查
访问 `/api/health` 端点检查服务状态

## 🔒 安全建议

1. **使用HTTPS**：配置SSL证书
2. **防火墙配置**：只开放必要端口
3. **定期更新**：保持依赖包最新
4. **备份策略**：定期备份代码和数据

## 📞 故障排除

### 常见问题
1. **端口占用**：检查7777端口是否被占用
2. **依赖问题**：重新安装requirements.txt
3. **权限问题**：确保运行用户有文件访问权限

### 日志分析
查看日志文件分析具体错误原因

---

**注意**：部署前请确保服务器环境满足Python 3.7+要求。