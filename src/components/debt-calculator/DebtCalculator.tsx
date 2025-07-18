import React, { useState, useEffect } from 'react';
import { Plus, Calculator, DollarSign } from 'lucide-react';
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Debt Payoff Calculator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find your path to financial freedom through biblical wisdom and strategic debt elimination
        </p>
      </div>

      {/* Biblical Verse */}
      <BiblicalVerse className="animate-fade-in" />

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
            className="w-full border-dashed border-2 hover:bg-primary/5"
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
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="extra-payment">Additional amount to apply monthly</Label>
              <Input
                id="extra-payment"
                type="number"
                value={extraPayment || ''}
                onChange={(e) => setExtraPayment(parseFloat(e.target.value) || 0)}
                placeholder="200"
                className="mt-1"
              />
            </div>
            <Button
              onClick={calculateStrategies}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate
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
          
          {/* Call to Action */}
          <Card className="bg-gradient-primary shadow-glow text-center">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-primary-foreground mb-4">
                Ready to Start Your Journey to Financial Freedom?
              </h3>
              <p className="text-primary-foreground/90 mb-6">
                Get personalized coaching and support from Legacy Mindset Solutions
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-financial-wisdom hover:bg-financial-wisdom/90 text-foreground"
              >
                Schedule Free Consultation
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};