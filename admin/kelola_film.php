<?php
// ============================================================
//  FILMKU — Kelola Film (Tabel Admin)
// ============================================================
$page_title = 'Kelola Film';
$active_nav = 'admin';

require_once __DIR__ . '/../config/sparql.php';

session_start();
if (empty($_SESSION['user_name']) || $_SESSION['current_role'] !== 'admin') {
    header('Location: /FILMKU_PHP/login.php');
    exit;
}

// Handle Bulk Delete
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'bulk_delete') {
    if (!empty($_POST['film_ids']) && is_array($_POST['film_ids'])) {
        $delete_queries = [];
        foreach ($_POST['film_ids'] as $id) {
            $id_safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
            if ($id_safe) {
                // Delete film, its schedule, and its seats (cascade delete)
                $delete_queries[] = "
                    f:$id_safe ?p1 ?o1 .
                    ?jadwal f:memutarFilm f:$id_safe ; ?p2 ?o2 .
                    ?kursi f:untukJadwal ?jadwal ; ?p3 ?o3 .
                ";
            }
        }
        
        if (!empty($delete_queries)) {
            $triples = implode("\n", $delete_queries);
            $query = "
                PREFIX f: <" . ONTOLOGY_PREFIX . ">
                DELETE {
                    $triples
                }
                WHERE {
                    OPTIONAL { f:$id_safe ?p1 ?o1 }
                    OPTIONAL { ?jadwal f:memutarFilm f:$id_safe ; ?p2 ?o2 }
                    OPTIONAL { ?kursi f:untukJadwal ?jadwal ; ?p3 ?o3 }
                }
            ";
            // A more robust SPARQL delete would just delete the films explicitly
            $simple_delete = "PREFIX f: <" . ONTOLOGY_PREFIX . "> DELETE { ?s ?p ?o } WHERE { ?s ?p ?o . VALUES ?s { ";
            $values = [];
            foreach ($_POST['film_ids'] as $id) {
                $id_safe = preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
                $values[] = "f:$id_safe";
            }
            $simple_delete .= implode(" ", $values) . " } }";
            
            if (sparql_update($simple_delete)) {
                header('Location: /FILMKU_PHP/admin/kelola_film.php?msg=Film terpilih berhasil dihapus');
                exit;
            }
        }
    }
}

// Ambil semua film
$films_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?film ?judul ?genre ?durasi ?rating (GROUP_CONCAT(?kategori; separator=\", \") AS ?kategori_list) WHERE {
        ?film a f:Film ;
              f:judul ?judul .
        OPTIONAL { ?film f:genre ?genre . }
        OPTIONAL { ?film f:durasi ?durasi . }
        OPTIONAL { ?film f:rating_film ?rating . }
        OPTIONAL { ?film f:kategoriSection ?kategori . }
    } GROUP BY ?film ?judul ?genre ?durasi ?rating
");
$films = get_bindings($films_result ?? []);

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
            <a href="/FILMKU_PHP/admin/kelola_film.php" class="nav-link active" style="display: block; padding: 12px 20px; border-radius: 0; border: none; border-left: 3px solid var(--primary); background: rgba(229,9,20,0.1);">
                🎬 Kelola Film
            </a>
        </div>
    </aside>

    <!-- Konten Kelola -->
    <div class="content-area">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 28px;">
            <div>
                <h1 class="section-title-main" style="margin-bottom: 4px;">Kelola Film</h1>
                <p style="color: var(--text-muted); font-size: 14px;">Tambah, ubah, dan hapus daftar film yang tayang.</p>
            </div>
            <a href="/FILMKU_PHP/admin/tambah_film.php" class="btn-primary" style="padding: 10px 20px; width:auto; margin:0;">
                + Tambah Film
            </a>
        </div>

        <?php if (isset($_GET['msg'])): ?>
        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: var(--green); padding: 12px 16px; border-radius: var(--radius-sm); margin-bottom: 20px; font-size: 14px; font-weight: 600;">
            ✅ <?= htmlspecialchars($_GET['msg']) ?>
        </div>
        <?php endif; ?>

        <form action="/FILMKU_PHP/admin/kelola_film.php" method="POST" id="bulkDeleteForm">
            <input type="hidden" name="action" value="bulk_delete">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px;">
                <button type="submit" class="btn-primary" style="background: rgba(229,9,20,0.8); border: 1px solid var(--primary); padding: 8px 16px; margin: 0; width: auto;" onclick="return confirm('Yakin ingin menghapus semua film yang dipilih?');">
                    🗑️ Hapus Terpilih
                </button>
            </div>
            
            <div class="sidebar-card" style="padding: 0; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border-subtle);">
                            <th style="padding: 16px 20px; width: 40px;"><input type="checkbox" id="selectAll" style="accent-color: var(--primary); transform: scale(1.2); cursor: pointer;"></th>
                            <th style="padding: 16px 20px; font-size: 13px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Judul Film</th>
                            <th style="padding: 16px 20px; font-size: 13px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Genre</th>
                            <th style="padding: 16px 20px; font-size: 13px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Section</th>
                            <th style="padding: 16px 20px; font-size: 13px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Durasi</th>
                            <th style="padding: 16px 20px; font-size: 13px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Rating</th>
                            <th style="padding: 16px 20px; font-size: 13px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; text-align:right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($films)): ?>
                        <tr>
                            <td colspan="6" style="padding: 40px; text-align: center; color: var(--text-muted);">Belum ada film.</td>
                        </tr>
                        <?php else: ?>
                        <?php foreach ($films as $film): 
                            $uri = $film['film']['value'];
                            $id = substr($uri, strrpos($uri, '#') + 1);
                        ?>
                        <tr style="border-bottom: 1px solid var(--border-subtle); transition: var(--transition);">
                            <td style="padding: 16px 20px;"><input type="checkbox" name="film_ids[]" value="<?= htmlspecialchars($id) ?>" class="film-checkbox" style="accent-color: var(--primary); transform: scale(1.2); cursor: pointer;"></td>
                            <td style="padding: 16px 20px; font-weight: 600; color: var(--text-primary);">
                                <?= htmlspecialchars($film['judul']['value'] ?? 'Tanpa Judul') ?>
                            </td>
                            <td style="padding: 16px 20px; color: var(--text-secondary); font-size: 14px;">
                                <span style="background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 4px;"><?= htmlspecialchars($film['genre']['value'] ?? '-') ?></span>
                            </td>
                            <td style="padding: 16px 20px; color: var(--text-secondary); font-size: 14px;">
                                <span style="background: rgba(229,9,20,0.1); color: var(--primary); padding: 4px 10px; border-radius: 4px; font-weight:600;"><?= htmlspecialchars($film['kategori_list']['value'] ?? 'Umum') ?></span>
                            </td>
                            <td style="padding: 16px 20px; color: var(--text-secondary); font-size: 14px;">
                                <?= htmlspecialchars($film['durasi']['value'] ?? '-') ?>
                            </td>
                            <td style="padding: 16px 20px; color: var(--text-secondary); font-size: 14px;">
                                ⭐ <?= htmlspecialchars($film['rating']['value'] ?? '-') ?>
                            </td>
                            <td style="padding: 16px 20px; text-align:right;">
                                <a href="/FILMKU_PHP/admin/edit_film.php?id=<?= urlencode($id) ?>" style="display:inline-block; padding: 6px 12px; background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: var(--blue); border-radius: 4px; font-size: 13px; font-weight: 600; margin-right: 8px;">Edit</a>
                                
                                <a href="/FILMKU_PHP/admin/hapus_film.php?id=<?= urlencode($id) ?>" onclick="return confirm('Yakin ingin menghapus film ini beserta jadwal dan kursinya?');" style="display:inline-block; padding: 6px 12px; background: rgba(229,9,20,0.15); border: 1px solid rgba(229,9,20,0.3); color: var(--primary); border-radius: 4px; font-size: 13px; font-weight: 600;">Hapus</a>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </form>

        <script>
            document.getElementById('selectAll').addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.film-checkbox');
                for (const checkbox of checkboxes) {
                    checkbox.checked = this.checked;
                }
            });
        </script>
    </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
