import { useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { ScrollToTop } from "@/components/ui";
import { useAuthStore } from "@/store";
import { useTheme } from "@/hooks";
import api from "@/config/api";

import { Home, About, Contact, Terms, Privacy, ApiDocs } from "@/pages/public";
import { Login, Signup, ForgotPassword, VerifyOtp, ResetPassword } from "@/pages/auth";
import { Dashboard, Monitors, MonitorDetail, CreateMonitor, Profile } from "@/pages/main";
import AdminUsers from "@/pages/main/admin/Users";
import AdminMonitors from "@/pages/main/admin/AdminMonitors";
import AdminMonitorDetail from "@/pages/main/admin/AdminMonitorDetail";
import Messages from "@/pages/main/admin/Messages";
import AdminDashboard from "@/pages/main/admin/AdminDashboard";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.is_admin && !user?.is_superadmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      toast.info("Already logged in. Redirecting...");
      navigate("/dashboard", { replace: true });
    }
  }, [token]);
  if (token) return null;
  return <>{children}</>;
}

export default function App() {
  useTheme();
  const { token, setUser, logout } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    api.get("/auth/me")
      .then(r => setUser(r.data))
      .catch(err => {
        if (err?.response?.status === 401 || err?.response?.status === 403) logout();
      });
  }, [token]);

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" richColors expand={false} />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/docs" element={<ApiDocs />} />

        {/* Auth routes (redirect to dashboard if already logged in) */}
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/verify" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected app routes */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/monitors" element={<PrivateRoute><Monitors /></PrivateRoute>} />
        <Route path="/monitors/new" element={<PrivateRoute><CreateMonitor /></PrivateRoute>} />
        <Route path="/monitors/:id" element={<PrivateRoute><MonitorDetail /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/monitors" element={<AdminRoute><AdminMonitors /></AdminRoute>} />
        <Route path="/admin/monitors/:id" element={<AdminRoute><AdminMonitorDetail /></AdminRoute>} />
        <Route path="/admin/messages" element={<AdminRoute><Messages /></AdminRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
