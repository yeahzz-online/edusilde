import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyOTP = lazy(() => import('./pages/auth/VerifyOTP'));

// Dashboards
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const SmartboardInterface = lazy(() => import('./pages/smartboard/Interface'));

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                <p className="font-heading font-semibold animate-pulse">Loading EduSlide Pro...</p>
              </div>
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />

              {/* Student Routes */}
              <Route path="/student/*" element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<StudentDashboard />} />
                      {/* More student routes here */}
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Faculty Routes */}
              <Route path="/faculty/*" element={
                <ProtectedRoute allowedRoles={['FACULTY']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<FacultyDashboard />} />
                      {/* More faculty routes here */}
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      {/* More admin routes here */}
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Smartboard Interface */}
              <Route path="/smartboard" element={
                <ProtectedRoute allowedRoles={['SMARTBOARD']}>
                  <SmartboardInterface />
                </ProtectedRoute>
              } />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
