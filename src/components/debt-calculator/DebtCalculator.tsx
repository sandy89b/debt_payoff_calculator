import React, { useState, useEffect } from 'react';
import { Plus, Calculator, DollarSign, BookOpen, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DebtEntry, Debt } from './DebtEntry';
import { BiblicalVerse } from './BiblicalVerse';
import { PayoffComparison } from './PayoffComparison';
import { DebtProgress } from './DebtProgress';
import { calculatePayoffStrategies } from './PayoffCalculator';
import { OnboardingWizard } from '../onboarding-wizard';
import { ProgressDashboard } from '../progress-dashboard';

export const DebtCalculator: React.FC = () => {
  const { toast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([
    {
      id: '1',
      name: 'Credit Card 1',
      balance: 5000,
      minPayment: 150,
      interestRate: 18.99
    }
  ]);
  const [extraPayment, setExtraPayment] = useState<number>(0);
  const [calculationResults, setCalculationResults] = useState<{
    snowball: any;
    avalanche: any;
  } | null>(null);
  
  // Onboarding and progress state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const addDebt = () => {
    const newDebt: Debt = {
      id: Date.now().toString(),
      name: `Debt ${debts.length + 1}`,
      balance: 0,
      minPayment: 0,
      interestRate: 0
    };
    setDebts([...debts, newDebt]);
  };

  const updateDebt = (updatedDebt: Debt) => {
    setDebts(debts.map(debt => debt.id === updatedDebt.id ? updatedDebt : debt));
  };

  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter(debt => debt.id !== id));
    } else {
      toast({
        title: "Cannot remove last debt",
        description: "You must have at least one debt entry.",
        variant: "destructive"
      });
    }
  };

  const calculateStrategies = () => {
    const validDebts = debts.filter(debt => 
      debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
    );

    if (validDebts.length === 0) {
      toast({
        title: "No valid debts",
        description: "Please enter valid debt information before calculating.",
        variant: "destructive"
      });
      return;
    }

    const results = calculatePayoffStrategies(validDebts, extraPayment);
    setCalculationResults(results);
    
    toast({
      title: "Calculation Complete",
      description: "Your debt payoff strategies have been calculated!",
    });
  };

  // Auto-calculate when debts or extra payment changes
  useEffect(() => {
    const validDebts = debts.filter(debt => 
      debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
    );
    
    if (validDebts.length > 0) {
      const results = calculatePayoffStrategies(validDebts, extraPayment);
      setCalculationResults(results);
    }
  }, [debts, extraPayment]);

  // Check if user should see onboarding
  useEffect(() => {
    const hasVisited = localStorage.getItem('pourPayoffPlannerVisited');
    if (!hasVisited && !hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, [hasSeenOnboarding]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setHasSeenOnboarding(true);
    localStorage.setItem('pourPayoffPlannerVisited', 'true');
    toast({
      title: "Welcome to your journey!",
      description: "Let's start by adding your debts and creating your payoff plan.",
    });
  };

  const startOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-brand-green/5">
      <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-6 md:space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 md:space-y-6 py-6 md:py-12">
          <div className="animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-4">
              The Pour & Payoff Planner™
            </h1>
            <p className="text-lg md:text-xl text-brand-gray max-w-3xl mx-auto leading-relaxed px-4">
              "Use what's in your house to cancel what you owe and create what you need."
            </p>
            <p className="text-base md:text-lg text-brand-gray/80 max-w-2xl mx-auto mt-2 px-4">
              Walk out the same faith-filled, strategic process God gave the widow: a path from lack to legacy.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
            <Button 
              onClick={startOnboarding}
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold touch-target w-full sm:w-auto"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Take the Guided Tour
            </Button>
            <Button 
              variant="outline" 
              onClick={startOnboarding}
              className="touch-target w-full sm:w-auto"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Learn the 6-Step Process
            </Button>
          </div>
        </div>

        {/* Progress Dashboard */}
        <ProgressDashboard 
          currentStep={currentStep}
          completedSteps={completedSteps}
          debtsEntered={debts.length}
          calculationsDone={!!calculationResults}
        />

      {/* Biblical Verse */}
      <BiblicalVerse className="animate-fade-in" />

      {/* Widow's Wealth Cycle Framework */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-center">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              The Widow's Wealth Cycle™
            </span>
            <p className="text-lg text-brand-gray mt-2">A 6-Step Kingdom Framework for Debt Elimination and Overflow</p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">1</div>
                <h3 className="font-semibold text-brand-charcoal">INVENTORY</h3>
              </div>
              <p className="text-sm text-brand-gray"><strong>What's In Your House?</strong></p>
              <p className="text-sm text-brand-gray">Identify your current income, assets, skills, and untapped potential.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">2</div>
                <h3 className="font-semibold text-brand-charcoal">INSTRUCTION</h3>
              </div>
              <p className="text-sm text-brand-gray"><strong>Borrow With Purpose</strong></p>
              <p className="text-sm text-brand-gray">Strategic, temporary borrowing—only for production, not consumption.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">3</div>
                <h3 className="font-semibold text-brand-charcoal">IMPLEMENTATION</h3>
              </div>
              <p className="text-sm text-brand-gray"><strong>Shut the Door and Pour</strong></p>
              <p className="text-sm text-brand-gray">Execution season—use what's in your hand and focus without distractions.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">4</div>
                <h3 className="font-semibold text-brand-charcoal">INCREASE</h3>
              </div>
              <p className="text-sm text-brand-gray"><strong>Let It Flow Until It Stops</strong></p>
              <p className="text-sm text-brand-gray">Track your output and multiply what's working.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">5</div>
                <h3 className="font-semibold text-brand-charcoal">INCOME</h3>
              </div>
              <p className="text-sm text-brand-gray"><strong>Sell the Oil</strong></p>
              <p className="text-sm text-brand-gray">Time to monetize—use your revenue to create margin.</p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">6</div>
                <h3 className="font-semibold text-brand-charcoal">IMPACT</h3>
              </div>
              <p className="text-sm text-brand-gray"><strong>Pay Off & Live on the Rest</strong></p>
              <p className="text-sm text-brand-gray">Pay off all debts and establish your overflow strategy.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debt Entries */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-financial-debt" />
            Your Debts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {debts.map((debt, index) => (
            <DebtEntry
              key={debt.id}
              debt={debt}
              onUpdate={updateDebt}
              onRemove={removeDebt}
              isFirst={index === 0}
            />
          ))}
          
          <Button
            onClick={addDebt}
            variant="outline"
            className="w-full border-dashed border-2 hover:bg-primary/5 touch-target"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Debt
          </Button>
        </CardContent>
      </Card>

      {/* Extra Payment Input */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle>Extra Monthly Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="extra-payment">Additional amount to apply monthly</Label>
              <Input
                id="extra-payment"
                type="number"
                value={extraPayment || ''}
                onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
                placeholder="200"
                className="mt-1 text-lg"
              />
            </div>
            <Button
              onClick={calculateStrategies}
              className="bg-gradient-primary hover:opacity-90 touch-target w-full md:w-auto"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Payoff Strategies
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Debt Progress Overview */}
      <DebtProgress debts={debts} />

      {/* Results */}
      {calculationResults && (
        <div className="space-y-6 animate-fade-in">
          <PayoffComparison 
            snowball={calculationResults.snowball}
            avalanche={calculationResults.avalanche}
          />
          
          {/* Enhanced Call to Action */}
          <Card className="bg-gradient-hero shadow-glow text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-brand-green/10 backdrop-blur-sm"></div>
            <CardContent className="relative p-8 md:p-12">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Transform Your Financial Future?
                </h3>
                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  Get personalized coaching and support from our certified financial educators at Legacy Mindset Solutions. 
                  Let's build a legacy that reflects biblical wisdom and transforms lives.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-brand-green hover:bg-white/90 font-semibold px-6 md:px-8 py-3 touch-target"
                    onClick={() => window.open('https://legacymindsetsolutions.com/contact', '_blank')}
                  >
                    Schedule Free Consultation
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 font-semibold px-6 md:px-8 py-3 touch-target"
                    onClick={() => window.open('https://legacymindsetsolutions.com', '_blank')}
                  >
                    Learn More About Us
                  </Button>
                </div>
                <p className="text-white/80 text-sm mt-6">
                  Over 20 years of experience • Biblical principles • Proven results
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Onboarding Wizard */}
      <OnboardingWizard 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleOnboardingComplete}
      />
      </div>
    </div>
  );
};