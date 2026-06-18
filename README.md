# Bulsa

Bulsa is a private, offline-first budget tracker with a playful Taglish wallet companion. It is built with React, TypeScript, Vite, and Capacitor for Android and iOS.

## What works

- Track income, expenses, savings, and guilt-free “keep” money
- Daily, monthly, and all-time reports with expense breakdowns
- Editable monthly category limits with clear progress labels
- Savings goals with contributions and milestones
- Calendar for one-time and recurring bills, subscriptions, and payments
- Local GCash, Maya, Landbank, GoTyme, SeaBank, cash, and custom wallet balances
- Paying a scheduled item records the expense and updates its linked wallet
- Context-aware Taglish insights generated entirely on-device
- Original custom SVG icon family and animated wallet with nine emotional states
- Self-hosted Fraunces and Manrope typography (no network font requests)
- Editable profile name and picture
- Seven themes, light/dark/system modes, optional glass effects, and reduced motion
- Native SQLite storage with a browser-compatible local fallback
- Local JSON backup and restore
- No login, backend, analytics, cloud sync, or external AI calls

## Project structure

```text
src/
├── app/          # application shell, providers, and navigation contracts
├── components/   # reusable, domain-neutral UI pieces
├── data/         # local persistence adapters
├── domain/       # models and pure budget calculations
├── features/     # dashboard, transactions, goals, mascot, insights, settings
├── styles/       # theme tokens and responsive UI
└── test/         # shared test setup
```

Feature modules depend on the domain and storage interfaces rather than Capacitor directly. New features can therefore be added without changing the app shell or duplicating persistence logic.

## Local development

Requirements: Node.js 22+ and npm 10+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. Browser data is stored locally through Capacitor Preferences.

## Tests and production build

```bash
npm test
npm run build
```

## Native apps

Native Android and iOS builds use SQLite. Sync the current web build into the generated native projects:

```bash
npm run cap:sync
npm run android
npm run ios
```

Android requires Android Studio. iOS requires macOS and Xcode. Run `npx cap add android` or `npx cap add ios` if that platform folder has not been generated yet.

## Data and privacy

Bulsa performs all calculations locally. The companion is an explainable on-device insight engine based on budget state, transaction recency, time of day, and goal progress. It does not claim to be financial advice. Backups contain personal financial data, so users should keep exported files private.

## Extension points

- Add storage migrations in `src/data/` when the schema version changes.
- Add companion behaviors through `CompanionInsight` in `src/features/insights/`.
- Add wallet expressions through the `WalletMood` domain type and SVG state styles.
- Add new screens as feature modules and register their route in `src/app/routes.ts`.
- Add more capable offline language generation behind the insight interface without changing dashboard components.
