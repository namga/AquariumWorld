## v2.3.0 – Realistic Aquascape

This release focuses on a more natural 3D aquarium: detailed procedural fish anatomy, more organic aquatic plants, irregular stones and improved physically based water and lighting. Choose Low, Medium, High or Ultra in Settings to balance visual quality and device performance.

# Aquarium World v2.1.0 — Realistic 3D

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

## v2.0.3 – Fix Vite entry module
- Vite previously searched for `index.html` in the repository root, but the actual entry is `src/index.html`.
- Added `vite.config.js` with `root: src`, `publicDir: public`, and output directory `dist`.
- Updated dev/build/preview scripts to use this config and use relative asset base paths for Web/PWA and Capacitor.
- GitHub Actions artifacts are versioned v2.0.3.

## v2.1.0 – Living Aquarium update
- Added a designed app icon: PWA PNG icons (192/512 px), Apple touch icon, Android density icons and adaptive launcher icon.
- Android workflow installs the native launcher icon resources after Capacitor creates the Android project.
- Added daily feeding reminder settings. Android uses Capacitor Local Notifications; Web notifications and in-page feeding run while the page is open. When the app is reopened, a missed scheduled feeding is caught up.
- Added aquarium photo capture, local album thumbnails, individual downloads and album export.
- Added Bright, Ocean and Dark themes.
- Added shrimp, nerite snail and mini crab procedural 3D models, plus Java fern, Vallisneria, Anubias, red stem plants, moss and hornwort.
- Added coral, driftwood, cave and underwater temple decorations.
- Fish and invertebrate age is based on wall-clock time; their displayed age, 3D scale and color progression update even when the app is closed. Plant growth is tied to aquarium age.
- Added `@capacitor/local-notifications` for native Android reminders.

### Android icons and build
After `npx cap add android`, run:
```bash
python3 scripts/install-android-icons.py
npx cap sync android
```
The GitHub Actions workflow performs the icon installation automatically.

### Scheduling limitation
Android schedules a native daily reminder even when the app is closed. Automatic in-game food-state changes are applied while the game is running or when it next resumes; the OS notification itself does not run JavaScript game logic while the app process is stopped. On Web/PWA, reminders require the page to be open because browser-only scheduled notifications cannot be guaranteed in the background without a push server.

## v2.3.0 – Realistic Aquascape
- Reworked fish models with higher-detail bodies, articulated fin shapes, eyes, gill details and scale highlights.
- Replaced primitive plant forms with curved stems and lance-shaped leaves; improved carpet vegetation, rocks, driftwood, water material and lighting.
- Added Low / Medium / High / Ultra 3D graphics quality controls.

## v2.2.0 – Aquascape Studio
- Added free-design mode for the 3D aquarium.
- Tap/select and drag owned plants, decorations, fish and invertebrates in the tank.
- Rotate selected objects in 15-degree steps; scale from 35% to 280%; remove selected objects.
- Add extra copies of already-owned plants and decorations from the in-game Studio palette.
- Save and restore item positions, rotations and scale in the local game save and JSON backup.
- Studio mode temporarily pauses fish/invertebrate swimming so the player can position them precisely.
- Added mobile touch/pointer interactions and a responsive editing toolbar.

- Android Gradle version is synchronized to `versionCode 230` and `versionName 2.3.0` during CI so the installed app version matches the ZIP and APK filename.
