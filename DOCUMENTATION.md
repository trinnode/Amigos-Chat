# AmigoChat Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Smart Contract Reference](#smart-contract-reference)
3. [Frontend Components](#frontend-components)
4. [API Reference](#api-reference)
5. [Deployment Guide](#deployment-guide)
6. [Development Workflow](#development-workflow)

## Architecture Overview

AmigoChat follows a modern decentralized application (dApp) architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Blockchain    │    │   Storage       │
│   (React)       │◄───┤   (Ethereum)    │◄───┤   (IPFS)        │
│                 │    │                 │    │                 │
│ ▪ User Interface│    │ ▪ Smart Contract│    │ ▪ Profile Pics  │
│ ▪ Web3 Hooks    │    │ ▪ User Registry │    │ ▪ Metadata      │
│ ▪ State Mgmt    │    │ ▪ Chat Messages │    │ ▪ Files         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Oracles       │
                    │   (Chainlink)   │
                    │                 │
                    │ ▪ Price Feeds   │
                    │ ▪ BTC/USD       │
                    │ ▪ ETH/USD       │
                    │ ▪ LINK/USD      │
                    └─────────────────┘
```

### Core Components

1. **Smart Contract Layer**: Handles user registration, messaging, and price feeds
2. **Frontend Layer**: React-based UI with Web3 integration
3. **Storage Layer**: IPFS for decentralized file storage
4. **Oracle Layer**: Chainlink for real-time price data

## Smart Contract Reference

### AmigoChat.sol

#### Core Functions

##### User Management

```solidity
function registerUser(string memory _username, string memory _ipfsProfilePicHash) external
```
- Registers a new user with unique username and IPFS profile picture
- **Parameters**: username (3-50 chars), IPFS hash for profile picture
- **Requirements**: Username must be unique, user not already registered
- **Events**: Emits `UserRegistered`

```solidity
function isUsernameAvailable(string memory _username) external view returns (bool)
```
- Checks if a username is available for registration
- **Returns**: true if available, false if taken

```solidity
function changeUsername(string memory _newUsername) external
```
- Changes the username for the caller
- **Requirements**: User must be registered, new username must be available
- **Events**: Emits `UsernameChanged`

##### Chat Functions

```solidity
function sendMessage(string memory _content) external
```
- Sends a message to the general chat
- **Parameters**: message content (1-1000 chars)
- **Requirements**: User must be registered
- **Events**: Emits `MessageSent`

```solidity
function getGeneralChatMessages() external view returns (Message[] memory)
```
- Retrieves all general chat messages
- **Returns**: Array of Message structs

##### Price Feed Functions

```solidity
function getLatestPriceBTCUSD() public view returns (int256)
```
- Gets latest BTC/USD price from Chainlink oracle
- **Returns**: Price in 8-decimal format

```solidity
function getAllPrices() external view returns (int256, int256, int256)
```
- Gets all supported crypto prices in single call
- **Returns**: BTC, ETH, LINK prices

#### Data Structures

```solidity
struct UserProfile {
    string username;
    string ipfsProfilePicHash;
    bool isRegistered;
    uint256 registrationTimestamp;
    uint256 totalMessagesSent;
}

struct Message {
    address sender;
    string content;
    uint256 timestamp;
    uint256 messageId;
}
```

#### Events

```solidity
event UserRegistered(address indexed userAddress, string indexed username, string ipfsProfilePicHash, uint256 timestamp);
event UsernameChanged(address indexed userAddress, string indexed oldUsername, string indexed newUsername, uint256 timestamp);
event MessageSent(address indexed sender, string content, uint256 timestamp, uint256 indexed messageId);
```

## Frontend Components

### Pages

#### LandingPage.jsx
- Entry point for the application
- Wallet connection interface
- Feature showcase with animations
- Automatic routing based on registration status

Key Features:
- Matrix background animation
- 3D logo effects with rotation
- Responsive design for all devices
- Connect wallet integration with RainbowKit

#### RegisterPage.jsx
- User onboarding flow
- Profile picture upload to IPFS
- Username selection and validation
- Smart contract registration

Workflow:
1. Upload profile picture → IPFS storage
2. Choose unique username → Availability check
3. Confirm registration → Blockchain transaction

#### ChatPage.jsx
- Main application interface
- Discord-like layout with sidebars
- Real-time messaging
- Price feed integration

Layout:
- Left sidebar: User list with online status
- Center: Chat messages with timestamps
- Right sidebar: Live crypto prices (toggleable)

#### ProfilePage.jsx
- User profile management
- Username change functionality
- Wallet information display
- Account statistics

### Components

#### MatrixBackground.jsx
```javascript
// Creates falling green characters animation
// Uses HTML5 Canvas for performance
// Automatically adjusts to screen size
```

#### LoadingSpinner.jsx
```javascript
// Customizable loading indicators
// Multiple sizes: small, medium, large
// Green theme with glow effects
// Overlay and inline variants
```

#### ProtectedRoute.jsx
```javascript
// Route access control
// Wallet connection requirements
// Registration status checking
// Automatic redirects
```

### Custom Hooks

#### useAmigoContract.js

Provides React hooks for smart contract interaction:

```javascript
// User management hooks
useIsUserRegistered() // Check registration status
useUserProfile() // Get user profile data
useUsernameAvailability() // Check username availability
useRegisterUser() // Register new user

// Chat hooks
useGeneralChatMessages() // Get chat messages
useSendMessage() // Send new message
useRegisteredUsers() // Get all users

// Utility hooks
usePriceFeeds() // Get crypto prices
useUserBalance() // Get ETH balance
useChangeUsername() // Change username
```

## API Reference

### Environment Variables

```bash
# Required for wallet connection
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Required for RPC calls
VITE_ALCHEMY_API_KEY=your_alchemy_key
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key

# Required for IPFS uploads
VITE_PINATA_JWT=your_pinata_jwt_token
VITE_PINATA_API_URL=https://api.pinata.cloud/pinning/pinFileToIPFS
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Contract addresses (set after deployment)
VITE_AMIGO_CHAT_CONTRACT_ADDRESS=0x...
#VITE_CHAINLINK_BTC_USD_FEED=0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
#VITE_CHAINLINK_ETH_USD_FEED=0x694AA1769357215DE4FAC081bf1f309aDC325306
#VITE_CHAINLINK_LINK_USD_FEED=0xc59E3633BAAC79493d908e63626716e204A45EdF
```

### IPFS Integration

#### Upload Function
```javascript
uploadToIPFS(file, fileName = null)
```
- **Parameters**: File object, optional custom filename
- **Returns**: Object with IPFS hash, gateway URL, metadata
- **Validation**: Image files only, max 5MB size
- **Processing**: Automatic image resizing to 400x400px

#### Utility Functions
```javascript
getIPFSUrl(ipfsHash) // Convert hash to gateway URL
isValidIPFSHash(hash) // Validate IPFS hash format
createFilePreview(file) // Create blob URL for preview
resizeImage(file, maxWidth, maxHeight, quality) // Resize images
```

## Deployment Guide

### Prerequisites

1. **Development Environment**
   ```bash
   Node.js v18+
   npm or yarn
   Git
   ```

2. **Blockchain Tools**
   ```bash
   MetaMask wallet
   Sepolia testnet ETH
   Remix IDE access
   ```

3. **API Keys**
   ```bash
   WalletConnect Project ID
   Alchemy API key
   Pinata JWT token
   Etherscan API key (optional)
   ```

### Smart Contract Deployment

1. **Compile Contract**
   ```bash
   # In Remix IDE:
   1. Upload contracts/AmigoChat.sol
   2. Select Solidity 0.8.19+ compiler
   3. Enable optimization (200 runs)
   4. Compile contract
   ```

2. **Deploy to Sepolia**
   ```bash
   # Constructor parameters:
   _priceFeedBTCUSD: 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
   _priceFeedETHUSD: 0x694AA1769357215DE4FAC081bf1f309aDC325306
   _priceFeedLINKUSD: 0xc59E3633BAAC79493d908e63626716e204A45EdF
   ```

3. **Verify Contract** (Optional)
   ```bash
   # Use Etherscan verification
   # Upload source code and constructor parameters
   ```

4. **Update Configuration**
   ```bash
   # Copy contract ABI to src/contracts/AmigoChat.js
   # Update .env with deployed contract address
   ```

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

3. **Configure Environment**
   ```bash
   # Set environment variables in Vercel dashboard
   # All VITE_ prefixed variables
   ```

#### Option 2: Netlify

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   ```bash
   # Drag and drop dist/ folder to Netlify
   # Or connect GitHub repository
   ```

#### Option 3: IPFS (Fully Decentralized)

1. **Build for IPFS**
   ```bash
   npm run build
   # Ensure all assets use relative paths
   ```

2. **Upload to IPFS**
   ```bash
   # Using Pinata
   # Upload dist/ folder as directory
   # Pin to ensure availability
   ```

## Development Workflow

### Setting Up Development Environment

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd amigoschat
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Copy .env.example to .env
   # Fill in required API keys
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # Application available at http://localhost:5173
   ```

### Development Best Practices

1. **Code Organization**
   - Components in `/src/components/`
   - Pages in `/src/pages/`
   - Hooks in `/src/hooks/`
   - Utilities in `/src/utils/`

2. **Naming Conventions**
   - PascalCase for components
   - camelCase for functions and variables
   - UPPER_CASE for constants

3. **Git Workflow**
   ```bash
   # Feature development
   git checkout -b feature/new-feature
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

### Testing Strategy

1. **Manual Testing Checklist**
   - [ ] Wallet connection/disconnection
   - [ ] User registration flow
   - [ ] Username availability checking
   - [ ] Profile picture upload
   - [ ] Message sending/receiving
   - [ ] Price feed updates
   - [ ] Username changes
   - [ ] Responsive design
   - [ ] Error handling

2. **Smart Contract Testing**
   ```bash
   # Deploy to Sepolia testnet
   # Test each function with various inputs
   # Verify events are emitted correctly
   # Check gas usage optimization
   ```

### Performance Optimization

1. **Frontend Optimization**
   - Code splitting with React.lazy
   - Image optimization and lazy loading
   - Efficient re-renders with useMemo/useCallback
   - Bundle size monitoring

2. **Smart Contract Optimization**
   - Gas-efficient data structures
   - Batch operations where possible
   - Event indexing for queries
   - Storage layout optimization

### Security Considerations

1. **Smart Contract Security**
   - Input validation and sanitization
   - Reentrancy protection
   - Access control modifiers
   - Integer overflow protection

2. **Frontend Security**
   - XSS prevention
   - IPFS hash validation
   - Secure API key handling
   - Content Security Policy

### Troubleshooting Common Issues

1. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Web3 Connection Issues**
   ```bash
   # Check network configuration
   # Verify RPC endpoints
   # Test with different wallets
   ```

3. **IPFS Upload Failures**
   ```bash
   # Verify Pinata JWT token
   # Check file size limits
   # Test network connectivity
   ```

This documentation provides a comprehensive guide for developers working with AmigoChat. For additional support, refer to the README.md file or contact the development team.