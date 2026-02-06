# 🌌 SpaceScope

**SpaceScope** is an immersive, futuristic space exploration dashboard that brings real-time cosmic data, interactive learning modules, and stunning 3D visualizations to your fingertips. Built with cutting-edge web technologies, SpaceScope transforms complex astronomical data into an engaging, educational experience.

![SpaceScope Banner](https://img.shields.io/badge/SpaceScope-Mission%20Control-00F0FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiAyMkgyMkwxMiAyWiIgZmlsbD0iIzAwRjBGRiIvPgo8L3N2Zz4=)

---

## ✨ Features

### 🌍 **Real-Time Space Weather Monitoring**
- **Solar Activity Dashboard**: Live feeds from NASA's Solar Dynamics Observatory (SDO)
- **Geomagnetic Storm Tracking**: Real-time R-Scale, G-Scale, and S-Scale indices
- **Aurora Probability Calculator**: Dynamic predictions based on magnetospheric flux
- **Storm Simulation Mode**: Test dashboard responses to extreme space weather events

### 🛰️ **Satellite & ISS Tracking**
- **3D Earth Visualization**: Interactive globe with real-time satellite positions
- **ISS Live Tracker**: Current location and trajectory of the International Space Station
- **Satellite Network**: Track multiple satellites with orbital data
- **Gateway Status Monitor**: Live connection status to space infrastructure

### 📰 **Mission News Hub**
- **Breaking Space Alerts**: Critical mission updates with priority levels
- **Launch Countdowns**: Real-time tracking of upcoming rocket launches
- **Discovery Feed**: Latest astronomical discoveries and research
- **Mission Progress**: Animated progress bars for ongoing space missions

### 🎓 **Interactive Learning Center**
Four comprehensive learning modules:

#### 1. **Adaptive Mastery Quiz**
- Multi-modal learning with:
  - **Detailed Explanations**: Scientific concepts broken down
  - **Real-World Analogies**: Complex ideas made simple
  - **Process Flowcharts**: Step-by-step visual guides
  - **Semantic Networks**: Concept mapping and connections
- Progress tracking and scoring system
- Questions on gravitational lensing, neutron stars, and more

#### 2. **AI Mastery Engine**
- Powered by Google Gemini AI
- Personalized tutoring on space topics
- Interactive Q&A with context-aware responses
- Visual learning aids generated on-demand

#### 3. **Vessel Blueprints (Propulsion Lab)**
- Explore spacecraft propulsion systems
- Interactive diagrams and technical specifications
- Engineering deep-dives into rocket technology

#### 4. **Stellar Evolution Visualizer**
- Journey through star lifecycles:
  - Stellar Nebula → Protostar → Main Sequence → Red Giant → Supernova → Black Hole
- AI-generated visualizations for each stage
- Scientific descriptions and characteristics

### 🔭 **Stargazing Finder**
- **Location-Based Recommendations**: Find the best stargazing spots near you
- **Celestial Event Calendar**: Upcoming meteor showers, eclipses, and planetary alignments
- **Light Pollution Maps**: Identify dark sky locations
- **Equipment Recommendations**: Telescope and binocular suggestions

### 🗓️ **Mission Timeline**
- Historical space missions
- Upcoming launches and events
- Interactive timeline visualization
- Mission details and achievements

### 🖥️ **System Monitor**
- Dashboard health metrics
- API connection status
- Performance monitoring
- Real-time data sync indicators

---

## 🚀 Tech Stack

### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Framer Motion** - Smooth animations and transitions
- **Three.js** (@react-three/fiber, @react-three/drei) - 3D graphics and Earth visualization
- **Lucide React** - Beautiful icon library

### **Styling**
- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS** - Dark sci-fi theme with glassmorphism
- **Responsive Design** - Mobile-first approach

### **APIs & Services**
- **NASA APIs**:
  - Solar Dynamics Observatory (SDO)
  - DONKI (Space Weather Database)
  - Astronomy Picture of the Day (APOD)
- **Google Gemini AI** - AI-powered tutoring and content generation
- **Supabase** - Backend authentication and database
- **Open-Meteo** - Weather data integration

### **State Management**
- React Hooks (useState, useEffect, useCallback)
- Context API for global state
- Local storage for persistence

---

## 📦 Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Clone the Repository
```bash
git clone https://github.com/Aryasurya12/SpaceScope.git
cd SpaceScope
```

### Install Dependencies
```bash
npm install
```

### Environment Variables
Create a `.env` file in the root directory:

```env
# Google Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# NASA API (Optional - has default fallback)
VITE_NASA_API_KEY=your_nasa_api_key
```

### Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🎨 Design Philosophy

SpaceScope embraces a **dark sci-fi aesthetic** inspired by mission control centers and futuristic interfaces:

- **Color Palette**:
  - Background: Deep space black (`#0B0D17`)
  - Primary: Cyan (`#00F0FF`) - Represents technology and clarity
  - Accents: Purple, Blue, Green, Red - Context-specific highlights
  - Text: White with varying opacity for hierarchy

- **Visual Elements**:
  - Glassmorphism effects with backdrop blur
  - Subtle scan-line animations
  - Glowing borders and shadows
  - Smooth transitions and micro-animations
  - Radial gradients for depth

- **Typography**:
  - Display font for headers (bold, wide tracking)
  - Monospace for technical data
  - Sans-serif for body text

- **UX Principles**:
  - Information hierarchy through color and size
  - Interactive elements with hover states
  - Loading states and skeleton screens
  - Responsive across all devices
  - Accessibility-first approach

---

## 📂 Project Structure

```
SpaceScope/
├── components/
│   ├── AIChat.tsx              # AI-powered chat interface
│   ├── CelestialMap.tsx        # Interactive star map
│   ├── DashboardLayout.tsx     # Main dashboard container
│   ├── EarthVisualizer.tsx     # 3D Earth with satellites
│   ├── Hero3D.tsx              # Landing page 3D Earth
│   ├── LearningZone.tsx        # Unified learning hub
│   ├── MissionTimeline.tsx     # Historical mission timeline
│   ├── NewsHub.jsx             # Space news aggregator
│   ├── PropulsionLab.tsx       # Spacecraft propulsion explorer
│   ├── StarfieldBackground.tsx # Animated starfield
│   ├── StargazingFinder.jsx    # Stargazing location finder
│   ├── SystemMonitor.tsx       # System health dashboard
│   └── UserProfile.tsx         # User settings and profile
├── services/
│   ├── apiService.ts           # NASA API integrations
│   ├── geminiService.ts        # Google Gemini AI service
│   └── supabaseClient.ts       # Supabase configuration
├── types.ts                    # TypeScript type definitions
├── App.tsx                     # Root application component
├── index.css                   # Global styles and Tailwind
├── main.tsx                    # Application entry point
└── vite.config.ts              # Vite configuration
```

---

## 🌟 Key Components

### **DashboardLayout**
The main navigation hub with 8 sections:
- Events (Celestial Map)
- Weather (Solar Activity)
- Timeline (Mission History)
- Learning (Educational Modules)
- Satellites (3D Earth Tracker)
- News (Mission Updates)
- Stargazing (Location Finder)
- System (Health Monitor)

### **LearningZone**
Unified learning interface with 4 tabs:
- Adaptive Mastery (Quiz)
- Mastery Engine (AI Tutor)
- Vessel Blueprints (Propulsion)
- Stellar Evolution (Star Lifecycle)

### **NewsHub**
Real-time news with 3 card types:
- Critical Alerts (Red theme)
- Mission Progress (Green/Cyan theme)
- General News (Blue theme)

### **Hero3D**
Landing page featuring:
- Procedurally generated 3D Earth
- Atmospheric glow effects
- Rotating animation
- Call-to-action overlay

---

## 🔧 Configuration

### Tailwind CSS
Custom theme extensions in `tailwind.config.js`:
```javascript
colors: {
  'space-900': '#0B0D17',
  'space-800': '#1a1d2e',
  'cyan-400': '#00F0FF',
  // ... more custom colors
}
```

### Vite
Optimized build configuration with:
- React plugin
- Fast refresh
- Code splitting
- Asset optimization

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NASA** - For providing incredible APIs and space data
- **Google Gemini** - For AI-powered educational features
- **Supabase** - For backend infrastructure
- **Three.js Community** - For 3D visualization tools
- **Open Source Community** - For amazing libraries and tools

---

## 📧 Contact

**Project Maintainers:**
- GitHub: [@Aryasurya12](https://github.com/Aryasurya12)
- GitHub: [@Shreeyacodes](https://github.com/Shreeyacodes)

**Project Links:**
- Repository: [https://github.com/Aryasurya12/SpaceScope](https://github.com/Aryasurya12/SpaceScope)
- Issues: [https://github.com/Aryasurya12/SpaceScope/issues](https://github.com/Aryasurya12/SpaceScope/issues)

---

## 🚀 Future Roadmap

- [ ] Real-time ISS video feed integration
- [ ] AR stargazing mode using device camera
- [ ] Multiplayer space trivia challenges
- [ ] Custom mission planning tools
- [ ] Integration with more space agencies (ESA, JAXA, etc.)
- [ ] Mobile app (React Native)
- [ ] VR support for 3D visualizations
- [ ] Community-contributed learning modules
- [ ] Advanced telescope control integration
- [ ] Space weather alert notifications

---

<div align="center">

**Made with ❤️ and ☕ by space enthusiasts**

⭐ **Star this repo if you love space exploration!** ⭐

</div>
