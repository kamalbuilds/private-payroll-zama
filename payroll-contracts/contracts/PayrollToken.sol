// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaConfig.sol";
import "@openzeppelin/confidential-contracts/token/ConfidentialFungibleToken.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";

/**
 * @title PayrollToken
 * @notice Confidential token specifically designed for payroll payments
 * @dev Extends ConfidentialFungibleToken with payroll-specific features
 */
contract PayrollToken is SepoliaConfig, ConfidentialFungibleToken, Ownable2Step {
    
    mapping(address => bool) public payrollManagers;
    mapping(address => euint64) private pendingWithholdings;
    address public taxAuthority;
    
    event PayrollManagerAdded(address indexed manager);
    event PayrollManagerRemoved(address indexed manager);
    event TaxWithheld(address indexed from, uint256 period);
    event TaxRemitted(address indexed authority, uint256 period);
    
    modifier onlyPayrollManager() {
        require(payrollManagers[msg.sender], "Not a payroll manager");
        _;
    }
    
    constructor(
        uint64 initialSupply,
        address _taxAuthority
    ) ConfidentialFungibleToken(
        "Confidential Payroll Token",
        "CPT",
        "https://payroll.example/token"
    ) Ownable(msg.sender) {
        // Mint initial supply to treasury
        euint64 encryptedSupply = FHE.asEuint64(initialSupply);
        _mint(msg.sender, encryptedSupply);
        
        taxAuthority = _taxAuthority;
        payrollManagers[msg.sender] = true;
    }
    
    /**
     * @notice Add a payroll manager who can process payments
     * @param manager Address to grant payroll manager role
     */
    function addPayrollManager(address manager) external onlyOwner {
        payrollManagers[manager] = true;
        emit PayrollManagerAdded(manager);
    }
    
    /**
     * @notice Remove a payroll manager
     * @param manager Address to revoke payroll manager role
     */
    function removePayrollManager(address manager) external onlyOwner {
        payrollManagers[manager] = false;
        emit PayrollManagerRemoved(manager);
    }
    
    /**
     * @notice Process payroll payment with automatic tax withholding
     * @param employee Employee address
     * @param grossPay Encrypted gross payment amount
     * @param taxAmount Encrypted tax to withhold
     */
    function processPayrollPayment(
        address employee,
        euint64 grossPay,
        euint64 taxAmount
    ) public onlyPayrollManager {
        require(FHE.isSenderAllowed(grossPay), "Gross pay not allowed");
        require(FHE.isSenderAllowed(taxAmount), "Tax amount not allowed");
        
        // Calculate net pay
        euint64 netPay = FHE.sub(grossPay, taxAmount);
        
        // Transfer net pay to employee
        ebool canTransfer = FHE.le(grossPay, confidentialBalanceOf(msg.sender));
        
        // Conditional transfer based on balance check
        euint64 actualTransfer = FHE.select(canTransfer, netPay, FHE.asEuint64(0));
        
        // Perform the transfer
        _update(msg.sender, employee, actualTransfer);
        
        // Accumulate tax withholdings
        pendingWithholdings[taxAuthority] = FHE.add(
            pendingWithholdings[taxAuthority],
            taxAmount
        );
        
        // Allow employee to view their balance
        FHE.allow(confidentialBalanceOf(employee), employee);
        
        emit TaxWithheld(employee, block.timestamp);
    }
    
    /**
     * @notice Batch process multiple payroll payments
     * @param employees Array of employee addresses
     * @param grossPayments Array of encrypted gross payments
     * @param taxAmounts Array of encrypted tax amounts
     */
    function batchProcessPayroll(
        address[] calldata employees,
        euint64[] calldata grossPayments,
        euint64[] calldata taxAmounts
    ) external onlyPayrollManager {
        require(
            employees.length == grossPayments.length && 
            employees.length == taxAmounts.length,
            "Array length mismatch"
        );
        
        for (uint256 i = 0; i < employees.length; i++) {
            processPayrollPayment(
                employees[i],
                grossPayments[i],
                taxAmounts[i]
            );
        }
    }
    
    /**
     * @notice Remit accumulated tax withholdings to tax authority
     * @dev Only callable by payroll managers
     */
    function remitTaxWithholdings() external onlyPayrollManager {
        euint64 totalTax = pendingWithholdings[taxAuthority];
        
        // Check if there are taxes to remit
        ebool hasTax = FHE.gt(totalTax, FHE.asEuint64(0));
        
        // Transfer tax amount to authority
        euint64 remittance = FHE.select(hasTax, totalTax, FHE.asEuint64(0));
        _update(msg.sender, taxAuthority, remittance);
        
        // Reset pending withholdings
        pendingWithholdings[taxAuthority] = FHE.asEuint64(0);
        
        // Allow tax authority to view their balance
        FHE.allow(confidentialBalanceOf(taxAuthority), taxAuthority);
        
        emit TaxRemitted(taxAuthority, block.timestamp);
    }
    
    /**
     * @notice Get encrypted balance (extends base functionality)
     * @param account Address to check balance
     * @return Encrypted balance
     */
    function confidentialBalanceOf(address account) public view override returns (euint64) {
        // Return the encrypted balance from the parent contract
        return super.confidentialBalanceOf(account);
    }
    
    /**
     * @notice Emergency pause functionality
     * @dev Can be extended with OpenZeppelin Pausable
     */
    function emergencyPause() external onlyOwner {
        // Implement emergency pause logic
        // This would prevent all transfers temporarily
    }
}