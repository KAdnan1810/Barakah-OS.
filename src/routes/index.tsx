import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@components/layout/AppShell";
import { LoginPage } from "@features/auth/components/LoginPage";
import { SignupPage } from "@features/auth/components/SignupPage";
import { DashboardPage } from "@features/dashboard/pages/DashboardPage";
import { ExpensesPage } from "@features/expenses/pages/ExpensesPage";
import { IncomePage } from "@features/income/pages/IncomePage";
import { BudgetPage } from "@features/budget/pages/BudgetPage";
import { AccountsPage } from "@features/accounts/pages/AccountsPage";
import { GoalsPage } from "@features/goals/pages/GoalsPage";
import { EmergencyFundPage } from "@features/emergency-fund/pages/EmergencyFundPage";
import { BusinessFundPage } from "@features/business-fund/pages/BusinessFundPage";
import { InvestmentsPage } from "@features/investments/pages/InvestmentsPage";
import { LoansPage } from "@features/loans/pages/LoansPage";
import { IslamicFinancePage } from "@features/islamic-finance/pages/IslamicFinancePage";
import { NetWorthPage } from "@features/net-worth/pages/NetWorthPage";
import { AnalyticsPage } from "@features/analytics/pages/AnalyticsPage";
import { AIAssistantPage } from "@features/ai-assistant/pages/AIAssistantPage";
import { SettingsPage } from "@features/settings/pages/SettingsPage";
import { ProfilePage } from "@features/profile/pages/ProfilePage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "expenses", element: <ExpensesPage /> },
      { path: "income", element: <IncomePage /> },
      { path: "budget", element: <BudgetPage /> },
      { path: "accounts", element: <AccountsPage /> },
      { path: "goals", element: <GoalsPage /> },
      { path: "emergency-fund", element: <EmergencyFundPage /> },
      { path: "business-fund", element: <BusinessFundPage /> },
      { path: "investments", element: <InvestmentsPage /> },
      { path: "loans", element: <LoansPage /> },
      { path: "islamic-finance", element: <IslamicFinancePage /> },
      { path: "net-worth", element: <NetWorthPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "ai-assistant", element: <AIAssistantPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
