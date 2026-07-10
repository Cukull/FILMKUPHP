<?php
require 'C:\xampp\htdocs\FILMKU_PHP\config\sparql.php';
$res = sparql_query('PREFIX f: <http://www.semanticweb.org/filmku/ontologies/2026/filmku_ontology#> SELECT ?film ?judul ?poster ?genre ?sinopsis ?trailer ?durasi ?kategoriSection WHERE { ?film a f:Film ; f:judul ?judul . OPTIONAL { ?film f:poster_url ?poster . } OPTIONAL { ?film f:poster_film ?poster . } OPTIONAL { ?film f:sinopsis ?sinopsis . } OPTIONAL { ?film f:genre ?genre . } OPTIONAL { ?film f:trailer_film ?trailer . } OPTIONAL { ?film f:durasi ?durasi . } OPTIONAL { ?film f:kategoriSection ?kategoriSection . } FILTER(CONTAINS(?judul, "Squid Game")) }');
print_r($res);
