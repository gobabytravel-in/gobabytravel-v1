# GoBaby Travel - Mobile App Foundation

## Overview
GoBaby Travel is a mobile travel platform built with React Native and Expo Router. This is the foundational app shell designed to be a calm, intuitive, and structured entry into a travel planning experience.

## Current Implementation Status

### ✅ Completed Features

#### 1. Navigation Structure
- **Drawer Navigation** (Hamburger Menu) with 5 main menu items:
  - Home
  - Plan Your Entire Journey
  - Booking Engine
  - Visa Ease
  - Transport Engine

#### 2. Screens Implemented

**Home Screen** (`app/index.tsx`)
- GoBaby Travel logo display
- Hero section with tagline: "Plan your trip in 2 minutes"
- Subtitle: "Flights, hotels, visa & transport — all in one place"
- Primary CTA button: "Plan My Trip"
- Quick Access cards for easy navigation to main features
- Clean, minimal design with proper spacing

**Plan Your Entire Journey** (`app/plan-journey.tsx`)
- Placeholder screen for future guided trip planning
- Feature list preview showing:
  - Flights & Multi-city Routes
  - Hotels & Accommodations
  - Transfers & Ground Transport
  - Ferries & Water Transport
  - Activities & Experiences
  - Travel Insurance

**WebView Screens** (Booking, Visa, Transport)
- Reusable WebView component with:
  - Clean loading indicators
  - Error handling with fallback messages
  - Back navigation within WebView
  - Smooth transitions
  - Custom header with title
- Connected URLs:
  - Booking Engine: https://bookings.gobabytravel.com
  - Visa Ease: https://gobabytravel.visa2fly.com
  - Transport Engine: https://transport.12go.asia

#### 3. Design System

**Brand Colors**
- Primary: #0B3C5D (Deep Blue)
- Secondary: #2EC4B6 (Soft Teal/Aqua)
- Background: #FFFFFF (White)
- Background Light: #F8F9FA (Very light grey)
- Text: #2D3436 (Dark grey)
- Text Light: #636E72 (Medium grey)

**Design Principles Applied**
- Calm, clean, and premium feel
- Structured and guided (not overwhelming)
- Spacious layout with 8pt grid system (8px, 16px, 24px, 32px)
- Minimal color usage
- Clear hierarchy and readability
- Touch-friendly targets (minimum 44px)

#### 4. Technical Architecture

**Tech Stack**
- React Native with Expo (SDK 54)
- Expo Router v6 (file-based routing)
- React Navigation v7 (Drawer)
- TypeScript
- React Native WebView
- React Native Gesture Handler
- React Native Safe Area Context

**Project Structure**
```
frontend/
├── app/
│   ├── _layout.tsx          # Root drawer navigation layout
│   ├── index.tsx            # Home screen
│   ├── plan-journey.tsx     # Journey planning placeholder
│   ├── booking.tsx          # Booking Engine WebView
│   ├── visa.tsx             # Visa Ease WebView
│   └── transport.tsx        # Transport Engine WebView
├── components/
│   ├── WebViewScreen.tsx    # Reusable WebView component
│   └── QuickAccessCard.tsx  # Quick access card component
├── constants/
│   └── Colors.ts            # Brand colors and spacing
└── assets/
    └── images/
        └── logo.png         # GoBaby Travel logo
```

**Key Components**
- `WebViewScreen`: Reusable component for loading external provider pages
- `QuickAccessCard`: Consistent card design for navigation
- `_layout.tsx`: Drawer navigation with all menu items configured

## Design Philosophy

### User Experience Principles
1. **Guided, Not Overwhelming**: Clear paths to each feature
2. **Calm and Premium**: Minimal design with purposeful spacing
3. **Structured Journey**: Logical flow from discovery to action
4. **Trustworthy**: Professional appearance, clear labeling
5. **Mobile-First**: Optimized for thumb navigation and mobile gestures

### Brand Positioning
*"A travel system that brings everything together"*

Users should feel:
- Guided step-by-step
- In control of their journey
- Not confused by multiple platforms

## Future Enhancements (Not in Current Scope)

### Phase 2 - Guided Journey Flows
- Interactive trip planning wizard
- Multi-destination itinerary builder
- Integrated booking flow

### Phase 3 - Advanced Features
- User authentication
- Saved trips and favorites
- Push notifications
- Offline support
- Payment integration

### Phase 4 - Full Platform
- Activity recommendations
- Real-time updates
- Travel insurance integration
- Multi-language support

## Technical Notes

### Dependencies Management
- Expo Router automatically provides core @react-navigation packages
- Only additional navigator (@react-navigation/drawer) needs to be installed
- Avoid installing duplicate @react-navigation packages

### WebView Integration
- All external provider pages load inside the app
- Graceful fallback for unavailable services
- Maintains app navigation context

### Scalability Considerations
- Modular component architecture
- File-based routing allows easy screen addition
- Reusable components (WebViewScreen, QuickAccessCard)
- Centralized design system (Colors.ts)

## Current Limitations
- Home screen content is static (no API integration)
- "Plan Your Entire Journey" is a placeholder
- WebView screens require active URLs to display content
- No user authentication yet
- No data persistence

## App Access
- **Preview URL**: https://gobaby-shell.preview.emergentagent.com
- **QR Code**: Available in Expo Dev Tools for mobile testing
- **Platform**: Web preview available, mobile testing via Expo Go app

## Color Palette Reference
```typescript
Primary: #0B3C5D        // Deep Blue
Secondary: #2EC4B6      // Soft Teal
Background: #FFFFFF     // White
BackgroundLight: #F8F9FA // Very light grey
Text: #2D3436          // Dark grey/near black
TextLight: #636E72     // Medium grey
```

## Next Steps
1. Test drawer navigation on physical devices
2. Verify WebView functionality with actual provider URLs
3. Plan and design the guided journey flow
4. Design detailed home screen UI
5. Implement user authentication (if needed)
