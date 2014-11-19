$(document).on('ready', function() {
	populateOutcomesForSemester(getSemester());

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
        type: "GET",
        url: "json/CycleOfOutcomes.json",
        success: function(output) {
            var CycleOfOutcomes = output.CycleOfOutcomes;

            for(var i = 0; i < CycleOfOutcomes.length; i++) {
            	if(CycleOfOutcomes[i].semester === semester) {
            		var CAC = CycleOfOutcomes[i].CACOutcomes;

            		for(var k = 0; k < CAC.length; k++) {
            			$('#CAC-' + CAC[k]).addClass("selected");
            		}

            		var EAC = CycleOfOutcomes[i].EACOutcomes;

            		for(var k = 0; k < EAC.length; k++) {
            			$('#EAC-' + EAC[k]).addClass("selected");
            		}
            	}
            }
        }
    });
}