// Profile Page - User profile management
// Displays user info and allows username changes

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion as Motion } from "framer-motion";
import {
  useUserProfile,
  useChangeUsername,
  useUsernameAvailability,
  useUserBalance,
} from "../hooks/useAmigoContract.js";
import { getIPFSUrl } from "../utils/ipfs.js";
import { ButtonLoader } from "../components/LoadingSpinner.jsx";

/**
 * Profile Page Component
 * User profile management and information display
 */
const ProfilePage = () => {
  const { address } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  // Contract hooks
  const {
    profile,
    isLoading: loadingProfile,
    refetch: refetchProfile,
  } = useUserProfile();
  const { balance, isLoading: loadingBalance } = useUserBalance();
  const { checkAvailability, availability, isChecking } =
    useUsernameAvailability();
  const { changeUsername, isChanging, changeSuccess, changeError } =
    useChangeUsername();

  // Handle username change
  const handleUsernameChange = async () => {
    if (!newUsername.trim() || !availability?.isAvailable) return;

    try {
      await changeUsername(newUsername.trim());
      setIsEditing(false);
      setNewUsername("");
      // Refresh profile after change
      setTimeout(() => refetchProfile(), 2000);
    } catch (error) {
      console.error("Error changing username:", error);
    }
  };

  // Handle username input
  const handleUsernameInput = (value) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    setNewUsername(cleanValue);

    if (cleanValue.length >= 3 && cleanValue !== profile?.username) {
      checkAvailability(cleanValue);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amigo-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amigo-green font-mono">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amigo-black">
      {/* Header */}
      <div className="bg-amigo-gray border-b border-amigo-gray-light">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/chat" className="btn btn-ghost">
                ← Back to Chat
              </Link>
              <h1 className="text-2xl font-bold text-amigo-green font-mono">
                Profile Settings
              </h1>
            </div>
            <img src="/logo.png" alt="AmigoChat" className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <div className="card text-center">
              <div className="mb-6">
                <img
                  src={getIPFSUrl(profile?.ipfsProfilePicHash) || "/logo.png"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-amigo-green mb-4"
                />
                <h2 className="text-2xl font-bold text-amigo-green font-mono">
                  {profile?.username}.amigo
                </h2>
                <p className="text-amigo-gray-light font-mono text-sm break-all">
                  {address}
                </p>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-amigo-gray-light">Messages Sent:</span>
                  <span className="text-amigo-white font-bold">
                    {profile?.totalMessagesSent || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-amigo-gray-light">Joined:</span>
                  <span className="text-amigo-white font-bold">
                    {profile?.registrationTimestamp
                      ? new Date(
                          profile.registrationTimestamp * 1000
                        ).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-amigo-gray-light">ETH Balance:</span>
                  <span className="text-amigo-white font-bold">
                    {loadingBalance
                      ? "..."
                      : balance
                      ? `${parseFloat(balance).toFixed(4)} ETH`
                      : "0 ETH"}
                  </span>
                </div>
              </div>

              {/* Social Badge */}
              <div className="bg-amigo-gray-light p-3 rounded-lg">
                <div className="text-amigo-green font-mono text-sm font-bold">
                  🎭 Crypto Pioneer
                </div>
                <div className="text-amigo-gray-light font-mono text-xs">
                  Early adopter of decentralized chat
                </div>
              </div>
            </div>
          </Motion.div>

          {/* Settings Panel */}
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Username Settings */}
            <div className="card">
              <h3 className="text-xl font-bold text-amigo-green font-mono mb-4">
                Username Settings
              </h3>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-amigo-gray-light rounded-lg">
                    <div>
                      <div className="text-amigo-white font-mono font-bold">
                        Current Username
                      </div>
                      <div className="text-amigo-green font-mono text-lg">
                        {profile?.username}.amigo
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-secondary"
                    >
                      Change
                    </button>
                  </div>
                  <p className="text-amigo-gray-light font-mono text-sm">
                    Your username is your unique identity on AmigoChat. Changing
                    it requires a blockchain transaction.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-amigo-white font-mono text-sm font-bold">
                      New Username
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => handleUsernameInput(e.target.value)}
                        placeholder="newusername"
                        className="input pr-20"
                        maxLength="20"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amigo-green font-mono">
                        .amigo
                      </span>
                    </div>

                    {/* Validation feedback */}
                    {newUsername.length >= 3 &&
                      newUsername !== profile?.username && (
                        <div className="text-sm font-mono">
                          {isChecking ? (
                            <div className="flex items-center space-x-2 text-amigo-gray-light">
                              <div className="w-3 h-3 border border-amigo-green border-t-transparent rounded-full animate-spin"></div>
                              <span>Checking availability...</span>
                            </div>
                          ) : availability ? (
                            availability.isAvailable ? (
                              <div className="text-amigo-green">
                                ✅ {availability.username}.amigo is available!
                              </div>
                            ) : (
                              <div className="text-red-500">
                                ❌ {availability.username}.amigo is taken
                              </div>
                            )
                          ) : null}
                        </div>
                      )}
                  </div>

                  {/* Error display */}
                  {changeError && (
                    <div className="bg-red-900 border border-red-500 p-3 rounded-lg">
                      <p className="text-red-300 font-mono text-sm">
                        {changeError?.message || "Failed to change username"}
                      </p>
                    </div>
                  )}

                  {/* Success display */}
                  {changeSuccess && (
                    <div className="bg-green-900 border border-green-500 p-3 rounded-lg">
                      <p className="text-green-300 font-mono text-sm">
                        Username changed successfully! It may take a moment to
                        update.
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setNewUsername("");
                      }}
                      disabled={isChanging}
                      className="btn btn-ghost flex-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUsernameChange}
                      disabled={
                        !availability?.isAvailable ||
                        isChanging ||
                        newUsername.length < 3
                      }
                      className="btn btn-primary flex-1"
                    >
                      {isChanging ? <ButtonLoader /> : "Update Username"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wallet Information */}
            <div className="card">
              <h3 className="text-xl font-bold text-amigo-green font-mono mb-4">
                Wallet Information
              </h3>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amigo-gray-light rounded-lg">
                    <div className="text-amigo-gray-light font-mono text-sm mb-1">
                      Wallet Address
                    </div>
                    <div className="text-amigo-white font-mono text-sm break-all">
                      {address}
                    </div>
                  </div>

                  <div className="p-4 bg-amigo-gray-light rounded-lg">
                    <div className="text-amigo-gray-light font-mono text-sm mb-1">
                      Network
                    </div>
                    <div className="text-amigo-green font-mono font-bold">
                      Sepolia Testnet
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amigo-gray-light rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-amigo-gray-light font-mono text-sm">
                        ETH Balance
                      </div>
                      <div className="text-amigo-white font-mono text-lg font-bold">
                        {loadingBalance ? (
                          <div className="w-20 h-6 bg-amigo-gray rounded animate-pulse"></div>
                        ) : (
                          `${
                            balance
                              ? parseFloat(balance).toFixed(6)
                              : "0.000000"
                          } ETH`
                        )}
                      </div>
                    </div>
                    <div className="text-2xl">💰</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Data */}
            <div className="card">
              <h3 className="text-xl font-bold text-amigo-green font-mono mb-4">
                Profile Data
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-amigo-gray-light">
                    Profile Picture:
                  </span>
                  <span className="text-amigo-white">
                    {profile?.ipfsProfilePicHash ? "Stored on IPFS" : "Default"}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-mono">
                  <span className="text-amigo-gray-light">
                    Registration Status:
                  </span>
                  <span className="text-amigo-green font-bold">
                    ✅ Verified
                  </span>
                </div>

                <div className="flex justify-between text-sm font-mono">
                  <span className="text-amigo-gray-light">Data Storage:</span>
                  <span className="text-amigo-white">Blockchain + IPFS</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amigo-gray-light rounded-lg">
                <p className="text-amigo-gray-light font-mono text-xs">
                  Your profile data is stored permanently on the Ethereum
                  blockchain and IPFS, ensuring true ownership and
                  decentralization.
                </p>
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
