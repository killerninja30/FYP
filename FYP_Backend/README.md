# IoT Energy Management Backend

A FastAPI backend for the IoT-based Smart Energy Management System.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
API Documentation at `http://localhost:8000/docs`

## Project Structure

```
app/
├── routers/          # API route handlers
├── models/           # Pydantic models
├── database/         # Database setup and models
├── utils/           # Utility functions
└── __init__.py
```

## API Endpoints

- `/api/dashboard/` - Dashboard data
- `/api/monitoring/` - Real-time monitoring
- `/api/occupancy/` - Occupancy detection
- `/api/zone-control/` - Zone-based control
- `/api/energy-analytics/` - Energy analytics
- `/api/device-control/` - Device management