<?php
// ============================================================
//  FILMKU Admin — Kelola Artikel (Cine-Community)
// ============================================================
$page_title = 'Kelola Artikel';
$active_nav = 'admin';
require_once __DIR__ . '/../config/sparql.php';

// Guard: hanya admin
if (session_status() === PHP_SESSION_NONE) session_start();
if (($_SESSION['current_role'] ?? '') !== 'admin') {
    header('Location: /FILMKU_PHP/login.php'); exit;
}

$msg = '';

// ── HANDLE FORM SUBMIT ──
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $act = $_POST['action'] ?? '';

    if ($act === 'tambah') {
        $judul   = addslashes(trim($_POST['judul'] ?? ''));
        $konten  = addslashes(trim($_POST['konten'] ?? ''));
        $thumb   = addslashes(trim($_POST['thumbnail'] ?? ''));
        $film    = addslashes(trim($_POST['film_related'] ?? ''));
        $penulis = addslashes($_SESSION['user_name'] ?? 'Admin');
        $tanggal = date('Y-m-d');
        $id      = 'Artikel_' . uniqid();

        $film_triple = $film ? "f:{$id} f:relatedFilm \"{$film}\" ." : '';

        // Gunakan """ (triple quotes) untuk konten agar bisa menampung enter (newline) di SPARQL
        $q = "PREFIX f: <" . ONTOLOGY_PREFIX . ">
        INSERT DATA {
            f:{$id} a f:Artikel ;
                f:judulArtikel \"{$judul}\" ;
                f:kontenArtikel \"\"\"{$konten}\"\"\" ;
                f:thumbnailArtikel \"{$thumb}\" ;
                f:penulisArtikel \"{$penulis}\" ;
                f:tanggalArtikel \"{$tanggal}\" .
            {$film_triple}
        }";
        $ok = sparql_update($q);
        $msg = $ok ? '<div class="alert-success">✓ Artikel berhasil dipublikasikan!</div>'
                   : '<div class="alert-error">✗ Gagal menyimpan artikel. Pastikan teks tidak mengandung karakter aneh yang merusak query.</div>';
    }

    if ($act === 'hapus') {
        $uri = $_POST['uri'] ?? '';
        if ($uri) {
            $q = "PREFIX f: <" . ONTOLOGY_PREFIX . ">
            DELETE WHERE { <{$uri}> ?p ?o }";
            $ok = sparql_update($q);
            $msg = $ok ? '<div class="alert-success">✓ Artikel dihapus.</div>'
                       : '<div class="alert-error">✗ Gagal menghapus.</div>';
        }
    }
}

// ── FETCH ARTICLES ──
$res  = sparql_query("PREFIX f: <" . ONTOLOGY_PREFIX . "> SELECT ?artikel ?judul ?penulis ?tanggal ?thumbnail WHERE { ?artikel a f:Artikel ; f:judulArtikel ?judul . OPTIONAL { ?artikel f:penulisArtikel ?penulis . } OPTIONAL { ?artikel f:tanggalArtikel ?tanggal . } OPTIONAL { ?artikel f:thumbnailArtikel ?thumbnail . } } ORDER BY DESC(?tanggal)");
$articles = get_bindings($res ?? []);

require_once __DIR__ . '/../includes/header.php';
?>
<style>
.admin-article-page { max-width: 1000px; margin: 0 auto; padding: 40px 24px; }
.admin-article-page h1 { font-family:'Outfit',sans-serif; font-size:28px; font-weight:900; color:#fff; margin-bottom:8px; }
.admin-article-page .subtitle { color:#64748b; font-size:14px; margin-bottom:36px; }
.form-card { background:rgba(18,18,29,0.8); border:1px solid rgba(255,255,255,0.07); border-radius:14px; padding:32px; margin-bottom:40px; }
.form-card h2 { font-size:16px; font-weight:800; color:#fff; margin-bottom:24px; font-family:'Outfit',sans-serif; }
.fg { margin-bottom:20px; }
.fg label { display:block; font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
.fg input, .fg textarea {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:8px; color:#fff; font-size:14px; padding:12px 16px;
    font-family:'Plus Jakarta Sans',sans-serif; box-sizing:border-box; transition:border-color 0.2s;
}
.fg input:focus, .fg textarea:focus { outline:none; border-color:rgba(229,9,20,0.4); }
.fg textarea { min-height:200px; resize:vertical; }
.btn-publish { background:var(--primary); color:#fff; border:none; padding:12px 28px; border-radius:8px; font-size:14px; font-weight:700; cursor:pointer; }
.btn-publish:hover { background:#c1000e; }
.articles-table { width:100%; border-collapse:collapse; }
.articles-table th { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px; padding:10px 14px; text-align:left; border-bottom:1px solid rgba(255,255,255,0.05); }
.articles-table td { padding:14px; border-bottom:1px solid rgba(255,255,255,0.04); color:#94a3b8; font-size:13px; vertical-align:middle; }
.articles-table tr:hover td { background:rgba(255,255,255,0.02); }
.art-title-cell { color:#fff; font-weight:700; }
.btn-delete { background:rgba(229,9,20,0.12); border:1px solid rgba(229,9,20,0.2); color:#ff6b7a; font-size:12px; font-weight:700; padding:5px 12px; border-radius:5px; cursor:pointer; }
.btn-delete:hover { background:rgba(229,9,20,0.25); }
.alert-success { background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.25); color:#86efac; padding:12px 18px; border-radius:8px; margin-bottom:20px; font-size:13px; font-weight:600; }
.alert-error { background:rgba(229,9,20,0.12); border:1px solid rgba(229,9,20,0.2); color:#ff6b7a; padding:12px 18px; border-radius:8px; margin-bottom:20px; font-size:13px; font-weight:600; }
</style>

<div class="admin-article-page">
  <h1>✏️ Kelola Artikel</h1>
  <p class="subtitle">Publikasikan artikel, fakta film, dan konten editorial untuk halaman Cine-Community.</p>

  <?= $msg ?>

  <!-- Form Tambah Artikel -->
  <div class="form-card">
    <h2>Tulis Artikel Baru</h2>
    <form method="POST">
      <input type="hidden" name="action" value="tambah">
      <div class="fg">
        <label>Judul Artikel</label>
        <input type="text" name="judul" placeholder='Contoh: "5 Fakta Tersembunyi di Balik Sinematografi Interstellar"' required>
      </div>
      <div class="fg">
        <label>Film Terkait (Opsional)</label>
        <input type="text" name="film_related" placeholder="Ketik nama film untuk memunculkan Metadata Semantik (JSON-LD) Movie">
      </div>
      <div class="fg">
        <label>URL Thumbnail (Gambar Sampul)</label>
        <input type="url" name="thumbnail" placeholder="https://...">
      </div>
      <div class="fg">
        <label>Konten Artikel (HTML diperbolehkan)</label>
        <textarea name="konten" placeholder="Tulis isi artikel di sini. Kamu bisa menggunakan &lt;b&gt;, &lt;i&gt;, &lt;p&gt;, &lt;h3&gt;, dll." required></textarea>
      </div>
      <button type="submit" class="btn-publish">Publikasikan Artikel</button>
    </form>
  </div>

  <!-- Daftar Artikel -->
  <div class="form-card">
    <h2>Artikel yang Sudah Diterbitkan (<?= count($articles) ?>)</h2>
    <?php if (empty($articles)): ?>
    <p style="color:#64748b;font-size:14px;">Belum ada artikel. Tulis artikel pertamamu di atas!</p>
    <?php else: ?>
    <table class="articles-table">
      <thead>
        <tr>
          <th>Judul</th>
          <th>Penulis</th>
          <th>Tanggal</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($articles as $art):
          $uri    = $art['artikel']['value'] ?? '';
          $judul  = htmlspecialchars($art['judul']['value'] ?? '');
          $penulis= htmlspecialchars($art['penulis']['value'] ?? '-');
          $tgl    = $art['tanggal']['value'] ?? '-';
        ?>
        <tr>
          <td class="art-title-cell"><?= $judul ?></td>
          <td><?= $penulis ?></td>
          <td><?= $tgl ?></td>
          <td>
            <form method="POST" onsubmit="return confirm('Hapus artikel ini?')">
              <input type="hidden" name="action" value="hapus">
              <input type="hidden" name="uri" value="<?= htmlspecialchars($uri) ?>">
              <button type="submit" class="btn-delete">Hapus</button>
            </form>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <?php endif; ?>
  </div>

  <div style="text-align:center;">
    <a href="/FILMKU_PHP/community.php" style="color:#64748b;font-size:13px;text-decoration:none;">← Kembali ke Cine-Community</a>
  </div>
</div>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
