// Payroll Contract ABI - Update this with the actual deployed contract ABI
export const PAYROLL_ABI = [
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "employee", "type": "address" },
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "position", "type": "string" },
      { "internalType": "bytes", "name": "encryptedSalary", "type": "bytes" }
    ],
    "name": "addEmployee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "employee", "type": "address" }
    ],
    "name": "removeEmployee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "employees", "type": "address[]" },
      { "internalType": "bytes[]", "name": "encryptedBonuses", "type": "bytes[]" }
    ],
    "name": "distributeBonus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address[]", "name": "employees", "type": "address[]" }
    ],
    "name": "processPayroll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "employee", "type": "address" }
    ],
    "name": "getEmployeeInfo",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "position", "type": "string" },
      { "internalType": "bool", "name": "isActive", "type": "bool" },
      { "internalType": "uint256", "name": "hireDate", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "employee", "type": "address" }
    ],
    "name": "getEncryptedSalary",
    "outputs": [
      { "internalType": "bytes", "name": "", "type": "bytes" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "employee", "type": "address" },
      { "internalType": "uint256", "name": "index", "type": "uint256" }
    ],
    "name": "getPaymentHistory",
    "outputs": [
      { "internalType": "bytes", "name": "encryptedAmount", "type": "bytes" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "string", "name": "paymentType", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "employee", "type": "address" }
    ],
    "name": "getPaymentCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getActiveEmployeeCount",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" }
    ],
    "name": "getUserRole",
    "outputs": [
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint8", "name": "role", "type": "uint8" }
    ],
    "name": "setUserRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "reportType", "type": "string" },
      { "internalType": "string", "name": "period", "type": "string" }
    ],
    "name": "generateComplianceReport",
    "outputs": [
      { "internalType": "bytes", "name": "encryptedTotalPayroll", "type": "bytes" },
      { "internalType": "bytes", "name": "encryptedAverageSalary", "type": "bytes" },
      { "internalType": "uint256", "name": "employeeCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "employee", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" }
    ],
    "name": "EmployeeAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "employee", "type": "address" }
    ],
    "name": "EmployeeRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "employee", "type": "address" },
      { "indexed": false, "internalType": "bytes", "name": "encryptedAmount", "type": "bytes" },
      { "indexed": false, "internalType": "string", "name": "paymentType", "type": "string" }
    ],
    "name": "PaymentProcessed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "employeeCount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "PayrollProcessed",
    "type": "event"
  }
] as const;