<?php
// ============================================================
//  FILMKU - Cafe (Snack-Ku)
// ============================================================
$page_title = 'Snack-Ku Cinema Cafe';
$active_nav = 'cafe';

require_once __DIR__ . '/config/sparql.php';
session_start();

// Ambil Kategori dan Makanan via SPARQL
$query = "
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?kategori_nama ?makanan_id ?nama ?desc ?harga ?gambar WHERE {
        ?kategori a f:KategoriMakanan ;
                  f:nama_kategori ?kategori_nama .
        
        OPTIONAL {
            ?makanan a f:Makanan ;
                     f:kategoriMakanan ?kategori ;
                     f:nama_makanan ?nama .
            BIND(REPLACE(STR(?makanan), \"^.*#\", \"\") AS ?makanan_id)
            OPTIONAL { ?makanan f:deskripsi_makanan ?desc }
            OPTIONAL { ?makanan f:harga_makanan ?harga }
            OPTIONAL { ?makanan f:gambar_makanan ?gambar }
        }
    } ORDER BY ?kategori_nama ?nama
";
$res = sparql_query($query);
$bindings = get_bindings($res ?? []);

// Grouping manual
$menu_data = [];
foreach ($bindings as $b) {
    $cat_name = $b['kategori_nama']['value'] ?? 'Lainnya';
    if (!isset($menu_data[$cat_name])) {
        $menu_data[$cat_name] = [];
    }
    
    if (isset($b['makanan_id'])) {
        $menu_data[$cat_name][] = [
            'id' => $b['makanan_id']['value'],
            'nama' => $b['nama']['value'] ?? '',
            'desc' => $b['desc']['value'] ?? '',
            'harga' => intval($b['harga']['value'] ?? 0),
            'gambar' => $b['gambar']['value'] ?? 'https://placehold.co/400x300?text=Food'
        ];
    }
}

require_once __DIR__ . '/includes/header.php';
?>

<div style="max-width: 1200px; margin: 40px auto; padding: 0 20px;">
    
    <div style="text-align: left; margin-bottom: 40px;">
        <h1 class="section-title-main" style="font-size: 32px; margin-bottom: 8px;">Snack-Ku Cinema Cafe</h1>
        <p style="color: var(--text-muted);">Pesan camilan favoritmu tanpa perlu antre di bioskop.</p>
    </div>

    <div style="display: flex; gap: 40px; align-items: flex-start;">
        
        <!-- Kolom Kiri: Daftar Menu -->
        <div style="flex: 1; min-width: 0;">
            <?php foreach ($menu_data as $category_name => $items): ?>
                <div class="menu-section" style="margin-bottom: 48px;">
                    <h2 style="color: var(--primary); font-size: 24px; font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 24px;">
                        <?= htmlspecialchars($category_name) ?>
                    </h2>

                    <?php if (empty($items)): ?>
                        <p style="color: #94a3b8;">Belum ada menu di kategori ini.</p>
                    <?php else: ?>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
                            
                            <?php foreach ($items as $item): ?>
                                <div class="food-card" style="display: flex; background: rgba(30, 30, 45, 0.6); backdrop-filter: blur(12px); border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); transition: transform 0.3s ease, border-color 0.3s ease;">
                                    
                                    <!-- Informasi Makanan -->
                                    <div style="flex: 1; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
                                        <div>
                                            <h3 style="color: #fff; margin: 0 0 8px 0; font-size: 16px; font-weight: 700;"><?= htmlspecialchars($item['nama']) ?></h3>
                                            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 12px; line-height: 1.4;">
                                                <?= htmlspecialchars($item['desc']) ?>
                                            </p>
                                        </div>
                                        <div style="font-weight: 800; font-size: 15px; color: #fff;">
                                            Rp <?= number_format($item['harga'], 0, ',', '.') ?>
                                        </div>
                                    </div>
                                    
                                    <!-- Gambar & Tombol -->
                                    <div style="width: 130px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 16px 16px 16px 0;">
                                        <img src="<?= htmlspecialchars($item['gambar']) ?>" 
                                             alt="<?= htmlspecialchars($item['nama']) ?>" 
                                             style="width: 100%; height: 90px; object-fit: contain; margin-bottom: 12px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                                        
                                        <button class="btn-add-cart" 
                                                data-id="<?= htmlspecialchars($item['id']) ?>" 
                                                data-nama="<?= htmlspecialchars($item['nama']) ?>" 
                                                data-harga="<?= htmlspecialchars($item['harga']) ?>" 
                                                style="width: 100%; background: transparent; color: #fff; border: 1px solid #fff; padding: 6px 0; border-radius: 20px; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.2s;">
                                            Tambah
                                        </button>
                                    </div>

                                </div>
                            <?php endforeach; ?>
                            
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Kolom Kanan: Keranjang Pemesanan (Cart Box) -->
        <div style="width: 320px; position: sticky; top: 100px;">
            <div style="background: rgba(20, 20, 30, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(229, 9, 20, 0.3); border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" style="width: 24px; height: 24px;">
                        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 700;">Keranjang Saya</h3>
                </div>

                <div id="cartItemsContainer" style="max-height: 300px; overflow-y: auto; margin-bottom: 20px; padding-right: 8px;">
                    <!-- Diisi oleh Javascript -->
                </div>

                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 16px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span id="cartTotalItems" style="color: #94a3b8; font-size: 14px;">0 item dipilih</span>
                        <span id="cartTotalPrice" style="font-size: 20px; font-weight: 800; color: #fff;">Rp 0</span>
                    </div>
                </div>

                <form id="checkoutForm" action="bayar_fnb.php" method="POST">
                    <input type="hidden" name="cart_data" id="cartDataInput">
                    <button type="button" id="btnCheckout" class="cta-button-magnetic" data-magnetic="true" style="width: 100%; background: #E50914; color: #fff; border: none; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 800; cursor: pointer; transition: background 0.2s;">
                        <span class="magnetic-text">Lanjut</span>
                    </button>
                </form>

            </div>
        </div>

    </div>
</div>

<!-- Script Keranjang Belanja Berbasis JS -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    // Hover styling untuk card
    const cards = document.querySelectorAll('.food-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.borderColor = 'rgba(229,9,20,0.5)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.borderColor = 'rgba(255,255,255,0.05)';
        });
    });

    // Sistem Keranjang
    let cart = JSON.parse(localStorage.getItem('snack_cart')) || [];
    
    const formatRp = (num) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };
    
    const renderCart = () => {
        const container = document.getElementById('cartItemsContainer');
        const totalItemsEl = document.getElementById('cartTotalItems');
        const totalPriceEl = document.getElementById('cartTotalPrice');
        
        container.innerHTML = '';
        
        if (cart.length === 0) {
            container.innerHTML = '<p style="color:#94a3b8; font-size:14px; text-align:center; padding: 20px 0;">Belum ada item.</p>';
            totalItemsEl.textContent = '0 item dipilih';
            totalPriceEl.textContent = 'Rp 0';
            return;
        }

        let totalQty = 0;
        let totalPrice = 0;

        cart.forEach((item, index) => {
            totalQty += item.qty;
            totalPrice += (item.harga * item.qty);
            
            const itemHTML = `
                <div style="margin-bottom: 16px;">
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 8px; color: #fff;">${item.nama}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 14px; color: var(--primary); font-weight: 700;">Rp ${formatRp(item.harga * item.qty)}</div>
                        <div style="display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.1); border-radius: 20px; padding: 4px 8px;">
                            <button onclick="updateQty(${index}, -1)" style="background:transparent; border:none; color:#fff; cursor:pointer; font-size:16px; width:24px; height:24px; display:flex; align-items:center; justify-content:center;">-</button>
                            <span style="font-size:14px; font-weight:700; width:16px; text-align:center;">${item.qty}</span>
                            <button onclick="updateQty(${index}, 1)" style="background:transparent; border:none; color:#fff; cursor:pointer; font-size:16px; width:24px; height:24px; display:flex; align-items:center; justify-content:center;">+</button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', itemHTML);
        });

        totalItemsEl.textContent = totalQty + ' item dipilih';
        totalPriceEl.textContent = 'Rp ' + formatRp(totalPrice);
    };

    window.updateQty = (index, change) => {
        if (cart[index].qty + change > 0) {
            cart[index].qty += change;
        } else {
            // Hapus jika 0
            cart.splice(index, 1);
        }
        localStorage.setItem('snack_cart', JSON.stringify(cart));
        renderCart();
    };

    const addButtons = document.querySelectorAll('.btn-add-cart');
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const nama = e.target.getAttribute('data-nama');
            const harga = parseInt(e.target.getAttribute('data-harga'));
            
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({ id, nama, harga, qty: 1 });
            }
            
            localStorage.setItem('snack_cart', JSON.stringify(cart));
            renderCart();
            
            // Visual feedback
            const originalText = e.target.textContent;
            e.target.textContent = 'Ditambahkan';
            e.target.style.background = '#E50914';
            e.target.style.color = '#fff';
            e.target.style.borderColor = '#E50914';
            
            setTimeout(() => {
                e.target.textContent = originalText;
                e.target.style.background = 'transparent';
                e.target.style.color = '#fff';
                e.target.style.borderColor = '#fff';
            }, 1000);
        });
    });

    // Checkout Button Logic
    const btnCheckout = document.getElementById('btnCheckout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Keranjang Anda masih kosong. Silakan pilih makanan atau minuman terlebih dahulu.');
                return;
            }
            
            // Masukkan data keranjang ke hidden input lalu submit form
            document.getElementById('cartDataInput').value = JSON.stringify(cart);
            document.getElementById('checkoutForm').submit();
        });
    }

    renderCart(); // Initial render
});
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
