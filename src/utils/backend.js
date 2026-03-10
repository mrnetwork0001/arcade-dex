import { Wallet, JsonRpcProvider, Contract } from 'ethers';

// Fallback to empty string to avoid Vite crash if not set
const RELAYER_PK = import.meta.env.VITE_RELAYER_PRIVATE_KEY || "";
const RPC_URL = "https://rpc.testnet.arc.network";
const FX_ESCROW = "0xa84ee515c6E61Ee097F4636d4717743baE5a822D";

// Basic ABI for FX Escrow 'settle'
// Adjust to match your exact contract ABI!
const ESCROW_ABI = [
    "function settle(address user, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut, uint256 nonce, uint256 deadline, bytes calldata signature) external"
];

// Execute Swap using our Testnet Relayer
export const executeSwapEdge = async (fromAmount, signature, permitData, isFlipped, userAddr) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Executing circle stableFX settlement via real Arc Relayer...");

            const USDC_EURC_RATE = 0.92;
            const rate = isFlipped ? 1 / USDC_EURC_RATE : USDC_EURC_RATE;

            if (!RELAYER_PK || RELAYER_PK === "your_private_key_here") {
                throw new Error("Missing relayer PK!");
            }

            const { parseUnits } = await import('ethers');
            const provider = new JsonRpcProvider(RPC_URL);
            const relayer = new Wallet(RELAYER_PK, provider);

            // Note: Update FX_ESCROW with your newly deployed contract address!
            const escrow = new Contract(FX_ESCROW, ESCROW_ABI, relayer);

            // Compute output amount and convert both to 6 decimal raw strings
            const toAmount = (parseFloat(fromAmount) * rate).toFixed(4);
            const amountInRaw = parseUnits(fromAmount, 6);
            const amountOutRaw = parseUnits(toAmount, 6);

            const USDC_ADDR = "0x3600000000000000000000000000000000000000";
            const EURC_ADDR = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
            const tokenIn = isFlipped ? EURC_ADDR : USDC_ADDR;
            const tokenOut = isFlipped ? USDC_ADDR : EURC_ADDR;

            console.log("Settling Swap...", { userAddr, tokenIn, amountInRaw, tokenOut, amountOutRaw, nonce: permitData.nonce, deadline: permitData.deadline });

            // Execute the REAL settle function on your deployed ArcadeEscrow!
            const tx = await escrow.settle(
                userAddr,
                tokenIn,
                amountInRaw,
                tokenOut,
                amountOutRaw,
                permitData.nonce,     // the Permit2 nonce signed by user
                permitData.deadline,  // the Permit2 deadline signed by user
                signature
            );

            console.log("Tx broadcasted! Hash:", tx.hash);
            const receipt = await tx.wait();
            console.log("Tx Mined! Block:", receipt.blockNumber);

            resolve({
                success: true,
                txHash: tx.hash,
                quoteId: "q_" + Math.random().toString(36).slice(2),
                rate: rate,
            });

        } catch (err) {
            console.error("Relayer execution failed:", err);
            reject(err);
        }
    });
};
