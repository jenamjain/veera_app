# 🚨 Veera – Women Safety Risk Prediction Platform

Veera is a **full-stack, end-to-end Women Safety platform** designed to assess and predict safety risks in real time.  
It combines **mobile technology, backend orchestration, machine learning, and an admin dashboard** to enable faster awareness and response.

The system predicts **risk levels (Low / Medium / High)** based on contextual inputs and demonstrates a **complete production-style architecture**.

---

## 🎯 Problem Statement

Women safety systems today often face:
- Lack of real-time risk assessment
- Delayed emergency response
- No predictive intelligence

**Veera addresses this gap by integrating ML-based risk prediction with a scalable backend and user-friendly applications.**

---

## 🧠 Solution Overview

Veera is built as a **multi-service system**:

- 📱 **Mobile App** – user interaction and data input
- ⚙️ **Backend (Java Spring Boot)** – core logic and orchestration
- 🤖 **ML Service (FastAPI)** – risk prediction engine
- 📊 **Admin Dashboard** – monitoring and visualization

Each component is **independent, modular, and scalable**.

---

## 🏗️ High-Level Architecture

Mobile App
↓
Java Spring Boot Backend
↓
FastAPI ML Service
↓
Risk Prediction (Low / Medium / High)
↓
Admin Dashboard & Alerts


---

## 📁 Project Structure (Monorepo)

veera_app/
├── apps/        # Mobile + Dashboard
├── backend/     # Java + ML services
├── docs/
└── README.md




This structure was intentionally designed to make **team contributions and system flow clear**.

---

## 📱 Mobile Application

- **Framework**: React Native (Expo)
- **Role**:
  - User entry point
  - Sends contextual and safety-related inputs
  - Interacts with backend APIs

📂 Location:

apps/mobile-app/

---

## ⚙️ Backend – Core Service

- **Framework**: Java Spring Boot
- **Role**:
  - Central orchestration layer
  - Receives requests from mobile app
  - Communicates with ML service
  - Handles SOS and incident workflows
  - Serves data to the dashboard

📂 Location:

backend/core-service/

---

## 🤖 Machine Learning Service

- **Framework**: Python + FastAPI
- **Model**: XGBoost classifier
- **Role**:
  - Accepts structured risk inputs from backend
  - Loads trained model
  - Predicts safety risk level
  - Returns prediction to backend via API

📂 Location:

backend/ml-service/


This ML service is deployed as a **real API**, not just a notebook.

---

## 📊 Admin Dashboard

- **Framework**: React + Vite + Tailwind
- **Role**:
  -
  Visualize incidents and predictions
  - Monitor system activity
  - Admin / authority interface

📂 Location:

apps/dashboard/

---

## 🛠️ Tech Stack

| Layer | Technology |
|-----|-----------|
| Mobile App | React Native, Expo |
| Dashboard | React, Vite, Tailwind CSS |
| Backend | Java, Spring Boot |
| ML Service | Python, FastAPI |
| ML Model | XGBoost |
| Architecture | Microservices, REST APIs |

---

## 🏆 Key Highlights for Judges

- ✅ Complete end-to-end system
- ✅ Clean separation of concerns
- ✅ Real ML model served via API
- ✅ Scalable microservice architecture
- ✅ Industry-standard monorepo structure
- ✅ Clear team contribution boundaries

---

## 🚀 Future Enhancements

- Real-time GPS tracking
- Live model retraining
- Push notifications for emergencies
- Integration with external emergency services

---

## 👥 Team Contributions

- **Mobile App** – User-facing application
- **Backend** – Core orchestration and logic
- **ML Service** – Risk prediction model & API
- **Dashboard** – Monitoring and visualization

---

### 📌 Note for Reviewers
This repository was **restructured intentionally** to improve clarity, scalability, and ease of evaluation during the hackathon.


### DEMO VIDEO..
<img width="390" height="1030" alt="Screenshot 2026-01-16 at 10 45 46 AM" src="https://github.com/user-attachments/assets/c067bc98-db29-4727-a2c1-b68320293163" />

<img width="390" height="360" alt="VEERA system workflow illustration" src="https://github.com/user-attachments/assets/7538800a-4ec7-48d5-b721-5ed2c682d85d" />
<img width="390" height="678" alt="Screenshot 2026-01-16 at 10 26 52 AM" src="https://github.com/user-attachments/assets/6e9139fe-dd83-459c-8cc0-bdd14ecff20b" />
<img width="390" height="678" alt="Screenshot 2026-01-16 at 10 24 03 AM" src="https://github.com/user-attachments/assets/8607eb3b-117e-4791-b643-570f6d85439e" />
<img width="390" height="678" alt="IMG_3444" src="https://github.com/user-attachments/assets/63563f82-428e-48e6-ae4f-ee7a09ebb44b" />
<img width="390" height="678" alt="IMG_3445" src="https://github.com/user-attachments/assets/90c2afe8-1cd4-4629-bba4-99a6d62c08d4" />
[verra_post.pdf](https://github.com/user-attachments/files/24673580/verra_post.pdf)




