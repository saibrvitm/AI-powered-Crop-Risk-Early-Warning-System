from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

# Load the saved models
model_data = joblib.load('./crop-selector/crop_prediction_model.pkl')
model_crop = model_data['model']  # Get the model from the saved data
model_water = joblib.load('./water-advisor/crop_model.pkl')
encoder = joblib.load('./water-advisor/encoder.pkl')
scaler = joblib.load('./water-advisor/scaler.pkl')

# Define the FastAPI app
app = FastAPI()

# Add CORSMiddleware to handle CORS requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the input schema for crop prediction with new optional fields
class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    ph: float
    rainfall: float
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    season: Optional[str] = None
    crop_type: Optional[str] = None

# Define the input schema for water use prediction
class WaterInput(BaseModel):
    Rainfall_Requirement: float
    Temperature_Requirement: float
    Soil_Type: str
    Irrigation_Type: str
    Water_Scarcity: str
    Yield: float
    Crop_Cycle_Duration: float
    Crop_Name: str

def calculate_soil_quality(N, P, K):
    N_norm = N / 100
    P_norm = P / 100
    K_norm = K / 100
    quality = (N_norm * 0.4 + P_norm * 0.3 + K_norm * 0.3) * 100
    return quality

# Function to handle unseen labels during prediction
def safe_transform(encoder, value):
    try:
        return encoder.transform([value])[0]
    except ValueError:
        return -1

# API endpoint for crop prediction
@app.post("/api/crop")
def crop_predict(input_data: CropInput):
    try:
        # Calculate soil quality
        soil_quality = calculate_soil_quality(input_data.N, input_data.P, input_data.K)
        
        # Convert input to numpy array for prediction
        features = np.array([[input_data.N, input_data.P, input_data.K, 
                            input_data.temperature, 
                            input_data.ph, input_data.rainfall,
                            soil_quality]])
        
        # Predict probabilities for each crop
        probabilities = model_crop.predict_proba(features)
        
        # Get the top 3 predicted crops
        top_n = 3
        top_crops_indices = np.argsort(probabilities[0])[::-1][:top_n]
        
        # Fetch top crops and probabilities
        top_crops = [(model_crop.classes_[i], probabilities[0][i]) for i in top_crops_indices]
        
        # Format the response
        return {
            "predicted_crop": " | ".join([crop for crop, _ in top_crops]),
            "confidence": float(max(probabilities[0])),
            "soil_quality": float(soil_quality),
            "additional_info": {
                "soil_type": input_data.soil_type,
                "irrigation_type": input_data.irrigation_type,
                "season": input_data.season,
                "crop_type": input_data.crop_type
            }
        }
    except Exception as e:
        return {"error": str(e)}

# API endpoint for water use, temperature, and rainfall prediction
@app.post("/api/water_use")
def water_use_predict(input_data: WaterInput):
    try:
        # Encode categorical variables
        soil_type_encoded = safe_transform(encoder, input_data.Soil_Type)
        irrigation_type_encoded = safe_transform(encoder, input_data.Irrigation_Type)
        water_scarcity_encoded = safe_transform(encoder, input_data.Water_Scarcity)
        crop_name_encoded = safe_transform(encoder, input_data.Crop_Name)
        
        # Create feature array for prediction
        features = np.array([[input_data.Rainfall_Requirement, input_data.Temperature_Requirement,
                            soil_type_encoded, irrigation_type_encoded, water_scarcity_encoded,
                            input_data.Yield, input_data.Crop_Cycle_Duration, crop_name_encoded]])
        
        # Scale the input features
        features_scaled = scaler.transform(features)
        
        # Predict water use, temperature, and rainfall requirement
        predictions = model_water.predict(features_scaled)[0]
        
        return {
            "predicted_water_use": f"{predictions[0]:.2f} m³ per kg",
            "predicted_temperature_requirement": f"{predictions[1]:.2f} °C",
            "predicted_rainfall_requirement": f"{predictions[2]:.2f} mm/year"
        }
    except Exception as e:
        return {"error": str(e)}
