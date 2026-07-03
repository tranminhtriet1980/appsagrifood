# Hướng dẫn cài app lên điện thoại — Sagri Chấm công

## File cài đặt (Android)
📦 **`installer/Sagri-ChamCong.apk`** (đã build sẵn, ~3.6 MB)

- Package: `com.sagrifood.hrm` · Tên: **Sagri Chấm công**
- Quyền: Camera + Vị trí (GPS) + Internet — đủ để đăng ký khuôn mặt và chấm công.

---

## ⚠️ ĐIỀU KIỆN để APK chạy được (đọc kỹ)

APK này là **vỏ native bọc app web**: nó mở nội dung thật từ một **địa chỉ HTTPS**. Hiện đang trỏ tới link tạm (tunnel) của máy dev:

```
https://res-para-dated-ken.trycloudflare.com
```

Để điện thoại chấm công được thì **link này phải đang sống**, tức trên máy PC:
1. `docker compose up -d` (bật Postgres)
2. `npm run dev` (chạy app)
3. Tunnel cloudflared đang chạy (lệnh: `npx cloudflared tunnel --url http://localhost:3000`)

> Link tunnel **đổi mỗi lần chạy lại**. Nếu đổi link → phải **build lại APK** (xem mục dưới). Muốn dùng ổn định lâu dài → **deploy** để có tên miền cố định (xem `HUONG_DAN_CHAM_CONG.md` mục 5).

---

## Cài trên ANDROID
1. Chép file `installer/Sagri-ChamCong.apk` vào điện thoại (Zalo/USB/Google Drive…).
2. Mở file → Android hỏi thì bật **“Cho phép cài từ nguồn này”** (Unknown sources).
3. Cài xong, mở app **Sagri Chấm công**.
4. Lần đầu: **cho phép Camera và Vị trí**.
5. Đăng nhập (VD `NV001 / 123456`) → mục Chấm công → **Đăng ký khuôn mặt** (1 lần) → **Vào ca / Tan ca**.

## Cài trên iPHONE / iPad
> ❗ **Không thể tạo file `.ipa` trên máy Windows** (Apple bắt buộc máy Mac + Xcode + tài khoản Apple Developer $99/năm). Cách cài trên iPhone **không cần file**, dùng PWA:

1. Mở **Safari** (bắt buộc Safari), vào link HTTPS ở trên.
2. Bấm nút **Chia sẻ** (ô vuông mũi tên) → **“Thêm vào MH chính”**.
3. App icon hiện trên màn hình như app thường → mở lên → cho phép Camera + Vị trí → chấm công.

PWA này chạy đầy đủ camera + GPS + check-in/checkout y như APK (vì đều qua HTTPS).

---

## Build lại APK khi đổi địa chỉ (URL)
Khi bạn có link mới (tunnel mới hoặc tên miền production):

```powershell
.\build-apk.ps1 -Url "https://dia-chi-moi-cua-ban"
```
Chạy xong file mới nằm ở `installer\Sagri-ChamCong.apk`. Cài đè lên máy điện thoại.

> Nếu cài toolchain ở nơi khác, sửa 2 dòng `JAVA_HOME` / `ANDROID_HOME` đầu file `build-apk.ps1`.

---

## Build app iOS native (.ipa) — chỉ khi có máy Mac
Trên máy **macOS** đã cài Xcode + CocoaPods:
```bash
npm install
npm install @capacitor/ios
npx cap add ios
# sửa server.url trong capacitor.config.ts thành tên miền production của bạn
npx cap sync ios
npx cap open ios     # mở Xcode -> Archive -> xuất .ipa (cần Apple Developer)
```

---

## Toolchain đã cài (để build Android trên máy này)
- JDK 17: `C:\Users\EDUPATH\hrm-toolchain\jdk-extract\jdk-17.0.19+10`
- Android SDK: `C:\Users\EDUPATH\hrm-toolchain\android-sdk` (platform-tools, platforms;android-34, build-tools;34.0.0)
- Cấu hình app native: `capacitor.config.ts`, thư mục `android/`
