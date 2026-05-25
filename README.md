# ♻️ UrbanClean – IoT Smart Waste Management System

<h3 align="center">🚛 Smart City Waste Collection Powered by IoT & Real-Time Monitoring</h3>

<p align="center">
UrbanClean is an intelligent IoT-based waste management solution designed to improve urban sanitation through real-time garbage monitoring, automated bin control, RFID authentication, and smart collection scheduling.
</p>

---

## 🌍 Overview

UrbanClean combines **ESP32-based smart bins**, a **Node.js/Express backend**, **MongoDB database**, and a **React-based web dashboard** to create a complete waste collection ecosystem.

The system continuously monitors garbage levels using ultrasonic sensors, automatically locks full bins, provides RFID-based collector access, and enables city administrators to monitor bin status and collection operations in real time.

---

## ✨ Key Features

### ♻️ Smart Bin Hardware (ESP32)

✅ Real-time garbage level monitoring using ultrasonic sensors

✅ Automatic lid locking when the bin reaches full capacity

✅ RFID-based access control for authorized waste collectors

✅ LCD display for user guidance and collection notifications

✅ LED indicators showing bin fill percentages (25%, 50%, 75%, 100%)

✅ Wi-Fi connectivity for live data transmission

✅ Low-cost and scalable smart city solution

---

### 💻 Web Application

✅ Real-time smart bin monitoring dashboard

✅ Interactive map showing bin locations and status

✅ Automated collection dispatch management

✅ Collection scheduling and logistics tracking

✅ Role-based authentication for administrators and citizens

✅ Responsive user-friendly interface

✅ Live status updates from ESP32 devices

---

## 🛠️ Technology Stack

### Hardware
- ESP32 Development Board
- HC-SR04 Ultrasonic Sensor
- RC522 RFID Module
- SG90 Servo Motor
- I2C LCD Display
- Status LEDs
- Wi-Fi Communication

### Software

#### Frontend
- React.js
- Tailwind CSS
- Axios
- React Router

#### Backend
- Node.js
- Express.js
- REST API

#### Database
- MongoDB

#### IoT Programming
- Arduino IDE
- ESP32 Libraries

---

## 🔧 Hardware Components

| Component | Purpose |
|-----------|----------|
| ESP32 | Main microcontroller |
| Ultrasonic Sensor | Measure garbage level |
| Servo Motor | Lock/Unlock bin lid |
| RC522 RFID Reader | Authorized collector access |
| I2C LCD Display | Display system messages |
| LEDs | Visual fill-level indicators |
| Wi-Fi Module (ESP32 Built-in) | Cloud communication |

---

## ⚙️ System Workflow

```text
Citizen Deposits Waste
          │
          ▼
Ultrasonic Sensor Measures Level
          │
          ▼
ESP32 Calculates Fill Percentage
          │
          ▼
Status Sent via Wi-Fi to Server
          │
          ▼
React Dashboard Updates in Real Time
          │
          ▼
Bin Reaches 100% Capacity
          │
          ▼
Servo Locks Bin Lid
          │
          ▼
Admin Dispatches Collection Truck
          │
          ▼
Collector Unlocks Using RFID Card
          │
          ▼
Collection Completed
```

---

## 🎯 Project Objectives

- Reduce overflowing garbage bins
- Improve waste collection efficiency
- Enable real-time monitoring
- Minimize manual inspection costs
- Support smart city initiatives
- Enhance environmental cleanliness

---

## 🔒 Security Features

- RFID-based collector authentication
- Protected administrative dashboard
- Secure API communication
- Role-based access control
- Authorized collection workflow

---

## 📈 Future Enhancements

- Mobile application integration
- SMS and Email notifications
- AI-based collection route optimization
- Predictive waste analytics
- Solar-powered smart bins
- Cloud IoT integration (AWS IoT / Firebase)

---

## 👨‍💻 Author

**Nirmala**

🎓 Undergraduate Computer Science Student

💡 Passionate about IoT, Embedded Systems, Full-Stack Development, and Smart City Solutions

---

## ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub.

Your support helps improve and expand the project.

---

<p align="center">
🚀 Building Smarter Cities Through IoT Innovation ♻️
</p>
