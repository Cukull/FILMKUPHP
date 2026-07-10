<?php
// ============================================================
//  FILMKU — Pilih Kursi
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

// Query judul film
$film_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?judul WHERE { f:$film_id_safe f:judul ?judul . }
");
$judul_film = get_bindings($film_result ?? [])[0]['judul']['value'] ?? 'Film';

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

// Mock random terisi jika SPARQL kosong (untuk demo)
if (empty($kursi_terisi)) {
    $all_seats = [];
    foreach (['A', 'B', 'C', 'D'] as $r) {
        for ($i=1; $i<=10; $i++) $all_seats[] = $r.$i;
    }
    shuffle($all_seats);
    $kursi_terisi = array_slice($all_seats, 0, rand(4, 12)); // 4-12 kursi acak terisi
}

require_once __DIR__ . '/includes/header.php';
?>

<div class="kursi-wrapper">
    <div class="kursi-header">
        <h1 class="kursi-title" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:28px;height:28px;"><path d="M4 18v3"></path><path d="M20 18v3"></path><path d="M12 18v3"></path><path d="M4 14h16"></path><path d="M6 14V6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v8"></path></svg>
            Pilih Tempat Duduk
        </h1>
        <p class="kursi-sub">
            <strong style="color:var(--text-primary)"><?= htmlspecialchars($judul_film) ?></strong>
            &nbsp;·&nbsp; <?= htmlspecialchars($tanggal) ?>
            &nbsp;·&nbsp; <span style="color:var(--primary); font-weight:700;"><?= htmlspecialchars($jam) ?></span>
        </p>
    </div>

    <!-- Tambahan CSS untuk kursi biru -->
    <style>
        .seat.occupied {
            background: #2563eb !important; /* Biru terang modern */
            border-color: #2563eb !important;
            color: #fff !important;
            cursor: not-allowed !important;
            opacity: 0.9 !important;
        }
    </style>

    <!-- Layar Bioskop -->
    <div class="screen-wrapper">
        <div class="cinema-screen"></div>
        <p class="screen-label">LAYAR BIOSKOP</p>
    </div>

    <!-- Denah Kursi -->
    <div class="theater-map">
        <?php foreach (['A', 'B', 'C', 'D'] as $baris): ?>
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
                <div class="seat available" data-no="<?= $no ?>" onclick="toggleSeat(this)" title="Kursi <?= $no ?>"><?= $no ?></div>
                <?php endif; ?>
                <?php endfor; ?>
            </div>

            <!-- Label Baris -->
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
                <div class="seat available" data-no="<?= $no ?>" onclick="toggleSeat(this)" title="Kursi <?= $no ?>"><?= $no ?></div>
                <?php endif; ?>
                <?php endfor; ?>
            </div>
        </div>
        <?php endforeach; ?>
    </div>

    <!-- Legend -->
    <div class="legend-row">
        <div class="legend-item">
            <div class="legend-box" style="background:rgba(255,255,255,0.05); border:1.5px solid rgba(255,255,255,0.12);"></div>
            Tersedia
        </div>
        <div class="legend-item">
            <div class="legend-box" style="background:var(--primary);"></div>
            Terpilih
        </div>
        <div class="legend-item">
            <div class="legend-box" style="background:#2563eb;"></div>
            Terisi
        </div>
    </div>

    <!-- Booking Summary Bar -->
    <div class="booking-summary-bar">
        <div class="selected-info">
            <div class="selected-label">KURSI DIPILIH</div>
            <div class="selected-seats" id="selectedText">Belum ada kursi dipilih</div>
        </div>
        <div style="text-align:right;">
            <div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">TOTAL</div>
            <div id="totalHarga" style="font-size:20px; font-weight:900; color:var(--yellow); margin-bottom:10px;">Rp 0</div>
        </div>
        <button
            class="btn-checkout"
            id="btnCheckout"
            onclick="goCheckout()"
            disabled
        >
            Lanjut Bayar
        </button>
    </div>
</div>

<script>
let selected = [];
const FILM_ID = '<?= htmlspecialchars($film_id) ?>';
const TANGGAL = '<?= htmlspecialchars($tanggal) ?>';
const JAM     = '<?= htmlspecialchars($jam) ?>';
const HARGA   = 50000;

function toggleSeat(el) {
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
}

function updateSummary() {
    const total = selected.length * HARGA;
    document.getElementById('selectedText').textContent =
        selected.length ? selected.join(', ') : 'Belum ada kursi dipilih';
    document.getElementById('totalHarga').textContent =
        'Rp ' + total.toLocaleString('id-ID');

    const btn = document.getElementById('btnCheckout');
    btn.disabled = selected.length === 0;
}

function goCheckout() {
    if (!selected.length) return;
    const params = new URLSearchParams({
        film_id: FILM_ID,
        tanggal: TANGGAL,
        jam:     JAM,
        kursi:   selected.join(',')
    });
    window.location.href = '/FILMKU_PHP/bayar.php?' + params.toString();
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
