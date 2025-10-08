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
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import PublicRouter, { RootRedirect } from "./routers/PublicRouter";
import { ordersRoutes } from "@/features/orders";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProvidersRoute />,
    children: [
      {
        element: <PublicRouter />,
        children: [
          { index: true, element: <RootRedirect /> },
          {
            path: "app",
            element: <App />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <DashboardHome /> },
              { path: "analytics", element: <AnalyticsRoute /> },
              { path: "calendar", element: <CalendarPage /> },
              { path: "clients", element: <ClientsPage /> },
              {
                path: "settings",
                element: <UnderConstruction section="settings" />,
              },
              ordersRoutes, // orders feature
            ],
          },
          { path: "login", element: <LoginPage /> },
        ],
      },
    ],
  },
]);

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
