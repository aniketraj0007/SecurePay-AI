# model/train.py - ML Model Training for SecurePay-AI
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Create dummy dataset for training (Simulated)
# Features: [amount, location_is_india, device_is_new]
data = {
    "amount": [100, 500, 70000, 120000, 450, 60000, 200, 800],
    "location_is_india": [1, 1, 0, 0, 1, 0, 1, 1],
    "device_is_new": [0, 0, 1, 1, 0, 1, 0, 0],
    "is_fraud": [0, 0, 1, 1, 0, 1, 0, 0]
}

df = pd.DataFrame(data)

# Features and Target
X = df[["amount", "location_is_india", "device_is_new"]]
y = df["is_fraud"]

# Train Model
print("Training Random Forest Classifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Save Model
MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
joblib.dump(model, MODEL_PATH)

print(f"Model successfully saved to {MODEL_PATH}")
