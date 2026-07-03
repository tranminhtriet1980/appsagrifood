# Ảnh Docker cho app Next.js (Sagrifood HRM)
FROM node:20-bookworm-slim

WORKDIR /app

# openssl cần cho Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Cài dependencies (postinstall tự chạy prisma generate -> cần schema)
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# Copy toàn bộ source rồi build
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Khi container chạy: đồng bộ DB + seed + khởi động app
RUN chmod +x docker-entrypoint.sh
CMD ["./docker-entrypoint.sh"]
