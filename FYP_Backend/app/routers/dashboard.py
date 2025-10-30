from fastapi import APIRouter, HTTPException
from typing import List, Dict
from app.models.schemas import Room, DashboardEnergyData, TimeSeriesData
from app.utils.mock_data import mock_generator

router = APIRouter()

@router.get("/summary", response_model=Dict)
async def get_dashboard_summary():
    """Get dashboard summary with key metrics"""
    try:
        rooms = mock_generator.generate_room_data()
        
        # Calculate summary metrics
        total_rooms = len(rooms)
        active_rooms = len([r for r in rooms if r.status == "active"])
        total_occupancy = sum(r.occupancy for r in rooms)
        total_power = sum(r.power_consumption for r in rooms)
        
        # Calculate efficiency (example calculation)
        efficiency = round((total_occupancy / sum(r.max_capacity for r in rooms)) * 100, 1)
        
        # Calculate cost estimation
        daily_cost = round(total_power * 24 * 4, 0)  # ₹4 per kWh
        
        summary = {
            "total_rooms": total_rooms,
            "active_rooms": active_rooms,
            "total_occupancy": total_occupancy,
            "total_power_consumption": round(total_power, 1),
            "efficiency": efficiency,
            "daily_cost_estimate": daily_cost,
            "status": "operational"
        }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/rooms", response_model=List[Room])
async def get_dashboard_rooms():
    """Get all rooms data for dashboard"""
    try:
        return mock_generator.generate_room_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/energy", response_model=DashboardEnergyData)
async def get_energy_overview():
    """Get energy consumption overview"""
    try:
        time_series = mock_generator.generate_energy_time_series(24)
        
        # Calculate totals
        total_consumption = sum(point.consumption for point in time_series)
        total_cost = sum(point.cost for point in time_series)
        total_savings = sum(point.savings for point in time_series)
        avg_efficiency = sum(point.efficiency for point in time_series) / len(time_series)
        
        energy_data = DashboardEnergyData(
            consumption=round(total_consumption, 1),
            cost=round(total_cost, 0),
            savings=round(total_savings, 0),
            efficiency=round(avg_efficiency, 1),
            time_series=time_series
        )
        
        return energy_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts")
async def get_dashboard_alerts():
    """Get recent alerts for dashboard"""
    try:
        alerts = mock_generator.generate_alerts(5)
        return {"alerts": alerts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
