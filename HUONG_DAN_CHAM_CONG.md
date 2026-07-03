# Hướng dẫn: Chấm công GPS + Khuôn mặt (Sagrifood HRM)

Tài liệu này mô tả tính năng chấm công mới và cách đưa app lên điện thoại nhân viên.

---

## 1. Đã làm được gì

- **Chấm công Vào ca / Tan ca (Check-in / Check-out)** với 2 nút riêng biệt.
- **Định vị GPS + geofence**: chỉ cho chấm công khi đang **trong bán kính cho phép** của site (mặc định **100m**, chỉnh được từng site). Ngoài vùng → bị từ chối kèm khoảng cách thực tế.
- **Nhận diện khuôn mặt thật** (face-api.js, chạy ngay trong trình duyệt/offline):
  - Nhân viên **đăng ký khuôn mặt 1 lần**.
  - Mỗi lần chấm công phải **so khớp đúng người** mới được ghi nhận.
- **Ghi nhận đầy đủ**: tên nhân viên, site chấm công, thời gian vào/ra, khoảng cách GPS lúc chấm, ảnh khuôn mặt.
- **Đối chiếu giờ làm 08:00 – 17:00**: tự tính **số phút đi trễ** (so 08:00, ân hạn 5') và **số phút về sớm** (so 17:00).
- **Xem công**: trang *Lịch sử chấm công* hiển thị ngày công, số ngày trễ/về sớm, giờ vào/ra từng ngày.
- **Chấm công offline**: mất mạng vẫn lưu tạm (IndexedDB), tự đồng bộ khi có mạng lại.
- **PWA**: cài được lên màn hình chính của **cả Android lẫn iPhone**, không cần lên store.

> ⚙️ Giờ làm & bán kính cấu hình trong `lib/attendance.ts` (`WORK_START_HOUR`, `WORK_END_HOUR`, `FACE_MATCH_THRESHOLD`) và cột `radius` của từng site.

---

## 2. Chạy thử trên máy (local)

```bash
# 1) Bật Postgres bằng Docker (đã map ra cổng 5433 để tránh đụng Postgres 13 có sẵn trên máy)
docker compose up -d

# 2) Tạo bảng
npm run db:push

# 3) Nạp dữ liệu mẫu: 2 site siêu thị + ca 08:00-17:00 + 3 tài khoản
npm run db:seed-sites

# 4) Chạy app
npm run dev
```

Tài khoản thử: `NV001 / 123456` (site Coop Cống Quỳnh), `NV002 / 123456`, quản lý `QL001 / 123456`.

> File `.env` đang trỏ Postgres local (cổng 5433). Khi deploy thật, đổi sang Neon (xem mục 5).

---

## 3. Cấu hình site & gán nhân viên (BẮT BUỘC làm đúng thực địa)

Toạ độ trong seed chỉ là mẫu — **phải thay bằng toạ độ GPS thật của từng siêu thị**.

1. Lấy toạ độ: mở Google Maps → chuột phải vào đúng vị trí siêu thị → copy `vĩ độ, kinh độ`.
2. Sửa trong `prisma/seed-sites.ts` (hoặc dùng `npm run db:studio` để sửa bảng `locations`):
   - `latitude`, `longitude`: toạ độ thật
   - `radius`: bán kính cho phép (mét). Khuyến nghị **50–100m** vì GPS điện thoại sai số ±10–50m.
3. **Mỗi nhân viên phải được gán `location_id`** (thuộc site nào). Trong `db:studio`, mở bảng `users`, đặt `location_id` cho từng người.
   - Nếu nhân viên chưa gán site, hệ thống sẽ tự lấy **site gần nhất** để đối chiếu.

---

## 4. Luồng sử dụng của nhân viên

1. Đăng nhập → vào mục **Chấm công**.
2. Lần đầu: bấm **“Đăng ký khuôn mặt (làm 1 lần)”**, đưa mặt vào khung.
3. Chọn **Vào ca** hoặc **Tan ca** → bấm nút tròn.
   - App kiểm tra: đúng khuôn mặt + đang trong bán kính site.
   - Thành công → hiện thông báo kèm *đi trễ / về sớm bao nhiêu phút*.
4. Xem lại ở **“Xem lịch sử chấm công của tôi”**.

---

## 5. ⭐ Đưa app lên điện thoại nhân viên (quan trọng)

### Điều kiện bắt buộc: HTTPS
Camera và GPS **chỉ hoạt động trên HTTPS** (hoặc `localhost`). Nếu nhân viên mở app bằng IP LAN dạng `http://192.168.x.x:3000` thì **trình duyệt sẽ chặn camera/GPS**. Vì vậy phải chạy qua HTTPS bằng 1 trong 2 cách:

### Cách A — Deploy thật (khuyến nghị cho vận hành)
1. Tạo DB miễn phí ở **https://neon.tech**, lấy 2 chuỗi kết nối, điền vào `.env` (mục PRODUCTION), rồi `npm run db:push` + `npm run db:seed-sites`.
2. Đưa code lên GitHub, import vào **https://vercel.com** (Next.js tự nhận). Khai báo biến môi trường `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` trên Vercel.
3. Vercel cấp sẵn tên miền HTTPS `https://ten-app.vercel.app` → gửi link này cho nhân viên.

### Cách B — Test nhanh (không deploy)
Dùng tunnel tạo HTTPS tạm cho máy đang chạy `npm run dev`:
```bash
npx cloudflared tunnel --url http://localhost:3000     # hoặc: ngrok http 3000
```
Sẽ có link `https://...` để mở trên điện thoại.

### Cài lên màn hình chính (sau khi có link HTTPS)
- **Android (Chrome)**: mở link → menu ⋮ → **“Cài đặt ứng dụng / Add to Home screen”**.
- **iPhone (Safari)**: mở link → nút **Chia sẻ** → **“Thêm vào MH chính”**.

App chạy toàn màn hình như app native, có icon riêng.

---

## 6. (Tùy chọn) Đóng gói file .apk bằng Capacitor

PWA ở mục 5 đã đủ cho nhu cầu “cài trên điện thoại”. Nếu bắt buộc cần **file .apk** để phát hành nội bộ:

```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Sagri Cham cong" com.sagrifood.hrm --web-dir=public
npx cap add android
# Trỏ app tới server đã deploy (sửa capacitor.config: server.url = "https://ten-app.vercel.app")
npx cap open android    # cần cài Android Studio để build ra .apk
```
> File **.ipa** (iOS) bắt buộc máy **Mac + Xcode + tài khoản Apple Developer ($99/năm)**. Với iPhone, dùng PWA (mục 5) là đơn giản nhất, không tốn phí.

---

## 7. Lưu ý bảo mật & giới hạn

- Đổi `JWT_SECRET` trong `.env` thành chuỗi ngẫu nhiên khi lên production.
- So khớp khuôn mặt hiện chạy **phía client**; muốn chống gian lận cao hơn có thể chuyển việc so khớp lên server.
- GPS có thể bị giả (Fake GPS). App đã chặn tọa độ có sai số bất thường; muốn chặt hơn cần thêm kiểm tra thiết bị.
- Ngưỡng khớp mặt `FACE_MATCH_THRESHOLD = 0.5` — giảm nếu muốn nghiêm ngặt hơn, tăng nếu hay bị nhận nhầm là “không khớp”.

---

## 8. File/route liên quan

| Chức năng | File |
|---|---|
| Giao diện chấm công (staff) | `app/attendance/page.tsx` |
| Xem lịch sử (staff) | `app/history/page.tsx` |
| Lõi geofence + trễ/sớm | `lib/attendance.ts`, `lib/attendance-core.ts` |
| So khớp khuôn mặt (client) | `lib/face-client.ts` + `public/models/` |
| API chấm công | `app/api/attendance/check-in/route.ts` |
| API đồng bộ offline | `app/api/attendance/sync/route.ts` |
| API lịch sử | `app/api/attendance/history/route.ts` |
| API hồ sơ + site | `app/api/me/route.ts`, `app/api/sites/route.ts` |
| API đăng ký khuôn mặt | `app/api/face/register/route.ts` |
| PWA | `public/manifest.json`, `public/sw.js`, `components/PWARegister.tsx` |
