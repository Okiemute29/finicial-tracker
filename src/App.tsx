import { createBrowserRouter, createRoutesFromElements, Navigate, Route, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import routes from "./constants/routes";
import PrivateRoute from "./routeguard/privateroute";
import RootLayout from "./pages/layout/Root.layout";
import LoginPage from "./pages/auth/login";
import DashboardPage from "./pages/wealth/dashboard";
import BudgetPage from "./pages/wealth/budget";
import GoalsPage from "./pages/wealth/goals";
import TransactionsPage from "./pages/wealth/transactions";
import NetWorthPage from "./pages/wealth/net-worth";
import MonthlyReviewsPage from "./pages/wealth/monthly-reviews";
import WealthSettingsPage from "./pages/wealth/settings";
import ErrorPage from "./pages/errorpage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path={routes.landing} element={<Navigate to={routes.dashboard} replace />} />
      <Route path={routes.signin} element={<LoginPage />} />
      <Route element={<PrivateRoute />}>
        <Route element={<RootLayout />}>
          <Route path={routes.dashboard} element={<DashboardPage />} />
          <Route path={routes.budget} element={<BudgetPage />} />
          <Route path={routes.goals} element={<GoalsPage />} />
          <Route path={routes.transactions} element={<TransactionsPage />} />
          <Route path={routes.netWorth} element={<NetWorthPage />} />
          <Route path={routes.monthlyReviews} element={<MonthlyReviewsPage />} />
          <Route path={routes.settings} element={<WealthSettingsPage />} />
        </Route>
      </Route>
      <Route path={routes.errorpage} element={<ErrorPage />} />
    </>,
  ),
);

export default function App() {
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />
    </>
  );
}
