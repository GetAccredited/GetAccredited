$(document).on('ready', function() {

    populateOutcomes(function() {
        populateOutcomesForSemester(getSemester());
    });
	

	$(document).on('click', '.side_bar ul li', function(event) {
		if($(this).hasClass('selected')) {
			$(this).removeClass('selected');
		}
		else {
			$(this).addClass('selected');
		}
	});
});

function populateOutcomesForSemester(semester) {
	$.ajax({
        type: "POST",
        url: "api/getSelectedOutcomes",
        data: {
            //eventually replace with instructors name
            semester: semester,
        },
        success: function(output) {
            output = JSON.parse(output);
            
            var CAC = output.CACOutcomes;
    		for(var k = 0; k < CAC.length; k++) {
    			$('#CAC-' + CAC[k]).addClass("selected");
    		}

            var EAC = output.EACOutcomes;
    		for(var k = 0; k < EAC.length; k++) {
    			$('#EAC-' + EAC[k]).addClass("selected");
    		}
        }
    });
}

function populateOutcomes(callback) {
    $.ajax({
        type: "GET",
        url: "api/getOutcomes",
        success: function(output) {
            output = JSON.parse(output);
            output = output.Outcomes
            var course_HTML = "";
            for(var k = 0; k < output.length; k++) {
                course_HTML += "<li id='" + output[k].type + "-" + output[k].outcome +"' title='" + output[k].description + "'>" + output[k].type + "-" + output[k].outcome + "</li>"
            }
            $("section#outcomes ul").append(course_HTML);
            callback();
        }

    });


}