// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title IPayrollToken
 * @notice Interface for payroll-specific token operations
 * @dev Extends standard encrypted token functionality with payroll-specific features
 */
interface IPayrollToken {
    // ============ Events ============
    
    /// @notice Emitted when payroll allowance is set for an employer
    /// @param employer The employer address
    /// @param totalAllowance The total encrypted allowance set
    event PayrollAllowanceSet(address indexed employer, euint64 totalAllowance);
    
    /// @notice Emitted when salary is paid from employer to employee
    /// @param employer The employer address
    /// @param employee The employee address
    /// @param paymentId The unique payment identifier
    event SalaryTransfer(address indexed employer, address indexed employee, bytes32 indexed paymentId);
    
    /// @notice Emitted when payroll budget is topped up
    /// @param employer The employer address
    /// @param amount The amount added to budget
    event PayrollBudgetTopUp(address indexed employer, uint64 amount);

    // ============ Payroll-Specific Functions ============
    
    /**
     * @notice Set encrypted payroll budget for an employer
     * @param encryptedBudget The encrypted total payroll budget
     * @param inputProof Proof for the encrypted budget input
     */
    function setPayrollBudget(
        externalEuint64 encryptedBudget,
        bytes calldata inputProof
    ) external;
    
    /**
     * @notice Process encrypted salary payment from employer to employee
     * @param employee The employee address
     * @param encryptedAmount The encrypted salary amount
     * @param paymentId The unique payment identifier
     */
    function processSalaryPayment(
        address employee,
        euint64 encryptedAmount,
        bytes32 paymentId
    ) external;
    
    /**
     * @notice Get encrypted payroll budget remaining for an employer
     * @param employer The employer address
     * @return budget The encrypted remaining budget
     */
    function getPayrollBudget(address employer) external view returns (euint64 budget);
    
    /**
     * @notice Add to payroll budget (mint new tokens for payroll)
     * @param employer The employer address
     * @param amount The plaintext amount to add
     */
    function topUpPayrollBudget(address employer, uint64 amount) external;
    
    /**
     * @notice Batch process multiple salary payments
     * @param employees Array of employee addresses
     * @param encryptedAmounts Array of encrypted salary amounts
     * @param paymentIds Array of unique payment identifiers
     */
    function batchProcessSalaries(
        address[] calldata employees,
        euint64[] calldata encryptedAmounts,
        bytes32[] calldata paymentIds
    ) external;
    
    /**
     * @notice Emergency withdraw function for employers (in case of contract issues)
     * @param encryptedAmount The encrypted amount to withdraw
     * @param inputProof Proof for the encrypted amount input
     */
    function emergencyWithdraw(
        externalEuint64 encryptedAmount,
        bytes calldata inputProof
    ) external;
}