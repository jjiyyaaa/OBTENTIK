"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useObtentik } from "@/frontend-exports";
import RoleBadge from "./RoleBadge";
import {
  Shield,
  QrCode,
  Wallet,
  LogOut,
  ExternalLink,
  ChevronDown,
  Search,
  Activity,
  Layers,
  Sparkles,
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileWalletRef = useRef<HTMLDivElement>(null);

  // Click-outside listener to dismiss wallet dropdown cleanly
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !mobileWalletRef.current?.contains(event.target as Node)
      ) {
        setWalletMenuOpen(false);
      }
    }
    if (walletMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [walletMenuOpen]);

  // Nav Links corresponding to 3 main role-based views
  const navLinks = [
    {
      href: "/",
      label: "Cek Keaslian",
      subLabel: "Konsumen Publik",
      icon: <Search className="w-4 h-4" />,
    },
    {
      href: "/scanner",
      label: "Pemindai Verifikasi",
      subLabel: "Distributor & Apotek",
      icon: <QrCode className="w-4 h-4" />,
    },
    {
      href: "/admin",
      label: "Admin & Produsen",
      subLabel: "Regulator & Pabrik",
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-full bg-[#102a43] flex items-center justify-center text-white">
                <Shield className="w-5 h-5 stroke-[2.3] text-[#a9d5ca]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-navy-900 group-hover:text-teal-700 transition">
                    OBTENTIK
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide hidden md:block">
                  Verifikasi Rantai Pasok Berbasis Blockchain
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 py-5 text-sm font-semibold border-b-2 transition-colors ${
                    isActive
                      ? "border-[#2e7772] text-[#102a43]"
                      : "border-transparent text-slate-600 hover:text-[#102a43]"
                  }`}
                >
                  <span className={isActive ? "text-teal-600" : "text-slate-400"}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Network Indicator & Wallet Connect */}
          <div className="hidden md:flex items-center gap-2 sm:gap-3" ref={menuRef}>

            {/* Wallet Connect / Account Info */}
            {!isConnected ? (
              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 bg-[#102a43] hover:bg-[#173b5a] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition disabled:opacity-60"
              >
                <Wallet className="w-4 h-4 text-cyan-300" />
                <span>{isConnecting ? "Menghubungkan..." : "Hubungkan Dompet"}</span>
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setWalletMenuOpen(!walletMenuOpen)}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl transition text-left shadow-sm"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : ""}
                    </span>
                    <span className="text-[10px] text-teal-700 font-semibold leading-tight truncate max-w-[90px]">
                      {actorName || role || "Peran belum tersedia"}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform ${walletMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {walletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="pb-3 border-b border-slate-100">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                        Dompet Terkoneksi
                      </div>
                      <div className="font-mono text-xs font-bold text-navy-900 break-all mt-0.5">
                        {account}
                      </div>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Peran di blockchain:</span>
                        <RoleBadge role={role} size="sm" />
                      </div>
                      {actorName && (
                        <div className="mt-1.5 text-xs text-slate-700">
                          <span className="text-slate-400">Instansi: </span>
                          <strong className="text-slate-900 font-semibold">{actorName}</strong>
                        </div>
                      )}
                    </div>

                    <div className="py-2 space-y-1">
                      {account && (
                        <a
                          href={getExplorerAddressUrl(account)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-xs text-slate-600 hover:text-teal-700 p-2 rounded-xl hover:bg-teal-50/60 transition"
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
                          className="w-full text-left text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 p-2 rounded-xl font-semibold transition"
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
                        className="w-full flex items-center justify-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold p-2 rounded-xl hover:bg-rose-50 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Putuskan koneksi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen ? "mobile-navigation" : undefined}
            onClick={() => {
              setMobileMenuOpen((open) => !open);
              setWalletMenuOpen(false);
            }}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-navigation" className="md:hidden border-t border-slate-100 py-3">
            <nav aria-label="Navigasi utama" className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-teal-50 text-teal-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className={isActive ? "text-teal-600" : "text-slate-400"}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 border-t border-slate-100 pt-3" ref={mobileWalletRef}>
              {!isConnected ? (
                <button
                  type="button"
                  onClick={() => connect()}
                  disabled={isConnecting}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#102a43] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#173b5a] disabled:opacity-60"
                >
                  <Wallet className="h-4 w-4 text-cyan-300" />
                  <span>{isConnecting ? "Menghubungkan..." : "Hubungkan Dompet"}</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setWalletMenuOpen((open) => !open)}
                    className="flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
                      <span className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-slate-800">
                          {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : ""}
                        </span>
                        <span className="text-[10px] font-semibold text-teal-700">
                          {actorName || role || "Peran belum tersedia"}
                        </span>
                      </span>
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${walletMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {walletMenuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                      <div className="break-all border-b border-slate-100 pb-3 font-mono text-xs font-bold text-slate-800">
                        {account}
                      </div>
                      {!isCorrectNetwork && (
                        <button
                          type="button"
                          onClick={() => {
                            switchToAmoy();
                            setWalletMenuOpen(false);
                          }}
                          className="mt-3 w-full rounded-xl bg-amber-50 p-2 text-left text-xs font-semibold text-amber-800 hover:bg-amber-100"
                        >
                          Beralih ke Polygon Amoy
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          disconnect();
                          setWalletMenuOpen(false);
                        }}
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl p-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Putuskan koneksi
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
