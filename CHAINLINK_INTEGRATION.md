# Chainlink Price Feed Integration

## Overview
AmigoChat now integrates real-time price data from Chainlink's decentralized oracle network, providing accurate and reliable cryptocurrency prices directly in the chat interface.

## Integrated Price Feeds

### Mainnet Addresses (Production)
- **BTC/USD**: `0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c`
- **ETH/USD**: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- **LINK/USD**: `0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c`

### Sepolia Testnet Addresses (Current)
- **BTC/USD**: `0xdeb288F737066589598e9214E782fa5A8eD689e8`
- **ETH/USD**: `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`
- **LINK/USD**: `0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c`

## Features

### ✅ Real-Time Data
- Prices update automatically every 30 seconds
- Direct integration with Chainlink AggregatorV3Interface
- No mock data - all prices are live from the blockchain

### ✅ Multiple Price Feeds
- **Bitcoin (BTC/USD)**: Most popular cryptocurrency
- **Ethereum (ETH/USD)**: Native blockchain currency
- **Chainlink (LINK/USD)**: Oracle network token

### ✅ Error Handling
- Graceful fallback if price feeds are unavailable
- Loading states during price fetching
- Automatic retry mechanisms

### ✅ Optimized Performance
- Data caching with 25-second stale time
- Automatic background updates
- Minimal re-renders with React hooks

## Implementation

### Environment Configuration
```env
# Chainlink price feed contract addresses
VITE_CHAINLINK_BTC_USD_FEED=0xdeb288F737066589598e9214E782fa5A8eD689e8
VITE_CHAINLINK_ETH_USD_FEED=0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
VITE_CHAINLINK_LINK_USD_FEED=0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c
```

### Code Structure
- **`useAmigoContract.js`**: Contains all Chainlink integration hooks
- **`useBTCPrice()`**: Individual BTC price feed hook
- **`useETHPrice()`**: Individual ETH price feed hook
- **`useLINKPrice()`**: Individual LINK price feed hook
- **`usePriceFeeds()`**: Combined hook for all price feeds

### Usage in Chat
1. Navigate to the chat page
2. Click "📊 Show Live Prices" in the left sidebar
3. View real-time prices in the right sidebar
4. Prices auto-update every 30 seconds

## Technical Details

### Data Format
```javascript
{
  btc: "65432.10",    // USD price with 2 decimals
  eth: "3456.78",     // USD price with 2 decimals
  link: "15.67"       // USD price with 2 decimals
}
```

### Update Frequency
- **Refresh Interval**: 30 seconds
- **Stale Time**: 25 seconds
- **Background Updates**: Automatic

### Decimal Handling
All Chainlink feeds return prices with 8 decimal places, which are automatically converted to 2 decimal places for display.

## Benefits

1. **Accuracy**: Data comes directly from Chainlink's decentralized oracle network
2. **Reliability**: Multiple data sources aggregated for each price
3. **Transparency**: All price feeds are on-chain and verifiable
4. **Performance**: Optimized caching and update strategies
5. **User Experience**: Seamless integration with chat interface

## Future Enhancements

- Add more cryptocurrency pairs (ADA, DOT, MATIC, etc.)
- Historical price charts
- Price alerts and notifications
- Portfolio tracking features
- Custom price feed selection

---

**Note**: This integration removes all mock data and provides real, live cryptocurrency prices directly from the Chainlink oracle network on Sepolia testnet.