# OpenBiz Frontend

这是一个基于 [Next.js](https://nextjs.org) 的前端项目，使用 TypeScript 和 Tailwind CSS 构建。

## 开发环境

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看结果。

## Docker 构建和部署

### 构建 Linux/AMD64 Docker 镜像

```bash
# 在项目根目录执行
直接使用 docker 命令：

```bash
cd frontend
docker build --platform linux/amd64 -t openbiz-frontend:linux-amd64 -f Dockerfile .
```

### 部署到远程服务器

1. **保存镜像为 tar 文件**
```bash
# 在项目根目录执行
docker save -o openbiz-frontend_linux-amd64.tar openbiz-frontend:linux-amd64
```

2. **传输到远程服务器**
```bash
# 使用项目提供的脚本
./configs/image-scp.sh openbiz-frontend:linux-amd64

# 或者手动传输
scp openbiz-frontend_linux-amd64.tar root@47.96.174.61:/tmp/
```

3. **在远程服务器上加载镜像**
```bash
# 登录远程服务器
ssh root@47.96.174.61

# 加载镜像
docker load -i /tmp/openbiz-frontend_linux-amd64.tar
```

### 运行容器并重启Docker Compose

```bash
# 在远程服务器上运行
ssh root@47.96.174.61
cd ~/zx && ./restart.sh
```



## 注意事项

1. 确保远程服务器有足够的磁盘空间存储镜像
2. 构建过程需要稳定的网络连接下载依赖
3. 生产环境建议使用反向代理（如 Nginx）处理静态资源
4. 容器默认暴露 3000 端口，可根据需要调整
