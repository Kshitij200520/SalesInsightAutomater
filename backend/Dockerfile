FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

COPY . .

EXPOSE 8000

CMD ["node", "server.js"]
