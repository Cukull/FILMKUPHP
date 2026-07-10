<?php
// ============================================================
//  FILMKU — Cine-Community (Artikel & Diskusi)
// ============================================================
$page_title  = 'Cine-Community';
$active_nav  = 'community';
require_once __DIR__ . '/config/sparql.php';

// ── Fetch Articles dari Fuseki ──
$articles_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?artikel ?judul ?konten ?thumbnail ?penulis ?tanggal ?filmRelated WHERE {
        ?artikel a f:Artikel ;
                 f:judulArtikel ?judul .
        OPTIONAL { ?artikel f:kontenArtikel ?konten . }
        OPTIONAL { ?artikel f:thumbnailArtikel ?thumbnail . }
        OPTIONAL { ?artikel f:penulisArtikel ?penulis . }
        OPTIONAL { ?artikel f:tanggalArtikel ?tanggal . }
        OPTIONAL { ?artikel f:relatedFilm ?filmRelated . }
    } ORDER BY DESC(?tanggal)
");
$articles = get_bindings($articles_result ?? []);

// ── Fetch Forum Posts (DiscussionForumPosting) ──
$forum_result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?post ?judul ?konten ?penulis ?tanggal ?likes ?filmRelated WHERE {
        ?post a f:ForumPost ;
              f:judulPost ?judul .
        OPTIONAL { ?post f:kontenPost ?konten . }
        OPTIONAL { ?post f:penulisPost ?penulis . }
        OPTIONAL { ?post f:tanggalPost ?tanggal . }
        OPTIONAL { ?post f:likesPost ?likes . }
        OPTIONAL { ?post f:relatedFilm ?filmRelated . }
    } ORDER BY DESC(?tanggal)
");
$forum_posts = get_bindings($forum_result ?? []);

require_once __DIR__ . '/includes/header.php';
?>
<link rel="stylesheet" href="/FILMKU_PHP/static/css/community.css">

<div class="community-page">

  <!-- ══ HERO BANNER ══ -->
  <div class="community-hero">
    <div class="community-hero-bg"></div>
    <div class="community-hero-content">
      <div class="community-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Komunitas
      </div>
      <h1 class="community-hero-title">Cine-Community</h1>
      <p class="community-hero-sub">Ruang para pecinta film — baca artikel eksklusif, bagikan pendapat, dan diskusikan film favoritmu bersama komunitas.</p>
      <div class="community-hero-stats">
        <div class="stat-item">
          <span class="stat-num"><?= count($articles) ?></span>
          <span class="stat-label">Artikel</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-num"><?= count($forum_posts) ?></span>
          <span class="stat-label">Diskusi</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ══ TAB NAVIGATION ══ -->
  <div class="community-tabs-wrapper">
    <div class="community-tabs">
      <button class="ctab active" data-tab="articles" onclick="switchTab('articles', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        Artikel &amp; Fakta Film
      </button>
      <button class="ctab" data-tab="forum" onclick="switchTab('forum', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        Forum Diskusi
      </button>
    </div>
    <?php if (isset($_SESSION['current_role']) && $_SESSION['current_role'] === 'admin'): ?>
    <a href="/FILMKU_PHP/admin/kelola_artikel.php" class="btn-new-article">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      Tulis Artikel
    </a>
    <?php endif; ?>
  </div>

  <!-- ══ CONTENT AREA ══ -->
  <div class="community-body">

    <!-- ── ARTICLES TAB ── -->
    <div id="tab-articles" class="tab-content active">
      <?php if (empty($articles)): ?>
      <!-- Empty state -->
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>Belum Ada Artikel</h3>
        <p>Admin belum mempublikasikan artikel. Nantikan konten eksklusif dari tim editorial FILMKU!</p>
        <?php if (isset($_SESSION['current_role']) && $_SESSION['current_role'] === 'admin'): ?>
        <a href="/FILMKU_PHP/admin/kelola_artikel.php" class="btn-primary-sm">Tulis Artikel Pertama</a>
        <?php endif; ?>
      </div>
      <?php else: ?>
      <!-- Featured Article (first) -->
      <?php $featured = $articles[0];
        $feat_judul = htmlspecialchars($featured['judul']['value'] ?? 'Artikel');
        $feat_konten = $featured['konten']['value'] ?? '';
        $feat_penulis = htmlspecialchars($featured['penulis']['value'] ?? 'Tim FILMKU');
        $feat_tanggal = htmlspecialchars($featured['tanggal']['value'] ?? '');
        $feat_thumb = htmlspecialchars($featured['thumbnail']['value'] ?? 'https://via.placeholder.com/1200x500/1a1a2e/e5091477?text=FILMKU+Article');
        $feat_id = urlencode($featured['artikel']['value'] ?? '');
      ?>
      <article class="featured-article" itemscope itemtype="https://schema.org/BlogPosting">
        <meta itemprop="datePublished" content="<?= $feat_tanggal ?>">
        <meta itemprop="author" content="<?= $feat_penulis ?>">
        <div class="featured-article-img">
          <img src="<?= $feat_thumb ?>" alt="<?= $feat_judul ?>" itemprop="image">
          <div class="featured-badge">Featured</div>
        </div>
        <div class="featured-article-body">
          <div class="article-meta">
            <span class="article-category">Artikel Pilihan</span>
            <span class="article-date"><?= $feat_tanggal ? date('d M Y', strtotime($feat_tanggal)) : 'Baru saja' ?></span>
          </div>
          <h2 class="featured-title" itemprop="headline"><?= $feat_judul ?></h2>
          <p class="featured-excerpt" itemprop="description"><?= htmlspecialchars(mb_strimwidth(strip_tags($feat_konten), 0, 220, '...')) ?></p>
          <div class="article-footer">
            <div class="author-chip">
              <div class="author-avatar"><?= strtoupper(mb_substr($feat_penulis, 0, 1)) ?></div>
              <span itemprop="author" itemscope itemtype="https://schema.org/Person">
                <span itemprop="name"><?= $feat_penulis ?></span>
              </span>
            </div>
            <a href="/FILMKU_PHP/artikel.php?id=<?= $feat_id ?>" class="btn-read-more">
              Baca Selengkapnya
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
        </div>
      </article>

      <!-- Article Grid -->
      <?php if (count($articles) > 1): ?>
      <div class="articles-section-title">
        <h3>Semua Artikel</h3>
        <div class="section-line"></div>
      </div>
      <div class="articles-grid">
        <?php foreach (array_slice($articles, 1) as $art):
          $art_judul    = htmlspecialchars($art['judul']['value'] ?? 'Artikel');
          $art_konten   = $art['konten']['value'] ?? '';
          $art_penulis  = htmlspecialchars($art['penulis']['value'] ?? 'Tim FILMKU');
          $art_tanggal  = $art['tanggal']['value'] ?? '';
          $art_thumb    = htmlspecialchars($art['thumbnail']['value'] ?? 'https://via.placeholder.com/600x400/1a1a2e/e50914?text=Article');
          $art_id       = urlencode($art['artikel']['value'] ?? '');
        ?>
        <article class="article-card" itemscope itemtype="https://schema.org/BlogPosting">
          <a href="/FILMKU_PHP/artikel.php?id=<?= $art_id ?>" class="article-card-link">
            <div class="article-card-img">
              <img src="<?= $art_thumb ?>" alt="<?= $art_judul ?>" itemprop="image" loading="lazy">
              <div class="article-card-overlay"></div>
            </div>
            <div class="article-card-body">
              <div class="article-meta">
                <span class="article-category">Artikel</span>
                <span class="article-date"><?= $art_tanggal ? date('d M Y', strtotime($art_tanggal)) : 'Baru saja' ?></span>
              </div>
              <h3 class="article-card-title" itemprop="headline"><?= $art_judul ?></h3>
              <p class="article-card-excerpt" itemprop="description"><?= htmlspecialchars(mb_strimwidth(strip_tags($art_konten), 0, 120, '...')) ?></p>
              <div class="article-author-row">
                <div class="author-avatar-sm"><?= strtoupper(mb_substr($art_penulis, 0, 1)) ?></div>
                <span class="author-name-sm" itemprop="author"><?= $art_penulis ?></span>
              </div>
            </div>
          </a>
        </article>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>
      <?php endif; ?>
    </div><!-- /tab-articles -->

    <!-- ── FORUM TAB ── -->
    <div id="tab-forum" class="tab-content">

      <!-- New Thread Button -->
      <?php if (!empty($_SESSION['user_name'])): ?>
      <div class="forum-toolbar">
        <button class="btn-new-thread" onclick="toggleNewThread()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Mulai Diskusi Baru
        </button>
      </div>

      <!-- New Thread Form -->
      <div class="new-thread-form" id="newThreadForm" style="display:none;">
        <form method="POST" action="/FILMKU_PHP/proses_forum.php">
          <input type="hidden" name="action" value="new_thread">
          <div class="form-group-community">
            <label>Judul Diskusi</label>
            <input type="text" name="judul" placeholder="Contoh: Teori tersembunyi di balik ending Interstellar..." required class="community-input">
          </div>
          <div class="form-group-community">
            <label>Isi Diskusi</label>
            <textarea name="konten" rows="5" placeholder="Tulis opini, teori, atau pertanyaanmu di sini..." required class="community-textarea"></textarea>
          </div>
          <div class="form-group-community">
            <label>Film Terkait (opsional)</label>
            <input type="text" name="film_related" placeholder="Nama film..." class="community-input">
          </div>
          <div class="form-actions">
            <button type="button" onclick="toggleNewThread()" class="btn-cancel-thread">Batal</button>
            <button type="submit" class="btn-submit-thread">Publikasikan</button>
          </div>
        </form>
      </div>
      <?php else: ?>
      <div class="login-prompt-forum">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:24px;height:24px;color:var(--primary)"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <p>Ingin ikut berdiskusi? <a href="/FILMKU_PHP/login.php">Login</a> atau <a href="/FILMKU_PHP/register.php">Daftar</a> dulu yuk!</p>
      </div>
      <?php endif; ?>

      <!-- Forum Posts -->
      <?php if (empty($forum_posts)): ?>
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <h3>Forum Masih Sepi</h3>
        <p>Jadilah yang pertama memulai diskusi seru tentang film favoritmu!</p>
      </div>
      <?php else: ?>
      <div class="forum-list">
        <?php foreach ($forum_posts as $post):
          $p_id      = urlencode($post['post']['value'] ?? '');
          $p_judul   = htmlspecialchars($post['judul']['value'] ?? 'Diskusi');
          $p_konten  = $post['konten']['value'] ?? '';
          $p_penulis = htmlspecialchars($post['penulis']['value'] ?? 'Anonim');
          $p_tgl     = $post['tanggal']['value'] ?? '';
          $p_likes   = intval($post['likes']['value'] ?? 0);
          $p_film    = htmlspecialchars($post['filmRelated']['value'] ?? '');
        ?>
        <div class="forum-post-card" itemscope itemtype="https://schema.org/DiscussionForumPosting">
          <meta itemprop="datePublished" content="<?= $p_tgl ?>">
          <div class="forum-post-left">
            <div class="forum-avatar"><?= strtoupper(mb_substr($p_penulis, 0, 1)) ?></div>
          </div>
          <div class="forum-post-body">
            <div class="forum-post-header">
              <span class="forum-author" itemprop="author"><?= $p_penulis ?></span>
              <?php if ($p_film): ?>
              <span class="forum-film-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:10px;height:10px;"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                <?= $p_film ?>
              </span>
              <?php endif; ?>
              <span class="forum-date"><?= $p_tgl ? date('d M Y', strtotime($p_tgl)) : 'Baru saja' ?></span>
            </div>
            <h3 class="forum-post-title" itemprop="headline">
              <a href="/FILMKU_PHP/forum_detail.php?id=<?= $p_id ?>"><?= $p_judul ?></a>
            </h3>
            <p class="forum-post-excerpt" itemprop="text"><?= htmlspecialchars(mb_strimwidth(strip_tags($p_konten), 0, 180, '...')) ?></p>
            <div class="forum-post-footer">
              <button class="btn-like-post" onclick="likePost('<?= $p_id ?>', this)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span class="like-count"><?= $p_likes ?></span>
              </button>
              <a href="/FILMKU_PHP/forum_detail.php?id=<?= $p_id ?>" class="btn-forum-reply">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                Balas &amp; Diskusi
              </a>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
      <?php endif; ?>
    </div><!-- /tab-forum -->

  </div><!-- /community-body -->
</div><!-- /community-page -->

<script>
function switchTab(tabName, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    btn.classList.add('active');
}
function toggleNewThread() {
    const form = document.getElementById('newThreadForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
function likePost(postId, btn) {
    fetch('/FILMKU_PHP/proses_forum.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'action=like&post_id=' + encodeURIComponent(postId)
    }).then(r => r.json()).then(data => {
        if (data.success) {
            btn.querySelector('.like-count').textContent = data.likes;
            btn.classList.toggle('liked');
        }
    });
}
</script>

<!-- JSON-LD: BlogPosting + DiscussionForumPosting -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://filmku.local/FILMKU_PHP/community.php",
      "name": "Cine-Community — FILMKU",
      "description": "Ruang diskusi dan artikel eksklusif bagi para pencinta film di FILMKU.",
      "url": "/FILMKU_PHP/community.php"
    }
    <?php foreach ($articles as $art):
      $a_judul   = addslashes($art['judul']['value'] ?? '');
      $a_konten  = addslashes(strip_tags($art['konten']['value'] ?? ''));
      $a_penulis = addslashes($art['penulis']['value'] ?? 'Tim FILMKU');
      $a_tgl     = $art['tanggal']['value'] ?? date('Y-m-d');
      $a_thumb   = $art['thumbnail']['value'] ?? '';
    ?>,
    {
      "@type": "BlogPosting",
      "headline": "<?= $a_judul ?>",
      "description": "<?= mb_strimwidth($a_konten, 0, 200, '...') ?>",
      "image": "<?= htmlspecialchars($a_thumb) ?>",
      "datePublished": "<?= $a_tgl ?>",
      "author": { "@type": "Person", "name": "<?= $a_penulis ?>" },
      "publisher": { "@type": "Organization", "name": "FILMKU", "url": "/FILMKU_PHP/" }
    }
    <?php endforeach; ?>
    <?php foreach ($forum_posts as $post):
      $fp_judul   = addslashes($post['judul']['value'] ?? '');
      $fp_konten  = addslashes(strip_tags($post['konten']['value'] ?? ''));
      $fp_penulis = addslashes($post['penulis']['value'] ?? 'Anonim');
      $fp_tgl     = $post['tanggal']['value'] ?? date('Y-m-d');
    ?>,
    {
      "@type": "DiscussionForumPosting",
      "headline": "<?= $fp_judul ?>",
      "text": "<?= mb_strimwidth($fp_konten, 0, 200, '...') ?>",
      "datePublished": "<?= $fp_tgl ?>",
      "author": { "@type": "Person", "name": "<?= $fp_penulis ?>" }
    }
    <?php endforeach; ?>
  ]
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
