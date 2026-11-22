"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  verifyBatch,
  getBatchDetail,
  getBatchCheckpoints,
  getAllBatches,
  BatchVerificationResult,
  BatchDetail,
  CheckpointData,
} from "@/frontend-exports";
import StatusBanner from "@/components/StatusBanner";
import Timeline from "@/components/Timeline";
import Html5Scanner from "@/components/Html5Scanner";
import { extractBatchId } from "@/lib/qrParser";
import { getExplorerAddressUrl } from "@/frontend-exports/blockchain/chains";
import {
  Search,
  QrCode,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Pill,
  ArrowRight,
  Factory,
  Truck,
  Store,
  ScanLine,
  Database,
  Eye,
} from "lucide-react";

function ConsumerPageContent() {
  const searchParams = useSearchParams();
  const [batchIdInput, setBatchIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] =
    useState<BatchVerificationResult | null>(null);
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [checkpoints, setCheckpoints] = useState<CheckpointData[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [batchListError, setBatchListError] = useState<string | null>(null);
  const batchListRequestRef = useRef<Promise<string[]> | null>(null);
  const processedQueryBatchRef = useRef<string | null>(null);

  const loadBatches = useCallback(async () => {
    try {
      setLoadingBatches(true);
      setBatchListError(null);
      if (!batchListRequestRef.current) {
        batchListRequestRef.current = getAllBatches();
      }
      setAvailableBatches(await batchListRequestRef.current);
    } catch (e) {
      console.warn("Could not fetch batch list from chain:", e);
      batchListRequestRef.current = null;
      setBatchListError(
        e instanceof Error
          ? e.message
          : "Gagal memuat daftar batch dari Polygon Amoy.",
      );
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  const executeVerification = useCallback(async (targetId: string) => {
    const cleanId = extractBatchId(targetId);
    if (!cleanId) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const verResult = await verifyBatch(cleanId);
      setVerification(verResult);

      if (verResult.isValid) {
        const [batchDetail, timeline] = await Promise.all([
          getBatchDetail(cleanId),
          getBatchCheckpoints(cleanId),
        ]);
        setDetail(batchDetail);
        setCheckpoints(timeline);
      } else {
        setDetail(null);
        setCheckpoints([]);
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMsg(
        err.message || "Gagal memverifikasi obat ke blockchain Polygon Amoy.",
      );
      setVerification(null);
      setDetail(null);
      setCheckpoints([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const queryBatch = searchParams.get("batchId");
    if (queryBatch) {
      const cleanId = extractBatchId(queryBatch);
      if (!cleanId || processedQueryBatchRef.current === cleanId) return;
      processedQueryBatchRef.current = cleanId;
      setBatchIdInput(cleanId);
      executeVerification(cleanId);
    }
  }, [searchParams, executeVerification]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(batchIdInput);
  };

  const handleScanSuccess = useCallback(
    (scannedText: string) => {
      const extractedId = extractBatchId(scannedText);
      if (!extractedId) return;
      setBatchIdInput(extractedId);
      setShowScanner(false);
      executeVerification(extractedId);
    },
    [executeVerification],
  );

  useEffect(() => {
    if (showScanner) {
      document.getElementById("qr-scanner")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [showScanner]);

  const scrollToVerify = () => {
    document
      .getElementById("verification-label")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-white">
      <section className="relative isolate overflow-hidden border-b border-slate-200/80">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=2200&q=88"
            alt="Tenaga farmasi memeriksa kemasan obat"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,31,52,.94)_0%,rgba(8,31,52,.82)_44%,rgba(8,31,52,.22)_72%,rgba(8,31,52,.05)_100%)]" />
        </div>

        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 min-h-[620px] lg:min-h-[680px] flex items-center py-16">
          <div className="max-w-[650px] text-white">
            <p className="mb-6 text-xs font-bold uppercase tracking-[0.22em] text-[#b9ded5]">
              Infrastruktur verifikasi keaslian obat
            </p>
            <h1 className="text-[44px] sm:text-[58px] lg:text-[76px] leading-[0.98] font-semibold tracking-[-0.045em]">
              Kenali obat yang
              <br />
              Anda konsumsi.
            </h1>
            <p className="mt-7 max-w-[570px] text-lg sm:text-xl leading-8 text-slate-100/90">
              Verifikasi keaslian obat dan telusuri perjalanannya dari produsen
              hingga apotek melalui catatan permanen di jaringan Polygon.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToVerify}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-white px-6 text-sm font-bold text-[#102a43]"
              >
                Verifikasi obat
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-white/50 px-6 text-sm font-bold text-white"
              >
                <ScanLine className="h-4 w-4" />
                Pindai kode QR
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f7f8f4]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
          <div className="grid md:grid-cols-[.72fr_1.28fr] gap-8 lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#35786f]">
                Pentingnya ketertelusuran
              </p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-[#102a43]">
                Setiap obat memiliki riwayat. Riwayatnya harus dapat dilihat.
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
              <div>
                <div className="text-3xl font-semibold text-[#102a43]">1</div>
                <h3 className="mt-3 font-bold text-[#102a43]">
                  Batch terdaftar
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Produsen mencatat produk, nomor lot, masa kedaluwarsa, dan
                  fasilitas.
                </p>
              </div>
              <div>
                <div className="text-3xl font-semibold text-[#102a43]">2</div>
                <h3 className="mt-3 font-bold text-[#102a43]">
                  Pergerakan tercatat
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Peserta rantai pasok yang berwenang menambahkan titik
                  pemeriksaan terverifikasi.
                </p>
              </div>
              <div>
                <div className="text-3xl font-semibold text-[#102a43]">3</div>
                <h3 className="mt-3 font-bold text-[#102a43]">
                  Verifikasi publik
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Siapa pun dapat memverifikasi batch tanpa membuat dompet
                  digital.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="verification" className="scroll-mt-24">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
          <div className="grid lg:grid-cols-[.82fr_1.18fr] gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1">
              <p
                id="verification-label"
                className="scroll-mt-24 text-xs font-bold uppercase tracking-[0.18em] text-[#35786f]"
              >
                Verifikasi publik
              </p>
              <h2 className="mt-4 max-w-[520px] text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-[-0.035em] text-[#102a43]">
                Periksa batch dalam hitungan detik.
              </h2>
              <p className="mt-5 max-w-[520px] text-base leading-7 text-slate-600">
                Masukkan ID batch yang tercetak pada kemasan atau pindai kode
                QR. OBTENTIK membaca registri dan status verifikasi langsung di
                Polygon Amoy.
              </p>

              <div className="mt-8 max-w-[620px] border-y border-slate-200 py-5">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={batchIdInput}
                      onChange={(e) => setBatchIdInput(e.target.value)}
                      placeholder="Masukkan ID batch"
                      className="h-14 w-full rounded-md border border-slate-300 bg-white pl-12 pr-4 text-sm text-[#102a43]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !batchIdInput.trim()}
                    className="h-14 rounded-md bg-[#102a43] px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Memeriksa...
                      </span>
                    ) : (
                      "Verifikasi batch"
                    )}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setShowScanner(!showScanner)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#35786f]"
                >
                  <QrCode className="h-4 w-4" />
                  {showScanner
                    ? "Tutup pemindai kamera"
                    : "Pindai kode QR pada kemasan"}
                </button>

                {showScanner && (
                  <div
                    id="qr-scanner"
                    className="mt-5 rounded-md border border-slate-200 p-3"
                  >
                    <Html5Scanner onScanSuccess={handleScanSuccess} />
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">
                    Batch terdaftar:
                  </span>
                  {availableBatches.length > 0 ? (
                    availableBatches.map((batch) => (
                      <button
                        key={batch}
                        type="button"
                        onClick={() => {
                          setBatchIdInput(batch);
                          executeVerification(batch);
                        }}
                        className="border-b border-slate-300 pb-0.5 font-mono text-[#35786f]"
                      >
                        {batch}
                      </button>
                    ))
                  ) : (
                    <span>
                      {loadingBatches ? (
                        "Memuat dari blockchain..."
                      ) : batchListError ? (
                        <>
                          Gagal memuat batch: {batchListError}{" "}
                          <button
                            type="button"
                            onClick={loadBatches}
                            className="font-bold text-[#35786f] underline"
                          >
                            Coba lagi
                          </button>
                        </>
                      ) : (
                        "Tidak ada batch terdaftar."
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative overflow-hidden rounded-sm">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1500&q=88"
                  alt="Tenaga kesehatan memeriksa informasi obat"
                  className="h-[380px] sm:h-[520px] w-full object-cover"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-10 flex items-start gap-3 border-l-4 border-rose-500 bg-rose-50 px-5 py-4 text-sm text-rose-900">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <div>
                <strong>Kesalahan verifikasi.</strong> {errorMsg}
              </div>
            </div>
          )}

          {verification && (
            <div className="mt-12">
              <StatusBanner verification={verification} detail={detail} />
              {verification.isValid && detail && (
                <div className="mt-8 grid lg:grid-cols-[350px_1fr] gap-8">
                  <aside className="border-t-2 border-[#102a43] py-6">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-[#102a43]">
                      <Pill className="h-5 w-5 text-[#35786f]" />
                      Rincian produk
                    </h3>
                    <dl className="mt-6 space-y-5 text-sm">
                      <div>
                        <dt className="text-slate-500">Obat</dt>
                        <dd className="mt-1 font-bold text-[#102a43]">
                          {detail.productName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">
                          Nomor registrasi BPOM
                        </dt>
                        <dd className="mt-1 font-mono font-bold">
                          {detail.bpomNumber}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Nomor lot</dt>
                        <dd className="mt-1 font-mono font-bold">
                          {detail.lotNumber}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Tanggal produksi</dt>
                        <dd className="mt-1">
                          {detail.productionDateFormatted}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Tanggal kedaluwarsa</dt>
                        <dd className="mt-1 font-bold text-[#35786f]">
                          {detail.expiryDateFormatted}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Produsen</dt>
                        <dd className="mt-2">
                          <a
                            href={getExplorerAddressUrl(detail.manufacturer)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-start gap-1 break-all font-mono text-xs text-[#35786f] hover:underline"
                          >
                            {detail.manufacturer}
                            <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        </dd>
                      </div>
                    </dl>
                  </aside>
                  <div className="border-t-2 border-slate-200 py-6">
                    <h3 className="text-2xl font-semibold text-[#102a43]">
                      Linimasa rantai pasok
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Titik pemeriksaan yang tercatat untuk batch obat ini.
                    </p>
                    <div className="mt-6">
                      <Timeline
                        checkpoints={checkpoints}
                        currentStage={verification.currentStage}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#102a43] text-white">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
          <div className="grid lg:grid-cols-[.95fr_1.05fr] gap-12 lg:gap-20 items-center">
            <div className="overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?auto=format&fit=crop&w=1500&q=88"
                alt="Apoteker meninjau catatan laboratorium dan mutu obat"
                className="h-[420px] sm:h-[540px] w-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a9d5ca]">
                Dirancang untuk setiap serah terima
              </p>
              <h2 className="mt-4 text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-[-0.035em]">
                Satu catatan untuk seluruh rantai pasok.
              </h2>
              <div className="mt-10 border-t border-white/20">
                <div className="grid sm:grid-cols-[80px_1fr] gap-4 border-b border-white/20 py-6">
                  <Factory className="h-7 w-7 text-[#a9d5ca]" />
                  <div>
                    <h3 className="font-bold">Produksi</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Daftarkan identitas batch, informasi BPOM, nomor lot,
                      tanggal produksi, dan kedaluwarsa.
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-[80px_1fr] gap-4 border-b border-white/20 py-6">
                  <Truck className="h-7 w-7 text-[#a9d5ca]" />
                  <div>
                    <h3 className="font-bold">Distribusi</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Distributor resmi mencatat lokasi penyimpanan dan titik
                      pemeriksaan penanganan.
                    </p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-[80px_1fr] gap-4 border-b border-white/20 py-6">
                  <Store className="h-7 w-7 text-[#a9d5ca]" />
                  <div>
                    <h3 className="font-bold">Apotek</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Apotek mengonfirmasi penerimaan sebelum obat sampai kepada
                      pasien dan pendampingnya.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef2ed]">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
          <div className="max-w-[700px]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#35786f]">
              Prinsip platform
            </p>
            <h2 className="mt-4 text-4xl sm:text-5xl font-semibold tracking-[-0.035em] text-[#102a43]">
              Dirancang untuk menjaga kepercayaan di setiap tahap.
            </h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 border-y border-[#ccd7cf]">
            <div className="py-8 md:pr-8 md:border-r border-[#ccd7cf]">
              <Database className="h-7 w-7 text-[#35786f]" />
              <h3 className="mt-5 text-xl font-bold text-[#102a43]">
                Catatan permanen
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Data pendaftaran dan titik pemeriksaan dapat ditinjau di
                jaringan Polygon Amoy.
              </p>
            </div>
            <div className="py-8 md:px-8 md:border-r border-[#ccd7cf]">
              <Eye className="h-7 w-7 text-[#35786f]" />
              <h3 className="mt-5 text-xl font-bold text-[#102a43]">
                Transparansi publik
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Pasien dan pendamping dapat memverifikasi identitas obat tanpa
                akses teknis.
              </p>
            </div>
            <div className="py-8 md:pl-8">
              <ShieldCheck className="h-7 w-7 text-[#35786f]" />
              <h3 className="mt-5 text-xl font-bold text-[#102a43]">
                Hasil yang mengutamakan keselamatan
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Status penarikan, kedaluwarsa, batch tidak valid, dan keaslian
                berasal langsung dari hasil registri.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ConsumerPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-20 text-center text-sm text-slate-500">
          Memuat verifikasi obat...
        </div>
      }
    >
      <ConsumerPageContent />
    </Suspense>
  );
}
