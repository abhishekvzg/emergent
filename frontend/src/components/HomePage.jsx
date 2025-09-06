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
    loanAmount: [''], // Empty by default - will store lakhs for slider
    loanAmountRupees: '', // Store rupees input separately
    remainingYears: '',
    remainingMonths: ''
  });
  
  const [calculations, setCalculations] = useState(null);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const calculateSavings = async () => {
    // Validation
    if (!formData.currentRate || !formData.loanAmount[0] || formData.loanAmount[0] <= 0 || (!formData.remainingYears && !formData.remainingMonths)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields with valid values.",
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
      
      // Convert inputs to numbers
      const outstandingAmount = parseFloat(formData.loanAmount[0]) * 100000; // Convert lakhs to rupees
      const currentRate = parseFloat(formData.currentRate);
      const pnbRate = parseFloat(formData.pnbRate);
      const remainingTenureYears = totalMonths / 12;
      
      console.log('Calculation inputs:', {
        outstandingAmount,
        currentRate,
        pnbRate,
        totalMonths,
        remainingTenureYears
      });
      
      // Calculate EMI function
      const calculateEMI = (principal, rate, tenure) => {
        if (principal <= 0 || rate <= 0 || tenure <= 0) return 0;
        const monthlyRate = rate / (12 * 100);
        const numberOfPayments = tenure * 12;
        if (monthlyRate === 0) return principal / numberOfPayments;
        return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      };
      
      const currentEMI = calculateEMI(outstandingAmount, currentRate, remainingTenureYears);
      const pnbEMI = calculateEMI(outstandingAmount, pnbRate, remainingTenureYears);
      const monthlySavings = currentEMI - pnbEMI;
      const totalSavings = monthlySavings * totalMonths;
      
      // Calculate early closure with current EMI amount at PNB rate
      const calculateEarlyClosureMonths = (principal, rate, emiAmount) => {
        if (principal <= 0 || rate <= 0 || emiAmount <= 0) return 0;
        
        const monthlyRate = rate / (12 * 100);
        if (monthlyRate === 0) return Math.ceil(principal / emiAmount);
        
        // If EMI is too small, return a large number
        if (emiAmount <= principal * monthlyRate) {
          return 999; // EMI too small to ever pay off loan
        }
        
        // Calculate months using loan payoff formula
        const months = Math.log(1 + (principal * monthlyRate) / emiAmount) / Math.log(1 + monthlyRate);
        return Math.max(1, Math.ceil(months));
      };
      
      const earlyClosureMonths = calculateEarlyClosureMonths(outstandingAmount, pnbRate, currentEMI);
      const earlyClosureYears = Math.floor(earlyClosureMonths / 12);
      const earlyClosureRemainingMonths = earlyClosureMonths % 12;
      
      console.log('Calculation results:', {
        currentEMI,
        pnbEMI,
        monthlySavings,
        totalSavings,
        earlyClosureMonths,
        earlyClosureYears,
        earlyClosureRemainingMonths
      });
      
      setCalculations({
        currentEMI: Math.round(currentEMI),
        pnbEMI: Math.round(pnbEMI),
        monthlySavings: Math.round(monthlySavings),
        totalSavings: Math.round(totalSavings),
        remainingMonths: totalMonths,
        earlyClosureYears: earlyClosureYears >= 99 ? 99 : earlyClosureYears,
        earlyClosureRemainingMonths: earlyClosureYears >= 99 ? 0 : earlyClosureRemainingMonths,
        earlyClosureMonths: earlyClosureMonths >= 999 ? 999 : earlyClosureMonths
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
    if (!amountInLakhs || amountInLakhs === 0) return '';
    if (amountInLakhs >= 100) {
      return `₹${(amountInLakhs / 100).toFixed(1)} Crores`;
    }
    return `₹${amountInLakhs} Lakhs`;
  };

  // Helper function to format rupees input with Indian number system
  const formatRupeesDisplay = (rupees) => {
    if (!rupees) return '';
    const num = parseInt(rupees);
    if (isNaN(num)) return '';
    
    // Convert to Indian number format (lakhs, crores)
    if (num >= 10000000) { // 1 crore
      const crores = (num / 10000000).toFixed(2);
      return `₹${crores} Crores`;
    } else if (num >= 100000) { // 1 lakh
      const lakhs = (num / 100000).toFixed(2);
      return `₹${lakhs} Lakhs`;
    } else if (num >= 1000) { // 1 thousand
      const thousands = (num / 1000).toFixed(2);
      return `₹${thousands} Thousands`;
    }
    return `₹${num}`;
  };

  // Handle rupees input change
  const handleRupeesChange = (rupees) => {
    const rupeesValue = parseFloat(rupees) || 0;
    const lakhsValue = rupeesValue / 100000; // Convert rupees to lakhs
    
    setFormData(prev => ({
      ...prev,
      loanAmountRupees: rupees,
      loanAmount: [Math.max(0, Math.min(500, lakhsValue))]
    }));
  };

  // Handle slider change
  const handleSliderChange = (lakhsArray) => {
    const lakhsValue = lakhsArray[0];
    const rupeesValue = lakhsValue * 100000; // Convert lakhs to rupees
    
    setFormData(prev => ({
      ...prev,
      loanAmount: lakhsArray,
      loanAmountRupees: rupeesValue.toString()
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-red-50">
      {/* Enhanced backdrop blur when modal is open */}
      {showSavingsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg z-40" />
      )}
      
      {/* Header */}
      <header className="bg-gradient-to-r from-red-800 to-red-900 shadow-lg border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3 md:space-x-4">
              {/* PNB Logo */}
              <div className="bg-red-800 border-2 border-yellow-400 px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg">
                <div className="text-yellow-400 font-black text-xl md:text-2xl tracking-wider">PNB</div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white">Punjab National Bank</h1>
                <p className="text-yellow-200 text-sm md:text-base">Home Loan Calculator - India's Trusted Bank Since 1894</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Main Content */}
        <div className="space-y-6 md:space-y-8">
          {/* Big Center Box */}
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-red-800 to-red-900 text-white shadow-2xl border-2 border-yellow-400">
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              GAIN BIG WITH PNB HOME LOANS
            </h2>
            <p className="text-lg md:text-xl opacity-90 text-yellow-200">
              Switch to India's most trusted bank and save thousands every month
            </p>
          </Card>

          {/* Know Your Gain Section - Now in a highlighted box */}
          <Card className="p-6 md:p-8 text-center bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 shadow-xl">
            <h3 className="text-2xl md:text-3xl font-bold text-red-900 mb-2">Know Your Gain Here</h3>
            <p className="text-red-700 text-base md:text-lg">Enter your details below to calculate potential savings with PNB</p>
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
                    className="h-12 md:h-14 text-lg md:text-xl border-2 focus:border-green-600 bg-green-50 text-green-800 font-semibold"
                  />
                  <p className="text-xs md:text-sm text-green-600 mt-1 font-medium">Punjab National Bank special offer rate</p>
                </div>

                <div>
                  <Label htmlFor="currentRate" className="text-base md:text-lg font-semibold text-gray-700 mb-2 block">
                    Your Present Home Loan Interest Rate (% p.a.)
                  </Label>
                  <Input
                    id="currentRate"
                    type="number"
                    step="0.1"
                    placeholder=""
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
                    Your Loan Amount Outstanding (in Rupees) {formatRupeesDisplay(formData.loanAmountRupees)}
                  </Label>
                  
                  {/* Input box for loan amount in rupees */}
                  <div className="mb-4">
                    <Input
                      type="number"
                      placeholder="Enter amount in rupees (e.g., 5000000)"
                      value={formData.loanAmountRupees}
                      onChange={(e) => handleRupeesChange(e.target.value)}
                      className="h-12 md:h-14 text-lg md:text-xl border-2 focus:border-red-600"
                      min="0"
                      max="50000000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Amount in rupees (up to ₹5 Crores)</p>
                  </div>
                  
                  {/* Slider synchronized with input - still in lakhs */}
                  <div className="px-2 md:px-4">
                    <Slider
                      value={formData.loanAmount[0] ? formData.loanAmount : [0]}
                      onValueChange={handleSliderChange}
                      max={500}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs md:text-sm text-gray-500 mt-2">
                      <span>₹0</span>
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

      {/* Savings Modal - Compact non-scrollable design */}
      <Dialog open={showSavingsModal} onOpenChange={setShowSavingsModal}>
        <DialogContent className="max-w-lg md:max-w-2xl max-h-[85vh] bg-gradient-to-br from-red-50 to-yellow-50 border-2 border-red-300 backdrop-blur-xl overflow-hidden">
          <DialogHeader className="pb-3">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-700 to-red-800 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-lg">
                <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-yellow-300" />
              </div>
              <DialogTitle className="text-xl md:text-2xl font-bold text-red-900">
                Your PNB Savings Calculation
              </DialogTitle>
            </div>
          </DialogHeader>

          {calculations && (
            <div className="space-y-4 px-2">
              {/* Total Savings Banner - Compact */}
              <div className="bg-gradient-to-r from-red-700 to-red-800 text-white p-4 md:p-6 rounded-xl shadow-lg border-2 border-yellow-400">
                <h3 className="text-lg md:text-xl font-bold mb-2 text-yellow-200">Your Total Savings with PNB Housing Loan</h3>
                <div className="text-3xl md:text-4xl font-black mb-1 text-yellow-300">
                  ₹{Math.abs(calculations.totalSavings).toLocaleString('en-IN')}
                </div>
                <p className="text-sm md:text-base opacity-90 text-yellow-200">
                  Over {Math.floor(calculations.remainingMonths / 12)} years {calculations.remainingMonths % 12} months
                </p>
              </div>

              {/* Compact Grid for smaller cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {/* Monthly Savings - Compact */}
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-md border-2 border-red-300">
                  <h3 className="text-base md:text-lg font-bold text-red-900 mb-2">Monthly Savings with PNB</h3>
                  <div className="text-2xl md:text-3xl font-bold text-red-700 mb-1">
                    ₹{Math.abs(calculations.monthlySavings).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs md:text-sm text-red-600">
                    Every month
                  </p>
                </div>

                {/* Early Loan Closure - Compact with same theme */}
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-md border-2 border-red-300">
                  <h3 className="text-base md:text-lg font-bold text-red-900 mb-2">Early Loan Closure</h3>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-red-700 mb-1">
                      {calculations.earlyClosureYears}Y {calculations.earlyClosureRemainingMonths}M
                    </div>
                    <p className="text-xs md:text-sm text-red-600">
                      Close loan early!
                    </p>
                  </div>
                </div>
              </div>

              {/* Compact Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button 
                  className="w-full h-10 md:h-12 text-sm md:text-base font-semibold bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 border-2 border-yellow-400 hover:border-yellow-300"
                  onClick={() => window.open('https://www.pnbhousing.com/home-loan', '_blank')}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Switch to PNB Now
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full h-10 md:h-12 text-sm md:text-base border-2 border-red-600 text-red-700 hover:bg-red-50"
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