# GPS Tracker - Real-time Location Sharing | ระบบติดตามตำแหน่งแบบเรียลไทม์

🇺🇸 [English](#english) | 🇹🇭 [ไทย](#thai)

---

## English

A web application that replicates iPhone's Precision Finding feature using GPS tracking. Share your location with others and track them in real-time with a directional arrow interface.

### Features

- 🗺️ **Real-time GPS tracking** between two users
- 🔗 **One-click location sharing** via unique URLs
- 🧭 **Directional UI** with arrow-based navigation
- 📱 **Responsive design** using Material UI
- 🚀 **No authentication required** - instant access
- ⚡ **Real-time updates** via WebSocket connection

### Tech Stack

- **Frontend**: React 18, TypeScript, Material UI
- **Backend**: Node.js, Express, Socket.IO
- **Real-time Communication**: WebSockets
- **Location**: HTML5 Geolocation API

### Getting Started

#### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### How to Use

#### Sharing Your Location

1. Open the app and click "Share My Location"
2. Allow location access when prompted
3. Click "Start Sharing Location"
4. Share the generated link with someone you want to track you

#### Tracking Someone

1. Open the shared location link
2. Allow location access when prompted
3. Click "Enable Location Tracking"
4. Follow the directional arrow to navigate to the person

### Features in Detail

#### Directional Arrow
- Points toward the target location
- Color-coded distance indication:
  - 🟢 Green: Very close (< 2m)
  - 🟡 Yellow: Close (2m - 15m)
  - 🟠 Orange: Medium distance (15m - 50m)
  - 🔴 Red: Far distance (> 50m)
- Shows exact distance and compass direction

#### Real-time Updates
- Location updates every few seconds
- WebSocket connection for instant updates
- Automatic reconnection on connection loss

#### Privacy & Sessions
- Sessions expire after 24 hours
- No data persistence beyond active sessions
- Location sharing stops when you close the app

### Browser Permissions

The app requires location permissions to function. When prompted:
1. Click "Allow" for location access
2. For best accuracy, enable "Precise Location" if available

### Supported Browsers

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Note: Location accuracy may vary by browser and device.

---

## Thai

แอปพลิเคชันเว็บที่จำลองฟีเจอร์ Precision Finding ของ iPhone โดยใช้การติดตาม GPS แชร์ตำแหน่งของคุณให้ผู้อื่นและติดตามพวกเขาแบบเรียลไทม์ด้วยอินเทอร์เฟซลูกศรทิศทาง

### คุณสมบัติ

- 🗺️ **การติดตาม GPS แบบเรียลไทม์** ระหว่างผู้ใช้สองคน
- 🔗 **การแชร์ตำแหน่งด้วยคลิกเดียว** ผ่าน URL เฉพาะ
- 🧭 **UI แสดงทิศทาง** ด้วยการนำทางแบบลูกศร
- 📱 **ออกแบบตอบสนอง** โดยใช้ Material UI
- 🚀 **ไม่ต้องลงทะเบียน** - เข้าใช้ได้ทันที
- ⚡ **อัปเดตแบบเรียลไทม์** ผ่าน WebSocket

### เทคโนโลยีที่ใช้

- **Frontend**: React 18, TypeScript, Material UI
- **Backend**: Node.js, Express, Socket.IO
- **การสื่อสารแบบเรียลไทม์**: WebSockets
- **ตำแหน่ง**: HTML5 Geolocation API

### เริ่มต้นใช้งาน

#### ความต้องการเบื้องต้น

- Node.js (เวอร์ชัน 16 ขึ้นไป)
- npm หรือ yarn

แอปพลิเคชันจะพร้อมใช้งานที่:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### วิธีการใช้งาน

#### การแชร์ตำแหน่งของคุณ

1. เปิดแอปและคลิก "Share My Location" (แชร์ตำแหน่งของฉัน)
2. อนุญาตการเข้าถึงตำแหน่งเมื่อมีการถาม
3. คลิก "Start Sharing Location" (เริ่มแชร์ตำแหน่ง)
4. แชร์ลิงก์ที่สร้างขึ้นให้กับคนที่คุณต้องการให้ตามคุณ

#### การติดตามใครสักคน

1. เปิดลิงก์แชร์ตำแหน่งที่ได้รับ
2. อนุญาตการเข้าถึงตำแหน่งเมื่อมีการถาม
3. คลิก "Enable Location Tracking" (เปิดใช้งานการติดตามตำแหน่ง)
4. ตามลูกศรทิศทางเพื่อไปหาคนนั้น

### รายละเอียดคุณสมบัติ

#### ลูกศรทิศทาง
- ชี้ไปยังตำแหน่งเป้าหมาย
- แสดงระยะทางด้วยสีที่แตกต่างกัน:
  - 🟢 เขียว: ใกล้มาก (< 2 เมตร)
  - 🟡 เหลือง: ใกล้ (2-15 เมตร)
  - 🟠 ส้ม: ระยะกลาง (15-50 เมตร)
  - 🔴 แดง: ไกล (> 50 เมตร)
- แสดงระยะทางที่แน่นอนและทิศทางเข็มทิศ

#### การอัปเดตแบบเรียลไทม์
- อัปเดตตำแหน่งทุกๆ สองสามวินาที
- การเชื่อมต่อ WebSocket สำหรับการอัปเดตทันที
- เชื่อมต่อใหม่อัตโนมัติเมื่อการเชื่อมต่อขาดหาย

#### ความเป็นส่วนตัวและเซสชัน
- เซสชันหมดอายุหลังจาก 24 ชั่วโมง
- ไม่มีการเก็บข้อมูลถาวรนอกเหนือจากเซสชันที่ใช้งานอยู่
- การแชร์ตำแหน่งจะหยุดเมื่อคุณปิดแอป

### สิทธิ์ของเบราว์เซอร์

แอปต้องการสิทธิ์เข้าถึงตำแหน่งเพื่อทำงาน เมื่อมีการถาม:
1. คลิก "อนุญาต" สำหรับการเข้าถึงตำแหน่ง
2. เพื่อความแม่นยำที่ดีที่สุด ให้เปิดใช้งาน "ตำแหน่งที่แม่นยำ" หากมี

### เบราว์เซอร์ที่รองรับ

- Chrome/Chromium (แนะนำ)
- Firefox
- Safari
- Edge

หมายเหตุ: ความแม่นยำของตำแหน่งอาจแตกต่างกันไปตามเบราว์เซอร์และอุปกรณ์

---

## Development / การพัฒนา

### Project Structure / โครงสร้างโปรเจค
```
├── src/
│   ├── components/          # React components / คอมโพเนนต์ React
│   ├── hooks/              # Custom React hooks / React hooks แบบกำหนดเอง
│   ├── utils/              # Utility functions / ฟังก์ชันยูทิลิตี้
│   └── App.tsx             # Main application / แอปพลิเคชันหลัก
├── server/
│   ├── server.js           # Express server / เซิร์ฟเวอร์ Express
│   └── package.json        # Server dependencies / dependencies ของเซิร์ฟเวอร์
└── package.json            # Frontend dependencies / dependencies ของ frontend
```

### API Endpoints

- `POST /api/create-session` - Create new sharing session / สร้างเซสชันแชร์ใหม่
- `GET /api/session/:id` - Verify session exists / ตรวจสอบว่าเซสชันมีอยู่

### WebSocket Events

- `join-session` - Join a location sharing session / เข้าร่วมเซสชันแชร์ตำแหน่ง
- `update-location` - Send location update / ส่งการอัปเดตตำแหน่ง
- `location-update` - Receive location update / รับการอัปเดตตำแหน่ง

## License / ใบอนุญาต

MIT License

## Contributing / การมีส่วนร่วม

1. Fork the repository / Fork repository
2. Create a feature branch / สร้าง feature branch
3. Make your changes / ทำการเปลี่ยนแปลง
4. Submit a pull request / ส่ง pull request
