// Custom hooks for interacting with the AmigoChat smart contract
// Updated for wagmi v2 compatibility

import { useState, useEffect, useCallback } from "react";
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
      // We'll use a direct contract call with viem for this check
      // This is a temporary implementation until we have proper wagmi setup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, simulate the call - in production this would be:
      // const available = await readContract({
      //   address: CONTRACT_INFO.address,
      //   abi: AMIGO_CHAT_ABI,
      //   functionName: 'isUsernameAvailable',
      //   args: [username]
      // });

      // Simple check: usernames starting with 'admin' are not available
      const available = !username.toLowerCase().startsWith("admin");
      setIsAvailable(available);

      if (!available) {
        setError("Username not available");
      }

      return available;
    } catch (err) {
      setError(err.message);
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

  return {
    users: users || [],
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

// Hook to get price feeds
export const usePriceFeeds = () => {
  const {
    data: prices,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: CONTRACT_INFO.address,
    abi: AMIGO_CHAT_ABI,
    functionName: "getAllPrices",
    query: {
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  });

  return {
    prices: prices || [0, 0, 0],
    isLoading,
    isError,
    refetch,
  };
};

// Hook to get user's ETH balance
export const useUserBalance = () => {
  const { address } = useAccount();
  const [balance, setBalance] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // This would need proper implementation with a provider
      // For now, using placeholder
      setBalance("0.0");
    } catch (error) {
      console.error("Error fetching balance:", error);
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
