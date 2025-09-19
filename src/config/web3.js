/* eslint-disable no-unused-vars */
// Web3 configuration for AmigoChat dApp
// This file sets up RainbowKit wallet connection and wagmi configuration

import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { sepolia, mainnet } from "wagmi/chains";
import { http } from "wagmi";

// Get environment variables for configuration
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;

// Validate required environment variables
if (!projectId) {
  console.error(
    "VITE_WALLETCONNECT_PROJECT_ID is not defined in environment variables"
  );
  throw new Error("Missing VITE_WALLETCONNECT_PROJECT_ID");
}

if (!alchemyKey) {
  console.error("VITE_ALCHEMY_API_KEY is not defined in environment variables");
  throw new Error("Missing VITE_ALCHEMY_API_KEY");
}

// Configure supported blockchain networks
// We're primarily using Sepolia testnet for development
const chains = [
  sepolia, // Primary testnet for development
  ...(import.meta.env.VITE_NODE_ENV === "production" ? [mainnet] : []), // Add mainnet in production
];

// Configure supported wallets for the dApp (handled automatically by getDefaultConfig)
// const connectors = connectorsForWallets([
//   {
//     groupName: "Recommended",
//     wallets: [
//       metaMaskWallet({ projectId, chains }), // MetaMask - most popular wallet
//       rainbowWallet({ projectId, chains }), // Rainbow wallet - great UX
//       coinbaseWallet({ appName: "AmigoChat", chains }), // Coinbase wallet
//       walletConnectWallet({ projectId, chains }), // WalletConnect for mobile wallets
//     ],
//   },
// ]);

// Create wagmi configuration using the new getDefaultConfig
const wagmiConfig = getDefaultConfig({
  appName: "AmigoChat",
  projectId: projectId,
  chains: chains,
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`),
    ...(import.meta.env.VITE_NODE_ENV === "production"
      ? {
          [mainnet.id]: http(
            `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
          ),
        }
      : {}),
  },
  ssr: false,
});

// Export configuration for use in the app
export { chains, wagmiConfig };

// RainbowKit theme configuration to match our app's design
export const rainbowKitTheme = {
  colors: {
    accentColor: "#00ff00", // Amigo green for accent
    accentColorForeground: "#000000", // Black text on green background
    modalBackground: "#000000", // Black modal background
    modalBorder: "#00ff00", // Green modal border
    modalText: "#ffffff", // White text in modals
  },
  fonts: {
    body: "Fira Code, Monaco, Consolas, Liberation Mono, Courier New, monospace", // Monospace fonts
  },
  radii: {
    modal: "12px", // Slightly more rounded for modals
    connectButton: "8px",
  },
};

// Export the main wagmi configuration
export default wagmiConfig;
