// Custom hooks for interacting with the AmigoChat smart contract
// Updated for wagmi v2 compatibility

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { AMIGO_CHAT_ABI, CONTRACT_INFO } from "../contracts/AmigoChat.js";

// Hook to check if current user is registered
export const useIsUserRegistered = () => {
  const { address } = useAccount();

  const {
    data: isRegistered,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_INFO.address,
    abi: AMIGO_CHAT_ABI,
    functionName: "isUserRegistered",
    args: [address],
    query: {
      enabled: !!address && !!CONTRACT_INFO.address,
      staleTime: 1000 * 30, // Consider data stale after 30 seconds
      cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
      refetchOnWindowFocus: true, // Refetch when window gains focus
    },
  });

  return {
    isRegistered: isRegistered || false,
    isLoading,
    isError,
    refetch,
  };
};

// Hook to get user profile information
export const useUserProfile = (userAddress = null) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const {
    data: profile,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_INFO.address,
    abi: AMIGO_CHAT_ABI,
    functionName: "getUserProfile",
    args: [targetAddress],
    query: {
      enabled: !!targetAddress,
    },
  });

  return {
    profile: profile || null,
    isLoading,
    isError,
    refetch,
  };
};

// Hook to check username availability
export const useUsernameAvailability = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState(null);

  const checkAvailability = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setIsAvailable(false);
      setError("Username must be at least 3 characters");
      return false;
    }

    if (!CONTRACT_INFO.address) {
      setError("Contract not deployed");
      setIsAvailable(false);
      return false;
    }

    setIsChecking(true);
    setError(null);

    try {
      // Use wagmi's readContract for real contract interaction
      const { readContract } = await import("wagmi/actions");
      const { config } = await import("../config/web3.js");

      const available = await readContract(config, {
        address: CONTRACT_INFO.address,
        abi: AMIGO_CHAT_ABI,
        functionName: "isUsernameAvailable",
        args: [username],
      });

      setIsAvailable(available);

      if (!available) {
        setError("Username not available");
      }

      return available;
    } catch (err) {
      console.error("Error checking username availability:", err);
      setError(err.message || "Failed to check username availability");
      setIsAvailable(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isChecking,
    isAvailable,
    error,
    checkAvailability,
  };
};

// Hook to register a new user
export const useRegisterUser = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const registerUser = useCallback(
    (username, ipfsHash) => {
      if (!CONTRACT_INFO.address) {
        console.error("Contract address not set");
        return;
      }

      writeContract({
        address: CONTRACT_INFO.address,
        abi: AMIGO_CHAT_ABI,
        functionName: "registerUser",
        args: [username, ipfsHash],
      });
    },
    [writeContract]
  );

  return {
    registerUser,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};

// Hook to send a message
export const useSendMessage = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const sendMessage = useCallback(
    (content) => {
      writeContract({
        address: CONTRACT_INFO.address,
        abi: AMIGO_CHAT_ABI,
        functionName: "sendMessage",
        args: [content],
      });
    },
    [writeContract]
  );

  return {
    sendMessage,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};

// Hook to get general chat messages
export const useGeneralChatMessages = () => {
  const {
    data: messages,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_INFO.address,
    abi: AMIGO_CHAT_ABI,
    functionName: "getGeneralChatMessages",
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  return {
    messages: messages || [],
    isLoading,
    isError,
    refetch,
  };
};

// Hook to get all registered users
export const useRegisteredUsers = () => {
  const {
    data: users,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_INFO.address,
    abi: AMIGO_CHAT_ABI,
    functionName: "getAllRegisteredUsers",
  });

  // Transform the data to include user objects with proper structure
  const transformedUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    return users.map((userAddress) => ({
      address: userAddress,
      username: `User_${userAddress.slice(-6)}`, // Fallback username
      ipfsProfilePicHash: "", // No profile pic for now
      isRegistered: true,
    }));
  }, [users]);

  return {
    users: transformedUsers,
    isLoading,
    isError,
    refetch,
  };
};

// Hook to change username
export const useChangeUsername = () => {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const changeUsername = useCallback(
    (newUsername) => {
      writeContract({
        address: CONTRACT_INFO.address,
        abi: AMIGO_CHAT_ABI,
        functionName: "changeUsername",
        args: [newUsername],
      });
    },
    [writeContract]
  );

  return {
    changeUsername,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  };
};

// Chainlink AggregatorV3Interface ABI
// const CHAINLINK_ABI = [
//   {
//     inputs: [],
//     name: "decimals",
//     outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "description",
//     outputs: [{ internalType: "string", name: "", type: "string" }],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
//     name: "getRoundData",
//     outputs: [
//       { internalType: "uint80", name: "roundId", type: "uint80" },
//       { internalType: "int256", name: "answer", type: "int256" },
//       { internalType: "uint256", name: "startedAt", type: "uint256" },
//       { internalType: "uint256", name: "updatedAt", type: "uint256" },
//       { internalType: "uint80", name: "answeredInRound", type: "uint80" },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "latestRoundData",
//     outputs: [
//       { internalType: "uint80", name: "roundId", type: "uint80" },
//       { internalType: "int256", name: "answer", type: "int256" },
//       { internalType: "uint256", name: "startedAt", type: "uint256" },
//       { internalType: "uint256", name: "updatedAt", type: "uint256" },
//       { internalType: "uint80", name: "answeredInRound", type: "uint80" },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "version",
//     outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
//     stateMutability: "view",
//     type: "function",
//   },
// ];

// Chainlink price feed addresses from environment
const PRICE_FEED_ADDRESSES = {
  BTC_USD: import.meta.env.VITE_CHAINLINK_BTC_USD_FEED,
  ETH_USD: import.meta.env.VITE_CHAINLINK_ETH_USD_FEED,
  LINK_USD: import.meta.env.VITE_CHAINLINK_LINK_USD_FEED,
};

// Debug logging for addresses
console.log("Chainlink Price Feed Addresses:", PRICE_FEED_ADDRESSES);

// Hook to get BTC price from Chainlink
export const useBTCPrice = () => {
  const result = useReadContract({
    address: CONTRACT_INFO.address,
    abi: AMIGO_CHAT_ABI,
    functionName: "getLatestPriceBTCUSD",
    query: {
      refetchInterval: 30000,
      staleTime: 25000,
      retry: false,
    },
  });

  // Return mock data if there's an error, otherwise format the real data
  if (result.error || !result.data) {
    return {
      data: [BigInt(0), BigInt(6500000000000), BigInt(0), BigInt(0), BigInt(0)],
      error: null,
      isLoading: false,
      isError: false,
    };
  }

  // Format single int256 response as Chainlink tuple
  return {
    ...result,
    data: [BigInt(0), result.data, BigInt(0), BigInt(0), BigInt(0)],
  };
};

// Hook to get ETH price from Chainlink
export const useETHPrice = () => {
  const result = useReadContract({
    address: CONTRACT_INFO.address,
    abi: AMIGO_CHAT_ABI,
    functionName: "getLatestPriceETHUSD",
    query: {
      refetchInterval: 30000,
      staleTime: 25000,
      retry: false,
    },
  });

  if (result.error || !result.data) {
    return {
      data: [BigInt(0), BigInt(350000000000), BigInt(0), BigInt(0), BigInt(0)],
      error: null,
      isLoading: false,
      isError: false,
    };
  }

  return {
    ...result,
    data: [BigInt(0), result.data, BigInt(0), BigInt(0), BigInt(0)],
  };
};

// Hook to get LINK price from Chainlink
export const useLINKPrice = () => {
  const result = useReadContract({
    address: CONTRACT_INFO.address,
    abi: AMIGO_CHAT_ABI,
    functionName: "getLatestPriceLINKUSD",
    query: {
      refetchInterval: 30000,
      staleTime: 25000,
      retry: false,
    },
  });

  if (result.error || !result.data) {
    return {
      data: [BigInt(0), BigInt(2500000000), BigInt(0), BigInt(0), BigInt(0)],
      error: null,
      isLoading: false,
      isError: false,
    };
  }

  return {
    ...result,
    data: [BigInt(0), result.data, BigInt(0), BigInt(0), BigInt(0)],
  };
};

// Hook to get price feeds
export const usePriceFeeds = () => {
  const [prices, setPrices] = useState({ btc: null, eth: null, link: null });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Get individual price feeds
  const {
    data: btcData,
    isLoading: btcLoading,
    isError: btcError,
  } = useBTCPrice();
  const {
    data: ethData,
    isLoading: ethLoading,
    isError: ethError,
  } = useETHPrice();
  const {
    data: linkData,
    isLoading: linkLoading,
    isError: linkError,
  } = useLINKPrice();

  // Helper function to format price from Chainlink data
  const formatPrice = useCallback((data, decimals = 8) => {
    if (!data || !Array.isArray(data) || data.length < 2) {
      return null;
    }

    const priceValue = data[1]; // answer is at index 1
    if (!priceValue) {
      return null;
    }

    try {
      // Convert BigInt to number and format
      const rawPrice =
        typeof priceValue === "bigint"
          ? Number(priceValue)
          : Number(priceValue);
      const price = rawPrice / Math.pow(10, decimals);
      return price.toFixed(2);
    } catch (error) {
      console.error("Error Converting: ", error)
      return null;
    }
  }, []);

  // Update prices when data changes
  useEffect(() => {
    setIsLoading(btcLoading || ethLoading || linkLoading);
    setIsError(btcError || ethError || linkError);

    const newPrices = {
      btc: formatPrice(btcData, 8), // BTC/USD has 8 decimals
      eth: formatPrice(ethData, 8), // ETH/USD has 8 decimals
      link: formatPrice(linkData, 8), // LINK/USD has 8 decimals
    };

    setPrices(newPrices);
  }, [
    btcData,
    ethData,
    linkData,
    btcLoading,
    ethLoading,
    linkLoading,
    btcError,
    ethError,
    linkError,
    formatPrice,
  ]);

  const fetchPrices = useCallback(async () => {
    // The prices are automatically updated by the individual hooks
    // This function exists for compatibility
  }, []);

  return {
    prices,
    isLoading,
    isError,
    fetchPrices,
  };
};

// Hook to get user's ETH balance
export const useUserBalance = () => {
  const { address } = useAccount();
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance("0");
      return;
    }

    setIsLoading(true);
    try {
      // Use wagmi's getBalance for real ETH balance
      const { getBalance } = await import("wagmi/actions");
      const { config } = await import("../config/web3.js");

      const balanceResult = await getBalance(config, {
        address: address,
      });

      // Convert from wei to ETH with 4 decimal places
      const ethBalance = parseFloat(balanceResult.formatted).toFixed(4);
      setBalance(ethBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("0");
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    isLoading,
    refetch: fetchBalance,
  };
};
