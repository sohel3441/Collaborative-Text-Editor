# Use official Node image
FROM node:18-alpine

WORKDIR /app

# copy package json first (leverage docker caching)
COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
