<?php
$html = file_get_contents('test_output.html');
preg_match_all('/<div class="rail-card-title">\s*(.*?)\s*<\/div>/is', $html, $matches);
print_r($matches[1]);
