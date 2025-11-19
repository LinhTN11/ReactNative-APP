# 🔧 Troubleshooting - Xử lý lỗi thường gặp

## 🚀 Lỗi khi chạy app

### ❌ "Cannot find module 'firebase'"

**Nguyên nhân**: Dependencies chưa cài

**Giải pháp**:
```bash
npm install
```

Nếu vẫn lỗi:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

---

### ❌ "Metro bundler error"

**Nguyên nhân**: Cache bị lỗi

**Giải pháp**:
```bash
npx expo start -c
```

Hoặc:
```bash
npx expo start --clear
```

---

### ❌ "Unable to resolve module"

**Nguyên nhân**: Import path sai hoặc module chưa cài

**Giải pháp**:
1. Kiểm tra import path có đúng không
2. Kiểm tra file có tồn tại không
3. Restart Metro bundler (R trong terminal)

---

## 🗺️ Lỗi Delivery Tab

### ❌ Bản đồ không hiển thị (màn hình trắng)

**Nguyên nhân**: Google Maps API chưa setup

**Giải pháp** (Android):
1. Mở `android/app/src/main/AndroidManifest.xml`
2. Thêm:
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
```

**Giải pháp** (iOS):
1. Mở `ios/MyApp/AppDelegate.m`
2. Thêm:
```objc
@import GoogleMaps;
[GMSServices provideAPIKey:@"YOUR_GOOGLE_MAPS_API_KEY"];
```

**Hoặc dùng Web** (không cần config):
```bash
npx expo start
# Nhấn 'w' cho web browser
```

---

### ❌ Không hiển thị route (chỉ có markers)

**Nguyên nhân**: 
1. OpenRouteService API request failed
2. Không có internet
3. API key sai

**Giải pháp**:
1. Mở DevTools (F12 trong browser)
2. Xem tab Console
3. Tìm error message

**Debug code**:
```typescript
// Trong fetchDirectionsTo():
console.log('API Response:', data);
```

**Kiểm tra API**:
```bash
curl "https://api.openrouteservice.org/v2/directions/driving-car?api_key=YOUR_KEY&start=105.8542,21.0285&end=105.8412,21.0245"
```

---

### ❌ Route info không hiển thị (km, phút)

**Nguyên nhân**: API response không có distance/duration

**Giải pháp**:
Kiểm tra response trong console:
```typescript
console.log('Route info:', {
  distance: data.features[0].properties.segments[0].distance,
  duration: data.features[0].properties.segments[0].duration,
});
```

Nếu undefined → API response format thay đổi

---

### ❌ Location tracking không hoạt động

**Nguyên nhân**: Chưa cấp quyền location

**Giải pháp** (Android/iOS):
1. Settings → Apps → MyApp → Permissions → Location → Allow
2. Hoặc uninstall app và cài lại → Cho phép khi hỏi

**Giải pháp** (Web):
1. Trình duyệt hỏi "Allow location" → Click Allow
2. Hoặc vào Settings → Privacy → Location → Allow

---

## 💬 Lỗi Chat Tab

### ❌ "Firebase: Error (auth/invalid-api-key)"

**Nguyên nhân**: Firebase config sai

**Giải pháp**:
1. Mở `constants/firebase.ts`
2. Kiểm tra `apiKey` có đúng không
3. Copy lại từ Firebase Console:
   - Vào Project Settings
   - Scroll xuống "Your apps"
   - Copy config

**Lưu ý**: `apiKey` phải bắt đầu bằng `AIzaSy...`

---

### ❌ "Firebase: Error (auth/operation-not-allowed)"

**Nguyên nhân**: Anonymous auth chưa bật

**Giải pháp**:
1. Firebase Console → Authentication
2. Tab "Sign-in method"
3. Click "Anonymous"
4. Toggle sang **ON**
5. Click "Save"

---

### ❌ "Missing or insufficient permissions"

**Nguyên nhân**: 
1. Firestore chưa tạo
2. Hoặc tạo ở "production mode" thay vì "test mode"

**Giải pháp**:
1. Firebase Console → Firestore Database
2. Nếu chưa có → Click "Create database"
3. Chọn **"Start in test mode"** (quan trọng!)
4. Location: asia-southeast1
5. Enable

**Nếu đã tạo nhưng vẫn lỗi**:
1. Firestore → Rules tab
2. Sửa thành:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Test mode - ĐỂ TẠM 30 NGÀY
    }
  }
}
```
3. Publish rules

---

### ❌ Không đăng nhập được (nút không phản hồi)

**Nguyên nhân**: Firebase chưa khởi tạo đúng

**Giải pháp**:
1. Mở `utils/firebase.ts`
2. Kiểm tra code:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '@/constants/firebase';

const app = initializeApp(FIREBASE_CONFIG);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

3. Restart app (R trong terminal)

---

### ❌ Không thấy tin nhắn của người khác

**Nguyên nhân**: Firestore real-time listener chưa hoạt động

**Giải pháp**:
1. Kiểm tra code trong `chat.tsx`:
```typescript
useEffect(() => {
  if (!user) return;
  
  const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const msgs: Message[] = [];
    snapshot.forEach((doc) => {
      msgs.push({ id: doc.id, ...doc.data() } as Message);
    });
    setMessages(msgs);
  });

  return () => unsubscribe();
}, [user]);
```

2. Kiểm tra Firebase Console → Firestore → Data
   - Có collection `messages` không?
   - Có documents bên trong không?

---

### ❌ Image picker không hoạt động

**Nguyên nhân**: Permission chưa được cấp

**Giải pháp** (Mobile):
1. Settings → Apps → MyApp → Permissions → Storage → Allow

**Giải pháp** (Web):
```typescript
// Web không hỗ trợ expo-image-picker
// Dùng <input type="file"> thay thế
```

---

## 🌐 Lỗi Socket.IO (Nếu dùng)

### ❌ "Cannot connect to Socket.IO server"

**Nguyên nhân**: Server chưa chạy

**Giải pháp**:
```bash
cd server
npm install
npm start
```

Kiểm tra server đang chạy:
```
✅ Socket.IO server running on port 3000
```

---

### ❌ "Connection refused" (khi test trên thiết bị thật)

**Nguyên nhân**: `localhost` không accessible từ thiết bị

**Giải pháp**:
1. Tìm IP máy tính:
   ```bash
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```
   
2. Sửa `constants/firebase.ts`:
   ```typescript
   export const SOCKET_SERVER_URL = "http://192.168.1.100:3000";
   //                                      ↑ IP máy tính của bạn
   ```

3. Đảm bảo máy tính và điện thoại cùng WiFi

---

## 📱 Lỗi build/compile

### ❌ TypeScript errors

**Nguyên nhân**: Type không khớp

**Giải pháp**:
1. Kiểm tra import có đúng không
2. Thêm type annotations:
```typescript
const [messages, setMessages] = useState<Message[]>([]);
```

3. Hoặc ignore tạm:
```typescript
// @ts-ignore
```

---

### ❌ "Expo SDK version mismatch"

**Nguyên nhân**: Dependencies không tương thích

**Giải pháp**:
```bash
npx expo install --fix
```

Hoặc:
```bash
npx expo-doctor
```

---

## 🔍 Debug tips

### Xem logs

**Terminal**:
```bash
npx expo start
# Logs hiển thị trong terminal
```

**Browser Console** (Web):
1. F12 hoặc Ctrl+Shift+J
2. Tab Console
3. Tìm errors màu đỏ

**React Native Debugger**:
```bash
npx react-devtools
```

---

### Thêm console.log

```typescript
// Trong chat.tsx
const handleLogin = async () => {
  console.log('Login button clicked');
  try {
    const result = await signInAnonymously(auth);
    console.log('Login success:', result.user.uid);
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

---

### Clear all cache

```bash
# Clear Metro bundler
npx expo start -c

# Clear npm cache
npm cache clean --force

# Clear Expo cache
rm -rf .expo
rm -rf node_modules
npm install
```

---

## 🆘 Vẫn không giải quyết được?

### Checklist cuối cùng

- [ ] `npm install` đã chạy chưa?
- [ ] Firebase config đã paste đúng chưa?
- [ ] Anonymous auth đã bật chưa?
- [ ] Firestore đã tạo ở test mode chưa?
- [ ] Internet có hoạt động không?
- [ ] Đã restart app chưa? (R trong terminal)
- [ ] Đã clear cache chưa? (`npx expo start -c`)

---

### Tìm help

1. **Đọc error message** - Thường có hint
2. **Console log** - `console.log()` everywhere
3. **Firebase Console** - Xem data có đúng không
4. **Google error message** - Thường có câu trả lời
5. **Expo documentation** - https://docs.expo.dev/

---

## 📞 Contact

Nếu gặp lỗi không có trong list này:
1. Copy full error message
2. Copy code gây lỗi
3. Gửi cho giáo viên/bạn bè

---

**99% lỗi đều do:**
- ❌ Chưa chạy `npm install`
- ❌ Firebase config sai
- ❌ Chưa bật Anonymous auth
- ❌ Firestore chưa ở test mode

**Kiểm tra 4 điều này trước!** ✅
