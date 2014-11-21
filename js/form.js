var courses = [];
var user = "";
var tableHeader = "<tr><th></th><th>1 (Weak)</th><th>2 (Poor)</th><th>3 (Good)</th><th>4 (Excellent)</th><th>Unused</th></tr>";
var tableColumns = "<td><input type='number' name='points' min='0' step='1' value='0' prev='0'></td>";

$(document).on('ready', function() {
	getUser(function(){
		getCourses(function() {
			populateClasses(function() {
				populateForm();
			});
		});
	});
	
	$( "#tabs" ).tabs();

	$(document).on('click', '.side_bar ul li:not(.void)', function(event) {
		$('.side_bar ul li').removeClass('selected');
		$(this).addClass('selected');
		populateForm();
	});

	$(document).on('change', 'table.report_table tr td input', function(event) {
		var index = $('table.report_table tr').index($(this).parent().parent());
		updateStudentCount($(this), index);
	});

	$(document).on('click', 'input.button:not(.disabled)', function(event) {
		// Save or submit
	});
});

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

function populateClasses(callback) {
	var course_HTML = "";

	for(var i = 0; i < courses.length; i++) {
		if(i === 0) {
			course_HTML += "<li name='" + courses[i].course + "' class='selected'>" + 
								courses[i].course + 
							"</li>";
		}
		else {
			course_HTML += "<li name='" + courses[i].course + "'>" + courses[i].course + "</li>";
		}
	}

	if(courses.length === 0) {
		course_HTML += "<li class='void'>No courses</li>";
	}

	$("section#courses ul").append(course_HTML);

	callback();
}

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
	            console.log(output);
				populateOutcomes(output.outcomes);
				populateStudents(output.studentsEAC, output.studentsCAC);
	        }
	    });
	}
	else {
		$('#form').prepend('<p class="no_courses">You do not teach any ABET courses.</p>')
		$('#form input.button').addClass('disabled');
	}
}

function populateOutcomes(outcomes) {
	var tab_HTML = "";
	for(var i = 0; i < outcomes.length; i++) {
		var name = "";
		if(outcomes[i].CAC != "none" && outcomes[i].EAC != "none"){
			name = "CAC-" + outcomes[i].CAC + "/EAC-" + outcomes[i].EAC;
		}
		else if(outcomes[i].CAC === "none") {
			name = "EAC-" + outcomes[i].EAC;
		}
		else {
			name = "CAC-" + outcomes[i].CAC;
		}

		tab_HTML += '<li title="' + outcomes[i].description + '"><a href="#outcome' + i + '"><span>' + name + '</span></a></li>';
		populateTable(outcomes[i], i);
	}

	$('div#tabs ul').append(tab_HTML);
	$("#tabs").tabs("destroy");
	$( "#tabs" ).tabs();
}

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

function populateTable(outcome, outcome_number) {
	var div_html = "<div id='outcome" + outcome_number + "'><article class='form_tabs'>";
	var name = "";
	var table= "";
	var rubrics = outcome.rubrics;
	if(outcome.CAC != "none" && outcome.EAC != "none"){
		name = "CAC-" + outcome.CAC + "/EAC-" + outcome.EAC;
		table = "<h4>Computer Science Undergrads:</h4><table class='report_table'>" + tableHeader;
		for(var i = 0; i < rubrics.length; i++){
			table += "<tr><th class='v_table_header'>" + rubrics[i] + "</th>";
			table += tableColumns + tableColumns + tableColumns + tableColumns;
			table += "<td class='CACStudentCount' count='0'></td></tr>";
		}
		table += "</table><p class='CACStudents'></p>"
		table += "<h4>Computer Engineering Undergrads:</h4><table class='report_table'>" + tableHeader;
		for(var i = 0; i < rubrics.length; i++){
			table += "<tr><th class='v_table_header'>" + rubrics[i] + "</th>";
			table += tableColumns + tableColumns + tableColumns + tableColumns;
			table += "<td class='EACStudentCount' count='0'></td></tr>";
		}
		table += "</table><p class='EACStudents'></p>"
	}
	else if(outcome.CAC === "none") {
		name = "EAC-" + outcome.EAC;
		table += "<h4>Computer Engineering Undergrads:</h4><table class='report_table'>" + tableHeader;
		for(var i = 0; i < rubrics.length; i++){
			table += "<tr><th class='v_table_header'>" + rubrics[i] + "</th>";
			table += tableColumns + tableColumns + tableColumns + tableColumns;
			table += "<td class='EACStudentCount' count='0'></td></tr>";
		}
		table += "</table><p class='EACStudents'></p>"	
	}
	else {
		name = "CAC-" + outcome.CAC;
		table = "<h4>Computer Science Undergrads:</h4><table class='report_table'>" + tableHeader;
		for(var i = 0; i < rubrics.length; i++){
			table += "<tr><th class='v_table_header'>" + rubrics[i] + "</th>";
			table += tableColumns + tableColumns + tableColumns + tableColumns;
			table += "<td class='CACStudentCount' count='0'></td></tr>";
		}
		table += "</table><p class='CACStudents'></p>"	
	}
	name += ": " + outcome.description;
	div_html += "<h3>" + name + "</h3>";
	div_html += table;
	div_html += "<p class='notes'>The above evaluation is based on:</p><textarea rows='4' cols='50'></textarea></article></div>";
	$('div#tabs').append(div_html);
}

function updateStudentCount(input, row_index) {
	var data = $('tr').eq(row_index).children('td:not([class*="StudentCount"])');
	var total_students = Number($('tr').eq(row_index).children('td[class*="StudentCount"]').attr('count'));

	var sum = 0;

	for(var i = 0; i < data.length; i++) {
		sum += Number(data.eq(i).children().val());
	}

	var difference = total_students - sum;

	if(difference < 0) {
		var previous_value = Number(input.attr('prev'));
		input.val(previous_value);
	}
	else {
		$('tr').eq(row_index).children('td[class*="StudentCount"]').html(difference);
		input.attr('prev', input.val());
	}
}