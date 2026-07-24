FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json index.ts ./
COPY scr ./scr
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
RUN mkdir -p uploads/restaurants uploads/profiles

EXPOSE 8088
CMD ["npm", "start"]
