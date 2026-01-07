import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PorterProvider } from "@/contexts/PorterContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DevAccountSwitcher } from "@/components/DevAccountSwitcher";
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
      <PorterProvider>
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
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/admin/porters"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPorters />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/trips"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminTrips />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reviews"
                element={
                  <ProtectedRoute requiredRole="admin">
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
            <DevAccountSwitcher />
          </BrowserRouter>
        </TooltipProvider>
      </PorterProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
