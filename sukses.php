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
    SELECT ?judul ?studio WHERE {
        f:$film_id_safe f:judul ?judul .
        OPTIONAL {
            f:$film_id_safe f:menyediakan ?jadwal .
            ?jadwal f:studio ?studio .
        }
    } LIMIT 1
");

$info_row = get_bindings($info_result ?? [])[0] ?? [];
$judul    = $info_row['judul']['value']  ?? 'Film';
$studio   = $info_row['studio']['value'] ?? 'Studio 1';

$kursi_list   = array_filter(explode(',', $kursi));
$jumlah_kursi = count($kursi_list);
$total_harga  = $jumlah_kursi * 50000;

require_once __DIR__ . '/includes/header.php';
?>

<div class="confetti-container" id="confetti"></div>

<div class="success-wrapper">
    <div class="success-icon" style="background:var(--primary); display:flex; align-items:center; justify-content:center; color:#fff; border:none; box-shadow:0 0 20px rgba(229,9,20,0.5); width: 64px; height: 64px; border-radius: 50%; margin: 0 auto 20px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:32px;height:32px;"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
    <h1 class="success-title" style="text-align: center;">Pembayaran Berhasil!</h1>
    <p class="success-sub" style="text-align: center;">
        Kursi Anda telah berhasil dikunci di database Semantic Web.<br>
        <strong style="color:var(--primary);">E-Ticket dummy telah dikirimkan ke email:<br><?= htmlspecialchars($email) ?></strong>
    </p>

    <!-- Tiket Fisik Digital -->
    <div class="ticket-card" style="margin: 0 auto;">
        <div class="ticket-brand" style="text-align: center; letter-spacing: 4px;">FILMKU E-TICKET</div>
        
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

    <a href="/FILMKU_PHP/index.php" class="btn-back-home" style="display:flex; align-items:center; justify-content:center; gap:8px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        Kembali ke Beranda
    </a>
</div>

<script>
// Generate Confetti
function createConfetti() {
    const colors = ['#e50914', '#10b981', '#f59e0b', '#3b82f6', '#ffffff'];
    const container = document.getElementById('confetti');
    
    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        
        // Random properties
        const bg = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100 + 'vw';
        const animDuration = Math.random() * 3 + 2 + 's';
        const delay = Math.random() * 2 + 's';
        
        piece.style.backgroundColor = bg;
        piece.style.left = left;
        piece.style.animationDuration = animDuration;
        piece.style.animationDelay = delay;
        
        container.appendChild(piece);
    }
}

window.addEventListener('load', createConfetti);
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
