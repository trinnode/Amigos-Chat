// IPFS utilities for uploading and managing files
// Uses Pinata service for reliable IPFS pinning

import axios from "axios";

// Pinata configuration from environment variables
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_API_URL =
  import.meta.env.VITE_PINATA_API_URL ||
  "https://api.pinata.cloud/pinning/pinFileToIPFS";
const IPFS_GATEWAY =
  import.meta.env.VITE_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs/";

/**
 * Upload a file to IPFS using Pinata service
 * @param {File} file - The file to upload (image for profile picture)
 * @param {string} fileName - Optional custom filename
 * @returns {Promise<Object>} Upload result with IPFS hash and URL
 */
export const uploadToIPFS = async (file, fileName = null) => {
  // Validate input file
  if (!file) {
    throw new Error("No file provided for upload");
  }

  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  // Check file size (limit to 5MB for profile pictures)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }

  // Validate Pinata configuration
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT token not configured");
  }

  try {
    // Create FormData for file upload
    const formData = new FormData();

    // Use custom filename or original filename
    const uploadFileName =
      fileName || file.name || `amigo-profile-${Date.now()}`;
    formData.append("file", file, uploadFileName);

    // Add metadata for better organization
    const metadata = JSON.stringify({
      name: uploadFileName,
      keyvalues: {
        uploadedBy: "AmigoChat",
        uploadDate: new Date().toISOString(),
        fileType: "profile-picture",
        originalSize: file.size,
      },
    });
    formData.append("pinataMetadata", metadata);

    // Add pinning options
    const options = JSON.stringify({
      cidVersion: 1, // Use CIDv1 for better compatibility
    });
    formData.append("pinataOptions", options);

    // Upload to Pinata
    const response = await axios.post(PINATA_API_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      timeout: 30000, // 30 second timeout
    });

    // Extract IPFS hash from response
    const { IpfsHash, PinSize, Timestamp } = response.data;

    // Return upload result
    return {
      success: true,
      ipfsHash: IpfsHash,
      ipfsUrl: `ipfs://${IpfsHash}`,
      gatewayUrl: `${IPFS_GATEWAY}${IpfsHash}`,
      pinSize: PinSize,
      timestamp: Timestamp,
      fileName: uploadFileName,
    };
  } catch (error) {
    console.error("IPFS upload error:", error);

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(
        `Upload failed (${status}): ${data.message || "Unknown error"}`
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error("Upload failed: No response from server");
    } else {
      // Something else happened
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
};

/**
 * Get the full URL for an IPFS hash
 * @param {string} ipfsHash - The IPFS hash (with or without ipfs:// prefix)
 * @returns {string} Full gateway URL for the file
 */
export const getIPFSUrl = (ipfsHash) => {
  if (!ipfsHash) {
    return null;
  }

  // Remove ipfs:// prefix if present
  const cleanHash = ipfsHash.replace("ipfs://", "");

  // Return full gateway URL
  return `${IPFS_GATEWAY}${cleanHash}`;
};

/**
 * Validate if a string is a valid IPFS hash
 * @param {string} hash - The hash to validate
 * @returns {boolean} True if valid IPFS hash
 */
export const isValidIPFSHash = (hash) => {
  if (!hash || typeof hash !== "string") {
    return false;
  }

  // Remove ipfs:// prefix if present
  const cleanHash = hash.replace("ipfs://", "");

  // Check if it matches IPFS hash pattern (simplified validation)
  // CIDv0: starts with Qm and is 46 characters
  // CIDv1: starts with b and is longer
  const cidv0Pattern = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
  const cidv1Pattern = /^b[a-z2-7]{58,}$/;

  return cidv0Pattern.test(cleanHash) || cidv1Pattern.test(cleanHash);
};

/**
 * Create a preview URL for a file before uploading
 * @param {File} file - The file to create preview for
 * @returns {string} Object URL for preview
 */
export const createFilePreview = (file) => {
  if (!file || !file.type.startsWith("image/")) {
    return null;
  }

  return URL.createObjectURL(file);
};

/**
 * Clean up a file preview URL to prevent memory leaks
 * @param {string} previewUrl - The preview URL to clean up
 */
export const cleanupFilePreview = (previewUrl) => {
  if (previewUrl && previewUrl.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
};

/**
 * Get file information without uploading
 * @param {File} file - The file to analyze
 * @returns {Object} File information
 */
export const getFileInfo = (file) => {
  if (!file) {
    return null;
  }

  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    isImage: file.type.startsWith("image/"),
    sizeFormatted: formatFileSize(file.size),
  };
};

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Resize an image file before uploading (optional optimization)
 * @param {File} file - The image file to resize
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<File>} Resized image file
 */
export const resizeImage = async (
  file,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.8
) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File must be an image"));
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and resize image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create new file from blob
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            reject(new Error("Failed to resize image"));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Load the image
    img.src = URL.createObjectURL(file);
  });
};
