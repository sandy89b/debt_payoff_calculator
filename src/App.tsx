import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UserGuidePage from "./pages/UserGuide";
import Signin from "./pages/auth/Signin";
import Signup from "./pages/auth/Signup";
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
            <AuthProvider>
              <ConditionalLayout>
                <Routes>
                  {/* Public Routes - No Authentication Required */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth/signin" element={<Signin />} />
                  <Route path="/auth/signup" element={<Signup />} />
                  
                  {/* Protected Routes - Require Authentication */}
                  <Route path="/calculator" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/user-guide" element={<ProtectedRoute><UserGuidePage /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute><PaymentCalendar debts={debts} /></ProtectedRoute>} />
                  <Route path="/calendar/goals" element={<ProtectedRoute><GoalPlanning debts={debts} /></ProtectedRoute>} />
                  <Route path="/calendar/reminders" element={<ProtectedRoute><Reminders debts={debts} /></ProtectedRoute>} />
                  <Route path="/calendar/export" element={<ProtectedRoute><Export debts={debts} /></ProtectedRoute>} />
                  <Route path="/framework" element={<ProtectedRoute><InteractiveFramework /></ProtectedRoute>} />
                  <Route path="/devotionals" element={<ProtectedRoute><DailyDevotionals /></ProtectedRoute>} />
                  <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                  <Route path="/accountability" element={<ProtectedRoute><Accountability /></ProtectedRoute>} />
                  <Route path="/prayers" element={<ProtectedRoute><PrayerIntegration /></ProtectedRoute>} />
                  <Route path="/income-optimization" element={<ProtectedRoute><IncomeOptimization /></ProtectedRoute>} />
                  <Route path="/emergency-fund-calculator" element={<ProtectedRoute><EmergencyFundCalculator /></ProtectedRoute>} />
                  <Route path="/giving-stewardship-tracker" element={<ProtectedRoute><GivingStewardshipTracker /></ProtectedRoute>} />
                  <Route path="/legacy-planning" element={<ProtectedRoute><LegacyPlanning /></ProtectedRoute>} />
                  <Route path="/coaching" element={<ProtectedRoute><CoachingIntegration /></ProtectedRoute>} />
                  <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
                </Routes>
              </ConditionalLayout>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
