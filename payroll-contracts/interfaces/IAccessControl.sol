// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

/**
 * @title IAccessControl
 * @notice Interface for managing access control in the payroll system
 * @dev Defines roles and permissions for different actors in the system
 */
interface IAccessControl {
    // ============ Events ============
    
    /// @notice Emitted when a new employer is registered
    /// @param employer The employer address
    /// @param companyName The company name (optional)
    event EmployerRegistered(address indexed employer, string companyName);
    
    /// @notice Emitted when an employer is deactivated
    /// @param employer The employer address
    event EmployerDeactivated(address indexed employer);
    
    /// @notice Emitted when an auditor is granted access
    /// @param auditor The auditor address
    /// @param employer The employer being audited
    event AuditorAccessGranted(address indexed auditor, address indexed employer);
    
    /// @notice Emitted when auditor access is revoked
    /// @param auditor The auditor address
    /// @param employer The employer
    event AuditorAccessRevoked(address indexed auditor, address indexed employer);

    // ============ Roles ============
    
    /// @notice Role identifier for system administrators
    bytes32 constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    /// @notice Role identifier for employers
    bytes32 constant EMPLOYER_ROLE = keccak256("EMPLOYER_ROLE");
    
    /// @notice Role identifier for employees
    bytes32 constant EMPLOYEE_ROLE = keccak256("EMPLOYEE_ROLE");
    
    /// @notice Role identifier for auditors
    bytes32 constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    /// @notice Role identifier for compliance officers
    bytes32 constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    // ============ Core Functions ============
    
    /**
     * @notice Register a new employer in the system
     * @param employer The employer address to register
     * @param companyName The company name (optional)
     */
    function registerEmployer(address employer, string calldata companyName) external;
    
    /**
     * @notice Deactivate an employer (emergency function)
     * @param employer The employer address to deactivate
     */
    function deactivateEmployer(address employer) external;
    
    /**
     * @notice Grant auditor access to specific employer's data
     * @param auditor The auditor address
     * @param employer The employer address
     */
    function grantAuditorAccess(address auditor, address employer) external;
    
    /**
     * @notice Revoke auditor access from specific employer's data
     * @param auditor The auditor address
     * @param employer The employer address
     */
    function revokeAuditorAccess(address auditor, address employer) external;
    
    /**
     * @notice Check if address has employer role
     * @param account The address to check
     * @return hasRole True if account has employer role
     */
    function isEmployer(address account) external view returns (bool hasRole);
    
    /**
     * @notice Check if address has employee role for specific employer
     * @param account The address to check
     * @param employer The employer address
     * @return hasRole True if account is employee of employer
     */
    function isEmployee(address account, address employer) external view returns (bool hasRole);
    
    /**
     * @notice Check if address has auditor access for specific employer
     * @param account The address to check
     * @param employer The employer address
     * @return hasAccess True if account has auditor access
     */
    function hasAuditorAccess(address account, address employer) external view returns (bool hasAccess);
    
    /**
     * @notice Check if caller can access employee data
     * @param employeeId The employee identifier
     * @param employer The employer address
     * @return canAccess True if caller can access the data
     */
    function canAccessEmployeeData(
        bytes32 employeeId,
        address employer
    ) external view returns (bool canAccess);
    
    /**
     * @notice Get all employers in the system (admin only)
     * @return employers Array of employer addresses
     */
    function getAllEmployers() external view returns (address[] memory employers);
    
    /**
     * @notice Get company name for an employer
     * @param employer The employer address
     * @return companyName The registered company name
     */
    function getCompanyName(address employer) external view returns (string memory companyName);
}