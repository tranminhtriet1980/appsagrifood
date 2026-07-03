# Chạy trên SERVER khác bằng Docker (app + database)

Trên server chỉ cần cài **Docker** + **Docker Compose** + **Git**. Không cần Node, không cần Postgres riêng — mọi thứ chạy trong Docker.

## Các lệnh (copy chạy lần lượt)
```bash
# 1) Lấy code
git clone https://github.com/tranminhtriet1980/appsagrifood.git
cd appsagrifood

# 2) Build + chạy toàn bộ (app + Postgres) trong Docker
docker compose -f docker-compose.server.yml up -d --build

# 3) Xem log để chắc chắn đã chạy (Ctrl+C để thoát log)
docker compose -f docker-compose.server.yml logs -f app
```

Lần đầu app tự: đồng bộ database + tạo 2 site mẫu + 3 tài khoản, rồi khởi động.

Mở trình duyệt: **http://IP-CUA-SERVER:3000**
- Nhân viên: `NV001 / 123456` · `NV002 / 123456`
- Quản lý: `QL001 / 123456`

## Lệnh quản lý thường dùng
```bash
docker compose -f docker-compose.server.yml ps          # trạng thái
docker compose -f docker-compose.server.yml logs -f app # xem log app
docker compose -f docker-compose.server.yml restart app # khởi động lại app
docker compose -f docker-compose.server.yml down         # tắt (giữ dữ liệu)
docker compose -f docker-compose.server.yml up -d --build # cập nhật sau khi git pull
```

Cập nhật khi có code mới:
```bash
git pull
docker compose -f docker-compose.server.yml up -d --build
```

## ⚠️ Cần chỉnh cho dùng thật
1. **JWT_SECRET**: mở `docker-compose.server.yml` đổi `JWT_SECRET` thành chuỗi ngẫu nhiên dài.
2. **Mật khẩu Postgres**: đổi `POSTGRES_PASSWORD` (và `%40` trong `DATABASE_URL`/`DIRECT_URL` nếu mật khẩu có ký tự `@`).
3. **Toạ độ site**: sửa `prisma/seed-sites.ts` cho đúng vị trí siêu thị thật, hoặc sửa trực tiếp bảng `locations`.

## ⚠️ HTTPS cho điện thoại (camera + GPS)
Điện thoại **chỉ bật được camera/GPS khi truy cập qua HTTPS**. `http://IP:3000` sẽ bị chặn camera.
Cách xử lý trên server: đặt tên miền trỏ về server rồi dùng reverse proxy HTTPS (khuyên **Caddy** — tự xin SSL). Ví dụ `Caddyfile`:
```
cham-cong.tenmiencuaban.com {
    reverse_proxy localhost:3000
}
```
Chạy Caddy (đã có domain trỏ về server):
```bash
docker run -d --name caddy --network host \
  -v $PWD/Caddyfile:/etc/caddy/Caddyfile \
  -v caddy_data:/data caddy:2
```
Sau đó nhân viên vào `https://cham-cong.tenmiencuaban.com` → cài PWA (Android/iPhone) là chấm công đầy đủ. Nếu build APK Android, đặt link HTTPS này vào `capacitor.config.ts` rồi chạy `build-apk.ps1`.

## Cổng & tường lửa
- Mở cổng **3000** (hoặc 80/443 nếu dùng Caddy) trên tường lửa/security group của server.
- Database Postgres KHÔNG mở ra ngoài (chỉ app trong mạng Docker gọi tới) — an toàn hơn.
