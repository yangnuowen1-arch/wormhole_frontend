# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

# 使用阿里云 Alpine 镜像站，并将 npm 源切换为国内 npmmirror。
ARG NPM_REGISTRY=https://registry.npmmirror.com
RUN sed -i 's|https://dl-cdn.alpinelinux.org/alpine|https://mirrors.aliyun.com/alpine|g' /etc/apk/repositories \
    && npm config set registry "${NPM_REGISTRY}"

COPY package.json package-lock.json ./
RUN npm ci --no-audit --fund=false

COPY . ./
RUN npm run build

FROM nginx:1.28-alpine AS production

# 运行镜像中的 Alpine 软件源同样切换至阿里云。
RUN sed -i 's|https://dl-cdn.alpinelinux.org/alpine|https://mirrors.aliyun.com/alpine|g' /etc/apk/repositories

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
