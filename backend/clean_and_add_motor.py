"""
Clean dataset: Remove unwanted appliances and add Motor data
"""
import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "model", "appliance_usage_dataset.csv")

# Appliances to remove (10 less-used ones)
columns_to_remove = [
    'iron', 'hair_dryer', 'vacuum', 'coffee_maker', 'toaster',
    'blender', 'kettle', 'router', 'security', 'smart_hub'
]

# Also remove gaming_console (replacing with motor)
columns_to_remove.append('gaming_console')

print("Loading dataset...")
df = pd.read_csv(DATA_PATH)

print(f"Original columns: {len(df.columns)}")
print(f"Original shape: {df.shape}")

# Extract hour from timestamp for motor calculation
df['timestamp'] = pd.to_datetime(df['timestamp'], dayfirst=True)
df['hour'] = df['timestamp'].dt.hour

# Remove unwanted columns
columns_exist = [col for col in columns_to_remove if col in df.columns]
if columns_exist:
    df = df.drop(columns=columns_exist)
    print(f"\nRemoved {len(columns_exist)} unwanted columns: {columns_exist}")
else:
    print("\nNo unwanted columns found to remove")

# Add Motor data (similar to washing machine but higher consumption)
# Motor typically has higher and more variable consumption
if 'motor' not in df.columns:
    print("\nAdding Motor data...")
    # Base on washing machine pattern but with higher consumption
    # Motors typically run at higher power and have variable loads
    base_pattern = df['washing_machine'].copy()
    
    # Add variation: motors have higher peak consumption
    np.random.seed(42)
    motor_multiplier = np.random.normal(1.5, 0.2, len(df))  # 50% higher on average with variation
    motor_multiplier = np.clip(motor_multiplier, 1.0, 2.5)  # Keep between 1x and 2.5x
    
    # Add time-based variation (motors run more during certain hours)
    hour_factor = 1.0 + (df['hour'] / 24) * 0.3  # Slightly higher during day hours
    
    df['motor'] = base_pattern * motor_multiplier * hour_factor
    
    # Ensure non-negative
    df['motor'] = df['motor'].clip(lower=0)
    
    print("  ✓ Motor data added")
else:
    print("\nMotor column already exists, skipping...")

# Remove temporary hour column before saving
df = df.drop(columns=['hour'])

# Save cleaned dataset
print(f"\nSaving cleaned dataset...")
df.to_csv(DATA_PATH, index=False)

print(f"\nFinal columns: {len(df.columns)}")
print(f"Final shape: {df.shape}")

# List all appliance columns
appliance_cols = [col for col in df.columns if col not in ['timestamp', 'house_id', 'season', 'festival']]
print(f"\nAppliances in dataset ({len(appliance_cols)}):")
for i, col in enumerate(appliance_cols, 1):
    print(f"  {i}. {col}")

print("\n✓ Dataset cleaned and updated successfully!")
