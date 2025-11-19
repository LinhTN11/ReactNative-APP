# ✅ FIREBASE SETUP CHECKLIST (In ra và làm theo)

## 1️⃣ TẠO PROJECT (2 phút)
- [ ] Vào https://console.firebase.google.com/
- [ ] Click "Add project"
- [ ] Tên: MyApp
- [ ] Tắt Analytics
- [ ] Click "Create"

## 2️⃣ TẠO WEB APP (1 phút)
- [ ] Click icon `</>` (Web)
- [ ] Nickname: MyApp Web
- [ ] Click "Register"
- [ ] **COPY config** (quan trọng!)

## 3️⃣ BẬT AUTHENTICATION (1 phút)
- [ ] Sidebar → Authentication
- [ ] Get started
- [ ] Sign-in method → Anonymous
- [ ] Toggle ON → Save

## 4️⃣ TẠO FIRESTORE (1 phút)
- [ ] Sidebar → Firestore Database
- [ ] Create database
- [ ] **"Start in test mode"** ← Quan trọng!
- [ ] Location: asia-southeast1
- [ ] Enable

## 5️⃣ PASTE CONFIG (30 giây)
- [ ] Mở `constants/firebase.ts`
- [ ] Thay YOUR_API_KEY, YOUR_PROJECT_ID, etc.
- [ ] Lưu file (Ctrl+S)

## 6️⃣ CHẠY APP (30 giây)
```
npx expo start
```
- [ ] Nhấn `w` cho web

## 7️⃣ TEST (1 phút)
- [ ] Tab Delivery: Thấy map + route
- [ ] Tab Chat: Click "Đăng nhập Anonymous"
- [ ] Gõ tin nhắn → Send
- [ ] Thấy tin nhắn màu xanh

✅ **XONG!**

---

## 📋 Config cần copy

Từ Firebase Console, copy đoạn này:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",                     ← Copy dòng này
  authDomain: "myapp-xxx.firebaseapp.com", ← Copy dòng này
  projectId: "myapp-xxx",                  ← Copy dòng này
  storageBucket: "myapp-xxx.appspot.com",  ← Copy dòng này
  messagingSenderId: "123456789",          ← Copy dòng này
  appId: "1:123456789:web:abc..."         ← Copy dòng này
};
```

Paste vào `constants/firebase.ts`:

```typescript
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",        ← Paste ở đây
  authDomain: "myapp-xxx...", ← Paste ở đây
  projectId: "myapp-xxx",     ← Paste ở đây
  // ... etc
};
```

---

## 🚨 LƯU Ý QUAN TRỌNG

1. **PHẢI chọn "test mode"** khi tạo Firestore
   - Nếu chọn "production mode" → App không hoạt động

2. **PHẢI bật "Anonymous"** trong Authentication
   - Nếu không bật → Không đăng nhập được

3. **PHẢI copy config ĐÚNG**
   - Sai 1 ký tự → Lỗi

---

**Tổng thời gian: 6-7 phút** ⏰
