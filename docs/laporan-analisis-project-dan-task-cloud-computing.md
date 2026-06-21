# Laporan Analisis Proyek dan TASK.md

## Studi Kasus Cloud Computing: Quant BTC Cycle Valuation System

**Repository:** `quant-btc-valuation-system`  
**Tanggal analisis:** 22 Juni 2026  
**Ruang lingkup:** Analisis proyek, pemetaan terhadap `TASK.md`, analisis risiko cloud, rancangan disaster recovery, dan Business Continuity Plan (BCP).  
**Sumber internal utama:** `TASK.md`, `README.md`, `openspec/config.yaml`, `backend/app.ts`, `database/db.py`, `quant/components/*`, `frontend/src/*`, dan `openspec/specs/*`.

---

## 1. Ringkasan Eksekutif

`quant-btc-valuation-system` adalah sistem analitik kuantitatif untuk menilai posisi siklus Bitcoin melalui agregasi metrik on-chain, teknikal, dan sentimen. Output utama sistem adalah **Master Valuation Oscillator** dengan rentang `-2` sampai `+2`, yang digunakan untuk mengindikasikan fase valuasi Bitcoin:

| Nilai Oscillator | Interpretasi |
|---:|---|
| `+2` | High value atau area undervalued/bottom |
| `+1` | Moderately undervalued |
| `0` | Netral |
| `-1` | Moderately overvalued |
| `-2` | Low value atau area overvalued/peak |

Secara teknis, proyek ini terdiri dari:

| Lapisan | Teknologi | Fungsi |
|---|---|---|
| Quant/Data Pipeline | Python, Pandas, NumPy, Requests, SciPy | Scraping, transformasi, normalisasi, audit statistik |
| Database | SQLite dengan WAL mode | Penyimpanan timeseries metrik, OHLC BTC, konfigurasi threshold, audit statistik |
| Backend API | Hono di atas Bun, fallback Node dengan `better-sqlite3` | Menyediakan endpoint metrik, composite oscillator, konfigurasi threshold, pipeline trigger |
| Frontend | Vite, React, TypeScript, Recharts, Lightweight Charts | Dashboard visualisasi metrik, composite chart, detail metrik, threshold editor, audit panel |
| Spec Management | OpenSpec | Dokumentasi kebutuhan, desain, dan kontrak implementasi |

Berdasarkan isi `TASK.md`, proyek ini cocok dijadikan studi kasus Cloud Computing karena memiliki kebutuhan nyata terhadap ketersediaan layanan, integritas data, backup, recovery, observability, serta kontinuitas proses bisnis. Walaupun implementasi saat ini masih berorientasi lokal dengan SQLite file database, arsitektur proyek sudah memiliki pemisahan peran yang cukup jelas sehingga dapat dimigrasikan ke lingkungan cloud secara bertahap.

Kesimpulan utama:

1. Proyek sudah memiliki domain dan arsitektur yang jelas: Python pipeline, SQLite, Hono API, dan React dashboard.
2. Risiko terbesar untuk konteks cloud adalah ketergantungan pada SQLite file database, scraping sumber eksternal, belum adanya otentikasi untuk endpoint operasional, dan belum adanya mekanisme backup/recovery otomatis.
3. Target DR yang realistis untuk versi awal adalah **RTO 4 jam** dan **RPO 24 jam** untuk layanan dashboard, serta **RTO 8 jam** dan **RPO 24 jam** untuk pipeline historis.
4. Untuk deployment cloud, sistem perlu menambahkan backup database terjadwal, object storage untuk snapshot, health check, monitoring, secret management, job scheduler, dan hardening endpoint pipeline.
5. BCP perlu memisahkan prioritas layanan: dashboard read-only harus dipulihkan lebih dulu, sedangkan pipeline ingestion dapat berjalan menyusul selama data terakhir masih tersedia.

---

## 2. Analisis TASK.md

Isi `TASK.md` adalah dokumen RPKPS untuk mata kuliah Cloud Computing. Dokumen tersebut mengatur tahapan proyek dari minggu 2 sampai minggu 14.

### 2.1 Pemetaan TASK.md ke Aktivitas Proyek

| Minggu | Materi TASK.md | Kebutuhan dari TASK.md | Penerapan pada proyek ini |
|---|---|---|---|
| Minggu 2 | Penentuan Topik dan Tinjauan Literatur | Menentukan studi kasus sistem cloud dan mengumpulkan referensi | Studi kasus: Cloud deployment untuk dashboard dan pipeline valuasi Bitcoin |
| Minggu 3-4 | Persiapan Proyek | Identifikasi masalah, tujuan, metodologi analisis dan perancangan | Masalah: layanan analitik lokal belum siap cloud; tujuan: rancangan deployment, risiko, DR, BCP |
| Minggu 5-7 | Analisis Risiko Cloud | Identifikasi potensi gangguan dan analisis risiko layanan cloud | Risiko database file, downtime API, gagal scraping, data corruption, kredensial, biaya cloud |
| Minggu 8-10 | Perancangan Disaster Recovery | Strategi backup, replication, failover | Snapshot SQLite ke object storage, backup harian, environment recovery, static frontend fallback |
| Minggu 11-12 | Pengembangan BCP | Integrasi BCP untuk menjaga keberlanjutan layanan | Prioritas read-only dashboard, SOP incident, rollback, komunikasi, mode degradasi |
| Minggu 13-14 | Laporan dan Makalah | Laporan akhir, makalah ilmiah, presentasi | Dokumen ini dapat menjadi dasar laporan akhir dan bahan presentasi |

### 2.2 Interpretasi Tugas

Karena `TASK.md` tidak berisi daftar backlog teknis, tetapi rencana pembelajaran Cloud Computing, maka laporan ini tidak hanya menganalisis kode. Laporan ini juga mengubah proyek menjadi studi kasus cloud yang memenuhi capaian berikut:

1. Menjelaskan kondisi proyek saat ini.
2. Menentukan ruang lingkup sistem cloud yang akan dianalisis.
3. Mengidentifikasi risiko layanan cloud.
4. Merancang strategi disaster recovery.
5. Merancang Business Continuity Plan.
6. Menyediakan roadmap implementasi dan validasi.

---

## 3. Profil Proyek

### 3.1 Nama dan Tujuan Sistem

**Quant BTC Cycle Valuation System** adalah sistem kuantitatif untuk menganalisis valuasi siklus Bitcoin. Sistem mengolah berbagai metrik menjadi skor terstandarisasi `-2` sampai `+2`, kemudian menggabungkannya menjadi composite oscillator.

Tujuan bisnis dan akademik:

1. Menyediakan alat bantu analisis siklus Bitcoin berbasis data historis.
2. Mengintegrasikan on-chain metric, technical indicator, dan sentiment indicator.
3. Menampilkan hasil dalam dashboard yang mudah dianalisis.
4. Menjadi contoh sistem data pipeline dan dashboard analytics yang dapat dioperasikan di cloud.

### 3.2 Output Sistem

Output utama:

1. **Normalized valuation score per metric**, tersimpan di `timeseries_metrics.normalized_value`.
2. **Composite oscillator**, dihitung dari rata-rata metrik yang memiliki nilai normalized non-null.
3. **BTC price context**, dari tabel `btc_ohlc`.
4. **Audit statistik**, melalui tabel `audit_indicator_stats`, `audit_correlation_matrix`, dan `audit_composite_params`.

### 3.3 Data dan Metrik yang Dikelola

Berdasarkan registry komponen, proyek memiliki 17 komponen:

| Metric | Kategori | Deskripsi |
|---|---|---|
| `aviv_ratio` | Fundamental | AVIV Ratio-Z |
| `aviv_nupl` | Fundamental | AVIV NUPL |
| `cvdd_ratio` | Fundamental | CVDD Ratio |
| `mvrv_z` | Fundamental | MVRV Z-Score |
| `lth_sth_sopr_ratio` | Fundamental | LTH/STH SOPR Ratio |
| `terminal_price_ratio` | Fundamental | Terminal Price Ratio |
| `unrealized_sell_risk` | Fundamental | Unrealized Sell-Side Risk Ratio |
| `ahr999` | Technical | Bitcoin Ahr999 Index |
| `dvrsi` | Technical | Dynamic Volume RSI |
| `pi_cycle_top` | Technical | Pi Cycle Top Indicator |
| `risk_metrics` | Technical | Bitcoin Risk Metric |
| `sharpe_ratio_52w` | Technical | Rolling 52-Week Sharpe Ratio |
| `two_year_ma` | Technical | 2 Year Moving Average Multiplier |
| `vpli` | Technical | Volatility Adjusted Power Law Index |
| `williams_r` | Technical | Weekly Williams %R |
| `fear_greed_og` | Sentiment | Alternative.me Fear and Greed |
| `fear_greed_cmc` | Sentiment | CoinMarketCap Fear and Greed |

### 3.4 Kondisi Database Saat Analisis

Database lokal `database/metrics.db` berisi data historis aktif:

| Tabel | Jumlah baris saat analisis |
|---|---:|
| `timeseries_metrics` | 79.647 |
| `btc_ohlc` | 5.789 |
| `metric_config` | 21 |
| `audit_indicator_stats` | 0 |
| `audit_correlation_matrix` | 0 |
| `audit_composite_params` | 0 |

Catatan penting:

1. Data metrik sudah cukup besar untuk sistem lokal dan dapat menjadi aset utama yang wajib dilindungi saat cloud deployment.
2. Tabel audit masih kosong saat analisis, sehingga fitur audit belum memiliki data operasional aktif pada database saat ini.
3. `metric_config` berisi 21 baris, sementara metrik utama berjumlah 17. Perlu audit apakah ada konfigurasi legacy atau metrik tambahan yang tidak lagi digunakan.

---

## 4. Arsitektur Sistem Saat Ini

### 4.1 Alur Data

Alur utama sistem:

```text
External Data Sources
    -> Python ComponentScript per metric
    -> Normalize raw values to -2..+2
    -> SQLite database/metrics.db
    -> Hono API
    -> React dashboard
```

Setiap metric component mengikuti prinsip **One Component = One Python Script**. Prinsip ini penting karena setiap indikator memiliki formula, sumber data, threshold, dan karakteristik statistik yang berbeda.

### 4.2 Lapisan Quant Pipeline

Modul `quant/` bertanggung jawab untuk:

1. Mengambil data dari sumber eksternal.
2. Menghitung raw metric.
3. Menormalisasi nilai ke skala `-2` sampai `+2`.
4. Menyimpan data ke SQLite.
5. Menjalankan pipeline batch melalui `quant.run_all`.
6. Menjalankan audit statistik melalui `quant.audit.runner`.

Kontrak abstrak komponen terdapat di `quant/components/base.py`:

| Method | Fungsi |
|---|---|
| `fetch_data(full_rebuild=False)` | Mengambil data penuh atau delta |
| `normalize(df)` | Mengubah raw value ke normalized score |
| `store(df)` | Menyimpan data ke `timeseries_metrics` |
| `run_pipeline(full_rebuild=False)` | Orkestrasi fetch, normalize, store |
| `get_latest_date()` | Mengambil tanggal terakhir suatu metric |

### 4.3 Lapisan Database

SQLite digunakan sebagai database lokal dengan WAL mode. Skema utama:

| Tabel | Fungsi |
|---|---|
| `timeseries_metrics` | Menyimpan data metrik harian atau mingguan |
| `btc_ohlc` | Menyimpan data harga BTC OHLC |
| `metric_config` | Menyimpan threshold normalisasi |
| `audit_indicator_stats` | Menyimpan statistik distribusi per indikator |
| `audit_correlation_matrix` | Menyimpan korelasi antar indikator |
| `audit_composite_params` | Menyimpan parameter rescaling composite |

Keunggulan SQLite untuk fase saat ini:

1. Sederhana dan cepat untuk single-node analytics.
2. Mudah dibackup sebagai file.
3. Cocok untuk penelitian dan prototipe.

Kelemahan SQLite untuk cloud production:

1. Tidak ideal untuk multi-writer.
2. Perlu strategi file locking dan backup yang disiplin.
3. Failover aktif-aktif sulit dilakukan.
4. Tidak otomatis menyediakan point-in-time recovery seperti managed relational database.

### 4.4 Lapisan Backend API

Backend menggunakan Hono dengan Bun, dan memiliki fallback Node melalui `better-sqlite3`. Endpoint penting:

| Endpoint | Method | Fungsi |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/metrics` | GET | Ringkasan metrik terbaru |
| `/api/metrics/:metric_name` | GET | Timeseries per metrik |
| `/api/metrics/btc_ohlc` | GET | Data OHLC BTC |
| `/api/composite` | GET | Composite oscillator |
| `/api/metrics/configs` | GET | Semua konfigurasi threshold |
| `/api/metrics/config/:metric_name` | GET | Konfigurasi threshold per metrik |
| `/api/metrics/config` | POST | Simpan konfigurasi threshold |
| `/api/metrics/config/defaults` | GET | Ambil threshold default |
| `/api/metrics/renormalize/:metric_name` | POST | Renormalisasi metric |
| `/api/audit/summary` | GET | Ringkasan audit statistik |
| `/api/pipeline/run` | POST | Menjalankan pipeline Python dan audit |

Temuan penting:

1. Endpoint pipeline dapat memicu proses Python dari backend. Dalam deployment cloud, endpoint ini wajib diproteksi dengan authentication dan authorization.
2. `/api/composite` mengecualikan `aviv_nupl` dari composite. Keputusan ini perlu didokumentasikan secara eksplisit di spec atau laporan model.
3. `/api/composite` dapat menambahkan `raw_composite_value`, sedangkan beberapa spec historis menyebut respons hanya empat field. Ini perlu diselaraskan.

### 4.5 Lapisan Frontend

Frontend React menampilkan:

1. Dashboard utama.
2. Composite chart.
3. Metric grid.
4. Sidebar kategori.
5. Detail metric.
6. Threshold editor.
7. Audit panel.
8. Tombol refetch latest dan full rebuild.

Frontend mengambil data melalui `frontend/src/api/client.ts` dari endpoint backend. Dashboard utama berada di `frontend/src/components/DashboardLayout.tsx`.

### 4.6 Spec-Driven Development

Repository menggunakan OpenSpec. File `openspec/config.yaml` menjadi aturan otoritatif untuk:

1. Tech stack.
2. Struktur direktori.
3. Konvensi pengembangan.
4. Kontrak proposal, spec, design, dan tasks.
5. Aturan testing.
6. Larangan asumsi API key.
7. Larangan field Pydantic underscore untuk respons serialisasi.

---

## 5. Analisis Kesesuaian Terhadap Cloud Computing

### 5.1 Karakteristik Cloud-Native yang Sudah Ada

| Area | Kondisi saat ini | Kesiapan cloud |
|---|---|---|
| Backend stateless API | Sebagian besar stateless, membaca SQLite file | Cukup siap jika DB dipisahkan/di-mount dengan benar |
| Frontend SPA | Dapat dibuild static | Siap untuk object storage/CDN |
| Pipeline batch | CLI Python sudah tersedia | Siap dijalankan sebagai scheduled job/container job |
| Health check | `/api/health` tersedia | Siap untuk load balancer health check |
| Config DB path | `DB_PATH` env var tersedia | Mendukung environment-specific config |
| Testing | Pytest, Bun test, Vitest | Cukup siap untuk CI |

### 5.2 Area yang Belum Cloud-Ready

| Area | Risiko | Dampak |
|---|---|---|
| SQLite sebagai file tunggal | Data loss jika disk rusak atau container ephemeral | Kehilangan histori metrik |
| Endpoint pipeline tanpa auth | Dapat disalahgunakan untuk menjalankan proses berat | Denial of service dan biaya cloud meningkat |
| Tidak ada backup otomatis | Recovery manual dan lambat | RPO tidak terjamin |
| Tidak ada observability terstruktur | Incident sulit didiagnosis | MTTR meningkat |
| Tidak ada rate limit | API dan pipeline rawan abuse | Downtime atau biaya meningkat |
| Secret management belum jelas | API key eksternal rentan bocor jika ditaruh di repo/env tidak aman | Risiko keamanan |
| Sumber eksternal scraping | Perubahan HTML/API upstream bisa memutus pipeline | Data freshness terganggu |

### 5.3 Rekomendasi Target Cloud Architecture

Arsitektur cloud minimum yang direkomendasikan:

```text
User
  -> CDN / Static Hosting
  -> React SPA
  -> API Gateway / Reverse Proxy
  -> Hono API container
  -> Persistent volume or managed database
  -> Object Storage backup bucket
  -> Scheduled Python pipeline job
  -> Monitoring and alerting
```

Opsi implementasi:

| Komponen | Opsi sederhana | Opsi lebih matang |
|---|---|---|
| Frontend | Static hosting + CDN | CDN dengan WAF |
| Backend | Single container service | Multi-instance API dengan shared DB |
| Database | SQLite di persistent volume + backup | PostgreSQL/managed SQL untuk production |
| Pipeline | Cron job di VM/container | Managed scheduler + worker job |
| Backup | Snapshot harian ke object storage | Snapshot + lifecycle + restore drill |
| Monitoring | Log service + uptime check | Metrics, tracing, alerts, SLO |

Untuk fase akademik, SQLite dengan persistent volume dan backup object storage masih dapat diterima. Untuk production multi-user, migrasi ke PostgreSQL atau managed database lebih disarankan.

---

## 6. Identifikasi Permasalahan

### 6.1 Permasalahan Bisnis

1. Dashboard harus tetap dapat diakses ketika pengguna ingin melihat valuasi terbaru.
2. Data historis adalah aset utama sistem, sehingga kehilangan database akan merusak kredibilitas model.
3. Pipeline harus dapat berjalan rutin agar data tetap segar.
4. Jika sumber data eksternal gagal, sistem tetap perlu menyajikan data terakhir dengan status freshness yang jelas.
5. Perubahan threshold metrik dapat memengaruhi composite oscillator, sehingga perlu audit trail dan rollback.

### 6.2 Permasalahan Teknis

1. Sistem saat ini bergantung pada file SQLite lokal.
2. Belum terlihat mekanisme backup otomatis database.
3. Endpoint operasional seperti `/api/pipeline/run` dan threshold update perlu proteksi.
4. Audit statistik belum memiliki data aktif pada database saat analisis.
5. Ada kemungkinan mismatch antara beberapa spec historis dan implementasi saat ini.
6. Belum ada deployment manifest cloud seperti Dockerfile, compose file, Terraform, atau CI/CD pipeline yang terlihat di struktur proyek.

### 6.3 Permasalahan Operasional

1. Recovery kemungkinan masih manual.
2. Belum ada runbook incident.
3. Belum ada definisi RTO/RPO.
4. Belum ada alert ketika pipeline gagal atau data stale.
5. Belum ada prosedur restore database yang diuji berkala.

---

## 7. Analisis Risiko Cloud

Skala penilaian:

| Nilai | Kemungkinan | Dampak |
|---:|---|---|
| 1 | Sangat rendah | Minor |
| 2 | Rendah | Terbatas |
| 3 | Sedang | Signifikan |
| 4 | Tinggi | Besar |
| 5 | Sangat tinggi | Kritis |

Risk score = kemungkinan x dampak.

### 7.1 Risk Register

| ID | Risiko | Penyebab | Dampak | Kemungkinan | Dampak | Score | Mitigasi |
|---|---|---|---|---:|---:|---:|---|
| R1 | Kehilangan database SQLite | Disk rusak, container ephemeral, human error | Hilangnya histori metric dan config | 3 | 5 | 15 | Backup harian, snapshot sebelum rebuild, restore drill |
| R2 | Corruption database | Write interruption, proses pipeline gagal di tengah transaksi | Data tidak konsisten | 2 | 5 | 10 | WAL mode, transaksi, backup sebelum pipeline, integrity check |
| R3 | Pipeline gagal karena sumber eksternal berubah | HTML/API upstream berubah, rate limit, timeout | Data tidak update | 4 | 4 | 16 | Retry, fallback source, stale-data warning, monitoring |
| R4 | Endpoint pipeline disalahgunakan | Tidak ada auth/rate limit | CPU spike, biaya meningkat, data overwrite | 3 | 5 | 15 | Auth admin, rate limit, IP allowlist, audit log |
| R5 | Downtime backend API | Container crash, DB locked, deploy error | Dashboard tidak dapat mengambil data | 3 | 4 | 12 | Health check, auto restart, blue-green deploy |
| R6 | Frontend tidak dapat diakses | Hosting/CDN outage atau build gagal | Pengguna tidak dapat melihat dashboard | 2 | 3 | 6 | Static hosting redundant, rollback build |
| R7 | Secret/API key bocor | Env tidak aman, log mencetak kredensial | Penyalahgunaan akses upstream | 2 | 5 | 10 | Secret manager, masking log, least privilege |
| R8 | Data stale tanpa notifikasi | Pipeline gagal tetapi dashboard tetap online | Keputusan pengguna berbasis data usang | 4 | 4 | 16 | Freshness indicator, alert, max-age policy |
| R9 | Salah konfigurasi threshold | Input manual salah atau tidak tervalidasi | Composite oscillator misleading | 3 | 4 | 12 | Validasi input, versioning config, rollback defaults |
| R10 | Biaya cloud membengkak | Pipeline rebuild berulang, logging berlebihan | Gangguan anggaran | 3 | 3 | 9 | Budget alert, rate limit, job quota |
| R11 | Ketidaksesuaian spec dan implementasi | Spec historis tidak diperbarui | Testing dan dokumentasi membingungkan | 3 | 3 | 9 | Spec audit, contract test, changelog |
| R12 | Tidak ada observability | Log tidak terstruktur, tidak ada metrics | MTTR tinggi | 4 | 3 | 12 | Centralized logging, metrics, alert |

### 7.2 Risiko Prioritas Tinggi

Risiko dengan score tertinggi adalah:

1. **R3 - Pipeline gagal karena sumber eksternal berubah**.
2. **R8 - Data stale tanpa notifikasi**.
3. **R1 - Kehilangan database SQLite**.
4. **R4 - Endpoint pipeline disalahgunakan**.

Keempat risiko ini harus menjadi prioritas implementasi sebelum sistem dipublikasikan di cloud.

### 7.3 Strategi Mitigasi Prioritas

| Risiko | Mitigasi teknis | Mitigasi proses |
|---|---|---|
| R1 | Snapshot database ke object storage, backup sebelum rebuild | Restore drill bulanan |
| R3 | Retry, timeout, fallback, isolasi kegagalan per component | Review sumber data per metrik |
| R4 | Auth admin, rate limit, disable endpoint publik | Hanya admin yang boleh menjalankan pipeline |
| R8 | Freshness indicator dan alert data stale | SOP eskalasi pipeline failure |

---

## 8. Rancangan Disaster Recovery

### 8.1 Tujuan DR

Disaster Recovery bertujuan memulihkan layanan setelah gangguan besar seperti:

1. Database hilang atau korup.
2. Backend tidak dapat berjalan.
3. Deployment gagal.
4. Pipeline menghasilkan data salah.
5. Region atau layanan cloud mengalami outage.

### 8.2 Klasifikasi Layanan

| Layanan | Prioritas | Alasan |
|---|---:|---|
| Dashboard read-only | P1 | Pengguna tetap dapat membaca hasil valuasi terakhir |
| Backend API read-only | P1 | Sumber data utama frontend |
| SQLite database | P1 | Aset data utama |
| Pipeline ingestion | P2 | Penting untuk freshness, tetapi tidak harus pulih lebih dulu |
| Threshold editor | P2 | Operasional admin |
| Audit statistik | P3 | Mendukung kualitas model, bukan layanan utama realtime |

### 8.3 Target RTO dan RPO

| Komponen | RTO | RPO | Justifikasi |
|---|---:|---:|---|
| Frontend static dashboard | 1 jam | 24 jam | Dapat diredeploy cepat dari build artifact |
| Backend API | 2 jam | 24 jam | Container dapat direstart/redeploy |
| SQLite database | 4 jam | 24 jam | Restore dari backup harian |
| Pipeline ingestion | 8 jam | 24 jam | Bisa dijalankan ulang setelah DB pulih |
| Full historical rebuild | 24 jam | Tidak relevan | Hanya diperlukan jika backup tidak valid |

Untuk versi awal, target **RPO 24 jam** realistis karena data metrik umumnya harian atau mingguan. Jika sistem menjadi production-critical, RPO dapat diturunkan menjadi 1 sampai 4 jam dengan backup lebih sering.

### 8.4 Strategi Backup

#### 8.4.1 Backup Database

Strategi minimum:

1. Backup `database/metrics.db` setiap hari.
2. Backup file WAL/SHM dengan prosedur SQLite-safe atau lakukan checkpoint sebelum copy.
3. Simpan backup di object storage.
4. Gunakan struktur path:

```text
backups/
  daily/
    metrics-db-YYYY-MM-DD.sqlite
  pre-rebuild/
    metrics-db-before-rebuild-YYYY-MM-DD-HHMM.sqlite
  weekly/
    metrics-db-week-YYYY-WW.sqlite
```

Praktik yang disarankan:

1. Jalankan `PRAGMA wal_checkpoint(FULL);` sebelum snapshot.
2. Jalankan `PRAGMA integrity_check;` setelah backup atau saat restore.
3. Enkripsi backup di rest.
4. Terapkan lifecycle policy:
   - Harian: simpan 14 sampai 30 hari.
   - Mingguan: simpan 8 sampai 12 minggu.
   - Bulanan: simpan 12 bulan jika diperlukan untuk audit.

#### 8.4.2 Backup Config dan Artifact

Selain database, backup juga perlu mencakup:

1. `.env.example` atau template konfigurasi tanpa secret.
2. Build frontend artifact.
3. Versi Docker image atau release tag.
4. OpenSpec artifacts.
5. Export konfigurasi metric thresholds.

### 8.5 Strategi Restore

Langkah restore database:

1. Hentikan backend dan pipeline worker.
2. Ambil backup terakhir yang valid dari object storage.
3. Restore ke path database baru.
4. Jalankan integrity check.
5. Jalankan smoke test query:
   - count `timeseries_metrics`
   - count `btc_ohlc`
   - latest date per metric
6. Jalankan backend dengan `DB_PATH` mengarah ke database restore.
7. Validasi endpoint:
   - `GET /api/health`
   - `GET /api/metrics`
   - `GET /api/composite`
8. Jalankan frontend dan cek dashboard.
9. Jalankan incremental pipeline setelah layanan read-only stabil.

### 8.6 Strategi Failover

Untuk tahap awal:

1. Gunakan single active backend dengan auto restart.
2. Simpan database di persistent disk.
3. Backup ke object storage di region yang sama, dan salinan mingguan ke region berbeda jika tersedia.
4. Siapkan environment standby yang dapat dibuat ulang dari Infrastructure as Code.

Untuk tahap lebih matang:

1. Migrasi database ke managed PostgreSQL.
2. Pisahkan API read-only dari worker write pipeline.
3. Gunakan deployment rolling/blue-green.
4. Tambahkan read replica atau replica restore strategy.

### 8.7 Runbook DR Singkat

| Kondisi | Tindakan |
|---|---|
| Backend down | Restart service, cek logs, validasi `/api/health` |
| Database locked | Hentikan pipeline, cek proses writer, restart backend jika perlu |
| Database corrupt | Stop service, restore backup, integrity check |
| Pipeline gagal | Jangan rebuild langsung; cek komponen gagal, jalankan metric spesifik |
| Data stale | Tampilkan warning, jalankan refetch latest, eskalasi jika gagal |
| Full rebuild gagal | Restore pre-rebuild backup, disable rebuild sementara |

---

## 9. Business Continuity Plan

### 9.1 Tujuan BCP

BCP memastikan layanan tetap memberikan nilai bisnis walaupun sebagian sistem terganggu. Untuk proyek ini, nilai bisnis utama adalah kemampuan pengguna membaca kondisi valuasi Bitcoin berdasarkan data terakhir yang valid.

### 9.2 Fungsi Bisnis Kritis

| Fungsi | Prioritas | Mode minimal saat gangguan |
|---|---:|---|
| Melihat composite oscillator | P1 | Tampilkan data terakhir dengan label timestamp |
| Melihat metric detail | P1 | Tampilkan data historis yang tersedia |
| Menjalankan refetch latest | P2 | Dijalankan manual oleh admin |
| Full rebuild | P3 | Ditunda saat incident |
| Edit threshold | P3 | Dinonaktifkan saat mode pemulihan |
| Audit statistik | P3 | Dijalankan setelah layanan utama pulih |

### 9.3 Mode Operasi Degradasi

Jika pipeline atau sumber eksternal gagal, sistem tidak harus langsung offline. Mode degradasi yang disarankan:

1. **Read-only dashboard mode**
   - Dashboard tetap menampilkan data terakhir.
   - Tombol full rebuild dinonaktifkan.
   - Banner data freshness ditampilkan.

2. **Pipeline degraded mode**
   - Component yang gagal dicatat.
   - Component lain tetap dapat diperbarui.
   - Composite dihitung dari metric yang tersedia, sesuai prinsip exclude null.

3. **Static fallback mode**
   - Jika backend down, frontend dapat menampilkan halaman statis berisi status maintenance dan snapshot composite terakhir jika tersedia.

### 9.4 Peran dan Tanggung Jawab

| Peran | Tanggung jawab |
|---|---|
| Project Owner | Menentukan prioritas pemulihan dan komunikasi |
| Cloud Operator | Menjalankan restore, redeploy, backup validation |
| Data/Pipeline Maintainer | Menganalisis kegagalan scraping dan normalisasi |
| Backend Maintainer | Menangani API, database access, auth, dan endpoint pipeline |
| Frontend Maintainer | Menangani status UI, freshness indicator, dan error state |
| Reviewer/QA | Memvalidasi data setelah recovery |

### 9.5 Prosedur Incident

Tahapan incident:

1. **Detect**
   - Health check gagal.
   - Pipeline job gagal.
   - Data freshness melewati SLA.
   - Error rate API meningkat.

2. **Triage**
   - Tentukan apakah masalah ada di frontend, backend, database, pipeline, atau upstream data source.
   - Klasifikasikan severity.

3. **Contain**
   - Disable full rebuild jika database berisiko.
   - Stop pipeline writer jika database locked atau corrupt.
   - Aktifkan read-only mode.

4. **Recover**
   - Restart service atau restore backup.
   - Jalankan smoke test.
   - Jalankan incremental pipeline jika aman.

5. **Post-incident**
   - Dokumentasikan akar masalah.
   - Tambahkan test atau monitoring yang mencegah kejadian berulang.
   - Update runbook.

### 9.6 Severity Level

| Severity | Definisi | Contoh | Target respons |
|---|---|---|---|
| SEV-1 | Layanan utama tidak tersedia atau data utama hilang | DB corrupt, API down total | 15 menit |
| SEV-2 | Layanan tersedia tetapi data tidak update atau sebagian endpoint gagal | Pipeline gagal semua metric | 1 jam |
| SEV-3 | Fitur non-kritis gagal | Audit panel kosong, threshold editor error | 1 hari |
| SEV-4 | Bug minor atau dokumentasi | Typo UI, spec mismatch minor | Backlog |

---

## 10. Rancangan Implementasi Cloud

### 10.1 Strategi Deployment: Docker Container

Proyek ini menggunakan **Docker** dan **Docker Compose** sebagai strategi containerisasi resmi. Pendekatan ini dipilih karena:

1. Portabilitas penuh antar environment (lokal, staging, produksi).
2. Isolasi dependency antara backend Node.js, frontend nginx, dan Python pipeline.
3. Konsistensi environment build dan runtime.
4. Kemudahan rollback cukup dengan mengganti image tag.
5. Kompatibel langsung dengan AWS EC2, ECS, dan managed container service lainnya.

#### Arsitektur Docker

```text
docker-compose.yml
├── quant-backend   (Node 20, Hono API, port 3300)
├── quant-frontend  (nginx, React SPA, port 3000)
├── pipeline        (Python 3.10, incremental fetch, profile: pipeline)
└── pipeline-rebuild (Python 3.10, seed + full rebuild, profile: rebuild)

Volume: quant-db → /data/metrics.db (shared antara backend dan pipeline)
```

#### Struktur Dockerfile

| File | Base image | Fungsi |
|---|---|---|
| `Dockerfile.backend` | `node:20-slim` | Multi-stage: compile `better-sqlite3` native, jalankan Hono API |
| `Dockerfile.frontend` | `node:20-slim` + `nginx:alpine` | Multi-stage: build React, serve via nginx dengan proxy `/api` ke backend |
| `Dockerfile.pipeline` | `python:3.10-slim` | Install pandas/numpy/requests, jalankan quant pipeline |

#### Perintah Operasional Docker

```bash
# Build dan jalankan backend + frontend
docker compose up -d --build

# Jalankan pipeline pertama kali (seed + full rebuild)
docker compose --profile rebuild run --rm pipeline-rebuild

# Jalankan incremental fetch
docker compose --profile pipeline run --rm pipeline

# Cek status
docker compose ps
docker compose logs backend
docker compose logs frontend

# Restart satu service
docker compose restart backend

# Stop semua
docker compose down

# Hapus volume (HATI-HATI: menghapus database)
docker compose down -v
```

#### Nginx sebagai Reverse Proxy Frontend

Frontend tidak lagi menggunakan Vite dev server di production. Nginx menangani:
1. Serve static file dari `frontend/dist/` yang dibuild saat image dibuat.
2. Proxy request `/api/*` ke container `backend:3300`.
3. SPA fallback dengan `try_files $uri /index.html` untuk client-side routing.

Konfigurasi nginx tersimpan di `nginx.conf` di root repository.

### 10.2 Deployment Minimum Viable Cloud

Tahap 1 direkomendasikan untuk kebutuhan tugas Cloud Computing:

1. Build image dengan `docker compose build`.
2. Jalankan backend dan frontend dengan `docker compose up -d`.
3. Jalankan pipeline awal dengan `docker compose --profile rebuild run --rm pipeline-rebuild`.
4. Database SQLite tersimpan di Docker named volume `quant-db` (persistent).
5. Backup volume harian ke object storage.
6. Tambahkan health check dan basic monitoring.
7. Lindungi endpoint mutasi dengan token admin.

### 10.2a Komponen Infrastruktur

| Komponen | Fungsi |
|---|---|
| Docker container: backend | Menjalankan Hono API (Node 20) |
| Docker container: frontend | Nginx serve React SPA + reverse proxy ke API |
| Docker container: pipeline | Python 3.10, scraping dan normalisasi metrik |
| Docker named volume: quant-db | Persistent storage SQLite database |
| Object storage | Backup snapshot volume harian |
| Scheduler (cron/PM2/ECS task) | Trigger container pipeline secara berkala |
| Secret manager | Menyimpan API key dan admin token |
| Monitoring | Uptime check, logs, alert |

### 10.3 Environment Variable yang Disarankan

| Variable | Fungsi |
|---|---|
| `DB_PATH` | Path SQLite database |
| `PORT` | Port backend |
| `ADMIN_TOKEN` | Proteksi endpoint mutasi/pipeline |
| `BACKUP_BUCKET` | Target object storage backup |
| `PIPELINE_TIMEOUT_SECONDS` | Timeout eksekusi pipeline |
| `LOG_LEVEL` | Level logging |
| `ALLOWED_ORIGINS` | CORS frontend yang diizinkan |

### 10.4 Hardening Endpoint

Endpoint berikut harus diproteksi:

| Endpoint | Risiko | Proteksi |
|---|---|---|
| `POST /api/pipeline/run` | Menjalankan proses berat dan mengubah data | Admin auth, rate limit, job lock |
| `POST /api/metrics/config` | Mengubah threshold | Admin auth, validation, audit log |
| `POST /api/metrics/renormalize/:metric_name` | Mengubah normalized value historis | Admin auth, backup sebelum update |

### 10.5 Observability

Metric yang perlu dipantau:

1. API uptime.
2. API latency.
3. Error rate per endpoint.
4. Durasi pipeline.
5. Status pipeline per metric.
6. Tanggal data terbaru per metric.
7. Jumlah row database.
8. Ukuran database.
9. Waktu backup terakhir.
10. Hasil restore drill terakhir.

Alert minimum:

| Alert | Kondisi |
|---|---|
| API down | `/api/health` gagal lebih dari 5 menit |
| Data stale | Latest date metrik utama tertinggal lebih dari 48 jam |
| Pipeline failed | Job keluar dengan exit code non-zero |
| Backup missing | Tidak ada backup sukses dalam 24 jam |
| DB size anomaly | Ukuran database turun drastis atau naik tidak wajar |

---

## 11. Rencana Pengujian dan Validasi

### 11.1 Automated Test Existing

Perintah validasi sesuai instruksi repo:

```bash
python -m pytest --cov
cd backend && bun test
cd frontend && bun test
```

Test yang tersedia:

| Area | Contoh file |
|---|---|
| Python base component | `quant/tests/test_base.py` |
| Data source client | `quant/tests/test_bitview_client.py` |
| BTC OHLC pipeline | `quant/tests/test_btc_ohlc.py` |
| Component registry/pipeline | `quant/tests/test_components.py` |
| Audit statistik | `quant/tests/test_composite.py`, `test_correlation.py`, `test_distribution.py` |
| Backend API | `backend/index.test.ts` |
| Frontend UI/components | `frontend/src/*.test.tsx`, `frontend/src/components/*.test.tsx` |

### 11.2 Validasi Cloud

Test tambahan yang direkomendasikan:

| Test | Tujuan |
|---|---|
| Backup restore test | Memastikan database bisa dipulihkan |
| Pipeline lock test | Mencegah dua pipeline berjalan bersamaan |
| Auth test | Memastikan endpoint mutasi tidak bisa diakses publik |
| Stale-data test | Memastikan UI menampilkan warning saat data lama |
| Load smoke test | Memastikan API tetap responsif untuk dashboard |
| Disaster simulation | Simulasi database hilang dan restore dari backup |

### 11.3 Acceptance Criteria

Sistem dianggap siap untuk demo cloud jika:

1. Frontend dapat diakses melalui URL cloud.
2. Backend `/api/health` merespons 200.
3. `/api/metrics` dan `/api/composite` mengembalikan data valid.
4. Database berada di persistent storage.
5. Backup database berhasil dibuat dan dapat direstore.
6. Endpoint pipeline dan threshold mutation tidak dapat diakses tanpa token admin.
7. Alert minimal untuk API down dan pipeline failed aktif.
8. Runbook DR tersedia dan pernah diuji minimal satu kali.

---

## 12. Gap Analysis

### 12.1 Gap Teknis

| Gap | Kondisi saat ini | Rekomendasi |
|---|---|---|
| Backup otomatis | Belum terlihat di repo | Tambahkan script backup dan scheduled job |
| Auth endpoint mutasi | Belum terlihat di `app.ts` | Tambahkan middleware admin token |
| Pipeline concurrency lock | Belum terlihat | Tambahkan lock file atau DB lock table |
| Freshness indicator | Belum jelas eksplisit | Tambahkan API latest status dan UI badge |
| Observability | Belum terstruktur | Tambahkan structured logging dan metrics |
| Deployment artifact | ✅ **Selesai** — `Dockerfile.backend`, `Dockerfile.frontend`, `Dockerfile.pipeline`, `docker-compose.yml`, `nginx.conf` sudah tersedia | — |
| Audit data | Tabel audit kosong saat analisis | Jalankan audit runner setelah pipeline |

### 12.2 Gap Dokumentasi

| Gap | Dampak | Rekomendasi |
|---|---|---|
| Spec dan implementasi composite tidak sepenuhnya selaras | Contract ambiguity | Update OpenSpec atau endpoint |
| Pengecualian `aviv_nupl` dari composite belum cukup dijelaskan | Model governance lemah | Dokumentasikan alasan statistik |
| Belum ada dokumen DR/BCP | Sulit memenuhi TASK.md | Gunakan dokumen ini sebagai baseline |
| Belum ada runbook incident | Recovery bergantung individu | Tambahkan `docs/runbook-dr.md` |

---

## 13. Roadmap Implementasi

### 13.1 Fase 1 - Cloud Readiness Dasar

Estimasi: 1 sampai 2 minggu.

1. Tambahkan Dockerfile untuk backend dan pipeline.
2. Tambahkan build command frontend.
3. Tambahkan admin auth untuk endpoint mutasi.
4. Tambahkan backup script SQLite.
5. Tambahkan restore script dan dokumentasi restore.
6. Tambahkan health check dan uptime monitoring.
7. Tambahkan freshness status endpoint.

### 13.2 Fase 2 - Disaster Recovery

Estimasi: 1 minggu.

1. Jadwalkan backup harian ke object storage.
2. Tambahkan backup pre-rebuild.
3. Tambahkan restore drill checklist.
4. Tambahkan alert backup missing.
5. Tambahkan runbook incident.
6. Uji skenario database corrupt dan restore.

### 13.3 Fase 3 - Business Continuity

Estimasi: 1 minggu.

1. Tambahkan read-only degraded mode.
2. Tambahkan data freshness banner.
3. Tambahkan pipeline status per metric.
4. Tambahkan admin-only operational panel.
5. Tambahkan SOP komunikasi incident.

### 13.4 Fase 4 - Production Hardening

Estimasi: 2 sampai 4 minggu.

1. Evaluasi migrasi SQLite ke PostgreSQL.
2. Tambahkan CI/CD.
3. Tambahkan centralized logging.
4. Tambahkan performance/load testing.
5. Tambahkan audit trail threshold changes.
6. Tambahkan role-based access untuk admin actions.

---

## 14. Pembahasan Akademik Berdasarkan TASK.md

### 14.1 Minggu 2: Topik dan Literatur

Topik yang dipilih adalah **perancangan cloud readiness, disaster recovery, dan business continuity untuk sistem analitik valuasi Bitcoin**. Sistem ini menarik karena menggabungkan data engineering, financial analytics, backend API, frontend dashboard, dan cloud operations.

Referensi konseptual yang relevan:

1. NIST SP 800-34 untuk contingency planning dan disaster recovery.
2. ISO 22301 untuk Business Continuity Management System.
3. AWS Well-Architected Reliability Pillar untuk konsep RTO, RPO, dan workload recovery.
4. Dokumentasi internal proyek untuk arsitektur dan domain valuation oscillator.

### 14.2 Minggu 3-4: Persiapan Proyek

Permasalahan utama:

1. Sistem lokal perlu dirancang agar dapat berjalan di cloud.
2. Data historis harus aman dari kehilangan atau corruption.
3. Pipeline perlu reliable walaupun sumber data eksternal tidak selalu stabil.
4. Pengguna perlu tetap dapat mengakses dashboard meskipun pipeline gagal.

Tujuan:

1. Menentukan arsitektur cloud yang sesuai.
2. Mengidentifikasi risiko.
3. Menentukan RTO/RPO.
4. Mendesain backup, restore, dan failover.
5. Membuat BCP yang operasional.

Metodologi:

1. Analisis struktur repo.
2. Analisis alur data.
3. Analisis risiko berbasis likelihood-impact.
4. Perancangan DR berbasis prioritas layanan.
5. Perancangan BCP berbasis fungsi bisnis kritis.

### 14.3 Minggu 5-7: Analisis Risiko Cloud

Risiko utama telah dirinci dalam risk register. Risiko dengan prioritas tertinggi adalah pipeline failure, stale data, database loss, dan endpoint abuse. Risiko-risiko ini berkaitan langsung dengan karakter cloud: dependensi eksternal, storage persistence, security boundary, dan operational automation.

### 14.4 Minggu 8-10: Perancangan Disaster Recovery

Strategi DR yang diusulkan:

1. Backup SQLite harian dan pre-rebuild.
2. Simpan backup di object storage.
3. Gunakan restore runbook.
4. Validasi integrity database setelah restore.
5. Recovery bertahap: database, backend, frontend, lalu pipeline.
6. Target awal RTO 4 jam dan RPO 24 jam untuk data utama.

### 14.5 Minggu 11-12: Pengembangan BCP

BCP menekankan bahwa layanan dashboard read-only harus tetap tersedia meskipun pipeline gagal. Sistem harus dapat beroperasi dengan data terakhir yang valid dan memberi label freshness yang jelas. Full rebuild dan threshold editing harus dapat dinonaktifkan saat incident untuk mengurangi risiko tambahan.

### 14.6 Minggu 13-14: Laporan dan Presentasi

Dokumen ini dapat digunakan sebagai:

1. Laporan akhir proyek.
2. Dasar makalah ilmiah.
3. Bahan slide presentasi.
4. Baseline implementasi cloud readiness.

---

## 15. Kesimpulan

`quant-btc-valuation-system` adalah proyek yang cukup matang untuk dianalisis sebagai studi kasus Cloud Computing karena memiliki pipeline data, database lokal, backend API, dan frontend dashboard. Tantangan cloud utamanya bukan pada pembuatan fitur baru, tetapi pada operasionalisasi: backup, restore, auth, monitoring, job scheduling, dan kontinuitas layanan.

Untuk memenuhi kebutuhan `TASK.md`, proyek ini dapat diposisikan sebagai sistem analitik cloud yang membutuhkan:

1. **Analisis risiko cloud** terhadap data, pipeline, API, dan frontend.
2. **Disaster recovery plan** dengan backup SQLite, restore runbook, dan target RTO/RPO.
3. **Business Continuity Plan** agar dashboard tetap bernilai saat pipeline atau sumber data eksternal terganggu.

Rekomendasi prioritas adalah:

1. Proteksi endpoint mutasi dan pipeline.
2. Backup database otomatis dan restore drill.
3. Freshness indicator di dashboard.
4. Monitoring pipeline dan API health.
5. Dokumentasi runbook DR dan BCP sebagai artifact proyek.

Dengan tambahan tersebut, proyek akan lebih siap untuk deployment cloud sekaligus memenuhi capaian pembelajaran Cloud Computing yang tercantum di `TASK.md`.

---

## 16. Referensi

### Referensi Internal

1. `TASK.md` - Rencana Pembelajaran Cloud Computing.
2. `README.md` - Deskripsi proyek, arsitektur, fitur, dan workflow.
3. `openspec/config.yaml` - Aturan otoritatif proyek dan spec-driven workflow.
4. `backend/app.ts` - Implementasi endpoint API dan schema initialization.
5. `database/db.py` - Implementasi koneksi SQLite, WAL mode, dan schema.
6. `quant/components/base.py` - Kontrak abstrak ComponentScript.
7. `quant/run_all.py` - Orkestrator pipeline.
8. `frontend/src/components/DashboardLayout.tsx` - Dashboard orchestration.

### Referensi Eksternal

1. NIST Special Publication 800-34 Rev. 1, *Contingency Planning Guide for Federal Information Systems*: https://csrc.nist.gov/publications/detail/sp/800-34/rev-1/final
2. ISO 22301 Business Continuity Management: https://www.iso.org/standard/75106.html
3. AWS Well-Architected Framework, Reliability Pillar, Disaster Recovery: https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/disaster-recovery-dr-objectives.html
