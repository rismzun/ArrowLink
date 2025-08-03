# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# GPS Tracker - Real-time Location Sharing

A web application that replicates iPhone's Precision Finding feature using GPS tracking. Share your location with others and track them in real-time with a directional arrow interface.

## Features

- 🗺️ **Real-time GPS tracking** between two users
- 🔗 **One-click location sharing** via unique URLs
- 🧭 **Directional UI** with arrow-based navigation
- 📱 **Responsive design** using Material UI
- 🚀 **No authentication required** - instant access
- ⚡ **Real-time updates** via WebSocket connection

## Tech Stack

- **Frontend**: React 18, TypeScript, Material UI
- **Backend**: Node.js, Express, Socket.IO
- **Real-time Communication**: WebSockets
- **Location**: HTML5 Geolocation API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install frontend dependencies:
```bash
npm install
```

2. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### Running the Application

#### Option 1: Run both frontend and backend together (Recommended)
```bash
npm run dev:full
```

#### Option 2: Run separately
Terminal 1 (Backend):
```bash
npm run dev:server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## How to Use

### Sharing Your Location

1. Open the app and click "Share My Location"
2. Allow location access when prompted
3. Click "Start Sharing Location"
4. Share the generated link with someone you want to track you

### Tracking Someone

1. Open the shared location link
2. Allow location access when prompted
3. Click "Enable Location Tracking"
4. Follow the directional arrow to navigate to the person

## Features in Detail

### Directional Arrow
- Points toward the target location
- Color-coded distance indication:
  - 🟢 Green: Very close (< 10m)
  - 🟡 Yellow: Medium distance (10m - 1km)
  - 🔴 Red: Far distance (> 1km)
- Shows exact distance and compass direction

### Real-time Updates
- Location updates every few seconds
- WebSocket connection for instant updates
- Automatic reconnection on connection loss

### Privacy & Sessions
- Sessions expire after 24 hours
- No data persistence beyond active sessions
- Location sharing stops when you close the app

## Browser Permissions

The app requires location permissions to function. When prompted:
1. Click "Allow" for location access
2. For best accuracy, enable "Precise Location" if available

## Supported Browsers

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Note: Location accuracy may vary by browser and device.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
