<?php
// ============================================================
//  FILMKU — Edit Film
// ============================================================
$page_title = 'Edit Film';
$active_nav = 'admin';
require_once __DIR__ . '/../config/sparql.php';

session_start();
if (empty($_SESSION['user_name']) || $_SESSION['current_role'] !== 'admin') {
    header('Location: /FILMKU_PHP/login.php');
    exit;
}

$id = trim($_GET['id'] ?? '');
if (!$id) {
    header('Location: /FILMKU_PHP/admin/kelola_film.php');
    exit;
}
$id_safe = addslashes(preg_replace('/[^a-zA-Z0-9_\-]/', '', $id));

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $judul    = trim($_POST['judul'] ?? '');
    $genre_arr = $_POST['genre'] ?? [];
    $genre     = is_array($genre_arr) ? implode(', ', $genre_arr) : trim($genre_arr);
    $durasi   = trim($_POST['durasi'] ?? '');
    $rating   = trim($_POST['rating'] ?? '');
    $sinopsis = trim($_POST['sinopsis'] ?? '');
    $poster   = trim($_POST['poster'] ?? 'default.jpg');
    $trailer  = trim($_POST['trailer'] ?? '');
    $rotten   = trim($_POST['rating_rotten_tomatoes'] ?? '');
    $meta     = trim($_POST['rating_metacritic'] ?? '');
    
    $kategoris = $_POST['kategoriSection'] ?? [];
    if (!is_array($kategoris)) {
        $kategoris = [$kategoris];
    }
    $kategori_new = trim($_POST['kategoriSection_new'] ?? '');
    if ($kategori_new) {
        $kategoris[] = $kategori_new;
    }

    if ($judul) {
        $judul_safe    = addslashes($judul);
        $genre_safe    = addslashes($genre);
        $durasi_safe   = addslashes($durasi);
        $rating_safe   = addslashes($rating);
        $sinopsis_safe = addslashes($sinopsis);
        $poster_safe   = addslashes($poster);
        $trailer_safe  = addslashes($trailer);
        $rotten_safe   = addslashes($rotten);
        $meta_safe     = addslashes($meta);
        
        $insert_kategori = "";
        foreach ($kategoris as $kat) {
            $kat_safe = addslashes(trim($kat));
            if ($kat_safe) {
                $insert_kategori .= " f:$id_safe f:kategoriSection \"$kat_safe\" .\n";
            }
        }

        // Hapus property lama lalu insert yang baru (SPARQL 1.1)
        $query = "
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            DELETE {
                f:$id_safe f:judul ?old_judul ;
                           f:genre ?old_genre ;
                           f:durasi ?old_durasi ;
                           f:rating_film ?old_rating ;
                           f:sinopsis ?old_sinopsis ;
                           f:poster_film ?old_poster ;
                           f:trailer_film ?old_trailer ;
                           f:ratingRottenTomatoes ?old_rotten ;
                           f:ratingMetacritic ?old_meta ;
                           f:kategoriSection ?old_kategori .
            }
            WHERE {
                OPTIONAL { f:$id_safe f:judul ?old_judul }
                OPTIONAL { f:$id_safe f:genre ?old_genre }
                OPTIONAL { f:$id_safe f:durasi ?old_durasi }
                OPTIONAL { f:$id_safe f:rating_film ?old_rating }
                OPTIONAL { f:$id_safe f:sinopsis ?old_sinopsis }
                OPTIONAL { f:$id_safe f:poster_film ?old_poster }
                OPTIONAL { f:$id_safe f:trailer_film ?old_trailer }
                OPTIONAL { f:$id_safe f:ratingRottenTomatoes ?old_rotten }
                OPTIONAL { f:$id_safe f:ratingMetacritic ?old_meta }
                OPTIONAL { f:$id_safe f:kategoriSection ?old_kategori }
            };
            
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            INSERT DATA {
                f:$id_safe f:judul \"$judul_safe\" ;
                           f:genre \"$genre_safe\" ;
                           f:durasi \"$durasi_safe\" ;
                           f:rating_film \"$rating_safe\" ;
                           f:sinopsis \"$sinopsis_safe\" ;
                           f:poster_film \"$poster_safe\" ;
                           f:trailer_film \"$trailer_safe\" ;
                           f:ratingRottenTomatoes \"$rotten_safe\" ;
                           f:ratingMetacritic \"$meta_safe\" .
                $insert_kategori
            }
        ";

        if (sparql_update($query)) {
            header('Location: /FILMKU_PHP/admin/kelola_film.php?msg=Data film berhasil diubah');
            exit;
        } else {
            $error = 'Gagal menyimpan ke database (Fuseki).';
        }
    } else {
        $error = 'Judul wajib diisi.';
    }
}

// Ambil data film saat ini
$result = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?judul ?genre ?durasi ?rating ?sinopsis ?poster ?trailer ?rotten ?meta
           (GROUP_CONCAT(?kategori; separator=\"||\") AS ?kategori_list)
    WHERE {
        f:$id_safe f:judul ?judul .
        OPTIONAL { f:$id_safe f:genre ?genre }
        OPTIONAL { f:$id_safe f:durasi ?durasi }
        OPTIONAL { f:$id_safe f:rating_film ?rating }
        OPTIONAL { f:$id_safe f:sinopsis ?sinopsis }
        OPTIONAL { f:$id_safe f:poster_film ?poster }
        OPTIONAL { f:$id_safe f:trailer_film ?trailer }
        OPTIONAL { f:$id_safe f:ratingRottenTomatoes ?rotten }
        OPTIONAL { f:$id_safe f:ratingMetacritic ?meta }
        OPTIONAL { f:$id_safe f:kategoriSection ?kategori }
    } GROUP BY ?judul ?genre ?durasi ?rating ?sinopsis ?poster ?trailer ?rotten ?meta LIMIT 1
");
$row = get_bindings($result ?? [])[0] ?? null;

// Ambil list section
$cat_query = sparql_query("
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT DISTINCT ?kategori WHERE {
        ?film f:kategoriSection ?kategori .
    }
");
$cat_bindings = get_bindings($cat_query ?? []);
$existing_sections = [];
foreach ($cat_bindings as $cb) {
    if (!empty($cb['kategori']['value'])) {
        $existing_sections[] = $cb['kategori']['value'];
    }
}

if (!$row) {
    header('Location: /FILMKU_PHP/admin/kelola_film.php');
    exit;
}

require_once __DIR__ . '/../includes/header.php';
?>

<div class="main-layout" style="padding-top: 40px; justify-content: center;">
    <div class="content-area" style="max-width: 600px; flex: none;">
        <div style="display:flex; align-items:center; gap: 14px; margin-bottom: 28px;">
            <a href="/FILMKU_PHP/admin/kelola_film.php" style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-glass); display:flex; align-items:center; justify-content:center; border: 1px solid var(--border-subtle); transition: var(--transition);">
                ←
            </a>
            <h1 class="section-title-main" style="margin: 0;">Edit Film</h1>
        </div>

        <div class="sidebar-card">
            <?php if ($error): ?>
            <div class="alert-error"><span>⚠️</span> <?= htmlspecialchars($error) ?></div>
            <?php endif; ?>

            <form action="/FILMKU_PHP/admin/edit_film.php?id=<?= urlencode($id) ?>" method="POST">
                <div class="form-group" style="position: relative;">
                    <label>Judul Film</label>
                    <div style="display: flex; gap: 10px;">
                        <input type="text" name="judul" id="inputJudul" class="form-control" required 
                               value="<?= htmlspecialchars($row['judul']['value'] ?? '') ?>" style="flex: 1;">
                        <button type="button" id="btnFetchOMDB" style="background: var(--primary); color: #fff; border: none; padding: 0 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px; transition: background 0.2s;">
                            Tarik Data OMDB
                        </button>
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Rating (1-10)</label>
                        <input type="number" step="0.1" name="rating" class="form-control" 
                               value="<?= htmlspecialchars($row['rating']['value'] ?? '') ?>">
                    </div>
                    <div class="form-group">
                        <label>Durasi</label>
                        <input type="text" name="durasi" class="form-control" 
                               value="<?= htmlspecialchars($row['durasi']['value'] ?? '') ?>">
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
                    <div class="form-group">
                        <label>Rating Rotten Tomatoes</label>
                        <input type="text" name="rating_rotten_tomatoes" id="inputRotten" class="form-control" 
                               value="<?= htmlspecialchars($row['rotten']['value'] ?? '') ?>" placeholder="Contoh: 85%">
                    </div>
                    <div class="form-group">
                        <label>Rating Metacritic</label>
                        <input type="text" name="rating_metacritic" id="inputMeta" class="form-control" 
                               value="<?= htmlspecialchars($row['meta']['value'] ?? '') ?>" placeholder="Contoh: 73/100">
                    </div>
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label>Genre</label>
                        <div data-lenis-prevent style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; background-color: var(--bg-surface); padding: 15px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); max-height: 200px; overflow-y: auto;">
                            <?php
                            $current_genres_string = $row['genre']['value'] ?? '';
                            $current_genres_array = array_map('trim', explode(',', $current_genres_string));
                            $genres = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction', 'TV Movie', 'Thriller', 'War', 'Western'];
                            foreach ($genres as $g) {
                                $checked = in_array($g, $current_genres_array) ? 'checked' : '';
                                echo "<label style=\"display: flex; align-items: center; gap: 8px; cursor: pointer; color: rgba(255,255,255,0.8); font-size: 13px;\">";
                                echo "<input type=\"checkbox\" name=\"genre[]\" value=\"$g\" $checked> $g";
                                echo "</label>";
                            }
                            ?>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Kategori Section Dashboard (Pilih 1 atau lebih)</label>
                        <?php $current_kategoris = explode('||', $row['kategori_list']['value'] ?? ''); ?>
                        <div data-lenis-prevent style="background: var(--bg-surface); padding: 10px; border-radius: 4px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 150px; overflow-y: auto;">
                            <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-secondary);">
                                <input type="checkbox" name="kategoriSection[]" value="Sorotan Layar Utama" <?= in_array('Sorotan Layar Utama', $current_kategoris) ? 'checked' : '' ?> style="accent-color:var(--primary);"> Sorotan Layar Utama
                            </label>
                            <?php foreach ($existing_sections as $s): ?>
                                <?php if ($s !== 'Sorotan Layar Utama'): ?>
                                <label style="display:flex; align-items:center; gap:8px; font-size:13px; color:var(--text-secondary);">
                                    <input type="checkbox" name="kategoriSection[]" value="<?= htmlspecialchars($s) ?>" <?= in_array($s, $current_kategoris) ? 'checked' : '' ?> style="accent-color:var(--primary);"> <?= htmlspecialchars($s) ?>
                                </label>
                                <?php endif; ?>
                            <?php endforeach; ?>
                        </div>
                        <input type="text" name="kategoriSection_new" class="form-control" style="margin-top:10px;" placeholder="Atau ketik nama section baru di sini...">
                    </div>
                </div>

                <div class="form-group">
                    <label>Nama File Poster / URL</label>
                    <input type="text" name="poster" class="form-control" 
                           value="<?= htmlspecialchars($row['poster']['value'] ?? '') ?>">
                </div>

                <div class="form-group">
                    <label>Link Trailer YouTube</label>
                    <input type="text" name="trailer" class="form-control" 
                           value="<?= htmlspecialchars($row['trailer']['value'] ?? '') ?>"
                           placeholder="Contoh: https://www.youtube.com/watch?v=dQw4w9WgXcQ">
                </div>

                <div class="form-group">
                    <label>Sinopsis</label>
                    <textarea name="sinopsis" id="inputSinopsis" class="form-control" rows="5"><?= htmlspecialchars($row['sinopsis']['value'] ?? '') ?></textarea>
                </div>

                <button type="submit" class="btn-primary" style="margin-top: 10px;">💾 Simpan Perubahan</button>
            </form>
        </div>
    </div>
</div>

<script>
document.getElementById('btnFetchOMDB').addEventListener('click', async function() {
    const judulAsli = document.getElementById('inputJudul').value.trim();
    if (!judulAsli) {
        alert('Silakan isi judul film terlebih dahulu!');
        return;
    }
    
    // Hapus tahun yang berada dalam kurung, contoh: "Michael (2026)" -> "Michael"
    const judulBersih = judulAsli.replace(/\s*\(\d{4}\)\s*/g, '').trim();

    this.innerText = 'Mencari...';
    this.style.opacity = '0.7';

    try {
        const response = await fetch(`https://www.omdbapi.com/?apikey=65bbf102&t=${encodeURIComponent(judulBersih)}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            // Update input OMDB
            if (data.Ratings) {
                const rt = data.Ratings.find(r => r.Source === 'Rotten Tomatoes');
                if (rt) document.getElementById('inputRotten').value = rt.Value;
                
                const meta = data.Ratings.find(r => r.Source === 'Metacritic');
                if (meta) document.getElementById('inputMeta').value = meta.Value;
            }
            
            // Auto fill others if empty
            const sinopsis = document.getElementById('inputSinopsis');
            if (sinopsis.value === '' && data.Plot !== 'N/A') {
                sinopsis.value = data.Plot;
            }

            // Durasi mapping
            const durasi = document.querySelector('input[name="durasi"]');
            if (durasi.value === '' && data.Runtime !== 'N/A') {
                const durStr = data.Runtime.replace('min', 'Menit');
                durasi.value = durStr;
            }
            
            // Rating mapping
            const rating = document.querySelector('input[name="rating"]');
            if (rating.value === '' && data.imdbRating !== 'N/A') {
                rating.value = data.imdbRating;
            }

            alert('Berhasil menarik data dari OMDB API!');
        } else {
            alert('Gagal: ' + data.Error);
        }
    } catch (error) {
        alert('Terjadi kesalahan saat menghubungi API.');
        console.error(error);
    } finally {
        this.innerText = 'Tarik Data OMDB';
        this.style.opacity = '1';
    }
});
</script>

<?php require_once __DIR__ . '/../includes/footer.php'; ?>
