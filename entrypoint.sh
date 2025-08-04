#!/bin/sh
# entrypoint.sh

# 检查环境变量是否存在，如果不存在则使用默认值
export API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8080}

# 定位到 env.js 文件
env_js_path="/usr/share/nginx/html/env.js"

# 替换占位符
# 使用 | 作为 sed 的分隔符，因为 URL 中可能包含 /
sed -i "s|__API_BASE_URL__|${API_BASE_URL}|g" "$env_js_path"

# 启动 Nginx
# exec nginx -g 'daemon off;' 会在前台启动 Nginx，这是 Docker 容器的最佳实践
exec nginx -g 'daemon off;'