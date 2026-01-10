from fastapi import FastAPI, HTTPException
import os
import joblib
import pandas as pd
import sys

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.schemas import RiskRequest
from utils.risk_utils import calculate_risk

app = FastAPI()

# Load model once
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "model", "women_safety_xgb_model.pkl")

model = joblib.load(MODEL_PATH)
print("MODEL CLASSES:", model.classes_)  # Expected: [0 1 2]


@app.post("/predict")
def predict_risk(data: RiskRequest):
    try:
        # -----------------------------
        # 1. Build DataFrame
        # -----------------------------
        df = pd.DataFrame([{
            "latitude": float(data.latitude),
            "longitude": float(data.longitude),
            "hour": int(data.hour),
            "crime_density": float(data.crime_density),
            "poi_count": int(data.poi_count),
            "is_night": int(data.is_night),
            "is_isolated": int(data.is_isolated)
        }])

        # -----------------------------
        # 2. Normalize to training scale
        # -----------------------------
        df["crime_density"] = df["crime_density"] / 10.0

        # -----------------------------
        # 3. Extract row for rules
        # -----------------------------
        row = df.iloc[0].to_dict()

        print("RULE INPUT crime_density =", row["crime_density"])  # DEBUG

        # -----------------------------
        # 4. ML prediction
        # -----------------------------
        probs = model.predict_proba(df)[0]

        class_index = list(model.classes_)
        class_prob_map = {
            "LOW": float(probs[class_index.index(0)]),
            "MEDIUM": float(probs[class_index.index(1)]),
            "HIGH": float(probs[class_index.index(2)])
        }

        high_prob = class_prob_map["HIGH"]

        # -----------------------------
        # 5. Final risk calculation
        # -----------------------------
        score, level = calculate_risk(row, high_prob)

        # -----------------------------
        # 6. Response (JSON-safe)
        # -----------------------------
        return {
            "risk_score": int(score),
            "risk_level": level,
#             "debug": class_prob_map  # remove later
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
