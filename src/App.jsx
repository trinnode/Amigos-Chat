// Main App component for AmigoChat dApp
// Handles routing, Web3 provider setup, and global state management

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import Web3 configuration
import { wagmiConfig, rainbowKitTheme } from "./config/web3.js";

// Import page components
import LandingPage from "./pages/LandingPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

// Import utility components
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MatrixBackground from "./components/MatrixBackground.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";

// Create a client for React Query (required by RainbowKit)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      retry: 3, // Retry failed requests 3 times
    },
  },
});

/**
 * Main App Component
 * Sets up the Web3 providers, routing, and global theme
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider
          theme={rainbowKitTheme}
          appInfo={{
            appName: "AmigoChat",
          }}
          showRecentTransactions={true}
        >
          <Router>
            <div className="app-container min-h-screen bg-amigo-black text-amigo-white font-mono relative">
              {/* Animated Matrix Background - adds cyberpunk aesthetic */}
              <MatrixBackground />

              {/* Main Application Routes - Properly Centered */}
              <div className="relative z-10 min-h-screen flex flex-col w-full">
                <Routes>
                  {/* Landing Page - entry point for all users */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Registration Page - for new users to create their profile */}
                  <Route
                    path="/register"
                    element={
                      <ProtectedRoute
                        requireConnection={true}
                        requireRegistration={false}
                      >
                        <RegisterPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Chat Page - main application interface for registered users */}
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute
                        requireConnection={true}
                        requireRegistration={true}
                      >
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Profile Page - user profile management */}
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute
                        requireConnection={true}
                        requireRegistration={true}
                      >
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all route - redirect unknown paths to landing page */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Global Loading Indicator */}
                <LoadingSpinner />
              </div>
            </div>
          </Router>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
