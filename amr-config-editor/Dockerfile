# Dockerfile for react.js app and nginx
# build environment
FROM node:10.16.0-buster-slim as builder
COPY package.json package-lock.json ./
RUN npm ci
WORKDIR /usr/src/app
COPY . .
RUN npm install -D react-scripts
RUN npm run build

# production environment
FROM nginx:1.17.2-alpine
COPY nginx/default.conf /etc/nginx/conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
