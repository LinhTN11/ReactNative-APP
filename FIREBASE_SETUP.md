# Hướng dẫn cài đặt Firebase

## Bước 1: Tạo Firebase Project

1. Vào https://console.firebase.google.com/
2. Click "Add project" (Thêm dự án)
3. Đặt tên project (ví dụ: "MyApp Chat")
4. Tắt Google Analytics (không bắt buộc cho chat)
5. Click "Create project"

## Bước 2: Tạo Web App

1. Trong Firebase Console, click vào icon Web `</>` (Add app)
2. Đặt tên app (ví dụ: "MyApp Web")
3. KHÔNG check "Also set up Firebase Hosting"
4. Click "Register app"
5. Copy đoạn config có dạng:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "myapp-xxxxx.firebaseapp.com",
  projectId: "myapp-xxxxx",
  storageBucket: "myapp-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

6. Mở file `constants/firebase.ts` và thay thế các giá trị YOUR_API_KEY, YOUR_PROJECT_ID, etc.

## Bước 3: Bật Firebase Authentication

1. Trong Firebase Console, vào "Authentication" (Xác thực)
2. Click "Get started"
3. Chọn tab "Sign-in method"
4. Bật "Anonymous" - toggle sang ON
5. Click "Save"

## Bước 4: Tạo Firestore Database

1. Trong Firebase Console, vào "Firestore Database"
2. Click "Create database"
3. Chọn "Start in test mode" (cho development)
4. Chọn location gần nhất (asia-southeast1 cho Việt Nam)
5. Click "Enable"

**Lưu ý**: Test mode cho phép read/write tự do trong 30 ngày. Sau đó cần setup security rules.

## Bước 5: (Tùy chọn) Firebase Storage cho ảnh

1. Vào "Storage" trong Firebase Console
2. Click "Get started"
3. Chọn "Start in test mode"
4. Click "Next" và "Done"

## Bước 6: Cài đặt dependencies

Mở terminal và chạy:

```bash
npm install
```

Dependencies đã được thêm vào package.json:
- firebase
- socket.io-client (cho real-time chat)
- expo-image-picker (gửi ảnh)
- @react-native-async-storage/async-storage (lưu session)

## Kiểm tra

Sau khi setup xong:
1. Chạy `npx expo start`
2. Vào tab Chat
3. Click "Đăng nhập Anonymous"
4. Bắt đầu chat!

## Troubleshooting

**Lỗi "Firebase: Error (auth/invalid-api-key)"**
- Kiểm tra lại apiKey trong constants/firebase.ts

**Lỗi "Firebase: Error (auth/operation-not-allowed)"**
- Bật Anonymous authentication trong Firebase Console

**Lỗi "Missing or insufficient permissions"**
- Firestore chưa được tạo hoặc chưa ở test mode
