# VoiceCAD Frontend

<img src="readme-files/crystal-ball.jpg" alt="a magicians crystal ball" width="200" height="200">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Cross-platform frontend for VoiceCAD, built with React Native and Expo.

## 🏗️ Tech Stack

- React Native with Expo
- TailwindCSS/NativeWind
- TypeScript

## 📁 Project Structure

```
frontend/
├── app/              # Application screens
│   ├── (drawer)/    # Drawer navigation
│   └── (tabs)/      # Tab navigation
├── components/      # Reusable components
└── assets/         # Images, fonts, etc.
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose

### Development Setup

1. Start the development environment:
   ```bash
   docker-compose up
   ```

2. Access the application:
   - Web: http://localhost:19000
   - Mobile: Use Expo Go app to scan QR code

## 🎨 Styling Example

We use TailwindCSS via NativeWind for styling:

```jsx
function Button({ children }) {
  return (
    <Pressable className="bg-blue-500 px-4 py-2 rounded-lg">
      <Text className="text-white font-bold">{children}</Text>
    </Pressable>
  );
}
```

## ⚙️ Environment Variables

The `.env` file is automatically configured in Docker. For local development:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.