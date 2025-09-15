# Prayer App - ICCEC Europe

A comprehensive prayer and daily readings app for the ICCEC Europe community, featuring multi-language support and liturgical content.

## Features

- **Multi-language Support**: English, Tagalog, and Estonian
- **Daily Liturgical Readings**: Complete with first reading, psalm, second reading (when applicable), and gospel
- **Traditional Prayers**: The Lord's Prayer, Apostles' Creed, and other liturgical prayers
- **Seasonal Content**: Proper readings and prayers for different liturgical seasons
- **Dark/Light Theme**: Automatic theme switching based on system preferences
- **Responsive Design**: Works on phones and tablets

## Technologies

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: React Hooks
- **Internationalization**: expo-localization with i18n-js
- **Storage**: AsyncStorage for user preferences

## Production Deployment

### Prerequisites

1. **EAS CLI**: Install globally
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Expo Account**: Sign up at https://expo.dev
   ```bash
   eas login
   ```

3. **Apple Developer Account** (for iOS deployment)
4. **Google Play Developer Account** (for Android deployment)

### Building for Production

#### iOS App Store

1. **Configure Apple Developer Account**
   ```bash
   eas credentials
   ```
   Follow the prompts to set up your Apple Developer credentials.

2. **Build for iOS**
   ```bash
   npm run build:ios:production
   ```

3. **Submit to App Store**
   ```bash
   npm run submit:ios
   ```
   Or manually upload the .ipa file to App Store Connect.

#### Google Play Store

1. **Configure Google Play Console**
   - Create a service account key in Google Cloud Console
   - Download the JSON file and save as `service-account-key.json`
   - Update the path in `eas.json`

2. **Build for Android**
   ```bash
   npm run build:android:production
   ```

3. **Submit to Play Store**
   ```bash
   npm run submit:android
   ```

### Configuration Files

#### app.json
- Contains app metadata, bundle identifiers, and platform-specific settings
- Privacy descriptions are included for App Store review
- Build numbers and version codes are auto-incremented

#### eas.json
- Build profiles for development, preview, and production
- Auto-increment settings for version management
- Submission configuration for app stores

### App Store Requirements Checklist

#### Metadata
- [x] App name: "Prayer App - ICCEC Europe"
- [x] Bundle ID: com.icceceurope.prayerapp
- [x] Version: 1.0.0
- [x] Description included
- [x] App category: Lifestyle

#### Privacy
- [x] ITSAppUsesNonExemptEncryption: false
- [x] Privacy descriptions for all iOS permissions
- [x] No tracking or data collection

#### Assets
- [x] App icon (1024x1024)
- [x] Splash screen
- [x] Adaptive icon for Android

#### Functionality
- [x] Multi-language support
- [x] Offline functionality
- [x] Responsive design
- [x] Error handling
- [x] Loading states

### Testing

1. **Development Build**
   ```bash
   npm run build:ios
   npm run build:android
   ```

2. **Type Checking**
   ```bash
   npm run type-check
   ```

3. **Linting**
   ```bash
   npm run lint
   ```

### Support

For technical support or questions about the app, please contact the development team.

### License

This app is developed for the ICCEC Europe community.
