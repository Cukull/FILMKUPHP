<?php
// ============================================================
//  FILMKU - Kelola Menu F&B
// ============================================================
$page_title = 'Kelola Menu F&B';
$active_nav = 'admin';

require_once __DIR__ . '/../config/sparql.php';

session_start();
if (empty($_SESSION['user_name']) || $_SESSION['current_role'] !== 'admin') {
    header('Location: /FILMKU_PHP/login.php');
    exit;
}

// Handle Tambah Makanan
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'tambah') {
    $kategori = trim($_POST['kategori_id'] ?? '');
    $nama     = addslashes(trim($_POST['nama_makanan'] ?? ''));
    $desc     = addslashes(trim($_POST['deskripsi'] ?? ''));
    $harga    = addslashes(trim($_POST['harga'] ?? '0'));
    $gambar   = str_replace('\\', '/', trim($_POST['gambar_url'] ?? 'https://placehold.co/400x300?text=Food')); // Normalize slashes for web
    $gambar   = addslashes($gambar);
    
    if ($kategori && $nama) {
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '_', stripslashes($nama))) . "_" . time();
        $id = "Food_" . $slug;
        $kat_id_safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $kategori);
        
        $query = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            INSERT DATA {
                f:$id a f:Makanan ;
                      f:kategoriMakanan f:$kat_id_safe ;
                      f:nama_makanan \"$nama\" ;
                      f:deskripsi_makanan \"$desc\" ;
                      f:harga_makanan \"$harga\" ;
                      f:gambar_makanan \"$gambar\" .
            }
        ";
        sparql_update($query);
        header("Location: kelola_fnb.php?success=tambah");
        exit;
    }
}

// Handle Hapus Makanan
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'hapus') {
    $id = trim($_POST['makanan_id'] ?? '');
    if ($id) {
        $id_safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
        $query = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            DELETE {
                f:$id_safe ?p ?o .
            }
            WHERE {
                f:$id_safe ?p ?o .
            }
        ";
        sparql_update($query);
        header("Location: kelola_fnb.php?success=hapus");
        exit;
    }
}

// Handle Edit Makanan
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'edit') {
    $id       = trim($_POST['makanan_id'] ?? '');
    $kategori = trim($_POST['kategori_id'] ?? '');
    $nama     = addslashes(trim($_POST['nama_makanan'] ?? ''));
    $desc     = addslashes(trim($_POST['deskripsi'] ?? ''));
    $harga    = addslashes(trim($_POST['harga'] ?? '0'));
    $gambar   = str_replace('\\', '/', trim($_POST['gambar_url'] ?? '')); // Normalize slashes for web
    $gambar   = addslashes($gambar);
    
    if ($id && $kategori && $nama) {
        $id_safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
        $kat_id_safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $kategori);
        
        $query = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            DELETE {
                f:$id_safe f:kategoriMakanan ?oldKat .
                f:$id_safe f:nama_makanan ?oldNama .
                f:$id_safe f:deskripsi_makanan ?oldDesc .
                f:$id_safe f:harga_makanan ?oldHarga .
                f:$id_safe f:gambar_makanan ?oldGambar .
            }
            INSERT {
                f:$id_safe f:kategoriMakanan f:$kat_id_safe .
                f:$id_safe f:nama_makanan \"$nama\" .
                f:$id_safe f:deskripsi_makanan \"$desc\" .
                f:$id_safe f:harga_makanan \"$harga\" .
                f:$id_safe f:gambar_makanan \"$gambar\" .
            }
            WHERE {
                OPTIONAL { f:$id_safe f:kategoriMakanan ?oldKat }
                OPTIONAL { f:$id_safe f:nama_makanan ?oldNama }
                OPTIONAL { f:$id_safe f:deskripsi_makanan ?oldDesc }
                OPTIONAL { f:$id_safe f:harga_makanan ?oldHarga }
                OPTIONAL { f:$id_safe f:gambar_makanan ?oldGambar }
            }
        ";
        sparql_update($query);
        header("Location: kelola_fnb.php?success=edit");
        exit;
    }
}

// Ambil Data Kategori untuk Dropdown
$queryKat = "
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?id ?nama WHERE {
        ?kategori a f:KategoriMakanan ;
                  f:nama_kategori ?nama .
        BIND(REPLACE(STR(?kategori), \"^.*#\", \"\") AS ?id)
    } ORDER BY ?nama
";
$resKat = sparql_query($queryKat);
$kategori_list = get_bindings($resKat ?? []);

// Ambil Data Makanan
$queryFood = "
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?id ?nama_makanan ?kat_id ?kategori_nama ?harga ?desc ?gambar WHERE {
        ?makanan a f:Makanan ;
                 f:nama_makanan ?nama_makanan ;
                 f:kategoriMakanan ?kat .
        ?kat f:nama_kategori ?kategori_nama .
        OPTIONAL { ?makanan f:harga_makanan ?harga }
        OPTIONAL { ?makanan f:deskripsi_makanan ?desc }
        OPTIONAL { ?makanan f:gambar_makanan ?gambar }
        BIND(REPLACE(STR(?makanan), \"^.*#\", \"\") AS ?id)
        BIND(REPLACE(STR(?kat), \"^.*#\", \"\") AS ?kat_id)
    } ORDER BY ?kategori_nama ?nama_makanan
";
$resFood = sparql_query($queryFood);
$makanan_list = get_bindings($resFood ?? []);

require_once __DIR__ . '/../includes/header.php';
?>

<div class="main-layout" style="padding-top: 40px;">
    <!-- Sidebar Admin -->
    <aside class="sidebar-right" style="width: 250px;">
        <div class="sidebar-card" style="padding: 10px 0;">
            <div style="padding: 10px 20px; font-weight: 800; font-size: 14px; color: var(--text-muted); text-transform: uppercase;">Menu Admin</div>
            <a href="/FILMKU_PHP/admin/dashboard.php" class="nav-link" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid transparent;">
                📊 Ringkasan
            </a>
            <a href="/FILMKU_PHP/admin/kelola_film.php" class="nav-link" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid transparent;">
                🎬 Kelola Film
            </a>
            <a href="/FILMKU_PHP/admin/kelola_kategori_fnb.php" class="nav-link" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid transparent;">
                🏷️ Kelola Kategori F&B
            </a>
            <a href="/FILMKU_PHP/admin/kelola_fnb.php" class="nav-link active" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid var(--primary); background: rgba(229,9,20,0.1);">
                🍿 Kelola Menu F&B
            </a>
        </div>
    </aside>

    <!-- Konten Kelola -->
    <div class="content-area">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 28px;">
            <div>
                <h1 class="section-title-main" style="margin-bottom: 4px;">Kelola Menu F&B</h1>
                <p style="color: var(--text-muted); font-size: 14px;">Tambah dan hapus daftar menu makanan & minuman Snack-Ku.</p>
            </div>
        </div>

        <?php if(isset($_GET['success'])): ?>
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 12px 20px; border-radius: 8px; margin-bottom: 24px;">
                ✅ Berhasil memperbarui data menu F&B.
            </div>
        <?php endif; ?>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px;">
            <!-- Form Tambah -->
            <div class="sidebar-card">
                <h3 id="formTitle" style="margin-top:0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:20px;">Tambah Makanan</h3>
                <form method="POST" id="fnbForm">
                    <input type="hidden" name="action" id="formAction" value="tambah">
                    <input type="hidden" name="makanan_id" id="makananId" value="">
                    
                    <div style="margin-bottom: 16px;">
                        <label style="display:block; margin-bottom:8px; font-size:14px; font-weight:600;">Kategori</label>
                        <select name="kategori_id" id="kategoriId" required style="width:100%; padding:10px 14px; border-radius:6px; background:#1e1e2d; border:1px solid rgba(255,255,255,0.1); color:#fff;">
                            <option value="">Pilih Kategori...</option>
                            <?php foreach($kategori_list as $k): ?>
                                <option value="<?= htmlspecialchars($k['id']['value'] ?? '') ?>">
                                    <?= htmlspecialchars($k['nama']['value'] ?? '') ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display:block; margin-bottom:8px; font-size:14px; font-weight:600;">Nama Item</label>
                        <input type="text" name="nama_makanan" id="namaMakanan" required style="width:100%; padding:10px 14px; border-radius:6px; background:#1e1e2d; border:1px solid rgba(255,255,255,0.1); color:#fff;">
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display:block; margin-bottom:8px; font-size:14px; font-weight:600;">Harga (Rp)</label>
                        <input type="number" name="harga" id="hargaMakanan" required style="width:100%; padding:10px 14px; border-radius:6px; background:#1e1e2d; border:1px solid rgba(255,255,255,0.1); color:#fff;">
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label style="display:block; margin-bottom:8px; font-size:14px; font-weight:600;">Deskripsi</label>
                        <textarea name="deskripsi" id="descMakanan" rows="3" style="width:100%; padding:10px 14px; border-radius:6px; background:#1e1e2d; border:1px solid rgba(255,255,255,0.1); color:#fff; resize:vertical;"></textarea>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label style="display:block; margin-bottom:8px; font-size:14px; font-weight:600;">URL Gambar (Path Lokal / URL Web)</label>
                        <input type="text" name="gambar_url" id="gambarMakanan" placeholder="/FILMKU_PHP/static/images/..." style="width:100%; padding:10px 14px; border-radius:6px; background:#1e1e2d; border:1px solid rgba(255,255,255,0.1); color:#fff;">
                    </div>

                    <div style="display: flex; gap: 8px;">
                        <button type="submit" style="flex:1; padding:12px; background:var(--primary); color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;">Simpan</button>
                        <button type="button" id="btnCancel" style="display:none; padding:12px; background:#475569; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;" onclick="resetForm()">Batal</button>
                    </div>
                </form>
            </div>

            <!-- Tabel Data -->
            <div class="sidebar-card" style="align-self: start;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <th style="text-align:left; padding:12px;">Item</th>
                            <th style="text-align:left; padding:12px;">Kategori</th>
                            <th style="text-align:left; padding:12px;">Harga</th>
                            <th style="text-align:center; padding:12px; width:100px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($makanan_list)): ?>
                        <tr><td colspan="4" style="text-align:center; padding:20px; color:#94a3b8;">Belum ada menu makanan.</td></tr>
                        <?php else: ?>
                            <?php foreach($makanan_list as $f): ?>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding:12px; font-weight:600; color:#fff;">
                                    <?= htmlspecialchars($f['nama_makanan']['value'] ?? '') ?><br>
                                    <span style="font-size:12px; color:#94a3b8; font-weight:normal;"><?= htmlspecialchars(substr($f['desc']['value'] ?? '', 0, 50)) ?>...</span>
                                </td>
                                <td style="padding:12px; color:#94a3b8;"><?= htmlspecialchars($f['kategori_nama']['value'] ?? '') ?></td>
                                <td style="padding:12px; color:#10b981;">Rp <?= number_format(intval($f['harga']['value'] ?? 0), 0, ',', '.') ?></td>
                                <td style="padding:12px; text-align:center;">
                                    <?php 
                                        $fId = htmlspecialchars($f['id']['value'] ?? '');
                                        $fKatId = htmlspecialchars($f['kat_id']['value'] ?? '');
                                        $fNama = htmlspecialchars(addslashes($f['nama_makanan']['value'] ?? ''));
                                        $fHarga = htmlspecialchars($f['harga']['value'] ?? '');
                                        $fDesc = htmlspecialchars(addslashes($f['desc']['value'] ?? ''));
                                        $fGambar = htmlspecialchars(addslashes($f['gambar']['value'] ?? ''));
                                    ?>
                                    <button type="button" onclick="editMakanan('<?= $fId ?>', '<?= $fKatId ?>', '<?= $fNama ?>', '<?= $fHarga ?>', '<?= $fDesc ?>', '<?= $fGambar ?>')" style="background:#3b82f6; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; margin-right:4px;">Edit</button>
                                    <form method="POST" onsubmit="return confirm('Hapus menu ini?')" style="display:inline;">
                                        <input type="hidden" name="action" value="hapus">
                                        <input type="hidden" name="makanan_id" value="<?= htmlspecialchars($f['id']['value'] ?? '') ?>">
                                        <button type="submit" style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px;">Hapus</button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</div>

<script>
function editMakanan(id, katId, nama, harga, desc, gambar) {
    document.getElementById('formTitle').textContent = 'Edit Makanan';
    document.getElementById('formAction').value = 'edit';
    document.getElementById('makananId').value = id;
    document.getElementById('kategoriId').value = katId;
    document.getElementById('namaMakanan').value = nama;
    document.getElementById('hargaMakanan').value = harga;
    document.getElementById('descMakanan').value = desc;
    document.getElementById('gambarMakanan').value = gambar;
    document.getElementById('btnCancel').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('formTitle').textContent = 'Tambah Makanan';
    document.getElementById('formAction').value = 'tambah';
    document.getElementById('makananId').value = '';
    document.getElementById('kategoriId').value = '';
    document.getElementById('namaMakanan').value = '';
    document.getElementById('hargaMakanan').value = '';
    document.getElementById('descMakanan').value = '';
    document.getElementById('gambarMakanan').value = '';
    document.getElementById('btnCancel').style.display = 'none';
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
