import type { Metadata } from "next";
import "./globals.css";
import { ObtentikProvider } from "@/frontend-exports";
import {
  getContractAddress,
  getExplorerAddressUrl,
} from "@/frontend-exports/blockchain/chains";
import Navbar from "@/components/Navbar";
import NetworkAlert from "@/components/NetworkAlert";
import { ShieldCheck, HeartPulse, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "OBTENTIK - Verifikasi & Rantai Pasok Obat Berbasis Blockchain",
  description:
    "Sistem ketertelusuran rantai pasok farmasi dan verifikasi keaslian obat terdesentralisasi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const contractAddress = getContractAddress();

  return (
    <html lang="id">
      <body className="medical-ambient-bg text-slate-900 min-h-screen flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
        <ObtentikProvider>
          <NetworkAlert />
          <Navbar />
          <main className="flex-1">{children}</main>

          <footer className="border-t border-slate-200 bg-[#081f34] text-slate-300">
            <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12">
              <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#35786f] text-white">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-white">OBTENTIK</span>
                  </div>
                  <p className="mt-5 max-w-sm text-sm leading-7 text-slate-300">
                    Verifikasi keaslian obat untuk publik dan ketertelusuran rantai pasok farmasi yang transparan.
                  </p>
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#a9d5ca]">Jelajahi</h2>
                  <div className="mt-5 space-y-3 text-sm">
                    <a className="block hover:text-white" href="/">Verifikasi obat</a>
                    <a className="block hover:text-white" href="/scanner">Pemindai verifikasi</a>
                    <a className="block hover:text-white" href="/admin">Admin & produsen</a>
                  </div>
                </div>
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#a9d5ca]">Jaringan</h2>
                  <p className="mt-5 text-sm">Polygon Amoy · Chain ID 80002</p>
                  <a
                    href={getExplorerAddressUrl(contractAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-xs text-slate-300 hover:text-white"
                  >
                    {`${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <div className="mt-12 border-t border-white/10 pt-6 text-xs text-slate-400">
                © {new Date().getFullYear()} OBTENTIK
              </div>
            </div>
          </footer>
        </ObtentikProvider>
      </body>
    </html>
  );
}
