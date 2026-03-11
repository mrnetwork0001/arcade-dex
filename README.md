#  Arcade DEX

**Arcade** is a high-performance, streamlined decentralized exchange (DEX) built specifically for the **Arc Network**. It simplifies FX trading (Foreign Exchange) in the DeFi space, allowing users to swap between stablecoins like **USDC** and **EURC** with lightning speed, zero slippage, and a gas-optimized experience.


<img width="1903" height="976" alt="11 03 2026_12 27 01_REC" src="https://github.com/user-attachments/assets/5903ae58-5836-4b23-8bdc-755e08d5a68a" />


##  Key Features

- **⚡ Flash Swaps**: Immediate execution for FX pairs (USDC, EURC, etc.).
- **⛽ Gasless Signature Support**: Utilizes Uniswap's **Permit2** protocol, allowing users to sign approvals rather than sending separate "approve" transactions.
- **🛡️ Secure Escrow**: Powered by the `ArcadeEscrow.sol` smart contract for safe, relayer-mediated settlement.
- **🌉 Bridge Integration**: Coming soon! Seamlessly move assets from other EVM chains to the Arc Network.
- **🚰 Integrated Faucet**: Easy access to test tokens for the Arc Testnet.
- **🎨 Modern Arcade UX**: A bold, responsive interface designed for simplicity and speed.

##  Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Vanilla CSS (Custom arcade-themed design system)
- **Web3**: Eethers.js (v6), Uniswap Permit2
- **Smart Contracts**: Solidity ^0.8.20, OpenZeppelin
- **Network**: [Arc Testnet](https://testnet.arcscan.app)

##  Network Information

| Property | Value |
| :--- | :--- |
| **Network Name** | Arc Testnet |
| **Chain ID** | `5042002` |
| **RPC URL** | `https://rpc.testnet.arc.network` |
| **Native Token** | USDC |
| **Block Explorer** | [ArcScan](https://testnet.arcscan.app) |

##  Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A Web3 wallet (e.g., MetaMask)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mrnetwork0001/arcade-dex.git
   cd arcade-dex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```env
   VITE_RELAYER_PRIVATE_KEY=your_relayer_private_key_here
   ```
   *Note: Ensure you have enough gas (USDC on Arc Network) in your relayer wallet to facilitate swaps.*

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

##  Smart Contracts

The core of Arcade is the `ArcadeEscrow` contract, which handles:
- **Settlement**: Relayers settle swaps signed by users.
- **Liquidity Management**: Admin functions to manage token pools.
- **Permit2 Integration**: Securely transfers tokens from users using signed permits.

The contract is designed to work with the **Permit2** interface (`0x000000000022D473030F116dDEE9F6B43aC78BA3`).

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

##  License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️, by [MrNetwork](https://x.com/encrypt_wizard) for the Arc Network community. 🕹️
