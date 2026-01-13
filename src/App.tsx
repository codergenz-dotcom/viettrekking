import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSetup from "./pages/ProfileSetup";
import RegisterPending from "./pages/RegisterPending";
import CreateTripSelfOrganize from "./pages/CreateTripSelfOrganize";
import TripDetail from "./pages/TripDetail";
import MyTrips from "./pages/MyTrips";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Chat from "./pages/Chat";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPorters from "./pages/admin/AdminPorters";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTrips from "./pages/admin/AdminTrips";
import AdminReviews from "./pages/admin/AdminReviews";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/setup" element={<ProfileSetup />} />
              <Route path="/register/pending" element={<RegisterPending />} />
              {/* Landing page */}
              <Route path="/" element={<LandingPage />} />
              {/* Admin routes - protected */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/porters"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminPorters />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/trips"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminTrips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reviews"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminReviews />
                  </ProtectedRoute>
                }
              />
              {/* Main app routes */}
              <Route
                path="/*"
                element={
                  <AppLayout>
                    <Routes>
                      <Route path="/trips" element={<Index />} />
                      <Route path="/create-trip" element={<CreateTripSelfOrganize />} />
                      <Route path="/trip/:id" element={<TripDetail />} />
                      <Route path="/my-trips" element={<MyTrips />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/:userId" element={<PublicProfile />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
