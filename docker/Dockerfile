FROM node:13

WORKDIR /app

COPY package*.json ./
COPY . .
RUN npm install --production

EXPOSE 9000
CMD [ "node", "-r", "esm", "server/index.js" ]
