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
      await sendMessage(messageInput.trim());
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
    return users.find(
      (user) => user.address.toLowerCase() === userAddress.toLowerCase()
    );
  };

  return (
    <div className="h-screen flex bg-amigo-black relative">
      {/* Left Sidebar - User List */}
      <div className="hidden md:flex w-64 bg-amigo-gray border-r border-amigo-gray-light flex-col">
        {/* Header */}
        <div className="p-4 border-b border-amigo-gray-light">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="AmigoChat" className="w-8 h-8" />
            <h1 className="text-amigo-green font-bold font-mono">AmigosChat</h1>
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-amigo-white font-mono font-bold mb-3 text-sm uppercase tracking-wide">
            Online Amigos ({users.length})
          </h2>

          {loadingUsers ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <div className="w-8 h-8 bg-amigo-gray-light rounded-full animate-pulse"></div>
                  <div className="w-20 h-4 bg-amigo-gray-light rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((user) => (
                <div
                  key={user.address}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-amigo-gray-light transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={getIPFSUrl(user.ipfsProfilePicHash) || "/logo.png"}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border border-amigo-green"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-amigo-green rounded-full border border-amigo-gray"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-amigo-white font-mono text-sm font-medium truncate">
                      {user.username}
                    </p>
                    <p className="text-amigo-gray-light font-mono text-xs truncate">
                      {user.address === address
                        ? "You"
                        : `${user.address.slice(0, 6)}...${user.address.slice(
                            -4
                          )}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Feed Toggle */}
        <div className="p-4 border-t border-amigo-gray-light">
          <button
            onClick={() => {
              setShowPrices(!showPrices);
              if (!showPrices) fetchPrices();
            }}
            className="btn btn-ghost w-full text-sm"
          >
            📊 {showPrices ? "Hide" : "Show"} Prices
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Logo and User Count */}
        <div className="md:hidden bg-amigo-gray border-b border-amigo-gray-light p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="AmigoChat" className="w-6 h-6" />
              <h1 className="text-amigo-green font-bold font-mono text-sm">
                AmigosChat
              </h1>
            </div>
            <div className="text-amigo-white font-mono text-xs">
              {users.length} amigos online
            </div>
          </div>
        </div>

        {/* Chat Header */}
        <div className="bg-amigo-gray border-b border-amigo-gray-light p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-amigo-green font-mono font-bold text-lg">
                # general
              </h2>
              <p className="text-amigo-gray-light font-mono text-sm">
                Decentralized chat for all amigos
              </p>
            </div>
            <div className="text-amigo-gray-light font-mono text-sm">
              {messages.length} messages
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-10 h-10 bg-amigo-gray rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-amigo-gray rounded animate-pulse"></div>
                    <div className="w-full h-4 bg-amigo-gray rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-amigo-gray-light font-mono py-8">
              <div className="text-4xl mb-4">💬</div>
              <p>No messages yet. Be the first to say hello!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const user = getUserByAddress(message.sender);
              const isCurrentUser =
                message.sender.toLowerCase() === address.toLowerCase();

              return (
                <Motion.div
                  key={`${message.messageId}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex space-x-3 group hover:bg-amigo-gray hover:bg-opacity-30 p-2 rounded-lg transition-colors"
                >
                  <img
                    src={getIPFSUrl(user?.ipfsProfilePicHash) || "/logo.png"}
                    alt={user?.username || "Unknown"}
                    className="w-10 h-10 rounded-full object-cover border border-amigo-green flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span
                        className={`font-mono font-bold text-sm ${
                          isCurrentUser
                            ? "text-amigo-green"
                            : "text-amigo-white"
                        }`}
                      >
                        {user?.username || "Unknown"}
                      </span>
                      {isCurrentUser && (
                        <span className="text-amigo-green font-mono text-xs">
                          (You)
                        </span>
                      )}
                      <span className="text-amigo-gray-light font-mono text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-amigo-white font-mono text-sm break-words">
                      {message.content}
                    </p>
                  </div>
                </Motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-amigo-gray border-t border-amigo-gray-light p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Message #general"
              className="input flex-1"
              maxLength="1000"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!messageInput.trim() || isSending}
              className="btn btn-primary px-6"
            >
              {isSending ? <ButtonLoader /> : "Send"}
            </button>
          </form>
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
