// Main entry point for AmigoChat dApp
// Renders the React application with proper error boundaries

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Error boundary component for better error handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amigo-black text-amigo-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-amigo-green mb-4 text-center">
              Oops! Something went wrong
            </h1>
            <p className="text-amigo-gray-light mb-4">
              An error occurred while loading AmigoChat.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create root and render the application
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
