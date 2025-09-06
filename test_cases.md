# PNB Home Loan Calculator - Test Cases

## Test Case 1: Basic Calculation
**Input:**
- Loan Amount: ₹50 Lakhs (5,000,000)
- Current Rate: 9.0%
- PNB Rate: 7.5%
- Remaining Tenure: 10 years 0 months (120 months)

**Expected Calculations:**
- Current EMI: ₹63,340 (at 9% for 10 years)
- PNB EMI: ₹59,455 (at 7.5% for 10 years)  
- Monthly Savings: ₹3,885
- Total Savings: ₹4,66,200 (3,885 × 120)
- Early Closure: ~8 years 8 months (if paying ₹63,340 at 7.5% rate)

## Test Case 2: High Amount, Short Tenure
**Input:**
- Loan Amount: ₹200 Lakhs (2 Crores)
- Current Rate: 8.5%
- PNB Rate: 7.5%
- Remaining Tenure: 5 years 6 months (66 months)

**Expected Calculations:**
- Current EMI: ₹4,10,077
- PNB EMI: ₹4,00,471
- Monthly Savings: ₹9,606
- Total Savings: ₹6,33,996 (9,606 × 66)
- Early Closure: ~4 years 10 months

## Test Case 3: Low Amount, Long Tenure
**Input:**
- Loan Amount: ₹25 Lakhs (2,500,000)
- Current Rate: 10.0%
- PNB Rate: 7.5%
- Remaining Tenure: 15 years 0 months (180 months)

**Expected Calculations:**
- Current EMI: ₹26,873
- PNB EMI: ₹23,216
- Monthly Savings: ₹3,657
- Total Savings: ₹6,58,260 (3,657 × 180)
- Early Closure: ~9 years 4 months

## Test Case 4: Edge Case - Very High Rate Difference
**Input:**
- Loan Amount: ₹100 Lakhs (1 Crore)
- Current Rate: 12.0%
- PNB Rate: 7.5%
- Remaining Tenure: 8 years 3 months (99 months)

**Expected Calculations:**
- Current EMI: ₹1,57,085
- PNB EMI: ₹1,29,946
- Monthly Savings: ₹27,139
- Total Savings: ₹26,86,761 (27,139 × 99)
- Early Closure: ~5 years 2 months

## Test Case 5: Small Amount, Mixed Years/Months
**Input:**
- Loan Amount: ₹30 Lakhs (3,000,000)
- Current Rate: 8.8%
- PNB Rate: 7.5%
- Remaining Tenure: 7 years 9 months (93 months)

**Expected Calculations:**
- Current EMI: ₹46,126
- PNB EMI: ₹43,602
- Monthly Savings: ₹2,524
- Total Savings: ₹2,34,732 (2,524 × 93)
- Early Closure: ~6 years 4 months

## Validation Rules:
1. EMI = P × [r(1+r)^n] / [(1+r)^n - 1] where P=principal, r=monthly rate, n=months
2. Monthly Savings = Current EMI - PNB EMI
3. Total Savings = Monthly Savings × Remaining Months
4. Early Closure = Time to pay off loan with current EMI at PNB rate
5. All amounts should be positive and realistic
6. Early closure should be less than or equal to remaining tenure