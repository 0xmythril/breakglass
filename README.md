# 🔓 BreakGlass

**Recover funds from embedded wallets — even if the original app goes offline.**

BreakGlass is an open-source, self-hostable emergency recovery tool for MPC (Multi-Party Computation) embedded wallets. It provides users with a way to access and transfer their funds if the main application frontend or backend becomes unavailable.

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)

## 🎯 The Problem

Embedded wallets (like those from Privy, Web3Auth, Dynamic, etc.) are great for user experience — no seed phrases to manage, just login with Google/Apple/Email. But they introduce **vendor & frontend risk**:

- If the startup shuts down, users lose access to their funds
- If the main frontend goes offline (AWS/Vercel outage), users can't access their wallet
- Users only have their social login — they depend entirely on the app's interface

## 💡 The Solution

BreakGlass is a **lightweight, client-side-only** recovery interface that:

1. Connects to the same MPC provider (Privy, Web3Auth, etc.)
2. Authenticates using the same social login method
3. Reconstructs the wallet in-browser
4. Allows users to transfer funds to an external wallet (MetaMask, etc.)

**No backend required. No data stored. Fully auditable.**

## ✨ Features

- 🔐 **Client-side only** — Private keys never leave your browser
- 🌐 **Multi-chain support** — Ethereum, Polygon, Base, Arbitrum, Sepolia
- 💸 **Transfer native tokens & ERC20s** — ETH, POL, USDC, and custom tokens
- ⛽ **Gas sponsorship toggle** — Use app-sponsored gas if configured
- 🎨 **Retro/pixel aesthetic** — Distinctive emergency-mode UI
- 📱 **Mobile responsive** — Works on all devices
- 🔧 **Self-hostable** — Deploy to your own domain

## 🚀 Quick Start

### Option 1: Use the hosted version

Visit the hosted BreakGlass instance and enter your app's Privy App ID.

> ⚠️ **Important**: The domain you access BreakGlass from must be whitelisted in the MPC provider's dashboard.

### Option 2: Deploy your own

```bash
# Clone the repository
git clone https://github.com/yourusername/breakglass.git
cd breakglass

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Option 3: One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/breakglass)

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file to pre-configure your App ID:

```env
VITE_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxx
```

If set, users won't need to enter the App ID manually.

### Domain Whitelisting (Required)

**This is critical.** MPC providers lock their SDKs to specific domains for security. You must add your BreakGlass deployment URL to your provider's allowed domains:

| Provider | Dashboard URL |
|----------|--------------|
| Privy | [dashboard.privy.io](https://dashboard.privy.io) → Settings → Allowed Domains |
| Web3Auth | [dashboard.web3auth.io](https://dashboard.web3auth.io) → Project → Whitelist |
| Dynamic | [app.dynamic.xyz](https://app.dynamic.xyz) → Settings → Allowed Origins |
| Turnkey | [app.turnkey.com](https://app.turnkey.com) → Organization Settings |

## 📖 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        BreakGlass                           │
├─────────────────────────────────────────────────────────────┤
│  1. User enters App ID (or uses pre-configured)             │
│  2. User logs in with same method as original app           │
│  3. MPC provider reconstructs wallet in browser             │
│  4. User can view balances and transfer funds               │
│  5. Transactions signed locally, broadcast to blockchain    │
└─────────────────────────────────────────────────────────────┘
```

### Security Model

- **Client-side only**: All cryptographic operations happen in your browser
- **No backend**: We don't run any servers that touch your keys
- **Open source**: Audit the code yourself
- **Direct RPC**: Transactions go directly to public blockchain RPCs

## 🛠️ Development

### Tech Stack

- **React 19** + **TypeScript** — Modern, type-safe UI
- **Vite 7** — Fast builds and HMR
- **viem** — Lightweight blockchain interactions
- **Privy SDK** — MPC wallet integration (more providers coming)

### Project Structure

```
src/
├── adapters/           # MPC provider integrations
│   ├── privy.ts        # Privy adapter implementation
│   └── types.ts        # Universal adapter interface
├── chains/             # Blockchain configurations
│   └── config.ts       # Supported chains and RPCs
├── components/         # React components
│   ├── ConfigScreen    # App ID input screen
│   ├── LoginScreen     # Authentication screen
│   ├── Dashboard       # Main wallet view
│   └── SweepModal      # Transfer funds modal
├── hooks/              # Custom React hooks
│   ├── useNativeBalance.ts
│   └── useTokens.ts
└── App.tsx             # Main application logic
```

### Adding a New MPC Provider

1. Create a new adapter in `src/adapters/`:

```typescript
// src/adapters/yourprovider.ts
import type { MPCAdapter } from './types';

export function useYourProviderAdapter(chainId: number): MPCAdapter {
  return {
    init: async () => { /* Initialize SDK */ },
    login: async () => { /* Trigger login */ },
    logout: async () => { /* Logout */ },
    isAuthenticated: false,
    isLoading: false,
    getAddress: () => null,
    sendTransaction: async (tx, options) => { /* Send tx */ },
    providerName: 'YourProvider',
  };
}
```

2. Add the provider to `src/components/ConfigScreen.tsx`:

```typescript
const PROVIDERS: ProviderOption[] = [
  // ...existing providers
  { id: 'yourprovider', name: 'YourProvider', available: true },
];
```

3. Add the wrapper in `src/App.tsx`:

```typescript
case 'yourprovider':
  return <YourProviderWrapper appId={appId} onReset={handleReset} />;
```

### Running Tests

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## 🌐 Supported Chains

| Chain | Chain ID | Status |
|-------|----------|--------|
| Ethereum Mainnet | 1 | ✅ |
| Polygon | 137 | ✅ |
| Base | 8453 | ✅ |
| Arbitrum One | 42161 | ✅ |
| Sepolia (Testnet) | 11155111 | ✅ |

## 🗺️ Roadmap

- [x] **Phase 1**: Privy adapter (MVP)
- [ ] **Phase 2**: Web3Auth, Dynamic, Turnkey, Magic adapters
- [ ] **Phase 3**: Private key export UI
- [ ] **Phase 4**: IPFS/Arweave hosting for maximum decentralization
- [ ] **Phase 5**: npm package for easy integration

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built by [0xMythril](https://twitter.com/0xMythril) after getting funds trapped 😢

---

**Remember**: The best insurance is preparation. Deploy BreakGlass to your backup domain *before* you need it.

```
╔══════════════════════════════════════════════════════════════╗
║  "We are so confident in our product that we built the      ║
║   door for you to leave if we ever disappear."              ║
╚══════════════════════════════════════════════════════════════╝
```
