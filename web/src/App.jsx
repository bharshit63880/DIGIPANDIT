import { Suspense, useEffect } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { appRoutes } from "./app/routes";
import { LoadingScreen } from "./components/LoadingScreen";
import { PanditJiChatWidget } from "./components/PanditJiChatWidget";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, logout } from "./features/auth/authSlice";
import { HindiInterface } from "./components/HindiInterface";
import { GoldenCursor } from "./components/GoldenCursor";

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const location = useLocation();
  const element = useRoutes(appRoutes);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  useEffect(() => {
    const handleAuthExpired = () => {
      dispatch(logout());
      navigate("/login", {
        replace: true,
        state: {
          from: location.pathname,
          reason: "expired",
        },
      });
    };

    window.addEventListener("digipandit:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("digipandit:auth-expired", handleAuthExpired);
  }, [dispatch, location.pathname, navigate]);

  return (
    <AppErrorBoundary>
      <HindiInterface />
      <GoldenCursor />
      <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
      <PanditJiChatWidget />
    </AppErrorBoundary>
  );
}
