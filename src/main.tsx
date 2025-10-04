import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@/contexts/ThemeContext.tsx";
import { ProvidersRoute } from "./routers/ProvidersRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import PublicRouter from "./routers/PublicRouter";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<ProvidersRoute />}>
      <Route path="/" element={<PublicRouter />}>
        <Route path="app" element={<App />} />
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
