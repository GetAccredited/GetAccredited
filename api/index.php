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
$app->post('/getSelectedOutcomes', 'getSelectedOutcomes');
$app->run();


function getForm() {
    global $db;

    $semester = Slim::getInstance()->request()->post('semester');
    $course = Slim::getInstance()->request()->post('course');

    $semesterOutcomes = $db->cycleofoutcomes;
    $outcomes = $semesterOutcomes->findOne(array('semester' => $semester));

    $classRoster = $db->rosterwithoutcomes;
    $course = $classRoster->findOne(array('course' => $course));

    $outcomeDescription = $db->outcomedescriptionandrubrics;
    $outcomeMatchups = $db->eacandcacmatchup;
   

    //Gets the outcomes for the semester that the class has.
    $CACOutcomes = array_intersect($outcomes['CACOutcomes'], $course['CACOutcomes']);
    $EACOutcomes = array_intersect($outcomes['EACOutcomes'], $course['EACOutcomes']);
    $bothOutcomes = array();
    foreach($CACOutcomes as $CACOutcome) {
        $match = $outcomeMatchups->findOne(array('CAC' => $CACOutcome), array('EAC'=>1,'_id'=>0));
        if(in_array($match["EAC"], $EACOutcomes)){
            array_push($bothOutcomes, array('EAC' => $match["EAC"], 'CAC'=>$CACOutcome));
            $key = array_search($CACOutcome, $CACOutcomes);
            unset($CACOutcomes[$key]);
            $key = array_search($match["EAC"], $EACOutcomes);
            unset($EACOutcomes[$key]);
        }
    }

    echo '{"studentsEAC" : '. json_encode($course['studentsEAC']) . ', "studentsCAC" : ' . json_encode($course['studentsCAC']);
    echo ', "outcomes" : [';
    $i = 0;
    foreach($bothOutcomes as $bothOutcome) {
        if($i != 0) {
            echo ',';
        } else {
            $i++;
        }
        $outcomeInfo = $outcomeDescription->findOne(array('type' => "CAC", 'outcome' => $bothOutcome['CAC']), array('description'=>1,'rubrics'=>1, '_id'=>0));
        echo '{"CAC" : "' . $bothOutcome['CAC'] . '", "EAC" : "' . $bothOutcome['EAC'] . '", "description" : '. json_encode($outcomeInfo['description']) . ' , "rubrics" : ' . json_encode($outcomeInfo['rubrics']) . ' }';
    }
    foreach($CACOutcomes as $CACOutcome) {
        if($i != 0) {
            echo ',';
        } else {
            $i++;
        }
        $outcomeInfo = $outcomeDescription->findOne(array('type' => "CAC", 'outcome' => $CACOutcome), array('description'=>1,'rubrics'=>1, '_id'=>0));
        echo '{"CAC" : "' . $CACOutcome . '" , "EAC" : "none", "description" : '. json_encode($outcomeInfo['description']) . ' , "rubrics" : ' . json_encode($outcomeInfo['rubrics']) . ' }';
    }
    foreach($EACOutcomes as $EACOutcome) {
        if($i != 0) {
            echo ',';
        } else {
            $i++;
        }
        $outcomeInfo = $outcomeDescription->findOne(array('type' => "CAC", 'outcome' => $CACOutcome), array('description'=>1,'rubrics'=>1, '_id'=>0));
        echo '{"CAC" : "none", "EAC" : "' . $EACOutcome . '", "description" : '. json_encode($outcomeInfo['description']) . ' , "rubrics" : ' . json_encode($outcomeInfo['rubrics']) . ' }';
    }
    echo ']}';

}


//Returns the list of courses based on the instructor
function getCourses() {
    global $db;

    $instructor = Slim::getInstance()->request()->post('instructor');

    $classRoster = $db->rosterwithoutcomes;
    $courses = $classRoster->find(array('instructor' => $instructor), array('course'=>1, '_id'=>0));

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
    $outcomes = $outcomeDB->find(array(), array('type'=>1,'outcome'=>1,'description'=>1, '_id'=>0));

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

function getSelectedOutcomes(){ 
    global $db;

    $semester = Slim::getInstance()->request()->post('semester');

    $semesterOutcomes = $db->cycleofoutcomes;
    $outcomes = $semesterOutcomes->findOne(array('semester' => $semester), array('CACOutcomes'=>1, 'EACOutcomes'=>1, '_id'=>0));

    echo json_encode($outcomes);
    
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


function getUserAndLogin(){

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

?>
