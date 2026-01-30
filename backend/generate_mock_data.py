"""
Generate mock data for additional appliances
"""
import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "model", "appliance_usage_dataset.csv")
OUTPUT_PATH = os.path.join(BASE_DIR, "model", "appliance_usage_dataset.csv")

# Load existing data
print("Loading existing data...")
df = pd.read_csv(DATA_PATH)

# Generate mock data for additional appliances
# Base consumption patterns on existing appliances
print("\nGenerating mock data for additional appliances...")

# Mock appliances with realistic patterns
mock_appliances = {
    'microwave': df['washing_machine'] * 1.2,  # Similar to washing machine but slightly higher
    'oven': df['ac'] * 0.8,  # Similar to AC but lower
    'dishwasher': df['washing_machine'] * 1.5,  # Higher than washing machine
    'water_heater': df['fridge'] * 0.6,  # Steady consumption like fridge
    'dryer': df['washing_machine'] * 1.8,  # High consumption
    'iron': df['lights'] * 0.3,  # Low, occasional use
    'hair_dryer': df['fans'] * 0.5,  # Moderate, short duration
    'vacuum': df['lights'] * 0.4,  # Low, occasional
    'coffee_maker': df['lights'] * 0.2,  # Very low, short duration
    'toaster': df['lights'] * 0.15,  # Very low, very short duration
    'blender': df['lights'] * 0.25,  # Very low
    'kettle': df['lights'] * 0.3,  # Low, short duration
    'computer': df['tv'] * 0.7,  # Similar to TV
    'router': df['lights'] * 0.1,  # Very low, constant
    'gaming_console': df['tv'] * 0.9,  # Similar to TV
    'sound_system': df['tv'] * 0.4,  # Lower than TV
    'stove': df['ac'] * 0.7,  # Similar to AC
    'refrigerator': df['fridge'] * 1.1,  # Slightly higher than fridge
    'freezer': df['fridge'] * 0.8,  # Similar to fridge
    'air_purifier': df['fans'] * 0.6,  # Similar to fans
    'humidifier': df['fans'] * 0.5,  # Similar to fans
    'dehumidifier': df['fans'] * 0.7,  # Similar to fans
    'security': df['lights'] * 0.05,  # Very low, constant
    'smart_hub': df['lights'] * 0.08  # Very low, constant
}

# Add noise to make it more realistic
np.random.seed(42)
for col, base_values in mock_appliances.items():
    # Add random variation (±20%)
    noise = np.random.normal(1.0, 0.1, len(base_values))
    df[col] = base_values * noise
    # Ensure non-negative
    df[col] = df[col].clip(lower=0)

print(f"  ✓ Generated data for {len(mock_appliances)} additional appliances")

# Save updated dataset
print(f"\nSaving updated dataset to {OUTPUT_PATH}...")
df.to_csv(OUTPUT_PATH, index=False)
print("  ✓ Dataset saved successfully!")

print(f"\nTotal appliances in dataset: {len([c for c in df.columns if c not in ['timestamp', 'house_id', 'season', 'festival']])}")
