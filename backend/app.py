from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import pandas as pd
import os
import pickle
import json
import numpy as np
from datetime import datetime, timedelta, date
import calendar

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "model", "appliance_usage_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model", "trained_models")

# Load data
df = pd.read_csv(DATA_PATH)

# Convert timestamp
df["timestamp"] = pd.to_datetime(df["timestamp"], dayfirst=True)
df["hour"] = df["timestamp"].dt.hour
df["day"] = df["timestamp"].dt.day
df["month"] = df["timestamp"].dt.month
df["year"] = df["timestamp"].dt.year
df["festival"] = df["festival"].fillna('No_Festival')

# ML models and encoders (lazy load models to speed startup)
models = {}  # Cache of loaded models
encoders = {}
model_accuracies = {}

# Appliances list (shared across app)
APPLIANCE_NAMES = [
    "AC", "Fridge", "Lights", "Fan", "Washing Machine", "TV",
    "Microwave", "Oven", "Dishwasher", "Water Heater", "Dryer",
    "Computer", "Motor", "Sound System", "Electric Stove",
    "Refrigerator", "Freezer", "Air Purifier", "Humidifier", "Dehumidifier"
]

# Map appliance name to model path for lazy loading
model_paths = {
    name: os.path.join(MODEL_DIR, f"{name.lower().replace(' ', '_')}_model.pkl")
    for name in APPLIANCE_NAMES
}

try:
    # Load encoders (small, safe to load at startup)
    encoders_path = os.path.join(MODEL_DIR, "encoders.pkl")
    if os.path.exists(encoders_path):
        with open(encoders_path, 'rb') as f:
            encoders = pickle.load(f)
    
    # Load accuracies (metadata only)
    accuracies_path = os.path.join(MODEL_DIR, "accuracies.json")
    if os.path.exists(accuracies_path):
        with open(accuracies_path, 'r') as f:
            model_accuracies = json.load(f)
    
    print(f"Encoders loaded: {len(encoders.keys()) if encoders else 0}")
    print(f"Model metadata found for {len(model_paths)} appliances")
except Exception as e:
    print(f"Warning: Could not load encoders/accuracies: {e}")
    print("Will use statistical prediction instead")

def count_models_on_disk():
    """Count how many trained model files exist on disk."""
    return sum(1 for p in model_paths.values() if p and os.path.exists(p))

def has_encoders_on_disk():
    """Whether the encoders.pkl exists on disk (required to use ML path)."""
    return os.path.exists(os.path.join(MODEL_DIR, "encoders.pkl"))


def load_model(appliance_name):
    """
    Lazily load a model for the given appliance.
    Returns the model instance or None if not available.
    """
    if appliance_name in models:
        return models[appliance_name]
    
    model_path = model_paths.get(appliance_name)
    if not model_path or not os.path.exists(model_path):
        return None
    
    try:
        with open(model_path, 'rb') as f:
            models[appliance_name] = pickle.load(f)
        print(f"Loaded model for {appliance_name}")
        return models[appliance_name]
    except Exception as e:
        print(f"Error loading model for {appliance_name}: {e}")
        return None

# Appliance mapping (dropdown → dataset column)
# 20 appliances - removed 10 less-used ones (Iron, Hair Dryer, Vacuum, Coffee Maker, Toaster, Blender, Kettle, Router, Security, Smart Hub)
APPLIANCE_MAP = {
    "AC": "ac",
    "Fridge": "fridge",
    "Lights": "lights",
    "Fan": "fans",
    "Washing Machine": "washing_machine",
    "TV": "tv",
    "Microwave": "microwave",
    "Oven": "oven",
    "Dishwasher": "dishwasher",
    "Water Heater": "water_heater",
    "Dryer": "dryer",
    "Computer": "computer",
    "Motor": "motor",
    "Sound System": "sound_system",
    "Electric Stove": "stove",
    "Refrigerator": "refrigerator",
    "Freezer": "freezer",
    "Air Purifier": "air_purifier",
    "Humidifier": "humidifier",
    "Dehumidifier": "dehumidifier"
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/predict_new_workflow", methods=["POST"])
def predict_new_workflow_route():
    """Endpoint for new workflow: multiple appliances, historical range, and prediction"""
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({"error": "Request body is empty"}), 400
        
        required_fields = ["appliances", "range", "predictionYear", "predictionMonth"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
        
        if not isinstance(data["appliances"], list) or len(data["appliances"]) == 0:
            return jsonify({"error": "appliances must be a non-empty list"}), 400
        
        return predict_new_workflow(data)
    except Exception as e:
        print(f"Error in predict_new_workflow_route: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/predict", methods=["POST"])
def predict():
    # Support both form data and JSON
    if request.is_json:
        data = request.get_json()
        # Check if it's the new workflow format
        if "appliances" in data and "range" in data:
            return predict_new_workflow(data)
        else:
            # Old format for backward compatibility
            appliance = data["appliance"]
            hour = int(data["hour"])
            day = int(data["day"])
            month = int(data["month"])
            year = int(data["year"])
            season = data["season"]
    else:
        appliance = request.form["appliance"]
        hour = int(request.form["hour"])
        day = int(request.form["day"])
        month = int(request.form["month"])
        year = int(request.form["year"])
        season = request.form["season"]

    col = APPLIANCE_MAP[appliance]

    # -------- DAILY (hour-wise for selected day) --------
    daily_df = df[
        (df["day"] == day) &
        (df["month"] == month) &
        (df["year"] == year) &
        (df["season"] == season)
    ]
    daily = daily_df.groupby("hour")[col].mean()

    # -------- MONTHLY (day-wise) --------
    monthly_df = df[(df["month"] == month) & (df["year"] == year) & (df["season"] == season)]
    monthly = monthly_df.groupby("day")[col].sum()

    # -------- APPLIANCE WISE --------
    season_df = df[df["season"] == season]
    appliance_totals = {
        "AC": season_df["ac"].sum(),
        "Fridge": season_df["fridge"].sum(),
        "Lights": season_df["lights"].sum(),
        "Fan": season_df["fans"].sum(),
        "Washing Machine" : season_df["washing_machine"].sum(),
        "TV" : season_df["tv"].sum()
    }

    avg_usage = daily.mean()

    if avg_usage > 0.5:
        alert = "⚠ High Usage Alert"
    elif avg_usage > 0.3:
        alert = "⚠ Moderate Usage"
    else:
        alert = "✅ Usage Normal"

    return jsonify({
        "daily": {
            "hours": daily.index.astype(int).tolist(),
            "values": daily.values.tolist()
        },
        "monthly": {
            "days": monthly.index.astype(int).tolist(),
            "values": monthly.values.tolist()
        },
        "appliance": {
            "labels": list(appliance_totals.keys()),
            "values": list(appliance_totals.values())
        },
        "alert": alert
    })


def predict_new_workflow(data):
    """Handle new workflow: multiple appliances, historical range, and prediction"""
    import datetime
    
    appliances = data["appliances"]  # List of appliance names
    range_type = data["range"]  # "month" or "year"
    prediction_year = int(data["predictionYear"])
    prediction_month = int(data["predictionMonth"])
    
    # Get current date for historical range calculation
    # Use the latest date in dataset instead of current date
    latest_date = df["timestamp"].max()
    
    # Calculate historical date range
    if range_type == "month":
        # Past month: last 30 days from latest date
        start_date = latest_date - timedelta(days=30)
    else:  # year
        # Past year: last 12 months from latest date
        start_date = latest_date - timedelta(days=365)
    
    # Filter historical data (ensure we have data)
    historical_df = df[df["timestamp"] >= start_date].copy()
    
    # If no data in range, use all available data
    if len(historical_df) == 0:
        historical_df = df.copy()
    
    # Process each selected appliance
    historical_data = {}
    predicted_data = {}
    appliance_totals = {}
    
    for appliance_name in appliances:
        if appliance_name not in APPLIANCE_MAP:
            continue
            
        col = APPLIANCE_MAP[appliance_name]
        
        # Historical usage aggregation
        if range_type == "month":
            # Group by day for past month
            historical_grouped = historical_df.groupby(historical_df["timestamp"].dt.date)[col].sum()
            historical_data[appliance_name] = {
                "dates": [str(d) for d in historical_grouped.index],
                "values": historical_grouped.values.tolist()
            }
        else:  # year
            # Group by month for past year
            historical_grouped = historical_df.groupby([
                historical_df["timestamp"].dt.year,
                historical_df["timestamp"].dt.month
            ])[col].sum()
            historical_data[appliance_name] = {
                "periods": [f"{y}-{m:02d}" for y, m in historical_grouped.index],
                "values": historical_grouped.values.tolist()
            }
        
        # Calculate total historical usage
        appliance_totals[appliance_name] = float(historical_df[col].sum())
        
        # Use ML model for prediction if available, otherwise use statistical method
        # Lazy load model if not already loaded
        model = load_model(appliance_name)
        if model and encoders:
            try:
                # Prepare prediction input
                # Use most common house_id, or first one
                house_id = df["house_id"].mode()[0] if len(df["house_id"].mode()) > 0 else df["house_id"].iloc[0]
                season = get_season(prediction_month)
                festival = "No_Festival"
                
                # Encode inputs
                house_encoded = encoders['house'].transform([house_id])[0]
                season_encoded = encoders['season'].transform([season])[0]
                festival_encoded = encoders['festival'].transform([festival])[0]
                
                # Calculate DayOfWeek (using 15th as mid-month day)
                # Create a date object to get day of week
                test_date = date(prediction_year, prediction_month, 15)
                day_of_week = test_date.weekday()  # 0=Monday, 6=Sunday
                is_weekend = 1 if day_of_week >= 5 else 0
                
                # Cyclic encoding for hour and month
                hour_sin = np.sin(2 * np.pi * np.arange(24) / 24)
                hour_cos = np.cos(2 * np.pi * np.arange(24) / 24)
                month_sin = np.sin(2 * np.pi * prediction_month / 12)
                month_cos = np.cos(2 * np.pi * prediction_month / 12)
                
                # Create feature array (average hour for month)
                # Predict for each hour and average
                hourly_predictions = []
                for hour in range(24):
                    # Build feature array matching training features:
                    # ['house_id_encoded', 'season_encoded', 'festival_encoded',
                    #  'Hour', 'Day', 'Month', 'Year',
                    #  'DayOfWeek', 'IsWeekend',
                    #  'Hour_sin', 'Hour_cos', 'Month_sin', 'Month_cos']
                    features = np.array([[
                        house_encoded, season_encoded, festival_encoded,
                        hour, 15, prediction_month, prediction_year,
                        day_of_week, is_weekend,
                        hour_sin[hour], hour_cos[hour], month_sin, month_cos
                    ]])
                    pred = model.predict(features)[0]
                    hourly_predictions.append(pred)
                
                avg_hourly = np.mean(hourly_predictions)
                
                # Calculate days in month
                if prediction_month == 12:
                    next_month = datetime.date(prediction_year + 1, 1, 1)
                else:
                    next_month = datetime.date(prediction_year, prediction_month + 1, 1)
                current_month = datetime.date(prediction_year, prediction_month, 1)
                days_in_month = (next_month - current_month).days
                
                predicted_monthly = float(avg_hourly * 24 * days_in_month)
                
            except Exception as e:
                print(f"Error using ML model for {appliance_name}: {e}")
                # Fallback to statistical method
                prediction_season = get_season(prediction_month)
                if prediction_season == "spring":
                    prediction_season = "autumn"
                season_avg = historical_df[historical_df["season"] == prediction_season][col].mean()
                if pd.isna(season_avg):
                    season_avg = historical_df[col].mean()
                
                if prediction_month == 12:
                    next_month = datetime.date(prediction_year + 1, 1, 1)
                else:
                    next_month = datetime.date(prediction_year, prediction_month + 1, 1)
                current_month = datetime.date(prediction_year, prediction_month, 1)
                days_in_month = (next_month - current_month).days
                
                predicted_monthly = float(season_avg * 24 * days_in_month)
        else:
            # Statistical prediction fallback
            prediction_season = get_season(prediction_month)
            if prediction_season == "spring":
                prediction_season = "autumn"
            season_avg = historical_df[historical_df["season"] == prediction_season][col].mean()
            if pd.isna(season_avg):
                season_avg = historical_df[col].mean()
            
            if prediction_month == 12:
                next_month = datetime.date(prediction_year + 1, 1, 1)
            else:
                next_month = datetime.date(prediction_year, prediction_month + 1, 1)
            current_month = datetime.date(prediction_year, prediction_month, 1)
            days_in_month = (next_month - current_month).days
            
            predicted_monthly = float(season_avg * 24 * days_in_month)
        
        predicted_data[appliance_name] = {
            "predicted": predicted_monthly,
            "unit": "kWh"
        }
    
    # Calculate overall alert based on predicted usage
    total_predicted = sum([predicted_data[app]["predicted"] for app in predicted_data])
    avg_predicted = total_predicted / len(predicted_data) if predicted_data else 0
    
    if avg_predicted > 500:
        alert = "⚠ High Usage Alert"
    elif avg_predicted > 300:
        alert = "⚠ Moderate Usage"
    else:
        alert = "✅ Usage Normal"
    
    # Include model accuracies in response
    models_on_disk = count_models_on_disk()
    response_data = {
        "historical": historical_data,
        "predicted": predicted_data,
        "totals": appliance_totals,
        "range": range_type,
        "predictionPeriod": f"{prediction_year}-{prediction_month:02d}",
        "alert": alert,
        "modelInfo": {
            "modelsAvailable": len(model_paths),
            "modelsOnDisk": models_on_disk,
            "modelsLoaded": len(models),
            "accuracies": model_accuracies,
            # ML can be available even if models aren't loaded yet (lazy loading).
            "usingML": bool(models_on_disk > 0 and (encoders or has_encoders_on_disk())),
            "lazyLoading": True
        }
    }
    
    return jsonify(response_data)


def get_season(month):
    """Determine season based on month"""
    if month in [12, 1, 2]:
        return "winter"
    elif month in [3, 4, 5]:
        return "spring"  # Note: dataset uses 'autumn', but we'll map spring to autumn for compatibility
    elif month in [6, 7, 8]:
        return "summer"
    else:
        return "autumn"


@app.route("/backend_info", methods=["GET"])
def backend_info():
    """Return backend information including model accuracies"""
    models_on_disk = count_models_on_disk()
    return jsonify({
        "modelType": "RandomForestRegressor",
        "modelsAvailable": len(model_paths),
        "modelsOnDisk": models_on_disk,
        "modelsLoaded": len(models),
        "accuracies": model_accuracies,
        "lazyLoading": True,
        # "usingML" previously depended on models being loaded at runtime (len(models) > 0),
        # which is misleading with lazy loading. We consider ML "available" if models exist on disk
        # and encoders are present; they may still be not-yet-loaded until the first prediction.
        "usingML": bool(models_on_disk > 0 and (encoders or has_encoders_on_disk())),
        "port": 5001
    })


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("Starting Flask Backend Server...")
    print("=" * 60)
    print(f"Dataset loaded: {len(df):,} rows")
    print(f"Models available: {len(model_paths)} (lazy loading enabled)")
    print(f"Models pre-loaded: {len(models)}")
    print("=" * 60)
    print("\nServer starting on http://localhost:5001")
    print("Models will be loaded on-demand for faster startup")
    print("Press CTRL+C to stop\n")
    app.run(debug=True, host='0.0.0.0', port=5001)


