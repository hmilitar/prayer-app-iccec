# App Store Submission Guide

## Pre-Submission Checklist

### 1. App Store Connect Setup
- [ ] Create app in App Store Connect
- [ ] Set up app metadata (name, description, keywords)
- [ ] Add app screenshots (required sizes)
- [ ] Set app category: **Lifestyle**
- [ ] Set content rating: **4+** (suitable for all ages)

### 2. Required Screenshots (iOS)
You'll need screenshots for:
- iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max): 1290 x 2796 pixels
- iPhone 6.5" (iPhone 11 Pro Max, XS Max): 1242 x 2688 pixels
- iPhone 5.5" (iPhone 8 Plus): 1242 x 2208 pixels
- iPad Pro (6th gen) 12.9": 2048 x 2732 pixels
- iPad Pro (2nd gen) 12.9": 2048 x 2732 pixels

### 3. App Description Template

**Short Description (30 chars):**
Prayer & Daily Readings

**Description:**
Prayer App - ICCEC Europe is a comprehensive spiritual companion designed for the International Communion of the Charismatic Episcopal Church Europe community.

**Key Features:**
• Multi-language support (English, Tagalog, Estonian)
• Daily liturgical readings with complete text
• Traditional prayers including The Lord's Prayer and Apostles' Creed
• Seasonal liturgical content
• Dark and light theme support
• Offline functionality
• Tablet and phone optimized

**Perfect for:**
• Daily spiritual reading and prayer
• Following the liturgical calendar
• Multi-language worship communities
• Personal devotional time
• Group prayer sessions

The app provides authentic liturgical content sourced from public domain translations, ensuring accessibility and spiritual enrichment for users worldwide.

**Keywords (100 chars max):**
prayer,liturgy,daily readings,christian,church,devotional,spiritual,multilingual,ICCEC

### 4. Privacy Information
- **Data Collection**: None
- **Tracking**: None
- **Third-party data**: None

### 5. Build and Submit Commands

```bash
# Check production readiness
npm run check-production

# Build for iOS App Store
npm run build:ios:production

# Once build completes, submit to App Store
npm run submit:ios
```

### 6. App Review Information

**Demo Account**: Not required (no login functionality)

**Review Notes:**
```
This app provides daily liturgical readings and traditional prayers for the ICCEC Europe community. 

Key features to test:
1. Navigate between Daily Readings, Prayers, and Settings
2. Switch between English, Tagalog, and Estonian languages
3. View today's daily readings with complete text
4. Access traditional prayers like The Lord's Prayer
5. Toggle between light and dark themes

No special setup required - all content is embedded and works offline.
```

### 7. App Store Categories
- **Primary**: Lifestyle
- **Secondary**: Reference

### 8. Age Rating
- **4+** (No objectionable content)

### 9. Release Options
- **Manual release**: Recommended for first release
- **Automatic release**: Can be enabled for future updates

### 10. Post-Submission
- Monitor App Store Connect for review status
- Respond to any reviewer questions within 7 days
- Typical review time: 24-48 hours

## Common Rejection Reasons to Avoid

1. **Missing Privacy Policy**: ✅ Not required (no data collection)
2. **Incomplete App Information**: ✅ All metadata provided
3. **Poor App Quality**: ✅ Professional UI/UX implemented
4. **Crashes/Bugs**: ✅ Thoroughly tested
5. **Misleading Information**: ✅ Accurate descriptions provided

## Support Information

**Support URL**: https://github.com/selahstudioph/prayer-app-iccec
**Marketing URL**: https://github.com/selahstudioph/prayer-app-iccec
**Privacy Policy URL**: Not required (no data collection)

## Version Management

- Current version: **1.0.0**
- Build number: Auto-incremented by EAS
- Future updates: Increment version number in app.json
