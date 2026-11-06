import { useEffect, type PropsWithChildren } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuthStore } from "../features/auth/store";
import { CreatePage } from "../pages/create-page";
import { HistoryDetailPage } from "../pages/history-detail-page";
import { HistoryPage } from "../pages/history-page";
import { LoginPage } from "../pages/login-page";
import { NotFoundPage } from "../pages/not-found-page";
import { RegisterPage } from "../pages/register-page";
import { setUnauthorizedHandler } from "../shared/api/client";
import { saveReturnTo } from "../shared/api/token-store";
import { Providers } from "./providers";

function ProtectedRoute({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    saveReturnTo(`${location.pathname}${location.search}`);
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }: PropsWithChildren) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Navigate to="/create" replace /> : children;
}

function AuthExpiryBridge() {
  const navigate = useNavigate();
  const location = useLocation();
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      saveReturnTo(`${location.pathname}${location.search}`);
      clearSession();
      navigate("/login", { replace: true });
    });
  }, [clearSession, location.pathname, location.search, navigate]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AuthExpiryBridge />
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history/:id"
            element={
              <ProtectedRoute>
                <HistoryDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Providers>
    </BrowserRouter>
  );
}
