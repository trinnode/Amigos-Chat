// Chat Page - Modern Discord-like responsive interface
// Completely redesigned for better UX and responsiveness

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
 * Chat Page Component - Discord-inspired design
 * Features: Responsive layout, mobile support, modern UI
 */
const ChatPage = () => {
  const { address } = useAccount();
  const messagesEndRef = useRef(null);

  // UI State
  const [messageInput, setMessageInput] = useState("");
  const [showPrices, setShowPrices] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUserList, setShowUserList] = useState(true);

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

  // Automated price posting every hour
  useEffect(() => {
    const postPriceUpdate = async () => {
      // Only post if we have valid prices and user is connected
      if (!address || !prices || (!prices.btc && !prices.eth && !prices.link)) {
        return;
      }

      try {
        // Format the price message
        const priceMessage = formatPriceMessage(prices);

        // Send the automated price update
        console.log("Posting automated price update:", priceMessage);
        sendMessage(priceMessage);

        // Refresh messages after posting
        setTimeout(() => refetchMessages(), 3000);
      } catch (error) {
        console.error("Error posting automated price update:", error);
      }
    };

    // Set up interval for hourly price updates
    const priceInterval = setInterval(postPriceUpdate, 60 * 60 * 1000); // 1 hour in milliseconds

    // Also post price update when component mounts if prices are available
    const initialTimeout = setTimeout(() => {
      if (prices && (prices.btc || prices.eth || prices.link)) {
        postPriceUpdate();
      }
    }, 10000); // Wait 10 seconds after mount to let everything load

    // Cleanup intervals on unmount
    return () => {
      clearInterval(priceInterval);
      clearTimeout(initialTimeout);
    };
  }, [address, prices, sendMessage, refetchMessages]);

  // Format price message for the bot
  const formatPriceMessage = (prices) => {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    let message = `🤖 **Price Update ${timestamp}** 📊\n\n`;

    // Helper function to safely format price values (handles BigInt and strings)
    const safePriceFormat = (price) => {
      if (!price) return null;
      try {
        // Convert BigInt to string first if needed
        const priceStr =
          typeof price === "bigint" ? price.toString() : String(price);
        const priceNum = parseFloat(priceStr);
        return isNaN(priceNum) ? null : priceNum.toLocaleString();
      } catch (error) {
        console.error("Error formatting price:", error);
        return null;
      }
    };

    if (prices.btc) {
      const formattedBTC = safePriceFormat(prices.btc);
      if (formattedBTC) {
        message += `₿ BTC: $${formattedBTC}\n`;
      }
    }
    if (prices.eth) {
      const formattedETH = safePriceFormat(prices.eth);
      if (formattedETH) {
        message += `Ξ ETH: $${formattedETH}\n`;
      }
    }
    if (prices.link) {
      const formattedLINK = safePriceFormat(prices.link);
      if (formattedLINK) {
        message += `🔗 LINK: $${formattedLINK}\n`;
      }
    }

    message += `\n📡 Powered by Chainlink Oracles`;
    return message;
  };

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

  // Loading state
  if (!address) {
    return (
      <div className="h-screen flex items-center justify-center bg-amigo-black">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-amigo-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amigo-green font-mono">
            Loading wallet connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-amigo-black overflow-hidden">
      {/* Server List (Far Left) */}
      <div className="hidden md:flex flex-col w-18 bg-amigo-gray-light border-r border-amigo-gray">
        <div className="p-3 flex flex-col items-center space-y-3">
          {/* Main Server */}
          <Motion.div
            whileHover={{ scale: 1.05, borderRadius: "35%" }}
            className="w-12 h-12 bg-amigo-green rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
          >
            <span className="text-amigo-black font-bold text-xl">A</span>
          </Motion.div>

          {/* Separator */}
          <div className="w-8 h-0.5 bg-amigo-gray rounded-full"></div>

          {/* Price Feed Toggle */}
          <Motion.div
            whileHover={{ scale: 1.05, borderRadius: "35%" }}
            onClick={() => setShowPrices(!showPrices)}
            className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
              showPrices
                ? "bg-amigo-green text-amigo-black"
                : "bg-amigo-gray hover:bg-amigo-green hover:text-amigo-black text-amigo-white"
            }`}
          >
            <span className="text-lg">📊</span>
          </Motion.div>
        </div>
      </div>

      {/* Channel List (Sidebar) */}
      <AnimatePresence>
        <Motion.div
          initial={false}
          animate={{ width: showSidebar ? 240 : 0 }}
          className={`${
            showSidebar ? "block" : "hidden"
          } md:flex flex-col w-60 bg-amigo-gray border-r border-amigo-gray-light relative z-30`}
        >
          {/* Server Header */}
          <div className="h-16 px-4 flex items-center border-b border-amigo-gray-light shadow-sm">
            <h1 className="text-amigo-white font-bold font-mono text-lg truncate">
              AmigosChat
            </h1>
            <button
              onClick={() => setShowSidebar(false)}
              className="md:hidden ml-auto p-1 text-amigo-gray-light hover:text-amigo-white rounded"
            >
              ✕
            </button>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-2">
              <div className="flex items-center px-2 py-1 text-amigo-gray-light font-mono text-xs font-semibold uppercase tracking-wide">
                <span className="mr-1">#</span>
                Text Channels
              </div>

              <Motion.div
                whileHover={{ backgroundColor: "rgba(78, 93, 148, 0.1)" }}
                className="flex items-center px-2 py-1 mx-2 rounded text-amigo-white font-mono text-sm cursor-pointer"
              >
                <span className="mr-2 text-amigo-gray-light">#</span>
                general
                <div className="ml-auto w-2 h-2 bg-amigo-green rounded-full"></div>
              </Motion.div>
            </div>
          </div>

          {/* User Panel */}
          <div className="h-16 bg-amigo-gray-light border-t border-amigo-gray px-2 flex items-center">
            <div className="flex items-center flex-1 min-w-0">
              <img
                src="/logo.png"
                alt="Avatar"
                className="w-8 h-8 rounded-full border border-amigo-green"
              />
              <div className="ml-2 flex-1 min-w-0">
                <div className="text-amigo-white font-mono text-sm font-semibold truncate">
                  You
                </div>
                <div className="text-amigo-gray-light font-mono text-xs truncate">
                  {address
                    ? `${address.slice(0, 6)}...${address.slice(-4)}`
                    : ""}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowUserList(!showUserList)}
              className="p-1 text-amigo-gray-light hover:text-amigo-white rounded"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </button>
          </div>
        </Motion.div>
      </AnimatePresence>

      {/* Mobile Overlay */}
      {showSidebar && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="h-16 bg-amigo-gray border-b border-amigo-gray-light px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 text-amigo-gray-light hover:text-amigo-white rounded mr-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <span className="text-amigo-gray-light mr-2 text-xl">#</span>
            <h2 className="text-amigo-white font-bold font-mono text-lg">
              general
            </h2>

            <div className="hidden sm:block ml-4 text-amigo-gray-light font-mono text-sm">
              Welcome to #general
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-amigo-gray-light font-mono text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              {(users || []).length} online
            </div>

            <button
              onClick={() => setShowUserList(!showUserList)}
              className="hidden lg:block p-2 text-amigo-gray-light hover:text-amigo-white rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Container */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loadingMessages ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex space-x-3">
                      <div className="w-10 h-10 bg-amigo-gray rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="w-32 h-4 bg-amigo-gray rounded animate-pulse"></div>
                        <div className="w-full h-4 bg-amigo-gray rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-amigo-white font-mono text-xl font-bold mb-2">
                    Welcome to #general!
                  </h3>
                  <p className="text-amigo-gray-light font-mono max-w-md">
                    This is the beginning of the general channel. Start the
                    conversation!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(messages || [])
                    .filter((message) => message && message.sender)
                    .map((message, index) => {
                      const user = getUserByAddress(message.sender);
                      const isCurrentUser =
                        message.sender &&
                        address &&
                        message.sender.toLowerCase() === address.toLowerCase();

                      // Check if this is a price update message
                      const isPriceUpdate =
                        message.content &&
                        message.content.includes("🤖 **Price Update");

                      return (
                        <Motion.div
                          key={`${message.messageId}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex space-x-3 p-2 rounded-lg group transition-colors duration-150 ${
                            isPriceUpdate
                              ? "bg-gradient-to-r from-amigo-green/10 to-amigo-green/5 border border-amigo-green/20"
                              : "hover:bg-amigo-gray/5"
                          }`}
                        >
                          <img
                            src={
                              isPriceUpdate
                                ? "/logo.png"
                                : getIPFSUrl(user?.ipfsProfilePicHash) ||
                                  "/logo.png"
                            }
                            alt={
                              isPriceUpdate
                                ? "Price Bot"
                                : user?.username || "Unknown"
                            }
                            className={`w-10 h-10 rounded-full object-cover border ${
                              isPriceUpdate
                                ? "border-amigo-green"
                                : "border-amigo-gray-light"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline space-x-2 mb-1">
                              <span
                                className={`font-mono font-semibold text-sm ${
                                  isPriceUpdate
                                    ? "text-amigo-green"
                                    : isCurrentUser
                                    ? "text-amigo-green"
                                    : "text-amigo-white"
                                }`}
                              >
                                {isPriceUpdate
                                  ? "Price Bot"
                                  : user?.username || "Unknown"}
                              </span>
                              {isPriceUpdate && (
                                <span className="bg-amigo-green/20 text-amigo-green px-2 py-0.5 rounded text-xs font-mono">
                                  BOT
                                </span>
                              )}
                              <span className="text-amigo-gray-light font-mono text-xs">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                            <div className="text-amigo-white font-mono text-sm break-words leading-relaxed">
                              {isPriceUpdate ? (
                                <PriceUpdateMessage content={message.content} />
                              ) : (
                                message.content
                              )}
                            </div>
                          </div>
                        </Motion.div>
                      );
                    })}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-amigo-gray">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Message #general"
                    className="w-full px-4 py-3 bg-amigo-gray-light border border-amigo-gray rounded-lg text-amigo-white font-mono placeholder-amigo-gray-light focus:border-amigo-green focus:outline-none transition-colors"
                    maxLength="1000"
                    disabled={isSending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!messageInput.trim() || isSending}
                  className="px-4 py-3 bg-amigo-green text-amigo-black font-mono font-semibold rounded-lg hover:bg-amigo-green/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-amigo-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Send"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar - Members & Price Feeds */}
          <AnimatePresence>
            {showUserList && (
              <Motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 240, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden lg:flex bg-amigo-gray border-l border-amigo-gray-light flex-col overflow-hidden"
              >
                {/* Members Section */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 border-b border-amigo-gray-light">
                    <h3 className="text-amigo-gray-light font-mono text-xs font-semibold uppercase tracking-wide">
                      Members — {(users || []).length}
                    </h3>
                  </div>

                  <div className="p-2 space-y-1">
                    {loadingUsers ? (
                      <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center space-x-2 p-2"
                          >
                            <div className="w-8 h-8 bg-amigo-gray-light rounded-full animate-pulse"></div>
                            <div className="w-20 h-3 bg-amigo-gray-light rounded animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      (users || [])
                        .filter((user) => user && user.address)
                        .map((user) => (
                          <div
                            key={user.address}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-amigo-gray-light/30 cursor-pointer transition-colors"
                          >
                            <div className="relative">
                              <img
                                src={
                                  getIPFSUrl(user.ipfsProfilePicHash) ||
                                  "/logo.png"
                                }
                                alt={user.username || "Unknown"}
                                className="w-8 h-8 rounded-full object-cover border border-amigo-gray"
                              />
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-amigo-gray"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-amigo-white font-mono text-sm truncate">
                                {user.username || "Unknown"}
                                {user.address === address && (
                                  <span className="text-amigo-green text-xs ml-1">
                                    (you)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Price Feeds Section */}
                <AnimatePresence>
                  {showPrices && (
                    <Motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-amigo-gray-light overflow-hidden"
                    >
                      <div className="p-3">
                        <h3 className="text-amigo-gray-light font-mono text-xs font-semibold uppercase tracking-wide mb-3">
                          Live Prices
                        </h3>

                        {loadingPrices ? (
                          <div className="space-y-2">
                            {["BTC", "ETH", "LINK"].map((symbol) => (
                              <div
                                key={symbol}
                                className="bg-amigo-gray-light p-2 rounded"
                              >
                                <div className="w-16 h-3 bg-amigo-gray rounded animate-pulse mb-1"></div>
                                <div className="w-20 h-4 bg-amigo-gray rounded animate-pulse"></div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <PriceCard symbol="BTC" price={prices.btc} />
                            <PriceCard symbol="ETH" price={prices.eth} />
                            <PriceCard symbol="LINK" price={prices.link} />

                            <div className="space-y-1 pt-2">
                              <button
                                onClick={fetchPrices}
                                className="w-full text-amigo-gray-light hover:text-amigo-white font-mono text-xs py-2 transition-colors"
                              >
                                🔄 Refresh
                              </button>

                              <button
                                onClick={() => {
                                  if (
                                    prices &&
                                    (prices.btc || prices.eth || prices.link)
                                  ) {
                                    const priceMessage =
                                      formatPriceMessage(prices);
                                    sendMessage(priceMessage);
                                    setTimeout(() => refetchMessages(), 2000);
                                  }
                                }}
                                disabled={
                                  !prices ||
                                  (!prices.btc &&
                                    !prices.eth &&
                                    !prices.link) ||
                                  isSending
                                }
                                className="w-full text-amigo-green hover:text-amigo-white font-mono text-xs py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                📢 Post to Chat
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Price Update Message Component - Special formatting for bot messages
const PriceUpdateMessage = ({ content }) => {
  // Parse the price update message
  const lines = content.split("\n");
  const header = lines[0]; // "🤖 **Price Update 10:30 AM** 📊"
  const prices = lines.slice(2, -2).filter((line) => line.trim()); // Price lines
  const footer = lines[lines.length - 1]; // "📡 Powered by Chainlink Oracles"

  return (
    <div className="bg-amigo-gray/30 rounded-lg p-3 border border-amigo-green/30">
      {/* Header */}
      <div className="flex items-center justify-center mb-3">
        <span className="text-amigo-green font-mono font-bold text-sm">
          {header.replace(/\*\*/g, "")}
        </span>
      </div>

      {/* Price Grid */}
      <div className="grid grid-cols-1 gap-2 mb-3">
        {prices.map((price, index) => {
          const parts = price.split(": $");
          if (parts.length !== 2) return null;

          const [symbol, value] = parts;
          const cleanSymbol = symbol.trim();
          const cleanValue = value.replace(/,/g, "");

          return (
            <div
              key={index}
              className="flex items-center justify-between bg-amigo-black/50 rounded px-3 py-2"
            >
              <span className="text-amigo-white font-mono text-sm font-semibold">
                {cleanSymbol}
              </span>
              <span className="text-amigo-green font-mono text-sm font-bold">
                $
                {(() => {
                  try {
                    const num = parseFloat(cleanValue);
                    return isNaN(num) ? cleanValue : num.toLocaleString();
                  } catch {
                    return cleanValue;
                  }
                })()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center text-amigo-gray-light font-mono text-xs">
        {footer}
      </div>
    </div>
  );
};

// Enhanced Price Card Component
const PriceCard = ({ symbol, price }) => {
  const formatPrice = (price) => {
    if (!price) return "N/A";

    try {
      // Handle BigInt conversion safely
      const priceStr =
        typeof price === "bigint" ? price.toString() : String(price);
      const num = parseFloat(priceStr);

      if (isNaN(num)) return "N/A";

      return num.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (error) {
      console.error("Error formatting price in PriceCard:", error);
      return "N/A";
    }
  };

  const getIcon = (symbol) => {
    switch (symbol) {
      case "BTC":
        return "₿";
      case "ETH":
        return "Ξ";
      case "LINK":
        return "🔗";
      default:
        return "💰";
    }
  };

  return (
    <div className="bg-amigo-gray-light p-2 rounded border-l-2 border-amigo-green transition-all hover:bg-amigo-gray">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <span className="text-sm">{getIcon(symbol)}</span>
          <span className="text-amigo-white font-mono text-xs font-semibold">
            {symbol}
          </span>
        </div>
        <span className="text-amigo-green font-mono text-xs font-bold">
          {formatPrice(price)}
        </span>
      </div>
    </div>
  );
};

export default ChatPage;
