import React from "react";
import ReactDOM from "react-dom/client";
import App, { DashboardHome, AnalyticsRoute, UnderConstruction } from "./App";
import CalendarPage from "@/pages/calendar/CalendarPage.tsx";
import { ClientsPage } from "./pages/clients/ClientsPage.tsx";
import { ThemeProvider } from "@/contexts/ThemeContext.tsx";
import { ProvidersRoute } from "./routers/ProvidersRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import PublicRouter, { RootRedirect } from "./routers/PublicRouter";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<ProvidersRoute />}>
      <Route element={<PublicRouter />}>
        <Route index element={<RootRedirect />} />
        <Route path="app" element={<App />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="analytics" element={<AnalyticsRoute />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route
            path="settings"
            element={<UnderConstruction section="settings" />}
          />
        </Route>
        <Route path="login" element={<LoginPage />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
