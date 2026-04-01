FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodegroup && adduser -S nodeuser -G nodegroup
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env.example ./.env.example
COPY --from=deps /app/node_modules ./node_modules
RUN mkdir -p logs && chown -R nodeuser:nodegroup /app
USER nodeuser
EXPOSE 3000
CMD ["node", "dist/main.js"]
