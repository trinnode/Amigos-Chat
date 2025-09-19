/* eslint-disable no-unused-vars */
// Protected Route component for access control
// Handles wallet connection and user registration requirements

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { useIsUserRegistered } from "../hooks/useAmigoContract.js";
import LoadingSpinner from "./LoadingSpinner.jsx";

/**
 * ProtectedRoute Component
 * Wraps routes that require wallet connection and/or user registration
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if access is granted
 * @param {boolean} props.requireConnection - Whether wallet connection is required
 * @param {boolean} props.requireRegistration - Whether user registration is required
 */
const ProtectedRoute = ({
  children,
  requireConnection = false,
  requireRegistration = false,
}) => {
  const location = useLocation();
  const { address, isConnected, isConnecting } = useAccount();
  const {
    isRegistered,
    isLoading: isCheckingRegistration,
    refetch,
  } = useIsUserRegistered();

  const [hasCheckedRequirements, setHasCheckedRequirements] = useState(false);

  // Effect to track when we've completed all necessary checks
  useEffect(() => {
    if (!isConnecting && !isCheckingRegistration) {
      setHasCheckedRequirements(true);
    }
  }, [isConnecting, isCheckingRegistration]);

  // Additional effect to refetch registration status when transitioning to chat page
  useEffect(() => {
    if (
      location.pathname === "/chat" &&
      isConnected &&
      !isCheckingRegistration
    ) {
      // Small delay then refetch to ensure we have latest registration status
      const timer = setTimeout(() => {
        refetch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isConnected, isCheckingRegistration, refetch]);

  // Show loading while checking wallet connection or registration status
  if (
    isConnecting ||
    (requireRegistration && isCheckingRegistration) ||
    !hasCheckedRequirements
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-amigo-green font-mono text-sm">
            {isConnecting && "Connecting wallet..."}
            {isCheckingRegistration && "Checking registration..."}
            {!isConnecting && !isCheckingRegistration && "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Check wallet connection requirement
  if (requireConnection && !isConnected) {
    // Redirect to landing page with current location for redirect after connection
    return (
      <Navigate
        to="/"
        state={{
          from: location,
          message: "Please connect your wallet to continue.",
        }}
        replace
      />
    );
  }

  // Check registration requirement
  if (requireRegistration && isConnected && !isRegistered) {
    // Special handling: if we just came from register page, give a bit more time for blockchain to update
    const comingFromRegister = location.state?.from?.pathname === "/register";
    if (comingFromRegister && !hasCheckedRequirements) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-sm w-full">
            <div className="w-12 h-12 border-2 border-amigo-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="mt-4 text-amigo-green font-mono text-sm">
              Verifying registration...
            </p>
          </div>
        </div>
      );
    }

    // Redirect to registration page
    return (
      <Navigate
        to="/register"
        state={{
          from: location,
          message: "Please complete registration to access this page.",
        }}
        replace
      />
    );
  }

  // Special case: if user is on register page but already registered, redirect to chat
  if (location.pathname === "/register" && isConnected && isRegistered) {
    return <Navigate to="/chat" replace />;
  }

  // All requirements met, render children
  return children;
};

export default ProtectedRoute;
