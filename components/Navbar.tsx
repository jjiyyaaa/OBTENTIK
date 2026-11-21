"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useObtentik } from "@/frontend-exports";
import RoleBadge from "./RoleBadge";
import {
  Shield,
  Activity,
  QrCode,
  Lock,
  Wallet,
  LogOut,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Search,
} from "lucide-react";
import { getExplorerAddressUrl } from "@/frontend-exports/blockchain/chains";

export default function Navbar() {
  const pathname = usePathname();
  const {
    account,
    role,
    actorName,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    connect,
    disconnect,
    switchToAmoy,
  } = useObtentik();

  const [walletMenuOpen, setWalletMenuOpen] = useState(false);

  // Nav Links corresponding to 3 main role-based views
  const navLinks = [
    {
      href: "/",
      label: "Konsumen (Cek Keaslian)",
      icon: <Search className="w-4 h-4" />,
      badge: "Publik / Bebas Wallet",
    },
    {
      href: "/scanner",
      label: "Scanner Verifier",
      icon: <QrCode className="w-4 h-4" />,
      badge: "Distributor & Apotek",
    },
    {
      href: "/admin",
      label: "Admin & Produsen",
      icon: <Shield className="w-4 h-4" />,
      badge: "Manufaktur & Regulator",
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition">
                    OBTENTIK
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  Pharmaceutical Supply Chain Verification
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${isActive
                    ? "bg-white text-brand-700 shadow-sm border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* MetaMask & Network Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wallet Connect / Account Info */}
            {!isConnected ? (
              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition disabled:opacity-60"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? "Menghubungkan..." : "Connect Wallet"}</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition text-left"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : ""}
                    </span>
                    <span className="text-[10px] text-brand-600 font-semibold leading-tight">
                      {actorName || role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                </button>

                {/* Dropdown Menu */}
                {walletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="pb-3 border-b border-slate-100">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Alamat Dompet</div>
                      <div className="font-mono text-xs font-bold text-slate-900 break-all mt-0.5">
                        {account}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Peran On-Chain:</span>
                        <RoleBadge role={role} size="sm" />
                      </div>
                      {actorName && (
                        <div className="mt-1 text-xs text-slate-700">
                          <span className="text-slate-400">Instansi: </span>
                          <strong className="text-slate-900">{actorName}</strong>
                        </div>
                      )}
                    </div>

                    <div className="py-2 space-y-1">
                      {account && (
                        <a
                          href={getExplorerAddressUrl(account)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-xs text-slate-600 hover:text-brand-600 p-2 rounded-lg hover:bg-slate-50 transition"
                        >
                          <span>Lihat di Polygonscan</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      )}

                      {!isCorrectNetwork && (
                        <button
                          onClick={() => {
                            switchToAmoy();
                            setWalletMenuOpen(false);
                          }}
                          className="w-full text-left text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 p-2 rounded-lg font-medium transition"
                        >
                          Beralih ke Polygon Amoy
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          disconnect();
                          setWalletMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold p-2 rounded-lg hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Putuskan Koneksi (Disconnect)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                {link.icon}
                <span>{link.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
