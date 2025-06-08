import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib

# Load all datasets
rainfall_data = pd.read_csv("./datasets/crop_yield_by_rainfall.csv")
region_data = pd.read_csv("./datasets/crop_yield_by_region.csv")
soil_data = pd.read_csv("./datasets/crop_yield_by_soil.csv")

# Preprocess rainfall data
rainfall_data['rainfall'] = rainfall_data['rainfall'] / 100

# Create a mapping of soil types to numerical values
soil_type_mapping = {
    'Peaty': 0,
    'Loamy': 1,
    'Sandy': 2,
    'Clay': 3,
    'Silt': 4
}

# Create a mapping of seasons
season_mapping = {
    'Kharif': 0,
    'Rabi': 1,
    'Zaid': 2,
    'Whole Year': 3
}

# Create a mapping of irrigation types
irrigation_mapping = {
    'Drip': 0,
    'Sprinkler': 1,
    'Flood': 2,
    'Rainfed': 3
}

# Create a mapping of crop types
crop_type_mapping = {
    'Cereal': 0,
    'Pulse': 1,
    'Vegetable': 2,
    'Fruit': 3
}

# Function to get soil quality score based on N, P, K values
def calculate_soil_quality(N, P, K):
    # Normalize the values (assuming max values are 100)
    N_norm = N / 100
    P_norm = P / 100
    K_norm = K / 100
    
    # Calculate weighted average (you can adjust weights based on importance)
    quality = (N_norm * 0.4 + P_norm * 0.3 + K_norm * 0.3) * 100
    return quality

# Prepare features for training
X = rainfall_data[['N', 'P', 'K', 'temperature', 'ph', 'rainfall']].copy()

# Add soil quality score
X['soil_quality'] = X.apply(lambda row: calculate_soil_quality(row['N'], row['P'], row['K']), axis=1)

# Target variable
y = rainfall_data['crop']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=10,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Base Model Accuracy: {accuracy * 100:.2f}%")

# Save the model and mappings
model_data = {
    'model': model,
    'soil_type_mapping': soil_type_mapping,
    'season_mapping': season_mapping,
    'irrigation_mapping': irrigation_mapping,
    'crop_type_mapping': crop_type_mapping
}

joblib.dump(model_data, 'crop_prediction_model.pkl')
print("Model and mappings saved as 'crop_prediction_model.pkl'")

# Example prediction with new features
def predict_crop(input_data):
    # Calculate soil quality
    soil_quality = calculate_soil_quality(
        input_data['N'],
        input_data['P'],
        input_data['K']
    )
    
    # Prepare features
    features = pd.DataFrame({
        'N': [input_data['N']],
        'P': [input_data['P']],
        'K': [input_data['K']],
        'temperature': [input_data['temperature']],
        'ph': [input_data['ph']],
        'rainfall': [input_data['rainfall']],
        'soil_quality': [soil_quality]
    })
    
    # Get prediction
    prediction = model.predict(features)
    return prediction[0]

# Test the prediction function
test_input = {
    'N': 85,
    'P': 55,
    'K': 40,
    'temperature': 25.00,
    'ph': 6.8,
    'rainfall': 250.0
}

predicted_crop = predict_crop(test_input)
print(f"Test Prediction: {predicted_crop}")
