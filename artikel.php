<?php
// ============================================================
//  FILMKU — Halaman Detail Artikel (Cine-Community)
// ============================================================
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/config/sparql.php';

$article_uri = urldecode($_GET['id'] ?? '');
if (empty($article_uri)) {
    header('Location: /FILMKU_PHP/community.php');
    exit;
}

// ── Fetch artikel berdasarkan URI ──
$q = "PREFIX f: <" . ONTOLOGY_PREFIX . ">
SELECT ?judul ?konten ?thumbnail ?penulis ?tanggal ?filmRelated WHERE {
    <{$article_uri}> f:judulArtikel ?judul .
    OPTIONAL { <{$article_uri}> f:kontenArtikel ?konten . }
    OPTIONAL { <{$article_uri}> f:thumbnailArtikel ?thumbnail . }
    OPTIONAL { <{$article_uri}> f:penulisArtikel ?penulis . }
    OPTIONAL { <{$article_uri}> f:tanggalArtikel ?tanggal . }
    OPTIONAL { <{$article_uri}> f:relatedFilm ?filmRelated . }
}";
$res      = sparql_query($q);
$bindings = get_bindings($res ?? []);

if (empty($bindings)) {
    header('Location: /FILMKU_PHP/community.php');
    exit;
}

$data      = $bindings[0];
$judul     = $data['judul']['value'] ?? 'Artikel';
$konten    = $data['konten']['value'] ?? '';
$thumbnail = $data['thumbnail']['value'] ?? '';
$penulis   = $data['penulis']['value'] ?? 'Tim FILMKU';
$tanggal   = $data['tanggal']['value'] ?? '';
$filmRelated = $data['filmRelated']['value'] ?? '';

$page_title = $judul;
$active_nav = 'community';

// ── Cari IMDB link film terkait (jika ada) ──
$film_imdb = $filmRelated ? 'https://www.imdb.com/find/?q=' . urlencode($filmRelated) . '&s=tt' : '';
$film_tmdb = $filmRelated ? 'https://www.themoviedb.org/search?query=' . urlencode($filmRelated) : '';

// ── Fetch komentar artikel ini ──
$comments_q = "PREFIX f: <" . ONTOLOGY_PREFIX . ">
SELECT ?komentar ?isi ?penulis ?tanggal WHERE {
    ?komentar a f:KomentarArtikel ;
              f:artikelTarget <{$article_uri}> ;
              f:isiKomentar ?isi ;
              f:penulisKomentar ?penulis ;
              f:tanggalKomentar ?tanggal .
} ORDER BY ASC(?tanggal)";
$comments_res  = sparql_query($comments_q);
$comments      = get_bindings($comments_res ?? []);

// ── Handle POST komentar ──
$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['komentar'])) {
    if (empty($_SESSION['user_name'] ?? '')) {
        $msg = 'error:Harus login untuk berkomentar.';
    } else {
        $isi     = addslashes(trim($_POST['komentar']));
        $puser   = addslashes($_SESSION['user_name']);
        $tgl     = date('Y-m-d H:i:s');
        $kid     = 'KomentarArtikel_' . uniqid();
        $enc_uri = str_replace(['#', ':'], ['%23', '%3A'], $article_uri);

        $uq = "PREFIX f: <" . ONTOLOGY_PREFIX . ">
        INSERT DATA {
            f:{$kid} a f:KomentarArtikel ;
                f:artikelTarget <{$article_uri}> ;
                f:isiKomentar \"{$isi}\" ;
                f:penulisKomentar \"{$puser}\" ;
                f:tanggalKomentar \"{$tgl}\" .
        }";
        $ok = sparql_update($uq);
        if ($ok) {
            header('Location: /FILMKU_PHP/artikel.php?id=' . urlencode($article_uri) . '#komentar');
            exit;
        }
        $msg = 'error:Gagal menyimpan komentar.';
    }
}

require_once __DIR__ . '/includes/header.php';
?>
<link rel="stylesheet" href="/FILMKU_PHP/static/css/community.css">
<style>
/* ── Artikel Page Specific ── */
.artikel-page {
    max-width: 780px;
    margin: 0 auto;
    padding: 48px 24px 80px;
}
.artikel-breadcrumb {
    font-size: 12px;
    color: #475569;
    margin-bottom: 28px;
}
.artikel-breadcrumb a { color: #64748b; text-decoration: none; }
.artikel-breadcrumb a:hover { color: var(--primary); }
.artikel-breadcrumb span { margin: 0 8px; }

.artikel-header { margin-bottom: 32px; }
.artikel-category-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(229,9,20,0.1);
    border: 1px solid rgba(229,9,20,0.2);
    color: #ff6b7a;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 20px;
    margin-bottom: 18px;
}
.artikel-judul {
    font-family: 'Outfit', sans-serif;
    font-size: 38px;
    font-weight: 900;
    color: #fff;
    line-height: 1.2;
    margin-bottom: 20px;
}
.artikel-meta-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 28px;
}
.author-chip-lg {
    display: flex;
    align-items: center;
    gap: 10px;
}
.author-avatar-lg {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), #7c3aed);
    color: #fff;
    font-size: 16px;
    font-weight: 900;
    display: flex; align-items: center; justify-content: center;
}
.author-info-lg { display: flex; flex-direction: column; }
.author-name-lg { font-size: 14px; font-weight: 700; color: #fff; }
.author-role-lg { font-size: 11px; color: #64748b; }
.meta-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.08); }
.meta-info { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 5px; }

.artikel-thumbnail {
    width: 100%;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 36px;
    max-height: 440px;
}
.artikel-thumbnail img {
    width: 100%; height: 100%;
    object-fit: cover;
}

/* Film Related Card */
.film-related-card {
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(229,9,20,0.06);
    border: 1px solid rgba(229,9,20,0.15);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 32px;
}
.film-related-icon {
    width: 38px; height: 38px;
    border-radius: 8px;
    background: rgba(229,9,20,0.12);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    color: var(--primary);
}
.film-related-label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
.film-related-name { font-size: 15px; font-weight: 800; color: #fff; }
.film-related-links { display: flex; gap: 10px; margin-top: 6px; }
.film-ext-link {
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
    text-decoration: none;
    padding: 2px 8px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 4px;
    transition: all 0.2s;
}
.film-ext-link:hover { color: #fff; border-color: rgba(255,255,255,0.2); }

/* Article Body Content */
.artikel-body {
    font-size: 16px;
    line-height: 1.85;
    color: #cbd5e1;
}
.artikel-body h2, .artikel-body h3 {
    font-family: 'Outfit', sans-serif;
    color: #fff;
    margin: 32px 0 14px;
}
.artikel-body h2 { font-size: 24px; font-weight: 800; }
.artikel-body h3 { font-size: 19px; font-weight: 700; }
.artikel-body p { margin-bottom: 18px; }
.artikel-body strong { color: #fff; }
.artikel-body em { color: #94a3b8; }
.artikel-body blockquote {
    border-left: 3px solid var(--primary);
    padding: 12px 20px;
    margin: 24px 0;
    background: rgba(229,9,20,0.05);
    border-radius: 0 8px 8px 0;
    color: #94a3b8;
    font-style: italic;
}
.artikel-body ul, .artikel-body ol {
    padding-left: 24px;
    margin-bottom: 18px;
}
.artikel-body li { margin-bottom: 6px; }

/* Share Row */
.share-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 0;
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin: 40px 0;
}
.share-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
.btn-share {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;
    text-decoration: none; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.08);
    color: #94a3b8; background: rgba(255,255,255,0.04);
}
.btn-share:hover { background: rgba(255,255,255,0.08); color: #fff; }

/* Comments Section */
.comments-section { margin-top: 48px; }
.comments-title {
    font-family: 'Outfit', sans-serif;
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    margin-bottom: 24px;
    display: flex; align-items: center; gap: 10px;
}
.comment-count-badge {
    background: rgba(229,9,20,0.12);
    color: #ff6b7a;
    font-size: 12px;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 12px;
}
.comment-form {
    background: rgba(18,18,29,0.7);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
}
.comment-form h4 { font-size: 14px; font-weight: 700; color: #94a3b8; margin-bottom: 14px; }
.comment-textarea {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
    color: #fff; font-size: 14px; padding: 12px 16px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    resize: vertical; min-height: 90px; box-sizing: border-box;
    transition: border-color 0.2s;
}
.comment-textarea:focus { outline: none; border-color: rgba(229,9,20,0.4); }
.btn-comment-submit {
    margin-top: 12px; background: var(--primary); border: none;
    color: #fff; padding: 10px 22px; border-radius: 7px;
    font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    font-family: 'Plus Jakarta Sans', sans-serif;
}
.btn-comment-submit:hover { background: #c1000e; }
.comments-list { display: flex; flex-direction: column; gap: 16px; }
.comment-card {
    display: flex; gap: 14px;
    padding: 18px 20px;
    background: rgba(18,18,29,0.5);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px;
}
.comment-avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1e3a5f, #7c3aed);
    color: #fff; font-size: 14px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
}
.comment-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.comment-author { font-size: 13px; font-weight: 700; color: #fff; }
.comment-date { font-size: 11px; color: #475569; }
.comment-text { font-size: 14px; color: #94a3b8; line-height: 1.65; }
.no-comments { font-size: 14px; color: #475569; text-align: center; padding: 24px; }
.login-to-comment {
    background: rgba(18,18,29,0.6);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 28px;
    font-size: 14px;
    color: #94a3b8;
    text-align: center;
}
.login-to-comment a { color: var(--primary); font-weight: 700; }
.alert-error-inline { color: #ff6b7a; font-size: 13px; background: rgba(229,9,20,0.08); border: 1px solid rgba(229,9,20,0.2); padding: 10px 16px; border-radius: 7px; margin-bottom: 14px; }
</style>

<div class="artikel-page">

  <!-- Breadcrumb -->
  <div class="artikel-breadcrumb">
    <a href="/FILMKU_PHP/index.php">Beranda</a>
    <span>›</span>
    <a href="/FILMKU_PHP/community.php">Cine-Community</a>
    <span>›</span>
    <span style="color:#94a3b8;"><?= htmlspecialchars(mb_strimwidth($judul, 0, 50, '...')) ?></span>
  </div>

  <!-- Article Header -->
  <div class="artikel-header">
    <div class="artikel-category-badge">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:10px;height:10px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path></svg>
      Artikel Cine-Community
    </div>
    <h1 class="artikel-judul"><?= htmlspecialchars($judul) ?></h1>

    <div class="artikel-meta-row">
      <div class="author-chip-lg">
        <div class="author-avatar-lg"><?= strtoupper(mb_substr($penulis, 0, 1)) ?></div>
        <div class="author-info-lg">
          <span class="author-name-lg"><?= htmlspecialchars($penulis) ?></span>
          <span class="author-role-lg">Editorial FILMKU</span>
        </div>
      </div>
      <?php if ($tanggal): ?>
      <div class="meta-divider"></div>
      <span class="meta-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <?= date('d F Y', strtotime($tanggal)) ?>
      </span>
      <?php endif; ?>
      <div class="meta-divider"></div>
      <span class="meta-info">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <?= max(1, (int)(str_word_count(strip_tags($konten)) / 200)) ?> menit baca
      </span>
    </div>
  </div>

  <!-- Thumbnail -->
  <?php if ($thumbnail): ?>
  <div class="artikel-thumbnail">
    <img src="<?= htmlspecialchars($thumbnail) ?>" alt="<?= htmlspecialchars($judul) ?>">
  </div>
  <?php endif; ?>

  <!-- Film Related Card -->
  <?php if ($filmRelated): ?>
  <div class="film-related-card">
    <div class="film-related-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
    </div>
    <div>
      <div class="film-related-label">Film yang Dibahas</div>
      <div class="film-related-name"><?= htmlspecialchars($filmRelated) ?></div>
      <div class="film-related-links">
        <a href="<?= htmlspecialchars($film_imdb) ?>" target="_blank" rel="noopener" class="film-ext-link">IMDb ↗</a>
        <a href="<?= htmlspecialchars($film_tmdb) ?>" target="_blank" rel="noopener" class="film-ext-link">TMDB ↗</a>
      </div>
    </div>
  </div>
  <?php endif; ?>

  <!-- Article Body -->
  <div class="artikel-body" itemprop="articleBody">
    <?= nl2br($konten) ?>
  </div>

  <!-- Share Row -->
  <div class="share-row">
    <span class="share-label">Bagikan:</span>
    <a href="https://twitter.com/intent/tweet?text=<?= urlencode($judul) ?>&url=<?= urlencode('http://localhost/FILMKU_PHP/artikel.php?id=' . urlencode($article_uri)) ?>" target="_blank" rel="noopener" class="btn-share">
      <svg viewBox="0 0 24 24" fill="currentColor" style="width:13px;height:13px;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      Twitter / X
    </a>
    <a href="https://wa.me/?text=<?= urlencode($judul . ' - ' . 'http://localhost/FILMKU_PHP/artikel.php?id=' . urlencode($article_uri)) ?>" target="_blank" rel="noopener" class="btn-share">
      <svg viewBox="0 0 24 24" fill="currentColor" style="width:13px;height:13px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 16.792c-.18.504-.937 1.031-1.437 1.131-.391.078-.879.14-2.559-.549-2.144-.862-3.514-2.956-3.619-3.092-.104-.136-.851-1.132-.851-2.158 0-1.025.539-1.53.729-1.739.19-.209.416-.261.554-.261.139 0 .277.001.399.007.128.006.299-.049.469.358.174.416.591 1.44.643 1.544.052.104.086.226.017.363-.069.138-.104.224-.208.344-.104.12-.218.268-.312.36-.104.103-.212.214-.091.42.121.205.537.884 1.153 1.432.793.704 1.461.922 1.666 1.025.206.104.325.087.445-.052.121-.14.517-.604.655-.811.138-.207.276-.172.463-.104.188.069 1.194.563 1.399.666.205.104.341.155.392.241.051.085.051.493-.129.997z"/></svg>
      WhatsApp
    </a>
    <a href="javascript:void(0)" onclick="copyLink()" class="btn-share">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
      Salin Link
    </a>
  </div>

  <!-- Comments Section -->
  <div class="comments-section" id="komentar">
    <div class="comments-title">
      💬 Diskusi
      <span class="comment-count-badge"><?= count($comments) ?> Komentar</span>
    </div>

    <!-- Comment Form -->
    <?php if (!empty($_SESSION['user_name'] ?? '')): ?>
    <?php if (str_starts_with($msg, 'error:')): ?>
    <div class="alert-error-inline"><?= htmlspecialchars(substr($msg, 6)) ?></div>
    <?php endif; ?>
    <div class="comment-form">
      <h4>Tulis komentarmu sebagai <strong style="color:#fff;"><?= htmlspecialchars($_SESSION['user_name']) ?></strong></h4>
      <form method="POST">
        <textarea name="komentar" class="comment-textarea" placeholder="Bagikan pendapat atau teorimu tentang artikel ini..." required></textarea>
        <button type="submit" class="btn-comment-submit">Kirim Komentar</button>
      </form>
    </div>
    <?php else: ?>
    <div class="login-to-comment">
      <a href="/FILMKU_PHP/login.php">Login</a> atau <a href="/FILMKU_PHP/register.php">Daftar</a> untuk ikut berdiskusi!
    </div>
    <?php endif; ?>

    <!-- Comment List -->
    <div class="comments-list">
      <?php if (empty($comments)): ?>
      <div class="no-comments">Belum ada komentar. Jadilah yang pertama berdiskusi! 🎬</div>
      <?php else: ?>
      <?php foreach ($comments as $c):
        $c_isi     = htmlspecialchars($c['isi']['value'] ?? '');
        $c_penulis = htmlspecialchars($c['penulis']['value'] ?? 'Anonim');
        $c_tgl     = $c['tanggal']['value'] ?? '';
      ?>
      <div class="comment-card" itemscope itemtype="https://schema.org/Comment">
        <div class="comment-avatar"><?= strtoupper(mb_substr($c_penulis, 0, 1)) ?></div>
        <div style="flex:1;">
          <div class="comment-meta">
            <span class="comment-author" itemprop="author"><?= $c_penulis ?></span>
            <span class="comment-date"><?= $c_tgl ? date('d M Y, H:i', strtotime($c_tgl)) : '' ?></span>
          </div>
          <p class="comment-text" itemprop="text"><?= nl2br($c_isi) ?></p>
        </div>
      </div>
      <?php endforeach; ?>
      <?php endif; ?>
    </div>
  </div>

  <!-- Back Link -->
  <div style="text-align:center; margin-top:48px;">
    <a href="/FILMKU_PHP/community.php" style="color:#64748b; font-size:13px; text-decoration:none;">← Kembali ke Cine-Community</a>
  </div>

</div><!-- /artikel-page -->

<script>
function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = event.target.closest('.btn-share');
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Tersalin!';
        btn.style.color = '#22c55e';
        setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
    });
}
</script>

<!-- ══ JSON-LD Schema.org BlogPosting (Cine-Community) ══ -->
<script type="application/ld+json">
<?php
$json_ld_article = [
    '@context'      => 'https://schema.org',
    '@type'         => 'BlogPosting',
    'headline'      => $judul,
    'image'         => $thumbnail ?: null,
    'datePublished' => $tanggal ?: date('Y-m-d'),
    'dateModified'  => $tanggal ?: date('Y-m-d'),
    'url'           => 'http://localhost/FILMKU_PHP/artikel.php?id=' . urlencode($article_uri),
    'author'        => [
        '@type' => 'Person',
        'name'  => $penulis,
    ],
    'publisher' => [
        '@type' => 'Organization',
        'name'  => 'FILMKU',
        'url'   => 'http://localhost/FILMKU_PHP/',
    ],
    'description' => mb_strimwidth(strip_tags($konten), 0, 200, '...'),
    'inLanguage'  => 'id',
];

// Jika artikel membahas sebuah film → tambahkan entitas Movie + sameAs multi-platform
if ($filmRelated) {
    $json_ld_article['about'] = [
        '@type'  => 'Movie',
        'name'   => $filmRelated,
        'sameAs' => [
            $film_imdb,
            $film_tmdb,
            'https://www.wikidata.org/wiki/Special:Search?search=' . urlencode($filmRelated),
        ],
    ];
}

// Tambahkan komentar sebagai schema Comment
if (!empty($comments)) {
    $json_ld_article['comment'] = array_map(fn($c) => [
        '@type'         => 'Comment',
        'text'          => $c['isi']['value'] ?? '',
        'datePublished' => $c['tanggal']['value'] ?? '',
        'author'        => [
            '@type' => 'Person',
            'name'  => $c['penulis']['value'] ?? 'Anonim',
        ],
    ], $comments);
}

echo json_encode($json_ld_article, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
</script>


<?php require_once __DIR__ . '/includes/footer.php'; ?>
