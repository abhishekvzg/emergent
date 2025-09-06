import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Calculator, TrendingUp, Building2, ArrowRight, ExternalLink } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [formData, setFormData] = useState({
    pnbRate: '7.5',
    currentRate: '',
    loanAmount: [50], // in lakhs (slider value as array)
    remainingYears: '',
    remainingMonths: ''
  });
  
  const [calculations, setCalculations] = useState(null);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const calculateSavings = async () => {
    if (!formData.currentRate || !formData.loanAmount[0] || (!formData.remainingYears && !formData.remainingMonths)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCalculating(true);
    
    try {
      // Calculate total months from years and months
      const totalMonths = (parseInt(formData.remainingYears || 0) * 12) + parseInt(formData.remainingMonths || 0);
      
      if (totalMonths <= 0) {
        toast({
          title: "Invalid Duration",
          description: "Please enter a valid remaining tenure.",
          variant: "destructive"
        });
        setIsCalculating(false);
        return;
      }
      
      // Simple frontend calculation (bypass backend for now)
      const outstandingAmount = parseFloat(formData.loanAmount[0]) * 100000; // Convert lakhs to rupees
      const remainingTenureYears = Math.max(0.5, totalMonths / 12);
      
      // Calculate EMI function
      const calculateEMI = (principal, rate, tenure) => {
        const monthlyRate = rate / (12 * 100);
        const numberOfPayments = tenure * 12;
        if (monthlyRate === 0) return principal / numberOfPayments;
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      };
      
      const currentEMI = calculateEMI(outstandingAmount, parseFloat(formData.currentRate), remainingTenureYears);
      const pnbEMI = calculateEMI(outstandingAmount, parseFloat(formData.pnbRate), remainingTenureYears);
      const monthlySavings = currentEMI - pnbEMI;
      const totalSavings = monthlySavings * totalMonths;
      
      // Calculate early closure with same EMI
      const calculateEarlyClosureMonths = (principal, rate, currentEMI) => {
        const monthlyRate = rate / (12 * 100);
        if (monthlyRate === 0) return Math.ceil(principal / currentEMI);
        
        // Using loan amortization formula to find remaining months
        const months = Math.log(1 + (principal * monthlyRate) / currentEMI) / Math.log(1 + monthlyRate);
        return Math.ceil(months);
      };
      
      const earlyClosureMonths = calculateEarlyClosureMonths(outstandingAmount, parseFloat(formData.pnbRate), currentEMI);
      const earlyClosureYears = Math.floor(earlyClosureMonths / 12);
      const earlyClosureRemainingMonths = earlyClosureMonths % 12;
      
      setCalculations({
        currentEMI: Math.round(currentEMI),
        pnbEMI: Math.round(pnbEMI),
        monthlySavings: Math.round(monthlySavings),
        totalSavings: Math.round(totalSavings),
        remainingMonths: totalMonths,
        earlyClosureYears,
        earlyClosureRemainingMonths,
        earlyClosureMonths
      });
      
      setShowSavingsModal(true);
      
    } catch (error) {
      console.error('Error calculating savings:', error);
      toast({
        title: "Calculation Error",
        description: error.message || "Failed to calculate savings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to format loan amount display
  const formatLoanAmount = (amountInLakhs) => {
    if (amountInLakhs >= 100) {
      return `₹${(amountInLakhs / 100).toFixed(1)} Crores`;
    }
    return `₹${amountInLakhs} Lakhs`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-800 to-red-900 shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {/* PNB Logo */}
              <div className="bg-red-800 border-2 border-yellow-400 px-6 py-3 rounded-lg shadow-lg">
                <div className="text-yellow-400 font-black text-2xl tracking-wider">PNB</div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Punjab National Bank</h1>
                <p className="text-yellow-200">Home Loan Calculator - India's Trusted Bank Since 1894</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Big Center Box */}
          <Card className="p-12 text-center bg-gradient-to-br from-red-800 to-red-900 text-white shadow-2xl border-2 border-yellow-400">
            <h2 className="text-5xl font-black mb-4 leading-tight">
              GAIN BIG WITH PNB HOME LOANS
            </h2>
            <p className="text-xl opacity-90 text-yellow-200">
              Switch to India's most trusted bank and save thousands every month
            </p>
          </Card>

          {/* Know Your Gain Section - Now in a highlighted box */}
          <Card className="p-8 text-center bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 shadow-xl">
            <h3 className="text-3xl font-bold text-red-900 mb-2">Know Your Gain Here</h3>
            <p className="text-red-700 text-lg">Enter your details below to calculate potential savings with PNB</p>
          </Card>

          {/* Input Form */}
          <Card className="p-6 md:p-8 shadow-xl bg-white/90 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="pnbRate" className="text-base md:text-lg font-semibold text-gray-700 mb-2 block">
                    PNB Home Loan Interest Rate (% p.a.)
                  </Label>
                  <Input
                    id="pnbRate"
                    type="number"
                    step="0.1"
                    value={formData.pnbRate}
                    onChange={(e) => handleInputChange('pnbRate', e.target.value)}
                    className="h-12 md:h-14 text-lg md:text-xl border-2 focus:border-red-600 bg-red-50 text-red-800 font-semibold"
                  />
                  <p className="text-xs md:text-sm text-red-600 mt-1 font-medium">Punjab National Bank special offer rate</p>
                </div>

                <div>
                  <Label htmlFor="currentRate" className="text-base md:text-lg font-semibold text-gray-700 mb-2 block">
                    Your Present Home Loan Interest Rate (% p.a.)
                  </Label>
                  <Input
                    id="currentRate"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 8.5"
                    value={formData.currentRate}
                    onChange={(e) => handleInputChange('currentRate', e.target.value)}
                    className="h-12 md:h-14 text-lg md:text-xl border-2 focus:border-red-600"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <Label className="text-base md:text-lg font-semibold text-gray-700 mb-4 block">
                    Your Loan Amount Outstanding ({formatLoanAmount(formData.loanAmount[0])})
                  </Label>
                  
                  {/* Input box for loan amount */}
                  <div className="mb-4">
                    <Input
                      type="number"
                      placeholder="Enter amount in lakhs"
                      value={formData.loanAmount[0]}
                      onChange={(e) => {
                        const value = Math.max(10, Math.min(500, parseFloat(e.target.value) || 10));
                        handleInputChange('loanAmount', [value]);
                      }}
                      className="h-12 md:h-14 text-lg md:text-xl border-2 focus:border-red-600"
                      min="10"
                      max="500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Amount in lakhs (10 to 500)</p>
                  </div>
                  
                  {/* Slider synchronized with input */}
                  <div className="px-2 md:px-4">
                    <Slider
                      value={formData.loanAmount}
                      onValueChange={(value) => handleInputChange('loanAmount', value)}
                      max={500}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
                      <span>₹10L</span>
                      <span>₹5 Cr</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base md:text-lg font-semibold text-gray-700 mb-2 block">
                    Remaining Tenure
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        placeholder="Years"
                        value={formData.remainingYears}
                        onChange={(e) => handleInputChange('remainingYears', e.target.value)}
                        className="h-12 md:h-14 text-lg md:text-xl border-2 focus:border-red-600"
                        min="0"
                        max="30"
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">Years</p>
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Months"
                        value={formData.remainingMonths}
                        onChange={(e) => handleInputChange('remainingMonths', e.target.value)}
                        className="h-12 md:h-14 text-lg md:text-xl border-2 focus:border-red-600"
                        min="0"
                        max="11"
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">Months</p>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 mt-2">Enter remaining loan tenure (e.g., 4 years 3 months)</p>
                </div>
              </div>
            </div>

            {/* Click Here Button */}
            <div className="mt-8 md:mt-12 text-center">
              <Button 
                onClick={calculateSavings}
                disabled={isCalculating || !formData.currentRate || !formData.loanAmount[0] || (!formData.remainingYears && !formData.remainingMonths)}
                className="h-14 md:h-16 px-8 md:px-12 text-lg md:text-xl font-bold bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 border-2 border-yellow-400 hover:border-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-xl rounded-xl text-white"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-red-50 to-yellow-50 border-2 border-red-300 backdrop-blur-xl">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md -z-10" />
          <DialogHeader className="pb-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-700 to-red-800 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-lg">
                <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-yellow-300" />
              </div>
              <DialogTitle className="text-2xl md:text-3xl font-bold text-red-900">
                Your PNB Savings Calculation
              </DialogTitle>
            </div>
          </DialogHeader>
          
          {calculations && (
            <div className="space-y-6 md:space-y-8 px-2 md:px-4">
              {/* Total Savings Banner */}
              <div className="bg-gradient-to-r from-red-700 to-red-800 text-white p-6 md:p-8 rounded-2xl shadow-xl border-2 border-yellow-400">
                <h3 className="text-xl md:text-2xl font-bold mb-4 text-yellow-200">Your Total Savings with PNB</h3>
                <div className="text-4xl md:text-6xl font-black mb-2 text-yellow-300">
                  ₹{Math.abs(calculations.totalSavings).toLocaleString('en-IN')}
                </div>
                <p className="text-lg md:text-xl opacity-90 text-yellow-200">
                  Over {Math.floor(calculations.remainingMonths / 12)} years {calculations.remainingMonths % 12} months
                </p>
              </div>

              {/* Grid for smaller cards on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Monthly Savings */}
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border-2 border-red-300">
                  <h3 className="text-lg md:text-xl font-bold text-red-900 mb-4">Your Monthly Savings with PNB</h3>
                  <div className="text-2xl md:text-4xl font-bold text-red-700 mb-2">
                    ₹{Math.abs(calculations.monthlySavings).toLocaleString('en-IN')}
                  </div>
                  <p className="text-sm md:text-base text-red-600">
                    Every month for the remaining tenure
                  </p>
                </div>

                {/* Early Loan Closure */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 md:p-6 rounded-xl shadow-lg border-2 border-green-300">
                  <h3 className="text-lg md:text-xl font-bold text-green-900 mb-4">Early Loan Closure Benefit</h3>
                  <div className="text-center">
                    <p className="text-sm md:text-lg text-green-700 mb-2">
                      If you continue paying your current EMI of <span className="font-bold">₹{calculations.currentEMI.toLocaleString('en-IN')}</span>
                    </p>
                    <div className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
                      {calculations.earlyClosureYears} Years {calculations.earlyClosureRemainingMonths} Months
                    </div>
                    <p className="text-sm md:text-base text-green-600">
                      You can close your PNB loan early and save more!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button 
                  className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 border-2 border-yellow-400 hover:border-yellow-300"
                  onClick={() => window.open('https://www.pnbhousing.com/home-loan', '_blank')}
                >
                  <Building2 className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Switch to PNB Now
                  <ExternalLink className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-12 md:h-14 text-base md:text-lg border-2 border-red-600 text-red-700 hover:bg-red-50"
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