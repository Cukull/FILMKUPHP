<?php
// ============================================================
//  FILMKU - Kelola Kategori F&B
// ============================================================
$page_title = 'Kelola Kategori F&B';
$active_nav = 'admin';

require_once __DIR__ . '/../config/sparql.php';

session_start();
if (empty($_SESSION['user_name']) || $_SESSION['current_role'] !== 'admin') {
    header('Location: /FILMKU_PHP/login.php');
    exit;
}

// Handle Tambah Kategori
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'tambah') {
    $nama = addslashes(trim($_POST['nama_kategori'] ?? ''));
    
    if ($nama) {
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '_', stripslashes($nama)));
        $id = "Cat_" . $slug;
        
        $query = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            INSERT DATA {
                f:$id a f:KategoriMakanan ;
                      f:nama_kategori \"$nama\" ;
                      f:slug_kategori \"$slug\" .
            }
        ";
        sparql_update($query);
        header("Location: kelola_kategori_fnb.php?success=tambah");
        exit;
    }
}

// Handle Hapus Kategori
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'hapus') {
    $id = trim($_POST['kategori_id'] ?? '');
    if ($id) {
        $id_safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
        $query = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            DELETE {
                f:$id_safe ?p ?o .
                ?makanan f:kategoriMakanan f:$id_safe .
            }
            WHERE {
                OPTIONAL { f:$id_safe ?p ?o }
                OPTIONAL { ?makanan f:kategoriMakanan f:$id_safe }
            }
        ";
        sparql_update($query);
        header("Location: kelola_kategori_fnb.php?success=hapus");
        exit;
    }
}

// Handle Edit Kategori
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'edit') {
    $id = trim($_POST['kategori_id'] ?? '');
    $nama = addslashes(trim($_POST['nama_kategori'] ?? ''));
    if ($id && $nama) {
        $id_safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '_', stripslashes($nama)));
        
        $query = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            DELETE {
                f:$id_safe f:nama_kategori ?oldNama .
                f:$id_safe f:slug_kategori ?oldSlug .
            }
            INSERT {
                f:$id_safe f:nama_kategori \"$nama\" .
                f:$id_safe f:slug_kategori \"$slug\" .
            }
            WHERE {
                OPTIONAL { f:$id_safe f:nama_kategori ?oldNama }
                OPTIONAL { f:$id_safe f:slug_kategori ?oldSlug }
            }
        ";
        sparql_update($query);
        header("Location: kelola_kategori_fnb.php?success=edit");
        exit;
    }
}


// Ambil Data Kategori
$query = "
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?id ?nama ?slug WHERE {
        ?kategori a f:KategoriMakanan ;
                  f:nama_kategori ?nama ;
                  f:slug_kategori ?slug .
        BIND(REPLACE(STR(?kategori), \"^.*#\", \"\") AS ?id)
    } ORDER BY ?nama
";
$res = sparql_query($query);
$kategori_list = get_bindings($res ?? []);

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
            <a href="/FILMKU_PHP/admin/kelola_kategori_fnb.php" class="nav-link active" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid var(--primary); background: rgba(229,9,20,0.1);">
                🏷️ Kelola Kategori F&B
            </a>
            <a href="/FILMKU_PHP/admin/kelola_fnb.php" class="nav-link" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid transparent;">
                🍿 Kelola Menu F&B
            </a>
        </div>
    </aside>

    <!-- Konten Kelola -->
    <div class="content-area">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 28px;">
            <div>
                <h1 class="section-title-main" style="margin-bottom: 4px;">Kelola Kategori F&B</h1>
                <p style="color: var(--text-muted); font-size: 14px;">Tambah dan hapus kategori makanan/minuman.</p>
            </div>
        </div>

        <?php if(isset($_GET['success'])): ?>
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 12px 20px; border-radius: 8px; margin-bottom: 24px;">
                ✅ Berhasil memperbarui data kategori.
            </div>
        <?php endif; ?>

        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 24px;">
            <!-- Form Tambah/Edit -->
            <div class="sidebar-card">
                <h3 id="formTitle" style="margin-top:0; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:20px;">Tambah Kategori</h3>
                <form method="POST" id="kategoriForm">
                    <input type="hidden" name="action" id="formAction" value="tambah">
                    <input type="hidden" name="kategori_id" id="kategoriId" value="">
                    <div style="margin-bottom: 16px;">
                        <label style="display:block; margin-bottom:8px; font-size:14px; font-weight:600;">Nama Kategori</label>
                        <input type="text" name="nama_kategori" id="namaKategori" required placeholder="Contoh: Popcorn" style="width:100%; padding:10px 14px; border-radius:6px; background:#1e1e2d; border:1px solid rgba(255,255,255,0.1); color:#fff;">
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button type="submit" style="flex:1; padding:12px; background:var(--primary); color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;">Simpan</button>
                        <button type="button" id="btnCancel" style="display:none; padding:12px; background:#475569; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;" onclick="resetForm()">Batal</button>
                    </div>
                </form>
            </div>

            <!-- Tabel Data -->
            <div class="sidebar-card">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <th style="text-align:left; padding:12px;">ID / Slug</th>
                            <th style="text-align:left; padding:12px;">Nama Kategori</th>
                            <th style="text-align:center; padding:12px; width:100px;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($kategori_list)): ?>
                        <tr><td colspan="3" style="text-align:center; padding:20px; color:#94a3b8;">Belum ada kategori data.</td></tr>
                        <?php else: ?>
                            <?php foreach($kategori_list as $k): ?>
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding:12px; color:#94a3b8;"><?= htmlspecialchars($k['slug']['value'] ?? '') ?></td>
                                <td style="padding:12px; font-weight:600; color:#fff;"><?= htmlspecialchars($k['nama']['value'] ?? '') ?></td>
                                <td style="padding:12px; text-align:center;">
                                    <button type="button" onclick="editKategori('<?= htmlspecialchars($k['id']['value'] ?? '') ?>', '<?= htmlspecialchars(addslashes($k['nama']['value'] ?? '')) ?>')" style="background:#3b82f6; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; margin-right:4px;">Edit</button>
                                    <form method="POST" onsubmit="return confirm('Hapus kategori ini? (Makanan di dalamnya mungkin kehilangan relasi)')" style="display:inline;">
                                        <input type="hidden" name="action" value="hapus">
                                        <input type="hidden" name="kategori_id" value="<?= htmlspecialchars($k['id']['value'] ?? '') ?>">
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
function editKategori(id, nama) {
    document.getElementById('formTitle').textContent = 'Edit Kategori';
    document.getElementById('formAction').value = 'edit';
    document.getElementById('kategoriId').value = id;
    document.getElementById('namaKategori').value = nama;
    document.getElementById('btnCancel').style.display = 'block';
    document.getElementById('namaKategori').focus();
}

function resetForm() {
    document.getElementById('formTitle').textContent = 'Tambah Kategori';
    document.getElementById('formAction').value = 'tambah';
    document.getElementById('kategoriId').value = '';
    document.getElementById('namaKategori').value = '';
    document.getElementById('btnCancel').style.display = 'none';
}
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
