import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import { Login } from "@/pages/auth/Login";
import { MfaVerification } from "@/pages/auth/MFAVerification";
import { ForgotPassword } from "@/pages/auth/ForgotPassword";
import { OtpVerification } from "@/pages/auth/OtpVerification";
import { ResetPassword } from "@/pages/auth/ResetPassword";

import { Dashboard } from "@/pages/Dashboard";
import { BankTransfer } from "@/pages/transfer/BankTransfer";
import { UserTransfer } from "./pages/transfer/UserTransfer";

import { Wallets } from "@/pages/Wallets";
import { Deposit } from "@/pages/Deposit/Deposit";
import { Transactions } from "@/pages/Transactions/Transactions";
import { Beneficiaries } from "@/pages/Beneficiaries";
import { Invoices } from "@/pages/invoice/Invoices";
import { InvoiceDetail } from "@/pages/invoice/InvoiceDetail";
import { PaymentLinks } from "@/pages/paymentlink/Paymentlink";
import { PaymentLinkDetails } from "@/pages/paymentlink/PaymentlinkDetail";

import { Giftcards } from "@/pages/giftcards/Giftcards";
import { GiftcardTrades } from "@/pages/giftcards/GiftcardTradesHistory";

import { Customers } from "@/pages/customer/Customers";
import { CustomerDetail } from "@/pages/customer/CustomerDetail";

import { Analytics } from "@/pages/Analytics";
import { SupportTicketPage } from "@/pages/support/SupportTicket";
import { SupportTicketDetail } from "@/pages/support/SupportTicketDetail";
import { KycVerification } from "@/pages/kyc/Verification";
import { GetHelp } from "@/pages/GetHelp";

import { BillsPayment } from "@/pages/bills/BillsPayment"; 

import { CardsList } from "@/pages/cards/CardsList";
import { CardDetail } from "@/pages/cards/CardDetail";

import { AccountSettings } from "@/pages/settings/AccountSettings";
import { SecuritySettings } from "@/pages/settings/SecuritySettings";
import { SessionSettings } from "@/pages/settings/SessionSettings";

import { NotFound } from "@/pages/NotFound";

import { Settings } from "@/pages/system/Settings";
import { BillsPricing } from "@/pages/system/BillsPricing";
import { PaymentGateways } from "@/pages/system/PaymentGateways";

const App: React.FC = () => {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth flow */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<OtpVerification />} />
      <Route path="/two-factor/authentication" element={<MfaVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Convenience top-level redirect */}
      <Route path="/get-help" element={<Navigate to="/app/get-help" replace />} />

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bank/transfer" element={<BankTransfer />} />
          <Route path="p2p/transfer" element={<UserTransfer />} />
          
          <Route path="wallets" element={<Wallets />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="transfer/beneficiaries" element={<Beneficiaries />} />

          <Route path="bills" element={<BillsPayment />} /> 

          <Route path="cards" element={<CardsList />} />
          <Route path="cards/:id" element={<CardDetail />} />

          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="paymentlink" element={<PaymentLinks />} />
          <Route path="paymentlink/:id" element={<PaymentLinkDetails />} />

          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />

          <Route path="giftcards" element={<Giftcards />} />
          <Route path="giftcards/trades" element={<GiftcardTrades />} />

          <Route path="analytics" element={<Analytics />} />
          <Route path="support" element={<SupportTicketPage />} />
          <Route path="support/:id" element={<SupportTicketDetail />} />
          <Route path="verification" element={<KycVerification />} />
          <Route path="get-help" element={<GetHelp />} />

          <Route path="settings/account" element={<AccountSettings />} />
          <Route path="settings/security" element={<SecuritySettings />} />
          <Route path="settings/sessions" element={<SessionSettings />} />


          <Route path="system/settings" element={<Settings />} />
          <Route path="system/pricing" element={<BillsPricing />} />
          <Route path="system/gateway" element={<PaymentGateways />} />
        </Route>
      </Route>

      {/* Legacy redirect */}
      <Route path="/app/wallets/transactions" element={<Navigate to="/app/transactions" replace />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
