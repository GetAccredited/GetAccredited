var courses = [];
var user = "";
var tableHeader = "<tr class='header_row'><th></th><th>1 (Weak)</th><th>2 " + 
		"(Poor)</th><th>3 (Good)</th><th>4 (Excellent)</th><th>Unused</th></tr>";
var tableColumns = "<td><input type='number' name='points' min='0' step='1' " + 
		"value='0' prev='0'></td>";

$(document).on('ready', function() {
	getUser(function(){
		getCourses(function() {
			populateClasses(function() {
				populateForm();
			});
		});
	});
	
	$( "#tabs" ).tabs();

	// When an item in the side bar menu is clicked
	$(document).on('click', '.side_bar ul li:not(.void)', function(event) {
		// Deselect the currently selected
		$('.side_bar ul li').removeClass('selected');
		// Select current
		$(this).addClass('selected');

		// Populate form
		populateForm();
		$('#saveForm').val('Save');
		$('#submitForm').val('Submit');
	});

	// When one of the inputs in a report table is clicked, check if number 
	// changed to is legal
	$(document).on('change', 'table.report_table tr td input', function(event) {
		var index = $('table.report_table tr').index($(this).parent().parent());
		updateStudentCount($(this), index);

		// Form needs to be saved again
		$('#saveForm').val('Save');
	});

	// If textarea is changed, form needs to be saved again
	$(document).on('change', 'textarea.notes', function(event){
		$('#saveForm').val('Save');
	});

	// When the not-disabled Submit button is clicked
	$(document).on('click', '#submitForm:not(.disabled)', function(event) {
		// Display an error if the form isn't complete
		if (!isFormCompleted()) {
			alert("Please finish filling out the form! Make sure you fill out all the tabs.");
			return;
		}

		var formJSON = formToJSON(1);
		saveForm(formJSON);
		submitted();
	});

	// When the save is saved
	$(document).on('click', '#saveForm:not(.disabled)', function(event) {
		var formJSON = formToJSON(0);
		saveForm(formJSON);

		// Form is saved
		$('#saveForm').val('Saved');
	});
});

// Get user from database
function getUser(callback) {
	$.ajax({
        type: "GET",
        url: "api/getLoggedInUser",
        success: function(output) {
        	output = JSON.parse(output);
        	var name = output.name;
        	user = name.split(" ");
        	user = user[user.length-1];

            callback();
        }
    });
}

// Get courses from database
function getCourses(callback) {
	$.ajax({
        type: "POST",
        url: "api/getCourses",
        data: {
            instructor: user,
        },
        success: function(output) {
        	output = JSON.parse(output);
            output = output.RosterWithOutcomes;

            for(var i = 0; i < output.length; i++) {
            	courses.push(output[i]);
            }

            callback();
        }
    });
}

// Populates list of classes in the side bar
function populateClasses(callback) {
	var course_HTML = "";

	for(var i = 0; i < courses.length; i++) {
		if(i === 0) {
			course_HTML += "<li name='" + courses[i].course + "' class='selected'>" + 
						   courses[i].course + "</li>";
		}
		else {
			course_HTML += "<li name='" + courses[i].course + "'>" + 
						   courses[i].course + "</li>";
		}
	}

	if(courses.length === 0) {
		course_HTML += "<li class='void'>No courses</li>";
	}

	$("section#courses ul").append(course_HTML);

	callback();
}

// Gets outcomes for currently selected course
function populateForm() {
	$('div#tabs').html("<ul></ul>");
	var selected_course = $('section#courses ul li.selected').attr('name');
	var semester = getSemester();

	if(selected_course != undefined) {
		$.ajax({
	        type: "POST",
	        url: "api/getForm",
	        data: {
	        	course: selected_course,
	            semester: semester
	        },
	        success: function(output) {
	        	output = JSON.parse(output);

	        	// Calls functions to populate form
				populateOutcomes(output.outcomes);
				populateStudents(output.studentsEAC, output.studentsCAC);
				populateData();
	        }
	    });
	}
	else {
		$('#form').prepend('<p class="no_courses">You do not teach any ABET courses.</p>');
		$('#form input.button').addClass('disabled');
	}
}

// Populates the outcomes for a form
function populateOutcomes(outcomes) {
	var tab_HTML = "";

	for(var i = 0; i < outcomes.length; i++) {
		var name = "";

		if(outcomes[i].CAC != "none" && outcomes[i].EAC != "none"){
			name = "CAC-" + outcomes[i].CAC + "/EAC-" + outcomes[i].EAC;
		} else if(outcomes[i].CAC === "none") {
			name = "EAC-" + outcomes[i].EAC;
		} else {
			name = "CAC-" + outcomes[i].CAC;
		}

		tab_HTML += '<li title="' + outcomes[i].description + '"><a href="#outcome' + 
					i + '"><span>' + name + '</span></a></li>';
		populateTable(outcomes[i], i);
	}

	if(outcomes.length == 0) {
		$('#emptyForm').html('<p class="no_courses">No outcomes are needed ' + 
							 'in this class for ' + getSemester() + '.</p>');
		$('#form input.button').addClass('disabled');
	} else {
		$('#emptyForm').html('');
		$('div#tabs ul').html(tab_HTML);
		$("#tabs").tabs("destroy");
		$( "#tabs" ).tabs();
		$('#form input.button').removeClass('disabled');
	}

}

// Populates the names for students for a form
function populateStudents(studentsEAC, studentsCAC) {
	$(".EACStudentCount").html(studentsEAC.length);
	$(".EACStudentCount").attr('count', studentsEAC.length);
	$(".CACStudentCount").html(studentsCAC.length);
	$(".CACStudentCount").attr('count', studentsCAC.length);

	var student_html ="CpE Students: ";
	for(var i = 0; i < studentsEAC.length ; i++){
		if(i != 0){
			student_html += ", ";
		}
		student_html += studentsEAC[i];
	}
	$(".EACStudents").html(student_html);

	var student_html ="CS Students: ";
	for(var i = 0; i < studentsCAC.length ; i++){
		if(i != 0){
			student_html += ", ";
		}
		student_html += studentsCAC[i];
	}
	$(".CACStudents").html(student_html);
}

// Creates the tables for the form
function populateTable(outcome, outcome_number) {
	var div_html = "<div id='outcome" + outcome_number + 
	               "'><article class='form_tabs'>";
	var name = "";
	var table= "";
	var rubrics = outcome.rubrics;

	// If the outcome is both CAC and EAC
	if(outcome.CAC != "none" && outcome.EAC != "none"){
		name = "CAC-" + outcome.CAC + "/EAC-" + outcome.EAC;
		table = "<h4>Computer Science Undergrads:</h4><table class='report_table' " + 
		        "name='CAC-" + outcome.CAC + "'>" + tableHeader;
		
		for(var i = 0; i < rubrics.length; i++){
			table += "<tr><th class='v_table_header'>" + rubrics[i] + "</th>";
			table += tableColumns + tableColumns + tableColumns + tableColumns;
			table += "<td class='CACStudentCount' count='0'></td></tr>";
		}

		table += "</table><p class='CACStudents'></p>"
		table += "<h4>Computer Engineering Undergrads:</h4><table " + 
		         "class='report_table' name='EAC-" + outcome.EAC + "'>" + 
		         tableHeader;
		
		for(var i = 0; i < rubrics.length; i++){
			table += "<tr><th class='v_table_header'>" + rubrics[i] + "</th>";
			table += tableColumns + tableColumns + tableColumns + tableColumns;
			table += "<td class='EACStudentCount' count='0'></td></tr>";
		}

		table += "</table><p class='EACStudents'></p>";
	}
	// If the outcome is only EAC
	else if(outcome.CAC === "none") {
		name = "EAC-" + outcome.EAC;
		table += "<h4>Computer Engineering Undergrads:</h4><table " + 
		         "class='report_table' name='" + name + "'>" + tableHeader;
		
		for(var i = 0; i < rubrics.length; i++){
			table += "<tr><th class='v_table_header'>" + rubrics[i] + "</th>";
			table += tableColumns + tableColumns + tableColumns + tableColumns;
			table += "<td class='EACStudentCount' count='0'></td></tr>";
		}
		table += "</table><p class='EACStudents'></p>";
	}
	// Otherwise, the outcome is only CAC
	else {
		name = "CAC-" + outcome.CAC;
		table = "<h4>Computer Science Undergrads:</h4><table class='report_table' " + 
		        "name='" + name + "'>" + tableHeader;

		for(var i = 0; i < rubrics.length; i++){
			table += "<tr><th class='v_table_header'>" + rubrics[i] + "</th>";
			table += tableColumns + tableColumns + tableColumns + tableColumns;
			table += "<td class='CACStudentCount' count='0'></td></tr>";
		}
		table += "</table><p class='CACStudents'></p>";
	}

	name += ": " + outcome.description;
	div_html += "<h3>" + name + "</h3>";
	div_html += table;
	div_html += "<p>The above evaluation is based on:</p><textarea class='notes' " + 
	            "rows='4'></textarea></article></div>";
	$('div#tabs').append(div_html);
}

// Update unused column given an jQuery object input and a number row_index
function updateStudentCount(input, row_index) {
	// Find the appropriate row and total student number
	var data = $('tr').eq(row_index).children('td:not([class*="StudentCount"])');
	var total_students = Number($('tr').eq(row_index)
									   .children('td[class*="StudentCount"]')
									   .attr('count'));
	var sum = 0;

	var current_val = input.val();

	if($.isNumeric(current_val)) {
		current_val = Math.round(current_val);
		input.val(current_val);
	}
	else {
		var previous_value = Number(input.attr('prev'));
		input.val(previous_value);
		return;
	}

	// Iterate over row and get sum of all used
	for(var i = 0; i < data.length; i++) {
		sum += Number(data.eq(i).children().val());
	}

	var difference = total_students - sum;

	// If the difference on the input is invalid
	// Change the altered input back to old value
	if(difference < 0 || input.val() < 0) {
		var previous_value = Number(input.attr('prev'));
		input.val(previous_value);
	}
	// Otherwise, update unused column and prev value for the input
	else {
		$('tr').eq(row_index).children('td[class*="StudentCount"]').html(difference);
		
		input.attr('prev', input.val());
	}
}

// Update all unused columns
function updateAllStudentCounts() {
	var rows = $('tr:not(.header_row)');

	// Loop through every row
	for(var i = 0; i < rows.length; i++) {

		var data = $('tr:not(.header_row)')
						.eq(i)
						.children('td:not([class*="StudentCount"])');
		var total_students = Number($('tr:not(.header_row)')
									.eq(i)
									.children('td[class*="StudentCount"]')
									.attr('count'));
		var sum = 0;

		// Sum all the data for that row
		for(var k = 0; k < data.length; k++) {
			sum += Number(data.eq(k).children().val());
		}

		var difference = total_students - sum;

		// Update unused to be the difference
		$('tr:not(.header_row)').eq(i)
		                        .children('td[class*="StudentCount"]')
		                        .html(difference);
	}
}

// Return true if the form is completely filled out, and false otherwise.
function isFormCompleted() {
	var complete = true;

	// Get the total count of all of the "unused" student counts
	var studentCountTotal = 0;
	$(".CACStudentCount").add(".EACStudentCount").each(function() {
		studentCountTotal += Number($(this).html());
	});

	// If not all of the student counts are used, then the form isn't filled out
	if (studentCountTotal != 0) {
		complete = false;
	}

	// Check that all of the notes are filled out
	$(".notes").each(function() {
		if ($(this).val() === "") {
			complete = false;
		}
	});

	return complete;
}

// Converts the contents of the form to JSON
function formToJSON(completed) {
	var form = [];

	// Compile the results in each outcome
	$("#form .ui-tabs-anchor span").each(function(index) {
		// An outcome string that looks like "EAC-A" or "CAC-A/EAC-A"
		var outcomeStrs = $(this).html().split('/');
		
		for(var i = 0; i < outcomeStrs.length; i++) {
			var outcomeStr = outcomeStrs[i];
			var dashIndex = outcomeStr.indexOf('-');

			// Get the outcome, type, and notes
			var type = outcomeStr.substring(0, dashIndex);
			var outcome = outcomeStr.substring(dashIndex+1, dashIndex+2);
			var notes = $("#outcome" + index + " .notes").val();

			// Process each table in the current outcome
			var result = new Object();
			result.submitted = completed;
			result.instructor = user;
			result.course = $('section#courses ul li.selected').attr('name');
			result.type = type;
			result.outcome = outcome;
			result.notes = notes;
			result.numbers = [];

			// Process each row in the current table
			$("#form #outcome" + index + " .report_table").eq(i)
				.find("tr:not(:first-of-type)").each(function() {
				var rubric = [];

				// Process each column in the current row
				$(this).find("td:not(:last-of-type) input").each(function() {
					rubric.push(Number($(this).val()));
				});

				result.numbers.push(rubric);
			});

			form.push(result);
		}
	});
	return JSON.stringify(form);
}

// Receives a JSON of the information in the form
// Sends this information to the database with an AJAX request
function saveForm(formJSON) {
	$.ajax({
        type: "POST",
        url: "api/saveForm",
        data: {
        	formData: formJSON
        }
    });
}

// Populates the form with the data from the database
function populateData() {
	// Get name of selected course
	var course = $('section#courses ul li.selected').attr('name');

	var formData = null;

	// AJAX call to get data for course that user has saved in the database
	$.ajax({
        type: "POST",
        url: "api/getFormInfo",
        data: {
        	course: course,
            instructor: user
        },
        success: function(output) {
        	formData = JSON.parse(output);

        	// For each outcome in the form
        	for(var i = 0; i < formData.length; i++) {
        		// If it has been submitted
        		if(formData[0].submitted === 1) {
        			submitted();
        		}

        		var data = $('#form table[name="' + formData[i].type + '-' + 
        					formData[i].outcome + '"] tr');
				
				var numbers = formData[i].numbers;

				// Loop through all data in the tables and populate values
				for(var j = 0; j < numbers.length; j++) {
					for(var k = 0; k < numbers[j].length; k++) {
						data.eq(j+1).children()
						    .eq(k+1).children()
						    .eq(0).val(numbers[j][k]);
					}
				}

				// Populate textarea
				$('#form textarea.notes').val(formData[i].notes);
			}

			// Update unused student counts
			updateAllStudentCounts();
        }
    });
}

// Function to disable necessary inputs when a form is submitted
function submitted() {
	$('#form input.button').addClass('disabled');
	$('#submitForm').val("Submitted");
	$('#form table input').prop('disabled', true);
	$('#form textarea').prop('disabled', true);
}