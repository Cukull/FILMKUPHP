<?php
require 'config/sparql.php';
$q = 'PREFIX f: <'.ONTOLOGY_PREFIX.'> SELECT ?s ?p ?o WHERE { ?s f:bermainDi <http://www.semanticweb.org/filmku/ontologies/2026/filmku_ontology#Film_Obsession2026> }';
print_r(get_bindings(sparql_query($q) ?? []));
