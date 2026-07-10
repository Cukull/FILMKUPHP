<?php
// ============================================================
//  FILMKU — SPARQL Helper Configuration
//  Koneksi ke Apache Jena Fuseki via cURL (pengganti SPARQLWrapper Python)
// ============================================================

define('FUSEKI_QUERY',  'http://localhost:3030/filmku/query');
define('FUSEKI_UPDATE', 'http://localhost:3030/filmku/update');
define('ONTOLOGY_PREFIX', 'http://www.semanticweb.org/filmku/ontologies/2026/filmku_ontology#');

/**
 * Mengirim SPARQL SELECT / ASK query ke Fuseki
 * @param  string $query  SPARQL query string
 * @return array|null     Decoded JSON response sebagai array PHP
 */
function sparql_query(string $query): ?array {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => FUSEKI_QUERY,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query(['query' => $query]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Accept: application/sparql-results+json',
            'Content-Type: application/x-www-form-urlencoded',
        ],
        CURLOPT_TIMEOUT        => 10,
    ]);
    $response = curl_exec($ch);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        error_log("[FUSEKI ERROR] Query gagal: $error");
        return null;
    }
    return json_decode($response, true);
}

/**
 * Mengirim SPARQL INSERT / DELETE / UPDATE ke Fuseki
 * @param  string $query  SPARQL update string
 * @return bool           True jika berhasil (HTTP 2xx)
 */
function sparql_update(string $query): bool {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL            => FUSEKI_UPDATE,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query(['update' => $query]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/x-www-form-urlencoded',
        ],
        CURLOPT_TIMEOUT        => 10,
    ]);
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        error_log("[FUSEKI ERROR] Update gagal: $error");
        return false;
    }
    return ($httpCode >= 200 && $httpCode < 300);
}

/**
 * Mengambil array bindings dari hasil query SPARQL
 * Shortcut helper agar kode lebih ringkas
 * @param  array  $result  Hasil dari sparql_query()
 * @return array
 */
function get_bindings(array $result): array {
    return $result['results']['bindings'] ?? [];
}

/**
 * Mengambil nilai boolean dari hasil SPARQL ASK query
 * @param  array  $result  Hasil dari sparql_query()
 * @return bool
 */
function get_boolean(array $result): bool {
    return $result['boolean'] ?? false;
}

/**
 * Inisialisasi Super Admin jika database kosong
 * Dipanggil sekali saat index.php diakses
 */
function inisialisasi_super_admin(): void {
    $cek = sparql_query("
        PREFIX f: <" . ONTOLOGY_PREFIX . ">
        ASK { ?x a f:Pengguna }
    ");

    if ($cek && !get_boolean($cek)) {
        sparql_update("
            PREFIX f: <" . ONTOLOGY_PREFIX . ">
            PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
            INSERT DATA {
                f:User_Angra rdf:type f:Pengguna ;
                             f:nama_pengguna \"angra\" ;
                             f:email_pengguna \"angra@admin.com\" ;
                             f:password \"admin123\" ;
                             f:role_akses \"Super Admin\" ;
                             f:status_aktif \"Aktif\" .

                f:User_Syukur rdf:type f:Pengguna ;
                              f:nama_pengguna \"Syukur\" ;
                              f:email_pengguna \"syukur@gmail.com\" ;
                              f:password \"syukur123\" ;
                              f:role_akses \"Penonton\" ;
                              f:status_aktif \"Aktif\" .
            }
        ");
        error_log("[FUSEKI] Data awal Super Admin berhasil diinisialisasi.");
    }
}

/**
 * Helper untuk memformat URL poster film
 * Mendukung file lokal maupun link eksternal (http/https)
 * @param string $poster
 * @return string
 */
function get_poster_url(string $poster): string {
    $poster = trim($poster);
    if (empty($poster)) {
        return '/FILMKU_PHP/static/images/poster/default.jpg';
    }
    if (strpos($poster, 'http://') === 0 || strpos($poster, 'https://') === 0) {
        return $poster;
    }
    return '/FILMKU_PHP/static/images/poster/' . $poster;
}
