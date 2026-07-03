#!/bin/sh
set -e

echo "==> Đồng bộ schema vào database..."
npx prisma db push --skip-generate

echo "==> Nạp dữ liệu mẫu (site + ca + tài khoản)..."
npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed-sites.ts || echo "(bỏ qua seed)"

echo "==> Khởi động app trên cổng ${PORT:-3000}..."
exec ./node_modules/.bin/next start -H 0.0.0.0 -p "${PORT:-3000}"
