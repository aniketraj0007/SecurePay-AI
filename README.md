# 🚀 SecurePay-AI | Fraud Detection SaaS Platform

**SecurePay-AI** is a comprehensive, full-stack AI-driven platform designed to detect fraudulent transactions in real-time. Inspired by industry-standard tools like FraudLabs Pro, it combines rule-based heuristics with machine learning to provide accurate risk scoring and explainable insights (XAI).

![Backend Status](https://img.shields.io/badge/Backend-FastAPI-success)
![ML Logic](https://img.shields.io/badge/AI-Random_Forest-blue)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla_JS_Modular-cyan)
![Auth](https://img.shields.io/badge/Auth-Firebase-orange)

## 🧠 Core Features
- **Real-Time Fraud Engine**: Hybrid logic using Python backend and trained ML models.
- **Explainable AI (XAI)**: Detailed reasoning for every "Fraud" or "Suspicious" status.
- **CSV Batch Processing**: Upload bulk transaction logs for high-speed anomaly detection.
- **Developer API**: Professional RESTful endpoints with documentation and key management.
- **SaaS Business Model**: Integrated Billing/Plans with simulated Razorpay checkout.
- **Modern Fintech UI**: A sleek, high-fidelity dashboard built for investors and developers alike.

## 🏗️ System Architecture
- **Frontend**: Modular HTLM/CSS/Vanilla JS (Investor-Ready UI).
- **Backend**: FastAPI (Python) for API logic and data processing.
- **Machine Learning**: Scikit-Learn Random Forest Classifier trained on behavioral data.
- **Security**: Firebase Authentication for secure user session management.

## 📁 Project Structure
```text
SecurePay-AI/
├── frontend/     # High-fidelity UI & Static Assets
├── backend/      # FastAPI Server (main.py)
├── model/        # ML Training logic & Pickled Model
└── README.md     # Project Documentation
```

## 🛠️ Installation & Setup

### 1. Requirements
- Python 3.8+
- Scikit-learn, Pandas, FastAPI, Uvicorn, Joblib.

### 2. Startup Guide
**Run Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Run Frontend:**
```bash
cd frontend
python -m http.server 8001
```

**Access Admin Dashboard:**
Navigate to `http://localhost:8001` in your browser.

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---
🚀 Built with ❤️ by Aniket Sir & Antigravity AI