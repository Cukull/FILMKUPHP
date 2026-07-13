<?php
// ============================================================
//  FILMKU - Halaman Checkout Snack-Ku (F&B)
// ============================================================
$page_title = 'Pembayaran Snack-Ku';
$active_nav = 'cafe';
require_once __DIR__ . '/config/sparql.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_POST['cart_data'])) {
    header('Location: /FILMKU_PHP/cafe.php');
    exit;
}

$cart_data = json_decode($_POST['cart_data'], true);

if (!is_array($cart_data) || count($cart_data) === 0) {
    header('Location: /FILMKU_PHP/cafe.php');
    exit;
}

$total_sebelum_promo = 0;
foreach ($cart_data as $item) {
    $total_sebelum_promo += ($item['harga'] * $item['qty']);
}

require_once __DIR__ . '/includes/header.php';
?>

<style>
/* FILMKU Payment Page Styles - Red Theme */
.pay-container{max-width:1100px;margin:36px auto 120px;padding:0 24px;font-family:'Outfit',sans-serif;display:grid;grid-template-columns:1fr 360px;gap:28px;align-items:start}
.pay-card{background:rgba(18,18,30,0.92);border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:24px;margin-bottom:20px;box-shadow:0 8px 32px rgba(0,0,0,0.4);position:relative;overflow:hidden}
.pay-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--primary),rgba(229,9,20,0.3))}
.pay-card-title{font-size:15px;font-weight:800;color:#fff;margin-bottom:20px;display:flex;align-items:center;gap:8px}
.pay-card-title svg{color:var(--primary);flex-shrink:0}
.pay-input{width:100%;padding:13px 16px;background:rgba(255,255,255,0.04);border:1.5px solid rgba(255,255,255,0.08);border-radius:10px;font-size:14px;color:#fff;outline:none;transition:border-color 0.2s,box-shadow 0.2s;font-family:'Outfit',sans-serif;box-sizing:border-box}
.pay-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(229,9,20,0.12)}
.pay-input::placeholder{color:rgba(255,255,255,0.2)}
/* Right Panel */
.order-summary-sticky{position:sticky;top:80px}
.order-detail-row{display:flex;justify-content:space-between;margin-bottom:12px;font-size:13px;color:#cbd5e1}
.order-detail-val{color:#fff;font-weight:600;text-align:right}
.order-total-box{background:rgba(229,9,20,0.05);border:1px solid rgba(229,9,20,0.2);border-radius:12px;padding:18px;margin-top:24px;display:flex;justify-content:space-between;align-items:center}
.order-total-label{font-size:13px;font-weight:700;color:#cbd5e1;text-transform:uppercase;letter-spacing:0.5px}
.order-total-price{font-size:24px;font-weight:900;color:var(--primary)}
.btn-pay{display:block;width:100%;background:var(--primary);color:#fff;border:none;padding:18px;border-radius:12px;font-size:15px;font-weight:800;cursor:pointer;margin-top:20px;transition:background 0.2s,transform 0.1s;text-align:center;text-decoration:none;font-family:'Outfit',sans-serif}
.btn-pay:hover{background:#cc0000;transform:translateY(-2px)}
.btn-pay:active{transform:translateY(0)}
</style>

<div class="pay-container">
    <!-- Left Column: Formulir & Metode Pembayaran -->
    <div>
        <h1 style="color:#fff;font-size:28px;font-weight:900;margin-bottom:8px;">Checkout Snack-Ku</h1>
        <p style="color:#94a3b8;font-size:14px;margin-bottom:32px;">Selesaikan pembayaran untuk pesanan makanan & minuman Anda.</p>

        <form action="proses_transaksi_fnb.php" method="POST" id="formBayar">
            <input type="hidden" name="cart_data" value="<?= htmlspecialchars($_POST['cart_data']) ?>">
            
            <!-- Detail Kontak -->
            <div class="pay-card">
                <div class="pay-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    Informasi Kontak
                </div>
                <div style="margin-bottom:16px;">
                    <label style="display:block;font-size:12px;font-weight:600;color:#94a3b8;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Alamat Email</label>
                    <input type="email" name="email" class="pay-input" placeholder="Masukkan email Anda" required value="didosyukur123@gmail.com">
                    <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:8px;">E-Receipt akan dikirimkan ke alamat email ini.</div>
                </div>
            </div>
            
            <!-- Metode Pembayaran Mockup -->
            <div class="pay-card">
                <div class="pay-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    Metode Pembayaran
                </div>
                <div style="border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px;background:rgba(229,9,20,0.06);">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <input type="radio" checked style="accent-color:var(--primary);width:16px;height:16px;">
                        <div>
                            <div style="font-weight:700;font-size:14px;color:#fff;">Saldo FILMKU Pay</div>
                            <div style="font-size:12px;color:#94a3b8;">Rp 500.000 (Tersedia)</div>
                        </div>
                    </div>
                </div>
            </div>

            <button type="submit" class="btn-pay cta-button-magnetic" data-magnetic="true"><span class="magnetic-text">Bayar Sekarang</span></button>
        </form>
    </div>

    <!-- Right Column: Order Summary -->
    <div class="order-summary-sticky">
        <div class="pay-card" style="padding:28px;">
            <div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.1);">
                Ringkasan Pesanan F&B
            </div>

            <div style="margin-bottom: 24px;">
                <?php foreach ($cart_data as $item): ?>
                    <div class="order-detail-row" style="margin-bottom: 8px;">
                        <span><?= htmlspecialchars($item['nama']) ?> (x<?= $item['qty'] ?>)</span>
                        <span class="order-detail-val">Rp <?= number_format($item['harga'] * $item['qty'], 0, ',', '.') ?></span>
                    </div>
                <?php endforeach; ?>
            </div>

            <div style="border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 16px; margin-top: 16px;">
                <div class="order-detail-row">
                    <span>Subtotal</span>
                    <span class="order-detail-val">Rp <?= number_format($total_sebelum_promo, 0, ',', '.') ?></span>
                </div>
            </div>

            <div class="order-total-box">
                <div class="order-total-label">Total Bayar</div>
                <div class="order-total-price">Rp <?= number_format($total_sebelum_promo, 0, ',', '.') ?></div>
            </div>
            
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
