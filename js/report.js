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

        var selected = $('.side_bar ul li.selected');
        populateReport(selected);
	});
});

//Gets the outcomes required for the semester
function populateOutcomesForSemester(semester) {
	$.ajax({
        type: "POST",
        url: "api/getSelectedOutcomes",
        data: {
            semester: semester,
        },
        success: function(output) {
            output = JSON.parse(output);

    		for(var k = 0; k < output.length; k++) {
    			$('#'+output[k]).addClass("selected");
    		}
            populateReport($('.side_bar ul li.selected'));
        }
    });
}

//Gets the list of outcomes
function populateOutcomes(callback) {
    $.ajax({
        type: "GET",
        url: "api/getOutcomes",
        success: function(output) {
            output = JSON.parse(output);
            output = output.Outcomes
            var course_HTML = "";
            for(var k = 0; k < output.length; k++) {
                course_HTML += "<li id='" + output[k].name.replace('/','') +"' title='" + output[k].description + "'>" + output[k].name + "</li>";
            }
            $("section#outcomes ul").append(course_HTML);
            callback();
        }

    });
}

//Gets the report based on the selected outcomes. 
function populateReport(outcomes) {
    $("#report").empty();
    var outcomeList = []
    for(var i = 0; i < outcomes.length; i++) {
        outcomeList[i] = outcomes[i].id;
    }
    $.ajax({
        type: "POST",
        url: "api/generateReport",
        data: JSON.stringify(outcomeList),
        success: function(output) {
            output = JSON.parse(output);
            for(var i = 0; i < output.length; i++){
                populateTable(output[i]);
            }
        }
    });
}

//Populates the table for each selected outcome.
function populateTable(outcome){
    var table_html = "<article class='outcome_report'><span class='outcome_title'>Outcome ";
    table_html += outcome.outcome + ": </span><span class='outcome_description'>";
    table_html += outcome.description + "</span><table class='report_table'>";
    table_html += "<tr><th>(%)</th><th>Unsatisfactory</th><th>Developing</th>";
    table_html += "<th>Satisfactory</th><th>Exemplary</th><th>% S+E</th></tr>";
    var results = outcome.results;
    for(var i = 0; i < results.length; i++){
        table_html += "<tr><th class='v_table_header'>"+ results[i].description +"</th>";
        if(results[i].percentages !== null){
            table_html += "<td>"+results[i].percentages[0]+"</td><td>"+results[i].percentages[1]+"</td><td>"+results[i].percentages[2]+"</td><td>"+results[i].percentages[3]+"</td><td>"+results[i].percentages[4]+"</td>";

        }
        else{
            table_html += "<td>--</td><td>--</td><td>--</td><td>--</td><td>--</td>";
        }
        table_html += "</tr>";
    }
    table_html += "</table></article>";
    $('#report').append(table_html);
}