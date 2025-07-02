# BidScents Mobile App (Expo)

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/BidScents/mobile.git
cd bidscents-mobile
bun install 
```

### 2. Start Development

```bash
bun expo start
```

Use the Expo Dev Tools to preview in iOS, Android, or Web.
```bash
bun expo prebuild --clean
bun expo run:ios
```

### 3. Install Shared SDK

```bash
bun add @bid-scents/shared-sdk
```

---

## Project Structure

```
mobile/
├── app/                    # Route-based screens (expo-router)
│   ├── _layout.tsx         # Root layout with Tamagui + SafeArea
│   └── index.tsx           # Home screen
├── assets/
│   ├── fonts/              # Roboto font variants
│   └── images/             # Static images
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and shared logic
├── tamagui.config.ts       # Tamagui theme + font config
├── app.json                # Expo project config
├── tsconfig.json
└── README.md
```

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

## Fonts

Roboto font files are located in:

```
assets/fonts/
├── Roboto-Light.ttf
├── Roboto-Regular.ttf
├── Roboto-Medium.ttf
├── Roboto-SemiBold.ttf
├── Roboto-Bold.ttf
├── Roboto-ExtraBold.ttf
├── Roboto-Black.ttf
```

And loaded in `app/_layout.tsx` using Expo's `useFonts()` hook.

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