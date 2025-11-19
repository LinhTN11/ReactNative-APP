# Socket.IO Server Setup

## Cài đặt

Mở terminal và chạy:

```bash
cd server
npm install
```

## Chạy server

### Development (auto-restart khi code thay đổi)
```bash
npm run dev
```

### Production
```bash
npm start
```

Server sẽ chạy tại: http://localhost:3000

## Kết nối từ app

Trong file `constants/firebase.ts`, cập nhật:

```typescript
export const SOCKET_SERVER_URL = "http://localhost:3000";
```

**Lưu ý**: 
- Nếu test trên thiết bị thật, thay `localhost` bằng IP máy tính (ví dụ: `http://192.168.1.100:3000`)
- Tìm IP bằng: `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux)

## Socket Events

### Client gửi đến server:
- `user-join` - Khi user đăng nhập
- `send-message` - Gửi tin nhắn
- `typing` - Đang gõ
- `stop-typing` - Ngừng gõ

### Server gửi đến clients:
- `user-online` - User online
- `user-offline` - User offline
- `new-message` - Tin nhắn mới
- `user-typing` - User đang gõ
- `user-stop-typing` - User ngừng gõ

## Deploy (Production)

### Railway.app (Free tier, đơn giản nhất)
1. Vào https://railway.app/
2. Sign up với GitHub
3. New Project > Deploy from GitHub
4. Chọn repo của bạn
5. Root Directory: `/server`
6. Railway sẽ tự động deploy

### Render.com (Free tier)
1. Vào https://render.com/
2. New > Web Service
3. Connect GitHub repo
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `npm start`

Sau khi deploy, lấy URL (ví dụ: `https://myapp.railway.app`) và cập nhật vào `constants/firebase.ts`.
