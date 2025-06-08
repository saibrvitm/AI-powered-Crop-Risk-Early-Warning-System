from tensorflow.keras.preprocessing import image
from tensorflow.keras.models import load_model
import numpy as np

# Load your saved model
model = load_model("my_plant_model.h5")

# Load and preprocess the image
img = image.load_img('leaf.jpg', target_size=(128, 128))
img_array = image.img_to_array(img) / 255.0
img_array = np.expand_dims(img_array, axis=0)

# Predict
prediction = model.predict(img_array)

# Define your class indices dictionary (must match training)
predicted_class = {
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

predicted_label = predicted_class[np.argmax(prediction)]

print("Predicted class:", predicted_label)
