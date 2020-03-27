FROM node:13

WORKDIR /app

COPY package*.json ./
COPY . .
RUN npm install && npm run build

EXPOSE 9000
CMD [ "node", "-r", "esm", "server/index.js" ]
