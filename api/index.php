<?php 
$dbhost = "localhost";
$dbname = "getaccredited";

require 'Slim/Slim.php';

$app = new Slim();

$m = new MongoClient("mongodb://$dbhost");
$db = $m->$dbname;

$app->get('/getUser', 'getUser');
$app->run();

function getUser() {
    global $db;

    $users = $db->users;

    $user = array(
        'email' => 'coyle@smu.edu',
        'password' => 'asdfasdf'
    );

    $user = $users->findOne($user);
    var_dump($user);
}
?>
