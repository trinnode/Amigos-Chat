/* eslint-disable no-unused-vars */
// Landing Page - Entry point for AmigoChat dApp
// Features animated logo, 3D effects, and wallet connection

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useIsUserRegistered } from "../hooks/useAmigoContract.js";

/**
 * Landing Page Component
 * Serves as the main entry point for the AmigoChat application
 * Handles wallet connection and routing to appropriate pages
 */
const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { isRegistered, isLoading } = useIsUserRegistered();

  // State for UI interactions
  const [showFeatures, setShowFeatures] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  // Handle automatic redirection after wallet connection
  useEffect(() => {
    if (isConnected && !isLoading) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        if (isRegistered) {
          navigate("/chat");
        } else {
          navigate("/register");
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isConnected, isRegistered, isLoading, navigate]);

  // Animation variants for framer-Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.6,
      },
    },
  };

  const logoVariants = {
    initial: { scale: 0.8, rotateY: 0 },
    animate: {
      scale: 1,
      rotateY: [0, 360],
      transition: {
        scale: { duration: 0.6, type: "spring", bounce: 0.4 },
        rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
      },
    },
    hover: {
      scale: 1.1,
      filter: "drop-shadow(0 0 20px #00ff00)",
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden justify-center text-center">
      {/* Hero Section */}
      <Motion.main
        className="flex-1 flex items-center justify-center px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto text-center">
          {/* Animated Logo */}
          <Motion.div
            className="mb-8 flex justify-center"
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
          >
            <div className="relative">
              <img
                src="/logo.png"
                alt="AmigoChat Logo"
                className="w-32 h-32 md:w-48 md:h-48 filter drop-shadow-lg"
              />
              {/* Glow effect behind logo */}
              <div className="absolute inset-0 w-32 h-32 md:w-48 md:h-48 bg-amigo-green opacity-20 rounded-full blur-xl -z-10"></div>
            </div>
          </Motion.div>

          {/* Main Title with Glitch Effect */}
          <Motion.div variants={itemVariants} className="mb-6">
            <h1
              className="text-6xl md:text-8xl font-bold text-amigo-green mb-4 glitch"
              data-text="AMIGOCHAT"
            >
              AMIGOsCHAT
            </h1>
            <div className="w-24 h-1 bg-amigo-green mx-auto animate-pulse"></div>
          </Motion.div>

          {/* Tagline */}
          <Motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-amigo-white mb-8 font-mono"
          >
            Connect. Chat. Decentralize.
          </Motion.p>

          {/* Connect Wallet Section */}
          <Motion.div variants={itemVariants} className="mb-12">
            {!isConnected ? (
              <div className="space-y-4">
                <p className="text-amigo-gray-light font-mono mb-6">
                  Connect your wallet to enter the decentralized chat revolution
                </p>

                {/* Custom styled connect button */}
                <div className="flex justify-center">
                  <div className="bg-amigo-gray border border-amigo-green rounded-lg p-1 glow-green">
                    <ConnectButton.Custom>
                      {({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        mounted,
                      }) => {
                        return (
                          <div>
                            {(() => {
                              if (!mounted || !account || !chain) {
                                return (
                                  <Motion.button
                                    onClick={openConnectModal}
                                    className="btn btn-primary text-lg px-8 py-4 font-bold"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    🚀 CONNECT WALLET
                                  </Motion.button>
                                );
                              }

                              return (
                                <div style={{ display: "flex", gap: 12 }}>
                                  <button
                                    onClick={openChainModal}
                                    className="btn btn-secondary"
                                  >
                                    {chain.hasIcon && (
                                      <div
                                        style={{
                                          background: chain.iconBackground,
                                          width: 12,
                                          height: 12,
                                          borderRadius: 999,
                                          overflow: "hidden",
                                          marginRight: 4,
                                        }}
                                      >
                                        {chain.iconUrl && (
                                          <img
                                            alt={chain.name ?? "Chain icon"}
                                            src={chain.iconUrl}
                                            style={{ width: 12, height: 12 }}
                                          />
                                        )}
                                      </div>
                                    )}
                                    {chain.name}
                                  </button>

                                  <button
                                    onClick={openAccountModal}
                                    className="btn btn-primary"
                                  >
                                    {account.displayName}
                                    {account.displayBalance
                                      ? ` (${account.displayBalance})`
                                      : ""}
                                  </button>
                                </div>
                              );
                            })()}
                          </div>
                        );
                      }}
                    </ConnectButton.Custom>
                  </div>
                </div>
              </div>
            ) : (
              <Motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="text-amigo-green text-2xl font-bold">
                  ✅ Wallet Connected!
                </div>
                <p className="text-amigo-white font-mono">
                  {isLoading
                    ? "Checking registration..."
                    : isRegistered
                    ? "Redirecting to chat..."
                    : "Redirecting to registration..."}
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-amigo-green border-t-transparent rounded-full animate-spin"></div>
                </div>
              </Motion.div>
            )}
          </Motion.div>

          {/* Features Button */}
          <Motion.div variants={itemVariants}>
            <Motion.button
              onClick={() => setShowFeatures(!showFeatures)}
              className="btn btn-ghost mb-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showFeatures ? "🔼 Hide Features" : "🔽 Learn More"}
            </Motion.button>
          </Motion.div>

          {/* Features Section */}
          <AnimatePresence>
            {showFeatures && (
              <Motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden"
              >
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                  {/* Feature 1 */}
                  <Motion.div
                    className="card text-center"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(0, 255, 0, 0.3)",
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="text-xl font-bold text-amigo-green mb-2">
                      Decentralized
                    </h3>
                    <p className="text-amigo-gray-light font-mono text-sm">
                      No central servers. Your data, your control. Built on
                      Ethereum blockchain.
                    </p>
                  </Motion.div>

                  {/* Feature 2 */}
                  <Motion.div
                    className="card text-center"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(0, 255, 0, 0.3)",
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-4xl mb-4">💬</div>
                    <h3 className="text-xl font-bold text-amigo-green mb-2">
                      Real-time Chat
                    </h3>
                    <p className="text-amigo-gray-light font-mono text-sm">
                      Instant messaging with Web3 identities. Connect with
                      fellow crypto enthusiasts.
                    </p>
                  </Motion.div>

                  {/* Feature 3 */}
                  <Motion.div
                    className="card text-center"
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 20px rgba(0, 255, 0, 0.3)",
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-4xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-amigo-green mb-2">
                      Price Feeds
                    </h3>
                    <p className="text-amigo-gray-light font-mono text-sm">
                      Real-time crypto prices powered by Chainlink oracles. Stay
                      updated while you chat.
                    </p>
                  </Motion.div>
                </div>

                {/* Technical Features */}
                <Motion.div
                  className="mt-12 card"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-2xl font-bold text-amigo-green mb-6 text-center">
                    Built with Cutting-edge Tech
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-amigo-gray rounded-lg">
                      <div className="font-mono text-amigo-green font-bold">
                        Ethereum
                      </div>
                      <div className="text-sm text-amigo-gray-light">
                        Blockchain
                      </div>
                    </div>
                    <div className="text-center p-4 bg-amigo-gray rounded-lg">
                      <div className="font-mono text-amigo-green font-bold">
                        IPFS
                      </div>
                      <div className="text-sm text-amigo-gray-light">
                        Storage
                      </div>
                    </div>
                    <div className="text-center p-4 bg-amigo-gray rounded-lg">
                      <div className="font-mono text-amigo-green font-bold">
                        Chainlink
                      </div>
                      <div className="text-sm text-amigo-gray-light">
                        Oracles
                      </div>
                    </div>
                    <div className="text-center p-4 bg-amigo-gray rounded-lg">
                      <div className="font-mono text-amigo-green font-bold">
                        React
                      </div>
                      <div className="text-sm text-amigo-gray-light">
                        Frontend
                      </div>
                    </div>
                  </div>
                </Motion.div>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </Motion.main>

      {/* Footer */}
      <Motion.footer
        className="border-t border-amigo-gray p-6 text-center"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-amigo-gray-light font-mono text-sm mb-2">
            Powered by Ethereum • Secured by Blockchain • Built for the Future
          </p>
          <div className="flex justify-center space-x-6 text-amigo-green font-mono text-sm">
            <span>v1.0.0</span>
            <span>•</span>
            <span>Sepolia Testnet</span>
            <span>•</span>
            <span>Open Source</span>
          </div>
        </div>
      </Motion.footer>

      {/* Floating Elements for Added Visual Interest */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-amigo-green rounded-full animate-float opacity-30"></div>
      <div
        className="absolute top-40 right-20 w-6 h-6 bg-amigo-green rounded-full animate-float opacity-20"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-32 left-1/4 w-3 h-3 bg-amigo-green rounded-full animate-float opacity-25"
        style={{ animationDelay: "4s" }}
      ></div>
      <div
        className="absolute top-1/3 right-10 w-5 h-5 bg-amigo-green rounded-full animate-float opacity-15"
        style={{ animationDelay: "6s" }}
      ></div>
    </div>
  );
};

export default LandingPage;
