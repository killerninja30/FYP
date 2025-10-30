from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from app.models.schemas import EnergyData, TimeSeriesData, Alert
from app.utils.mock_data import mock_generator

router = APIRouter()

@router.get("/overview", response_model=EnergyData)
async def get_energy_overview(
    period: str = Query("daily", regex="^(hourly|daily|weekly|monthly)$")
):
    """Get energy consumption overview for different time periods"""
    try:
        # Generate time series based on period
        if period == "hourly":
            hours = 24
        elif period == "daily":
            hours = 24 * 7  # 7 days
        elif period == "weekly":
            hours = 24 * 30  # 30 days
        else:  # monthly
            hours = 24 * 90  # 90 days
        
        time_series = mock_generator.generate_energy_time_series(hours)
        
        # Calculate totals
        total_consumption = sum(point.consumption for point in time_series)
        total_cost = sum(point.cost for point in time_series)
        total_savings = sum(point.savings for point in time_series)
        avg_efficiency = sum(point.efficiency for point in time_series) / len(time_series)
        
        return EnergyData(
            consumption=round(total_consumption, 1),
            cost=round(total_cost, 0),
            savings=round(total_savings, 0),
            efficiency=round(avg_efficiency, 1),
            time_series=time_series[-24:] if period != "hourly" else time_series  # Return last 24 points for display
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/consumption")
async def get_consumption_breakdown():
    """Get detailed consumption breakdown by rooms and devices"""
    try:
        rooms = mock_generator.generate_room_data()
        
        # Calculate consumption by room
        room_breakdown = []
        for room in rooms:
            devices = room.devices
            
            # Estimate consumption by device type
            lights_consumption = devices.lights.active * 0.06  # 60W per light
            fans_consumption = devices.fans.active * 0.075    # 75W per fan
            projector_consumption = devices.projector.active * 0.3  # 300W
            ac_consumption = devices.ac.active * 1.5          # 1500W per AC
            
            total_room_consumption = (lights_consumption + fans_consumption + 
                                    projector_consumption + ac_consumption)
            
            room_breakdown.append({
                "room_id": room.id,
                "room_name": room.name,
                "total_consumption": round(total_room_consumption, 2),
                "devices": {
                    "lights": round(lights_consumption, 2),
                    "fans": round(fans_consumption, 2),
                    "projector": round(projector_consumption, 2),
                    "ac": round(ac_consumption, 2)
                },
                "occupancy": room.occupancy,
                "efficiency_rating": round(85 + (room.occupancy / room.max_capacity) * 15, 1)
            })
        
        # Calculate device type totals
        device_totals = {
            "lights": round(sum(room["devices"]["lights"] for room in room_breakdown), 2),
            "fans": round(sum(room["devices"]["fans"] for room in room_breakdown), 2),
            "projector": round(sum(room["devices"]["projector"] for room in room_breakdown), 2),
            "ac": round(sum(room["devices"]["ac"] for room in room_breakdown), 2)
        }
        
        return {
            "room_breakdown": room_breakdown,
            "device_totals": device_totals,
            "total_consumption": round(sum(room["total_consumption"] for room in room_breakdown), 2),
            "analysis_timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/trends")
async def get_energy_trends():
    """Get energy consumption trends and patterns"""
    try:
        # Generate hourly pattern
        hourly_pattern = []
        for hour in range(24):
            if 8 <= hour <= 18:  # Business hours
                consumption = 45 + (hour - 8) * 3 if hour <= 14 else 66 - (hour - 14) * 3
            else:
                consumption = max(10, 20 - abs(hour - 12) // 2)
            
            hourly_pattern.append({
                "hour": f"{hour:02d}:00",
                "average_consumption": consumption + (hash(str(hour)) % 10 - 5)
            })
        
        # Generate weekly pattern
        weekly_pattern = []
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        for i, day in enumerate(days):
            # Weekdays higher, weekends lower
            base_consumption = 300 if i < 5 else 120
            weekly_pattern.append({
                "day": day,
                "average_consumption": base_consumption + (hash(day) % 50 - 25)
            })
        
        # Generate efficiency trends
        efficiency_trend = []
        for i in range(30):  # Last 30 days
            date = (datetime.now() - timedelta(days=29-i)).strftime('%Y-%m-%d')
            efficiency = 88 + (i % 10) - 5 + (hash(date) % 6 - 3)
            efficiency_trend.append({
                "date": date,
                "efficiency": max(75, min(95, efficiency))
            })
        
        return {
            "hourly_pattern": hourly_pattern,
            "weekly_pattern": weekly_pattern,
            "efficiency_trend": efficiency_trend,
            "peak_hours": "10:00 - 16:00",
            "lowest_consumption": "02:00 - 06:00",
            "weekly_peak": "Tuesday - Thursday"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/savings")
async def get_savings_report():
    """Get detailed savings analysis and recommendations"""
    try:
        rooms = mock_generator.generate_room_data()
        
        # Calculate potential savings
        total_consumption = sum(room.power_consumption for room in rooms)
        
        savings_opportunities = [
            {
                "category": "Lighting Optimization",
                "current_consumption": round(total_consumption * 0.3, 1),
                "potential_savings": round(total_consumption * 0.3 * 0.25, 1),
                "savings_percentage": 25,
                "recommendation": "Install motion sensors and daylight harvesting",
                "implementation_cost": "₹15,000",
                "payback_period": "8 months"
            },
            {
                "category": "HVAC Optimization",
                "current_consumption": round(total_consumption * 0.5, 1),
                "potential_savings": round(total_consumption * 0.5 * 0.20, 1),
                "savings_percentage": 20,
                "recommendation": "Implement smart temperature control and scheduling",
                "implementation_cost": "₹25,000",
                "payback_period": "12 months"
            },
            {
                "category": "Equipment Scheduling",
                "current_consumption": round(total_consumption * 0.2, 1),
                "potential_savings": round(total_consumption * 0.2 * 0.30, 1),
                "savings_percentage": 30,
                "recommendation": "Automated shutdown during non-peak hours",
                "implementation_cost": "₹8,000",
                "payback_period": "6 months"
            }
        ]
        
        # Calculate totals
        total_potential_savings = sum(opp["potential_savings"] for opp in savings_opportunities)
        total_implementation_cost = sum(
            int(opp["implementation_cost"].replace("₹", "").replace(",", "")) 
            for opp in savings_opportunities
        )
        
        # Monthly savings calculation
        monthly_savings = round(total_potential_savings * 24 * 30 * 4, 0)  # ₹4 per kWh
        annual_savings = monthly_savings * 12
        
        return {
            "current_monthly_cost": round(total_consumption * 24 * 30 * 4, 0),
            "potential_monthly_savings": monthly_savings,
            "potential_annual_savings": annual_savings,
            "total_implementation_cost": total_implementation_cost,
            "roi_months": round(total_implementation_cost / monthly_savings, 1),
            "savings_opportunities": savings_opportunities,
            "carbon_footprint_reduction": "1.2 tons CO2/year"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports")
async def get_energy_reports(
    report_type: str = Query("summary", regex="^(summary|detailed|compliance)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Generate energy consumption reports"""
    try:
        # Generate report based on type
        if report_type == "summary":
            report = {
                "report_type": "Energy Consumption Summary",
                "period": f"{start_date or '30 days ago'} to {end_date or 'today'}",
                "total_consumption": "2,450 kWh",
                "total_cost": "₹9,800",
                "average_daily_consumption": "81.7 kWh",
                "efficiency_rating": "92.3%",
                "carbon_footprint": "1.18 tons CO2",
                "key_insights": [
                    "15% reduction in consumption compared to last month",
                    "Peak usage between 10:00-16:00",
                    "Room 101 is the highest consumer (28% of total)",
                    "HVAC systems account for 52% of total consumption"
                ]
            }
        elif report_type == "detailed":
            report = {
                "report_type": "Detailed Energy Analysis",
                "period": f"{start_date or '30 days ago'} to {end_date or 'today'}",
                "room_analysis": [
                    {"room": "Room 101", "consumption": "686 kWh", "cost": "₹2,744", "efficiency": "89%"},
                    {"room": "Room 102", "consumption": "612 kWh", "cost": "₹2,448", "efficiency": "91%"},
                    {"room": "Room 103", "consumption": "539 kWh", "cost": "₹2,156", "efficiency": "94%"},
                    {"room": "Lab 201", "consumption": "613 kWh", "cost": "₹2,452", "efficiency": "88%"}
                ],
                "device_breakdown": {
                    "HVAC": {"consumption": "1,274 kWh", "percentage": 52},
                    "Lighting": {"consumption": "735 kWh", "percentage": 30},
                    "Equipment": {"consumption": "441 kWh", "percentage": 18}
                },
                "recommendations": [
                    "Optimize HVAC schedules during low occupancy",
                    "Implement daylight harvesting in south-facing rooms",
                    "Consider LED upgrade for remaining fixtures"
                ]
            }
        else:  # compliance
            report = {
                "report_type": "Energy Compliance Report",
                "period": f"{start_date or '30 days ago'} to {end_date or 'today'}",
                "regulatory_compliance": {
                    "energy_star_rating": "4.2/5",
                    "carbon_intensity": "0.48 kg CO2/kWh",
                    "renewable_energy_ratio": "12%",
                    "efficiency_benchmark": "Exceeds industry standard by 8%"
                },
                "certifications": [
                    {"name": "ISO 50001", "status": "Compliant", "next_audit": "2024-12-15"},
                    {"name": "Green Building", "status": "Certified", "level": "Silver"}
                ],
                "sustainability_metrics": {
                    "water_usage": "2,340 liters/month",
                    "waste_reduction": "78%",
                    "green_energy_usage": "280 kWh/month"
                }
            }
        
        return {
            "report": report,
            "generated_at": datetime.now().isoformat(),
            "report_id": f"RPT-{report_type.upper()}-{datetime.now().strftime('%Y%m%d')}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts", response_model=List[Alert])
async def get_analytics_alerts():
    """Get energy analytics related alerts"""
    try:
        analytics_alerts = [
            Alert(
                id=1,
                type="warning",
                message="Energy consumption 15% above baseline",
                time="2 hours ago",
                room_id="room-101"
            ),
            Alert(
                id=2,
                type="success",
                message="Monthly savings target achieved: ₹2,450",
                time="1 day ago",
                room_id=""
            ),
            Alert(
                id=3,
                type="info",
                message="Weekly energy report generated",
                time="2 days ago",
                room_id=""
            )
        ]
        
        return analytics_alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
