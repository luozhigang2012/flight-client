FROM node:18 AS build
WORKDIR /client-app
 
COPY package*.json ./
RUN npm install
 
COPY . .
RUN npm run build
 
FROM nginx:alpine
COPY --from=build /client-app/dist /usr/share/nginx/html
# 复制 Nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf
# 复制并设置启动脚本
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]