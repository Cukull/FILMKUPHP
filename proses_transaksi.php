<?php
// ============================================================
//  FILMKU — Proses Transaksi
// ============================================================
session_start();
require_once __DIR__ . '/config/sparql.php';
require_once __DIR__ . '/includes/mailer.php';
require_once __DIR__ . '/includes/email_template.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$film_id = trim($_POST['film_id'] ?? '');
$tanggal = trim($_POST['tanggal'] ?? '');
$jam     = trim($_POST['jam']     ?? '');
$kursi   = trim($_POST['kursi']   ?? '');

if (!$film_id || !$tanggal || !$jam || !$kursi) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$kursi_list = array_filter(explode(',', $kursi));
if (empty($kursi_list)) {
    header('Location: /FILMKU_PHP/index.php');
    exit;
}

$film_id_safe = addslashes(preg_replace('/[^a-zA-Z0-9_\-]/', '', $film_id));
$tanggal_safe = addslashes($tanggal);
$jam_safe     = addslashes($jam);
$clean_tgl    = str_replace(' ', '_', $tanggal);
$clean_jam    = str_replace(':', '', $jam);

foreach ($kursi_list as $k) {
    $k_safe    = addslashes(trim($k));
    $random    = rand(100, 999);
    $kursi_uri = "Kursi_{$film_id_safe}_{$clean_tgl}_{$clean_jam}_{$k_safe}_{$random}";
    
    $query_update = "
        PREFIX f: <" . ONTOLOGY_PREFIX . ">
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        
        INSERT {
            f:$kursi_uri rdf:type f:Kursi ;
                         f:nomor_kursi \"$k_safe\" ;
                         f:status \"Terisi\" .
            
            ?jadwal f:memiliki f:$kursi_uri .
        }
        WHERE {
            f:$film_id_safe f:menyediakan ?jadwal .
            ?jadwal f:tanggal \"\"\"$tanggal_safe\"\"\" ;
                    f:jam \"\"\"$jam_safe\"\"\" .
        }
    ";
    
    sparql_update($query_update);
}

$email = trim($_POST['email'] ?? '');
$total = trim($_POST['total'] ?? 0);

if (!empty($email)) {
    // Ambil detail film dari database untuk email
    $query_film = "
        PREFIX f: <" . ONTOLOGY_PREFIX . ">
        SELECT ?judul ?poster WHERE {
            f:{$film_id_safe} f:judul ?judul .
            OPTIONAL { f:{$film_id_safe} f:poster_film ?poster . }
        } LIMIT 1
    ";
    $result_film = sparql_query($query_film);
    $film_title = "Unknown Film";
    $poster_url = "";
    
    $info_row = get_bindings($result_film ?? [])[0] ?? [];
    if (!empty($info_row)) {
        $film_title = $info_row['judul']['value'] ?? "Unknown Film";
        $poster_url = $info_row['poster']['value'] ?? "";
    }
    
    // Dapatkan path poster asli
    $real_poster_url = get_poster_url($poster_url);
    
    // Cek apakah file lokal
    $is_local_poster = (strpos($real_poster_url, 'http') !== 0);
    $poster_absolute_path = null;
    
    if ($is_local_poster) {
        // Lokasi absolut file gambar (Gunakan __DIR__ yang dijamin mengarah ke direktori root aplikasi FILMKU_PHP)
        // $real_poster_url formatnya: /FILMKU_PHP/static/images/...
        // Kita buang prefix /FILMKU_PHP lalu gabung dengan __DIR__
        $relative_path = preg_replace('#^/FILMKU_PHP#', '', $real_poster_url);
        $poster_absolute_path = __DIR__ . $relative_path;
    }
    
    // Format tanggal untuk email (Gunakan langsung karena sudah diformat dari sistem)
    $tanggal_formatted = $tanggal;
    $total_formatted = 'Rp ' . number_format((float)$total, 0, ',', '.');
    
    // Generate HTML Body
    $htmlBody = generateETicketHTML($film_title, $tanggal_formatted, $jam_safe, $kursi, $total_formatted, $real_poster_url, $is_local_poster);
    
    // Generate QR Code URL to be embedded by Mailer
    $qr_data = urlencode("FILMKU-TICKET-" . $film_title . "-" . $tanggal_formatted . "-" . $kursi);
    $qr_url = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" . $qr_data . "&bgcolor=ffffff&color=000000";
    
    // Kirim Email
    $subject = "E-Tiket Anda: " . $film_title;
    // Gunakan $poster_absolute_path jika lokal, jika tidak gunakan $real_poster_url
    $final_poster_path = $is_local_poster ? $poster_absolute_path : $real_poster_url;
    sendETicketEmail($email, $subject, $htmlBody, $final_poster_path, $qr_url);
}

// Save to history session for mockup
if (!isset($_SESSION['histori_tiket'])) {
    $_SESSION['histori_tiket'] = [];
}
$_SESSION['histori_tiket'][] = [
    'film_id' => $film_id,
    'tanggal' => $tanggal,
    'jam'     => $jam,
    'kursi'   => $kursi,
    'email'   => $email,
    'waktu_beli' => date('Y-m-d H:i:s')
];

// Redirect ke halaman sukses membawa parameter
$params = http_build_query([
    'film_id' => $film_id,
    'tanggal' => $tanggal,
    'jam'     => $jam,
    'kursi'   => $kursi,
    'email'   => $email
]);

header("Location: /FILMKU_PHP/sukses.php?$params");
exit;
