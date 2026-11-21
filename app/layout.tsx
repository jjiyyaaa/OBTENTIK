import type { Metadata } from "next";
import "./globals.css";
import { ObtentikProvider } from "@/frontend-exports";
import Navbar from "@/components/Navbar";
import NetworkAlert from "@/components/NetworkAlert";
import { ShieldCheck, HeartPulse, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "OBTENTIK - Verifikasi & Rantai Pasok Obat Farmasi Blockchain",
  description:
    "Sistem ketertelusuran rantai pasok obat farmasi dan verifikasi keaslian obat terdesentralisasi di Polygon Amoy Testnet (Chain ID 80002) oleh Tim imouttt (President University).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-surface-50 text-slate-900 min-h-screen flex flex-col font-sans selection:bg-brand-500/20 selection:text-brand-700">
        <ObtentikProvider>
          <NetworkAlert />
          <Navbar />
          <main className="flex-1">{children}</main>

          {/* Clean Medical Footer */}
          <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center border border-brand-200">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-800">
                    OBTENTIK Pharmaceutical Supply Chain Traceability
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
                <a
                  href="https://amoy.polygonscan.com/address/0x511251E3b80e72d437E479B6D6039992Db813049"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 flex items-center gap-1 transition"
                >
                  <span>Smart Contract on Amoy (0x5112...3049)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </footer>
        </ObtentikProvider>
      </body>
    </html>
  );
}
