from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from models import (
    LoanCalculationRequest, 
    LoanCalculationResponse, 
    BankRatesResponse,
    LoanCalculationHistory
)
from services import LoanCalculatorService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize service
loan_service = LoanCalculatorService()

@api_router.get("/")
async def root():
    return {"message": "Home Loan Calculator API"}

@api_router.post("/calculate-savings", response_model=LoanCalculationResponse)
async def calculate_savings(request: LoanCalculationRequest):
    """Calculate loan savings based on user input"""
    try:
        # Convert request to dict for service
        request_data = request.dict()
        
        # Calculate savings using service
        result = loan_service.calculate_loan_savings(request_data)
        
        # Optionally save calculation history to database
        history_record = LoanCalculationHistory(
            loanAmount=request.loanAmount,
            startYear=request.startYear,
            startMonth=request.startMonth,
            tenure=request.tenure,
            currentRate=request.currentRate,
            calculatedSavings=result.totalSavings
        )
        
        # Save to database (async)
        await db.loan_calculations.insert_one(history_record.dict())
        
        return result
        
    except Exception as e:
        logging.error(f"Error calculating savings: {str(e)}")
        raise HTTPException(status_code=500, detail="Error calculating loan savings")

@api_router.get("/bank-rates", response_model=BankRatesResponse)
async def get_bank_rates():
    """Get current bank rates"""
    try:
        rates_data = loan_service.get_bank_rates()
        return BankRatesResponse(**rates_data)
    except Exception as e:
        logging.error(f"Error fetching bank rates: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching bank rates")

@api_router.get("/calculation-history")
async def get_calculation_history(limit: int = 10):
    """Get recent calculation history"""
    try:
        calculations = await db.loan_calculations.find().sort("createdAt", -1).limit(limit).to_list(limit)
        return {"calculations": calculations}
    except Exception as e:
        logging.error(f"Error fetching calculation history: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching calculation history")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()