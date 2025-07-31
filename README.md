# BidScents Mobile App

## Quick Team Setup

### 1. Clone and Install
```bash
git clone https://github.com/BidScents/mobile.git
cd bidscents-mobile
bun install 
```

### 2. Get Development Build

**iOS:** Download and install from here:
https://expo.dev/accounts/bidscents/projects/bidscents/builds/5c9e4537-0e35-413e-b8cd-0173fff79be2

**Android:** Build yourself:
```bash
bun add -g eas-cli && eas login
eas build --platform android --profile development
```

### 3. Connect to Local Backend

#### Find Your IP Address:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows  
ipconfig
```

#### Update Environment (Without Rebuilding):
Create `.env` file with your IP:
```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.XXX:8000  # Your IP here
```

#### Start Backend:
```bash
# In backend directory - MUST use --host 0.0.0.0
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Start Mobile Development:
```bash
bun expo start --dev-client --clear
```

**Scan QR code with your phone's camera → Opens in development build**

### 4. Test Connection
Open Safari on your phone: `http://YOUR_IP:8000/docs`
If you see FastAPI docs, you're connected! ✅

---

## Development vs Production

| Method | Features | Setup Time |
|--------|----------|------------|
| **Development Build** | ✅ Push notifications, ✅ All features | 5 min (download) |
| **Simulator/Local** | ❌ Limited features | 30 sec |

**Use development builds for testing notifications and real app features.**

---

## Daily Workflow
1. `git pull && bun install`
2. Update `.env` with your IP if changed  
3. Start backend: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
4. Start mobile: `bun expo start --dev-client --clear`
5. Scan QR code with development build
6. Code with hot reload 🔥

---

## Quick Fixes

| Problem | Solution |
|---------|----------|
| Red boxes after `bun install` | `bun expo start --clear` |
| "Network request failed" | Check IP in `.env` matches your computer |
| Can't reach backend from phone | Backend must use `--host 0.0.0.0` |
| Need to change IP | Update `.env` and restart: `bun expo start --dev-client --clear` |

**💡 Environment changes (`.env`) don't require rebuilding - just restart the dev server!**

---

## Technologies Used

| Area       | Stack                                            |
| ---------- | ------------------------------------------------ |
| UI Kit     | [`tamagui`](https://tamagui.dev) (native + web)  |
| Fonts      | Roboto (Expo Font Loader)                        |
| Navigation | `expo-router`                                    |
| Theme      | Custom light/dark themes via `Theme` + tokens    |
| State      | Zustand from shared sdk                          |

---

## Theming with Tamagui

Tamagui is configured with:

* Custom **Roboto font** via `expo-font`
* Light & dark theme tokens (`tamagui.config.ts`)
* Global font defaults + scalable sizes

Use `$color`, `$background`, or semantic color tokens in components:

```tsx
<Button backgroundColor="$color">Place Bid</Button>
```

---

## Development Tips

* Use `useColorScheme()` to adapt themes
* Use `useTheme()` to dynamically access theme values in components
* tbc...

---

## Scripts

```json
"scripts": {
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "web": "expo start --web",
  "lint": "eslint . --ext .ts,.tsx",
  "format": "prettier --write ."
}
```

---

## Troubleshooting

### Build Issues - Quick Fixes

Try these in order when you get red boxes or build errors:

#### 1. Clear Metro Cache (30s) ⚡
```bash
bun expo start --clear
```
**Use for:** Red boxes, module errors, after installing dependencies

#### 2. Reset All Caches (1-2min) 🔄
```bash
pkill -f "expo\|metro"
bun expo start --clear --reset-cache
```
**Use if:** Step 1 failed, after RN/Expo updates

#### 3. Reset Node Modules (2-3min) 📦
```bash
rm -rf node_modules && bun install
bun expo start --clear
```
**Use for:** Package conflicts, major dependency changes

#### 4. Full Prebuild (5-10min) 💥
```bash
bun expo prebuild --clean
bun expo run:ios
```
**Use for:** Native dependencies, config changes, iOS/Android errors

### Quick Reference

| Issue | Solution | Time |
|-------|----------|------|
| Added JS dependencies | Step 1 | 30s |
| Added native dependencies | Step 4 | 5-10min |
| Random red box | Step 1 | 30s |
| Changed expo config | Step 4 | 5-10min |
| Package conflicts | Step 3 | 2-3min |

### Emergency Reset
```bash
rm -rf node_modules ios android .expo
bun install && bun expo prebuild --clean && bun expo run:ios
```

**💡 Rule: Always try Step 1 first after adding dependencies!**


---