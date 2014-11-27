<?php 
$dbhost = "localhost";
$dbname = "getaccredited";

require 'Slim/Slim.php';

$app = new Slim();

$m = new MongoClient("mongodb://$dbhost");
$db = $m->$dbname;


// Verify the email/password of a user, then log them in if correct
// Input: email
// Input: password
$app->post('/getUserAndLogin', 'getUserAndLogin');

// Return the info for the currently logged in user, or null if not logged in
$app->get('/getLoggedInUser', 'getLoggedInUser');

// Logout the user by deleting the session variable contents
$app->get('/logout', 'logout');

// Returns JSON for the form
// Input: semester
// Input: course
$app->post('/getForm', 'getForm');

// Returns the list of courses based on the instructor
// Input: instructor (ex: Coyle)
$app->post('/getCourses', 'getCourses');

// Returns the list of outcomes
$app->get('/getOutcomes', 'getOutcomes');

// Get the outcomes for a chosen semester
// Input: semester (ex: Fall2014)
$app->post('/getSelectedOutcomes', 'getSelectedOutcomes');

// Generate the report based on which outcomes are selected
// Sample input JSON: ["CAC-A/EAC-A", "CAC-H"]
// To test, go to Postman and use a POST and click on "raw" and put the JSON there
$app->post('/generateReport', 'generateReport');


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


// Returns a single outcome. Used internally by generateReport()
function getOutcome($type, $outcome) {
    global $db;

    // Select the collection
    $outcomeDB = $db->outcomedescriptionandrubrics;

    // Query the collection
    $outcome = $outcomeDB->findOne(array('type' => $type, 'outcome' => $outcome), 
                    array('_id'=>0));

    return $outcome;
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


function generateReport() {
    global $db;

    // Get POST data and decode the JSON
    $outcomes = json_decode(Slim::getInstance()->request()->getBody());

    // Select the collection
    $collection = $db->formdata;

    // Compile the info for the report table for each outcome
    $report = Array();
    foreach ($outcomes as $typeAndOutcome) {
        // Parse out the type and outcome
        $type = substr($typeAndOutcome, 0, 3);
        $outcome = substr($typeAndOutcome, 4, 1);

        // Query the collection
        $formData = $collection->find(array('type' => $type, 'outcome' => $outcome), 
                        array('numbers' => 1, '_id' => 0));

        // Sum the numbers from each form
        $rubrics = null;
        foreach ($formData as $singleForm) {
            // Removes the outer wrapper array that was messing with things
            $singleForm = reset($singleForm);

            if ($rubrics == null) {
                $rubrics = $singleForm;
            } else {
                for ($i = 0; $i < count($rubrics); $i++) {
                    $rubrics[$i][0] += $singleForm[$i][0];
                    $rubrics[$i][1] += $singleForm[$i][1];
                    $rubrics[$i][2] += $singleForm[$i][2];
                    $rubrics[$i][3] += $singleForm[$i][3];
                }
            }
        }

        // Sum the numbers in each column of each rubric to get the overall
        array_unshift($rubrics, array(0, 0, 0, 0));
        for ($i = 1; $i < count($rubrics); $i++) {
            $rubrics[0][0] += $rubrics[$i][0];
            $rubrics[0][1] += $rubrics[$i][1];
            $rubrics[0][2] += $rubrics[$i][2];
            $rubrics[0][3] += $rubrics[$i][3];
        }

        // Convert the counts to percentages
        foreach ($rubrics as &$rubric) {
            $sum = array_sum($rubric);
            $rubric = array_map(function($num) use ($sum) {
                          return round($num/$sum, 3)*100;
                      }, $rubric);
        }

        // Calculate the %S+E column
        foreach ($rubrics as &$rubric) {
            $sAndE = $rubric[2] + $rubric[3];
            array_push($rubric, $sAndE);
        }

        // Get the descriptions for the outcome
        $outcomeDesc = getOutcome($type, $outcome);
        
        // Compile the final output
        $table = Array();
        $table['outcome'] = $typeAndOutcome;
        $table['description'] = $outcomeDesc['description'];
        $table['results'] = Array();
        for ($i = 0; $i < count($rubrics); $i++) {
            $result = Array();
            if ($i == 0) {
                $result['description'] = "Outcome " . $typeAndOutcome;
            } else {
                $result['description'] = $outcomeDesc['rubrics'][$i-1];
            }
            $result['percentages'] = $rubrics[$i];
            array_push($table['results'], $result);
        }

        array_push($report, $table);
    }

    echo json_encode($report);
}
?>
