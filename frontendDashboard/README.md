# Battery Swap Station Dashboard

A modern, organized React frontend for managing battery swap stations with weather integration and comprehensive testing scenarios.

## 🚀 Features

### 📱 Organized Dashboard Structure
- **Weather Section**: Real-time weather data with beautiful UI
- **Battery Swap Section**: Complete battery swap flow management
- **Test Scenarios Section**: Mockup buttons for testing different scenarios

### 🔋 Battery Swap Flow
- RFID card scanning and validation
- Battery health checking
- Available battery selection
- Complete swap session management

### 🧪 Testing & Mockup Features
- Success/failure scenario testing
- RFID card error simulation
- Battery health warnings
- Payment and subscription issues
- Station maintenance mode
- Queue management system

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── Dashboard.tsx          # Main dashboard component
│   │   ├── Navigation.tsx         # Tab navigation
│   │   └── sections/
│   │       ├── WeatherSection.tsx # Weather display
│   │       ├── BatterySection.tsx # Battery swap flow
│   │       └── MockupSection.tsx  # Test scenarios
│   ├── layout/
│   │   └── Layout.tsx             # Reusable layout wrapper
│   ├── ui/
│   │   ├── Button.tsx             # Reusable button component
│   │   └── Card.tsx               # Reusable card component
│   ├── battery/                   # Battery-specific components
│   └── weather/                   # Weather-specific components
├── api/
│   └── batteryApi.ts              # API integration
└── types/
    ├── battery.ts                 # Battery-related types
    └── weather.ts                 # Weather-related types
```

## 🎯 Key Improvements

### 1. **Better Organization**
- Separated concerns into logical components
- Created reusable UI components
- Organized files by feature/domain

### 2. **Enhanced User Experience**
- Smooth animations with Framer Motion
- Intuitive navigation between sections
- Clear visual feedback for all actions

### 3. **Comprehensive Testing**
- 8 different test scenarios
- Success and failure path testing
- Real-world edge case simulation

### 4. **Modern UI/UX**
- Glassmorphism design
- Responsive layout
- Consistent color scheme
- Hover effects and transitions

## 🧪 Test Scenarios Available

1. **Successful Battery Swap** - Complete happy path
2. **RFID Card Not Found** - Invalid card simulation
3. **Low Battery Health** - Health check failure
4. **No Available Batteries** - Station capacity issues
5. **User Profile View** - Account information display
6. **Payment Required** - Subscription/payment issues
7. **Station Maintenance** - Maintenance mode simulation
8. **Queue Management** - Busy station scenarios

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Navigate the Dashboard**
   - Use the top navigation to switch between sections
   - Test different scenarios in the "Test Scenarios" tab
   - Experience the complete battery swap flow

## 🔧 API Integration

The frontend is designed to work with the Flask backend:
- RFID card lookup by code
- Battery health monitoring
- Swap session management
- User authentication and profiles

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🎨 UI Components

### Reusable Components
- **Button**: Multiple variants (primary, secondary, success, danger, warning)
- **Card**: Glassmorphism cards with hover effects
- **Layout**: Consistent page structure

### Animation Features
- Page transitions
- Hover effects
- Loading states
- Success/error feedback

This organized structure makes the codebase more maintainable, testable, and user-friendly while providing comprehensive testing capabilities for all battery swap scenarios.