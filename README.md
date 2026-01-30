# ⚡ Energy Insights Dashboard

A beautiful, modern React frontend with Flask backend for electricity consumption analytics and prediction.

## 🚀 Features

- **Modern React UI** with smooth animations and beautiful design
- **Interactive Charts** using Chart.js for data visualization
- **Real-time Analytics** for electricity consumption patterns
- **Multi-appliance Support** (AC, Fridge, Lights, Fan, Washing Machine, TV)
- **Seasonal Analysis** with detailed insights
- **Responsive Design** that works on all devices

## 📁 Project Structure

```
ml_project/
├── backend/
│   ├── app.py              # Flask backend API
│   └── templates/          # (Legacy HTML - not used with React)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json
├── model/
│   ├── model.ipynb         # ML model training notebook
│   ├── model.pkl           # Trained model
│   └── appliance_usage_dataset.csv
└── requirements.txt
```

## 🛠️ Setup Instructions

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask server:
```bash
cd backend
python app.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically proxy API requests to the backend.

## 🎨 Features

### Dashboard Components

- **Input Form**: Beautiful form with icons for selecting appliance, season, and date/time
- **Alert Card**: Color-coded alerts (High/Moderate/Normal usage)
- **Daily Chart**: Bar chart showing hourly consumption patterns
- **Monthly Chart**: Line chart showing daily consumption trends
- **Appliance Chart**: Pie chart comparing consumption across appliances

### Design Highlights

- Gradient backgrounds with smooth animations
- Glassmorphism effects with backdrop blur
- Responsive grid layouts
- Interactive hover effects
- Modern typography with Inter font
- Smooth transitions using Framer Motion

## 📊 API Endpoints

### POST `/predict`

Predicts electricity consumption based on input parameters.

**Request Body (JSON):**
```json
{
  "appliance": "AC",
  "season": "winter",
  "hour": 14,
  "day": 15,
  "month": 1,
  "year": 2024
}
```

**Response:**
```json
{
  "daily": {
    "hours": [0, 1, 2, ...],
    "values": [0.25, 0.12, ...]
  },
  "monthly": {
    "days": [1, 2, 3, ...],
    "values": [15.2, 16.5, ...]
  },
  "appliance": {
    "labels": ["AC", "Fridge", ...],
    "values": [1250.5, 980.2, ...]
  },
  "alert": "✅ Usage Normal"
}
```

## 🎯 Usage

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Select your preferences (appliance, season, date/time)
4. Click "Analyze Consumption" to view insights
5. Explore the interactive charts and analytics

## 🛠️ Technologies Used

- **Frontend**: React 18, Chart.js, Framer Motion
- **Backend**: Flask, Pandas
- **Styling**: CSS3 with modern features
- **Fonts**: Inter (Google Fonts)

## 📝 Notes

- The backend currently uses data aggregation from the CSV dataset
- ML models from `model.ipynb` can be integrated for future predictions
- The frontend is fully responsive and works on mobile devices

## 🚀 Production Build

To create a production build of the React app:

```bash
cd frontend
npm run build
```

The build folder will contain the optimized production files.
