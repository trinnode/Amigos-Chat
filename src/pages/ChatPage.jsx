// Chat Page - Main application interface
// Discord-like layout with user list, chat area, and price feeds

import React, { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  useGeneralChatMessages,
  useSendMessage,
  useRegisteredUsers,
  usePriceFeeds,
} from "../hooks/useAmigoContract.js";
import { getIPFSUrl } from "../utils/ipfs.js";
import { ButtonLoader } from "../components/LoadingSpinner.jsx";

/**
 * Chat Page Component
 * Main interface for the AmigoChat application
 */
const ChatPage = () => {
  const { address } = useAccount();
  const messagesEndRef = useRef(null);

  // Chat state
  const [messageInput, setMessageInput] = useState("");
  const [showPrices, setShowPrices] = useState(false);

  // Contract hooks
  const {
    messages,
    isLoading: loadingMessages,
    refetch: refetchMessages,
  } = useGeneralChatMessages();
  const { sendMessage, isSending } = useSendMessage();
  const { users, isLoading: loadingUsers } = useRegisteredUsers();
  const { prices, fetchPrices, isLoading: loadingPrices } = usePriceFeeds();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message sending
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || isSending) return;

    try {
      sendMessage(messageInput.trim());
      setMessageInput("");
      // Refresh messages after sending
      setTimeout(() => refetchMessages(), 2000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get user by address
  const getUserByAddress = (userAddress) => {
    if (!userAddress || !users || !Array.isArray(users)) {
      return null;
    }
    return users.find(
      (user) =>
        user &&
        user.address &&
        user.address.toLowerCase() === userAddress.toLowerCase()
    );
  };

  // Early return if essential data is not ready
  if (!address) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="w-12 h-12 border-2 border-amigo-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="mt-4 text-amigo-green font-mono text-sm">
            Loading wallet connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-amigo-black flex flex-col">
      {/* Top Navigation Bar */}
      <div className="w-full bg-amigo-gray border-b border-amigo-green shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Logo and App Name */}
            <div className="flex items-center space-x-4">
              <img src="/logo.png" alt="AmigoChat" className="w-8 h-8" />
              <h1 className="text-amigo-green font-bold font-mono text-xl">
                AmigosChat
              </h1>
              <span className="text-amigo-gray-light font-mono text-sm">
                Decentralized Messaging
              </span>
            </div>

            {/* User Profile Section */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-amigo-white font-mono text-sm">
                <span>Online Users: {(users || []).length}</span>
              </div>
              <div className="flex items-center space-x-3 bg-amigo-gray-light px-3 py-2 rounded-lg">
                <img
                  src="/logo.png"
                  alt="Your Profile"
                  className="w-8 h-8 rounded-full border border-amigo-green"
                />
                <div className="hidden sm:block text-amigo-white font-mono text-sm">
                  <div className="font-semibold">You</div>
                  <div className="text-amigo-gray-light text-xs">
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden w-full">
        <div className="flex-1 max-w-7xl mx-auto w-full flex px-4 sm:px-6 lg:px-8">
          {/* Left Sidebar - Users */}
          <div className="hidden lg:flex w-80 bg-amigo-gray-light border-r border-amigo-gray flex-col">
            <div className="p-4 border-b border-amigo-gray">
              <h2 className="text-amigo-green font-mono font-bold text-lg flex items-center">
                <span className="w-3 h-3 bg-amigo-green rounded-full mr-2"></span>
                Online Amigos ({(users || []).length})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loadingUsers ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-3 p-3 bg-amigo-gray rounded-lg"
                    >
                      <div className="w-10 h-10 bg-amigo-gray-light rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-24 h-4 bg-amigo-gray-light rounded animate-pulse mb-1"></div>
                        <div className="w-32 h-3 bg-amigo-gray-light rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                (users || [])
                  .filter((user) => user && user.address)
                  .map((user) => (
                    <div
                      key={user.address}
                      className="flex items-center space-x-3 p-3 bg-amigo-gray rounded-lg hover:bg-amigo-gray-light transition-all cursor-pointer"
                    >
                      <div className="relative">
                        <img
                          src={
                            getIPFSUrl(user.ipfsProfilePicHash) || "/logo.png"
                          }
                          alt={user.username || "Unknown User"}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amigo-green"
                        />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amigo-green rounded-full border-2 border-amigo-gray"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-amigo-white font-mono text-sm font-semibold truncate">
                          {user.username || "Unknown User"}
                          {user.address === address && (
                            <span className="text-amigo-green ml-2">(You)</span>
                          )}
                        </p>
                        <p className="text-amigo-gray-light font-mono text-xs truncate">
                          {user.address && user.address.length >= 10
                            ? `${user.address.slice(
                                0,
                                8
                              )}...${user.address.slice(-6)}`
                            : user.address || "Invalid Address"}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Price Feed Toggle */}
            <div className="p-4 border-t border-amigo-gray">
              <button
                onClick={() => {
                  setShowPrices(!showPrices);
                  if (!showPrices) fetchPrices();
                }}
                className="btn btn-ghost w-full text-sm"
              >
                📊 {showPrices ? "Hide" : "Show"} Live Prices
              </button>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-amigo-black">
            {/* Chat Header */}
            <div className="bg-amigo-gray border-b border-amigo-gray-light p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-amigo-green font-mono font-bold text-xl flex items-center">
                    <span className="mr-2">#</span>
                    general
                  </h2>
                  <p className="text-amigo-gray-light font-mono text-sm">
                    Welcome to the general chat •{" "}
                    {messages ? messages.length : 0} messages
                  </p>
                </div>

                {/* Mobile menu button */}
                <button
                  className="lg:hidden btn btn-ghost"
                  onClick={() => {
                    /* Toggle mobile sidebar */
                  }}
                >
                  👥 {(users || []).length}
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto bg-amigo-black">
              <div className="max-w-4xl mx-auto px-6 py-4">
                {loadingMessages ? (
                  <div className="space-y-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex space-x-4">
                        <div className="w-10 h-10 bg-amigo-gray rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="w-32 h-4 bg-amigo-gray rounded animate-pulse mb-2"></div>
                          <div className="w-full h-3 bg-amigo-gray rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !messages || messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="text-8xl mb-6">💬</div>
                    <h3 className="text-amigo-white font-mono text-2xl font-bold mb-4">
                      Welcome to #general!
                    </h3>
                    <p className="text-amigo-gray-light font-mono text-lg max-w-lg leading-relaxed">
                      This is the beginning of the general channel. Start the
                      conversation and be the first amigo to send a message in
                      this decentralized chat!
                    </p>
                    <div className="mt-8 px-6 py-3 bg-amigo-gray rounded-lg border border-amigo-green">
                      <p className="text-amigo-green font-mono text-sm">
                        💡 Your messages are stored on the blockchain forever
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pb-4">
                    {(messages || [])
                      .filter((message) => message && message.sender)
                      .map((message, index) => {
                        const user = getUserByAddress(message.sender);
                        const isCurrentUser =
                          message.sender &&
                          address &&
                          message.sender.toLowerCase() ===
                            address.toLowerCase();

                        return (
                          <Motion.div
                            key={`${message.messageId}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex space-x-4 group hover:bg-amigo-gray/10 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-amigo-gray"
                          >
                            <img
                              src={
                                getIPFSUrl(user?.ipfsProfilePicHash) ||
                                "/logo.png"
                              }
                              alt={user?.username || "Unknown"}
                              className="w-12 h-12 rounded-full object-cover border-2 border-amigo-green shadow-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <span
                                  className={`font-mono font-bold text-base ${
                                    isCurrentUser
                                      ? "text-amigo-green"
                                      : "text-amigo-white"
                                  }`}
                                >
                                  {user?.username || "Unknown"}
                                </span>
                                {isCurrentUser && (
                                  <span className="text-amigo-green font-mono text-sm">
                                    (You)
                                  </span>
                                )}
                                <span className="text-amigo-gray-light font-mono text-sm">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-amigo-white font-mono text-base break-words leading-relaxed">
                                {message.content}
                              </p>
                            </div>
                          </Motion.div>
                        );
                      })}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input Area */}
            <div className="border-t border-amigo-gray bg-amigo-gray">
              <div className="max-w-4xl mx-auto px-6 py-4">
                <form
                  onSubmit={handleSendMessage}
                  className="flex space-x-4 items-end"
                >
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Send a message to #general..."
                        className="w-full px-4 py-3 pr-14 bg-amigo-black border-2 border-amigo-gray-light rounded-xl text-amigo-white font-mono placeholder-amigo-gray-light focus:border-amigo-green focus:outline-none transition-colors text-base"
                        maxLength="1000"
                        disabled={isSending}
                      />
                      <button
                        type="submit"
                        disabled={!messageInput.trim() || isSending}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-amigo-green rounded-lg flex items-center justify-center hover:bg-amigo-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSending ? (
                          <div className="w-4 h-4 border-2 border-amigo-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <span className="text-amigo-black text-lg">➤</span>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
                <p className="text-amigo-gray-light font-mono text-sm mt-3 text-center">
                  Press Enter to send • Messages are stored permanently on the
                  blockchain
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Price Feed */}
        <AnimatePresence>
          {showPrices && (
            <Motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-amigo-gray border-l border-amigo-gray-light overflow-hidden"
            >
              <div className="p-4 border-b border-amigo-gray-light">
                <h3 className="text-amigo-green font-mono font-bold">
                  Live Prices
                </h3>
                <p className="text-amigo-gray-light font-mono text-xs">
                  Powered by Chainlink
                </p>
              </div>

              <div className="p-4 space-y-4">
                {loadingPrices ? (
                  <div className="space-y-3">
                    {["BTC", "ETH", "LINK"].map((symbol) => (
                      <div
                        key={symbol}
                        className="bg-amigo-gray-light p-3 rounded-lg"
                      >
                        <div className="w-16 h-4 bg-amigo-gray rounded animate-pulse mb-2"></div>
                        <div className="w-24 h-6 bg-amigo-gray rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <PriceCard symbol="BTC" price={prices.btc} />
                    <PriceCard symbol="ETH" price={prices.eth} />
                    <PriceCard symbol="LINK" price={prices.link} />

                    <button
                      onClick={fetchPrices}
                      className="btn btn-ghost w-full text-sm mt-4"
                    >
                      🔄 Refresh Prices
                    </button>
                  </>
                )}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Price Card Component
const PriceCard = ({ symbol, price }) => {
  const formatPrice = (price) => {
    if (!price) return "N/A";
    const num = parseFloat(price);
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-amigo-gray-light p-3 rounded-lg border border-amigo-green border-opacity-30">
      <div className="flex justify-between items-center">
        <span className="text-amigo-white font-mono font-bold text-sm">
          {symbol}/USD
        </span>
        <span className="text-amigo-green font-mono text-lg font-bold">
          {formatPrice(price)}
        </span>
      </div>
    </div>
  );
};

export default ChatPage;
