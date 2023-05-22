FROM node:18-buster
RUN mkdir -p /app
WORKDIR /app
COPY src/package.json src/package-lock.json .
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "start"]