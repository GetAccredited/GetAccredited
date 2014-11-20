var courses = [];
var user = "coyle";

$(document).on('ready', function() {
	getCourses(function() {
		populateClasses(function() {
			populateForm();
		});
	});

	$(document).on('click', '.side_bar ul li', function(event) {
		$('.side_bar ul li').removeClass('selected');
		$(this).addClass('selected');
		populateForm();
	});
	$( "#tabs" ).tabs();
});

function getCourses(callback) {
	$.ajax({
        type: "POST",
        url: "api/getCourses",
        data: {
        	//eventually replace with instructors name
            instructor: 'coyle',
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

	$("section#courses ul").append(course_HTML);

	callback();
}

function populateForm() {
	var selected_course = $('section#courses ul li.selected').attr('name');

	for(var i = 0; i < courses.length; i++) {
		if(courses[i].course === selected_course) {
			populateOutcomes(i);
			populateStudents(i);
		}
	}
}

function populateOutcomes(course_index) {
	var outcomes = courses[course_index].outcomes;
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

		tab_HTML += '<li><a href="#outcome' + i + '"><span>' + name + '</span></a></li>';
	}

	// $('div#tabs ul').append(tab_HTML);
}

function populateStudents(course_index) {

}