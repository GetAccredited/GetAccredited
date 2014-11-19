var courses = [];
var user = "coyle";

$(document).on('ready', function() {
	getCourses(function() {
		getRubrics(function() {
			populateClasses(function() {
				populateForm();
			});
		});
	});

	$(document).on('click', '.side_bar ul li', function(event) {
		$('.side_bar ul li').removeClass('selected');
		$(this).addClass('selected');
	});
	$( "#tabs" ).tabs();
});

function getCourses(callback) {
	$.ajax({
        type: "GET",
        url: "json/RosterWithOutcomes.json",
        success: function(output) {
            output = output.RosterWithOutcomes;

            for(var i = 0; i < output.length; i++) {
            	if(output[i].instructor === user) {
            		courses.push(output[i]);
            	}
            }

            callback();
        }
    });
}

function getRubrics(callback) {
	$.ajax({
        type: "GET",
        url: "json/OutcomeDescriptionAndRubrics.json",
        success: function(output) {
            rubrics = output.OutcomeDescriptionAndRubrics;

            callback();
        }
    });
}

function populateClasses(callback) {
	var course_HTML = "";

	for(var i = 0; i < courses.length; i++) {
		if(i === 0) {
			course_HTML += "<li class='selected'>" + courses[i].course + "</li>";
		}
		else {
			course_HTML += "<li>" + courses[i].course + "</li>";
		}
	}

	$("section#courses ul").append(course_HTML);

	callback();
}

function populateForm() {
	
}