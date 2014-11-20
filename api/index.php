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
$app->post('/getForm', 'getForm');
$app->post('/getCourses', 'getCourses');
$app->get('/getOutcomes', 'getOutcomes');
$app->run();


function getForm() {
    global $db;

    $semester = Slim::getInstance()->request()->post('semester');
    $course = Slim::getInstance()->request()->post('course');

    $semesterOutcomes = $db->cycleofoutcomes;
    $outcomes = $semesterOutcomes->findOne(array('semester' => $semester));

    $classRoster = $db->rosterwithoutcomes;
    $course = $classRoster->findOne(array('course' => $course));

    //Gets the outcomes for the semester that the class has.
    $CACOutcomes = array_intersect($outcomes['CACOutcomes'], $course['CACOutcomes']);
    $EACOutcomes = array_intersect($outcomes['EACOutcomes'], $course['EACOutcomes']);

    //not finished
}


//Returns the list of courses based on the instructor
function getCourses() {
    global $db;

    $instructor = Slim::getInstance()->request()->post('instructor');

    $classRoster = $db->rosterwithoutcomes;
    $courses = $classRoster->find(array('instructor' => $instructor), array('course'));

    echo '{"RosterWithOutcomes": [ ';
    $i = 0;
    foreach($courses as $course) {
        if($i != 0) {
            echo ',';
        } else {
            $i++;
        }
        echo json_encode($course);
    }
    echo ']}';

}


//Returns the list of outcomes
function getOutcomes() {
    global $db;

    $outcomeDB = $db->outcomedescriptionandrubrics;
    $outcomes = $outcomeDB->find(array(), array('type','outcome','description'));

    echo '{"Outcomes": [ ';
    $i = 0;
    foreach($outcomes as $outcome) {
        if($i != 0) {
            echo ',';
        } else {
            $i++;
        }
        echo json_encode($outcome);
    }
    echo ']}';
    
}

function logout() {
    unset($_SESSION['user']);
}

function getLoggedInUser() {
    if (isset($_SESSION['user'])) {
        echo $_SESSION['user'];
    } else {
        echo "null";
    }
}


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

}

?>
