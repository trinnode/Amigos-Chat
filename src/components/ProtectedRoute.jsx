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
  const { isRegistered, isLoading: isCheckingRegistration } =
    useIsUserRegistered();

  const [hasCheckedRequirements, setHasCheckedRequirements] = useState(false);

  // Effect to track when we've completed all necessary checks
  useEffect(() => {
    if (!isConnecting && !isCheckingRegistration) {
      setHasCheckedRequirements(true);
    }
  }, [isConnecting, isCheckingRegistration]);

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
