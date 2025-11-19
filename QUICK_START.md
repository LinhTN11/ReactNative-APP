# 🚀 Hướng dẫn nhanh - Chạy app

## ✅ Đã hoàn thành

1. ✅ Dependencies đã cài: Firebase, Socket.IO, Image Picker
2. ✅ Delivery tab: Bản đồ + route drawing hoạt động
3. ✅ Chat tab: Giao diện + Firebase integration đã tạo

## 🔥 BẮT ĐẦU NGAY

### Bước 1: Setup Firebase (5 phút)

**Quan trọng**: Chat tab cần Firebase để hoạt động!

1. Vào https://console.firebase.google.com/
2. Click "Add project" → Đặt tên "MyApp" → Create
3. Click icon Web `</>` → Đặt tên "MyApp Web" → Register
4. Copy config (có dạng apiKey, projectId, etc.)
5. Mở `constants/firebase.ts` → Paste vào thay YOUR_API_KEY, YOUR_PROJECT_ID...

6. **Bật Authentication**:
   - Sidebar → Authentication → Get started
   - Tab "Sign-in method" → Anonymous → Enable → Save

7. **Tạo Firestore**:
   - Sidebar → Firestore Database → Create database
   - Chọn "Start in test mode" → Location: asia-southeast1 → Enable

✅ Xong! Chat đã sẵn sàng.

### Bước 2: Chạy app

```bash
npx expo start
```

**Quan trọng**: 
- Nhấn `a` cho Android hoặc `i` cho iOS → Test CẢ 2 tab (Delivery + Chat)
- Nhấn `w` cho Web → Chỉ test Chat tab (Delivery dùng native maps, không chạy web)

### Bước 3: Test

#### Test Delivery (Tab 1) - CHỈ trên Android/iOS:
- Xem 3 markers xanh trên bản đồ Hà Nội
- Thấy route xanh lá nối giữa các điểm
- Overlay hiển thị "X km • Y phút"
- Toggle "Theo dõi vị trí" để bật location tracking

**Lưu ý**: Tab Delivery bị ẩn trên web vì `react-native-maps` chỉ chạy native.

#### Test Chat (Tab 2) - Chạy trên cả Web/Android/iOS:
- Click "Đăng nhập Anonymous"
- Gõ tin nhắn và gửi
- Thấy tin nhắn xuất hiện bên phải (màu xanh)
- Mở app trên thiết bị khác → Thấy tin nhắn real-time

## 📱 Không có Firebase? Chưa test được Chat!

Nếu bạn không setup Firebase:
- ❌ Chat tab sẽ không hoạt động
- ✅ Delivery tab vẫn chạy bình thường

## 🌐 (Tùy chọn) Socket.IO Server

Để có real-time messaging nhanh hơn Firestore:

```bash
cd server
npm install
npm start
```

Server chạy tại http://localhost:3000

Nhưng **Firestore đã đủ** cho chat real-time! Socket.IO chỉ là bonus.

## 🎯 Kết quả mong đợi

### Delivery Tab
```
┌─────────────────────────┐
│      Delivery           │
├─────────────────────────┤
│  📍 Bản đồ đen          │
│  📍 3 markers xanh      │
│  📍 Route xanh lá       │
│  ┌───────────────────┐  │
│  │ 4.2 km • 7 phút   │  │
│  └───────────────────┘  │
│  [ ] Theo dõi vị trí    │
└─────────────────────────┘
```

### Chat Tab (Sau login)
```
┌─────────────────────────┐
│  Chat      🟢 Anonymous │
├─────────────────────────┤
│                         │
│  ┌────────────┐         │
│  │ Hello! 👋 │ (Xám)   │
│  └────────────┘         │
│                         │
│         ┌──────────────┐│
│  (Xanh)│ Hi there! 😊 ││
│         └──────────────┘│
├─────────────────────────┤
│ 📎 [______________] ➤  │
└─────────────────────────┘
```

## 🐛 Lỗi thường gặp

### "Cannot find module 'firebase/auth'"
```bash
npm install
```

### Delivery không hiển thị route
- Kiểm tra internet
- API key OpenRouteService đã được cấu hình sẵn

### Chat không đăng nhập được
- Chưa setup Firebase config
- Chưa bật Anonymous auth trong Firebase Console

### "Missing or insufficient permissions"
- Chưa tạo Firestore Database
- Firestore không ở "test mode"

## 📚 Chi tiết hơn

- `README.md` - Tổng quan project
- `FIREBASE_SETUP.md` - Hướng dẫn chi tiết Firebase
- `server/README.md` - Hướng dẫn Socket.IO server

## 💡 Tips

1. **Test Chat nhanh nhất**: Chạy trên web (`w`) - mở 2 tabs để test real-time
2. **Test Delivery**: Phải dùng Android emulator (`a`) hoặc iOS simulator (`i`)
3. **Xem log**: Mở Console trong DevTools để debug
3. **Firebase test mode hết hạn sau 30 ngày** - Cần setup Security Rules sau đó
4. **OpenRouteService miễn phí** - Không cần credit card như Google

## ✨ Tính năng đã hoàn thiện

- ✅ Bài tập 1: Delivery map với route drawing
- ✅ Bài tập 2: Chat real-time với Firebase
- ✅ Dark theme tối giản
- ✅ Anonymous authentication
- ✅ Image picker integration
- ✅ Online status indicator
- ✅ Message bubbles với màu khác nhau

Chúc bạn code vui! 🎉
