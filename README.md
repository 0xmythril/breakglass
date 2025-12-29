# BreakGlass 🔓

**The "In Case of Emergency" Open Source Wallet Interface**

BreakGlass is a lightweight, client-side-only React application designed to help users recover funds from MPC embedded wallets (Privy, Web3Auth, etc.) even if the original application goes offline.

## Why BreakGlass?

Embedded wallets (MPC) are great for UX but introduce "Vendor & Frontend Risk." If a startup shuts down or their main frontend goes offline, users lose access to their funds because they don't have a seed phrase—they only have their social login and the app's interface.

BreakGlass solves this by providing a universal recovery interface that:
- Reconstructs your wallet key in-memory via social auth
- Displays balances across multiple EVM chains
- Allows you to "sweep" all funds to an external wallet

## Features

- 🔐 **Social Auth Recovery** - Login with the same method you used in the original app
- ⛓️ **Multi-Chain Support** - Ethereum, Base, Polygon, Arbitrum, Sepolia
- 💰 **Token Management** - Add custom ERC20 tokens by contract address
- 🚀 **Emergency Sweep** - Transfer all funds to your external wallet
- 🌐 **Fully Client-Side** - No backend, no tracking, fully auditable
- 🖥️ **Retro Aesthetic** - Because recovering funds should feel like hacking a mainframe

## Supported MPC Providers

- ✅ **Privy** (v1 - current)
- 🔜 Web3Auth (Phase 2)
- 🔜 Coinbase CDP (Phase 2)
- 🔜 Dynamic (Phase 2)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/breakglass.git
cd breakglass

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173` and enter your Privy App ID.

## Configuration

### Option 1: Environment Variable (Recommended for deployment)

Create a `.env` file:

```env
VITE_PRIVY_APP_ID=your-privy-app-id
VITE_DEFAULT_CHAIN_ID=1
```

### Option 2: Dynamic Input

Leave the environment variable empty and users can enter the App ID at runtime.

## Deployment

### Vercel (Recommended)

1. Connect your repo to Vercel
2. Add `VITE_PRIVY_APP_ID` to environment variables
3. Deploy!

The `vercel.json` is pre-configured for SPA routing.

### Other Platforms

Build the static files:

```bash
npm run build
```

Deploy the `dist/` folder to any static hosting (Netlify, GitHub Pages, IPFS, etc.)

## ⚠️ Important: Domain Whitelisting

**You must add your BreakGlass deployment URL to your Privy dashboard's "Allowed Domains" list.**

This is required because MPC providers lock their SDKs to specific domains for security.

Example setup:
- Main app: `app.yourcompany.com`
- BreakGlass: `recovery.yourcompany.com` ← Add this to Privy

## Tech Stack

- **Framework:** React 18 + Vite
- **Blockchain:** viem (lightweight ethers.js alternative)
- **Auth:** @privy-io/react-auth
- **Styling:** Pure CSS with retro pixel aesthetic

## Project Structure

```
src/
├── adapters/          # MPC provider adapters (Privy, etc.)
│   ├── types.ts       # MPCAdapter interface
│   ├── privy.ts       # Privy implementation
│   └── index.ts       # Adapter registry
├── chains/            # Chain configurations
│   └── config.ts      # Supported chains + RPCs
├── components/        # React components
│   ├── ConfigScreen   # App ID input
│   ├── LoginScreen    # Social auth
│   ├── Dashboard      # Balance display
│   ├── AddToken       # Custom token input
│   └── SweepModal     # Emergency sweep
├── hooks/             # Custom hooks
│   ├── useMPCAdapter  # Generic adapter hook
│   ├── useTokens      # ERC20 token management
│   └── useNativeBalance
├── App.tsx
└── main.tsx
```

## Adding New MPC Providers (Phase 2)

1. Create a new adapter in `src/adapters/` implementing the `MPCAdapter` interface
2. Export it from `src/adapters/index.ts`
3. Update `useMPCAdapter` hook to support the new provider
4. Add provider selection UI in ConfigScreen

## Security

- **Client-side only** - No server, no data collection
- **No key storage** - Private keys exist only in memory during session
- **Open source** - Fully auditable code
- **Minimal dependencies** - Easier to verify

## License

MIT

---

*Built with 💚 for user sovereignty*
