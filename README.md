<h1 align="center">
  <br>
  Sp[a]rr[i]ng
  <br>
</h1>

<h4 align="center">AI-powered sparring analysis — upload your fight footage and get instant feedback on technique, positioning, and performance.</h4>

<p align="center">
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React Native" /></a>
  <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo&logoColor=white" alt="Expo" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Auth_%26_DB-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-environment-variables">Environment</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

## ➤ Features

| Feature | Description |
|---|---|
| 🎥 **Video Upload** | Pick sparring footage from your camera roll and draw a circle to identify yourself in the frame |
| 🤖 **AI Analysis** | Get instant feedback on technique, punch volume, accuracy, stance, and positioning |
| 📊 **Session Scores** | Every session receives a 0–100 performance score with detailed breakdowns |
| 👤 **Fighter Profile** | View your fight style comparisons, all-time analytics, and session history |
| 🔐 **Auth** | Email/password and Google OAuth sign-in powered by Supabase |
| 💎 **Freemium Model** | Free tier with daily upload limits; premium tier for unlimited access |
| 🐻 **Pull-to-Refresh Mascot** | A delightful animated mascot that reacts when you pull to refresh |

---

## ➤ Tech Stack

<table>
  <tr>
    <td align="center" width="120"><img src="https://cdn.simpleicons.org/react/61DAFB" width="36" /><br><b>React Native</b><br><sub>0.81</sub></td>
    <td align="center" width="120"><img src="https://cdn.simpleicons.org/expo/000020" width="36" /><br><b>Expo</b><br><sub>SDK 54</sub></td>
    <td align="center" width="120"><img src="https://cdn.simpleicons.org/supabase/3FCF8E" width="36" /><br><b>Supabase</b><br><sub>Auth & DB</sub></td>
    <td align="center" width="120"><img src="https://cdn.simpleicons.org/typescript/3178C6" width="36" /><br><b>TypeScript</b><br><sub>5.9</sub></td>
  </tr>
</table>

**Key libraries:**

- **Navigation** — `@react-navigation/native` + `native-stack`
- **Icons** — `lucide-react-native`
- **Auth** — `expo-web-browser` + `expo-auth-session` (Google OAuth)
- **Media** — `expo-image-picker`, `react-native-svg`
- **Storage** — `@react-native-async-storage/async-storage`, `expo-secure-store`
- **Animations** — `react-native-reanimated`

---

## ➤ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/           # Button, ScoreBadge, GradientText, PullToRefreshMascot, UpgradeModal
│   ├── home/             # SessionListItem, UploadSection
│   └── navigation/       # Footer tab bar
├── constants/            # App-wide constants and storage keys
├── context/              # AppContext (global state: user, sessions, plan)
├── lib/                  # Supabase client initialization
├── navigation/           # RootNavigator (stack navigator)
├── screens/
│   ├── main/             # MainScreen, ProfileScreen, SettingsScreen
│   ├── onboarding/       # SplashScreen, LoginScreen
│   ├── session/          # SessionDetailScreen
│   └── upload/           # UploadScreen (video pick + circle draw)
├── services/
│   └── supabase/         # googleAuth, useSessionGuard
├── theme/                # Color tokens and design system
└── types/                # TypeScript interfaces (User, SparringSession, navigation)
```

---

## ➤ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **Expo CLI** — `npm install -g expo-cli`
- **iOS Simulator** (macOS) or **Android Emulator**, or the **Expo Go** app on a physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/JoshuaYYHo/SparringAI-Frontend.git
cd SparringAI-Frontend

# Install dependencies
npm install

# Start the Expo dev server
npm start
```

Then press `i` for iOS simulator or `a` for Android emulator, or scan the QR code with Expo Go.

## ➤ App Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │
│    Splash    │────▶│    Login     │────▶│     Main     │
│   Screen     │     │   Screen     │     │   Screen     │
│              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────┬───────┘
       │                                         │
       │  (session exists)                       ├──▶  Upload → SessionDetail
       └────────────────────────────────────────▶├──▶  Settings
                                                 └──▶  Profile
```

---

## ➤ Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## ➤ Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/JoshuaYYHo">
        <img src="https://github.com/JoshuaYYHo.png?size=100" width="80" style="border-radius:50%" alt="Joshua Ho" /><br />
        <sub><b>Joshua Ho</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## ➤ License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/JoshuaYYHo">Joshua Ho</a></sub>
</p>