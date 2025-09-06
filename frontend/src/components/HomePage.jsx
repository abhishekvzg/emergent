import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calculator, TrendingDown, Building2, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [formData, setFormData] = useState({
    loanAmount: '',
    startYear: '',
    startMonth: '',
    tenure: '',
    currentRate: ''
  });
  
  const [calculations, setCalculations] = useState(null);
  const [showPNBModal, setShowPNBModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateEMI = (principal, rate, tenure) => {
    const monthlyRate = rate / (12 * 100);
    const numberOfPayments = tenure * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    return emi;
  };

  const calculateSavings = () => {
    if (!formData.loanAmount || !formData.tenure || !formData.currentRate) return;
    
    setIsCalculating(true);
    
    setTimeout(() => {
      const principal = parseFloat(formData.loanAmount);
      const tenure = parseFloat(formData.tenure);
      const currentRate = parseFloat(formData.currentRate);
      
      const startDate = new Date(parseInt(formData.startYear), parseInt(formData.startMonth) - 1);
      const currentDate = new Date();
      const monthsElapsed = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                           (currentDate.getMonth() - startDate.getMonth());
      const remainingTenure = Math.max(0, (tenure * 12 - monthsElapsed) / 12);
      
      const currentEMI = calculateEMI(principal, currentRate, tenure);
      const currentTotalPayment = currentEMI * tenure * 12;
      
      const pnbEMI = calculateEMI(principal, mockData.pnbRate, tenure);
      const pnbTotalPayment = pnbEMI * tenure * 12;
      
      const totalSavings = currentTotalPayment - pnbTotalPayment;
      const monthlySavings = currentEMI - pnbEMI;
      
      // Calculate remaining savings if switching now
      const remainingCurrentPayment = currentEMI * remainingTenure * 12;
      const remainingPNBPayment = calculateEMI(principal * (remainingTenure / tenure), mockData.pnbRate, remainingTenure) * remainingTenure * 12;
      const remainingSavings = Math.max(0, remainingCurrentPayment - remainingPNBPayment);
      
      const bankComparisons = mockData.banks.map(bank => ({
        name: bank.name,
        rate: bank.rate,
        emi: calculateEMI(principal, bank.rate, tenure),
        totalPayment: calculateEMI(principal, bank.rate, tenure) * tenure * 12,
        savings: (calculateEMI(principal, bank.rate, tenure) * tenure * 12) - pnbTotalPayment
      }));
      
      setCalculations({
        currentEMI,
        pnbEMI,
        totalSavings,
        monthlySavings,
        remainingSavings,
        bankComparisons,
        remainingTenure
      });
      
      setIsCalculating(false);
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Home Loan Calculator</h1>
                <p className="text-gray-600">Compare rates and save thousands</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Discover How Much You Can
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"> Save</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculate your potential savings by switching to better home loan rates. 
            See the exact amount you could save with our recommended partner bank.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Input Form */}
          <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enter Your Loan Details</h3>
                <p className="text-gray-600">Fill in your current home loan information</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="loanAmount" className="text-base font-semibold text-gray-700">
                    Total Loan Amount (₹)
                  </Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="e.g., 5000000"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    className="h-12 text-lg border-2 focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-base font-semibold text-gray-700">Start Year</Label>
                    <Select onValueChange={(value) => handleInputChange('startYear', value)}>
                      <SelectTrigger className="h-12 text-lg border-2 focus:border-orange-500">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-gray-700">Start Month</Label>
                    <Select onValueChange={(value) => handleInputChange('startMonth', value)}>
                      <SelectTrigger className="h-12 text-lg border-2 focus:border-orange-500">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={(index + 1).toString()}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tenure" className="text-base font-semibold text-gray-700">
                    Loan Tenure (Years)
                  </Label>
                  <Input
                    id="tenure"
                    type="number"
                    placeholder="e.g., 20"
                    value={formData.tenure}
                    onChange={(e) => handleInputChange('tenure', e.target.value)}
                    className="h-12 text-lg border-2 focus:border-orange-500"
                  />
                </div>

                <div>
                  <Label htmlFor="currentRate" className="text-base font-semibold text-gray-700">
                    Current Interest Rate (% per annum)
                  </Label>
                  <Input
                    id="currentRate"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 8.5"
                    value={formData.currentRate}
                    onChange={(e) => handleInputChange('currentRate', e.target.value)}
                    className="h-12 text-lg border-2 focus:border-orange-500"
                  />
                </div>

                <Button 
                  onClick={calculateSavings}
                  disabled={isCalculating || !formData.loanAmount || !formData.tenure || !formData.currentRate}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200"
                >
                  {isCalculating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Calculating...</span>
                    </div>
                  ) : (
                    <>Calculate Savings</>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Results */}
          {calculations && (
            <div className="space-y-6">
              {/* Giant Savings Number */}
              <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <TrendingDown className="h-16 w-16 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Total Potential Savings</h3>
                  <div className="text-6xl font-black text-green-600 mb-4">
                    ₹{Math.abs(calculations.totalSavings).toLocaleString('en-IN')}
                  </div>
                  <p className="text-lg text-gray-600">
                    You could save <span className="font-bold text-green-600">₹{Math.abs(calculations.monthlySavings).toLocaleString('en-IN')}</span> per month
                  </p>
                  
                  <Button 
                    onClick={() => setShowPNBModal(true)}
                    className="mt-6 h-12 px-8 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200"
                  >
                    Switch to PNB Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </Card>

              {/* Bank Comparison */}
              <Card className="p-6 shadow-xl bg-white/90">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Rate Comparison</h4>
                <div className="space-y-3">
                  {calculations.bankComparisons.map((bank, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-semibold text-gray-800">{bank.name}</span>
                        <span className="text-sm text-gray-600 ml-2">({bank.rate}% p.a.)</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">₹{bank.emi.toLocaleString('en-IN')}/mo</div>
                        <div className="text-sm text-red-600">+₹{Math.abs(bank.savings).toLocaleString('en-IN')} more</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <div>
                      <span className="font-bold text-green-800">PNB (Recommended)</span>
                      <span className="text-sm text-green-600 ml-2">({mockData.pnbRate}% p.a.)</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-800">₹{calculations.pnbEMI.toLocaleString('en-IN')}/mo</div>
                      <div className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Best Rate
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* PNB Modal */}
      <Dialog open={showPNBModal} onOpenChange={setShowPNBModal}>
        <DialogContent className="max-w-lg bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <DialogHeader>
            <div className="text-center space-y-4">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                <Building2 className="h-12 w-12 text-white" />
              </div>
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Punjab National Bank
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-gray-900">Special Home Loan Offer</h4>
              <p className="text-2xl font-bold text-orange-600">{mockData.pnbRate}% Interest Rate</p>
              <p className="text-gray-600">India's trusted banking partner since 1894</p>
            </div>
            
            <div className="space-y-3 text-left bg-white/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Lowest processing fees in the market</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Quick approval in 48 hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>No hidden charges</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Flexible repayment options</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                Apply Now
              </Button>
              <Button variant="outline" className="w-full h-12 text-lg border-2 border-orange-500 text-orange-600 hover:bg-orange-50">
                Get More Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;