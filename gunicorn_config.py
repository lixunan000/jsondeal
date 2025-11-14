# Gunicorn配置文件
bind = "0.0.0.0:7777"
workers = 4
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 2

# 日志配置
accesslog = "-"  # 标准输出
errorlog = "-"   # 标准错误输出
loglevel = "info"

# 进程名称
proc_name = "json_tools"

# 最大请求数
max_requests = 1000
max_requests_jitter = 100