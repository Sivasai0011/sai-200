# RoadVision AI – Intelligent Road Accident Prediction System

> Next-Generation NVIDIA-inspired Autonomous Smart City Traffic Control & AI Accident Prediction Platform.

![RoadVision AI Banner](https://img.shields.br/badge/NVIDIA%20DRIVE-Autonomous%20AI-00ff88) ![Three.js](https://img.shields.io/badge/3D-Three.js-00f0ff) ![TensorFlow.js](https://img.shields.io/badge/AI-TensorFlow.js-ffaa00)

## Overview

**RoadVision AI** is a futuristic, interactive 3D smart city platform designed to forecast road accidents 5–10 seconds before they occur using simulated Deep Learning neural models. Built with WebGL (Three.js), TensorFlow.js, Chart.js, GSAP, and HTML5/CSS3 glassmorphism design.

## Key Features

### 1. NVIDIA-Inspired Glassmorphic HUD
- Cyberpunk dark theme (`#06090e`) with glowing neon green (`#00ff88`), cyan (`#00f0ff`), amber (`#ffb700`), and crimson red (`#ff0055`) accents.
- Live telemetry bar featuring real-time FPS counter, Road Safety Index, AI Confidence Score, and Weather display.
- Floating Left Telemetry Inspector & Right Incident Prediction Feed with Canvas Radar Hotspot Map.

### 2. 3D Smart City Environment (Three.js)
- Multi-lane road networks with street lighting, crosswalks, smart traffic signals, modern illuminated glass skyscrapers, and cyberpunk monuments.
- Dynamic Weather Systems: **Clear, Rain, Volumetric Fog, Snow, and Thunderstorm with interactive lightning flashes**.
- Dynamic Day/Night Cycle with smooth directional sunlight and shadow transitions.

### 3. Real-Time AI Prediction & Anomaly Engine (TensorFlow.js)
Detects and predicts 10+ critical traffic behaviors:
1. **Overspeeding**
2. **Wrong-way driving**
3. **Sudden emergency braking**
4. **Lane departure / Swerving**
5. **Unsafe following distance (Tailgating)**
6. **Blind spot & intersection cross-path conflict**
7. **Pedestrian crossing conflict**
8. **Intersection & signal violations**
9. **Traffic congestion bottlenecks**
10. **Hazardous weather traction impact**

- **5–10 Second Early Collision Prediction**: Calculates time-to-collision (TTC) and probability percentages in real time.
- **3D AI Overlays**: Animated glowing target bounding boxes, forward trajectory projection laser lines, and overhead severity indicators.
- **Instant AI Recommendations**: Generates automated safety maneuvers for autonomous vehicle control.

### 4. Interactive Camera & Controls
- **OrbitControls**: Free 360-degree rotation, pan, and zoom.
- **Cinematic Follow Camera**: Click any 3D vehicle to lock camera tracking with smooth lerp interpolation.
- **Drone Surveillance Mode**: Top-down airborne camera view.
- **Simulation Controllers**: Pause/Resume, Traffic Density slider (10-50 vehicles), Speed multiplier slider, and 3D overlay toggles.

### 5. Analytics & PDF Reporting
- **Chart.js Dashboard**: Incident Prediction Timeline line chart, Speed Analytics bar chart, and City Risk Distribution pie chart.
- **Accident Probability Radar Heatmap**: 2D Canvas radar rendering real-time vehicle positions and threat heat signatures.
- **PDF Report Exporter**: Generates print-ready formal PDF traffic incident reports for smart city authorities.
- **Procedural Sci-Fi Sound FX & Voice Assistant**: Synthesized audio feedback via Web Audio API and SpeechSynthesis.

## Project Structure

```
roadvision-ai/
├── index.html       # Main HTML UI structure & HUD layout
├── style.css        # Glassmorphic sci-fi styling & animations
├── city.js          # Three.js 3D city generator, lighting & weather
├── vehicles.js      # Procedural vehicle meshes, movement & 3D AI overlays
├── ai.js            # TensorFlow.js prediction engine & anomaly detection
├── dashboard.js     # Chart.js analytics dashboard, radar heatmap & PDF export
├── audio.js         # Procedural Web Audio SFX & Voice Assistant synthesis
├── script.js        # Main application controller, camera modes & game loop
└── README.md        # Technical documentation
```

## Running the Application

1. Open `index.html` directly in any modern Web Browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari) or serve via a local HTTP web server.
2. Click any moving vehicle to inspect telemetry or toggle weather and camera modes from the top header and bottom dock.
