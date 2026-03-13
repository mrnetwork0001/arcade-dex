// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Minimal interface for Permit2
interface ISignatureTransfer {
    struct TokenPermissions {
        address token;
        uint256 amount;
    }
    struct PermitTransferFrom {
        TokenPermissions permitted;
        uint256 nonce;
        uint256 deadline;
    }
    struct SignatureTransferDetails {
        address to;
        uint256 requestedAmount;
    }
    function permitTransferFrom(
        PermitTransferFrom memory permit,
        SignatureTransferDetails calldata transferDetails,
        address owner,
        bytes calldata signature
    ) external;
}

contract ArcadeEscrow is Ownable {
    using SafeERC20 for IERC20;

    ISignatureTransfer public immutable permit2;
    
    // Relayer allowed to execute swaps
    address public relayer;

    // Track liquidity provided by users
    // user => token => amount
    mapping(address => mapping(address => uint256)) public lpBalances;

    event SwapSettled(address indexed user, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut);
    event LiquidityAdded(address indexed user, address indexed token, uint256 amount);
    event LiquidityWithdrawn(address indexed user, address indexed token, uint256 amount);

    constructor(address _permit2, address _relayer) Ownable(msg.sender) {
        permit2 = ISignatureTransfer(_permit2);
        relayer = _relayer;
    }

    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }

    // Public function to allow anyone to provide liquidity to the swap pool
    function depositLiquidity(address token, uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        lpBalances[msg.sender][token] += amount;
        emit LiquidityAdded(msg.sender, token, amount);
    }

    // Allows users to withdraw their provided liquidity
    function withdrawLiquidity(address token, uint256 amount) external {
        require(lpBalances[msg.sender][token] >= amount, "Insufficient LP balance");
        
        // Ensure the contract actually has enough of that token 
        // (Liquidity might be utilized in active swaps)
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient pool depth");

        lpBalances[msg.sender][token] -= amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        emit LiquidityWithdrawn(msg.sender, token, amount);
    }

    // The relayer calls this method to settle the user's requested swap
    function settle(
        address user,
        address tokenIn,
        uint256 amountIn,
        address tokenOut,
        uint256 amountOut,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(msg.sender == relayer, "Only relayer");
        require(IERC20(tokenOut).balanceOf(address(this)) >= amountOut, "Insufficient liquidity");

        // 1. Setup the Permit parameters exactly how the UI signed them
        ISignatureTransfer.PermitTransferFrom memory permit = ISignatureTransfer.PermitTransferFrom({
            permitted: ISignatureTransfer.TokenPermissions({ token: tokenIn, amount: amountIn }),
            nonce: nonce,
            deadline: deadline
        });

        // 2. Transfer details: moving tokenIn from User to this Escrow via Permit2
        ISignatureTransfer.SignatureTransferDetails memory transferDetails = ISignatureTransfer.SignatureTransferDetails({
            to: address(this),
            requestedAmount: amountIn
        });

        // 3. Execute the Permit2 Transfer! Takes tokenIn from User -> Escrow
        permit2.permitTransferFrom(permit, transferDetails, user, signature);

        // 4. Send the desired output tokens (tokenOut) from the Escrow -> to the User
        IERC20(tokenOut).safeTransfer(user, amountOut);

        emit SwapSettled(user, tokenIn, amountIn, tokenOut, amountOut);
    }
    
    // Admin functions to deposit/withdraw liquidity for the Escrow Pool (Owner only)
    function withdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
