# VoiceCAD

<img src="readme-files/flowerpots.jpg" alt="flowers in a flowerpot next to a window" width="200" height="200">

[![License: AGPL](https://img.shields.io/badge/License-AGPL-brightgreen.svg)](https://opensource.org/licenses/AGPL-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> A cool 3D CAD modeling application that lets you design with voice commands.

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose

### Development Setup

See [how-everything-works.md](how-everything-works.md) to get started!

## 📚 Supported Features & Roadmap

### Platform Support
- [x] Web application
- [x] Mobile application (iOS + Android)
- [ ] Start screen for web and mobile
  - [x] Basic page layout
  - [ ] Show 4 key features
  - [ ] Responsive design

### Authentication & User Management
- [ ] Login and registration
  - [ ] River's Flow logo integration
  - [ ] Personalized greeting ("Hi <User's name>")
  - [ ] Sign out functionality
  - [ ] Email confirmation flow
  - [ ] Google Auth integration
  - [ ] SMS/Phone authentication
  - [ ] 2FA support

### UI/UX Features
- [ ] Responsive menu (auto-shrinking/expanding)
- [ ] Dark mode and light mode
- [ ] Settings page
- [ ] Search functionality
  - [ ] File search
  - [ ] Settings search
- [ ] Open-source icon integration

### Organization & Teams
- [ ] Multi-user organizations
  - [ ] Minimum 1 organization per user
  - [ ] Organization-based feature access
  - [ ] Team accounts
- [ ] Multiple profile support
- [ ] Admin page and inspection tools

### Billing & Subscriptions
- [ ] Billing page
  - [ ] Invoice management
  - [ ] Refund processing
- [ ] Subscription management
- [ ] Pricing page

### Advanced Features
- [ ] Real-time interactions
- [ ] Push notifications
- [ ] Feature toggles
- [ ] Analytics integration
- [ ] Localization support
  - [ ] Multiple languages
  - [ ] Regional settings

### Infrastructure
- [ ] Vercel deployment
- [ ] Comprehensive documentation
- [ ] GitHub Actions workflow
- [ ] Test coverage

### Billing Implementation TODO
- [ ] Backend Implementation
  - [x] Add Stripe integration with test keys
  - [x] Implement subscription endpoints
  - [x] Add unit tests for billing functionality
  - [ ] Verify tests pass
- [ ] Backend JS API Implementation
  - [ ] Add billing routes to JS API
  - [ ] Add unit tests for billing methods
  - [ ] Add integration tests
  - [ ] Verify all tests pass
- [ ] Frontend Implementation
  - [ ] Make "Subscribe Monthly" button functional
  - [ ] Add proper error handling
  - [ ] Test end-to-end functionality

## 📚 Documentation

- [Frontend Documentation](app/frontend/README.md)
- [Backend Documentation](app/backend/README.md)

## 🏗️ Architecture

The project consists of three main components:

- **Frontend**: React Native/Expo application
- **Backend**: Node.js/Express REST API
- **Storage**: S3-compatible object storage

```
voicecad/
├── app/
│   ├── frontend/     # React Native/Expo application
│   └── backend/      # Node.js/Express API server
└── docker-compose.yml # Development environment setup
```

## 🛠️ Tech Stack

### Frontend
- React Native with Expo
- TailwindCSS/NativeWind

### Backend
- Node.js/Express
- LocalStack for S3

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [React Native](https://reactnative.dev)
- [Expo](https://expo.dev)
- [Express.js](https://expressjs.com)
- [LocalStack](https://localstack.cloud)