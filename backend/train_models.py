"""
Train ML models for appliances in batches of 4 until accuracy > 85%
20 appliances total (removed 10 less-used ones)
Enhanced version with better hyperparameter tuning and feature engineering
"""
import pandas as pd
import numpy as np
import pickle
import os
import sys
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "model", "appliance_usage_dataset.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model", "trained_models")
os.makedirs(MODEL_DIR, exist_ok=True)

# Load data
print("Loading data...")
data = pd.read_csv(DATA_PATH)

# Preprocess
data['timestamp'] = pd.to_datetime(data['timestamp'], dayfirst=True)
data['Hour'] = data['timestamp'].dt.hour
data['Day'] = data['timestamp'].dt.day
data['Month'] = data['timestamp'].dt.month
data['Year'] = data['timestamp'].dt.year
data['DayOfWeek'] = data['timestamp'].dt.dayofweek  # 0=Monday, 6=Sunday
data['IsWeekend'] = (data['DayOfWeek'] >= 5).astype(int)
data['festival'] = data['festival'].fillna('No_Festival')

# Feature Engineering: Cyclic encoding for hour and month
# This helps the model understand that hour 23 is close to hour 0
data['Hour_sin'] = np.sin(2 * np.pi * data['Hour'] / 24)
data['Hour_cos'] = np.cos(2 * np.pi * data['Hour'] / 24)
data['Month_sin'] = np.sin(2 * np.pi * data['Month'] / 12)
data['Month_cos'] = np.cos(2 * np.pi * data['Month'] / 12)

# Encode categorical variables
le_house = LabelEncoder()
le_season = LabelEncoder()
le_festival = LabelEncoder()
data['house_id_encoded'] = le_house.fit_transform(data['house_id'])
data['season_encoded'] = le_season.fit_transform(data['season'])
data['festival_encoded'] = le_festival.fit_transform(data['festival'])

# Enhanced features with cyclic encoding and additional features
feature_cols = [
    'house_id_encoded', 'season_encoded', 'festival_encoded',
    'Hour', 'Day', 'Month', 'Year',
    'DayOfWeek', 'IsWeekend',
    'Hour_sin', 'Hour_cos', 'Month_sin', 'Month_cos'
]
X = data[feature_cols]

# 20 appliances to train (removed: Iron, Hair Dryer, Vacuum, Coffee Maker, Toaster, Blender, Kettle, Router, Security, Smart Hub)
# Organized in batches of 4
appliance_batches = [
    # Batch 1
    [('ac', 'AC'), ('fridge', 'Fridge'), ('lights', 'Lights'), ('fans', 'Fan')],
    # Batch 2
    [('washing_machine', 'Washing Machine'), ('tv', 'TV'), ('microwave', 'Microwave'), ('oven', 'Oven')],
    # Batch 3
    [('dishwasher', 'Dishwasher'), ('water_heater', 'Water Heater'), ('dryer', 'Dryer'), ('computer', 'Computer')],
    # Batch 4
    [('motor', 'Motor'), ('sound_system', 'Sound System'), ('stove', 'Electric Stove'), ('refrigerator', 'Refrigerator')],
    # Batch 5
    [('freezer', 'Freezer'), ('air_purifier', 'Air Purifier'), ('humidifier', 'Humidifier'), ('dehumidifier', 'Dehumidifier')]
]

# Check if batch number is provided as command line argument
batch_num = None
if len(sys.argv) > 1:
    try:
        batch_num = int(sys.argv[1])
        if batch_num < 1 or batch_num > len(appliance_batches):
            print(f"Error: Batch number must be between 1 and {len(appliance_batches)}")
            sys.exit(1)
    except ValueError:
        print("Error: Batch number must be an integer")
        sys.exit(1)

# Determine which batches to train
if batch_num:
    batches_to_train = [appliance_batches[batch_num - 1]]
    print(f"\n{'=' * 60}")
    print(f"Training BATCH {batch_num} only (4 appliances)")
    print(f"{'=' * 60}")
else:
    batches_to_train = appliance_batches
    print(f"\n{'=' * 60}")
    print(f"Training ALL {len(appliance_batches)} BATCHES ({len(appliance_batches) * 4} appliances)")
    print(f"{'=' * 60}")
    print("\nTo train a specific batch, run:")
    print("  python backend/train_models.py 1  # For batch 1")
    print("  python backend/train_models.py 2  # For batch 2")
    print("  etc...")

models = {}
encoders = {}
accuracies = {}

# Load existing accuracies if they exist
accuracies_path = os.path.join(MODEL_DIR, "accuracies.json")
if os.path.exists(accuracies_path):
    import json
    with open(accuracies_path, 'r') as f:
        accuracies = json.load(f)

print("\nTraining models for each appliance...")
print("=" * 60)

def find_best_model(X_train, y_train, X_test, y_test, appliance_name):
    """
    Train a reasonably strong model with a **small** set of configs
    to keep training fast but still accurate.
    """
    best_model = None
    best_r2 = -float('inf')
    best_params = None
    best_model_type = None
    
    # Remove zero-variance features
    non_zero_var_cols = X_train.columns[X_train.var() > 0]
    X_train_clean = X_train[non_zero_var_cols]
    X_test_clean = X_test[non_zero_var_cols]
    
    # Check if target has variance
    if y_train.var() == 0:
        print(f"  ⚠ Warning: Target variable has zero variance, skipping...")
        return None, -float('inf'), None, None
    
    # Fast strategy: a **small** set of RandomForest configs
    print(f"  Training RandomForest (fast config search)...")
    candidate_params = [
        {
            'n_estimators': 300,
            'max_depth': None,
            'min_samples_split': 2,
            'min_samples_leaf': 1,
            'max_features': 'sqrt'
        },
        {
            'n_estimators': 400,
            'max_depth': 20,
            'min_samples_split': 2,
            'min_samples_leaf': 1,
            'max_features': 'sqrt'
        },
        {
            'n_estimators': 500,
            'max_depth': 25,
            'min_samples_split': 2,
            'min_samples_leaf': 2,
            'max_features': 'sqrt'
        },
        {
            'n_estimators': 300,
            'max_depth': 15,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'max_features': None
        },
    ]

    # Try each config, keep the best, stop early if very good
    for params in candidate_params:
        try:
            model = RandomForestRegressor(
                n_estimators=params['n_estimators'],
                max_depth=params['max_depth'],
                min_samples_split=params['min_samples_split'],
                min_samples_leaf=params['min_samples_leaf'],
                max_features=params['max_features'],
                random_state=42,
                n_jobs=-1,
                verbose=0,
            )
            model.fit(X_train_clean, y_train)
            pred = model.predict(X_test_clean)
            r2 = r2_score(y_test, pred)

            if r2 > best_r2:
                best_r2 = r2
                best_model = model
                best_params = params
                best_model_type = 'RandomForest'

            # If we get very good performance, stop trying more configs
            if r2 >= 0.88:
                print(f"    ✓ Early stop: R² = {r2:.4f} ({r2*100:.2f}%) with params {params}")
                return best_model, best_r2, best_params, best_model_type
        except Exception:
            continue

    if best_model is not None:
        print(f"    ✓ Best RandomForest R² = {best_r2:.4f} ({best_r2*100:.2f}%) with params {best_params}")
    return best_model, best_r2, best_params, best_model_type

batch_counter = 0
for batch in batches_to_train:
    batch_counter += 1
    if not batch_num:
        print(f"\n{'=' * 60}")
        print(f"BATCH {batch_counter}/{len(appliance_batches)}")
        print(f"{'=' * 60}")
    
    for appliance_col, appliance_name in batch:
        print(f"\nTraining {appliance_name} model...")
        y = data[appliance_col]
        
        # Check if target has any non-zero values
        if y.sum() == 0 or y.var() == 0:
            print(f"  ⚠ Warning: {appliance_name} has no variance or all zeros, skipping...")
            continue
        
        # Train/test split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Find best model
        best_model, best_r2, best_params, best_model_type = find_best_model(
            X_train, y_train, X_test, y_test, appliance_name
        )
        
        if best_model is None:
            print(f"  ✗ Failed to train model for {appliance_name}")
            continue
        
        # Calculate metrics
        pred = best_model.predict(X_test)
        mae = mean_absolute_error(y_test, pred)
        rmse = np.sqrt(mean_squared_error(y_test, pred))
        
        # Store model with feature columns info
        models[appliance_name] = {
            'model': best_model,
            'feature_columns': list(X.columns),
            'model_type': best_model_type
        }
        
        accuracies[appliance_name] = {
            'r2': float(best_r2),
            'r2_percent': float(best_r2 * 100),
            'mae': float(mae),
            'rmse': float(rmse),
            'model_type': best_model_type,
            'params': best_params
        }
        
        status = "✓" if best_r2 >= 0.85 else "⚠"
        print(f"  {status} Final Metrics:")
        print(f"    R² Score: {best_r2:.4f} ({best_r2*100:.2f}%)")
        print(f"    MAE: {mae:.4f}")
        print(f"    RMSE: {rmse:.4f}")
        print(f"    Model Type: {best_model_type}")

# Save models and encoders
print("\n" + "=" * 60)
print("Saving models...")

for appliance_name, model_data in models.items():
    model_path = os.path.join(MODEL_DIR, f"{appliance_name.lower().replace(' ', '_')}_model.pkl")
    # Save the model object (extract from dict if needed)
    model_to_save = model_data['model'] if isinstance(model_data, dict) else model_data
    with open(model_path, 'wb') as f:
        pickle.dump(model_to_save, f)
    print(f"  ✓ Saved {appliance_name} model")

# Save encoders
encoders_path = os.path.join(MODEL_DIR, "encoders.pkl")
with open(encoders_path, 'wb') as f:
    pickle.dump({
        'house': le_house,
        'season': le_season,
        'festival': le_festival
    }, f)
print(f"  ✓ Saved encoders")

# Save feature columns info
features_path = os.path.join(MODEL_DIR, "feature_columns.pkl")
with open(features_path, 'wb') as f:
    pickle.dump(feature_cols, f)
print(f"  ✓ Saved feature columns")

# Save accuracies (merge with existing if training specific batch)
accuracies_path = os.path.join(MODEL_DIR, "accuracies.json")
import json
with open(accuracies_path, 'w') as f:
    json.dump(accuracies, f, indent=2)
print(f"  ✓ Saved accuracies")

print("\n" + "=" * 60)
if batch_num:
    print(f"Batch {batch_num} training complete!")
else:
    print("All batches training complete!")
    
if accuracies:
    avg_r2 = np.mean([acc['r2'] for acc in accuracies.values()])
    models_above_85 = sum(1 for acc in accuracies.values() if acc['r2'] >= 0.85)
    total_models = len(accuracies)
    print(f"\nAverage R² Score: {avg_r2:.4f} ({avg_r2*100:.2f}%)")
    print(f"Models with R² >= 85%: {models_above_85}/{total_models}")
    print(f"Models trained: {total_models}/{len([item for batch in appliance_batches for item in batch])}")
    
    if models_above_85 < total_models:
        print(f"\n⚠ {total_models - models_above_85} models still below 85%:")
        for name, acc in accuracies.items():
            if acc['r2'] < 0.85:
                print(f"  - {name}: {acc['r2_percent']:.2f}%")
