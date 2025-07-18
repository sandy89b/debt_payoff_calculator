import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent,
  Zap,
  AlertTriangle,
  Gift
} from 'lucide-react';
import { calculatePayoffStrategies } from './debt-calculator/PayoffCalculator';
import { Debt } from './debt-calculator/DebtEntry';

interface WhatIfScenariosProps {
  debts: Debt[];
  baseExtraPayment: number;
  onScenarioSelect?: (extraPayment: number) => void;
}

interface ScenarioResult {
  name: string;
  extraPayment: number;
  snowball: any;
  avalanche: any;
  monthsSaved: number;
  interestSaved: number;
}

export const WhatIfScenarios: React.FC<WhatIfScenariosProps> = ({
  debts,
  baseExtraPayment,
  onScenarioSelect
}) => {
  const [bonusAmount, setBonusAmount] = useState(1000);
  const [incomeChange, setIncomeChange] = useState(0);
  const [rateChange, setRateChange] = useState([0]);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [baselineResult, setBaselineResult] = useState<any>(null);

  // Calculate baseline for comparison
  useEffect(() => {
    if (debts.length > 0) {
      const validDebts = debts.filter(debt => 
        debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
      );
      
      if (validDebts.length > 0) {
        const baseline = calculatePayoffStrategies(validDebts, baseExtraPayment);
        setBaselineResult(baseline);
      }
    }
  }, [debts, baseExtraPayment]);

  // Calculate various scenarios
  useEffect(() => {
    if (!baselineResult || debts.length === 0) return;

    const validDebts = debts.filter(debt => 
      debt.balance > 0 && debt.minPayment > 0 && debt.interestRate >= 0
    );

    if (validDebts.length === 0) return;

    const newScenarios: ScenarioResult[] = [];

    // Scenario 1: One-time bonus payment
    const bonusExtraPayment = baseExtraPayment + (bonusAmount / 12); // Spread over 12 months
    const bonusResult = calculatePayoffStrategies(validDebts, bonusExtraPayment);
    newScenarios.push({
      name: `$${bonusAmount.toLocaleString()} Bonus`,
      extraPayment: bonusExtraPayment,
      snowball: bonusResult.snowball,
      avalanche: bonusResult.avalanche,
      monthsSaved: Math.max(0, baselineResult.snowball.totalMonths - bonusResult.snowball.totalMonths),
      interestSaved: Math.max(0, baselineResult.snowball.totalInterest - bonusResult.snowball.totalInterest)
    });

    // Scenario 2: Income increase/decrease
    const incomeExtraPayment = Math.max(0, baseExtraPayment + incomeChange);
    const incomeResult = calculatePayoffStrategies(validDebts, incomeExtraPayment);
    newScenarios.push({
      name: incomeChange >= 0 ? `+$${incomeChange}/month` : `${incomeChange}/month`,
      extraPayment: incomeExtraPayment,
      snowball: incomeResult.snowball,
      avalanche: incomeResult.avalanche,
      monthsSaved: baselineResult.snowball.totalMonths - incomeResult.snowball.totalMonths,
      interestSaved: baselineResult.snowball.totalInterest - incomeResult.snowball.totalInterest
    });

    // Scenario 3: Double extra payment
    const doubleResult = calculatePayoffStrategies(validDebts, baseExtraPayment * 2);
    newScenarios.push({
      name: 'Double Payment',
      extraPayment: baseExtraPayment * 2,
      snowball: doubleResult.snowball,
      avalanche: doubleResult.avalanche,
      monthsSaved: Math.max(0, baselineResult.snowball.totalMonths - doubleResult.snowball.totalMonths),
      interestSaved: Math.max(0, baselineResult.snowball.totalInterest - doubleResult.snowball.totalInterest)
    });

    // Scenario 4: Interest rate change simulation
    const rateModifiedDebts = validDebts.map(debt => ({
      ...debt,
      interestRate: Math.max(0, debt.interestRate + rateChange[0])
    }));
    const rateResult = calculatePayoffStrategies(rateModifiedDebts, baseExtraPayment);
    newScenarios.push({
      name: rateChange[0] >= 0 ? `+${rateChange[0]}% Interest` : `${rateChange[0]}% Interest`,
      extraPayment: baseExtraPayment,
      snowball: rateResult.snowball,
      avalanche: rateResult.avalanche,
      monthsSaved: baselineResult.snowball.totalMonths - rateResult.snowball.totalMonths,
      interestSaved: baselineResult.snowball.totalInterest - rateResult.snowball.totalInterest
    });

    setScenarios(newScenarios);
  }, [debts, baseExtraPayment, bonusAmount, incomeChange, rateChange, baselineResult]);

  if (!baselineResult) {
    return (
      <Card className="bg-gradient-card shadow-card">
        <CardContent className="p-6 text-center">
          <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Add valid debt information to see what-if scenarios</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          What-If Scenarios
        </CardTitle>
        <p className="text-muted-foreground">
          Explore how different financial changes could impact your debt payoff journey
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="scenarios" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scenarios">Quick Scenarios</TabsTrigger>
            <TabsTrigger value="custom">Custom Calculator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid gap-4">
              {scenarios.map((scenario, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {scenario.name.includes('Bonus') && <Gift className="h-4 w-4 text-green-500" />}
                      {scenario.name.includes('+$') && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {scenario.name.includes('Double') && <DollarSign className="h-4 w-4 text-blue-500" />}
                      {scenario.name.includes('Interest') && <Percent className="h-4 w-4 text-orange-500" />}
                      {scenario.name.includes('-$') && <TrendingDown className="h-4 w-4 text-red-500" />}
                      
                      <h4 className="font-semibold">{scenario.name}</h4>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onScenarioSelect?.(scenario.extraPayment)}
                    >
                      Apply This
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Time Saved</p>
                      <p className="font-semibold text-green-600">
                        {scenario.monthsSaved > 0 
                          ? `${scenario.monthsSaved} months`
                          : scenario.monthsSaved < 0 
                          ? `+${Math.abs(scenario.monthsSaved)} months`
                          : 'No change'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Saved</p>
                      <p className="font-semibold text-green-600">
                        ${Math.abs(scenario.interestSaved).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Time</p>
                      <p className="font-medium">
                        {Math.round(scenario.snowball.totalMonths)} months
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Interest</p>
                      <p className="font-medium">
                        ${scenario.snowball.totalInterest.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bonus Payment Calculator */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-500" />
                  <Label className="text-base font-semibold">One-Time Bonus</Label>
                </div>
                <div>
                  <Label htmlFor="bonus">Bonus Amount</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={bonusAmount}
                    onChange={(e) => setBonusAmount(parseFloat(e.target.value) || 0)}
                    placeholder="1000"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied as extra payment over 12 months
                  </p>
                </div>
              </div>

              {/* Income Change Calculator */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <Label className="text-base font-semibold">Monthly Income Change</Label>
                </div>
                <div>
                  <Label htmlFor="income">Monthly Change</Label>
                  <Input
                    id="income"
                    type="number"
                    value={incomeChange}
                    onChange={(e) => setIncomeChange(parseFloat(e.target.value) || 0)}
                    placeholder="500"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Positive for raise, negative for income loss
                  </p>
                </div>
              </div>

              {/* Interest Rate Change */}
              <div className="space-y-4 md:col-span-2">
                <div className="flex items-center gap-2">
                  <Percent className="h-5 w-5 text-orange-500" />
                  <Label className="text-base font-semibold">Interest Rate Change</Label>
                </div>
                <div>
                  <Label>Rate Change: {rateChange[0] > 0 ? '+' : ''}{rateChange[0]}%</Label>
                  <Slider
                    value={rateChange}
                    onValueChange={setRateChange}
                    max={10}
                    min={-10}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>-10% (Rate Decrease)</span>
                    <span>+10% (Rate Increase)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Baseline */}
            <div className="p-4 rounded-lg bg-muted/50 border-2 border-dashed">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-4 w-4" />
                <h4 className="font-semibold">Current Plan (Baseline)</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Time to Freedom</p>
                  <p className="font-semibold">{Math.round(baselineResult.snowball.totalMonths)} months</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Interest</p>
                  <p className="font-semibold">${baselineResult.snowball.totalInterest.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Extra Payment</p>
                  <p className="font-semibold">${baseExtraPayment.toLocaleString()}/month</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};