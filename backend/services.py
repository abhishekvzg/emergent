import math
from datetime import datetime
from typing import List
from models import BankComparison, LoanCalculationResponse

class LoanCalculatorService:
    
    @staticmethod
    def calculate_emi(principal: float, rate: float, tenure: float) -> float:
        """Calculate EMI using standard home loan formula"""
        monthly_rate = rate / (12 * 100)
        number_of_payments = tenure * 12
        
        if monthly_rate == 0:
            return principal / number_of_payments
            
        emi = (principal * monthly_rate * pow(1 + monthly_rate, number_of_payments)) / \
              (pow(1 + monthly_rate, number_of_payments) - 1)
        return round(emi, 2)
    
    @staticmethod
    def calculate_remaining_tenure(start_year: int, start_month: int, original_tenure: float) -> float:
        """Calculate remaining tenure from current date"""
        start_date = datetime(start_year, start_month, 1)
        current_date = datetime.now()
        
        months_elapsed = (current_date.year - start_date.year) * 12 + \
                        (current_date.month - start_date.month)
        
        remaining_months = max(0, (original_tenure * 12) - months_elapsed)
        return round(remaining_months / 12, 2)
    
    @staticmethod
    def get_bank_rates():
        """Get current bank rates - in production this would come from database"""
        return {
            "pnbRate": 6.5,
            "competitors": [
                {"name": "Bank A", "rate": 8.2},
                {"name": "Bank B", "rate": 8.7},
                {"name": "Bank C", "rate": 9.1}
            ]
        }
    
    @classmethod
    def calculate_loan_savings(cls, request_data: dict) -> LoanCalculationResponse:
        """Main calculation logic for loan savings"""
        principal = request_data["loanAmount"]
        start_year = request_data["startYear"]
        start_month = request_data["startMonth"]
        tenure = request_data["tenure"]
        current_rate = request_data["currentRate"]
        
        # Get bank rates
        rates_data = cls.get_bank_rates()
        pnb_rate = rates_data["pnbRate"]
        competitor_banks = rates_data["competitors"]
        
        # Calculate EMIs
        current_emi = cls.calculate_emi(principal, current_rate, tenure)
        pnb_emi = cls.calculate_emi(principal, pnb_rate, tenure)
        
        # Calculate total payments
        current_total_payment = current_emi * tenure * 12
        pnb_total_payment = pnb_emi * tenure * 12
        
        # Calculate savings
        total_savings = current_total_payment - pnb_total_payment
        monthly_savings = current_emi - pnb_emi
        
        # Calculate remaining tenure and savings
        remaining_tenure = cls.calculate_remaining_tenure(start_year, start_month, tenure)
        
        if remaining_tenure > 0:
            remaining_current_payment = current_emi * remaining_tenure * 12
            # For remaining savings, calculate PNB EMI on remaining principal
            remaining_principal = principal * (remaining_tenure / tenure)
            remaining_pnb_emi = cls.calculate_emi(remaining_principal, pnb_rate, remaining_tenure)
            remaining_pnb_payment = remaining_pnb_emi * remaining_tenure * 12
            remaining_savings = max(0, remaining_current_payment - remaining_pnb_payment)
        else:
            remaining_savings = 0
        
        # Calculate bank comparisons
        bank_comparisons = []
        for bank in competitor_banks:
            bank_emi = cls.calculate_emi(principal, bank["rate"], tenure)
            bank_total_payment = bank_emi * tenure * 12
            bank_savings = bank_total_payment - pnb_total_payment
            
            bank_comparisons.append(BankComparison(
                name=bank["name"],
                rate=bank["rate"],
                emi=bank_emi,
                totalPayment=bank_total_payment,
                savings=bank_savings
            ))
        
        return LoanCalculationResponse(
            currentEMI=current_emi,
            pnbEMI=pnb_emi,
            totalSavings=round(total_savings, 2),
            monthlySavings=round(monthly_savings, 2),
            remainingSavings=round(remaining_savings, 2),
            remainingTenure=remaining_tenure,
            bankComparisons=bank_comparisons
        )