<?php
$lines = file('C:/xampp/htdocs/FILMKU_PHP/insert_kategori.php');
$php = "";
foreach ($lines as $line) {
    if (strpos($line, '$update_query') !== false) {
        break;
    }
    $php .= $line;
}
file_put_contents('C:/xampp/htdocs/FILMKU_PHP/temp_insert2.php', $php);
echo "Done";
