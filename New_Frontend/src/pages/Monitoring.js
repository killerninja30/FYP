import React, { useState, useEffect, useRef } from "react";
import "./Monitoring.css";

const Monitoring = () => {
  const [logs, setLogs] = useState([]);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const intervalRef = useRef(null);

  const fetchDetection = async () => {
    try {
      const res = await fetch("/api/smart-detection/detect", { method: "POST" });

      if (!res.ok) throw new Error("Bad response from server");

      const data = await res.json();

      // ✅ Show EXACT backend printed logs
      if (data.logs && data.logs.length > 0) {
        setLogs(data.logs); // Replace all logs with latest output
      }
    } catch (err) {
      console.error(err);
      setLogs(["[ERROR] Cannot fetch detection ❌"]);
    }
  };

  const startDetectionLoop = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchDetection, 6000);
    }
    fetchDetection();
  };

  const stopDetectionLoop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const toggleCamera = () => {
    setCameraEnabled(prev => !prev);
  };

  useEffect(() => {
    if (cameraEnabled) startDetectionLoop();
    else stopDetectionLoop();

    return () => stopDetectionLoop();
  }, [cameraEnabled]);

  return (
    <div className="monitoring-container">
      <h1>Smart Human Detection Dashboard</h1>

      <button className="camera-btn" onClick={toggleCamera}>
        {cameraEnabled ? "Stop Camera" : "Start Camera"}
      </button>

      {cameraEnabled && (
        <div className="camera-feed">
          <img
            src="/api/smart-detection/preview"
            alt="Camera Feed"
            width="640"
            height="480"
          />
        </div>
      )}

      <div className="logs-section">
        <h2>Status Logs</h2>
        <div className="logs-container">
          {logs.map((log, i) => (
            <div key={i} className="log-line">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
