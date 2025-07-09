# ---------- frontend builder ----------
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# 先只复制package.json和pnpm-lock.yaml，方便缓存依赖层
COPY package.json pnpm-lock.yaml ./

# 固定pnpm版本安装依赖
RUN npm install -g pnpm@10.4.1 && pnpm install

# 复制所有前端源码
COPY . ./

# 构建项目
RUN pnpm build

# ---------- frontend runtime ----------
FROM node:22-alpine AS frontend-runtime

WORKDIR /app

ENV NODE_ENV=production
ENV TZ=Asia/Shanghai

# 复制构建好的静态文件和独立启动文件
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/.next/static ./.next/static
COPY --from=frontend-builder /app/.next/standalone ./

EXPOSE 3000

CMD ["node", "server.js"]
        
    