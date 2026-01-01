import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../domains/auth';
import { ProtectedRoute } from '../domains/auth/components/protected-route';
import { AdminLayout } from '../shared/components/layout';
import { DashboardPage } from '../domains/dashboard';
import { PropertyListPage, PropertyFormPage } from '../domains/property';
import { RoomListPage, RoomFormPage } from '../domains/room';
import { BookingListPage, BookingFormPage, BookingDetailPage } from '../domains/booking';
import { AccessCodeListPage } from '../domains/access-code';
import { LoginPage } from '../domains/auth/pages/login-page';
import { RegisterPage } from '../domains/auth/pages/register-page';
import { LandingPage, PublicBookingPage, CheckinPage } from '../pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});


function SettingsPage() {
  return <div className="p-6"><h1 className="text-2xl font-bold">ตั้งค่า</h1><p className="text-muted-foreground">Coming soon...</p></div>;
}

function AdminRoutes() {
  const { user, logout } = useAuth();

  return (
    <Routes>
      <Route
        element={
          <AdminLayout
            user={user ? { displayName: user.displayName, email: user.email, photoURL: user.photoURL } : undefined}
            onLogout={logout}
          />
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="properties" element={<PropertyListPage />} />
        <Route path="properties/new" element={<PropertyFormPage />} />
        <Route path="properties/:id/edit" element={<PropertyFormPage />} />
        <Route path="rooms" element={<RoomListPage />} />
        <Route path="rooms/new" element={<RoomFormPage />} />
        <Route path="rooms/:id/edit" element={<RoomFormPage />} />
        <Route path="bookings" element={<BookingListPage />} />
        <Route path="bookings/new" element={<BookingFormPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="access-codes" element={<AccessCodeListPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public booking */}
      <Route path="/book/:propertySlug" element={<PublicBookingPage />} />
      {/* Check-in with code */}
      <Route path="/checkin" element={<CheckinPage />} />
      <Route path="/checkin/:code" element={<CheckinPage />} />

      {/* Protected admin routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
