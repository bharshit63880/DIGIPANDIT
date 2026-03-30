import { Suspense, useEffect } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";
import { appRoutes } from "./app/routes";
import { LoadingScreen } from "./components/LoadingScreen";
import { PanditJiChatWidget } from "./components/PanditJiChatWidget";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, logout } from "./features/auth/authSlice";

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const location = useLocation();
  const element = useRoutes(appRoutes);

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
    <>
      <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
      <PanditJiChatWidget />
    </>
  );
}
