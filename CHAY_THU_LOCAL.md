# Pull về máy và chạy thử (local)

Repo: https://github.com/tranminhtriet1980/appsagrifood

## 0. Cần cài sẵn
- **Node.js 18+** — https://nodejs.org
- **Docker Desktop** (để chạy Postgres) — https://www.docker.com/products/docker-desktop
- **Git**

## 1. Clone code
```bash
git clone https://github.com/tranminhtriet1980/appsagrifood.git
cd appsagrifood
```

## 2. Tạo file `.env`
> ⚠️ File `.env` KHÔNG có trên GitHub (chứa mật khẩu). Tự tạo file `.env` ở thư mục gốc với nội dung sau (dùng Postgres Docker local cổng 5433):
```env
DATABASE_URL="postgresql://postgres:Sagri%402026@localhost:5433/sagri_hrm?schema=public"
DIRECT_URL="postgresql://postgres:Sagri%402026@localhost:5433/sagri_hrm?schema=public"
JWT_SECRET="sagri-hrm-dev-secret-doi-khi-len-production"
```

## 3. Bật database + cài + tạo dữ liệu
```bash
docker compose up -d        # bật Postgres (cổng 5433)
npm install                 # cài thư viện (tự chạy prisma generate)
npm run db:push             # tạo bảng
npm run db:seed-sites       # tạo 2 site + ca 08:00-17:00 + 3 tài khoản
```

## 4. Chạy app
```bash
npm run dev
```
Mở http://localhost:3000 → đăng nhập:
- Nhân viên: **NV001 / 123456** (site Coop Cống Quỳnh)
- Nhân viên: **NV002 / 123456** (site Coop Lý Thường Kiệt)
- Quản lý: **QL001 / 123456**

## 5. Thử chấm công
Vào mục **Chấm công** → **Đăng ký khuôn mặt** (1 lần) → **Vào ca / Tan ca**.
> Trên `localhost` camera + GPS chạy được ngay. Muốn thử trên điện thoại thật cần HTTPS — xem [HUONG_DAN_CHAM_CONG.md](HUONG_DAN_CHAM_CONG.md) mục 5 và [HUONG_DAN_CAI_DAT_DIEN_THOAI.md](HUONG_DAN_CAI_DAT_DIEN_THOAI.md).

## Lưu ý
- Nếu máy đã có PostgreSQL chiếm cổng 5432, không sao — Docker ở đây map ra **5433** nên không đụng.
- Toạ độ 2 site trong `prisma/seed-sites.ts` là **mẫu** — sửa lại cho đúng vị trí siêu thị thật (mục 3 trong HUONG_DAN_CHAM_CONG.md).
- File cài Android sẵn có: `installer/Sagri-ChamCong.apk` (đọc HUONG_DAN_CAI_DAT_DIEN_THOAI.md).
