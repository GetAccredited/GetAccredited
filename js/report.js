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
	  url: "json/CycleOfOutcomes.json"
	});
}