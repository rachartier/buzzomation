FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN npm ci --only=production

EXPOSE 3001

CMD ["npm", "start"]
