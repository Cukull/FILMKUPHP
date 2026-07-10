<?php
require 'config/sparql.php';
require 'temp_insert2.php'; // This file defines $films array

$update_query = "PREFIX f: <" . ONTOLOGY_PREFIX . ">\nINSERT DATA {\n";
$inserted_count = 0;

foreach ($films as $f) {
    $id = $f[0];
    
    // Check if film exists
    $check_q = "PREFIX f: <" . ONTOLOGY_PREFIX . "> SELECT ?p WHERE { f:$id ?p ?o } LIMIT 1";
    $res = sparql_query($check_q);
    $bindings = get_bindings($res ?? []);
    
    if (empty($bindings)) {
        // Film does not exist, insert it
        $judul = addslashes($f[1]);
        $sinopsis = addslashes($f[2]);
        $kategori = addslashes($f[3]);
        $poster = addslashes($f[4]);
        $rating = addslashes($f[5]);
        
        $update_query .= "
            f:$id a f:Film ;
                f:judul \"$judul\" ;
                f:sinopsis \"$sinopsis\" ;
                f:kategoriSection \"$kategori\" ;
                f:poster_url \"$poster\" ;
                f:rating \"$rating\" ;
                f:durasi \"120 menit\" ;
                f:harga_tiket \"50000\" .
        ";
        $inserted_count++;
    }
}
$update_query .= "}";

if ($inserted_count > 0) {
    $success = sparql_update($update_query);
    if ($success) {
        echo "Berhasil memulihkan $inserted_count film yang terhapus!\n";
    } else {
        echo "Gagal memulihkan film.\n";
    }
} else {
    echo "Tidak ada film yang perlu dipulihkan.\n";
}
