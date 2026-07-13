<?php
// ============================================================
//  FILMKU - Halaman Pembayaran (Premium Redesign)
// ============================================================
$page_title = 'Pembayaran';
$active_nav = 'beranda';
require_once __DIR__ . '/config/sparql.php';

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

$info_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?judul ?studio ?poster WHERE {
        f:$film_id_safe f:judul ?judul .
        OPTIONAL { f:$film_id_safe f:poster_film ?poster . }
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

// Pricing - selaras dengan kursi.php
$harga_per_kursi     = 50000;
$biaya_layanan_tiket = 3000;

$kursi_list          = array_filter(array_map('trim', explode(',', $kursi)));
$jumlah_kursi        = count($kursi_list);
$subtotal            = $jumlah_kursi * $harga_per_kursi;
$biaya_admin         = $jumlah_kursi * $biaya_layanan_tiket;
$total_sebelum_promo = $subtotal + $biaya_admin;

// Format penayangan dari nama studio
$studio_lc     = strtolower($studio);
$format_tayang = str_contains($studio_lc, 'imax')    ? 'IMAX'
               : (str_contains($studio_lc, 'premier') ? 'Premiere' : '2D');

// Poster URL
$poster_src = $poster
    ? (str_starts_with($poster, 'http') ? $poster : 'https://image.tmdb.org/t/p/w185' . $poster)
    : '';

require_once __DIR__ . '/includes/header.php';
?>

<style>
/* FILMKU Payment Page Styles - Red Theme */
.pay-container{max-width:1100px;margin:36px auto 120px;padding:0 24px;font-family:'Outfit',sans-serif;display:grid;grid-template-columns:1fr 360px;gap:28px;align-items:start}
.pay-card{background:rgba(18,18,30,0.92);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.4);position:relative;overflow:hidden}
.pay-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--primary),rgba(229,9,20,0.3))}
.pay-card-title{font-size:15px;font-weight:800;color:#fff;margin-bottom:20px;display:flex;align-items:center;gap:8px}
.pay-card-title svg{color:var(--primary);flex-shrink:0}
.pay-methods{display:flex;flex-direction:column;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden}
.pay-method-item{display:flex;align-items:center;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.06);cursor:pointer;transition:background 0.2s;gap:14px;position:relative}
.pay-method-item:last-child{border-bottom:none}
.pay-method-item:hover{background:rgba(255,255,255,0.05)}
.pay-method-item input[type="radio"]{accent-color:var(--primary);width:17px;height:17px;flex-shrink:0;cursor:pointer}
.pay-method-item .pm-info{flex:1;min-width:0}
.pay-method-item .pm-name{font-weight:700;font-size:14px;color:#cbd5e1;display:block;margin-bottom:2px}
.pay-method-item .pm-desc{font-size:11px;color:rgba(255,255,255,0.3);font-weight:400;line-height:1.4}
.pay-method-item .pm-brand{font-size:13px;font-weight:900;font-style:italic;flex-shrink:0}
.pay-method-item.active{background:rgba(229,9,20,0.06)}
.pay-method-item.active::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--primary);border-radius:0 2px 2px 0}
.pay-method-item.active .pm-name{color:#fff}
.pay-input{width:100%;padding:13px 16px;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;color:#fff;outline:none;transition:border-color 0.2s,box-shadow 0.2s;font-family:'Outfit',sans-serif;box-sizing:border-box}
.pay-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(229,9,20,0.12)}
.pay-input::placeholder{color:rgba(255,255,255,0.2)}
.pay-input-row{display:flex;gap:10px}
.pay-promo-btn{padding:13px 20px;background:rgba(229,9,20,0.12);border:1.5px solid rgba(229,9,20,0.3);border-radius:10px;color:var(--primary);font-size:13px;font-weight:800;cursor:pointer;transition:background 0.2s;white-space:nowrap;font-family:'Outfit',sans-serif}
.pay-promo-btn:hover{background:rgba(229,9,20,0.22);border-color:var(--primary)}
.promo-feedback{font-size:12px;margin-top:8px;font-weight:600;min-height:18px}
.promo-feedback.success{color:#22c55e}
.promo-feedback.error{color:#ef4444}
/* Right Panel */
.order-summary-sticky{position:sticky;top:80px}
.order-film-header{display:flex;gap:14px;align-items:flex-start;margin-bottom:18px}
.order-poster{width:70px;min-width:70px;height:105px;border-radius:10px;object-fit:cover;box-shadow:0 6px 18px rgba(0,0,0,0.5);background:#111}
.order-film-meta{flex:1;min-width:0}
.order-film-title{font-size:16px;font-weight:800;color:#fff;line-height:1.3;margin-bottom:8px}
.order-film-tags{display:flex;flex-wrap:wrap;gap:4px}
.order-film-tag{font-size:10px;font-weight:700;padding:2px 8px;border-radius:100px;background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.5);letter-spacing:0.3px}
.order-film-tag.premiere{background:rgba(245,158,11,0.15);color:#f59e0b}
.order-film-tag.imax{background:rgba(14,165,233,0.15);color:#0ea5e9}
.order-divider{height:1px;background:rgba(255,255,255,0.07);margin:14px 0}
.order-detail-section{display:flex;flex-direction:column;gap:0;margin-bottom:4px}
.order-detail-row{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,0.04)}
.order-detail-row:last-child{border-bottom:none}
.order-detail-label{display:flex;align-items:center;gap:7px;font-size:12.5px;color:rgba(255,255,255,0.4);font-weight:600;flex-shrink:0}
.order-detail-val{font-size:13px;font-weight:700;color:rgba(255,255,255,0.85);text-align:right}
.seat-chips{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}
.seat-chip{font-size:11px;font-weight:800;padding:2px 7px;background:rgba(229,9,20,0.12);border:1px solid rgba(229,9,20,0.25);border-radius:5px;color:#ff8888}
.section-label{font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:10px}
.price-row{display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;font-size:13px;color:rgba(255,255,255,0.5);font-weight:600}
.price-row .price-val{font-weight:700;color:rgba(255,255,255,0.8)}
.price-row.discount .price-val{color:#22c55e}
.price-row.total-row{padding:12px 0 4px;border-top:1px solid rgba(255,255,255,0.1);margin-top:4px}
.price-row.total-row .price-label{font-size:13px;font-weight:700;color:rgba(255,255,255,0.7)}
.price-row.total-row .price-val{font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px}
.pay-btn{width:100%;background:var(--primary);color:#fff;border:none;padding:15px 20px;font-size:15px;font-weight:800;border-radius:12px;cursor:pointer;transition:background 0.2s,transform 0.15s,box-shadow 0.2s;margin-top:20px;font-family:'Outfit',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px}
.pay-btn:hover{background:#c0060f;transform:translateY(-1px);box-shadow:0 8px 24px rgba(229,9,20,0.4)}
.pay-btn:disabled{opacity:0.5;pointer-events:none}
.security-row{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:12px;font-size:11px;color:rgba(255,255,255,0.25);font-weight:600}
@keyframes spin{to{transform:rotate(360deg)}}
</style>

<?php $kursi_display = implode(', ', $kursi_list); ?>

<div class="pay-container">
<form action="/FILMKU_PHP/proses_transaksi.php" method="POST" id="payForm" style="display:contents;">
<input type="hidden" name="film_id" value="<?= htmlspecialchars($film_id) ?>">
<input type="hidden" name="tanggal" value="<?= htmlspecialchars($tanggal) ?>">
<input type="hidden" name="jam"     value="<?= htmlspecialchars($jam) ?>">
<input type="hidden" name="kursi"   value="<?= htmlspecialchars($kursi) ?>">
<input type="hidden" name="diskon"  id="inputDiskon" value="0">
<input type="hidden" name="total"   id="inputTotal"  value="<?= $total_sebelum_promo ?>">

<!-- LEFT PANEL -->
<div class="pay-left">
  <div class="pay-card">
    <div class="pay-card-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
      Pilih Cara Pembayaran
    </div>
    <link rel="stylesheet" href="/FILMKU_PHP/assets/css/payment-cards.css">
    <link rel="stylesheet" href="/FILMKU_PHP/assets/css/radio-pulse.css">
    <div class="payment-methods-grid">
      <label class="payment-method selected" tabindex="0" aria-label="Pilih metode pembayaran GoPay atau GoPayLater">
        <input type="radio" name="pay_method" value="GoPay" checked>
        <div class="pm-info">
          <span class="pm-name">GoPay / GoPayLater</span>
          <span class="pm-desc">Bayar via aplikasi Gojek, bisa pakai GoPayLater.</span>
        </div>
        <span class="pm-brand" style="color:#00aadd;">gopay</span>
      </label>
      <label class="payment-method" tabindex="0" aria-label="Pilih metode pembayaran OVO">
        <input type="radio" name="pay_method" value="OVO">
        <div class="pm-info">
          <span class="pm-name">OVO</span>
          <span class="pm-desc">Bayar langsung dari saldo OVO Anda.</span>
        </div>
        <span class="pm-brand" style="color:#7c3aed;">OVO</span>
      </label>
      <label class="payment-method" tabindex="0" aria-label="Pilih metode pembayaran DANA">
        <input type="radio" name="pay_method" value="DANA">
        <div class="pm-info">
          <span class="pm-name">DANA</span>
          <span class="pm-desc">Transfer instan via dompet digital DANA.</span>
        </div>
        <span class="pm-brand" style="color:#118ee9;">DANA</span>
      </label>
      <label class="payment-method" tabindex="0" aria-label="Pilih metode pembayaran LinkAja">
        <input type="radio" name="pay_method" value="LinkAja">
        <div class="pm-info">
          <span class="pm-name">LinkAja</span>
          <span class="pm-desc">Gunakan saldo LinkAja atau kartu Telkomsel.</span>
        </div>
        <span class="pm-brand" style="color:#e32322;">LinkAja</span>
      </label>
      <label class="payment-method" tabindex="0" aria-label="Pilih metode pembayaran Transfer Bank BCA">
        <input type="radio" name="pay_method" value="BCA">
        <div class="pm-info">
          <span class="pm-name">Transfer Bank BCA</span>
          <span class="pm-desc">Virtual account BCA, berlaku 1x24 jam.</span>
        </div>
        <span class="pm-brand" style="color:#1565c0;">BCA</span>
      </label>
    </div>
    </div>

    <div class="pay-card">
    <div class="pay-card-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
      Kode Promosi
    </div>
    <div class="pay-input-row">
      <input type="text" id="promoInput" class="pay-input" placeholder="Masukkan kode promo" autocomplete="off" style="text-transform:uppercase;">
      <button type="button" class="pay-promo-btn" onclick="applyPromo()">Pakai</button>
    </div>
    <div class="promo-feedback" id="promoFeedback"></div>
  </div>

  <div class="pay-card">
    <div class="pay-card-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      Email
      <span style="font-size:11px;font-weight:400;color:rgba(255,255,255,0.3);">E-ticket akan dikirim ke sini</span>
    </div>
    <input type="email" name="email" class="pay-input" placeholder="email@example.com" required>
  </div>
</div>

<!-- RIGHT PANEL -->
<div class="order-summary-sticky">
  <div class="pay-card">
    <!-- Film Header -->
    <div class="order-film-header">
      <?php if ($poster_src): ?>
      <img src="<?= htmlspecialchars($poster_src) ?>" alt="<?= htmlspecialchars($judul_film) ?>" class="order-poster" onerror="this.style.display='none'">
      <?php else: ?>
      <div class="order-poster" style="display:flex;align-items:center;justify-content:center;background:rgba(229,9,20,0.08);border:1px solid rgba(229,9,20,0.15);">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(229,9,20,0.4)" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M9 9l6 6M15 9l-6 6"/></svg>
      </div>
      <?php endif; ?>
      <div class="order-film-meta">
        <div class="order-film-title"><?= htmlspecialchars($judul_film) ?></div>
        <div class="order-film-tags">
          <span class="order-film-tag <?= strtolower($format_tayang) ?>"><?= htmlspecialchars($format_tayang) ?></span>
          <span class="order-film-tag"><?= htmlspecialchars($studio) ?></span>
        </div>
      </div>
    </div>

    <div class="order-divider"></div>

    <!-- Detail Info -->
    <div class="section-label">Ringkasan Pesanan</div>
    <div class="order-detail-section">
      <div class="order-detail-row">
        <span class="order-detail-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Tanggal
        </span>
        <span class="order-detail-val"><?= htmlspecialchars($tanggal) ?></span>
      </div>
      <div class="order-detail-row">
        <span class="order-detail-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Jam
        </span>
        <span class="order-detail-val"><?= htmlspecialchars($jam) ?></span>
      </div>
      <div class="order-detail-row">
        <span class="order-detail-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          Studio
        </span>
        <span class="order-detail-val"><?= htmlspecialchars($studio) ?></span>
      </div>
      <div class="order-detail-row">
        <span class="order-detail-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
          Format
        </span>
        <span class="order-detail-val"><?= htmlspecialchars($format_tayang) ?></span>
      </div>
      <div class="order-detail-row">
        <span class="order-detail-label" style="align-self:flex-start;margin-top:4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 9V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M9 12h12m0 0l-3-3m3 3l-3 3"/></svg>
          Kursi
        </span>
        <span class="order-detail-val">
          <div class="seat-chips">
            <?php foreach ($kursi_list as $s): ?>
            <span class="seat-chip"><?= htmlspecialchars(trim($s)) ?></span>
            <?php endforeach; ?>
          </div>
          <span style="font-size:11px;color:rgba(255,255,255,0.3);text-align:right;display:block;margin-top:4px;"><?= $jumlah_kursi ?> kursi terpilih</span>
        </span>
      </div>
    </div>

    <div class="order-divider"></div>

    <!-- Price Breakdown -->
    <div class="section-label">Rincian Harga</div>
    <div class="price-row">
      <span class="price-label">Harga kursi (<?= $jumlah_kursi ?>x)</span>
      <span class="price-val">Rp <?= number_format($harga_per_kursi, 0, ',', '.') ?> × <?= $jumlah_kursi ?></span>
    </div>
    <div class="price-row" style="justify-content:flex-end;padding-top:1px;padding-bottom:6px;">
      <span class="price-val">= Rp <?= number_format($subtotal, 0, ',', '.') ?></span>
    </div>
    <div class="price-row">
      <span class="price-label">Biaya layanan</span>
      <span class="price-val">Rp <?= number_format($biaya_admin, 0, ',', '.') ?></span>
    </div>
    <div class="price-row discount" id="promoRow" style="display:none;">
      <span class="price-label">Promo</span>
      <span class="price-val" id="promoValDisplay">-Rp 0</span>
    </div>
    <div class="price-row total-row">
      <span class="price-label">Total<br><span style="font-size:10px;font-weight:400;opacity:0.5;">inkl. PPN</span></span>
      <span class="price-val" id="totalDisplay">Rp <?= number_format($total_sebelum_promo, 0, ',', '.') ?></span>
    </div>

    <button type="submit" class="pay-btn" id="payBtn">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      Bayar Sekarang
    </button>

    <div class="security-row">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      Transaksi aman &amp; terenkripsi SSL
    </div>
  </div>
</div>

</form>
</div>

<script>
const BASE_TOTAL  = <?= $total_sebelum_promo ?>;
let activeDiskon  = 0;

function rp(n){ return 'Rp ' + n.toLocaleString('id-ID'); }

function updateTotal(diskon){
    activeDiskon = diskon;
    const total  = BASE_TOTAL - diskon;
    document.getElementById('totalDisplay').textContent = rp(total);
    document.getElementById('inputDiskon').value = diskon;
    document.getElementById('inputTotal').value  = total;
    const row = document.getElementById('promoRow');
    if(diskon > 0){
        row.style.display = '';
        document.getElementById('promoValDisplay').textContent = '-' + rp(diskon);
    } else {
        row.style.display = 'none';
    }
}

const PROMO_CODES = { 'FILMKU10': 10000, 'NONTON20': 20000, 'WEEKEND5': 5000 };

function applyPromo(){
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    const fb   = document.getElementById('promoFeedback');
    if(!code){ fb.textContent = 'Masukkan kode promo terlebih dahulu.'; fb.className = 'promo-feedback error'; return; }
    if(PROMO_CODES[code]){
        const d = PROMO_CODES[code];
        updateTotal(d);
        fb.textContent = `Kode "${code}" berhasil! Hemat ${rp(d)}`;
        fb.className   = 'promo-feedback success';
        document.getElementById('promoInput').disabled = true;
    } else {
        updateTotal(0);
        fb.textContent = `Kode "${code}" tidak valid atau kadaluarsa.`;
        fb.className   = 'promo-feedback error';
    }
}

document.getElementById('promoInput').addEventListener('keydown', e => {
    if(e.key === 'Enter'){ e.preventDefault(); applyPromo(); }
});

const pmCards = document.querySelectorAll('.payment-method');
pmCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    
    // Update visual state on radio change
    radio.addEventListener('change', () => {
        pmCards.forEach(c => c.classList.remove('selected'));
        if(radio.checked) card.classList.add('selected');
    });

    // Keyboard support (Enter/Space on the label)
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        }
    });
});

document.getElementById('payForm').addEventListener('submit', function(e){
    e.preventDefault(); // Mencegah form langsung pindah halaman
    const btn = document.getElementById('payBtn');
    btn.disabled = true;
    
    const selectedRadio = document.querySelector('input[name="pay_method"]:checked');
    const selectedMethod = selectedRadio ? selectedRadio.value : '';
    
    if (typeof showLoadingSpinner === 'function') {
        showLoadingSpinner(selectedMethod);
    }
    
    setTimeout(() => {
        this.submit();
    }, 2500);
});
</script>
<script src="/FILMKU_PHP/assets/js/animations/loading-spinner.js"></script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>



