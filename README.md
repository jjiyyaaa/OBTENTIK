# OBTENTIK Smart Contracts (Polygon Amoy Testnet)

Proyek Smart Contract berbasis Blockchain untuk ketertelusuran rantai pasok obat farmasi (*Pharmaceutical Supply Chain Traceability & Verification*) dan verifikasi keaslian obat untuk konsumen di Indonesia. Dikembangkan untuk kompetisi **HackSphere 2026** oleh **Tim imouttt (President University)**.

---

## 📌 Ringkasan Masalah & Solusi OBTENTIK

Menurut data Badan Pengawas Obat dan Makanan (BPOM) RI tahun 2025:
* Terdeteksi **197.725 tautan penjualan online ilegal** obat dan makanan.
* **35.984 produk farmasi** dan **39.386 obat tradisional/suplemen** beredar tanpa izin edar yang sah atau menggunakan nomor izin edar fiktif/palsu.
* Metode verifikasi tradisional (label fisik, hologram, nomor izin BPOM yang dicetak) mudah dipalsukan atau diduplikasi ke kemasan palsu tanpa rekam jejak rantai pasok (*chain of custody*).

**OBTENTIK** menyelesaikan celah ini dengan mengaitkan identitas fisik *batch* obat ke *smart contract* di blockchain **Polygon Amoy Testnet** melalui QR Code unik. Setiap perpindahan obat dicatat sebagai *checkpoint* permanen yang tidak dapat dimanipulasi:
$$\text{Manufacturer} \longrightarrow \text{Distributor} \longrightarrow \text{Pharmacy} \longrightarrow \text{Consumer}$$

---

## 🏛️ Arsitektur Smart Contract (`ObtentikSupplyChain.sol`)

Smart contract dibangun menggunakan **Solidity `^0.8.24`** dan pustaka standar industri **OpenZeppelin `AccessControl`**.

### 1. Whitelist & Role-Based Access Control
Smart contract mengamankan setiap titik pencatatan dengan membatasi eksekusi fungsi hanya ke alamat dompet (*wallet*) yang telah terverifikasi (*whitelisted*):
* `DEFAULT_ADMIN_ROLE`: Administrator sistem (Badan Pengawas / Kementerian Kesehatan / Operator Sistem).
* `MANUFACTURER_ROLE`: Pabrik farmasi berlisensi (misal: PT Kimia Farma, Kalbe Farma, Bio Farma).
* `DISTRIBUTOR_ROLE`: Distributor dan pedagang besar farmasi (PBF) resmi.
* `PHARMACY_ROLE`: Apotek dan fasilitas pelayanan kefarmasian berlisensi.
* `CONSUMER`: Publik/konsumen umum (hanya membaca data verifikasi, bebas biaya/gas, tanpa perlu dompet Web3).

### 2. Fungsi Utama Kontrak

| Nama Fungsi | Hak Akses | Deskripsi |
| :--- | :--- | :--- |
| `registerBatch(...)` | `MANUFACTURER_ROLE` / `DEFAULT_ADMIN_ROLE` | Mendaftarkan *batch* obat baru (nama obat, nomor izin edar BPOM, nomor lot, tanggal produksi & kedaluwarsa) dan otomatis mencatat **Checkpoint 1 (Manufactured)**. |
| `addCheckpoint(...)` / `verifyCheckpoint(...)` | `DISTRIBUTOR_ROLE` / `PHARMACY_ROLE` | Mencatat penerimaan barang di gudang distributor (**Checkpoint 2: Distributed**) atau di apotek (**Checkpoint 3: AtPharmacy**) dengan validasi urutan rantai pasok ketat. |
| `setBatchRecallStatus(...)` | `DEFAULT_ADMIN_ROLE` / Pembuat Batch | Menarik obat dari peredaran (*recall*) jika ditemukan kontaminasi BKO (*Bahan Kimia Obat*), kerusakan mutu, atau perintah regulasi. |
| `verifyBatch(...)` | `PUBLIC (view)` | **Fungsi utama untuk konsumen yang memindai QR Code.** Mengembalikan status validitas, keaslian, status recall, status kedaluwarsa, posisi rantai pasok, dan pesan status human-readable. |
| `getBatchDetail(...)` | `PUBLIC (view)` | Mengambil seluruh metadata detail batch obat untuk ditampilkan di aplikasi. |
| `getBatchCheckpoints(...)` | `PUBLIC (view)` | Mengambil seluruh linimasa riwayat *checkpoint* (aktor, nama instansi, waktu, lokasi, catatan QC). |
| `getUserRole(...)` | `PUBLIC (view)` | Memeriksa peran dari sebuah address (`ADMIN`, `MANUFACTURER`, `DISTRIBUTOR`, `PHARMACY`, atau `CONSUMER`) untuk *routing* antarmuka di frontend Next.js. |
| `registerManufacturer(...)` | `DEFAULT_ADMIN_ROLE` | Mendaftarkan entitas produsen obat ke dalam whitelist dengan nama resmi instansi. |
| `registerDistributor(...)` | `DEFAULT_ADMIN_ROLE` | Mendaftarkan entitas distributor resmi ke dalam whitelist. |
| `registerPharmacy(...)` | `DEFAULT_ADMIN_ROLE` | Mendaftarkan apotek berlisensi ke dalam whitelist. |
| `revokeActor(...)` | `DEFAULT_ADMIN_ROLE` | Mencabut izin akses dari aktor tertentu bila terjadi pelanggaran. |

---

## 🛡️ Enforced Chain of Custody (Anti-Bypass)

Berbeda dengan sistem berbasis tanda "terdaftar/tidak", smart contract OBTENTIK secara matematis memastikan urutan rantai pasok tidak dapat dipotong atau dilewati:
1. Apotek **TIDAK BISA** mencatat checkpoint jika batch obat belum pernah diterima dan dicatat oleh Distributor resmi (revert: `InvalidSupplyChainSequence(Distributed, Manufactured)`).
2. Distributor tidak dapat menduplikasi checkpoint pada batch yang sudah berada di fase berikutnya.
3. Batch yang berstatus **Recalled** secara otomatis diblokir dari seluruh pencatatan checkpoint baru (revert: `BatchAlreadyRecalled`).

---

## 🧪 Struktur Proyek

```
obtentik-contract/
├── contracts/
│   └── ObtentikSupplyChain.sol    # Smart Contract inti OBTENTIK
├── scripts/
│   ├── deploy.js                  # Deployment script ke Polygon Amoy + auto-export frontend
│   └── export-frontend.js         # Generator mandiri ABI & konfigurasi Next.js
├── test/
│   └── ObtentikSupplyChain.test.js# 22 Unit Tests komprehensif (Hardhat + Chai)
├── frontend-exports/              # Direktori output untuk integrasi Next.js
│   ├── ObtentikContractData.json  # ABI lengkap + metadata contract
│   └── ObtentikConfig.ts          # Konfigurasi TypeScript langsung pakai
├── hardhat.config.js              # Konfigurasi Hardhat (Polygon Amoy Network)
├── .env.example                   # Template konfigurasi environment
├── package.json
└── README.md
```

---

## 🚀 Panduan Memulai

### 1. Prasyarat
* Node.js versi 18+ (direkomendasikan v20+)
* npm atau yarn / pnpm

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi berikut:
```ini
PRIVATE_KEY=your_private_key_without_0x_prefix
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
POLYGONSCAN_API_KEY=your_polygonscan_api_key_optional
```

---

## 🔬 Menjalankan Unit Tests

Seluruh skenario pengujian (role whitelist, registrasi batch, alur 3-tier rantai pasok, batch recall, pemindaian QR konsumen, dan pembatasan akses) telah diuji:

```bash
npm test
```

**Hasil Pengujian:**
```
  ObtentikSupplyChain Contract
    1. Deployment and Access Control Whitelist
      ✔ Should configure deployer as DEFAULT_ADMIN_ROLE
      ✔ Should correctly assign and return roles for whitelisted actors
      ✔ Should allow admin to revoke an actor
      ✔ Should prevent non-admin from registering actors
    2. Batch Registration (Manufacturer)
      ✔ Should allow whitelisted manufacturer to register batch and log checkpoint 1
      ✔ Should prevent registering duplicate batchId
      ✔ Should revert if productionDate >= expiryDate
      ✔ Should revert if non-manufacturer attempts to register
    3. Supply Chain Flow (Manufacturer -> Distributor -> Pharmacy)
      ✔ Should allow distributor to add checkpoint (transitions Manufactured -> Distributed)
      ✔ Should prevent pharmacy from adding checkpoint before distributor (Strict Sequence Check)
      ✔ Should complete full 3-tier sequence: Manufacturer -> Distributor -> Pharmacy
      ✔ Should prevent distributor from adding checkpoint again once already Distributed
      ✔ Should prevent unauthorized third party from adding checkpoint
    4. Batch Recall Management
      ✔ Should allow the batch manufacturer to recall the batch
      ✔ Should allow Admin to recall the batch
      ✔ Should prevent non-owner/non-admin from recalling batch
      ✔ Should block adding checkpoints if batch is recalled
    5. Public Consumer Verification (QR Code Scan)
      ✔ Should return NOT_FOUND for non-existent batch
      ✔ Should verify authentic registered batch
      ✔ Should flag batch if recalled
      ✔ Should flag batch if expired
      ✔ Should list all batches and total batch count

  22 passing (1s)
```

---

## 🌐 Deployment ke Polygon Amoy Testnet

### Informasi Jaringan Polygon Amoy
* **Network Name**: Polygon Amoy Testnet
* **Chain ID**: `80002`
* **RPC Endpoint**: `https://rpc-amoy.polygon.technology/` (atau endpoint Alchemy/Drpc)
* **Native Token**: `POL` (Testnet MATIC/POL)
* **Block Explorer**: [https://amoy.polygonscan.com/](https://amoy.polygonscan.com/)
* **Faucet Gratis**: [Polygon Official Faucet](https://faucet.polygon.technology/) atau [Chainlink Amoy Faucet](https://faucets.chain.link/polygon-amoy)

### Eksekusi Deploy
Jalankan perintah berikut:
```bash
npm run deploy:amoy
```

Script akan:
1. Mengompilasi smart contract dengan optimizer Solidity 0.8.24.
2. Melakukan deployment ke Polygon Amoy Testnet.
3. Otomatis menghasilkan file ABI dan alamat kontrak di `frontend-exports/ObtentikContractData.json` dan `frontend-exports/ObtentikConfig.ts`.

---

## 💻 Modul Koneksi Blockchain Next.js (`frontend-exports/blockchain`)

Modul koneksi blockchain siap pakai untuk Next.js (App Router & Pages Router) menggunakan **ethers.js v6** dan **MetaMask** di **Polygon Amoy Testnet (Chain ID 80002 / `0x13882`)**.

### Struktur Modul
```
frontend-exports/
├── ObtentikConfig.ts              # Konfigurasi kontrak & ABI
├── ObtentikContractData.json      # Metadata deploy & ABI JSON
├── index.ts                       # Barrel export utama
└── blockchain/
    ├── types.ts                   # Tipe TypeScript (UserRole, CheckpointData, BatchDetail, dll.)
    ├── chains.ts                  # Konfigurasi Polygon Amoy (RPC, Explorer, Chain ID 80002)
    ├── errors.ts                  # Penerjemah Custom Error Solidity & RPC MetaMask ke Bahasa Indonesia
    ├── readonly.ts                # Provider read-only tanpa login/wallet untuk Konsumen
    ├── metamask.ts                # Koneksi MetaMask & auto switch/add chain Polygon Amoy
    ├── transactions.ts            # Penandatanganan transaksi on-chain nyata (Tanpa Mock/Hardcoded)
    ├── ObtentikContext.tsx        # React Context & Provider untuk Next.js ("use client")
    ├── useObtentik.ts             # Custom Hook useObtentik()
    ├── index.ts                   # Unified re-export
    └── examples/
        ├── ConsumerVerification.tsx  # Contoh: Halaman Verifikasi QR Konsumen (Tanpa Wallet)
        └── StakeholderDashboard.tsx  # Contoh: Portal Dashboard Stakeholder (MetaMask & Signing)
```

---

### 1. Verifikasi Konsumen Tanpa Login/Wallet (Read-Only)
Konsumen yang memindai QR Code di kemasan obat **tidak memerlukan dompet Web3, MetaMask, atau token POL**. Query dieksekusi secara instan dan gratis melalui JsonRpcProvider publik ke Polygon Amoy:

```typescript
import { verifyBatch, getBatchDetail, getBatchCheckpoints } from "@/frontend-exports";

// A. Verifikasi status cepat hasil scan QR
const status = await verifyBatch("BATCH-2026-PARA500");
console.log(status.isAuthentic);        // true (Asli & rantai pasok valid)
console.log(status.isSafeForConsumption); // true (Valid, tidak expired, tidak direcall)
console.log(status.currentStageLabel);  // "Tersedia di Apotek (Pharmacy)"
console.log(status.statusMessage);      // "AUTHENTIC: Product verified through legitimate supply chain"

// B. Ambil detail informasi batch obat
const detail = await getBatchDetail("BATCH-2026-PARA500");
console.log(detail.productName);        // "Paracetamol 500mg Kaplet"
console.log(detail.bpomNumber);         // "DKL1234567890A1"
console.log(detail.expiryDateFormatted);// "20 Nov 2029"

// C. Ambil linimasa perjalanan rantai pasok obat
const timeline = await getBatchCheckpoints("BATCH-2026-PARA500");
timeline.forEach(cp => {
  console.log(`${cp.stageLabel} oleh ${cp.actorName} (${cp.actorRole}) di ${cp.location}`);
});
```

---

### 2. Integrasi MetaMask & Deteksi Role di Next.js

Bungkus aplikasi Next.js Anda dengan `<ObtentikProvider>`:

```tsx
// app/providers.tsx atau pages/_app.tsx
"use client";
import { ObtentikProvider } from "@/frontend-exports";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ObtentikProvider>{children}</ObtentikProvider>;
}
```

Gunakan hook `useObtentik()` di komponen:

```tsx
"use client";
import { useObtentik } from "@/frontend-exports";

export default function Navbar() {
  const {
    account,
    role,        // "ADMIN" | "MANUFACTURER" | "DISTRIBUTOR" | "PHARMACY" | "CONSUMER"
    actorName,   // Contoh: "PT Kimia Farma Tbk" / "Apotek K-24 Senopati"
    isConnected,
    isCorrectNetwork,
    connect,
    switchToAmoy,
  } = useObtentik();

  return (
    <nav>
      {!isConnected ? (
        <button onClick={connect}>Hubungkan MetaMask</button>
      ) : (
        <div>
          <span>{actorName || account}</span>
          <span className="badge">{role}</span>
          {!isCorrectNetwork && (
            <button onClick={switchToAmoy}>Pindah ke Polygon Amoy</button>
          )}
        </div>
      )}
    </nav>
  );
}
```

---

### 3. Eksekusi & Penandatanganan Transaksi Nyata

Semua fungsi transaksi menunggu konfirmasi on-chain (`wait(1)`) dan mengembalikan hash transaksi serta tautan ke Polygonscan Amoy:

#### A. Registrasi Batch Obat (Produsen/Manufacturer)
```typescript
const result = await registerBatch({
  batchId: "BATCH-2026-AMOY01",
  productName: "Paracetamol 500mg Kaplet",
  bpomNumber: "DKL1234567890A1",
  lotNumber: "LOT-202604-01",
  productionDate: new Date("2026-04-01"),
  expiryDate: new Date("2029-04-01"),
  facilityLocation: "Pabrik Kimia Farma Plant Banjaran, Bandung",
  initialNotes: "Passed BPOM Good Manufacturing Practice (CPOB)",
});
console.log("Tx Explorer:", result.explorerUrl);
```

#### B. Pencatatan Checkpoint Rantai Pasok (Distributor & Apotek)
```typescript
// Distributor menerima dari pabrik
await addCheckpoint({
  batchId: "BATCH-2026-AMOY01",
  location: "Gudang Distribusi PBF Kimia Farma, Cikarang",
  notes: "Suhu penyimpanan 20-25 C, segel utuh",
});

// Apotek menerima dan menaruh di rak (atau pakai verifyCheckpoint)
await verifyCheckpoint({
  batchId: "BATCH-2026-AMOY01",
  location: "Apotek K-24 Senopati Jakarta",
  notes: "Diverifikasi oleh Apoteker Penanggung Jawab (APJ)",
});
```

#### C. Penarikan Obat dari Peredaran / Recall (Admin & Produsen)
```typescript
await setBatchRecallStatus({
  batchId: "BATCH-2026-AMOY01",
  isRecalled: true,
  recallReason: "Peringatan mutu BPOM: Terindikasi degradasi kemasan sekunder",
});
```

#### D. Whitelist Entitas Baru (Admin Sistem)
```typescript
await registerManufacturer("0x123...", "PT Kalbe Farma Tbk");
await registerDistributor("0x456...", "PT Enseval Putera Megatrading");
await registerPharmacy("0x789...", "Apotek Kimia Farma Juanda");
```

---

## 👥 Tim Pengembang (imouttt - President University)
* **Ghaziya Manna Putri Iwadani** (Team Leader) - `ghaziyaiwadani@gmail.com`
* **Youra Harmein Harahap** (Member) - `harmeinyoura@gmail.com`
* **Zahara Shabilla Putri** (Member) - `zaharasp11@gmail.com`

---

## 📄 Lisensi
Proyek ini dilisensikan di bawah lisensi **MIT**.
