// Registration Page - User onboarding with profile creation
// Handles username selection and profile picture upload via IPFS

import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { motion as Motion } from "framer-motion";
import {
  useUsernameAvailability,
  useRegisterUser,
  useIsUserRegistered,
} from "../hooks/useAmigoContract.js";
import {
  uploadToIPFS,
  createFilePreview,
  cleanupFilePreview,
  getFileInfo,
  resizeImage,
} from "../utils/ipfs.js";
import { ButtonLoader } from "../components/LoadingSpinner.jsx";

/**
 * Registration Page Component
 * Allows new users to create their AmigoChat profile
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const fileInputRef = useRef(null);

  // Registration form state
  const [formData, setFormData] = useState({
    username: "",
    profilePicture: null,
    ipfsHash: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [step, setStep] = useState(1); // 1: Picture, 2: Username, 3: Confirm

  // Custom hooks for contract interaction
  const {
    checkAvailability,
    isAvailable,
    isChecking,
    // eslint-disable-next-line no-unused-vars
    error: availabilityError,
  } = useUsernameAvailability();
  const {
    registerUser,
    isPending: isRegistering,
    isConfirming,
    isConfirmed: registerSuccess,
    error: registerError,
  } = useRegisterUser();
  const { refetch: refetchRegistrationStatus } = useIsUserRegistered();

  // Handle file selection for profile picture
  const handleFileSelect = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Clean up previous preview
      if (previewUrl) {
        cleanupFilePreview(previewUrl);
      }

      try {
        // Validate file
        const fileInfo = getFileInfo(file);
        if (!fileInfo.isImage) {
          setUploadError("Please select an image file");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          // 5MB limit
          setUploadError("File size must be less than 5MB");
          return;
        }

        // Create preview
        const preview = createFilePreview(file);
        setPreviewUrl(preview);

        // Resize image for optimization
        const resizedFile = await resizeImage(file, 400, 400, 0.8);

        setFormData((prev) => ({
          ...prev,
          profilePicture: resizedFile,
        }));

        setUploadError("");
        setStep(2); // Move to username step
      } catch (error) {
        console.error("File processing error:", error);
        setUploadError("Error processing image. Please try another file.");
      }
    },
    [previewUrl]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        // Simulate file input change
        const mockEvent = { target: { files: [file] } };
        handleFileSelect(mockEvent);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  // Handle username input
  const handleUsernameChange = useCallback((event) => {
    const username = event.target.value.toLowerCase().replace(/[^a-z0-9]/g, "");
    setFormData((prev) => ({ ...prev, username }));
  }, []);

  // Debounced username availability check
  React.useEffect(() => {
    if (formData.username.length >= 3) {
      const timeoutId = setTimeout(() => {
        checkAvailability(formData.username);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.username, checkAvailability]);
  //   console.log("Checking for Availability", handleUsernameChange);
  // Upload to IPFS and register user
  const handleRegistration = useCallback(async () => {
    if (!formData.profilePicture || !formData.username) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadError("");

      // Upload image to IPFS
      const uploadResult = await uploadToIPFS(
        formData.profilePicture,
        `${formData.username}-profile`
      );

      // Update form data with IPFS hash
      const ipfsHash = uploadResult.ipfsHash;
      setFormData((prev) => ({ ...prev, ipfsHash }));
      console.log("Uploaded to IPFS:", ipfsHash);
      // Register user on blockchain
      await registerUser(formData.username, `ipfs://${ipfsHash}`);
    } catch (error) {
      console.error("Registration error:", error);
      setUploadError(error.message || "Registration failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [formData, registerUser]);

  // Handle successful registration
  React.useEffect(() => {
    if (registerSuccess) {
      // Clean up preview URL
      if (previewUrl) {
        cleanupFilePreview(previewUrl);
      }

      // Refetch registration status to ensure cache is updated
      const performRedirect = async () => {
        try {
          await refetchRegistrationStatus();
          // Wait a bit more to ensure the blockchain state is updated
          setTimeout(() => {
            navigate("/chat", { replace: true });
          }, 1000);
        } catch (error) {
          console.error("Error refetching registration status:", error);
          // Fallback: navigate anyway after longer delay
          setTimeout(() => {
            navigate("/chat", { replace: true });
          }, 3000);
        }
      };

      // Start the refetch and redirect process after initial delay
      setTimeout(performRedirect, 1500);
    }
  }, [registerSuccess, navigate, previewUrl, refetchRegistrationStatus]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  // Show success message
  if (registerSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl md:text-3xl font-bold text-amigo-green mb-2">
            Welcome to AmigosChat!
          </h2>
          <p className="text-amigo-gray-light mb-4 text-sm md:text-base">
            Your registration was successful. Redirecting to chat...
          </p>
          <div className="animate-pulse text-amigo-green">●●●</div>
        </Motion.div>
      </div>
    );
  }

  // Show transaction confirming state
  if (isConfirming) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl md:text-3xl font-bold text-amigo-green mb-2">
            Confirming Registration
          </h2>
          <p className="text-amigo-gray-light mb-4 text-sm md:text-base">
            Your transaction is being confirmed on the blockchain...
          </p>
          <div className="animate-pulse text-amigo-green">●●●</div>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Motion.div
        className="w-full max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <Motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amigo-green mb-2">
            Join AmigosChat
          </h1>
          <p className="text-amigo-gray-light font-mono">
            Create your decentralized identity
          </p>

          {/* Progress indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 1 ? "bg-amigo-green" : "bg-amigo-gray"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 2 ? "bg-amigo-green" : "bg-amigo-gray"
              }`}
            ></div>
            <div
              className={`w-3 h-3 rounded-full ${
                step >= 3 ? "bg-amigo-green" : "bg-amigo-gray"
              }`}
            ></div>
          </div>
        </Motion.div>

        <Motion.div variants={itemVariants} className="card">
          {/* Step 1: Profile Picture Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-amigo-white text-center">
                Choose Your amigo avatar
              </h2>

              {/* File upload area */}
              <div
                className="border-2 border-dashed border-amigo-gray-light rounded-lg p-8 text-center cursor-pointer hover:border-amigo-green transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-amigo-green"
                    />
                    <p className="text-amigo-green font-mono text-sm">
                      Perfect! Click to change or continue below.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-4xl">📷</div>
                    <div>
                      <p className="text-amigo-white font-mono font-bold">
                        Drop your image here
                      </p>
                      <p className="text-amigo-gray-light font-mono text-sm">
                        or click to browse
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {uploadError && (
                <p className="text-red-500 font-mono text-sm text-center">
                  {uploadError}
                </p>
              )}

              {formData.profilePicture && (
                <button
                  onClick={() => setStep(2)}
                  className="btn btn-primary w-full"
                >
                  Continue →
                </button>
              )}
            </div>
          )}

          {/* Step 2: Username Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-amigo-white text-center">
                Choose Your .amigo Name
              </h2>

              {/* Preview avatar */}
              {previewUrl && (
                <div className="flex justify-center">
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-amigo-green"
                  />
                </div>
              )}

              {/* Username input */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={handleUsernameChange}
                    placeholder="yourname"
                    className="input pr-20"
                    maxLength="20"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amigo-green font-mono">
                    .amigo
                  </span>
                </div>

                {/* Username validation feedback */}
                {formData.username.length >= 3 && (
                  <div className="text-sm font-mono">
                    {isChecking ? (
                      <div className="flex items-center space-x-2 text-amigo-gray-light">
                        <div className="w-3 h-3 border border-amigo-green border-t-transparent rounded-full animate-spin"></div>
                        <span>Checking availability...</span>
                      </div>
                    ) : isAvailable !== null ? (
                      isAvailable ? (
                        <div className="text-amigo-green">
                          ✅ {formData.username}.amigo is available!
                        </div>
                      ) : (
                        <div className="text-red-500">
                          ❌ {formData.username}.amigo is taken
                        </div>
                      )
                    ) : null}
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="text-xs font-mono text-amigo-gray-light space-y-1">
                <p>Requirements:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>3-20 characters</li>
                  <li>Letters and numbers only</li>
                  <li>Must be unique</li>
                </ul>
              </div>

              {/* Navigation buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-ghost flex-1"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!isAvailable || formData.username.length < 3}
                  className="btn btn-primary flex-1"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-amigo-white text-center">
                Confirm Your Profile
              </h2>

              {/* Profile preview */}
              <div className="text-center space-y-4">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-amigo-green"
                  />
                )}
                <div>
                  <p className="text-amigo-green font-mono font-bold text-lg">
                    {formData.username}.amigo
                  </p>
                  <p className="text-amigo-gray-light font-mono text-sm">
                    {address}
                  </p>
                </div>
              </div>

              {/* Registration info */}
              <div className="bg-amigo-gray p-4 rounded-lg space-y-2 text-sm font-mono">
                <h3 className="text-amigo-green font-bold">
                  What happens next:
                </h3>
                <ul className="text-amigo-gray-light space-y-1">
                  <li>• Your Picture will be Uploaded to IPFS</li>
                  <li>• You will be registered on Ethereum blockchain</li>
                  <li>• Your AmigoChat identity secured</li>
                  <li>• Join the decentralized community</li>
                </ul>
              </div>

              {/* Error display */}
              {(uploadError || registerError) && (
                <div className="bg-red-900 border border-red-500 p-3 rounded-lg">
                  <p className="text-red-300 font-mono text-sm">
                    {uploadError ||
                      registerError?.message ||
                      "Registration failed"}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={isUploading || isRegistering}
                  className="btn btn-ghost flex-1"
                >
                  ← Back
                </button>
                <button
                  onClick={handleRegistration}
                  disabled={isUploading || isRegistering}
                  className="btn btn-primary flex-1"
                >
                  {isUploading || isRegistering ? (
                    <ButtonLoader />
                  ) : (
                    <>🚀 Register</>
                  )}
                </button>
              </div>
            </div>
          )}
        </Motion.div>

        {/* Help text */}
        <Motion.div variants={itemVariants} className="text-center mt-6">
          <p className="text-amigo-gray-light font-mono text-sm">
            Need help? Your registration is permanent on the blockchain.
          </p>
        </Motion.div>
      </Motion.div>
    </div>
  );
};

export default RegisterPage;
