// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @notice Mock USDT token for testing purposes
 * @dev Anyone can mint tokens for testing
 */
contract MockUSDT is ERC20, Ownable {
    uint8 private _decimals = 6; // USDT uses 6 decimals
    
    constructor() ERC20("Mock USDT", "mUSDT") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**6); // 1 million USDT
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @notice Mint tokens to any address (public for testing)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (with 6 decimals)
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
    
    /**
     * @notice Mint tokens to caller
     * @param amount Amount of tokens to mint (with 6 decimals)
     */
    function mintToSelf(uint256 amount) public {
        _mint(msg.sender, amount);
    }
    
    /**
     * @notice Faucet function - gives 1000 USDT to caller
     */
    function faucet() public {
        _mint(msg.sender, 1000 * 10**6); // 1000 USDT
    }
}
