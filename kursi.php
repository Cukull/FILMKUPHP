<?php
// ============================================================
//  FILMKU — Pilih Kursi (dengan Mini Summary Sticky)
// ============================================================
$page_title = 'Pilih Kursi';
$active_nav = 'beranda';
require_once __DIR__ . '/config/sparql.php';

$film_id = trim($_GET['film']    ?? '');
$tanggal = trim($_GET['tanggal'] ?? '');
$jam     = trim($_GET['jam']     ?? '');

if (!$film_id || !$tanggal || !$jam) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$film_id_safe = addslashes(preg_replace('/[^a-zA-Z0-9_\-]/', '', $film_id));
$tanggal_safe = addslashes($tanggal);
$jam_safe     = addslashes($jam);

// Query detail film (judul, poster, durasi, genre, studio dari jadwal)
$film_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?judul ?poster ?durasi ?genre ?studio WHERE {
        f:$film_id_safe f:judul ?judul .
        OPTIONAL { f:$film_id_safe f:poster_film ?poster . }
        OPTIONAL { f:$film_id_safe f:durasi      ?durasi . }
        OPTIONAL { f:$film_id_safe f:genre       ?genre  . }
        OPTIONAL {
            f:$film_id_safe f:menyediakan ?jadwal .
            ?jadwal f:tanggal \"\"\"$tanggal_safe\"\"\" ;
                    f:jam     \"\"\"$jam_safe\"\"\" .
            OPTIONAL { ?jadwal f:studio ?studio . }
        }
    } LIMIT 1
");
$film_row   = get_bindings($film_result ?? [])[0] ?? [];
$judul_film = $film_row['judul']['value']  ?? 'Film';
$poster_url = $film_row['poster']['value'] ?? '';
$durasi_val = $film_row['durasi']['value'] ?? '';
$genre_val  = $film_row['genre']['value']  ?? '';
$studio_val = $film_row['studio']['value'] ?? 'Studio 1';

// Query kursi yang sudah terisi
$kursi_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?no_kursi WHERE {
        f:$film_id_safe f:menyediakan ?jadwal .
        ?jadwal f:tanggal \"\"\"$tanggal_safe\"\"\" ;
                f:jam     \"\"\"$jam_safe\"\"\" ;
                f:memiliki ?kursi .
        ?kursi f:nomor_kursi ?no_kursi ;
               f:status \"Terisi\" .
    }
");
$kursi_terisi = array_map(
    fn($r) => $r['no_kursi']['value'],
    get_bindings($kursi_result ?? [])
);

// Mock kursi terisi untuk demo
if (empty($kursi_terisi)) {
    $all_seats = [];
    foreach (['A','B','C','D'] as $r)
        for ($i = 1; $i <= 10; $i++) $all_seats[] = $r . $i;
    shuffle($all_seats);
    $kursi_terisi = array_slice($all_seats, 0, rand(4, 12));
}

require_once __DIR__ . '/includes/header.php';
?>

<!-- ═══════════════════════════════════════════════════════
     CSS Halaman Kursi + Mini Summary Sticky
     ═══════════════════════════════════════════════════════ -->
<style>
/* Layout utama: denah + summary sidebar */
.kursi-page-layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 32px;
    max-width: 1320px;
    margin: 0 auto;
    padding: 32px 24px 120px;
    align-items: start;
}

/* ── Kolom Kiri: Denah Kursi ── */
.kursi-main { min-width: 0; }

.kursi-header { text-align: center; margin-bottom: 36px; }
.kursi-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 10px;
}
.kursi-sub {
    font-size: 14px;
    color: var(--text-muted);
    margin: 0;
}

/* Layar bioskop */
.screen-wrapper  { text-align: center; margin-bottom: 28px; }
.cinema-screen   {
    width: 80%; max-width: 580px;
    height: 10px;
    margin: 0 auto 8px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
    border-radius: 4px;
    box-shadow: 0 0 32px rgba(255,255,255,0.22), 0 0 8px rgba(255,255,255,0.12);
}
.screen-label {
    font-size: 11px;
    letter-spacing: 4px;
    color: rgba(255,255,255,0.3);
    margin: 0;
}

/* Denah kursi */
.theater-map    { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
.seat-row       { display: flex; align-items: center; justify-content: center; gap: 6px; }
.seat-block     { display: flex; gap: 8px; }
.row-label      {
    width: 28px; text-align: center;
    font-size: 13px; font-weight: 700;
    color: rgba(255,255,255,0.28);
}

/* Kursi individual */
.seat {
    width: 52px; height: 52px;
    border-radius: 8px 8px 5px 5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
    position: relative;
    user-select: none;
    letter-spacing: 0.2px;
}
.seat::before {
    content: '';
    position: absolute;
    top: -4px; left: 5px; right: 5px;
    height: 4px;
    border-radius: 2px 2px 0 0;
    background: inherit;
    filter: brightness(1.3);
}

.seat.available {
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.5);
}
.seat.available:hover {
    background: rgba(229,9,20,0.25);
    border-color: var(--primary);
    color: #fff;
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 4px 14px rgba(229,9,20,0.3);
}
.seat.selected {
    background: var(--primary);
    border: 1.5px solid #ff4444;
    color: #fff;
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 4px 16px rgba(229,9,20,0.5);
    animation: seatPop 0.25s ease;
}
.seat.occupied {
    background: #1e3a7a !important;
    border: 1.5px solid #2563eb !important;
    color: rgba(255,255,255,0.5) !important;
    cursor: not-allowed !important;
    transform: none !important;
}

@keyframes seatPop {
    0%  { transform: scale(1); }
    50% { transform: translateY(-3px) scale(1.15); }
    100%{ transform: translateY(-2px) scale(1.08); }
}

/* Legend */
.legend-row {
    display: flex; justify-content: center; gap: 28px;
    margin-bottom: 20px;
}
.legend-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--text-muted);
}
.legend-box {
    width: 20px; height: 20px;
    border-radius: 5px;
}

/* Bottom bar (<span class="magnetic-text">Lanjut Bayar</span>) */
.booking-bar {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px 24px;
    background: rgba(10,10,16,0.92);
    backdrop-filter: blur(18px);
    border-top: 1px solid rgba(255,255,255,0.07);
}
.btn-checkout {
    padding: 13px 48px;
    background: var(--primary);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
    letter-spacing: 0.3px;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    display: flex; align-items: center; gap: 8px;
}
.btn-checkout:disabled {
    opacity: 0.38;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
}
.btn-checkout:not(:disabled):hover {
    background: #c0060f;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(229,9,20,0.45);
}

/* ══════════════════════════════════════════════════════════
   MINI SUMMARY STICKY — Kolom Kanan
   ══════════════════════════════════════════════════════════ */
.summary-sticky {
    position: sticky;
    top: 90px;                  /* Di bawah navbar */
    background: rgba(18,18,28,0.82);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 18px;
    overflow: hidden;
    box-shadow:
        0 24px 60px rgba(0,0,0,0.5),
        0 0 0 1px rgba(255,255,255,0.04) inset;
}

/* Header summary: poster + judul */
.summary-hero {
    position: relative;
    height: 140px;
    overflow: hidden;
}
.summary-hero-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
}
.summary-hero-fallback {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, #1a0505, #3d0a0a, #8B0000);
    display: flex; align-items: center; justify-content: center;
}
.summary-hero-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(18,18,28,1) 0%, rgba(18,18,28,0.3) 60%, transparent 100%);
}
.summary-hero-title {
    position: absolute;
    bottom: 12px; left: 16px; right: 16px;
    font-size: 15px;
    font-weight: 800;
    color: #fff;
    line-height: 1.3;
    text-shadow: 0 2px 8px rgba(0,0,0,0.8);
}

/* Body summary */
.summary-body { padding: 16px; }

/* Info rows: Tanggal, Jam, Studio */
.summary-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
}
.summary-info-item {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 10px 12px;
}
.summary-info-item.full { grid-column: 1 / -1; }
.summary-info-label {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 4px;
    display: flex; align-items: center; gap: 5px;
}
.summary-info-value {
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
}

/* Divider */
.summary-divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 14px 0;
}

/* Kursi terpilih */
.summary-seats-label {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 8px;
    display: flex; align-items: center; gap: 5px;
}
.summary-seats-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 32px;
    margin-bottom: 4px;
}
.seat-chip {
    padding: 4px 10px;
    background: rgba(229,9,20,0.15);
    border: 1px solid rgba(229,9,20,0.4);
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    color: #ff6666;
    animation: chipIn 0.2s ease;
}
@keyframes chipIn {
    from { transform: scale(0.7); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
}
.summary-seats-empty {
    font-size: 12px;
    color: rgba(255,255,255,0.2);
    font-style: italic;
}

/* Rincian harga */
.summary-price-rows { margin-bottom: 14px; }
.summary-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    font-size: 12.5px;
}
.summary-price-row .label { color: rgba(255,255,255,0.45); }
.summary-price-row .value { color: rgba(255,255,255,0.85); font-weight: 600; }
.summary-price-row.total-row {
    border-top: 1px solid rgba(255,255,255,0.08);
    margin-top: 6px;
    padding-top: 12px;
}
.summary-price-row.total-row .label {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
}
.summary-price-row.total-row .value {
    font-size: 20px;
    font-weight: 900;
    color: #ffc107;
    transition: color 0.3s;
}

/* Flash animation saat nilai berubah */
@keyframes flashUpdate {
    0%   { color: #fff; transform: scale(1.06); }
    100% { color: #ffc107; transform: scale(1); }
}
.total-value.updated {
    animation: flashUpdate 0.4s ease forwards;
}

/* Responsive: di bawah 900px, sidebar menjadi bottom sheet */
@media (max-width: 900px) {
    .kursi-page-layout {
        grid-template-columns: 1fr;
    }
    .summary-sticky {
        position: fixed;
        bottom: 70px; left: 12px; right: 12px;
        top: auto;
        border-radius: 16px;
        max-height: 50vh;
        overflow-y: auto;
        z-index: 99;
        transform: translateY(calc(100% - 64px));
        transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
    }
    .summary-sticky.expanded {
        transform: translateY(0);
    }
    .summary-hero { height: 80px; }
    .summary-toggle-btn {
        display: flex;
    }
}
@media (min-width: 901px) {
    .summary-toggle-btn { display: none; }
}
.summary-toggle-btn {
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    color: rgba(255,255,255,0.6);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px;
}
</style>

<?php
// Format tanggal Indonesia
$bulan_id = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'];
$tgl_parts = explode('-', $tanggal);
$tanggal_fmt = count($tgl_parts) === 3
    ? $tgl_parts[2] . ' ' . ($bulan_id[(int)$tgl_parts[1]] ?? '') . ' ' . $tgl_parts[0]
    : $tanggal;

// Biaya layanan
$biaya_layanan = 3000; // Rp 3.000 per tiket
$harga_per_kursi = 50000;
?>

<!-- ═══════════════════════════════════════════
     LAYOUT: Denah Kursi (kiri) + Summary (kanan)
     ═══════════════════════════════════════════ -->
<div class="kursi-page-layout">

    <!-- ── KOLOM KIRI: Denah ── -->
    <div class="kursi-main">
        <div class="kursi-header">
            <h1 class="kursi-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     style="width:32px;height:32px;" aria-hidden="true">
                    <path d="M4 18v3"/><path d="M20 18v3"/><path d="M12 18v3"/>
                    <path d="M4 14h16"/>
                    <path d="M6 14V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v8"/>
                </svg>
                Pilih Tempat Duduk
            </h1>
            <p class="kursi-sub">
                <strong style="color:var(--text-primary)"><?= htmlspecialchars($judul_film) ?></strong>
                &nbsp;·&nbsp; <?= htmlspecialchars($tanggal_fmt) ?>
                &nbsp;·&nbsp; <span style="color:var(--primary);font-weight:700"><?= htmlspecialchars($jam) ?></span>
            </p>
        </div>

        <!-- Layar bioskop -->
        <div class="screen-wrapper">
            <div class="cinema-screen"></div>
            <p class="screen-label">LAYAR BIOSKOP</p>
        </div>

        <!-- Denah kursi -->
        <div class="theater-map">
            <?php foreach (['A','B','C','D'] as $baris): ?>
            <div class="seat-row">
                <!-- Blok Kiri (1-5) -->
                <div class="seat-block" style="margin-right:8px;">
                    <?php for ($n = 1; $n <= 5; $n++):
                        $no = $baris . $n;
                        $occupied = in_array($no, $kursi_terisi);
                    ?>
                    <?php if ($occupied): ?>
                    <div class="seat occupied" title="Kursi <?= $no ?> — Terisi"><?= $no ?></div>
                    <?php else: ?>
                    <div class="seat available" data-no="<?= $no ?>"
                         onclick="toggleSeat(this)" title="Kursi <?= $no ?>"><?= $no ?></div>
                    <?php endif; ?>
                    <?php endfor; ?>
                </div>

                <div class="row-label"><?= $baris ?></div>

                <!-- Blok Kanan (6-10) -->
                <div class="seat-block" style="margin-left:8px;">
                    <?php for ($n = 6; $n <= 10; $n++):
                        $no = $baris . $n;
                        $occupied = in_array($no, $kursi_terisi);
                    ?>
                    <?php if ($occupied): ?>
                    <div class="seat occupied" title="Kursi <?= $no ?> — Terisi"><?= $no ?></div>
                    <?php else: ?>
                    <div class="seat available" data-no="<?= $no ?>"
                         onclick="toggleSeat(this)" title="Kursi <?= $no ?>"><?= $no ?></div>
                    <?php endif; ?>
                    <?php endfor; ?>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <!-- Legend -->
        <div class="legend-row">
            <div class="legend-item">
                <div class="legend-box" style="background:rgba(255,255,255,0.06);border:1.5px solid rgba(255,255,255,0.12);"></div>
                Tersedia
            </div>
            <div class="legend-item">
                <div class="legend-box" style="background:var(--primary);"></div>
                Terpilih
            </div>
            <div class="legend-item">
                <div class="legend-box" style="background:#1e3a7a;border:1.5px solid #2563eb;"></div>
                Terisi
            </div>
        </div>
    </div><!-- /kursi-main -->


    <!-- ══════════════════════════════════════════════════════
         MINI SUMMARY STICKY — Kolom Kanan
         ══════════════════════════════════════════════════════ -->
    <aside class="summary-sticky" id="summarySidebar" aria-label="Ringkasan Pemesanan">

        <!-- Toggle button (mobile only) -->
        <button class="summary-toggle-btn" id="summaryToggle" aria-expanded="false">
            <span style="display:flex;align-items:center;gap:6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
                Ringkasan Pesanan
            </span>
            <svg id="toggleIcon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transition:transform 0.3s;">
                <path d="M18 15l-6-6-6 6"/>
            </svg>
        </button>

        <!-- Hero: poster film -->
        <div class="summary-hero">
            <?php if ($poster_url): ?>
            <img src="<?= htmlspecialchars($poster_url) ?>"
                 alt="<?= htmlspecialchars($judul_film) ?>"
                 class="summary-hero-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="summary-hero-fallback" style="display:none;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                    <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>
                </svg>
            </div>
            <?php else: ?>
            <div class="summary-hero-fallback">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="2.18"/>
                    <path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>
                </svg>
            </div>
            <?php endif; ?>
            <div class="summary-hero-overlay"></div>
            <div class="summary-hero-title"><?= htmlspecialchars($judul_film) ?></div>
        </div>

        <!-- Body summary -->
        <div class="summary-body">

            <!-- Info grid: Tanggal, Jam, Studio -->
            <div class="summary-info-grid">
                <div class="summary-info-item">
                    <div class="summary-info-label">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
                        </svg>
                        Tanggal
                    </div>
                    <div class="summary-info-value"><?= htmlspecialchars($tanggal_fmt) ?></div>
                </div>

                <div class="summary-info-item">
                    <div class="summary-info-label">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                        </svg>
                        Jam Tayang
                    </div>
                    <div class="summary-info-value" style="color:var(--primary)"><?= htmlspecialchars($jam) ?></div>
                </div>

                <div class="summary-info-item full">
                    <div class="summary-info-label">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        Studio
                    </div>
                    <div class="summary-info-value"><?= htmlspecialchars($studio_val) ?></div>
                </div>
            </div>

            <div class="summary-divider"></div>

            <!-- Kursi terpilih (live update) -->
            <div class="summary-seats-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M4 18v3M20 18v3M12 18v3M4 14h16M6 14V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v8"/>
                </svg>
                Kursi Terpilih
                (<span id="seatCount">0</span>)
            </div>
            <div class="summary-seats-chips" id="seatChips">
                <span class="summary-seats-empty" id="emptyMsg">Belum ada kursi dipilih</span>
            </div>

            <div class="summary-divider"></div>

            <!-- Rincian Harga -->
            <div class="summary-price-rows">
                <div class="summary-price-row">
                    <span class="label">Harga / kursi</span>
                    <span class="value">Rp <?= number_format($harga_per_kursi, 0, ',', '.') ?></span>
                </div>
                <div class="summary-price-row">
                    <span class="label">Jumlah kursi</span>
                    <span class="value" id="jumlahKursiRow">0 kursi</span>
                </div>
                <div class="summary-price-row">
                    <span class="label">Subtotal tiket</span>
                    <span class="value" id="subtotalRow">Rp 0</span>
                </div>
                <div class="summary-price-row">
                    <span class="label">
                        Biaya layanan
                        <span style="font-size:10px; color:rgba(255,255,255,0.25);">
                            (Rp <?= number_format($biaya_layanan, 0, ',', '.') ?>/tiket)
                        </span>
                    </span>
                    <span class="value" id="biayaLayananRow">Rp 0</span>
                </div>

                <div class="summary-price-row total-row">
                    <span class="label">Total Pembayaran</span>
                    <span class="value" id="totalHargaNew">Rp 0</span>
                </div>
            </div>

        </div><!-- /summary-body -->
    </aside><!-- /summary-sticky -->

</div><!-- /kursi-page-layout -->

<!-- Bottom bar: tombol <span class="magnetic-text">Lanjut Bayar</span> -->
<div class="booking-bar">
    <button class="btn-checkout cta-button-magnetic" data-magnetic="true" id="btnCheckout" onclick="goCheckout()" disabled>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
        <span class="magnetic-text">Lanjut Bayar</span>
    </button>
</div>


<!-- ═══════════════════════════════════════════════════════
     JavaScript: Seat Toggle + Live Summary Update
     ═══════════════════════════════════════════════════════ -->
<script>
(function () {
    'use strict';

    // ── Data dari PHP ──────────────────────────────────────
    const FILM_ID      = '<?= htmlspecialchars($film_id) ?>';
    const TANGGAL      = '<?= htmlspecialchars($tanggal) ?>';
    const JAM          = '<?= htmlspecialchars($jam) ?>';
    const HARGA        = <?= $harga_per_kursi ?>;      // Per kursi
    const BIAYA_LAYANAN= <?= $biaya_layanan ?>;        // Per kursi

    // ── State ──────────────────────────────────────────────
    let selected = [];

    // ── Referensi DOM ──────────────────────────────────────
    const elSeatCount   = document.getElementById('seatCount');
    const elSeatChips   = document.getElementById('seatChips');
    const elEmptyMsg    = document.getElementById('emptyMsg');
    const elJumlah      = document.getElementById('jumlahKursiRow');
    const elSubtotal    = document.getElementById('subtotalRow');
    const elBiaya       = document.getElementById('biayaLayananRow');
    const elTotal       = document.getElementById('totalHargaNew');
    const elBtn         = document.getElementById('btnCheckout');

    // ── Format rupiah ──────────────────────────────────────
    function rp(n) {
        return 'Rp ' + n.toLocaleString('id-ID');
    }

    // ── Toggle kursi ───────────────────────────────────────
    window.toggleSeat = function (el) {
        const no = el.dataset.no;
        if (el.classList.contains('selected')) {
            el.classList.remove('selected');
            el.classList.add('available');
            selected = selected.filter(s => s !== no);
        } else {
            el.classList.add('selected');
            el.classList.remove('available');
            selected.push(no);
        }
        updateSummary();
    };

    // ── Update seluruh summary (live) ─────────────────────
    function updateSummary() {
        const n          = selected.length;
        const subtotal   = n * HARGA;
        const biaya      = n * BIAYA_LAYANAN;
        const total      = subtotal + biaya;

        // Hitung
        elSeatCount.textContent = n;
        elJumlah.textContent    = n + ' kursi';
        elSubtotal.textContent  = rp(subtotal);
        elBiaya.textContent     = rp(biaya);

        // Total: animasi flash saat nilai berubah
        const prevTotal = elTotal.textContent;
        const newTotal  = rp(total);
        if (prevTotal !== newTotal) {
            elTotal.classList.remove('updated');
            void elTotal.offsetWidth; // force reflow
            elTotal.classList.add('updated');
        }
        elTotal.textContent = newTotal;

        // Chips kursi terpilih
        renderChips();

        // Tombol checkout
        elBtn.disabled = n === 0;
    }

    // ── Render chip kursi terpilih ─────────────────────────
    function renderChips() {
        // Hapus semua chip lama (bukan empty msg)
        elSeatChips.querySelectorAll('.seat-chip').forEach(c => c.remove());

        if (selected.length === 0) {
            if (elEmptyMsg) elEmptyMsg.style.display = '';
        } else {
            if (elEmptyMsg) elEmptyMsg.style.display = 'none';
            selected.forEach(no => {
                const chip = document.createElement('span');
                chip.className = 'seat-chip';
                chip.textContent = no;
                elSeatChips.appendChild(chip);
            });
        }
    }

    // ── Checkout ───────────────────────────────────────────
    window.goCheckout = function () {
        if (!selected.length) return;
        const params = new URLSearchParams({
            film_id: FILM_ID,
            tanggal: TANGGAL,
            jam:     JAM,
            kursi:   selected.join(',')
        });
        window.location.href = '/FILMKU_PHP/bayar.php?' + params.toString();
    };

    // ── Mobile: toggle expand summary sidebar ──────────────
    const sidebar = document.getElementById('summarySidebar');
    const toggleBtn = document.getElementById('summaryToggle');
    const toggleIcon = document.getElementById('toggleIcon');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            const expanded = sidebar.classList.toggle('expanded');
            this.setAttribute('aria-expanded', expanded);
            toggleIcon.style.transform = expanded ? 'rotate(180deg)' : '';
        });
    }

    // Init tampilan summary
    updateSummary();

})();
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
