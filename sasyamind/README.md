# 🌱 SasyaMind — Smart Farming Assistant
### Final Year AI Project | React + Flask + Machine Learning

---

## 📌 Project Overview

SasyaMind is an intelligent platform that helps farmers make data-driven decisions using Artificial Intelligence. It combines Computer Vision, Machine Learning, and IoT sensor integration to provide real-time farming recommendations.

## 🎯 Modules

| Module | Technology | Purpose |
|--------|-----------|---------|
| 🔬 Disease Detection | CNN (VGG16), PlantVillage | Leaf image analysis → disease identification |
| 📊 Yield Prediction | Random Forest + Gradient Boosting | Forecast crop yield from soil/weather data |
| 💧 Smart Irrigation | Time-series + Weather API | Optimal irrigation scheduling |
| 🧪 Fertilizer Advisor | Rule-based + NPK Analysis | Soil-based fertilizer recommendations |

---

## 🛠 Tech Stack

```
Frontend:  React 18, Recharts, Axios
Backend:   Python Flask, Flask-CORS
ML/AI:     scikit-learn, NumPy, Pandas, TensorFlow (for CNN)
Database:  PostgreSQL (production) / SQLite (development)
IoT:       MQTT / Arduino / Raspberry Pi (production)
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Python 3.9+ 
- Node.js 18+
- npm or yarn

### Step 1 — Clone / Extract the project
```bash
cd sasyamind
```

### Step 2 — Start the Backend (Flask API)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
✅ Backend running at: http://localhost:5000

Test it:
```bash
curl http://localhost:5000/api/health
```

### Step 3 — Start the Frontend (React)
```bash
cd frontend
npm install
npm start
```
✅ Frontend running at: http://localhost:3000

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Dashboard stats, alerts, weather |
| POST | `/api/detect-disease` | Crop disease detection |
| POST | `/api/predict-yield` | Yield prediction |
| POST | `/api/irrigation` | Irrigation recommendation |
| POST | `/api/fertilizer` | Fertilizer recommendation |

### Example API Call (Disease Detection)
```bash
curl -X POST http://localhost:5000/api/detect-disease \
  -H "Content-Type: application/json" \
  -d '{"crop": "Tomato", "image": "<base64_image_string>"}'
```

### Example Response
```json
{
  "success": true,
  "crop": "Tomato",
  "disease": "Early Blight",
  "pathogen": "Alternaria solani",
  "confidence": 89.3,
  "severity": "Medium",
  "treatment": "Apply Mancozeb 2g/L...",
  "organic_treatment": "Copper-based fungicide...",
  "prevention": "Crop rotation, resistant varieties..."
}
```

---

## 🤖 Integrating Real CNN Model (TensorFlow)

Replace the simulated detection in `backend/app.py` with:

```python
import tensorflow as tf
from PIL import Image
import numpy as np
import base64, io

# Load model once at startup
model = tf.keras.models.load_model('models/plant_disease_cnn.h5')

CLASS_NAMES = ['Tomato_Early_Blight', 'Tomato_Healthy', ...]  # 38 classes

def preprocess_image(base64_str):
    img_bytes = base64.b64decode(base64_str)
    img = Image.open(io.BytesIO(img_bytes)).resize((224, 224))
    arr = np.array(img) / 255.0
    return np.expand_dims(arr, 0)

# In detect_disease():
img_array = preprocess_image(data['image'])
predictions = model.predict(img_array)
predicted_class = CLASS_NAMES[np.argmax(predictions)]
confidence = float(np.max(predictions)) * 100
```

**Download PlantVillage trained model:**
- Dataset: https://www.kaggle.com/datasets/emmarex/plantdisease
- Pre-trained weights: Train using `notebooks/train_cnn.ipynb`

---

## 🤖 Integrating Real Yield Prediction Model (scikit-learn)

```python
import joblib
import pandas as pd

# Load trained model
yield_model = joblib.load('models/yield_model.pkl')
scaler = joblib.load('models/scaler.pkl')

# In predict_yield():
features = pd.DataFrame([{
    'rainfall': rainfall, 'temperature': temperature,
    'N': soil_n, 'P': soil_p, 'K': soil_k,
    'ph': ph, 'fertilizer': fertilizer
}])
features_scaled = scaler.transform(features)
prediction = yield_model.predict(features_scaled)[0]
```

**Training the model:**
```bash
cd backend
python train_model.py  # Uses Crop_recommendation.csv dataset
```

---

## 🗃 Database Setup (PostgreSQL)

```sql
CREATE DATABASE agromind;
CREATE TABLE disease_records (
    id SERIAL PRIMARY KEY,
    crop VARCHAR(50),
    disease VARCHAR(100),
    confidence FLOAT,
    treatment TEXT,
    detected_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE yield_predictions (
    id SERIAL PRIMARY KEY,
    crop VARCHAR(50),
    rainfall FLOAT,
    temperature FLOAT,
    predicted_yield FLOAT,
    actual_yield FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📁 Project Structure

```
agromind/
├── backend/
│   ├── app.py              # Flask API (all routes)
│   ├── requirements.txt    # Python dependencies
│   └── models/             # Saved ML models (.pkl, .h5)
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main app + routing
│   │   ├── App.css         # Global styles
│   │   ├── components/
│   │   │   └── Sidebar.js  # Navigation sidebar
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── DiseaseDetection.js
│   │   │   ├── YieldPrediction.js
│   │   │   ├── Irrigation.js
│   │   │   └── Fertilizer.js
│   │   └── context/
│   │       └── api.js      # API service layer (Axios)
│   ├── public/index.html
│   └── package.json
└── README.md
```

---

## 🔧 Environment Variables

Create `backend/.env`:
```
FLASK_ENV=development
DATABASE_URL=postgresql://user:pass@localhost/agromind
WEATHER_API_KEY=your_openweathermap_key
SECRET_KEY=your-secret-key
```

---

## 🎓 For Final Year Viva/Presentation

**Key AI Concepts to explain:**
1. **CNN Architecture** — Convolutional layers extract spatial features from leaf images
2. **Transfer Learning** — VGG16 pretrained on ImageNet, fine-tuned on PlantVillage
3. **Ensemble Learning** — Random Forest + Gradient Boosting for robust yield prediction
4. **Feature Importance** — Shapley values explain which soil parameters matter most
5. **IoT Integration** — Soil sensors send MQTT messages → Flask processes → React displays

**Datasets used:**
- Disease: [PlantVillage](https://www.kaggle.com/datasets/emmarex/plantdisease) (54,306 images)
- Yield: [Crop Yield Prediction](https://www.kaggle.com/datasets/patelris/crop-yield-prediction-dataset)
- Fertilizer: [Fertilizer Recommendation](https://www.kaggle.com/datasets/gdabhishek/fertilizer-prediction)

---

## 👨‍💻 Built With
- React 18 + Recharts (interactive charts)
- Flask + scikit-learn + TensorFlow
- PlantVillage CNN model
- OpenWeatherMap API (weather forecast)

---

*SasyaMind — Empowering Indian farmers with Artificial Intelligence* 🇮🇳
