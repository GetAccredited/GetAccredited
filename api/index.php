<?php 

$dbhost = "localhost";
$dbname = "getaccredited";

require 'Slim/Slim.php';

$app = new Slim();

$m = new MongoClient("mongodb://$dbhost");
$db = $m->$dbname;

$app->post('/getUserAndLogin', 'getUserAndLogin');
$app->get('/getLoggedInUser', 'getLoggedInUser');
$app->get('/logout', 'logout');
$app->run();

function getUserAndLogin() {
    global $db;

    // Get the email and password from the POST
    $request = Slim::getInstance()->request();
    $email = $request->post('email');
    $password = $request->post('password');

    $users = $db->users;

    $user = array(
        'email' => $email,
        'password' => $password
    );

    $user = json_encode($users->findOne($user));
    $_SESSION['user'] = $user;
    echo $user;
}

function getLoggedInUser() {
    if (isset($_SESSION['user'])) {
        echo $_SESSION['user'];
    } else {
        echo "null";
    }
}

function logout() {
    unset($_SESSION['user']);
}

?>