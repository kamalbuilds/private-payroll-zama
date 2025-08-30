const { ethers } = require("hardhat");
const { FhenixClient } = require("fhenixjs");

async function main() {
  console.log("🚀 Deploying Confidential Payroll System...\n");

  // Get signers
  const [deployer, taxAuthority, employee1, employee2] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy PayrollToken
  console.log("\n📦 Deploying PayrollToken...");
  const PayrollToken = await ethers.getContractFactory("PayrollToken");
  const initialSupply = ethers.utils.parseUnits("1000000", 6); // 1M tokens with 6 decimals
  const payrollToken = await PayrollToken.deploy(
    initialSupply,
    taxAuthority.address
  );
  await payrollToken.deployed();
  console.log("✅ PayrollToken deployed to:", payrollToken.address);
  
  // Deploy ConfidentialPayrollSystem
  console.log("\n📦 Deploying ConfidentialPayrollSystem...");
  const ConfidentialPayrollSystem = await ethers.getContractFactory("ConfidentialPayrollSystem");
  const payPeriodDays = 14; // Bi-weekly payments
  const payrollSystem = await ConfidentialPayrollSystem.deploy(
    payrollToken.address,
    deployer.address, // Treasury address
    payPeriodDays
  );
  await payrollSystem.deployed();
  console.log("✅ ConfidentialPayrollSystem deployed to:", payrollSystem.address);
  
  // Configure PayrollToken
  console.log("\n⚙️ Configuring PayrollToken...");
  await payrollToken.addPayrollManager(payrollSystem.address);
  console.log("✅ Added PayrollSystem as payroll manager");
  
  // Initialize FhenixClient for encryption
  const provider = new ethers.providers.JsonRpcProvider();
  const fhenixClient = new FhenixClient({ provider });
  
  // Add employees with encrypted salaries
  console.log("\n👥 Adding employees with encrypted salaries...");
  
  // Employee 1: $120,000 annual salary, 25% tax rate
  const salary1 = 120000 * 1e6; // Convert to token decimals
  const encryptedSalary1 = await fhenixClient.encrypt(salary1, "uint64");
  const encryptedTaxRate1 = await fhenixClient.encrypt(25, "uint64");
  
  await payrollSystem.addEmployee(
    employee1.address,
    encryptedSalary1.encrypted,
    encryptedTaxRate1.encrypted,
    encryptedSalary1.proof
  );
  console.log("✅ Added Employee 1 with encrypted salary");
  
  // Employee 2: $80,000 annual salary, 20% tax rate
  const salary2 = 80000 * 1e6;
  const encryptedSalary2 = await fhenixClient.encrypt(salary2, "uint64");
  const encryptedTaxRate2 = await fhenixClient.encrypt(20, "uint64");
  
  await payrollSystem.addEmployee(
    employee2.address,
    encryptedSalary2.encrypted,
    encryptedTaxRate2.encrypted,
    encryptedSalary2.proof
  );
  console.log("✅ Added Employee 2 with encrypted salary");
  
  // Transfer tokens to payroll system for payments
  console.log("\n💰 Funding payroll system...");
  const fundAmount = ethers.utils.parseUnits("100000", 6);
  await payrollToken.transfer(payrollSystem.address, fundAmount);
  console.log("✅ Transferred 100,000 tokens to payroll system");
  
  // Process first payroll
  console.log("\n📊 Processing payroll...");
  await payrollSystem.processPayroll();
  console.log("✅ Payroll processed successfully!");
  
  // Generate compliance report
  console.log("\n📋 Generating compliance report...");
  const reportHash = await payrollSystem.generateComplianceReport();
  console.log("✅ Compliance report generated:", reportHash);
  
  // Display deployment summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📍 Contract Addresses:");
  console.log("  PayrollToken:", payrollToken.address);
  console.log("  PayrollSystem:", payrollSystem.address);
  console.log("\n👤 Configured Accounts:");
  console.log("  Deployer/Treasury:", deployer.address);
  console.log("  Tax Authority:", taxAuthority.address);
  console.log("  Employee 1:", employee1.address);
  console.log("  Employee 2:", employee2.address);
  console.log("\n💡 Key Features:");
  console.log("  ✓ Fully encrypted salary data");
  console.log("  ✓ Automatic tax calculation and withholding");
  console.log("  ✓ Privacy-preserving compliance reporting");
  console.log("  ✓ Batch payroll processing");
  console.log("  ✓ Zero-knowledge audit trails");
  console.log("\n🔐 Privacy Guarantees:");
  console.log("  • Individual salaries remain encrypted");
  console.log("  • Tax calculations performed on encrypted data");
  console.log("  • Compliance reports without data exposure");
  console.log("  • Employees can only view their own balances");
  
  // Example: Distribute bonus
  console.log("\n🎁 Example: Distributing encrypted bonus to Employee 1...");
  const bonusAmount = 5000 * 1e6; // $5,000 bonus
  const encryptedBonus = await fhenixClient.encrypt(bonusAmount, "uint64");
  
  await payrollSystem.distributeBonus(
    employee1.address,
    encryptedBonus.encrypted,
    encryptedBonus.proof
  );
  console.log("✅ Bonus distributed (amount hidden from all parties)");
  
  console.log("\n🚀 System is ready for production use!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });