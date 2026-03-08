import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import BirthdayNotification from "@/components/birthday/BirthdayNotification";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AlumniDirectory from "./pages/AlumniDirectory";
import AlumniProfilePage from "./pages/AlumniProfilePage";
import MentorshipPage from "./pages/MentorshipPage";
import EventsPage from "./pages/EventsPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";
import JobsPage from "./pages/JobsPage";
import FundraisingPage from "./pages/FundraisingPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ForumsPage from "./pages/ForumsPage";
import ForumDetailPage from "./pages/ForumDetailPage";
import SeedDataPage from "./pages/SeedDataPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BirthdayNotification />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/alumni" element={<ProtectedRoute><AlumniDirectory /></ProtectedRoute>} />
            <Route path="/alumni/:userId" element={<ProtectedRoute><AlumniProfilePage /></ProtectedRoute>} />
            <Route path="/mentorship" element={<ProtectedRoute><MentorshipPage /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
            <Route path="/fundraising" element={<ProtectedRoute allowedRoles={['alumni', 'faculty', 'admin']}><FundraisingPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute allowedRoles={['alumni', 'faculty', 'admin']}><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/forums" element={<ProtectedRoute><ForumsPage /></ProtectedRoute>} />
            <Route path="/forums/:forumId" element={<ProtectedRoute><ForumDetailPage /></ProtectedRoute>} />
            <Route path="/seed-data" element={<ProtectedRoute allowedRoles={['admin']}><SeedDataPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
