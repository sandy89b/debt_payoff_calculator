import { DebtCalculator } from '@/components/debt-calculator/DebtCalculator';
import { Header } from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DebtCalculator />
    </div>
  );
};

export default Index;
