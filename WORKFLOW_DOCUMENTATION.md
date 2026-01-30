# New Workflow Documentation

## Overview
This document describes the new multi-appliance electricity consumption prediction workflow.

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  1. Appliance Checklist            │
        │     - Select multiple appliances  │
        │     - 30 appliances available     │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  2. Time Range Selection           │
        │     - Past Month (30 days)        │
        │     - Past Year (12 months)       │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  3. Prediction Input               │
        │     - Target Year                 │
        │     - Target Month                │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  4. Analyze Button                │
        │     - Validates selections        │
        │     - Sends request to backend   │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  5. Backend Processing            │
        │     - Fetches historical data    │
        │     - Calculates predictions      │
        │     - Returns aggregated results │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │  6. Results Display               │
        │     - Historical usage charts      │
        │     - Predicted usage charts      │
        │     - Comparison charts           │
        └───────────────────────────────────┘
```

## API Request Format

### Endpoint
`POST /predict`

### Request Body (JSON)
```json
{
  "appliances": ["AC", "Fridge", "Lights"],
  "range": "month",  // or "year"
  "predictionYear": 2025,
  "predictionMonth": 6
}
```

### Request Fields
- **appliances** (array, required): List of appliance names to analyze
  - Valid values: "AC", "Fridge", "Lights", "Fan", "Washing Machine", "TV"
- **range** (string, required): Historical time range
  - Values: "month" (last 30 days) or "year" (last 12 months)
- **predictionYear** (integer, required): Target year for prediction
  - Range: Current year - 5 to Current year + 5
- **predictionMonth** (integer, required): Target month for prediction
  - Range: 1-12

## API Response Format

### Success Response
```json
{
  "historical": {
    "AC": {
      "dates": ["2024-01-01", "2024-01-02", ...],  // if range="month"
      "periods": ["2023-01", "2023-02", ...],      // if range="year"
      "values": [125.5, 130.2, ...]
    },
    "Fridge": {
      "dates": [...],
      "values": [...]
    }
  },
  "predicted": {
    "AC": {
      "predicted": 450.5,
      "unit": "kWh"
    },
    "Fridge": {
      "predicted": 320.8,
      "unit": "kWh"
    }
  },
  "totals": {
    "AC": 12500.5,
    "Fridge": 9800.2
  },
  "range": "month",
  "predictionPeriod": "2025-06",
  "alert": "✅ Usage Normal"
}
```

### Response Fields
- **historical** (object): Historical consumption data per appliance
  - For "month" range: grouped by date
  - For "year" range: grouped by month
- **predicted** (object): Predicted monthly consumption per appliance
- **totals** (object): Total historical consumption per appliance
- **range** (string): The range type used ("month" or "year")
- **predictionPeriod** (string): Target period in "YYYY-MM" format
- **alert** (string): Usage alert message

## Frontend State Structure

### Component State
```javascript
{
  selectedAppliances: ["AC", "Fridge"],  // Array of selected appliance names
  selectedRange: "month",                // "month" | "year" | null
  inputYear: 2025,                       // Target year for prediction
  inputMonth: 6                          // Target month (1-12)
}
```

### State Management Flow
1. **Appliance Selection**: User checks/unchecks appliances
   - Updates `selectedAppliances` array
   - Validates: at least one appliance must be selected

2. **Range Selection**: User clicks "Past Month" or "Past Year"
   - Sets `selectedRange` to "month" or "year"

3. **Prediction Input**: User selects year and month
   - Updates `inputYear` and `inputMonth`

4. **Analysis Trigger**: User clicks "Analyze Consumption"
   - Validates: appliances selected and range selected
   - Constructs request payload
   - Calls API endpoint
   - Updates results state

## Backend Logic

### Historical Data Processing
1. Calculate start date based on range:
   - Month: Current date - 30 days
   - Year: Current date - 365 days

2. Filter dataset by timestamp >= start_date

3. Group data by:
   - Month range: Group by date (daily totals)
   - Year range: Group by year-month (monthly totals)

4. Aggregate consumption per appliance

### Prediction Logic
1. Determine season for prediction month
2. Filter historical data by matching season
3. Calculate average consumption for season
4. Estimate monthly consumption:
   - Average hourly consumption × 24 hours × days in month
5. Return predicted values per appliance

## Validation & Edge Cases

### Frontend Validation
- ✅ At least one appliance must be selected
- ✅ Time range must be selected
- ✅ Year must be within valid range (current ± 5 years)
- ✅ Month must be 1-12

### Backend Validation
- ✅ Validate appliance names against APPLIANCE_MAP
- ✅ Handle missing historical data gracefully
- ✅ Handle empty result sets
- ✅ Validate date ranges

### Edge Cases Handled
1. **No historical data**: Returns empty arrays with message
2. **Invalid appliance**: Skips invalid appliances, processes valid ones
3. **Future dates**: Uses season-based prediction
4. **Leap years**: Handles February 29th correctly
5. **Empty selections**: Frontend prevents submission

## Component Structure

```
App.js
├── NewWorkflowForm
│   ├── ApplianceChecklist
│   ├── TimeRangeSelector
│   └── PredictionInput
└── WorkflowResults
    ├── HistoricalChart
    ├── PredictedChart
    └── ComparisonChart
```

## Usage Example

```javascript
// User selects appliances: ["AC", "Fridge"]
// User selects range: "month"
// User sets prediction: Year=2025, Month=6
// User clicks "Analyze Consumption"

// Request sent:
{
  "appliances": ["AC", "Fridge"],
  "range": "month",
  "predictionYear": 2025,
  "predictionMonth": 6
}

// Response received:
{
  "historical": {
    "AC": { "dates": [...], "values": [...] },
    "Fridge": { "dates": [...], "values": [...] }
  },
  "predicted": {
    "AC": { "predicted": 450.5 },
    "Fridge": { "predicted": 320.8 }
  },
  ...
}
```

## Migration Notes

- Old workflow still available via toggle
- Backend supports both request formats
- New workflow uses same `/predict` endpoint
- Backward compatible with existing code
