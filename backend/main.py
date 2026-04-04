# backend/main.py - FastAPI Server for SecurePay-AI
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import random

app = FastAPI(title="SecurePay-AI Backend")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transaction(BaseModel):
    amount: float
    location: str
    device: str

# Load ML Model (Simulated path for now)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "model.pkl")
model = None
if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
    except:
        pass

@app.post("/check-fraud")
async def check_fraud(data: Transaction):
    score = 0
    reasons = []

    # Rule-Based Logic
    if data.amount > 50000:
        score += 35
        reasons.append("High Transaction Amount")
    
    if data.location.lower() != "india":
        score += 25
        reasons.append("Unusual Location (International)")
    
    if data.device.lower() == "new":
        score += 20
        reasons.append("New Device Fingerprint")

    # ML Model Prediction (Hybrid)
    ml_contribution = random.randint(0, 20)
    if model:
        try:
            # Simulated prediction for demo
            pred = model.predict([[data.amount, 1 if data.location.lower() == "india" else 0, 1 if data.device.lower() == "new" else 0]])
            if pred[0] == 1:
                ml_contribution = 30
        except:
            pass
    
    score += ml_contribution
    if ml_contribution > 20: 
        reasons.append("ML Model: High Anomaly Pattern")

    status = "Genuine"
    if score > 75:
        status = "Fraud"
    elif score > 45:
        status = "Suspicious"

    return {
        "status": status, 
        "score": min(score, 100), 
        "reasons": reasons,
        "recommendation": "BLOCK" if status == "Fraud" else ("REVIEW" if status == "Suspicious" else "ALLOW")
    }

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    # Simple CSV processing
    try:
        df = pd.read_csv(file.file)
        results = []
        for index, row in df.head(10).iterrows(): # Limit to 10 for demo speed
            res = await check_fraud(Transaction(
                amount=float(row.get('amount', 0)),
                location=str(row.get('location', 'Unknown')),
                device=str(row.get('device', 'New'))
            ))
            results.append({
                "txn_id": f"TXN-{1000 + index}",
                "amount": row.get('amount'),
                "score": res['score'],
                "status": res['status'],
                "reasons": ", ".join(res['reasons'])
            })
        return results
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
