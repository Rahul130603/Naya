import { lazy, Suspense, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './components/ui/Toast';
import { AuthLayout } from './layouts/AuthLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PageLoader } from './components/ui/States';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/portal.css';
import './styles/website-theme.css';

const Login = lazy(() => import('./pages/auth/Login'));
const DoctorLogin = lazy(() => import('./pages/auth/DoctorLogin'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const Register = lazy(() => import('./pages/auth/Register'));
const DoctorRegister = lazy(() => import('./pages/auth/DoctorRegister'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const PatientDashboard = lazy(() => import('./pages/dashboard/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/dashboard/DoctorDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const Booking = lazy(() => import('./pages/Booking'));
const CompletePayment = lazy(() => import('./pages/CompletePayment'));
const ConsultationRoom = lazy(() => import('./pages/ConsultationRoom'));
const AI = lazy(() => import('./pages/AI'));
const Doctors = lazy(() => import('./pages/Doctors'));
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const Legal = lazy(() => import('./pages/Legal'));

function PortalRoutes() {
  const { user } = useAuth();
  // Each account gets its own cache, including when switching demo roles.
  const queryClient = useMemo(() => new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 } } }), [user?.id]);
  return (
    <div className="naya-portal fixed inset-0 flex flex-col overflow-hidden bg-slate-50" id="naya-portal">
      <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/doctor/login" element={<DoctorLogin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/doctor/register" element={<DoctorRegister />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                </Route>
                <Route path="/dashboard" element={<ProtectedRoute role="PATIENT"><PatientDashboard /></ProtectedRoute>} />
                <Route path="/doctor" element={<ProtectedRoute role="DOCTOR"><DoctorDashboard /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/book" element={<Booking />} />
                <Route path="/payment/:id" element={<CompletePayment />} />
                <Route path="/consult/:id" element={<ConsultationRoom />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/doctors/:slug" element={<DoctorProfile />} />
                <Route path="/legal/:slug" element={<Legal />} />
                <Route path="/ai" element={<AI />} />
              </Routes>
            </Suspense>
          </ToastProvider>
      </QueryClientProvider>
    </div>
  );
}

export default function PortalApp() {
  return (
    <AuthProvider>
      <PortalRoutes />
    </AuthProvider>
  );
}
