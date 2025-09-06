from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid

class LoanCalculationRequest(BaseModel):
    loanAmount: float
    startYear: int
    startMonth: int
    tenure: float
    currentRate: float

class BankComparison(BaseModel):
    name: str
    rate: float
    emi: float
    totalPayment: float
    savings: float

class LoanCalculationResponse(BaseModel):
    currentEMI: float
    pnbEMI: float
    totalSavings: float
    monthlySavings: float
    remainingSavings: float
    remainingTenure: float
    bankComparisons: List[BankComparison]

class BankRate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    rate: float
    isRecommended: bool = False
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class BankRatesResponse(BaseModel):
    pnbRate: float
    competitors: List[dict]

class LoanCalculationHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    loanAmount: float
    startYear: int
    startMonth: int
    tenure: float
    currentRate: float
    calculatedSavings: float
    createdAt: datetime = Field(default_factory=datetime.utcnow)