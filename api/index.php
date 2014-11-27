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
        $outcomeInfo = $outcomeDescription->findOne(array('type' => "EAC", 'outcome' => $EACOutcome), array('description'=>1,'rubrics'=>1, '_id'=>0));
        echo '{"CAC" : "none", "EAC" : "' . $EACOutcome . '", "description" : '. json_encode($outcomeInfo['description']) . ' , "rubrics" : ' . json_encode($outcomeInfo['rubrics']) . ' }';
    }
    echo ']}';

}


//Returns the list of courses based on the instructor
function getCourses() {
    global $db;

    // Get the POST data (instructor's last name)
    $instructor = Slim::getInstance()->request()->post('instructor');

    // Select the collection
    $classRoster = $db->rosterwithoutcomes;

    // Query the collection
    $courses = $classRoster->find(array('instructor' => $instructor), 
                    array('course'=>1, '_id'=>0));

    // Convert the iterator to an array
    $courses = iterator_to_array($courses);

    // Print out the JSON
    echo json_encode(array('RosterWithOutcomes' => $courses));
}


//Returns the list of outcomes
function getOutcomes() {
    global $db;

    // Select the collection
    $outcomeDB = $db->outcomedescriptionandrubrics;

    // Query the collection
    $outcomes = $outcomeDB->find(array(), array('type'=>1, 'outcome'=>1, 
                    'description'=>1, '_id'=>0));

    // Convert the iterator to an array
    $outcomes = iterator_to_array($outcomes);

    // Print out the JSON
    echo json_encode(array('Outcomes' => $outcomes));
}

function getSelectedOutcomes(){ 
    global $db;

    // Get the POST data (ex: Fall2014)
    $semester = Slim::getInstance()->request()->post('semester');

    // Select the collection
    $semesterOutcomes = $db->cycleofoutcomes;

    // Query the collection
    $outcomes = $semesterOutcomes->findOne(array('semester' => $semester), 
                    array('CACOutcomes'=>1, 'EACOutcomes'=>1, '_id'=>0));

    // Print out the JSON
    echo json_encode($outcomes);
    
}

// Logout the user by deleting the session variable contents
function logout() {
    unset($_SESSION['user']);
}

// Return the info for the currently logged in user, or null if not logged in
function getLoggedInUser() {
    if (isset($_SESSION['user'])) {
        echo $_SESSION['user'];
    } else {
        echo "null";
    }
}

// Verify the email/password of a user, then log them in if correct
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

?>
