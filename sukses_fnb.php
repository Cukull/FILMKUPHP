<?php
// ============================================================
//  FILMKU - Halaman Berhasil Memesan F&B
// ============================================================
$page_title = 'Pemesanan Berhasil';
$active_nav = 'cafe';
require_once __DIR__ . '/includes/header.php';

$order_id = $_GET['order_id'] ?? '';
$email    = $_GET['email'] ?? '';
?>

<div style="max-width: 600px; margin: 80px auto; text-align: center; padding: 0 20px;">
    
    <div style="width: 80px; height: 80px; background: rgba(34, 197, 94, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 40px; height: 40px;">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    </div>
    
    <h1 style="color: #fff; font-size: 32px; font-weight: 900; margin-bottom: 12px;">Pesanan Berhasil Dibuat!</h1>
    
    <p style="color: #94a3b8; font-size: 15px; margin-bottom: 32px; line-height: 1.6;">
        Terima kasih! Pesanan Makanan & Minuman Anda telah kami terima.<br>
        E-Receipt telah dikirimkan ke <span style="color: #fff; font-weight: 600;"><?= htmlspecialchars($email) ?></span>
    </p>

    <div style="background: rgba(18, 18, 30, 0.8); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: left;">
        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">ID Pesanan</div>
        <div style="color: #fff; font-size: 18px; font-weight: 800;"><?= htmlspecialchars($order_id) ?></div>
    </div>
    
    <div style="display: flex; gap: 16px; justify-content: center;">
        <a href="/FILMKU_PHP/myorder.php" style="background: var(--primary); color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; transition: background 0.2s;">
            Lihat My Order
        </a>
        <a href="/FILMKU_PHP/cafe.php" style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; transition: background 0.2s;">
            Kembali ke Cafe
        </a>
    </div>

</div>

<!-- Script untuk clear local storage cart karena sudah berhasil bayar -->
<script>
    localStorage.removeItem('snack_cart');
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
