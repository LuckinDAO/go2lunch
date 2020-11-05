FROM registry.cn-shanghai.aliyuncs.com/docker_mirror_image/library.node:14-alpine AS node_builder
WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn config set registry https://registry.npm.taobao.org/
RUN yarn
COPY . .
RUN yarn run build

FROM registry.cn-shanghai.aliyuncs.com/docker_mirror_image/library.nginx:alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=node_builder /app/public /dist
EXPOSE 80