# 🚀 AmigoChat - Decentralized Web3 Chat Application

<div align="center">
  <img src="public/logo.png" alt="AmigoChat Logo" width="150" height="150" />
  
  [![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Powered by Ethereum](https://img.shields.io/badge/Powered%20by-Ethereum-627EEA?style=for-the-badge&logo=ethereum)](https://ethereum.org/)
  [![IPFS Integration](https://img.shields.io/badge/Storage-IPFS-65C2CB?style=for-the-badge&logo=ipfs)](https://ipfs.io/)
  [![Chainlink Oracles](https://img.shields.io/badge/Oracles-Chainlink-375BD2?style=for-the-badge&logo=chainlink)](https://chain.link/)
</div>

## 📖 Overview

AmigoChat is a revolutionary decentralized chat application built on the Ethereum blockchain. It combines the familiar Discord-like user experience with the power of Web3 technology, offering users true ownership of their data and identity.

### ✨ Key Features

- 🔒 **Decentralized Identity**: Wallet-based authentication with custom .amigo usernames
- 💬 **Real-time Messaging**: Instant chat with blockchain-verified identities  
- 🖼️ **IPFS Profile Pictures**: Decentralized storage for user avatars
- 📊 **Live Price Feeds**: Real-time crypto prices via Chainlink oracles
- 🎨 **Cyberpunk Design**: Matrix-inspired UI with green glow effects
- 📱 **Fully Responsive**: Optimized for desktop and mobile devices
- ⚡ **Gas Optimized**: Efficient smart contract design

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth interactions
- **React Router** - Client-side routing

### Web3 Integration
- **Ethers.js** - Ethereum library for blockchain interactions
- **Viem** - TypeScript interface for Ethereum
- **RainbowKit** - Wallet connection interface
- **Wagmi** - React hooks for Ethereum

### Blockchain & Storage
- **Solidity** - Smart contract programming language
- **Ethereum Sepolia** - Testnet for development and testing
- **IPFS** - Decentralized file storage
- **Pinata** - IPFS pinning service
- **Chainlink** - Decentralized oracle network

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for transactions

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/trinnode/Amigos-Chat.git
   cd amigos-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   The `.env` file is already configured with the necessary API keys:
   ```env
   VITE_WALLETCONNECT_PROJECT_ID=
   VITE_ALCHEMY_API_KEY=
   VITE_PINATA_JWT=your_pinata_jwt_token
   VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/APIKEY
   ```

4. **Deploy Smart Contract**
   
   Deploy the `AmigoChat.sol` contract to Sepolia testnet using Remix IDE:
   - Open [Remix IDE](https://remix.ethereum.org)
   - Upload `contracts/AmigoChat.sol`
   - Compile with Solidity 0.8.19+
   - Deploy to Sepolia with Chainlink price feed addresses:
     - BTC/USD: `0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43`
     - ETH/USD: `0x694AA1769357215DE4FAC081bf1f309aDC325306`
     - LINK/USD: `0xc59E3633BAAC79493d908e63626716e204A45EdF`

5. **Update Contract Configuration**
   
   After deployment, update the contract ABI and address in:
   - `src/contracts/AmigoChat.js` - Add the compiled ABI
   - `.env` - Add the deployed contract address

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Open Your Browser**
   
   Navigate to `http://localhost:5173` and connect your wallet!

## 📂 Project Structure

```
amigoschat/
├── contracts/
│   └── AmigoChat.sol           # Main smart contract
├── src/
│   ├── components/             # Reusable React components
│   │   ├── LoadingSpinner.jsx  # Loading states
│   │   ├── MatrixBackground.jsx # Animated background
│   │   └── ProtectedRoute.jsx  # Route access control
│   ├── config/
│   │   └── web3.js            # Web3 configuration
│   ├── contracts/
│   │   └── AmigoChat.js       # Contract ABI and config
│   ├── hooks/
│   │   └── useAmigoContract.js # Custom contract hooks
│   ├── pages/
│   │   ├── LandingPage.jsx    # Welcome page
│   │   ├── RegisterPage.jsx   # User registration
│   │   ├── ChatPage.jsx       # Main chat interface
│   │   └── ProfilePage.jsx    # User profile management
│   ├── utils/
│   │   └── ipfs.js           # IPFS utilities
│   ├── App.jsx               # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/
│   └── logo.png             # AmigoChat logo
├── .env                     # Environment variables
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # TailwindCSS configuration
└── README.md              # This file
```

## 🎮 How to Use

### 1. Connect Your Wallet
- Visit the landing page
- Click "Connect Wallet"
- Approve the connection in MetaMask
- Ensure you're on Sepolia testnet

### 2. Register Your Profile
- Upload a profile picture (stored on IPFS)
- Choose a unique .amigo username
- Confirm registration (requires gas fee)
- Wait for blockchain confirmation

### 3. Start Chatting
- Send messages to the general chat
- View other users' profiles and avatars
- Check live crypto prices via Chainlink oracles
- Manage your profile settings

## 🔧 Smart Contract Features

### User Management
- **Registration**: Create unique .amigo usernames with IPFS avatars
- **Profile Updates**: Change usernames and profile pictures
- **User Discovery**: View all registered users and their profiles

### Chat System
- **General Chat**: Public messaging for all users
- **Message History**: Persistent chat history on blockchain
- **Real-time Updates**: Event-driven message delivery
- **Direct Messages**: Private messaging between users (planned)

### Price Integration
- **Chainlink Oracles**: Real-time BTC, ETH, and LINK prices
- **On-demand Updates**: Fetch latest prices with single transaction
- **Price History**: Track price changes over time (planned)

## 🎨 Design Philosophy

AmigoChat embraces a **cyberpunk aesthetic** with:

- **Color Scheme**: Black background, electric green accents, white text
- **Typography**: Fira Code monospace font throughout
- **Animations**: Smooth transitions and Matrix-style effects
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Accessibility**: Screen reader friendly with proper ARIA labels

## 🔐 Security Features

- **Wallet-based Authentication**: No passwords or centralized accounts
- **Smart Contract Verification**: All interactions verified on blockchain
- **IPFS Content Addressing**: Tamper-proof file storage
- **Input Validation**: Comprehensive input sanitization
- **Rate Limiting**: Protection against spam and abuse

## 🧪 Testing

### Smart Contract Testing
```bash
# Using Remix IDE
1. Deploy to Sepolia testnet
2. Test user registration
3. Test message sending
4. Test username changes
5. Test price feed integration
```

### Frontend Testing
```bash
# Manual testing checklist
1. Wallet connection flow
2. Registration process
3. Chat functionality
4. Profile management
5. Responsive design
6. Error handling
```

## 🚀 Deployment

### Frontend Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Hosting Service**
   
   The `dist/` folder can be deployed to:
   - Vercel
   - Netlify
   - GitHub Pages
   - IPFS (for full decentralization)

### Smart Contract Deployment

1. **Compile Contract**
   ```bash
   # Using Remix IDE
   - Set Solidity version to 0.8.19+
   - Enable optimization
   - Compile AmigoChat.sol
   ```

2. **Deploy to Mainnet**
   ```bash
   # Constructor parameters for mainnet:
   - BTC/USD: 0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c
   - ETH/USD: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
   - LINK/USD: 0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c
   ```

## 🤝 Contributing

We welcome contributions to AmigoChat! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Contribution Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on Sepolia testnet
- Update documentation as needed

### Areas for Contribution
- 🐛 Bug fixes and optimizations
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 UI/UX improvements
- 🔒 Security audits

## 📈 Roadmap

### Phase 1 - Foundation (Current)
- ✅ Basic chat functionality
- ✅ User registration and profiles
- ✅ IPFS integration
- ✅ Chainlink price feeds

### Phase 2 - Enhanced Features
- 🔄 Direct messaging
- 🔄 Message reactions and replies
- 🔄 File sharing via IPFS
- 🔄 Group chat rooms

### Phase 3 - Advanced Features
- 🔄 NFT avatar integration
- 🔄 Token-gated chat rooms
- 🔄 Voice/video chat
- 🔄 Mobile app

### Phase 4 - Ecosystem
- 🔄 Plugin system
- 🔄 Developer APIs
- 🔄 Cross-chain support
- 🔄 DAO governance

## ⚠️ Important Notes

### Testnet Usage
- This application is currently configured for Sepolia testnet
- Use test ETH only - never send real ETH to testnet addresses
- Smart contract addresses will change when deploying to mainnet

### Gas Costs
- Registration: ~0.02-0.05 ETH
- Sending messages: ~0.01-0.02 ETH
- Username changes: ~0.01-0.03 ETH
- Price updates: ~0.005-0.01 ETH

### Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox
- Safari (limited Web3 support)
- Edge

## 🆘 Troubleshooting

### Common Issues

**Wallet Connection Failed**
- Ensure MetaMask is installed and unlocked
- Switch to Sepolia testnet
- Refresh the page and try again

**Transaction Failed**
- Check you have sufficient Sepolia ETH
- Increase gas limit in MetaMask
- Wait for network congestion to clear

**Images Not Loading**
- IPFS gateway may be slow
- Try refreshing the page
- Check internet connection

**Contract Interaction Failed**
- Verify contract address is correct
- Ensure ABI is up to date
- Check network connection

### Getting Help

- 📧 Email: trinnex@gmail.com
- 💬 Discord: [AmigoChat Community](https://discord.gg/trinnex)
- 🐦 Twitter: [@AmigoChat_dApp](https://twitter.com/_trinnex_)
- 📖 Documentation: [docs.amigochat.app](https://github.com/trinnode/Amigos-Chat/blob/main/DOCUMENTATION.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ethereum Foundation** - For the blockchain infrastructure
- **Chainlink** - For reliable oracle services
- **IPFS** - For decentralized storage
- **RainbowKit** - For excellent wallet integration
- **Vite** - For fast development experience
- **TailwindCSS** - For utility-first styling

## 🌟 Show Your Support

If you like AmigoChat, please:
- ⭐ Star this repository
- 🐦 Follow us on Twitter
- 💬 Join our Discord community
- 🔄 Share with friends

---

<div align="center">
  <strong>Built with ❤️ for the decentralized future</strong>
  
  <br><br>
  
  **AmigoChat** - Where Web3 meets social interaction
  
  <br>
  
  <img src="public/logo.png" alt="AmigoChat" width="50" height="50" />
</div>+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
