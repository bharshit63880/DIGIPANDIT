import { lazy } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import AppShell from "../layouts/AppShell";
import DashboardLayout from "../layouts/DashboardLayout";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPasswordPage"));
const AstrologyPage = lazy(() => import("../pages/AstrologyPage"));
const PanditsPage = lazy(() => import("../pages/PanditsPage"));
const PanditDetailPage = lazy(() => import("../pages/PanditDetailPage"));
const HawanPage = lazy(() => import("../pages/HawanPage"));
const StorePage = lazy(() => import("../pages/StorePage"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage"));
const CartPage = lazy(() => import("../pages/CartPage"));
const PaymentStatusPage = lazy(() => import("../pages/PaymentStatusPage"));
const UserDashboardPage = lazy(() => import("../pages/UserDashboardPage"));
const UserBookingsPage = lazy(() => import("../pages/UserBookingsPage"));
const UserProfilePage = lazy(() => import("../pages/UserProfilePage"));
const ChatPage = lazy(() => import("../pages/ChatPage"));
const VideoCallPage = lazy(() => import("../pages/VideoCallPage"));
const PanditDashboardPage = lazy(() => import("../pages/PanditDashboardPage"));
const AdminDashboardPage = lazy(() => import("../pages/AdminDashboardPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

export const appRoutes = [
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/verify-email", element: <VerifyEmailPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/astrology", element: <AstrologyPage /> },
      { path: "/pandits", element: <PanditsPage /> },
      { path: "/pandits/:panditId", element: <PanditDetailPage /> },
      { path: "/kundali", element: <Navigate to="/astrology" replace /> },
      { path: "/hawan-guide", element: <HawanPage /> },
      { path: "/store", element: <StorePage /> },
      { path: "/store/:slug", element: <ProductDetailPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/payment-status", element: <PaymentStatusPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute roles={["USER", "PANDIT", "ADMIN"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute roles={["USER"]}>
            <UserDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/bookings",
        element: (
          <ProtectedRoute roles={["USER"]}>
            <UserBookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/profile",
        element: (
          <ProtectedRoute roles={["USER"]}>
            <UserProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/chat",
        element: (
          <ProtectedRoute roles={["USER", "PANDIT"]}>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/video-call/:bookingId",
        element: (
          <ProtectedRoute roles={["USER", "PANDIT", "ADMIN"]}>
            <VideoCallPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/pandit-dashboard",
        element: (
          <ProtectedRoute roles={["PANDIT"]}>
            <PanditDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
