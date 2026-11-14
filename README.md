# Aquarium World v2.0.2 — Realistic 3D

Nâng cấp trực tiếp từ source v1.0.0. Một codebase dùng cho Web/PWA và Android qua Capacitor.

## Điểm mới v2.0.0
- Thay bể Canvas 2D bằng cảnh Three.js 3D realtime.
- Bể kính, khung kim loại, nước, cát, đá, lũa, cây thủy sinh và thảm cây được dựng procedural.
- Cá 3D có thân, vây, đuôi, mắt; hoạt ảnh bơi độc lập và chuyển động đuôi.
- Bong bóng nổi, ánh sáng, bóng đổ, sương nhẹ và vật liệu vật lý.
- OrbitControls: kéo để xoay, cuộn/chụm để zoom; nút reset góc nhìn.
- Giữ game loop: chăm sóc, chỉ số, xu, XP, cấp độ, nhiệm vụ, cửa hàng và local save.
- Thêm xuất/nhập JSON backup.
- Responsive layout cho desktop, tablet và điện thoại.

## Chạy Web
Node.js 20+:
```bash
npm install
npm run dev
```
Build production:
```bash
npm run build
npm run preview
```

## Android APK
Cần JDK 21 và Android SDK:
```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```
Trong Android Studio build APK hoặc chạy:
```bash
cd android && ./gradlew assembleDebug
```

## GitHub Actions
Push source lên GitHub. Workflow `.github/workflows/build-apk.yml` build APK khi push main/master hoặc chạy thủ công. Artifact: `Aquarium-World-v2.0.0-Android-APK`.

## Dữ liệu và đồng bộ
Tiến trình được lưu cục bộ trên từng thiết bị (localStorage). Có thể xuất/nhập file JSON để chuyển thủ công giữa Web và Android. Đồng bộ tự động qua tài khoản giữa nhiều thiết bị chưa được bật vì cần backend, xác thực và cấu hình dịch vụ riêng; không giả lập tính năng cloud sync khi chưa có máy chủ.

## Lưu ý kỹ thuật
Three.js được đóng gói vào bundle Vite nên mô hình 3D không cần tải thư viện từ CDN khi chạy. 3D được dựng từ hình học procedural, chưa dùng model 3D nghệ thuật bên ngoài. Hiệu năng phụ thuộc GPU/thiết bị; renderer giới hạn pixel ratio trên mobile.


## v2.0.1 – GitHub Actions fix
- Removed `cache: npm` from `actions/setup-node@v4`; the repository does not commit a package-lock file, and npm cache setup requires one.
- The workflow now runs `npm install` first, builds the web assets, adds the Android platform only when missing, syncs Capacitor, and builds the debug APK.
- Uploads separate Android APK and Web build artifacts.


## v2.0.2 – Android build pipeline
- Uses `android-actions/setup-android@v4` and pins command-line tools 13.0 to avoid the failing default SDK manager revision observed in the previous GitHub Actions run.
- Installs Android SDK Platform 35 and Build Tools 35.0.0 explicitly.
- APK artifact is named `Aquarium-World-v2.0.2-debug.apk`.
