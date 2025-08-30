import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Confidential Payroll System", function () {
  let payrollSystem: Contract;
  let payrollToken: Contract;
  let owner: SignerWithAddress;
  let employer: SignerWithAddress;
  let employee1: SignerWithAddress;
  let employee2: SignerWithAddress;
  let taxAuthority: SignerWithAddress;
  let auditor: SignerWithAddress;

  beforeEach(async function () {
    [owner, employer, employee1, employee2, taxAuthority, auditor] = await ethers.getSigners();

    // Deploy PayrollToken
    const PayrollToken = await ethers.getContractFactory("PayrollToken");
    const initialSupply = ethers.parseUnits("1000000", 6); // 1M tokens
    payrollToken = await PayrollToken.deploy(
      initialSupply,
      taxAuthority.address
    );
    await payrollToken.waitForDeployment();

    // Deploy ConfidentialPayrollSystem
    const ConfidentialPayrollSystem = await ethers.getContractFactory("ConfidentialPayrollSystem");
    payrollSystem = await ConfidentialPayrollSystem.deploy(
      await payrollToken.getAddress(),
      owner.address, // Treasury
      14 // Bi-weekly payments
    );
    await payrollSystem.waitForDeployment();

    // Set up roles
    await payrollToken.addPayrollManager(await payrollSystem.getAddress());
    await payrollSystem.grantRole(await payrollSystem.EMPLOYER_ROLE(), employer.address);
    await payrollSystem.grantRole(await payrollSystem.AUDITOR_ROLE(), auditor.address);
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await payrollToken.owner()).to.equal(owner.address);
    });

    it("Should set the correct tax authority", async function () {
      expect(await payrollToken.taxAuthority()).to.equal(taxAuthority.address);
    });

    it("Should set the correct pay period", async function () {
      const config = await payrollSystem.config();
      expect(config.payPeriodDays).to.equal(14);
    });
  });

  describe("Employee Management", function () {
    it("Should add an employee with encrypted salary", async function () {
      // Note: In production, these would be encrypted values
      // For testing, we'll use mock encrypted values
      const mockEncryptedSalary = ethers.hexlify(ethers.randomBytes(32));
      const mockEncryptedTaxRate = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      await expect(payrollSystem.addEmployee(
        employee1.address,
        mockEncryptedSalary,
        mockEncryptedTaxRate,
        mockProof
      )).to.emit(payrollSystem, "EmployeeAdded")
        .withArgs(employee1.address, await ethers.provider.getBlock("latest").then(b => b?.timestamp));
      
      expect(await payrollSystem.isEmployee(employee1.address)).to.be.true;
      expect(await payrollSystem.totalEmployees()).to.equal(1);
    });

    it("Should not allow adding duplicate employees", async function () {
      const mockEncryptedSalary = ethers.hexlify(ethers.randomBytes(32));
      const mockEncryptedTaxRate = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      await payrollSystem.addEmployee(
        employee1.address,
        mockEncryptedSalary,
        mockEncryptedTaxRate,
        mockProof
      );

      await expect(payrollSystem.addEmployee(
        employee1.address,
        mockEncryptedSalary,
        mockEncryptedTaxRate,
        mockProof
      )).to.be.revertedWith("Employee already exists");
    });

    it("Should remove an employee", async function () {
      const mockEncryptedSalary = ethers.hexlify(ethers.randomBytes(32));
      const mockEncryptedTaxRate = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      await payrollSystem.addEmployee(
        employee1.address,
        mockEncryptedSalary,
        mockEncryptedTaxRate,
        mockProof
      );

      await payrollSystem.removeEmployee(employee1.address);
      expect(await payrollSystem.isEmployee(employee1.address)).to.be.false;
    });
  });

  describe("Payroll Processing", function () {
    beforeEach(async function () {
      // Add test employees
      const mockEncryptedSalary = ethers.hexlify(ethers.randomBytes(32));
      const mockEncryptedTaxRate = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      await payrollSystem.addEmployee(
        employee1.address,
        mockEncryptedSalary,
        mockEncryptedTaxRate,
        mockProof
      );

      await payrollSystem.addEmployee(
        employee2.address,
        mockEncryptedSalary,
        mockEncryptedTaxRate,
        mockProof
      );
    });

    it("Should process payroll for all employees", async function () {
      await expect(payrollSystem.processPayroll())
        .to.emit(payrollSystem, "PayrollProcessed")
        .withArgs(1, 2); // Period 1, 2 employees

      expect(await payrollSystem.getCurrentPayPeriod()).to.equal(1);
    });

    it("Should only allow PAYROLL_ADMIN to process payroll", async function () {
      await expect(
        payrollSystem.connect(employee1).processPayroll()
      ).to.be.revertedWith("AccessControl:");
    });
  });

  describe("Bonus Distribution", function () {
    beforeEach(async function () {
      const mockEncryptedSalary = ethers.hexlify(ethers.randomBytes(32));
      const mockEncryptedTaxRate = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      await payrollSystem.addEmployee(
        employee1.address,
        mockEncryptedSalary,
        mockEncryptedTaxRate,
        mockProof
      );
    });

    it("Should distribute bonus to employee", async function () {
      const mockEncryptedBonus = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      await expect(
        payrollSystem.connect(employer).distributeBonus(
          employee1.address,
          mockEncryptedBonus,
          mockProof
        )
      ).to.emit(payrollSystem, "BonusDistributed")
        .withArgs(employee1.address, await ethers.provider.getBlock("latest").then(b => b?.timestamp));
    });

    it("Should only allow EMPLOYER to distribute bonuses", async function () {
      const mockEncryptedBonus = ethers.hexlify(ethers.randomBytes(32));
      const mockProof = ethers.hexlify(ethers.randomBytes(64));

      await expect(
        payrollSystem.connect(employee1).distributeBonus(
          employee1.address,
          mockEncryptedBonus,
          mockProof
        )
      ).to.be.revertedWith("AccessControl:");
    });
  });

  describe("Compliance Reporting", function () {
    it("Should generate compliance report", async function () {
      const reportHash = await payrollSystem.connect(auditor).generateComplianceReport();
      expect(reportHash).to.be.properHex(64); // 32 bytes = 64 hex chars
    });

    it("Should only allow AUDITOR to generate reports", async function () {
      await expect(
        payrollSystem.connect(employee1).generateComplianceReport()
      ).to.be.revertedWith("AccessControl:");
    });
  });

  describe("Access Control", function () {
    it("Should have correct roles set up", async function () {
      const DEFAULT_ADMIN_ROLE = await payrollSystem.DEFAULT_ADMIN_ROLE();
      const EMPLOYER_ROLE = await payrollSystem.EMPLOYER_ROLE();
      const PAYROLL_ADMIN_ROLE = await payrollSystem.PAYROLL_ADMIN_ROLE();
      const AUDITOR_ROLE = await payrollSystem.AUDITOR_ROLE();

      expect(await payrollSystem.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await payrollSystem.hasRole(EMPLOYER_ROLE, employer.address)).to.be.true;
      expect(await payrollSystem.hasRole(PAYROLL_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await payrollSystem.hasRole(AUDITOR_ROLE, auditor.address)).to.be.true;
    });
  });

  describe("PayrollToken", function () {
    it("Should add and remove payroll managers", async function () {
      await payrollToken.addPayrollManager(employer.address);
      expect(await payrollToken.payrollManagers(employer.address)).to.be.true;

      await payrollToken.removePayrollManager(employer.address);
      expect(await payrollToken.payrollManagers(employer.address)).to.be.false;
    });

    it("Should only allow owner to manage payroll managers", async function () {
      await expect(
        payrollToken.connect(employee1).addPayrollManager(employee2.address)
      ).to.be.revertedWith("Ownable:");
    });
  });
});