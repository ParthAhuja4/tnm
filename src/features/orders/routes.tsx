import { Navigate, type RouteObject } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrdersListPage from "./pages/OrdersListPage";
import FarmersPage from "./pages/FarmersPage";

export const ordersRoutes: RouteObject = {
  path: "orders",
  element: <AppLayout />,
  children: [
    { index: true, element: <OrdersListPage /> },
    { path: "dashboard", element: <DashboardPage /> },
    { path: "farmers", element: <FarmersPage /> }, // new
    { path: ":orderId", element: <OrderDetailsPage /> },
    { path: "*", element: <Navigate to="." replace /> },
  ],
};
