from fastapi import APIRouter, HTTPException  
from typing import List, Dict  
from app.models.schemas import Room, EnergyData, TimeSeriesData  
from app.utils.mock_data import mock_generator  
  
router = APIRouter() 
