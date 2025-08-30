# Confidential Payroll System - Frontend

A React-based frontend application for the Confidential Payroll System, built with TypeScript and Material-UI. This application provides a privacy-preserving interface for payroll management using Fully Homomorphic Encryption (FHE).

## 🎯 Features

### Core Functionality
- **Wallet Integration**: MetaMask connection with multi-network support
- **Role-Based Access Control**: Different interfaces for Employees, Employers, Administrators, and Auditors
- **Encrypted Data Display**: Seamless handling of FHE-encrypted salary data
- **Responsive Design**: Modern, mobile-friendly interface with dark mode support

### Dashboard Views
- **Employee Portal**: View encrypted salary, payment history, and personal information
- **Employer Dashboard**: Manage employees and distribute bonuses while maintaining privacy
- **Administrator Panel**: Process payroll and manage system settings
- **Auditor Interface**: Generate compliance reports and analyze aggregated data

### Privacy Features
- **FHE Integration**: Fully Homomorphic Encryption for sensitive payroll data
- **Zero-Knowledge Operations**: Process data without exposing individual information
- **Secure Wallet Connection**: Direct blockchain interaction without intermediaries
- **Encrypted Value Display**: Show/hide encrypted data with proper permissions

## 🛠️ Technology Stack

- **React 19.1.1** with TypeScript
- **Material-UI 7.3.1** for UI components
- **ethers.js 6.15.0** for blockchain interaction
- **React Router 7.8.2** for navigation
- **React Query 5.85.6** for data fetching
- **react-hot-toast 2.6.0** for notifications
- **Vite 7.1.2** for development and building

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your contract addresses:
   ```env
   VITE_PAYROLL_CONTRACT_ADDRESS=your_payroll_contract_address
   VITE_FHEVM_ADDRESS=your_fhevm_address
   VITE_GATEWAY_ADDRESS=your_gateway_address
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🗂️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── WalletConnect.tsx
│   ├── RoleGuard.tsx
│   ├── EncryptedDataDisplay.tsx
│   ├── PaymentHistory.tsx
│   ├── EmployeeManagement.tsx
│   └── BonusDistribution.tsx
├── contexts/            # React contexts
│   ├── WalletContext.tsx
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/               # Custom React hooks
│   ├── useWallet.ts
│   ├── useEncryption.ts
│   ├── usePayrollContract.ts
│   └── useRole.ts
├── pages/               # Main application pages
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── EmployeeDashboard.tsx
│   ├── EmployerDashboard.tsx
│   ├── AdminDashboard.tsx
│   └── AuditorDashboard.tsx
├── utils/               # Utility functions
│   ├── constants.ts
│   ├── encryption.ts
│   └── formatters.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── contracts/           # Smart contract ABIs
│   └── PayrollABI.ts
└── App.tsx             # Main application component
```

## 🔐 Security Features

### Encryption Handling
- **FHE Integration**: Seamless encryption/decryption of sensitive data
- **Permission-Based Decryption**: Users can only decrypt data they're authorized to view
- **Secure Key Management**: Integration with FHEVM key infrastructure

### Access Control
- **Role-Based Permissions**: Granular access control based on user roles
- **Route Protection**: Protected routes based on wallet connection and user permissions
- **Component-Level Guards**: Fine-grained access control within components

### Wallet Security
- **MetaMask Integration**: Secure wallet connection and transaction signing
- **Network Validation**: Automatic network switching and validation
- **Address Verification**: Ethereum address format validation

## 🎨 User Interface

### Design Principles
- **Privacy-First**: Clear indication of encrypted vs. decrypted data
- **Intuitive Navigation**: Role-based navigation with clear visual hierarchy
- **Responsive Layout**: Mobile-first design with tablet and desktop optimization
- **Accessibility**: ARIA labels and keyboard navigation support

### Theme Support
- **Dark/Light Mode**: System preference detection with manual toggle
- **Material Design**: Consistent design language across all components
- **Custom Theming**: Branded color scheme and typography

## 🔧 Configuration

### Environment Variables
```env
# Contract Addresses
VITE_PAYROLL_CONTRACT_ADDRESS=0x...
VITE_FHEVM_ADDRESS=0x...
VITE_GATEWAY_ADDRESS=0x...

# Network Configuration  
VITE_NETWORK_NAME=Zama Devnet
VITE_NETWORK_RPC_URL=https://devnet.zama.ai

# Application Settings
VITE_APP_NAME=Confidential Payroll System
VITE_DEBUG=false
```

### Supported Networks
- **Zama Devnet** (Chain ID: 8009)
- **Zama Testnet** (Chain ID: 9000)  
- **Local Network** (Chain ID: 31337)

## 🧪 Usage Examples

### Employee Experience
1. Connect MetaMask wallet
2. Automatic role detection
3. View encrypted salary with one-click decryption
4. Browse payment history with privacy controls
5. Download encrypted pay stubs

### Employer Workflow
1. Access employer dashboard
2. Add employees with encrypted salary input
3. Distribute bonuses to multiple employees
4. View aggregate statistics without individual details

### Administrator Functions
1. Process company-wide payroll
2. Manage user roles and permissions
3. Configure system parameters
4. Monitor system security

## 🔍 Development

### Key Components

#### EncryptedDataDisplay
Handles display of encrypted values with permission-based decryption:
```tsx
<EncryptedDataDisplay 
  encryptedValue={employee.baseSalary}
  variant="currency"
  showToggle={true}
  autoDecrypt={false}
/>
```

#### RoleGuard
Protects components based on user roles:
```tsx
<RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.EMPLOYER]}>
  <AdminPanel />
</RoleGuard>
```

#### WalletConnect
Manages wallet connection state:
```tsx
<WalletConnect 
  showCard={true}
  size="medium"
/>
```

### Custom Hooks

#### useEncryption
```tsx
const { encryptValue, decryptValue, canDecryptValue } = useEncryption(provider);
```

#### usePayrollContract
```tsx
const { addEmployee, processPayroll, getEmployeeInfo } = usePayrollContract(provider, signer);
```

## 🔄 State Management

- **Wallet State**: Connection status, address, network information
- **User Authentication**: Role-based permissions and access control
- **Theme Preferences**: Dark/light mode with persistence
- **Contract Interactions**: Cached contract data with automatic refresh

## 📱 Responsive Design

- **Mobile**: Optimized for smartphones with touch-friendly interactions
- **Tablet**: Adapted layouts for medium-sized screens
- **Desktop**: Full-featured experience with advanced data tables

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Production Considerations
- Update contract addresses in environment variables
- Configure proper CORS settings
- Enable HTTPS for secure wallet connections
- Set up error monitoring and analytics

## 🧪 Testing

### Development Testing
1. Start local development server
2. Connect MetaMask with test wallet
3. Switch to supported test network
4. Test role-based functionality
5. Verify encryption/decryption flows

### User Acceptance Testing
- Employee salary viewing and payment history
- Employer employee management and bonus distribution  
- Administrator payroll processing
- Auditor compliance report generation

## 🤝 Integration

### Smart Contract Integration
- Automatic ABI updates from contract deployment
- Event listening for real-time updates
- Transaction status monitoring
- Gas estimation and optimization

### Backend Integration
- RESTful API support for additional data
- WebSocket connections for real-time updates
- File upload for bulk operations
- Export functionality for reports

## 📚 Documentation

- **Component Documentation**: Inline JSDoc comments
- **Type Definitions**: Comprehensive TypeScript interfaces  
- **API Documentation**: Contract interaction methods
- **User Guides**: Role-specific usage instructions

## 🔧 Troubleshooting

### Common Issues
1. **Wallet Connection Failed**: Check MetaMask installation and network
2. **Decryption Errors**: Verify user permissions and key access
3. **Transaction Failures**: Check gas limits and network congestion
4. **Role Detection Issues**: Verify contract deployment and user registration

### Debug Mode
Enable debug mode in `.env`:
```env
VITE_DEBUG=true
```

## 🛡️ Security Considerations

- Never hardcode private keys or sensitive data
- Validate all user inputs before encryption
- Implement proper error boundaries
- Use secure randomness for key generation
- Regular security audits and updates

## 📄 License

This project is part of the Confidential Payroll System and follows the same licensing terms as the main project.