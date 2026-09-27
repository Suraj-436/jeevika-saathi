import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";
import Footer from "./components/Footer";
import { LanguageProvider } from "./context/LanguageContext";
import { SessionProvider } from "./context/SessionContext";
import { 
  getStoredUserProfile, 
  saveStoredUserProfile, 
  clearAllSession, 
  saveStoredRoute, 
  getStoredRoute 
} from "./utils/sessionManager";

// Pages
import Home from "./pages/Home";
import AboutPmAjay from "./pages/AboutPmAjay";
import VoiceAssessmentPage from "./pages/VoiceAssessmentPage";
import Profile from "./pages/Profile";
import SkillAnalysis from "./pages/SkillAnalysis";
import Recommendations from "./pages/Recommendations";
import Opportunities from "./pages/Opportunities";
import Roadmap from "./pages/Roadmap";
import HelpFaq from "./pages/HelpFaq";
import AdminDashboard from "./components/AdminDashboard";
import VoiceAssistant from "./components/VoiceAssistant";

// Protected Layout that includes Sidebar, Header, etc.
function MainLayout({ userProfile, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track active route for restoration on refresh
  useEffect(() => {
    if (location.pathname && location.pathname !== "/login") {
      saveStoredRoute(location.pathname);
    }
  }, [location.pathname]);

  // Map pathname back to activePage string for components that still expect it
  const pathParts = location.pathname.split("/").filter(Boolean);
  const activePage = pathParts[0] || "home";

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  return (
    <div className="portal-layout">
      {/* 1. Permanent / Responsive Vertical Left Sidebar */}
      <Sidebar
        userProfile={userProfile}
        activePage={activePage}
        activeTab={activePage}
        onSelectPage={handleNavigate}
        setActiveTab={handleNavigate}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* 2. Main Area to the right of vertical sidebar */}
      <div className="portal-main-area">
        {/* Top Government Identity & Accessibility Header */}
        <Header
          userProfile={userProfile}
          onLogout={onLogout}
          activePage={activePage}
          onSelectPage={handleNavigate}
          onToggleMobile={() => setMobileOpen(!mobileOpen)}
        />

        {/* Dynamic Page Views via React Router Routes */}
        <main id="main-content" style={{ minHeight: "80vh" }}>
          <Routes>
            <Route 
              path="/home" 
              element={<Home onStartVoice={() => navigate('/voice-assessment')} onNavigate={handleNavigate} />} 
            />
            {/* Voice Assessment (supports both /voice-assessment and /voice) */}
            <Route 
              path="/voice-assessment" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <VoiceAssessmentPage 
                    onNavigateToCenters={() => navigate('/nearby-opportunities')} 
                    onComplete={() => navigate('/recommendations')} 
                  />
                </div>
              } 
            />
            <Route 
              path="/voice" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <VoiceAssessmentPage 
                    onNavigateToCenters={() => navigate('/nearby-opportunities')} 
                    onComplete={() => navigate('/recommendations')} 
                  />
                </div>
              } 
            />
            {/* Profile (supports both /livelihood-profile and /profile) */}
            <Route 
              path="/livelihood-profile" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <Profile userProfile={userProfile} onStartVoice={() => navigate('/voice-assessment')} />
                </div>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <Profile userProfile={userProfile} onStartVoice={() => navigate('/voice-assessment')} />
                </div>
              } 
            />
            {/* Skill Analysis (supports both /skill-analysis and /analysis) */}
            <Route 
              path="/skill-analysis" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <SkillAnalysis 
                    userProfile={userProfile}
                    onStartVoice={() => navigate('/voice-assessment')} 
                    onNavigateToRecommendations={() => navigate('/recommendations')} 
                  />
                </div>
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <SkillAnalysis 
                    userProfile={userProfile}
                    onStartVoice={() => navigate('/voice-assessment')} 
                    onNavigateToRecommendations={() => navigate('/recommendations')} 
                  />
                </div>
              } 
            />
            <Route 
              path="/recommendations" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <Recommendations userProfile={userProfile} onNavigateToCenters={() => navigate('/nearby-opportunities')} onNavigateToNearby={() => navigate('/nearby-opportunities')} onStartVoice={() => navigate('/voice-assessment')} onNavigateToRoadmap={() => navigate('/roadmap')} />
                </div>
              } 
            />
            {/* Opportunities (supports both /nearby-opportunities and /opportunities) */}
            <Route 
              path="/nearby-opportunities" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <Opportunities userProfile={userProfile} />
                </div>
              } 
            />
            <Route 
              path="/opportunities" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <Opportunities userProfile={userProfile} />
                </div>
              } 
            />
            <Route 
              path="/roadmap" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <Roadmap userProfile={userProfile} onStartVoice={() => navigate('/voice-assessment')} />
                </div>
              } 
            />
            <Route 
              path="/about" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <AboutPmAjay onStartVoice={() => navigate('/voice-assessment')} onNavigate={handleNavigate} />
                </div>
              } 
            />
            <Route 
              path="/help" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <HelpFaq onStartVoice={() => navigate('/voice-assessment')} />
                </div>
              } 
            />
            <Route 
              path="/monitoring" 
              element={
                <div className="national-container" style={{ padding: "32px 0 48px" }}>
                  <AdminDashboard />
                </div>
              } 
            />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>

        {/* Official National Footer */}
        <Footer />

        {/* Floating Where Am I? Audio Guide Assistant */}
        <VoiceAssistant activeTab={activePage} onOpenVoiceAssessment={() => navigate('/voice-assessment')} />
      </div>
    </div>
  );
}

// Top level application component that maintains authentication state
function AppContent() {
  const navigate = useNavigate();
  
  // Synchronously restore authenticated userProfile from sessionStorage on startup
  const [userProfile, setUserProfile] = useState(() => getStoredUserProfile());

  // Check background dev server restarts (when server process was killed and started again)
  useEffect(() => {
    fetch('/__dev_session_id?t=' + Date.now(), { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const storedId = sessionStorage.getItem('DEV_SERVER_INSTANCE_ID');
        if (storedId && data.instanceId && storedId !== data.instanceId) {
          console.info('[AppContent] Dev server restarted with new instance ID. Resetting session.');
          clearAllSession();
          sessionStorage.setItem('DEV_SERVER_INSTANCE_ID', data.instanceId);
          setUserProfile(null);
          navigate('/login', { replace: true });
        }
      })
      .catch(() => {
        // Fallback for offline or environments where middleware is not needed
      });
  }, [navigate]);

  const handleLoginSuccess = (profile) => {
    const profileData = profile || {
      district: "Agra, UP",
      id: "PM-AJAY-2026-UP-8492",
      phone: "+91 98765 43210",
      verified: true,
      method: "Voice Login Verified"
    };
    saveStoredUserProfile(profileData);
    setUserProfile(profileData);

    // Redirect based on role (Beneficiary vs Official)
    if (profileData.method && profileData.method.toLowerCase().includes("official")) {
      navigate("/monitoring", { replace: true });
    } else {
      const lastRoute = getStoredRoute();
      if (lastRoute && lastRoute !== "/login") {
        navigate(lastRoute, { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  };

  const handleLogout = () => {
    clearAllSession();
    setUserProfile(null);
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          userProfile ? (
            <Navigate to="/home" replace />
          ) : (
            <LoginPage 
              onLoginSuccess={handleLoginSuccess} 
              onNavigate={(page) => navigate(`/${page}`)}
            />
          )
        } 
      />
      <Route 
        path="/*" 
        element={
          userProfile ? (
            <MainLayout userProfile={userProfile} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <SessionProvider>
          <AppContent />
        </SessionProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
