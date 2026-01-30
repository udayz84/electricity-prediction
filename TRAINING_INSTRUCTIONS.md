# Model Training Instructions

## Overview
The training script is configured to train **20 appliances** in **5 batches of 4 appliances each**.

## Removed Appliances (10)
The following less-used appliances have been removed:
- Iron
- Hair Dryer
- Vacuum Cleaner
- Coffee Maker
- Toaster
- Blender
- Electric Kettle
- Router
- Security System
- Smart Home Hub

## Training Batches

### Batch 1 (4 appliances)
- AC
- Fridge
- Lights
- Fan

**Estimated time:** ~30-40 minutes

### Batch 2 (4 appliances)
- Washing Machine
- TV
- Microwave
- Oven

**Estimated time:** ~30-40 minutes

### Batch 3 (4 appliances)
- Dishwasher
- Water Heater
- Dryer
- Computer

**Estimated time:** ~30-40 minutes

### Batch 4 (4 appliances)
- Motor
- Sound System
- Electric Stove
- Refrigerator

**Estimated time:** ~30-40 minutes

### Batch 5 (4 appliances)
- Freezer
- Air Purifier
- Humidifier
- Dehumidifier

**Estimated time:** ~30-40 minutes

## How to Train

### Option 1: Train All Batches at Once
```bash
cd /Users/udayznanam/Downloads/ml_project
source venv/bin/activate
python backend/train_models.py
```
**Total time:** ~2.5-3 hours

### Option 2: Train One Batch at a Time (Recommended)
```bash
# Train Batch 1
python backend/train_models.py 1

# Train Batch 2 (after Batch 1 completes)
python backend/train_models.py 2

# Train Batch 3
python backend/train_models.py 3

# Train Batch 4
python backend/train_models.py 4

# Train Batch 5
python backend/train_models.py 5
```

**Each batch:** ~30-40 minutes  
**Total time:** ~2.5-3 hours (but you can take breaks between batches)

## Training Process

Each appliance model will:
1. Try different n_estimators: 100, 150, 200, 250, 300, 350, 400
2. Stop when R² accuracy ≥ 85%
3. Save the best model even if < 85%
4. Save metrics (R², MAE, RMSE)

## Output Files

Models are saved to: `model/trained_models/`
- `{appliance_name}_model.pkl` - Trained model for each appliance
- `encoders.pkl` - Label encoders for categorical variables
- `accuracies.json` - Accuracy metrics for all models

## Tips

1. **Keep MacBook plugged in** during training
2. **Close heavy applications** to speed up training
3. **Train batches overnight** or when not using the laptop
4. **Monitor progress** - the script shows real-time progress for each appliance
5. **Check accuracies** - After each batch, check `model/trained_models/accuracies.json`

## After Training

Once all batches are complete, restart the Flask backend to load the new models:
```bash
python backend/app.py
```

The frontend will automatically display model accuracies in the Backend Info section.
