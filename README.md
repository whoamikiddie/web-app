# Family Safety App

A modern React Native mobile application for family location tracking and safety coordination.

## 📱 Features

- **Real-time Location Tracking**: Keep track of family members' locations with customizable frequency settings
- **Family Groups**: Create and manage family groups to organize your connections
- **Location History**: View historical location data for family members
- **Battery Optimization**: Multiple tracking frequency modes for battery optimization
- **Privacy Controls**: Enable privacy mode when you need to pause location sharing
- **Emergency Features**: Send emergency alerts and messages to designated contacts
- **Place Management**: Create and manage frequently visited places

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI
- Mobile device or emulator with Expo Go app installed

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/family-safety-app.git
cd family-safety-app
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with Expo Go (Android) or the Camera app (iOS) to load the app on your device.

## 📊 Usage

### Setting Up Your Profile

1. Launch the app and create your profile
2. Grant location permissions

### Creating a Family Group

1. Navigate to Settings > Family Groups
2. Tap "Create Group"
3. Enter your group name
4. Share the invitation code with family members

### Joining a Family Group

1. Navigate to Settings > Family Groups
2. Tap "Join Group"
3. Enter the invitation code provided by a family member
4. You'll now be connected to your family group

### Managing Location Tracking

1. Navigate to Settings > Location
2. Choose your preferred tracking frequency:
   - High Frequency (30 seconds) - High battery usage
   - Medium Frequency (1 minute) - Balanced
   - Low Frequency (5 minutes) - Battery efficient
   - Battery Saver (15 minutes) - Minimal battery impact

### Privacy Controls

1. Navigate to Settings > Privacy
2. Toggle Privacy Mode to temporarily stop sharing your location

## 🔧 Technical Details

### Technology Stack

- React Native / Expo
- TypeScript
- Expo Router for navigation
- Zustand for state management
- Expo Location for geolocation services

### Project Structure

- `/app` - Main application screens and navigation
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks
- `/store` - State management with Zustand
- `/constants` - App-wide constants and configuration
- `/utils` - Helper functions and utilities

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please contact [support@familysafetyapp.com](mailto:support@familysafetyapp.com) or open an issue in the repository.

## ✨ Acknowledgements

- [Expo](https://expo.dev/)
- [React Native](https://reactnative.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev/)
