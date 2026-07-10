<?php
// ============================================================
//  FILMKU — Halaman Pembayaran
// ============================================================
$page_title = 'Pembayaran';
$active_nav = 'beranda';
require_once __DIR__ . '/config/sparql.php';

// Bisa dari GET (dari kursi.php) atau POST (form)
$film_id = trim($_REQUEST['film_id'] ?? '');
$tanggal = trim($_REQUEST['tanggal'] ?? '');
$jam     = trim($_REQUEST['jam']     ?? '');
$kursi   = trim($_REQUEST['kursi']   ?? '');

if (!$film_id || !$tanggal || !$jam || !$kursi) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$film_id_safe = addslashes(preg_replace('/[^a-zA-Z0-9_\-]/', '', $film_id));
$tanggal_safe = addslashes($tanggal);
$jam_safe     = addslashes($jam);

// Ambil judul, studio, poster
$info_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?judul ?studio ?poster WHERE {
        f:$film_id_safe f:judul ?judul .
        OPTIONAL { f:$film_id_safe f:poster_url ?poster . }
        OPTIONAL {
            f:$film_id_safe f:menyediakan ?jadwal .
            ?jadwal f:tanggal \"\"\"$tanggal_safe\"\"\" ;
                    f:jam     \"\"\"$jam_safe\"\"\" ;
                    f:studio  ?studio .
        }
    }
");
$info_row   = get_bindings($info_result ?? [])[0] ?? [];
$judul_film = $info_row['judul']['value']  ?? 'Film';
$studio     = $info_row['studio']['value'] ?? 'Studio 1';
$poster     = $info_row['poster']['value'] ?? '';

$kursi_list   = array_filter(explode(',', $kursi));
$jumlah_kursi = count($kursi_list);
$total_harga  = $jumlah_kursi * 50000;

require_once __DIR__ . '/includes/header.php';
?>

<!-- Catchplay-style Payment CSS (Dark Theme) -->
<style>
    .cp-payment-container {
        max-width: 1100px;
        margin: 40px auto;
        display: flex;
        gap: 30px;
        font-family: 'Outfit', sans-serif;
        padding: 0 20px;
    }
    .cp-left-panel { flex: 1; }
    .cp-right-panel { width: 340px; }

    .cp-box {
        background: rgba(28, 28, 40, 0.95);
        border: 1px solid var(--border-subtle);
        border-top: 4px solid var(--primary);
        border-radius: 8px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.6);
    }
    .cp-title {
        font-size: 20px;
        font-weight: 800;
        margin-bottom: 16px;
        color: #fff;
    }
    .cp-subtitle { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #fff; }
    
    /* Payment Methods */
    .cp-payment-list {
        display: flex;
        flex-direction: column;
        gap: 0;
        border: 1px solid var(--border-subtle);
        border-radius: 6px;
        overflow: hidden;
    }
    .cp-payment-item {
        display: flex;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid var(--border-subtle);
        cursor: pointer;
        transition: background 0.2s;
        background: rgba(255,255,255,0.03);
    }
    .cp-payment-item:last-child { border-bottom: none; }
    .cp-payment-item:hover { background: rgba(255,255,255,0.08); }
    .cp-payment-item input[type="radio"] { margin-right: 14px; accent-color: #f97316; width:18px; height:18px; }
    .cp-payment-item .pm-name { flex: 1; font-weight: 600; font-size: 14px; color:#cbd5e1; }
    .cp-payment-item .pm-logo { height: 20px; object-fit: contain; }
    .cp-payment-item.active {
        background: rgba(249, 115, 22, 0.1);
        border-left: 3px solid #f97316;
    }
    .cp-payment-item.active .pm-name { color: #fff; }

    /* Input Fields */
    .cp-input-box {
        width: 100%;
        padding: 14px 16px;
        border: 1px solid var(--border-subtle);
        border-radius: 6px;
        font-size: 14px;
        outline: none;
        transition: border 0.2s;
        background: rgba(0,0,0,0.2);
        color: #fff;
    }
    .cp-input-box:focus { border-color: #f97316; }
    .cp-input-box::placeholder { color: #64748b; }
    .cp-hint { font-size: 12px; color: #64748b; margin-left: 8px; font-weight: 400; }

    /* Order Summary */
    .cp-summary-poster { width: 120px; border-radius: 6px; margin-bottom: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
    .cp-summary-title { font-size: 18px; font-weight: 800; line-height: 1.3; margin-bottom: 24px; color: #fff; }
    .cp-summary-divider { height: 1px; background: var(--border-subtle); margin: 16px 0; }
    
    .cp-summary-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px; }
    .cp-summary-row.total { font-size: 24px; font-weight: 900; color: #fff; align-items: center; margin-top: 10px;}
    .cp-summary-row.total span:first-child { font-size: 14px; font-weight: 700; color:#cbd5e1; }

    .cp-btn-purchase {
        width: 100%;
        background: #f97316; /* Catchplay orange */
        color: #fff;
        border: none;
        padding: 16px;
        font-size: 16px;
        font-weight: 800;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s;
        margin-top: 24px;
    }
    .cp-btn-purchase:hover { background: #ea580c; }
</style>

<div class="cp-payment-container">
    <form action="/FILMKU_PHP/proses_transaksi.php" method="POST" id="payForm" style="display: flex; gap: 30px; width: 100%;">
        <input type="hidden" name="film_id" value="<?= htmlspecialchars($film_id) ?>">
        <input type="hidden" name="tanggal" value="<?= htmlspecialchars($tanggal) ?>">
        <input type="hidden" name="jam"     value="<?= htmlspecialchars($jam) ?>">
        <input type="hidden" name="kursi"   value="<?= htmlspecialchars($kursi) ?>">

        <!-- Left Panel -->
        <div class="cp-left-panel">
            <div class="cp-box">
                <div class="cp-title">Pilih Cara Pembayaran</div>
                <div class="cp-payment-list">
                    <label class="cp-payment-item active">
                        <input type="radio" name="pay_method" value="GoPay" checked>
                        <div class="pm-name">
                            GoPay / GoPayLater<br>
                            <span style="font-size:11px; color:#64748b; font-weight:400;">Pembayaran via GoPayLater hanya bisa melalui aplikasi Gojek yang memiliki akun GoPayLater terdaftar.</span>
                        </div>
                        <span style="color:#00aadd; font-weight:900; font-style:italic;">gopay</span>
                    </label>
                    <label class="cp-payment-item">
                        <input type="radio" name="pay_method" value="OVO">
                        <div class="pm-name">OVO</div>
                        <span style="color:#4c2a86; font-weight:900; font-style:italic;">OVO</span>
                    </label>
                    <label class="cp-payment-item">
                        <input type="radio" name="pay_method" value="DANA">
                        <div class="pm-name">DANA</div>
                        <span style="color:#118ee9; font-weight:900; font-style:italic;">DANA</span>
                    </label>
                    <label class="cp-payment-item">
                        <input type="radio" name="pay_method" value="LinkAja">
                        <div class="pm-name">LINKAJA</div>
                        <span style="color:#e32322; font-weight:900; font-style:italic;">LinkAja</span>
                    </label>
                    <label class="cp-payment-item">
                        <input type="radio" name="pay_method" value="Telkomsel">
                        <div class="pm-name">Pulsa Telkomsel</div>
                        <span style="color:#ec2028; font-weight:900; font-style:italic;">Telkomsel</span>
                    </label>
                </div>
            </div>

            <div class="cp-box">
                <div class="cp-subtitle">Kode Promosi</div>
                <input type="text" name="promo" class="cp-input-box" placeholder="+ Kode promosi">
            </div>

            <div class="cp-box">
                <div class="cp-subtitle">Email <span class="cp-hint">Your receipts will be sent here.</span></div>
                <input type="email" name="email" class="cp-input-box" placeholder="Email" value="didosyukur123@gmail.com" required>
            </div>
        </div>

        <!-- Right Panel (Order Summary) -->
        <div class="cp-right-panel">
            <div class="cp-box" style="background:transparent; box-shadow:none; padding:0; border:none;">
                <div class="cp-summary-title" style="margin-top:10px;"><?= htmlspecialchars($judul_film) ?> (<?= htmlspecialchars($studio) ?>)</div>
                
                <div style="font-size: 13px; font-weight: 700; color: #cbd5e1; margin-bottom: 12px; letter-spacing: 1px; text-transform: uppercase;">Order Summary</div>
                <div class="cp-summary-divider" style="margin-top:0;"></div>
                
                <div class="cp-summary-row">
                    <span style="text-transform:uppercase; max-width:60%;"><?= htmlspecialchars($kursi) ?> (<?= $jumlah_kursi ?> KURSI)</span>
                    <span>Rp <?= number_format($total_harga, 0, ',', '.') ?></span>
                </div>
                
                <div class="cp-summary-divider"></div>
                
                <div class="cp-summary-row total">
                    <span>Total<br><span style="font-size:11px; font-weight:400;">(Termasuk PPN)</span></span>
                    <span>Rp <?= number_format($total_harga, 0, ',', '.') ?></span>
                </div>

                <button type="submit" class="cp-btn-purchase" id="payBtn">Purchase</button>
            </div>
        </div>
    </form>
</div>

<script>
// Radio button styling toggle
document.querySelectorAll('.cp-payment-item input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', function() {
        document.querySelectorAll('.cp-payment-item').forEach(item => item.classList.remove('active'));
        if(this.checked) this.closest('.cp-payment-item').classList.add('active');
    });
});

document.getElementById('payForm').addEventListener('submit', function() {
    const btn = document.getElementById('payBtn');
    btn.textContent = 'Processing...';
    btn.disabled = true;
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
