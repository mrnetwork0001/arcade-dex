import { Wallet, JsonRpcProvider, Contract } from 'ethers';

// Fallback to empty string to avoid Vite crash if not set
const RELAYER_PK = import.meta.env.VITE_RELAYER_PRIVATE_KEY || "";
const RPC_URL = "https://rpc.testnet.arc.network";
const FX_ESCROW = "0x5404fAFAe95ABdD4d5e4B6dbF6e62856374dA5D1";

// Basic ABI for FX Escrow 'settle'
// Adjust to match your exact contract ABI!
const ESCROW_ABI = [
    "function settle(address user, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut, uint256 nonce, uint256 deadline, bytes calldata signature) external",
    "function settleTo(address user, address recipient, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut, uint256 nonce, uint256 deadline, bytes calldata signature) external"
];

// Execute Swap using our Secure Backend Relayer
export const executeSwapEdge = async (fromAmount, signature, permitData, isFlipped, userAddr, recipient = null) => {
    try {
        console.log("Requesting settlement via secure backend...");

        const response = await fetch('/api/execute-swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fromAmount,
                signature,
                permitData,
                isFlipped,
                userAddr,
                recipient
            }, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value
            ),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to execute swap');
        }

        return data;
    } catch (err) {
        console.error("Relayer execution failed:", err);
        if (err.message && err.message.includes('TRANSFER_FROM_FAILED')) {
            throw new Error("Transfer Failed: You may not have enough testnet balance to execute this swap, or the allowance was insufficient.");
        } else {
            throw err;
        }
    }
};
