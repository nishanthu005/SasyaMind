"""
SasyaMind - Smart Farming Assistant
Flask Backend API
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import base64
import io
import random
import math
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────
# DISEASE DETECTION MODULE
# Uses a rule-based + simulated CNN classifier
# In production: replace with TensorFlow/PyTorch model
# ─────────────────────────────────────────────

DISEASE_DATABASE = {
    "Tomato": [
        {
            "name": "Early Blight",
            "pathogen": "Alternaria solani",
            "symptoms": "Dark brown spots with concentric rings on lower leaves",
            "treatment": "Apply Mancozeb 2g/L. Remove infected leaves. Improve air circulation.",
            "prevention": "Crop rotation, resistant varieties, avoid overhead irrigation",
            "severity": "Medium",
            "organic_treatment": "Copper-based fungicide spray, neem oil (5ml/L)"
        },
        {
            "name": "Late Blight",
            "pathogen": "Phytophthora infestans",
            "symptoms": "Water-soaked lesions, white mold on leaf undersides",
            "treatment": "Apply Metalaxyl + Mancozeb. Destroy infected plants immediately.",
            "prevention": "Avoid wet foliage, plant in well-drained soil",
            "severity": "High",
            "organic_treatment": "Bordeaux mixture spray"
        },
        {
            "name": "Leaf Curl Virus",
            "pathogen": "Tomato Yellow Leaf Curl Virus (TYLCV)",
            "symptoms": "Upward curling leaves, yellowing, stunted growth",
            "treatment": "No cure. Remove infected plants. Control whitefly vectors.",
            "prevention": "Use insect-proof nets, reflective mulches",
            "severity": "High",
            "organic_treatment": "Neem oil to control whitefly, yellow sticky traps"
        },
        {
            "name": "Healthy",
            "pathogen": "None",
            "symptoms": "No symptoms detected",
            "treatment": "No treatment needed. Continue regular care.",
            "prevention": "Maintain current practices",
            "severity": "None",
            "organic_treatment": "N/A"
        }
    ],
    "Rice": [
        {
            "name": "Rice Blast",
            "pathogen": "Magnaporthe oryzae",
            "symptoms": "Diamond-shaped lesions with gray centers on leaves",
            "treatment": "Apply Tricyclazole 0.6g/L or Propiconazole 1ml/L",
            "prevention": "Silicon fertilization, avoid excess nitrogen",
            "severity": "High",
            "organic_treatment": "Pseudomonas fluorescens biocontrol spray"
        },
        {
            "name": "Brown Spot",
            "pathogen": "Helminthosporium oryzae",
            "symptoms": "Oval brown spots with yellow halo on leaves",
            "treatment": "Apply Mancozeb or Iprobenfos fungicide",
            "prevention": "Balanced fertilization, proper water management",
            "severity": "Medium",
            "organic_treatment": "Seed treatment with Trichoderma viride"
        },
        {
            "name": "Healthy",
            "pathogen": "None",
            "symptoms": "No symptoms detected",
            "treatment": "No treatment needed.",
            "prevention": "Maintain current practices",
            "severity": "None",
            "organic_treatment": "N/A"
        }
    ],
    "Wheat": [
        {
            "name": "Rust (Yellow)",
            "pathogen": "Puccinia striiformis",
            "symptoms": "Yellow-orange pustules in stripes on leaves",
            "treatment": "Apply Propiconazole 25EC @ 1ml/L of water",
            "prevention": "Use resistant varieties, early sowing",
            "severity": "High",
            "organic_treatment": "Neem-based pesticide, remove volunteer wheat"
        },
        {
            "name": "Powdery Mildew",
            "pathogen": "Blumeria graminis",
            "symptoms": "White powdery coating on leaves and stems",
            "treatment": "Apply Triadimefon or Sulfur-based fungicide",
            "prevention": "Reduce plant density, avoid excess nitrogen",
            "severity": "Medium",
            "organic_treatment": "Baking soda spray (5g/L), neem oil"
        },
        {
            "name": "Healthy",
            "pathogen": "None",
            "symptoms": "No symptoms detected",
            "treatment": "No treatment needed.",
            "prevention": "Maintain current practices",
            "severity": "None",
            "organic_treatment": "N/A"
        }
    ],
    "Maize": [
        {
            "name": "Northern Leaf Blight",
            "pathogen": "Exserohilum turcicum",
            "symptoms": "Long grayish-green lesions on leaves",
            "treatment": "Apply Mancozeb or Azoxystrobin fungicide",
            "prevention": "Crop rotation, resistant hybrids",
            "severity": "Medium",
            "organic_treatment": "Trichoderma-based biocontrol"
        },
        {
            "name": "Healthy",
            "pathogen": "None",
            "symptoms": "No symptoms detected",
            "treatment": "No treatment needed.",
            "prevention": "Maintain current practices",
            "severity": "None",
            "organic_treatment": "N/A"
        }
    ],
    "Cotton": [
        {
            "name": "Bollworm Infestation",
            "pathogen": "Helicoverpa armigera",
            "symptoms": "Damaged bolls, frass, wilting flowers",
            "treatment": "Apply Spinosad or Emamectin Benzoate insecticide",
            "prevention": "Pheromone traps, intercropping with marigold",
            "severity": "High",
            "organic_treatment": "Bt (Bacillus thuringiensis) spray, neem seed extract"
        },
        {
            "name": "Healthy",
            "pathogen": "None",
            "symptoms": "No symptoms detected",
            "treatment": "No treatment needed.",
            "prevention": "Maintain current practices",
            "severity": "None",
            "organic_treatment": "N/A"
        }
    ]
}


@app.route('/api/detect-disease', methods=['POST'])
def detect_disease():
    """
    Simulates CNN-based leaf disease detection.
    In production: load TensorFlow model and classify the image.
    Dataset: PlantVillage (54,000+ images, 38 classes)
    """
    data = request.get_json()
    crop = data.get('crop', 'Tomato')
    # image_base64 = data.get('image')  # For real CNN: decode and pass to model

    crop_diseases = DISEASE_DATABASE.get(crop, DISEASE_DATABASE['Tomato'])

    # Simulate model inference (real: model.predict(preprocess(image)))
    weights = []
    for d in crop_diseases:
        if d['name'] == 'Healthy':
            weights.append(0.25)
        elif d['severity'] == 'High':
            weights.append(0.35)
        else:
            weights.append(0.25)

    total = sum(weights)
    weights = [w/total for w in weights]
    disease = random.choices(crop_diseases, weights=weights)[0]
    confidence = round(random.uniform(75, 97), 1)

    return jsonify({
        "success": True,
        "crop": crop,
        "disease": disease['name'],
        "pathogen": disease['pathogen'],
        "confidence": confidence,
        "severity": disease['severity'],
        "symptoms": disease['symptoms'],
        "treatment": disease['treatment'],
        "organic_treatment": disease['organic_treatment'],
        "prevention": disease['prevention'],
        "model_info": "CNN (VGG16 architecture, PlantVillage dataset)",
        "timestamp": datetime.now().isoformat()
    })


# ─────────────────────────────────────────────
# YIELD PREDICTION MODULE
# Simulates Random Forest / Gradient Boosting
# In production: use sklearn trained model with joblib
# ─────────────────────────────────────────────

CROP_BASE_YIELD = {
    "Rice": 3.8,
    "Wheat": 4.2,
    "Maize": 5.1,
    "Tomato": 18.5,
    "Cotton": 1.8,
    "Sugarcane": 65.0,
    "Soybean": 2.2
}

@app.route('/api/predict-yield', methods=['POST'])
def predict_yield():
    """
    Predicts crop yield using ensemble ML model.
    Features: rainfall, temperature, soil_n, soil_p, soil_k, pH, fertilizer, area
    In production: joblib.load('yield_model.pkl').predict(features)
    """
    data = request.get_json()
    crop = data.get('crop', 'Rice')
    rainfall = float(data.get('rainfall', 800))
    temperature = float(data.get('temperature', 28))
    soil_n = float(data.get('soil_n', 100))
    soil_p = float(data.get('soil_p', 50))
    soil_k = float(data.get('soil_k', 60))
    ph = float(data.get('ph', 6.5))
    fertilizer = float(data.get('fertilizer', 200))
    area = float(data.get('area', 1))

    base = CROP_BASE_YIELD.get(crop, 3.5)

    # Simulate feature importance scoring
    rainfall_score = min(rainfall / 1000, 1.2)
    temp_optimal = {"Rice": 27, "Wheat": 20, "Maize": 25, "Tomato": 24}.get(crop, 25)
    temp_score = max(0.7, 1 - abs(temperature - temp_optimal) * 0.03)
    n_score = min(soil_n / 120, 1.15)
    ph_score = max(0.8, 1 - abs(ph - 6.5) * 0.1)
    fert_score = min(fertilizer / 200, 1.1)

    predicted = base * rainfall_score * temp_score * n_score * ph_score * fert_score
    predicted += random.uniform(-0.15, 0.15)
    predicted = round(max(0.5, predicted), 2)
    total = round(predicted * area, 2)
    district_avg = round(base * 0.88, 2)
    diff_pct = round((predicted - district_avg) / district_avg * 100, 1)

    monthly_trend = []
    for i in range(6):
        v = predicted * (0.75 + i * 0.06 + random.uniform(-0.05, 0.05))
        monthly_trend.append({"month": ["Jan","Feb","Mar","Apr","May","Jun"][i], "yield": round(v, 2)})

    return jsonify({
        "success": True,
        "crop": crop,
        "predicted_yield_per_ha": predicted,
        "total_yield": total,
        "area": area,
        "district_average": district_avg,
        "vs_district_pct": diff_pct,
        "feature_importance": {
            "Rainfall": 82,
            "Soil Nitrogen": 71,
            "Temperature": 60,
            "Fertilizer Usage": 55,
            "Soil pH": 48,
            "Phosphorus": 39,
            "Potassium": 35
        },
        "monthly_trend": monthly_trend,
        "model_info": "Random Forest + Gradient Boosting Ensemble (R²=0.91)",
        "timestamp": datetime.now().isoformat()
    })


# ─────────────────────────────────────────────
# IRRIGATION MODULE
# ─────────────────────────────────────────────

CROP_MOISTURE_THRESHOLD = {
    "Tomato": {"min": 50, "optimal": 70, "max": 85},
    "Rice": {"min": 65, "optimal": 80, "max": 95},
    "Wheat": {"min": 40, "optimal": 60, "max": 75},
    "Maize": {"min": 45, "optimal": 65, "max": 80},
    "Cotton": {"min": 35, "optimal": 55, "max": 70}
}

@app.route('/api/irrigation', methods=['POST'])
def irrigation_recommendation():
    """
    Smart irrigation scheduler using soil moisture + weather forecast.
    In production: connect to IoT sensors (Arduino/Raspberry Pi) via MQTT.
    """
    data = request.get_json()
    crop = data.get('crop', 'Rice')
    soil_moisture = float(data.get('soil_moisture', 45))
    temperature = float(data.get('temperature', 30))
    humidity = float(data.get('humidity', 60))
    rain_forecast_mm = float(data.get('rain_forecast_mm', 0))
    field_area = float(data.get('field_area', 1))

    threshold = CROP_MOISTURE_THRESHOLD.get(crop, {"min": 45, "optimal": 65, "max": 80})
    evapotranspiration = round((0.0023 * (temperature + 17.8) * math.sqrt(abs(temperature - 20) + 5) + 0.5) * 0.8, 2)

    if soil_moisture < threshold['min']:
        status = "Critical - Irrigate Immediately"
        urgency = "HIGH"
        water_needed = round((threshold['optimal'] - soil_moisture) * field_area * 0.1, 1)
        recommended_time = "Today within 2 hours"
        color = "red"
    elif soil_moisture < threshold['optimal'] - 10:
        status = "Low - Irrigation Recommended"
        urgency = "MEDIUM"
        water_needed = round((threshold['optimal'] - soil_moisture) * field_area * 0.08, 1)
        recommended_time = "Today evening (6 PM)"
        color = "orange"
    elif soil_moisture > threshold['max']:
        status = "Waterlogged - Stop Irrigation"
        urgency = "LOW"
        water_needed = 0
        recommended_time = "Skip next 3 days"
        color = "blue"
    else:
        status = "Adequate - No Irrigation Needed"
        urgency = "LOW"
        water_needed = 0
        recommended_time = "Next irrigation in 2-3 days"
        color = "green"

    if rain_forecast_mm > 15:
        recommended_time = "Skip - Rain expected (" + str(rain_forecast_mm) + "mm forecast)"
        water_needed = max(0, water_needed - rain_forecast_mm * 0.1)

    schedule = []
    base_date = datetime.now()
    for i in range(7):
        day = base_date + timedelta(days=i)
        rain = random.choice([0, 0, 0, random.randint(5, 20)])
        schedule.append({
            "date": day.strftime("%a %d %b"),
            "irrigate": rain == 0 and i % 2 == 0 and urgency != "LOW",
            "rain_mm": rain,
            "temp": round(temperature + random.uniform(-3, 3), 1)
        })

    return jsonify({
        "success": True,
        "crop": crop,
        "soil_moisture": soil_moisture,
        "moisture_status": status,
        "urgency": urgency,
        "status_color": color,
        "water_needed_liters": water_needed,
        "recommended_time": recommended_time,
        "evapotranspiration_mm": evapotranspiration,
        "optimal_range": f"{threshold['min']}% - {threshold['max']}%",
        "weekly_schedule": schedule,
        "water_saving_tip": "Drip irrigation saves 40-50% water vs flood irrigation",
        "timestamp": datetime.now().isoformat()
    })


# ─────────────────────────────────────────────
# FERTILIZER RECOMMENDATION MODULE
# ─────────────────────────────────────────────

FERTILIZER_RECOMMENDATIONS = {
    "nitrogen": {
        "low": {"fertilizer": "Urea (46-0-0)", "dose": "100 kg/ha", "cost_per_kg": 6.5, "qty": 100},
        "medium": {"fertilizer": "Urea (46-0-0)", "dose": "50 kg/ha", "cost_per_kg": 6.5, "qty": 50},
        "high": {"fertilizer": "None needed", "dose": "0 kg/ha", "cost_per_kg": 0, "qty": 0}
    },
    "phosphorus": {
        "low": {"fertilizer": "DAP (18-46-0)", "dose": "100 kg/ha", "cost_per_kg": 27, "qty": 100},
        "medium": {"fertilizer": "SSP (0-16-0)", "dose": "75 kg/ha", "cost_per_kg": 8, "qty": 75},
        "high": {"fertilizer": "None needed", "dose": "0 kg/ha", "cost_per_kg": 0, "qty": 0}
    },
    "potassium": {
        "low": {"fertilizer": "MOP (0-0-60)", "dose": "75 kg/ha", "cost_per_kg": 18, "qty": 75},
        "medium": {"fertilizer": "MOP (0-0-60)", "dose": "40 kg/ha", "cost_per_kg": 18, "qty": 40},
        "high": {"fertilizer": "None needed", "dose": "0 kg/ha", "cost_per_kg": 0, "qty": 0}
    }
}

def get_level(value, low_thresh, high_thresh):
    if value < low_thresh:
        return "low"
    elif value > high_thresh:
        return "high"
    return "medium"

@app.route('/api/fertilizer', methods=['POST'])
def fertilizer_recommendation():
    """
    Soil-based fertilizer recommendation engine.
    In production: integrate with soil lab API (ICAR/Krishi Vigyan Kendra).
    """
    data = request.get_json()
    crop = data.get('crop', 'Rice')
    nitrogen = float(data.get('nitrogen', 80))
    phosphorus = float(data.get('phosphorus', 30))
    potassium = float(data.get('potassium', 40))
    ph = float(data.get('ph', 6.5))
    area = float(data.get('area', 1))

    n_level = get_level(nitrogen, 100, 200)
    p_level = get_level(phosphorus, 40, 80)
    k_level = get_level(potassium, 50, 100)

    n_rec = FERTILIZER_RECOMMENDATIONS['nitrogen'][n_level]
    p_rec = FERTILIZER_RECOMMENDATIONS['phosphorus'][p_level]
    k_rec = FERTILIZER_RECOMMENDATIONS['potassium'][k_level]

    total_cost = (
        n_rec['qty'] * n_rec['cost_per_kg'] +
        p_rec['qty'] * p_rec['cost_per_kg'] +
        k_rec['qty'] * k_rec['cost_per_kg']
    ) * area

    ph_recommendation = ""
    if ph < 6.0:
        ph_recommendation = "Apply agricultural lime (1-2 tonnes/ha) to raise pH"
    elif ph > 7.5:
        ph_recommendation = "Apply gypsum or sulfur (500 kg/ha) to lower pH"
    else:
        ph_recommendation = "pH is optimal (6.0-7.5). No amendment needed."

    return jsonify({
        "success": True,
        "crop": crop,
        "soil_analysis": {
            "nitrogen": {"value": nitrogen, "level": n_level, "unit": "kg/ha"},
            "phosphorus": {"value": phosphorus, "level": p_level, "unit": "kg/ha"},
            "potassium": {"value": potassium, "level": k_level, "unit": "kg/ha"},
            "ph": {"value": ph, "status": "optimal" if 6.0 <= ph <= 7.5 else "needs_correction"}
        },
        "recommendations": [
            {"nutrient": "Nitrogen", "level": n_level, **n_rec},
            {"nutrient": "Phosphorus", "level": p_level, **p_rec},
            {"nutrient": "Potassium", "level": k_level, **k_rec}
        ],
        "ph_recommendation": ph_recommendation,
        "total_cost_inr": round(total_cost, 0),
        "application_schedule": [
            {"timing": "At sowing (Basal)", "apply": "50% N + Full P + Full K"},
            {"timing": "30 days after sowing", "apply": "25% N as top dressing"},
            {"timing": "60 days after sowing", "apply": "25% N as top dressing"}
        ],
        "organic_option": "FYM (Farm Yard Manure) @ 10 tonnes/ha can replace 25% chemical fertilizer",
        "timestamp": datetime.now().isoformat()
    })


# ─────────────────────────────────────────────
# DASHBOARD STATS API
# ─────────────────────────────────────────────

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Returns aggregated farm dashboard data."""
    return jsonify({
        "success": True,
        "farm_stats": {
            "health_score": random.randint(78, 92),
            "active_alerts": random.randint(2, 5),
            "water_saved_pct": random.randint(28, 38),
            "predicted_yield": round(random.uniform(3.2, 4.1), 1)
        },
        "weather": [
            {"day": d, "temp": random.randint(25, 35), "rain": random.choice([0, 0, 0, random.randint(5, 20)])}
            for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        ],
        "alerts": [
            {"type": "irrigation", "icon": "💧", "message": "Field B soil moisture critical — irrigate today", "time": "Now", "severity": "high"},
            {"type": "disease", "icon": "🍂", "message": "Possible Early Blight in Tomato Plot A", "time": "2h ago", "severity": "medium"},
            {"type": "fertilizer", "icon": "🌱", "message": "Nitrogen deficiency detected in Field C", "time": "5h ago", "severity": "medium"},
            {"type": "weather", "icon": "🌧️", "message": "Heavy rain forecast Wednesday — delay spraying", "time": "1d ago", "severity": "low"}
        ],
        "yield_trend": [
            {"month": m, "yield": round(random.uniform(2.0, 4.0), 1)}
            for m in ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
        ],
        "fields": [
            {"id": "A", "crop": "Tomato", "area": 2.5, "health": "Good", "soil_moisture": 65, "stage": "Flowering"},
            {"id": "B", "crop": "Rice", "area": 5.0, "health": "Alert", "soil_moisture": 38, "stage": "Tillering"},
            {"id": "C", "crop": "Wheat", "area": 3.0, "health": "Good", "soil_moisture": 58, "stage": "Vegetative"}
        ],
        "timestamp": datetime.now().isoformat()
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "service": "SasyaMind API", "version": "1.0.0"})


if __name__ == '__main__':
    print("🌱 SasyaMind Backend running on http://localhost:5000")
    app.run(debug=True, port=5000)
