<?php 
require 'Slim/Slim.php';
    
$app = new Slim();

$app->get('/hello/:name', 'helloWorld');
$app->run();

function helloWorld($name) {
    echo "Hello " . $name;
}
?>
