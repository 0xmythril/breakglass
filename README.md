# 🔓 BreakGlass

**Recover funds from embedded wallet.**

BreakGlass is a tiny, self-hostable **developer recovery UI** for embedded MPC wallets (starting with **Privy**).
It exists for the common “oh no” moment during development/testing: **funds end up in an embedded wallet, but your app doesn’t have a withdrawal / transfer UI yet** — so you need a safe, minimal frontend to move them out.

Secondary use-case: teams can keep this around as a backup interface on a separate domain.

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)

## 🎯 The Problem

Embedded wallets (Privy, Web3Auth, Dynamic, etc.) are great UX — no seed phrases, just login. But during builds, launches, migrations, and incidents you can get stuck:

- You funded an embedded wallet in staging/devnet/mainnet while testing.
- Your product doesn’t expose a “transfer out” flow yet (or it’s broken).
- You need a simple UI to authenticate with the **same provider + app config** and send assets to a safe external address.

## 💡 The Solution

BreakGlass is a **lightweight, client-side-only** transfer interface that:

1. Uses your MPC provider’s SDK (MVP: **Privy**)
2. Authenticates with the same login method (email / Google / Apple / etc.)
3. Loads the embedded wallet in-browser
4. Lets you **transfer native + ERC20s** (including custom token addresses) to an external wallet

**No backend required. No data stored by BreakGlass. Fully auditable.**

## ✅ Who this is for

- **Developers/teams** who control the embedded wallet configuration (e.g., you have access to your **Privy dashboard**) and need an emergency “transfer out” UI.
- **Power users** who are instructed by the app owner to use a specific BreakGlass deployment for recovery.

## ❌ Who this is NOT for

- People trying to recover funds from **someone else’s app** (e.g., “give me OpenSea’s Privy App ID”).
  Privy (and similar providers) enforce **allowed domains / origins**, and you must use the **correct App ID** that’s configured to trust the domain you’re running BreakGlass on.

## ✨ Features

- 🔐 **Client-side only** — Private keys never leave your browser
- 🌐 **Multi-chain support** — Ethereum, Polygon (POL), Base, Arbitrum, Sepolia
- 💸 **Transfer native tokens & ERC20s** — plus **custom token addresses**
- ⛽ **Gas sponsorship toggle** — uses Privy sponsorship **if enabled in your Privy dashboard**
- 🎨 **Retro/pixel aesthetic** — Distinctive emergency-mode UI
- 📱 **Mobile responsive** — Works on all devices
- 🔧 **Self-hostable** — Deploy to your own domain
- 🧩 **Provider selector** — Privy is **LIVE**, others marked **SOON** (roadmap)

## 🚀 Quick Start

### Option 1: Deploy your own (recommended)

```bash
# Clone the repository
git clone https://github.com/0xmythril/breakglass.git
cd breakglass

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Option 2: One-click deploy (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/0xmythril/breakglass)

## 🧯 1-minute “my funds are stuck” runbook

1. Deploy BreakGlass (Vercel is easiest).
2. In Privy Dashboard → **Allowed Domains**, add:
   - your BreakGlass URL (e.g. `https://your-breakglass.vercel.app`)
   - `http://localhost:5173` (optional for local dev)
3. Open BreakGlass → select **Privy** → enter your **Privy App ID**.
4. Login using the same method you used to create/fund the embedded wallet.
5. In the dashboard, choose the chain, add any token addresses you need, set amounts, set destination, and hit **Transfer**.

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file to pre-configure your App ID:

```env
VITE_PRIVY_APP_ID=clxxxxxxxxxxxxxxxxxx
```

If set, users won't need to enter the App ID manually.

### Domain Whitelisting (Required)

**This is critical.** MPC providers lock their SDKs to specific domains/origins. You must add your BreakGlass deployment URL to your provider's allowed domains.

| Provider | Dashboard URL |
|----------|--------------|
| Privy (LIVE) | [dashboard.privy.io](https://dashboard.privy.io) → Settings → Allowed Domains |
| Web3Auth (SOON) | [dashboard.web3auth.io](https://dashboard.web3auth.io) |
| Dynamic (SOON) | [app.dynamic.xyz](https://app.dynamic.xyz) |
| Turnkey (SOON) | [app.turnkey.com](https://app.turnkey.com) |

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

### Important limitations (by design)

- **This is not a bypass**: you can’t use BreakGlass to access an embedded wallet from an unrelated app. You need the **correct App ID** and the BreakGlass domain must be **allowed** in the provider dashboard.
- **No private key export (yet)**: Privy embedded wallets don’t expose raw keys via this app; BreakGlass focuses on **transfer out**.
- **Gas sponsorship is optional**: if sponsorship is off (or not configured), your embedded wallet must have native gas to transfer.

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

2. Add the provider to the selector in `src/components/ConfigScreen.tsx`:

```typescript
const PROVIDERS: ProviderOption[] = [
  // ...existing providers
  { id: 'yourprovider', name: 'YourProvider', available: true },
];
```

3. Wire it up in `src/App.tsx`’s provider switch (and render your provider’s SDK provider wrapper):

```typescript
case 'yourprovider':
  return <YourProviderWrapper appId={appId} onReset={handleReset} />;
```

### Linting

```bash
npm run lint
```

## 🌐 Supported Chains

| Chain | Chain ID | Status |
|-------|----------|--------|
| Ethereum Mainnet | 1 | ✅ |
| Polygon (POL) | 137 | ✅ |
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

Built by [0xMythril](https://x.com/0xmythril) after getting funds trapped 😢

---

**Remember**: The best insurance is preparation. Deploy BreakGlass to your backup domain *before* you need it.

```
╔══════════════════════════════════════════════════════════════╗
║  "We are so confident in our product that we built the      ║
║   door for you to leave if we ever disappear."              ║
╚══════════════════════════════════════════════════════════════╝
```
