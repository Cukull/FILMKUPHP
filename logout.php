<?php
session_start();
session_destroy();
header('Location: /FILMKU_PHP/index.php');
exit;
