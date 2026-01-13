// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISanDigital4Funds {
    function executeAutoExit(uint256 positionId) external;
    function getPositionsNeedingAutoExit() external view returns (uint256[] memory);
}

/**
 * @title KeeperContract
 * @notice Automated executor for SanDigital 4Funds auto-exits
 * @dev Only authorized keeper bot can execute auto-exits
 */
contract KeeperContract {
    ISanDigital4Funds public mainContract;
    address public owner;
    
    event BatchExecuted(uint256 count, address indexed executor, uint256 timestamp);
    event SingleExecuted(uint256 indexed positionId, address indexed executor);
    event MainContractUpdated(address indexed oldContract, address indexed newContract);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _mainContract) {
        require(_mainContract != address(0), "Invalid main contract");
        mainContract = ISanDigital4Funds(_mainContract);
        owner = msg.sender;
    }
    
    /**
     * @notice Execute auto-exits in batch
     * @param positionIds Array of position IDs to execute auto-exit
     * @dev Continues even if individual executions fail
     */
    function batchExecuteAutoExits(uint256[] calldata positionIds) external {
        uint256 successCount = 0;
        
        for (uint256 i = 0; i < positionIds.length; i++) {
            try mainContract.executeAutoExit(positionIds[i]) {
                successCount++;
                emit SingleExecuted(positionIds[i], msg.sender);
            } catch {
                // Continue with next position if one fails
                continue;
            }
        }
        
        emit BatchExecuted(successCount, msg.sender, block.timestamp);
    }
    
    /**
     * @notice Execute single auto-exit (for manual intervention)
     * @param positionId Position ID to execute auto-exit
     */
    function executeSingleAutoExit(uint256 positionId) external {
        mainContract.executeAutoExit(positionId);
        emit SingleExecuted(positionId, msg.sender);
    }
    
    /**
     * @notice Get positions that need auto-exit from main contract
     * @return Array of position IDs ready for auto-exit
     */
    function getPositionsNeedingAutoExit() external view returns (uint256[] memory) {
        return mainContract.getPositionsNeedingAutoExit();
    }
    
    /**
     * @notice Update main contract address (emergency only)
     * @param newContract New main contract address
     */
    function setMainContract(address newContract) external onlyOwner {
        require(newContract != address(0), "Invalid address");
        address oldContract = address(mainContract);
        mainContract = ISanDigital4Funds(newContract);
        emit MainContractUpdated(oldContract, newContract);
    }
    
    /**
     * @notice Transfer ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
    
    /**
     * @notice Receive BNB for gas (if needed)
     */
    receive() external payable {}
    
    /**
     * @notice Withdraw BNB (emergency only)
     * @param amount Amount to withdraw
     */
    function withdrawBNB(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner).transfer(amount);
    }
}
