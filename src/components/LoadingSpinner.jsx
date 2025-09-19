// Loading spinner component with AmigoChat theming
// Provides visual feedback during async operations

import React from "react";

/**
 * LoadingSpinner Component
 * Customizable loading indicator with green glow effect
 *
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner: 'small', 'medium', 'large'
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.overlay - Whether to show as overlay
 */
const LoadingSpinner = ({
  size = "medium",
  className = "",
  message = "",
  overlay = false,
}) => {
  // Size configurations
  const sizeClasses = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-2",
    large: "w-12 h-12 border-4",
  };

  const spinnerClasses = `
    inline-block
    border-transparent
    border-t-amigo-green
    rounded-full
    animate-spin
    ${sizeClasses[size]}
    ${className}
  `;

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      {/* Spinning circle */}
      <div className={spinnerClasses}></div>

      {/* Optional loading message */}
      {message && (
        <p className="mt-2 text-amigo-green font-mono text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  // Return as overlay if requested
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-amigo-gray p-6 rounded-lg border border-amigo-green glow-green">
          {spinner}
        </div>
      </div>
    );
  }

  // Return simple spinner
  return spinner;
};

/**
 * FullPageLoader Component
 * Full screen loading indicator for page transitions
 */
export const FullPageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amigo-black px-4">
      <div className="text-center max-w-sm w-full">
        <LoadingSpinner size="large" />
        <h2 className="mt-6 text-lg md:text-xl font-mono text-amigo-white">
          {message}
        </h2>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-amigo-green rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-amigo-green rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
          <div
            className="w-2 h-2 bg-amigo-green rounded-full animate-pulse"
            style={{ animationDelay: "0.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

/**
 * InlineLoader Component
 * Small loading indicator for buttons or inline content
 */
export const InlineLoader = ({ message = "" }) => {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="small" />
      {message && (
        <span className="text-sm font-mono text-amigo-green">{message}</span>
      )}
    </div>
  );
};

/**
 * ButtonLoader Component
 * Loading state for buttons
 */
export const ButtonLoader = () => {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size="small" />
      <span>Processing...</span>
    </div>
  );
};

export default LoadingSpinner;
