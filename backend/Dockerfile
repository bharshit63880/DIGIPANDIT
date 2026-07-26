FROM node:24-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node src ./src
COPY --chown=node:node package.json ./
USER node
EXPOSE 5000
CMD ["node", "src/server.js"]
