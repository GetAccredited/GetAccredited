$(document).ready(function() {
	$("#logout").click(function() {
		$.ajax({
			url: "api/logout",
			success: function() {
				window.location.href = "index.html";
			}
		});
	});
});

function getSemester() {
	var today = new Date();
	var month = today.getMonth();
	var year = today.getFullYear();

	var semester = "";

	if(month > 6) {
		semester = "Fall";
	}
	else {
		semester = "Spring";
	}

	semester += year;

	return semester;
}