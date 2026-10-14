import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { LoginPage, SignUpPage } from '@/pages/Auth';

// Pages
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Chat from '@/pages/Chat';
import Reports from '@/pages/Reports';
import Timeline from '@/pages/Timeline';
import Symptoms from '@/pages/Symptoms';
import Nutrition from '@/pages/Nutrition';
import FoodTracker from '@/pages/FoodTracker';
import Reminders from '@/pages/Reminders';

function RequireAuth() {
  const { isAuthenticated } = useApp();
  const location = useLocation();

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/"              element={<Dashboard />} />
              <Route path="/profile"       element={<Profile />} />
              <Route path="/chat"          element={<Chat />} />
              <Route path="/reports"       element={<Reports />} />
              <Route path="/timeline"      element={<Timeline />} />
              <Route path="/symptoms"      element={<Symptoms />} />
              <Route path="/nutrition"     element={<Nutrition />} />
              <Route path="/food-tracker"  element={<FoodTracker />} />
              <Route path="/reminders"     element={<Reminders />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ className: 'text-sm font-medium' }} />
    </AppProvider>
  );
}
