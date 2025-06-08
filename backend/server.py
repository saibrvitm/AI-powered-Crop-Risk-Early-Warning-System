from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
import joblib
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pathlib import Path
from typing import Optional
from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import io

# Load the saved models
model_data = joblib.load('./crop-selector/crop_prediction_model.pkl')
model_crop = model_data['model']  # Get the model from the saved data
encoder = joblib.load('./water-advisor/encoder.pkl')
scaler = joblib.load('./water-advisor/scaler.pkl')

# Load the plant disease model
plant_disease_model = load_model('./disease-plant/my_plant_model.h5')

# Define class indices for plant disease prediction
PLANT_DISEASE_CLASSES = {
    0: "Pepper__bell___Bacterial_spot",
    1: "Pepper__bell___healthy",
    2: "PlantVillage",
    3: "Potato___Early_blight",
    4: "Potato___healthy",
    5: "Potato___Late_blight",
    6: "Tomato_Bacterial_spot",
    7: "Tomato_Early_blight",
    8: "Tomato_healthy",
    9: "Tomato_Late_blight",
    10: "Tomato_Leaf_Mold",
    11: "Tomato_Septoria_leaf_spot",
    12: "Tomato_Spider_mites_Two_spotted_spider_mite",
    13: "Tomato__Target_Spot",
    14: "Tomato__Tomato_mosaic_virus",
    15: "Tomato__Tomato_YellowLeaf__Curl_Virus"
}

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

def extract_last_double_underscore_text(text):
    parts = text.split('__')
    return parts[-1] if len(parts) > 1 else None

# API endpoint for plant disease prediction
@app.post("/api/disease-predict")
async def predict_disease(file: UploadFile = File(...)):
    """
    Endpoint to predict plant disease from an uploaded image.
    """
    try:
        # Read and validate the image
        contents = await file.read()
        img = image.load_img(io.BytesIO(contents), target_size=(128, 128))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Make prediction
        prediction = plant_disease_model.predict(img_array)
        predicted_class = np.argmax(prediction)
        confidence = float(prediction[0][predicted_class])

        # Get the predicted label
        predicted_label = PLANT_DISEASE_CLASSES[predicted_class]

        return {
            "disease": extract_last_double_underscore_text(predicted_label) or predicted_label,
            "confidence": confidence,
            "is_healthy": "healthy" in predicted_label.lower()
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    