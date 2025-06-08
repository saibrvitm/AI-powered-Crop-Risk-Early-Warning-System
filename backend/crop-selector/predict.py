import joblib
import pandas as pd
import numpy as np

# Load the model and mappings
model_data = joblib.load('crop_prediction_model.pkl')
model = model_data['model']
soil_type_mapping = model_data['soil_type_mapping']
season_mapping = model_data['season_mapping']
irrigation_mapping = model_data['irrigation_mapping']
crop_type_mapping = model_data['crop_type_mapping']

def calculate_soil_quality(N, P, K):
    N_norm = N / 100
    P_norm = P / 100
    K_norm = K / 100
    quality = (N_norm * 0.4 + P_norm * 0.3 + K_norm * 0.3) * 100
    return quality

# Test data with all new features
test_input = {
    'N': 85,
    'P': 55,
    'K': 40,
    'temperature': 25.00,
    'ph': 6.8,
    'rainfall': 250.0,
    'soil_type': 'Loamy',
    'irrigation_type': 'Drip',
    'season': 'Kharif',
    'crop_type': 'Cereal'
}

# Calculate soil quality
soil_quality = calculate_soil_quality(test_input['N'], test_input['P'], test_input['K'])

# Prepare features
features = pd.DataFrame({
    'N': [test_input['N']],
    'P': [test_input['P']],
    'K': [test_input['K']],
    'temperature': [test_input['temperature']],
    'ph': [test_input['ph']],
    'rainfall': [test_input['rainfall']],
    'soil_quality': [soil_quality]
})

# Get prediction
predicted_crop = model.predict(features)[0]

# Get prediction probabilities
probabilities = model.predict_proba(features)[0]
crop_classes = model.classes_

# Create a list of crops with their probabilities
crop_probs = list(zip(crop_classes, probabilities))
# Sort by probability in descending order
crop_probs.sort(key=lambda x: x[1], reverse=True)

# Get top 3 recommendations
top_recommendations = [crop for crop, prob in crop_probs[:3]]

print("\nTest Results:")
print("-------------")
print(f"Input Features:")
for key, value in test_input.items():
    print(f"{key}: {value}")
print(f"\nSoil Quality Score: {soil_quality:.2f}")
print("\nTop 3 Recommended Crops:")
for i, (crop, prob) in enumerate(crop_probs[:3], 1):
    print(f"{i}. {crop} (Confidence: {prob*100:.2f}%)") 