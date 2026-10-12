# VistaPay — Fintech Frontend

A complete TypeScript + React frontend for a fintech product, styled to mirror the
VistaPay UI kit (dark teal sidebar, lime accent, card-based dashboard).

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS** for styling (brand tokens in `tailwind.config.js`)
- **react-router-dom** for routing
- **recharts** for charts (money flow, analytics)
- **lucide-react** for icons

No backend is included — auth and data are mocked in `src/context/AuthContext.tsx`
and `src/data/mockData.ts` so you can wire in your real API later.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

## Demo login

The auth flow is fully mocked — any email/password combination works. After
"logging in" you'll be sent to a 6-digit OTP screen; any 6 digits will pass.

- `/login` — sign in
- `/register` — create an account
- `/forgot-password` → `/otp` → `/reset-password` — password recovery
- `/app/dashboard` — main app (protected, requires a mock session)

## Pages included

**Auth**
- Login
- Register
- Forgot Password
- OTP Verification (used for login 2FA, signup verification, and password reset)
- Reset Password

**Core app**
- Dashboard (balances, money flow chart, recent transactions, card, quick transfer)
- Bank Transfer (recipient picker, review + confirm modal, success state)
- My Wallets (cards, currency conversion, money flow)
- Transactions (searchable/filterable table)
- Recipients (add/remove/favorite beneficiaries)
- Bills Payment — Airtime, Internet, Cable TV, Utilities (tabbed, with quick amounts
  and a confirm-before-pay modal)
- Invoices (list + create invoice modal)
- Analytics (balance growth line chart, spend breakdown donut chart)
- Notifications
- Support Ticket (ticket list, create ticket modal, live chat / help center panel)
- Identity Verification / KYC (step tracker + document upload)

**Settings**
- Account Settings (profile + address)
- Security Settings (password change, Google Authenticator 2FA setup with QR +
  secret key + verification code, active sessions)
- API Settings (API key management, webhook endpoint configuration)

**Other**
- 404 Not Found

## Project structure

```
src/
  components/
    layout/       Sidebar, Topbar, DashboardLayout, AuthLayout, ProtectedRoute
    ui/            Input, Badge, Modal, MoneyFlowChart
  context/         AuthContext (mock auth), ToastContext (notifications)
  data/            mockData.ts — all sample data used across pages
  lib/             icons.ts — icon lookup helper
  pages/
    auth/          Login, Register, ForgotPassword, OtpVerification, ResetPassword
    bills/         BillsPayment
    settings/      AccountSettings, SecuritySettings, ApiSettings, SettingsNav
    *.tsx          Dashboard, BankTransfer, Wallets, Transactions, Recipients,
                    Invoices, Analytics, Notifications, SupportTicket,
                    Verification, NotFound
  types/           Shared TypeScript interfaces
  App.tsx          Route tree
  main.tsx         Entry point
```

## Connecting a real API

Replace the mock functions in `src/context/AuthContext.tsx` (`login`, `register`,
`verifyOtp`, `requestPasswordReset`, `resetPassword`) with real `fetch`/`axios`
calls, and swap the arrays in `src/data/mockData.ts` for data fetched from your
backend (e.g. with `useEffect` + your API client, or a data-fetching library like
React Query).

## Design tokens

Brand colors live in `tailwind.config.js` under `theme.extend.colors`:

- `ink.800` (`#0E3B39`) — primary dark teal, used for the sidebar and hero panels
- `brand.lime` (`#D7FE63`) — primary accent for buttons and highlights
- `surface.muted` / `surface.border` — light backgrounds and hairlines
- `state.success` / `state.pending` / `state.failed` — status colors for badges

## New in this update

- **Individual Bills Payment pages** — `/app/bills/airtime`, `/app/bills/internet`,
  `/app/bills/cable-tv`, `/app/bills/utilities`, each its own route, built on a shared
  `BillForm` component. `/app/bills` is a hub page linking to all four.
- **Virtual Account Number** — on My Wallets, generate a dedicated NGN account number
  (simulated) with copy/regenerate actions.
- **Bank Transfer verification simulation** — entering a 10-digit account number
  triggers a simulated NUBAN lookup and displays the resolved account name before
  you can proceed.
- **Custom searchable Dropdown** (`src/components/ui/Dropdown.tsx`) replaces every
  native `<select>` in the app.
- **Naira currency** — `src/lib/currency.ts` (`formatNaira`, `naira`) is used
  everywhere amounts are shown.
- **Analytics period toggle** — Today / Last 7 Days / This Month / This Year, each
  driving its own chart dataset.
- **Light/Dark mode + color switcher** — `src/context/ThemeContext.tsx` manages mode
  and a primary/secondary brand color pair (6 presets), applied via CSS variables.
  Toggle from the palette icon in the header.
- **Lighter-shade dashboard widgets** — `.widget-primary` / `.widget-secondary`
  utility classes (tinted primary/secondary backgrounds) used on stat cards.
- **DataTable component** (`src/components/ui/DataTable.tsx`) — pagination plus
  Excel (`xlsx`) and PDF (`jspdf` + `jspdf-autotable`) export, used on Transactions
  and Invoices.
- **Notification bell dropdown** in the header with unread badge and a "view all" link.
- **Floating mobile bottom nav** — Home / Bills / Transfer / Settings / Logout,
  shown only below the `lg` breakpoint.
- **Transactions URL** moved to `/app/transactions` (old `/app/wallets/transactions`
  now redirects there).

### Extending the theme

Add a new brand color pair in `src/context/ThemeContext.tsx` → `colorPresets`. Each
preset just needs a hex `primary` and `secondary` — the app computes light/dark
shades automatically via `src/lib/color.ts`.

## Round 3 additions

- **Renamed to VistaPay** throughout (product name, localStorage keys, page copy).
- **Session persistence** — a mock token is now written to `localStorage` on
  successful OTP verification; `ProtectedRoute` waits for an `initializing` check
  before redirecting, so refreshing an internal page no longer bounces you to
  `/login`.
- **Transaction PIN** — set up from Security Settings (`hasTransactionPin` /
  `setTransactionPin` / `verifyTransactionPin` on `AuthContext`). Required via a
  reusable `PinModal` (`src/components/ui/PinModal.tsx`) before Bills Payment
  (4-digit) and Bank Transfer (6-digit) go through.
- **Invoices** — multi-item line entry with a live running total, a full
  **Invoice Detail** page (`/app/invoices/:id`) with logo, bill-to, dates, and a
  QR-style code (`QrPlaceholder`), and a real PDF export (`src/lib/pdf.ts`).
  Created invoices persist via `src/lib/invoiceStore.ts`.
- **Recent Bill Payments** — expanded to a full paginated, exportable table.
- **Support Tickets** — ticket detail page with a message thread, reply box, and
  a "Mark as Resolved" confirmation modal. Tickets persist via
  `src/lib/ticketStore.ts`.
- **Get Help** page (`/app/get-help`, with a `/get-help` convenience redirect) —
  department contacts and a stylized sample map.
- **Sidebar logout** — confirmation modal before signing out.
- **Deposit page** (`/app/deposit`) — virtual account number (shared with
  Wallets via `src/lib/virtualAccount.ts`), payment method picker, amount entry.
- **Virtual Cards** — `/app/cards` (list), `/app/cards/new` (create, with card
  type selection and optional initial funding), `/app/cards/:id` (detail: reveal
  number, fund with PIN confirmation, freeze/unfreeze, block/unblock, exportable
  transaction history). Backed by `src/lib/cardStore.ts`.
- **Checkout page** (`/app/checkout`) — payment-gateway-style flow with Bank
  Transfer / Card / MoMo / USSD tabs, each with its own UI.
- **Color switcher** — expanded to 20 premium primary/secondary presets.
- **Auth carousel** — the login/register hero panel is now a real swipeable
  carousel (drag or use the dots), auto-advancing every 5s.
- **Register page** — password strength meter and a confirm-password field.
- **Google / Apple buttons** — proper multi-color Google "G" mark and a black
  Apple button (`src/components/ui/SocialLoginButtons.tsx`).
- **Mobile nav** — reordered with Dashboard as an elevated center button, plus
  a Logout confirmation.
- **API Keys table** — now uses the shared paginated `DataTable` like every
  other list in the app.
