// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Import Chainlink interface for price feeds
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title AmigoChat
 * @dev Decentralized chat application with user registration, messaging, and price feeds
 * @notice This contract manages users, messages, and integrates Chainlink price oracles
 */
contract AmigoChat {
    // ==================================================
    // STATE VARIABLES
    // ==================================================

    // Owner of the contract for administrative functions
    address public owner;

    // Counter to track total number of registered users
    uint256 public totalUsers;

    // Counter to track total number of messages sent
    uint256 public totalMessages;

    // Chainlink price feed interfaces for different trading pairs
    AggregatorV3Interface internal priceFeedBTCUSD;
    AggregatorV3Interface internal priceFeedETHUSD;
    AggregatorV3Interface internal priceFeedLINKUSD;

    // ==================================================
    // STRUCTS AND ENUMS
    // ==================================================

    /**
     * @dev Struct to store user profile information
     * @param username The unique username chosen by the user
     * @param ipfsProfilePicHash IPFS hash of the user's profile picture
     * @param isRegistered Boolean flag to check if user is registered
     * @param registrationTimestamp When the user registered
     * @param totalMessagesSent Number of messages sent by this user
     */
    struct UserProfile {
        string username;
        string ipfsProfilePicHash;
        bool isRegistered;
        uint256 registrationTimestamp;
        uint256 totalMessagesSent;
    }

    /**
     * @dev Struct to store message information
     * @param sender Address of the message sender
     * @param content The message content
     * @param timestamp When the message was sent
     * @param messageId Unique identifier for the message
     */
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
        uint256 messageId;
    }

    /**
     * @dev Struct to store direct message information
     * @param sender Address of the message sender
     * @param receiver Address of the message receiver
     * @param content The message content
     * @param timestamp When the message was sent
     * @param isRead Whether the message has been read
     */
    struct DirectMessage {
        address sender;
        address receiver;
        string content;
        uint256 timestamp;
        bool isRead;
    }

    // ==================================================
    // MAPPINGS
    // ==================================================

    // Maps wallet address to user profile
    mapping(address => UserProfile) public users;

    // Maps username to wallet address for reverse lookup and uniqueness check
    mapping(string => address) public usernameToAddress;

    // Maps user address to array of their message IDs for direct messages
    mapping(address => uint256[]) public userMessages;

    // Maps conversation hash to array of direct messages between two users
    mapping(bytes32 => DirectMessage[]) public conversations;

    // Maps user address to their conversation partners
    mapping(address => address[]) public userConversations;

    // ==================================================
    // ARRAYS
    // ==================================================

    // Array to store all general chat messages
    Message[] public generalChatMessages;

    // Array to store all registered user addresses
    address[] public registeredUsers;

    // ==================================================
    // EVENTS
    // ==================================================

    /**
     * @dev Emitted when a new user registers
     * @param userAddress The wallet address of the new user
     * @param username The chosen username
     * @param ipfsProfilePicHash IPFS hash of profile picture
     * @param timestamp When the registration occurred
     */
    event UserRegistered(
        address indexed userAddress,
        string indexed username,
        string ipfsProfilePicHash,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a user changes their username
     * @param userAddress The wallet address of the user
     * @param oldUsername The previous username
     * @param newUsername The new username
     * @param timestamp When the change occurred
     */
    event UsernameChanged(
        address indexed userAddress,
        string indexed oldUsername,
        string indexed newUsername,
        uint256 timestamp
    );

    /**
     * @dev Emitted when a message is sent to general chat
     * @param sender The wallet address of the sender
     * @param content The message content
     * @param timestamp When the message was sent
     * @param messageId Unique identifier for the message
     */
    event MessageSent(
        address indexed sender,
        string content,
        uint256 timestamp,
        uint256 indexed messageId
    );

    /**
     * @dev Emitted when a direct message is sent
     * @param sender The wallet address of the sender
     * @param receiver The wallet address of the receiver
     * @param content The message content
     * @param timestamp When the message was sent
     */
    event DirectMessageSent(
        address indexed sender,
        address indexed receiver,
        string content,
        uint256 timestamp
    );

    /**
     * @dev Emitted when price data is updated (for future automation)
     * @param pair The trading pair (e.g., "BTC/USD")
     * @param price The current price
     * @param timestamp When the price was fetched
     */
    event PriceUpdate(string indexed pair, uint256 price, uint256 timestamp);

    // ==================================================
    // MODIFIERS
    // ==================================================

    /**
     * @dev Modifier to check if the caller is the contract owner
     */
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only contract owner can call this function"
        );
        _;
    }

    /**
     * @dev Modifier to check if the caller is a registered user
     */
    modifier onlyRegisteredUser() {
        require(
            users[msg.sender].isRegistered,
            "User must be registered to perform this action"
        );
        _;
    }

    /**
     * @dev Modifier to check if a username is not empty
     * @param _username The username to validate
     */
    modifier validUsername(string memory _username) {
        require(bytes(_username).length > 0, "Username cannot be empty");
        require(
            bytes(_username).length <= 50,
            "Username too long (max 50 characters)"
        );
        _;
    }

    /**
     * @dev Modifier to check if message content is not empty
     * @param _content The message content to validate
     */
    modifier validMessage(string memory _content) {
        require(bytes(_content).length > 0, "Message cannot be empty");
        require(
            bytes(_content).length <= 1000,
            "Message too long (max 1000 characters)"
        );
        _;
    }

    // ==================================================
    // CONSTRUCTOR
    // ==================================================

    /**
     * @dev Contract constructor
     * @param _priceFeedBTCUSD Address of BTC/USD Chainlink price feed
     * @param _priceFeedETHUSD Address of ETH/USD Chainlink price feed
     * @param _priceFeedLINKUSD Address of LINK/USD Chainlink price feed
     */
    constructor(
        address _priceFeedBTCUSD,
        address _priceFeedETHUSD,
        address _priceFeedLINKUSD
    ) {
        owner = msg.sender;
        totalUsers = 0;
        totalMessages = 0;

        // Initialize Chainlink price feeds for Sepolia testnet
        priceFeedBTCUSD = AggregatorV3Interface(_priceFeedBTCUSD);
        priceFeedETHUSD = AggregatorV3Interface(_priceFeedETHUSD);
        priceFeedLINKUSD = AggregatorV3Interface(_priceFeedLINKUSD);
    }

    // ==================================================
    // USER MANAGEMENT FUNCTIONS
    // ==================================================

    /**
     * @dev Register a new user with username and profile picture
     * @param _username Unique username for the user
     * @param _ipfsProfilePicHash IPFS hash of the profile picture
     */
    function registerUser(
        string memory _username,
        string memory _ipfsProfilePicHash
    ) external validUsername(_username) {
        // Check if user is not already registered
        require(!users[msg.sender].isRegistered, "User is already registered");

        // Check if username is available
        require(
            usernameToAddress[_username] == address(0),
            "Username is already taken"
        );

        // Create new user profile
        users[msg.sender] = UserProfile({
            username: _username,
            ipfsProfilePicHash: _ipfsProfilePicHash,
            isRegistered: true,
            registrationTimestamp: block.timestamp,
            totalMessagesSent: 0
        });

        // Update username mapping
        usernameToAddress[_username] = msg.sender;

        // Add to registered users array
        registeredUsers.push(msg.sender);

        // Increment total users counter
        totalUsers++;

        // Emit registration event
        emit UserRegistered(
            msg.sender,
            _username,
            _ipfsProfilePicHash,
            block.timestamp
        );
    }

    /**
     * @dev Check if a username is available
     * @param _username Username to check
     * @return bool True if username is available, false otherwise
     */
    function isUsernameAvailable(
        string memory _username
    ) external view returns (bool) {
        return usernameToAddress[_username] == address(0);
    }

    /**
     * @dev Check if a user is registered
     * @param _userAddress Address to check
     * @return bool True if user is registered, false otherwise
     */
    function isUserRegistered(
        address _userAddress
    ) external view returns (bool) {
        return users[_userAddress].isRegistered;
    }

    /**
     * @dev Change username for the caller
     * @param _newUsername New username to set
     */
    function changeUsername(
        string memory _newUsername
    ) external onlyRegisteredUser validUsername(_newUsername) {
        // Check if new username is available
        require(
            usernameToAddress[_newUsername] == address(0),
            "Username is already taken"
        );

        // Get old username
        string memory oldUsername = users[msg.sender].username;

        // Remove old username mapping
        delete usernameToAddress[oldUsername];

        // Update user profile with new username
        users[msg.sender].username = _newUsername;

        // Set new username mapping
        usernameToAddress[_newUsername] = msg.sender;

        // Emit username change event
        emit UsernameChanged(
            msg.sender,
            oldUsername,
            _newUsername,
            block.timestamp
        );
    }

    /**
     * @dev Update user's profile picture
     * @param _ipfsProfilePicHash New IPFS hash for profile picture
     */
    function updateProfilePicture(
        string memory _ipfsProfilePicHash
    ) external onlyRegisteredUser {
        users[msg.sender].ipfsProfilePicHash = _ipfsProfilePicHash;
    }

    /**
     * @dev Get user profile information
     * @param _userAddress Address of the user
     * @return UserProfile struct containing user information
     */
    function getUserProfile(
        address _userAddress
    ) external view returns (UserProfile memory) {
        return users[_userAddress];
    }

    /**
     * @dev Get all registered users
     * @return address[] Array of all registered user addresses
     */
    function getAllRegisteredUsers() external view returns (address[] memory) {
        return registeredUsers;
    }

    // ==================================================
    // CHAT FUNCTIONALITY
    // ==================================================

    /**
     * @dev Send a message to the general chat
     * @param _content Message content
     */
    function sendMessage(
        string memory _content
    ) external onlyRegisteredUser validMessage(_content) {
        // Create new message
        Message memory newMessage = Message({
            sender: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            messageId: totalMessages
        });

        // Add message to general chat
        generalChatMessages.push(newMessage);

        // Update user's message count
        users[msg.sender].totalMessagesSent++;

        // Increment total messages counter
        totalMessages++;

        // Emit message sent event
        emit MessageSent(
            msg.sender,
            _content,
            block.timestamp,
            totalMessages - 1
        );
    }

    /**
     * @dev Send a direct message to another user
     * @param _receiver Address of the message receiver
     * @param _content Message content
     */
    function sendDirectMessage(
        address _receiver,
        string memory _content
    ) external onlyRegisteredUser validMessage(_content) {
        // Check if receiver is registered
        require(users[_receiver].isRegistered, "Receiver must be registered");

        // Create conversation hash (smaller address first for consistency)
        bytes32 conversationHash = msg.sender < _receiver
            ? keccak256(abi.encodePacked(msg.sender, _receiver))
            : keccak256(abi.encodePacked(_receiver, msg.sender));

        // Create new direct message
        DirectMessage memory newDM = DirectMessage({
            sender: msg.sender,
            receiver: _receiver,
            content: _content,
            timestamp: block.timestamp,
            isRead: false
        });

        // Add message to conversation
        conversations[conversationHash].push(newDM);

        // Add to user conversations if not already present
        if (!isInConversation(msg.sender, _receiver)) {
            userConversations[msg.sender].push(_receiver);
            userConversations[_receiver].push(msg.sender);
        }

        // Emit direct message event
        emit DirectMessageSent(
            msg.sender,
            _receiver,
            _content,
            block.timestamp
        );
    }

    /**
     * @dev Get general chat messages
     * @return Message[] Array of all general chat messages
     */
    function getGeneralChatMessages() external view returns (Message[] memory) {
        return generalChatMessages;
    }

    /**
     * @dev Get conversation between two users
     * @param _user1 First user address
     * @param _user2 Second user address
     * @return DirectMessage[] Array of direct messages between the users
     */
    function getConversation(
        address _user1,
        address _user2
    ) external view returns (DirectMessage[] memory) {
        bytes32 conversationHash = _user1 < _user2
            ? keccak256(abi.encodePacked(_user1, _user2))
            : keccak256(abi.encodePacked(_user2, _user1));

        return conversations[conversationHash];
    }

    /**
     * @dev Get user's conversation partners
     * @param _user User address
     * @return address[] Array of conversation partner addresses
     */
    function getUserConversations(
        address _user
    ) external view returns (address[] memory) {
        return userConversations[_user];
    }

    /**
     * @dev Check if two users are in conversation
     * @param _user1 First user address
     * @param _user2 Second user address
     * @return bool True if users have exchanged messages
     */
    function isInConversation(
        address _user1,
        address _user2
    ) public view returns (bool) {
        address[] memory conversations_user1 = userConversations[_user1];
        for (uint i = 0; i < conversations_user1.length; i++) {
            if (conversations_user1[i] == _user2) {
                return true;
            }
        }
        return false;
    }

    // ==================================================
    // CHAINLINK PRICE FEED FUNCTIONS
    // ==================================================

    /**
     * @dev Get latest BTC/USD price from Chainlink oracle
     * @return int256 Latest BTC price in USD (8 decimals)
     */
    function getLatestPriceBTCUSD() public view returns (int256) {
        (
            ,
            /* uint80 roundID */ int256 price,
            ,
            ,

        ) = /* uint256 startedAt */ /* uint256 timeStamp */ /* uint80 answeredInRound */
            priceFeedBTCUSD.latestRoundData();

        return price;
    }

    /**
     * @dev Get latest ETH/USD price from Chainlink oracle
     * @return int256 Latest ETH price in USD (8 decimals)
     */
    function getLatestPriceETHUSD() public view returns (int256) {
        (
            ,
            /* uint80 roundID */ int256 price,
            ,
            ,

        ) = /* uint256 startedAt */ /* uint256 timeStamp */ /* uint80 answeredInRound */
            priceFeedETHUSD.latestRoundData();

        return price;
    }

    /**
     * @dev Get latest LINK/USD price from Chainlink oracle
     * @return int256 Latest LINK price in USD (8 decimals)
     */
    function getLatestPriceLINKUSD() public view returns (int256) {
        (
            ,
            /* uint80 roundID */ int256 price,
            ,
            ,

        ) = /* uint256 startedAt */ /* uint256 timeStamp */ /* uint80 answeredInRound */
            priceFeedLINKUSD.latestRoundData();

        return price;
    }

    /**
     * @dev Get all current prices in a single call (gas efficient)
     * @return btcPrice Latest BTC/USD price
     * @return ethPrice Latest ETH/USD price
     * @return linkPrice Latest LINK/USD price
     */
    function getAllPrices()
        external
        view
        returns (int256 btcPrice, int256 ethPrice, int256 linkPrice)
    {
        btcPrice = getLatestPriceBTCUSD();
        ethPrice = getLatestPriceETHUSD();
        linkPrice = getLatestPriceLINKUSD();
    }

    // ==================================================
    // UTILITY AND ADMIN FUNCTIONS
    // ==================================================

    /**
     * @dev Get contract statistics
     * @return totalUsers_ Total number of registered users
     * @return totalMessages_ Total number of messages sent
     * @return contractOwner Address of contract owner
     */
    function getContractStats()
        external
        view
        returns (
            uint256 totalUsers_,
            uint256 totalMessages_,
            address contractOwner
        )
    {
        return (totalUsers, totalMessages, owner);
    }

    /**
     * @dev Emergency function to pause contract (if needed for upgrades)
     * @dev This is a simple version - in production, consider using OpenZeppelin's Pausable
     */
    function emergencyStop() external onlyOwner {
        // Implementation would depend on specific requirements
        // This is a placeholder for emergency functionality
    }

    /**
     * @dev Transfer ownership of the contract
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }

    /**
     * @dev Update Chainlink price feed addresses (in case of oracle updates)
     * @param _priceFeedBTCUSD New BTC/USD price feed address
     * @param _priceFeedETHUSD New ETH/USD price feed address
     * @param _priceFeedLINKUSD New LINK/USD price feed address
     */
    function updatePriceFeeds(
        address _priceFeedBTCUSD,
        address _priceFeedETHUSD,
        address _priceFeedLINKUSD
    ) external onlyOwner {
        priceFeedBTCUSD = AggregatorV3Interface(_priceFeedBTCUSD);
        priceFeedETHUSD = AggregatorV3Interface(_priceFeedETHUSD);
        priceFeedLINKUSD = AggregatorV3Interface(_priceFeedLINKUSD);
    }
}