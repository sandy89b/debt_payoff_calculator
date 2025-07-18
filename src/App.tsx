import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PaymentCalendar } from "@/components/calendar/payment-calendar";
import { GoalPlanning } from "@/components/calendar/goal-planning";
import { Reminders } from "@/components/calendar/reminders";
import { Export } from "@/components/calendar/export";
import { InteractiveFramework } from "@/components/interactive-framework";
import { DailyDevotionals } from "@/components/daily-devotionals";
import { Achievements } from "@/components/achievements";
import { Accountability } from "@/components/accountability";
import { PrayerIntegration } from "@/components/prayer-integration";
import { IncomeOptimization } from "@/components/income-optimization";
import { EmergencyFundCalculator } from "@/components/emergency-fund-calculator";
import { GivingStewardshipTracker } from "@/components/giving-stewardship-tracker";
import { LegacyPlanning } from "@/components/legacy-planning";
import { CoachingIntegration } from "@/components/coaching-integration";
import { useDebtsStorage } from "@/hooks/useDebtsStorage";

const queryClient = new QueryClient();

const App = () => {
  const { debts } = useDebtsStorage();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <div className="flex-1">
                  <header className="h-12 flex items-center border-b px-4">
                    <SidebarTrigger />
                  </header>
                  <main className="p-6">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/calculator" element={<Index />} />
                      <Route path="/calendar" element={<PaymentCalendar debts={debts} />} />
                      <Route path="/calendar/goals" element={<GoalPlanning debts={debts} />} />
                      <Route path="/calendar/reminders" element={<Reminders debts={debts} />} />
                      <Route path="/calendar/export" element={<Export debts={debts} />} />
                      <Route path="/framework" element={<InteractiveFramework />} />
                      <Route path="/devotionals" element={<DailyDevotionals />} />
                      <Route path="/achievements" element={<Achievements />} />
                      <Route path="/accountability" element={<Accountability />} />
                      <Route path="/prayers" element={<PrayerIntegration />} />
                      <Route path="/income-optimization" element={<IncomeOptimization />} />
                      <Route path="/emergency-fund-calculator" element={<EmergencyFundCalculator />} />
                      <Route path="/giving-stewardship-tracker" element={<GivingStewardshipTracker />} />
                      <Route path="/legacy-planning" element={<LegacyPlanning />} />
                      <Route path="/coaching" element={<CoachingIntegration />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </SidebarProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
