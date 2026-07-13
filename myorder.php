<?php
// ============================================================
//  FILMKU — Histori Pemesanan Tiket
// ============================================================
$page_title = 'My Order';
$active_nav = 'myorder';
require_once __DIR__ . '/config/sparql.php';
require_once __DIR__ . '/includes/header.php';

$histori_tiket = $_SESSION['histori_tiket'] ?? [];
$histori_fnb   = $_SESSION['histori_fnb'] ?? [];
?>

<div style="max-width: 900px; margin: 40px auto; padding: 0 20px;">
    <h1 style="color: #fff; margin-bottom: 24px; font-weight: 800; display: flex; align-items: center; gap: 12px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="width: 28px; height: 28px;"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        Pesanan Saya
    </h1>
    
    <!-- Tab Navigation -->
    <div style="display: flex; gap: 32px; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px;">
        <button class="order-tab active" onclick="switchOrderTab('film')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            Film
        </button>
        <button class="order-tab" onclick="switchOrderTab('food')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
            Food & Beverage
        </button>
    </div>

    <!-- Film Tab Content -->
    <div id="tab-film" class="order-tab-content" style="display: block;">
    <?php if (empty($histori_tiket)): ?>
        <div style="background: rgba(18, 18, 29, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 8px; text-align: center; color: #cbd5e1;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <h3 style="color: #fff; margin-bottom: 8px;">Belum Ada Transaksi</h3>
            <p>Anda belum pernah memesan tiket. <a href="/FILMKU_PHP/index.php" style="color: var(--primary); text-decoration: none;">Pesan tiket sekarang!</a></p>
        </div>
    <?php else: ?>
        <div style="display: grid; gap: 16px;">
            <?php foreach (array_reverse($histori_tiket) as $index => $tiket): ?>
                <?php
                    // Ambil detail film dari database berdasarkan ID
                    $film_id_safe = addslashes($tiket['film_id']);
                    $info = sparql_query("
                        PREFIX f: <" . ONTOLOGY_PREFIX . ">
                        SELECT ?judul ?poster WHERE {
                            f:$film_id_safe f:judul ?judul .
                            OPTIONAL { f:$film_id_safe f:poster_url ?poster . }
                            OPTIONAL { f:$film_id_safe f:poster_film ?poster . }
                        } LIMIT 1
                    ");
                    $info_row = get_bindings($info ?? [])[0] ?? [];
                    $judul  = $info_row['judul']['value'] ?? 'Film';
                    $poster = $info_row['poster']['value'] ?? '';
                    $jumlah = count(explode(',', $tiket['kursi']));
                    
                    // Format data for modal
                    $modalData = htmlspecialchars(json_encode([
                        'judul' => $judul,
                        'poster' => get_poster_url($poster),
                        'waktu_beli' => $tiket['waktu_beli'],
                        'email' => $tiket['email'],
                        'tanggal' => $tiket['tanggal'],
                        'jam' => $tiket['jam'],
                        'kursi' => $tiket['kursi'],
                        'total' => 'Rp ' . number_format($jumlah * 50000, 0, ',', '.')
                    ]));
                ?>
                <div class="ticket-card" onclick="openTicketModal(this)" data-ticket="<?= $modalData ?>" style="background: rgba(18, 18, 29, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; display: flex; gap: 20px; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); cursor: pointer; transition: transform 0.2s, border-color 0.2s;">
                    <img src="<?= htmlspecialchars(get_poster_url($poster)) ?>" onerror="this.onerror=null; this.src='https://placehold.co/200x300/12121d/cbd5e1?text=No+Poster'" style="width: 80px; height: 120px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">
                    
                    <div style="flex: 1;">
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px; display: flex; gap: 16px; align-items: center;">
                            <span style="display: flex; align-items: center; gap: 4px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                Dibeli: <?= htmlspecialchars($tiket['waktu_beli']) ?>
                            </span>
                            <span style="display: flex; align-items: center; gap: 4px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 14px; height: 14px;"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                                <?= htmlspecialchars($tiket['email']) ?>
                            </span>
                        </div>
                        <h2 style="font-size: 20px; color: #fff; margin-bottom: 12px; font-weight: 700;"><?= htmlspecialchars($judul) ?></h2>
                        
                        <div style="display: flex; gap: 24px; font-size: 14px; color: #cbd5e1;">
                            <div>
                                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Tanggal & Jam</div>
                                <div style="color: #fff; font-weight: 600; margin-top: 2px;">
                                    <?= htmlspecialchars($tiket['tanggal']) ?> - <span style="color: var(--primary);"><?= htmlspecialchars($tiket['jam']) ?></span>
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b;">Kursi (<?= $jumlah ?>)</div>
                                <div style="color: #fff; font-weight: 600; margin-top: 2px;"><?= htmlspecialchars($tiket['kursi']) ?></div>
                            </div>
                            <div>
                                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; display: flex; align-items: center; gap: 4px;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 12px; height: 12px;"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                    Total Pembayaran
                                </div>
                                <div style="color: #fff; font-weight: 600; margin-top: 2px;">Rp <?= number_format($jumlah * 50000, 0, ',', '.') ?></div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="padding-left: 20px; border-left: 1px dashed rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.7; transition: opacity 0.2s;" class="ticket-qr-hint">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 32px; height: 32px; margin-bottom: 8px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"></path></svg>
                        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Lihat Tiket</span>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    </div> <!-- End Film Tab -->
    
    <!-- Food Tab Content -->
    <div id="tab-food" class="order-tab-content" style="display: none;">
        <?php if (empty($histori_fnb)): ?>
            <div style="background: rgba(18, 18, 29, 0.8); border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 8px; text-align: center; color: #cbd5e1;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                <h3 style="color: #fff; margin-bottom: 8px;">Belum Ada Pesanan F&B</h3>
                <p>Anda belum pernah memesan makanan & minuman.</p>
            </div>
        <?php else: ?>
            <div style="display: grid; gap: 16px;">
                <?php foreach (array_reverse($histori_fnb) as $fnb): ?>
                    <?php 
                        $item_names = [];
                        foreach ($fnb['items'] as $it) {
                            $item_names[] = $it['nama'] . ' (x' . $it['qty'] . ')';
                        }
                        $item_list = implode(', ', $item_names);
                    ?>
                    <div style="background: rgba(18, 18, 29, 0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px; display: flex; gap: 16px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px;">
                            <span style="display: flex; align-items: center; gap: 4px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                <?= htmlspecialchars($fnb['waktu_beli']) ?>
                            </span>
                            <span style="display: flex; align-items: center; gap: 4px;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                                <?= htmlspecialchars($fnb['email']) ?>
                            </span>
                            <span style="margin-left: auto; background: rgba(229,9,20,0.15); color: var(--primary); padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 10px;">
                                <?= htmlspecialchars($fnb['order_id']) ?>
                            </span>
                        </div>
                        
                        <div style="display: flex; gap: 20px; align-items: center;">
                            <div style="flex: 1;">
                                <h3 style="font-size: 18px; color: #fff; margin: 0 0 8px 0; font-weight: 700;">Pesanan Snack-Ku</h3>
                                <p style="color: #cbd5e1; font-size: 14px; margin: 0; line-height: 1.5;">
                                    <?= htmlspecialchars($item_list) ?>
                                </p>
                            </div>
                            
                            <div style="text-align: right; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 20px;">
                                <div style="font-size: 11px; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Total Belanja</div>
                                <div style="color: #10b981; font-weight: 800; font-size: 18px;">Rp <?= number_format($fnb['total'], 0, ',', '.') ?></div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>
</div>

<style>
    .order-tab {
        background: none;
        border: none;
        color: #94a3b8;
        font-size: 16px;
        font-weight: 600;
        padding: 0 0 12px 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 3px solid transparent;
        transition: all 0.2s;
        font-family: 'Outfit', sans-serif;
    }
    .order-tab svg { width: 18px; height: 18px; }
    .order-tab:hover { color: #fff; }
    .order-tab.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
    }
    .order-tab-content {
        animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>

<script>
    function switchOrderTab(tabId) {
        document.querySelectorAll('.order-tab-content').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.order-tab').forEach(el => el.classList.remove('active'));
        
        document.getElementById('tab-' + tabId).style.display = 'block';
        event.currentTarget.classList.add('active');
    }
</script>

<!-- Modal QR Code Tiket -->
<div id="ticketModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(8, 8, 16, 0.9); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(5px); opacity: 0; transition: opacity 0.3s ease;">
    <div style="background: #1e1e2d; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 30px; width: 90%; max-width: 400px; text-align: center; position: relative; box-shadow: 0 20px 40px rgba(0,0,0,0.8); transform: translateY(20px); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" id="ticketModalContent">
        <button onclick="closeTicketModal()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        
        <h3 style="color: #fff; margin-bottom: 20px; font-weight: 700; font-size: 18px;">E-Tiket FILMKU</h3>
        
        <!-- Dummy QR Code Generator API -->
        <div style="background: #fff; padding: 16px; border-radius: 12px; display: inline-block; margin-bottom: 20px;">
            <img id="modalQrCode" src="" alt="QR Code" style="width: 150px; height: 150px; display: block;">
        </div>
        
        <h2 id="modalJudul" style="font-size: 22px; color: #fff; margin-bottom: 8px; font-weight: 800;">-</h2>
        <div id="modalJadwal" style="color: var(--primary); font-weight: 600; margin-bottom: 16px; font-size: 14px;">-</div>
        
        <div style="display: flex; justify-content: center; gap: 20px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px;">
            <div style="text-align: center;">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Kursi</div>
                <div id="modalKursi" style="color: #fff; font-weight: 700; font-size: 16px; margin-top: 4px;">-</div>
            </div>
            <div style="width: 1px; background: rgba(255,255,255,0.1);"></div>
            <div style="text-align: center;">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase;">Total</div>
                <div id="modalTotal" style="color: #fff; font-weight: 700; font-size: 16px; margin-top: 4px;">-</div>
            </div>
        </div>
        
        <div style="margin-top: 20px; font-size: 11px; color: #64748b;">
            Tunjukkan QR Code ini kepada petugas bioskop saat kedatangan.
        </div>
    </div>
</div>

<style>
    .ticket-card:hover {
        border-color: var(--primary) !important;
        transform: translateY(-2px);
    }
    .ticket-card:hover .ticket-qr-hint {
        opacity: 1 !important;
        color: var(--primary);
    }
    
    /* Prevent body scroll when modal is open */
    body.modal-open {
        overflow: hidden;
    }
</style>

<script>
    function openTicketModal(element) {
        const data = JSON.parse(element.getAttribute('data-ticket'));
        
        // Populate modal data
        document.getElementById('modalJudul').textContent = data.judul;
        document.getElementById('modalJadwal').textContent = `${data.tanggal} - ${data.jam}`;
        document.getElementById('modalKursi').textContent = data.kursi;
        document.getElementById('modalTotal').textContent = data.total;
        
        // Generate Dummy QR Code via API based on ticket info
        const qrText = encodeURIComponent(`FILMKU TICKET | ${data.judul} | ${data.tanggal} ${data.jam} | Kursi: ${data.kursi}`);
        document.getElementById('modalQrCode').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrText}&color=000000&bgcolor=ffffff`;
        
        // Show modal with animation
        const modal = document.getElementById('ticketModal');
        const modalContent = document.getElementById('ticketModalContent');
        
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Trigger reflow
        void modal.offsetWidth;
        
        modal.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    }
    
    function closeTicketModal() {
        const modal = document.getElementById('ticketModal');
        const modalContent = document.getElementById('ticketModalContent');
        
        modal.style.opacity = '0';
        modalContent.style.transform = 'translateY(20px)';
        document.body.classList.remove('modal-open');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Close modal on outside click
    document.getElementById('ticketModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeTicketModal();
        }
    });
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
