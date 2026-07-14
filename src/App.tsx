import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";
import Contracts from "./pages/Contracts";
import Installments from "./pages/Installments";
import Settings from "./pages/Settings";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import InventoryDashboard from "./pages/InventoryDashboard";
import Expenses from "./pages/Expenses";
import ExpenseReports from "./pages/ExpenseReports";
import Users from "./pages/Users";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Calculator from "./pages/Calculator";
import CollectionReports from "./pages/CollectionReports";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Index />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute requiredPermission="view_customers">
            <ErrorBoundary><Customers /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <ProtectedRoute requiredPermission="view_customers">
            <ErrorBoundary><CustomerProfile /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts"
        element={
          <ProtectedRoute requiredPermission="view_contracts">
            <ErrorBoundary><Contracts /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/installments"
        element={
          <ProtectedRoute requiredPermission="view_installments">
            <ErrorBoundary><Installments /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collection-reports"
        element={
          <ProtectedRoute requiredPermission="view_installments">
            <ErrorBoundary><CollectionReports /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute requiredPermission="view_settings">
            <ErrorBoundary><Settings /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute requiredPermission="view_products">
            <ErrorBoundary><Products /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute requiredPermission="view_inventory">
            <ErrorBoundary><Inventory /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory-dashboard"
        element={
          <ProtectedRoute requiredPermission="view_inventory">
            <ErrorBoundary><InventoryDashboard /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute requiredPermission="view_expenses">
            <ErrorBoundary><Expenses /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expense-reports"
        element={
          <ProtectedRoute requiredPermission="view_expense_reports">
            <ErrorBoundary><ExpenseReports /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredPermission="view_users">
            <ErrorBoundary><Users /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ErrorBoundary><Profile /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calculator"
        element={
          <ProtectedRoute>
            <ErrorBoundary><Calculator /></ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AppRoutes />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;