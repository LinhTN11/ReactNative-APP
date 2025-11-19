# MyApp - Delivery Tracker & Real-time Chat

Ứng dụng kết hợp 2 tính năng:
- **Bài tập 1**: Theo dõi giao hàng với bản đồ, markers, route drawing
- **Bài tập 2**: Chat real-time với Firebase và Socket.IO

## 📱 Tính năng

### Tab 1: Delivery (Giao hàng)
- ✅ Hiển thị bản đồ Google Maps với dark theme
- ✅ 3 điểm giao hàng (Khách hàng A, B, C) tại Hà Nội
- ✅ Vẽ tuyến đường ngắn nhất bằng OpenRouteService API
- ✅ Hiển thị khoảng cách và thời gian di chuyển
- ✅ Toggle theo dõi vị trí real-time
- ✅ Giao diện tối giản, theme đen

### Tab 2: Chat
- ✅ Đăng nhập anonymous với Firebase Auth
- ✅ Gửi/nhận tin nhắn qua Firebase Firestore
- ✅ Hiển thị trạng thái online với dot xanh
- ✅ Giao diện chat bubble (tin của tôi màu xanh, người khác màu xám)
- ✅ Tích hợp Image Picker (chọn ảnh từ thư viện)
- 🔄 Socket.IO cho real-time messaging (cần setup server)

## 🚀 Cài đặt

### 1. Clone và cài dependencies

```bash
cd MyApp
npm install
```

### 2. Setup Firebase (BẮT BUỘC cho Chat)

Đọc file `FIREBASE_SETUP.md` để:
1. Tạo Firebase project
2. Bật Authentication (Anonymous)
3. Tạo Firestore Database
4. Copy config vào `constants/firebase.ts`

### 3. Setup Socket.IO Server (TÙY CHỌN cho real-time)

```bash
cd server
npm install
npm start
```

Server chạy tại `http://localhost:3000`

Chi tiết trong `server/README.md`

### 4. Chạy app

```bash
npx expo start
```

Nhấn:
- `a` - Mở Android emulator
- `i` - Mở iOS simulator  
- `w` - Mở web browser

## 📂 Cấu trúc project

```
MyApp/
├── app/
│   ├── (tabs)/
│   │   ├── delivery.tsx    # Màn hình bản đồ giao hàng
│   │   ├── chat.tsx         # Màn hình chat real-time
│   │   └── _layout.tsx      # Navigation tabs
│   └── _layout.tsx
├── constants/
│   ├── firebase.ts          # Firebase config (CẦN SETUP!)
│   └── google.ts            # Google Maps config
├── utils/
│   ├── firebase.ts          # Firebase initialization
│   └── decodePolyline.ts    # Decode route geometry
├── hooks/
│   └── use-socket.ts        # Socket.IO hook
├── server/
│   ├── socket-server.js     # Socket.IO backend
│   └── package.json
├── FIREBASE_SETUP.md        # Hướng dẫn setup Firebase
└── README.md
```

## 🔧 Config cần thiết

### 1. Firebase Config (`constants/firebase.ts`)

```typescript
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",              // ← Thay đổi
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. OpenRouteService API Key (đã setup)

API key trong `app/(tabs)/delivery.tsx` đã được cấu hình:
```typescript
const API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjlhY2NjNmIzMjU3ZjRhMDVhMzgxYTE0Y2FkZDY5NzIxIiwiaCI6Im11cm11cjY0In0=';
```

**Miễn phí**, không cần credit card!

## 🎨 Theme & Design

- Background: `#0a0a0a` (Đen)
- Accent/Primary: `#10b981` (Xanh lá)
- Cards: `#1a1a1a` (Xám đậm)
- Text: `#ffffff` (Trắng)
- Secondary text: `#8a8a8a` (Xám nhạt)

## 📱 Screenshots

### Delivery Tab
- Bản đồ với dark theme
- 3 markers xanh cho điểm giao hàng
- Route màu xanh lá nối giữa các điểm
- Overlay hiển thị "4.2 km • 7 phút"
- Switch toggle "Theo dõi vị trí"

### Chat Tab
- Màn hình login với nút "Đăng nhập Anonymous"
- Sau login: Chat bubbles, input box, nút đính kèm ảnh
- Tin nhắn của mình: Xanh lá, bên phải
- Tin nhắn người khác: Xám, bên trái

## 🐛 Troubleshooting

### Delivery Tab không hiển thị route
- Kiểm tra OpenRouteService API key
- Kiểm tra kết nối internet
- Xem console log để debug

### Chat không hoạt động
- Kiểm tra Firebase config trong `constants/firebase.ts`
- Vào Firebase Console kiểm tra Authentication đã bật Anonymous chưa
- Kiểm tra Firestore Database đã tạo ở test mode chưa

### Socket.IO không kết nối
- Kiểm tra server đã chạy: `cd server && npm start`
- Kiểm tra `SOCKET_SERVER_URL` trong `constants/firebase.ts`
- Nếu test trên thiết bị thật, dùng IP máy thay vì localhost

### Lỗi module not found
```bash
npm install
```

## 📚 Tech Stack

- **Framework**: Expo SDK 54 + React Native
- **Navigation**: expo-router (file-based routing)
- **Maps**: react-native-maps + expo-location
- **Routing API**: OpenRouteService (free)
- **Auth**: Firebase Authentication
- **Database**: Firebase Firestore
- **Real-time**: Socket.IO
- **Image**: expo-image-picker
- **Storage**: AsyncStorage

## 🎓 Học tập

### Bài tập 1: Delivery Tracker
- Sử dụng Google Maps SDK
- Tích hợp Directions API (OpenRouteService)
- Decode polyline geometry
- Location tracking với expo-location
- Custom map styling

### Bài tập 2: Real-time Chat
- Firebase Authentication (Anonymous)
- Firestore real-time listeners
- Socket.IO bidirectional events
- Image picker & upload
- Online/offline status tracking

## 📝 License

MIT

## 👨‍💻 Author

Student project for mobile development course## Delivery Map (Bài tập 1 - "Giao hàng quanh tôi")

This project includes an example Delivery screen that demonstrates:

- Displaying a map with Google maps provider using `react-native-maps`.
- Marking delivery locations with `Marker`.
- Drawing route from your current location to a selected delivery point via `Polyline`.
- Calling Google Directions API to fetch the route.
- A toggle to enable/disable tracking of the device location using `expo-location`.

How to run the Delivery map:

1. Add the new native dependencies and install them:

```powershell
expo install react-native-maps expo-location
npm install
```

2. Set a Google Maps Directions API key (create a project in GCP and enable Directions API). Then add the key to `app/constants/google.ts` or the `GOOGLE_MAPS_API_KEY` env var.

For native maps in a managed Expo app (to use Google Maps as provider on iOS/Android):

- Add to `app.json` (example):

```json
"android": {
   "config": {
      "googleMaps": {
         "apiKey": "YOUR_API_KEY"
      }
   }
},
"ios": {
   "config": {
      "googleMapsApiKey": "YOUR_API_KEY"
   }
}
```

Then rebuild the native app if you need native Google Maps support in a development build or production. For Expo Go you can still use the map but with limitations; follow the `react-native-maps` docs for details.

3. Start the app and open the `Giao hàng` tab to see the map. Tap any marker to draw a route from your current location to the marker.
