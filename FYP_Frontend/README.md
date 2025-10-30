# FYP Frontend - React Application

This is the React frontend for the Final Year Project (FYP) smart energy management system.

## Project Structure

```
FYP_Frontend/
├── public/             # Static assets
│   ├── index.html     # Main HTML template
│   ├── manifest.json  # Web app manifest
│   └── ...
├── src/               # Source code
│   ├── components/    # Reusable React components
│   │   ├── Layout.js  # Main layout wrapper
│   │   ├── Navbar.js  # Navigation bar
│   │   └── Sidebar.js # Side navigation
│   ├── pages/         # Page components
│   │   ├── Dashboard.js
│   │   ├── DeviceControl.js
│   │   ├── EnergyAnalytics.js
│   │   ├── OccupancyDetection.js
│   │   ├── RealTimeMonitoring.js
│   │   └── ZoneControl.js
│   ├── services/      # API and service functions
│   │   └── api.js     # API communication
│   ├── App.js         # Main App component
│   └── index.js       # Entry point
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## Features

- **Dashboard**: Overview of energy consumption and system status
- **Real-time Monitoring**: Live data from IoT sensors
- **Device Control**: Remote control of smart devices
- **Energy Analytics**: Data visualization and analytics
- **Zone Control**: Room/zone-based energy management
- **Occupancy Detection**: Smart presence detection

## Technologies Used

- **React** (v19.1.1) - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization charts
- **Lucide React** - Modern icon library
- **React Icons** - Additional icon sets

## Setup Instructions

1. **Navigate to the frontend directory:**
   ```bash
   cd FYP_Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000
   ```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (irreversible)

## API Integration

The frontend communicates with the Python backend through the API service located in `src/services/api.js`. Make sure the backend server is running before starting the frontend.

## Build for Production

To create a production build:

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Notes

- Make sure Node.js (v14 or higher) is installed
- The `node_modules` folder is excluded from version control
- Environment variables can be set in `.env` files (not included in repo)