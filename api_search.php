<?php
// ============================================================
//  FILMKU — API Live Search (AJAX)
//  Mencari film di database lokal SPARQL
// ============================================================
header('Content-Type: application/json');

require_once __DIR__ . '/config/sparql.php';

$query = trim($_GET['q'] ?? '');
if (strlen($query) < 2) {
    echo json_encode(['success' => false, 'results' => []]);
    exit;
}

$search_term = addslashes($query);

$sparql = "
    PREFIX f: <" . ONTOLOGY_PREFIX . ">
    SELECT ?film ?judul ?poster ?sinopsis WHERE {
        ?film a f:Film ;
              f:judul ?judul .
        OPTIONAL { ?film f:poster_url ?poster . }
        OPTIONAL { ?film f:poster_film ?poster . }
        OPTIONAL { ?film f:sinopsis ?sinopsis . }
        FILTER (regex(?judul, \"$search_term\", \"i\"))
    } LIMIT 5
";

$res = sparql_query($sparql);
$bindings = get_bindings($res ?? []);

$results = [];
foreach ($bindings as $b) {
    $uri = $b['film']['value'];
    $film_id = substr($uri, strrpos($uri, '#') + 1);
    $poster = $b['poster']['value'] ?? '';
    
    $results[] = [
        'id' => $film_id,
        'title' => $b['judul']['value'],
        'synopsis' => $b['sinopsis']['value'] ?? 'Sinopsis tidak tersedia.',
        'poster' => get_poster_url($poster)
    ];
}

echo json_encode([
    'success' => true,
    'results' => $results
]);
