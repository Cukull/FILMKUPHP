<?php
require_once 'config/sparql.php';
$res = sparql_query('PREFIX f: <http://example.org/filmku#> SELECT ?judul ?poster WHERE { f:Dilan_1997 f:judul ?judul . OPTIONAL { f:Dilan_1997 f:poster_film ?poster . } } LIMIT 1');
var_dump($res);
