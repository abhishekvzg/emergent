import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calculator, TrendingDown, Building2, ArrowRight } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [formData, setFormData] = useState({
    pnbRate: '6.5',
    currentRate: '',
    loanAmount: [50], // in lakhs (slider value as array)
    remainingMonths: ''
  });
  
  const [calculations, setCalculations] = useState(null);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const calculateSavings = async () => {
    if (!formData.currentRate || !formData.loanAmount[0] || !formData.remainingMonths) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculating(true);
    
    try {
      // Calculate based on remaining months and outstanding amount
      const outstandingAmount = parseFloat(formData.loanAmount[0]) * 100000; // Convert lakhs to rupees
      const remainingTenureYears = Math.max(0.5, parseFloat(formData.remainingMonths) / 12); // Minimum 0.5 years
      
      const requestData = {
        loanAmount: outstandingAmount,
        startYear: new Date().getFullYear(), // Current year as start
        startMonth: new Date().getMonth() + 1, // Current month
        tenure: remainingTenureYears,
        currentRate: parseFloat(formData.currentRate)
      };

      console.log('Sending request:', requestData); // Debug log

      const response = await axios.post(`${API}/calculate-savings`, requestData);
      
      // Calculate EMI values separately using our own calculation
      const calculateEMI = (principal, rate, tenure) => {
        const monthlyRate = rate / (12 * 100);
        const numberOfPayments = tenure * 12;
        if (monthlyRate === 0) return principal / numberOfPayments;
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      };
      
      const currentEMI = calculateEMI(outstandingAmount, parseFloat(formData.currentRate), remainingTenureYears);
      const pnbEMI = calculateEMI(outstandingAmount, 6.5, remainingTenureYears);
      const monthlySavings = currentEMI - pnbEMI;
      const totalSavings = monthlySavings * parseFloat(formData.remainingMonths);
      
      setCalculations({
        currentEMI: Math.round(currentEMI),
        pnbEMI: Math.round(pnbEMI),
        monthlySavings: Math.round(monthlySavings),
        totalSavings: Math.round(totalSavings),
        remainingMonths: formData.remainingMonths
      });
      
      setShowSavingsModal(true);
      
    } catch (error) {
      console.error('Error calculating savings:', error);
      toast({
        title: "Calculation Error",
        description: error.response?.data?.detail || "Failed to calculate savings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-xl">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">PNB Home Loan Calculator</h1>
                <p className="text-gray-600">Calculate your savings instantly</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Big Center Box */}
          <Card className="p-12 text-center bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-2xl border-0">
            <h2 className="text-5xl font-black mb-4 leading-tight">
              GAIN BIG WITH PNB HOME LOANS
            </h2>
            <p className="text-xl opacity-90">
              Switch to better rates and save thousands every month
            </p>
          </Card>

          {/* Know Your Gain Section */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Know Your Gain Here</h3>
            <p className="text-gray-600">Enter your details below to calculate potential savings</p>
          </div>

          {/* Input Form */}
          <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="pnbRate" className="text-lg font-semibold text-gray-700 mb-2 block">
                    PNB Home Loan Interest Rate (% p.a.)
                  </Label>
                  <Input
                    id="pnbRate"
                    type="number"
                    step="0.1"
                    value={formData.pnbRate}
                    onChange={(e) => handleInputChange('pnbRate', e.target.value)}
                    className="h-14 text-xl border-2 focus:border-orange-500 bg-orange-50"
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">Special offer rate for home loans</p>
                </div>

                <div>
                  <Label htmlFor="currentRate" className="text-lg font-semibold text-gray-700 mb-2 block">
                    Your Present Home Loan Interest Rate (% p.a.)
                  </Label>
                  <Input
                    id="currentRate"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 8.5"
                    value={formData.currentRate}
                    onChange={(e) => handleInputChange('currentRate', e.target.value)}
                    className="h-14 text-xl border-2 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold text-gray-700 mb-4 block">
                    Your Loan Amount Outstanding (₹{formData.loanAmount[0]} Lakhs)
                  </Label>
                  <div className="px-4">
                    <Slider
                      value={formData.loanAmount}
                      onValueChange={(value) => handleInputChange('loanAmount', value)}
                      max={500}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>₹10L</span>
                      <span>₹500L</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="remainingMonths" className="text-lg font-semibold text-gray-700 mb-2 block">
                    Remaining Instalments (Months)
                  </Label>
                  <Input
                    id="remainingMonths"
                    type="number"
                    placeholder="e.g., 180"
                    value={formData.remainingMonths}
                    onChange={(e) => handleInputChange('remainingMonths', e.target.value)}
                    className="h-14 text-xl border-2 focus:border-orange-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Number of monthly payments remaining</p>
                </div>
              </div>
            </div>

            {/* Click Here Button */}
            <div className="mt-12 text-center">
              <Button 
                onClick={calculateSavings}
                disabled={isCalculating || !formData.currentRate || !formData.loanAmount[0] || !formData.remainingMonths}
                className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-xl rounded-xl"
              >
                {isCalculating ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <span>CLICK HERE</span>
                    <ArrowRight className="h-6 w-6" />
                  </div>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Savings Modal */}
      <Dialog open={showSavingsModal} onOpenChange={setShowSavingsModal}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <DialogHeader>
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <TrendingDown className="h-10 w-10 text-white" />
              </div>
              <DialogTitle className="text-3xl font-bold text-gray-900">
                Your Savings Calculation
              </DialogTitle>
            </div>
          </DialogHeader>
          
          {calculations && (
            <div className="space-y-8 text-center">
              {/* Total Savings Banner */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-8 rounded-2xl shadow-xl">
                <h3 className="text-2xl font-bold mb-4">Your Total Savings</h3>
                <div className="text-6xl font-black mb-2">
                  ₹{Math.abs(calculations.totalSavings).toLocaleString('en-IN')}
                </div>
                <p className="text-xl opacity-90">
                  Over {calculations.remainingMonths} months
                </p>
              </div>

              {/* Monthly Savings */}
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Monthly Savings</h3>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  ₹{Math.abs(calculations.monthlySavings).toLocaleString('en-IN')}
                </div>
                <p className="text-gray-600">
                  Every month for the remaining tenure
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  <Building2 className="mr-2 h-5 w-5" />
                  Switch to PNB Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 text-lg border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                  onClick={() => setShowSavingsModal(false)}
                >
                  Calculate Again
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;