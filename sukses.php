<?php
// ============================================================
//  FILMKU — Sukses Transaksi
// ============================================================
$page_title = 'Sukses';
$active_nav = 'beranda';
require_once __DIR__ . '/config/sparql.php';

$film_id = trim($_GET['film_id'] ?? '');
$kursi   = trim($_GET['kursi']   ?? '');

if (!$film_id || !$kursi) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$film_id_safe = addslashes(preg_replace('/[^a-zA-Z0-9_\-]/', '', $film_id));

$email   = trim($_GET['email']   ?? 'didosyukur123@gmail.com');
$tanggal = trim($_GET['tanggal'] ?? 'Hari Ini');
$jam     = trim($_GET['jam']     ?? '13:00');

// Ambil info film (judul, studio)
$info_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?judul ?studio ?poster WHERE {
        f:$film_id_safe f:judul ?judul .
        OPTIONAL { f:$film_id_safe f:poster_film ?poster . }
        OPTIONAL {
            f:$film_id_safe f:menyediakan ?jadwal .
            ?jadwal f:studio ?studio .
        }
    } LIMIT 1
");

$info_row = get_bindings($info_result ?? [])[0] ?? [];
$judul    = $info_row['judul']['value']  ?? 'Film';
$poster   = $info_row['poster']['value'] ?? 'assets/images/placeholder.jpg';
$studio   = $info_row['studio']['value'] ?? 'Studio 1';

$kursi_list   = array_filter(explode(',', $kursi));
$jumlah_kursi = count($kursi_list);
$total_harga  = $jumlah_kursi * 50000;

require_once __DIR__ . '/includes/header.php';
?>

<div class="confetti-container" id="confetti"></div>

<div class="success-wrapper">
    <div class="success-checkmark-container" style="display:flex; align-items:center; justify-content:center; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 24px; position:relative;">
    <svg class="success-checkmark" viewBox="0 0 52 52" style="width: 52px; height: 52px;">
        <circle class="sc-circle" cx="26" cy="26" r="25" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round"></circle>
        <path class="sc-check" fill="none" stroke="#22c55e" stroke-width="5" stroke-linecap="round" d="M14.1 27.2l7.1 7.2 16.7-16.8"></path>
    </svg>
</div>
    <h1 class="success-title" data-splitting style="text-align: center; color: #22c55e; font-weight: 800; font-size: 2.2em; opacity: 1; opacity: 0; margin-top: 10px;">Pembayaran Berhasil!</h1>
    <div class="success-status-list" style="margin: 16px auto 32px; max-width: 440px; display: flex; flex-direction: column; gap: 12px; text-align: left; background: rgba(255,255,255,0.03); padding: 20px 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:12px;">
            <div style="background:rgba(34,197,94,0.15); padding:4px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span style="font-size: 14.5px; color:#cbd5e1; font-weight: 600;">Pembayaran berhasil</span>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
            <div style="background:rgba(34,197,94,0.15); padding:4px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span style="font-size: 14.5px; color:#cbd5e1; font-weight: 600;">Kursi telah dikunci</span>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
            <div style="background:rgba(34,197,94,0.15); padding:4px; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" style="width:14px;height:14px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span style="font-size: 14.5px; color:#cbd5e1; font-weight: 600;">E-ticket aktif dan siap dipindai di bioskop</span>
        </div>
        <div style="font-size: 13px; color:rgba(255,255,255,0.4); margin-top: 8px; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.05); text-align:center;">
            Notifikasi email terkirim ke: <strong style="color:rgba(255,255,255,0.8);"><?= htmlspecialchars($email) ?></strong>
        </div>
    </div>

    <!-- Tiket Fisik Digital -->
<div class="eticket-scene" style="perspective: 1500px; margin: 0 auto; max-width: 400px; cursor: pointer;">
    <div class="eticket-card" style="transform-style: preserve-3d; transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); position: relative; width: 100%; height: auto; min-height: 520px;">
        
        <!-- FRONT SIDE -->
        <div class="card-front" style="position: absolute; width: 100%; height: 100%; backface-visibility: hidden; background: linear-gradient(145deg, #111116 0%, #08080a 100%); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #e50914; margin-bottom: 32px; text-shadow: 0 4px 20px rgba(229,9,20,0.4);">FILMKU</div>
            <img src="<?= htmlspecialchars(get_poster_url($poster)) ?>" alt="<?= htmlspecialchars($judul) ?>" style="width: 220px; border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.8);">
            <div class="tap-hint" style="margin-top: 40px; font-size: 13px; color: rgba(255,255,255,0.4); font-weight: 600; letter-spacing: 3px; display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px; animation: bounceHint 2s infinite;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                KETUK TIKET
            </div>
        </div>

        <!-- BACK SIDE -->
        <div class="card-back" style="position: relative; width: 100%; height: 100%; backface-visibility: hidden; transform: rotateY(180deg);">
            <div class="ticket-card" style="margin: 0; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <div class="ticket-brand" style="text-align: center; letter-spacing: 4px;">FILMKU E-TICKET</div>
        <div class="ticket-poster" style="text-align: center; margin: 16px 0;">
            <img src="<?= htmlspecialchars(get_poster_url($poster)) ?>" alt="<?= htmlspecialchars($judul) ?>" style="width: 140px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        </div>
        
        <div class="ticket-grid">
            <div class="ticket-field" style="grid-column: span 2;">
                <label>Judul Film</label>
                <span style="font-size:20px;"><?= htmlspecialchars($judul) ?></span>
            </div>
            
            <div class="ticket-field">
                <label>Tanggal Tayang</label>
                <span><?= htmlspecialchars($tanggal) ?></span>
            </div>

            <div class="ticket-field">
                <label>Lokasi / Studio</label>
                <span><?= htmlspecialchars($studio) ?></span>
            </div>
            
            <div class="ticket-field">
                <label>Jam Sesi</label>
                <span style="color:var(--primary); display:flex; align-items:center; gap:6px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <?= htmlspecialchars($jam) ?>
                </span>
            </div>
            
            <div class="ticket-field" style="grid-column: span 2; margin-top:10px;">
                <label>Nomor Kursi (Seat)</label>
                <span class="ticket-seat-display"><?= htmlspecialchars($kursi) ?></span>
            </div>
        </div>

        <div class="ticket-perforation"></div>

        <div class="ticket-bottom">
            <div class="ticket-field">
                <label>Total Pembayaran</label>
                <span class="ticket-total">Rp <?= number_format($total_harga, 0, ',', '.') ?></span>
            </div>
            <div>
                <!-- Mockup QR Code -->
                <div style="width:70px; height:70px; background:white; padding:4px; border-radius:8px;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FILMKU_<?= $film_id ?>_<?= $kursi ?>" alt="QR Code" style="width:100%; height:100%;">
                </div>
            </div>
        </div>
            </div>
        </div>

    </div>
</div>

<style>
@keyframes bounceHint {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(4px); }
}
.eticket-scene.flipped .eticket-card {
    transform: rotateY(180deg);
}
</style>

<!-- Action Buttons Grid -->
    <div class="success-actions" style="margin: 32px auto; max-width: 500px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <button class="btn-action-outline" onclick="alert('Mendownload E-Ticket...')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Unduh E-ticket
        </button>
        <button class="btn-action-outline" onclick="alert('Menyimpan tiket ke Galeri...')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            Simpan ke Galeri
        </button>
        <button class="btn-action-outline" onclick="alert('Mengirim ulang E-Ticket ke <?= htmlspecialchars($email) ?>...')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            Kirim ulang Email
        </button>
        <button class="btn-action-outline" onclick="alert('Menambahkan jadwal ke Kalender...')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            Tambah ke Kalender
        </button>
    </div>

    <style>
    .btn-action-outline {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 12px;
        background: rgba(255,255,255,0.03);
        border: 1.5px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: #e2e8f0;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Outfit', sans-serif;
    }
    .btn-action-outline:hover {
        background: rgba(229,9,20,0.08);
        border-color: var(--primary);
        color: #fff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(229,9,20,0.15);
    }
    @media (max-width: 500px) {
        .success-actions { grid-template-columns: 1fr; }
    }
    </style>

    <a href="/FILMKU_PHP/index.php" class="btn-back-home cta-button-magnetic" data-magnetic="true" style="display:inline-flex; align-items:center; justify-content:center; gap:8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span class="magnetic-text">Kembali ke Beranda</span>
    </a>
</div>

<!-- Confetti Physics Library -->
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
<script src="/FILMKU_PHP/assets/js/animations/sukses-checkmark.js"></script>
<script src="/FILMKU_PHP/assets/js/animations/sukses-text-reveal.js"></script>
<script src="/FILMKU_PHP/assets/js/animations/eticket-flip.js"></script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
