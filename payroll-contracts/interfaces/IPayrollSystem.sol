// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, ebool, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title IPayrollSystem
 * @notice Core interface for the encrypted payroll system
 * @dev Defines the main functionality for managing encrypted employee payroll data
 */
interface IPayrollSystem {
    // ============ Events ============
    
    /// @notice Emitted when a new employee is added to the payroll
    /// @param employeeId The unique identifier for the employee
    /// @param employer The address of the employer who added the employee
    event EmployeeAdded(bytes32 indexed employeeId, address indexed employer);
    
    /// @notice Emitted when employee salary is updated
    /// @param employeeId The unique identifier for the employee
    /// @param employer The address of the employer
    event SalaryUpdated(bytes32 indexed employeeId, address indexed employer);
    
    /// @notice Emitted when salary is paid to an employee
    /// @param employeeId The unique identifier for the employee
    /// @param employer The address of the employer
    /// @param paymentId The unique identifier for this payment
    event SalaryPaid(bytes32 indexed employeeId, address indexed employer, bytes32 indexed paymentId);
    
    /// @notice Emitted when employee is removed from payroll
    /// @param employeeId The unique identifier for the employee
    /// @param employer The address of the employer
    event EmployeeRemoved(bytes32 indexed employeeId, address indexed employer);

    // ============ Structs ============
    
    /// @notice Employee information structure (all encrypted except metadata)
    struct Employee {
        bytes32 employeeId;           // Unique identifier (hash of employee data)
        address employeeAddress;      // Employee's wallet address
        euint64 encryptedSalary;     // Encrypted monthly salary
        euint64 encryptedBonus;      // Encrypted bonus amount
        uint8 paymentFrequency;      // 1=weekly, 2=bi-weekly, 4=monthly
        bool isActive;               // Employment status
        uint256 startDate;           // Employment start date (timestamp)
        uint256 lastPaymentDate;     // Last payment timestamp
    }
    
    /// @notice Payment record structure
    struct PaymentRecord {
        bytes32 paymentId;           // Unique payment identifier
        bytes32 employeeId;          // Employee identifier
        euint64 encryptedAmount;     // Encrypted payment amount
        uint8 paymentType;           // 1=salary, 2=bonus, 3=overtime
        uint256 paymentDate;         // Payment timestamp
        bool isProcessed;            // Payment processing status
    }

    // ============ Core Functions ============
    
    /**
     * @notice Add a new employee to the payroll system
     * @param employeeAddress The wallet address of the employee
     * @param encryptedSalary The encrypted monthly salary
     * @param inputProof Proof for the encrypted salary input
     * @param paymentFrequency Payment frequency (1=weekly, 2=bi-weekly, 4=monthly)
     * @return employeeId The unique identifier generated for the employee
     */
    function addEmployee(
        address employeeAddress,
        externalEuint64 encryptedSalary,
        bytes calldata inputProof,
        uint8 paymentFrequency
    ) external returns (bytes32 employeeId);
    
    /**
     * @notice Update an employee's salary
     * @param employeeId The unique identifier of the employee
     * @param newEncryptedSalary The new encrypted salary
     * @param inputProof Proof for the encrypted salary input
     */
    function updateSalary(
        bytes32 employeeId,
        externalEuint64 newEncryptedSalary,
        bytes calldata inputProof
    ) external;
    
    /**
     * @notice Process salary payment for an employee
     * @param employeeId The unique identifier of the employee
     * @return paymentId The unique identifier for this payment
     */
    function processSalaryPayment(bytes32 employeeId) external returns (bytes32 paymentId);
    
    /**
     * @notice Process bonus payment for an employee
     * @param employeeId The unique identifier of the employee
     * @param encryptedBonusAmount The encrypted bonus amount
     * @param inputProof Proof for the encrypted bonus input
     * @return paymentId The unique identifier for this payment
     */
    function processBonusPayment(
        bytes32 employeeId,
        externalEuint64 encryptedBonusAmount,
        bytes calldata inputProof
    ) external returns (bytes32 paymentId);
    
    /**
     * @notice Remove an employee from the payroll
     * @param employeeId The unique identifier of the employee
     */
    function removeEmployee(bytes32 employeeId) external;
    
    /**
     * @notice Get employee information (only accessible by authorized parties)
     * @param employeeId The unique identifier of the employee
     * @return employee The employee information struct
     */
    function getEmployee(bytes32 employeeId) external view returns (Employee memory employee);
    
    /**
     * @notice Get encrypted salary for an employee (only accessible by authorized parties)
     * @param employeeId The unique identifier of the employee
     * @return encryptedSalary The encrypted salary amount
     */
    function getEmployeeSalary(bytes32 employeeId) external view returns (euint64 encryptedSalary);
    
    /**
     * @notice Check if employee is eligible for payment
     * @param employeeId The unique identifier of the employee
     * @return eligible Encrypted boolean indicating eligibility
     */
    function isPaymentEligible(bytes32 employeeId) external view returns (ebool eligible);
    
    /**
     * @notice Get payment history for an employee (only accessible by authorized parties)
     * @param employeeId The unique identifier of the employee
     * @param limit Maximum number of records to return
     * @return payments Array of payment records
     */
    function getPaymentHistory(
        bytes32 employeeId,
        uint256 limit
    ) external view returns (PaymentRecord[] memory payments);
}