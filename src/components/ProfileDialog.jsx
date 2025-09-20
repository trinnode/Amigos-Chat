// Profile Dialog Component - Shows user profile information in a modal
// Displays user data without navigation to a separate page

// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useUserProfile, useUserBalance } from "../hooks/useAmigoContract.js";
import { getIPFSUrl } from "../utils/ipfs.js";

/**
 * ProfileDialog Component
 * @param {boolean} isOpen - Whether the dialog is open
 * @param {function} onClose - Function to close the dialog
 */
const ProfileDialog = ({ isOpen, onClose }) => {
  const { address } = useAccount();
  const { profile, isLoading: profileLoading } = useUserProfile();
  const {
    balance,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useUserBalance();

  // Close dialog on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Refresh balance when dialog opens
  useEffect(() => {
    if (isOpen) {
      refetchBalance();
    }
  }, [isOpen, refetchBalance]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-amigo-gray border border-amigo-green rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-amigo-black border-b border-amigo-green p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-amigo-green font-mono font-bold text-xl">
                👤 Your Profile
              </h2>
              <button
                onClick={onClose}
                className="text-amigo-gray-light hover:text-amigo-white transition-colors p-2 rounded"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {profileLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amigo-green"></div>
                <span className="ml-3 text-amigo-white font-mono">
                  Loading profile...
                </span>
              </div>
            ) : profile ? (
              <>
                {/* Profile Picture & Username */}
                <div className="flex items-center space-x-4">
                  <img
                    src={getIPFSUrl(profile.ipfsProfilePicHash) || "/logo.png"}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-amigo-green object-cover"
                  />
                  <div>
                    <h3 className="text-amigo-white font-mono font-bold text-lg">
                      {profile.username}
                    </h3>
                    <p className="text-amigo-gray-light font-mono text-sm">
                      Registered User
                    </p>
                  </div>
                </div>

                {/* Wallet Information */}
                <div className="bg-amigo-black rounded-lg p-4 space-y-3">
                  <h4 className="text-amigo-green font-mono font-semibold">
                    Wallet Info
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-amigo-gray-light font-mono text-sm">
                        Address:
                      </span>
                      <span className="text-amigo-white font-mono text-sm">
                        {address
                          ? `${address.slice(0, 8)}...${address.slice(-6)}`
                          : "Not connected"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-amigo-gray-light font-mono text-sm">
                        ETH Balance:
                      </span>
                      <span className="text-amigo-white font-mono text-sm">
                        {balanceLoading ? (
                          <span className="animate-pulse">Loading...</span>
                        ) : (
                          `${balance} ETH`
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Registration Info */}
                <div className="bg-amigo-black rounded-lg p-4 space-y-3">
                  <h4 className="text-amigo-green font-mono font-semibold">
                    Registration Info
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-amigo-gray-light font-mono text-sm">
                        Username:
                      </span>
                      <span className="text-amigo-white font-mono text-sm">
                        {profile.username}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-amigo-gray-light font-mono text-sm">
                        Status:
                      </span>
                      <span className="text-green-400 font-mono text-sm">
                        ✓ Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Network Information */}
                <div className="bg-amigo-black rounded-lg p-4 space-y-3">
                  <h4 className="text-amigo-green font-mono font-semibold">
                    Network
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-amigo-gray-light font-mono text-sm">
                        Chain:
                      </span>
                      <span className="text-amigo-white font-mono text-sm">
                        Sepolia Testnet
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-amigo-gray-light font-mono text-sm">
                        Status:
                      </span>
                      <span className="text-green-400 font-mono text-sm">
                        🟢 Connected
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-amigo-gray-light font-mono">
                  Profile not found. Please register first.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-amigo-black border-t border-amigo-green p-4">
            <div className="flex justify-end space-x-3">
              <button onClick={onClose} className="btn btn-ghost font-mono">
                Close
              </button>
              {profile && (
                <button
                  onClick={refetchBalance}
                  disabled={balanceLoading}
                  className="btn btn-secondary font-mono"
                >
                  {balanceLoading ? "Refreshing..." : "🔄 Refresh"}
                </button>
              )}
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileDialog;
