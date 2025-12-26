# <p align="center">WeChat - Seamless Conversations, Redefined</p>

<p align="center">
  <img src="C:/Users/HotShotGG/.gemini/antigravity/brain/60eb6502-15fe-4be8-aa38-67e4ae413d57/we_chat_banner_1766789320334.png" alt="WeChat Banner" width="100%">
</p>

<p align="center">
  <strong>A premium, real-time messaging platform built with Angular 18 and PrimeNG.</strong>
</p>

---

## 🚀 Overview

**WeChat** is a state-of-the-art chat application designed to provide a smooth, secure, and visually stunning communication experience. Built with the latest technologies, it offers real-time messaging capabilities combined with a highly customizable and modern user interface.

## ✨ Key Features

- 💬 **Real-time Messaging**: Instant communication powered by WebSockets (STOMP & SockJS).
- 🎨 **Dynamic Themes**: Choose between **Dark**, **Light**, **Warm**, and **Darker** modes to suit your preference.
- 📱 **Responsive Design**: A fully responsive UI that looks beautiful on desktops, tablets, and mobile devices.
- 🔒 **Privacy & Security**: 
  - Two-Factor Authentication (2FA) support.
  - Secure session management and connected devices tracking.
  - Encrypted password management.
- 👤 **Profile Management**: Inline profile editing for names, bios, and contact information.
- ✨ **Premium Aesthetics**: Glassmorphism effects, smooth micro-animations, and a curated color palette.
- 🌊 **Splash Screen**: A polished entry experience for the application.

## 🛠️ Tech Stack

- **Frontend**: [Angular 18](https://angular.dev/)
- **UI Components**: [PrimeNG](https://primeng.org/) & [PrimeIcons](https://primeicons.org/)
- **State Management**: RxJS
- **Communication**: WebSockets (STOMP.js / SockJS)
- **Styling**: SCSS with custom design tokens
- **Icons**: PrimeIcons

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Angular CLI](https://angular.dev/tools/cli) (v18.0.1)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Zamoula/we-chat-frontend.git
    cd we-chat
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm start
    ```
    Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

4.  **Build for production**:
    ```bash
    npm run build
    ```
    The build artifacts will be stored in the `dist/` directory.

## 📂 Project Structure

```text
we-chat/
├── src/
│   ├── app/
│   │   ├── components/       # Reusable UI components & Page components
│   │   │   ├── active-sessions/
│   │   │   ├── chat-details/
│   │   │   ├── settings/
│   │   │   └── ...
│   │   ├── services/         # Business logic & API integration
│   │   ├── models/           # TypeScript interfaces & types
│   │   ├── interceptors/     # Global HTTP interceptors
│   │   └── app.routes.ts     # Route definitions
│   ├── assets/               # Static assets (images, logos)
│   └── index.html            # Entry HTML file
└── package.json              # Project dependencies & scripts
```

## 🔐 Security Features

- **Session Tracking**: Monitor and manage all active sessions across different devices.
- **Device Management**: View detailed information about connected devices (IP, Browser, OS).
- **2FA**: Extra layer of security for user accounts.

## 📝 License

This project is private. (c) 2025 Zamoula.

---

<p align="center">Made with ❤️ for a better chat experience.</p>
