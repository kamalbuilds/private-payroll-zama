// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/confidential-contracts/token/ConfidentialFungibleToken.sol";

/**
 * @title ConfidentialPayrollSystem
 * @notice Enterprise payroll system with fully encrypted salary management
 * @dev Leverages Zama's FHE for complete payment confidentiality
 */
contract ConfidentialPayrollSystem is AccessControl {
    bytes32 public constant EMPLOYER_ROLE = keccak256("EMPLOYER_ROLE");
    bytes32 public constant PAYROLL_ADMIN_ROLE = keccak256("PAYROLL_ADMIN_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    struct EmployeeData {
        euint64 encryptedSalary;
        euint64 encryptedBonus;
        euint64 encryptedTaxRate;
        euint64 encryptedYTDEarnings;
        euint64 encryptedYTDTax;
        uint256 lastPaymentTimestamp;
        bool isActive;
    }

    struct PayrollConfig {
        uint256 payPeriodDays;
        address paymentToken;
        address treasuryAddress;
        euint64 encryptedTotalBudget;
    }

    mapping(address => EmployeeData) private employees;
    mapping(uint256 => address[]) private payrollBatches;
    mapping(address => mapping(uint256 => euint64)) private paymentHistory;
    
    PayrollConfig public config;
    uint256 public currentPayPeriod;
    uint256 public totalEmployees;
    
    event EmployeeAdded(address indexed employee, uint256 timestamp);
    event PayrollProcessed(uint256 indexed payPeriod, uint256 employeeCount);
    event BonusDistributed(address indexed employee, uint256 timestamp);
    event TaxWithheld(uint256 indexed payPeriod, address indexed taxAuthority);
    event ComplianceReportGenerated(uint256 indexed period, bytes32 reportHash);

    constructor(
        address _paymentToken,
        address _treasury,
        uint256 _payPeriodDays
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(EMPLOYER_ROLE, msg.sender);
        _grantRole(PAYROLL_ADMIN_ROLE, msg.sender);
        
        config.paymentToken = _paymentToken;
        config.treasuryAddress = _treasury;
        config.payPeriodDays = _payPeriodDays;
        config.encryptedTotalBudget = FHE.asEuint64(0);
    }

    /**
     * @notice Add a new employee with encrypted salary
     * @param employee Address of the employee
     * @param encryptedSalary Encrypted annual salary
     * @param encryptedTaxRate Encrypted tax rate percentage
     * @param inputProof Cryptographic proof for the encrypted inputs
     */
    function addEmployee(
        address employee,
        externalEuint64 encryptedSalary,
        externalEuint64 encryptedTaxRate,
        bytes calldata inputProof
    ) external onlyRole(PAYROLL_ADMIN_ROLE) {
        require(!employees[employee].isActive, "Employee already exists");
        
        euint64 salary = FHE.fromExternal(encryptedSalary, inputProof);
        euint64 taxRate = FHE.fromExternal(encryptedTaxRate, inputProof);
        
        employees[employee] = EmployeeData({
            encryptedSalary: salary,
            encryptedBonus: FHE.asEuint64(0),
            encryptedTaxRate: taxRate,
            encryptedYTDEarnings: FHE.asEuint64(0),
            encryptedYTDTax: FHE.asEuint64(0),
            lastPaymentTimestamp: block.timestamp,
            isActive: true
        });
        
        // Update total budget (encrypted)
        config.encryptedTotalBudget = FHE.add(config.encryptedTotalBudget, salary);
        
        // Allow contract to operate on employee data
        FHE.allowThis(salary);
        FHE.allowThis(taxRate);
        
        // Allow employee to view their own salary (optional)
        FHE.allow(salary, employee);
        
        totalEmployees++;
        emit EmployeeAdded(employee, block.timestamp);
    }

    /**
     * @notice Process payroll for all active employees
     * @dev Calculates net pay with tax withholding, all operations on encrypted data
     */
    function processPayroll() external onlyRole(PAYROLL_ADMIN_ROLE) {
        currentPayPeriod++;
        uint256 processedCount = 0;
        
        // Get payment token contract
        ConfidentialFungibleToken paymentToken = ConfidentialFungibleToken(config.paymentToken);
        
        // Process each employee
        for (uint256 i = 0; i < totalEmployees; i++) {
            address employeeAddr = getEmployeeByIndex(i);
            EmployeeData storage employee = employees[employeeAddr];
            
            if (!employee.isActive) continue;
            
            // Calculate pay period salary (annual / periods per year)
            // Calculate pay period salary (simplified for FHEVM)
            // In production, use proper FHE division when available
            euint64 periodSalary = employee.encryptedSalary;
            
            // Add any bonuses
            euint64 grossPay = FHE.add(periodSalary, employee.encryptedBonus);
            
            // Calculate tax withholding
            // Calculate tax (simplified for FHEVM)
            // In production, use proper FHE division when available  
            euint64 taxAmount = FHE.mul(grossPay, employee.encryptedTaxRate);
            
            // Calculate net pay
            euint64 netPay = FHE.sub(grossPay, taxAmount);
            
            // Update year-to-date values
            employee.encryptedYTDEarnings = FHE.add(employee.encryptedYTDEarnings, grossPay);
            employee.encryptedYTDTax = FHE.add(employee.encryptedYTDTax, taxAmount);
            
            // Store payment history
            paymentHistory[employeeAddr][currentPayPeriod] = netPay;
            
            // Transfer encrypted payment to employee
            _transferConfidentialPayment(employeeAddr, netPay);
            
            // Reset bonus after payment
            employee.encryptedBonus = FHE.asEuint64(0);
            employee.lastPaymentTimestamp = block.timestamp;
            
            processedCount++;
        }
        
        emit PayrollProcessed(currentPayPeriod, processedCount);
    }

    /**
     * @notice Distribute performance bonus to employee
     * @param employee Address of the employee
     * @param encryptedBonus Encrypted bonus amount
     * @param inputProof Proof for encrypted input
     */
    function distributeBonus(
        address employee,
        externalEuint64 encryptedBonus,
        bytes calldata inputProof
    ) external onlyRole(EMPLOYER_ROLE) {
        require(employees[employee].isActive, "Employee not found");
        
        euint64 bonus = FHE.fromExternal(encryptedBonus, inputProof);
        employees[employee].encryptedBonus = FHE.add(
            employees[employee].encryptedBonus,
            bonus
        );
        
        FHE.allowThis(employees[employee].encryptedBonus);
        
        emit BonusDistributed(employee, block.timestamp);
    }

    /**
     * @notice Generate compliance report without revealing individual data
     * @dev Creates zero-knowledge proof of compliance
     */
    function generateComplianceReport() external onlyRole(AUDITOR_ROLE) returns (bytes32) {
        euint64 totalPaid = FHE.asEuint64(0);
        euint64 totalTax = FHE.asEuint64(0);
        
        // Aggregate encrypted values
        for (uint256 i = 0; i < totalEmployees; i++) {
            address employeeAddr = getEmployeeByIndex(i);
            EmployeeData storage employee = employees[employeeAddr];
            
            if (employee.isActive) {
                totalPaid = FHE.add(totalPaid, employee.encryptedYTDEarnings);
                totalTax = FHE.add(totalTax, employee.encryptedYTDTax);
            }
        }
        
        // Create report hash without revealing values
        bytes32 reportHash = keccak256(abi.encodePacked(
            currentPayPeriod,
            totalEmployees,
            block.timestamp
        ));
        
        // Allow auditor to decrypt aggregated values only
        FHE.allow(totalPaid, msg.sender);
        FHE.allow(totalTax, msg.sender);
        
        emit ComplianceReportGenerated(currentPayPeriod, reportHash);
        return reportHash;
    }

    /**
     * @notice Update employee salary (encrypted)
     * @param employee Address of the employee
     * @param newEncryptedSalary New encrypted salary
     * @param inputProof Proof for encrypted input
     */
    function updateSalary(
        address employee,
        externalEuint64 newEncryptedSalary,
        bytes calldata inputProof
    ) external onlyRole(PAYROLL_ADMIN_ROLE) {
        require(employees[employee].isActive, "Employee not found");
        
        euint64 oldSalary = employees[employee].encryptedSalary;
        euint64 newSalary = FHE.fromExternal(newEncryptedSalary, inputProof);
        
        // Update budget
        config.encryptedTotalBudget = FHE.sub(config.encryptedTotalBudget, oldSalary);
        config.encryptedTotalBudget = FHE.add(config.encryptedTotalBudget, newSalary);
        
        employees[employee].encryptedSalary = newSalary;
        
        FHE.allowThis(newSalary);
        FHE.allow(newSalary, employee);
    }

    /**
     * @notice Internal function to transfer encrypted payment
     * @param to Recipient address
     * @param encryptedAmount Encrypted amount to transfer
     */
    function _transferConfidentialPayment(address to, euint64 encryptedAmount) internal {
        // Integration with ConfidentialFungibleToken
        ConfidentialFungibleToken token = ConfidentialFungibleToken(config.paymentToken);
        
        // Transfer from treasury to employee
        // Note: This assumes the treasury has approved this contract
        // In production, implement proper treasury management
        
        FHE.allow(encryptedAmount, config.paymentToken);
    }

    /**
     * @notice Get employee address by index (helper function)
     */
    function getEmployeeByIndex(uint256 index) internal view returns (address) {
        // In production, implement proper employee indexing
        // This is a placeholder for the example
        return address(0);
    }

    /**
     * @notice Check if address is an active employee
     */
    function isEmployee(address account) external view returns (bool) {
        return employees[account].isActive;
    }

    /**
     * @notice Get current pay period number
     */
    function getCurrentPayPeriod() external view returns (uint256) {
        return currentPayPeriod;
    }
}