# Home Loan Calculator - Backend Integration Contracts

## API Contracts

### 1. Calculate Loan Savings
- **Endpoint**: `POST /api/calculate-savings`
- **Request Body**:
```json
{
  "loanAmount": 5000000,
  "startYear": 2020,
  "startMonth": 1,
  "tenure": 20,
  "currentRate": 8.5
}
```
- **Response**:
```json
{
  "currentEMI": 42446.49,
  "pnbEMI": 37264.11,
  "totalSavings": 1467001.17,
  "monthlySavings": 5182.38,
  "remainingSavings": 856420.45,
  "remainingTenure": 16.5,
  "bankComparisons": [
    {
      "name": "Bank A",
      "rate": 8.2,
      "emi": 41832.15,
      "totalPayment": 10039716.00,
      "savings": 1194916.80
    }
  ]
}
```

### 2. Get Bank Rates
- **Endpoint**: `GET /api/bank-rates`
- **Response**:
```json
{
  "pnbRate": 6.5,
  "competitors": [
    {"name": "Bank A", "rate": 8.2},
    {"name": "Bank B", "rate": 8.7},
    {"name": "Bank C", "rate": 9.1}
  ]
}
```

### 3. Save Calculation History (Optional)
- **Endpoint**: `POST /api/save-calculation`
- **Purpose**: Store user calculations for analytics

## Current Mock Data (to be replaced)

### In `/app/frontend/src/utils/mockData.js`:
- PNB rate: 6.5%
- Bank A: 8.2%, Bank B: 8.7%, Bank C: 9.1%
- All EMI calculations are done frontend-side

## Backend Implementation Plan

### 1. Models
- **LoanCalculation**: Store calculation requests and results
- **BankRates**: Dynamic rate configuration

### 2. Business Logic
- **EMI Calculator**: Move calculation logic to backend
- **Rate Management**: Configurable bank rates
- **History Tracking**: Optional user calculation storage

### 3. Database Schema
```javascript
// LoanCalculation Model
{
  id: ObjectId,
  loanAmount: Number,
  startDate: Date,
  tenure: Number,
  currentRate: Number,
  calculatedSavings: Number,
  createdAt: Date
}

// BankRates Model
{
  id: ObjectId,
  bankName: String,
  rate: Number,
  isRecommended: Boolean,
  updatedAt: Date
}
```

## Frontend Integration Changes

### Files to Update:
1. **`/app/frontend/src/components/HomePage.jsx`**:
   - Replace mock calculation with API calls
   - Use `REACT_APP_BACKEND_URL` for API endpoints
   - Add proper error handling

2. **`/app/frontend/src/utils/mockData.js`**:
   - Remove or keep as fallback
   - Replace with API data fetching

### Integration Points:
- Replace `calculateSavings()` function with API call
- Add loading states for API requests
- Handle API errors gracefully
- Maintain existing UI/UX flow

## Success Criteria
- All calculations move to backend
- Frontend displays real-time data from APIs
- Error handling for network issues
- Calculation history stored in MongoDB
- Bank rates configurable via database