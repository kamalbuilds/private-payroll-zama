// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/contracts/PayrollSystem.sol";
import "../src/contracts/PayrollToken.sol";
import "../src/contracts/PayrollAccessControl.sol";
import {FHE, externalEuint64, euint64} from "@fhevm/solidity/lib/FHE.sol";

/**
 * @title PayrollSystemTest
 * @notice Comprehensive test suite for the encrypted payroll system
 * @dev Tests all major functionality including encrypted operations
 */
contract PayrollSystemTest is Test {
    // ============ Contract Instances ============
    
    PayrollSystem public payrollSystem;
    PayrollToken public payrollToken;
    PayrollAccessControl public accessControl;
    
    // ============ Test Accounts ============
    
    address public admin;
    address public employer1;
    address public employer2;
    address public employee1;
    address public employee2;
    address public auditor1;
    address public unauthorized;
    
    // ============ Test Data ============
    
    uint64 public constant INITIAL_TOKEN_SUPPLY = 10_000_000 * 10**6; // 10M tokens
    uint64 public constant MIN_SALARY = 1_000 * 10**6; // $1,000
    uint64 public constant MAX_SALARY = 1_000_000 * 10**6; // $1,000,000
    uint64 public constant TEST_SALARY = 50_000 * 10**6; // $50,000 monthly
    uint64 public constant TEST_BONUS = 10_000 * 10**6; // $10,000 bonus
    
    string public constant COMPANY_NAME = "Test Company Inc";
    string public constant TOKEN_NAME = "PayrollToken";
    string public constant TOKEN_SYMBOL = "PAY";
    string public constant TOKEN_URI = "https://payroll.example.com/token";
    
    // ============ Events for Testing ============
    
    event EmployeeAdded(bytes32 indexed employeeId, address indexed employer);
    event SalaryUpdated(bytes32 indexed employeeId, address indexed employer);
    event SalaryPaid(bytes32 indexed employeeId, address indexed employer, bytes32 indexed paymentId);
    
    // ============ Setup ============
    
    function setUp() public {
        // Set up test accounts
        admin = makeAddr("admin");
        employer1 = makeAddr("employer1");
        employer2 = makeAddr("employer2");
        employee1 = makeAddr("employee1");
        employee2 = makeAddr("employee2");
        auditor1 = makeAddr("auditor1");
        unauthorized = makeAddr("unauthorized");
        
        // Deploy contracts as admin
        vm.startPrank(admin);
        
        // Deploy access control
        accessControl = new PayrollAccessControl();
        
        // Deploy payroll token
        payrollToken = new PayrollToken(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            TOKEN_URI,
            INITIAL_TOKEN_SUPPLY
        );
        
        // Deploy payroll system
        payrollSystem = new PayrollSystem(
            address(payrollToken),
            address(accessControl),
            MIN_SALARY,
            MAX_SALARY
        );
        
        // Authorize payroll system in token contract
        payrollToken.authorizePayrollSystem(address(payrollSystem));
        
        // Register employers
        accessControl.registerEmployer(employer1, COMPANY_NAME);
        accessControl.registerEmployer(employer2, "Second Company");
        
        vm.stopPrank();
        
        // Fund employers with tokens for payroll
        vm.prank(admin);
        payrollToken.topUpPayrollBudget(employer1, 1_000_000 * 10**6); // $1M budget
        
        vm.prank(admin);
        payrollToken.topUpPayrollBudget(employer2, 500_000 * 10**6); // $500K budget
    }
    
    // ============ Access Control Tests ============
    
    function testEmployerRegistration() public {
        vm.prank(admin);
        accessControl.registerEmployer(makeAddr("newEmployer"), "New Company");
        
        assertTrue(accessControl.isEmployer(makeAddr("newEmployer")));
        assertEq(accessControl.getCompanyName(makeAddr("newEmployer")), "New Company");
    }
    
    function testUnauthorizedEmployerRegistration() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        accessControl.registerEmployer(makeAddr("newEmployer"), "New Company");
    }
    
    function testEmployerDeactivation() public {
        vm.prank(admin);
        accessControl.deactivateEmployer(employer1);
        
        assertFalse(accessControl.isEmployer(employer1));
    }
    
    // ============ Employee Management Tests ============
    
    function testAddEmployee() public {
        vm.startPrank(employer1);
        
        // Create encrypted salary input
        uint64 salary = TEST_SALARY;
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedSalary = _createMockEncryptedInput(salary);
        
        // Add employee
        bytes32 employeeId = payrollSystem.addEmployee(
            employee1,
            encryptedSalary,
            inputProof,
            PayrollTypes.MONTHLY
        );
        
        vm.stopPrank();
        
        // Verify employee was added
        assertTrue(employeeId != bytes32(0));
        
        // Get employee data (as employer)
        vm.prank(employer1);
        IPayrollSystem.Employee memory emp = payrollSystem.getEmployee(employeeId);
        
        assertEq(emp.employeeAddress, employee1);
        assertEq(emp.paymentFrequency, PayrollTypes.MONTHLY);
        assertTrue(emp.isActive);
    }
    
    function testAddEmployeeUnauthorized() public {
        vm.startPrank(unauthorized);
        
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedSalary = _createMockEncryptedInput(TEST_SALARY);
        
        vm.expectRevert("Not an authorized employer");
        payrollSystem.addEmployee(
            employee1,
            encryptedSalary,
            inputProof,
            PayrollTypes.MONTHLY
        );
        
        vm.stopPrank();
    }
    
    function testUpdateEmployeeSalary() public {
        // First add employee
        bytes32 employeeId = _addTestEmployee(employer1, employee1, TEST_SALARY);
        
        vm.startPrank(employer1);
        
        // Update salary
        uint64 newSalary = 60_000 * 10**6; // $60,000
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedNewSalary = _createMockEncryptedInput(newSalary);
        
        vm.expectEmit(true, true, false, false);
        emit SalaryUpdated(employeeId, employer1);
        
        payrollSystem.updateSalary(employeeId, encryptedNewSalary, inputProof);
        
        vm.stopPrank();
    }
    
    function testRemoveEmployee() public {
        // First add employee
        bytes32 employeeId = _addTestEmployee(employer1, employee1, TEST_SALARY);
        
        vm.startPrank(employer1);
        
        vm.expectEmit(true, true, false, false);
        emit EmployeeRemoved(employeeId, employer1);
        
        payrollSystem.removeEmployee(employeeId);
        
        vm.stopPrank();
        
        // Verify employee is no longer active
        vm.prank(employer1);
        IPayrollSystem.Employee memory emp = payrollSystem.getEmployee(employeeId);
        assertFalse(emp.isActive);
    }
    
    // ============ Payment Processing Tests ============
    
    function testProcessSalaryPayment() public {
        // Add employee
        bytes32 employeeId = _addTestEmployee(employer1, employee1, TEST_SALARY);
        
        // Fast forward time to make payment due
        vm.warp(block.timestamp + 31 days);
        
        vm.startPrank(employer1);
        
        vm.expectEmit(true, true, true, false);
        emit SalaryPaid(employeeId, employer1, bytes32(0)); // paymentId will be generated
        
        bytes32 paymentId = payrollSystem.processSalaryPayment(employeeId);
        
        vm.stopPrank();
        
        assertTrue(paymentId != bytes32(0));
    }
    
    function testProcessBonusPayment() public {
        // Add employee
        bytes32 employeeId = _addTestEmployee(employer1, employee1, TEST_SALARY);
        
        vm.startPrank(employer1);
        
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedBonus = _createMockEncryptedInput(TEST_BONUS);
        
        vm.expectEmit(true, true, true, false);
        emit SalaryPaid(employeeId, employer1, bytes32(0)); // paymentId will be generated
        
        bytes32 paymentId = payrollSystem.processBonusPayment(
            employeeId,
            encryptedBonus,
            inputProof
        );
        
        vm.stopPrank();
        
        assertTrue(paymentId != bytes32(0));
    }
    
    function testPaymentNotDueYet() public {
        // Add employee
        bytes32 employeeId = _addTestEmployee(employer1, employee1, TEST_SALARY);
        
        vm.startPrank(employer1);
        
        vm.expectRevert("Payment not due yet");
        payrollSystem.processSalaryPayment(employeeId);
        
        vm.stopPrank();
    }
    
    // ============ Token Integration Tests ============
    
    function testPayrollBudgetManagement() public {
        vm.startPrank(employer1);
        
        // Set payroll budget
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedBudget = _createMockEncryptedInput(100_000 * 10**6); // $100K
        
        payrollToken.setPayrollBudget(encryptedBudget, inputProof);
        
        // Check budget was set (encrypted, so we can't directly compare values)
        euint64 budget = payrollToken.getPayrollBudget(employer1);
        assertTrue(FHE.isInitialized(budget));
        
        vm.stopPrank();
    }
    
    function testBatchSalaryProcessing() public {
        // Add multiple employees
        bytes32 employeeId1 = _addTestEmployee(employer1, employee1, TEST_SALARY);
        bytes32 employeeId2 = _addTestEmployee(employer1, employee2, TEST_SALARY);
        
        // Fast forward time to make payments due
        vm.warp(block.timestamp + 31 days);
        
        vm.startPrank(employer1);
        
        // Prepare batch payment data
        address[] memory employees = new address[](2);
        employees[0] = employee1;
        employees[1] = employee2;
        
        euint64[] memory amounts = new euint64[](2);
        amounts[0] = FHE.asEuint64(TEST_SALARY);
        amounts[1] = FHE.asEuint64(TEST_SALARY);
        
        bytes32[] memory paymentIds = new bytes32[](2);
        paymentIds[0] = keccak256(abi.encode("payment1", block.timestamp));
        paymentIds[1] = keccak256(abi.encode("payment2", block.timestamp));
        
        // Process batch payments
        payrollToken.batchProcessSalaries(employees, amounts, paymentIds);
        
        vm.stopPrank();
    }
    
    // ============ Security Tests ============
    
    function testUnauthorizedAccess() public {
        bytes32 employeeId = _addTestEmployee(employer1, employee1, TEST_SALARY);
        
        vm.startPrank(unauthorized);
        
        // Try to access employee data
        vm.expectRevert("Not authorized to access employee data");
        payrollSystem.getEmployee(employeeId);
        
        // Try to update salary
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedSalary = _createMockEncryptedInput(TEST_SALARY);
        
        vm.expectRevert("Not an authorized employer");
        payrollSystem.updateSalary(employeeId, encryptedSalary, inputProof);
        
        vm.stopPrank();
    }
    
    function testCrossEmployerSecurity() public {
        // Employer1 adds employee
        bytes32 employeeId = _addTestEmployee(employer1, employee1, TEST_SALARY);
        
        vm.startPrank(employer2);
        
        // Employer2 tries to access employer1's employee
        vm.expectRevert("Not authorized to access employee data");
        payrollSystem.getEmployee(employeeId);
        
        vm.stopPrank();
    }
    
    function testSystemPause() public {
        vm.startPrank(admin);
        
        // Pause the system
        payrollSystem.setSystemPaused(true);
        
        vm.stopPrank();
        
        vm.startPrank(employer1);
        
        // Try to add employee while paused
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedSalary = _createMockEncryptedInput(TEST_SALARY);
        
        vm.expectRevert("System is paused");
        payrollSystem.addEmployee(
            employee1,
            encryptedSalary,
            inputProof,
            PayrollTypes.MONTHLY
        );
        
        vm.stopPrank();
    }
    
    // ============ Helper Functions ============
    
    function _addTestEmployee(
        address employer,
        address employee,
        uint64 salary
    ) internal returns (bytes32 employeeId) {
        vm.startPrank(employer);
        
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedSalary = _createMockEncryptedInput(salary);
        
        employeeId = payrollSystem.addEmployee(
            employee,
            encryptedSalary,
            inputProof,
            PayrollTypes.MONTHLY
        );
        
        vm.stopPrank();
    }
    
    function _createMockProof() internal pure returns (bytes memory) {
        // In a real implementation, this would be a valid FHE proof
        return abi.encode("mock_proof");
    }
    
    function _createMockEncryptedInput(uint64 value) internal pure returns (externalEuint64) {
        // In a real implementation, this would be a properly encrypted value
        return externalEuint64.wrap(bytes32(uint256(value)));
    }
    
    // ============ Fuzz Tests ============
    
    function testFuzzSalaryBounds(uint64 salary) public {
        vm.assume(salary > 0 && salary < type(uint64).max);
        
        vm.startPrank(employer1);
        
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedSalary = _createMockEncryptedInput(salary);
        
        if (salary < MIN_SALARY || salary > MAX_SALARY) {
            vm.expectRevert("Salary amount out of bounds");
        }
        
        bytes32 employeeId = payrollSystem.addEmployee(
            employee1,
            encryptedSalary,
            inputProof,
            PayrollTypes.MONTHLY
        );
        
        if (salary >= MIN_SALARY && salary <= MAX_SALARY) {
            assertTrue(employeeId != bytes32(0));
        }
        
        vm.stopPrank();
    }
    
    function testFuzzPaymentFrequency(uint8 frequency) public {
        vm.startPrank(employer1);
        
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedSalary = _createMockEncryptedInput(TEST_SALARY);
        
        if (frequency != PayrollTypes.WEEKLY && 
            frequency != PayrollTypes.BI_WEEKLY && 
            frequency != PayrollTypes.MONTHLY) {
            vm.expectRevert("Invalid payment frequency");
        }
        
        payrollSystem.addEmployee(
            employee1,
            encryptedSalary,
            inputProof,
            frequency
        );
        
        vm.stopPrank();
    }
    
    // ============ Gas Optimization Tests ============
    
    function testGasUsageAddEmployee() public {
        vm.startPrank(employer1);
        
        bytes memory inputProof = _createMockProof();
        externalEuint64 encryptedSalary = _createMockEncryptedInput(TEST_SALARY);
        
        uint256 gasStart = gasleft();
        payrollSystem.addEmployee(
            employee1,
            encryptedSalary,
            inputProof,
            PayrollTypes.MONTHLY
        );
        uint256 gasUsed = gasStart - gasleft();
        
        vm.stopPrank();
        
        // Assert gas usage is within expected bounds (adjust based on actual measurements)
        assertLt(gasUsed, 500_000, "Gas usage too high for adding employee");
    }
    
    function testGasUsageProcessPayment() public {
        bytes32 employeeId = _addTestEmployee(employer1, employee1, TEST_SALARY);
        vm.warp(block.timestamp + 31 days);
        
        vm.startPrank(employer1);
        
        uint256 gasStart = gasleft();
        payrollSystem.processSalaryPayment(employeeId);
        uint256 gasUsed = gasStart - gasleft();
        
        vm.stopPrank();
        
        // Assert gas usage is within expected bounds
        assertLt(gasUsed, 300_000, "Gas usage too high for processing payment");
    }
}